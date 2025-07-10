class UserModel {
  final String id;
  final String phoneNumber;
  final String firstName;
  final String lastName;
  final String memberSince;
  final int points;
  final String rankingLevel;
  final int? rankingId;
  final String? profileImageUrl;

  UserModel({
    required this.id,
    required this.phoneNumber,
    required this.firstName,
    required this.lastName,
    required this.memberSince,
    required this.points,
    required this.rankingLevel,
    this.rankingId,
    this.profileImageUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      phoneNumber: json['phoneNumber']?.toString() ?? '',
      firstName: json['firstName']?.toString() ?? '',
      lastName: json['lastName']?.toString() ?? '',
      memberSince: json['memberSince']?.toString() ?? '',
      points: json['points']?.toInt() ?? 0,
      rankingLevel: json['rankingLevel']?.toString() ?? '',
      rankingId: json['rankingId']?.toInt(),
      profileImageUrl: json['profileImageUrl']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'phoneNumber': phoneNumber,
      'firstName': firstName,
      'lastName': lastName,
      'memberSince': memberSince,
      'points': points,
      'rankingLevel': rankingLevel,
      'rankingId': rankingId,
      'profileImageUrl': profileImageUrl,
    };
  }

  String get fullName => '$firstName $lastName';
  
  String get displayName => firstName;
}