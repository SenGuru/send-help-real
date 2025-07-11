import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../services/auth_service.dart';
import '../utils/neutral_theme_helper.dart';

class BusinessConfirmationPage extends StatefulWidget {
  const BusinessConfirmationPage({super.key});

  @override
  State<BusinessConfirmationPage> createState() => _BusinessConfirmationPageState();
}

class _BusinessConfirmationPageState extends State<BusinessConfirmationPage> {
  String _businessCode = '';
  String _businessName = '';
  String _businessDescription = '';
  bool _isLoading = false;
  Map<String, dynamic>? _userData;

  final Map<String, Map<String, String>> _businessDetails = {
    '12345': {
      'name': 'Coffee Palace',
      'description': 'Premium coffee and pastries with a cozy atmosphere',
      'category': 'Food & Beverage',
      'location': 'Downtown District',
      'memberSince': '2023',
    },
    '67890': {
      'name': 'Fashion Hub',
      'description': 'Trendy clothing and accessories for all occasions',
      'category': 'Fashion & Retail',
      'location': 'Shopping Center',
      'memberSince': '2022',
    },
    '11111': {
      'name': 'Tech Store',
      'description': 'Latest gadgets and electronic accessories',
      'category': 'Electronics',
      'location': 'Tech District',
      'memberSince': '2024',
    },
  };

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (args != null && args['businessCode'] != null) {
      _businessCode = args['businessCode'];
      _userData = args['userData']; // Get user data passed from user details screen
      final details = _businessDetails[_businessCode];
      if (details != null) {
        _businessName = details['name'] ?? 'Unknown Business';
        _businessDescription = details['description'] ?? 'No description available';
      }
    }
  }

  Future<void> _confirmAndContinue() async {
    setState(() {
      _isLoading = true;
    });

    // Simulate verification process
    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      try {
        print('DEBUG BusinessConfirmation: Starting user creation process');
        
        // Set the business code in the app state
        final appState = Provider.of<AppStateProvider>(context, listen: false);
        await appState.setBusinessCode(_businessCode);
        print('DEBUG BusinessConfirmation: Business code set');
        
        // Join the business (user should already be registered from user details screen)
        final authService = AuthService();
        await authService.joinBusiness(_businessCode);
        print('DEBUG BusinessConfirmation: Business joined');
        
        // Navigate back to user homepage to show all businesses
        Navigator.of(context).pushNamedAndRemoveUntil(
          '/user-homepage',
          (route) => false,
        );
        print('DEBUG BusinessConfirmation: Navigated to home');
      } catch (e) {
        print('DEBUG BusinessConfirmation: Error - $e');
        // If there's an error, still navigate to home
        Navigator.of(context).pushNamedAndRemoveUntil(
          '/home',
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final businessDetails = _businessDetails[_businessCode];
    
    return Consumer<AppStateProvider>(
      builder: (context, appState, child) {
        return Scaffold(
          backgroundColor: NeutralThemeHelper.backgroundColor,
          body: Container(
            decoration: BoxDecoration(
              gradient: NeutralThemeHelper.backgroundGradient,
            ),
            child: SafeArea(
              child: Column(
                children: [
                  // Custom App Bar
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: Container(
                            padding: EdgeInsets.all(8.w),
                            decoration: BoxDecoration(
                              color: NeutralThemeHelper.cardBackgroundColor,
                              borderRadius: BorderRadius.circular(12.r),
                              boxShadow: [
                                BoxShadow(
                                  color: NeutralThemeHelper.shadowLightColor,
                                  blurRadius: 8.r,
                                  offset: Offset(0, 2.h),
                                ),
                              ],
                            ),
                            child: Icon(
                              Icons.arrow_back_ios_rounded,
                              color: NeutralThemeHelper.textPrimaryColor,
                              size: 20.r,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Text(
                            'Confirm Business',
                            textAlign: TextAlign.center,
                            style: NeutralThemeHelper.headingSmall.copyWith(
                              fontSize: 20.sp,
                            ),
                          ),
                        ),
                        SizedBox(width: 36.w), // Balance the back button
                      ],
                    ),
                  ),
                  // Content
                  Expanded(
                    child: Padding(
                      padding: EdgeInsets.all(24.w),
                      child: Column(
                        children: [
                          Expanded(
                            child: SingleChildScrollView(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  SizedBox(height: 32.h),
                                  
                                  // Success Icon
                                  Container(
                                    width: 100.r,
                                    height: 100.r,
                                    decoration: BoxDecoration(
                                      gradient: NeutralThemeHelper.primaryGradient,
                                      borderRadius: BorderRadius.circular(50.r),
                                      boxShadow: [
                                        BoxShadow(
                                          color: NeutralThemeHelper.shadowColor,
                                          blurRadius: 20.r,
                                          offset: Offset(0, 10.h),
                                        ),
                                      ],
                                    ),
                                    child: Icon(
                                      Icons.check,
                                      size: 50.r,
                                      color: NeutralThemeHelper.textOnPrimaryColor,
                                    ),
                                  ),
                                  
                                  SizedBox(height: 32.h),
                                  
                                  Text(
                                    'Business Found!',
                                    style: NeutralThemeHelper.headingLarge.copyWith(
                                      fontSize: 28.sp,
                                    ),
                                  ),
                                  
                                  SizedBox(height: 16.h),
                                  
                                  Text(
                                    'Please confirm you want to join this loyalty program',
                                    textAlign: TextAlign.center,
                                    style: NeutralThemeHelper.bodyLarge.copyWith(
                                      fontSize: 16.sp,
                                      color: NeutralThemeHelper.textSecondaryColor,
                                    ),
                                  ),
                                  
                                  SizedBox(height: 40.h),
                                  
                                  // Business Details Card
                                  Container(
                                    width: double.infinity,
                                    padding: EdgeInsets.all(24.r),
                                    decoration: NeutralThemeHelper.cardDecoration.copyWith(
                                      borderRadius: BorderRadius.circular(20.r),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.center,
                                      children: [
                                        // Business Logo/Icon
                                        Container(
                                          width: 80.r,
                                          height: 80.r,
                                          decoration: BoxDecoration(
                                            color: NeutralThemeHelper.accentColor.withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(20.r),
                                          ),
                                          child: Icon(
                                            Icons.business,
                                            size: 40.r,
                                            color: NeutralThemeHelper.accentColor,
                                          ),
                                        ),
                                        
                                        SizedBox(height: 20.h),
                                        
                                        Text(
                                          _businessName,
                                          style: NeutralThemeHelper.headingMedium.copyWith(
                                            fontSize: 24.sp,
                                          ),
                                        ),
                                        
                                        SizedBox(height: 8.h),
                                        
                                        Text(
                                          'Code: $_businessCode',
                                          style: NeutralThemeHelper.bodyLarge.copyWith(
                                            fontSize: 16.sp,
                                            color: NeutralThemeHelper.accentColor,
                                            fontWeight: FontWeight.w600,
                                            letterSpacing: 2.w,
                                          ),
                                        ),
                                        
                                        SizedBox(height: 16.h),
                                        
                                        Text(
                                          _businessDescription,
                                          textAlign: TextAlign.center,
                                          style: NeutralThemeHelper.bodyMedium.copyWith(
                                            fontSize: 14.sp,
                                            height: 1.4,
                                          ),
                                        ),
                          
                                        if (businessDetails != null) ...[
                                          SizedBox(height: 24.h),
                                          
                                          // Business Details
                                          _buildDetailRow(
                                            'Category',
                                            businessDetails['category'] ?? '',
                                            Icons.category,
                                          ),
                                          
                                          SizedBox(height: 12.h),
                                          
                                          _buildDetailRow(
                                            'Location',
                                            businessDetails['location'] ?? '',
                                            Icons.location_on,
                                          ),
                                          
                                          SizedBox(height: 12.h),
                                          
                                          _buildDetailRow(
                                            'Member Since',
                                            businessDetails['memberSince'] ?? '',
                                            Icons.calendar_today,
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                  
                                  SizedBox(height: 40.h),
                                  
                                  // Benefits Preview
                                  Container(
                                    width: double.infinity,
                                    padding: EdgeInsets.all(20.r),
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          NeutralThemeHelper.accentColor.withValues(alpha: 0.1),
                                          NeutralThemeHelper.successColor.withValues(alpha: 0.1),
                                        ],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      ),
                                      borderRadius: BorderRadius.circular(16.r),
                                      border: Border.all(
                                        color: NeutralThemeHelper.borderColor,
                                        width: 1.w,
                                      ),
                                    ),
                                    child: Column(
                                      children: [
                                        Text(
                                          'What you\'ll get:',
                                          style: NeutralThemeHelper.headingSmall.copyWith(
                                            fontSize: 16.sp,
                                          ),
                                        ),
                                        SizedBox(height: 16.h),
                                        _buildBenefitItem('Earn points on every purchase'),
                                        _buildBenefitItem('Exclusive coupons and offers'),
                                        _buildBenefitItem('Special member discounts'),
                                        _buildBenefitItem('Track your purchase history'),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          
                          SizedBox(height: 24.h),
                          
                          // Action Buttons
                          Column(
                            children: [
                              SizedBox(
                                width: double.infinity,
                                height: 56.h,
                                child: ElevatedButton(
                                  onPressed: _isLoading ? null : _confirmAndContinue,
                                  style: _isLoading
                                      ? NeutralThemeHelper.primaryButtonStyle.copyWith(
                                          backgroundColor: WidgetStateProperty.all(NeutralThemeHelper.buttonDisabledColor),
                                        )
                                      : NeutralThemeHelper.primaryButtonStyle,
                                  child: _isLoading
                                      ? SizedBox(
                                          height: 24.h,
                                          width: 24.w,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            valueColor: AlwaysStoppedAnimation<Color>(NeutralThemeHelper.textOnPrimaryColor),
                                          ),
                                        )
                                      : Row(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Icon(
                                              Icons.check_circle_outline,
                                              size: 20.r,
                                            ),
                                            SizedBox(width: 8.w),
                                            Text(
                                              'Join Loyalty Program',
                                              style: TextStyle(
                                                fontSize: 16.sp,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ],
                                        ),
                                ),
                              ),
                              
                              SizedBox(height: 12.h),
                              
                              SizedBox(
                                width: double.infinity,
                                child: TextButton(
                                  onPressed: _isLoading ? null : () => Navigator.pop(context),
                                  child: Text(
                                    'Change Business Code',
                                    style: NeutralThemeHelper.bodyMedium.copyWith(
                                      fontSize: 14.sp,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(String label, String value, IconData icon) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16.r,
          color: NeutralThemeHelper.accentColor,
        ),
        SizedBox(width: 8.w),
        Text(
          '$label: ',
          style: NeutralThemeHelper.bodySmall.copyWith(
            fontSize: 12.sp,
            fontWeight: FontWeight.w500,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: NeutralThemeHelper.bodySmall.copyWith(
              fontSize: 12.sp,
              color: NeutralThemeHelper.textPrimaryColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBenefitItem(String benefit) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Row(
        children: [
          Icon(
            Icons.check_circle,
            size: 16.r,
            color: NeutralThemeHelper.successColor,
          ),
          SizedBox(width: 8.w),
          Expanded(
            child: Text(
              benefit,
              style: NeutralThemeHelper.bodySmall.copyWith(
                fontSize: 12.sp,
              ),
            ),
          ),
        ],
      ),
    );
  }
}