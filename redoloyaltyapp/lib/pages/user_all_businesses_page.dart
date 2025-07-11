import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../utils/neutral_theme_helper.dart';
import '../services/auth_service.dart';

class UserAllBusinessesPage extends StatefulWidget {
  const UserAllBusinessesPage({super.key});

  @override
  State<UserAllBusinessesPage> createState() => _UserAllBusinessesPageState();
}

class _UserAllBusinessesPageState extends State<UserAllBusinessesPage> {
  List<Map<String, dynamic>> _businesses = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _selectedFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadBusinesses();
  }

  Future<void> _loadBusinesses() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authService = AuthService();
      final response = await authService.getUserBusinessMemberships();
      
      if (response != null && response['success'] == true) {
        final businesses = List<Map<String, dynamic>>.from(response['data'] ?? []);
        
        setState(() {
          _businesses = businesses;
          _isLoading = false;
        });
      } else {
        // No businesses found or API call failed
        setState(() {
          _businesses = [];
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading businesses: $e');
      
      // Check if it's an authentication error
      if (e.toString().contains('Authentication expired')) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Session expired. Please log in again.'),
              backgroundColor: NeutralThemeHelper.errorColor,
              duration: Duration(seconds: 3),
            ),
          );
          
          // Redirect to login after a short delay
          Future.delayed(Duration(seconds: 3), () {
            if (mounted) {
              Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
            }
          });
        }
      }
      
      setState(() {
        _businesses = [];
        _isLoading = false;
      });
    }
  }

  List<Map<String, dynamic>> get _filteredBusinesses {
    List<Map<String, dynamic>> filtered = _businesses;
    
    // Apply search filter
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((business) {
        return business['businessName']?.toLowerCase().contains(_searchQuery.toLowerCase()) == true ||
               business['category']?.toLowerCase().contains(_searchQuery.toLowerCase()) == true ||
               business['location']?.toLowerCase().contains(_searchQuery.toLowerCase()) == true;
      }).toList();
    }
    
    // Apply status filter
    if (_selectedFilter == 'active') {
      filtered = filtered.where((business) => business['isActive'] == true).toList();
    } else if (_selectedFilter == 'inactive') {
      filtered = filtered.where((business) => business['isActive'] == false).toList();
    }
    
    return filtered;
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
                        'My Businesses',
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

              // Search and Filter Section
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 24.w),
                child: Column(
                  children: [
                    // Search Bar
                    Container(
                      decoration: NeutralThemeHelper.cardDecoration,
                      child: TextField(
                        onChanged: (value) {
                          setState(() {
                            _searchQuery = value;
                          });
                        },
                        style: NeutralThemeHelper.bodyLarge.copyWith(fontSize: 16.sp),
                        decoration: InputDecoration(
                          hintText: 'Search businesses...',
                          hintStyle: NeutralThemeHelper.bodyMedium.copyWith(
                            color: NeutralThemeHelper.textSecondaryColor,
                          ),
                          prefixIcon: Icon(
                            Icons.search,
                            color: NeutralThemeHelper.textSecondaryColor,
                          ),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
                        ),
                      ),
                    ),
                    
                    SizedBox(height: 16.h),
                    
                    // Filter Chips
                    Row(
                      children: [
                        _buildFilterChip('All', 'all'),
                        SizedBox(width: 12.w),
                        _buildFilterChip('Active', 'active'),
                        SizedBox(width: 12.w),
                        _buildFilterChip('Inactive', 'inactive'),
                      ],
                    ),
                  ],
                ),
              ),

              SizedBox(height: 24.h),

              // Business List
              Expanded(
                child: _isLoading
                    ? Center(
                        child: CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(NeutralThemeHelper.accentColor),
                        ),
                      )
                    : _filteredBusinesses.isEmpty
                        ? _buildEmptyState()
                        : RefreshIndicator(
                            onRefresh: _loadBusinesses,
                            child: ListView.builder(
                              padding: EdgeInsets.symmetric(horizontal: 24.w),
                              itemCount: _filteredBusinesses.length,
                              itemBuilder: (context, index) {
                                final business = _filteredBusinesses[index];
                                return _buildBusinessCard(business);
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
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
        decoration: BoxDecoration(
          gradient: isSelected ? NeutralThemeHelper.primaryGradient : null,
          color: isSelected ? null : NeutralThemeHelper.cardBackgroundColor,
          borderRadius: BorderRadius.circular(20.r),
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

  Widget _buildBusinessCard(Map<String, dynamic> business) {
    final isActive = business['isActive'] ?? true;
    
    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      decoration: NeutralThemeHelper.cardDecoration.copyWith(
        borderRadius: BorderRadius.circular(16.r),
        color: isActive 
            ? NeutralThemeHelper.cardBackgroundColor
            : NeutralThemeHelper.cardBackgroundColor.withValues(alpha: 0.6),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () async {
            if (isActive) {
              // Set the business code and navigate to business dashboard
              final authService = AuthService();
              await authService.setBusinessCode(business['businessCode']);
              Navigator.pushNamed(context, '/home');
            }
          },
          borderRadius: BorderRadius.circular(16.r),
          child: Padding(
            padding: EdgeInsets.all(20.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Row
                Row(
                  children: [
                    // Business Logo/Initial
                    Container(
                      width: 60.w,
                      height: 60.w,
                      decoration: BoxDecoration(
                        gradient: isActive 
                            ? NeutralThemeHelper.primaryGradient
                            : LinearGradient(
                                colors: [
                                  NeutralThemeHelper.textSecondaryColor,
                                  NeutralThemeHelper.textSecondaryColor.withValues(alpha: 0.8),
                                ],
                              ),
                        borderRadius: BorderRadius.circular(16.r),
                      ),
                      child: Center(
                        child: Text(
                          business['businessName']?.isNotEmpty == true ? business['businessName'].substring(0, 1).toUpperCase() : 'B',
                          style: TextStyle(
                            color: NeutralThemeHelper.textOnPrimaryColor,
                            fontSize: 24.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    
                    SizedBox(width: 16.w),
                    
                    // Business Info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            business['businessName'] ?? '',
                            style: NeutralThemeHelper.headingSmall.copyWith(
                              fontSize: 18.sp,
                              color: isActive 
                                  ? NeutralThemeHelper.textPrimaryColor
                                  : NeutralThemeHelper.textSecondaryColor,
                            ),
                          ),
                          SizedBox(height: 4.h),
                          Text(
                            business['category'] ?? '',
                            style: NeutralThemeHelper.bodyMedium.copyWith(
                              fontSize: 14.sp,
                              color: NeutralThemeHelper.accentColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(height: 2.h),
                          Text(
                            business['location'] ?? '',
                            style: NeutralThemeHelper.bodySmall.copyWith(
                              fontSize: 12.sp,
                              color: NeutralThemeHelper.textSecondaryColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    // Status and Points
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                          decoration: BoxDecoration(
                            color: isActive 
                                ? NeutralThemeHelper.successColor.withValues(alpha: 0.1)
                                : NeutralThemeHelper.textSecondaryColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12.r),
                          ),
                          child: Text(
                            isActive ? 'ACTIVE' : 'INACTIVE',
                            style: NeutralThemeHelper.labelMedium.copyWith(
                              fontSize: 10.sp,
                              color: isActive 
                                  ? NeutralThemeHelper.successColor
                                  : NeutralThemeHelper.textSecondaryColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        SizedBox(height: 8.h),
                        Text(
                          '${business['totalPoints'] ?? 0}',
                          style: NeutralThemeHelper.headingSmall.copyWith(
                            fontSize: 20.sp,
                            color: isActive 
                                ? NeutralThemeHelper.accentColor
                                : NeutralThemeHelper.textSecondaryColor,
                          ),
                        ),
                        Text(
                          'total points',
                          style: NeutralThemeHelper.bodySmall.copyWith(
                            fontSize: 10.sp,
                            color: NeutralThemeHelper.textSecondaryColor,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                
                SizedBox(height: 16.h),
                
                // Description
                Text(
                  business['description'] ?? '',
                  style: NeutralThemeHelper.bodyMedium.copyWith(
                    fontSize: 14.sp,
                    color: isActive 
                        ? NeutralThemeHelper.textPrimaryColor
                        : NeutralThemeHelper.textSecondaryColor,
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                
                SizedBox(height: 16.h),
                
                // Stats Row
                Row(
                  children: [
                    _buildStatChip(
                      'Available',
                      '${business['availablePoints'] ?? 0} pts',
                      NeutralThemeHelper.warningColor,
                      isActive,
                    ),
                    SizedBox(width: 12.w),
                    _buildStatChip(
                      business['currentRanking'] ?? 'Member',
                      'Rank',
                      NeutralThemeHelper.accentColor,
                      isActive,
                    ),
                    Spacer(),
                    Text(
                      'Since ${business['memberSince'] ?? ''}',
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

  Widget _buildStatChip(String label, String value, Color color, bool isActive) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: isActive 
            ? color.withValues(alpha: 0.1)
            : NeutralThemeHelper.textSecondaryColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16.r),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: NeutralThemeHelper.labelMedium.copyWith(
              fontSize: 12.sp,
              color: isActive ? color : NeutralThemeHelper.textSecondaryColor,
              fontWeight: FontWeight.w600,
            ),
          ),
          Text(
            label,
            style: NeutralThemeHelper.bodySmall.copyWith(
              fontSize: 10.sp,
              color: isActive ? color : NeutralThemeHelper.textSecondaryColor,
            ),
          ),
        ],
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
                Icons.business_center_outlined,
                size: 64.w,
                color: NeutralThemeHelper.accentColor,
              ),
            ),
            SizedBox(height: 24.h),
            Text(
              'No Businesses Found',
              style: NeutralThemeHelper.headingMedium.copyWith(
                fontSize: 20.sp,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 12.h),
            Text(
              _searchQuery.isNotEmpty 
                  ? 'Try adjusting your search terms or filters'
                  : 'Join your first business to start earning rewards',
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