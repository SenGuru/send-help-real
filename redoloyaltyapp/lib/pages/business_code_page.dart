import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../services/auth_service.dart';
import '../utils/neutral_theme_helper.dart';

class BusinessCodePage extends StatefulWidget {
  const BusinessCodePage({super.key});

  @override
  State<BusinessCodePage> createState() => _BusinessCodePageState();
}

class _BusinessCodePageState extends State<BusinessCodePage> {
  final TextEditingController _codeController = TextEditingController();
  final List<TextEditingController> _digitControllers = List.generate(5, (index) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(5, (index) => FocusNode());
  bool _isLoading = false;
  String _errorMessage = '';

  @override
  void dispose() {
    _codeController.dispose();
    for (var controller in _digitControllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _onDigitChanged(int index, String value) {
    if (value.isNotEmpty) {
      if (index < 4) {
        _focusNodes[index + 1].requestFocus();
      } else {
        _focusNodes[index].unfocus();
      }
    } else if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
    
    _updateCodeController();
  }

  void _updateCodeController() {
    String code = '';
    for (var controller in _digitControllers) {
      code += controller.text;
    }
    _codeController.text = code;
  }

  Future<void> _submitCode() async {
    String code = _codeController.text;
    
    if (code.length != 5) {
      setState(() {
        _errorMessage = 'Please enter a 5-digit business code';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    // Validate business code with backend but DON'T save it yet
    try {
      final authService = AuthService();
      final response = await authService.getBusinessInfo(code);
      
      if (mounted) {
        setState(() {
          _isLoading = false;
        });

        if (response != null && response['success'] == true) {
          // Mark that user has used the app
          await authService.markAppAsUsed();
          
          // Business code is valid, go to business confirmation page
          if (mounted) {
            Navigator.of(context).pushReplacementNamed(
              '/business-confirmation',
              arguments: {'businessCode': code}
            );
          }
        } else {
          setState(() {
            _errorMessage = 'Invalid business code. Please try again.';
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Failed to validate business code. Please try again.';
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
                        'Enter Business Code',
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
                child: Padding(
                  padding: EdgeInsets.all(24.w),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Icon Section
                      Container(
                        padding: EdgeInsets.all(24.w),
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
                          Icons.business,
                          size: 60.r,
                          color: NeutralThemeHelper.textOnPrimaryColor,
                        ),
                      ),
                      SizedBox(height: 32.h),
                      
                      Text(
                        'Welcome!',
                        style: NeutralThemeHelper.headingLarge.copyWith(
                          fontSize: 32.sp,
                        ),
                      ),
                      SizedBox(height: 16.h),
                      
                      Text(
                        'Please enter your 5-digit business code to access your loyalty program',
                        textAlign: TextAlign.center,
                        style: NeutralThemeHelper.bodyLarge.copyWith(
                          fontSize: 16.sp,
                          color: NeutralThemeHelper.textSecondaryColor,
                        ),
                      ),
                      SizedBox(height: 48.h),
                      
                      // Code Input Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: List.generate(5, (index) {
                          return Container(
                            width: 50.w,
                            height: 60.h,
                            decoration: BoxDecoration(
                              color: NeutralThemeHelper.inputBackgroundColor,
                              border: Border.all(
                                color: _digitControllers[index].text.isNotEmpty 
                                    ? NeutralThemeHelper.inputBorderFocusedColor
                                    : NeutralThemeHelper.inputBorderColor,
                                width: _digitControllers[index].text.isNotEmpty ? 2 : 1,
                              ),
                              borderRadius: BorderRadius.circular(12.r),
                              boxShadow: [
                                BoxShadow(
                                  color: NeutralThemeHelper.shadowLightColor,
                                  blurRadius: 4.r,
                                  offset: Offset(0, 2.h),
                                ),
                              ],
                            ),
                            child: TextField(
                              controller: _digitControllers[index],
                              focusNode: _focusNodes[index],
                              textAlign: TextAlign.center,
                              keyboardType: TextInputType.number,
                              maxLength: 1,
                              style: NeutralThemeHelper.headingMedium.copyWith(
                                fontSize: 24.sp,
                              ),
                              decoration: const InputDecoration(
                                counterText: '',
                                border: InputBorder.none,
                              ),
                              onChanged: (value) => _onDigitChanged(index, value),
                            ),
                          );
                        }),
                      ),
                      SizedBox(height: 24.h),
                      
                      // Error Message
                      if (_errorMessage.isNotEmpty)
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                          decoration: BoxDecoration(
                            color: NeutralThemeHelper.errorColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8.r),
                            border: Border.all(
                              color: NeutralThemeHelper.errorColor.withValues(alpha: 0.3),
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.error_outline,
                                color: NeutralThemeHelper.errorColor,
                                size: 20.r,
                              ),
                              SizedBox(width: 8.w),
                              Expanded(
                                child: Text(
                                  _errorMessage,
                                  style: NeutralThemeHelper.bodyMedium.copyWith(
                                    color: NeutralThemeHelper.errorColor,
                                    fontSize: 14.sp,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      SizedBox(height: 32.h),
                      
                      // Continue Button
                      SizedBox(
                        width: double.infinity,
                        height: 56.h,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _submitCode,
                          style: _isLoading
                              ? NeutralThemeHelper.primaryButtonStyle.copyWith(
                                  backgroundColor: WidgetStateProperty.all(NeutralThemeHelper.buttonDisabledColor),
                                )
                              : NeutralThemeHelper.primaryButtonStyle,
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
                                      Icons.arrow_forward_rounded,
                                      size: 20.r,
                                    ),
                                    SizedBox(width: 8.w),
                                    Text(
                                      'Continue',
                                      style: TextStyle(
                                        fontSize: 16.sp,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                      SizedBox(height: 24.h),
                      
                      // Help Section
                      Text(
                        'Don\'t have a business code?',
                        style: NeutralThemeHelper.bodyMedium.copyWith(
                          fontSize: 14.sp,
                        ),
                      ),
                      SizedBox(height: 8.h),
                      
                      TextButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Text('Contact your business administrator for the code'),
                              backgroundColor: NeutralThemeHelper.infoColor,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12.r),
                              ),
                              margin: EdgeInsets.all(16.r),
                            ),
                          );
                        },
                        child: Text(
                          'Contact Administrator',
                          style: NeutralThemeHelper.bodyMedium.copyWith(
                            fontSize: 14.sp,
                            color: NeutralThemeHelper.accentColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
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
}