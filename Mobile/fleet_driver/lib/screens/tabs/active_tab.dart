import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../core/theme.dart';
import '../../services/fleet_service.dart';
import '../../services/gps_service.dart';
import '../../widgets/toast.dart';

class ActiveTab extends StatefulWidget {
  final FleetService svc;
  final Map<String, dynamic>? user;
  final GpsStatus gpsStatus;
  final String? activeTripId;
  const ActiveTab({
    super.key,
    required this.svc,
    required this.user,
    required this.gpsStatus,
    required this.activeTripId,
  });
  @override
  State<ActiveTab> createState() => _ActiveTabState();
}

class _ActiveTabState extends State<ActiveTab> with AutomaticKeepAliveClientMixin {
  List<Map<String, dynamic>> _trips = [];
  bool _loading = true;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(ActiveTab old) {
    super.didUpdateWidget(old);
    if (old.activeTripId != widget.activeTripId) _load();
  }

  Future<void> _load() async {
    if (widget.user == null) return;
    setState(() => _loading = true);
    try {
      final trips = await widget.svc.getActiveTrips(widget.user!['id'] as String);
      if (mounted) setState(() => _trips = trips);
    } catch (e) {
      if (mounted) showToast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showQr(Map<String, dynamic> trip) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Trip QR Code', style: TextStyle(fontWeight: FontWeight.w800)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: kBackground, borderRadius: BorderRadius.circular(12)),
              child: QrImageView(data: trip['id'] as String, size: 200, backgroundColor: Colors.white),
            ),
            const SizedBox(height: 12),
            Text(trip['destination'] as String? ?? '', style: const TextStyle(fontWeight: FontWeight.w700)),
          ],
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close'))],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final gps = widget.gpsStatus;
    final isShutdown = gps.geofenceStatus == GeofenceStatus.shutdown;

    return RefreshIndicator(
      color: kPrimary,
      onRefresh: _load,
      child: _loading
          ? const Center(child: CircularProgressIndicator(color: kPrimary))
          : _trips.isEmpty
              ? ListView(
                  children: const [
                    SizedBox(height: 80),
                    Center(child: Icon(Icons.navigation_outlined, size: 56, color: kTextMuted)),
                    SizedBox(height: 12),
                    Center(child: Text('No active trip', style: TextStyle(color: kTextMuted, fontSize: 15))),
                    SizedBox(height: 6),
                    Center(child: Text('Your in-progress trip will appear here',
                        style: TextStyle(color: kTextMuted, fontSize: 13))),
                  ],
                )
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    for (final trip in _trips) ...[
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Status row
                              Row(
                                children: [
                                  Container(
                                    width: 10, height: 10,
                                    decoration: BoxDecoration(
                                      color: isShutdown ? kError : const Color(0xFF16A34A),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    isShutdown ? 'RESTRICTED ZONE' : 'IN PROGRESS',
                                    style: TextStyle(
                                      fontSize: 12, fontWeight: FontWeight.w800,
                                      color: isShutdown ? kError : const Color(0xFF16A34A),
                                    ),
                                  ),
                                  const Spacer(),
                                  Text(
                                    trip['requestNumber'] as String? ?? (trip['id'] as String).substring(0, 8),
                                    style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: kTextMuted),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Text(trip['destination'] as String? ?? '—',
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                              if ((trip['purpose'] as String?)?.isNotEmpty == true) ...[
                                const SizedBox(height: 4),
                                Text(trip['purpose'] as String,
                                    style: const TextStyle(fontSize: 13, color: kTextSecondary),
                                    maxLines: 3, overflow: TextOverflow.ellipsis),
                              ],
                              const SizedBox(height: 12),
                              // Stats grid
                              Row(
                                children: [
                                  _StatBox(label: 'Passengers', value: '${trip['passengerCount'] ?? '—'}'),
                                  const SizedBox(width: 8),
                                  _StatBox(
                                    label: 'Speed',
                                    value: gps.currentSpeed != null
                                        ? '${gps.currentSpeed!.toStringAsFixed(0)} km/h'
                                        : '— km/h',
                                  ),
                                  const SizedBox(width: 8),
                                  _StatBox(
                                    label: 'Last GPS',
                                    value: gps.lastPostedAt != null
                                        ? '${gps.lastPostedAt!.hour.toString().padLeft(2, '0')}:${gps.lastPostedAt!.minute.toString().padLeft(2, '0')}:${gps.lastPostedAt!.second.toString().padLeft(2, '0')}'
                                        : '—',
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              // GPS status line
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: isShutdown ? kErrorBg : kPrimaryBg,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      isShutdown ? Icons.warning_rounded : Icons.gps_fixed,
                                      size: 14,
                                      color: isShutdown ? kError : kPrimary,
                                    ),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: Text(
                                        isShutdown
                                            ? 'Restricted zone${gps.violationZoneName != null ? ': ${gps.violationZoneName}' : ''}'
                                            : gps.active
                                                ? 'GPS live${gps.lastPostedAt != null ? ' · last ping ${gps.lastPostedAt!.hour.toString().padLeft(2, '0')}:${gps.lastPostedAt!.minute.toString().padLeft(2, '0')}' : ''}'
                                                : 'GPS initialising…',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: isShutdown ? kError : kPrimary,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              if (gps.lastError != null) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFFBEB),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(gps.lastError!,
                                      style: const TextStyle(fontSize: 12, color: Color(0xFFD97706))),
                                ),
                              ],
                              const SizedBox(height: 12),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  onPressed: () => _showQr(trip),
                                  icon: const Icon(Icons.qr_code, size: 18),
                                  label: const Text('Show QR Code'),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
    );
  }
}

class _StatBox extends StatelessWidget {
  final String label;
  final String value;
  const _StatBox({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: kBackground, borderRadius: BorderRadius.circular(8)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 11, color: kTextMuted)),
            const SizedBox(height: 3),
            Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}
