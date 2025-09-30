// components/FormSteps.jsx
import React from 'react';
import { User, Building2 } from 'lucide-react';
import { InputField, SelectField } from './FormInputs';
import { FileUploadArea } from './FileUpload';

// Simple validation helpers
const validators = {
  companyName: (value) => {
    if (!value) return 'Tên công ty là bắt buộc';
    if (value.trim().length < 4) return 'Tên công ty phải có ít nhất 4 ký tự';
    return null;
  },
  
  address: (value) => {
    if (!value) return 'Địa chỉ là bắt buộc';
    if (value.trim().length < 10) return 'Địa chỉ phải có ít nhất 10 ký tự';
    
    // Kiểm tra có chứa số nhà
    const hasNumber = /\d/.test(value);
    if (!hasNumber) return 'Địa chỉ phải chứa số nhà';
    
    // Kiểm tra có ít nhất 2 từ (đường, phường/xã)
    const words = value.trim().split(/\s+/);
    if (words.length < 3) return 'Địa chỉ phải đầy đủ: số nhà, đường, phường/xã';
    
    return null;
  },
  
  required: (value, fieldName) => {
    if (!value || value.trim() === '') {
      return `${fieldName} là bắt buộc`;
    }
    return null;
  }
};

// Enhanced Input Field with validation
const ValidatedInputField = ({ 
  label, 
  type, 
  field, 
  placeholder, 
  value, 
  onChange, 
  error, 
  validator,
  helpText
}) => {
  const [localError, setLocalError] = React.useState('');
  
  const handleBlur = () => {
    if (validator && value) {
      const validationError = validator(value);
      setLocalError(validationError || '');
    }
  };

  const displayError = error || localError;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        className={`w-full px-4 py-3 border rounded-xl transition-colors ${
          displayError 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300 focus:border-blue-500'
        } focus:ring-2 focus:ring-blue-200 focus:outline-none`}
      />
      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
      {displayError && (
        <p className="text-sm text-red-600">{displayError}</p>
      )}
    </div>
  );
};

// Step 1: User Type Selection
export const UserTypeStep = ({ userType, setUserType }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-center text-black">
      Chọn loại tài khoản cần xác minh
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        onClick={() => setUserType('individual')}
        className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
          userType === 'individual' 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 hover:border-blue-300'
        }`}
      >
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Cá nhân</h3>
          <p className="text-gray-600 text-sm">
            Dành cho khách hàng cá nhân
          </p>
        </div>
      </div>
      
      <div 
        onClick={() => setUserType('business')}
        className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
          userType === 'business' 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 hover:border-blue-300'
        }`}
      >
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Doanh nghiệp</h3>
          <p className="text-gray-600 text-sm">
            Dành cho công ty và tổ chức
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Step 2: Information Form
export const InformationStep = ({ 
  userType, 
  formData, 
  handleInputChange, 
  errors,
  companyTypes,
  industries,
  employeeCounts
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-center text-black">
      {userType === 'individual' ? 'Thông tin cá nhân' : 'Thông tin doanh nghiệp'}
    </h2>
    
    {userType === 'individual' ? (
      <div className="space-y-4 text-black">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <InputField
            label="Họ"
            type="text"
            field="firstName"
            placeholder="Nhập họ"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={errors.firstName}
          />
          <InputField
            label="Tên"
            type="text"
            field="lastName"
            placeholder="Nhập tên"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={errors.lastName}
          />
        </div>
        
        <InputField
          label="Email"
          type="email"
          field="email"
          placeholder="example@email.com"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
        />
        
        <InputField
          label="Số điện thoại"
          type="tel"
          field="phone"
          placeholder="0123 456 789"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          error={errors.phone}
        />

        {/* 🔥 THÊM FIELD MỚI CHO CÁ NHÂN */}
        <InputField
          label="Ngày sinh"
          type="date"
          field="dateOfBirth"
          placeholder="dd/mm/yyyy"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          error={errors.dateOfBirth}
        />
        
        <ValidatedInputField
          label="Địa chỉ"
          type="text"
          field="address"
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          error={errors.address}
          validator={validators.address}
        />
        
        <InputField
          label="Số CMND/CCCD"
          type="text"
          field="idNumber"
          placeholder="Số giấy tờ tùy thân"
          value={formData.idNumber}
          onChange={(e) => handleInputChange('idNumber', e.target.value)}
          error={errors.idNumber}
        />

        {/* 🔥 THÊM FIELD ADDRESS_WALLET CHO CÁ NHÂN */}
        <InputField
          label="Địa chỉ ví (Wallet Address)"
          type="text"
          field="address_wallet"
          placeholder="Nhập địa chỉ ví wallet"
          value={formData.address_wallet}
          onChange={(e) => handleInputChange('address_wallet', e.target.value)}
          error={errors.address_wallet}
        />
      </div>
    ) : (
      <div className="space-y-4 text-black">
        <ValidatedInputField
          label="Tên công ty"
          type="text"
          field="name_company"
          placeholder="Tên công ty đầy đủ"
          value={formData.name_company}
          onChange={(e) => handleInputChange('name_company', e.target.value)}
          error={errors.name_company}
          validator={validators.companyName}
        />
        
        <SelectField
          label="Loại hình doanh nghiệp"
          field="type_company"
          placeholder="Chọn loại hình doanh nghiệp"
          value={formData.type_company}
          onChange={(e) => handleInputChange('type_company', e.target.value)}
          error={errors.type_company}
          options={companyTypes}
        />
        
        <InputField
          label="Ngày thành lập"
          type="date"
          field="establishment_date"
          placeholder="dd/mm/yyyy"
          value={formData.establishment_date}
          onChange={(e) => handleInputChange('establishment_date', e.target.value)}
          error={errors.establishment_date}
        />
        
        <InputField
          label="Số đăng ký kinh doanh"
          type="text"
          field="business_registration_number"
          placeholder="Số giấy chứng nhận đăng ký kinh doanh"
          value={formData.business_registration_number}
          onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
          error={errors.business_registration_number}
        />
        
        <ValidatedInputField
          label="Địa chỉ công ty"
          type="text"
          field="address"
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          error={errors.address}
          validator={validators.address}

        />
        
        <InputField
          label="Địa chỉ ví (Wallet Address)"
          type="text"
          field="address_wallet"
          placeholder="Nhập địa chỉ ví wallet"
          value={formData.address_wallet}
          onChange={(e) => handleInputChange('address_wallet', e.target.value)}
          error={errors.address_wallet}
        />
        
        <SelectField
          label="Lĩnh vực kinh doanh"
          field="career"
          placeholder="Chọn lĩnh vực kinh doanh"
          value={formData.career}
          onChange={(e) => handleInputChange('career', e.target.value)}
          error={errors.career}
          options={industries}
        />
        
        <SelectField
          label="Số lượng nhân viên"
          field="number_of_employees"
          placeholder="Chọn số lượng nhân viên"
          value={formData.number_of_employees}
          onChange={(e) => handleInputChange('number_of_employees', e.target.value)}
          error={errors.number_of_employees}
          options={employeeCounts}
        />
        
        <InputField
          label="Email công ty"
          type="email"
          field="email"
          placeholder="contact@company.com"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
        />
      </div>
    )}
    

  </div>
);

// Step 3: Document Upload
export const DocumentUploadStep = ({ 
  userType, 
  uploadedFiles, 
  handleFileUpload, 
  removeFile, 
  errors,
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-center text-black">
      Tải lên tài liệu xác minh
    </h2>
    
    <div className="space-y-6">
      {userType === 'individual' ? (
        <>
          <FileUploadArea
            field="front_cccd_image"
            label="Ảnh mặt trước CMND/CCCD"
            accept="image/*"
            description="Chụp rõ nét mặt trước giấy tờ tùy thân"
            hasFile={uploadedFiles.front_cccd_image}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
            error={errors.front_cccd_image}
          />
          
          <FileUploadArea
            field="back_cccd_image"
            label="Ảnh mặt sau CMND/CCCD"
            accept="image/*"
            description="Chụp rõ nét mặt sau giấy tờ tùy thân"
            hasFile={uploadedFiles.back_cccd_image}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
            error={errors.back_cccd_image}
          />
        </>
      ) : (
        <>
          <FileUploadArea
            field="certification_image"
            label="Giấy chứng nhận đăng ký kinh doanh"
            accept="image/*,application/pdf"
            description="Giấy chứng nhận đăng ký kinh doanh của công ty"
            hasFile={uploadedFiles.certification_image}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
            error={errors.certification_image}
          />
          
          <FileUploadArea
            field="front_cccd_image"
            label="CMND/CCCD mặt trước người đại diện"
            accept="image/*"
            description="Ảnh mặt trước CMND/CCCD của người đại diện pháp luật"
            hasFile={uploadedFiles.front_cccd_image}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
            error={errors.front_cccd_image}
          />
          
          <FileUploadArea
            field="back_cccd_image"
            label="CMND/CCCD mặt sau người đại diện"
            accept="image/*"
            description="Ảnh mặt sau CMND/CCCD của người đại diện pháp luật"
            hasFile={uploadedFiles.back_cccd_image}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
            error={errors.back_cccd_image}
          />
        </>
      )}
    </div>
    
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-800 mb-2">Lưu ý:</h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Tài liệu phải rõ nét, đầy đủ thông tin</li>
        <li>• Hỗ trợ định dạng: JPG, PNG, PDF (tối đa 5MB)</li>
        <li>• Đảm bảo giấy tờ còn hiệu lực</li>
        <li>• Thông tin trên giấy tờ phải khớp với thông tin đã nhập</li>
      </ul>
    </div>
  </div>
);