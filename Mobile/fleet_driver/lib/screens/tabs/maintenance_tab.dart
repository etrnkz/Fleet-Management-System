import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/fleet_service.dart';
import '../../widgets/toast.dart';

class MaintenanceTab extends StatefulWidget {
  final FleetService svc;
  final Map<String, dynamic>? user;
  const MaintenanceTab({super.key, required this.svc, required this.user});
  @override
  State<MaintenanceTab> createState() => _MaintenanceTabState();
}

class _MaintenanceTabState extends State<MaintenanceTab>
    with AutomaticKeepAliveClientMixin {
  Map<String, dynamic>? _vehicle;
  List<Map<String, dynamic>> _requests = [];
  bool _loading = true;
  bool _submitting = false;
  final _descCtrl = TextEditingController();
  String _priority = 'Medium';

  static const _priorities = ['Low', 'Medium', 'High', 'Critical'];
  static const _pColor = {
    'Low': Color(0xFF1B3D2F),
    'Medium': Color(0xFF2563EB),
    'High': Color(0xFFEA580C),
    'Critical': Color(0xFFDC2626),
  };
  static const _pBg = {
    'Low': Color(0xFFf0f9f4),
    'Medium': Color(0xFFEFF6FF),
    'High': Color(0xFFFFF7ED),
    'Critical': Color(0xFFFEF2F2),
  };

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (widget.user == null) return;
    setState(() => _loading = true);
    try {
      final v = await widget.svc.getAssignedVehicle(widget.user!['id'] as String);
      final r = await widget.svc.getMaintenance();
      if (mounted) setState(() { _vehicle = v; _requests = r; });
    } catch (e) {
      if (mounted) showToast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _submit() async {
    if (_vehicle == null) { showToast(context, 'No vehicle assigned', error: true); return; }
    final desc = _descCtrl.text.trim();
    if (desc.isEmpty) { showToast(context, 'Describe the issue', error: true); return; }
    setState(() => _submitting = true);
    try {
      await widget.svc.createMaintenance(
        vehicleId: _vehicle!['id'] as String,
        description: desc,
        priority: _priority,
      );
      _descCtrl.clear();
      setState(() => _priority = 'Medium');
      showToast(context, 'Maintenance request submitted');
      _load();
    } catch (e) {
      if (mounted) showToast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _submitting = false);
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
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Vehicle chip
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _vehicle != null ? kPrimaryBg : kBackground,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _vehicle != null ? kPrimary.withOpacity(0.2) : kBorder),
                  ),
                  child: _vehicle != null
                      ? Row(children: [
                          const Icon(Icons.directions_car, color: kPrimary, size: 20),
                          const SizedBox(width: 10),
                          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text('${_vehicle!['make'] ?? ''} ${_vehicle!['model'] ?? ''}',
                                style: const TextStyle(fontWeight: FontWeight.w800, color: kPrimary, fontSize: 15)),
                            Text(_vehicle!['plateNumber'] as String? ?? '',
                                style: const TextStyle(color: kPrimaryLight, fontSize: 13)),
                          ]),
                        ])
                      : const Text('No vehicle assigned', style: TextStyle(color: kTextMuted)),
                ),
                const SizedBox(height: 16),
                // Form card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Report an Issue',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 14),
                        const Text('Issue Description',
                            style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _descCtrl,
                          maxLines: 5,
                          decoration: const InputDecoration(hintText: 'Describe the vehicle issue…'),
                        ),
                        const SizedBox(height: 14),
                        const Text('Priority',
                            style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: _priorities.map((p) {
                            final sel = _priority == p;
                            return GestureDetector(
                              onTap: () => setState(() => _priority = p),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 150),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  color: sel ? _pBg[p] : kBackground,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: sel ? _pColor[p]! : kBorder,
                                    width: sel ? 1.5 : 1,
                                  ),
                                ),
                                child: Text(p,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: sel ? FontWeight.w700 : FontWeight.w400,
                                      color: sel ? _pColor[p] : kTextSecondary,
                                    )),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _submitting ? null : _submit,
                            icon: _submitting
                                ? const SizedBox(width: 16, height: 16,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Icon(Icons.send_outlined, size: 16),
                            label: const Text('Submit Report'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // History
                if (_requests.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  const Text('Previous Reports',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 8),
                  ..._requests.map((r) {
                    final p = r['priority'] as String? ?? 'Medium';
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: _pBg[p] ?? kBackground,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(p,
                                    style: TextStyle(
                                      fontSize: 11, fontWeight: FontWeight.w700,
                                      color: _pColor[p] ?? kTextSecondary,
                                    )),
                              ),
                              const Spacer(),
                              Text(_fmtDate(r['createdAt'] as String? ?? ''),
                                  style: const TextStyle(fontSize: 12, color: kTextMuted)),
                            ]),
                            const SizedBox(height: 8),
                            Text(r['issueDescription'] as String? ?? '',
                                style: const TextStyle(fontSize: 13, color: Color(0xFF374151))),
                            if (r['status'] != null) ...[
                              const SizedBox(height: 6),
                              Text('Status: ${r['status']}',
                                  style: const TextStyle(fontSize: 12, color: kTextMuted,
                                      fontStyle: FontStyle.italic)),
                            ],
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ],
            ),
    );
  }

  String _fmtDate(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return iso.length > 10 ? iso.substring(0, 10) : iso;
    }
  }
}
