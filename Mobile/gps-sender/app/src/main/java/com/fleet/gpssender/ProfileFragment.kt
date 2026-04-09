package com.fleet.gpssender

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import com.fleet.gpssender.databinding.FragmentProfileBinding
import org.json.JSONObject

class ProfileFragment : BaseFragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.btnSaveProfile.setOnClickListener { saveProfile() }
        binding.btnChangePassword.setOnClickListener { changePassword() }
        binding.btnSignOut.setOnClickListener { signOut() }
        loadProfile()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun loadProfile() {
        if (!isLoggedIn()) return
        runAsync {
            try {
                val user = client().getMe()
                requireActivity().runOnUiThread { populateUi(user) }
            } catch (e: Exception) {
                requireActivity().runOnUiThread { toast("Failed to load profile: ${e.message}") }
            }
        }
    }

    private fun populateUi(user: JSONObject) {
        val name = user.optString("name", "Driver")
        val email = user.optString("email", "")
        val phone = user.optString("phoneNumber", "")

        val initials = name.split(" ").mapNotNull { it.firstOrNull()?.toString() }.take(2).joinToString("").uppercase()
        binding.textAvatarInitials.text = initials.ifEmpty { "DR" }
        binding.textProfileName.text = name
        binding.textProfileEmail.text = email

        binding.inputProfileName.setText(name)
        binding.inputProfilePhone.setText(phone)
    }

    private fun saveProfile() {
        val name = binding.inputProfileName.text?.toString()?.trim() ?: ""
        val phone = binding.inputProfilePhone.text?.toString()?.trim() ?: ""
        val license = binding.inputLicenseNumber.text?.toString()?.trim() ?: ""
        val expiry = binding.inputLicenseExpiry.text?.toString()?.trim() ?: ""
        val exp = binding.inputExperienceYears.text?.toString()?.trim()?.toIntOrNull() ?: 0

        if (name.isEmpty()) { toast("Enter your name"); return }
        binding.btnSaveProfile.isEnabled = false
        runAsync {
            try {
                client().updateProfile(name, phone)
                if (license.isNotEmpty() && expiry.isNotEmpty()) {
                    client().updateDriverProfile(license, expiry, exp)
                }
                // Update cached name
                prefs().edit().putString(MainActivity.KEY_USER_NAME, name).apply()
                requireActivity().runOnUiThread {
                    binding.btnSaveProfile.isEnabled = true
                    binding.textProfileName.text = name
                    val initials = name.split(" ").mapNotNull { it.firstOrNull()?.toString() }.take(2).joinToString("").uppercase()
                    binding.textAvatarInitials.text = initials.ifEmpty { "DR" }
                    toast("Profile updated")
                }
            } catch (e: Exception) {
                requireActivity().runOnUiThread {
                    binding.btnSaveProfile.isEnabled = true
                    toast("Failed: ${e.message}")
                }
            }
        }
    }

    private fun changePassword() {
        val current = binding.inputCurrentPassword.text?.toString() ?: ""
        val newPw = binding.inputNewPassword.text?.toString() ?: ""
        val confirm = binding.inputConfirmPassword.text?.toString() ?: ""
        if (current.isEmpty() || newPw.isEmpty()) { toast("Fill in all password fields"); return }
        if (newPw != confirm) { toast("Passwords do not match"); return }
        if (newPw.length < 8) { toast("Minimum 8 characters"); return }
        binding.btnChangePassword.isEnabled = false
        runAsync {
            try {
                client().changePassword(current, newPw)
                requireActivity().runOnUiThread {
                    binding.btnChangePassword.isEnabled = true
                    binding.inputCurrentPassword.text?.clear()
                    binding.inputNewPassword.text?.clear()
                    binding.inputConfirmPassword.text?.clear()
                    toast("Password changed")
                }
            } catch (e: Exception) {
                requireActivity().runOnUiThread {
                    binding.btnChangePassword.isEnabled = true
                    toast("Failed: ${e.message}")
                }
            }
        }
    }

    private fun signOut() {
        android.app.AlertDialog.Builder(requireContext())
            .setTitle("Sign Out")
            .setMessage("Are you sure you want to sign out?")
            .setPositiveButton("Sign Out") { _, _ ->
                // Stop background services
                requireContext().stopService(Intent(requireContext(), TripWatchService::class.java))
                requireContext().stopService(Intent(requireContext(), GpsPostService::class.java))
                // Clear session
                prefs().edit()
                    .remove(MainActivity.KEY_TOKEN)
                    .remove(MainActivity.KEY_USER_ID)
                    .remove(MainActivity.KEY_USER_NAME)
                    .remove(MainActivity.KEY_TRIP)
                    .apply()
                // Go back to login
                val intent = Intent(requireContext(), MainActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}
