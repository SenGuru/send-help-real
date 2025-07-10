import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../services/auth_service.dart';
import '../utils/neutral_theme_helper.dart';

class UserHomepage extends StatefulWidget {
  const UserHomepage({super.key});

  @override
  State<UserHomepage> createState() => _UserHomepageState();
}

class _UserHomepageState extends State<UserHomepage> with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _slideController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  List<Map<String, dynamic>> _joinedBusinesses = [];
  bool _isLoadingBusinesses = true;
  String _userName = '';

  @override
  void initState() {
    super.initState();
    _initAnimations();
    _loadUserData();
    _loadJoinedBusinesses();
  }

  void _initAnimations() {
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _slideController, curve: Curves.easeOutBack));

    _fadeController.forward();
    Future.delayed(const Duration(milliseconds: 200), () {
      _slideController.forward();
    });
  }

  Future<void> _loadUserData() async {
    try {
      final authService = AuthService();
      
      // First try to get user data from the already loaded current user
      if (authService.currentUser != null) {
        final user = authService.currentUser!;
        debugPrint('DEBUG: Current user data: $user');
        
        // Try to construct full name from firstName and lastName
        String displayName = 'User';
        final firstName = user['firstName']?.toString() ?? '';
        final lastName = user['lastName']?.toString() ?? '';
        
        if (firstName.isNotEmpty && lastName.isNotEmpty) {
          displayName = '$firstName $lastName';
        } else if (firstName.isNotEmpty) {
          displayName = firstName;
        } else if (lastName.isNotEmpty) {
          displayName = lastName;
        } else {
          // Fallback to other possible name fields
          displayName = user['name']?.toString() ?? 
                       user['username']?.toString() ?? 
                       user['email']?.toString() ?? 'User';
        }
        
        setState(() {
          _userName = displayName;
        });
        debugPrint('DEBUG: Loaded user name from currentUser: $_userName');
        return;
      }
      
      // If not available, try to get user profile from API
      debugPrint('DEBUG: No currentUser found, trying API...');
      final userProfile = await authService.getUserProfile();
      debugPrint('DEBUG: API response: $userProfile');
      
      if (userProfile != null && userProfile['success'] == true) {
        final data = userProfile['data'];
        final firstName = data['firstName']?.toString() ?? '';
        final lastName = data['lastName']?.toString() ?? '';
        
        String displayName = 'User';
        if (firstName.isNotEmpty && lastName.isNotEmpty) {
          displayName = '$firstName $lastName';
        } else if (firstName.isNotEmpty) {
          displayName = firstName;
        } else if (lastName.isNotEmpty) {
          displayName = lastName;
        } else {
          displayName = data['name']?.toString() ?? 
                       data['username']?.toString() ?? 
                       data['email']?.toString() ?? 'User';
        }
        
        setState(() {
          _userName = displayName;
        });
        debugPrint('DEBUG: Loaded user name from API: $_userName');
      } else {
        debugPrint('DEBUG: Failed to load user profile, using default');
        setState(() {
          _userName = 'User';
        });
      }
    } catch (e) {
      debugPrint('Error loading user data: $e');
      setState(() {
        _userName = 'User';
      });
    }
  }

  Future<void> _loadJoinedBusinesses() async {
    try {
      final authService = AuthService();
      // Get user's business memberships
      final memberships = await authService.getUserBusinessMemberships();
      print('DEBUG: API Response: $memberships');
      
      if (memberships != null && memberships['success'] == true) {
        final businessList = List<Map<String, dynamic>>.from(memberships['data'] ?? []);
        print('DEBUG: Parsed businesses: $businessList');
        
        setState(() {
          _joinedBusinesses = businessList;
          _isLoadingBusinesses = false;
        });
      } else {
        print('DEBUG: API call failed or returned no success');
        setState(() {
          _joinedBusinesses = [];
          _isLoadingBusinesses = false;
        });
      }
    } catch (e) {
      print('Error loading businesses: $e');
      
      // Check if it's an authentication error
      if (e.toString().contains('Authentication expired')) {
        // Show snackbar and redirect to login
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
        _joinedBusinesses = [];
        _isLoadingBusinesses = false;
      });
    }
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeutralThemeHelper.backgroundColor,
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: SlideTransition(
          position: _slideAnimation,
          child: Stack(
            children: [
              // Main Content with proper top padding
              Positioned.fill(
                child: RefreshIndicator(
                  onRefresh: () async {
                    await _loadUserData();
                    await _loadJoinedBusinesses();
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
                              // Join New Business Section
                              _buildJoinBusinessSection(),
                              SizedBox(height: 32.h),

                              // My Businesses Section
                              _buildMyBusinessesSection(),
                              SizedBox(height: 32.h),

                              // Quick Actions Section
                              _buildQuickActionsSection(),
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
                child: _buildCurvedHeader(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCurvedHeader() {
    return ClipPath(
      clipper: CurvedBottomClipper(),
      child: Container(
        height: 220.h,
        decoration: BoxDecoration(
          gradient: NeutralThemeHelper.primaryGradient,
        ),
        child: SafeArea(
          child: Padding(
            padding: EdgeInsets.fromLTRB(24.w, 16.h, 24.w, 50.h),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Welcome message on the left
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Welcome back,',
                        style: TextStyle(
                          fontSize: 16.sp,
                          color: NeutralThemeHelper.textOnPrimaryColor.withValues(alpha: 0.9),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      SizedBox(height: 4.h),
                      Text(
                        _userName.isNotEmpty ? _userName : 'User',
                        style: TextStyle(
                          fontSize: 28.sp,
                          color: NeutralThemeHelper.textOnPrimaryColor,
                          fontWeight: FontWeight.bold,
                          height: 1.1,
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Profile icon on the right
                GestureDetector(
                  onTap: () => Navigator.pushNamed(context, '/account'),
                  child: Container(
                    padding: EdgeInsets.all(12.w),
                    decoration: BoxDecoration(
                      color: NeutralThemeHelper.textOnPrimaryColor.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(16.r),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 8.r,
                          offset: Offset(0, 2.h),
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.person_outline,
                      color: NeutralThemeHelper.textOnPrimaryColor,
                      size: 24.w,
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

  Widget _buildJoinBusinessSection() {
    return Container(
      padding: EdgeInsets.all(24.w),
      decoration: NeutralThemeHelper.cardDecoration.copyWith(
        borderRadius: BorderRadius.circular(20.r),
        boxShadow: [
          BoxShadow(
            color: NeutralThemeHelper.shadowColor,
            blurRadius: 20.r,
            offset: Offset(0, 8.h),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(12.w),
                decoration: BoxDecoration(
                  gradient: NeutralThemeHelper.primaryGradient,
                  borderRadius: BorderRadius.circular(16.r),
                ),
                child: Icon(
                  Icons.add_business,
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
                      'Join a Business',
                      style: NeutralThemeHelper.headingSmall.copyWith(
                        fontSize: 20.sp,
                      ),
                    ),
                    Text(
                      'Enter a business code to start earning rewards',
                      style: NeutralThemeHelper.bodyMedium.copyWith(
                        fontSize: 14.sp,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 20.h),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.pushNamed(context, '/business-code'),
              style: NeutralThemeHelper.primaryButtonStyle.copyWith(
                padding: WidgetStateProperty.all(EdgeInsets.symmetric(vertical: 16.h)),
                shape: WidgetStateProperty.all(
                  RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.qr_code_scanner, size: 20.w),
                  SizedBox(width: 8.w),
                  Text(
                    'Enter Business Code',
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMyBusinessesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'My Businesses',
              style: NeutralThemeHelper.headingMedium.copyWith(
                fontSize: 22.sp,
              ),
            ),
            if (_joinedBusinesses.isNotEmpty)
              TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/user-all-businesses');
                },
                child: Text(
                  'View All',
                  style: NeutralThemeHelper.bodyMedium.copyWith(
                    color: NeutralThemeHelper.accentColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
          ],
        ),
        SizedBox(height: 16.h),
        
        if (_isLoadingBusinesses)
          _buildLoadingBusinessCards()
        else if (_joinedBusinesses.isEmpty)
          _buildEmptyBusinessesCard()
        else
          _buildBusinessCards(),
      ],
    );
  }

  Widget _buildLoadingBusinessCards() {
    return SizedBox(
      height: 160.h,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 3,
        itemBuilder: (context, index) {
          return Container(
            width: 280.w,
            margin: EdgeInsets.only(right: 16.w),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(16.r),
            ),
            child: Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(NeutralThemeHelper.accentColor),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyBusinessesCard() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(32.w),
      decoration: BoxDecoration(
        color: NeutralThemeHelper.cardBackgroundColor,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(
          color: NeutralThemeHelper.borderColor,
          width: 2,
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(16.w),
            decoration: BoxDecoration(
              color: NeutralThemeHelper.accentColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(50.r),
            ),
            child: Icon(
              Icons.business_outlined,
              size: 48.w,
              color: NeutralThemeHelper.accentColor,
            ),
          ),
          SizedBox(height: 16.h),
          Text(
            'No businesses joined yet',
            style: NeutralThemeHelper.headingSmall.copyWith(
              fontSize: 18.sp,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Start your loyalty journey by joining your first business',
            textAlign: TextAlign.center,
            style: NeutralThemeHelper.bodyMedium.copyWith(
              fontSize: 14.sp,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBusinessCards() {
    return SizedBox(
      height: 160.h,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _joinedBusinesses.length,
        itemBuilder: (context, index) {
          final business = _joinedBusinesses[index];
          return _buildBusinessCard(business);
        },
      ),
    );
  }

  Widget _buildBusinessCard(Map<String, dynamic> business) {
    return Container(
      width: 280.w,
      margin: EdgeInsets.only(right: 16.w),
      decoration: NeutralThemeHelper.cardDecoration,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () async {
            // Set the business code and navigate to business dashboard
            final authService = AuthService();
            await authService.setBusinessCode(business['businessCode']);
            Navigator.pushNamed(context, '/home');
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
                      width: 40.w,
                      height: 40.w,
                      decoration: BoxDecoration(
                        gradient: NeutralThemeHelper.primaryGradient,
                        borderRadius: BorderRadius.circular(10.r),
                      ),
                      child: Center(
                        child: Text(
                          business['businessName']?.substring(0, 1).toUpperCase() ?? 'B',
                          style: TextStyle(
                            color: NeutralThemeHelper.textOnPrimaryColor,
                            fontSize: 18.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    SizedBox(width: 12.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            business['businessName'] ?? 'Business',
                            style: NeutralThemeHelper.bodyLarge.copyWith(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            '${business['totalPoints'] ?? 0} points',
                            style: NeutralThemeHelper.bodySmall.copyWith(
                              fontSize: 12.sp,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 16.h),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                  decoration: BoxDecoration(
                    color: NeutralThemeHelper.accentColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20.r),
                  ),
                  child: Text(
                    business['currentRanking'] ?? 'Member',
                    style: NeutralThemeHelper.labelMedium.copyWith(
                      fontSize: 12.sp,
                      color: NeutralThemeHelper.accentColor,
                    ),
                  ),
                ),
                Spacer(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Available Points',
                      style: NeutralThemeHelper.bodySmall.copyWith(
                        fontSize: 12.sp,
                      ),
                    ),
                    Text(
                      '${business['availablePoints'] ?? 0}',
                      style: NeutralThemeHelper.headingSmall.copyWith(
                        fontSize: 18.sp,
                        color: NeutralThemeHelper.accentColor,
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

  Widget _buildQuickActionsSection() {
    final actions = [
      {
        'icon': Icons.person_outline,
        'title': 'Profile',
        'subtitle': 'Manage your account',
        'route': '/account',
        'color': NeutralThemeHelper.accentColor,
      },
      {
        'icon': Icons.history,
        'title': 'Transaction History',
        'subtitle': 'View your activity',
        'route': '/user-transactions',
        'color': NeutralThemeHelper.successColor,
      },
      {
        'icon': Icons.local_offer_outlined,
        'title': 'Available Offers',
        'subtitle': 'Check your rewards',
        'route': '/user-coupons',
        'color': NeutralThemeHelper.warningColor,
      },
      {
        'icon': Icons.help_outline,
        'title': 'Help & Support',
        'subtitle': 'Get assistance',
        'route': '/help',
        'color': NeutralThemeHelper.secondaryColor,
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: NeutralThemeHelper.headingMedium.copyWith(
            fontSize: 22.sp,
          ),
        ),
        SizedBox(height: 16.h),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 16.w,
            mainAxisSpacing: 16.h,
            childAspectRatio: 1.5,
          ),
          itemCount: actions.length,
          itemBuilder: (context, index) {
            final action = actions[index];
            return _buildActionCard(action);
          },
        ),
      ],
    );
  }

  Widget _buildActionCard(Map<String, dynamic> action) {
    return Container(
      decoration: NeutralThemeHelper.cardDecoration,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            if (action['route'] != '/help') {
              Navigator.pushNamed(context, action['route']);
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Help & Support coming soon!')),
              );
            }
          },
          borderRadius: BorderRadius.circular(16.r),
          child: Padding(
            padding: EdgeInsets.all(16.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: EdgeInsets.all(8.w),
                  decoration: BoxDecoration(
                    color: (action['color'] as Color).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10.r),
                  ),
                  child: Icon(
                    action['icon'],
                    color: action['color'],
                    size: 20.w,
                  ),
                ),
                SizedBox(height: 12.h),
                Text(
                  action['title'],
                  style: NeutralThemeHelper.labelLarge.copyWith(
                    fontSize: 14.sp,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  action['subtitle'],
                  style: NeutralThemeHelper.bodySmall.copyWith(
                    fontSize: 12.sp,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
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