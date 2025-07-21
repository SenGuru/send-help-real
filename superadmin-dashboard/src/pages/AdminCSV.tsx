import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Check, 
  AlertCircle, 
  Users, 
  Building2,
  Eye,
  Trash2,
  RefreshCw,
  Info
} from 'lucide-react';
import axios from 'axios';

interface AdminRecord {
  business_handle: string;
  admin_email: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_password: string;
  is_active: boolean;
  created_date: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: string;
}

const AdminCSV: React.FC = () => {
  const [csvData, setCsvData] = useState<AdminRecord[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample CSV template data
  const sampleData: AdminRecord[] = [
    {
      business_handle: '@coffeeshop',
      admin_email: 'admin@coffeeshop.com',
      admin_first_name: 'John',
      admin_last_name: 'Smith',
      admin_password: 'password123',
      is_active: true,
      created_date: '2024-01-15'
    },
    {
      business_handle: '@bookstore',
      admin_email: 'manager@bookstore.com',
      admin_first_name: 'Sarah',
      admin_last_name: 'Johnson',
      admin_password: 'secure456',
      is_active: true,
      created_date: '2024-01-20'
    }
  ];

  const validateAdminRecord = (record: any, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Business handle validation
    if (!record.business_handle || !record.business_handle.startsWith('@')) {
      errors.push({
        row: rowIndex + 1,
        field: 'business_handle',
        message: 'Business handle must start with @ symbol',
        value: record.business_handle || ''
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!record.admin_email || !emailRegex.test(record.admin_email)) {
      errors.push({
        row: rowIndex + 1,
        field: 'admin_email',
        message: 'Valid email address is required',
        value: record.admin_email || ''
      });
    }
    
    // Name validation
    if (!record.admin_first_name || record.admin_first_name.trim().length < 2) {
      errors.push({
        row: rowIndex + 1,
        field: 'admin_first_name',
        message: 'First name must be at least 2 characters',
        value: record.admin_first_name || ''
      });
    }
    
    if (!record.admin_last_name || record.admin_last_name.trim().length < 2) {
      errors.push({
        row: rowIndex + 1,
        field: 'admin_last_name',
        message: 'Last name must be at least 2 characters',
        value: record.admin_last_name || ''
      });
    }
    
    // Password validation
    if (!record.admin_password || record.admin_password.length < 6) {
      errors.push({
        row: rowIndex + 1,
        field: 'admin_password',
        message: 'Password must be at least 6 characters',
        value: record.admin_password || ''
      });
    }
    
    return errors;
  };

  const parseCSV = (csvContent: string): AdminRecord[] => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = [
      'business_handle',
      'admin_email', 
      'admin_first_name',
      'admin_last_name',
      'admin_password',
      'is_active',
      'created_date'
    ];
    
    // Validate headers
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    const records: AdminRecord[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length !== headers.length) continue;
      
      const record: any = {};
      headers.forEach((header, index) => {
        let value = values[index];
        
        // Parse boolean values
        if (header === 'is_active') {
          value = value.toLowerCase() === 'true' || value === '1';
        }
        
        record[header] = value;
      });
      
      records.push(record as AdminRecord);
    }
    
    return records;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors([]);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const records = parseCSV(csvContent);
        
        // Validate all records
        const allErrors: ValidationError[] = [];
        records.forEach((record, index) => {
          const recordErrors = validateAdminRecord(record, index);
          allErrors.push(...recordErrors);
        });
        
        setCsvData(records);
        setValidationErrors(allErrors);
        setShowPreview(true);
        
        if (allErrors.length === 0) {
          setSuccess(`Successfully parsed ${records.length} admin records. Ready to import.`);
        } else {
          setError(`Found ${allErrors.length} validation errors. Please fix them before importing.`);
        }
        
      } catch (err: any) {
        setError(`Error parsing CSV: ${err.message}`);
        setCsvData([]);
      } finally {
        setLoading(false);
      }
    };
    
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (validationErrors.length > 0) {
      setError('Please fix validation errors before importing');
      return;
    }
    
    setUploading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await axios.post(
        'http://localhost:3001/api/superadmin/admin-csv-import',
        { admins: csvData },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess(`Successfully imported ${csvData.length} admin accounts!`);
        setCsvData([]);
        setShowPreview(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error: any) {
      console.error('Error importing admins:', error);
      setError(error.response?.data?.message || 'Failed to import admin accounts');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'business_handle',
      'admin_email',
      'admin_first_name', 
      'admin_last_name',
      'admin_password',
      'is_active',
      'created_date'
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleData.map(record => [
        record.business_handle,
        record.admin_email,
        record.admin_first_name,
        record.admin_last_name,
        record.admin_password,
        record.is_active,
        record.created_date
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadCurrentAdmins = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await axios.get('http://localhost:3001/api/superadmin/admin-csv-export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const csvContent = response.data.csv;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admins_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting admins:', error);
      setError('Failed to export admin data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin CSV Management</h1>
              <p className="text-gray-600">Import and export admin accounts with business connections</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </button>
            <button
              onClick={downloadCurrentAdmins}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Current
            </button>
          </div>
        </div>
      </div>

      {/* CSV Format Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-2">Admin CSV Format</h3>
            <p className="text-sm text-blue-700 mb-3">
              Admin CSV connects business handles (@handle) with admin accounts to ensure proper business-admin relationships.
            </p>
            <div className="bg-white rounded border p-3">
              <p className="text-xs font-mono text-gray-700">
                business_handle,admin_email,admin_first_name,admin_last_name,admin_password,is_active,created_date
              </p>
              <p className="text-xs font-mono text-gray-600 mt-1">
                @coffeeshop,admin@coffeeshop.com,John,Smith,password123,true,2024-01-15
              </p>
            </div>
            <ul className="text-sm text-blue-700 mt-3 space-y-1">
              <li>• <strong>business_handle:</strong> Must start with @ symbol and match existing business</li>
              <li>• <strong>admin_email:</strong> Valid email address for admin login</li>
              <li>• <strong>admin_password:</strong> Minimum 6 characters</li>
              <li>• <strong>is_active:</strong> true/false for account status</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Upload className="h-5 w-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Import Admin CSV</h2>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Upload Admin CSV File
            </p>
            <p className="text-gray-600">
              Click to select a CSV file or drag and drop
            </p>
          </label>
        </div>
        
        {loading && (
          <div className="mt-4 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-purple-600 animate-spin mr-2" />
            <span className="text-purple-600">Processing CSV file...</span>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-3" />
            <p className="text-sm font-medium text-green-900">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-900">
              Validation Errors ({validationErrors.length})
            </h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {validationErrors.map((error, index) => (
                <div key={index} className="bg-white border border-red-200 rounded p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        Row {error.row}: {error.field}
                      </p>
                      <p className="text-sm text-red-700">{error.message}</p>
                      {error.value && (
                        <p className="text-xs text-gray-600 mt-1">
                          Value: "{error.value}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSV Preview */}
      {showPreview && csvData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Eye className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Preview ({csvData.length} records)
              </h3>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setCsvData([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </button>
              
              {validationErrors.length === 0 && (
                <button
                  onClick={handleImport}
                  disabled={uploading}
                  className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                    uploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  {uploading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? 'Importing...' : 'Import Admins'}
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Handle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {csvData.slice(0, 10).map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {record.business_handle}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{record.admin_email}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {record.admin_first_name} {record.admin_last_name}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.is_active 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.created_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {csvData.length > 10 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  Showing first 10 of {csvData.length} records. All records will be imported.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCSV;