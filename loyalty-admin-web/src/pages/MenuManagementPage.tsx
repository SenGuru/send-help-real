import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Save, 
  Trash2, 
  Edit2,
  DollarSign,
  Star,
  Eye,
  EyeOff,
  Package,
  TrendingUp
} from 'lucide-react';
import { apiService } from '../services/api';
import { MenuItem, MenuStats } from '../types';

const MenuManagementPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<MenuStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const defaultItemTemplate: Partial<MenuItem> = {
    name: '',
    description: '',
    category: '',
    price: 0,
    pointsEarned: 0,
    imageUrl: '',
    isAvailable: true,
    isActive: true,
    sortOrder: 0
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [itemsResponse, categoriesResponse, statsResponse] = await Promise.all([
        apiService.getMenuItems({ includeInactive: true }),
        apiService.getMenuCategories(),
        apiService.getMenuStats()
      ]);

      if (itemsResponse.success) {
        setMenuItems(itemsResponse.menuItems || []);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.categories || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.stats || null);
      }
    } catch (error: any) {
      console.error('Menu data loading error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to load menu data' 
      });
      // Set default empty stats to prevent crashes
      setStats({
        totalRevenue: 0,
        totalPurchases: 0,
        totalPointsAwarded: 0,
        averageOrderValue: 0,
        popularItems: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItem = async (itemData: Partial<MenuItem>, isNew: boolean = false) => {
    try {
      setIsSaving(true);
      let response;
      
      if (isNew) {
        response = await apiService.createMenuItem(itemData);
      } else {
        response = await apiService.updateMenuItem(itemData.id!, itemData);
      }

      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        setEditingItem(null);
        setShowAddForm(false);
        await loadData();
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || `Failed to ${isNew ? 'create' : 'update'} menu item` 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      setIsSaving(true);
      const response = await apiService.deleteMenuItem(id);

      if (response.success) {
        setMessage({ type: 'success', text: 'Menu item deleted successfully' });
        await loadData();
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete menu item' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

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
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage your menu items and point rewards</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
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

      {/* Stats Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Menu Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-sm font-medium text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold text-gray-900">${(stats?.totalRevenue || 0).toFixed(2)}</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-sm font-medium text-gray-600">Total Purchases</div>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalPurchases || 0}</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-sm font-medium text-gray-600">Points Awarded</div>
            <div className="text-2xl font-bold text-gray-900">{stats?.totalPointsAwarded || 0}</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-sm font-medium text-gray-600">Avg Order Value</div>
            <div className="text-2xl font-bold text-gray-900">${(stats?.averageOrderValue || 0).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {filteredItems.length} items
          </span>
        </div>
      </div>

      {/* Add New Item Form */}
      {showAddForm && (
        <MenuItemForm
          item={defaultItemTemplate}
          categories={categories}
          isNew={true}
          isSaving={isSaving}
          onSave={(data) => handleSaveItem(data, true)}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Menu Items List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredItems.map(item => (
          <MenuItemCard
            key={item.id}
            item={item}
            categories={categories}
            isEditing={editingItem === item.id}
            isSaving={isSaving}
            onEdit={() => setEditingItem(item.id!)}
            onCancel={() => setEditingItem(null)}
            onSave={(data) => handleSaveItem({ ...data, id: item.id })}
            onDelete={() => handleDeleteItem(item.id!)}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
          <p className="text-gray-600 mb-4">
            {selectedCategory ? `No items in "${selectedCategory}" category` : 'Get started by adding your first menu item'}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700"
          >
            Add Menu Item
          </button>
        </div>
      )}
    </div>
  );
};

interface MenuItemFormProps {
  item: Partial<MenuItem>;
  categories: string[];
  isNew?: boolean;
  isSaving: boolean;
  onSave: (data: Partial<MenuItem>) => void;
  onCancel: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  item,
  categories,
  isNew = false,
  isSaving,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: item.name || '',
    description: item.description || '',
    category: item.category || '',
    price: item.price || 0,
    pointsEarned: item.pointsEarned || 0,
    imageUrl: item.imageUrl || '',
    isAvailable: item.isAvailable ?? true,
    sortOrder: item.sortOrder || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isNew ? 'Add New Menu Item' : 'Edit Menu Item'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
              placeholder="Enter item name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
              placeholder="Enter category"
              list="category-suggestions"
              required
            />
            <datalist id="category-suggestions">
              {categories.map(category => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
            rows={2}
            placeholder="Describe this item..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points Earned</label>
            <input
              type="number"
              min="0"
              value={formData.pointsEarned}
              onChange={(e) => setFormData(prev => ({ ...prev, pointsEarned: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              min="0"
              value={formData.sortOrder}
              onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAvailable"
            checked={formData.isAvailable}
            onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
            className="h-4 w-4 text-sage-600 focus:ring-sage-500 border-gray-300 rounded"
          />
          <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
            Available for purchase
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : (isNew ? 'Create Item' : 'Update Item')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

interface MenuItemCardProps {
  item: MenuItem;
  categories: string[];
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: Partial<MenuItem>) => void;
  onDelete: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  categories,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  onDelete
}) => {
  if (isEditing) {
    return (
      <MenuItemForm
        item={item}
        categories={categories}
        isSaving={isSaving}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          {item.imageUrl && (
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.category}</p>
            {item.description && (
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {item.isAvailable ? (
            <div title="Available">
              <Eye className="h-4 w-4 text-green-600" />
            </div>
          ) : (
            <div title="Unavailable">
              <EyeOff className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-400 mr-1" />
          <span className="text-lg font-semibold text-gray-900">{item.pointsEarned} pts</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>Sort: {item.sortOrder}</span>
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {item.isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>
    </div>
  );
};

export default MenuManagementPage;