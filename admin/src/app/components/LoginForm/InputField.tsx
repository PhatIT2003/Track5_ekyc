// components/LoginForm/InputField.tsx
import React from 'react';

interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  icon: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  className?: string;
}

export default function InputField({
  id,
  name,
  label,
  icon,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  type = 'text',
  className = 'mb-3'
}: InputFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="form-label fw-semibold">
        <i className={`bi ${icon} me-2`}></i>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      <input
        type={type}
        className="form-control form-control-lg"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={name === 'userName' ? 'username' : 'off'}
      />
    </div>
  );
}