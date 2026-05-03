import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class Storage {
  static const _s = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  /// Safe read — returns null instead of throwing on Keystore corruption.
  static Future<String?> _safeRead(String key) async {
    try {
      return await _s.read(key: key);
    } catch (_) {
      // Keystore key corrupted (e.g. after reinstall on Android 15).
      // Delete the bad entry so the app can recover.
      try { await _s.delete(key: key); } catch (_) {}
      return null;
    }
  }

  /// Wipe all stored data — called when Keystore is fully corrupted.
  static Future<void> deleteAll() async {
    try { await _s.deleteAll(); } catch (_) {}
  }

  static Future<String?> getAccessToken()  => _safeRead('access_token');
  static Future<void>    setAccessToken(String v) => _s.write(key: 'access_token', value: v);

  static Future<String?> getRefreshToken() => _safeRead('refresh_token');
  static Future<void>    setRefreshToken(String v) => _s.write(key: 'refresh_token', value: v);

  static Future<Map<String, dynamic>?> getUser() async {
    final s = await _safeRead('user');
    if (s == null) return null;
    try {
      return Map<String, dynamic>.from(jsonDecode(s));
    } catch (_) {
      return null;
    }
  }
  static Future<void> setUser(Map<String, dynamic> u) =>
      _s.write(key: 'user', value: jsonEncode(u));

  static Future<String?> getApiBase()      => _safeRead('api_base');
  static Future<void>    setApiBase(String v) => _s.write(key: 'api_base', value: v);

  static Future<String?> getRememberEmail() => _safeRead('remember_email');
  static Future<void>    setRememberEmail(String v) => _s.write(key: 'remember_email', value: v);
  static Future<void>    clearRememberEmail() async {
    try { await _s.delete(key: 'remember_email'); } catch (_) {}
  }

  static Future<void> clearSession() async {
    for (final key in ['access_token', 'refresh_token', 'user']) {
      try { await _s.delete(key: key); } catch (_) {}
    }
  }
}
