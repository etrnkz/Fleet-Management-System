import 'package:flutter/material.dart';

const kPrimary = Color(0xFF1B3D2F);
const kPrimaryLight = Color(0xFF2d6349);
const kPrimaryBg = Color(0xFFf0f9f4);
const kError = Color(0xFFDC2626);
const kErrorBg = Color(0xFFFEF2F2);
const kWarningBg = Color(0xFFFFF9C4);
const kWarningText = Color(0xFF7B5800);
const kSurface = Color(0xFFFFFFFF);
const kBackground = Color(0xFFF8F9FA);
const kBorder = Color(0xFFE5E7EB);
const kTextSecondary = Color(0xFF6B7280);
const kTextMuted = Color(0xFF9CA3AF);

final appTheme = ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: kPrimary,
    primary: kPrimary,
    surface: kSurface,
    background: kBackground,
    error: kError,
  ),
  scaffoldBackgroundColor: kBackground,
  appBarTheme: const AppBarTheme(
    backgroundColor: kPrimary,
    foregroundColor: Colors.white,
    elevation: 0,
    centerTitle: false,
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
    fillColor: kBackground,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: kBorder),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: kBorder),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: kPrimary, width: 2),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
  ),
  cardTheme: CardThemeData(
    color: kSurface,
    elevation: 1,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
      side: const BorderSide(color: kBorder),
    ),
    margin: const EdgeInsets.only(bottom: 12),
  ),
  tabBarTheme: const TabBarThemeData(
    labelColor: Colors.white,
    unselectedLabelColor: Colors.white60,
    indicatorColor: Colors.white,
    labelStyle: TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
  ),
);
