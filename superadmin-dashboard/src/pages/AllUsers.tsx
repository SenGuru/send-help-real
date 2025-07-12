import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  User, 
  Users,
  Filter,
  Download,
  RefreshCw,
  UserCheck,
  Star,
  TrendingUp,
  Eye
} from 'lucide-react';
import axios from 'axios';

interface BusinessMembership {
  user_id: number;
  member_id: string;
  join_date: string;
  total_points: number;
  available_points: number;
  lifetime_points: number;
  last_activity: string;
  membership_active: boolean;
  business_id: number;
  business_name: string;
  business_code: string;
  current_ranking: string;
  ranking_color: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  profile_image_url: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
  memberships: BusinessMembership[];
  totalBusinesses: number;
  totalPoints: number;
  totalAvailablePoints: number;
}

const AllUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [businessFilter, setBusinessFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'points' | 'business'>('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!users || !Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }

    let filtered = users.filter(user => {
      if (!user) return false;
      
      const memberships = user.memberships || [];
      const matchesSearch = 
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memberships.some(m => m?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesBusiness = businessFilter === 'all' || 
        (businessFilter === 'no-business' && memberships.length === 0) ||
        memberships.some(m => m?.business_code === businessFilter);
      
      return matchesSearch && matchesBusiness;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = `${a.first_name || ''} ${a.last_name || ''}`.localeCompare(`${b.first_name || ''} ${b.last_name || ''}`);
          break;
        case 'joinDate':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
        case 'points':
          comparison = (a.totalPoints || 0) - (b.totalPoints || 0);
          break;
        case 'business':
          const aBusinessName = (a.memberships || [])[0]?.business_name || '';
          const bBusinessName = (b.memberships || [])[0]?.business_name || '';
          comparison = aBusinessName.localeCompare(bBusinessName);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, businessFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superadmin_token');
      const response = await axios.get('http://localhost:3001/api/superadmin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.data.users);
        setMessage(null);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to load users' 
      });
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = async () => {
    try {
      const csvData = (filteredUsers || []).map(user => ({
        'Name': `${user?.first_name || ''} ${user?.last_name || ''}`,
        'Email': user?.email || 'N/A',
        'Phone': user?.phone_number || 'N/A',
        'Total Businesses': user?.totalBusinesses || 0,
        'Businesses': (user?.memberships || []).map(m => m?.business_name).filter(Boolean).join('; ') || 'No Business',
        'Business Codes': (user?.memberships || []).map(m => m?.business_code).filter(Boolean).join('; ') || 'N/A',
        'Join Date': user?.created_at ? formatDate(user.created_at) : 'N/A',
        'Total Points': user?.totalPoints || 0,
        'Available Points': user?.totalAvailablePoints || 0
      }));

      if (csvData.length === 0) {
        setMessage({ type: 'error', text: 'No users to export' });
        return;
      }

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Users exported successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export users' });
    }
  };

  const getUniqueBusinesses = () => {
    if (!users || !Array.isArray(users)) return [];
    
    const businesses = users
      .flatMap(user => user?.memberships || [])
      .filter(membership => membership?.business_code && membership?.business_name)
      .reduce((acc, membership) => {
        if (!acc.some(b => b.code === membership.business_code)) {
          acc.push({ name: membership.business_name, code: membership.business_code });
        }
        return acc;
      }, [] as { name: string; code: string }[]);
    return businesses;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">All Users</h1>
          <p className="text-text-secondary">Manage and monitor users across all businesses</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportUsers}
            className="flex items-center px-4 py-2 bg-neutral-surface text-text-secondary rounded-md hover:bg-primary-100 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center px-4 py-2 bg-primary text-text-on-primary rounded-md hover:bg-primary-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-md border ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-neutral-card p-6 rounded-lg shadow-sm border border-neutral-border">
          <div className="flex items-center">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Total Users</p>
              <p className="text-2xl font-bold text-text-primary">{users?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-card p-6 rounded-lg shadow-sm border border-neutral-border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">With Business</p>
              <p className="text-2xl font-bold text-text-primary">
                {users?.filter(user => (user?.memberships || []).length > 0).length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-card p-6 rounded-lg shadow-sm border border-neutral-border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Avg Points</p>
              <p className="text-2xl font-bold text-text-primary">
                {Math.round((users?.reduce((acc, user) => acc + (user?.totalPoints || 0), 0) || 0) / (users?.length || 1))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-card p-6 rounded-lg shadow-sm border border-neutral-border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-text-secondary">Total Memberships</p>
              <p className="text-2xl font-bold text-text-primary">
                {users?.reduce((acc, user) => acc + (user?.memberships?.length || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-neutral-card rounded-lg shadow-sm border border-neutral-border p-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-light" />
            <input
              type="text"
              placeholder="Search users by name, email, or business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          
          {/* Business Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-text-light" />
            <select
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="all">All Businesses</option>
              <option value="no-business">No Business</option>
              {getUniqueBusinesses().map(business => (
                <option key={business.code} value={business.code}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'joinDate' | 'points' | 'business')}
              className="px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="joinDate">Join Date</option>
              <option value="name">Name</option>
              <option value="points">Points</option>
              <option value="business">Business</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-2 border border-neutral-border rounded-md hover:bg-neutral-surface transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-neutral-card rounded-lg shadow-sm border border-neutral-border">
        <div className="p-4 border-b border-neutral-border">
          <h3 className="text-lg font-semibold text-text-primary">
            Users ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-border">
            <thead className="bg-neutral-surface">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Business Memberships
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Total Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-card divide-y divide-neutral-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-surface transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium text-sm">
                          {user.first_name[0]}{user.last_name[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-text-primary">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-text-secondary">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-text-primary">
                      <Mail className="h-4 w-4 mr-2 text-text-light" />
                      <span className="truncate max-w-xs">{user.email}</span>
                    </div>
                    {user.phone_number && (
                      <div className="flex items-center text-sm text-text-secondary mt-1">
                        <Phone className="h-4 w-4 mr-2 text-text-light" />
                        {user.phone_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {(user.memberships || []).length > 0 ? (
                      <div className="space-y-1">
                        {(user.memberships || []).slice(0, 2).map((membership, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-text-primary">{membership?.business_name || 'Unknown'}</div>
                              <div className="text-xs text-text-secondary">{membership?.business_code || 'N/A'}</div>
                            </div>
                            <div className="flex items-center text-xs text-text-secondary">
                              <Star className="h-3 w-3 mr-1 text-yellow-400" />
                              {membership?.total_points || 0}
                            </div>
                          </div>
                        ))}
                        {(user.memberships || []).length > 2 && (
                          <div className="text-xs text-text-light">
                            +{(user.memberships || []).length - 2} more business{(user.memberships || []).length - 2 !== 1 ? 'es' : ''}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-text-light text-sm">No business</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      <span className="text-sm font-medium text-text-primary">{user.totalPoints || 0}</span>
                    </div>
                    <div className="text-xs text-text-secondary">
                      Available: {user.totalAvailablePoints || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-accent hover:text-accent-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Empty state */}
          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-text-light mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No users found</h3>
              <p className="text-text-secondary">
                {searchTerm || businessFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No users have been registered yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllUsers;