package com.fleet.gpssender

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * Thin OkHttp wrapper for all Fleet API calls used by the driver dashboard.
 */
class FleetApiClient(private val base: String, private val token: String) {

    private val http = OkHttpClient.Builder()
        .connectTimeout(25, TimeUnit.SECONDS)
        .readTimeout(25, TimeUnit.SECONDS)
        .writeTimeout(25, TimeUnit.SECONDS)
        .build()

    private val JSON_MT = "application/json; charset=utf-8".toMediaType()

    // ── Auth ──────────────────────────────────────────────────────────────────

    fun getMe(): JSONObject {
        return getJson("$base/users/me")
    }

    fun updateProfile(name: String, phone: String): JSONObject {
        val body = JSONObject().put("name", name).put("phoneNumber", phone)
        return patchJson("$base/users/me", body)
    }

    fun changePassword(current: String, newPw: String): JSONObject {
        val body = JSONObject().put("currentPassword", current).put("newPassword", newPw)
        return patchJson("$base/users/me/password", body)
    }

    fun updateDriverProfile(licenseNumber: String, licenseExpiry: String, experienceYears: Int): JSONObject {
        val body = JSONObject()
            .put("licenseNumber", licenseNumber)
            .put("licenseExpiry", licenseExpiry)
            .put("experienceYears", experienceYears)
        return patchJson("$base/users/me/driver-profile", body)
    }

    // ── Trips ─────────────────────────────────────────────────────────────────

    fun getTrips(): JSONArray {
        val text = get("$base/trips")
        return JSONArray(text)
    }

    fun getAssignedTrips(userId: String): List<JSONObject> {
        val arr = getTrips()
        val result = mutableListOf<JSONObject>()
        for (i in 0 until arr.length()) {
            val t = arr.optJSONObject(i) ?: continue
            val state = t.optString("state", "")
            if (!listOf("READY", "CAR_ALLOCATED").contains(state)) continue
            if (matchesDriver(t, userId)) result.add(t)
        }
        return result
    }

    fun getActiveTrips(userId: String): List<JSONObject> {
        val arr = getTrips()
        val result = mutableListOf<JSONObject>()
        for (i in 0 until arr.length()) {
            val t = arr.optJSONObject(i) ?: continue
            if (t.optString("state", "") != "IN_PROGRESS") continue
            if (matchesDriver(t, userId)) result.add(t)
        }
        return result
    }

    fun getCompletedTrips(userId: String): List<JSONObject> {
        val arr = getTrips()
        val result = mutableListOf<JSONObject>()
        for (i in 0 until arr.length()) {
            val t = arr.optJSONObject(i) ?: continue
            if (t.optString("state", "") != "COMPLETED") continue
            if (matchesDriver(t, userId)) result.add(t)
        }
        return result
    }

    private fun matchesDriver(trip: JSONObject, userId: String): Boolean {
        val driver = trip.optJSONObject("allocatedDriver") ?: return false
        val user = driver.optJSONObject("user")
        val driverId = user?.optString("id", "") ?: driver.optString("userId", "")
        return driverId == userId
    }

    fun rejectAssignment(tripId: String, reason: String): JSONObject {
        val body = JSONObject().put("reason", reason)
        return postJson("$base/trips/$tripId/driver-reject", body)
    }

    // ── Vehicle ───────────────────────────────────────────────────────────────

    fun getAssignedVehicle(userId: String): JSONObject? {
        val trips = getTrips()
        for (i in 0 until trips.length()) {
            val t = trips.optJSONObject(i) ?: continue
            val state = t.optString("state", "")
            if (!listOf("READY", "CAR_ALLOCATED", "IN_PROGRESS").contains(state)) continue
            val driver = t.optJSONObject("allocatedDriver") ?: continue
            val user = driver.optJSONObject("user")
            val driverId = user?.optString("id", "") ?: driver.optString("userId", "")
            if (driverId != userId) continue
            return t.optJSONObject("allocatedVehicle")
        }
        return null
    }

    // ── Maintenance ───────────────────────────────────────────────────────────

    fun getMaintenance(): JSONArray {
        val text = get("$base/maintenance")
        return JSONArray(text)
    }

    fun createMaintenance(vehicleId: String, description: String, priority: String): JSONObject {
        val body = JSONObject()
            .put("vehicleId", vehicleId)
            .put("issueDescription", description)
            .put("priority", priority)
        return postJson("$base/maintenance", body)
    }

    // ── Notifications ─────────────────────────────────────────────────────────

    fun getNotifications(): JSONArray {
        val text = get("$base/notifications")
        return JSONArray(text)
    }

    fun markNotificationRead(id: String) {
        patch("$base/notifications/$id/read", null)
    }

    fun markAllNotificationsRead() {
        patch("$base/notifications/read-all", null)
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun get(url: String): String {
        val req = Request.Builder().url(url).addHeader("Authorization", "Bearer $token").get().build()
        http.newCall(req).execute().use { resp ->
            val text = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) throw ApiException(resp.code, text)
            return text
        }
    }

    private fun getJson(url: String): JSONObject {
        return JSONObject(get(url))
    }

    private fun postJson(url: String, body: JSONObject): JSONObject {
        val rb = body.toString().toRequestBody(JSON_MT)
        val req = Request.Builder().url(url)
            .addHeader("Authorization", "Bearer $token")
            .post(rb).build()
        http.newCall(req).execute().use { resp ->
            val text = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) throw ApiException(resp.code, text)
            return if (text.isBlank()) JSONObject() else JSONObject(text)
        }
    }

    private fun patchJson(url: String, body: JSONObject): JSONObject {
        val rb = body.toString().toRequestBody(JSON_MT)
        val req = Request.Builder().url(url)
            .addHeader("Authorization", "Bearer $token")
            .patch(rb).build()
        http.newCall(req).execute().use { resp ->
            val text = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) throw ApiException(resp.code, text)
            return if (text.isBlank()) JSONObject() else JSONObject(text)
        }
    }

    private fun patch(url: String, body: JSONObject?) {
        val rb = (body?.toString() ?: "{}").toRequestBody(JSON_MT)
        val req = Request.Builder().url(url)
            .addHeader("Authorization", "Bearer $token")
            .patch(rb).build()
        http.newCall(req).execute().use { /* fire and forget */ }
    }

    class ApiException(val code: Int, val body: String) : Exception(
        runCatching {
            val o = JSONObject(body)
            val m = o.opt("message")
            when (m) {
                is String -> m
                is org.json.JSONArray -> (0 until m.length()).joinToString("; ") { m.optString(it) }
                else -> body.take(200)
            }
        }.getOrDefault(body.take(200))
    )
}
