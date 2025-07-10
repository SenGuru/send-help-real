import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../providers/app_state_provider.dart';
import '../utils/theme_helper.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    _loadBusinessData();
  }

  void _loadBusinessData() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final appState = Provider.of<AppStateProvider>(context, listen: false);
      // Always refresh data to ensure we have latest user and business info
      appState.refreshFromAuthService();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AppStateProvider>(
      builder: (context, appState, child) {
        if (appState.isLoadingBusiness) {
          return Scaffold(
            body: Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(
                  ThemeHelper.getPrimaryColor(appState.theme),
                ),
              ),
            ),
          );
        }

        if (appState.errorMessage != null) {
          return Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64.r,
                    color: ThemeHelper.getErrorColor(appState.theme),
                  ),
                  SizedBox(height: 16.h),
                  Text(
                    'Error loading business data',
                    style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w600,
                      color: ThemeHelper.getTextColor(appState.theme),
                    ),
                  ),
                  SizedBox(height: 8.h),
                  Text(
                    appState.errorMessage!,
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: ThemeHelper.getSubtitleTextColor(appState.theme),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 24.h),
                  ElevatedButton(
                    onPressed: () {
                      appState.clearError();
                      appState.loadBusinessData();
                    },
                    child: Text('Retry'),
                  ),
                ],
              ),
            ),
          );
        }

        final user = appState.currentUser;
        final business = appState.business;
        final businessCode = appState.currentBusinessCode ?? 'Unknown';
        final businessName = business?.name ?? 'Unknown Business';

        return Scaffold(
          backgroundColor: ThemeHelper.getBackgroundColor(appState.theme),
          body: Stack(
            children: [
              // Main Content with proper top padding
              Positioned.fill(
                child: RefreshIndicator(
                  onRefresh: () async {
                    appState.refreshFromAuthService();
                  },
                  child: SingleChildScrollView(
                    child: Column(
                      children: [
                        // Add space for the curved header + extra breathing room
                        SizedBox(height: 200.h),
                        
                        // Content
                        Padding(
                          padding: EdgeInsets.all(24.w),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Membership Card
                              _buildMembershipCard(appState),
                              
                              SizedBox(height: 32.h),
                              
                              // Feature Cards Section
                              Text(
                                'Quick Actions',
                                style: TextStyle(
                                  fontSize: 20.sp,
                                  fontWeight: FontWeight.bold,
                                  color: ThemeHelper.getAccentColor(appState.theme),
                                ),
                              ),
                              SizedBox(height: 16.h),
                              
                              _buildFeatureCards(appState),
                              
                              SizedBox(height: 32.h),
                              
                              // Available Coupons Section
                              _buildSectionHeader('Available Coupons', 'View All', () {
                                Navigator.pushNamed(context, '/coupons');
                              }, appState),
                              
                              SizedBox(height: 16.h),
                              
                              _buildCouponsList(appState),
                              
                              SizedBox(height: 32.h),
                              
                              // Recent Transactions
                              _buildSectionHeader('Recent Transactions', 'View All', () {
                                Navigator.pushNamed(context, '/transactions');
                              }, appState),
                              
                              SizedBox(height: 16.h),
                              
                              _buildTransactionsList(appState),
                              
                              SizedBox(height: 40.h),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              
              // Curved Header on top (fixed position)
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: _buildCurvedHeader(appState, businessName, businessCode, user),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMembershipCard(AppStateProvider appState) {
    final user = appState.currentUser;
    final currentRanking = appState.getCurrentUserRanking();
    final nextRanking = appState.getNextRanking();
    final pointsToNext = appState.getPointsToNextRanking();
    return GestureDetector(
      onTap: () {
        Navigator.pushNamed(context, '/membership');
      },
      child: Container(
        padding: EdgeInsets.all(24.r),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [ThemeHelper.getPrimaryColor(appState.theme), ThemeHelper.getAccentColor(appState.theme)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20.r),
          boxShadow: [
            BoxShadow(
              color: ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.3),
              blurRadius: 15.r,
              offset: Offset(0, 8.h),
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
                    Text(
                      currentRanking?.title ?? user?.rankingLevel ?? 'Member',
                      style: TextStyle(
                        fontSize: 20.sp,
                        fontWeight: FontWeight.bold,
                        color: ThemeHelper.getButtonTextColor(appState.theme),
                      ),
                    ),
                    SizedBox(height: 4.h),
                    Text(
                      'Member since ${user?.memberSince ?? '2023'}',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: ThemeHelper.getBackgroundColor(appState.theme),
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => _showQRCodeDialog(appState),
                  child: Container(
                    padding: EdgeInsets.all(8.r),
                    decoration: BoxDecoration(
                      color: ThemeHelper.getButtonTextColor(appState.theme),
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: _buildMiniQRCode(appState),
                  ),
                ),
              ],
            ),
            SizedBox(height: 24.h),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Points Balance',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: ThemeHelper.getBackgroundColor(appState.theme),
                        ),
                      ),
                      SizedBox(height: 4.h),
                      Text(
                        '${user?.points ?? 0}',
                        style: TextStyle(
                          fontSize: 24.sp,
                          fontWeight: FontWeight.bold,
                          color: ThemeHelper.getButtonTextColor(appState.theme),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 1.w,
                  height: 40.h,
                  color: ThemeHelper.getButtonTextColor(appState.theme).withOpacity(0.3),
                ),
                SizedBox(width: 24.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Next Reward',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: ThemeHelper.getBackgroundColor(appState.theme),
                        ),
                      ),
                      SizedBox(height: 4.h),
                      Text(
                        nextRanking != null 
                          ? '$pointsToNext pts away' 
                          : 'Max rank reached',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                          color: ThemeHelper.getButtonTextColor(appState.theme),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureCards(AppStateProvider appState) {
    return Column(
      children: [
        // First Row
        Row(
          children: [
            Expanded(
              child: _buildFeatureCard(
                title: 'Show Card',
                subtitle: 'Digital Membership',
                icon: Icons.qr_code,
                gradient: [ThemeHelper.getPrimaryColor(appState.theme), ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.7)],
                onTap: () => Navigator.pushNamed(context, '/membership'),
                appState: appState,
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: _buildFeatureCard(
                title: 'My Coupons',
                subtitle: 'Available Offers',
                icon: Icons.local_offer,
                gradient: [ThemeHelper.getPrimaryColor(appState.theme), ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.7)],
                onTap: () => Navigator.pushNamed(context, '/coupons'),
                appState: appState,
              ),
            ),
          ],
        ),
        SizedBox(height: 16.h),
        // Second Row
        Row(
          children: [
            Expanded(
              child: _buildFeatureCard(
                title: 'Transactions',
                subtitle: 'Purchase History',
                icon: Icons.history,
                gradient: [ThemeHelper.getAccentColor(appState.theme), ThemeHelper.getAccentColor(appState.theme).withOpacity(0.7)],
                onTap: () => Navigator.pushNamed(context, '/transactions'),
                appState: appState,
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: _buildFeatureCard(
                title: 'My Account',
                subtitle: 'Profile & Settings',
                icon: Icons.person,
                gradient: [ThemeHelper.getPrimaryColor(appState.theme), ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.6)],
                onTap: () => Navigator.pushNamed(context, '/account'),
                appState: appState,
              ),
            ),
          ],
        ),
        SizedBox(height: 16.h),
        // Third Row
        Row(
          children: [
            Expanded(
              child: _buildFeatureCard(
                title: 'Scan QR',
                subtitle: 'Earn Points',
                icon: Icons.qr_code_scanner,
                gradient: [ThemeHelper.getAccentColor(appState.theme), ThemeHelper.getAccentColor(appState.theme).withOpacity(0.6)],
                onTap: () => _showQRScanner(appState),
                appState: appState,
              ),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: _buildFeatureCard(
                title: 'Refer Friend',
                subtitle: 'Earn Bonus',
                icon: Icons.share,
                gradient: [ThemeHelper.getPrimaryColor(appState.theme), ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.5)],
                onTap: () => _showReferralDialog(appState),
                appState: appState,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFeatureCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required List<Color> gradient,
    required VoidCallback onTap,
    required AppStateProvider appState,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 130.h,
        padding: EdgeInsets.all(20.r),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: gradient,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20.r),
          boxShadow: [
            BoxShadow(
              color: gradient[0].withOpacity(0.3),
              blurRadius: 12.r,
              offset: Offset(0, 6.h),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: EdgeInsets.all(8.r),
              decoration: BoxDecoration(
                color: ThemeHelper.getButtonTextColor(appState.theme).withOpacity(0.2),
                borderRadius: BorderRadius.circular(10.r),
              ),
              child: Icon(
                icon,
                color: ThemeHelper.getButtonTextColor(appState.theme),
                size: 24.r,
              ),
            ),
            const Spacer(),
            Text(
              title,
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.bold,
                color: ThemeHelper.getButtonTextColor(appState.theme),
              ),
            ),
            SizedBox(height: 4.h),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 12.sp,
                color: ThemeHelper.getButtonTextColor(appState.theme).withOpacity(0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, String actionText, VoidCallback onTap, AppStateProvider appState) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
            color: ThemeHelper.getAccentColor(appState.theme),
          ),
        ),
        TextButton(
          onPressed: onTap,
          child: Text(
            actionText,
            style: TextStyle(
              fontSize: 14.sp,
              color: ThemeHelper.getPrimaryColor(appState.theme),
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCouponsList(AppStateProvider appState) {
    final coupons = appState.coupons.take(3).toList();
    
    if (coupons.isEmpty) {
      return Container(
        height: 130.h,
        padding: EdgeInsets.all(24.r),
        decoration: BoxDecoration(
          color: ThemeHelper.getButtonTextColor(appState.theme),
          borderRadius: BorderRadius.circular(16.r),
          boxShadow: [
            BoxShadow(
              color: ThemeHelper.getSubtitleTextColor(appState.theme).withOpacity(0.1),
              blurRadius: 8.r,
              offset: Offset(0, 3.h),
            ),
          ],
        ),
        child: Center(
          child: Text(
            'No coupons available',
            style: TextStyle(
              fontSize: 16.sp,
              color: ThemeHelper.getSubtitleTextColor(appState.theme),
            ),
          ),
        ),
      );
    }
    return SizedBox(
      height: 130.h, // Further reduced height
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: coupons.length,
        itemBuilder: (context, index) {
          final coupon = coupons[index];
          return Container(
            width: 300.w,
            margin: EdgeInsets.only(right: 16.w),
            decoration: BoxDecoration(
              color: ThemeHelper.getButtonTextColor(appState.theme),
              borderRadius: BorderRadius.circular(16.r),
              boxShadow: [
                BoxShadow(
                  color: ThemeHelper.getSubtitleTextColor(appState.theme).withOpacity(0.1),
                  blurRadius: 8.r,
                  offset: Offset(0, 3.h),
                ),
              ],
            ),
            child: Padding(
              padding: EdgeInsets.all(12.r), // Further reduced padding
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header - Fixed height
                  SizedBox(
                    height: 36.h, // Fixed height for header
                    child: Row(
                      children: [
                        Container(
                          width: 36.r,
                          height: 36.r,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [ThemeHelper.getPrimaryColor(appState.theme), ThemeHelper.getAccentColor(appState.theme)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(8.r),
                          ),
                          child: Icon(
                            Icons.local_offer,
                            color: ThemeHelper.getButtonTextColor(appState.theme),
                            size: 18.r,
                          ),
                        ),
                        SizedBox(width: 10.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                coupon.discountText,
                                style: TextStyle(
                                  fontSize: 15.sp,
                                  fontWeight: FontWeight.bold,
                                  color: ThemeHelper.getPrimaryColor(appState.theme),
                                ),
                              ),
                              Text(
                                coupon.title,
                                style: TextStyle(
                                  fontSize: 10.sp,
                                  color: ThemeHelper.getSubtitleTextColor(appState.theme),
                                  fontWeight: FontWeight.w500,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  SizedBox(height: 6.h),
                  
                  // Details - Fixed height
                  SizedBox(
                    height: 30.h, // Fixed height for details
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.access_time,
                              size: 10.r,
                              color: ThemeHelper.getSubtitleTextColor(appState.theme),
                            ),
                            SizedBox(width: 4.w),
                            Text(
                              'Valid until ${coupon.expirationDate ?? 'No expiry'}',
                              style: TextStyle(
                                fontSize: 9.sp,
                                color: ThemeHelper.getSubtitleTextColor(appState.theme),
                              ),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Icon(
                              Icons.shopping_cart,
                              size: 10.r,
                              color: ThemeHelper.getSubtitleTextColor(appState.theme),
                            ),
                            SizedBox(width: 4.w),
                            Text(
                              coupon.minimumPurchaseText,
                              style: TextStyle(
                                fontSize: 9.sp,
                                color: ThemeHelper.getSubtitleTextColor(appState.theme),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  SizedBox(height: 6.h),
                  
                  // Button - Fixed height
                  SizedBox(
                    width: double.infinity,
                    height: 28.h, // Fixed button height
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pushNamed(
                          context, 
                          '/coupon-details',
                          arguments: {'coupon': coupon},
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                        elevation: 0,
                        padding: EdgeInsets.zero, // No padding
                      ),
                      child: Text(
                        'Use Coupon',
                        style: TextStyle(
                          fontSize: 11.sp,
                          fontWeight: FontWeight.w600,
                          color: ThemeHelper.getButtonTextColor(appState.theme),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTransactionsList(AppStateProvider appState) {
    return Column(
      children: List.generate(3, (index) {
        return GestureDetector(
          onTap: () {
            Navigator.pushNamed(
              context,
              '/transaction-details',
              arguments: {
                'id': 'TXN${2025001 + index}',
                'storeName': 'Store #${index + 1}',
                'date': 'Dec ${25 - index}, 2025 at ${2 + index}:30 PM',
                'amount': (25 + index * 15).toDouble(),
                'pointsEarned': 50 + index * 25,
                'status': index == 1 ? 'Pending' : 'Completed',
                'items': index == 0 ? ['Coffee', 'Pastry'] : index == 1 ? ['Shirt', 'Jeans'] : ['Groceries'],
                'paymentMethod': index == 0 ? 'Credit Card' : index == 1 ? 'Debit Card' : 'Digital Wallet',
              },
            );
          },
          child: Container(
            margin: EdgeInsets.only(bottom: 12.h),
            padding: EdgeInsets.all(16.r),
            decoration: BoxDecoration(
              color: ThemeHelper.getButtonTextColor(appState.theme),
              borderRadius: BorderRadius.circular(12.r),
              boxShadow: [
                BoxShadow(
                  color: ThemeHelper.getSubtitleTextColor(appState.theme).withOpacity(0.1),
                  blurRadius: 4.r,
                  offset: Offset(0, 1.h),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: EdgeInsets.all(12.r),
                  decoration: BoxDecoration(
                    color: ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(10.r),
                  ),
                  child: Icon(
                    Icons.shopping_bag_outlined,
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
                        'Purchase at Store #${index + 1}',
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                          color: ThemeHelper.getTextColor(appState.theme),
                        ),
                      ),
                      SizedBox(height: 4.h),
                      Text(
                        'Dec ${25 - index}, 2025',
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: ThemeHelper.getSubtitleTextColor(appState.theme),
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '+${50 + index * 25} pts',
                      style: TextStyle(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w600,
                        color: ThemeHelper.getSuccessColor(appState.theme),
                      ),
                    ),
                    SizedBox(height: 4.h),
                    Text(
                      '\${(25 + index * 15).toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: ThemeHelper.getSubtitleTextColor(appState.theme),
                      ),
                    ),
                  ],
                ),
                SizedBox(width: 8.w),
                Icon(
                  Icons.arrow_forward_ios,
                  color: ThemeHelper.getSubtitleTextColor(appState.theme),
                  size: 16.r,
                ),
              ],
            ),
          ),
        );
      }),
    );
  }

  void _showQRScanner(AppStateProvider appState) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
        ),
        title: Text(
          'QR Scanner',
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
            color: ThemeHelper.getAccentColor(appState.theme),
          ),
        ),
        content: Text(
          'QR scanner functionality would be implemented here.',
          style: TextStyle(
            fontSize: 14.sp,
            color: ThemeHelper.getTextColor(appState.theme),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Close',
              style: TextStyle(
                fontSize: 14.sp,
                color: ThemeHelper.getPrimaryColor(appState.theme),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showReferralDialog(AppStateProvider appState) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
        ),
        title: Text(
          'Refer a Friend',
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
            color: ThemeHelper.getAccentColor(appState.theme),
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Share your referral code:',
              style: TextStyle(
                fontSize: 14.sp,
                color: ThemeHelper.getTextColor(appState.theme),
              ),
            ),
            SizedBox(height: 16.h),
            Container(
              padding: EdgeInsets.all(16.r),
              decoration: BoxDecoration(
                color: ThemeHelper.getBackgroundColor(appState.theme),
                borderRadius: BorderRadius.circular(12.r),
              ),
              child: Text(
                'JOHN2025',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.bold,
                  color: ThemeHelper.getPrimaryColor(appState.theme),
                  letterSpacing: 2.w,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Share',
              style: TextStyle(
                fontSize: 14.sp,
                color: ThemeHelper.getPrimaryColor(appState.theme),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Close',
              style: TextStyle(
                fontSize: 14.sp,
                color: ThemeHelper.getSubtitleTextColor(appState.theme),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showBusinessSelector(AppStateProvider appState) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: BoxDecoration(
          color: ThemeHelper.getButtonTextColor(appState.theme),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle bar
            Container(
              margin: EdgeInsets.symmetric(vertical: 12.h),
              width: 40.w,
              height: 4.h,
              decoration: BoxDecoration(
                color: ThemeHelper.getBorderColor(appState.theme),
                borderRadius: BorderRadius.circular(2.r),
              ),
            ),
            
            // Title
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.w),
              child: Row(
                children: [
                  Text(
                    'Business Options',
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.bold,
                      color: ThemeHelper.getAccentColor(appState.theme),
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: Icon(
                      Icons.close,
                      color: ThemeHelper.getSubtitleTextColor(appState.theme),
                      size: 24.r,
                    ),
                  ),
                ],
              ),
            ),
            
            SizedBox(height: 16.h),
            
            // Refresh data button
            Container(
              margin: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  final appStateLocal = Provider.of<AppStateProvider>(context, listen: false);
                  appStateLocal.refreshBusinessData();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
                  foregroundColor: ThemeHelper.getButtonTextColor(appState.theme),
                  padding: EdgeInsets.symmetric(vertical: 16.h),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                ),
                icon: Icon(Icons.refresh, size: 20.r),
                label: Text(
                  'Refresh Data',
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            
            // Add new business button
            Container(
              margin: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  _showAddBusinessDialog(appState);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.3),
                  foregroundColor: ThemeHelper.getPrimaryColor(appState.theme),
                  padding: EdgeInsets.symmetric(vertical: 16.h),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                ),
                icon: Icon(Icons.add, size: 20.r),
                label: Text(
                  'Switch Business',
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            
            SizedBox(height: 20.h),
          ],
        ),
      ),
    );
  }

  void _switchBusiness(String businessCode) async {
    final appState = Provider.of<AppStateProvider>(context, listen: false);
    final success = await appState.switchBusiness(businessCode);
    
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Switched to ${appState.business?.name ?? "new business"}'),
          backgroundColor: ThemeHelper.getSuccessColor(appState.theme),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.r),
          ),
          margin: EdgeInsets.all(16.r),
        ),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(appState.errorMessage ?? 'Failed to switch business'),
          backgroundColor: ThemeHelper.getErrorColor(appState.theme),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.r),
          ),
          margin: EdgeInsets.all(16.r),
        ),
      );
    }
  }

  void _showAddBusinessDialog(AppStateProvider appState) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
        ),
        title: Text(
          'Add New Business',
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
            color: ThemeHelper.getAccentColor(appState.theme),
          ),
        ),
        content: Text(
          'Would you like to enter a new business code?',
          style: TextStyle(
            fontSize: 14.sp,
            color: ThemeHelper.getTextColor(appState.theme),
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
              Navigator.pushNamed(context, '/business-code');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.r),
              ),
            ),
            child: Text(
              'Enter Code',
              style: TextStyle(
                fontSize: 14.sp,
                color: ThemeHelper.getButtonTextColor(appState.theme),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniQRCode(AppStateProvider appState) {
    final qrData = _generateQRData(appState);
    if (qrData == null) {
      return Icon(
        Icons.qr_code,
        color: ThemeHelper.getPrimaryColor(appState.theme),
        size: 32.r,
      );
    }
    
    return QrImageView(
      data: qrData,
      version: QrVersions.auto,
      size: 40.r,
      backgroundColor: ThemeHelper.getButtonTextColor(appState.theme),
      foregroundColor: ThemeHelper.getPrimaryColor(appState.theme),
    );
  }

  String? _generateQRData(AppStateProvider appState) {
    final user = appState.currentUser;
    final businessCode = appState.currentBusinessCode;
    
    if (user == null || businessCode == null) return null;
    
    final qrData = {
      'appUserId': user.id,
      'businessUserId': 'USR${user.id.substring(0, 4).toUpperCase()}${DateTime.now().millisecondsSinceEpoch.toString().substring(10)}',
      'businessCode': businessCode,
      'joinDate': user.memberSince,
      'generatedAt': DateTime.now().toIso8601String(),
    };
    
    return qrData.toString();
  }

  void _showQRCodeDialog(AppStateProvider appState) {
    final qrData = _generateQRData(appState);
    if (qrData == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('QR code data not available'),
          backgroundColor: ThemeHelper.getErrorColor(appState.theme),
        ),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.r),
        ),
        child: Container(
          padding: EdgeInsets.all(24.r),
          decoration: BoxDecoration(
            color: ThemeHelper.getButtonTextColor(appState.theme),
            borderRadius: BorderRadius.circular(20.r),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Membership QR Code',
                style: TextStyle(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.bold,
                  color: ThemeHelper.getAccentColor(appState.theme),
                ),
              ),
              SizedBox(height: 24.h),
              Container(
                padding: EdgeInsets.all(16.r),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.r),
                  boxShadow: [
                    BoxShadow(
                      color: ThemeHelper.getSubtitleTextColor(appState.theme).withOpacity(0.1),
                      blurRadius: 8.r,
                      offset: Offset(0, 4.h),
                    ),
                  ],
                ),
                child: QrImageView(
                  data: qrData,
                  version: QrVersions.auto,
                  size: 200.r,
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                ),
              ),
              SizedBox(height: 24.h),
              Text(
                'Show this QR code to earn points',
                style: TextStyle(
                  fontSize: 14.sp,
                  color: ThemeHelper.getSubtitleTextColor(appState.theme),
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 16.h),
              Row(
                children: [
                  Expanded(
                    child: TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        'Close',
                        style: TextStyle(
                          fontSize: 16.sp,
                          color: ThemeHelper.getSubtitleTextColor(appState.theme),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 16.w),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        Navigator.pushNamed(context, '/membership');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        padding: EdgeInsets.symmetric(vertical: 12.h),
                      ),
                      child: Text(
                        'Full Details',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                          color: ThemeHelper.getButtonTextColor(appState.theme),
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
    );
  }

  Widget _buildCurvedHeader(AppStateProvider appState, String businessName, String businessCode, dynamic user) {
    return ClipPath(
      clipper: CurvedBottomClipper(),
      child: Container(
        height: 220.h,
        decoration: BoxDecoration(
          color: ThemeHelper.getPrimaryColor(appState.theme),
        ),
        child: SafeArea(
          child: Padding(
            padding: EdgeInsets.fromLTRB(24.w, 16.h, 24.w, 50.h),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Business info on the left
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Good Morning,',
                        style: TextStyle(
                          fontSize: 16.sp,
                          color: ThemeHelper.getBackgroundColor(appState.theme).withOpacity(0.9),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      SizedBox(height: 4.h),
                      Text(
                        user?.displayName ?? 'User',
                        style: TextStyle(
                          fontSize: 24.sp,
                          color: ThemeHelper.getButtonTextColor(appState.theme),
                          fontWeight: FontWeight.bold,
                          height: 1.1,
                        ),
                      ),
                      SizedBox(height: 8.h),
                    ],
                  ),
                ),
                
                // Back to User Homepage button
                GestureDetector(
                  onTap: () => Navigator.pushNamed(context, '/user-homepage'),
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
                    decoration: BoxDecoration(
                      color: ThemeHelper.getButtonTextColor(appState.theme).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12.r),
                      border: Border.all(
                        color: ThemeHelper.getButtonTextColor(appState.theme).withOpacity(0.3),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.home_outlined,
                          color: ThemeHelper.getButtonTextColor(appState.theme),
                          size: 14.r,
                        ),
                        SizedBox(width: 4.w),
                        Text(
                          'Home',
                          style: TextStyle(
                            color: ThemeHelper.getButtonTextColor(appState.theme),
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// Custom clipper for curved bottom effect
class CurvedBottomClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    
    // Start from top left
    path.lineTo(0, 0);
    
    // Top edge
    path.lineTo(size.width, 0);
    
    // Right edge down to start of curve
    path.lineTo(size.width, size.height - 40);
    
    // Create curved bottom
    final firstControlPoint = Offset(size.width * 0.75, size.height);
    final firstEndPoint = Offset(size.width * 0.5, size.height - 20);
    path.quadraticBezierTo(
      firstControlPoint.dx,
      firstControlPoint.dy,
      firstEndPoint.dx,
      firstEndPoint.dy,
    );
    
    final secondControlPoint = Offset(size.width * 0.25, size.height - 40);
    final secondEndPoint = Offset(0, size.height - 40);
    path.quadraticBezierTo(
      secondControlPoint.dx,
      secondControlPoint.dy,
      secondEndPoint.dx,
      secondEndPoint.dy,
    );
    
    // Left edge back to start
    path.lineTo(0, 0);
    
    path.close();
    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}