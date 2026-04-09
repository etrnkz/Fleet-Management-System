package com.fleet.gpssender

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.viewpager2.adapter.FragmentStateAdapter
import com.fleet.gpssender.databinding.ActivityDashboardBinding
import com.google.android.material.tabs.TabLayoutMediator

class DashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDashboardBinding

    private val geofenceReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action != GpsPostService.ACTION_GEOFENCE_STATUS) return
            val statusName = intent.getStringExtra(GpsPostService.EXTRA_GEOFENCE_STATUS) ?: return
            val zone = intent.getStringExtra(GpsPostService.EXTRA_GEOFENCE_ZONE)
            val status = runCatching { GeofenceStatus.valueOf(statusName) }.getOrDefault(GeofenceStatus.CLEAR)
            updateGeofenceBanner(status, zone)

            // Forward to active fragment if visible
            val frag = supportFragmentManager.fragments
                .filterIsInstance<ActiveTripFragment>()
                .firstOrNull()
            frag?.onGeofenceStatus(status, zone)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)

        val tabs = listOf(
            getString(R.string.tab_trips),
            getString(R.string.tab_active),
            getString(R.string.tab_history),
            getString(R.string.tab_maintenance),
            getString(R.string.tab_profile),
        )

        binding.viewPager.adapter = object : FragmentStateAdapter(this) {
            override fun getItemCount() = tabs.size
            override fun createFragment(position: Int): Fragment = when (position) {
                0 -> TripsFragment()
                1 -> ActiveTripFragment()
                2 -> HistoryFragment()
                3 -> MaintenanceFragment()
                4 -> ProfileFragment()
                else -> TripsFragment()
            }
        }

        TabLayoutMediator(binding.tabLayout, binding.viewPager) { tab, pos ->
            tab.text = tabs[pos]
        }.attach()
    }

    override fun onResume() {
        super.onResume()
        val filter = IntentFilter().apply {
            addAction(GpsPostService.ACTION_GEOFENCE_STATUS)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(geofenceReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            @Suppress("DEPRECATION")
            registerReceiver(geofenceReceiver, filter)
        }
    }

    override fun onPause() {
        super.onPause()
        unregisterReceiver(geofenceReceiver)
    }

    private fun updateGeofenceBanner(status: GeofenceStatus, zone: String?) {
        val banner = binding.geofenceBanner
        val text = binding.geofenceBannerText
        when (status) {
            GeofenceStatus.CLEAR -> banner.visibility = View.GONE
            GeofenceStatus.WARNING -> {
                banner.visibility = View.VISIBLE
                banner.setBackgroundColor(Color.parseColor("#FFF59D"))
                text.setTextColor(Color.parseColor("#7B5800"))
                text.text = "⚠️  WARNING — Approaching restricted zone: ${zone ?: "?"}\nEngine shutdown will trigger if you enter."
            }
            GeofenceStatus.SHUTDOWN -> {
                banner.visibility = View.VISIBLE
                banner.setBackgroundColor(Color.parseColor("#FFCDD2"))
                text.setTextColor(Color.parseColor("#B71C1C"))
                text.text = "🚨  ENGINE SHUTDOWN — Inside restricted zone: ${zone ?: "?"}\nLeave this area immediately."
            }
        }
    }

    companion object {
        fun start(context: Context) {
            context.startActivity(Intent(context, DashboardActivity::class.java))
        }
    }
}
