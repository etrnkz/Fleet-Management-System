import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_scanner/mobile_scanner.dart';
import '../main.dart';

const _defaultBase = 'https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1';
const _storage = FlutterSecureStorage();

class GateScreen extends StatefulWidget {
  const GateScreen({super.key});
  @override
  State<GateScreen> createState() => _GateScreenState();
}

class _GateScreenState extends State<GateScreen> {
  final _apiCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _showPass = false;
  bool _loggingIn = false;
  String? _token;
  String? _userName;
  String? _userRole;
  String _result = '—';
  bool _scanning = false;
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _loadSaved();
  }

  Future<void> _loadSaved() async {
    final base = await _storage.read(key: 'gate_api_base') ?? _defaultBase;
    final email = await _storage.read(key: 'gate_email') ?? '';
    final token = await _storage.read(key: 'gate_token');
    final name = await _storage.read(key: 'gate_user_name');
    final role = await _storage.read(key: 'gate_user_role');
    setState(() {
      _apiCtrl.text = base;
      _emailCtrl.text = email;
      _token = token;
      _userName = name;
      _userRole = role;
    });
  }

  String get _base => _apiCtrl.text.trim().replaceAll(RegExp(r'/$'), '');

  Future<void> _login() async {
    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text;
    if (_base.isEmpty || email.isEmpty || pass.isEmpty) {
      _setResult('Fill in API base, email and password');
      return;
    }
    setState(() => _loggingIn = true);
    try {
      final res = await http.post(
        Uri.parse('$_base/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': pass}),
      );
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      if (!res.statusCode.toString().startsWith('2')) {
        _setResult('Login failed: ${body['message'] ?? res.statusCode}');
        return;
      }
      final token = body['access_token'] as String?;
      if (token == null) { _setResult('Login response missing token'); return; }
      final user = body['user'] as Map<String, dynamic>?;
      final name = user?['name'] as String?;
      final role = user?['role'] as String?;
      await _storage.write(key: 'gate_api_base', value: _base);
      await _storage.write(key: 'gate_email', value: email);
      await _storage.write(key: 'gate_token', value: token);
      if (name != null) await _storage.write(key: 'gate_user_name', value: name);
      if (role != null) await _storage.write(key: 'gate_user_role', value: role);
      _passCtrl.clear();
      setState(() { _token = token; _userName = name; _userRole = role; });
      _setResult('Signed in as ${name ?? email}');
      if (role != null && !['Gate', 'TransportOffice', 'Developer', 'SystemAdmin'].contains(role)) {
        _setResult('⚠️ Signed in, but role "$role" may not be allowed to scan.');
      }
    } catch (e) {
      _setResult('Network error: $e');
    } finally {
      if (mounted) setState(() => _loggingIn = false);
    }
  }

  Future<void> _logout() async {
    await _storage.delete(key: 'gate_token');
    await _storage.delete(key: 'gate_user_name');
    await _storage.delete(key: 'gate_user_role');
    setState(() { _token = null; _userName = null; _userRole = null; });
    _setResult('Signed out');
  }

  void _startScan() {
    if (_token == null) { _setResult('Sign in first'); return; }
    setState(() => _scanning = true);
  }

  Future<void> _postGateScan(String qrPayload) async {
    setState(() { _scanning = false; _sending = true; _result = 'Sending…'; });
    try {
      final res = await http.post(
        Uri.parse('$_base/trips/gate/start-from-scan'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
        body: jsonEncode({'qrPayload': qrPayload}),
      );
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode.toString().startsWith('2')) {
        final num = body['requestNumber'] as String?;
        final state = body['state'] as String?;
        _setResult('✅ Trip started${num != null ? '\n$num' : ''}${state != null ? '\nstate: $state' : ''}');
      } else {
        final msg = body['message'];
        final text = msg is List ? (msg as List).join(', ') : msg?.toString() ?? res.body;
        _setResult('HTTP ${res.statusCode}\n$text');
      }
    } catch (e) {
      _setResult('Error: $e');
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _setResult(String msg) {
    if (mounted) setState(() => _result = msg);
  }

  @override
  Widget build(BuildContext context) {
    if (_scanning) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Scan Driver QR'),
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => setState(() => _scanning = false),
          ),
        ),
        body: MobileScanner(
          onDetect: (capture) {
            final barcode = capture.barcodes.firstOrNull;
            if (barcode?.rawValue != null) {
              _postGateScan(barcode!.rawValue!);
            }
          },
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Fleet Gate Scanner', style: TextStyle(fontWeight: FontWeight.w800)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFf0f9f4),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: kPrimary.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.qr_code_scanner, color: kPrimary, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Gate — Trip QR Scanner',
                            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: kPrimary)),
                        const SizedBox(height: 2),
                        Text(
                          _token != null
                              ? 'Signed in as ${_userName ?? '—'} (${_userRole ?? '—'})'
                              : 'Not signed in',
                          style: TextStyle(
                            fontSize: 12,
                            color: _token != null ? kPrimary : kTextMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            // API base
            const Text('API Base URL', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 6),
            TextField(
              controller: _apiCtrl,
              keyboardType: TextInputType.url,
              decoration: const InputDecoration(hintText: 'https://…/api/v1'),
            ),
            const SizedBox(height: 14),
            // Email
            const Text('Email', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 6),
            TextField(
              controller: _emailCtrl,
              keyboardType: TextInputType.emailAddress,
              autocorrect: false,
              decoration: const InputDecoration(hintText: 'gate@haramaya.edu.et'),
            ),
            const SizedBox(height: 14),
            // Password
            const Text('Password', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 6),
            TextField(
              controller: _passCtrl,
              obscureText: !_showPass,
              decoration: InputDecoration(
                hintText: '••••••••',
                suffixIcon: IconButton(
                  icon: Icon(_showPass ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: kTextMuted),
                  onPressed: () => setState(() => _showPass = !_showPass),
                ),
              ),
            ),
            const SizedBox(height: 14),
            // Auth buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _loggingIn ? null : _login,
                    child: _loggingIn
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Sign In'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: _token == null ? null : _logout,
                    child: const Text('Sign Out'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            // Scan button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: (_token == null || _sending) ? null : _startScan,
                icon: _sending
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.qr_code_scanner, size: 20),
                label: Text(_sending ? 'Sending…' : 'Scan Driver QR'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(56),
                  textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                ),
              ),
            ),
            const SizedBox(height: 20),
            // Result
            const Text('Result', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: kBorder),
              ),
              child: Text(
                _result,
                style: const TextStyle(fontFamily: 'monospace', fontSize: 13),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _apiCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }
}
