// components/LoginForm/PasswordField.tsx
import React, { useState } from 'react';

interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function PasswordField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  className = 'mb-4'
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="form-label fw-semibold">
        <i className="bi bi-lock-fill me-2"></i>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      <div className="input-group">
        <input
          type={showPassword ? 'text' : 'password'}
          className="form-control form-control-lg"
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="current-password"
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
        </button>
      </div>
      {value && value.length > 0 && value.length < 6 && (
        <div className="form-text text-warning">
          <i className="bi bi-exclamation-triangle me-1"></i>
          Mật khẩu nên có ít nhất 6 ký tự
        </div>
      )}
    </div>
  );
}