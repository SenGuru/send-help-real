import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../colors.dart';
import '../utils/theme_helper.dart';
import '../providers/app_state_provider.dart';

class CouponDetailsPage extends StatelessWidget {
  const CouponDetailsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppStateProvider>(
      builder: (context, appState, child) {
        // Get arguments passed from previous screen
        final Map<String, dynamic>? args =
            ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;

        final String title = args?['title'] ?? 'Welcome Bonus';
        final String discount = args?['discount'] ?? '20% OFF';
        final String description = args?['description'] ?? 'Welcome to our loyalty program';
        final String validUntil = args?['validUntil'] ?? 'Valid until Dec 31, 2025';
        final String minPurchase = args?['minPurchase'] ?? 'Minimum purchase \$50';
        final bool isAvailable = args?['isAvailable'] ?? true;

        return Scaffold(
          backgroundColor: ThemeHelper.getBackgroundColor(appState.theme),
          appBar: AppBar(
            backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
            elevation: 0,
            title: Text(
              'Coupon Details',
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.w600,
                color: ThemeHelper.getButtonTextColor(appState.theme),
              ),
            ),
            leading: IconButton(
              icon: Icon(
                Icons.arrow_back_ios,
                color: ThemeHelper.getButtonTextColor(appState.theme),
                size: 24.r,
              ),
              onPressed: () => Navigator.pop(context),
            ),
            actions: [
              IconButton(
                icon: Icon(
                  Icons.share,
                  color: ThemeHelper.getButtonTextColor(appState.theme),
                  size: 24.r,
                ),
                onPressed: () {
                  _shareCoupon(context, title, discount);
                },
              ),
            ],
          ),
          body: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 24.w),
              child: Column(
                children: [
                  SizedBox(height: 24.h),
                  
                  // Main Coupon Card
                  _buildMainCouponCard(
                    title: title,
                    discount: discount,
                    description: description,
                    validUntil: validUntil,
                    minPurchase: minPurchase,
                    isAvailable: isAvailable,
                    appState: appState,
                  ),
                  
                  SizedBox(height: 32.h),
                  
                  // Coupon Code Section
                  if (isAvailable) _buildCouponCodeSection(appState),
                  
                  SizedBox(height: 32.h),
                  
                  // Terms and Conditions
                  _buildTermsAndConditions(appState),
                  
                  SizedBox(height: 32.h),
                  
                  // How to Use
                  _buildHowToUse(appState),
                  
                  SizedBox(height: 32.h),
                  
                  // Action Buttons
                  if (isAvailable) _buildActionButtons(context, appState),
                  
                  SizedBox(height: 32.h),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildMainCouponCard({
    required String title,
    required String discount,
    required String description,
    required String validUntil,
    required String minPurchase,
    required bool isAvailable,
    required AppStateProvider appState,
  }) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(24.r),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isAvailable
              ? [ThemeHelper.getPrimaryColor(appState.theme), ThemeHelper.getAccentColor(appState.theme)]
              : [ThemeHelper.getSubtitleTextColor(appState.theme), ThemeHelper.getMainTextColor(appState.theme)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20.r),
        boxShadow: [
          BoxShadow(
            color: isAvailable
                ? ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.3)
                : ThemeHelper.getSubtitleTextColor(appState.theme).withOpacity(0.3),
            blurRadius: 15.r,
            offset: Offset(0, 8.h),
          ),
        ],
      ),
      child: Column(
        children: [
          // Discount Badge
          Container(
            padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
            decoration: BoxDecoration(
              color: ThemeHelper.getCardBackgroundColor(appState.theme),
              borderRadius: BorderRadius.circular(30.r),
            ),
            child: Text(
              discount,
              style: TextStyle(
                fontSize: 32.sp,
                fontWeight: FontWeight.bold,
                color: isAvailable ? ThemeHelper.getPrimaryColor(appState.theme) : ThemeHelper.getSubtitleTextColor(appState.theme),
              ),
            ),
          ),
          
          SizedBox(height: 20.h),
          
          // Title
          Text(
            title,
            style: TextStyle(
              fontSize: 24.sp,
              fontWeight: FontWeight.bold,
              color: ThemeHelper.getButtonTextColor(appState.theme),
            ),
            textAlign: TextAlign.center,
          ),
          
          SizedBox(height: 12.h),
          
          // Description
          Text(
            description,
            style: TextStyle(
              fontSize: 16.sp,
              color: ThemeHelper.getBackgroundColor(appState.theme),
            ),
            textAlign: TextAlign.center,
          ),
          
          SizedBox(height: 24.h),
          
          // Validity and Min Purchase
          Container(
            padding: EdgeInsets.all(16.r),
            decoration: BoxDecoration(
              color: ThemeHelper.getButtonTextColor(appState.theme).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.access_time,
                      color: ThemeHelper.getButtonTextColor(appState.theme),
                      size: 16.r,
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      validUntil,
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: ThemeHelper.getButtonTextColor(appState.theme),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 8.h),
                Row(
                  children: [
                    Icon(
                      Icons.shopping_cart,
                      color: ThemeHelper.getButtonTextColor(appState.theme),
                      size: 16.r,
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      minPurchase,
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: ThemeHelper.getButtonTextColor(appState.theme),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCouponCodeSection(AppStateProvider appState) {
    const String couponCode = 'WELCOME20';
    
    return Container(
      padding: EdgeInsets.all(24.r),
      decoration: BoxDecoration(
        color: ThemeHelper.getCardBackgroundColor(appState.theme),
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowColor,
            blurRadius: 8.r,
            offset: Offset(0, 2.h),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Coupon Code',
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: ThemeHelper.getMainTextColor(appState.theme),
            ),
          ),
          SizedBox(height: 16.h),
          Container(
            padding: EdgeInsets.all(16.r),
            decoration: BoxDecoration(
              color: ThemeHelper.getBackgroundColor(appState.theme),
              borderRadius: BorderRadius.circular(12.r),
              border: Border.all(
                color: ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.3),
                width: 1.w,
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    couponCode,
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.bold,
                      color: ThemeHelper.getMainTextColor(appState.theme),
                      letterSpacing: 2.w,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    Clipboard.setData(const ClipboardData(text: couponCode));
                    _showSnackBar('Coupon code copied to clipboard!');
                  },
                  child: Container(
                    padding: EdgeInsets.all(8.r),
                    decoration: BoxDecoration(
                      color: ThemeHelper.getPrimaryColor(appState.theme),
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    child: Icon(
                      Icons.copy,
                      color: ThemeHelper.getButtonTextColor(appState.theme),
                      size: 20.r,
                    ),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 12.h),
          Text(
            'Tap to copy the code and use it at checkout',
            style: TextStyle(
              fontSize: 14.sp,
              color: ThemeHelper.getSubtitleTextColor(appState.theme),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTermsAndConditions(AppStateProvider appState) {
    return Container(
      padding: EdgeInsets.all(24.r),
      decoration: BoxDecoration(
        color: ThemeHelper.getCardBackgroundColor(appState.theme),
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowColor,
            blurRadius: 8.r,
            offset: Offset(0, 2.h),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Terms & Conditions',
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: ThemeHelper.getMainTextColor(appState.theme),
            ),
          ),
          SizedBox(height: 16.h),
          _buildTermItem('• Valid for one-time use only', appState),
          _buildTermItem('• Cannot be combined with other offers', appState),
          _buildTermItem('• Applicable on regular-priced items only', appState),
          _buildTermItem('• Not valid on gift cards or shipping', appState),
          _buildTermItem('• Must be logged in to loyalty account', appState),
          _buildTermItem('• Subject to product availability', appState),
        ],
      ),
    );
  }

  Widget _buildTermItem(String term, AppStateProvider appState) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Text(
        term,
        style: TextStyle(
          fontSize: 14.sp,
          color: ThemeHelper.getSubtitleTextColor(appState.theme),
          height: 1.4,
        ),
      ),
    );
  }

  Widget _buildHowToUse(AppStateProvider appState) {
    return Container(
      padding: EdgeInsets.all(24.r),
      decoration: BoxDecoration(
        color: ThemeHelper.getCardBackgroundColor(appState.theme),
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowColor,
            blurRadius: 8.r,
            offset: Offset(0, 2.h),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'How to Use',
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: ThemeHelper.getMainTextColor(appState.theme),
            ),
          ),
          SizedBox(height: 16.h),
          _buildHowToStep(
            1,
            'Shop your favorite items',
            'Browse and add items to your cart',
            appState,
          ),
          _buildHowToStep(
            2,
            'Apply the coupon code',
            'Enter the code at checkout',
            appState,
          ),
          _buildHowToStep(
            3,
            'Enjoy your discount',
            'Complete your purchase and save!',
            appState,
          ),
        ],
      ),
    );
  }

  Widget _buildHowToStep(int step, String title, String description, AppStateProvider appState) {
    return Padding(
      padding: EdgeInsets.only(bottom: 16.h),
      child: Row(
        children: [
          Container(
            width: 32.r,
            height: 32.r,
            decoration: BoxDecoration(
              color: ThemeHelper.getPrimaryColor(appState.theme),
              borderRadius: BorderRadius.circular(16.r),
            ),
            child: Center(
              child: Text(
                step.toString(),
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.bold,
                  color: ThemeHelper.getButtonTextColor(appState.theme),
                ),
              ),
            ),
          ),
          SizedBox(width: 16.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                    color: ThemeHelper.getMainTextColor(appState.theme),
                  ),
                ),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: ThemeHelper.getSubtitleTextColor(appState.theme),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, AppStateProvider appState) {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              _useCoupon(context, appState);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
              padding: EdgeInsets.symmetric(vertical: 16.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
            ),
            child: Text(
              'Use This Coupon',
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
                color: ThemeHelper.getButtonTextColor(appState.theme),
              ),
            ),
          ),
        ),
        SizedBox(height: 12.h),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: () {
              _saveCoupon(context);
            },
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: ThemeHelper.getPrimaryColor(appState.theme), width: 2.w),
              padding: EdgeInsets.symmetric(vertical: 16.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
            ),
            child: Text(
              'Save for Later',
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
                color: ThemeHelper.getPrimaryColor(appState.theme),
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _shareCoupon(BuildContext context, String title, String discount) {
    _showSnackBar('Sharing coupon: $title - $discount');
  }

  void _useCoupon(BuildContext context, AppStateProvider appState) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
        ),
        title: Text(
          'Use Coupon',
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
            color: ThemeHelper.getMainTextColor(appState.theme),
          ),
        ),
        content: Text(
          'Are you sure you want to use this coupon now? This action cannot be undone.',
          style: TextStyle(
            fontSize: 14.sp,
            color: ThemeHelper.getSubtitleTextColor(appState.theme),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: TextStyle(
                fontSize: 14.sp,
                color: ThemeHelper.getSubtitleTextColor(appState.theme),
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _showSnackBar('Coupon used successfully!');
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
            ),
            child: Text(
              'Use Now',
              style: TextStyle(
                fontSize: 14.sp,
                color: ThemeHelper.getButtonTextColor(appState.theme),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _saveCoupon(BuildContext context) {
    _showSnackBar('Coupon saved for later use!');
  }

  void _showSnackBar(String message) {
    // This would typically use ScaffoldMessenger, but for demo purposes
    // we'll just print the message
    print(message);
  }
}