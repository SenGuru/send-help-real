import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../utils/theme_helper.dart';
import '../providers/app_state_provider.dart';
import '../services/auth_service.dart';
import '../colors.dart';

class BusinessTransactionsPage extends StatefulWidget {
  const BusinessTransactionsPage({super.key});

  @override
  State<BusinessTransactionsPage> createState() => _BusinessTransactionsPageState();
}

class _BusinessTransactionsPageState extends State<BusinessTransactionsPage> {
  List<Map<String, dynamic>> _transactions = [];
  bool _isLoading = true;
  String _selectedFilter = 'all';
  String _businessName = '';
  Map<String, dynamic> _stats = {};

  @override
  void initState() {
    super.initState();
    _loadBusinessInfo();
    _loadTransactions();
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

  Future<void> _loadTransactions() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authService = AuthService();
      final businessCode = authService.currentBusinessCode;
      
      if (businessCode != null) {
        // TODO: Implement getBusinessTransactions API method
        final response = null; // await authService.getBusinessTransactions(businessCode);
        
        if (response != null && response['success'] == true) {
          final transactions = List<Map<String, dynamic>>.from(response['data'] ?? []);
          
          setState(() {
            _transactions = transactions;
            _calculateStats();
            _isLoading = false;
          });
        } else {
          // Mock data for demo - business specific
          setState(() {
            _transactions = [
              {
                'id': 'txn_001',
                'customerName': 'John Doe',
                'customerPhone': '+1 (555) 123-4567',
                'date': '2024-07-08',
                'time': '14:30',
                'amount': 25.50,
                'pointsAwarded': 26,
                'type': 'purchase',
                'status': 'completed',
                'description': 'Coffee & Pastry',
                'items': [
                  {'name': 'Cappuccino', 'price': 4.50, 'quantity': 1},
                  {'name': 'Croissant', 'price': 3.50, 'quantity': 1},
                  {'name': 'Latte', 'price': 5.00, 'quantity': 1},
                  {'name': 'Muffin', 'price': 2.50, 'quantity': 5},
                ],
                'paymentMethod': 'Credit Card',
              },
              {
                'id': 'txn_002',
                'customerName': 'Jane Smith',
                'customerPhone': '+1 (555) 987-6543',
                'date': '2024-07-08',
                'time': '11:15',
                'amount': 0.00,
                'pointsRedeemed': 150,
                'type': 'redemption',
                'status': 'completed',
                'description': 'Points Redemption',
                'redeemedItem': 'Free Coffee',
                'redeemedValue': 5.50,
              },
              {
                'id': 'txn_003',
                'customerName': 'Mike Johnson',
                'customerPhone': '+1 (555) 456-7890',
                'date': '2024-07-07',
                'time': '16:45',
                'amount': 42.75,
                'pointsAwarded': 43,
                'type': 'purchase',
                'status': 'completed',
                'description': 'Lunch Order',
                'items': [
                  {'name': 'Sandwich', 'price': 12.50, 'quantity': 2},
                  {'name': 'Soup', 'price': 8.75, 'quantity': 1},
                  {'name': 'Salad', 'price': 9.00, 'quantity': 1},
                ],
                'paymentMethod': 'Debit Card',
              },
              {
                'id': 'txn_004',
                'customerName': 'Sarah Wilson',
                'customerPhone': '+1 (555) 234-5678',
                'date': '2024-07-07',
                'time': '09:20',
                'amount': 18.25,
                'pointsAwarded': 18,
                'type': 'purchase',
                'status': 'completed',
                'description': 'Morning Coffee',
                'items': [
                  {'name': 'Americano', 'price': 3.75, 'quantity': 2},
                  {'name': 'Danish', 'price': 4.00, 'quantity': 1},
                  {'name': 'Orange Juice', 'price': 6.75, 'quantity': 1},
                ],
                'paymentMethod': 'Cash',
              },
              {
                'id': 'txn_005',
                'customerName': 'David Brown',
                'customerPhone': '+1 (555) 345-6789',
                'date': '2024-07-06',
                'time': '13:30',
                'amount': 0.00,
                'pointsRedeemed': 200,
                'type': 'redemption',
                'status': 'completed',
                'description': 'Points Redemption',
                'redeemedItem': 'Free Lunch',
                'redeemedValue': 15.00,
              },
              {
                'id': 'txn_006',
                'customerName': 'Emily Davis',
                'customerPhone': '+1 (555) 567-8901',
                'date': '2024-07-06',
                'time': '10:00',
                'amount': 32.80,
                'pointsAwarded': 33,
                'type': 'purchase',
                'status': 'completed',
                'description': 'Family Breakfast',
                'items': [
                  {'name': 'Pancakes', 'price': 8.50, 'quantity': 2},
                  {'name': 'Coffee', 'price': 3.75, 'quantity': 3},
                  {'name': 'Orange Juice', 'price': 4.55, 'quantity': 2},
                ],
                'paymentMethod': 'Credit Card',
              },
            ];
            _calculateStats();
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Error loading transactions: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _calculateStats() {
    final purchases = _transactions.where((t) => t['type'] == 'purchase').toList();
    final redemptions = _transactions.where((t) => t['type'] == 'redemption').toList();
    
    final totalRevenue = purchases.fold<double>(0.0, (sum, t) => sum + (t['amount'] ?? 0.0));
    final totalPointsAwarded = purchases.fold<int>(0, (sum, t) => sum + ((t['pointsAwarded'] ?? 0) as int));
    final totalPointsRedeemed = redemptions.fold<int>(0, (sum, t) => sum + ((t['pointsRedeemed'] ?? 0) as int));
    final totalRedemptionValue = redemptions.fold<double>(0.0, (sum, t) => sum + (t['redeemedValue'] ?? 0.0));
    
    setState(() {
      _stats = {
        'totalRevenue': totalRevenue,
        'totalTransactions': _transactions.length,
        'totalPointsAwarded': totalPointsAwarded,
        'totalPointsRedeemed': totalPointsRedeemed,
        'totalRedemptionValue': totalRedemptionValue,
        'averageTransactionValue': purchases.isNotEmpty ? totalRevenue / purchases.length : 0.0,
      };
    });
  }

  List<Map<String, dynamic>> get _filteredTransactions {
    if (_selectedFilter == 'all') {
      return _transactions;
    } else if (_selectedFilter == 'purchases') {
      return _transactions.where((t) => t['type'] == 'purchase').toList();
    } else if (_selectedFilter == 'redemptions') {
      return _transactions.where((t) => t['type'] == 'redemption').toList();
    }
    return _transactions;
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
                            'Transactions',
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

                  // Stats Cards
                  if (!_isLoading && _stats.isNotEmpty)
                    Container(
                      height: 120.h,
                      margin: EdgeInsets.symmetric(horizontal: 24.w),
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          _buildStatCard(
                            appState,
                            'Revenue',
                            '\$${_stats['totalRevenue']?.toStringAsFixed(2) ?? '0.00'}',
                            Icons.attach_money,
                            ThemeHelper.getSuccessColor(appState.theme),
                          ),
                          SizedBox(width: 16.w),
                          _buildStatCard(
                            appState,
                            'Transactions',
                            '${_stats['totalTransactions'] ?? 0}',
                            Icons.receipt,
                            ThemeHelper.getPrimaryColor(appState.theme),
                          ),
                          SizedBox(width: 16.w),
                          _buildStatCard(
                            appState,
                            'Points Awarded',
                            '${_stats['totalPointsAwarded'] ?? 0}',
                            Icons.star,
                            ThemeHelper.getAccentColor(appState.theme),
                          ),
                          SizedBox(width: 16.w),
                          _buildStatCard(
                            appState,
                            'Avg. Transaction',
                            '\$${_stats['averageTransactionValue']?.toStringAsFixed(2) ?? '0.00'}',
                            Icons.trending_up,
                            ThemeHelper.getInfoColor(appState.theme),
                          ),
                        ],
                      ),
                    ),

                  SizedBox(height: 24.h),

                  // Filter Chips
                  Container(
                    height: 50.h,
                    margin: EdgeInsets.symmetric(horizontal: 24.w),
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        _buildFilterChip(appState, 'All', 'all'),
                        SizedBox(width: 12.w),
                        _buildFilterChip(appState, 'Purchases', 'purchases'),
                        SizedBox(width: 12.w),
                        _buildFilterChip(appState, 'Redemptions', 'redemptions'),
                      ],
                    ),
                  ),

                  SizedBox(height: 24.h),

                  // Content
                  Expanded(
                    child: _isLoading
                        ? Center(
                            child: CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(ThemeHelper.getPrimaryColor(appState.theme)),
                            ),
                          )
                        : _filteredTransactions.isEmpty
                            ? _buildEmptyState(appState)
                            : RefreshIndicator(
                                onRefresh: _loadTransactions,
                                child: ListView.builder(
                                  padding: EdgeInsets.symmetric(horizontal: 24.w),
                                  itemCount: _filteredTransactions.length,
                                  itemBuilder: (context, index) {
                                    final transaction = _filteredTransactions[index];
                                    return _buildTransactionCard(transaction, appState);
                                  },
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

  Widget _buildStatCard(AppStateProvider appState, String label, String value, IconData icon, Color color) {
    return Container(
      width: 140.w,
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: ThemeHelper.getCardBackgroundColor(appState.theme),
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowColor.withValues(alpha: 0.1),
            blurRadius: 8.r,
            offset: Offset(0, 4.h),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: EdgeInsets.all(8.w),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8.r),
            ),
            child: Icon(
              icon,
              color: color,
              size: 20.w,
            ),
          ),
          SizedBox(height: 12.h),
          Text(
            value,
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: ThemeHelper.getMainTextColor(appState.theme),
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 12.sp,
              color: ThemeHelper.getSubtitleTextColor(appState.theme),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(AppStateProvider appState, String label, String value) {
    final isSelected = _selectedFilter == value;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = value;
        });
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
        decoration: BoxDecoration(
          gradient: isSelected ? LinearGradient(
            colors: [
              ThemeHelper.getPrimaryColor(appState.theme),
              ThemeHelper.getPrimaryColor(appState.theme).withValues(alpha: 0.8),
            ],
          ) : null,
          color: isSelected ? null : ThemeHelper.getCardBackgroundColor(appState.theme),
          borderRadius: BorderRadius.circular(25.r),
          border: Border.all(
            color: isSelected ? Colors.transparent : ThemeHelper.getBorderColor(appState.theme),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14.sp,
            fontWeight: FontWeight.w600,
            color: isSelected 
                ? Colors.white
                : ThemeHelper.getMainTextColor(appState.theme),
          ),
        ),
      ),
    );
  }

  Widget _buildTransactionCard(Map<String, dynamic> transaction, AppStateProvider appState) {
    final isPurchase = transaction['type'] == 'purchase';
    final amount = transaction['amount'] ?? 0.0;
    final pointsAwarded = transaction['pointsAwarded'] ?? 0;
    final pointsRedeemed = transaction['pointsRedeemed'] ?? 0;

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
              '/business-transaction-details',
              arguments: {'transaction': transaction},
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
                        gradient: isPurchase 
                            ? LinearGradient(
                                colors: [
                                  ThemeHelper.getPrimaryColor(appState.theme),
                                  ThemeHelper.getPrimaryColor(appState.theme).withValues(alpha: 0.8),
                                ],
                              )
                            : LinearGradient(
                                colors: [
                                  ThemeHelper.getWarningColor(appState.theme),
                                  ThemeHelper.getWarningColor(appState.theme).withValues(alpha: 0.8),
                                ],
                              ),
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: Icon(
                        isPurchase ? Icons.shopping_cart : Icons.redeem,
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
                            transaction['customerName'] ?? 'Unknown Customer',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.bold,
                              color: ThemeHelper.getMainTextColor(appState.theme),
                            ),
                          ),
                          SizedBox(height: 4.h),
                          Text(
                            transaction['description'] ?? '',
                            style: TextStyle(
                              fontSize: 14.sp,
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
                          isPurchase 
                              ? '\$${amount.toStringAsFixed(2)}'
                              : 'FREE',
                          style: TextStyle(
                            fontSize: 16.sp,
                            fontWeight: FontWeight.bold,
                            color: isPurchase 
                                ? ThemeHelper.getSuccessColor(appState.theme)
                                : ThemeHelper.getWarningColor(appState.theme),
                          ),
                        ),
                        SizedBox(height: 4.h),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                          decoration: BoxDecoration(
                            color: isPurchase 
                                ? ThemeHelper.getSuccessColor(appState.theme).withValues(alpha: 0.1)
                                : ThemeHelper.getWarningColor(appState.theme).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                          child: Text(
                            isPurchase 
                                ? '+$pointsAwarded pts'
                                : '-$pointsRedeemed pts',
                            style: TextStyle(
                              fontSize: 10.sp,
                              color: isPurchase 
                                  ? ThemeHelper.getSuccessColor(appState.theme)
                                  : ThemeHelper.getWarningColor(appState.theme),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
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
                      '${transaction['date']} at ${transaction['time']}',
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: ThemeHelper.getSubtitleTextColor(appState.theme),
                      ),
                    ),
                    Spacer(),
                    if (transaction['customerPhone'] != null)
                      Row(
                        children: [
                          Icon(
                            Icons.phone,
                            size: 16.r,
                            color: ThemeHelper.getSubtitleTextColor(appState.theme),
                          ),
                          SizedBox(width: 4.w),
                          Text(
                            transaction['customerPhone'] ?? '',
                            style: TextStyle(
                              fontSize: 12.sp,
                              color: ThemeHelper.getSubtitleTextColor(appState.theme),
                            ),
                          ),
                        ],
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

  Widget _buildEmptyState(AppStateProvider appState) {
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
                Icons.receipt_long,
                size: 64.w,
                color: ThemeHelper.getPrimaryColor(appState.theme),
              ),
            ),
            SizedBox(height: 24.h),
            Text(
              'No Transactions Yet',
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.bold,
                color: ThemeHelper.getMainTextColor(appState.theme),
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 12.h),
            Text(
              'Customer transactions will appear here once you start processing sales',
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