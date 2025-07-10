import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Upload, 
  Save, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { apiService } from '../services/api';
import { Business } from '../types';

const BusinessPage: React.FC = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    category: '',
    website: '',
    established: '',
    memberSince: '',
    totalMembers: 0,
    features: [] as string[],
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: ''
    },
    loyaltyBenefits: [] as string[],
    operatingHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true },
    }
  });

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      const response = await apiService.getBusinessInfo();
      if (response.success && response.business) {
        setBusiness(response.business);
        setFormData({
          name: response.business.name || '',
          description: response.business.description || '',
          contactEmail: response.business.contactEmail || '',
          contactPhone: response.business.contactPhone || '',
          address: response.business.address || '',
          category: response.business.category || '',
          website: response.business.website || '',
          established: response.business.established || '',
          memberSince: response.business.memberSince || '',
          totalMembers: response.business.totalMembers || 0,
          features: response.business.features || [],
          socialMedia: response.business.socialMedia || { instagram: '', facebook: '', twitter: '' },
          loyaltyBenefits: response.business.loyaltyBenefits || [],
          operatingHours: response.business.operatingHours || formData.operatingHours,
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load business information' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value }
    }));
  };

  const handleArrayChange = (field: 'features' | 'loyaltyBenefits', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'features' | 'loyaltyBenefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'features' | 'loyaltyBenefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [field]: value
        }
      }
    }));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    try {
      setSaving(true);
      const response = await apiService.uploadLogo(logoFile);
      if (response.success) {
        setBusiness(prev => prev ? { ...prev, logoUrl: response.logoUrl } : null);
        setLogoFile(null);
        setLogoPreview(null);
        setMessage({ type: 'success', text: 'Logo uploaded successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload logo' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      setSaving(true);
      const response = await apiService.deleteLogo();
      if (response.success) {
        setBusiness(prev => prev ? { ...prev, logoUrl: undefined } : null);
        setMessage({ type: 'success', text: 'Logo deleted successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete logo' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Clean and prepare the data before sending
      const cleanedFormData = {
        ...formData,
        // Ensure arrays are properly formatted
        features: formData.features.filter(f => f.trim() !== ''),
        loyaltyBenefits: formData.loyaltyBenefits.filter(b => b.trim() !== ''),
        // Ensure totalMembers is a number
        totalMembers: parseInt(formData.totalMembers.toString()) || 0,
        // Clean empty strings
        category: formData.category?.trim() || null,
        website: formData.website?.trim() || null,
        established: formData.established?.trim() || null,
        memberSince: formData.memberSince?.trim() || null,
        socialMedia: {
          instagram: formData.socialMedia.instagram?.trim() || '',
          facebook: formData.socialMedia.facebook?.trim() || '',
          twitter: formData.socialMedia.twitter?.trim() || ''
        }
      };

      const response = await apiService.updateBusinessInfo(cleanedFormData);
      if (response.success) {
        setBusiness(response.business);
        setMessage({ type: 'success', text: 'Business information updated successfully' });
      }
    } catch (error: any) {
      console.error('Update error:', error);
      let errorMessage = 'Failed to update business information';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
        <p className="text-gray-600">Manage your business information and settings</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logo Upload */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Business Logo
            </h3>
            
            <div className="text-center">
              <div className="mx-auto h-32 w-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {logoPreview || business?.logoUrl ? (
                  <img 
                    src={logoPreview || business?.logoUrl} 
                    alt="Business logo" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-gray-400" />
                )}
              </div>
              
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-sage-300 rounded-md shadow-sm text-sm font-medium text-sage-700 bg-white hover:bg-sage-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </label>
                
                {logoFile && (
                  <button
                    onClick={handleLogoUpload}
                    disabled={isSaving}
                    className="block w-full px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 disabled:opacity-50"
                  >
                    Upload Logo
                  </button>
                )}
                
                {business?.logoUrl && !logoPreview && (
                  <button
                    onClick={handleDeleteLogo}
                    disabled={isSaving}
                    className="block w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 inline mr-2" />
                    Delete Logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Business Information Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                  placeholder="Enter business name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                  placeholder="Brief description of your business"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                  placeholder="contact@business.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Business Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                  placeholder="e.g., Food & Beverage, Retail, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                  placeholder="https://www.yourbusiness.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Established Year
                </label>
                <input
                  type="text"
                  value={formData.established}
                  onChange={(e) => handleInputChange('established', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                  placeholder="2020"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <input
                  type="text"
                  value={formData.memberSince}
                  onChange={(e) => handleInputChange('memberSince', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                  placeholder="2023"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Operating Hours
              </h4>
              
              <div className="space-y-3">
                {days.map((day) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-24">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {day}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!(formData.operatingHours[day as keyof typeof formData.operatingHours] as any).closed}
                        onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                        className="h-4 w-4 text-sage-600 focus:ring-sage-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-600">Open</span>
                    </div>
                    
                    {!(formData.operatingHours[day as keyof typeof formData.operatingHours] as any).closed && (
                      <>
                        <input
                          type="time"
                          value={(formData.operatingHours[day as keyof typeof formData.operatingHours] as any).open}
                          onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={(formData.operatingHours[day as keyof typeof formData.operatingHours] as any).close}
                          onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Social Media</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="text"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                    placeholder="@yourbusiness"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <input
                    type="text"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                    placeholder="Your Business Page"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <input
                    type="text"
                    value={formData.socialMedia.twitter}
                    onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                    placeholder="@yourbusiness"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900">Features & Services</h4>
                <button
                  type="button"
                  onClick={() => addArrayItem('features')}
                  className="px-3 py-1 bg-sage-100 text-sage-700 rounded-md hover:bg-sage-200 text-sm"
                >
                  Add Feature
                </button>
              </div>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayChange('features', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                      placeholder="e.g., Free WiFi, Parking, etc."
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('features', index)}
                      className="px-2 py-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty Benefits */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900">Loyalty Program Benefits</h4>
                <button
                  type="button"
                  onClick={() => addArrayItem('loyaltyBenefits')}
                  className="px-3 py-1 bg-sage-100 text-sage-700 rounded-md hover:bg-sage-200 text-sm"
                >
                  Add Benefit
                </button>
              </div>
              <div className="space-y-2">
                {formData.loyaltyBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleArrayChange('loyaltyBenefits', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                      placeholder="e.g., Earn 1 point per $1 spent"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('loyaltyBenefits', index)}
                      className="px-2 py-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center px-6 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessPage;