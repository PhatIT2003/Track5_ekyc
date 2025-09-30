// components/LoginForm/SubmitButton.tsx
import React from 'react';

interface SubmitButtonProps {
  loading: boolean;
  text?: string;
  loadingText?: string;
  className?: string;
}

export default function SubmitButton({
  loading,
  text = 'Đăng nhập',
  loadingText = 'Đang đăng nhập...',
  className = 'btn btn-primary btn-lg'
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      disabled={loading}
    >
      {loading ? (
        <>
          <span 
            className="spinner-border spinner-border-sm me-2" 
            role="status" 
            aria-hidden="true"
          ></span>
          {loadingText}
        </>
      ) : (
        <>
          <i className="bi bi-box-arrow-in-right me-2"></i>
          {text}
        </>
      )}
    </button>
  );
}