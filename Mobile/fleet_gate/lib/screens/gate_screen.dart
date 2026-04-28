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
  bool _loadingTrips = false;
  List<Map<String, dynamic>> _activeTrips = [];
  List<Map<String, dynamic>> _scanHistory = [];
  bool _showingHistory = false;

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

  void _startSmartScan() {
    if (_token == null) { _setResult('Sign in first'); return; }
    setState(() { _scanning = true; });
  }

  String _getTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
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

        String message;
        if (state == 'IN_PROGRESS') {
          message = '✅ Trip Started\n${num ?? ''}\nVehicle has departed.';
        } else if (state == 'COMPLETED') {
          message = '✅ Trip Completed\n${num ?? ''}\nVehicle has returned. Trip fully closed.';
        } else {
          message = '✅ Success\n${num ?? ''}\nstate: ${state ?? '—'}';
        }
        _setResult(message);
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

  // Check trip state from QR code to determine appropriate action
  Future<Map<String, dynamic>?> _getTripFromQR(String qrPayload) async {
    try {
      String tripId;
      
      // Handle different QR code formats
      if (qrPayload.startsWith('{') && qrPayload.endsWith('}')) {
        // JSON format: {"tripId":"uuid","requestNumber":"TR-xxx",...}
        final qrData = jsonDecode(qrPayload) as Map<String, dynamic>;
        tripId = qrData['tripId'] as String;
        print('🔍 Parsed JSON QR: ${qrData['requestNumber']} (${qrData['action']})');
      } else if (qrPayload.startsWith('TRIP:')) {
        // Legacy format: "TRIP:uuid"
        tripId = qrPayload.substring(5);
      } else {
        // Plain UUID format
        tripId = qrPayload.trim();
      }

      print('🔍 Fetching trip details for ID: $tripId');

      final res = await http.get(
        Uri.parse('$_base/trips/$tripId'),
        headers: {
          'Authorization': 'Bearer $_token',
          'Content-Type': 'application/json',
        },
      );

      print('📡 Trip fetch response: ${res.statusCode}');
      
      if (res.statusCode == 200) {
        final trip = jsonDecode(res.body) as Map<String, dynamic>;
        print('✅ Trip fetched: ${trip['requestNumber']} - ${trip['state']}');
        return trip;
      } else {
        print('❌ Trip fetch failed: ${res.statusCode} - ${res.body}');
      }
    } catch (e) {
      print('❌ Error fetching trip: $e');
    }
    return null;
  }

  Future<void> _handleSmartScan(String qrPayload) async {
    setState(() { _scanning = false; _sending = true; _result = 'Checking trip state…'; });
    
    try {
      final trip = await _getTripFromQR(qrPayload);
      if (trip == null) {
        _setResult('❌ Could not fetch trip information');
        return;
      }

      final state = trip['state'] as String?;
      final requestNumber = trip['requestNumber'] as String?;

      if (state == 'READY') {
        // Trip is ready for departure
        _setResult('🚗 Departure scan for $requestNumber');
        await _postGateScan(qrPayload);
        _addToHistory(trip, 'DEPARTURE');
      } else if (state == 'PENDING_RETURN') {
        // Trip is waiting for return scan
        _setResult('🏁 Return scan for $requestNumber');
        await _postGateScan(qrPayload);
        _addToHistory(trip, 'RETURN');
      } else if (state == 'IN_PROGRESS') {
        // Trip is in progress - no scan needed
        _setResult('⚠️ Trip $requestNumber is IN PROGRESS\nVehicle is traveling. No scan needed until return.');
      } else if (state == 'COMPLETED') {
        // Trip already completed
        _setResult('ℹ️ Trip $requestNumber is already COMPLETED');
      } else {
        // Other states
        _setResult('ℹ️ Trip $requestNumber\nState: $state\nNo scan action available for this state.');
      }
    } catch (e) {
      _setResult('Error: $e');
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _addToHistory(Map<String, dynamic> trip, String action) {
    final historyEntry = {
      ...trip,
      'scanAction': action,
      'scannedAt': DateTime.now().toIso8601String(),
    };
    setState(() {
      _scanHistory.insert(0, historyEntry); // Add to beginning
      if (_scanHistory.length > 50) {
        _scanHistory = _scanHistory.sublist(0, 50); // Keep only last 50
      }
    });
  }

  void _setResult(String msg) {
    if (mounted) setState(() => _result = msg);
  }

  Color get _resultColor {
    if (_result.startsWith('✅')) return const Color(0xFFf0fdf4);
    if (_result.startsWith('HTTP') || _result.startsWith('Error') || _result.startsWith('⚠️')) {
      return const Color(0xFFfef2f2);
    }
    return Colors.white;
  }

  Color get _resultBorderColor {
    if (_result.startsWith('✅')) return const Color(0xFF86efac);
    if (_result.startsWith('HTTP') || _result.startsWith('Error') || _result.startsWith('⚠️')) {
      return const Color(0xFFfca5a5);
    }
    return kBorder;
  }

  @override
  Widget build(BuildContext context) {
    if (_scanning) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Smart QR Scanner'),
          backgroundColor: const Color(0xFF059669), // Green for smart scan
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => setState(() => _scanning = false),
          ),
        ),
        body: Stack(
          children: [
            MobileScanner(
              onDetect: (capture) {
                final barcode = capture.barcodes.firstOrNull;
                if (barcode?.rawValue != null) {
                  _handleSmartScan(barcode!.rawValue!);
                }
              },
            ),
            Positioned(
              bottom: 40,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF059669), // Green for smart scan
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Text(
                    '📱 Scan QR - Smart detection (departure/return)',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ),
          ],
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

            // ── Scan History ──────────────────────────────────
            Row(
              children: [
                const Text('Recent Scans', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                const Spacer(),
                if (_scanHistory.isNotEmpty)
                  TextButton(
                    onPressed: () => setState(() => _scanHistory.clear()),
                    child: const Text('Clear', style: TextStyle(fontSize: 12)),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            
            if (_scanHistory.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: const Center(
                  child: Text(
                    'No scans yet.\nScan QR codes to see history here.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: kTextMuted, fontSize: 12),
                  ),
                ),
              )
            else
              ...(_scanHistory.map((entry) {
                final requestNumber = entry['requestNumber'] as String? ?? '';
                final destination = entry['destination'] as String? ?? '';
                final vehiclePlate = entry['allocatedVehicle']?['plateNumber'] as String? ?? '';
                final scanAction = entry['scanAction'] as String? ?? '';
                final scannedAt = DateTime.parse(entry['scannedAt'] as String);
                final timeAgo = _getTimeAgo(scannedAt);
                
                final isDeparture = scanAction == 'DEPARTURE';
                
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDeparture ? const Color(0xFFf0f9f4) : const Color(0xFFfef3c7),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDeparture ? kPrimary.withOpacity(0.3) : const Color(0xFFf59e0b).withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        isDeparture ? Icons.directions_car : Icons.flag,
                        color: isDeparture ? kPrimary : const Color(0xFFf59e0b),
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              requestNumber,
                              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                            ),
                            Text(
                              '$vehiclePlate → $destination',
                              style: const TextStyle(fontSize: 11, color: kTextMuted),
                            ),
                            Text(
                              timeAgo,
                              style: const TextStyle(fontSize: 10, color: kTextMuted, fontStyle: FontStyle.italic),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: isDeparture ? kPrimary : const Color(0xFFf59e0b),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          scanAction,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList()),

            const SizedBox(height: 20),

            // ── Gate QR Scanner ──────────────────────────────────────────────
            const Text('Gate Scanner', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
            const SizedBox(height: 4),
            const Text(
              'Smart QR scanning - automatically detects departure or return based on trip state.',
              style: TextStyle(fontSize: 12, color: kTextSecondary),
            ),
            const SizedBox(height: 12),

            // Single smart scan button - always available (gate's job to scan)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: (_token == null || _sending) ? null : () => _startSmartScan(),
                icon: _sending
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.qr_code_scanner, size: 20),
                label: const Text('📱  Scan QR Code'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: kPrimary,
                  minimumSize: const Size.fromHeight(56),
                  textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
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
                color: _resultColor,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: _resultBorderColor),
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
