package com.fleet.gpssender

import android.widget.Toast
import androidx.fragment.app.Fragment

abstract class BaseFragment : Fragment() {

    protected fun prefs() = requireContext()
        .getSharedPreferences(MainActivity.PREFS, android.content.Context.MODE_PRIVATE)

    protected fun apiBase() = prefs().getString(MainActivity.KEY_API, MainActivity.DEFAULT_API_BASE)
        ?.trim()?.trimEnd('/') ?: MainActivity.DEFAULT_API_BASE

    protected fun token() = prefs().getString(MainActivity.KEY_TOKEN, null)?.trim() ?: ""

    protected fun userId() = prefs().getString(MainActivity.KEY_USER_ID, null)?.trim() ?: ""

    protected fun isLoggedIn() = token().isNotEmpty() && userId().isNotEmpty()

    protected fun client() = FleetApiClient(apiBase(), token())

    protected fun toast(msg: String) =
        Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show()

    protected fun runAsync(block: () -> Unit) = Thread(block).start()
}
