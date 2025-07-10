import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import 'package:redoloyaltyapp/pages/account_details_page.dart';
import 'package:redoloyaltyapp/pages/coupons_details_page.dart';
import 'providers/app_state_provider.dart';
import 'services/auth_service.dart';
import 'colors.dart';
import 'pages/login_page.dart';
import 'pages/signup_page.dart';
import 'pages/business_code_page.dart';
import 'pages/business_confirmation_page.dart';
import 'pages/business_info_page.dart';
import 'pages/home_page.dart';
import 'pages/membership_page.dart';
import 'pages/coupons_page.dart';
import 'pages/transactions_page.dart';
import 'pages/transaction_details_page.dart';
import 'pages/user_info_page.dart';
import 'pages/user_homepage.dart';
import 'pages/user_coupons_page.dart';
import 'pages/user_transactions_page.dart';
import 'pages/user_all_businesses_page.dart';
import 'pages/business_coupons_page.dart';
import 'pages/business_transactions_page.dart';

void main() {
  runApp(const LoyaltyApp());
}

class LoyaltyApp extends StatelessWidget {
  const LoyaltyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => AppStateProvider(),
      child: ScreenUtilInit(
        designSize: const Size(430, 932), // iPhone 15 Pro Max dimensions
        minTextAdapt: true,
        splitScreenMode: true,
        builder: (context, child) {
          return MaterialApp(
            title: 'Loyalty Program',
            debugShowCheckedModeBanner: false,
            theme: ThemeData(
              primarySwatch: MaterialColor(0xFF9CAF88, {
                50: AppColors.lightBeige,
                100: AppColors.beige,
                200: AppColors.lightSageGreen,
                300: AppColors.sageGreen,
                400: AppColors.sageGreen,
                500: AppColors.sageGreen,
                600: AppColors.darkSageGreen,
                700: AppColors.darkSageGreen,
                800: AppColors.darkSageGreen,
                900: AppColors.darkSageGreen,
              }),
              scaffoldBackgroundColor: AppColors.lightBeige,
              fontFamily: 'SF Pro Display',
              appBarTheme: AppBarTheme(
                backgroundColor: AppColors.sageGreen,
                foregroundColor: AppColors.white,
                elevation: 0,
                titleTextStyle: TextStyle(
                  color: AppColors.white,
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
              elevatedButtonTheme: ElevatedButtonThemeData(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.sageGreen,
                  foregroundColor: AppColors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  padding: EdgeInsets.symmetric(vertical: 16.h, horizontal: 24.w),
                ),
              ),
            ),
            initialRoute: '/',
            routes: {
              '/': (context) => const AppInitializer(),
              '/login': (context) => const LoginPage(),
              '/signup': (context) => const SignUpPage(),
              '/user-homepage': (context) => const UserHomepage(),
              '/business-code': (context) => const BusinessCodePage(),
              '/business-confirmation': (context) => const BusinessConfirmationPage(),
              '/business-info': (context) => const BusinessInfoPage(),
              '/home': (context) => const HomePage(),
              '/membership': (context) => const MembershipPage(),
              '/coupons': (context) => const CouponsPage(),
              '/account': (context) => const AccountPage(),
              '/transactions': (context) => const TransactionsPage(),
              '/transaction-details': (context) => const TransactionDetailsPage(),
              '/coupon-details': (context) => const CouponDetailsPage(),
              // User-specific pages
              '/user-coupons': (context) => const UserCouponsPage(),
              '/user-transactions': (context) => const UserTransactionsPage(),
              '/user-all-businesses': (context) => const UserAllBusinessesPage(),
              // Business-specific pages
              '/business-coupons': (context) => const BusinessCouponsPage(),
              '/business-transactions': (context) => const BusinessTransactionsPage(),
            },
            onGenerateRoute: (settings) {
              if (settings.name == '/user-info') {
                final args = settings.arguments as Map<String, dynamic>;
                final phoneNumber = args['phoneNumber'] as String;
                final businessCode = args['businessCode'] as String?;
                return MaterialPageRoute(
                  builder: (context) => UserInfoPage(
                    phoneNumber: phoneNumber,
                    businessCode: businessCode,
                  ),
                );
              }
              return null;
            },
          );
        },
      ),
    );
  }
}

class AppInitializer extends StatefulWidget {
  const AppInitializer({super.key});

  @override
  State<AppInitializer> createState() => _AppInitializerState();
}

class _AppInitializerState extends State<AppInitializer> {
  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // Simple initialization - check if user is actually authenticated (has valid token)
    final authService = AuthService();
    await authService.init();

    if (mounted) {
      // Debug: Print current auth state
      print('DEBUG: isAuthenticated: ${authService.isAuthenticated}');
      print('DEBUG: isTokenValid: ${authService.isTokenValid()}');
      print('DEBUG: currentBusinessCode: ${authService.currentBusinessCode}');
      print('DEBUG: hasUsedApp: ${authService.hasUsedApp}');
      
      // Be more strict about authentication - only proceed if BOTH conditions are true
      final isValidAuth = authService.isAuthenticated && 
                         authService.isTokenValid() && 
                         authService.currentToken != null &&
                         authService.currentToken!.isNotEmpty;
      
      if (isValidAuth) {
        // User is authenticated, show user homepage
        print('DEBUG: Going to user homepage');
        Navigator.pushReplacementNamed(context, '/user-homepage');
      } else {
        // Not authenticated - clear data first to ensure clean state
        print('DEBUG: Authentication invalid, clearing data and going to login');
        await authService.logout();
        if (mounted) {
          // Always go to login page (the "page before sign up")
          print('DEBUG: Going to login page (not authenticated)');
          Navigator.pushReplacementNamed(context, '/login');
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppColors.lightBeige,
              AppColors.beige,
              AppColors.lightBeige,
            ],
            stops: const [0.0, 0.3, 1.0],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 120.r,
                height: 120.r,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.sageGreen, AppColors.darkSageGreen],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(30.r),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.sageGreen.withValues(alpha: 0.3),
                      blurRadius: 20.r,
                      offset: Offset(0, 10.h),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.loyalty,
                  size: 60.r,
                  color: AppColors.white,
                ),
              ),
              SizedBox(height: 32.h),
              Text(
                'Loyalty Program',
                style: TextStyle(
                  fontSize: 28.sp,
                  fontWeight: FontWeight.bold,
                  color: AppColors.darkSageGreen,
                ),
              ),
              SizedBox(height: 16.h),
              Text(
                'Loading...',
                style: TextStyle(
                  fontSize: 16.sp,
                  color: AppColors.grey,
                ),
              ),
              SizedBox(height: 32.h),
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.sageGreen),
              ),
            ],
          ),
        ),
      ),
    );
  }
}