class ApiConfig {
  // Change this to your backend server URL
  static const String baseUrl = 'http://localhost:3001';
  
  // API endpoints
  static const String healthCheck = '$baseUrl/health';
  static const String publicHealthCheck = '$baseUrl/api/public/health';
  static const String getBusiness = '$baseUrl/api/public/business';
  
  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Headers
  static Map<String, String> get defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  static Map<String, String> getAuthHeaders(String token) => {
    ...defaultHeaders,
    'Authorization': 'Bearer $token',
  };
}