package com.fleet.gpssender

import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

data class RestrictedZone(
    val name: String?,
    val latitude: Double,
    val longitude: Double,
    val radiusMeters: Double,
)

object GeoFence {

    fun haversineMeters(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val r = 6371000.0
        fun rad(d: Double) = d * Math.PI / 180.0
        val dLat = rad(lat2 - lat1)
        val dLon = rad(lon2 - lon1)
        val a = sin(dLat / 2) * sin(dLat / 2) +
            cos(rad(lat1)) * cos(rad(lat2)) * sin(dLon / 2) * sin(dLon / 2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return r * c
    }

    /** @return pair(engineOff, zone label or null) */
    fun violationInAnyZone(
        zones: List<RestrictedZone>,
        lat: Double,
        lon: Double,
    ): Pair<Boolean, String?> {
        for (z in zones) {
            if (z.radiusMeters <= 0) continue
            val d = haversineMeters(lat, lon, z.latitude, z.longitude)
            if (d <= z.radiusMeters) {
                val label = z.name?.trim()?.takeIf { it.isNotEmpty() } ?: "Restricted zone"
                return true to label
            }
        }
        return false to null
    }

    fun parseZonesFromConfigJson(body: String): Pair<Boolean, List<RestrictedZone>> {
        return try {
            val root = JSONObject(body)
            val enabled = root.optBoolean("vipGeoRestrictionEnabled", false)
            val arr = root.optJSONArray("restrictedZones") ?: JSONArray()
            val list = ArrayList<RestrictedZone>(arr.length())
            for (i in 0 until arr.length()) {
                val o = arr.optJSONObject(i) ?: continue
                val lat = o.optDouble("latitude", Double.NaN)
                val lng = o.optDouble("longitude", Double.NaN)
                val rad = o.optDouble("radiusMeters", Double.NaN)
                if (lat.isFinite() && lng.isFinite() && rad.isFinite() && rad > 0) {
                    val n = o.optString("name", "").trim().takeIf { it.isNotEmpty() }
                    list.add(RestrictedZone(n, lat, lng, rad))
                }
            }
            enabled to list
        } catch (_: Exception) {
            false to emptyList()
        }
    }
}
