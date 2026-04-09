package com.fleet.gpssender

import android.app.AlertDialog
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import com.fleet.gpssender.databinding.FragmentTripsBinding
import org.json.JSONArray
import org.json.JSONObject

class TripsFragment : BaseFragment() {

    private var _binding: FragmentTripsBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentTripsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.btnRefreshTrips.setOnClickListener { loadTrips() }
        binding.swipeTrips.setOnRefreshListener { loadTrips() }
        loadTrips()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun loadTrips() {
        if (!isLoggedIn()) {
            showEmpty("Sign in to see your trips")
            binding.swipeTrips.isRefreshing = false
            return
        }
        runAsync {
            try {
                val trips = client().getAssignedTrips(userId())
                requireActivity().runOnUiThread {
                    binding.swipeTrips.isRefreshing = false
                    renderTrips(trips)
                }
            } catch (e: Exception) {
                requireActivity().runOnUiThread {
                    binding.swipeTrips.isRefreshing = false
                    showEmpty("Failed to load trips: ${e.message}")
                }
            }
        }
    }

    private fun renderTrips(trips: List<JSONObject>) {
        val container = binding.tripsContainer
        container.removeAllViews()
        if (trips.isEmpty()) {
            showEmpty("No assigned trips")
            return
        }
        trips.forEach { trip -> container.addView(buildTripCard(trip)) }
    }

    private fun buildTripCard(trip: JSONObject): View {
        val ctx = requireContext()
        val card = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.WHITE)
            setPadding(dp(16), dp(16), dp(16), dp(16))
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            lp.bottomMargin = dp(12)
            layoutParams = lp
        }

        val state = trip.optString("state", "")
        val destination = trip.optString("destination", "—")
        val purpose = trip.optString("purpose", "")
        val requestNum = trip.optString("requestNumber", "").takeIf { it.isNotEmpty() }
            ?: trip.optString("id", "").take(8)
        val startTime = trip.optString("startDateTime", "")

        // Header row: request number + state badge
        val headerRow = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
            ).also { it.bottomMargin = dp(6) }
        }
        headerRow.addView(TextView(ctx).apply {
            text = requestNum
            textSize = 11f
            typeface = android.graphics.Typeface.MONOSPACE
            setTextColor(Color.parseColor("#9CA3AF"))
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        })
        headerRow.addView(TextView(ctx).apply {
            text = state
            textSize = 11f
            setTypeface(null, android.graphics.Typeface.BOLD)
            setTextColor(if (state == "READY") Color.parseColor("#1B3D2F") else Color.parseColor("#2563EB"))
            setBackgroundColor(if (state == "READY") Color.parseColor("#F0F9F4") else Color.parseColor("#EFF6FF"))
            setPadding(dp(8), dp(3), dp(8), dp(3))
        })
        card.addView(headerRow)

        card.addView(TextView(ctx).apply {
            text = destination
            textSize = 16f
            setTypeface(null, android.graphics.Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
            ).also { it.bottomMargin = dp(4) }
        })

        if (purpose.isNotEmpty()) {
            card.addView(TextView(ctx).apply {
                text = purpose
                textSize = 13f
                setTextColor(Color.parseColor("#6B7280"))
                maxLines = 2
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
                ).also { it.bottomMargin = dp(4) }
            })
        }

        if (startTime.isNotEmpty()) {
            card.addView(TextView(ctx).apply {
                text = formatDateTime(startTime)
                textSize = 12f
                setTextColor(Color.parseColor("#9CA3AF"))
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
                ).also { it.bottomMargin = dp(12) }
            })
        }

        // Action buttons
        val btnRow = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        val qrBtn = com.google.android.material.button.MaterialButton(ctx).apply {
            text = "QR Code"
            textSize = 13f
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                .also { it.marginEnd = dp(8) }
            setOnClickListener { showQrDialog(trip) }
        }

        val rejectBtn = com.google.android.material.button.MaterialButton(
            ctx, null, com.google.android.material.R.attr.materialButtonOutlinedStyle
        ).apply {
            text = "Reject"
            textSize = 13f
            setTextColor(Color.parseColor("#DC2626"))
            strokeColor = android.content.res.ColorStateList.valueOf(Color.parseColor("#FCA5A5"))
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            setOnClickListener { showRejectDialog(trip) }
        }

        btnRow.addView(qrBtn)
        btnRow.addView(rejectBtn)
        card.addView(btnRow)

        return card
    }

    private fun showQrDialog(trip: JSONObject) {
        val tripId = trip.optString("id", "")
        val destination = trip.optString("destination", "")
        val requestNum = trip.optString("requestNumber", "").takeIf { it.isNotEmpty() } ?: tripId.take(8)

        AlertDialog.Builder(requireContext())
            .setTitle("Trip QR Code")
            .setMessage("Trip: $destination\nID: $requestNum\n\nQR payload: $tripId\n\n(Use the gate scanner app to scan this trip ID)")
            .setPositiveButton("Close", null)
            .show()
    }

    private fun showRejectDialog(trip: JSONObject) {
        val ctx = requireContext()
        val input = EditText(ctx).apply {
            hint = "Reason for rejection"
            minLines = 3
            gravity = android.view.Gravity.TOP
            setPadding(dp(16), dp(12), dp(16), dp(12))
        }
        AlertDialog.Builder(ctx)
            .setTitle("Reject Assignment")
            .setMessage(trip.optString("destination", ""))
            .setView(input)
            .setPositiveButton("Confirm Rejection") { _, _ ->
                val reason = input.text.toString().trim()
                if (reason.isEmpty()) { toast("Enter a reason"); return@setPositiveButton }
                rejectTrip(trip.optString("id", ""), reason)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun rejectTrip(tripId: String, reason: String) {
        runAsync {
            try {
                client().rejectAssignment(tripId, reason)
                requireActivity().runOnUiThread {
                    toast("Assignment rejected")
                    loadTrips()
                }
            } catch (e: Exception) {
                requireActivity().runOnUiThread { toast("Failed: ${e.message}") }
            }
        }
    }

    private fun showEmpty(msg: String) {
        val container = binding.tripsContainer
        container.removeAllViews()
        container.addView(TextView(requireContext()).apply {
            text = msg
            textSize = 14f
            setTextColor(Color.parseColor("#9CA3AF"))
            gravity = android.view.Gravity.CENTER
            setPadding(0, dp(60), 0, dp(60))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
            )
        })
    }

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    private fun formatDateTime(iso: String): String = try {
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault())
        val out = java.text.SimpleDateFormat("MMM d, yyyy HH:mm", java.util.Locale.getDefault())
        out.format(sdf.parse(iso.take(19))!!)
    } catch (_: Exception) { iso.take(16) }
}
