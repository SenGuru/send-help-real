import 'package:flutter/material.dart';

/// Modern Neutral Color Palette for Authentication & User-Centric Pages
/// This palette provides a professional, clean, and trustworthy design
/// that works independently of business theming.
class NeutralColors {
  // Primary Colors
  static const Color primary = Color(0xFF2D3748);        // Dark Slate Gray
  static const Color secondary = Color(0xFF4A5568);      // Medium Gray
  static const Color accent = Color(0xFF3182CE);         // Professional Blue
  
  // Background Colors
  static const Color background = Color(0xFFF7FAFC);     // Very Light Gray
  static const Color cardBackground = Color(0xFFFFFFFF); // White
  static const Color surfaceLight = Color(0xFFF1F5F9);   // Light Surface
  
  // Text Colors
  static const Color textPrimary = Color(0xFF1A202C);    // Almost Black
  static const Color textSecondary = Color(0xFF718096);  // Medium Gray
  static const Color textLight = Color(0xFF9CA3AF);      // Light Gray
  static const Color textOnPrimary = Color(0xFFFFFFFF);  // White on primary
  
  // Border & Divider Colors
  static const Color border = Color(0xFFE2E8F0);         // Light Gray
  static const Color borderLight = Color(0xFFF1F5F9);    // Very Light Border
  static const Color divider = Color(0xFFE5E7EB);        // Divider Gray
  
  // Status Colors
  static const Color success = Color(0xFF38A169);        // Green
  static const Color error = Color(0xFFE53E3E);          // Red
  static const Color warning = Color(0xFFD69E2E);        // Orange
  static const Color info = Color(0xFF3182CE);           // Blue
  
  // Interactive Colors
  static const Color buttonPrimary = Color(0xFF2D3748);
  static const Color buttonSecondary = Color(0xFFF7FAFC);
  static const Color buttonDisabled = Color(0xFFE2E8F0);
  static const Color buttonText = Color(0xFFFFFFFF);
  static const Color buttonTextSecondary = Color(0xFF4A5568);
  
  // Input Colors
  static const Color inputBackground = Color(0xFFFFFFFF);
  static const Color inputBorder = Color(0xFFE2E8F0);
  static const Color inputBorderFocused = Color(0xFF3182CE);
  static const Color inputText = Color(0xFF1A202C);
  static const Color inputPlaceholder = Color(0xFF9CA3AF);
  
  // Shadow Colors
  static const Color shadow = Color(0x1A000000);          // 10% black
  static const Color shadowLight = Color(0x0D000000);     // 5% black
  
  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF2D3748),
      Color(0xFF4A5568),
    ],
  );
  
  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF3182CE),
      Color(0xFF2B6CB0),
    ],
  );
  
  static const LinearGradient backgroundGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0xFFF7FAFC),
      Color(0xFFFFFFFF),
    ],
  );
  
  // Opacity Variants
  static Color primaryWithOpacity(double opacity) => primary.withOpacity(opacity);
  static Color accentWithOpacity(double opacity) => accent.withOpacity(opacity);
  static Color textPrimaryWithOpacity(double opacity) => textPrimary.withOpacity(opacity);
  static Color textSecondaryWithOpacity(double opacity) => textSecondary.withOpacity(opacity);
  
  // Material Color Swatch for ThemeData
  static const MaterialColor primarySwatch = MaterialColor(
    0xFF2D3748,
    <int, Color>{
      50: Color(0xFFF7FAFC),
      100: Color(0xFFEDF2F7),
      200: Color(0xFFE2E8F0),
      300: Color(0xFFCBD5E0),
      400: Color(0xFFA0AEC0),
      500: Color(0xFF718096),
      600: Color(0xFF4A5568),
      700: Color(0xFF2D3748),
      800: Color(0xFF1A202C),
      900: Color(0xFF171923),
    },
  );
}