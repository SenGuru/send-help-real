class BusinessResponse {
  final bool success;
  final BusinessData business;
  final ThemeColors? theme;
  final List<Ranking> rankings;
  final List<PointTier> pointTiers;
  final List<Coupon> coupons;

  BusinessResponse({
    required this.success,
    required this.business,
    this.theme,
    required this.rankings,
    required this.pointTiers,
    required this.coupons,
  });

  factory BusinessResponse.fromJson(Map<String, dynamic> json) {
    return BusinessResponse(
      success: json['success'] ?? false,
      business: BusinessData.fromJson(json['business'] ?? {}),
      theme: json['theme'] != null ? ThemeColors.fromJson(json['theme']) : null,
      rankings: (json['rankings'] as List<dynamic>?)
          ?.map((ranking) => Ranking.fromJson(ranking))
          .toList() ?? [],
      pointTiers: (json['pointTiers'] as List<dynamic>?)
          ?.map((tier) => PointTier.fromJson(tier))
          .toList() ?? [],
      coupons: (json['coupons'] as List<dynamic>?)
          ?.map((coupon) => Coupon.fromJson(coupon))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'business': business.toJson(),
      'theme': theme?.toJson(),
      'rankings': rankings.map((ranking) => ranking.toJson()).toList(),
      'pointTiers': pointTiers.map((tier) => tier.toJson()).toList(),
      'coupons': coupons.map((coupon) => coupon.toJson()).toList(),
    };
  }
}

class BusinessData {
  final int id;
  final String name;
  final String? description;
  final String? logoUrl;
  final String? contactPhone;
  final String? address;
  final Map<String, dynamic>? operatingHours;

  BusinessData({
    required this.id,
    required this.name,
    this.description,
    this.logoUrl,
    this.contactPhone,
    this.address,
    this.operatingHours,
  });

  factory BusinessData.fromJson(Map<String, dynamic> json) {
    return BusinessData(
      id: json['id']?.toInt() ?? 0,
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      logoUrl: json['logoUrl']?.toString(),
      contactPhone: json['contactPhone']?.toString(),
      address: json['address']?.toString(),
      operatingHours: json['operatingHours'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'logoUrl': logoUrl,
      'contactPhone': contactPhone,
      'address': address,
      'operatingHours': operatingHours,
    };
  }
}

class ThemeColors {
  final String? primary;
  final String? secondary;
  final String? accent;
  final String? background;
  final String? text;
  final String? lightGray;
  final String? darkGray;
  final String? success;
  final String? warning;
  final String? error;
  final String? info;

  ThemeColors({
    this.primary,
    this.secondary,
    this.accent,
    this.background,
    this.text,
    this.lightGray,
    this.darkGray,
    this.success,
    this.warning,
    this.error,
    this.info,
  });

  factory ThemeColors.fromJson(Map<String, dynamic> json) {
    return ThemeColors(
      primary: json['primary']?.toString(),
      secondary: json['secondary']?.toString(),
      accent: json['accent']?.toString(),
      background: json['background']?.toString(),
      text: json['text']?.toString(),
      lightGray: json['lightGray']?.toString(),
      darkGray: json['darkGray']?.toString(),
      success: json['success']?.toString(),
      warning: json['warning']?.toString(),
      error: json['error']?.toString(),
      info: json['info']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'primary': primary,
      'secondary': secondary,
      'accent': accent,
      'background': background,
      'text': text,
      'lightGray': lightGray,
      'darkGray': darkGray,
      'success': success,
      'warning': warning,
      'error': error,
      'info': info,
    };
  }
}

class Ranking {
  final int id;
  final int level;
  final String title;
  final int pointsRequired;
  final String? color;
  final String? iconUrl;
  final Map<String, dynamic>? benefits;

  Ranking({
    required this.id,
    required this.level,
    required this.title,
    required this.pointsRequired,
    this.color,
    this.iconUrl,
    this.benefits,
  });

  factory Ranking.fromJson(Map<String, dynamic> json) {
    return Ranking(
      id: json['id']?.toInt() ?? 0,
      level: json['level']?.toInt() ?? 0,
      title: json['title']?.toString() ?? '',
      pointsRequired: json['pointsRequired']?.toInt() ?? 0,
      color: json['color']?.toString(),
      iconUrl: json['iconUrl']?.toString(),
      benefits: json['benefits'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'level': level,
      'title': title,
      'pointsRequired': pointsRequired,
      'color': color,
      'iconUrl': iconUrl,
      'benefits': benefits,
    };
  }
}

class Coupon {
  final int id;
  final String title;
  final String description;
  final String code;
  final String discountType;
  final double discountValue;
  final double? minimumPurchase;
  final String? expirationDate;
  final int? targetRankingLevel;

  Coupon({
    required this.id,
    required this.title,
    required this.description,
    required this.code,
    required this.discountType,
    required this.discountValue,
    this.minimumPurchase,
    this.expirationDate,
    this.targetRankingLevel,
  });

  factory Coupon.fromJson(Map<String, dynamic> json) {
    return Coupon(
      id: json['id']?.toInt() ?? 0,
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      code: json['code']?.toString() ?? '',
      discountType: json['discountType']?.toString() ?? 'percentage',
      discountValue: (json['discountValue'] ?? 0).toDouble(),
      minimumPurchase: json['minimumPurchase']?.toDouble(),
      expirationDate: json['expirationDate']?.toString(),
      targetRankingLevel: json['targetRankingLevel']?.toInt(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'code': code,
      'discountType': discountType,
      'discountValue': discountValue,
      'minimumPurchase': minimumPurchase,
      'expirationDate': expirationDate,
      'targetRankingLevel': targetRankingLevel,
    };
  }

  String get discountText {
    if (discountType == 'percentage') {
      return '${discountValue.toInt()}% OFF';
    } else {
      return '\$${discountValue.toStringAsFixed(2)} OFF';
    }
  }

  String get minimumPurchaseText {
    if (minimumPurchase != null && minimumPurchase! > 0) {
      return 'Minimum purchase \$${minimumPurchase!.toStringAsFixed(2)}';
    }
    return 'No minimum purchase';
  }
}

class PointTier {
  final int id;
  final int tierLevel;
  final String name;
  final int pointsRequired;
  final String? description;
  final List<TierReward> rewards;
  final String color;
  final String? iconUrl;

  PointTier({
    required this.id,
    required this.tierLevel,
    required this.name,
    required this.pointsRequired,
    this.description,
    required this.rewards,
    required this.color,
    this.iconUrl,
  });

  factory PointTier.fromJson(Map<String, dynamic> json) {
    return PointTier(
      id: json['id']?.toInt() ?? 0,
      tierLevel: json['tierLevel']?.toInt() ?? 1,
      name: json['name']?.toString() ?? '',
      pointsRequired: json['pointsRequired']?.toInt() ?? 0,
      description: json['description']?.toString(),
      rewards: (json['rewards'] as List<dynamic>?)
          ?.map((reward) => TierReward.fromJson(reward))
          .toList() ?? [],
      color: json['color']?.toString() ?? '#9CAF88',
      iconUrl: json['iconUrl']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tierLevel': tierLevel,
      'name': name,
      'pointsRequired': pointsRequired,
      'description': description,
      'rewards': rewards.map((reward) => reward.toJson()).toList(),
      'color': color,
      'iconUrl': iconUrl,
    };
  }

  String get formattedPoints {
    return pointsRequired.toString();
  }

  String get rewardSummary {
    if (rewards.isEmpty) return 'No rewards';
    return rewards.map((r) => r.displayText).join(', ');
  }
}

class TierReward {
  final String type;
  final String value;
  final String? description;

  TierReward({
    required this.type,
    required this.value,
    this.description,
  });

  factory TierReward.fromJson(Map<String, dynamic> json) {
    return TierReward(
      type: json['type']?.toString() ?? 'custom',
      value: json['value']?.toString() ?? '',
      description: json['description']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'value': value,
      'description': description,
    };
  }

  String get displayText {
    switch (type) {
      case 'discount':
        return '$value% discount';
      case 'freeItem':
        return 'Free $value';
      case 'pointMultiplier':
        return '${value}x points';
      case 'freeShipping':
        return 'Free shipping';
      case 'earlyAccess':
        return 'Early access';
      case 'birthday':
        return 'Birthday $value';
      case 'custom':
      default:
        return value;
    }
  }
}