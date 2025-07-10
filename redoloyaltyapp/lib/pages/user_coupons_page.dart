import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../utils/neutral_theme_helper.dart';
// import '../services/auth_service.dart'; // TODO: Uncomment when API methods are implemented

class UserCouponsPage extends StatefulWidget {
  const UserCouponsPage({super.key});

  @override
  State<UserCouponsPage> createState() => _UserCouponsPageState();
}

class _UserCouponsPageState extends State<UserCouponsPage> with TickerProviderStateMixin {
  late TabController _tabController;
  List<Map<String, dynamic>> _availableCoupons = [];
  List<Map<String, dynamic>> _usedCoupons = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadCoupons();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadCoupons() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // TODO: Implement getUserAllCoupons API method
      // final authService = AuthService();
      // final response = await authService.getUserAllCoupons();
      final response = null;
      
      if (response != null && response['success'] == true) {
        final coupons = List<Map<String, dynamic>>.from(response['data'] ?? []);
        
        setState(() {
          _availableCoupons = coupons.where((coupon) => 
            coupon['status'] == 'available' || coupon['status'] == 'active').toList();
          _usedCoupons = coupons.where((coupon) => 
            coupon['status'] == 'used' || coupon['status'] == 'expired').toList();
          _isLoading = false;
        });
      } else {
        // Mock data for demo
        setState(() {
          _availableCoupons = [
            {
              'id': '1',
              'title': '20% Off Your Next Purchase',
              'businessName': 'Coffee Palace',
              'description': 'Get 20% discount on any item',
              'expiryDate': '2024-08-15',
              'discount': '20%',
              'minPurchase': '25.00',
              'status': 'available',
              'type': 'percentage',
            },
            {
              'id': '2',
              'title': 'Free Dessert',
              'businessName': 'Fashion Hub',
              'description': 'Free dessert with any main course',
              'expiryDate': '2024-07-30',
              'discount': 'Free Item',
              'minPurchase': '50.00',
              'status': 'available',
              'type': 'freebie',
            },
            {
              'id': '3',
              'title': '\$10 Off Purchase',
              'businessName': 'Tech Store',
              'description': 'Get \$10 off on purchases over \$100',
              'expiryDate': '2024-08-01',
              'discount': '\$10',
              'minPurchase': '100.00',
              'status': 'available',
              'type': 'fixed_amount',
            },
          ];
          _usedCoupons = [
            {
              'id': '4',
              'title': '15% Off Electronics',
              'businessName': 'Tech Store',
              'description': 'Discount on all electronics',
              'usedDate': '2024-07-05',
              'discount': '15%',
              'savedAmount': '45.00',
              'status': 'used',
              'type': 'percentage',
            },
            {
              'id': '5',
              'title': 'Free Coffee',
              'businessName': 'Coffee Palace',
              'description': 'Free coffee with pastry purchase',
              'usedDate': '2024-06-28',
              'discount': 'Free Item',
              'savedAmount': '5.50',
              'status': 'used',
              'type': 'freebie',
            },
          ];
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading coupons: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

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
                        'My Coupons',
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

              // Tab Bar
              Container(
                margin: EdgeInsets.symmetric(horizontal: 24.w),
                decoration: BoxDecoration(
                  color: NeutralThemeHelper.cardBackgroundColor,
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: TabBar(
                  controller: _tabController,
                  labelColor: NeutralThemeHelper.textOnPrimaryColor,
                  unselectedLabelColor: NeutralThemeHelper.textSecondaryColor,
                  indicator: BoxDecoration(
                    gradient: NeutralThemeHelper.primaryGradient,
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  indicatorSize: TabBarIndicatorSize.tab,
                  dividerColor: Colors.transparent,
                  tabs: [
                    Tab(
                      child: Text(
                        'Available',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    Tab(
                      child: Text(
                        'Used',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 24.h),

              // Tab Content
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildAvailableCoupons(),
                    _buildUsedCoupons(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvailableCoupons() {
    if (_isLoading) {
      return Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(NeutralThemeHelper.accentColor),
        ),
      );
    }

    if (_availableCoupons.isEmpty) {
      return _buildEmptyState(
        icon: Icons.local_offer_outlined,
        title: 'No Available Coupons',
        subtitle: 'Check back later for new offers from your favorite businesses',
      );
    }

    return RefreshIndicator(
      onRefresh: _loadCoupons,
      child: ListView.builder(
        padding: EdgeInsets.symmetric(horizontal: 24.w),
        itemCount: _availableCoupons.length,
        itemBuilder: (context, index) {
          final coupon = _availableCoupons[index];
          return _buildAvailableCouponCard(coupon);
        },
      ),
    );
  }

  Widget _buildUsedCoupons() {
    if (_isLoading) {
      return Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(NeutralThemeHelper.accentColor),
        ),
      );
    }

    if (_usedCoupons.isEmpty) {
      return _buildEmptyState(
        icon: Icons.history,
        title: 'No Used Coupons',
        subtitle: 'Your coupon usage history will appear here',
      );
    }

    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 24.w),
      itemCount: _usedCoupons.length,
      itemBuilder: (context, index) {
        final coupon = _usedCoupons[index];
        return _buildUsedCouponCard(coupon);
      },
    );
  }

  Widget _buildAvailableCouponCard(Map<String, dynamic> coupon) {
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      decoration: NeutralThemeHelper.cardDecoration.copyWith(
        borderRadius: BorderRadius.circular(16.r),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.pushNamed(
              context,
              '/coupon-details',
              arguments: {'coupon': coupon},
            );
          },
          borderRadius: BorderRadius.circular(16.r),
          child: Padding(
            padding: EdgeInsets.all(20.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(12.w),
                      decoration: BoxDecoration(
                        gradient: NeutralThemeHelper.primaryGradient,
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: Icon(
                        Icons.local_offer,
                        color: NeutralThemeHelper.textOnPrimaryColor,
                        size: 24.w,
                      ),
                    ),
                    SizedBox(width: 16.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            coupon['title'] ?? '',
                            style: NeutralThemeHelper.headingSmall.copyWith(
                              fontSize: 16.sp,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          SizedBox(height: 4.h),
                          Text(
                            coupon['businessName'] ?? '',
                            style: NeutralThemeHelper.bodyMedium.copyWith(
                              fontSize: 14.sp,
                              color: NeutralThemeHelper.accentColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                      decoration: BoxDecoration(
                        color: NeutralThemeHelper.successColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20.r),
                      ),
                      child: Text(
                        coupon['discount'] ?? '',
                        style: NeutralThemeHelper.labelMedium.copyWith(
                          fontSize: 12.sp,
                          color: NeutralThemeHelper.successColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 16.h),
                Text(
                  coupon['description'] ?? '',
                  style: NeutralThemeHelper.bodyMedium.copyWith(
                    fontSize: 14.sp,
                    height: 1.4,
                  ),
                ),
                SizedBox(height: 16.h),
                Row(
                  children: [
                    Icon(
                      Icons.access_time,
                      size: 16.r,
                      color: NeutralThemeHelper.textSecondaryColor,
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      'Expires: ${coupon['expiryDate'] ?? ''}',
                      style: NeutralThemeHelper.bodySmall.copyWith(
                        fontSize: 12.sp,
                        color: NeutralThemeHelper.textSecondaryColor,
                      ),
                    ),
                    Spacer(),
                    if (coupon['minPurchase'] != null && coupon['minPurchase'] != '0')
                      Text(
                        'Min. \$${coupon['minPurchase']}',
                        style: NeutralThemeHelper.bodySmall.copyWith(
                          fontSize: 12.sp,
                          color: NeutralThemeHelper.textSecondaryColor,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildUsedCouponCard(Map<String, dynamic> coupon) {
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      decoration: NeutralThemeHelper.cardDecoration.copyWith(
        borderRadius: BorderRadius.circular(16.r),
        color: NeutralThemeHelper.cardBackgroundColor.withValues(alpha: 0.6),
      ),
      child: Padding(
        padding: EdgeInsets.all(20.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: EdgeInsets.all(12.w),
                  decoration: BoxDecoration(
                    color: NeutralThemeHelper.textSecondaryColor.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: Icon(
                    Icons.check_circle,
                    color: NeutralThemeHelper.successColor,
                    size: 24.w,
                  ),
                ),
                SizedBox(width: 16.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        coupon['title'] ?? '',
                        style: NeutralThemeHelper.headingSmall.copyWith(
                          fontSize: 16.sp,
                          color: NeutralThemeHelper.textSecondaryColor,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 4.h),
                      Text(
                        coupon['businessName'] ?? '',
                        style: NeutralThemeHelper.bodyMedium.copyWith(
                          fontSize: 14.sp,
                          color: NeutralThemeHelper.accentColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                  decoration: BoxDecoration(
                    color: NeutralThemeHelper.successColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20.r),
                  ),
                  child: Text(
                    'Saved \$${coupon['savedAmount'] ?? '0'}',
                    style: NeutralThemeHelper.labelMedium.copyWith(
                      fontSize: 12.sp,
                      color: NeutralThemeHelper.successColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 16.h),
            Text(
              coupon['description'] ?? '',
              style: NeutralThemeHelper.bodyMedium.copyWith(
                fontSize: 14.sp,
                color: NeutralThemeHelper.textSecondaryColor,
                height: 1.4,
              ),
            ),
            SizedBox(height: 16.h),
            Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 16.r,
                  color: NeutralThemeHelper.textSecondaryColor,
                ),
                SizedBox(width: 8.w),
                Text(
                  'Used on: ${coupon['usedDate'] ?? ''}',
                  style: NeutralThemeHelper.bodySmall.copyWith(
                    fontSize: 12.sp,
                    color: NeutralThemeHelper.textSecondaryColor,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(32.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: EdgeInsets.all(24.w),
              decoration: BoxDecoration(
                color: NeutralThemeHelper.accentColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(30.r),
              ),
              child: Icon(
                icon,
                size: 64.w,
                color: NeutralThemeHelper.accentColor,
              ),
            ),
            SizedBox(height: 24.h),
            Text(
              title,
              style: NeutralThemeHelper.headingMedium.copyWith(
                fontSize: 20.sp,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 12.h),
            Text(
              subtitle,
              style: NeutralThemeHelper.bodyMedium.copyWith(
                fontSize: 16.sp,
                color: NeutralThemeHelper.textSecondaryColor,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}