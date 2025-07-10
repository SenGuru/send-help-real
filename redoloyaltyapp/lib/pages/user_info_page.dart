import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../services/auth_service.dart';
import '../utils/neutral_theme_helper.dart';

class UserInfoPage extends StatefulWidget {
  final String phoneNumber;
  final String? businessCode;
  
  const UserInfoPage({
    super.key,
    required this.phoneNumber,
    this.businessCode,
  });

  @override
  State<UserInfoPage> createState() => _UserInfoPageState();
}

class _UserInfoPageState extends State<UserInfoPage> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  DateTime? _selectedDate;
  
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().subtract(const Duration(days: 18 * 365)),
      firstDate: DateTime(1950),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: NeutralThemeHelper.primaryColor,
              onPrimary: NeutralThemeHelper.textOnPrimaryColor,
              surface: NeutralThemeHelper.cardBackgroundColor,
              onSurface: NeutralThemeHelper.textPrimaryColor,
            ),
          ),
          child: child!,
        );
      },
    );
    
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _createAccount() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Passwords do not match'),
          backgroundColor: NeutralThemeHelper.errorColor,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final authService = AuthService();
      
      // Create user account with real data
      final success = await authService.registerUser(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        phoneNumber: widget.phoneNumber,
      );

      if (success && mounted) {
        // Check if we have a business code from the form or saved
        final businessCodeToUse = widget.businessCode ?? authService.currentBusinessCode;
        
        print('DEBUG UserInfo: widget.businessCode = ${widget.businessCode}');
        print('DEBUG UserInfo: authService.currentBusinessCode = ${authService.currentBusinessCode}');
        print('DEBUG UserInfo: businessCodeToUse = $businessCodeToUse');
        
        if (businessCodeToUse != null) {
          // User has a business code, try to join the business
          try {
            print('DEBUG UserInfo: Attempting to join business: $businessCodeToUse');
            final joinSuccess = await authService.joinBusiness(businessCodeToUse);
            print('DEBUG UserInfo: Join business result: $joinSuccess');
            
            if (joinSuccess) {
              // Successfully joined business, go to home
              if (mounted) {
                print('DEBUG UserInfo: Going to home page');
                // Give a small delay to ensure data is saved
                await Future.delayed(const Duration(milliseconds: 500));
                Navigator.pushNamedAndRemoveUntil(
                  context,
                  '/home',
                  (route) => false,
                );
              }
            } else {
              // Failed to join business, go to business code page
              if (mounted) {
                print('DEBUG UserInfo: Join failed, going to user homepage');
                Navigator.pushReplacementNamed(context, '/user-homepage');
              }
            }
          } catch (e) {
            // Error joining business, go to business code page
            print('DEBUG UserInfo: Join error: $e, going to user homepage');
            if (mounted) {
              Navigator.pushReplacementNamed(context, '/user-homepage');
            }
          }
        } else {
          // No business code saved, go to business code page
          print('DEBUG UserInfo: No business code, going to user homepage');
          if (mounted) {
            Navigator.pushReplacementNamed(context, '/user-homepage');
          }
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Failed to create account. Please try again.'),
              backgroundColor: NeutralThemeHelper.errorColor,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: NeutralThemeHelper.errorColor,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
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
                        'Complete Your Profile',
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
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: 20.h),
                        
                        // Welcome Card
                        Container(
                          width: double.infinity,
                          padding: EdgeInsets.all(24.w),
                          decoration: BoxDecoration(
                            gradient: NeutralThemeHelper.primaryGradient,
                            borderRadius: BorderRadius.circular(20.r),
                            boxShadow: [
                              BoxShadow(
                                color: NeutralThemeHelper.shadowColor,
                                blurRadius: 15.r,
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
                                      color: NeutralThemeHelper.textOnPrimaryColor.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(12.r),
                                    ),
                                    child: Icon(
                                      Icons.person_add_rounded,
                                      color: NeutralThemeHelper.textOnPrimaryColor,
                                      size: 24.r,
                                    ),
                                  ),
                                  SizedBox(width: 16.w),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Almost there!',
                                          style: TextStyle(
                                            fontSize: 22.sp,
                                            fontWeight: FontWeight.bold,
                                            color: NeutralThemeHelper.textOnPrimaryColor,
                                          ),
                                        ),
                                        SizedBox(height: 4.h),
                                        Text(
                                          'Just a few details to get started',
                                          style: TextStyle(
                                            fontSize: 14.sp,
                                            color: NeutralThemeHelper.textOnPrimaryColor.withOpacity(0.9),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(height: 16.h),
                              Container(
                                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                                decoration: BoxDecoration(
                                  color: NeutralThemeHelper.textOnPrimaryColor.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(12.r),
                                  border: Border.all(
                                    color: NeutralThemeHelper.textOnPrimaryColor.withOpacity(0.3),
                                    width: 1,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.verified_user_rounded,
                                      color: NeutralThemeHelper.textOnPrimaryColor,
                                      size: 18.r,
                                    ),
                                    SizedBox(width: 12.w),
                                    Text(
                                      'Phone verified: ${widget.phoneNumber}',
                                      style: TextStyle(
                                        fontSize: 14.sp,
                                        color: NeutralThemeHelper.textOnPrimaryColor,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        SizedBox(height: 32.h),
                        
                        // Form Fields Container
                        Container(
                          padding: EdgeInsets.all(24.w),
                          decoration: NeutralThemeHelper.cardDecoration,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Form Title
                              Text(
                                'Personal Information',
                                style: NeutralThemeHelper.headingSmall.copyWith(
                                  fontSize: 18.sp,
                                ),
                              ),
                              SizedBox(height: 4.h),
                              Text(
                                'Please fill in your details below',
                                style: NeutralThemeHelper.bodyMedium.copyWith(
                                  fontSize: 14.sp,
                                ),
                              ),
                              SizedBox(height: 24.h),
                              
                              // Name Row
                              Row(
                                children: [
                                  Expanded(
                                    child: _buildTextField(
                                      controller: _firstNameController,
                                      label: 'First Name',
                                      hint: 'Enter first name',
                                      prefixIcon: Icons.person_outline_rounded,
                                      validator: (value) {
                                        if (value == null || value.trim().isEmpty) {
                                          return 'Required';
                                        }
                                        if (value.trim().length < 2) {
                                          return 'Too short';
                                        }
                                        return null;
                                      },
                                    ),
                                  ),
                                  SizedBox(width: 16.w),
                                  Expanded(
                                    child: _buildTextField(
                                      controller: _lastNameController,
                                      label: 'Last Name',
                                      hint: 'Enter last name',
                                      prefixIcon: Icons.person_outline_rounded,
                                      validator: (value) {
                                        if (value == null || value.trim().isEmpty) {
                                          return 'Required';
                                        }
                                        if (value.trim().length < 2) {
                                          return 'Too short';
                                        }
                                        return null;
                                      },
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(height: 20.h),

                              // Email
                              _buildTextField(
                                controller: _emailController,
                                label: 'Email Address',
                                hint: 'Enter your email',
                                prefixIcon: Icons.email_outlined,
                                keyboardType: TextInputType.emailAddress,
                                validator: (value) {
                                  if (value == null || value.trim().isEmpty) {
                                    return 'Email is required';
                                  }
                                  final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
                                  if (!emailRegex.hasMatch(value.trim())) {
                                    return 'Please enter a valid email address';
                                  }
                                  return null;
                                },
                              ),
                              SizedBox(height: 20.h),

                              // Date of Birth
                              _buildDateField(),
                              SizedBox(height: 20.h),

                              // Password
                              _buildTextField(
                                controller: _passwordController,
                                label: 'Password',
                                hint: 'Create a password',
                                prefixIcon: Icons.lock_outline_rounded,
                                obscureText: _obscurePassword,
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscurePassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                                    color: NeutralThemeHelper.textSecondaryColor,
                                    size: 20.r,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _obscurePassword = !_obscurePassword;
                                    });
                                  },
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Password is required';
                                  }
                                  if (value.length < 8) {
                                    return 'Password must be at least 8 characters';
                                  }
                                  return null;
                                },
                              ),
                              SizedBox(height: 20.h),

                              // Confirm Password
                              _buildTextField(
                                controller: _confirmPasswordController,
                                label: 'Confirm Password',
                                hint: 'Confirm your password',
                                prefixIcon: Icons.lock_outline_rounded,
                                obscureText: _obscureConfirmPassword,
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscureConfirmPassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                                    color: NeutralThemeHelper.textSecondaryColor,
                                    size: 20.r,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _obscureConfirmPassword = !_obscureConfirmPassword;
                                    });
                                  },
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please confirm your password';
                                  }
                                  if (value != _passwordController.text) {
                                    return 'Passwords do not match';
                                  }
                                  return null;
                                },
                              ),
                            ],
                          ),
                        ),
                        
                        SizedBox(height: 32.h),

                        // Create Account Button
                        SizedBox(
                          width: double.infinity,
                          height: 56.h,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _createAccount,
                            style: NeutralThemeHelper.primaryButtonStyle.copyWith(
                              shape: WidgetStateProperty.all(
                                RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16.r),
                                ),
                              ),
                            ),
                            child: _isLoading
                                ? SizedBox(
                                    height: 24.h,
                                    width: 24.w,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(NeutralThemeHelper.textOnPrimaryColor),
                                    ),
                                  )
                                : Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.person_add_rounded,
                                        size: 20.r,
                                        color: NeutralThemeHelper.textOnPrimaryColor,
                                      ),
                                      SizedBox(width: 12.w),
                                      Text(
                                        'Create Account',
                                        style: TextStyle(
                                          fontSize: 16.sp,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                          ),
                        ),
                        
                        SizedBox(height: 32.h),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
    bool obscureText = false,
    Widget? suffixIcon,
    IconData? prefixIcon,
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
        TextFormField(
          controller: controller,
          validator: validator,
          keyboardType: keyboardType,
          obscureText: obscureText,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: NeutralThemeHelper.inputPlaceholderColor,
              fontSize: 14.sp,
            ),
            prefixIcon: prefixIcon != null 
                ? Icon(
                    prefixIcon,
                    color: NeutralThemeHelper.accentColor,
                    size: 20.r,
                  )
                : null,
            suffixIcon: suffixIcon,
            filled: true,
            fillColor: NeutralThemeHelper.inputBackgroundColor,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12.r),
              borderSide: BorderSide(color: NeutralThemeHelper.inputBorderColor),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12.r),
              borderSide: BorderSide(color: NeutralThemeHelper.inputBorderColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12.r),
              borderSide: BorderSide(color: NeutralThemeHelper.inputBorderFocusedColor, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12.r),
              borderSide: BorderSide(color: NeutralThemeHelper.errorColor),
            ),
            contentPadding: EdgeInsets.symmetric(
              horizontal: 16.w,
              vertical: 14.h,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDateField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Date of Birth (Optional)',
          style: NeutralThemeHelper.labelLarge.copyWith(
            fontSize: 14.sp,
          ),
        ),
        SizedBox(height: 8.h),
        GestureDetector(
          onTap: _selectDate,
          child: Container(
            width: double.infinity,
            padding: EdgeInsets.symmetric(
              horizontal: 16.w,
              vertical: 14.h,
            ),
            decoration: BoxDecoration(
              color: NeutralThemeHelper.inputBackgroundColor,
              borderRadius: BorderRadius.circular(12.r),
              border: Border.all(color: NeutralThemeHelper.inputBorderColor),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.cake_rounded,
                  color: NeutralThemeHelper.accentColor,
                  size: 20.r,
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Text(
                    _selectedDate != null
                        ? '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'
                        : 'Select your date of birth',
                    style: TextStyle(
                      color: _selectedDate != null ? NeutralThemeHelper.textPrimaryColor : NeutralThemeHelper.inputPlaceholderColor,
                      fontSize: 14.sp,
                    ),
                  ),
                ),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  color: NeutralThemeHelper.textSecondaryColor,
                  size: 20.r,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}