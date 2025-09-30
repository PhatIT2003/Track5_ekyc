// components/LoginForm/ErrorAlert.tsx
import React from 'react';

interface ErrorAlertProps {
  error: string;
  onClose: () => void;
  className?: string;
}

export default function ErrorAlert({
  error,
  onClose,
  className = 'mb-3'
}: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div className={className}>
      <div className="alert alert-danger alert-dismissible fade show" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose}
          aria-label="Đóng thông báo lỗi"
        ></button>
      </div>
    </div>
  );
}