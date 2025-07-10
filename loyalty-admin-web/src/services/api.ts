import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.instance.post('/api/auth/login', { email, password });
    return response.data;
  }

  async verifyToken() {
    const response = await this.instance.get('/api/auth/verify');
    return response.data;
  }

  // Business endpoints
  async getBusinessInfo() {
    const response = await this.instance.get('/api/business/info');
    return response.data;
  }

  async updateBusinessInfo(data: any) {
    const response = await this.instance.put('/api/business/info', data);
    return response.data;
  }

  async uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await this.instance.post('/api/business/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteLogo() {
    const response = await this.instance.delete('/api/business/logo');
    return response.data;
  }

  // Theme endpoints
  async getThemeColors() {
    const response = await this.instance.get('/api/theme/colors');
    return response.data;
  }

  async updateThemeColors(colors: any) {
    const response = await this.instance.put('/api/theme/colors', { colors });
    return response.data;
  }

  async getThemePresets() {
    const response = await this.instance.get('/api/theme/presets');
    return response.data;
  }

  async createThemePreset(name: string, colors: any) {
    const response = await this.instance.post('/api/theme/presets', { name, colors });
    return response.data;
  }

  async applyThemePreset(id: string) {
    const response = await this.instance.put(`/api/theme/presets/${id}/apply`);
    return response.data;
  }

  async deleteThemePreset(id: number) {
    const response = await this.instance.delete(`/api/theme/presets/${id}`);
    return response.data;
  }

  // Rankings endpoints
  async getRankings() {
    const response = await this.instance.get('/api/rankings');
    return response.data;
  }

  async createRanking(data: any) {
    const response = await this.instance.post('/api/rankings', data);
    return response.data;
  }

  async updateRanking(id: string, data: any) {
    const response = await this.instance.put(`/api/rankings/${id}`, data);
    return response.data;
  }

  async deleteRanking(id: string) {
    const response = await this.instance.delete(`/api/rankings/${id}`);
    return response.data;
  }

  async reorderRankings(rankings: any[]) {
    const response = await this.instance.put('/api/rankings/reorder', { rankings });
    return response.data;
  }

  // Coupons endpoints
  async getCoupons(params?: any) {
    const response = await this.instance.get('/api/coupons', { params });
    return response.data;
  }

  async getCoupon(id: string) {
    const response = await this.instance.get(`/api/coupons/${id}`);
    return response.data;
  }

  async createCoupon(data: any) {
    const response = await this.instance.post('/api/coupons', data);
    return response.data;
  }

  async updateCoupon(id: string, data: any) {
    const response = await this.instance.put(`/api/coupons/${id}`, data);
    return response.data;
  }

  async deleteCoupon(id: string) {
    const response = await this.instance.delete(`/api/coupons/${id}`);
    return response.data;
  }

  async toggleCouponStatus(id: string) {
    const response = await this.instance.patch(`/api/coupons/${id}/toggle`);
    return response.data;
  }

  async getCouponAnalytics(id: string) {
    const response = await this.instance.get(`/api/coupons/${id}/analytics`);
    return response.data;
  }

  async bulkUpdateCoupons(data: any) {
    const response = await this.instance.put('/api/coupons/bulk', data);
    return response.data;
  }

  // Point Tiers endpoints
  async getPointTiers() {
    const response = await this.instance.get('/api/point-tiers');
    return response.data;
  }

  async upsertPointTier(data: any) {
    const response = await this.instance.post('/api/point-tiers', data);
    return response.data;
  }

  async deletePointTier(tierLevel: number) {
    const response = await this.instance.delete(`/api/point-tiers/${tierLevel}`);
    return response.data;
  }

  async getTierStats() {
    const response = await this.instance.get('/api/point-tiers/stats');
    return response.data;
  }

  async awardTierPoints(data: { userId: string; points: number; description: string }) {
    const response = await this.instance.post('/api/point-tiers/award-points', data);
    return response.data;
  }

  async getUserTierProgress(userId: string) {
    const response = await this.instance.get(`/api/point-tiers/user/${userId}`);
    return response.data;
  }

  async recalculateAllTiers() {
    const response = await this.instance.post('/api/point-tiers/recalculate');
    return response.data;
  }

  // Menu endpoints
  async getMenuItems(params?: any) {
    const response = await this.instance.get('/api/menu/items', { params });
    return response.data;
  }

  async getMenuCategories() {
    const response = await this.instance.get('/api/menu/categories');
    return response.data;
  }

  async createMenuItem(data: any) {
    const response = await this.instance.post('/api/menu/items', data);
    return response.data;
  }

  async updateMenuItem(id: string, data: any) {
    const response = await this.instance.put(`/api/menu/items/${id}`, data);
    return response.data;
  }

  async deleteMenuItem(id: string) {
    const response = await this.instance.delete(`/api/menu/items/${id}`);
    return response.data;
  }

  async recordPurchase(data: any) {
    const response = await this.instance.post('/api/menu/purchase', data);
    return response.data;
  }

  async getPurchaseHistory(params?: any) {
    const response = await this.instance.get('/api/menu/purchases', { params });
    return response.data;
  }

  async getMenuStats(params?: any) {
    const response = await this.instance.get('/api/menu/stats', { params });
    return response.data;
  }

  // User Management endpoints
  async getUsers(params?: any) {
    const response = await this.instance.get('/api/admin/users', { params });
    return response.data;
  }

  async getUserDetails(userId: string) {
    const response = await this.instance.get(`/api/admin/users/${userId}`);
    return response.data;
  }

  async updateUserStatus(userId: string, data: { isActive: boolean }) {
    const response = await this.instance.put(`/api/admin/users/${userId}/status`, data);
    return response.data;
  }

  async updateUserDetails(userId: string, data: any) {
    const response = await this.instance.put(`/api/admin/users/${userId}`, data);
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await this.instance.delete(`/api/admin/users/${userId}`);
    return response.data;
  }

  // Points Management endpoints
  async getUser(userId: string) {
    const response = await this.instance.get(`/api/admin/users/${userId}`);
    return response.data;
  }

  async awardPoints(data: any) {
    const response = await this.instance.post('/api/admin/points/award', data);
    return response.data;
  }

  async adjustPoints(data: any) {
    const response = await this.instance.post('/api/admin/points/adjust', data);
    return response.data;
  }

  async bulkAwardPoints(data: any) {
    const response = await this.instance.post('/api/admin/points/bulk-award', data);
    return response.data;
  }

  async getPointsTransactions(params?: any) {
    const response = await this.instance.get('/api/admin/points/transactions', { params });
    return response.data;
  }

  async getUserPointsHistory(userId: string, params?: any) {
    const response = await this.instance.get(`/api/admin/points/user/${userId}/history`, { params });
    return response.data;
  }

  async getPointsStats(params?: any) {
    const response = await this.instance.get('/api/admin/points/stats', { params });
    return response.data;
  }

  async updateMenuItemPoints(data: any) {
    const response = await this.instance.put('/api/menu/items/points', data);
    return response.data;
  }

  async bulkUpdateMenuItemPoints(data: any) {
    const response = await this.instance.put('/api/menu/items/bulk-points', data);
    return response.data;
  }

  // Point deals endpoints (placeholder for future implementation)
  async createPointsDeal(data: any) {
    throw new Error('Point deals not implemented yet');
  }

  async getPointsDeals(params?: any) {
    return { success: true, deals: [] }; // Return empty array for now
  }

  async updatePointsDeal(id: string, data: any) {
    throw new Error('Point deals not implemented yet');
  }

  async deletePointsDeal(id: string) {
    throw new Error('Point deals not implemented yet');
  }

  async togglePointsDeal(id: string) {
    throw new Error('Point deals not implemented yet');
  }
}

export const apiService = new ApiService();
export default apiService;