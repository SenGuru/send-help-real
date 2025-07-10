import 'package:flutter/material.dart';
import '../colors/neutral_colors.dart';

/// Helper class for applying neutral theme colors to authentication 
/// and user-centric pages. This provides a consistent, professional 
/// design that's independent of business theming.
class NeutralThemeHelper {
  
  // Primary Colors
  static Color get primaryColor => NeutralColors.primary;
  static Color get secondaryColor => NeutralColors.secondary;
  static Color get accentColor => NeutralColors.accent;
  
  // Background Colors
  static Color get backgroundColor => NeutralColors.background;
  static Color get cardBackgroundColor => NeutralColors.cardBackground;
  static Color get surfaceLightColor => NeutralColors.surfaceLight;
  
  // Text Colors
  static Color get textPrimaryColor => NeutralColors.textPrimary;
  static Color get textSecondaryColor => NeutralColors.textSecondary;
  static Color get textLightColor => NeutralColors.textLight;
  static Color get textOnPrimaryColor => NeutralColors.textOnPrimary;
  
  // Border Colors
  static Color get borderColor => NeutralColors.border;
  static Color get borderLightColor => NeutralColors.borderLight;
  static Color get dividerColor => NeutralColors.divider;
  
  // Status Colors
  static Color get successColor => NeutralColors.success;
  static Color get errorColor => NeutralColors.error;
  static Color get warningColor => NeutralColors.warning;
  static Color get infoColor => NeutralColors.info;
  
  // Button Colors
  static Color get buttonPrimaryColor => NeutralColors.buttonPrimary;
  static Color get buttonSecondaryColor => NeutralColors.buttonSecondary;
  static Color get buttonDisabledColor => NeutralColors.buttonDisabled;
  static Color get buttonTextColor => NeutralColors.buttonText;
  static Color get buttonTextSecondaryColor => NeutralColors.buttonTextSecondary;
  
  // Input Colors
  static Color get inputBackgroundColor => NeutralColors.inputBackground;
  static Color get inputBorderColor => NeutralColors.inputBorder;
  static Color get inputBorderFocusedColor => NeutralColors.inputBorderFocused;
  static Color get inputTextColor => NeutralColors.inputText;
  static Color get inputPlaceholderColor => NeutralColors.inputPlaceholder;
  
  // Shadow Colors
  static Color get shadowColor => NeutralColors.shadow;
  static Color get shadowLightColor => NeutralColors.shadowLight;
  
  // Gradients
  static LinearGradient get primaryGradient => NeutralColors.primaryGradient;
  static LinearGradient get accentGradient => NeutralColors.accentGradient;
  static LinearGradient get backgroundGradient => NeutralColors.backgroundGradient;
  
  // Common UI Components Styling
  
  /// Standard button style for primary actions
  static ButtonStyle get primaryButtonStyle => ElevatedButton.styleFrom(
    backgroundColor: primaryColor,
    foregroundColor: textOnPrimaryColor,
    elevation: 2,
    shadowColor: shadowColor,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
  );
  
  /// Standard button style for secondary actions
  static ButtonStyle get secondaryButtonStyle => ElevatedButton.styleFrom(
    backgroundColor: buttonSecondaryColor,
    foregroundColor: buttonTextSecondaryColor,
    elevation: 0,
    side: BorderSide(color: borderColor, width: 1),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
  );
  
  /// Standard input decoration for form fields
  static InputDecoration getInputDecoration({
    required String hintText,
    String? labelText,
    Widget? prefixIcon,
    Widget? suffixIcon,
    bool isError = false,
  }) => InputDecoration(
    hintText: hintText,
    labelText: labelText,
    prefixIcon: prefixIcon,
    suffixIcon: suffixIcon,
    filled: true,
    fillColor: inputBackgroundColor,
    hintStyle: TextStyle(
      color: inputPlaceholderColor,
      fontSize: 16,
    ),
    labelStyle: TextStyle(
      color: textSecondaryColor,
      fontSize: 14,
      fontWeight: FontWeight.w500,
    ),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: borderColor),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: borderColor),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: inputBorderFocusedColor, width: 2),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: errorColor),
    ),
    focusedErrorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: errorColor, width: 2),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
  );
  
  /// Standard card decoration
  static BoxDecoration get cardDecoration => BoxDecoration(
    color: cardBackgroundColor,
    borderRadius: BorderRadius.circular(16),
    boxShadow: [
      BoxShadow(
        color: shadowLightColor,
        blurRadius: 10,
        offset: const Offset(0, 4),
      ),
    ],
  );
  
  /// Standard app bar theme for neutral pages
  static AppBarTheme get appBarTheme => AppBarTheme(
    backgroundColor: backgroundColor,
    foregroundColor: textPrimaryColor,
    elevation: 0,
    centerTitle: true,
    titleTextStyle: TextStyle(
      color: textPrimaryColor,
      fontSize: 18,
      fontWeight: FontWeight.w600,
    ),
    iconTheme: IconThemeData(
      color: textPrimaryColor,
    ),
  );
  
  /// Text styles for different hierarchy levels
  static TextStyle get headingLarge => TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: textPrimaryColor,
    height: 1.2,
  );
  
  static TextStyle get headingMedium => TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: textPrimaryColor,
    height: 1.3,
  );
  
  static TextStyle get headingSmall => TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: textPrimaryColor,
    height: 1.4,
  );
  
  static TextStyle get bodyLarge => TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: textPrimaryColor,
    height: 1.5,
  );
  
  static TextStyle get bodyMedium => TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: textSecondaryColor,
    height: 1.5,
  );
  
  static TextStyle get bodySmall => TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: textLightColor,
    height: 1.4,
  );
  
  static TextStyle get labelLarge => TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: textPrimaryColor,
  );
  
  static TextStyle get labelMedium => TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: textSecondaryColor,
  );
}