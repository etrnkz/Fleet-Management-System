import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_scanner/mobile_scanner.dart';
import '../core/storage.dart';
import '../core/theme.dart';
import 'login_screen.dart';

const _defaultBase = 'https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1';

class GateScreen extends StatefulWidget {
  const GateScreen({super.key});
  @override
  State<GateScreen> createState() => _GateScreenState();
}

class _GateScreenState extends State<GateScreen> {
  String? _token;
  String? _userName;
  String? _userRole;
  String? _base;
  String _result = '—';
  bool _scanning = false;
  bool _sending = false;
  List<Map<String, dynamic>> _scanHistory = [];

  @override
  void initState() {
    super.initState();
    _loadSaved();
  }

  Future<void> _loadSaved() async {
    final token = await Storage.getAccessToken();
    final user  = await Storage.getUser();
    final base  = await Storage.getApiBase() ?? _defaultBase;
    setState(() {
      _token    = token;
      _userName = user?['name'] as String?;
      _userRole = user?['role'] as String?;
      _base     = base;
    });
  }

  String get base => _base ?? _defaultBase;

  Future<void> _logout() async {
    await Storage.clearSession();
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (_) => false,
    );
  }

  void _startSmartScan() {
    if (_token == null) { _setResult('Not signed in'); return; }
    setState(() => _scanning = true);
  }

  String _getTimeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24)   return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  Future<void> _postGateScan(String qrPayload) async {
    setState(() { _scanning = false; _sending = true; _result = 'Sending…'; });
    try {
      final res = await http.post(
        Uri.parse('$base/trips/gate/start-from-scan'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
        body: jsonEncode({'qrPayload': qrPayload}),
      );
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode.toString().startsWith('2')) {
        final num   = body['requestNumber'] as String?;
        final state = body['state'] as String?;
        String message;
        if (state == 'IN_PROGRESS') {
          message = '✅ Trip Started\n${num ?? ''}\nVehicle has departed.';
        } else if (state == 'COMPLETED') {
          message = '✅ Trip Completed\n${num ?? ''}\nVehicle has returned.';
        } else {
          message = '✅ Success\n${num ?? ''}\nstate: ${state ?? '—'}';
        }
        _setResult(message);
      } else {
        final msg  = body['message'];
        final text = msg is List ? (msg as List).join(', ') : msg?.toString() ?? res.body;
        _setResult('HTTP ${res.statusCode}\n$text');
      }
    } catch (e) {
      _setResult('Error: $e');
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<Map<String, dynamic>?> _getTripFromQR(String qrPayload) async {
    try {
      String tripId;
      if (qrPayload.startsWith('{') && qrPayload.endsWith('}')) {
        final qrData = jsonDecode(qrPayload) as Map<String, dynamic>;
        tripId = qrData['tripId'] as String;
      } else if (qrPayload.startsWith('TRIP:')) {
        tripId = qrPayload.substring(5);
      } else {
        tripId = qrPayload.trim();
      }
      final res = await http.get(
        Uri.parse('$base/trips/$tripId'),
        headers: {
          'Authorization': 'Bearer $_token',
          'Content-Type': 'application/json',
        },
      );
      if (res.statusCode == 200) {
        return jsonDecode(res.body) as Map<String, dynamic>;
      }
    } catch (_) {}
    return null;
  }

  Future<void> _handleSmartScan(String qrPayload) async {
    setState(() { _scanning = false; _sending = true; _result = 'Checking trip…'; });
    try {
      final trip = await _getTripFromQR(qrPayload);
      if (trip == null) {
        _setResult('❌ Could not fetch trip information');
        return;
      }
      final state         = trip['state'] as String?;
      final requestNumber = trip['requestNumber'] as String?;

      if (state == 'READY') {
        _setResult('🚗 Departure scan for $requestNumber');
        await _postGateScan(qrPayload);
        _addToHistory(trip, 'DEPARTURE');
      } else if (state == 'PENDING_RETURN') {
        _setResult('🏁 Return scan for $requestNumber');
        await _postGateScan(qrPayload);
        _addToHistory(trip, 'RETURN');
      } else if (state == 'IN_PROGRESS') {
        _setResult('⚠️ Trip $requestNumber is IN PROGRESS\nNo scan needed until return.');
      } else if (state == 'COMPLETED') {
        _setResult('ℹ️ Trip $requestNumber is already COMPLETED');
      } else {
        _setResult('ℹ️ Trip $requestNumber\nState: $state\nNo action available.');
      }
    } catch (e) {
      _setResult('Error: $e');
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _addToHistory(Map<String, dynamic> trip, String action) {
    final entry = {
      ...trip,
      'scanAction': action,
      'scannedAt': DateTime.now().toIso8601String(),
    };
    setState(() {
      _scanHistory.insert(0, entry);
      if (_scanHistory.length > 50) _scanHistory = _scanHistory.sublist(0, 50);
    });
  }

  void _setResult(String msg) {
    if (mounted) setState(() => _result = msg);
  }

  Color get _resultColor {
    if (_result.startsWith('✅')) return const Color(0xFFf0fdf4);
    if (_result.startsWith('HTTP') || _result.startsWith('Error') || _result.startsWith('⚠️') || _result.startsWith('❌')) {
      return const Color(0xFFfef2f2);
    }
    return Colors.white;
  }

  Color get _resultBorderColor {
    if (_result.startsWith('✅')) return const Color(0xFF86efac);
    if (_result.startsWith('HTTP') || _result.startsWith('Error') || _result.startsWith('⚠️') || _result.startsWith('❌')) {
      return const Color(0xFFfca5a5);
    }
    return kBorder;
  }

  @override
  Widget build(BuildContext context) {
    // QR scanner overlay
    if (_scanning) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Scan QR Code'),
          backgroundColor: kPrimary,
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
              bottom: 40, left: 0, right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    color: kPrimary,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Text(
                    '📱 Smart scan — detects departure or return',
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
        title: const Text('Gate Scanner', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Sign out',
            onPressed: _logout,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            // User info banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFf0f9f4),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: kPrimary.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.qr_code_scanner, color: kPrimary, size: 26),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Gate — Trip QR Scanner',
                            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: kPrimary)),
                        const SizedBox(height: 2),
                        Text(
                          _userName != null
                              ? 'Signed in as $_userName (${_userRole ?? '—'})'
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

            // Scan button
            const Text('Gate Scanner', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
            const SizedBox(height: 4),
            const Text(
              'Smart QR scanning — automatically detects departure or return.',
              style: TextStyle(fontSize: 12, color: kTextSecondary),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: (_token == null || _sending) ? null : _startSmartScan,
                icon: _sending
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
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
              child: Text(_result,
                  style: const TextStyle(fontFamily: 'monospace', fontSize: 13)),
            ),
            const SizedBox(height: 20),

            // Scan history
            Row(
              children: [
                const Text('Recent Scans',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
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
                final destination   = entry['destination'] as String? ?? '';
                final vehiclePlate  = entry['allocatedVehicle']?['plateNumber'] as String? ?? '';
                final scanAction    = entry['scanAction'] as String? ?? '';
                final scannedAt     = DateTime.parse(entry['scannedAt'] as String);
                final timeAgo       = _getTimeAgo(scannedAt);
                final isDeparture   = scanAction == 'DEPARTURE';

                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDeparture
                        ? const Color(0xFFf0f9f4)
                        : const Color(0xFFfef3c7),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDeparture
                          ? kPrimary.withOpacity(0.3)
                          : const Color(0xFFf59e0b).withOpacity(0.3),
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
                            Text(requestNumber,
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                            Text('$vehiclePlate → $destination',
                                style: const TextStyle(fontSize: 11, color: kTextMuted)),
                            Text(timeAgo,
                                style: const TextStyle(
                                    fontSize: 10, color: kTextMuted, fontStyle: FontStyle.italic)),
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
                              color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList()),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }
}
