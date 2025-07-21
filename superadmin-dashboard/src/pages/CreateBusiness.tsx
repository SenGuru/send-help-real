import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar, 
  Hash,
  Check,
  AlertCircle,
  RefreshCw,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';

interface FormData {
  // Business Info
  name: string;
  businessCode: string;
  description: string;
  category: string;
  established: string;
  
  // Contact Info
  contactEmail: string;
  contactPhone: string;
  address: string;
  website: string;
  
  // Admin Account
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  adminConfirmPassword: string;
}

const CreateBusiness: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    businessCode: '',
    description: '',
    category: '',
    established: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    website: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    adminConfirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const categories = [
    'Restaurant',
    'Retail',
    'Beauty & Wellness',
    'Fitness',
    'Entertainment',
    'Services',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  // Generate a random business code
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Generate business code from name
  const generateCodeFromName = (name: string) => {
    const cleaned = name.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length >= 5) {
      return cleaned.substring(0, 5);
    } else if (cleaned.length >= 3) {
      const needed = 5 - cleaned.length;
      let code = cleaned;
      for (let i = 0; i < needed; i++) {
        code += Math.floor(Math.random() * 10);
      }
      return code;
    } else {
      return generateRandomCode();
    }
  };

  const generateUniqueCode = async () => {
    setGeneratingCode(true);
    
    try {
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        let newCode: string;
        
        if (formData.name && attempts === 0) {
          newCode = generateCodeFromName(formData.name);
        } else {
          newCode = generateRandomCode();
        }
        
        // Check if code exists
        const token = localStorage.getItem('superadmin_token');
        const response = await axios.get('http://localhost:3001/api/superadmin/businesses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.success) {
          const businesses = response.data.data.businesses;
          const exists = businesses.some((business: any) => business.businessCode === newCode);
          
          if (!exists) {
            setFormData(prev => ({ ...prev, businessCode: newCode }));
            setGeneratingCode(false);
            return;
          }
        }
        
        attempts++;
      }
      
      setError('Unable to generate unique code. Please enter manually.');
    } catch (error) {
      console.error('Error generating code:', error);
      setError('Error generating code. Please try again.');
    } finally {
      setGeneratingCode(false);
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    // Business validation
    if (!formData.name.trim()) errors.push('Business name is required');
    if (!formData.businessCode.trim()) errors.push('Business code is required');
    else if (formData.businessCode.length < 3) errors.push('Business code must be at least 3 characters');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      errors.push('Please enter a valid contact email address');
    }
    
    // Website validation
    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      errors.push('Please enter a valid website URL (include http:// or https://)');
    }
    
    // Admin validation
    if (!formData.adminFirstName.trim()) errors.push('Admin first name is required');
    if (!formData.adminLastName.trim()) errors.push('Admin last name is required');
    if (!formData.adminEmail.trim()) errors.push('Admin email is required');
    else if (!emailRegex.test(formData.adminEmail)) errors.push('Please enter a valid admin email address');
    if (!formData.adminPassword.trim()) errors.push('Admin password is required');
    else if (formData.adminPassword.length < 6) errors.push('Admin password must be at least 6 characters');
    if (formData.adminPassword !== formData.adminConfirmPassword) errors.push('Admin passwords do not match');
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors([]);
    setSuccess(false);

    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('superadmin_token');
      const cleanedData = {
        ...formData,
        name: formData.name.trim(),
        businessCode: formData.businessCode.trim().toUpperCase(),
        contactEmail: formData.contactEmail.trim() || null,
        contactPhone: formData.contactPhone.trim() || null,
        address: formData.address.trim() || null,
        category: formData.category.trim() || null,
        website: formData.website.trim() || null,
        established: formData.established.trim() || null,
        description: formData.description.trim() || null
      };

      await axios.post('http://localhost:3001/api/superadmin/businesses', cleanedData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        businessCode: '',
        description: '',
        category: '',
        established: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        website: '',
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminPassword: '',
        adminConfirmPassword: ''
      });
      
    } catch (error: any) {
      console.error('Error creating business:', error);
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        setValidationErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to create business. Please check your information and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-12 h-12 bg-sage-500 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Create New Business</h1>
            <p className="text-gray-600">Add a new business to your loyalty program with admin account</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-900">Business Created Successfully!</h3>
              <p className="text-sm text-green-700 mt-1">
                The business and admin account have been created. The admin can now log in to manage their business.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-900 mb-2">Please fix the following issues:</h3>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Business Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Building2 className="h-5 w-5 text-sage-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Code *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="businessCode"
                  value={formData.businessCode}
                  onChange={handleInputChange}
                  required
                  maxLength={5}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent outline-none transition-all uppercase"
                  placeholder="Auto-generated"
                />
                <button
                  type="button"
                  onClick={generateUniqueCode}
                  disabled={generatingCode}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Generate new code"
                >
                  <RefreshCw className={`h-4 w-4 ${generatingCode ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {generatingCode && (
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Generating unique code...
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Brief description of your business"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Established
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="established"
                  value={formData.established}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent outline-none transition-all"
                  placeholder="2020"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Mail className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="contact@business.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="123 Main Street, City, State 12345"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="https://www.business.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Account */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Shield className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Business Admin Account</h2>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <User className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-purple-900 mb-1">Admin Dashboard Access</h4>
                <p className="text-sm text-purple-700">
                  This admin will be able to access the business dashboard to manage customers, 
                  create coupons, set up loyalty tiers, and customize the business theme.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="adminFirstName"
                value={formData.adminFirstName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="adminLastName"
                value={formData.adminLastName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter last name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="admin@business.com"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This email will be used to log into the business admin dashboard
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="adminConfirmPassword"
                  value={formData.adminConfirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {formData.adminPassword && formData.adminConfirmPassword && (
              <div className={`md:col-span-2 p-3 rounded-lg ${
                formData.adminPassword === formData.adminConfirmPassword 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm flex items-center ${
                  formData.adminPassword === formData.adminConfirmPassword 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }`}>
                  {formData.adminPassword === formData.adminConfirmPassword ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Passwords do not match
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Ready to create?</h3>
              <p className="text-sm text-gray-600">This will create the business and admin account immediately.</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-sage-500 text-white hover:bg-sage-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Create Business
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBusiness;