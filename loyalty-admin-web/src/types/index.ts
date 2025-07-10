export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  operatingHours: any;
  category?: string;
  website?: string;
  established?: string;
  memberSince?: string;
  totalMembers?: number;
  features?: string[];
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  loyaltyBenefits?: string[];
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  lightGray?: string;
  darkGray?: string;
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  isActive: boolean;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ranking {
  id: string;
  level: number;
  title: string;
  pointsRequired: number;
  benefits: {
    discountPercentage?: number;
    specialOffers?: string[];
    prioritySupport?: boolean;
    freeShipping?: boolean;
  };
  color: string;
  iconUrl?: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumPurchase: number;
  expirationDate?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  targetRankingLevel?: number;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponAnalytics {
  totalUsage: number;
  usageLimit?: number;
  usagePercentage: number;
  remainingUses?: number;
  isExpired: boolean;
  isUsageLimitReached: boolean;
  daysUntilExpiration?: number;
  status: string;
  effectiveness: 'high' | 'medium' | 'low';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

export interface DashboardStats {
  totalUsers: number;
  activeCoupons: number;
  totalTransactions: number;
  revenueThisMonth: number;
}

export interface PointTierReward {
  type: 'discount' | 'freeItem' | 'pointMultiplier' | 'freeShipping' | 'earlyAccess' | 'birthday' | 'custom';
  value: string;
  description?: string;
}

export interface PointTier {
  id?: string;
  businessId: string;
  tierLevel: number;
  name: string;
  pointsRequired: number;
  description?: string;
  rewards: PointTierReward[];
  color: string;
  iconUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TierStats {
  tierId: string | null;
  tierName: string;
  userCount: number;
  percentage: number;
  avgPoints: number;
}

export interface UserPointTier {
  id: string;
  businessId: string;
  userId: string;
  currentTierId?: string;
  tierPoints: number;
  lifetimeTierPoints: number;
  lastTierUpdate?: string;
  tierHistory: any[];
}

export interface MenuItem {
  id?: string;
  businessId: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  pointsEarned: number;
  imageUrl?: string;
  isAvailable: boolean;
  isActive: boolean;
  sortOrder: number;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItemPurchase {
  id: string;
  businessId: string;
  userId: string;
  menuItemId: string;
  quantity: number;
  priceAtPurchase: number;
  pointsEarnedAtPurchase: number;
  totalAmount: number;
  totalPointsEarned: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  notes?: string;
  purchaseDate: string;
  menuItem?: MenuItem;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface MenuStats {
  totalRevenue: number;
  totalPurchases: number;
  totalPointsAwarded: number;
  averageOrderValue: number;
  popularItems: {
    menuItem: MenuItem;
    purchaseCount: number;
    totalQuantity: number;
    totalRevenue: number;
  }[];
}

// Points Management Types
export interface User {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  currentRankingId?: string;
  currentRanking?: Ranking;
  businessId: string;
  isActive: boolean;
  joinDate: string;
  lastActivity?: string;
  preferences?: any;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  businessId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'manual';
  points: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  balanceBefore: number;
  balanceAfter: number;
  multiplier?: number;
  expiresAt?: string;
  isReversed: boolean;
  createdAt: string;
  updatedAt: string;
  transaction?: any;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface BulkPointsOperation {
  userIds: string[];
  points: number;
  description: string;
  type: 'award' | 'deduct';
}

export interface PointsAwardRequest {
  userId?: string;
  userIds?: string[];
  points: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  expiresInDays?: number;
}

export interface ItemPointsUpdate {
  menuItemId: string;
  pointsEarned: number;
}

export interface PointsDeal {
  id?: string;
  businessId: string;
  title: string;
  description: string;
  points: number;
  dealType: 'bonus' | 'multiplier' | 'fixed';
  dealValue: number;
  targetItems?: string[];
  targetCategories?: string[];
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usedCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PointsStats {
  totalPointsAwarded: number;
  totalPointsRedeemed: number;
  activeUsers: number;
  averagePointBalance: number;
  topEarners: {
    user: User;
    points: number;
  }[];
  recentTransactions: PointsTransaction[];
  pointsDistribution: {
    range: string;
    userCount: number;
  }[];
}