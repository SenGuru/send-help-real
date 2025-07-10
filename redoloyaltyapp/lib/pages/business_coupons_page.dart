import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../utils/theme_helper.dart';
import '../providers/app_state_provider.dart';
import '../services/auth_service.dart';
import '../colors.dart';

class BusinessCouponsPage extends StatefulWidget {
  const BusinessCouponsPage({super.key});

  @override
  State<BusinessCouponsPage> createState() => _BusinessCouponsPageState();
}

class _BusinessCouponsPageState extends State<BusinessCouponsPage> with TickerProviderStateMixin {
  late TabController _tabController;
  List<Map<String, dynamic>> _activeCoupons = [];
  List<Map<String, dynamic>> _expiredCoupons = [];
  bool _isLoading = true;
  String _businessName = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadBusinessInfo();
    _loadCoupons();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadBusinessInfo() async {
    try {
      final authService = AuthService();
      final businessCode = authService.currentBusinessCode;
      
      if (businessCode != null) {
        final response = await authService.getBusinessInfo(businessCode);
        if (response != null && response['success'] == true) {
          setState(() {
            _businessName = response['data']['name'] ?? 'Business';
          });
        }
      }
    } catch (e) {
      debugPrint('Error loading business info: $e');
    }
  }

  Future<void> _loadCoupons() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authService = AuthService();
      final businessCode = authService.currentBusinessCode;
      
      if (businessCode != null) {
        // TODO: Implement getBusinessCoupons API method
        final response = null; // await authService.getBusinessCoupons(businessCode);
        
        if (response != null && response['success'] == true) {
          final coupons = List<Map<String, dynamic>>.from(response['data'] ?? []);
          
          setState(() {
            _activeCoupons = coupons.where((coupon) => 
              coupon['status'] == 'active' || coupon['status'] == 'available').toList();
            _expiredCoupons = coupons.where((coupon) => 
              coupon['status'] == 'expired' || coupon['status'] == 'inactive').toList();
            _isLoading = false;
          });
        } else {
          // Mock data for demo - business specific
          setState(() {
            _activeCoupons = [
              {
                'id': 'coup_001',
                'title': '20% Off Your Next Purchase',
                'description': 'Get 20% discount on any item in our store',
                'discount': '20%',
                'discountType': 'percentage',
                'minPurchase': 25.00,
                'maxDiscount': 50.00,
                'expiryDate': '2024-08-15',
                'usageCount': 45,
                'maxUsage': 100,
                'status': 'active',
                'createdDate': '2024-07-01',
              },
              {
                'id': 'coup_002',
                'title': '\$10 Off Purchase',
                'description': 'Get \$10 off on purchases over \$50',
                'discount': '10.00',
                'discountType': 'fixed_amount',
                'minPurchase': 50.00,
                'maxDiscount': 10.00,
                'expiryDate': '2024-08-01',
                'usageCount': 23,
                'maxUsage': 50,
                'status': 'active',
                'createdDate': '2024-06-15',
              },
              {
                'id': 'coup_003',
                'title': 'Free Item with Purchase',
                'description': 'Get a free item with any purchase over \$30',
                'discount': 'Free Item',
                'discountType': 'freebie',
                'minPurchase': 30.00,
                'maxDiscount': 15.00,
                'expiryDate': '2024-07-25',
                'usageCount': 12,
                'maxUsage': 25,
                'status': 'active',
                'createdDate': '2024-07-10',
              },
            ];
            _expiredCoupons = [
              {
                'id': 'coup_004',
                'title': '15% Summer Sale',
                'description': 'Summer season discount on all items',
                'discount': '15%',
                'discountType': 'percentage',
                'minPurchase': 20.00,
                'maxDiscount': 30.00,
                'expiryDate': '2024-06-30',
                'usageCount': 67,
                'maxUsage': 75,
                'status': 'expired',
                'createdDate': '2024-06-01',
              },
              {
                'id': 'coup_005',
                'title': 'Buy One Get One Free',
                'description': 'BOGO offer on selected items',
                'discount': 'BOGO',
                'discountType': 'bogo',
                'minPurchase': 0.00,
                'maxDiscount': 25.00,
                'expiryDate': '2024-06-15',
                'usageCount': 34,
                'maxUsage': 40,
                'status': 'expired',
                'createdDate': '2024-05-15',
              },
            ];
            _isLoading = false;
          });
        }
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
    return Consumer<AppStateProvider>(
      builder: (context, appState, child) {
        return Scaffold(
          backgroundColor: ThemeHelper.getBackgroundColor(appState.theme),
          body: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  ThemeHelper.getBackgroundColor(appState.theme),
                  ThemeHelper.getBackgroundColor(appState.theme).withValues(alpha: 0.8),
                ],
              ),
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
                              color: ThemeHelper.getCardBackgroundColor(appState.theme),
                              borderRadius: BorderRadius.circular(12.r),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.shadowColor.withValues(alpha: 0.1),
                                  blurRadius: 8.r,
                                  offset: Offset(0, 2.h),
                                ),
                              ],
                            ),
                            child: Icon(
                              Icons.arrow_back_ios_rounded,
                              color: ThemeHelper.getMainTextColor(appState.theme),
                              size: 20.r,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Text(
                            'Coupons & Offers',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 20.sp,
                              fontWeight: FontWeight.bold,
                              color: ThemeHelper.getMainTextColor(appState.theme),
                            ),
                          ),
                        ),
                        SizedBox(width: 36.w), // Balance the back button
                      ],
                    ),
                  ),

                  // Business Name
                  if (_businessName.isNotEmpty)
                    Container(
                      margin: EdgeInsets.symmetric(horizontal: 24.w),
                      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            ThemeHelper.getPrimaryColor(appState.theme),
                            ThemeHelper.getPrimaryColor(appState.theme).withValues(alpha: 0.8),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(20.r),
                      ),
                      child: Text(
                        _businessName,
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),

                  SizedBox(height: 24.h),

                  // Tab Bar
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 24.w),
                    decoration: BoxDecoration(
                      color: ThemeHelper.getCardBackgroundColor(appState.theme),
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: TabBar(
                      controller: _tabController,
                      labelColor: Colors.white,
                      unselectedLabelColor: ThemeHelper.getSubtitleTextColor(appState.theme),
                      indicator: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            ThemeHelper.getPrimaryColor(appState.theme),
                            ThemeHelper.getPrimaryColor(appState.theme).withValues(alpha: 0.8),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      indicatorSize: TabBarIndicatorSize.tab,
                      dividerColor: Colors.transparent,
                      tabs: [
                        Tab(
                          child: Text(
                            'Active',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        Tab(
                          child: Text(
                            'Expired',
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
                        _buildActiveCoupons(appState),
                        _buildExpiredCoupons(appState),
                      ],
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

  Widget _buildActiveCoupons(AppStateProvider appState) {
    if (_isLoading) {
      return Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(ThemeHelper.getPrimaryColor(appState.theme)),
        ),
      );
    }

    if (_activeCoupons.isEmpty) {
      return _buildEmptyState(
        appState: appState,
        icon: Icons.local_offer_outlined,
        title: 'No Active Coupons',
        subtitle: 'Create new coupons to attract more customers',
      );
    }

    return RefreshIndicator(
      onRefresh: _loadCoupons,
      child: ListView.builder(
        padding: EdgeInsets.symmetric(horizontal: 24.w),
        itemCount: _activeCoupons.length,
        itemBuilder: (context, index) {
          final coupon = _activeCoupons[index];
          return _buildActiveCouponCard(coupon, appState);
        },
      ),
    );
  }

  Widget _buildExpiredCoupons(AppStateProvider appState) {
    if (_isLoading) {
      return Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(ThemeHelper.getPrimaryColor(appState.theme)),
        ),
      );
    }

    if (_expiredCoupons.isEmpty) {
      return _buildEmptyState(
        appState: appState,
        icon: Icons.history,
        title: 'No Expired Coupons',
        subtitle: 'Your expired coupons will appear here',
      );
    }

    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 24.w),
      itemCount: _expiredCoupons.length,
      itemBuilder: (context, index) {
        final coupon = _expiredCoupons[index];
        return _buildExpiredCouponCard(coupon, appState);
      },
    );
  }

  Widget _buildActiveCouponCard(Map<String, dynamic> coupon, AppStateProvider appState) {
    final usagePercentage = (coupon['usageCount'] ?? 0) / (coupon['maxUsage'] ?? 1);
    
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      decoration: BoxDecoration(
        color: ThemeHelper.getCardBackgroundColor(appState.theme),
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowColor.withValues(alpha: 0.1),
            blurRadius: 10.r,
            offset: Offset(0, 4.h),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.pushNamed(
              context,
              '/business-coupon-details',
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
                        gradient: LinearGradient(
                          colors: [
                            ThemeHelper.getPrimaryColor(appState.theme),
                            ThemeHelper.getPrimaryColor(appState.theme).withValues(alpha: 0.8),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: Icon(
                        Icons.local_offer,
                        color: Colors.white,
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
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.bold,
                              color: ThemeHelper.getMainTextColor(appState.theme),
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          SizedBox(height: 4.h),
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                            decoration: BoxDecoration(
                              color: ThemeHelper.getSuccessColor(appState.theme).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12.r),
                            ),
                            child: Text(
                              'ACTIVE',
                              style: TextStyle(
                                fontSize: 10.sp,
                                fontWeight: FontWeight.w600,
                                color: ThemeHelper.getSuccessColor(appState.theme),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            ThemeHelper.getAccentColor(appState.theme),
                            ThemeHelper.getAccentColor(appState.theme).withValues(alpha: 0.8),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(20.r),
                      ),
                      child: Text(
                        coupon['discount'] ?? '',
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 16.h),
                Text(
                  coupon['description'] ?? '',
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: ThemeHelper.getSubtitleTextColor(appState.theme),
                    height: 1.4,
                  ),
                ),
                SizedBox(height: 16.h),
                
                // Usage Progress
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Usage: ${coupon['usageCount']}/${coupon['maxUsage']}',
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: ThemeHelper.getSubtitleTextColor(appState.theme),
                          ),
                        ),
                        Text(
                          '${(usagePercentage * 100).toInt()}%',
                          style: TextStyle(
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w600,
                            color: ThemeHelper.getPrimaryColor(appState.theme),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8.h),
                    LinearProgressIndicator(
                      value: usagePercentage,
                      backgroundColor: ThemeHelper.getBorderColor(appState.theme),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        ThemeHelper.getPrimaryColor(appState.theme),
                      ),
                      borderRadius: BorderRadius.circular(4.r),
                    ),
                  ],
                ),
                
                SizedBox(height: 16.h),
                Row(
                  children: [
                    Icon(
                      Icons.access_time,
                      size: 16.r,
                      color: ThemeHelper.getSubtitleTextColor(appState.theme),
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      'Expires: ${coupon['expiryDate'] ?? ''}',
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: ThemeHelper.getSubtitleTextColor(appState.theme),
                      ),
                    ),
                    Spacer(),
                    if (coupon['minPurchase'] != null && coupon['minPurchase'] > 0)
                      Text(
                        'Min. \$${coupon['minPurchase'].toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: ThemeHelper.getSubtitleTextColor(appState.theme),
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

  Widget _buildExpiredCouponCard(Map<String, dynamic> coupon, AppStateProvider appState) {
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      decoration: BoxDecoration(
        color: ThemeHelper.getCardBackgroundColor(appState.theme).withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: ThemeHelper.getBorderColor(appState.theme),
        ),
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
                    color: ThemeHelper.getSubtitleTextColor(appState.theme).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: Icon(
                    Icons.schedule,
                    color: ThemeHelper.getSubtitleTextColor(appState.theme),
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
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.bold,
                          color: ThemeHelper.getSubtitleTextColor(appState.theme),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 4.h),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                        decoration: BoxDecoration(
                          color: ThemeHelper.getSubtitleTextColor(appState.theme).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Text(
                          'EXPIRED',
                          style: TextStyle(
                            fontSize: 10.sp,
                            fontWeight: FontWeight.w600,
                            color: ThemeHelper.getSubtitleTextColor(appState.theme),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  '${coupon['usageCount']}/${coupon['maxUsage']} used',
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: ThemeHelper.getSubtitleTextColor(appState.theme),
                  ),
                ),
              ],
            ),
            SizedBox(height: 16.h),
            Text(
              coupon['description'] ?? '',
              style: TextStyle(
                fontSize: 14.sp,
                color: ThemeHelper.getSubtitleTextColor(appState.theme),
                height: 1.4,
              ),
            ),
            SizedBox(height: 16.h),
            Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 16.r,
                  color: ThemeHelper.getSubtitleTextColor(appState.theme),
                ),
                SizedBox(width: 8.w),
                Text(
                  'Expired: ${coupon['expiryDate'] ?? ''}',
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: ThemeHelper.getSubtitleTextColor(appState.theme),
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
    required AppStateProvider appState,
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
                color: ThemeHelper.getPrimaryColor(appState.theme).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(30.r),
              ),
              child: Icon(
                icon,
                size: 64.w,
                color: ThemeHelper.getPrimaryColor(appState.theme),
              ),
            ),
            SizedBox(height: 24.h),
            Text(
              title,
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.bold,
                color: ThemeHelper.getMainTextColor(appState.theme),
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 12.h),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 16.sp,
                color: ThemeHelper.getSubtitleTextColor(appState.theme),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}