import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // GET request
  Future<Map<String, dynamic>> get(
    String endpoint, {
    Map<String, String>? headers,
    Map<String, String>? queryParams,
  }) async {
    try {
      Uri uri = Uri.parse(endpoint);
      if (queryParams != null) {
        uri = uri.replace(queryParameters: queryParams);
      }

      final response = await http.get(
        uri,
        headers: headers ?? ApiConfig.defaultHeaders,
      ).timeout(ApiConfig.connectionTimeout);

      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // POST request
  Future<Map<String, dynamic>> post(
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await http.post(
        Uri.parse(endpoint),
        headers: headers ?? ApiConfig.defaultHeaders,
        body: body != null ? json.encode(body) : null,
      ).timeout(ApiConfig.connectionTimeout);

      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // PUT request
  Future<Map<String, dynamic>> put(
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await http.put(
        Uri.parse(endpoint),
        headers: headers ?? ApiConfig.defaultHeaders,
        body: body != null ? json.encode(body) : null,
      ).timeout(ApiConfig.connectionTimeout);

      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // DELETE request
  Future<Map<String, dynamic>> delete(
    String endpoint, {
    Map<String, String>? headers,
  }) async {
    try {
      final response = await http.delete(
        Uri.parse(endpoint),
        headers: headers ?? ApiConfig.defaultHeaders,
      ).timeout(ApiConfig.connectionTimeout);

      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Handle HTTP response
  Map<String, dynamic> _handleResponse(http.Response response) {
    final data = json.decode(response.body) as Map<String, dynamic>;
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    } else {
      throw ApiException(
        statusCode: response.statusCode,
        message: data['message'] ?? data['error'] ?? 'Unknown error occurred',
        data: data,
      );
    }
  }

  // Handle errors
  ApiException _handleError(dynamic error) {
    if (error is SocketException) {
      return ApiException(
        statusCode: 0,
        message: 'No internet connection. Please check your network.',
      );
    } else if (error is HttpException) {
      return ApiException(
        statusCode: 0,
        message: 'HTTP error occurred',
      );
    } else if (error is FormatException) {
      return ApiException(
        statusCode: 0,
        message: 'Invalid response format',
      );
    } else if (error is ApiException) {
      return error;
    } else {
      return ApiException(
        statusCode: 0,
        message: 'An unexpected error occurred: ${error.toString()}',
      );
    }
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String message;
  final Map<String, dynamic>? data;

  ApiException({
    required this.statusCode,
    required this.message,
    this.data,
  });

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}