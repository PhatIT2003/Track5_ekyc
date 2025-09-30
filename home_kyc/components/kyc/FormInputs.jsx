// components/FormInputs.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

// InputField component
export const InputField = ({ label, type, placeholder, required = true, value, onChange, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value || ''}
      onChange={onChange}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      }`}
      placeholder={placeholder}
    />
    {error && (
      <div className="flex items-center text-red-500 text-sm mt-1">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </div>
    )}
  </div>
);

// SelectField component for dropdowns
export const SelectField = ({ label, field, placeholder, required = true, value, onChange, error, options = [] }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value || ''}
      onChange={onChange}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <div className="flex items-center text-red-500 text-sm mt-1">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </div>
    )}
  </div>
);