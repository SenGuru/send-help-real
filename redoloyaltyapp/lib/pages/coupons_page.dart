import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../colors.dart';
import '../utils/theme_helper.dart';
import '../providers/app_state_provider.dart';

class CouponsPage extends StatefulWidget {
  const CouponsPage({super.key});

  @override
  State<CouponsPage> createState() => _CouponsPageState();
}

class _CouponsPageState extends State<CouponsPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
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
              'My Coupons',
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
            bottom: TabBar(
              controller: _tabController,
              labelColor: ThemeHelper.getButtonTextColor(appState.theme),
              unselectedLabelColor: ThemeHelper.getBackgroundColor(appState.theme),
              indicatorColor: ThemeHelper.getButtonTextColor(appState.theme),
              indicatorWeight: 3.h,
              labelStyle: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
              ),
              unselectedLabelStyle: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w400,
              ),
              tabs: const [
                Tab(text: 'Available'),
                Tab(text: 'Used'),
                Tab(text: 'Expired'),
              ],
            ),
          ),
          body: TabBarView(
            controller: _tabController,
            children: [
              _buildAvailableCoupons(appState),
              _buildUsedCoupons(appState),
              _buildExpiredCoupons(appState),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAvailableCoupons(AppStateProvider appState) {
    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 20.h),
      itemCount: 5,
      itemBuilder: (context, index) {
        return _buildCouponCard(
          title: _getAvailableCouponTitle(index),
          discount: _getAvailableCouponDiscount(index),
          description: _getAvailableCouponDescription(index),
          validUntil: _getAvailableCouponExpiry(index),
          minPurchase: _getAvailableCouponMinPurchase(index),
          isAvailable: true,
          appState: appState,
          onTap: () {
            Navigator.pushNamed(
              context,
              '/coupon-details',
              arguments: {
                'title': _getAvailableCouponTitle(index),
                'discount': _getAvailableCouponDiscount(index),
                'description': _getAvailableCouponDescription(index),
                'validUntil': _getAvailableCouponExpiry(index),
                'minPurchase': _getAvailableCouponMinPurchase(index),
                'isAvailable': true,
              },
            );
          },
        );
      },
    );
  }

  Widget _buildUsedCoupons(AppStateProvider appState) {
    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 20.h),
      itemCount: 3,
      itemBuilder: (context, index) {
        return _buildCouponCard(
          title: 'Black Friday Special',
          discount: '${25 + index * 5}% OFF',
          description: 'Special discount for Black Friday',
          validUntil: 'Used on Nov ${20 + index}, 2025',
          minPurchase: 'Minimum purchase \${30 + index * 10}',
          isAvailable: false,
          isUsed: true,
          appState: appState,
          onTap: () {},
        );
      },
    );
  }

  Widget _buildExpiredCoupons(AppStateProvider appState) {
    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 20.h),
      itemCount: 2,
      itemBuilder: (context, index) {
        return _buildCouponCard(
          title: 'Summer Sale',
          discount: '${15 + index * 10}% OFF',
          description: 'Summer collection discount',
          validUntil: 'Expired on Oct ${15 + index * 5}, 2025',
          minPurchase: 'Minimum purchase ${20 + index * 15}',
          isAvailable: false,
          isExpired: true,
          appState: appState,
          onTap: () {},
        );
      },
    );
  }

  Widget _buildCouponCard({
    required String title,
    required String discount,
    required String description,
    required String validUntil,
    required String minPurchase,
    required bool isAvailable,
    required AppStateProvider appState,
    bool isUsed = false,
    bool isExpired = false,
    required VoidCallback onTap,
  }) {
    Color cardColor = ThemeHelper.getCardBackgroundColor(appState.theme);
    Color borderColor = ThemeHelper.getPrimaryColor(appState.theme);
    Color discountColor = ThemeHelper.getPrimaryColor(appState.theme);
    
    if (isUsed) {
      cardColor = AppColors.softGrey;
      borderColor = ThemeHelper.getSubtitleTextColor(appState.theme);
      discountColor = ThemeHelper.getSubtitleTextColor(appState.theme);
    } else if (isExpired) {
      cardColor = ThemeHelper.getBorderColor(appState.theme).withOpacity(0.5);
      borderColor = ThemeHelper.getErrorColor(appState.theme);
      discountColor = ThemeHelper.getErrorColor(appState.theme);
    }

    return GestureDetector(
      onTap: isAvailable ? onTap : null,
      child: Container(
        margin: EdgeInsets.only(bottom: 16.h),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(
            color: borderColor.withOpacity(0.3),
            width: 1.w,
          ),
          boxShadow: isAvailable ? [
            BoxShadow(
              color: AppColors.shadowColor,
              blurRadius: 8.r,
              offset: Offset(0, 2.h),
            ),
          ] : [],
        ),
        child: Row(
          children: [
            // Left side - Discount
            Container(
              width: 120.w,
              padding: EdgeInsets.symmetric(vertical: 24.h),
              decoration: BoxDecoration(
                color: discountColor.withOpacity(0.1),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(16.r),
                  bottomLeft: Radius.circular(16.r),
                ),
                border: Border(
                  right: BorderSide(
                    color: borderColor.withOpacity(0.3),
                    width: 1.w,
                  ),
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.local_offer,
                    color: discountColor,
                    size: 32.r,
                  ),
                  SizedBox(height: 8.h),
                  Text(
                    discount,
                    style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.bold,
                      color: discountColor,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  if (isUsed)
                    Container(
                      margin: EdgeInsets.only(top: 8.h),
                      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                      decoration: BoxDecoration(
                        color: ThemeHelper.getSubtitleTextColor(appState.theme),
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: Text(
                        'USED',
                        style: TextStyle(
                          fontSize: 10.sp,
                          fontWeight: FontWeight.bold,
                          color: ThemeHelper.getButtonTextColor(appState.theme),
                        ),
                      ),
                    ),
                  if (isExpired)
                    Container(
                      margin: EdgeInsets.only(top: 8.h),
                      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                      decoration: BoxDecoration(
                        color: ThemeHelper.getErrorColor(appState.theme),
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: Text(
                        'EXPIRED',
                        style: TextStyle(
                          fontSize: 10.sp,
                          fontWeight: FontWeight.bold,
                          color: ThemeHelper.getButtonTextColor(appState.theme),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            
            // Right side - Details
            Expanded(
              child: Padding(
                padding: EdgeInsets.all(20.r),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.bold,
                        color: isAvailable ? ThemeHelper.getMainTextColor(appState.theme) : ThemeHelper.getSubtitleTextColor(appState.theme),
                      ),
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      description,
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: isAvailable ? ThemeHelper.getSubtitleTextColor(appState.theme) : ThemeHelper.getSubtitleTextColor(appState.theme).withOpacity(0.7),
                      ),
                    ),
                    SizedBox(height: 12.h),
                    Row(
                      children: [
                        Icon(
                          Icons.access_time,
                          size: 16.r,
                          color: isAvailable ? ThemeHelper.getSubtitleTextColor(appState.theme) : ThemeHelper.getSubtitleTextColor(appState.theme).withOpacity(0.7),
                        ),
                        SizedBox(width: 6.w),
                        Text(
                          validUntil,
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: isAvailable ? ThemeHelper.getSubtitleTextColor(appState.theme) : ThemeHelper.getSubtitleTextColor(appState.theme).withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 6.h),
                    Row(
                      children: [
                        Icon(
                          Icons.shopping_cart,
                          size: 16.r,
                          color: isAvailable ? ThemeHelper.getSubtitleTextColor(appState.theme) : ThemeHelper.getSubtitleTextColor(appState.theme).withOpacity(0.7),
                        ),
                        SizedBox(width: 6.w),
                        Text(
                          minPurchase,
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: isAvailable ? ThemeHelper.getSubtitleTextColor(appState.theme) : ThemeHelper.getSubtitleTextColor(appState.theme).withOpacity(0.7),
                          ),
                        ),
                      ],
                    ),
                    if (isAvailable) ...[
                      SizedBox(height: 16.h),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: onTap,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
                            padding: EdgeInsets.symmetric(vertical: 12.h),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.r),
                            ),
                          ),
                          child: Text(
                            'Use Coupon',
                            style: TextStyle(
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w600,
                              color: ThemeHelper.getButtonTextColor(appState.theme),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getAvailableCouponTitle(int index) {
    List<String> titles = [
      'Welcome Bonus',
      'Birthday Special',
      'Weekend Deal',
      'Member Exclusive',
      'Flash Sale',
    ];
    return titles[index % titles.length];
  }

  String _getAvailableCouponDiscount(int index) {
    List<String> discounts = [
      '20% OFF',
      '15% OFF',
      'Buy 1 Get 1',
      '30% OFF',
      '\$10 OFF',
    ];
    return discounts[index % discounts.length];
  }

  String _getAvailableCouponDescription(int index) {
    List<String> descriptions = [
      'Welcome to our loyalty program',
      'Happy birthday! Enjoy your special discount',
      'Weekend exclusive offer',
      'Special discount for gold members',
      'Limited time flash sale offer',
    ];
    return descriptions[index % descriptions.length];
  }

  String _getAvailableCouponExpiry(int index) {
    List<String> expiries = [
      'Valid until Dec 31, 2025',
      'Valid until Jan 15, 2026',
      'Valid until Dec 28, 2025',
      'Valid until Dec 25, 2025',
      'Valid until Dec 20, 2025',
    ];
    return expiries[index % expiries.length];
  }

  String _getAvailableCouponMinPurchase(int index) {
    List<String> minimums = [
      'Minimum purchase \$50',
      'Minimum purchase \$30',
      'No minimum purchase',
      'Minimum purchase \$75',
      'Minimum purchase \$25',
    ];
    return minimums[index % minimums.length];
  }
}