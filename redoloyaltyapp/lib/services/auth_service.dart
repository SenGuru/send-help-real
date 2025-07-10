import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';
import '../config/api_config.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final ApiService _apiService = ApiService();
  
  // Storage keys
  static const String _tokenKey = 'jwt_token';
  static const String _userDataKey = 'user_data';
  static const String _businessCodeKey = 'business_code';
  static const String _hasUsedAppKey = 'has_used_app';

  // Current user data
  Map<String, dynamic>? _currentUser;
  String? _currentToken;
  String? _currentBusinessCode;
  bool _hasUsedApp = false;

  // Getters
  bool get isAuthenticated => _currentToken != null;
  Map<String, dynamic>? get currentUser => _currentUser;
  String? get currentToken => _currentToken;
  String? get currentBusinessCode => _currentBusinessCode;
  bool get hasUsedApp => _hasUsedApp;

  // Initialize auth service (call on app start)
  Future<void> init() async {
    await _loadStoredData();
  }

  // Send OTP for phone number
  Future<bool> sendOtp(String phoneNumber) async {
    try {
      // Note: Backend doesn't have this endpoint yet, so we'll simulate for now
      // In a real implementation, you'd call: POST /api/auth/send-otp
      await Future.delayed(const Duration(seconds: 2)); // Simulate network delay
      return true;
    } catch (e) {
      throw AuthException('Failed to send OTP: ${e.toString()}');
    }
  }

  // Register user (business-independent)
  Future<bool> registerUser({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phoneNumber,
  }) async {
    try {
      final response = await _apiService.post(
        '${ApiConfig.baseUrl}/api/users/register',
        body: {
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
          'phoneNumber': phoneNumber,
        },
      );

      if (response['success'] == true) {
        final userData = response['data']['user'];
        final token = response['data']['token'];
        
        await _saveAuthData(token, userData);
        return true;
      } else {
        throw AuthException(response['message'] ?? 'Registration failed');
      }
    } catch (e) {
      if (e is ApiException) {
        throw AuthException('Registration failed: ${e.message}');
      }
      throw AuthException('Network error: ${e.toString()}');
    }
  }

  // Join a business with business code
  Future<bool> joinBusiness(String businessCode) async {
    try {
      if (_currentToken == null) {
        throw AuthException('User not logged in');
      }

      final response = await _apiService.post(
        '${ApiConfig.baseUrl}/api/users/join-business',
        body: {
          'businessCode': businessCode.toUpperCase(),
        },
        headers: getAuthHeaders(),
      );

      if (response['success'] == true) {
        await _saveBusinessCode(businessCode.toUpperCase());
        
        // Refresh user data to include new membership
        await _refreshUserData();
        return true;
      } else {
        throw AuthException(response['message'] ?? 'Failed to join business');
      }
    } catch (e) {
      if (e is ApiException) {
        throw AuthException('Failed to join business: ${e.message}');
      }
      throw AuthException('Network error: ${e.toString()}');
    }
  }

  // Refresh user data from server
  Future<void> _refreshUserData() async {
    try {
      final response = await _apiService.get(
        '${ApiConfig.baseUrl}/api/users/profile',
        headers: getAuthHeaders(),
      );

      if (response['success'] == true) {
        final userData = response['data']['user'];
        await _saveUserData(userData);
      }
    } catch (e) {
      // Handle silently for now
    }
  }

  // Verify OTP flow (simplified - just validates OTP, doesn't create user)
  Future<bool> verifyOtp(String phoneNumber, String otp) async {
    try {
      // In a real implementation, this would validate the OTP against what was sent
      // For now, we'll just simulate successful OTP verification
      await Future.delayed(const Duration(seconds: 1));
      
      // OTP verified successfully, but user creation happens in UserInfoPage
      return true;
    } catch (e) {
      throw AuthException('Failed to verify OTP: ${e.toString()}');
    }
  }

  // Validate business code with backend
  Future<Map<String, dynamic>> validateBusinessCode(String businessCode) async {
    try {
      print('DEBUG Auth: Validating business code: $businessCode');
      final response = await _apiService.get(
        '${ApiConfig.getBusiness}/$businessCode',
      );
      
      print('DEBUG Auth: Validation response: ${response['success']}');
      if (response['success'] == true) {
        print('DEBUG Auth: Saving business code: $businessCode');
        await _saveBusinessCode(businessCode);
        print('DEBUG Auth: Business code saved. Current: $_currentBusinessCode');
        return response;
      } else {
        throw AuthException('Invalid business code');
      }
    } catch (e) {
      print('DEBUG Auth: Validation error: $e');
      if (e is ApiException) {
        if (e.statusCode == 404) {
          throw AuthException('Business code not found');
        } else {
          throw AuthException('Failed to validate business code: ${e.message}');
        }
      }
      throw AuthException('Network error: ${e.toString()}');
    }
  }

  // Get business information without saving (for validation only)
  Future<Map<String, dynamic>?> getBusinessInfo([String? businessCode]) async {
    final codeToUse = businessCode ?? _currentBusinessCode;
    if (codeToUse == null) return null;
    
    try {
      final response = await _apiService.get(
        '${ApiConfig.getBusiness}/$codeToUse',
      );
      return response;
    } catch (e) {
      throw AuthException('Failed to get business info: ${e.toString()}');
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      await _clearStoredData();
      // Double-check that everything is cleared
      final prefs = await SharedPreferences.getInstance();
      await prefs.reload(); // Force reload from disk
      
      // Verify everything is cleared
      if (kDebugMode) {
        print('DEBUG: After logout - token: ${prefs.getString(_tokenKey)}');
        print('DEBUG: After logout - user: ${prefs.getString(_userDataKey)}');
        print('DEBUG: After logout - business: ${prefs.getString(_businessCodeKey)}');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error during logout: $e');
      }
      // Force clear everything anyway
      _currentToken = null;
      _currentUser = null;
      _currentBusinessCode = null;
    }
  }

  // Save authentication data
  Future<void> _saveAuthData(String token, Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userDataKey, json.encode(userData));
    
    _currentToken = token;
    _currentUser = userData;
    
    // Force reload to ensure data is persisted
    await prefs.reload();
  }

  // Save user data only
  Future<void> _saveUserData(Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userDataKey, json.encode(userData));
    _currentUser = userData;
  }

  // Save business code
  Future<void> _saveBusinessCode(String businessCode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_businessCodeKey, businessCode);
    _currentBusinessCode = businessCode;
    
    // Force reload to ensure data is persisted
    await prefs.reload();
  }

  // Load stored authentication data
  Future<void> _loadStoredData() async {
    final prefs = await SharedPreferences.getInstance();
    
    _currentToken = prefs.getString(_tokenKey);
    _currentBusinessCode = prefs.getString(_businessCodeKey);
    _hasUsedApp = prefs.getBool(_hasUsedAppKey) ?? false;
    
    if (kDebugMode) {
      print('DEBUG: Loading stored data...');
      print('DEBUG: Token exists: ${_currentToken != null}');
      print('DEBUG: Business code: $_currentBusinessCode');
      print('DEBUG: Has used app: $_hasUsedApp');
    }
    
    final userDataString = prefs.getString(_userDataKey);
    if (userDataString != null) {
      try {
        _currentUser = json.decode(userDataString) as Map<String, dynamic>;
        if (kDebugMode) {
          print('DEBUG: User data loaded successfully');
        }
      } catch (e) {
        // If user data is corrupted, clear it
        _currentUser = null;
        await prefs.remove(_userDataKey);
        if (kDebugMode) {
          print('DEBUG: User data corrupted, cleared');
        }
      }
    }
  }

  // Clear all stored data
  Future<void> _clearStoredData() async {
    final prefs = await SharedPreferences.getInstance();
    
    // Clear in-memory data first
    _currentToken = null;
    _currentUser = null;
    _currentBusinessCode = null;
    
    // Clear stored data
    await prefs.remove(_tokenKey);
    await prefs.remove(_userDataKey);
    await prefs.remove(_businessCodeKey);
    // Don't remove _hasUsedAppKey - we want to remember user has used the app
    
    // Force reload and verify
    await prefs.reload();
    
    if (kDebugMode) {
      print('DEBUG: Cleared data - token exists: ${prefs.containsKey(_tokenKey)}');
      print('DEBUG: Cleared data - user exists: ${prefs.containsKey(_userDataKey)}');
      print('DEBUG: Cleared data - business exists: ${prefs.containsKey(_businessCodeKey)}');
    }
  }
  
  // Mark that user has used the app (called when they first enter a business code)
  Future<void> markAppAsUsed() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_hasUsedAppKey, true);
    _hasUsedApp = true;
  }

  // Set business code (for switching between businesses)
  Future<void> setBusinessCode(String businessCode) async {
    await _saveBusinessCode(businessCode);
  }

  // Check if token is valid (basic check)
  bool isTokenValid() {
    if (_currentToken == null) return false;
    
    // In a real app, you'd check token expiration
    // For now, we'll assume it's valid if it exists
    return true;
  }

  // Get authorization headers
  Map<String, String> getAuthHeaders() {
    if (_currentToken == null) {
      throw AuthException('No authentication token available');
    }
    return ApiConfig.getAuthHeaders(_currentToken!);
  }

  // Get user profile
  Future<Map<String, dynamic>?> getUserProfile() async {
    try {
      final response = await _apiService.get(
        '${ApiConfig.baseUrl}/api/users/profile',
        headers: getAuthHeaders(),
      );
      
      if (response['success'] == true) {
        return response;
      } else {
        throw AuthException('Failed to get user profile: ${response['message']}');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error getting user profile: $e');
      }
      return null;
    }
  }

  // Get user business memberships
  Future<Map<String, dynamic>?> getUserBusinessMemberships() async {
    try {
      final response = await _apiService.get(
        '${ApiConfig.baseUrl}/api/users/business-memberships',
        headers: getAuthHeaders(),
      );
      
      if (response['success'] == true) {
        return response;
      } else {
        throw AuthException('Failed to get business memberships: ${response['message']}');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error getting business memberships: $e');
      }
      
      // Check if it's an authentication error
      if (e is ApiException && e.statusCode == 401) {
        // Token is invalid/expired, clear auth data
        await logout();
        throw AuthException('Authentication expired. Please log in again.');
      }
      
      return null;
    }
  }
}

class AuthException implements Exception {
  final String message;
  
  AuthException(this.message);
  
  @override
  String toString() => 'AuthException: $message';
}