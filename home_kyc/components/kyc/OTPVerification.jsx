// components/OTPVerification.jsx
import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle, Loader } from 'lucide-react';
import { ApiService } from '../../api/services';

const OTPVerification = ({ email, userType, onVerifySuccess, onResend }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    setIsVerifying(true);
    setError('');
    
    try {
      if (userType === 'business') {
        // Use API for business
        await ApiService.verifyBusinessOTP(email, otpCode);
        console.log('✅ Business OTP verified successfully');
        onVerifySuccess();
      } else {
        // 🔥 Use API for individual
        await ApiService.verifyIndividualOTP(email, otpCode);
        console.log('✅ Individual OTP verified successfully');
        onVerifySuccess();
      }
    } catch (error) {
      console.error(`${userType} OTP verification failed:`, error);
      setError(error.message || 'Mã OTP không đúng. Vui lòng thử lại.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setCountdown(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    
    try {
      if (userType === 'business') {
        // Use API for business
        await ApiService.sendBusinessOTP(email);
        console.log('✅ Business OTP resent successfully');
        onResend();
      } else {
        // 🔥 Use API for individual
        await ApiService.sendIndividualOTP(email);
        console.log('✅ Individual OTP resent successfully');
        onResend();
      }
    } catch (error) {
      console.error(`Resend ${userType} OTP failed:`, error);
      setError('Không thể gửi lại mã OTP. Vui lòng thử lại.');
      setCanResend(true);
      setCountdown(0);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác thực Email</h2>
        <p className="text-gray-600">
          Chúng tôi đã gửi mã OTP 6 số đến email
        </p>
        <p className="font-medium text-gray-900">{email}</p>
        <p className="text-sm text-gray-500 mt-1">
          ({userType === 'business' ? 'Doanh nghiệp' : 'Cá nhân'})
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-center space-x-3 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-12 text-center text-xl font-bold text-black border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          ))}
        </div>
        
        {error && (
          <div className="flex items-center justify-center text-red-500 text-sm mb-4">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
      </div>

      <button
        onClick={handleVerifyOtp}
        disabled={isVerifying || otp.join('').length !== 6}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-4 flex items-center justify-center ${
          isVerifying || otp.join('').length !== 6
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
        }`}
      >
        {isVerifying ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Đang xác thực...
          </>
        ) : (
          'Xác thực OTP'
        )}
      </button>

      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50 flex items-center justify-center mx-auto"
          >
            {isResending ? (
              <>
                <Loader className="w-4 h-4 mr-1 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Gửi lại mã OTP'
            )}
          </button>
        ) : (
          <p className="text-gray-500">
            Gửi lại mã sau {countdown}s
          </p>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;