import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../utils/neutral_theme_helper.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _otpController = TextEditingController();
  bool _isOtpSent = false;
  bool _acceptedTerms = false;

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
                        'Create Account',
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
              // Content
              Expanded(
                child: SingleChildScrollView(
                  padding: EdgeInsets.symmetric(horizontal: 24.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      SizedBox(height: 20.h),
                      
                      // Title Section
                      Text(
                        'Join Our Loyalty Program',
                        style: NeutralThemeHelper.headingLarge.copyWith(
                          fontSize: 28.sp,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 8.h),
                      Text(
                        'Create your account and start earning rewards',
                        style: NeutralThemeHelper.bodyLarge.copyWith(
                          fontSize: 16.sp,
                          color: NeutralThemeHelper.textSecondaryColor,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      
                      SizedBox(height: 40.h),
                      
                      // Form Container
                      Container(
                        padding: EdgeInsets.all(24.w),
                        decoration: NeutralThemeHelper.cardDecoration,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Full Name
                            _buildInputField(
                              controller: _nameController,
                              label: 'Full Name',
                              hint: 'Enter your full name',
                              keyboardType: TextInputType.name,
                            ),
                            
                            SizedBox(height: 20.h),
                            
                            // Email
                            _buildInputField(
                              controller: _emailController,
                              label: 'Email Address',
                              hint: 'Enter your email',
                              keyboardType: TextInputType.emailAddress,
                            ),
                            
                            SizedBox(height: 20.h),
                            
                            // Phone Number
                            _buildInputField(
                              controller: _phoneController,
                              label: 'Phone Number',
                              hint: '+1 (555) 123-4567',
                              keyboardType: TextInputType.phone,
                            ),
                            
                            if (_isOtpSent) ...[
                              SizedBox(height: 20.h),
                              _buildInputField(
                                controller: _otpController,
                                label: 'Verification Code',
                                hint: '123456',
                                keyboardType: TextInputType.number,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 20.sp,
                                  letterSpacing: 8.w,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                            
                            SizedBox(height: 24.h),
                            
                            // Terms and Conditions
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Checkbox(
                                  value: _acceptedTerms,
                                  onChanged: (value) {
                                    setState(() {
                                      _acceptedTerms = value ?? false;
                                    });
                                  },
                                  activeColor: NeutralThemeHelper.accentColor,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(4.r),
                                  ),
                                ),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      SizedBox(height: 12.h),
                                      RichText(
                                        text: TextSpan(
                                          style: NeutralThemeHelper.bodyMedium.copyWith(
                                            fontSize: 14.sp,
                                          ),
                                          children: [
                                            const TextSpan(text: 'I agree to the '),
                                            TextSpan(
                                              text: 'Terms of Service',
                                              style: TextStyle(
                                                color: NeutralThemeHelper.accentColor,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const TextSpan(text: ' and '),
                                            TextSpan(
                                              text: 'Privacy Policy',
                                              style: TextStyle(
                                                color: NeutralThemeHelper.accentColor,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            
                            SizedBox(height: 32.h),
                            
                            // Sign Up Button
                            SizedBox(
                              width: double.infinity,
                              height: 56.h,
                              child: ElevatedButton(
                                onPressed: _acceptedTerms ? () {
                                  if (!_isOtpSent) {
                                    setState(() {
                                      _isOtpSent = true;
                                    });
                                  } else {
                                    Navigator.pushReplacementNamed(context, '/user-homepage');
                                  }
                                } : null,
                                style: _acceptedTerms 
                                    ? NeutralThemeHelper.primaryButtonStyle
                                    : NeutralThemeHelper.primaryButtonStyle.copyWith(
                                        backgroundColor: WidgetStateProperty.all(NeutralThemeHelper.buttonDisabledColor),
                                      ),
                                child: Text(
                                  _isOtpSent ? 'Verify & Create Account' : 'Send OTP',
                                  style: TextStyle(
                                    fontSize: 16.sp,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                            
                            if (_isOtpSent) ...[
                              SizedBox(height: 16.h),
                              TextButton(
                                onPressed: () {
                                  // Resend OTP logic
                                },
                                child: Text(
                                  'Resend Code',
                                  style: NeutralThemeHelper.bodyMedium.copyWith(
                                    fontSize: 14.sp,
                                    color: NeutralThemeHelper.accentColor,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      
                      SizedBox(height: 32.h),
                      
                      // Sign In Link
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Already have an account? ',
                            style: NeutralThemeHelper.bodyLarge.copyWith(
                              fontSize: 16.sp,
                              color: NeutralThemeHelper.textSecondaryColor,
                            ),
                          ),
                          GestureDetector(
                            onTap: () {
                              Navigator.pop(context);
                            },
                            child: Text(
                              'Sign In',
                              style: NeutralThemeHelper.bodyLarge.copyWith(
                                fontSize: 16.sp,
                                color: NeutralThemeHelper.accentColor,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                      
                      SizedBox(height: 40.h),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
    TextAlign textAlign = TextAlign.start,
    TextStyle? style,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: NeutralThemeHelper.labelLarge.copyWith(
            fontSize: 14.sp,
          ),
        ),
        SizedBox(height: 8.h),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          textAlign: textAlign,
          style: style ?? NeutralThemeHelper.bodyLarge.copyWith(fontSize: 16.sp),
          decoration: NeutralThemeHelper.getInputDecoration(
            hintText: hint,
          ),
        ),
      ],
    );
  }
}