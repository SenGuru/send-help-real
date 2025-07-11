import React, { useState, useEffect } from 'react';
import { Search, Users, Calendar, Building, Edit, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import BusinessModal from '../components/BusinessModal';

interface Business {
  id: number;
  name: string;
  code: string;
  description: string;
  created_at: string;
  user_count: number;
}

const AllBusinesses: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const filtered = businesses.filter(business =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBusinesses(filtered);
  }, [businesses, searchTerm]);

  const fetchBusinesses = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await axios.get('http://localhost:3001/api/superadmin/businesses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setBusinesses(response.data.data.businesses);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (business: Business) => {
    setSelectedBusiness(business);
    setShowModal(true);
  };

  const handleDelete = async (businessId: number) => {
    if (!window.confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(businessId);
    try {
      const token = localStorage.getItem('superadmin_token');
      await axios.delete(`http://localhost:3001/api/superadmin/businesses/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove business from local state
      setBusinesses(prev => prev.filter(b => b.id !== businessId));
    } catch (error: any) {
      console.error('Error deleting business:', error);
      alert(error.response?.data?.message || 'Failed to delete business');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedBusiness(null);
  };

  const handleModalSuccess = () => {
    fetchBusinesses();
    handleModalClose();
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
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--gray-200)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: 'var(--gray-900)',
              margin: '0 0 8px 0'
            }}>
              All Businesses
            </h1>
            <p style={{ 
              fontSize: '16px', 
              color: 'var(--gray-600)', 
              margin: 0
            }}>
              Manage all registered businesses in the system
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: 'var(--primary-600)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'var(--primary-700)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'var(--primary-600)';
            }}
          >
            <Plus size={16} />
            Create Business
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ 
        marginBottom: '24px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--gray-200)'
      }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search style={{ 
            position: 'absolute', 
            left: '16px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            height: '16px', 
            width: '16px', 
            color: 'var(--gray-400)' 
          }} />
          <input
            type="text"
            placeholder="Search businesses..."
            style={{
              width: '100%',
              paddingLeft: '44px',
              paddingRight: '16px',
              paddingTop: '12px',
              paddingBottom: '12px',
              border: '1px solid var(--gray-300)',
              borderRadius: '6px',
              outline: 'none',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-500)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--gray-300)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Businesses Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {filteredBusinesses.map((business, index) => (
          <div 
            key={business.id} 
            style={{ 
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--gray-200)',
              transition: 'all 0.2s ease',
              position: 'relative'
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
            
            {/* Business Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--primary-600)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <Building style={{ height: '20px', width: '20px', color: 'white' }} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: 'var(--gray-900)',
                    margin: '0 0 4px 0'
                  }}>
                    {business.name}
                  </h3>
                  <div style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {business.code}
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEdit(business)}
                  style={{
                    padding: '8px',
                    backgroundColor: 'var(--primary-50)',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'var(--primary-600)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = 'var(--primary-100)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.backgroundColor = 'var(--primary-50)';
                  }}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(business.id)}
                  disabled={deleteLoading === business.id}
                  style={{
                    padding: '8px',
                    backgroundColor: 'var(--red-50)',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'var(--red-600)',
                    cursor: deleteLoading === business.id ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: deleteLoading === business.id ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (deleteLoading !== business.id) {
                      const target = e.target as HTMLElement;
                      target.style.backgroundColor = 'var(--red-100)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (deleteLoading !== business.id) {
                      const target = e.target as HTMLElement;
                      target.style.backgroundColor = 'var(--red-50)';
                    }
                  }}
                >
                  {deleteLoading === business.id ? (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid var(--red-200)',
                      borderTop: '2px solid var(--red-600)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
            
            {/* Description */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--gray-600)', 
                margin: 0, 
                lineHeight: '1.5'
              }}>
                {business.description || 'No description available'}
              </p>
            </div>
            
            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--primary-50)',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: 'var(--primary-600)',
                  fontWeight: '500',
                  marginBottom: '4px'
                }}>
                  <Users style={{ height: '12px', width: '12px', marginRight: '4px' }} />
                  Users
                </div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: 'var(--gray-900)' 
                }}>
                  {business.user_count}
                </div>
              </div>
              
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--green-50)',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: 'var(--green-600)',
                  fontWeight: '500',
                  marginBottom: '4px'
                }}>
                  <Calendar style={{ height: '12px', width: '12px', marginRight: '4px' }} />
                  Created
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '500', 
                  color: 'var(--gray-900)' 
                }}>
                  {formatDate(business.created_at)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBusinesses.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '48px 24px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--gray-200)'
        }}>
          <Building size={48} color="var(--gray-400)" style={{ marginBottom: '16px' }} />
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--gray-900)',
            margin: '0 0 8px 0'
          }}>
            No businesses found
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--gray-600)', 
            margin: 0 
          }}>
            {searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first business'}
          </p>
        </div>
      )}

      {/* Business Modal */}
      <BusinessModal
        isOpen={showModal}
        onClose={handleModalClose}
        business={selectedBusiness}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default AllBusinesses;