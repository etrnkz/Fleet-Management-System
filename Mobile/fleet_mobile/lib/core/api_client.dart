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
    if (!res.statusCode.toString().startsWith('2')) {
      String msg = 'Request failed';
      try {
        final j = jsonDecode(res.body);
        // Unwrap nested data if wrapped
        final body = (j is Map && j.containsKey('data')) ? j['data'] : j;
        msg = body is Map
            ? (body['message'] is List
                ? (body['message'] as List).join(', ')
                : body['message']?.toString() ?? msg)
            : msg;
      } catch (_) {}
      if (res.statusCode == 401 && msg.toLowerCase().contains('expired')) {
        throw ApiException(401, 'Session expired');
      }
      throw ApiException(res.statusCode, msg);
    }
    if (res.body.isEmpty) return null;
    final decoded = jsonDecode(res.body);
    // Unwrap { success, data, timestamp } envelope from TransformInterceptor
    if (decoded is Map && decoded.containsKey('data')) {
      return decoded['data'];
    }
    return decoded;
  }
}
