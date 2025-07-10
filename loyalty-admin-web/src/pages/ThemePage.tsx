import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Save, 
  RotateCcw, 
  Eye, 
  Plus,
  Check,
  Smartphone
} from 'lucide-react';
import { apiService } from '../services/api';
import { ThemeColors, Theme } from '../types';

const ThemePage: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeColors | null>(null);
  const [presets, setPresets] = useState<Theme[]>([]);
  const [customColors, setCustomColors] = useState<ThemeColors>({
    primary: '#9CAF88',
    secondary: '#F5F5DC',
    accent: '#7A8B6B',
    background: '#FAFAF0',
    text: '#333333',
    lightGray: '#E0E0E0',
    darkGray: '#666666',
    success: '#388E3C',
    warning: '#F57C00',
    error: '#D32F2F',
    info: '#1976D2'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [showCreatePreset, setShowCreatePreset] = useState(false);

  // Better color labels and organization
  const colorCategories = {
    'Main Colors': {
      primary: 'Primary Color (Main brand color)',
      secondary: 'Secondary Color (Supporting color)', 
      accent: 'Accent Color (Highlights & buttons)',
      background: 'Background Color (App background)'
    },
    'Text & Content': {
      text: 'Main Text Color',
      lightGray: 'Light Text (Subtitles)',
      darkGray: 'Dark Text (Emphasis)'
    },
    'Status Colors': {
      success: 'Success Color (Confirmations)',
      warning: 'Warning Color (Alerts)',
      error: 'Error Color (Errors)',
      info: 'Info Color (Information)'
    }
  };

  const predefinedPresets = [
    {
      id: 'sage-green',
      name: 'Sage Green (Default)',
      colors: {
        primary: '#9CAF88',
        secondary: '#F5F5DC',
        accent: '#7A8B6B',
        background: '#FAFAF0',
        text: '#333333',
        lightGray: '#E0E0E0',
        darkGray: '#666666',
        success: '#388E3C',
        warning: '#F57C00',
        error: '#D32F2F',
        info: '#1976D2'
      }
    },
    {
      id: 'ocean-blue',
      name: 'Ocean Blue',
      colors: {
        primary: '#2E86AB',
        secondary: '#A23B72',
        accent: '#F18F01',
        background: '#F8F9FA',
        text: '#2C3E50',
        lightGray: '#E9ECEF',
        darkGray: '#6C757D',
        success: '#28A745',
        warning: '#FFC107',
        error: '#DC3545',
        info: '#17A2B8'
      }
    },
    {
      id: 'warm-sunset',
      name: 'Warm Sunset',
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#45B7D1',
        background: '#FFF8F0',
        text: '#2C3E50',
        lightGray: '#F1F2F6',
        darkGray: '#57606F',
        success: '#2ED573',
        warning: '#FFA502',
        error: '#FF3742',
        info: '#3742FA'
      }
    }
  ];

  useEffect(() => {
    loadThemeData();
  }, []);

  const loadThemeData = async () => {
    try {
      const [colorsResponse, presetsResponse] = await Promise.all([
        apiService.getThemeColors(),
        apiService.getThemePresets()
      ]);

      if (colorsResponse.success) {
        setCurrentTheme(colorsResponse.colors);
        setCustomColors(colorsResponse.colors);
      }

      if (presetsResponse.success) {
        setPresets(presetsResponse.customThemes || []);
      }
    } catch (error) {
      console.error('Theme loading error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Failed to load theme data: ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setCustomColors(prev => ({ ...prev, [colorKey]: value }));
  };

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      const response = await apiService.updateThemeColors(customColors);
      if (response.success) {
        setCurrentTheme(customColors);
        setMessage({ type: 'success', text: 'Theme updated successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update theme' });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPreset = async (preset: any) => {
    setCustomColors(preset.colors);
    
    // If it's a predefined preset (has string ID like 'sage-green'), just update colors
    if (preset.isPredefined || typeof preset.id === 'string') {
      try {
        // Save the colors as the current theme
        await apiService.updateThemeColors(preset.colors);
        setCurrentTheme(preset.colors);
        setMessage({ type: 'success', text: `Applied ${preset.name} theme` });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to apply preset' });
      }
    } 
    // If it's a database preset (has numeric ID), use the apply endpoint
    else if (preset.id && typeof preset.id === 'number') {
      try {
        await apiService.applyThemePreset(preset.id);
        setCurrentTheme(preset.colors);
        setMessage({ type: 'success', text: `Applied ${preset.name} theme` });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to apply preset' });
      }
    }
  };

  const handleCreatePreset = async () => {
    if (!newPresetName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a preset name' });
      return;
    }

    // Check if name already exists
    const existingPreset = presets.find(p => p.name.toLowerCase() === newPresetName.trim().toLowerCase());
    if (existingPreset) {
      setMessage({ type: 'error', text: 'A preset with this name already exists' });
      return;
    }

    try {
      setSaving(true);
      const response = await apiService.createThemePreset(newPresetName.trim(), customColors);
      if (response.success) {
        setNewPresetName('');
        setShowCreatePreset(false);
        setMessage({ type: 'success', text: 'Theme preset created successfully' });
        // Reload presets to get fresh data
        await loadThemeData();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Failed to create preset: ${errorMessage}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePreset = async (preset: any) => {
    if (preset.isPredefined) return; // Can't delete predefined presets
    
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Are you sure you want to delete the "${preset.name}" preset?`)) return;

    try {
      await apiService.deleteThemePreset(preset.id);
      setPresets(prev => prev.filter(p => p.id !== preset.id));
      setMessage({ type: 'success', text: 'Theme preset deleted successfully' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Failed to delete preset: ${errorMessage}` });
    }
  };

  const resetToDefault = () => {
    setCustomColors(predefinedPresets[0].colors);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Theme Designer</h1>
          <p className="text-gray-600">Customize your app's color scheme and branding</p>
        </div>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            previewMode 
              ? 'bg-gray-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Eye className="h-4 w-4 mr-2" />
          {previewMode ? 'Exit Preview' : 'Preview Mode'}
        </button>
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
        {/* Color Customization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme Presets */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Presets</h3>
            
            {/* Predefined Presets */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">Built-in Themes</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {predefinedPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-sage-300 transition-colors relative"
                    onClick={() => handleApplyPreset(preset)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-900">{preset.name}</h5>
                      {currentTheme && JSON.stringify(currentTheme) === JSON.stringify(preset.colors) && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <div 
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.colors.primary }}
                      ></div>
                      <div 
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.colors.secondary }}
                      ></div>
                      <div 
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.colors.accent }}
                      ></div>
                      <div 
                        className="w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: preset.colors.background }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Presets */}
            {presets.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Your Custom Themes</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-sage-300 transition-colors relative group"
                    >
                      <div
                        onClick={() => handleApplyPreset(preset)}
                        className="flex-1"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-900">{preset.name}</h5>
                          {currentTheme && JSON.stringify(currentTheme) === JSON.stringify(preset.colors) && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: preset.colors.primary }}
                          ></div>
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: preset.colors.secondary }}
                          ></div>
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: preset.colors.accent }}
                          ></div>
                          <div 
                            className="w-6 h-6 rounded border border-gray-200"
                            style={{ backgroundColor: preset.colors.background }}
                          ></div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePreset(preset);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        title="Delete preset"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create New Preset */}
            {showCreatePreset ? (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Preset name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500"
                  />
                  <button
                    onClick={handleCreatePreset}
                    disabled={!newPresetName.trim() || isSaving}
                    className="px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowCreatePreset(false);
                      setNewPresetName('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreatePreset(true)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Preset
              </button>
            )}
          </div>

          {/* Color Customization */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Custom Colors
            </h3>

            <div className="space-y-8">
              {Object.entries(colorCategories).map(([categoryName, colors]) => (
                <div key={categoryName} className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    {categoryName}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(colors).map(([colorKey, colorLabel]) => (
                      <div key={colorKey} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {colorLabel}
                        </label>
                        <div className="flex space-x-3 items-center">
                          <input
                            type="color"
                            value={customColors[colorKey as keyof ThemeColors]}
                            onChange={(e) => handleColorChange(colorKey as keyof ThemeColors, e.target.value)}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={customColors[colorKey as keyof ThemeColors]}
                            onChange={(e) => handleColorChange(colorKey as keyof ThemeColors, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-sage-500 focus:border-sage-500 text-sm"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveTheme}
                disabled={isSaving}
                className="flex items-center px-6 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Apply Theme'}
              </button>
              <button
                onClick={resetToDefault}
                className="flex items-center px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Live Preview
            </h3>

            {/* Mobile App Preview */}
            <div className="mx-auto w-48 h-96 bg-gray-800 rounded-3xl p-2 shadow-xl">
              <div 
                className="w-full h-full rounded-2xl overflow-hidden"
                style={{ backgroundColor: customColors.background }}
              >
                {/* App Header */}
                <div 
                  className="h-16 flex items-center justify-center"
                  style={{ backgroundColor: customColors.primary }}
                >
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: customColors.background }}
                  >
                    Loyalty App
                  </span>
                </div>

                {/* Content Area */}
                <div className="p-3 space-y-3">
                  {/* Card */}
                  <div 
                    className="rounded-lg p-3 shadow-sm"
                    style={{ backgroundColor: customColors.secondary }}
                  >
                    <div 
                      className="text-xs font-medium mb-1"
                      style={{ color: customColors.text }}
                    >
                      Membership Card
                    </div>
                    <div 
                      className="text-lg font-bold"
                      style={{ color: customColors.primary }}
                    >
                      Gold Member
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: customColors.darkGray }}
                    >
                      1,234 points
                    </div>
                  </div>

                  {/* Button */}
                  <button 
                    className="w-full py-2 rounded-md text-xs font-medium"
                    style={{ 
                      backgroundColor: customColors.accent,
                      color: customColors.background
                    }}
                  >
                    View Coupons
                  </button>

                  {/* List Items */}
                  <div className="space-y-2">
                    {['Recent Transaction', 'Available Offers', 'Rewards History'].map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between py-2 px-2 rounded"
                        style={{ backgroundColor: customColors.lightGray }}
                      >
                        <span 
                          className="text-xs"
                          style={{ color: customColors.text }}
                        >
                          {item}
                        </span>
                        <span 
                          className="text-xs"
                          style={{ color: customColors.accent }}
                        >
                          →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Palette</h4>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(customColors).slice(0, 8).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div 
                      className="w-8 h-8 rounded mx-auto mb-1 border border-gray-200"
                      style={{ backgroundColor: value }}
                    ></div>
                    <span className="text-xs text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase().split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePage;