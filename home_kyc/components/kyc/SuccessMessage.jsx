// components/SuccessMessage.jsx
import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessMessage = ({ userType, onReset }) => (
  <div className="max-w-md mx-auto text-center">
    <div className="mb-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC thành công!</h2>
      <p className="text-gray-600">
        Hồ sơ KYC {userType === 'individual' ? 'cá nhân' : 'doanh nghiệp'} của bạn đã được gửi thành công.
      </p>
    </div>

    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-green-800 mb-2">Bước tiếp theo:</h3>
      <ul className="text-sm text-green-700 space-y-1 text-left">
        <li>• Hồ sơ sẽ được xem xét trong 24-48 giờ</li>
        <li>• Bạn sẽ nhận email thông báo kết quả</li>
        <li>• Kiểm tra email thường xuyên</li>
        <li>• Liên hệ hỗ trợ nếu cần thiết</li>
      </ul>
    </div>

    <button
      onClick={onReset}
      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Thực hiện KYC mới
    </button>
  </div>
);

export default SuccessMessage;