import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../utils/neutral_theme_helper.dart';
// import '../services/auth_service.dart'; // TODO: Uncomment when API methods are implemented

class UserTransactionsPage extends StatefulWidget {
  const UserTransactionsPage({super.key});

  @override
  State<UserTransactionsPage> createState() => _UserTransactionsPageState();
}

class _UserTransactionsPageState extends State<UserTransactionsPage> {
  List<Map<String, dynamic>> _transactions = [];
  bool _isLoading = true;
  String _selectedFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadTransactions();
  }

  Future<void> _loadTransactions() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // TODO: Implement getUserAllTransactions API method
      // final authService = AuthService();
      // final response = await authService.getUserAllTransactions();
      final response = null;
      
      if (response != null && response['success'] == true) {
        final transactions = List<Map<String, dynamic>>.from(response['data'] ?? []);
        
        setState(() {
          _transactions = transactions;
          _isLoading = false;
        });
      } else {
        // Mock data for demo
        setState(() {
          _transactions = [
            {
              'id': 'txn_001',
              'businessName': 'Coffee Palace',
              'businessCode': '12345',
              'date': '2024-07-08',
              'time': '14:30',
              'amount': 25.50,
              'pointsEarned': 26,
              'type': 'purchase',
              'status': 'completed',
              'description': 'Coffee & Pastry',
              'items': [
                {'name': 'Cappuccino', 'price': 4.50},
                {'name': 'Croissant', 'price': 3.50},
                {'name': 'Latte', 'price': 5.00},
                {'name': 'Muffin', 'price': 2.50},
              ],
            },
            {
              'id': 'txn_002',
              'businessName': 'Fashion Hub',
              'businessCode': '67890',
              'date': '2024-07-06',
              'time': '11:15',
              'amount': 89.99,
              'pointsEarned': 90,
              'type': 'purchase',
              'status': 'completed',
              'description': 'Clothing Purchase',
              'items': [
                {'name': 'T-Shirt', 'price': 29.99},
                {'name': 'Jeans', 'price': 60.00},
              ],
            },
            {
              'id': 'txn_003',
              'businessName': 'Tech Store',
              'businessCode': '11111',
              'date': '2024-07-04',
              'time': '16:45',
              'amount': -15.00,
              'pointsUsed': 150,
              'type': 'redemption',
              'status': 'completed',
              'description': 'Points Redemption',
              'redeemedItem': 'Wireless Headphones Case',
            },
            {
              'id': 'txn_004',
              'businessName': 'Coffee Palace',
              'businessCode': '12345',
              'date': '2024-07-02',
              'time': '09:20',
              'amount': 12.75,
              'pointsEarned': 13,
              'type': 'purchase',
              'status': 'completed',
              'description': 'Morning Coffee',
              'items': [
                {'name': 'Americano', 'price': 3.75},
                {'name': 'Danish', 'price': 4.00},
                {'name': 'Orange Juice', 'price': 5.00},
              ],
            },
            {
              'id': 'txn_005',
              'businessName': 'Fashion Hub',
              'businessCode': '67890',
              'date': '2024-06-30',
              'time': '13:30',
              'amount': 156.50,
              'pointsEarned': 157,
              'type': 'purchase',
              'status': 'completed',
              'description': 'Summer Collection',
              'items': [
                {'name': 'Summer Dress', 'price': 89.99},
                {'name': 'Sandals', 'price': 49.99},
                {'name': 'Sun Hat', 'price': 16.52},
              ],
            },
            {
              'id': 'txn_006',
              'businessName': 'Tech Store',
              'businessCode': '11111',
              'date': '2024-06-28',
              'time': '10:00',
              'amount': -25.00,
              'pointsUsed': 250,
              'type': 'redemption',
              'status': 'completed',
              'description': 'Points Redemption',
              'redeemedItem': 'Phone Screen Protector',
            },
          ];
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading transactions: $e');
      setState(() {
        _isLoading = false;
      });
    }
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
                        'Transaction History',
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

              // Filter Chips
              Container(
                height: 50.h,
                margin: EdgeInsets.symmetric(horizontal: 24.w),
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _buildFilterChip('All', 'all'),
                    SizedBox(width: 12.w),
                    _buildFilterChip('Purchases', 'purchases'),
                    SizedBox(width: 12.w),
                    _buildFilterChip('Redemptions', 'redemptions'),
                  ],
                ),
              ),

              SizedBox(height: 24.h),

              // Content
              Expanded(
                child: _isLoading
                    ? Center(
                        child: CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(NeutralThemeHelper.accentColor),
                        ),
                      )
                    : _filteredTransactions.isEmpty
                        ? _buildEmptyState()
                        : RefreshIndicator(
                            onRefresh: _loadTransactions,
                            child: ListView.builder(
                              padding: EdgeInsets.symmetric(horizontal: 24.w),
                              itemCount: _filteredTransactions.length,
                              itemBuilder: (context, index) {
                                final transaction = _filteredTransactions[index];
                                return _buildTransactionCard(transaction);
                              },
                            ),
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
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
          gradient: isSelected ? NeutralThemeHelper.primaryGradient : null,
          color: isSelected ? null : NeutralThemeHelper.cardBackgroundColor,
          borderRadius: BorderRadius.circular(25.r),
          border: Border.all(
            color: isSelected ? Colors.transparent : NeutralThemeHelper.borderColor,
          ),
        ),
        child: Text(
          label,
          style: NeutralThemeHelper.bodyMedium.copyWith(
            fontSize: 14.sp,
            fontWeight: FontWeight.w600,
            color: isSelected 
                ? NeutralThemeHelper.textOnPrimaryColor
                : NeutralThemeHelper.textPrimaryColor,
          ),
        ),
      ),
    );
  }

  Widget _buildTransactionCard(Map<String, dynamic> transaction) {
    final isPurchase = transaction['type'] == 'purchase';
    final amount = transaction['amount'] ?? 0.0;
    final pointsEarned = transaction['pointsEarned'] ?? 0;
    final pointsUsed = transaction['pointsUsed'] ?? 0;

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
              '/user-transaction-details',
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
                            ? NeutralThemeHelper.primaryGradient 
                            : LinearGradient(
                                colors: [
                                  NeutralThemeHelper.warningColor,
                                  NeutralThemeHelper.warningColor.withValues(alpha: 0.8),
                                ],
                              ),
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: Icon(
                        isPurchase ? Icons.shopping_cart : Icons.redeem,
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
                            transaction['businessName'] ?? '',
                            style: NeutralThemeHelper.headingSmall.copyWith(
                              fontSize: 16.sp,
                            ),
                          ),
                          SizedBox(height: 4.h),
                          Text(
                            transaction['description'] ?? '',
                            style: NeutralThemeHelper.bodyMedium.copyWith(
                              fontSize: 14.sp,
                              color: NeutralThemeHelper.textSecondaryColor,
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
                              : '-\$${amount.abs().toStringAsFixed(2)}',
                          style: NeutralThemeHelper.headingSmall.copyWith(
                            fontSize: 16.sp,
                            color: isPurchase 
                                ? NeutralThemeHelper.textPrimaryColor
                                : NeutralThemeHelper.warningColor,
                          ),
                        ),
                        SizedBox(height: 4.h),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                          decoration: BoxDecoration(
                            color: isPurchase 
                                ? NeutralThemeHelper.successColor.withValues(alpha: 0.1)
                                : NeutralThemeHelper.warningColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                          child: Text(
                            isPurchase 
                                ? '+$pointsEarned pts'
                                : '-$pointsUsed pts',
                            style: NeutralThemeHelper.labelMedium.copyWith(
                              fontSize: 10.sp,
                              color: isPurchase 
                                  ? NeutralThemeHelper.successColor
                                  : NeutralThemeHelper.warningColor,
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
                      color: NeutralThemeHelper.textSecondaryColor,
                    ),
                    SizedBox(width: 8.w),
                    Text(
                      '${transaction['date']} at ${transaction['time']}',
                      style: NeutralThemeHelper.bodySmall.copyWith(
                        fontSize: 12.sp,
                        color: NeutralThemeHelper.textSecondaryColor,
                      ),
                    ),
                    Spacer(),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                      decoration: BoxDecoration(
                        color: NeutralThemeHelper.successColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: Text(
                        transaction['status']?.toString().toUpperCase() ?? 'UNKNOWN',
                        style: NeutralThemeHelper.labelMedium.copyWith(
                          fontSize: 10.sp,
                          color: NeutralThemeHelper.successColor,
                          fontWeight: FontWeight.w600,
                        ),
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

  Widget _buildEmptyState() {
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
                Icons.receipt_long,
                size: 64.w,
                color: NeutralThemeHelper.accentColor,
              ),
            ),
            SizedBox(height: 24.h),
            Text(
              'No Transactions Yet',
              style: NeutralThemeHelper.headingMedium.copyWith(
                fontSize: 20.sp,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 12.h),
            Text(
              'Your transaction history will appear here once you start making purchases',
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