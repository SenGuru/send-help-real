import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../colors.dart';
import '../utils/theme_helper.dart';
import '../providers/app_state_provider.dart';

class TransactionsPage extends StatefulWidget {
  const TransactionsPage({super.key});

  @override
  State<TransactionsPage> createState() => _TransactionsPageState();
}

class _TransactionsPageState extends State<TransactionsPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedFilter = 'All';
  String _selectedSort = 'Recent';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
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
              'Transaction History',
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
                  Icons.filter_list,
                  color: ThemeHelper.getButtonTextColor(appState.theme),
                  size: 24.r,
                ),
                onPressed: () => _showFilterDialog(context, appState),
              ),
            ],
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
                Tab(text: 'All Transactions'),
                Tab(text: 'Points History'),
              ],
            ),
          ),
          body: Column(
            children: [
              SizedBox(height: 16.h),
              
              // Summary Card
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 24.w),
                child: _buildSummaryCard(appState),
              ),
              
              SizedBox(height: 16.h),
              
              // Filter Bar
              _buildFilterBar(appState),
              
              // Tab Content
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildAllTransactions(appState),
                    _buildPointsHistory(appState),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSummaryCard(AppStateProvider appState) {
    return Container(
      padding: EdgeInsets.all(20.r),
      decoration: BoxDecoration(
        color: ThemeHelper.getCardBackgroundColor(appState.theme),
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowColor,
            blurRadius: 10.r,
            offset: Offset(0, 4.h),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildSummaryItem(
              'Total Spent',
              '\$1,245.80',
              Icons.attach_money,
              ThemeHelper.getPrimaryColor(appState.theme),
              appState,
            ),
          ),
          Container(
            width: 1.w,
            height: 40.h,
            color: ThemeHelper.getBorderColor(appState.theme),
          ),
          Expanded(
            child: _buildSummaryItem(
              'Points Earned',
              '2,450',
              Icons.star,
              ThemeHelper.getWarningColor(appState.theme),
              appState,
            ),
          ),
          Container(
            width: 1.w,
            height: 40.h,
            color: ThemeHelper.getBorderColor(appState.theme),
          ),
          Expanded(
            child: _buildSummaryItem(
              'This Month',
              '15',
              Icons.receipt,
              ThemeHelper.getInfoColor(appState.theme),
              appState,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, IconData icon, Color color, AppStateProvider appState) {
    return Column(
      children: [
        Icon(
          icon,
          color: color,
          size: 20.r,
        ),
        SizedBox(height: 8.h),
        Text(
          value,
          style: TextStyle(
            fontSize: 16.sp,
            fontWeight: FontWeight.bold,
            color: ThemeHelper.getMainTextColor(appState.theme),
          ),
        ),
        SizedBox(height: 4.h),
        Text(
          label,
          style: TextStyle(
            fontSize: 12.sp,
            color: ThemeHelper.getSubtitleTextColor(appState.theme),
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildFilterBar(AppStateProvider appState) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 16.h),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: GestureDetector(
              onTap: () => _showFilterDialog(context, appState),
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 12.h),
                decoration: BoxDecoration(
                  color: ThemeHelper.getCardBackgroundColor(appState.theme),
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(color: ThemeHelper.getBorderColor(appState.theme)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Flexible(
                      child: Text(
                        'Filter: $_selectedFilter',
                        style: TextStyle(
                          fontSize: 13.sp,
                          color: ThemeHelper.getMainTextColor(appState.theme),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Icon(
                      Icons.keyboard_arrow_down,
                      color: ThemeHelper.getSubtitleTextColor(appState.theme),
                      size: 18.r,
                    ),
                  ],
                ),
              ),
            ),
          ),
          SizedBox(width: 8.w),
          Expanded(
            flex: 1,
            child: GestureDetector(
              onTap: () => _showFilterDialog(context, appState),
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 12.h),
                decoration: BoxDecoration(
                  color: ThemeHelper.getCardBackgroundColor(appState.theme),
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(color: ThemeHelper.getBorderColor(appState.theme)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Flexible(
                      child: Text(
                        'Sort: $_selectedSort',
                        style: TextStyle(
                          fontSize: 13.sp,
                          color: ThemeHelper.getMainTextColor(appState.theme),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Icon(
                      Icons.keyboard_arrow_down,
                      color: ThemeHelper.getSubtitleTextColor(appState.theme),
                      size: 18.r,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAllTransactions(AppStateProvider appState) {
    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 16.h),
      itemCount: 15,
      itemBuilder: (context, index) {
        return _buildTransactionCard(
          id: 'TXN${2025001 + index}',
          storeName: _getStoreName(index),
          date: _getTransactionDate(index),
          amount: _getTransactionAmount(index),
          pointsEarned: _getPointsEarned(index),
          status: _getTransactionStatus(index),
          items: _getTransactionItems(index),
          paymentMethod: _getPaymentMethod(index),
          appState: appState,
          onTap: () {
            Navigator.pushNamed(
              context,
              '/transaction-details',
              arguments: {
                'id': 'TXN${2025001 + index}',
                'storeName': _getStoreName(index),
                'date': _getTransactionDate(index),
                'amount': _getTransactionAmount(index),
                'pointsEarned': _getPointsEarned(index),
                'status': _getTransactionStatus(index),
                'items': _getTransactionItems(index),
                'paymentMethod': _getPaymentMethod(index),
              },
            );
          },
        );
      },
    );
  }

  Widget _buildPointsHistory(AppStateProvider appState) {
    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 16.h),
      itemCount: 20,
      itemBuilder: (context, index) {
        return _buildPointsCard(
          description: _getPointsDescription(index),
          date: _getPointsDate(index),
          points: _getPointsChange(index),
          type: _getPointsType(index),
          appState: appState,
        );
      },
    );
  }

  Widget _buildTransactionCard({
    required String id,
    required String storeName,
    required String date,
    required double amount,
    required int pointsEarned,
    required String status,
    required List<String> items,
    required String paymentMethod,
    required AppStateProvider appState,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: EdgeInsets.only(bottom: 16.h),
        padding: EdgeInsets.all(20.r),
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      storeName,
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.bold,
                        color: ThemeHelper.getMainTextColor(appState.theme),
                      ),
                    ),
                    SizedBox(height: 4.h),
                    Text(
                      id,
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: ThemeHelper.getSubtitleTextColor(appState.theme),
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '\$${amount.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.bold,
                        color: ThemeHelper.getPrimaryColor(appState.theme),
                      ),
                    ),
                    SizedBox(height: 4.h),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                      decoration: BoxDecoration(
                        color: _getStatusColor(status, appState).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: Text(
                        status,
                        style: TextStyle(
                          fontSize: 10.sp,
                          fontWeight: FontWeight.w600,
                          color: _getStatusColor(status, appState),
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
                Expanded(
                  child: Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 16.r,
                        color: ThemeHelper.getSubtitleTextColor(appState.theme),
                      ),
                      SizedBox(width: 6.w),
                      Text(
                        date,
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: ThemeHelper.getSubtitleTextColor(appState.theme),
                        ),
                      ),
                    ],
                  ),
                ),
                Row(
                  children: [
                    Icon(
                      Icons.star,
                      size: 16.r,
                      color: ThemeHelper.getWarningColor(appState.theme),
                    ),
                    SizedBox(width: 6.w),
                    Text(
                      '+$pointsEarned pts',
                      style: TextStyle(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w600,
                        color: ThemeHelper.getSuccessColor(appState.theme),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            
            SizedBox(height: 12.h),
            
            Text(
              '${items.length} item${items.length > 1 ? 's' : ''} • $paymentMethod',
              style: TextStyle(
                fontSize: 12.sp,
                color: ThemeHelper.getSubtitleTextColor(appState.theme),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPointsCard({
    required String description,
    required String date,
    required int points,
    required String type,
    required AppStateProvider appState,
  }) {
    bool isEarned = points > 0;
    Color pointsColor = isEarned ? ThemeHelper.getSuccessColor(appState.theme) : ThemeHelper.getErrorColor(appState.theme);
    IconData icon = isEarned ? Icons.add : Icons.remove;

    return Container(
      margin: EdgeInsets.only(bottom: 12.h),
      padding: EdgeInsets.all(16.r),
      decoration: BoxDecoration(
        color: ThemeHelper.getCardBackgroundColor(appState.theme),
        borderRadius: BorderRadius.circular(12.r),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowColor,
            blurRadius: 4.r,
            offset: Offset(0, 1.h),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(8.r),
            decoration: BoxDecoration(
              color: pointsColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8.r),
            ),
            child: Icon(
              icon,
              color: pointsColor,
              size: 16.r,
            ),
          ),
          SizedBox(width: 16.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                    color: ThemeHelper.getMainTextColor(appState.theme),
                  ),
                ),
                SizedBox(height: 4.h),
                Text(
                  '$date • $type',
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: ThemeHelper.getSubtitleTextColor(appState.theme),
                  ),
                ),
              ],
            ),
          ),
          Text(
            '${isEarned ? '+' : ''}$points pts',
            style: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.bold,
              color: pointsColor,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status, AppStateProvider appState) {
    switch (status) {
      case 'Completed':
        return ThemeHelper.getSuccessColor(appState.theme);
      case 'Pending':
        return ThemeHelper.getWarningColor(appState.theme);
      case 'Failed':
        return ThemeHelper.getErrorColor(appState.theme);
      default:
        return ThemeHelper.getSubtitleTextColor(appState.theme);
    }
  }

  void _showFilterDialog(BuildContext context, AppStateProvider appState) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
        ),
        title: Text(
          'Filter & Sort',
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
            color: ThemeHelper.getMainTextColor(appState.theme),
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Filter by:',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
                color: ThemeHelper.getMainTextColor(appState.theme),
              ),
            ),
            SizedBox(height: 12.h),
            Wrap(
              spacing: 8.w,
              children: ['All', 'This Week', 'This Month', 'Last 3 Months']
                  .map((filter) => FilterChip(
                        label: Text(filter),
                        selected: _selectedFilter == filter,
                        onSelected: (selected) {
                          setState(() {
                            _selectedFilter = filter;
                          });
                        },
                        selectedColor: ThemeHelper.getSecondaryColor(appState.theme),
                        checkmarkColor: ThemeHelper.getPrimaryColor(appState.theme),
                      ))
                  .toList(),
            ),
            SizedBox(height: 20.h),
            Text(
              'Sort by:',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
                color: ThemeHelper.getMainTextColor(appState.theme),
              ),
            ),
            SizedBox(height: 12.h),
            Wrap(
              spacing: 8.w,
              children: ['Recent', 'Oldest', 'Amount: High to Low', 'Amount: Low to High']
                  .map((sort) => FilterChip(
                        label: Text(sort),
                        selected: _selectedSort == sort,
                        onSelected: (selected) {
                          setState(() {
                            _selectedSort = sort;
                          });
                        },
                        selectedColor: ThemeHelper.getSecondaryColor(appState.theme),
                        checkmarkColor: ThemeHelper.getPrimaryColor(appState.theme),
                      ))
                  .toList(),
            ),
          ],
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
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
            ),
            child: Text(
              'Apply',
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

  // Helper methods for generating sample data
  String _getStoreName(int index) {
    List<String> stores = [
      'Main Street Store',
      'Downtown Outlet',
      'Shopping Mall Branch',
      'Express Location',
      'Flagship Store',
      'Online Purchase',
      'Airport Store',
      'Suburban Branch',
    ];
    return stores[index % stores.length];
  }

  String _getTransactionDate(int index) {
    List<String> dates = [
      'Dec 25, 2025 at 2:30 PM',
      'Dec 24, 2025 at 11:15 AM',
      'Dec 23, 2025 at 4:45 PM',
      'Dec 22, 2025 at 9:20 AM',
      'Dec 21, 2025 at 6:10 PM',
      'Dec 20, 2025 at 1:30 PM',
      'Dec 19, 2025 at 10:45 AM',
      'Dec 18, 2025 at 3:15 PM',
    ];
    return dates[index % dates.length];
  }

  double _getTransactionAmount(int index) {
    List<double> amounts = [45.99, 89.50, 125.75, 32.20, 78.90, 156.30, 67.40, 94.85];
    return amounts[index % amounts.length];
  }

  int _getPointsEarned(int index) {
    List<int> points = [92, 179, 252, 64, 158, 313, 135, 190];
    return points[index % points.length];
  }

  String _getTransactionStatus(int index) {
    List<String> statuses = ['Completed', 'Completed', 'Completed', 'Pending', 'Completed', 'Failed', 'Completed', 'Completed'];
    return statuses[index % statuses.length];
  }

  List<String> _getTransactionItems(int index) {
    List<List<String>> itemLists = [
      ['Coffee', 'Pastry'],
      ['Shirt', 'Jeans', 'Shoes'],
      ['Groceries'],
      ['Book', 'Magazine'],
      ['Electronics'],
      ['Gift Card'],
      ['Food & Beverage'],
      ['Accessories', 'Bag'],
    ];
    return itemLists[index % itemLists.length];
  }

  String _getPaymentMethod(int index) {
    List<String> methods = ['Credit Card', 'Debit Card', 'Digital Wallet', 'Cash', 'Gift Card'];
    return methods[index % methods.length];
  }

  String _getPointsDescription(int index) {
    List<String> descriptions = [
      'Purchase at Main Street Store',
      'Birthday Bonus Points',
      'Welcome Bonus',
      'Points Redeemed for Coupon',
      'Purchase at Downtown Outlet',
      'Referral Bonus',
      'Review Bonus Points',
      'Social Media Share Bonus',
      'Points Expired',
      'Purchase at Shopping Mall',
    ];
    return descriptions[index % descriptions.length];
  }

  String _getPointsDate(int index) {
    List<String> dates = [
      'Dec 25, 2025',
      'Dec 20, 2025',
      'Jan 1, 2025',
      'Dec 18, 2025',
      'Dec 15, 2025',
      'Dec 10, 2025',
      'Dec 8, 2025',
      'Dec 5, 2025',
      'Nov 30, 2025',
      'Nov 28, 2025',
    ];
    return dates[index % dates.length];
  }

  int _getPointsChange(int index) {
    List<int> changes = [92, 500, 1000, -200, 179, 300, 50, 25, -150, 158];
    return changes[index % changes.length];
  }

  String _getPointsType(int index) {
    List<String> types = [
      'Purchase',
      'Bonus',
      'Welcome',
      'Redemption',
      'Purchase',
      'Referral',
      'Activity',
      'Activity',
      'Expiration',
      'Purchase',
    ];
    return types[index % types.length];
  }
}