import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../colors.dart';
import '../providers/app_state_provider.dart';
import '../utils/theme_helper.dart';
import '../models/business_response.dart';

class PointTiersPage extends StatefulWidget {
  const PointTiersPage({super.key});

  @override
  State<PointTiersPage> createState() => _PointTiersPageState();
}

class _PointTiersPageState extends State<PointTiersPage> {
  List<PointTier> pointTiers = [];
  int userTierPoints = 0; // This would come from user data
  int? currentTierLevel;

  @override
  void initState() {
    super.initState();
    _loadPointTiers();
  }

  void _loadPointTiers() {
    final appState = Provider.of<AppStateProvider>(context, listen: false);
    if (appState.businessData != null) {
      setState(() {
        pointTiers = appState.businessData!.pointTiers;
        // Mock user points - in real app this would come from user profile
        userTierPoints = 750; // Example: user has 750 tier points
        currentTierLevel = _getCurrentTierLevel();
      });
    }
  }

  int? _getCurrentTierLevel() {
    PointTier? currentTier;
    for (final tier in pointTiers) {
      if (userTierPoints >= tier.pointsRequired) {
        currentTier = tier;
      } else {
        break;
      }
    }
    return currentTier?.tierLevel;
  }

  PointTier? _getNextTier() {
    for (final tier in pointTiers) {
      if (userTierPoints < tier.pointsRequired) {
        return tier;
      }
    }
    return null; // User is at max tier
  }

  double _getProgressToNextTier() {
    final nextTier = _getNextTier();
    if (nextTier == null) return 1.0; // Max tier reached

    final currentTier = pointTiers
        .where((t) => t.tierLevel == currentTierLevel)
        .firstOrNull;
    
    final currentThreshold = currentTier?.pointsRequired ?? 0;
    final nextThreshold = nextTier.pointsRequired;
    final tierRange = nextThreshold - currentThreshold;
    final pointsInCurrentTier = userTierPoints - currentThreshold;
    
    return tierRange > 0 ? (pointsInCurrentTier / tierRange).clamp(0.0, 1.0) : 0.0;
  }

  int _getPointsNeededForNextTier() {
    final nextTier = _getNextTier();
    if (nextTier == null) return 0;
    return nextTier.pointsRequired - userTierPoints;
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AppStateProvider>(
      builder: (context, appState, child) {
        return Scaffold(
          backgroundColor: ThemeHelper.getBackgroundColor(appState.theme),
          body: CustomScrollView(
            slivers: [
              // App Bar
              SliverAppBar(
                expandedHeight: 200.h,
                floating: false,
                pinned: true,
                backgroundColor: ThemeHelper.getPrimaryColor(appState.theme),
                flexibleSpace: FlexibleSpaceBar(
                  title: Text(
                    'Point Tiers',
                    style: TextStyle(
                      color: ThemeHelper.getButtonTextColor(appState.theme),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          ThemeHelper.getPrimaryColor(appState.theme),
                          ThemeHelper.getSecondaryColor(appState.theme)
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                  ),
                ),
              ),

              // Current Progress Section
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(24.w),
                  child: Container(
                    padding: EdgeInsets.all(20.r),
                    decoration: BoxDecoration(
                      color: ThemeHelper.getCardBackgroundColor(appState.theme),
                      borderRadius: BorderRadius.circular(16.r),
                      boxShadow: [
                        BoxShadow(
                          color: ThemeHelper.getTextColor(appState.theme).withOpacity(0.1),
                          blurRadius: 10.r,
                          offset: Offset(0, 3.h),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Your Progress',
                          style: TextStyle(
                            fontSize: 20.sp,
                            fontWeight: FontWeight.bold,
                            color: ThemeHelper.getTextColor(appState.theme),
                          ),
                        ),
                        SizedBox(height: 16.h),
                        
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Current Points',
                              style: TextStyle(
                                fontSize: 14.sp,
                                color: ThemeHelper.getSubtitleTextColor(appState.theme),
                              ),
                            ),
                            Text(
                              userTierPoints.toString(),
                              style: TextStyle(
                                fontSize: 18.sp,
                                fontWeight: FontWeight.bold,
                                color: ThemeHelper.getPrimaryColor(appState.theme),
                              ),
                            ),
                          ],
                        ),
                        
                        SizedBox(height: 12.h),
                        
                        if (_getNextTier() != null) ...[
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Next Tier',
                                style: TextStyle(
                                  fontSize: 14.sp,
                                  color: ThemeHelper.getSubtitleTextColor(appState.theme),
                                ),
                              ),
                              Text(
                                _getNextTier()!.name,
                                style: TextStyle(
                                  fontSize: 14.sp,
                                  fontWeight: FontWeight.w600,
                                  color: ThemeHelper.getTextColor(appState.theme),
                                ),
                              ),
                            ],
                          ),
                          
                          SizedBox(height: 8.h),
                          
                          LinearProgressIndicator(
                            value: _getProgressToNextTier(),
                            backgroundColor: ThemeHelper.getSubtitleTextColor(appState.theme).withOpacity(0.3),
                            valueColor: AlwaysStoppedAnimation<Color>(
                              ThemeHelper.getPrimaryColor(appState.theme),
                            ),
                          ),
                          
                          SizedBox(height: 8.h),
                          
                          Text(
                            '${_getPointsNeededForNextTier()} points needed for next tier',
                            style: TextStyle(
                              fontSize: 12.sp,
                              color: ThemeHelper.getSubtitleTextColor(appState.theme),
                            ),
                          ),
                        ] else ...[
                          Container(
                            padding: EdgeInsets.symmetric(vertical: 8.h, horizontal: 12.w),
                            decoration: BoxDecoration(
                              color: ThemeHelper.getSuccessColor(appState.theme).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8.r),
                            ),
                            child: Text(
                              '🎉 You\'ve reached the highest tier!',
                              style: TextStyle(
                                fontSize: 14.sp,
                                color: ThemeHelper.getSuccessColor(appState.theme),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),

              // Tier List
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final tier = pointTiers[index];
                    final isCurrentTier = tier.tierLevel == currentTierLevel;
                    final isAchieved = userTierPoints >= tier.pointsRequired;
                    final tierColor = _hexToColor(tier.color);
                    
                    return Padding(
                      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 8.h),
                      child: Container(
                        decoration: BoxDecoration(
                          color: ThemeHelper.getCardBackgroundColor(appState.theme),
                          borderRadius: BorderRadius.circular(16.r),
                          border: isCurrentTier 
                            ? Border.all(color: tierColor, width: 2.w)
                            : null,
                          boxShadow: [
                            BoxShadow(
                              color: ThemeHelper.getTextColor(appState.theme).withOpacity(0.05),
                              blurRadius: 8.r,
                              offset: Offset(0, 2.h),
                            ),
                          ],
                        ),
                        child: Padding(
                          padding: EdgeInsets.all(20.r),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 50.r,
                                    height: 50.r,
                                    decoration: BoxDecoration(
                                      color: isAchieved 
                                        ? tierColor 
                                        : tierColor.withOpacity(0.3),
                                      borderRadius: BorderRadius.circular(12.r),
                                    ),
                                    child: Center(
                                      child: isAchieved
                                        ? Icon(
                                            Icons.check,
                                            color: Colors.white,
                                            size: 24.r,
                                          )
                                        : Icon(
                                            Icons.lock,
                                            color: tierColor,
                                            size: 24.r,
                                          ),
                                    ),
                                  ),
                                  SizedBox(width: 16.w),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Text(
                                              tier.name,
                                              style: TextStyle(
                                                fontSize: 18.sp,
                                                fontWeight: FontWeight.bold,
                                                color: ThemeHelper.getTextColor(appState.theme),
                                              ),
                                            ),
                                            if (isCurrentTier) ...[
                                              SizedBox(width: 8.w),
                                              Container(
                                                padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 2.h),
                                                decoration: BoxDecoration(
                                                  color: tierColor,
                                                  borderRadius: BorderRadius.circular(12.r),
                                                ),
                                                child: Text(
                                                  'Current',
                                                  style: TextStyle(
                                                    fontSize: 10.sp,
                                                    color: Colors.white,
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ],
                                        ),
                                        Text(
                                          '${tier.pointsRequired} points required',
                                          style: TextStyle(
                                            fontSize: 14.sp,
                                            color: ThemeHelper.getSubtitleTextColor(appState.theme),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              
                              if (tier.description?.isNotEmpty == true) ...[
                                SizedBox(height: 12.h),
                                Text(
                                  tier.description!,
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    color: ThemeHelper.getTextColor(appState.theme),
                                    height: 1.4,
                                  ),
                                ),
                              ],
                              
                              if (tier.rewards.isNotEmpty) ...[
                                SizedBox(height: 16.h),
                                Text(
                                  'Rewards:',
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    fontWeight: FontWeight.w600,
                                    color: ThemeHelper.getTextColor(appState.theme),
                                  ),
                                ),
                                SizedBox(height: 8.h),
                                ...tier.rewards.map((reward) => Padding(
                                  padding: EdgeInsets.only(bottom: 4.h),
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.star,
                                        size: 16.r,
                                        color: tierColor,
                                      ),
                                      SizedBox(width: 8.w),
                                      Expanded(
                                        child: Text(
                                          reward.displayText,
                                          style: TextStyle(
                                            fontSize: 13.sp,
                                            color: ThemeHelper.getTextColor(appState.theme),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                )),
                              ],
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                  childCount: pointTiers.length,
                ),
              ),
              
              SliverToBoxAdapter(
                child: SizedBox(height: 40.h),
              ),
            ],
          ),
        );
      },
    );
  }

  Color _hexToColor(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }
}