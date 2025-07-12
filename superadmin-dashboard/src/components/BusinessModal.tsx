import React, { useState, useEffect } from 'react';
import { X, Building, Mail, Phone, Globe, Calendar, MapPin, Hash, User, Check, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  business?: any;
  onSuccess: () => void;
}

const BusinessModal: React.FC<BusinessModalProps> = ({ isOpen, onClose, business, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
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
    loyaltyBenefits: [] as string[],
    // Admin credentials
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    adminConfirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeError, setCodeError] = useState('');

  const steps = business 
    ? [
        { id: 1, title: 'Basic Info', icon: Building },
        { id: 2, title: 'Contact Details', icon: Mail },
        { id: 3, title: 'Additional Info', icon: Globe }
      ]
    : [
        { id: 1, title: 'Basic Info', icon: Building },
        { id: 2, title: 'Contact Details', icon: Mail },
        { id: 3, title: 'Admin Account', icon: User },
        { id: 4, title: 'Additional Info', icon: Globe }
      ];

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
        loyaltyBenefits: business.loyaltyBenefits || [],
        // Don't show admin fields for editing existing business
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminPassword: '',
        adminConfirmPassword: ''
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
        loyaltyBenefits: [],
        // Admin credentials for new business
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminPassword: '',
        adminConfirmPassword: ''
      });
    }
    setCurrentStep(1);
    setError('');
    setValidationErrors([]);
  }, [business, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors([]);

    // Client-side validation
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('Business name is required');
    }
    
    if (!formData.businessCode.trim()) {
      errors.push('Business code is required');
    } else if (formData.businessCode.length < 3) {
      errors.push('Business code must be at least 3 characters');
    }

    // Validate email format if provided
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.push('Please enter a valid email address');
    }

    // Validate website format if provided
    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      errors.push('Please enter a valid website URL (include http:// or https://)');
    }

    // Validate admin credentials for new business
    if (!business) {
      if (!formData.adminFirstName.trim()) {
        errors.push('Admin first name is required');
      }
      
      if (!formData.adminLastName.trim()) {
        errors.push('Admin last name is required');
      }
      
      if (!formData.adminEmail.trim()) {
        errors.push('Admin email is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
        errors.push('Please enter a valid admin email address');
      }
      
      if (!formData.adminPassword.trim()) {
        errors.push('Admin password is required');
      } else if (formData.adminPassword.length < 6) {
        errors.push('Admin password must be at least 6 characters');
      }
      
      if (formData.adminPassword !== formData.adminConfirmPassword) {
        errors.push('Admin passwords do not match');
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('superadmin_token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      // Clean up the data before sending
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

      if (business) {
        await axios.put(`http://localhost:3001/api/superadmin/businesses/${business.id}`, cleanedData, config);
      } else {
        await axios.post('http://localhost:3001/api/superadmin/businesses', cleanedData, config);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving business:', error);
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Handle Sequelize validation errors
        setValidationErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to save business. Please check your information and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
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
      // Add random numbers to reach 5 characters
      const needed = 5 - cleaned.length;
      let code = cleaned;
      for (let i = 0; i < needed; i++) {
        code += Math.floor(Math.random() * 10);
      }
      return code;
    } else {
      // Too short, generate random
      return generateRandomCode();
    }
  };

  // Check if code exists
  const checkCodeExists = async (code: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const response = await axios.get('http://localhost:3001/api/superadmin/businesses', config);
      if (response.data.success) {
        const businesses = response.data.data.businesses;
        return businesses.some((business: any) => 
          business.businessCode === code && business.id !== business?.id
        );
      }
      return false;
    } catch (error) {
      console.error('Error checking code:', error);
      return false;
    }
  };

  // Auto-generate unique business code
  const generateUniqueCode = async (baseName?: string) => {
    setGeneratingCode(true);
    setCodeError('');
    
    try {
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        let newCode: string;
        
        if (baseName && attempts === 0) {
          // First attempt: try to generate from business name
          newCode = generateCodeFromName(baseName);
        } else {
          // Subsequent attempts: generate random codes
          newCode = generateRandomCode();
        }
        
        const exists = await checkCodeExists(newCode);
        
        if (!exists) {
          setFormData(prev => ({
            ...prev,
            businessCode: newCode
          }));
          setGeneratingCode(false);
          return;
        }
        
        attempts++;
      }
      
      // If we get here, we couldn't generate a unique code
      setCodeError('Unable to generate unique code. Please enter manually.');
    } catch (error) {
      console.error('Error generating code:', error);
      setCodeError('Error generating code. Please try again.');
    } finally {
      setGeneratingCode(false);
    }
  };

  // Auto-generate code when business name changes (but only for new businesses)
  useEffect(() => {
    if (!business && formData.name.trim() && !formData.businessCode.trim()) {
      const timeoutId = setTimeout(() => {
        generateUniqueCode(formData.name);
      }, 500); // Debounce for 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData.name, business]);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.businessCode.trim();
      case 2:
        return true; // Contact details are optional
      case 3:
        if (business) {
          // For editing: step 3 is Additional Info
          return true; // Additional info is optional
        } else {
          // For new business: step 3 is Admin Account
          return formData.adminFirstName.trim() && 
                 formData.adminLastName.trim() && 
                 formData.adminEmail.trim() && 
                 formData.adminPassword.trim() && 
                 formData.adminPassword === formData.adminConfirmPassword &&
                 formData.adminPassword.length >= 6;
        }
      case 4:
        return true; // Additional info is optional (only for new business)
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {business ? 'Edit Business' : 'Create New Business'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {business ? 'Update business information' : 'Add a new business to your loyalty program'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      isCompleted ? 'bg-accent text-text-on-primary' : 
                      isActive ? 'bg-primary text-text-on-primary' : 'bg-primary-200 text-text-secondary'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-text-primary' : 'text-text-secondary'
                      }`}>
                        Step {step.id}
                      </p>
                      <p className={`text-xs ${
                        isActive ? 'text-text-secondary' : 'text-text-light'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-4 ${
                      currentStep > step.id ? 'bg-accent' : 'bg-neutral-border'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium mb-2">Please fix the following issues:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-red-700 text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-gray-600" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                        placeholder="Enter business name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
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
                          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all uppercase"
                          placeholder="Auto-generated"
                        />
                        <button
                          type="button"
                          onClick={() => generateUniqueCode(formData.name)}
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
                      {codeError && (
                        <p className="text-xs text-red-600 mt-1">{codeError}</p>
                      )}
                      {!business && formData.businessCode && !generatingCode && !codeError && (
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Code auto-generated and verified as unique
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Brief description of your business"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                      >
                        <option value="">Select category</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Retail">Retail</option>
                        <option value="Beauty & Wellness">Beauty & Wellness</option>
                        <option value="Fitness">Fitness</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Services">Services</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Established
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="established"
                          value={formData.established}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                          placeholder="2020"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-gray-600" />
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Contact Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                          placeholder="contact@business.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Contact Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="123 Main Street, City, State 12345"
                      />
                    </div>
                  </div>

                  <div>
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                        placeholder="https://www.business.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Admin Account (only for new business) */}
            {currentStep === 3 && !business && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-gray-600" />
                    Business Admin Account
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Create an admin account for this business. This person will be able to log into the business admin dashboard 
                    to manage customers, loyalty programs, and business settings.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="adminFirstName"
                        value={formData.adminFirstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                        placeholder="Enter first name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="adminLastName"
                        value={formData.adminLastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div>
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                        placeholder="admin@business.com"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This email will be used to log into the business admin dashboard
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="adminPassword"
                        value={formData.adminPassword}
                        onChange={handleInputChange}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                        placeholder="Minimum 6 characters"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        name="adminConfirmPassword"
                        value={formData.adminConfirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>

                  {formData.adminPassword && formData.adminConfirmPassword && (
                    <div className={`p-3 rounded-lg ${
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
                            <X className="h-4 w-4 mr-2" />
                            Passwords do not match
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Admin Dashboard Access</h4>
                        <p className="text-sm text-blue-700">
                          Once created, this admin will be able to access the business dashboard at{' '}
                          <span className="font-mono bg-blue-100 px-1 rounded">loyalty-admin-web</span> to manage 
                          customers, create coupons, set up loyalty tiers, and customize the business theme.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info Step */}
            {((business && currentStep === 3) || (!business && currentStep === 4)) && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-gray-600" />
                    Social Media & Additional Info
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Social Media Profiles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Instagram
                        </label>
                        <input
                          type="text"
                          value={formData.socialMedia.instagram}
                          onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all text-sm"
                          placeholder="@username"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Facebook
                        </label>
                        <input
                          type="text"
                          value={formData.socialMedia.facebook}
                          onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all text-sm"
                          placeholder="facebook.com/page"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Twitter
                        </label>
                        <input
                          type="text"
                          value={formData.socialMedia.twitter}
                          onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all text-sm"
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Check className="h-4 w-4 text-blue-600 mr-2" />
                      <h4 className="text-sm font-medium text-blue-900">Ready to Create</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      You've completed all the necessary information. Click "Create Business" to add this business to your loyalty program.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center px-4 py-2 text-sm font-medium text-text-secondary bg-neutral-card border border-neutral-border rounded-lg hover:bg-neutral-surface transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-text-secondary bg-neutral-card border border-neutral-border rounded-lg hover:bg-neutral-surface transition-colors"
                >
                  Cancel
                </button>
                
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      canProceedToNextStep()
                        ? 'text-text-on-primary bg-primary hover:bg-primary-600'
                        : 'text-text-light bg-primary-200 cursor-not-allowed'
                    }`}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                      loading
                        ? 'text-text-light bg-primary-200 cursor-not-allowed'
                        : 'text-text-on-primary bg-primary hover:bg-primary-600'
                    }`}
                  >
                    {loading ? 'Saving...' : business ? 'Update Business' : 'Create Business'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessModal;