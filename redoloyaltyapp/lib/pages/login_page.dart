import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../colors.dart';
import '../providers/app_state_provider.dart';
import '../utils/neutral_theme_helper.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _phoneController = TextEditingController();
  final List<TextEditingController> _otpControllers = List.generate(6, (index) => TextEditingController());
  final List<FocusNode> _otpFocusNodes = List.generate(6, (index) => FocusNode());
  
  bool _isOtpSent = false;
  bool _isLoading = false;
  int _resendTimer = 30;
  String? _businessCode;

  @override
  void initState() {
    super.initState();
    // Add listener to phone controller to rebuild UI
    _phoneController.addListener(_updateButtonState);
    
    // Get business code from route arguments
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final args = ModalRoute.of(context)?.settings.arguments;
      print('DEBUG Login: Route arguments: $args');
      if (args is Map<String, dynamic> && args.containsKey('businessCode')) {
        setState(() {
          _businessCode = args['businessCode'] as String;
          print('DEBUG Login: Set business code to: $_businessCode');
        });
      } else {
        print('DEBUG Login: No business code in arguments');
      }
    });
  }

  @override
  void dispose() {
    _phoneController.removeListener(_updateButtonState);
    _phoneController.dispose();
    for (var controller in _otpControllers) {
      controller.dispose();
    }
    for (var node in _otpFocusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _updateButtonState() {
    setState(() {
      // This will rebuild the UI when phone number changes
    });
  }

  bool get _canSendOtp {
    return _phoneController.text.length >= 10 && !_isLoading;
  }

  void _startResendTimer() {
    if (!mounted) return;
    
    setState(() {
      _resendTimer = 30;
    });
    
    _countdown();
  }

  void _countdown() async {
    for (int i = 30; i > 0; i--) {
      if (!mounted) return;
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        setState(() {
          _resendTimer = i - 1;
        });
      }
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
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(horizontal: 24.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: 60.h),
                
                // Logo Section
                _buildLogoSection(),
                
                SizedBox(height: 60.h),
                
                // Main Content Card
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: _isOtpSent ? _buildOtpCard() : _buildPhoneCard(),
                ),
                
                SizedBox(height: 40.h),
                
                // Sign Up Link
                _buildSignUpLink(),
                
                SizedBox(height: 40.h),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogoSection() {
    return Column(
      children: [
        Container(
          width: 120.r,
          height: 120.r,
          decoration: BoxDecoration(
            gradient: NeutralThemeHelper.primaryGradient,
            borderRadius: BorderRadius.circular(30.r),
            boxShadow: [
              BoxShadow(
                color: NeutralThemeHelper.shadowColor,
                blurRadius: 20.r,
                offset: Offset(0, 10.h),
              ),
            ],
          ),
          child: Icon(
            Icons.loyalty,
            size: 60.r,
            color: NeutralThemeHelper.textOnPrimaryColor,
          ),
        ),
        SizedBox(height: 32.h),
        Text(
          'Welcome Back',
          style: NeutralThemeHelper.headingLarge.copyWith(
            fontSize: 36.sp,
          ),
        ),
        SizedBox(height: 12.h),
        Text(
          'Sign in to your loyalty account',
          style: NeutralThemeHelper.bodyLarge.copyWith(
            fontSize: 18.sp,
            color: NeutralThemeHelper.textSecondaryColor,
          ),
        ),
      ],
    );
  }

  Widget _buildPhoneCard() {
    return Container(
      key: const ValueKey('phone'),
      padding: EdgeInsets.all(28.r),
      decoration: NeutralThemeHelper.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Phone Number',
            style: NeutralThemeHelper.headingSmall.copyWith(
              fontSize: 18.sp,
            ),
          ),
          SizedBox(height: 16.h),
          
          // Phone Input Field
          Container(
            decoration: BoxDecoration(
              color: NeutralThemeHelper.inputBackgroundColor,
              borderRadius: BorderRadius.circular(16.r),
              border: Border.all(
                color: NeutralThemeHelper.inputBorderColor,
                width: 1.w,
              ),
            ),
            child: Row(
              children: [
                // Country code section
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 20.h),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('🇺🇸', style: TextStyle(fontSize: 20.sp)),
                      SizedBox(width: 8.w),
                      Text(
                        '+1',
                        style: NeutralThemeHelper.bodyLarge.copyWith(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                // Phone number input
                Expanded(
                  child: TextField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(10),
                    ],
                    decoration: InputDecoration(
                      hintText: '5551234567',
                      hintStyle: TextStyle(
                        color: NeutralThemeHelper.inputPlaceholderColor,
                        fontSize: 18.sp,
                      ),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 16.w,
                        vertical: 20.h,
                      ),
                    ),
                    style: NeutralThemeHelper.bodyLarge.copyWith(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          SizedBox(height: 32.h),
          
          // Send OTP Button
          SizedBox(
            height: 56.h,
            child: ElevatedButton(
              onPressed: _canSendOtp ? _sendOtp : null,
              style: _canSendOtp 
                  ? NeutralThemeHelper.primaryButtonStyle
                  : NeutralThemeHelper.primaryButtonStyle.copyWith(
                      backgroundColor: WidgetStateProperty.all(NeutralThemeHelper.buttonDisabledColor),
                    ),
              child: _isLoading
                  ? SizedBox(
                      width: 24.r,
                      height: 24.r,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.w,
                        valueColor: AlwaysStoppedAnimation<Color>(NeutralThemeHelper.textOnPrimaryColor),
                      ),
                    )
                  : Text(
                      'Send OTP',
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),
          
          SizedBox(height: 16.h),
          
          // Phone number length indicator
          Text(
            '${_phoneController.text.length}/10 digits',
            style: NeutralThemeHelper.bodySmall.copyWith(
              color: _phoneController.text.length >= 10 
                  ? NeutralThemeHelper.successColor 
                  : NeutralThemeHelper.textSecondaryColor,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildOtpCard() {
    return Container(
      key: const ValueKey('otp'),
      padding: EdgeInsets.all(28.r),
      decoration: NeutralThemeHelper.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Verification Code',
            style: NeutralThemeHelper.headingSmall.copyWith(
              fontSize: 18.sp,
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            'Enter the 6-digit code sent to +1${_phoneController.text}',
            style: NeutralThemeHelper.bodyMedium.copyWith(
              fontSize: 14.sp,
            ),
          ),
          SizedBox(height: 32.h),
          
          // OTP Input Boxes
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(6, (index) => _buildOtpBox(index)),
          ),
          
          SizedBox(height: 32.h),
          
          // Verify Button
          SizedBox(
            height: 56.h,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _verifyOtp,
              style: NeutralThemeHelper.primaryButtonStyle,
              child: _isLoading
                  ? SizedBox(
                      width: 24.r,
                      height: 24.r,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.w,
                        valueColor: AlwaysStoppedAnimation<Color>(NeutralThemeHelper.textOnPrimaryColor),
                      ),
                    )
                  : Text(
                      'Verify & Sign In',
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),
          
          SizedBox(height: 24.h),
          
          // Resend Code
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                "Didn't receive code? ",
                style: NeutralThemeHelper.bodyMedium,
              ),
              if (_resendTimer > 0)
                Text(
                  'Resend in ${_resendTimer}s',
                  style: NeutralThemeHelper.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                )
              else
                GestureDetector(
                  onTap: _resendOtp,
                  child: Text(
                    'Resend Code',
                    style: NeutralThemeHelper.bodyMedium.copyWith(
                      color: NeutralThemeHelper.accentColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          
          SizedBox(height: 16.h),
          
          // Back to Phone Number
          GestureDetector(
            onTap: _goBackToPhone,
            child: Text(
              'Change Phone Number',
              style: NeutralThemeHelper.bodyMedium.copyWith(
                color: NeutralThemeHelper.accentColor,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOtpBox(int index) {
    return Container(
      width: 50.r,
      height: 60.r,
      decoration: BoxDecoration(
        color: NeutralThemeHelper.inputBackgroundColor,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(
          color: _otpControllers[index].text.isNotEmpty 
              ? NeutralThemeHelper.inputBorderFocusedColor
              : NeutralThemeHelper.inputBorderColor,
          width: _otpControllers[index].text.isNotEmpty ? 2.w : 1.w,
        ),
      ),
      child: TextField(
        controller: _otpControllers[index],
        focusNode: _otpFocusNodes[index],
        keyboardType: TextInputType.number,
        textAlign: TextAlign.center,
        maxLength: 1,
        inputFormatters: [
          FilteringTextInputFormatter.digitsOnly,
        ],
        decoration: const InputDecoration(
          border: InputBorder.none,
          counterText: '',
        ),
        style: NeutralThemeHelper.headingMedium.copyWith(
          fontSize: 24.sp,
          fontWeight: FontWeight.bold,
        ),
        onChanged: (value) {
          if (value.isNotEmpty) {
            if (index < 5) {
              _otpFocusNodes[index + 1].requestFocus();
            } else {
              // Check if all boxes are filled
              _checkAutoVerify();
            }
          } else {
            if (index > 0) {
              _otpFocusNodes[index - 1].requestFocus();
            }
          }
        },
      ),
    );
  }

  Widget _buildSignUpLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          "Don't have an account? ",
          style: NeutralThemeHelper.bodyLarge.copyWith(
            fontSize: 16.sp,
            color: NeutralThemeHelper.textSecondaryColor,
          ),
        ),
        GestureDetector(
          onTap: () {
            Navigator.pushNamed(context, '/signup');
          },
          child: Text(
            'Sign Up',
            style: NeutralThemeHelper.bodyLarge.copyWith(
              fontSize: 16.sp,
              color: NeutralThemeHelper.accentColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  void _checkAutoVerify() {
    String otp = _otpControllers.map((c) => c.text).join();
    if (otp.length == 6) {
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted) _verifyOtp();
      });
    }
  }

  void _sendOtp() async {
    if (_phoneController.text.length < 10) {
      _showSnackBar('Please enter a valid 10-digit phone number', isError: true);
      return;
    }
    
    setState(() {
      _isLoading = true;
    });
    
    final appState = Provider.of<AppStateProvider>(context, listen: false);
    final success = await appState.sendOtp('+1${_phoneController.text}');
    
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
      
      if (success) {
        setState(() {
          _isOtpSent = true;
        });
        
        _startResendTimer();
        _showSnackBar('OTP sent to +1${_phoneController.text}');
        
        // Auto-focus first OTP box
        Future.delayed(const Duration(milliseconds: 300), () {
          if (mounted) {
            _otpFocusNodes[0].requestFocus();
          }
        });
      } else {
        if (appState.errorMessage != null) {
          _showSnackBar(appState.errorMessage!, isError: true);
        }
      }
    }
  }

  void _verifyOtp() async {
    String otp = _otpControllers.map((c) => c.text).join();
    
    if (otp.length != 6) {
      _showSnackBar('Please enter the complete 6-digit code', isError: true);
      return;
    }
    
    setState(() {
      _isLoading = true;
    });
    
    final appState = Provider.of<AppStateProvider>(context, listen: false);
    final success = await appState.verifyOtp('+1${_phoneController.text}', otp);
    
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
      
      if (success) {
        // For now, all OTP verifications go to user info (signup flow)
        // In a real app, you'd have separate login/signup flows
        Navigator.pushReplacementNamed(
          context, 
          '/user-info',
          arguments: {
            'phoneNumber': '+1${_phoneController.text}',
            'businessCode': _businessCode,
          },
        );
      } else {
        if (appState.errorMessage != null) {
          _showSnackBar(appState.errorMessage!, isError: true);
        } else {
          _showSnackBar('Invalid OTP. Please try again.', isError: true);
        }
      }
    }
  }

  void _resendOtp() async {
    // Clear OTP fields
    for (var controller in _otpControllers) {
      controller.clear();
    }
    
    setState(() {
      _isLoading = true;
    });
    
    final appState = Provider.of<AppStateProvider>(context, listen: false);
    final success = await appState.sendOtp('+1${_phoneController.text}');
    
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
      
      if (success) {
        _startResendTimer();
        _showSnackBar('New OTP sent!');
        _otpFocusNodes[0].requestFocus();
      } else {
        if (appState.errorMessage != null) {
          _showSnackBar(appState.errorMessage!, isError: true);
        }
      }
    }
  }

  void _goBackToPhone() {
    setState(() {
      _isOtpSent = false;
      for (var controller in _otpControllers) {
        controller.clear();
      }
    });
  }

  void _showSnackBar(String message, {bool isError = false}) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            message,
            style: TextStyle(color: Colors.white),
          ),
          backgroundColor: isError ? NeutralThemeHelper.errorColor : NeutralThemeHelper.successColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.r),
          ),
          margin: EdgeInsets.all(16.r),
        ),
      );
    }
  }
}