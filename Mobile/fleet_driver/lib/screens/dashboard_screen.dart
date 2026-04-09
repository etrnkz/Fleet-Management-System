import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../core/storage.dart';
import '../services/fleet_service.dart';
import '../services/gps_service.dart';
import '../widgets/engine_shutdown_banner.dart';
import 'tabs/trips_tab.dart';
import 'tabs/active_tab.dart';
import 'tabs/history_tab.dart';
import 'tabs/maintenance_tab.dart';
import 'tabs/profile_tab.dart';
import 'login_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  late FleetService _svc;
  late GpsService _gps;
  bool _ready = false;
  Map<String, dynamic>? _user;
  String? _activeTripId;
  GpsStatus _gpsStatus = const GpsStatus();
  int _unread = 0;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 5, vsync: this);
    _init();
  }

  Future<void> _init() async {
    _svc = await FleetService.create();
    _gps = GpsService(_svc);
    _gps.statusStream.listen((s) {
      if (mounted) setState(() => _gpsStatus = s);
    });
    final user = await Storage.getUser();
    setState(() {
      _user = user;
      _ready = true;
    });
    _pollActiveTrip();
    _loadUnread();
  }

  Future<void> _pollActiveTrip() async {
    if (_user == null) return;
    try {
      final trips = await _svc.getActiveTrips(_user!['id'] as String);
      final tripId = trips.isNotEmpty ? trips.first['id'] as String : null;
      if (tripId != _activeTripId) {
        setState(() => _activeTripId = tripId);
        if (tripId != null) {
          await _gps.start(tripId);
        } else {
          await _gps.stop();
        }
      }
    } catch (_) {}
    // Poll every 30s
    Future.delayed(const Duration(seconds: 30), () {
      if (mounted) _pollActiveTrip();
    });
  }

  Future<void> _loadUnread() async {
    try {
      final notifs = await _svc.getNotifications();
      if (mounted) {
        setState(() => _unread = notifs.where((n) => n['isRead'] == false).length);
      }
    } catch (_) {}
  }

  void _logout() async {
    await _gps.stop();
    await Storage.clearSession();
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) {
      return const Scaffold(
        backgroundColor: kPrimary,
        body: Center(child: CircularProgressIndicator(color: Colors.white)),
      );
    }

    final isShutdown = _gpsStatus.geofenceStatus == GeofenceStatus.shutdown;
    final isWarning = _gpsStatus.geofenceStatus == GeofenceStatus.warning;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Fleet Driver', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          // GPS status chip
          if (_activeTripId != null)
            Padding(
              padding: const EdgeInsets.only(right: 4),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: isShutdown
                        ? Colors.red.shade700
                        : isWarning
                            ? Colors.orange.shade700
                            : Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isShutdown ? Icons.warning_rounded : Icons.gps_fixed,
                        color: Colors.white,
                        size: 13,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        isShutdown
                            ? 'Restricted'
                            : isWarning
                                ? 'Warning'
                                : _gpsStatus.currentSpeed != null
                                    ? '${_gpsStatus.currentSpeed!.toStringAsFixed(0)} km/h'
                                    : 'GPS Live',
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          // Notifications bell
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined),
                onPressed: () {
                  _tabCtrl.animateTo(4); // profile tab has notifications
                },
              ),
              if (_unread > 0)
                Positioned(
                  right: 8, top: 8,
                  child: Container(
                    width: 16, height: 16,
                    decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    child: Center(
                      child: Text(
                        _unread > 9 ? '9+' : '$_unread',
                        style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
        bottom: TabBar(
          controller: _tabCtrl,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: const [
            Tab(text: 'Trips', icon: Icon(Icons.assignment_outlined, size: 18)),
            Tab(text: 'Active', icon: Icon(Icons.navigation_outlined, size: 18)),
            Tab(text: 'History', icon: Icon(Icons.history, size: 18)),
            Tab(text: 'Maintenance', icon: Icon(Icons.build_outlined, size: 18)),
            Tab(text: 'Profile', icon: Icon(Icons.person_outline, size: 18)),
          ],
        ),
      ),
      body: Column(
        children: [
          // Engine shutdown banner
          if (isShutdown)
            EngineShutdownBanner(zoneName: _gpsStatus.violationZoneName),
          // Warning banner
          if (isWarning && !isShutdown)
            Container(
              width: double.infinity,
              color: const Color(0xFFFFF9C4),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: Color(0xFF7B5800), size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '⚠️  Approaching restricted zone${_gpsStatus.violationZoneName != null ? ': ${_gpsStatus.violationZoneName}' : ''}',
                      style: const TextStyle(color: Color(0xFF7B5800), fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          Expanded(
            child: TabBarView(
              controller: _tabCtrl,
              children: [
                TripsTab(svc: _svc, user: _user),
                ActiveTab(svc: _svc, user: _user, gpsStatus: _gpsStatus, activeTripId: _activeTripId),
                HistoryTab(svc: _svc, user: _user),
                MaintenanceTab(svc: _svc, user: _user),
                ProfileTab(svc: _svc, user: _user, onLogout: _logout, onNotificationsRead: _loadUnread),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    _gps.dispose();
    super.dispose();
  }
}
