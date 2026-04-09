import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/fleet_service.dart';
import '../../widgets/toast.dart';

class HistoryTab extends StatefulWidget {
  final FleetService svc;
  final Map<String, dynamic>? user;
  const HistoryTab({super.key, required this.svc, required this.user});
  @override
  State<HistoryTab> createState() => _HistoryTabState();
}

class _HistoryTabState extends State<HistoryTab> with AutomaticKeepAliveClientMixin {
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
      final trips = await widget.svc.getCompletedTrips(widget.user!['id'] as String);
      if (mounted) setState(() => _trips = trips);
    } catch (e) {
      if (mounted) showToast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
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
                    Center(child: Icon(Icons.history, size: 56, color: kTextMuted)),
                    SizedBox(height: 12),
                    Center(child: Text('No completed trips yet', style: TextStyle(color: kTextMuted, fontSize: 15))),
                  ],
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _trips.length,
                  itemBuilder: (_, i) {
                    final trip = _trips[i];
                    final dist = trip['actualDistance'];
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
                                    color: const Color(0xFFF3F4F6),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Text('COMPLETED',
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: kTextSecondary)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(trip['destination'] as String? ?? '—',
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                            if ((trip['purpose'] as String?)?.isNotEmpty == true) ...[
                              const SizedBox(height: 4),
                              Text(trip['purpose'] as String,
                                  style: const TextStyle(fontSize: 13, color: kTextSecondary),
                                  maxLines: 2, overflow: TextOverflow.ellipsis),
                            ],
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.calendar_today_outlined, size: 13, color: kTextMuted),
                                const SizedBox(width: 4),
                                Text(_fmtDate(trip['startDateTime'] as String? ?? ''),
                                    style: const TextStyle(fontSize: 12, color: kTextMuted)),
                                const Spacer(),
                                if (dist != null)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: kPrimaryBg,
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.speed, size: 13, color: kPrimary),
                                        const SizedBox(width: 4),
                                        Text('${dist} km',
                                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: kPrimary)),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }

  String _fmtDate(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return iso.substring(0, 10);
    }
  }
}
