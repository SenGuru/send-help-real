import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../utils/neutral_theme_helper.dart';
import '../services/auth_service.dart';

class AccountPage extends StatelessWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context) {
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
                            'My Account',
                            textAlign: TextAlign.center,
                            style: NeutralThemeHelper.headingSmall.copyWith(
                              fontSize: 20.sp,
                            ),
                          ),
                        ),
                        GestureDetector(
                          onTap: _showEditProfileDialog,
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
                              Icons.edit_outlined,
                              color: NeutralThemeHelper.textPrimaryColor,
                              size: 20.r,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Content
                  Expanded(
                    child: SingleChildScrollView(
                      child: Padding(
                        padding: EdgeInsets.symmetric(horizontal: 24.w),
                        child: Column(
                          children: [
                            SizedBox(height: 24.h),
                            
                            // Profile Card
                            _buildProfileCard(),
                            
                            SizedBox(height: 32.h),
                            
                            // Account Stats
                            _buildAccountStats(),
                            
                            SizedBox(height: 32.h),
                            
                            // Account Settings
                            _buildAccountSettings(),
                            
                            SizedBox(height: 32.h),
                            
                            // Support & Legal
                            _buildSupportSection(),
                            
                            SizedBox(height: 32.h),
                            
                            // Logout Button
                            _buildLogoutButton(context),
                            
                            SizedBox(height: 32.h),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
  }

  Widget _buildProfileCard() {
    return Container(
      padding: EdgeInsets.all(24.r),
      decoration: NeutralThemeHelper.cardDecoration.copyWith(
        borderRadius: BorderRadius.circular(20.r),
      ),
      child: Column(
        children: [
          // Profile Picture
          Container(
            width: 100.r,
            height: 100.r,
            decoration: BoxDecoration(
              gradient: NeutralThemeHelper.primaryGradient,
              borderRadius: BorderRadius.circular(50.r),
              boxShadow: [
                BoxShadow(
                  color: NeutralThemeHelper.shadowColor,
                  blurRadius: 10.r,
                  offset: Offset(0, 4.h),
                ),
              ],
            ),
            child: Icon(
              Icons.person,
              size: 60.r,
              color: NeutralThemeHelper.textOnPrimaryColor,
            ),
          ),
          
          SizedBox(height: 20.h),
          
          // Name and Details
          Text(
            'John Doe',
            style: NeutralThemeHelper.headingMedium.copyWith(
              fontSize: 24.sp,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'john.doe@email.com',
            style: NeutralThemeHelper.bodyLarge.copyWith(
              fontSize: 16.sp,
              color: NeutralThemeHelper.textSecondaryColor,
            ),
          ),
          SizedBox(height: 4.h),
          Text(
            '+1 (555) 123-4567',
            style: NeutralThemeHelper.bodyLarge.copyWith(
              fontSize: 16.sp,
              color: NeutralThemeHelper.textSecondaryColor,
            ),
          ),
          
          SizedBox(height: 20.h),
          
          // Membership Badge
          Container(
            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
            decoration: BoxDecoration(
              gradient: NeutralThemeHelper.accentGradient,
              borderRadius: BorderRadius.circular(20.r),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.diamond,
                  color: NeutralThemeHelper.textOnPrimaryColor,
                  size: 16.r,
                ),
                SizedBox(width: 8.w),
                Text(
                  'Gold Member',
                  style: NeutralThemeHelper.labelLarge.copyWith(
                    fontSize: 14.sp,
                    color: NeutralThemeHelper.textOnPrimaryColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccountStats() {
    return Container(
      padding: EdgeInsets.all(24.r),
      decoration: NeutralThemeHelper.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Account Summary',
            style: NeutralThemeHelper.headingSmall.copyWith(
              fontSize: 18.sp,
            ),
          ),
          SizedBox(height: 20.h),
          Row(
            children: [
              Expanded(
                child: _buildStatItem('Total Points', '2,450', Icons.star),
              ),
              Container(
                width: 1.w,
                height: 40.h,
                color: NeutralThemeHelper.borderColor,
              ),
              Expanded(
                child: _buildStatItem('Total Savings', '\$156', Icons.savings),
              ),
            ],
          ),
          SizedBox(height: 20.h),
          Row(
            children: [
              Expanded(
                child: _buildStatItem('Transactions', '23', Icons.receipt),
              ),
              Container(
                width: 1.w,
                height: 40.h,
                color: NeutralThemeHelper.borderColor,
              ),
              Expanded(
                child: _buildStatItem('Coupons Used', '8', Icons.local_offer),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(
          icon,
          color: NeutralThemeHelper.accentColor,
          size: 24.r,
        ),
        SizedBox(height: 8.h),
        Text(
          value,
          style: NeutralThemeHelper.headingMedium.copyWith(
            fontSize: 20.sp,
          ),
        ),
        SizedBox(height: 4.h),
        Text(
          label,
          style: NeutralThemeHelper.bodySmall.copyWith(
            fontSize: 12.sp,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildAccountSettings() {
    return Container(
      decoration: NeutralThemeHelper.cardDecoration.copyWith(
        borderRadius: BorderRadius.circular(16.r),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.all(24.r),
            child: Text(
              'Account Settings',
              style: NeutralThemeHelper.headingSmall.copyWith(
                fontSize: 18.sp,
              ),
            ),
          ),
          _buildSettingItem(
            icon: Icons.person_outline,
            title: 'Personal Information',
            subtitle: 'Update your profile details',
            onTap: _showEditProfileDialog,
          ),
          _buildSettingItem(
            icon: Icons.lock_outline,
            title: 'Change Password',
            subtitle: 'Update your account password',
            onTap: _showChangePasswordDialog,
          ),
          _buildSettingItem(
            icon: Icons.notifications_outlined,
            title: 'Notifications',
            subtitle: 'Manage your notification preferences',
            onTap: _showNotificationSettings,
          ),
          _buildSettingItem(
            icon: Icons.credit_card_outlined,
            title: 'Payment Methods',
            subtitle: 'Manage saved payment methods',
            onTap: _showPaymentMethods,
          ),
          _buildSettingItem(
            icon: Icons.location_on_outlined,
            title: 'Addresses',
            subtitle: 'Manage shipping addresses',
            onTap: _showAddresses,
          ),
          _buildSettingItem(
            icon: Icons.language_outlined,
            title: 'Language & Region',
            subtitle: 'English (US)',
            onTap: _showLanguageSettings,
            showDivider: false,
          ),
        ],
      ),
    );
  }

  Widget _buildSupportSection() {
    return Container(
      decoration: NeutralThemeHelper.cardDecoration.copyWith(
        borderRadius: BorderRadius.circular(16.r),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.all(24.r),
            child: Text(
              'Support & Legal',
              style: NeutralThemeHelper.headingSmall.copyWith(
                fontSize: 18.sp,
              ),
            ),
          ),
          _buildSettingItem(
            icon: Icons.help_outline,
            title: 'Help Center',
            subtitle: 'Get help and support',
            onTap: _showHelpCenter,
          ),
          _buildSettingItem(
            icon: Icons.contact_support_outlined,
            title: 'Contact Us',
            subtitle: 'Get in touch with our team',
            onTap: _showContactUs,
          ),
          _buildSettingItem(
            icon: Icons.description_outlined,
            title: 'Terms of Service',
            subtitle: 'Read our terms and conditions',
            onTap: _showTermsOfService,
          ),
          _buildSettingItem(
            icon: Icons.privacy_tip_outlined,
            title: 'Privacy Policy',
            subtitle: 'Learn about data protection',
            onTap: _showPrivacyPolicy,
          ),
          _buildSettingItem(
            icon: Icons.info_outline,
            title: 'About',
            subtitle: 'App version 1.0.0',
            onTap: _showAbout,
            showDivider: false,
          ),
        ],
      ),
    );
  }

  Widget _buildSettingItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool showDivider = true,
  }) {
    return Column(
      children: [
        ListTile(
          leading: Container(
            padding: EdgeInsets.all(8.r),
            decoration: BoxDecoration(
              color: NeutralThemeHelper.accentColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10.r),
            ),
            child: Icon(
              icon,
              color: NeutralThemeHelper.accentColor,
              size: 20.r,
            ),
          ),
          title: Text(
            title,
            style: NeutralThemeHelper.bodyLarge.copyWith(
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          subtitle: Text(
            subtitle,
            style: NeutralThemeHelper.bodyMedium.copyWith(
              fontSize: 14.sp,
              color: NeutralThemeHelper.textSecondaryColor,
            ),
          ),
          trailing: Icon(
            Icons.arrow_forward_ios,
            color: NeutralThemeHelper.textSecondaryColor,
            size: 16.r,
          ),
          onTap: onTap,
          contentPadding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 4.h),
        ),
        if (showDivider)
          Divider(
            color: NeutralThemeHelper.borderColor,
            height: 1.h,
            indent: 72.w,
            endIndent: 24.w,
          ),
      ],
    );
  }

  Widget _buildLogoutButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () => _showLogoutDialog(context),
        style: ElevatedButton.styleFrom(
          backgroundColor: NeutralThemeHelper.errorColor,
          padding: EdgeInsets.symmetric(vertical: 16.h),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.r),
          ),
        ),
        child: Text(
          'Logout',
          style: TextStyle(
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
            color: NeutralThemeHelper.textOnPrimaryColor,
          ),
        ),
      ),
    );
  }

  // Dialog and action methods
  void _showEditProfileDialog() {
    // Implementation for edit profile dialog
  }

  void _showChangePasswordDialog() {
    // Implementation for change password dialog
  }

  void _showNotificationSettings() {
    // Implementation for notification settings
  }

  void _showPaymentMethods() {
    // Implementation for payment methods
  }

  void _showAddresses() {
    // Implementation for addresses
  }

  void _showLanguageSettings() {
    // Implementation for language settings
  }

  void _showHelpCenter() {
    // Implementation for help center
  }

  void _showContactUs() {
    // Implementation for contact us
  }

  void _showTermsOfService() {
    // Implementation for terms of service
  }

  void _showPrivacyPolicy() {
    // Implementation for privacy policy
  }

  void _showAbout() {
    // Implementation for about
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: NeutralThemeHelper.cardBackgroundColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
        ),
        title: Text(
          'Logout',
          style: NeutralThemeHelper.headingSmall.copyWith(
            fontSize: 18.sp,
          ),
        ),
        content: Text(
          'Are you sure you want to logout?',
          style: NeutralThemeHelper.bodyMedium.copyWith(
            fontSize: 14.sp,
            color: NeutralThemeHelper.textSecondaryColor,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: NeutralThemeHelper.bodyMedium.copyWith(
                fontSize: 14.sp,
                color: NeutralThemeHelper.textSecondaryColor,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              
              // Actually logout by clearing all authentication data
              print('DEBUG: Starting logout process...');
              final authService = AuthService();
              await authService.logout();
              print('DEBUG: Logout completed, navigating to login...');
              
              // Navigate to login and clear all routes
              if (context.mounted) {
                Navigator.pushNamedAndRemoveUntil(
                  context,
                  '/login',
                  (route) => false,
                );
                print('DEBUG: Navigation to login completed');
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: NeutralThemeHelper.errorColor,
            ),
            child: Text(
              'Logout',
              style: TextStyle(
                fontSize: 14.sp,
                color: NeutralThemeHelper.textOnPrimaryColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}