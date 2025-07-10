import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Plus, 
  Save, 
  Trash2, 
  Users, 
  TrendingUp,
  Star,
  Gift,
  Percent,
  Truck,
  Clock,
  Cake,
  Type
} from 'lucide-react';
import { apiService } from '../services/api';
import { PointTier, PointTierReward, TierStats } from '../types';

const PointTiersPage: React.FC = () => {
  const [tiers, setTiers] = useState<PointTier[]>([]);
  const [stats, setStats] = useState<TierStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingTier, setEditingTier] = useState<number | null>(null);

  const defaultTierTemplate = {
    tierLevel: 1,
    name: '',
    pointsRequired: 0,
    description: '',
    rewards: [] as PointTierReward[],
    color: '#9CAF88',
    isActive: true,
    sortOrder: 1
  };

  const rewardTypeIcons = {
    discount: Percent,
    freeItem: Gift,
    pointMultiplier: TrendingUp,
    freeShipping: Truck,
    earlyAccess: Clock,
    birthday: Cake,
    custom: Type
  };

  const rewardTypeLabels: Record<string, string> = {
    discount: 'Discount',
    freeItem: 'Free Item',
    pointMultiplier: 'Point Multiplier',
    freeShipping: 'Free Shipping',
    earlyAccess: 'Early Access',
    birthday: 'Birthday Reward',
    custom: 'Custom Reward'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tiersResponse, statsResponse] = await Promise.all([
        apiService.getPointTiers(),
        apiService.getTierStats()
      ]);

      if (tiersResponse.success) {
        setTiers(tiersResponse.tiers || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.stats || []);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load point tiers data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTier = async (tierLevel: number, tierData: any) => {
    try {
      setIsSaving(true);
      const response = await apiService.upsertPointTier({
        tierLevel,
        ...tierData
      });

      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        setEditingTier(null);
        await loadData();
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save point tier' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTier = async (tierLevel: number) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete this tier?')) return;

    try {
      setIsSaving(true);
      const response = await apiService.deletePointTier(tierLevel);

      if (response.success) {
        setMessage({ type: 'success', text: 'Point tier deleted successfully' });
        await loadData();
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete point tier' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTierData = (tierLevel: number): PointTier => {
    return tiers.find(t => t.tierLevel === tierLevel) || {
      ...defaultTierTemplate,
      tierLevel,
      businessId: '',
      sortOrder: tierLevel
    };
  };

  const getTierStats = (tierLevel: number) => {
    const tier = tiers.find(t => t.tierLevel === tierLevel);
    return stats.find(s => s.tierId === tier?.id) || { userCount: 0, percentage: 0, avgPoints: 0 };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Point Tiers Management</h1>
        <p className="text-gray-600">Configure business-specific point tiers and rewards (separate from XP rankings)</p>
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

      {/* Stats Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Tier Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(tierLevel => {
            const tierData = getTierData(tierLevel);
            const tierStats = getTierStats(tierLevel);
            return (
              <div key={tierLevel} className="text-center p-4 border rounded-lg" style={{ borderColor: tierData.color }}>
                <div className="text-sm font-medium text-gray-600">{tierData.name || `Tier ${tierLevel}`}</div>
                <div className="text-2xl font-bold text-gray-900">{tierStats.userCount}</div>
                <div className="text-sm text-gray-500">{tierStats.percentage}% of users</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(tierLevel => (
          <TierConfigCard
            key={tierLevel}
            tierLevel={tierLevel}
            tierData={getTierData(tierLevel)}
            tierStats={getTierStats(tierLevel)}
            isEditing={editingTier === tierLevel}
            isSaving={isSaving}
            rewardTypeIcons={rewardTypeIcons}
            rewardTypeLabels={rewardTypeLabels}
            onEdit={() => setEditingTier(tierLevel)}
            onCancel={() => setEditingTier(null)}
            onSave={(data) => handleSaveTier(tierLevel, data)}
            onDelete={() => handleDeleteTier(tierLevel)}
          />
        ))}
      </div>
    </div>
  );
};

interface TierConfigCardProps {
  tierLevel: number;
  tierData: PointTier;
  tierStats: any;
  isEditing: boolean;
  isSaving: boolean;
  rewardTypeIcons: any;
  rewardTypeLabels: any;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: any) => void;
  onDelete: () => void;
}

const TierConfigCard: React.FC<TierConfigCardProps> = ({
  tierLevel,
  tierData,
  tierStats,
  isEditing,
  isSaving,
  rewardTypeIcons,
  rewardTypeLabels,
  onEdit,
  onCancel,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    name: tierData.name || '',
    pointsRequired: tierData.pointsRequired || 0,
    description: tierData.description || '',
    rewards: tierData.rewards || [],
    color: tierData.color || '#9CAF88'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addReward = () => {
    setFormData(prev => ({
      ...prev,
      rewards: [...prev.rewards, { type: 'discount' as const, value: '', description: '' }]
    }));
  };

  const updateReward = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards.map((reward, i) => 
        i === index ? { ...reward, [field]: value } : reward
      )
    }));
  };

  const removeReward = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div 
            className="w-8 h-8 rounded-full mr-3 flex items-center justify-center"
            style={{ backgroundColor: formData.color }}
          >
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Tier {tierLevel} {formData.name && `- ${formData.name}`}
            </h3>
            <p className="text-sm text-gray-500">
              {tierStats.userCount} users ({tierStats.percentage}%)
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={onEdit}
                className="px-3 py-1 bg-sage-100 text-sage-700 rounded-md hover:bg-sage-200 text-sm"
              >
                Edit
              </button>
              {tierData.id && (
                <button
                  onClick={onDelete}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={onCancel}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tier Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                placeholder={`Tier ${tierLevel} Name`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points Required</label>
              <input
                type="number"
                value={formData.pointsRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, pointsRequired: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="w-20 h-10 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
              rows={2}
              placeholder="Describe this tier..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Rewards</label>
              <button
                type="button"
                onClick={addReward}
                className="px-2 py-1 bg-sage-100 text-sage-700 rounded-md hover:bg-sage-200 text-sm flex items-center"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.rewards.map((reward, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
                  <select
                    value={reward.type}
                    onChange={(e) => updateReward(index, 'type', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="discount">Discount</option>
                    <option value="freeItem">Free Item</option>
                    <option value="pointMultiplier">Point Multiplier</option>
                    <option value="freeShipping">Free Shipping</option>
                    <option value="earlyAccess">Early Access</option>
                    <option value="birthday">Birthday Reward</option>
                    <option value="custom">Custom Reward</option>
                  </select>
                  <input
                    type="text"
                    value={reward.value}
                    onChange={(e) => updateReward(index, 'value', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Reward value..."
                  />
                  <button
                    type="button"
                    onClick={() => removeReward(index)}
                    className="px-1 py-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Tier'}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium text-gray-700">Points Required</div>
            <div className="text-lg text-gray-900">{tierData.pointsRequired?.toLocaleString() || 0}</div>
          </div>

          {tierData.description && (
            <div>
              <div className="text-sm font-medium text-gray-700">Description</div>
              <div className="text-sm text-gray-600">{tierData.description}</div>
            </div>
          )}

          {tierData.rewards && tierData.rewards.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Rewards</div>
              <div className="space-y-1">
                {tierData.rewards.map((reward, index) => {
                  const IconComponent = rewardTypeIcons[reward.type] || Star;
                  return (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <IconComponent className="h-3 w-3 mr-2" />
                      {reward.value}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PointTiersPage;