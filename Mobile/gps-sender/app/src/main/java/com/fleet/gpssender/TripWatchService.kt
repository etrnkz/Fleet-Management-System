package com.fleet.gpssender

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Polls GET /trips for the driver's IN_PROGRESS trip. When the gate starts the trip,
 * writes trip id to prefs and starts [GpsPostService]. When the trip ends, stops GPS.
 */
class TripWatchService : Service() {

    private val mainHandler = Handler(Looper.getMainLooper())
    private val http by lazy {
        OkHttpClient.Builder()
            .connectTimeout(25, TimeUnit.SECONDS)
            .readTimeout(25, TimeUnit.SECONDS)
            .writeTimeout(25, TimeUnit.SECONDS)
            .build()
    }

    private val running = AtomicBoolean(false)
    private var pollThread: Thread? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (running.getAndSet(true)) {
            return START_STICKY
        }
        startForeground(NOTIFY_ID, buildNotification(null, null))
        pollThread = Thread({ pollLoop() }, "TripWatchPoll").apply { start() }
        return START_STICKY
    }

    override fun onDestroy() {
        running.set(false)
        pollThread?.interrupt()
        pollThread = null
        stopService(Intent(this, GpsPostService::class.java))
        broadcastLog("Trip watch stopped")
        super.onDestroy()
    }

    private fun pollLoop() {
        broadcastLog("Watching for IN_PROGRESS trip (driver account)…")
        while (running.get()) {
            try {
                pollOnce()
            } catch (e: InterruptedException) {
                Thread.currentThread().interrupt()
                break
            } catch (e: Exception) {
                Log.w(TAG, "poll", e)
                broadcastLog("Poll error: ${e.message}")
            }
            try {
                Thread.sleep(POLL_INTERVAL_MS)
            } catch (e: InterruptedException) {
                Thread.currentThread().interrupt()
                break
            }
        }
    }

    private fun pollOnce() {
        val prefs = getSharedPreferences(MainActivity.PREFS, MODE_PRIVATE)
        val base = prefs.getString(MainActivity.KEY_API, null)?.trim()?.trimEnd('/') ?: return
        val token = prefs.getString(MainActivity.KEY_TOKEN, null)?.trim() ?: return
        val userId = prefs.getString(MainActivity.KEY_USER_ID, null)?.trim() ?: return

        val url = "$base/trips"
        val req = Request.Builder()
            .url(url)
            .addHeader("Authorization", "Bearer $token")
            .get()
            .build()

        http.newCall(req).execute().use { resp ->
            val text = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) {
                broadcastLog("Trips list ${resp.code}: ${text.take(120)}")
                return
            }

            val arr = try {
                JSONArray(text)
            } catch (_: Exception) {
                broadcastLog("Trips response not a JSON array")
                return
            }

            var foundId: String? = null
            var foundLabel: String? = null
            for (i in 0 until arr.length()) {
                val trip = arr.optJSONObject(i) ?: continue
                if (trip.optString("state", "") != "IN_PROGRESS") continue
                val driver = trip.optJSONObject("allocatedDriver") ?: continue
                val user = driver.optJSONObject("user")
                val driverUserId = when {
                    user != null -> user.optString("id", "")
                    else -> driver.optString("userId", "")
                }
                if (driverUserId.isEmpty() || driverUserId != userId) continue
                val id = trip.optString("id", "")
                if (id.isNotEmpty()) {
                    foundId = id
                    foundLabel = trip.optString("requestNumber", "").takeIf { it.isNotEmpty() } ?: id.take(8)
                    break
                }
            }

            applyActiveTrip(foundId, foundLabel)
        }
    }

    private fun applyActiveTrip(tripId: String?, label: String?) {
        val prefs = getSharedPreferences(MainActivity.PREFS, MODE_PRIVATE)
        val prev = prefs.getString(MainActivity.KEY_TRIP, null)?.trim().orEmpty()
        val newId = tripId?.trim().orEmpty()

        if (newId.isEmpty()) {
            if (prev.isEmpty()) return
            prefs.edit().remove(MainActivity.KEY_TRIP).apply()
            stopService(Intent(this, GpsPostService::class.java))
            broadcastLog("No active trip — GPS upload stopped")
            mainHandler.post {
                startForeground(NOTIFY_ID, buildNotification(null, null))
            }
            return
        }

        if (newId == prev) return

        prefs.edit().putString(MainActivity.KEY_TRIP, newId).apply()
        broadcastLog("Trip started (${label ?: newId}) — GPS upload on")
        startGpsPostService()
        mainHandler.post {
            startForeground(NOTIFY_ID, buildNotification(label, newId))
        }
    }

    private fun startGpsPostService() {
        val i = Intent(this, GpsPostService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(i)
        } else {
            @Suppress("DEPRECATION")
            startService(i)
        }
    }

    private fun buildNotification(requestLabel: String?, tripId: String?): Notification {
        val open = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val title = getString(R.string.notify_watch_title)
        val text = when {
            requestLabel != null -> getString(R.string.notify_watch_active, requestLabel)
            tripId != null -> getString(R.string.notify_watch_active, tripId)
            else -> getString(R.string.notify_watch_idle)
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
            getString(R.string.notify_watch_channel),
            NotificationManager.IMPORTANCE_LOW,
        )
        mgr.createNotificationChannel(ch)
    }

    private fun broadcastLog(msg: String) {
        sendBroadcast(
            Intent(GpsPostService.ACTION_LOG)
                .setPackage(packageName)
                .putExtra(GpsPostService.EXTRA_LOG, msg),
        )
    }

    companion object {
        private const val TAG = "TripWatchService"
        private const val CHANNEL_ID = "trip_watch"
        private const val NOTIFY_ID = 7102
        private const val POLL_INTERVAL_MS = 18_000L
    }
}
