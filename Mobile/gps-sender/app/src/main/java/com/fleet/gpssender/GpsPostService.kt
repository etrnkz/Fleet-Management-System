package com.fleet.gpssender

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicLong

class GpsPostService : Service() {

    private val fused by lazy { LocationServices.getFusedLocationProviderClient(this) }
    private val lastSentMs = AtomicLong(0L)
    private val lastEngineSimOff = AtomicBoolean(false)
    private val mainHandler = Handler(Looper.getMainLooper())
    private val http by lazy {
        OkHttpClient.Builder()
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .writeTimeout(20, TimeUnit.SECONDS)
            .build()
    }

    @Volatile
    private var serverGeoEnabled: Boolean = false

    @Volatile
    private var serverZones: List<RestrictedZone> = emptyList()

    @Volatile
    private var geofenceFetchAttempted: Boolean = false

    /** When prefs trip id changes, refetch geofence config */
    @Volatile
    private var geofenceTripId: String? = null

    private val callback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            val loc = result.lastLocation ?: return
            val now = System.currentTimeMillis()
            if (now - lastSentMs.get() < MIN_INTERVAL_MS) return
            lastSentMs.set(now)

            val prefs = getSharedPreferences(MainActivity.PREFS, MODE_PRIVATE)
            val base = prefs.getString(MainActivity.KEY_API, null)?.trim()?.trimEnd('/') ?: return
            val tripId = prefs.getString(MainActivity.KEY_TRIP, null)?.trim() ?: return
            val token = prefs.getString(MainActivity.KEY_TOKEN, null)?.trim() ?: return

            val demoZones = loadDemoZonesFromPrefs(prefs)
            val combined = if (serverGeoEnabled) serverZones + demoZones else demoZones

            val (localOff, localZone) = if (combined.isEmpty()) {
                false to null
            } else {
                GeoFence.violationInAnyZone(combined, loc.latitude, loc.longitude)
            }

            val url = "$base/tracking/$tripId/location"
            val json = JSONObject().apply {
                put("latitude", loc.latitude)
                put("longitude", loc.longitude)
                loc.speed.takeIf { !it.isNaN() && it >= 0 }?.let {
                    put("speed", (it * 3.6f).toDouble())
                }
                loc.bearing.takeIf { !it.isNaN() }?.let { put("heading", it.toDouble()) }
                if (loc.hasAltitude()) put("altitude", loc.altitude)
                if (loc.hasAccuracy()) put("accuracy", loc.accuracy.toDouble())
                put(
                    "metadata",
                    JSONObject().apply { put("source", "android-gps-sender") },
                )
            }

            Thread {
                try {
                    val body = json.toString().toRequestBody(JSON)
                    val req = Request.Builder()
                        .url(url)
                        .addHeader("Authorization", "Bearer $token")
                        .post(body)
                        .build()
                    http.newCall(req).execute().use { resp ->
                        val text = resp.body?.string().orEmpty()
                        if (resp.isSuccessful) {
                            val serverOff = parseEngineOffFromResponse(text)
                            val serverZone = parseViolationZoneName(text)
                            val effectiveOff = localOff || serverOff
                            val displayZone = when {
                                serverOff && !serverZone.isNullOrBlank() -> serverZone
                                localOff -> localZone
                                else -> null
                            }
                            if (effectiveOff != lastEngineSimOff.getAndSet(effectiveOff)) {
                                if (effectiveOff) {
                                    broadcastLog("SIM ENGINE OFF — ${displayZone ?: "?"}")
                                } else {
                                    broadcastLog("SIM ENGINE OK (outside restricted zones)")
                                }
                            }
                            mainHandler.post {
                                startForeground(
                                    NOTIFY_ID,
                                    buildNotification(effectiveOff, displayZone),
                                )
                            }
                            broadcastLog(
                                "OK ${loc.latitude.format6()},${loc.longitude.format6()}" +
                                    if (effectiveOff) " [restricted]" else "",
                            )
                        } else {
                            broadcastLog("FAIL ${resp.code}: ${text.take(200)}")
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "post", e)
                    broadcastLog("ERR ${e.message}")
                }
            }.start()
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val prefs = getSharedPreferences(MainActivity.PREFS, MODE_PRIVATE)
        val tripIdNow = prefs.getString(MainActivity.KEY_TRIP, null)?.trim().orEmpty()
        if (tripIdNow.isEmpty()) {
            broadcastLog("No trip id in prefs — stop GPS service")
            stopSelf()
            return START_NOT_STICKY
        }
        if (tripIdNow != geofenceTripId) {
            geofenceTripId = tripIdNow
            geofenceFetchAttempted = false
            serverGeoEnabled = false
            serverZones = emptyList()
        }

        startForeground(NOTIFY_ID, buildNotification(false, null))
        requestGeofenceConfigIfNeeded()
        val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5_000L)
            .setMinUpdateIntervalMillis(4_000L)
            .setMaxUpdateDelayMillis(15_000L)
            .build()
        try {
            fused.removeLocationUpdates(callback)
            fused.requestLocationUpdates(
                request,
                callback,
                Looper.getMainLooper(),
            )
            broadcastLog("GPS updates requested")
        } catch (e: SecurityException) {
            broadcastLog("No location permission: ${e.message}")
            stopSelf()
        }
        return START_STICKY
    }

    override fun onDestroy() {
        fused.removeLocationUpdates(callback)
        super.onDestroy()
    }

    private fun requestGeofenceConfigIfNeeded() {
        if (geofenceFetchAttempted) return
        geofenceFetchAttempted = true
        val prefs = getSharedPreferences(MainActivity.PREFS, MODE_PRIVATE)
        val base = prefs.getString(MainActivity.KEY_API, null)?.trim()?.trimEnd('/') ?: return
        val tripId = prefs.getString(MainActivity.KEY_TRIP, null)?.trim() ?: return
        val token = prefs.getString(MainActivity.KEY_TOKEN, null)?.trim() ?: return
        val url = "$base/tracking/$tripId/geofence-config"
        Thread {
            try {
                val req = Request.Builder()
                    .url(url)
                    .addHeader("Authorization", "Bearer $token")
                    .get()
                    .build()
                http.newCall(req).execute().use { resp ->
                    val text = resp.body?.string().orEmpty()
                    if (resp.isSuccessful) {
                        val (en, zones) = GeoFence.parseZonesFromConfigJson(text)
                        serverGeoEnabled = en
                        serverZones = zones
                        broadcastLog(
                            "Geofence: server ${if (en) "on" else "off"}, ${zones.size} zone(s)",
                        )
                    } else {
                        broadcastLog("Geofence config ${resp.code}: ${text.take(120)}")
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "geofence fetch", e)
                broadcastLog("Geofence fetch: ${e.message}")
            }
        }.start()
    }

    private fun loadDemoZonesFromPrefs(prefs: android.content.SharedPreferences): List<RestrictedZone> {
        val latStr = prefs.getString(MainActivity.KEY_DEMO_LAT, "")?.trim().orEmpty()
        val lngStr = prefs.getString(MainActivity.KEY_DEMO_LNG, "")?.trim().orEmpty()
        val radStr = prefs.getString(MainActivity.KEY_DEMO_RADIUS_M, "")?.trim().orEmpty()
        if (latStr.isEmpty() || lngStr.isEmpty() || radStr.isEmpty()) return emptyList()
        val lat = latStr.toDoubleOrNull() ?: return emptyList()
        val lng = lngStr.toDoubleOrNull() ?: return emptyList()
        val rad = radStr.toDoubleOrNull() ?: return emptyList()
        if (!lat.isFinite() || !lng.isFinite() || !rad.isFinite() || rad <= 0) return emptyList()
        return listOf(RestrictedZone("Demo zone", lat, lng, rad))
    }

    private fun parseEngineOffFromResponse(text: String): Boolean {
        return try {
            JSONObject(text).optBoolean("engineSimulatedOff", false)
        } catch (_: Exception) {
            false
        }
    }

    private fun parseViolationZoneName(text: String): String? {
        return try {
            val o = JSONObject(text)
            if (!o.has("violationZoneName") || o.isNull("violationZoneName")) null
            else o.optString("violationZoneName", "").trim().takeIf { it.isNotEmpty() }
        } catch (_: Exception) {
            null
        }
    }

    private fun buildNotification(engineOff: Boolean, zone: String?): Notification {
        val open = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val title = if (engineOff) {
            getString(R.string.notify_engine_off_title)
        } else {
            getString(R.string.notify_title)
        }
        val text = if (engineOff) {
            getString(R.string.notify_engine_off_text, zone ?: "?")
        } else {
            getString(R.string.notify_text)
        }
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_pin)
            .setContentIntent(open)
            .setOngoing(true)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .build()
    }

    private fun createChannel() {
        val mgr = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        val ch = NotificationChannel(
            CHANNEL_ID,
            getString(R.string.notify_channel),
            NotificationManager.IMPORTANCE_LOW,
        )
        mgr.createNotificationChannel(ch)
    }

    private fun broadcastLog(msg: String) {
        sendBroadcast(
            Intent(ACTION_LOG)
                .setPackage(packageName)
                .putExtra(EXTRA_LOG, msg),
        )
    }

    private fun Double.format6(): String = String.format("%.6f", this)

    companion object {
        private const val TAG = "GpsPostService"
        const val ACTION_LOG = "com.fleet.gpssender.LOG"
        const val EXTRA_LOG = "msg"
        private const val CHANNEL_ID = "gps_upload"
        private const val NOTIFY_ID = 7101
        private const val MIN_INTERVAL_MS = 4_000L
        private val JSON = "application/json; charset=utf-8".toMediaType()
    }
}
