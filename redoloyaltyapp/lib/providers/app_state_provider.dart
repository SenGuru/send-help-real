import 'package:flutter/foundation.dart';
import '../models/business_response.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AppStateProvider with ChangeNotifier {
  final AuthService _authService = AuthService();

  // Authentication state
  bool _isAuthenticated = false;
  UserModel? _currentUser;
  
  // Business data
  BusinessResponse? _businessData;
  String? _currentBusinessCode;
  
  // Loading states
  bool _isLoading = false;
  bool _isLoadingBusiness = false;
  
  // Error state
  String? _errorMessage;

  // Getters
  bool get isAuthenticated => _isAuthenticated;
  UserModel? get currentUser => _currentUser;
  BusinessResponse? get businessData => _businessData;
  String? get currentBusinessCode => _currentBusinessCode;
  bool get isLoading => _isLoading;
  bool get isLoadingBusiness => _isLoadingBusiness;
  String? get errorMessage => _errorMessage;

  // Business getters
  BusinessData? get business => _businessData?.business;
  ThemeColors? get theme => _businessData?.theme;
  List<Ranking> get rankings => _businessData?.rankings ?? [];
  List<Coupon> get coupons => _businessData?.coupons ?? [];

  // Initialize app state
  Future<void> init() async {
    setLoading(true);
    
    try {
      await _authService.init();
      
      // Check if user is authenticated
      if (_authService.isAuthenticated && _authService.isTokenValid()) {
        _isAuthenticated = true;
        
        // Load user data from auth service
        if (_authService.currentUser != null) {
          _currentUser = UserModel.fromJson(_authService.currentUser!);
        }
        
        // Load business data if we have a business code
        if (_authService.currentBusinessCode != null) {
          _currentBusinessCode = _authService.currentBusinessCode;
          await loadBusinessData();
        }
      }
    } catch (e) {
      _errorMessage = 'Failed to initialize app: ${e.toString()}';
    } finally {
      setLoading(false);
    }
  }

  // Force refresh all data from auth service
  Future<void> refreshFromAuthService() async {
    setLoading(true);
    clearError();
    
    try {
      // Refresh auth service data
      await _authService.init();
      
      // Update authentication state
      _isAuthenticated = _authService.isAuthenticated && _authService.isTokenValid();
      
      // Load user data from auth service
      if (_authService.currentUser != null) {
        _currentUser = UserModel.fromJson(_authService.currentUser!);
      }
      
      // Load business data if we have a business code
      if (_authService.currentBusinessCode != null) {
        _currentBusinessCode = _authService.currentBusinessCode;
        await loadBusinessData();
      }
      
      notifyListeners();
    } catch (e) {
      setError('Failed to refresh data: ${e.toString()}');
    } finally {
      setLoading(false);
    }
  }

  // Set loading state
  void setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Set business loading state
  void setBusinessLoading(bool loading) {
    _isLoadingBusiness = loading;
    notifyListeners();
  }

  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Set error message
  void setError(String message) {
    _errorMessage = message;
    notifyListeners();
  }

  // Verify OTP (doesn't create user yet)
  Future<bool> verifyOtp(String phoneNumber, String otp) async {
    setLoading(true);
    clearError();
    
    try {
      final success = await _authService.verifyOtp(phoneNumber, otp);
      
      if (success) {
        // OTP verified, but user creation happens in UserInfoPage
        notifyListeners();
        return true;
      }
      
      return false;
    } catch (e) {
      setError(e.toString());
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Login user (for existing users)
  Future<bool> login(String phoneNumber, String otp) async {
    return await verifyOtp(phoneNumber, otp);
  }

  // Send OTP
  Future<bool> sendOtp(String phoneNumber) async {
    setLoading(true);
    clearError();
    
    try {
      return await _authService.sendOtp(phoneNumber);
    } catch (e) {
      setError(e.toString());
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Validate and set business code
  Future<bool> setBusinessCode(String businessCode) async {
    setBusinessLoading(true);
    clearError();
    
    try {
      final response = await _authService.validateBusinessCode(businessCode);
      
      if (response['success'] == true) {
        _currentBusinessCode = businessCode;
        _businessData = BusinessResponse.fromJson(response);
        notifyListeners();
        return true;
      }
      
      return false;
    } catch (e) {
      setError(e.toString());
      return false;
    } finally {
      setBusinessLoading(false);
    }
  }

  // Load business data
  Future<void> loadBusinessData() async {
    if (_currentBusinessCode == null) return;
    
    setBusinessLoading(true);
    clearError();
    
    try {
      final response = await _authService.getBusinessInfo();
      
      if (response != null && response['success'] == true) {
        _businessData = BusinessResponse.fromJson(response);
        notifyListeners();
      }
    } catch (e) {
      setError('Failed to load business data: ${e.toString()}');
    } finally {
      setBusinessLoading(false);
    }
  }

  // Refresh business data
  Future<void> refreshBusinessData() async {
    await loadBusinessData();
  }

  // Switch business
  Future<bool> switchBusiness(String newBusinessCode) async {
    return await setBusinessCode(newBusinessCode);
  }

  // Logout
  Future<void> logout() async {
    setLoading(true);
    
    try {
      await _authService.logout();
      
      _isAuthenticated = false;
      _currentUser = null;
      _businessData = null;
      _currentBusinessCode = null;
      _errorMessage = null;
      
      notifyListeners();
    } finally {
      setLoading(false);
    }
  }

  // Get current user's ranking
  Ranking? getCurrentUserRanking() {
    if (_currentUser == null || rankings.isEmpty) return null;
    
    // Find ranking based on user's ranking level or points
    return rankings.firstWhere(
      (ranking) => ranking.title == _currentUser!.rankingLevel,
      orElse: () => rankings.first,
    );
  }

  // Get next ranking
  Ranking? getNextRanking() {
    if (_currentUser == null || rankings.isEmpty) return null;
    
    final currentRanking = getCurrentUserRanking();
    if (currentRanking == null) return null;
    
    // Find next ranking with higher level
    final nextRankings = rankings
        .where((ranking) => ranking.level > currentRanking.level)
        .toList();
    
    if (nextRankings.isNotEmpty) {
      nextRankings.sort((a, b) => a.level.compareTo(b.level));
      return nextRankings.first;
    }
    
    return null;
  }

  // Calculate points needed for next ranking
  int getPointsToNextRanking() {
    if (_currentUser == null) return 0;
    
    final nextRanking = getNextRanking();
    if (nextRanking == null) return 0;
    
    return nextRanking.pointsRequired - _currentUser!.points;
  }
}