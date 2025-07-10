import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../colors.dart';
import '../providers/app_state_provider.dart';
import '../utils/theme_helper.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';

class BusinessInfoPage extends StatefulWidget {
  const BusinessInfoPage({super.key});

  @override
  State<BusinessInfoPage> createState() => _BusinessInfoPageState();
}

class _BusinessInfoPageState extends State<BusinessInfoPage> {
  String _businessCode = '';
  Map<String, dynamic> _businessInfo = {};
  bool _isLoading = true;
  String _errorMessage = '';

  // Mock business data - will be replaced with AWS API calls
  final Map<String, Map<String, dynamic>> _mockBusinessData = {
    '12345': {
      'name': 'Coffee Palace',
      'description': 'Premium coffee and artisanal pastries crafted with passion. Experience the perfect blend of quality and comfort in our cozy atmosphere.',
      'category': 'Food & Beverage',
      'location': '123 Main Street, Downtown District',
      'phone': '+1 (555) 123-4567',
      'email': 'hello@coffeepalace.com',
      'website': 'www.coffeepalace.com',
      'hours': {
        'Monday - Friday': '6:00 AM - 9:00 PM',
        'Saturday': '7:00 AM - 10:00 PM',
        'Sunday': '8:00 AM - 8:00 PM',
      },
      'established': '2019',
      'memberSince': '2023',
      'totalMembers': '2,450',
      'features': [
        'Free WiFi',
        'Outdoor Seating',
        'Drive-through',
        'Mobile Ordering',
        'Vegan Options',
      ],
      'socialMedia': {
        'instagram': '@coffeepalace',
        'facebook': 'Coffee Palace Official',
        'twitter': '@coffeepalace',
      },
      'loyaltyBenefits': [
        'Earn 1 point per \$1 spent',
        'Free drink after 10 purchases',
        'Birthday month 20% discount',
        'Early access to new menu items',
      ],
    },
    '67890': {
      'name': 'Fashion Hub',
      'description': 'Your destination for the latest trends and timeless classics. Discover fashion that expresses your unique style with our curated collection.',
      'category': 'Fashion & Retail',
      'location': '456 Style Avenue, Shopping Center',
      'phone': '+1 (555) 987-6543',
      'email': 'info@fashionhub.com',
      'website': 'www.fashionhub.com',
      'hours': {
        'Monday - Saturday': '10:00 AM - 9:00 PM',
        'Sunday': '11:00 AM - 7:00 PM',
      },
      'established': '2018',
      'memberSince': '2022',
      'totalMembers': '3,200',
      'features': [
        'Personal Styling',
        'Alterations',
        'Online Shopping',
        'Gift Cards',
        'Student Discounts',
      ],
      'socialMedia': {
        'instagram': '@fashionhub',
        'facebook': 'Fashion Hub Store',
        'twitter': '@fashionhub',
      },
      'loyaltyBenefits': [
        'Earn 2 points per \$1 spent',
        '15% off after 500 points',
        'Exclusive member-only sales',
        'Free shipping on orders over \$75',
      ],
    },
    '11111': {
      'name': 'Tech Store',
      'description': 'Cutting-edge technology and gadgets for the modern lifestyle. From smartphones to smart homes, we have everything you need.',
      'category': 'Electronics & Technology',
      'location': '789 Innovation Drive, Tech District',
      'phone': '+1 (555) 456-7890',
      'email': 'support@techstore.com',
      'website': 'www.techstore.com',
      'hours': {
        'Monday - Friday': '9:00 AM - 8:00 PM',
        'Saturday': '10:00 AM - 6:00 PM',
        'Sunday': '12:00 PM - 5:00 PM',
      },
      'established': '2021',
      'memberSince': '2024',
      'totalMembers': '1,850',
      'features': [
        'Technical Support',
        'Product Demos',
        'Trade-in Program',
        'Extended Warranties',
        'Installation Services',
      ],
      'socialMedia': {
        'instagram': '@techstore',
        'facebook': 'Tech Store Official',
        'twitter': '@techstore',
      },
      'loyaltyBenefits': [
        'Earn 3 points per \$1 spent',
        '10% off accessories with device purchase',
        'Priority customer support',
        'Extended return period',
      ],
    },
  };

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (args != null && args['businessCode'] != null) {
      _businessCode = args['businessCode'];
      _loadBusinessInfo();
    }
  }

  Future<void> _loadBusinessInfo() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      // Try to fetch from API first
      final apiService = ApiService();
      final response = await apiService.get('${ApiConfig.getBusiness}/$_businessCode');
      
      if (response['success'] == true && response['business'] != null) {
        setState(() {
          _businessInfo = _transformApiData(response['business']);
          _isLoading = false;
        });
      } else {
        throw Exception('Business not found');
      }
    } catch (e) {
      // Fallback to mock data if API fails
      print('Failed to load business info from API: $e');
      setState(() {
        _businessInfo = _mockBusinessData[_businessCode] ?? {};
        _isLoading = false;
        if (_businessInfo.isEmpty) {
          _errorMessage = 'Business information not found';
        }
      });
    }
  }

  Map<String, dynamic> _transformApiData(Map<String, dynamic> apiData) {
    // Transform API data to match the expected format
    return {
      'name': apiData['name'] ?? '',
      'description': apiData['description'] ?? '',
      'category': apiData['category'] ?? '',
      'location': apiData['address'] ?? '',
      'phone': apiData['contactPhone'] ?? '',
      'email': apiData['contactEmail'] ?? '',
      'website': apiData['website'] ?? '',
      'hours': _transformOperatingHours(apiData['operatingHours']),
      'established': apiData['established'] ?? '',
      'memberSince': apiData['memberSince'] ?? '',
      'totalMembers': apiData['totalMembers']?.toString() ?? '0',
      'features': apiData['features'] ?? [],
      'socialMedia': apiData['socialMedia'] ?? {
        'instagram': '',
        'facebook': '',
        'twitter': '',
      },
      'loyaltyBenefits': apiData['loyaltyBenefits'] ?? [],
    };
  }

  Map<String, String> _transformOperatingHours(Map<String, dynamic>? hours) {
    if (hours == null) return {};
    
    Map<String, String> transformed = {};
    
    final dayNames = {
      'monday': 'Monday',
      'tuesday': 'Tuesday', 
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
      'saturday': 'Saturday',
      'sunday': 'Sunday'
    };
    
    dayNames.forEach((key, displayName) {
      if (hours[key] != null) {
        final dayInfo = hours[key];
        if (dayInfo['closed'] == true) {
          transformed[displayName] = 'Closed';
        } else {
          transformed[displayName] = '${dayInfo['open']} - ${dayInfo['close']}';
        }
      }
    });
    
    return transformed;
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AppStateProvider>(
      builder: (context, appState, child) {
        if (_isLoading) {
          return Scaffold(
            appBar: AppBar(
              title: const Text('Business Information'),
              backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
            ),
            body: const Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        if (_businessInfo.isEmpty || _errorMessage.isNotEmpty) {
          return Scaffold(
            appBar: AppBar(
              title: const Text('Business Information'),
              backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
            ),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _errorMessage.isNotEmpty ? _errorMessage : 'Business information not found',
                    style: TextStyle(fontSize: 16.sp),
                  ),
                  SizedBox(height: 16.h),
                  ElevatedButton(
                    onPressed: _loadBusinessInfo,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          );
        }

        return Scaffold(
          backgroundColor: ThemeHelper.getBackgroundColor(appState.theme),
      body: CustomScrollView(
        slivers: [
          // Custom App Bar with Business Header
          SliverAppBar(
            expandedHeight: 200.h,
            floating: false,
            pinned: true,
            backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [ThemeHelper.getPrimaryColor(appState.theme), ThemeHelper.getTextColor(appState.theme)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: EdgeInsets.all(24.w),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 60.r,
                              height: 60.r,
                              decoration: BoxDecoration(
                                color: ThemeHelper.getCardBackgroundColor(appState.theme),
                                borderRadius: BorderRadius.circular(15.r),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 10.r,
                                    offset: Offset(0, 5.h),
                                  ),
                                ],
                              ),
                              child: Icon(
                                Icons.business,
                                size: 30.r,
                                color: ThemeHelper.getPrimaryColor(appState.theme),
                              ),
                            ),
                            SizedBox(width: 16.w),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _businessInfo['name'] ?? '',
                                    style: TextStyle(
                                      fontSize: 24.sp,
                                      fontWeight: FontWeight.bold,
                                      color: ThemeHelper.getCardBackgroundColor(appState.theme),
                                    ),
                                  ),
                                  Text(
                                    'Code: $_businessCode',
                                    style: TextStyle(
                                      fontSize: 14.sp,
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
                ),
              ),
            ),
          ),

          // Main Content
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.all(24.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // About Section
                  _buildSection(appState: appState,
                    title: 'About',
                    child: Text(
                      _businessInfo['description'] ?? '',
                      style: TextStyle(
                        fontSize: 16.sp,
                        color: ThemeHelper.getTextColor(appState.theme),
                        height: 1.5,
                      ),
                    ),
                  ),

                  SizedBox(height: 24.h),

                  // Quick Info Cards
                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoCard(
                          appState: appState,
                          title: 'Category',
                          value: _businessInfo['category'] ?? '',
                          icon: Icons.category,
                        ),
                      ),
                      SizedBox(width: 16.w),
                      Expanded(
                        child: _buildInfoCard(
                          appState: appState,
                          title: 'Established',
                          value: _businessInfo['established'] ?? '',
                          icon: Icons.calendar_today,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 16.h),

                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoCard(
                          appState: appState,
                          title: 'Members',
                          value: _businessInfo['totalMembers'] ?? '',
                          icon: Icons.people,
                        ),
                      ),
                      SizedBox(width: 16.w),
                      Expanded(
                        child: _buildInfoCard(
                          appState: appState,
                          title: 'Since',
                          value: _businessInfo['memberSince'] ?? '',
                          icon: Icons.star,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 32.h),

                  // Contact Information
                  _buildSection(appState: appState,
                    title: 'Contact Information',
                    child: Column(
                      children: [
                        _buildContactItem(
                          appState: appState,
                          icon: Icons.location_on,
                          label: 'Address',
                          value: _businessInfo['location'] ?? '',
                        ),
                        _buildContactItem(
                          appState: appState,
                          icon: Icons.phone,
                          label: 'Phone',
                          value: _businessInfo['phone'] ?? '',
                        ),
                        _buildContactItem(
                          appState: appState,
                          icon: Icons.email,
                          label: 'Email',
                          value: _businessInfo['email'] ?? '',
                        ),
                        _buildContactItem(
                          appState: appState,
                          icon: Icons.language,
                          label: 'Website',
                          value: _businessInfo['website'] ?? '',
                        ),
                      ],
                    ),
                  ),

                  SizedBox(height: 32.h),

                  // Operating Hours
                  _buildSection(appState: appState,
                    title: 'Operating Hours',
                    child: Column(
                      children: (_businessInfo['hours'] as Map<String, dynamic>?)
                              ?.entries
                              .map((entry) => _buildHourItem(appState: appState, day: entry.key, hours: entry.value))
                              .toList() ??
                          [],
                    ),
                  ),

                  SizedBox(height: 32.h),

                  // Features
                  _buildSection(appState: appState,
                    title: 'Features & Services',
                    child: Wrap(
                      spacing: 8.w,
                      runSpacing: 8.h,
                      children: (_businessInfo['features'] as List<dynamic>?)
                              ?.map((feature) => _buildFeatureChip(appState: appState, feature: feature.toString()))
                              .toList() ??
                          [],
                    ),
                  ),

                  SizedBox(height: 32.h),

                  // Loyalty Benefits
                  _buildSection(appState: appState,
                    title: 'Loyalty Program Benefits',
                    child: Column(
                      children: (_businessInfo['loyaltyBenefits'] as List<dynamic>?)
                              ?.map((benefit) => _buildBenefitItem(appState: appState, benefit: benefit.toString()))
                              .toList() ??
                          [],
                    ),
                  ),

                  SizedBox(height: 32.h),

                  // Social Media
                  _buildSection(appState: appState,
                    title: 'Follow Us',
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildSocialButton(appState: appState, icon: Icons.camera_alt, platform: 'Instagram'),
                        _buildSocialButton(appState: appState, icon: Icons.facebook, platform: 'Facebook'),
                        _buildSocialButton(appState: appState, icon: Icons.alternate_email, platform: 'Twitter'),
                      ],
                    ),
                  ),

                  SizedBox(height: 40.h),
                ],
              ),
            ),
          ),
        ],
      )
        );
      },
    );
  }

  Widget _buildSection({required AppStateProvider appState, required String title, required Widget child}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
            color: ThemeHelper.getTextColor(appState.theme),
          ),
        ),
        SizedBox(height: 16.h),
        Container(
          width: double.infinity,
          padding: EdgeInsets.all(20.r),
          decoration: BoxDecoration(
            color: ThemeHelper.getCardBackgroundColor(appState.theme),
            borderRadius: BorderRadius.circular(16.r),
            boxShadow: [
              BoxShadow(
                color: ThemeHelper.getTextColor(appState.theme).withOpacity(0.1),
                blurRadius: 10.r,
                offset: Offset(0, 3.h),
              ),
            ],
          ),
          child: child,
        ),
      ],
    );
  }

  Widget _buildInfoCard({required AppStateProvider appState, required String title, required String value, required IconData icon}) {
    return Container(
      padding: EdgeInsets.all(16.r),
      decoration: BoxDecoration(
        color: ThemeHelper.getCardBackgroundColor(appState.theme),
        borderRadius: BorderRadius.circular(12.r),
        boxShadow: [
          BoxShadow(
            color: ThemeHelper.getTextColor(appState.theme).withOpacity(0.1),
            blurRadius: 8.r,
            offset: Offset(0, 2.h),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(
            icon,
            size: 24.r,
            color: ThemeHelper.getPrimaryColor(appState.theme),
          ),
          SizedBox(height: 8.h),
          Text(
            title,
            style: TextStyle(
              fontSize: 12.sp,
              color: ThemeHelper.getSubtitleTextColor(appState.theme),
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: 4.h),
          Text(
            value,
            style: TextStyle(
              fontSize: 16.sp,
              color: ThemeHelper.getTextColor(appState.theme),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactItem({required AppStateProvider appState, required IconData icon, required String label, required String value}) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Row(
        children: [
          Icon(
            icon,
            size: 20.r,
            color: ThemeHelper.getPrimaryColor(appState.theme),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: ThemeHelper.getSubtitleTextColor(appState.theme),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: ThemeHelper.getTextColor(appState.theme),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHourItem({required AppStateProvider appState, required String day, required String hours}) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            day,
            style: TextStyle(
              fontSize: 14.sp,
              color: ThemeHelper.getTextColor(appState.theme),
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            hours,
            style: TextStyle(
              fontSize: 14.sp,
              color: ThemeHelper.getPrimaryColor(appState.theme),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureChip({required AppStateProvider appState, required String feature}) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: ThemeHelper.getSecondaryColor(appState.theme).withOpacity(0.3),
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(
          color: ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.3),
          width: 1.w,
        ),
      ),
      child: Text(
        feature,
        style: TextStyle(
          fontSize: 12.sp,
          color: ThemeHelper.getTextColor(appState.theme),
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildBenefitItem({required AppStateProvider appState, required String benefit}) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Row(
        children: [
          Icon(
            Icons.check_circle,
            size: 18.r,
            color: ThemeHelper.getSuccessColor(appState.theme),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Text(
              benefit,
              style: TextStyle(
                fontSize: 14.sp,
                color: ThemeHelper.getTextColor(appState.theme),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSocialButton({required AppStateProvider appState, required IconData icon, required String platform}) {
    return Container(
      width: 50.r,
      height: 50.r,
      decoration: BoxDecoration(
        color: ThemeHelper.getSecondaryColor(appState.theme).withOpacity(0.3),
        borderRadius: BorderRadius.circular(25.r),
        border: Border.all(
          color: ThemeHelper.getPrimaryColor(appState.theme).withOpacity(0.3),
          width: 1.w,
        ),
      ),
      child: Icon(
        icon,
        size: 24.r,
        color: ThemeHelper.getPrimaryColor(appState.theme),
      ),
    );
  }
}