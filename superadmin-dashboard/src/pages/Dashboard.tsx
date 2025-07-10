import React, { useState, useEffect } from 'react';
import { Users, Building, CreditCard, Award } from 'lucide-react';
import axios from 'axios';
import BusinessModal from '../components/BusinessModal';

interface Stats {
  totalUsers: number;
  totalBusinesses: number;
  totalTransactions: number;
  totalPoints: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateBusinessModal, setShowCreateBusinessModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/superadmin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      name: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'var(--primary-600)',
      bgColor: 'var(--primary-50)'
    },
    {
      name: 'Total Businesses',
      value: stats?.totalBusinesses || 0,
      icon: Building,
      color: 'var(--purple-600)',
      bgColor: 'var(--purple-50)'
    },
    {
      name: 'Total Transactions',
      value: stats?.totalTransactions || 0,
      icon: CreditCard,
      color: 'var(--orange-600)',
      bgColor: 'var(--orange-50)'
    },
    {
      name: 'Total Points',
      value: stats?.totalPoints || 0,
      icon: Award,
      color: 'var(--green-600)',
      bgColor: 'var(--green-50)'
    },
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '256px' 
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ 
        marginBottom: '24px'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: 'var(--gray-900)',
          margin: '0 0 8px 0'
        }}>
          Dashboard Overview
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: 'var(--gray-600)', 
          margin: 0
        }}>
          Real-time insights across your entire loyalty ecosystem
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {statItems.map((item) => (
          <div
            key={item.name}
            style={{
              backgroundColor: item.bgColor,
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--gray-200)',
              transition: 'all 0.2s ease'
            }}
            className="animate-fade-in"
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.transform = 'translateY(-2px)';
              target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  backgroundColor: item.color,
                  padding: '12px',
                  borderRadius: '8px'
                }}>
                  <item.icon style={{ height: '24px', width: '24px', color: 'white' }} />
                </div>
              </div>
              <div style={{ marginLeft: '16px', flex: 1 }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: 'var(--gray-500)', 
                  margin: '0 0 4px 0'
                }}>
                  {item.name}
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: 'var(--gray-900)'
                }}>
                  {item.value.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '24px' 
      }}>
        {/* Quick Actions Card */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--gray-200)'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--gray-900)', 
            margin: '0 0 16px 0'
          }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: 'var(--primary-50)',
              border: 'none',
              borderRadius: '6px',
              color: 'var(--primary-700)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'var(--primary-100)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'var(--primary-50)';
            }}>
              View All Users
            </button>
            <button style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: 'var(--purple-50)',
              border: 'none',
              borderRadius: '6px',
              color: 'var(--purple-700)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'var(--purple-100)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'var(--purple-50)';
            }}>
              View All Businesses
            </button>
            <button style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: 'var(--orange-50)',
              border: 'none',
              borderRadius: '6px',
              color: 'var(--orange-700)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'var(--orange-100)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'var(--orange-50)';
            }}>
              System Analytics
            </button>
            <button style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: 'var(--green-50)',
              border: 'none',
              borderRadius: '6px',
              color: 'var(--green-700)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'var(--green-100)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'var(--green-50)';
            }}
            onClick={() => setShowCreateBusinessModal(true)}>
              Create New Business
            </button>
          </div>
        </div>

        {/* System Health Card */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--gray-200)'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--gray-900)', 
            margin: '0 0 16px 0'
          }}>
            System Health
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>API Status</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: 'var(--green-100)',
                color: 'var(--green-800)'
              }}>
                Healthy
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>Database</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: 'var(--green-100)',
                color: 'var(--green-800)'
              }}>
                Connected
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>Last Backup</span>
              <span style={{ fontSize: '14px', color: 'var(--gray-900)' }}>2 hours ago</span>
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