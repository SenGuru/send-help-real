import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  business?: any;
  onSuccess: () => void;
}

const BusinessModal: React.FC<BusinessModalProps> = ({ isOpen, onClose, business, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    businessCode: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    category: '',
    website: '',
    established: '',
    features: [] as string[],
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: ''
    },
    loyaltyBenefits: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        businessCode: business.businessCode || '',
        description: business.description || '',
        contactEmail: business.contactEmail || '',
        contactPhone: business.contactPhone || '',
        address: business.address || '',
        category: business.category || '',
        website: business.website || '',
        established: business.established || '',
        features: business.features || [],
        socialMedia: business.socialMedia || {
          instagram: '',
          facebook: '',
          twitter: ''
        },
        loyaltyBenefits: business.loyaltyBenefits || []
      });
    } else {
      // Reset form for new business
      setFormData({
        name: '',
        businessCode: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        category: '',
        website: '',
        established: '',
        features: [],
        socialMedia: {
          instagram: '',
          facebook: '',
          twitter: ''
        },
        loyaltyBenefits: []
      });
    }
    setError('');
  }, [business, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('superadmin_token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      if (business) {
        // Update existing business
        await axios.put(`http://localhost:3001/api/superadmin/businesses/${business.id}`, formData, config);
      } else {
        // Create new business
        await axios.post('http://localhost:3001/api/superadmin/businesses', formData, config);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving business:', error);
      setError(error.response?.data?.message || 'Failed to save business');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        margin: '20px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px',
          borderBottom: '1px solid var(--gray-200)'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'var(--gray-900)'
          }}>
            {business ? 'Edit Business' : 'Create New Business'}
          </h2>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} color="var(--gray-600)" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              backgroundColor: 'var(--red-50)',
              border: '1px solid var(--red-200)',
              color: 'var(--red-700)',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--gray-700)'
              }}>
                Business Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--gray-700)'
              }}>
                Business Code *
              </label>
              <input
                type="text"
                name="businessCode"
                value={formData.businessCode}
                onChange={handleInputChange}
                required
                maxLength={5}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  textTransform: 'uppercase'
                }}
                placeholder="e.g., SHOP1"
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--gray-700)'
            }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--gray-300)',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--gray-700)'
              }}>
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--gray-700)'
              }}>
                Contact Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--gray-700)'
            }}>
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={2}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--gray-300)',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--gray-700)'
              }}>
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="e.g., Restaurant"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--gray-700)'
              }}>
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--gray-700)'
              }}>
                Established
              </label>
              <input
                type="text"
                name="established"
                value={formData.established}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="2020"
              />
            </div>
          </div>

          {/* Social Media */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--gray-900)',
              marginBottom: '16px'
            }}>
              Social Media
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--gray-700)'
                }}>
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="@username"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--gray-700)'
                }}>
                  Facebook
                </label>
                <input
                  type="text"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="facebook.com/page"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--gray-700)'
                }}>
                  Twitter
                </label>
                <input
                  type="text"
                  value={formData.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '24px',
            borderTop: '1px solid var(--gray-200)'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                border: '1px solid var(--gray-300)',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: 'var(--gray-700)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: loading ? 'var(--gray-400)' : 'var(--primary-600)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : business ? 'Update Business' : 'Create Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessModal;