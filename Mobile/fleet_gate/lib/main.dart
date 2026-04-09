import 'package:flutter/material.dart';
import 'screens/gate_screen.dart';

const kPrimary = Color(0xFF1B3D2F);
const kError = Color(0xFFDC2626);
const kBackground = Color(0xFFF8F9FA);
const kBorder = Color(0xFFE5E7EB);
const kTextSecondary = Color(0xFF6B7280);
const kTextMuted = Color(0xFF9CA3AF);

void main() => runApp(const FleetGateApp());

class FleetGateApp extends StatelessWidget {
  const FleetGateApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fleet Gate',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: kPrimary, primary: kPrimary),
        scaffoldBackgroundColor: kBackground,
        appBarTheme: const AppBarTheme(
          backgroundColor: kPrimary,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: kPrimary,
            foregroundColor: Colors.white,
            minimumSize: const Size.fromHeight(52),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kBorder)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kBorder)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kPrimary, width: 2)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
      home: const GateScreen(),
    );
  }
}
