import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/fleet_service.dart';
import '../../widgets/toast.dart';
import '../../widgets/qr_dialog.dart';

class TripsTab extends StatefulWidget {
  final FleetService svc;
  final Map<String, dynamic>? user;
  const TripsTab({super.key, required this.svc, required this.user});
  @override
  State<TripsTab> createState() => _TripsTabState();
}

class _TripsTabState extends State<TripsTab> with AutomaticKeepAliveClientMixin {
  List<Map<String, dynamic>> _trips = [];
  bool _loading = true;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (widget.user == null) return;
    setState(() => _loading = true);
    try {
      final trips = await widget.svc.getAssignedTrips(widget.user!['id'] as String);
      if (mounted) setState(() => _trips = trips);
    } catch (e) {
      if (mounted) showToast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showQr(Map<String, dynamic> trip) {
    showQrDialog(
      context,
      data: trip['id'] as String,
      title: 'Trip QR Code',
      subtitle: trip['destination'] as String? ?? '',
      caption: trip['requestNumber'] as String? ?? (trip['id'] as String).substring(0, 8),
    );
  }

  void _showReject(Map<String, dynamic> trip) {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Reject Assignment', style: TextStyle(fontWeight: FontWeight.w800)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(trip['destination'] as String? ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            TextField(
              controller: ctrl,
              maxLines: 3,
              decoration: const InputDecoration(hintText: 'Reason for rejection…'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: kError),
            onPressed: () async {
              final reason = ctrl.text.trim();
              if (reason.isEmpty) return;
              Navigator.pop(context);
              try {
                await widget.svc.rejectAssignment(trip['id'] as String, reason);
                if (mounted) showToast(context, 'Assignment rejected');
                _load();
              } catch (e) {
                if (mounted) showToast(context, e.toString(), error: true);
              }
            },
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return RefreshIndicator(
      color: kPrimary,
      onRefresh: _load,
      child: _loading
          ? const Center(child: CircularProgressIndicator(color: kPrimary))
          : _trips.isEmpty
              ? ListView(
                  children: const [
                    SizedBox(height: 80),
                    Center(child: Icon(Icons.assignment_outlined, size: 56, color: kTextMuted)),
                    SizedBox(height: 12),
                    Center(child: Text('No assigned trips', style: TextStyle(color: kTextMuted, fontSize: 15))),
                  ],
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _trips.length,
                  itemBuilder: (_, i) => _TripCard(
                    trip: _trips[i],
                    onQr: () => _showQr(_trips[i]),
                    onReject: () => _showReject(_trips[i]),
                  ),
                ),
    );
  }
}

class _TripCard extends StatelessWidget {
  final Map<String, dynamic> trip;
  final VoidCallback onQr;
  final VoidCallback onReject;
  const _TripCard({required this.trip, required this.onQr, required this.onReject});

  @override
  Widget build(BuildContext context) {
    final state = trip['state'] as String? ?? '';
    final isReady = state == 'READY';
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  trip['requestNumber'] as String? ?? (trip['id'] as String).substring(0, 8),
                  style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: kTextMuted),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: isReady ? kPrimaryBg : const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(state,
                      style: TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w700,
                        color: isReady ? kPrimary : const Color(0xFF2563EB),
                      )),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(trip['destination'] as String? ?? '—',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            if ((trip['purpose'] as String?)?.isNotEmpty == true) ...[
              const SizedBox(height: 4),
              Text(trip['purpose'] as String,
                  style: const TextStyle(fontSize: 13, color: kTextSecondary),
                  maxLines: 2, overflow: TextOverflow.ellipsis),
            ],
            if (trip['startDateTime'] != null) ...[
              const SizedBox(height: 6),
              Row(children: [
                const Icon(Icons.calendar_today_outlined, size: 13, color: kTextMuted),
                const SizedBox(width: 4),
                Text(_fmt(trip['startDateTime'] as String),
                    style: const TextStyle(fontSize: 12, color: kTextMuted)),
              ]),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                // Only show QR code button if trip is not IN_PROGRESS
                if (trip['state'] != 'IN_PROGRESS') ...[
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: onQr,
                      icon: const Icon(Icons.qr_code, size: 16),
                      label: const Text('QR Code'),
                      style: ElevatedButton.styleFrom(minimumSize: const Size(0, 40)),
                    ),
                  ),
                  const SizedBox(width: 10),
                ],
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onReject,
                    icon: const Icon(Icons.close, size: 16, color: kError),
                    label: const Text('Reject', style: TextStyle(color: kError)),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(0, 40),
                      side: const BorderSide(color: Color(0xFFFCA5A5)),
                    ),
                  ),
                ),
              ],
            ),
            // Show info message when trip is IN_PROGRESS
            if (trip['state'] == 'IN_PROGRESS') ...[
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFf0f9f4),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: kPrimary.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.navigation, color: kPrimary, size: 14),
                    const SizedBox(width: 6),
                    const Expanded(
                      child: Text(
                        'Trip in progress - Vehicle is traveling',
                        style: TextStyle(fontSize: 11, color: kTextSecondary),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _fmt(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return '${dt.day}/${dt.month}/${dt.year}  ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return iso.substring(0, 16);
    }
  }
}
