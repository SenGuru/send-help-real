import React, { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Users, Building, Calendar, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface DailyRegistration {
  date: string;
  count: number;
}

interface BusinessUserCount {
  business_name: string;
  business_code: string;
  user_count: number;
}

interface WeeklyGrowth {
  thisWeek: number;
  lastWeek: number;
  percentageChange: string;
}

interface UserAnalytics {
  dailyRegistrations: DailyRegistration[];
  usersByBusiness: BusinessUserCount[];
  weeklyGrowth: WeeklyGrowth;
}

const UserAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await axios.get('http://localhost:3001/api/superadmin/user-analytics?days=30');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-sage-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const maxDailyCount = Math.max(...(analytics?.dailyRegistrations || []).map(d => d.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
            <p className="text-gray-600">Deep insights into user registration patterns and growth trends</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center px-4 py-2 bg-sage-600 text-white rounded-lg font-medium transition-colors ${
              refreshing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-sage-700'
            }`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Weekly Growth Summary */}
      {analytics?.weeklyGrowth && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-sage-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Weekly Growth Summary
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <div className="text-sm font-medium text-blue-700 mb-2">
                This Week
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {analytics.weeklyGrowth.thisWeek}
              </div>
              <div className="text-xs text-gray-600">
                new users
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Last Week
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {analytics.weeklyGrowth.lastWeek}
              </div>
              <div className="text-xs text-gray-600">
                new users
              </div>
            </div>
            
            <div className={`rounded-lg p-6 ${
              parseFloat(analytics.weeklyGrowth.percentageChange) >= 0 
                ? 'bg-gradient-to-br from-green-50 to-green-100'
                : 'bg-gradient-to-br from-red-50 to-red-100'
            }`}>
              <div className={`text-sm font-medium mb-2 ${
                parseFloat(analytics.weeklyGrowth.percentageChange) >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                Growth Rate
              </div>
              <div className={`text-3xl font-bold ${
                parseFloat(analytics.weeklyGrowth.percentageChange) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {parseFloat(analytics.weeklyGrowth.percentageChange) >= 0 ? '+' : ''}{analytics.weeklyGrowth.percentageChange}%
              </div>
              <div className={`text-xs ${
                parseFloat(analytics.weeklyGrowth.percentageChange) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                vs last week
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Registrations Chart */}
      {analytics?.dailyRegistrations && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <BarChart className="h-5 w-5 text-sage-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Daily User Registrations (Last 30 Days)
            </h3>
          </div>
          
          <div className="h-64 flex items-end justify-between space-x-1 mb-4">
            {analytics.dailyRegistrations.slice().reverse().map((day) => (
              <div
                key={day.date}
                className="flex flex-col items-center flex-1 max-w-8"
                title={`${day.count} users on ${new Date(day.date).toLocaleDateString()}`}
              >
                <div className="text-xs font-medium text-gray-700 mb-1">
                  {day.count > 0 ? day.count : ''}
                </div>
                <div
                  className="w-full bg-sage-500 rounded-t transition-all duration-300"
                  style={{
                    height: `${maxDailyCount > 0 ? (day.count / maxDailyCount) * 200 : 0}px`,
                    minHeight: day.count > 0 ? '4px' : '0px'
                  }}
                />
                <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-center whitespace-nowrap">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users by Business */}
      {analytics?.usersByBusiness && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Building className="h-5 w-5 text-sage-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Users by Business
            </h3>
          </div>
          
          <div className="space-y-4">
            {analytics.usersByBusiness.map((business) => (
              <div
                key={business.business_code}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">
                    {business.business_name}
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {business.business_code}
                    </span>
                  </div>
                </div>
                <div className="flex items-center bg-sage-100 px-3 py-2 rounded-full">
                  <Users className="h-4 w-4 text-sage-600 mr-2" />
                  <span className="font-bold text-sage-700">
                    {business.user_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnalytics;