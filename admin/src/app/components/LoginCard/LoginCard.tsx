// components/LoginCard/LoginCard.tsx
import React from 'react';
import LoginForm from '../LoginForm/LoginForm';
import Link from 'next/link';

interface LoginCardProps {
  title?: string;
  subtitle?: string;
  showRegisterLink?: boolean;
}

export default function LoginCard({
  title = 'Đăng Nhập',
  subtitle = 'Chào mừng bạn quay trở lại',
  showRegisterLink = true
}: LoginCardProps) {
  return (
    <div className="card shadow-lg border-0">
      <div className="card-body p-5">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="card-title text-primary fw-bold mb-2">{title}</h2>
          <p className="text-muted">{subtitle}</p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        {showRegisterLink && (
          <div className="text-center mt-4">
            <small className="text-muted">
              Chưa có tài khoản?{' '}
              <Link 
                href="/register" 
                className="text-primary text-decoration-none fw-semibold"
              >
                Đăng ký ngay
              </Link>
            </small>
          </div>
        )}

        {/* Additional Links */}
        <div className="text-center mt-3">
          <Link 
            href="/forgot-password" 
            className="text-muted text-decoration-none small"
          >
            <i className="bi bi-question-circle me-1"></i>
            Quên mật khẩu?
          </Link>
        </div>
      </div>
    </div>
  );
}