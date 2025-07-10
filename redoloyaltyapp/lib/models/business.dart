class Business {
  final String code;
  final String name;
  final String description;
  final String logoUrl;
  final String primaryColor;
  final String accentColor;
  final BusinessTheme theme;
  final List<String> categories;
  final DateTime createdAt;
  final bool isActive;

  Business({
    required this.code,
    required this.name,
    required this.description,
    required this.logoUrl,
    required this.primaryColor,
    required this.accentColor,
    required this.theme,
    required this.categories,
    required this.createdAt,
    this.isActive = true,
  });

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      logoUrl: json['logoUrl'] ?? '',
      primaryColor: json['primaryColor'] ?? '#9CAF88',
      accentColor: json['accentColor'] ?? '#F5F7F0',
      theme: BusinessTheme.fromJson(json['theme'] ?? {}),
      categories: List<String>.from(json['categories'] ?? []),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'name': name,
      'description': description,
      'logoUrl': logoUrl,
      'primaryColor': primaryColor,
      'accentColor': accentColor,
      'theme': theme.toJson(),
      'categories': categories,
      'createdAt': createdAt.toIso8601String(),
      'isActive': isActive,
    };
  }

  Business copyWith({
    String? code,
    String? name,
    String? description,
    String? logoUrl,
    String? primaryColor,
    String? accentColor,
    BusinessTheme? theme,
    List<String>? categories,
    DateTime? createdAt,
    bool? isActive,
  }) {
    return Business(
      code: code ?? this.code,
      name: name ?? this.name,
      description: description ?? this.description,
      logoUrl: logoUrl ?? this.logoUrl,
      primaryColor: primaryColor ?? this.primaryColor,
      accentColor: accentColor ?? this.accentColor,
      theme: theme ?? this.theme,
      categories: categories ?? this.categories,
      createdAt: createdAt ?? this.createdAt,
      isActive: isActive ?? this.isActive,
    );
  }
}

class BusinessTheme {
  final String appBarColor;
  final String backgroundColor;
  final String cardColor;
  final String textColor;
  final String buttonColor;
  final String iconColor;
  final bool isDarkMode;

  BusinessTheme({
    required this.appBarColor,
    required this.backgroundColor,
    required this.cardColor,
    required this.textColor,
    required this.buttonColor,
    required this.iconColor,
    this.isDarkMode = false,
  });

  factory BusinessTheme.fromJson(Map<String, dynamic> json) {
    return BusinessTheme(
      appBarColor: json['appBarColor'] ?? '#9CAF88',
      backgroundColor: json['backgroundColor'] ?? '#F5F7F0',
      cardColor: json['cardColor'] ?? '#FFFFFF',
      textColor: json['textColor'] ?? '#2C3E50',
      buttonColor: json['buttonColor'] ?? '#9CAF88',
      iconColor: json['iconColor'] ?? '#9CAF88',
      isDarkMode: json['isDarkMode'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'appBarColor': appBarColor,
      'backgroundColor': backgroundColor,
      'cardColor': cardColor,
      'textColor': textColor,
      'buttonColor': buttonColor,
      'iconColor': iconColor,
      'isDarkMode': isDarkMode,
    };
  }

  BusinessTheme copyWith({
    String? appBarColor,
    String? backgroundColor,
    String? cardColor,
    String? textColor,
    String? buttonColor,
    String? iconColor,
    bool? isDarkMode,
  }) {
    return BusinessTheme(
      appBarColor: appBarColor ?? this.appBarColor,
      backgroundColor: backgroundColor ?? this.backgroundColor,
      cardColor: cardColor ?? this.cardColor,
      textColor: textColor ?? this.textColor,
      buttonColor: buttonColor ?? this.buttonColor,
      iconColor: iconColor ?? this.iconColor,
      isDarkMode: isDarkMode ?? this.isDarkMode,
    );
  }
}

class UserBusinessData {
  final String businessCode;
  final String userId;
  final String membershipLevel;
  final int pointsBalance;
  final int totalPointsEarned;
  final int totalPointsSpent;
  final DateTime joinedAt;
  final DateTime lastActivity;
  final List<String> availableCoupons;
  final List<String> usedCoupons;

  UserBusinessData({
    required this.businessCode,
    required this.userId,
    required this.membershipLevel,
    required this.pointsBalance,
    required this.totalPointsEarned,
    required this.totalPointsSpent,
    required this.joinedAt,
    required this.lastActivity,
    required this.availableCoupons,
    required this.usedCoupons,
  });

  factory UserBusinessData.fromJson(Map<String, dynamic> json) {
    return UserBusinessData(
      businessCode: json['businessCode'] ?? '',
      userId: json['userId'] ?? '',
      membershipLevel: json['membershipLevel'] ?? 'Bronze',
      pointsBalance: json['pointsBalance'] ?? 0,
      totalPointsEarned: json['totalPointsEarned'] ?? 0,
      totalPointsSpent: json['totalPointsSpent'] ?? 0,
      joinedAt: DateTime.parse(json['joinedAt'] ?? DateTime.now().toIso8601String()),
      lastActivity: DateTime.parse(json['lastActivity'] ?? DateTime.now().toIso8601String()),
      availableCoupons: List<String>.from(json['availableCoupons'] ?? []),
      usedCoupons: List<String>.from(json['usedCoupons'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'businessCode': businessCode,
      'userId': userId,
      'membershipLevel': membershipLevel,
      'pointsBalance': pointsBalance,
      'totalPointsEarned': totalPointsEarned,
      'totalPointsSpent': totalPointsSpent,
      'joinedAt': joinedAt.toIso8601String(),
      'lastActivity': lastActivity.toIso8601String(),
      'availableCoupons': availableCoupons,
      'usedCoupons': usedCoupons,
    };
  }

  UserBusinessData copyWith({
    String? businessCode,
    String? userId,
    String? membershipLevel,
    int? pointsBalance,
    int? totalPointsEarned,
    int? totalPointsSpent,
    DateTime? joinedAt,
    DateTime? lastActivity,
    List<String>? availableCoupons,
    List<String>? usedCoupons,
  }) {
    return UserBusinessData(
      businessCode: businessCode ?? this.businessCode,
      userId: userId ?? this.userId,
      membershipLevel: membershipLevel ?? this.membershipLevel,
      pointsBalance: pointsBalance ?? this.pointsBalance,
      totalPointsEarned: totalPointsEarned ?? this.totalPointsEarned,
      totalPointsSpent: totalPointsSpent ?? this.totalPointsSpent,
      joinedAt: joinedAt ?? this.joinedAt,
      lastActivity: lastActivity ?? this.lastActivity,
      availableCoupons: availableCoupons ?? this.availableCoupons,
      usedCoupons: usedCoupons ?? this.usedCoupons,
    );
  }
}