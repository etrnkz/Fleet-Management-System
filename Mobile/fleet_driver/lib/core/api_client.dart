import 'dart:convert';
import 'package:http/http.dart' as http;
import 'storage.dart';

const String kDefaultApiBase =
    'https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1';

class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);
  @override
  String toString() => message;
}

class ApiClient {
  final String base;
  ApiClient(this.base);

  Future<Map<String, String>> _headers() async {
    final token = await Storage.getAccessToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> get(String path) async {
    final res = await http.get(
      Uri.parse('$base$path'),
      headers: await _headers(),
    );
    return _handle(res);
  }

  Future<dynamic> post(String path, Map<String, dynamic> body) async {
    final res = await http.post(
      Uri.parse('$base$path'),
      headers: await _headers(),
      body: jsonEncode(body),
    );
    return _handle(res);
  }

  Future<dynamic> patch(String path, Map<String, dynamic> body) async {
    final res = await http.patch(
      Uri.parse('$base$path'),
      headers: await _headers(),
      body: jsonEncode(body),
    );
    return _handle(res);
  }

  dynamic _handle(http.Response res) {
    if (res.statusCode == 401) {
      throw ApiException(401, 'Session expired');
    }
    if (!res.statusCode.toString().startsWith('2')) {
      String msg = 'Request failed';
      try {
        final j = jsonDecode(res.body);
        msg = j['message'] is List
            ? (j['message'] as List).join(', ')
            : j['message'] ?? msg;
      } catch (_) {}
      throw ApiException(res.statusCode, msg);
    }
    if (res.body.isEmpty) return null;
    return jsonDecode(res.body);
  }
}
