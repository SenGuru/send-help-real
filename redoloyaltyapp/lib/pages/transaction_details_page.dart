import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../colors.dart';
import '../utils/theme_helper.dart';
import '../providers/app_state_provider.dart';

class TransactionDetailsPage extends StatelessWidget {
  const TransactionDetailsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppStateProvider>(
      builder: (context, appState, child) {
        // Get arguments passed from previous screen
        final Map<String, dynamic>? args =
            ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;

        final String id = args?['id'] ?? 'TXN2025001';
        final String storeName = args?['storeName'] ?? 'Main Street Store';
        final String date = args?['date'] ?? 'Dec 25, 2025 at 2:30 PM';
        final double amount = args?['amount'] ?? 45.99;
        final int pointsEarned = args?['pointsEarned'] ?? 92;
        final String status = args?['status'] ?? 'Completed';
        final List<String> items = args?['items'] ?? ['Coffee', 'Pastry'];
        final String paymentMethod = args?['paymentMethod'] ?? 'Credit Card';

        return Scaffold(
          backgroundColor: ThemeHelper.getBackgroundColor(appState.theme),
          appBar: AppBar(
            backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
            elevation: 0,
            title: Text(
              'Transaction Details',
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
                  Icons.share,
                  color: ThemeHelper.getButtonTextColor(appState.theme),
                  size: 24.r,
                ),
                onPressed: () {
                  _shareTransaction(context, id, amount, appState);
                },
              ),
              IconButton(
                icon: Icon(
                  Icons.receipt,
                  color: ThemeHelper.getButtonTextColor(appState.theme),
                  size: 24.r,
                ),
                onPressed: () {
                  _downloadReceipt(context, id, appState);
                },
              ),
            ],
          ),
          body: SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 24.w),
              child: Column(
                children: [
                  SizedBox(height: 24.h),
                  
                  // Transaction Summary Card
                  _buildSummaryCard(
                    id: id,
                    storeName: storeName,
                    date: date,
                    amount: amount,
                    pointsEarned: pointsEarned,
                    status: status,
                    appState: appState,
                  ),
                  
                  SizedBox(height: 24.h),
                  
                  // Payment Information
                  _buildPaymentInfo(paymentMethod, amount, appState),
                  
                  SizedBox(height: 24.h),
                  
                  // Items Purchased
                  _buildItemsList(items, amount, appState),
                  
                  SizedBox(height: 24.h),
                  
                  // Store Information
                  _buildStoreInfo(storeName, appState),
                  
                  SizedBox(height: 24.h),
                  
                  // Points Breakdown
                  _buildPointsBreakdown(amount, pointsEarned, appState),
                  
                  SizedBox(height: 24.h),
                  
                  // Action Buttons
                  _buildActionButtons(context, appState),
                  
                  SizedBox(height: 32.h),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildSummaryCard({
    required String id,
    required String storeName,
    required String date,
    required double amount,
    required int pointsEarned,
    required String status,
    required AppStateProvider appState,
  }) {
    return Container(
      padding: EdgeInsets.all(24.r),
      decoration: BoxDecoration(
        color: ThemeHelper.getCardBackgroundColor(appState.theme),
        borderRadius: BorderRadius.circular(20.r),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowColor,
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
                    'Transaction ID',
                    style: TextStyle(
                      fontSize: 12.sp,
                      color: ThemeHelper.getSubtitleTextColor(appState.theme),
                    ),
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    id,
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                      color: ThemeHelper.getMainTextColor(appState.theme),
                    ),
                  ),
                ],
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                decoration: BoxDecoration(
                  color: _getStatusColor(status, appState).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16.r),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w600,
                    color: _getStatusColor(status, appState),
                  ),
                ),
              ),
            ],
          ),
          
          SizedBox(height: 24.h),
          
          // Amount and Points
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Total Amount',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: ThemeHelper.getSubtitleTextColor(appState.theme),
                      ),
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      '\$${amount.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 32.sp,
                        fontWeight: FontWeight.bold,
                        color: ThemeHelper.getMainTextColor(appState.theme),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: EdgeInsets.all(16.r),
                decoration: BoxDecoration(
                  color: ThemeHelper.getSecondaryColor(appState.theme),
                  borderRadius: BorderRadius.circular(16.r),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.star,
                      color: ThemeHelper.getPrimaryColor(appState.theme),
                      size: 24.r,
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      '+$pointsEarned',
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.bold,
                        color: ThemeHelper.getPrimaryColor(appState.theme),
                      ),
                    ),
                    Text(
                      'Points',
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: ThemeHelper.getPrimaryColor(appState.theme),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          SizedBox(height: 24.h),
          
          // Store and Date
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.store,
                          size: 16.r,
                          color: ThemeHelper.getSubtitleTextColor(appState.theme),
                        ),
                        SizedBox(width: 8.w),
                        Text(
                          storeName,
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w600,
                            color: ThemeHelper.getMainTextColor(appState.theme),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8.h),
                    Row(
                      children: [
                        Icon(
                          Icons.access_time,
                          size: 16.r,
                          color: ThemeHelper.getSubtitleTextColor(appState.theme),
                        ),
                        SizedBox(width: 8.w),
                        Text(
                          date,
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: ThemeHelper.getSubtitleTextColor(appState.theme),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentInfo(String paymentMethod, double amount, AppStateProvider appState) {
    return Container(
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
          Text(
            'Payment Information',
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: ThemeHelper.getMainTextColor(appState.theme),
            ),
          ),
          SizedBox(height: 16.h),
          _buildInfoRow('Payment Method', paymentMethod, Icons.payment, appState),
          _buildInfoRow('Subtotal', '\$${(amount * 0.9).toStringAsFixed(2)}', Icons.receipt, appState),
          _buildInfoRow('Tax', '\$${(amount * 0.1).toStringAsFixed(2)}', Icons.percent, appState),
          Divider(color: ThemeHelper.getBorderColor(appState.theme), height: 24.h),
          _buildInfoRow('Total', '\$${amount.toStringAsFixed(2)}', Icons.attach_money, appState, isTotal: true),
        ],
      ),
    );
  }

  Widget _buildItemsList(List<String> items, double amount, AppStateProvider appState) {
    return Container(
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
          Text(
            'Items Purchased',
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: ThemeHelper.getMainTextColor(appState.theme),
            ),
          ),
          SizedBox(height: 16.h),
          ...items.asMap().entries.map((entry) {
            int index = entry.key;
            String item = entry.value;
            double itemPrice = (amount / items.length);
            return _buildItemRow(item, itemPrice, index + 1, appState);
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildItemRow(String itemName, double price, int quantity, AppStateProvider appState) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Row(
        children: [
          Container(
            width: 40.r,
            height: 40.r,
            decoration: BoxDecoration(
              color: ThemeHelper.getSecondaryColor(appState.theme),
              borderRadius: BorderRadius.circular(8.r),
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
                  itemName,
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                    color: ThemeHelper.getMainTextColor(appState.theme),
                  ),
                ),
                Text(
                  'Qty: $quantity',
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: ThemeHelper.getSubtitleTextColor(appState.theme),
                  ),
                ),
              ],
            ),
          ),
          Text(
            '\$${price.toStringAsFixed(2)}',
            style: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.w600,
              color: ThemeHelper.getMainTextColor(appState.theme),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStoreInfo(String storeName, AppStateProvider appState) {
    return Container(
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
          Text(
            'Store Information',
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: ThemeHelper.getMainTextColor(appState.theme),
            ),
          ),
          SizedBox(height: 16.h),
          _buildInfoRow('Store Name', storeName, Icons.store, appState),
          _buildInfoRow('Address', '123 Main Street, City, State 12345', Icons.location_on, appState),
          _buildInfoRow('Phone', '+1 (555) 123-4567', Icons.phone, appState),
          _buildInfoRow('Manager', 'Sarah Johnson', Icons.person, appState),
        ],
      ),
    );
  }

  Widget _buildPointsBreakdown(double amount, int pointsEarned, AppStateProvider appState) {
    return Container(
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
          Text(
            'Points Breakdown',
            style: TextStyle(
              fontSize: 18.sp,
              fontWeight: FontWeight.bold,
              color: ThemeHelper.getMainTextColor(appState.theme),
            ),
          ),
          SizedBox(height: 16.h),
          _buildPointsRow('Base Points', '1x', (amount * 1).toInt(), appState),
          _buildPointsRow('Gold Member Bonus', '2x', (amount * 1).toInt(), appState),
          if (pointsEarned > (amount * 2).toInt())
            _buildPointsRow('Special Promotion', '+${pointsEarned - (amount * 2).toInt()}', pointsEarned - (amount * 2).toInt(), appState),
          Divider(color: ThemeHelper.getBorderColor(appState.theme), height: 24.h),
          _buildPointsRow('Total Points Earned', '', pointsEarned, appState, isTotal: true),
        ],
      ),
    );
  }

  Widget _buildPointsRow(String description, String multiplier, int points, AppStateProvider appState, {bool isTotal = false}) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Row(
        children: [
          Expanded(
            child: Text(
              description,
              style: TextStyle(
                fontSize: isTotal ? 16.sp : 14.sp,
                fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
                color: isTotal ? ThemeHelper.getMainTextColor(appState.theme) : ThemeHelper.getSubtitleTextColor(appState.theme),
              ),
            ),
          ),
          if (multiplier.isNotEmpty)
            Text(
              multiplier,
              style: TextStyle(
                fontSize: 14.sp,
                color: ThemeHelper.getSubtitleTextColor(appState.theme),
              ),
            ),
          SizedBox(width: 16.w),
          Text(
            '+$points pts',
            style: TextStyle(
              fontSize: isTotal ? 16.sp : 14.sp,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
              color: isTotal ? ThemeHelper.getPrimaryColor(appState.theme) : ThemeHelper.getSuccessColor(appState.theme),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon, AppStateProvider appState, {bool isTotal = false}) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Row(
        children: [
          Icon(
            icon,
            size: 20.r,
            color: isTotal ? ThemeHelper.getPrimaryColor(appState.theme) : ThemeHelper.getSubtitleTextColor(appState.theme),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontSize: isTotal ? 16.sp : 14.sp,
                fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
                color: isTotal ? ThemeHelper.getMainTextColor(appState.theme) : ThemeHelper.getSubtitleTextColor(appState.theme),
              ),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isTotal ? 16.sp : 14.sp,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
              color: ThemeHelper.getMainTextColor(appState.theme),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, AppStateProvider appState) {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () {
              _reportIssue(context, appState);
            },
            icon: Icon(
              Icons.report_problem_outlined,
              size: 20.r,
            ),
            label: Text(
              'Report an Issue',
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
              foregroundColor: ThemeHelper.getButtonTextColor(appState.theme),
              padding: EdgeInsets.symmetric(vertical: 16.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
            ),
          ),
        ),
        SizedBox(height: 12.h),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  _shareTransaction(context, 'TXN2025001', 45.99, appState);
                },
                icon: Icon(
                  Icons.share_outlined,
                  size: 20.r,
                ),
                label: Text(
                  'Share',
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: ThemeHelper.getPrimaryColor(appState.theme), width: 2.w),
                  foregroundColor: ThemeHelper.getPrimaryColor(appState.theme),
                  padding: EdgeInsets.symmetric(vertical: 12.h),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                ),
              ),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  _downloadReceipt(context, 'TXN2025001', appState);
                },
                icon: Icon(
                  Icons.download_outlined,
                  size: 20.r,
                ),
                label: Text(
                  'Receipt',
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: ThemeHelper.getPrimaryColor(appState.theme), width: 2.w),
                  foregroundColor: ThemeHelper.getPrimaryColor(appState.theme),
                  padding: EdgeInsets.symmetric(vertical: 12.h),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
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

  void _shareTransaction(BuildContext context, String id, double amount, AppStateProvider appState) {
    // Implementation for sharing transaction
    print('Sharing transaction: $id - \${amount.toStringAsFixed(2)}');
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Transaction shared successfully!'),
        backgroundColor: ThemeHelper.getSuccessColor(appState.theme),
      ),
    );
  }

  void _downloadReceipt(BuildContext context, String id, AppStateProvider appState) {
    // Implementation for downloading receipt
    print('Downloading receipt for transaction: $id');
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Receipt downloaded successfully!'),
        backgroundColor: ThemeHelper.getSuccessColor(appState.theme),
      ),
    );
  }

  void _reportIssue(BuildContext context, AppStateProvider appState) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
        ),
        title: Text(
          'Report an Issue',
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
            color: ThemeHelper.getMainTextColor(appState.theme),
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'What kind of issue would you like to report?',
              style: TextStyle(
                fontSize: 14.sp,
                color: ThemeHelper.getSubtitleTextColor(appState.theme),
              ),
            ),
            SizedBox(height: 16.h),
            Column(
              children: [
                _buildIssueOption(context, 'Incorrect amount charged', Icons.attach_money, appState),
                _buildIssueOption(context, 'Missing points', Icons.star_outline, appState),
                _buildIssueOption(context, 'Wrong items listed', Icons.shopping_bag_outlined, appState),
                _buildIssueOption(context, 'Payment not processed', Icons.payment, appState),
                _buildIssueOption(context, 'Other issue', Icons.help_outline, appState),
              ],
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
        ],
      ),
    );
  }

  Widget _buildIssueOption(BuildContext context, String title, IconData icon, AppStateProvider appState) {
    return ListTile(
      leading: Icon(
        icon,
        color: ThemeHelper.getPrimaryColor(appState.theme),
        size: 20.r,
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 14.sp,
          color: ThemeHelper.getMainTextColor(appState.theme),
        ),
      ),
      onTap: () {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Issue reported: $title'),
            backgroundColor: ThemeHelper.getInfoColor(appState.theme),
          ),
        );
      },
      contentPadding: EdgeInsets.zero,
      dense: true,
    );
  }
}