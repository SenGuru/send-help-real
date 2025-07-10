import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, Calendar, Building } from 'lucide-react';
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
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        marginBottom: '32px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 'var(--border-radius)',
        padding: '32px',
        boxShadow: 'var(--card-shadow)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: '800', 
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 8px 0'
        }}>
          👥 All Users
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#6b7280', 
          margin: 0,
          fontWeight: '500'
        }}>
          Manage and monitor users across all businesses
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ 
        marginBottom: '32px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 'var(--border-radius)',
        padding: '24px',
        boxShadow: 'var(--card-shadow)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <Search style={{ 
            position: 'absolute', 
            left: '20px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            height: '20px', 
            width: '20px', 
            color: '#9ca3af' 
          }} />
          <input
            type="text"
            placeholder="Search users by name, email, or business..."
            style={{
              width: '100%',
              paddingLeft: '52px',
              paddingRight: '20px',
              paddingTop: '16px',
              paddingBottom: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              outline: 'none',
              fontSize: '16px',
              background: '#f9fafb',
              transition: 'var(--transition)'
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.background = 'white';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.background = '#f9fafb';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Users Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {filteredUsers.map((user, index) => (
          <div
            key={user.id}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 'var(--border-radius)',
              padding: '24px',
              boxShadow: 'var(--card-shadow)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'var(--transition)',
              position: 'relative',
              overflow: 'hidden',
              animationDelay: `${index * 0.05}s`
            }}
            className="animate-fade-in"
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.transform = 'translateY(-4px)';
              target.style.boxShadow = 'var(--card-shadow-hover)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = 'var(--card-shadow)';
            }}
          >
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '100px',
              height: '100px',
              background: 'var(--primary-gradient)',
              borderRadius: '50%',
              opacity: 0.05
            }} />
            
            {/* User Avatar and Basic Info */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'var(--primary-gradient)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}>
                <span style={{ 
                  color: 'white', 
                  fontWeight: '700', 
                  fontSize: '18px' 
                }}>
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {user.first_name} {user.last_name}
                </h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '14px', 
                  color: '#6b7280' 
                }}>
                  <Mail style={{ height: '14px', width: '14px', marginRight: '6px' }} />
                  {user.email}
                </div>
              </div>
            </div>
            
            {/* User Details */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#0369a1',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  <Phone style={{ height: '12px', width: '12px', marginRight: '4px' }} />
                  PHONE
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                  {user.phone_number || 'Not provided'}
                </div>
              </div>
              
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#166534',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  <Calendar style={{ height: '12px', width: '12px', marginRight: '4px' }} />
                  JOINED
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                  {formatDate(user.created_at)}
                </div>
              </div>
            </div>
            
            {/* Business Info */}
            {user.business_name ? (
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
                borderRadius: '12px',
                marginBottom: '12px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#92400e'
                  }}>
                    <Building style={{ height: '16px', width: '16px', marginRight: '6px' }} />
                    {user.business_name}
                  </div>
                  <span style={{
                    padding: '4px 8px',
                    background: 'var(--warning-gradient)',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {user.business_code}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#92400e' }}>
                  Member since {formatDate(user.joined_business_at)}
                </div>
              </div>
            ) : (
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '12px',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                  🏢 No business associated
                </div>
              </div>
            )}
            
            {/* Points Badge */}
            <div style={{
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div style={{
                padding: '8px 16px',
                background: 'var(--secondary-gradient)',
                borderRadius: '20px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)'
              }}>
                🏆 {user.points || 0} Points
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 'var(--border-radius)',
          padding: '64px 32px',
          textAlign: 'center',
          boxShadow: 'var(--card-shadow)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔍</div>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            No users found
          </h3>
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280', 
            margin: 0 
          }}>
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default AllUsers;