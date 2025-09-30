// components/FileUpload.jsx
import React from 'react';
import { Upload, Eye, X, AlertCircle } from 'lucide-react';

// FileUploadArea component
export const FileUploadArea = ({ field, label, accept, description, hasFile, onFileUpload, onRemoveFile, error }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      
      {hasFile ? (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">{hasFile.name}</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                {hasFile.type === 'image' ? 'Ảnh' : 'PDF'}
              </span>
            </div>
            <button
              onClick={() => onRemoveFile(field)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Xóa file"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {hasFile.type === 'image' && hasFile.preview && (
            <div className="mt-3">
              <img
                src={hasFile.preview}
                alt="Preview"
                className="max-w-full h-48 object-contain rounded border bg-white mx-auto block"
              />
            </div>
          )}
          
          {hasFile.type === 'pdf' && (
            <div className="flex items-center justify-center h-32 bg-white rounded border">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-red-600 font-bold text-xs">PDF</span>
                </div>
                <span className="text-sm text-gray-600">File PDF đã tải lên</span>
              </div>
            </div>
          )}
          
          <div className="mt-3">
            <label
              htmlFor={field}
              className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded cursor-pointer hover:bg-blue-100 transition-colors"
            >
              Thay đổi file
            </label>
          </div>
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onClick={() => document.getElementById(field)?.click()}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          <div className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            Chọn file
          </div>
          <p className="text-xs text-gray-500 mt-2">JPG, PNG, PDF (tối đa 5MB)</p>
        </div>
      )}
      
      <input
        type="file"
        accept={accept}
        className="hidden"
        id={field}
        onChange={(e) => onFileUpload(field, e.target.files[0])}
      />
      
      {error && (
        <div className="flex items-center text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};