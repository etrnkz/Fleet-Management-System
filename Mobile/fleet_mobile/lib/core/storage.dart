import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class Storage {
  static const _s = FlutterSecureStorage();

  static Future<String?> getAccessToken() => _s.read(key: 'access_token');
  static Future<void> setAccessToken(String v) => _s.write(key: 'access_token', value: v);

  static Future<String?> getRefreshToken() => _s.read(key: 'refresh_token');
  static Future<void> setRefreshToken(String v) => _s.write(key: 'refresh_token', value: v);

  static Future<Map<String, dynamic>?> getUser() async {
    final s = await _s.read(key: 'user');
    if (s == null) return null;
    try {
      return Map<String, dynamic>.from(jsonDecode(s));
    } catch (_) {
      return null;
    }
  }

  static Future<void> setUser(Map<String, dynamic> u) =>
      _s.write(key: 'user', value: jsonEncode(u));

  static Future<String?> getApiBase() => _s.read(key: 'api_base');
  static Future<void> setApiBase(String v) => _s.write(key: 'api_base', value: v);

  static Future<String?> getRememberEmail() => _s.read(key: 'remember_email');
  static Future<void> setRememberEmail(String v) => _s.write(key: 'remember_email', value: v);
  static Future<void> clearRememberEmail() => _s.delete(key: 'remember_email');

  static Future<void> clearSession() async {
    await _s.delete(key: 'access_token');
    await _s.delete(key: 'refresh_token');
    await _s.delete(key: 'user');
  }
}
