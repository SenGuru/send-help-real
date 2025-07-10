import 'package:flutter/material.dart';
import '../models/business_response.dart';
import '../colors.dart';

class ThemeHelper {
  static Color parseColor(String? colorString, Color fallback) {
    if (colorString == null || colorString.isEmpty) return fallback;
    
    try {
      // Remove # if present
      String cleanColor = colorString.replaceAll('#', '');
      
      // Add alpha if not present (6 chars -> 8 chars)
      if (cleanColor.length == 6) {
        cleanColor = 'FF$cleanColor';
      }
      
      return Color(int.parse(cleanColor, radix: 16));
    } catch (e) {
      return fallback;
    }
  }
  
  // Main brand colors
  static Color getPrimaryColor(ThemeColors? theme) {
    return parseColor(theme?.primary, AppColors.primary);
  }
  
  static Color getSecondaryColor(ThemeColors? theme) {
    return parseColor(theme?.secondary, AppColors.secondary);
  }
  
  static Color getAccentColor(ThemeColors? theme) {
    return parseColor(theme?.accent, AppColors.accent);
  }
  
  // Background and surface colors
  static Color getBackgroundColor(ThemeColors? theme) {
    return parseColor(theme?.background, AppColors.lightBeige);
  }
  
  static Color getCardBackgroundColor(ThemeColors? theme) {
    return parseColor(theme?.secondary, AppColors.cardBackground);
  }
  
  // Text colors - properly mapped
  static Color getMainTextColor(ThemeColors? theme) {
    return parseColor(theme?.text, AppColors.darkGrey);
  }
  
  static Color getSubtitleTextColor(ThemeColors? theme) {
    return parseColor(theme?.lightGray, AppColors.grey);
  }
  
  static Color getEmphasizedTextColor(ThemeColors? theme) {
    return parseColor(theme?.darkGray, AppColors.black);
  }
  
  // For backwards compatibility - use main text color
  static Color getTextColor(ThemeColors? theme) {
    return getMainTextColor(theme);
  }
  
  // Status colors
  static Color getSuccessColor(ThemeColors? theme) {
    return parseColor(theme?.success, AppColors.success);
  }
  
  static Color getWarningColor(ThemeColors? theme) {
    return parseColor(theme?.warning, AppColors.warning);
  }
  
  static Color getErrorColor(ThemeColors? theme) {
    return parseColor(theme?.error, AppColors.error);
  }
  
  static Color getInfoColor(ThemeColors? theme) {
    return parseColor(theme?.info, AppColors.info);
  }
  
  // Convenience methods for common UI elements
  static Color getButtonTextColor(ThemeColors? theme) {
    return AppColors.white; // Always white on colored buttons
  }
  
  static Color getBorderColor(ThemeColors? theme) {
    return parseColor(theme?.lightGray, AppColors.lightGrey);
  }
  
  static Color getDividerColor(ThemeColors? theme) {
    return parseColor(theme?.lightGray, AppColors.lightGrey);
  }
}