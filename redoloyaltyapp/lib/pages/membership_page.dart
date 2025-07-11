import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'dart:math' as math;
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../colors.dart';
import '../providers/app_state_provider.dart';
import '../utils/theme_helper.dart';

class MembershipPage extends StatefulWidget {
  const MembershipPage({super.key});

  @override
  State<MembershipPage> createState() => _MembershipPageState();
}

class _MembershipPageState extends State<MembershipPage>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );
    _animation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    _animationController.repeat();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  // Generate unique QR code data for the user
  String? _generateUserQRData(AppStateProvider appState) {
    final user = appState.currentUser;
    final businessCode = appState.currentBusinessCode;
    
    if (user == null || businessCode == null) return null;
    
    // Generate a unique QR code string using the same format as home_page
    // Format: appUserId|businessCode|timestamp
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return '${user.id}|$businessCode|$timestamp';
  }

  // Get user's member ID (fallback if not available from backend)
  String _getUserMemberId(AppStateProvider appState) {
    final user = appState.currentUser;
    if (user == null) return 'MEMBER001';
    
    // Generate a simple member ID based on user ID
    final userId = user.id;
    final hashString = userId.hashCode.abs().toString().padLeft(6, '0');
    return 'MB${_safeSubstring(hashString, 0, 6)}';
  }

  // Safe substring helper to avoid RangeError
  String _safeSubstring(String text, int start, [int? end]) {
    if (text.isEmpty) return text;
    final safeStart = start.clamp(0, text.length);
    final safeEnd = end != null ? end.clamp(safeStart, text.length) : text.length;
    return text.substring(safeStart, safeEnd);
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AppStateProvider>(
      builder: (context, appState, child) {
        return Scaffold(
          backgroundColor: ThemeHelper.getBackgroundColor(appState.theme),
          appBar: AppBar(
            backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
            elevation: 0,
            title: Text(
              'Digital Membership',
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
          ),
          body: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 24.w),
              child: Column(
                children: [
                  SizedBox(height: 24.h),
                  
                  // Digital Membership Card
                  _buildDigitalCard(appState),
                  
                  SizedBox(height: 32.h),
                  
                  // QR Code Section
                  _buildQRCodeSection(appState),
              
              SizedBox(height: 32.h),
              
              // Tier Progress
              _buildTierProgress(appState),
              
              SizedBox(height: 32.h),
              
              // Member Benefits
              _buildMemberBenefits(appState),
              
              SizedBox(height: 32.h),
            ],
          ),
        ),
      ),
    );
      },
    );
  }

  Widget _buildDigitalCard(AppStateProvider appState) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(28.r),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            ThemeHelper.getPrimaryColor(appState.theme),
            ThemeHelper.getAccentColor(appState.theme),
            ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.9),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          stops: const [0.0, 0.6, 1.0],
        ),
        borderRadius: BorderRadius.circular(24.r),
        boxShadow: [
          BoxShadow(
            color: ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.4),
            blurRadius: 25.r,
            offset: Offset(0, 12.h),
            spreadRadius: 2.r,
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10.r,
            offset: Offset(0, 4.h),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                    decoration: BoxDecoration(
                      color: ThemeHelper.getCardBackgroundColor(appState.theme).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20.r),
                    ),
                    child: Text(
                      appState.getCurrentUserRanking()?.title.toUpperCase() ?? 'MEMBER',
                      style: TextStyle(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.bold,
                        color: ThemeHelper.getCardBackgroundColor(appState.theme),
                        letterSpacing: 1.w,
                      ),
                    ),
                  ),
                  SizedBox(height: 16.h),
                  Text(
                    appState.currentUser?.displayName ?? 'User',
                    style: TextStyle(
                      fontSize: 24.sp,
                      fontWeight: FontWeight.bold,
                      color: ThemeHelper.getCardBackgroundColor(appState.theme),
                    ),
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    'Member ID: ${_getUserMemberId(appState)}',
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: ThemeHelper.getSecondaryColor(appState.theme),
                    ),
                  ),
                ],
              ),
              AnimatedBuilder(
                animation: _animation,
                builder: (context, child) {
                  return Transform.rotate(
                    angle: _animation.value * 2 * math.pi,
                    child: Container(
                      padding: EdgeInsets.all(16.r),
                      decoration: BoxDecoration(
                        color: ThemeHelper.getCardBackgroundColor(appState.theme).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(16.r),
                      ),
                      child: Icon(
                        Icons.diamond,
                        color: ThemeHelper.getCardBackgroundColor(appState.theme),
                        size: 32.r,
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
          
          SizedBox(height: 32.h),
          
          // Points and Status
          Row(
            children: [
              Expanded(
                child: _buildCardStat(appState,'Points Balance', '${appState.currentUser?.points ?? 0}'),
              ),
              Container(
                width: 1.w,
                height: 40.h,
                color: ThemeHelper.getCardBackgroundColor(appState.theme).withOpacity(0.3),
              ),
              SizedBox(width: 24.w),
              Expanded(
                child: _buildCardStat(appState,'Member Since', appState.currentUser?.memberSince ?? '2025'),
              ),
            ],
          ),
          
          SizedBox(height: 24.h),
          
          // Card Number
          Container(
            padding: EdgeInsets.all(16.r),
            decoration: BoxDecoration(
              color: ThemeHelper.getCardBackgroundColor(appState.theme).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12.r),
              border: Border.all(
                color: ThemeHelper.getCardBackgroundColor(appState.theme).withOpacity(0.2),
                width: 1.w,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '**** **** **** ${_safeSubstring(_getUserMemberId(appState), 2)}',
                  style: TextStyle(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w600,
                    color: ThemeHelper.getCardBackgroundColor(appState.theme),
                    letterSpacing: 2.w,
                    fontFamily: 'monospace',
                  ),
                ),
                Icon(
                  Icons.credit_card,
                  color: ThemeHelper.getCardBackgroundColor(appState.theme),
                  size: 24.r,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCardStat(AppStateProvider appState, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12.sp,
            color: ThemeHelper.getSecondaryColor(appState.theme),
          ),
        ),
        SizedBox(height: 4.h),
        Text(
          value,
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
            color: ThemeHelper.getCardBackgroundColor(appState.theme),
          ),
        ),
      ],
    );
  }

  Widget _buildQRCodeSection(AppStateProvider appState) {
    return Container(
      padding: EdgeInsets.all(32.r),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            ThemeHelper.getCardBackgroundColor(appState.theme),
            ThemeHelper.getCardBackgroundColor(appState.theme).withOpacity(0.95),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24.r),
        boxShadow: [
          BoxShadow(
            color: ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.15),
            blurRadius: 20.r,
            offset: Offset(0, 8.h),
            spreadRadius: 2.r,
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10.r,
            offset: Offset(0, 2.h),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header with icon and text
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: EdgeInsets.all(8.r),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      ThemeHelper.getPrimaryColor(appState.theme),
                      ThemeHelper.getAccentColor(appState.theme),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: Icon(
                  Icons.qr_code_scanner,
                  color: ThemeHelper.getButtonTextColor(appState.theme),
                  size: 20.r,
                ),
              ),
              SizedBox(width: 12.w),
              Text(
                'Scan to Earn Points',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.bold,
                  color: ThemeHelper.getTextColor(appState.theme),
                ),
              ),
            ],
          ),
          
          SizedBox(height: 32.h),
          
          // QR Code Container with enhanced styling
          Container(
            padding: EdgeInsets.all(4.r),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.8),
                  ThemeHelper.getAccentColor(appState.theme).withOpacity(0.6),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24.r),
              boxShadow: [
                BoxShadow(
                  color: ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.3),
                  blurRadius: 15.r,
                  offset: Offset(0, 6.h),
                ),
              ],
            ),
            child: Container(
              padding: EdgeInsets.all(20.r),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20.r),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8.r,
                    offset: Offset(0, 2.h),
                  ),
                ],
              ),
              child: Container(
                width: 220.r,
                height: 220.r,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.r),
                ),
                child: _buildQRCode(appState),
              ),
            ),
          ),
          
          SizedBox(height: 24.h),
          
          // Enhanced info section
          Container(
            padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
            decoration: BoxDecoration(
              color: ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.1),
              borderRadius: BorderRadius.circular(16.r),
              border: Border.all(
                color: ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.2),
                width: 1.w,
              ),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.timer_outlined,
                      color: ThemeHelper.getPrimaryColor(appState.theme),
                      size: 16.r,
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      'Valid for current session',
                      style: TextStyle(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w500,
                        color: ThemeHelper.getPrimaryColor(appState.theme),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 8.h),
                Text(
                  'Present this QR code at checkout to earn loyalty points',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: ThemeHelper.getSubtitleTextColor(appState.theme),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTierProgress(AppStateProvider appState) {
    return Container(
      padding: EdgeInsets.all(28.r),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            ThemeHelper.getCardBackgroundColor(appState.theme),
            ThemeHelper.getCardBackgroundColor(appState.theme).withOpacity(0.98),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(24.r),
        boxShadow: [
          BoxShadow(
            color: ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.12),
            blurRadius: 20.r,
            offset: Offset(0, 8.h),
            spreadRadius: 1.r,
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8.r,
            offset: Offset(0, 2.h),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Tier Progress',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.bold,
                  color: ThemeHelper.getTextColor(appState.theme),
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                decoration: BoxDecoration(
                  color: ThemeHelper.getAccentColor(appState.theme),
                  borderRadius: BorderRadius.circular(20.r),
                ),
                child: Text(
                  appState.getCurrentUserRanking()?.title.toUpperCase() ?? 'MEMBER',
                  style: TextStyle(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.bold,
                    color: ThemeHelper.getTextColor(appState.theme),
                  ),
                ),
              ),
            ],
          ),
          
          SizedBox(height: 20.h),
          
          // Progress bars for different tiers
          _buildTierItem(appState,'Silver', 1000, 1000, true),
          SizedBox(height: 12.h),
          _buildTierItem(appState,'Gold', 2450, 3000, false),
          SizedBox(height: 12.h),
          _buildTierItem(appState,'Platinum', 0, 5000, false),
          
          SizedBox(height: 20.h),
          
          Container(
            padding: EdgeInsets.all(16.r),
            decoration: BoxDecoration(
              color: ThemeHelper.getSecondaryColor(appState.theme),
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.trending_up,
                  color: ThemeHelper.getPrimaryColor(appState.theme),
                  size: 20.r,
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Text(
                    appState.getNextRanking() != null 
                        ? 'Earn ${appState.getPointsToNextRanking()} more points to reach ${appState.getNextRanking()?.title} tier'
                        : 'You\'ve reached the highest tier!',
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: ThemeHelper.getTextColor(appState.theme),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTierItem(AppStateProvider appState, String tier, int current, int target, bool completed) {
    double progress = current / target;
    if (progress > 1.0) progress = 1.0;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              tier,
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
                color: completed ? ThemeHelper.getSuccessColor(appState.theme) : ThemeHelper.getTextColor(appState.theme),
              ),
            ),
            Text(
              '$current / $target pts',
              style: TextStyle(
                fontSize: 12.sp,
                color: ThemeHelper.getSubtitleTextColor(appState.theme),
              ),
            ),
          ],
        ),
        SizedBox(height: 8.h),
        Container(
          height: 8.h,
          decoration: BoxDecoration(
            color: ThemeHelper.getBorderColor(appState.theme),
            borderRadius: BorderRadius.circular(4.r),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: progress,
            child: Container(
              decoration: BoxDecoration(
                color: completed ? ThemeHelper.getSuccessColor(appState.theme) : ThemeHelper.getPrimaryColor(appState.theme),
                borderRadius: BorderRadius.circular(4.r),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMemberBenefits(AppStateProvider appState) {
    return Container(
      padding: EdgeInsets.all(28.r),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            ThemeHelper.getCardBackgroundColor(appState.theme),
            ThemeHelper.getCardBackgroundColor(appState.theme).withOpacity(0.95),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24.r),
        boxShadow: [
          BoxShadow(
            color: ThemeHelper.getAccentColor(appState.theme).withOpacity(0.15),
            blurRadius: 20.r,
            offset: Offset(0, 8.h),
            spreadRadius: 1.r,
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8.r,
            offset: Offset(0, 2.h),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${appState.getCurrentUserRanking()?.title ?? 'Member'} Benefits',
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: ThemeHelper.getTextColor(appState.theme),
            ),
          ),
          SizedBox(height: 20.h),
          _buildBenefitItem(appState,
            Icons.card_giftcard,
            '2x Points on Purchases',
            'Earn double points on every purchase',
          ),
          _buildBenefitItem(appState,
            Icons.local_shipping,
            'Free Shipping',
            'Free shipping on orders over \$25',
          ),
          _buildBenefitItem(appState,
            Icons.access_time,
            'Early Access',
            'Get early access to sales and new products',
          ),
          _buildBenefitItem(appState,
            Icons.support_agent,
            'Priority Support',
            '24/7 priority customer support',
          ),
        ],
      ),
    );
  }

  Widget _buildBenefitItem(AppStateProvider appState, IconData icon, String title, String description) {
    return Padding(
      padding: EdgeInsets.only(bottom: 16.h),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(12.r),
            decoration: BoxDecoration(
              color: ThemeHelper.getAccentColor(appState.theme),
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Icon(
              icon,
              color: ThemeHelper.getPrimaryColor(appState.theme),
              size: 20.r,
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
                    color: ThemeHelper.getTextColor(appState.theme),
                  ),
                ),
                SizedBox(height: 2.h),
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

  // Build the actual QR code widget
  Widget _buildQRCode(AppStateProvider appState) {
    final qrData = _generateUserQRData(appState);
    
    if (qrData == null) {
      // Stylish fallback when data not available
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: EdgeInsets.all(20.r),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(16.r),
            ),
            child: Icon(
              Icons.qr_code,
              size: 80.r,
              color: Colors.grey[400],
            ),
          ),
          SizedBox(height: 16.h),
          Text(
            'QR Code Unavailable',
            style: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.w500,
              color: Colors.grey[600],
            ),
          ),
          Text(
            'Please check your connection',
            style: TextStyle(
              fontSize: 12.sp,
              color: Colors.grey[500],
            ),
          ),
        ],
      );
    }

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // QR Code with subtle padding
        Expanded(
          child: Container(
            padding: EdgeInsets.all(12.r),
            child: QrImageView(
              data: qrData,
              version: QrVersions.auto,
              size: double.infinity,
              backgroundColor: Colors.transparent,
              foregroundColor: Colors.black,
              errorCorrectionLevel: QrErrorCorrectLevel.M,
              embeddedImage: null,
              embeddedImageStyle: const QrEmbeddedImageStyle(
                size: Size(40, 40),
              ),
            ),
          ),
        ),
        
        // Member ID and timestamp in styled container
        Container(
          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(12.r),
          ),
          child: Column(
            children: [
              Text(
                _getUserMemberId(appState),
                style: TextStyle(
                  fontSize: 13.sp,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                  letterSpacing: 1.2,
                ),
              ),
              SizedBox(height: 2.h),
              Text(
                'ID: ${_safeSubstring(appState.currentUser?.id ?? 'USER', 0, 8)}',
                style: TextStyle(
                  fontSize: 10.sp,
                  color: Colors.grey[600],
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}