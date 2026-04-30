import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/fleet_service.dart';
import '../../widgets/toast.dart';

class ProfileTab extends StatefulWidget {
  final FleetService svc;
  final Map<String, dynamic>? user;
  final VoidCallback onLogout;
  final VoidCallback onNotificationsRead;
  const ProfileTab({
    super.key,
    required this.svc,
    required this.user,
    required this.onLogout,
    required this.onNotificationsRead,
  });
  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> with AutomaticKeepAliveClientMixin {
  int _tab = 0; // 0=profile 1=vehicle 2=notifications 3=password
  Map<String, dynamic>? _userData;
  Map<String, dynamic>? _vehicle;
  List<Map<String, dynamic>> _notifs = [];
  bool _loading = true;

  // Profile form
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _licenseCtrl = TextEditingController();
  final _expiryCtrl = TextEditingController();
  final _expYearsCtrl = TextEditingController();
  bool _savingProfile = false;

  // Password form
  final _curPwCtrl = TextEditingController();
  final _newPwCtrl = TextEditingController();
  final _confPwCtrl = TextEditingController();
  bool _savingPw = false;
  bool _showCurPw = false;
  bool _showNewPw = false;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    for (final c in [_nameCtrl, _phoneCtrl, _licenseCtrl, _expiryCtrl, _expYearsCtrl,
        _curPwCtrl, _newPwCtrl, _confPwCtrl]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        widget.svc.getMe(),
        widget.svc.getAssignedVehicle(widget.user?['id'] as String? ?? ''),
        widget.svc.getNotifications(),
      ]);
      final user = results[0] as Map<String, dynamic>;
      if (mounted) {
        setState(() {
          _userData = user;
          _vehicle = results[1] as Map<String, dynamic>?;
          _notifs = results[2] as List<Map<String, dynamic>>;
          _nameCtrl.text = user['name'] as String? ?? '';
          _phoneCtrl.text = user['phoneNumber'] as String? ?? '';
        });
      }
    } catch (e) {
      if (mounted) showToast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _saveProfile() async {
    setState(() => _savingProfile = true);
    try {
      await widget.svc.updateProfile(_nameCtrl.text.trim(), _phoneCtrl.text.trim());
      if (_licenseCtrl.text.isNotEmpty && _expiryCtrl.text.isNotEmpty) {
        await widget.svc.updateDriverProfile(
          licenseNumber: _licenseCtrl.text.trim(),
          licenseExpiry: _expiryCtrl.text.trim(),
          experienceYears: int.tryParse(_expYearsCtrl.text) ?? 0,
        );
      }
      if (mounted) showToast(context, 'Profile updated');
    } catch (e) {
      if (mounted) showToast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _savingProfile = false);
    }
  }

  Future<void> _changePw() async {
    if (_newPwCtrl.text != _confPwCtrl.text) {
      showToast(context, 'Passwords do not match', error: true);
      return;
    }
    if (_newPwCtrl.text.length < 8) {
      showToast(context, 'Minimum 8 characters', error: true);
      return;
    }
    setState(() => _savingPw = true);
    try {
      await widget.svc.changePassword(_curPwCtrl.text, _newPwCtrl.text);
      _curPwCtrl.clear(); _newPwCtrl.clear(); _confPwCtrl.clear();
      if (mounted) showToast(context, 'Password changed');
    } catch (e) {
      if (mounted) showToast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _savingPw = false);
    }
  }

  Future<void> _markAllRead() async {
    await widget.svc.markAllNotificationsRead().catchError((_) {});
    setState(() { for (final n in _notifs) n['isRead'] = true; });
    widget.onNotificationsRead();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    if (_loading) return const Center(child: CircularProgressIndicator(color: kPrimary));

    final name = _userData?['name'] as String? ?? 'Driver';
    final email = _userData?['email'] as String? ?? '';
    final initials = name.split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase();
    final unread = _notifs.where((n) => n['isRead'] == false).length;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: kPrimaryBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: kPrimary.withOpacity(0.15)),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: kPrimary,
                child: Text(initials, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                    Text(email, style: const TextStyle(fontSize: 12, color: kTextSecondary)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: kPrimary.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
                      child: const Text('Driver', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: kPrimary)),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.logout, color: kError),
                onPressed: () => showDialog(
                  context: context,
                  builder: (_) => AlertDialog(
                    title: const Text('Sign Out'),
                    content: const Text('Are you sure you want to sign out?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: kError),
                        onPressed: () { Navigator.pop(context); widget.onLogout(); },
                        child: const Text('Sign Out'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Sub-tabs
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _SubTab(label: 'Profile', icon: Icons.person_outline, selected: _tab == 0, onTap: () => setState(() => _tab = 0)),
              _SubTab(label: 'Vehicle', icon: Icons.directions_car_outlined, selected: _tab == 1, onTap: () => setState(() => _tab = 1)),
              _SubTab(
                label: 'Notifications${unread > 0 ? ' ($unread)' : ''}',
                icon: Icons.notifications_outlined,
                selected: _tab == 2,
                onTap: () => setState(() => _tab = 2),
              ),
              _SubTab(label: 'Password', icon: Icons.lock_outline, selected: _tab == 3, onTap: () => setState(() => _tab = 3)),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Content
        if (_tab == 0) _buildProfileForm(),
        if (_tab == 1) _buildVehicle(),
        if (_tab == 2) _buildNotifications(),
        if (_tab == 3) _buildPasswordForm(),
      ],
    );
  }

  Widget _buildProfileForm() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Personal Info', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
            const SizedBox(height: 14),
            _Field(label: 'Full Name', ctrl: _nameCtrl, hint: 'Your name'),
            _Field(label: 'Phone Number', ctrl: _phoneCtrl, hint: '+251...', keyboard: TextInputType.phone),
            _Field(label: 'License Number', ctrl: _licenseCtrl, hint: 'DL-XXXXXXXX'),
            _Field(label: 'License Expiry', ctrl: _expiryCtrl, hint: 'YYYY-MM-DD'),
            _Field(label: 'Experience (years)', ctrl: _expYearsCtrl, hint: '0', keyboard: TextInputType.number),
            const SizedBox(height: 4),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _savingProfile ? null : _saveProfile,
                child: _savingProfile
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Save Changes'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVehicle() {
    if (_vehicle == null) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Center(child: Text('No vehicle assigned', style: TextStyle(color: kTextMuted))),
        ),
      );
    }
    final fields = [
      ['Make', _vehicle!['make']], ['Model', _vehicle!['model']],
      ['Plate', _vehicle!['plateNumber']], ['Year', _vehicle!['year']],
      ['Fuel', _vehicle!['fuelType']], ['Capacity', _vehicle!['capacity']],
      ['Color', _vehicle!['color']], ['Status', _vehicle!['status']],
      ['Mileage', _vehicle!['mileage'] != null ? '${_vehicle!['mileage']} km' : null],
    ];
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Assigned Vehicle', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
            const SizedBox(height: 12),
            ...fields.map((f) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                children: [
                  Text(f[0] as String, style: const TextStyle(fontSize: 12, color: kTextMuted)),
                  const Spacer(),
                  Text(f[1]?.toString() ?? '—', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildNotifications() {
    final unread = _notifs.where((n) => n['isRead'] == false).length;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text('Notifications', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                const Spacer(),
                if (unread > 0)
                  TextButton(onPressed: _markAllRead, child: const Text('Mark all read')),
              ],
            ),
            if (_notifs.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(child: Text('No notifications', style: TextStyle(color: kTextMuted))),
              )
            else
              ..._notifs.map((n) {
                final isUnread = n['isRead'] == false;
                return GestureDetector(
                  onTap: () async {
                    await widget.svc.markNotificationRead(n['id'] as String).catchError((_) {});
                    setState(() => n['isRead'] = true);
                    widget.onNotificationsRead();
                  },
                  child: Container(
                    margin: const EdgeInsets.only(top: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isUnread ? const Color(0xFFEFF6FF) : Colors.transparent,
                      borderRadius: BorderRadius.circular(8),
                      border: isUnread
                          ? const Border(left: BorderSide(color: kPrimary, width: 3))
                          : Border.all(color: kBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(n['title'] as String? ?? n['type'] as String? ?? '',
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                        const SizedBox(height: 3),
                        Text(n['message'] as String? ?? '',
                            style: const TextStyle(fontSize: 12, color: kTextSecondary),
                            maxLines: 2, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 4),
                        Text(_fmtDate(n['sentAt'] as String? ?? n['createdAt'] as String? ?? ''),
                            style: const TextStyle(fontSize: 11, color: kTextMuted)),
                      ],
                    ),
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }

  Widget _buildPasswordForm() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Change Password', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
            const SizedBox(height: 14),
            _PwField(label: 'Current Password', ctrl: _curPwCtrl, show: _showCurPw, onToggle: () => setState(() => _showCurPw = !_showCurPw)),
            _PwField(label: 'New Password', ctrl: _newPwCtrl, show: _showNewPw, onToggle: () => setState(() => _showNewPw = !_showNewPw)),
            _PwField(label: 'Confirm New Password', ctrl: _confPwCtrl, show: _showNewPw, onToggle: () => setState(() => _showNewPw = !_showNewPw)),
            const SizedBox(height: 4),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _savingPw ? null : _changePw,
                child: _savingPw
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Change Password'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _fmtDate(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return '${dt.day}/${dt.month}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return iso.length > 16 ? iso.substring(0, 16) : iso;
    }
  }
}

class _SubTab extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  const _SubTab({required this.label, required this.icon, required this.selected, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? kPrimaryBg : kBackground,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: selected ? kPrimary : kBorder),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: selected ? kPrimary : kTextMuted),
            const SizedBox(width: 5),
            Text(label, style: TextStyle(fontSize: 12, fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
                color: selected ? kPrimary : kTextMuted)),
          ],
        ),
      ),
    );
  }
}

class _Field extends StatelessWidget {
  final String label;
  final TextEditingController ctrl;
  final String hint;
  final TextInputType keyboard;
  const _Field({required this.label, required this.ctrl, required this.hint, this.keyboard = TextInputType.text});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          const SizedBox(height: 6),
          TextField(controller: ctrl, keyboardType: keyboard, decoration: InputDecoration(hintText: hint)),
        ],
      ),
    );
  }
}

class _PwField extends StatelessWidget {
  final String label;
  final TextEditingController ctrl;
  final bool show;
  final VoidCallback onToggle;
  const _PwField({required this.label, required this.ctrl, required this.show, required this.onToggle});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          const SizedBox(height: 6),
          TextField(
            controller: ctrl,
            obscureText: !show,
            decoration: InputDecoration(
              hintText: '••••••••',
              suffixIcon: IconButton(
                icon: Icon(show ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: kTextMuted),
                onPressed: onToggle,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
