package com.fleet.gpssender

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import com.fleet.gpssender.databinding.FragmentHistoryBinding
import org.json.JSONObject

class HistoryFragment : BaseFragment() {

    private var _binding: FragmentHistoryBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentHistoryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.btnRefreshHistory.setOnClickListener { load() }
        binding.swipeHistory.setOnRefreshListener { load() }
        load()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun load() {
        if (!isLoggedIn()) { showEmpty("Sign in to see trip history"); binding.swipeHistory.isRefreshing = false; return }
        runAsync {
            try {
                val trips = client().getCompletedTrips(userId())
                requireActivity().runOnUiThread {
                    binding.swipeHistory.isRefreshing = false
                    render(trips)
                }
            } catch (e: Exception) {
                requireActivity().runOnUiThread {
                    binding.swipeHistory.isRefreshing = false
                    showEmpty("Failed: ${e.message}")
                }
            }
        }
    }

    private fun render(trips: List<JSONObject>) {
        val container = binding.historyContainer
        container.removeAllViews()
        if (trips.isEmpty()) { showEmpty("No completed trips yet"); return }
        trips.forEach { container.addView(buildCard(it)) }
    }

    private fun buildCard(trip: JSONObject): View {
        val ctx = requireContext()
        val card = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.WHITE)
            setPadding(dp(16), dp(14), dp(16), dp(14))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
            ).also { it.bottomMargin = dp(10) }
        }

        val requestNum = trip.optString("requestNumber", "").takeIf { it.isNotEmpty() }
            ?: trip.optString("id", "").take(8)

        // Header
        val header = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
            ).also { it.bottomMargin = dp(6) }
        }
        header.addView(TextView(ctx).apply {
            text = requestNum
            textSize = 11f
            typeface = android.graphics.Typeface.MONOSPACE
            setTextColor(Color.parseColor("#9CA3AF"))
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        })
        header.addView(TextView(ctx).apply {
            text = "COMPLETED"
            textSize = 11f
            setTypeface(null, android.graphics.Typeface.BOLD)
            setTextColor(Color.parseColor("#6B7280"))
            setBackgroundColor(Color.parseColor("#F3F4F6"))
            setPadding(dp(8), dp(3), dp(8), dp(3))
        })
        card.addView(header)

        card.addView(TextView(ctx).apply {
            text = trip.optString("destination", "—")
            textSize = 15f
            setTypeface(null, android.graphics.Typeface.BOLD)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
            ).also { it.bottomMargin = dp(3) }
        })

        val purpose = trip.optString("purpose", "")
        if (purpose.isNotEmpty()) {
            card.addView(TextView(ctx).apply {
                text = purpose
                textSize = 13f
                setTextColor(Color.parseColor("#6B7280"))
                maxLines = 2
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
                ).also { it.bottomMargin = dp(6) }
            })
        }

        // Footer: date + distance
        val footer = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
        }
        footer.addView(TextView(ctx).apply {
            text = formatDate(trip.optString("startDateTime", ""))
            textSize = 12f
            setTextColor(Color.parseColor("#9CA3AF"))
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        })
        val dist = trip.optDouble("actualDistance", Double.NaN)
        if (!dist.isNaN()) {
            footer.addView(TextView(ctx).apply {
                text = "${dist.toInt()} km"
                textSize = 13f
                setTypeface(null, android.graphics.Typeface.BOLD)
                setTextColor(Color.parseColor("#1B3D2F"))
                setBackgroundColor(Color.parseColor("#F0F9F4"))
                setPadding(dp(8), dp(4), dp(8), dp(4))
            })
        }
        card.addView(footer)
        return card
    }

    private fun showEmpty(msg: String) {
        val container = binding.historyContainer
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

    private fun formatDate(iso: String): String = try {
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault())
        val out = java.text.SimpleDateFormat("MMM d, yyyy", java.util.Locale.getDefault())
        out.format(sdf.parse(iso.take(19))!!)
    } catch (_: Exception) { iso.take(10) }
}
