import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, Calendar, Building, User } from 'lucide-react';
import axios from 'axios';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  created_at: string;
  business_name: string;
  business_code: string;
  joined_business_at: string;
  points: number;
}

const AllUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.business_name && user.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/superadmin/users');
      if (response.data.success) {
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Users</h1>
        <p className="text-gray-600">Manage and monitor users across all businesses</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            {/* User Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-sm">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {user.first_name} {user.last_name}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="h-3 w-3 mr-1" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-3">
              {/* Phone */}
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <span>{user.phone_number || 'No phone'}</span>
              </div>

              {/* Joined Date */}
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>

              {/* Business */}
              {user.business_name ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Building className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{user.business_name}</span>
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                    {user.business_code}
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-500">
                  <Building className="h-4 w-4 mr-2 text-gray-400" />
                  <span>No business</span>
                </div>
              )}

              {/* Points */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Points</span>
                  <span className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-medium">
                    {user.points || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default AllUsers;