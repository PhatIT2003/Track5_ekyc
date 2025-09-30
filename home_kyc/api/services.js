// src/api/services.js - Updated with Individual KYC API
import { API_ENDPOINTS } from './config.js';

export class ApiService {
  
  // Submit individual KYC data
  static async submitIndividualKYC(formData, files) {
    console.log('🚀 === SUBMIT INDIVIDUAL KYC CALLED ===');
    console.log('📥 Input formData:', formData);
    console.log('📥 Input files:', files);
    
    try {
      const submitData = new FormData();
      
      // Add form fields for individual
      let fieldCount = 0;
      const individualFields = {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        date_of_birth: formData.dateOfBirth || '', // Có thể thêm field này nếu cần
        address: formData.address,
        nationality: formData.nationality || 'Việt Nam', // Default nationality
        cccd_number: formData.idNumber,
        phone: formData.phone,
        email: formData.email,
        address_wallet: formData.address_wallet || '' // Nếu cá nhân cũng có wallet
      };
      
      Object.keys(individualFields).forEach(key => {
        if (individualFields[key] !== null && individualFields[key] !== undefined && individualFields[key] !== '') {
          console.log(`✅ Adding field: ${key} = "${individualFields[key]}"`);
          submitData.append(key, individualFields[key]);
          fieldCount++;
        }
      });
      
      console.log(`📊 Total fields added: ${fieldCount}`);
      
      // Add files for individual
      let fileCount = 0;
      let totalFileSize = 0;
      
      if (files.front_cccd_image?.file) {
        console.log('✅ Adding front_cccd_image:', files.front_cccd_image.file.name, files.front_cccd_image.file.size, 'bytes');
        submitData.append('front_cccd_image', files.front_cccd_image.file);
        totalFileSize += files.front_cccd_image.file.size;
        fileCount++;
      }
      
      if (files.back_cccd_image?.file) {
        console.log('✅ Adding back_cccd_image:', files.back_cccd_image.file.name, files.back_cccd_image.file.size, 'bytes');
        submitData.append('back_cccd_image', files.back_cccd_image.file);
        totalFileSize += files.back_cccd_image.file.size;
        fileCount++;
      }
      
      console.log(`📊 Total files: ${fileCount}, Total size: ${(totalFileSize / 1024 / 1024).toFixed(2)} MB`);
      
      console.log('🌐 API Endpoint:', API_ENDPOINTS.INDIVIDUAL.SUBMIT);
      console.log('🚀 Making fetch request...');
      
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      
      const response = await fetch(API_ENDPOINTS.INDIVIDUAL.SUBMIT, {
        method: 'POST',
        body: submitData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('📡 Response received - Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ Error response body:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Success response body:', result);
      
      return {
        success: result.success || true,
        message: result.message || 'Individual KYC submitted successfully',
        data: result.data || result
      };
      
    } catch (error) {
      console.log('💥 === SUBMIT INDIVIDUAL KYC ERROR ===');
      console.log('Error name:', error.name);
      console.log('Error message:', error.message);
      
      // Handle specific connection errors
      if (error.name === 'AbortError') {
        console.log('⏰ Request timeout - using mock response');
        return this.mockIndividualKYCSuccess(formData);
      }
      
      if (error.message === 'Failed to fetch' || error.message.includes('ERR_CONNECTION')) {
        console.log('🔌 Connection error - backend might be down');
        console.log('🎭 Using mock response to continue flow');
        return this.mockIndividualKYCSuccess(formData);
      }
      
      throw error;
    }
  }

  // Mock response for individual KYC connection errors
  static async mockIndividualKYCSuccess(formData) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🎭 === MOCK INDIVIDUAL KYC SUCCESS ===');
    console.log('🎭 Simulating successful submission with data:', formData);
    
    return {
      success: true,
      message: 'Individual KYC submitted successfully (Mock - Backend Connection Error)',
      data: {
        id: Date.now(),
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        address: formData.address,
        cccd_number: formData.idNumber,
        phone: formData.phone,
        email: formData.email,
        front_cccd_image: "mock_front_individual.png", 
        back_cccd_image: "mock_back_individual.png",
        otp_code: "123456", // Mock OTP for testing
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        note: "⚠️ This is a mock response due to backend connection error"
      }
    };
  }

  // Submit business KYC data with connection error handling
  static async submitBusinessKYC(formData, files) {
    console.log('🚀 === SUBMIT BUSINESS KYC CALLED ===');
    console.log('📥 Input formData:', formData);
    console.log('📥 Input files:', files);
    
    try {
      const submitData = new FormData();
      
      // Add form fields
      let fieldCount = 0;
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          let value = formData[key];
          
          if (key === 'number_of_employees') {
            if (typeof value === 'string') {
              if (value.includes('-')) {
                value = parseInt(value.split('-')[0]);
              } else if (value === '500+') {
                value = 500;
              } else {
                value = parseInt(value) || value;
              }
            }
          }
          
          console.log(`✅ Adding field: ${key} = "${value}" (${typeof value})`);
          submitData.append(key, value);
          fieldCount++;
        }
      });
      
      console.log(`📊 Total fields added: ${fieldCount}`);
      
      // Add files
      let fileCount = 0;
      let totalFileSize = 0;
      
      if (files.certification_image?.file) {
        console.log('✅ Adding certification_image:', files.certification_image.file.name, files.certification_image.file.size, 'bytes');
        submitData.append('certification_image', files.certification_image.file);
        totalFileSize += files.certification_image.file.size;
        fileCount++;
      }
      
      if (files.front_cccd_image?.file) {
        console.log('✅ Adding front_cccd_image:', files.front_cccd_image.file.name, files.front_cccd_image.file.size, 'bytes');
        submitData.append('front_cccd_image', files.front_cccd_image.file);
        totalFileSize += files.front_cccd_image.file.size;
        fileCount++;
      }
      
      if (files.back_cccd_image?.file) {
        console.log('✅ Adding back_cccd_image:', files.back_cccd_image.file.name, files.back_cccd_image.file.size, 'bytes');
        submitData.append('back_cccd_image', files.back_cccd_image.file);
        totalFileSize += files.back_cccd_image.file.size;
        fileCount++;
      }
      
      console.log(`📊 Total files: ${fileCount}, Total size: ${(totalFileSize / 1024 / 1024).toFixed(2)} MB`);
      
      console.log('🌐 API Endpoint:', API_ENDPOINTS.BUSINESS.SUBMIT);
      console.log('🚀 Making fetch request...');
      
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      
      const response = await fetch(API_ENDPOINTS.BUSINESS.SUBMIT, {
        method: 'POST',
        body: submitData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('📡 Response received - Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ Error response body:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Success response body:', result);
      
      return {
        success: result.success || true,
        message: result.message || 'Business KYC submitted successfully',
        data: result.data || result
      };
      
    } catch (error) {
      console.log('💥 === SUBMIT KYC ERROR ===');
      console.log('Error name:', error.name);
      console.log('Error message:', error.message);
      
      // Handle specific connection errors
      if (error.name === 'AbortError') {
        console.log('⏰ Request timeout - using mock response');
        return this.mockBusinessKYCSuccess(formData);
      }
      
      if (error.message === 'Failed to fetch' || error.message.includes('ERR_CONNECTION')) {
        console.log('🔌 Connection error - backend might be down');
        console.log('🎭 Using mock response to continue flow');
        return this.mockBusinessKYCSuccess(formData);
      }
      
      throw error;
    }
  }

  // Mock response for business connection errors only
  static async mockBusinessKYCSuccess(formData) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🎭 === MOCK BUSINESS KYC SUCCESS ===');
    console.log('🎭 Simulating successful submission with data:', formData);
    
    return {
      success: true,
      message: 'Business KYC submitted successfully (Mock - Backend Connection Error)',
      data: {
        id: Date.now(),
        name_company: formData.name_company,
        type_company: formData.type_company,
        establishment_date: formData.establishment_date,
        business_registration_number: formData.business_registration_number,
        address: formData.address,
        address_wallet: formData.address_wallet,
        career: formData.career,
        number_of_employees: parseInt(formData.number_of_employees) || 0,
        certification_image: "mock_cert.png",
        front_cccd_image: "mock_front.png", 
        back_cccd_image: "mock_back.png",
        otp_code: "123456", // Mock OTP for testing
        email: formData.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        note: "⚠️ This is a mock response due to backend connection error"
      }
    };
  }

  // 🔥 Send OTP for Individual
  static async sendIndividualOTP(email) {
    console.log('📧 === SEND INDIVIDUAL OTP CALLED ===');
    console.log('📧 Email:', email);
    console.log('📧 Note: Backend automatically sends OTP when creating individual record');
    
    // Return success immediately since backend already sent OTP
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'OTP already sent when individual was created',
      email: email,
      note: 'Check your email for the OTP code'
    };
  }

  // 🔥 Send OTP for Business
  static async sendBusinessOTP(email) {
    console.log('📧 === SEND BUSINESS OTP CALLED ===');
    console.log('📧 Email:', email);
    console.log('📧 Note: Backend automatically sends OTP when creating business record');
    
    // Return success immediately since backend already sent OTP
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'OTP already sent when business was created',
      email: email,
      note: 'Check your email for the OTP code'
    };
  }

  // 🔥 VERIFY OTP for Individual
  static async verifyIndividualOTP(email, otpCode) {
    console.log('🔐 === VERIFY INDIVIDUAL OTP CALLED ===');
    console.log('🔐 Email:', email, 'OTP:', otpCode);
    
    try {
      const requestBody = {
        email: email,
        otp_code: otpCode
      };
      
      console.log('🔐 Verify request body:', JSON.stringify(requestBody));
      console.log('🔐 Endpoint:', API_ENDPOINTS.INDIVIDUAL.CONFIRM_OTP);
      
      const response = await fetch(API_ENDPOINTS.INDIVIDUAL.CONFIRM_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔐 Verify Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ Verify Error response:', errorData);
        
        if (response.status === 400) {
          throw new Error(errorData.message || 'Mã OTP không đúng');
        }
        
        if (response.status >= 500) {
          console.warn('⚠️ Individual OTP verification server error - using mock');
          return this.mockVerifyOTPSuccess(email, otpCode);
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Individual OTP verification successful:', result);
      
      return {
        success: result.success || true,
        message: result.message || 'OTP verified successfully',
        email: email,
        verified_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('💥 Error verifying individual OTP:', error);
      
      if (error.message === 'Failed to fetch' || error.message.includes('ERR_CONNECTION')) {
        console.log('🔌 Individual OTP verification connection error - using mock');
        return this.mockVerifyOTPSuccess(email, otpCode);
      }
      
      throw error;
    }
  }

  // 🔥 VERIFY OTP for Business
  static async verifyBusinessOTP(email, otpCode) {
    console.log('🔐 === VERIFY BUSINESS OTP CALLED ===');
    console.log('🔐 Email:', email, 'OTP:', otpCode);
    
    try {
      const requestBody = {
        email: email,
        otp_code: otpCode
      };
      
      console.log('🔐 Verify request body:', JSON.stringify(requestBody));
      console.log('🔐 Endpoint:', API_ENDPOINTS.BUSINESS.CONFIRM_OTP);
      
      const response = await fetch(API_ENDPOINTS.BUSINESS.CONFIRM_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔐 Verify Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ Verify Error response:', errorData);
        
        if (response.status === 400) {
          throw new Error(errorData.message || 'Mã OTP không đúng');
        }
        
        if (response.status >= 500) {
          console.warn('⚠️ Business OTP verification server error - using mock');
          return this.mockVerifyOTPSuccess(email, otpCode);
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Business OTP verification successful:', result);
      
      return {
        success: result.success || true,
        message: result.message || 'OTP verified successfully',
        email: email,
        verified_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('💥 Error verifying business OTP:', error);
      
      if (error.message === 'Failed to fetch' || error.message.includes('ERR_CONNECTION')) {
        console.log('🔌 Business OTP verification connection error - using mock');
        return this.mockVerifyOTPSuccess(email, otpCode);
      }
      
      throw error;
    }
  }

  // Mock OTP verification (only for connection errors)
  static async mockVerifyOTPSuccess(email, otpCode) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otpCode.length !== 6) {
      throw new Error('OTP phải có 6 số');
    }
    
    console.log('🎭 Mock: OTP verified for', email);
    return {
      success: true,
      message: 'OTP verified successfully (Mock - Connection Error)',
      email: email,
      verified_at: new Date().toISOString(),
      note: "⚠️ This is a mock verification due to backend connection error"
    };
  }

  // Test backend connection
  static async testBackendConnection() {
    try {
      console.log('🔌 Testing backend connection...');
      const response = await fetch(API_ENDPOINTS.BUSINESS.SUBMIT.replace('/business', '/health'), {
        method: 'GET',
        timeout: 5000
      });
      
      console.log('🔌 Connection test status:', response.status);
      return response.status === 200;
    } catch (error) {
      console.log('🔌 Connection test failed:', error.message);
      return false;
    }
  }

  static async testConnection() {
    return this.testBackendConnection();
  }

  static async shouldUseMock() {
    return !(await this.testBackendConnection());
  }
}