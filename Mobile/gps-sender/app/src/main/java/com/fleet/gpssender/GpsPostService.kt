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
import java.util.concurrent.atomic.AtomicLong

class GpsPostService : Service() {

    private val fused by lazy { LocationServices.getFusedLocationProviderClient(this) }
    private val lastSentMs = AtomicLong(0L)
    private val mainHandler = Handler(Looper.getMainLooper())
    private val http by lazy {
        OkHttpClient.Builder()
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .writeTimeout(20, TimeUnit.SECONDS)
            .build()
    }

    @Volatile private var lastGeofenceStatus = GeofenceStatus.CLEAR
    @Volatile private var serverGeoEnabled: Boolean = false
    @Volatile private var serverZones: List<RestrictedZone> = emptyList()
    @Volatile private var geofenceFetchAttempted: Boolean = false
    @Volatile private var geofenceTripId: String? = null

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

            // Local geofence evaluation (demo zones + server zones)
            val demoZones = loadDemoZonesFromPrefs(prefs)
            val combined = if (serverGeoEnabled) serverZones + demoZones else demoZones
            val localEval = if (combined.isNotEmpty()) {
                GeoFence.evaluate(combined, loc.latitude, loc.longitude)
            } else {
                GeofenceEval(GeofenceStatus.CLEAR, null, null)
            }

            val url = "$base/tracking/$tripId/location"
            val json = JSONObject().apply {
                put("latitude", loc.latitude)
                put("longitude", loc.longitude)
                loc.speed.takeIf { !it.isNaN() && it >= 0 }?.let { put("speed", (it * 3.6f).toDouble()) }
                loc.bearing.takeIf { !it.isNaN() }?.let { put("heading", it.toDouble()) }
                if (loc.hasAltitude()) put("altitude", loc.altitude)
                if (loc.hasAccuracy()) put("accuracy", loc.accuracy.toDouble())
                put("metadata", JSONObject().apply { put("source", "android-gps-sender") })
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
                            // Server status takes precedence over local eval
                            val serverStatus = GeoFence.parseStatusFromResponse(text)
                            val serverZoneName = parseViolationZoneName(text)

                            // Use worst of server + local
                            val effectiveStatus = when {
                                serverStatus == GeofenceStatus.SHUTDOWN || localEval.status == GeofenceStatus.SHUTDOWN -> GeofenceStatus.SHUTDOWN
                                serverStatus == GeofenceStatus.WARNING || localEval.status == GeofenceStatus.WARNING -> GeofenceStatus.WARNING
                                else -> GeofenceStatus.CLEAR
                            }
                            val effectiveZone = serverZoneName ?: localEval.zoneName

                            handleGeofenceStatusChange(effectiveStatus, effectiveZone)

                            broadcastLog(
                                "OK ${loc.latitude.format6()},${loc.longitude.format6()}" +
                                    when (effectiveStatus) {
                                        GeofenceStatus.SHUTDOWN -> " [SHUTDOWN: $effectiveZone]"
                                        GeofenceStatus.WARNING -> " [WARNING: $effectiveZone]"
                                        GeofenceStatus.CLEAR -> ""
                                    }
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

    private fun handleGeofenceStatusChange(newStatus: GeofenceStatus, zoneName: String?) {
        val prev = lastGeofenceStatus
        lastGeofenceStatus = newStatus

        // Always update the persistent foreground notification
        mainHandler.post {
            startForeground(NOTIFY_GPS_ID, buildGpsNotification(newStatus, zoneName))
        }

        // Only fire alert notification on status change (avoid spam)
        if (newStatus == prev) return

        when (newStatus) {
            GeofenceStatus.WARNING -> {
                broadcastLog("⚠️ GEOFENCE WARNING — approaching ${zoneName ?: "restricted zone"}")
                broadcastGeofenceStatus(newStatus, zoneName)
                fireAlertNotification(
                    id = NOTIFY_WARN_ID,
                    channelId = CHANNEL_WARN,
                    title = getString(R.string.notify_geofence_warn_title),
                    text = getString(R.string.notify_geofence_warn_text, zoneName ?: "?"),
                )
            }
            GeofenceStatus.SHUTDOWN -> {
                broadcastLog("🚨 GEOFENCE VIOLATION — engine shutdown — ${zoneName ?: "restricted zone"}")
                broadcastGeofenceStatus(newStatus, zoneName)
                fireAlertNotification(
                    id = NOTIFY_SHUTDOWN_ID,
                    channelId = CHANNEL_ALERT,
                    title = getString(R.string.notify_engine_off_title),
                    text = getString(R.string.notify_engine_off_text, zoneName ?: "?"),
                )
            }
            GeofenceStatus.CLEAR -> {
                if (prev != GeofenceStatus.CLEAR) {
                    broadcastLog("✅ Geofence clear — outside all restricted zones")
                    broadcastGeofenceStatus(newStatus, null)
                    // Cancel alert notifications when clear
                    val mgr = getSystemService(NOTIFICATION_SERVICE) as android.app.NotificationManager
                    mgr.cancel(NOTIFY_WARN_ID)
                    mgr.cancel(NOTIFY_SHUTDOWN_ID)
                }
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createChannels()
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
            lastGeofenceStatus = GeofenceStatus.CLEAR
        }

        startForeground(NOTIFY_GPS_ID, buildGpsNotification(GeofenceStatus.CLEAR, null))
        requestGeofenceConfigIfNeeded()

        val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5_000L)
            .setMinUpdateIntervalMillis(4_000L)
            .setMaxUpdateDelayMillis(15_000L)
            .build()
        try {
            fused.removeLocationUpdates(callback)
            fused.requestLocationUpdates(request, callback, Looper.getMainLooper())
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
                        broadcastLog("Geofence: server ${if (en) "on" else "off"}, ${zones.size} zone(s)")
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
        val lat = prefs.getString(MainActivity.KEY_DEMO_LAT, "")?.trim()?.toDoubleOrNull() ?: return emptyList()
        val lng = prefs.getString(MainActivity.KEY_DEMO_LNG, "")?.trim()?.toDoubleOrNull() ?: return emptyList()
        val rad = prefs.getString(MainActivity.KEY_DEMO_RADIUS_M, "")?.trim()?.toDoubleOrNull() ?: return emptyList()
        if (!lat.isFinite() || !lng.isFinite() || !rad.isFinite() || rad <= 0) return emptyList()
        return listOf(RestrictedZone("Demo zone", lat, lng, rad))
    }

    private fun parseViolationZoneName(text: String): String? {
        return try {
            val o = JSONObject(text)
            if (!o.has("violationZoneName") || o.isNull("violationZoneName")) null
            else o.optString("violationZoneName", "").trim().takeIf { it.isNotEmpty() }
        } catch (_: Exception) { null }
    }

    private fun buildGpsNotification(status: GeofenceStatus, zone: String?): Notification {
        val open = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val (title, text) = when (status) {
            GeofenceStatus.SHUTDOWN -> getString(R.string.notify_engine_off_title) to
                getString(R.string.notify_engine_off_text, zone ?: "?")
            GeofenceStatus.WARNING -> getString(R.string.notify_geofence_warn_title) to
                getString(R.string.notify_geofence_warn_text, zone ?: "?")
            GeofenceStatus.CLEAR -> getString(R.string.notify_title) to getString(R.string.notify_text)
        }
        return NotificationCompat.Builder(this, CHANNEL_GPS)
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_pin)
            .setContentIntent(open)
            .setOngoing(true)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .build()
    }

    private fun fireAlertNotification(id: Int, channelId: String, title: String, text: String) {
        val open = PendingIntent.getActivity(
            this, id, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val n = NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_pin)
            .setContentIntent(open)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .build()
        val mgr = getSystemService(NOTIFICATION_SERVICE) as android.app.NotificationManager
        mgr.notify(id, n)
    }

    private fun createChannels() {
        val mgr = getSystemService(NOTIFICATION_SERVICE) as android.app.NotificationManager
        // Low-importance persistent GPS channel
        mgr.createNotificationChannel(
            NotificationChannel(CHANNEL_GPS, getString(R.string.notify_channel), NotificationManager.IMPORTANCE_LOW)
        )
        // High-importance warning channel (heads-up)
        mgr.createNotificationChannel(
            NotificationChannel(CHANNEL_WARN, getString(R.string.notify_warn_channel), NotificationManager.IMPORTANCE_HIGH).apply {
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 300, 200, 300)
            }
        )
        // Max-importance shutdown channel (heads-up + sound)
        mgr.createNotificationChannel(
            NotificationChannel(CHANNEL_ALERT, getString(R.string.notify_alert_channel), NotificationManager.IMPORTANCE_HIGH).apply {
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 200, 500, 200, 500)
            }
        )
    }

    private fun broadcastLog(msg: String) {
        sendBroadcast(Intent(ACTION_LOG).setPackage(packageName).putExtra(EXTRA_LOG, msg))
    }

    private fun broadcastGeofenceStatus(status: GeofenceStatus, zoneName: String?) {
        sendBroadcast(
            Intent(ACTION_GEOFENCE_STATUS)
                .setPackage(packageName)
                .putExtra(EXTRA_GEOFENCE_STATUS, status.name)
                .putExtra(EXTRA_GEOFENCE_ZONE, zoneName)
        )
    }

    private fun Double.format6(): String = String.format("%.6f", this)

    companion object {
        private const val TAG = "GpsPostService"
        const val ACTION_LOG = "com.fleet.gpssender.LOG"
        const val ACTION_GEOFENCE_STATUS = "com.fleet.gpssender.GEOFENCE_STATUS"
        const val EXTRA_LOG = "msg"
        const val EXTRA_GEOFENCE_STATUS = "geofence_status"
        const val EXTRA_GEOFENCE_ZONE = "geofence_zone"
        private const val CHANNEL_GPS = "gps_upload"
        private const val CHANNEL_WARN = "geofence_warning"
        private const val CHANNEL_ALERT = "geofence_alert"
        private const val NOTIFY_GPS_ID = 7101
        private const val NOTIFY_WARN_ID = 7103
        private const val NOTIFY_SHUTDOWN_ID = 7104
        private const val MIN_INTERVAL_MS = 4_000L
        private val JSON = "application/json; charset=utf-8".toMediaType()
    }
}
