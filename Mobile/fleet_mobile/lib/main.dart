import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'core/storage.dart';
import 'screens/landing_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/gate_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FleetMobileApp());
}

class FleetMobileApp extends StatelessWidget {
  const FleetMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fleet Mobile',
      theme: appTheme,
      debugShowCheckedModeBanner: false,
      home: const _Splash(),
    );
  }
}

/// Checks for an existing session.
/// - If logged in  → routes directly to the correct dashboard (no landing shown).
/// - If not logged in → shows the landing screen.
class _Splash extends StatefulWidget {
  const _Splash();
  @override
  State<_Splash> createState() => _SplashState();
}

class _SplashState extends State<_Splash> {
  @override
  void initState() {
    super.initState();
    _check();
  }

  Future<void> _check() async {
    // Small delay so the splash bg renders before we navigate
    await Future.delayed(const Duration(milliseconds: 300));
    if (!mounted) return;

    try {
      final token = await Storage.getAccessToken();
      if (!mounted) return;

      if (token != null) {
        final user = await Storage.getUser();
        final role = user?['role'] as String?;
        _routeByRole(role);
      } else {
        _goToLanding();
      }
    } catch (_) {
      // Keystore corrupted — clear and go to landing
      await Storage.deleteAll();
      if (mounted) _goToLanding();
    }
  }

  void _goToLanding() {
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const LandingScreen(),
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  void _routeByRole(String? role) {
    final Widget screen =
        role == 'Gate' ? const GateScreen() : const DashboardScreen();
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => screen),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Minimal dark splash while we check storage
    return const Scaffold(
      backgroundColor: Color(0xFF0d1f17),
      body: Center(
        child: Icon(Icons.directions_car_rounded, color: Colors.white38, size: 48),
      ),
    );
  }
}
