import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'core/storage.dart';
import 'screens/login_screen.dart';
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
    final token = await Storage.getAccessToken();
    if (!mounted) return;

    if (token != null) {
      // Already logged in — route based on saved role
      final user = await Storage.getUser();
      final role = user?['role'] as String?;
      _routeByRole(role);
    } else {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  void _routeByRole(String? role) {
    Widget screen;
    if (role == 'Gate') {
      screen = const GateScreen();
    } else {
      // Driver, or any other role defaults to driver dashboard
      screen = const DashboardScreen();
    }
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => screen),
    );
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: kPrimary,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.directions_car, color: Colors.white, size: 56),
            SizedBox(height: 16),
            Text(
              'Fleet Mobile',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w800,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Haramaya University',
              style: TextStyle(color: Colors.white60, fontSize: 13),
            ),
            SizedBox(height: 32),
            CircularProgressIndicator(color: Colors.white),
          ],
        ),
      ),
    );
  }
}
