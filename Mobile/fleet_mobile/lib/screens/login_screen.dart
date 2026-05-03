import 'package:flutter/material.dart';
import '../core/storage.dart';
import '../core/theme.dart';
import '../services/fleet_service.dart';
import '../widgets/toast.dart';
import 'dashboard_screen.dart';
import 'gate_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl  = TextEditingController();
  final _apiCtrl   = TextEditingController();
  bool _rememberMe  = false;
  bool _showPass    = false;
  bool _loading     = false;
  bool _showApiField = false;

  @override
  void initState() {
    super.initState();
    _loadSaved();
  }

  Future<void> _loadSaved() async {
    try {
      final email = await Storage.getRememberEmail();
      final base  = await Storage.getApiBase();
      if (mounted) {
        setState(() {
          if (email != null) { _emailCtrl.text = email; _rememberMe = true; }
          _apiCtrl.text = base ?? 'https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1';
        });
      }
    } catch (_) {
      // Keystore fully corrupted — wipe and start fresh
      await Storage.deleteAll();
      if (mounted) {
        setState(() {
          _apiCtrl.text = 'https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1';
        });
      }
    }
  }

  Future<void> _login() async {
    final email  = _emailCtrl.text.trim();
    final pass   = _passCtrl.text;
    if (email.isEmpty || pass.isEmpty) {
      showToast(context, 'Enter your email and password', error: true);
      return;
    }

    final apiBase = _apiCtrl.text.trim().replaceAll(RegExp(r'/$'), '');
    if (apiBase.isNotEmpty) await Storage.setApiBase(apiBase);

    setState(() => _loading = true);
    try {
      final svc = await FleetService.create();
      final res  = await svc.login(email, pass);
      final user = res['user'] as Map<String, dynamic>?;
      final role = user?['role'] as String?;

      // Only Driver and Gate roles are allowed in this app
      if (role != 'Driver' && role != 'Gate') {
        showToast(
          context,
          'Access denied. This app is for Drivers and Gate personnel only.',
          error: true,
        );
        return;
      }

      await Storage.setAccessToken(res['access_token'] as String);
      if (res['refresh_token'] != null) {
        await Storage.setRefreshToken(res['refresh_token'] as String);
      }
      await Storage.setUser(user!);

      if (_rememberMe) {
        await Storage.setRememberEmail(email);
      } else {
        await Storage.clearRememberEmail();
      }

      if (!mounted) return;

      // Route to the correct interface based on role
      final Widget destination = role == 'Gate'
          ? const GateScreen()
          : const DashboardScreen();

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => destination),
      );
    } catch (e) {
      if (mounted) showToast(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kPrimary,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 40),

              // App icon
              Container(
                width: 80, height: 80,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(40),
                ),
                child: const Icon(Icons.directions_car, color: Colors.white, size: 40),
              ),
              const SizedBox(height: 16),
              const Text(
                'Fleet Mobile',
                style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w800),
              ),
              const Text(
                'Haramaya University',
                style: TextStyle(color: Colors.white70, fontSize: 13),
              ),
              const SizedBox(height: 8),

              // Role hint
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'For Drivers & Gate Personnel',
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ),
              const SizedBox(height: 36),

              // Login card
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.12),
                      blurRadius: 20,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Sign In',
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 16),

                    // API URL toggle
                    GestureDetector(
                      onTap: () => setState(() => _showApiField = !_showApiField),
                      child: Row(
                        children: [
                          Icon(
                            _showApiField ? Icons.expand_less : Icons.settings_outlined,
                            size: 14, color: kTextMuted,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _showApiField ? 'Hide server settings' : 'Change server URL',
                            style: const TextStyle(fontSize: 12, color: kTextMuted),
                          ),
                        ],
                      ),
                    ),
                    if (_showApiField) ...[
                      const SizedBox(height: 10),
                      const Text('API Base URL',
                          style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _apiCtrl,
                        keyboardType: TextInputType.url,
                        autocorrect: false,
                        style: const TextStyle(fontSize: 12),
                        decoration: const InputDecoration(
                          hintText: 'https://…/api/v1',
                          prefixIcon: Icon(Icons.link, color: kTextMuted, size: 18),
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),

                    // Email
                    const Text('Email',
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      autocorrect: false,
                      decoration: const InputDecoration(
                        hintText: 'your@haramaya.edu.et',
                        prefixIcon: Icon(Icons.mail_outline, color: kTextMuted),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Password
                    const Text('Password',
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _passCtrl,
                      obscureText: !_showPass,
                      onSubmitted: (_) => _login(),
                      decoration: InputDecoration(
                        hintText: '••••••••',
                        prefixIcon: const Icon(Icons.lock_outline, color: kTextMuted),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _showPass
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                            color: kTextMuted,
                          ),
                          onPressed: () => setState(() => _showPass = !_showPass),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Remember me
                    GestureDetector(
                      onTap: () => setState(() => _rememberMe = !_rememberMe),
                      child: Row(
                        children: [
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            width: 20, height: 20,
                            decoration: BoxDecoration(
                              color: _rememberMe ? kPrimary : Colors.transparent,
                              border: Border.all(
                                color: _rememberMe ? kPrimary : kBorder,
                                width: 2,
                              ),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: _rememberMe
                                ? const Icon(Icons.check, color: Colors.white, size: 14)
                                : null,
                          ),
                          const SizedBox(width: 10),
                          const Text('Remember me',
                              style: TextStyle(color: kTextSecondary, fontSize: 14)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _loading ? null : _login,
                        child: _loading
                            ? const SizedBox(
                                height: 20, width: 20,
                                child: CircularProgressIndicator(
                                    color: Colors.white, strokeWidth: 2),
                              )
                            : const Text('Sign In'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _apiCtrl.dispose();
    super.dispose();
  }
}
