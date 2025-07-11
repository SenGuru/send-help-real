import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  TrendingUp, 
  Award, 
  Clock, 
  UserPlus, 
  Activity,
  DollarSign 
} from 'lucide-react';
import axios from 'axios';
import BusinessModal from '../components/BusinessModal';

interface Stats {
  totalUsers: number;
  totalBusinesses: number;
  totalTransactions: number;
  totalPoints: number;
  usersToday: number;
  usersThisWeek: number;
  usersThisMonth: number;
}

interface RecentUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  business_name?: string;
  business_code?: string;
}

interface RecentActivity {
  recentUsers: RecentUser[];
  recentMemberships: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateBusinessModal, setShowCreateBusinessModal] = useState(false);

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds for real-time monitoring
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        axios.get('http://localhost:3001/api/superadmin/stats'),
        axios.get('http://localhost:3001/api/superadmin/recent-activities?limit=5')
      ]);
      
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
      
      if (activityResponse.data.success) {
        setRecentActivity(activityResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = fetchData; // Keep for backward compatibility

  const statItems = [
    {
      name: 'Total Users',
      value: stats?.totalUsers || 0,
      change: `+${stats?.usersThisMonth || 0}`,
      changeType: 'increase' as const,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'New Users Today',
      value: stats?.usersToday || 0,
      change: `${stats?.usersThisWeek || 0} this week`,
      changeType: 'neutral' as const,
      icon: UserPlus,
      color: 'bg-green-500'
    },
    {
      name: 'Total Businesses',
      value: stats?.totalBusinesses || 0,
      change: '',
      changeType: 'neutral' as const,
      icon: Building,
      color: 'bg-sage-500'
    },
    {
      name: 'Total Points',
      value: stats?.totalPoints || 0,
      change: '',
      changeType: 'neutral' as const,
      icon: Award,
      color: 'bg-purple-500'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-sage-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Monitor your entire loyalty ecosystem.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value.toLocaleString()}</p>
                  {stat.change && (
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent User Activity */}
      {recentActivity && recentActivity.recentUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-sage-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Recent User Registrations
              </h3>
            </div>
            <div className="flex items-center px-2 py-1 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <span className="text-xs font-medium text-green-700">
                Live
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            {recentActivity.recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-sage-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name} registered
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(user.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {user.business_name && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="text-sage-600 font-medium">
                          {user.business_code}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 text-left bg-sage-50 hover:bg-sage-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-sage-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">View All Users</span>
              </div>
              <span className="text-sage-600">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">View All Businesses</span>
              </div>
              <span className="text-blue-600">→</span>
            </button>
            <button 
              onClick={() => window.location.href = '/analytics'}
              className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">User Analytics</span>
              </div>
              <span className="text-purple-600">→</span>
            </button>
            <button 
              onClick={() => setShowCreateBusinessModal(true)}
              className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Building className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Create New Business</span>
              </div>
              <span className="text-green-600">→</span>
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm text-gray-900">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Modal */}
      <BusinessModal
        isOpen={showCreateBusinessModal}
        onClose={() => setShowCreateBusinessModal(false)}
        onSuccess={() => {
          fetchStats(); // Refresh stats after creating business
        }}
      />
    </div>
  );
};

export default Dashboard;