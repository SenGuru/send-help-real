import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  GripVertical,
  Star,
  Crown,
  Award,
  Medal
} from 'lucide-react';
import { apiService } from '../services/api';
import { Ranking } from '../types';

interface RankingFormData {
  level: number;
  title: string;
  pointsRequired: number;
  color: string;
  benefits: {
    discountPercentage: number;
    specialOffers: string[];
    prioritySupport: boolean;
    freeShipping: boolean;
  };
}

const RankingsPage: React.FC = () => {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRanking, setEditingRanking] = useState<Ranking | null>(null);
  const [formData, setFormData] = useState<RankingFormData>({
    level: 1,
    title: '',
    pointsRequired: 0,
    color: '#9CAF88',
    benefits: {
      discountPercentage: 0,
      specialOffers: [],
      prioritySupport: false,
      freeShipping: false
    }
  });
  const [newOffer, setNewOffer] = useState('');

  const rankingIcons = [
    { icon: Medal, name: 'Medal' },
    { icon: Trophy, name: 'Trophy' },
    { icon: Crown, name: 'Crown' },
    { icon: Star, name: 'Star' },
    { icon: Award, name: 'Award' }
  ];

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      const response = await apiService.getRankings();
      if (response.success) {
        setRankings(response.rankings || []);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load rankings' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      level: rankings.length + 1,
      title: '',
      pointsRequired: 0,
      color: '#9CAF88',
      benefits: {
        discountPercentage: 0,
        specialOffers: [],
        prioritySupport: false,
        freeShipping: false
      }
    });
    setEditingRanking(null);
    setNewOffer('');
  };

  const handleCreateRanking = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditRanking = (ranking: Ranking) => {
    setFormData({
      level: ranking.level,
      title: ranking.title,
      pointsRequired: ranking.pointsRequired,
      color: ranking.color,
      benefits: {
        discountPercentage: ranking.benefits.discountPercentage || 0,
        specialOffers: ranking.benefits.specialOffers || [],
        prioritySupport: ranking.benefits.prioritySupport || false,
        freeShipping: ranking.benefits.freeShipping || false
      }
    });
    setEditingRanking(ranking);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let response;
      if (editingRanking) {
        response = await apiService.updateRanking(editingRanking.id, formData);
      } else {
        response = await apiService.createRanking(formData);
      }

      if (response.success) {
        await loadRankings();
        setShowForm(false);
        resetForm();
        setMessage({ 
          type: 'success', 
          text: editingRanking ? 'Ranking updated successfully' : 'Ranking created successfully' 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save ranking' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRanking = async (ranking: Ranking) => {
    if (!window.confirm(`Are you sure you want to delete the "${ranking.title}" ranking?`)) {
      return;
    }

    try {
      setSaving(true);
      const response = await apiService.deleteRanking(ranking.id);
      if (response.success) {
        await loadRankings();
        setMessage({ type: 'success', text: 'Ranking deleted successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete ranking' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddOffer = () => {
    if (newOffer.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: {
          ...prev.benefits,
          specialOffers: [...prev.benefits.specialOffers, newOffer.trim()]
        }
      }));
      setNewOffer('');
    }
  };

  const handleRemoveOffer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        specialOffers: prev.benefits.specialOffers.filter((_, i) => i !== index)
      }
    }));
  };

  const getRankingIcon = (level: number) => {
    const iconIndex = (level - 1) % rankingIcons.length;
    const IconComponent = rankingIcons[iconIndex].icon;
    return <IconComponent className="h-6 w-6" />;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loyalty Rankings</h1>
          <p className="text-gray-600">Manage your loyalty program tiers and rewards</p>
        </div>
        <button
          onClick={handleCreateRanking}
          className="flex items-center px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Ranking
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

      {/* Rankings List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {rankings.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Rankings Created</h3>
            <p className="text-gray-500 mb-4">Create your first loyalty ranking to get started</p>
            <button
              onClick={handleCreateRanking}
              className="flex items-center px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 transition-colors mx-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Ranking
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {rankings.sort((a, b) => a.level - b.level).map((ranking) => (
              <div key={ranking.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center">
                      <GripVertical className="h-5 w-5 text-gray-400 mr-2" />
                      <div 
                        className="p-3 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: ranking.color + '20', color: ranking.color }}
                      >
                        {getRankingIcon(ranking.level)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{ranking.title}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          Level {ranking.level}
                        </span>
                        <span 
                          className="px-2 py-1 text-white text-xs rounded-full"
                          style={{ backgroundColor: ranking.color }}
                        >
                          {ranking.pointsRequired} pts required
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Discount</span>
                          <p className="text-sm text-gray-900">{ranking.benefits.discountPercentage || 0}%</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Special Offers</span>
                          <p className="text-sm text-gray-900">{ranking.benefits.specialOffers?.length || 0} offers</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Priority Support</span>
                          <p className="text-sm text-gray-900">{ranking.benefits.prioritySupport ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Free Shipping</span>
                          <p className="text-sm text-gray-900">{ranking.benefits.freeShipping ? 'Yes' : 'No'}</p>
                        </div>
                      </div>

                      {ranking.benefits.specialOffers && ranking.benefits.specialOffers.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-gray-500">Offers:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {ranking.benefits.specialOffers.map((offer, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {offer}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditRanking(ranking)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRanking(ranking)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRanking ? 'Edit Ranking' : 'Create New Ranking'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ranking Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                    placeholder="e.g., Gold Member"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <input
                    type="number"
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points Required
                  </label>
                  <input
                    type="number"
                    value={formData.pointsRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, pointsRequired: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex space-x-3 items-center">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                    />
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Benefits</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.benefits.discountPercentage}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          benefits: { ...prev.benefits, discountPercentage: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.benefits.prioritySupport}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          benefits: { ...prev.benefits, prioritySupport: e.target.checked }
                        }))}
                        className="h-4 w-4 text-sage-600 focus:ring-sage-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Priority Support</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.benefits.freeShipping}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          benefits: { ...prev.benefits, freeShipping: e.target.checked }
                        }))}
                        className="h-4 w-4 text-sage-600 focus:ring-sage-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Free Shipping</label>
                    </div>
                  </div>
                </div>

                {/* Special Offers */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Offers
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={newOffer}
                      onChange={(e) => setNewOffer(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                      placeholder="Add special offer"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOffer())}
                    />
                    <button
                      type="button"
                      onClick={handleAddOffer}
                      className="px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {formData.benefits.specialOffers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.benefits.specialOffers.map((offer, index) => (
                        <div key={index} className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                          <span className="text-sm">{offer}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOffer(index)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {isSaving ? 'Saving...' : (editingRanking ? 'Update Ranking' : 'Create Ranking')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingsPage;