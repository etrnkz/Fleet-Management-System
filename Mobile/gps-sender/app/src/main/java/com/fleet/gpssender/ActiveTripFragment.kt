package com.fleet.gpssender

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.fleet.gpssender.databinding.FragmentActiveBinding
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ActiveTripFragment : BaseFragment() {

    private var _binding: FragmentActiveBinding? = null
    private val binding get() = _binding!!
    private var currentTrip: JSONObject? = null

    private val logReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action != GpsPostService.ACTION_LOG) return
            val msg = intent.getStringExtra(GpsPostService.EXTRA_LOG) ?: return
            _binding?.gpsLogLine?.text = msg

            // Parse speed from log line "OK lat,lng" — update speed field if GPS service broadcasts it
            if (msg.startsWith("OK ")) {
                val now = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
                _binding?.activeLastGps?.text = now
            }
        }
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentActiveBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.btnRefreshActive.setOnClickListener { loadActiveTrip() }
        binding.swipeActive.setOnRefreshListener { loadActiveTrip() }
        binding.btnShowQr.setOnClickListener {
            currentTrip?.let { showQrInfo(it) }
        }
        loadActiveTrip()
    }

    override fun onResume() {
        super.onResume()
        val filter = IntentFilter(GpsPostService.ACTION_LOG)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requireContext().registerReceiver(logReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            @Suppress("DEPRECATION")
            requireContext().registerReceiver(logReceiver, filter)
        }
        loadActiveTrip()
    }

    override fun onPause() {
        super.onPause()
        requireContext().unregisterReceiver(logReceiver)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    fun onGeofenceStatus(status: GeofenceStatus, zone: String?) {
        val b = _binding ?: return
        when (status) {
            GeofenceStatus.CLEAR -> {
                b.engineShutdownBanner.visibility = View.GONE
                b.statusDot.setBackgroundResource(R.drawable.circle_green)
                b.statusLabel.text = "IN PROGRESS"
                b.statusLabel.setTextColor(Color.parseColor("#1B3D2F"))
                b.gpsLogLine.setBackgroundColor(Color.parseColor("#F0F9F4"))
                b.gpsLogLine.setTextColor(Color.parseColor("#1B3D2F"))
            }
            GeofenceStatus.WARNING -> {
                b.engineShutdownBanner.visibility = View.VISIBLE
                b.engineShutdownBanner.setBackgroundColor(Color.parseColor("#FFF59D"))
                b.engineShutdownText.setTextColor(Color.parseColor("#7B5800"))
                b.engineShutdownText.text = "⚠️  WARNING — Approaching restricted zone: ${zone ?: "?"}\nEngine shutdown will trigger if you enter."
            }
            GeofenceStatus.SHUTDOWN -> {
                b.engineShutdownBanner.visibility = View.VISIBLE
                b.engineShutdownBanner.setBackgroundColor(Color.parseColor("#FFCDD2"))
                b.engineShutdownText.setTextColor(Color.parseColor("#B71C1C"))
                b.engineShutdownText.text = "🚨  ENGINE SHUTDOWN — Inside restricted zone: ${zone ?: "?"}\nLeave this area immediately."
                b.statusDot.setBackgroundResource(R.drawable.circle_red)
                b.statusLabel.text = "RESTRICTED ZONE"
                b.statusLabel.setTextColor(Color.parseColor("#DC2626"))
                b.gpsLogLine.setBackgroundColor(Color.parseColor("#FEF2F2"))
                b.gpsLogLine.setTextColor(Color.parseColor("#DC2626"))
            }
        }
    }

    private fun loadActiveTrip() {
        if (!isLoggedIn()) {
            showEmpty()
            binding.swipeActive.isRefreshing = false
            return
        }
        runAsync {
            try {
                val trips = client().getActiveTrips(userId())
                requireActivity().runOnUiThread {
                    binding.swipeActive.isRefreshing = false
                    if (trips.isEmpty()) {
                        currentTrip = null
                        showEmpty()
                    } else {
                        currentTrip = trips.first()
                        showTrip(trips.first())
                    }
                }
            } catch (e: Exception) {
                requireActivity().runOnUiThread {
                    binding.swipeActive.isRefreshing = false
                    showEmpty()
                }
            }
        }
    }

    private fun showEmpty() {
        binding.emptyActive.visibility = View.VISIBLE
        binding.activeTripCard.visibility = View.GONE
        binding.engineShutdownBanner.visibility = View.GONE
    }

    private fun showTrip(trip: JSONObject) {
        binding.emptyActive.visibility = View.GONE
        binding.activeTripCard.visibility = View.VISIBLE

        val requestNum = trip.optString("requestNumber", "").takeIf { it.isNotEmpty() }
            ?: trip.optString("id", "").take(8)

        binding.activeTripId.text = requestNum
        binding.activeTripDestination.text = trip.optString("destination", "—")
        binding.activeTripPurpose.text = trip.optString("purpose", "")
        binding.activePassengers.text = trip.optInt("passengerCount", 0).toString()

        // Check current geofence status from prefs (persisted by service)
        val savedStatus = prefs().getString("last_geofence_status", "CLEAR") ?: "CLEAR"
        val savedZone = prefs().getString("last_geofence_zone", null)
        val status = runCatching { GeofenceStatus.valueOf(savedStatus) }.getOrDefault(GeofenceStatus.CLEAR)
        onGeofenceStatus(status, savedZone)
    }

    private fun showQrInfo(trip: JSONObject) {
        val tripId = trip.optString("id", "")
        val destination = trip.optString("destination", "")
        val requestNum = trip.optString("requestNumber", "").takeIf { it.isNotEmpty() } ?: tripId.take(8)
        android.app.AlertDialog.Builder(requireContext())
            .setTitle("Trip QR Code")
            .setMessage("Trip: $destination\nID: $requestNum\n\nQR payload: $tripId")
            .setPositiveButton("Close", null)
            .show()
    }
}
