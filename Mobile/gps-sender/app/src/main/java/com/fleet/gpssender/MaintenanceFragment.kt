package com.fleet.gpssender

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import com.fleet.gpssender.databinding.FragmentMaintenanceBinding
import org.json.JSONObject

class MaintenanceFragment : BaseFragment() {

    private var _binding: FragmentMaintenanceBinding? = null
    private val binding get() = _binding!!
    private var vehicleId: String? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentMaintenanceBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.swipeMaintenance.setOnRefreshListener { load() }
        binding.btnSubmitMaintenance.setOnClickListener { submit() }
        load()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun load() {
        if (!isLoggedIn()) { binding.swipeMaintenance.isRefreshing = false; return }
        runAsync {
            try {
                val vehicle = client().getAssignedVehicle(userId())
                val requests = client().getMaintenance()
                requireActivity().runOnUiThread {
                    binding.swipeMaintenance.isRefreshing = false
                    vehicleId = vehicle?.optString("id", null)
                    binding.textVehicleInfo.text = if (vehicle != null) {
                        "🚗  ${vehicle.optString("make", "")} ${vehicle.optString("model", "")}  ·  ${vehicle.optString("plateNumber", "")}"
                    } else {
                        "No vehicle assigned"
                    }
                    renderHistory(requests)
                }
            } catch (e: Exception) {
                requireActivity().runOnUiThread {
                    binding.swipeMaintenance.isRefreshing = false
                    toast("Failed to load: ${e.message}")
                }
            }
        }
    }

    private fun submit() {
        val vid = vehicleId
        if (vid.isNullOrEmpty()) { toast("No vehicle assigned"); return }
        val desc = binding.inputIssueDescription.text?.toString()?.trim() ?: ""
        if (desc.isEmpty()) { toast("Describe the issue"); return }
        val priority = when (binding.priorityGroup.checkedRadioButtonId) {
            R.id.radioLow -> "Low"
            R.id.radioHigh -> "High"
            R.id.radioCritical -> "Critical"
            else -> "Medium"
        }
        binding.btnSubmitMaintenance.isEnabled = false
        runAsync {
            try {
                client().createMaintenance(vid, desc, priority)
                requireActivity().runOnUiThread {
                    binding.btnSubmitMaintenance.isEnabled = true
                    binding.inputIssueDescription.text?.clear()
                    binding.radioMedium.isChecked = true
                    toast("Maintenance request submitted")
                    load()
                }
            } catch (e: Exception) {
                requireActivity().runOnUiThread {
                    binding.btnSubmitMaintenance.isEnabled = true
                    toast("Failed: ${e.message}")
                }
            }
        }
    }

    private fun renderHistory(arr: org.json.JSONArray) {
        val container = binding.maintenanceHistoryContainer
        container.removeAllViews()
        if (arr.length() == 0) return
        for (i in 0 until arr.length()) {
            val r = arr.optJSONObject(i) ?: continue
            container.addView(buildCard(r))
        }
    }

    private fun buildCard(r: JSONObject): View {
        val ctx = requireContext()
        val priority = r.optString("priority", "Medium")
        val (bg, fg) = priorityColors(priority)

        val card = LinearLayout(ctx).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.WHITE)
            setPadding(dp(14), dp(12), dp(14), dp(12))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
            ).also { it.bottomMargin = dp(8) }
        }

        val header = LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
            ).also { it.bottomMargin = dp(6) }
        }
        header.addView(TextView(ctx).apply {
            text = priority
            textSize = 11f
            setTypeface(null, android.graphics.Typeface.BOLD)
            setTextColor(fg)
            setBackgroundColor(bg)
            setPadding(dp(8), dp(3), dp(8), dp(3))
            layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT)
                .also { it.marginEnd = dp(8) }
        })
        header.addView(TextView(ctx).apply {
            text = formatDate(r.optString("createdAt", ""))
            textSize = 12f
            setTextColor(Color.parseColor("#9CA3AF"))
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        })
        val status = r.optString("status", "").takeIf { it.isNotEmpty() }
        if (status != null) {
            header.addView(TextView(ctx).apply {
                text = status
                textSize = 11f
                setTextColor(Color.parseColor("#6B7280"))
            })
        }
        card.addView(header)

        card.addView(TextView(ctx).apply {
            text = r.optString("issueDescription", "")
            textSize = 13f
            setTextColor(Color.parseColor("#374151"))
            maxLines = 4
        })
        return card
    }

    private fun priorityColors(p: String): Pair<Int, Int> = when (p) {
        "Low" -> Color.parseColor("#F0F9F4") to Color.parseColor("#1B3D2F")
        "High" -> Color.parseColor("#FFF7ED") to Color.parseColor("#EA580C")
        "Critical" -> Color.parseColor("#FEF2F2") to Color.parseColor("#DC2626")
        else -> Color.parseColor("#EFF6FF") to Color.parseColor("#2563EB")
    }

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    private fun formatDate(iso: String): String = try {
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault())
        val out = java.text.SimpleDateFormat("MMM d, yyyy", java.util.Locale.getDefault())
        out.format(sdf.parse(iso.take(19))!!)
    } catch (_: Exception) { iso.take(10) }
}
