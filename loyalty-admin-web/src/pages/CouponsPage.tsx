import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  BarChart3,
  X,
  Save,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { apiService } from '../services/api';
import { Coupon, CouponAnalytics, PaginationInfo } from '../types';

interface CouponFormData {
  title: string;
  description: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumPurchase: number;
  expirationDate: string;
  usageLimit: number;
  targetRankingLevel?: number;
}

const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [showAnalytics, setShowAnalytics] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<CouponAnalytics | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    isActive: '',
    discountType: '',
    includeExpired: false
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState<CouponFormData>({
    title: '',
    description: '',
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    minimumPurchase: 0,
    expirationDate: '',
    usageLimit: 0,
    targetRankingLevel: undefined
  });

  useEffect(() => {
    loadCoupons();
  }, [currentPage, searchTerm, filters]);

  const loadCoupons = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        isActive: filters.isActive || undefined,
        discountType: filters.discountType || undefined,
        includeExpired: filters.includeExpired
      };

      const response = await apiService.getCoupons(params);
      if (response.success) {
        setCoupons(response.coupons || []);
        setPagination(response.pagination || null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load coupons' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minimumPurchase: 0,
      expirationDate: '',
      usageLimit: 0,
      targetRankingLevel: undefined
    });
    setEditingCoupon(null);
  };

  const generateCouponCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleCreateCoupon = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setFormData({
      title: coupon.title,
      description: coupon.description,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumPurchase: coupon.minimumPurchase,
      expirationDate: coupon.expirationDate ? coupon.expirationDate.split('T')[0] : '',
      usageLimit: coupon.usageLimit || 0,
      targetRankingLevel: coupon.targetRankingLevel
    });
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitData = {
        ...formData,
        expirationDate: formData.expirationDate || null,
        usageLimit: formData.usageLimit || null
      };

      let response;
      if (editingCoupon) {
        response = await apiService.updateCoupon(editingCoupon.id, submitData);
      } else {
        response = await apiService.createCoupon(submitData);
      }

      if (response.success) {
        await loadCoupons();
        setShowForm(false);
        resetForm();
        setMessage({ 
          type: 'success', 
          text: editingCoupon ? 'Coupon updated successfully' : 'Coupon created successfully' 
        });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save coupon' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const response = await apiService.toggleCouponStatus(coupon.id);
      if (response.success) {
        await loadCoupons();
        setMessage({ 
          type: 'success', 
          text: `Coupon ${coupon.isActive ? 'deactivated' : 'activated'} successfully` 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to toggle coupon status' });
    }
  };

  const handleDeleteCoupon = async (coupon: Coupon) => {
    if (!window.confirm(`Are you sure you want to delete the "${coupon.title}" coupon?`)) {
      return;
    }

    try {
      const response = await apiService.deleteCoupon(coupon.id);
      if (response.success) {
        await loadCoupons();
        setMessage({ type: 'success', text: 'Coupon deleted successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete coupon' });
    }
  };

  const handleViewAnalytics = async (coupon: Coupon) => {
    try {
      setShowAnalytics(coupon.id);
      const response = await apiService.getCouponAnalytics(coupon.id);
      if (response.success) {
        setAnalytics(response.analytics);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load analytics' });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: 'success', text: 'Copied to clipboard' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy' });
    }
  };

  const getStatusIcon = (coupon: Coupon) => {
    const isExpired = coupon.expirationDate && new Date(coupon.expirationDate) <= new Date();
    const isUsageLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

    if (!coupon.isActive) {
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
    } else if (isExpired || isUsageLimitReached) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const formatDiscountText = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    } else {
      return `$${coupon.discountValue} OFF`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-600">Create and manage promotional coupons for your loyalty program</p>
        </div>
        <button
          onClick={handleCreateCoupon}
          className="flex items-center px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
            />
          </div>

          <select
            value={filters.isActive}
            onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select
            value={filters.discountType}
            onChange={(e) => setFilters(prev => ({ ...prev, discountType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
          >
            <option value="">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeExpired"
              checked={filters.includeExpired}
              onChange={(e) => setFilters(prev => ({ ...prev, includeExpired: e.target.checked }))}
              className="h-4 w-4 text-sage-600 focus:ring-sage-500 border-gray-300 rounded"
            />
            <label htmlFor="includeExpired" className="ml-2 text-sm text-gray-700">
              Include expired
            </label>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Coupons Found</h3>
            <p className="text-gray-500 mb-4">Create your first coupon to get started</p>
            <button
              onClick={handleCreateCoupon}
              className="flex items-center px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 transition-colors mx-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Coupon
            </button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-sage-100 rounded-lg">
                          <Ticket className="h-6 w-6 text-sage-600" />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{coupon.title}</h3>
                              {getStatusIcon(coupon)}
                              <span className="px-2 py-1 bg-sage-100 text-sage-800 text-xs rounded-full font-medium">
                                {formatDiscountText(coupon)}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{coupon.description}</p>
                            
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 font-mono text-sm rounded">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => copyToClipboard(coupon.code)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Min. Purchase:</span>
                                <p className="font-medium">${coupon.minimumPurchase}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Usage:</span>
                                <p className="font-medium">
                                  {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Expires:</span>
                                <p className="font-medium">
                                  {coupon.expirationDate 
                                    ? new Date(coupon.expirationDate).toLocaleDateString()
                                    : 'Never'
                                  }
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Status:</span>
                                <p className={`font-medium ${
                                  coupon.isActive ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                  {coupon.isActive ? 'Active' : 'Inactive'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewAnalytics(coupon)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="View Analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {coupon.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditCoupon(coupon)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 bg-sage-100 text-sage-800 rounded text-sm">
                    {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                    placeholder="e.g., Black Friday Sale"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                    placeholder="Brief description of the offer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500 font-mono"
                      placeholder="COUPONCODE"
                      required
                    />
                    <button
                      type="button"
                      onClick={generateCouponCode}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'fixed' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                      min="0"
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      required
                    />
                    <span className="absolute right-3 top-2 text-gray-500">
                      {formData.discountType === 'percentage' ? '%' : '$'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Purchase
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.minimumPurchase}
                      onChange={(e) => setFormData(prev => ({ ...prev, minimumPurchase: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                      min="0"
                      step="0.01"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">$</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                    min="0"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center px-6 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && analytics && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Coupon Analytics</h3>
                <button
                  onClick={() => setShowAnalytics(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.totalUsage}</div>
                  <div className="text-sm text-blue-700">Total Uses</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.usagePercentage}%</div>
                  <div className="text-sm text-green-700">Usage Rate</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining Uses:</span>
                  <span className="font-medium">{analytics.remainingUses || 'Unlimited'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    analytics.status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {analytics.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Effectiveness:</span>
                  <span className={`font-medium ${
                    analytics.effectiveness === 'high' ? 'text-green-600' :
                    analytics.effectiveness === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analytics.effectiveness}
                  </span>
                </div>
                {analytics.daysUntilExpiration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Until Expiration:</span>
                    <span className="font-medium">{analytics.daysUntilExpiration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsPage;