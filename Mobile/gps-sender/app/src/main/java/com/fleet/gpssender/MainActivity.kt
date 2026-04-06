package com.fleet.gpssender

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fleet.gpssender.databinding.ActivityMainBinding
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val logLines = ArrayDeque<String>(MAX_LOG_LINES)

    private val http by lazy {
        OkHttpClient.Builder()
            .connectTimeout(25, TimeUnit.SECONDS)
            .readTimeout(25, TimeUnit.SECONDS)
            .writeTimeout(25, TimeUnit.SECONDS)
            .build()
    }

    private val logReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                GpsPostService.ACTION_LOG -> {
                    val msg = intent.getStringExtra(GpsPostService.EXTRA_LOG) ?: return
                    appendLog(msg)
                }
                GpsPostService.ACTION_GEOFENCE_STATUS -> {
                    val statusName = intent.getStringExtra(GpsPostService.EXTRA_GEOFENCE_STATUS) ?: return
                    val zone = intent.getStringExtra(GpsPostService.EXTRA_GEOFENCE_ZONE)
                    val status = runCatching { GeofenceStatus.valueOf(statusName) }.getOrDefault(GeofenceStatus.CLEAR)
                    updateGeofenceBanner(status, zone)
                }
            }
        }
    }

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions(),
    ) { granted ->
        if (granted.values.all { it }) {
            startTripWatchService()
        } else {
            Toast.makeText(this, "Location and notification permission are required", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val prefs = getSharedPreferences(PREFS, MODE_PRIVATE)
        binding.inputApiBase.setText(
            prefs.getString(KEY_API, DEFAULT_API_BASE) ?: DEFAULT_API_BASE,
        )
        binding.inputEmail.setText(prefs.getString(KEY_EMAIL, "") ?: "")
        binding.inputDemoLat.setText(prefs.getString(KEY_DEMO_LAT, "") ?: "")
        binding.inputDemoLng.setText(prefs.getString(KEY_DEMO_LNG, "") ?: "")
        binding.inputDemoRadius.setText(prefs.getString(KEY_DEMO_RADIUS_M, "") ?: "")

        binding.btnLogin.setOnClickListener { performLogin() }
        binding.btnLogout.setOnClickListener { performLogout() }
        binding.btnStartMonitoring.setOnClickListener {
            if (!validateMonitoring()) return@setOnClickListener
            saveDemoPrefs()
            requestPermissionsAndStartWatch()
        }
        binding.btnStopMonitoring.setOnClickListener {
            stopService(Intent(this, TripWatchService::class.java))
            stopService(Intent(this, GpsPostService::class.java))
            appendLog("Stopped trip watch and GPS")
        }

        refreshAuthUi()
        appendLog("Sign in, then Start monitoring. GPS runs when your trip is IN_PROGRESS.")
    }

    override fun onResume() {
        super.onResume()
        refreshAuthUi()
        val filter = IntentFilter().apply {
            addAction(GpsPostService.ACTION_LOG)
            addAction(GpsPostService.ACTION_GEOFENCE_STATUS)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(logReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            @Suppress("DEPRECATION")
            registerReceiver(logReceiver, filter)
        }
    }

    override fun onPause() {
        super.onPause()
        unregisterReceiver(logReceiver)
    }

    private fun refreshAuthUi() {
        val prefs = getSharedPreferences(PREFS, MODE_PRIVATE)
        val token = prefs.getString(KEY_TOKEN, null)
        val name = prefs.getString(KEY_USER_NAME, null)
        if (token.isNullOrEmpty()) {
            binding.textAuthStatus.text = "Not signed in"
            binding.btnLogout.isEnabled = false
        } else {
            binding.textAuthStatus.text = "Signed in${name?.let { " as $it" } ?: ""}"
            binding.btnLogout.isEnabled = true
        }
    }

    private fun validateMonitoring(): Boolean {
        val prefs = getSharedPreferences(PREFS, MODE_PRIVATE)
        val base = binding.inputApiBase.text?.toString()?.trim().orEmpty()
        if (base.isEmpty()) {
            Toast.makeText(this, "Enter API base", Toast.LENGTH_SHORT).show()
            return false
        }
        if (prefs.getString(KEY_TOKEN, null).isNullOrBlank() ||
            prefs.getString(KEY_USER_ID, null).isNullOrBlank()
        ) {
            Toast.makeText(this, "Sign in first", Toast.LENGTH_SHORT).show()
            return false
        }
        return true
    }

    private fun saveApiPrefs() {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit()
            .putString(KEY_API, binding.inputApiBase.text?.toString()?.trim())
            .apply()
    }

    private fun saveDemoPrefs() {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit()
            .putString(KEY_API, binding.inputApiBase.text?.toString()?.trim())
            .putString(KEY_DEMO_LAT, binding.inputDemoLat.text?.toString()?.trim())
            .putString(KEY_DEMO_LNG, binding.inputDemoLng.text?.toString()?.trim())
            .putString(KEY_DEMO_RADIUS_M, binding.inputDemoRadius.text?.toString()?.trim())
            .apply()
    }

    private fun performLogin() {
        val base = binding.inputApiBase.text?.toString()?.trim()?.trimEnd('/').orEmpty()
        val email = binding.inputEmail.text?.toString()?.trim().orEmpty()
        val password = binding.inputPassword.text?.toString().orEmpty()
        if (base.isEmpty()) {
            Toast.makeText(this, "Enter API base", Toast.LENGTH_SHORT).show()
            return
        }
        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Enter email and password", Toast.LENGTH_SHORT).show()
            return
        }

        binding.btnLogin.isEnabled = false
        val url = "$base/auth/login"
        val body = JSONObject().put("email", email).put("password", password).toString()
            .toRequestBody(JSON)

        Thread {
            try {
                val req = Request.Builder()
                    .url(url)
                    .addHeader("Content-Type", "application/json")
                    .post(body)
                    .build()
                http.newCall(req).execute().use { resp ->
                    val text = resp.body?.string().orEmpty()
                    runOnUiThread {
                        binding.btnLogin.isEnabled = true
                        if (resp.isSuccessful) {
                            val json = runCatching { JSONObject(text) }.getOrNull()
                            val access = json?.optString("access_token", "")?.takeIf { it.isNotEmpty() }
                            if (access == null) {
                                appendLog("Login: missing access_token in response")
                                Toast.makeText(this, "Bad login response", Toast.LENGTH_SHORT).show()
                                return@runOnUiThread
                            }
                            val user = json.optJSONObject("user")
                            val userId = user?.optString("id", "")?.takeIf { it.isNotEmpty() }
                            if (userId == null) {
                                appendLog("Login: missing user id")
                                Toast.makeText(this, "Bad login response (no user id)", Toast.LENGTH_SHORT).show()
                                return@runOnUiThread
                            }
                            val displayName = user.optString("name", "").takeIf { it.isNotEmpty() }
                            getSharedPreferences(PREFS, MODE_PRIVATE).edit()
                                .putString(KEY_API, binding.inputApiBase.text?.toString()?.trim())
                                .putString(KEY_EMAIL, email)
                                .putString(KEY_TOKEN, access)
                                .putString(KEY_USER_ID, userId)
                                .putString(KEY_USER_NAME, displayName)
                                .remove(KEY_TRIP)
                                .apply()
                            binding.inputPassword.text?.clear()
                            refreshAuthUi()
                            Toast.makeText(this, "Signed in", Toast.LENGTH_SHORT).show()
                            appendLog("Signed in — tap Start monitoring when ready")
                        } else {
                            val err = runCatching { JSONObject(text).optString("message") }.getOrNull()
                            appendLog("Login failed ${resp.code}: ${err ?: text.take(200)}")
                            Toast.makeText(this, err ?: "Login failed", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    binding.btnLogin.isEnabled = true
                    appendLog("Login error: ${e.message}")
                    Toast.makeText(this, e.message ?: "Network error", Toast.LENGTH_SHORT).show()
                }
            }
        }.start()
    }

    private fun performLogout() {
        stopService(Intent(this, TripWatchService::class.java))
        stopService(Intent(this, GpsPostService::class.java))
        getSharedPreferences(PREFS, MODE_PRIVATE).edit()
            .remove(KEY_TOKEN)
            .remove(KEY_USER_ID)
            .remove(KEY_USER_NAME)
            .remove(KEY_TRIP)
            .apply()
        refreshAuthUi()
        appendLog("Signed out")
        Toast.makeText(this, "Signed out", Toast.LENGTH_SHORT).show()
    }

    private fun requestPermissionsAndStartWatch() {
        saveApiPrefs()
        val need = mutableListOf<String>()
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED
        ) {
            need.add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                need.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
        if (need.isEmpty()) {
            startTripWatchService()
        } else {
            permissionLauncher.launch(need.toTypedArray())
        }
    }

    private fun startTripWatchService() {
        saveDemoPrefs()
        val i = Intent(this, TripWatchService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(i)
        } else {
            @Suppress("DEPRECATION")
            startService(i)
        }
        appendLog("Trip watch started — waiting for IN_PROGRESS trip…")
    }

    private fun appendLog(line: String) {
        while (logLines.size >= MAX_LOG_LINES) logLines.removeFirst()
        logLines.addLast(line)
        binding.textLog.text = logLines.joinToString("\n")
    }

    private fun updateGeofenceBanner(status: GeofenceStatus, zone: String?) {
        val banner = binding.geofenceBanner
        val bannerText = binding.geofenceBannerText
        when (status) {
            GeofenceStatus.CLEAR -> {
                banner.visibility = android.view.View.GONE
            }
            GeofenceStatus.WARNING -> {
                banner.visibility = android.view.View.VISIBLE
                banner.setBackgroundColor(android.graphics.Color.parseColor("#FFF59D")) // yellow
                bannerText.setTextColor(android.graphics.Color.parseColor("#7B5800"))
                bannerText.text = "⚠️  WARNING — Approaching restricted zone: ${zone ?: "?"}\nEngine shutdown will trigger if you enter."
            }
            GeofenceStatus.SHUTDOWN -> {
                banner.visibility = android.view.View.VISIBLE
                banner.setBackgroundColor(android.graphics.Color.parseColor("#FFCDD2")) // red
                bannerText.setTextColor(android.graphics.Color.parseColor("#B71C1C"))
                bannerText.text = "🚨  ENGINE SHUTDOWN — Inside restricted zone: ${zone ?: "?"}\nYou must leave this area immediately."
            }
        }
    }

    companion object {
        const val PREFS = "fleet_gps_sender"
        const val KEY_API = "api_base"
        const val KEY_TRIP = "trip_id"
        const val KEY_TOKEN = "jwt"
        const val KEY_EMAIL = "email"
        const val KEY_USER_ID = "user_id"
        const val KEY_USER_NAME = "user_name"
        const val KEY_DEMO_LAT = "demo_lat"
        const val KEY_DEMO_LNG = "demo_lng"
        const val KEY_DEMO_RADIUS_M = "demo_radius_m"
        const val DEFAULT_API_BASE =
            "https://exact-journals-interfaces-sure.trycloudflare.com/api/v1"
        private const val MAX_LOG_LINES = 80
        private val JSON = "application/json; charset=utf-8".toMediaType()
    }
}
