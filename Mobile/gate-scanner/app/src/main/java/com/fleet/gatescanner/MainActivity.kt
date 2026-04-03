package com.fleet.gatescanner

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.fleet.gatescanner.databinding.ActivityMainBinding
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    private val http by lazy {
        OkHttpClient.Builder()
            .connectTimeout(25, TimeUnit.SECONDS)
            .readTimeout(25, TimeUnit.SECONDS)
            .writeTimeout(25, TimeUnit.SECONDS)
            .build()
    }

    private val cameraPermission = registerForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { granted ->
        if (granted) launchScanner() else {
            Toast.makeText(this, "Camera permission is required to scan", Toast.LENGTH_LONG).show()
        }
    }

    private val scanLauncher = registerForActivityResult(ScanContract()) { result ->
        if (result.contents == null) {
            binding.textResult.text = "Scan cancelled"
            return@registerForActivityResult
        }
        postGateStart(result.contents)
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

        binding.btnLogin.setOnClickListener { performLogin() }
        binding.btnLogout.setOnClickListener { performLogout() }

        binding.btnScan.setOnClickListener {
            if (!validateScanInputs()) return@setOnClickListener
            savePrefs()
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                != PackageManager.PERMISSION_GRANTED
            ) {
                cameraPermission.launch(Manifest.permission.CAMERA)
            } else {
                launchScanner()
            }
        }

        refreshAuthUi()
        binding.textResult.text = "—"
    }

    private fun apiBaseTrimmed(): String =
        binding.inputApiBase.text?.toString()?.trim()?.trimEnd('/') ?: ""

    private fun savePrefs() {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit()
            .putString(KEY_API, binding.inputApiBase.text?.toString()?.trim())
            .apply()
    }

    private fun refreshAuthUi() {
        val prefs = getSharedPreferences(PREFS, MODE_PRIVATE)
        val token = prefs.getString(KEY_TOKEN, null)
        val name = prefs.getString(KEY_USER_NAME, null)
        val role = prefs.getString(KEY_USER_ROLE, null)
        if (token.isNullOrEmpty()) {
            binding.textAuthStatus.text = getString(R.string.auth_status_signed_out)
            binding.btnLogout.isEnabled = false
        } else {
            binding.textAuthStatus.text = getString(
                R.string.auth_status_signed_in,
                name ?: "—",
                role ?: "—",
            )
            binding.btnLogout.isEnabled = true
        }
    }

    private fun performLogin() {
        val base = apiBaseTrimmed()
        val email = binding.inputEmail.text?.toString()?.trim().orEmpty()
        val password = binding.inputPassword.text?.toString().orEmpty()
        if (base.isEmpty()) {
            Toast.makeText(this, R.string.toast_need_api_base, Toast.LENGTH_SHORT).show()
            return
        }
        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, R.string.toast_need_credentials, Toast.LENGTH_SHORT).show()
            return
        }

        binding.btnLogin.isEnabled = false
        val url = "$base/auth/login"
        val bodyJson = JSONObject()
            .put("email", email)
            .put("password", password)
            .toString()
        val body = bodyJson.toRequestBody(JSON)

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
                                binding.textAuthStatus.text = getString(R.string.auth_login_bad_response)
                                return@runOnUiThread
                            }
                            val user = json.optJSONObject("user")
                            val name = user?.optString("name", "")?.takeIf { it.isNotEmpty() }
                            val role = user?.optString("role", "")?.takeIf { it.isNotEmpty() }
                            getSharedPreferences(PREFS, MODE_PRIVATE).edit()
                                .putString(KEY_TOKEN, access)
                                .putString(KEY_EMAIL, email)
                                .putString(KEY_USER_NAME, name)
                                .putString(KEY_USER_ROLE, role)
                                .apply()
                            savePrefs()
                            binding.inputPassword.text?.clear()
                            refreshAuthUi()
                            Toast.makeText(this, R.string.auth_login_ok, Toast.LENGTH_SHORT).show()
                            if (role != null && role != "Gate" && role != "TransportOffice" && role != "Developer") {
                                Toast.makeText(
                                    this,
                                    R.string.auth_warn_wrong_role,
                                    Toast.LENGTH_LONG,
                                ).show()
                            }
                        } else {
                            binding.textAuthStatus.text = apiErrorMessage(text, resp.code)
                        }
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    binding.btnLogin.isEnabled = true
                    binding.textAuthStatus.text = getString(R.string.auth_network_error, e.message ?: "")
                }
            }
        }.start()
    }

    private fun performLogout() {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit()
            .remove(KEY_TOKEN)
            .remove(KEY_USER_NAME)
            .remove(KEY_USER_ROLE)
            .apply()
        refreshAuthUi()
        Toast.makeText(this, R.string.auth_signed_out, Toast.LENGTH_SHORT).show()
    }

    private fun validateScanInputs(): Boolean {
        val base = binding.inputApiBase.text?.toString()?.trim().orEmpty()
        if (base.isEmpty()) {
            Toast.makeText(this, R.string.toast_need_api_base, Toast.LENGTH_SHORT).show()
            return false
        }
        val token = getSharedPreferences(PREFS, MODE_PRIVATE).getString(KEY_TOKEN, null)
        if (token.isNullOrEmpty()) {
            Toast.makeText(this, R.string.toast_sign_in_first, Toast.LENGTH_SHORT).show()
            return false
        }
        return true
    }

    private fun launchScanner() {
        scanLauncher.launch(
            ScanOptions()
                .setPrompt("Align driver trip QR")
                .setBeepEnabled(true)
                .setOrientationLocked(false),
        )
    }

    private fun postGateStart(qrRaw: String) {
        binding.textResult.text = getString(R.string.scan_sending)
        val base = apiBaseTrimmed()
        val token = getSharedPreferences(PREFS, MODE_PRIVATE).getString(KEY_TOKEN, null)
        if (token.isNullOrEmpty()) {
            runOnUiThread {
                binding.textResult.text = getString(R.string.scan_need_token)
            }
            return
        }
        val url = "$base/trips/gate/start-from-scan"
        val bodyJson = JSONObject().put("qrPayload", qrRaw).toString()
        val body = bodyJson.toRequestBody(JSON)

        Thread {
            try {
                val req = Request.Builder()
                    .url(url)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Authorization", "Bearer $token")
                    .post(body)
                    .build()
                http.newCall(req).execute().use { resp ->
                    val text = resp.body?.string().orEmpty()
                    val msg = if (resp.isSuccessful) {
                        val trip = runCatching { JSONObject(text) }.getOrNull()
                        val num = trip?.optString("requestNumber", "")?.takeIf { it.isNotEmpty() }
                        val state = trip?.optString("state", "")
                        buildString {
                            append(getString(R.string.scan_ok))
                            num?.let { append("\n").append(it) }
                            state?.let { append("\nstate=").append(it) }
                        }
                    } else {
                        buildString {
                            append("HTTP ").append(resp.code).append("\n")
                            append(apiErrorMessage(text, resp.code))
                        }
                    }
                    runOnUiThread { binding.textResult.text = msg }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    binding.textResult.text = getString(R.string.scan_error, e.message ?: "")
                }
            }
        }.start()
    }

    private fun apiErrorMessage(body: String, code: Int): String {
        val o = runCatching { JSONObject(body) }.getOrNull() ?: return body.take(400)
        val m = o.opt("message")
        val text = when (m) {
            is String -> m
            is JSONArray ->
                (0 until m.length()).joinToString("; ") { i -> m.optString(i) }
            else -> o.optString("message", body.take(400))
        }
        return if (text.isNotEmpty()) text else "HTTP $code"
    }

    companion object {
        private const val PREFS = "fleet_gate_scanner"
        private const val KEY_API = "api_base"
        private const val KEY_EMAIL = "email"
        private const val KEY_TOKEN = "access_token"
        private const val KEY_USER_NAME = "user_name"
        private const val KEY_USER_ROLE = "user_role"
        private val JSON = "application/json; charset=utf-8".toMediaType()
        private const val DEFAULT_API_BASE =
            "https://exact-journals-interfaces-sure.trycloudflare.com/api/v1"
    }
}
