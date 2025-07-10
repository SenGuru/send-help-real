import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Plus, 
  Users, 
  TrendingUp, 
  Award, 
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Gift,
  Target,
  Calendar,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import { 
  User, 
  PointsTransaction, 
  PointsStats, 
  PointsAwardRequest, 
  BulkPointsOperation,
  MenuItem,
  PointsDeal
} from '../types';

const PointsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'award' | 'transactions' | 'deals' | 'items'>('overview');
  const [stats, setStats] = useState<PointsStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [deals, setDeals] = useState<PointsDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setMessage(null); // Clear any previous messages
      
      if (activeTab === 'overview') {
        try {
          // Load each piece separately to isolate failures
          const statsResponse = await apiService.getPointsStats().catch(err => {
            console.warn('Stats API failed:', err);
            return { success: false, data: null };
          });
          
          const usersResponse = await apiService.getUsers({ limit: 10 }).catch(err => {
            console.warn('Users API failed:', err);
            return { success: false, users: [] };
          });
          
          const transactionsResponse = await apiService.getPointsTransactions({ limit: 10 }).catch(err => {
            console.warn('Transactions API failed:', err);
            return { success: false, transactions: [] };
          });
          
          if (statsResponse.success) {
            setStats(statsResponse.data);
          } else {
            // Set default stats if API fails
            setStats({
              totalPointsAwarded: 0,
              totalPointsRedeemed: 0,
              activeUsers: 0,
              averagePointBalance: 0,
              topEarners: [],
              recentTransactions: [],
              pointsDistribution: []
            });
          }
          
          setUsers(usersResponse.users || []);
          setTransactions(transactionsResponse.transactions || []);
        } catch (overviewError) {
          console.error('Overview data loading failed:', overviewError);
          setMessage({ 
            type: 'error', 
            text: 'Some data could not be loaded. Please check your connection and try again.' 
          });
        }
      }
      
      if (activeTab === 'award' || activeTab === 'transactions') {
        try {
          const usersResponse = await apiService.getUsers().catch(err => ({ success: false, users: [] }));
          const transactionsResponse = await apiService.getPointsTransactions().catch(err => ({ success: false, transactions: [] }));
          
          setUsers(usersResponse.users || []);
          setTransactions(transactionsResponse.transactions || []);
        } catch (awardError) {
          console.error('Award/transactions data loading failed:', awardError);
          setMessage({ 
            type: 'error', 
            text: 'Could not load user or transaction data.' 
          });
        }
      }
      
      if (activeTab === 'items') {
        try {
          const itemsResponse = await apiService.getMenuItems({ includeInactive: true });
          setMenuItems(itemsResponse.menuItems || []);
        } catch (itemsError) {
          console.error('Menu items loading failed:', itemsError);
          setMessage({ 
            type: 'error', 
            text: 'Could not load menu items.' 
          });
        }
      }
      
      if (activeTab === 'deals') {
        // Deals are not implemented yet, so just set empty array
        setDeals([]);
      }
      
    } catch (error: any) {
      console.error('General load data error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load data. Please refresh the page and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAwardPoints = async (data: PointsAwardRequest) => {
    try {
      const response = await apiService.awardPoints(data);
      if (response.success) {
        setMessage({ type: 'success', text: 'Points awarded successfully' });
        loadData();
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to award points' 
      });
    }
  };

  const handleBulkAward = async (data: BulkPointsOperation) => {
    try {
      const response = await apiService.bulkAwardPoints(data);
      if (response.success) {
        setMessage({ type: 'success', text: `Points ${data.type === 'award' ? 'awarded' : 'deducted'} for ${data.userIds.length} users` });
        setSelectedUsers([]);
        loadData();
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to process bulk operation' 
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(transaction => {
    if (filterType === 'all') return true;
    return transaction.type === filterType;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Points Management</h1>
          <p className="text-gray-600">Award points, manage rewards, and track transactions</p>
        </div>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'award', label: 'Award Points', icon: Gift },
            { id: 'transactions', label: 'Transactions', icon: Star },
            { id: 'deals', label: 'Point Deals', icon: Target },
            { id: 'items', label: 'Menu Items', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-sage-500 text-sage-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Points Awarded</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalPointsAwarded?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ArrowDown className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Points Redeemed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalPointsRedeemed?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Balance</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats?.averagePointBalance || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Earners */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Point Earners</h3>
              <div className="space-y-3">
                {stats?.topEarners?.slice(0, 5).map((earner, index) => (
                  <div key={earner.user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {earner.user.firstName} {earner.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{earner.user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{earner.points.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {stats?.recentTransactions?.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-full ${
                        transaction.points > 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.points > 0 ? (
                          <ArrowUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.user?.firstName} {transaction.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Award Points Tab */}
      {activeTab === 'award' && (
        <AwardPointsTab 
          users={filteredUsers}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAwardPoints={handleAwardPoints}
          onBulkAward={handleBulkAward}
        />
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <TransactionsTab 
          transactions={filteredTransactions}
          filterType={filterType}
          setFilterType={setFilterType}
        />
      )}

      {/* Point Deals Tab */}
      {activeTab === 'deals' && (
        <PointDealsTab 
          deals={deals}
          onRefresh={loadData}
          setMessage={setMessage}
        />
      )}

      {/* Menu Items Tab */}
      {activeTab === 'items' && (
        <MenuItemsPointsTab 
          menuItems={menuItems}
          onRefresh={loadData}
          setMessage={setMessage}
        />
      )}
    </div>
  );
};

// Award Points Tab Component
interface AwardPointsTabProps {
  users: User[];
  selectedUsers: string[];
  setSelectedUsers: (users: string[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAwardPoints: (data: PointsAwardRequest) => void;
  onBulkAward: (data: BulkPointsOperation) => void;
}

const AwardPointsTab: React.FC<AwardPointsTabProps> = ({
  users,
  selectedUsers,
  setSelectedUsers,
  searchTerm,
  setSearchTerm,
  onAwardPoints,
  onBulkAward
}) => {
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => setShowSingleForm(true)}
          className="flex items-center px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Award to Single User
        </button>
        <button
          onClick={() => setShowBulkForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Users className="h-4 w-4 mr-2" />
          Bulk Award Points
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
            />
          </div>
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setShowBulkForm(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Bulk Action ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Users ({users.length})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {users.map(user => (
            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user.id]);
                    } else {
                      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                    }
                  }}
                  className="h-4 w-4 text-sage-600 focus:ring-sage-500 border-gray-300 rounded"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{user.totalPoints} pts</p>
                  <p className="text-xs text-gray-500">Available: {user.availablePoints}</p>
                </div>
                <button
                  onClick={() => setShowSingleForm(true)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Gift className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Single Award Form Modal */}
      {showSingleForm && (
        <SingleAwardForm 
          users={users}
          onSubmit={onAwardPoints}
          onClose={() => setShowSingleForm(false)}
        />
      )}

      {/* Bulk Award Form Modal */}
      {showBulkForm && (
        <BulkAwardForm 
          selectedUsers={selectedUsers}
          users={users}
          onSubmit={onBulkAward}
          onClose={() => setShowBulkForm(false)}
        />
      )}
    </div>
  );
};

// Single Award Form Component
interface SingleAwardFormProps {
  users: User[];
  onSubmit: (data: PointsAwardRequest) => void;
  onClose: () => void;
}

const SingleAwardForm: React.FC<SingleAwardFormProps> = ({ users, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    userId: '',
    points: 0,
    description: '',
    expiresInDays: 365
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Award Points to User</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
              required
            >
              <option value="">Choose a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
            <input
              type="number"
              min="1"
              value={formData.points}
              onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
              placeholder="Reason for awarding points..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expires in (days)</label>
            <input
              type="number"
              min="1"
              value={formData.expiresInDays}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) || 365 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700"
            >
              Award Points
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Award Form Component
interface BulkAwardFormProps {
  selectedUsers: string[];
  users: User[];
  onSubmit: (data: BulkPointsOperation) => void;
  onClose: () => void;
}

const BulkAwardForm: React.FC<BulkAwardFormProps> = ({ selectedUsers, users, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'award' as 'award' | 'deduct',
    points: 0,
    description: ''
  });

  const selectedUsersList = users.filter(user => selectedUsers.includes(user.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      userIds: selectedUsers,
      ...formData
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Bulk Points Operation ({selectedUsers.length} users)
        </h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
          <p className="text-sm font-medium text-gray-700 mb-2">Selected Users:</p>
          {selectedUsersList.map(user => (
            <p key={user.id} className="text-sm text-gray-600">
              {user.firstName} {user.lastName}
            </p>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'award' | 'deduct' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
            >
              <option value="award">Award Points</option>
              <option value="deduct">Deduct Points</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
            <input
              type="number"
              min="1"
              value={formData.points}
              onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
              placeholder="Reason for this operation..."
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-md ${
                formData.type === 'award' 
                  ? 'bg-sage-600 hover:bg-sage-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {formData.type === 'award' ? 'Award' : 'Deduct'} Points
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Transactions Tab Component
interface TransactionsTabProps {
  transactions: PointsTransaction[];
  filterType: string;
  setFilterType: (type: string) => void;
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ transactions, filterType, setFilterType }) => {
  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
          >
            <option value="all">All Transactions</option>
            <option value="earned">Earned</option>
            <option value="redeemed">Redeemed</option>
            <option value="manual">Manual</option>
            <option value="bonus">Bonus</option>
            <option value="expired">Expired</option>
          </select>
          <span className="text-sm text-gray-500">
            {transactions.length} transactions
          </span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {transactions.map(transaction => (
            <div key={transaction.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  transaction.points > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.points > 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.user?.firstName} {transaction.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${
                  transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.points > 0 ? '+' : ''}{transaction.points}
                </p>
                <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                <p className="text-xs text-gray-400">
                  Balance: {transaction.balanceAfter}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Point Deals Tab Component (Placeholder)
interface PointDealsTabProps {
  deals: PointsDeal[];
  onRefresh: () => void;
  setMessage: (message: { type: 'success' | 'error'; text: string } | null) => void;
}

const PointDealsTab: React.FC<PointDealsTabProps> = ({ deals, onRefresh, setMessage }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Point Deals Coming Soon</h3>
      <p className="text-gray-600">
        Create special deals and promotions that award bonus points to customers.
      </p>
    </div>
  );
};

// Menu Items Points Tab Component (Placeholder)
interface MenuItemsPointsTabProps {
  menuItems: MenuItem[];
  onRefresh: () => void;
  setMessage: (message: { type: 'success' | 'error'; text: string } | null) => void;
}

const MenuItemsPointsTab: React.FC<MenuItemsPointsTabProps> = ({ menuItems, onRefresh, setMessage }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu Item Points</h3>
        <p className="text-gray-600 mb-4">
          Manage point rewards for individual menu items. You can update points for existing items here.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-sage-600">{item.pointsEarned} pts</p>
                  <p className="text-sm text-gray-500">${item.price}</p>
                </div>
              </div>
              {item.description && (
                <p className="text-xs text-gray-500 mb-3">{item.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  item.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <button className="text-sage-600 hover:text-sage-700 text-sm font-medium">
                  Edit Points
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PointsManagementPage;