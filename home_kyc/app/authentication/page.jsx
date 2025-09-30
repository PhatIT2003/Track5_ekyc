"use client";
import React, { useState } from 'react';
import { CheckCircle, ArrowRight, ArrowLeft, AlertCircle, Shield, Loader } from 'lucide-react';
import OTPVerification from '../../components/kyc/OTPVerification';
import SuccessMessage from '../../components/kyc/SuccessMessage';
import { UserTypeStep, InformationStep, DocumentUploadStep } from '../../components/kyc/FormSteps';
import { companyTypes, industries, employeeCounts } from '../../constants/formOptions';
import { validateForm, handleFileUpload, removeFile, prepareApiData } from '../../utils/validation';
import { ApiService } from '../../api/services';

const SimpleKYCForm = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [errors, setErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [showOTP, setShowOTP] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🔥 Updated form data structure to match API for both Individual and Business
  const [formData, setFormData] = useState({
    // Cá nhân - Individual fields
    firstName: '',
    lastName: '',
    dateOfBirth: '',      // 🔥 THÊM field ngày sinh cho Individual
    nationality: '',      // 🔥 THÊM field quốc tịch cho Individual
    email: '',
    phone: '',
    address: '',
    idNumber: '',         // This maps to cccd_number in API
    address_wallet: '',   // 🔥 THÊM wallet address cho Individual
    
    // Doanh nghiệp - Business fields (giữ nguyên)
    name_company: '',           
    type_company: '',           
    establishment_date: '',     
    business_registration_number: '',
    career: '',                 
    number_of_employees: ''
  });

  const validateStep = () => {
    const newErrors = validateForm(step, userType, formData, uploadedFiles);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep()) {
      if (step === 3) {
        // Submit KYC data to API before showing OTP for both Individual and Business
        await handleSubmitKYC();
      } else {
        setStep(step + 1);
      }
    }
  };

  // 🔥 Updated handleSubmitKYC to support both Individual and Business
  const handleSubmitKYC = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      if (userType === 'business') {
        // API submission for business KYC (existing)
        console.log('🏢 Submitting Business KYC...');
        const result = await ApiService.submitBusinessKYC(formData, uploadedFiles);
        console.log('✅ Business KYC submission successful:', result);
        
        if (result.success) {
          await ApiService.sendBusinessOTP(formData.email);
          console.log('📧 Business OTP sent successfully');
          setShowOTP(true);
        } else {
          throw new Error(result.message || 'Business submission failed');
        }
      } else if (userType === 'individual') {
        // 🔥 API submission for individual KYC (NEW)
        console.log('👤 Submitting Individual KYC...');
        const result = await ApiService.submitIndividualKYC(formData, uploadedFiles);
        console.log('✅ Individual KYC submission successful:', result);
        
        if (result.success) {
          await ApiService.sendIndividualOTP(formData.email);
          console.log('📧 Individual OTP sent successfully');
          setShowOTP(true);
        } else {
          throw new Error(result.message || 'Individual submission failed');
        }
      }
    } catch (error) {
      console.error(`${userType} KYC submission failed:`, error);
      setErrors({
        submit: error.message || `Có lỗi xảy ra khi gửi thông tin ${userType === 'individual' ? 'cá nhân' : 'doanh nghiệp'}. Vui lòng thử lại.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUploadWrapper = (field, file) => {
    handleFileUpload(field, file, setUploadedFiles, setErrors);
  };

  const removeFileWrapper = (field) => {
    removeFile(field, setUploadedFiles);
  };

  const handleOTPSuccess = () => {
    setShowOTP(false);
    setShowSuccess(true);
  };

  // 🔥 Updated handleOTPResend to support both Individual and Business
  const handleOTPResend = async () => {
    try {
      if (userType === 'business') {
        await ApiService.sendBusinessOTP(formData.email);
        console.log('📧 Business OTP resent successfully');
      } else if (userType === 'individual') {
        await ApiService.sendIndividualOTP(formData.email);
        console.log('📧 Individual OTP resent successfully');
      }
    } catch (error) {
      console.error(`Error resending ${userType} OTP:`, error);
    }
  };

  const handleReset = () => {
    setStep(1);
    setUserType('');
    setErrors({});
    setUploadedFiles({});
    setShowOTP(false);
    setShowSuccess(false);
    setIsSubmitting(false);
    // 🔥 Reset form data with all fields
    setFormData({
      // Individual fields
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      email: '',
      phone: '',
      address: '',
      idNumber: '',
      address_wallet: '',
      
      // Business fields
      name_company: '',
      type_company: '',
      establishment_date: '',
      business_registration_number: '',
      career: '',
      number_of_employees: ''
    });
  };

  const prepareApiDataWrapper = () => {
    return prepareApiData(userType, formData);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen relative" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientMove 15s ease infinite'
      }}>
        {/* 🎨 Floating Success Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-bounce"></div>
          <div className="absolute top-60 right-32 w-24 h-24 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-bounce delay-1000"></div>
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-bounce delay-500"></div>
          <div className="absolute top-1/2 right-20 w-16 h-16 bg-pink-300 rounded-full mix-blend-multiply filter blur-lg opacity-70 animate-bounce delay-2000"></div>
        </div>
        
        <div className="relative pt-24 pb-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
              <SuccessMessage userType={userType} onReset={handleReset} />
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>
    );
  }

  if (showOTP) {
    return (
      <div className="min-h-screen relative" style={{
        background: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 20%, #fecfef 40%, #a8edea 60%, #fed6e3 80%, #d299c2 100%)',
        backgroundSize: '300% 300%',
        animation: 'gradientShift 12s ease infinite'
      }}>
        {/* 🎨 OTP Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-32 left-16 w-28 h-28 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"></div>
          <div className="absolute top-48 right-24 w-20 h-20 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-1/4 w-36 h-36 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse delay-500"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-1500"></div>
        </div>

        <div className="relative pt-24 pb-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
              <OTPVerification 
                email={formData.email}
                userType={userType}
                onVerifySuccess={handleOTPSuccess}
                onResend={handleOTPResend}
              />
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 10%, #f093fb 20%, #f5576c 30%, #4facfe 40%, #00f2fe 50%, #667eea 60%, #764ba2 70%, #f093fb 80%, #f5576c 90%, #4facfe 100%)',
      backgroundSize: '400% 400%',
      animation: 'rainbowFlow 20s ease infinite'
    }}>
      {/* 🎨 Rainbow Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating circles with rainbow colors */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-500"></div>
        
        {/* Medium floating elements */}
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-bounce"></div>
        <div className="absolute top-3/4 left-1/3 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-bounce delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-bounce delay-500"></div>
        
        {/* Small sparkle elements */}
        <div className="absolute top-20 left-1/2 w-16 h-16 bg-cyan-300 rounded-full mix-blend-multiply filter blur-lg opacity-70 animate-bounce delay-2000"></div>
        <div className="absolute bottom-32 right-1/2 w-12 h-12 bg-orange-300 rounded-full mix-blend-multiply filter blur-lg opacity-70 animate-bounce delay-1500"></div>
        <div className="absolute top-60 left-20 w-20 h-20 bg-indigo-300 rounded-full mix-blend-multiply filter blur-lg opacity-60 animate-bounce delay-2500"></div>
      </div>


      
      <div className="relative pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 🎨 Enhanced card with stronger glass effect */}
          <div className="bg-white/85 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/40 p-8 relative overflow-hidden">
            {/* 🎨 Multi-layer inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-white/20 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-blue-50/30 via-transparent to-purple-50/30 rounded-3xl"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Xác minh danh tính KYC
                </h1>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">Demo Track 5</h1>
              </div>

              {/* 🎨 Rainbow Progress Bar */}
              <div className="flex items-center justify-center mb-8">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 transform ${
                      step >= stepNum 
                        ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-2xl scale-110 animate-pulse' 
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300 hover:scale-105'
                    }`}>
                      {step > stepNum ? <CheckCircle className="w-7 h-7" /> : stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div className={`w-20 h-3 mx-4 rounded-full transition-all duration-500 ${
                        step > stepNum 
                          ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 shadow-lg animate-pulse' 
                          : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* 🎨 Enhanced Error Message with color */}
              {(errors.userType || errors.submit) && (
                <div className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-300 rounded-2xl shadow-lg">
                  <div className="flex items-center text-red-700">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {errors.userType || errors.submit}
                  </div>
                </div>
              )}

              {/* Step Content with colorful background */}
              <div className="min-h-[400px] relative">
                {/* 🎨 Colorful step content background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-blue-50/50 rounded-2xl shadow-inner"></div>
                
                <div className="relative z-10 p-6">
                  {step === 1 && (
                    <UserTypeStep userType={userType} setUserType={setUserType} />
                  )}

                  {step === 2 && (
                    <InformationStep
                      userType={userType}
                      formData={formData}
                      handleInputChange={handleInputChange}
                      errors={errors}
                      companyTypes={companyTypes}
                      industries={industries}
                      employeeCounts={employeeCounts}
                    />
                  )}

                  {step === 3 && (
                    <DocumentUploadStep
                      userType={userType}
                      uploadedFiles={uploadedFiles}
                      handleFileUpload={handleFileUploadWrapper}
                      removeFile={removeFileWrapper}
                      errors={errors}
                      prepareApiData={prepareApiDataWrapper}
                    />
                  )}
                </div>
              </div>

              {/* 🎨 Colorful Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrev}
                  disabled={step === 1 || isSubmitting}
                  className={`flex items-center px-8 py-4 rounded-2xl transition-all duration-300 transform ${
                    step === 1 || isSubmitting
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white hover:from-gray-500 hover:to-gray-700 hover:scale-105 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Quay lại
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={`flex items-center px-8 py-4 rounded-2xl transition-all duration-300 transform ${
                    isSubmitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 hover:scale-105 shadow-xl hover:shadow-2xl'
                  }`}
                >
                  {step === 3 ? (
                    isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        {userType === 'individual' ? 'Gửi KYC Cá nhân & Xác thực Email' : 'Gửi KYC Doanh nghiệp & Xác thực Email'}
                      </>
                    )
                  ) : (
                    <>
                      Tiếp theo
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* 🎨 Custom CSS Animations */}
      <style jsx>{`
        @keyframes rainbowFlow {
          0% { background-position: 0% 50%; }
          25% { background-position: 100% 25%; }
          50% { background-position: 0% 75%; }
          75% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default SimpleKYCForm;