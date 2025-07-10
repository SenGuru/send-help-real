import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Ticket, 
  TrendingUp, 
  DollarSign,
  Activity,
  Clock,
  Trophy,
  Building2
} from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  color: string;
}

const DashboardPage: React.FC = () => {
  const [stats] = useState<StatCard[]>([
    {
      title: 'Total Users',
      value: '2,345',
      change: '+12.5%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Coupons',
      value: '24',
      change: '+3',
      changeType: 'increase',
      icon: Ticket,
      color: 'bg-green-500'
    },
    {
      title: 'Monthly Revenue',
      value: '$45,230',
      change: '+8.2%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'bg-sage-500'
    },
    {
      title: 'Transactions',
      value: '1,234',
      change: '+5.1%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ]);

  const recentActivity = [
    { action: 'New user registered', user: 'John Doe', time: '2 minutes ago', type: 'user' },
    { action: 'Coupon "SAVE20" was used', user: 'Jane Smith', time: '5 minutes ago', type: 'coupon' },
    { action: 'User reached Gold tier', user: 'Mike Johnson', time: '10 minutes ago', type: 'ranking' },
    { action: 'Business info updated', user: 'Admin', time: '1 hour ago', type: 'business' },
    { action: 'New coupon created', user: 'Admin', time: '2 hours ago', type: 'coupon' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4 text-blue-500" />;
      case 'coupon': return <Ticket className="h-4 w-4 text-green-500" />;
      case 'ranking': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'business': return <Building2 className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your loyalty program.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 
                      stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 text-left bg-sage-50 hover:bg-sage-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Ticket className="h-5 w-5 text-sage-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Create New Coupon</span>
              </div>
              <span className="text-sage-600">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Add Ranking Tier</span>
              </div>
              <span className="text-blue-600">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Update Business Info</span>
              </div>
              <span className="text-purple-600">→</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-sage-600 hover:text-sage-700">View all</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user}</p>
                </div>
                <div className="flex-shrink-0 flex items-center text-xs text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Coupons</h3>
          <div className="space-y-3">
            {[
              { name: 'SAVE20', usage: '89%', uses: '234/250' },
              { name: 'WELCOME10', usage: '76%', uses: '152/200' },
              { name: 'LOYAL15', usage: '45%', uses: '90/200' },
            ].map((coupon, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{coupon.name}</p>
                  <p className="text-xs text-gray-500">{coupon.uses} uses</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{coupon.usage}</p>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-sage-500 h-2 rounded-full" 
                      style={{ width: coupon.usage }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution by Tier</h3>
          <div className="space-y-3">
            {[
              { tier: 'Bronze', count: '1,234', percentage: '52%', color: 'bg-orange-500' },
              { tier: 'Silver', count: '789', percentage: '34%', color: 'bg-gray-400' },
              { tier: 'Gold', count: '234', percentage: '10%', color: 'bg-yellow-500' },
              { tier: 'Platinum', count: '88', percentage: '4%', color: 'bg-purple-500' },
            ].map((tier, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${tier.color} mr-3`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tier.tier}</p>
                    <p className="text-xs text-gray-500">{tier.count} users</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{tier.percentage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;