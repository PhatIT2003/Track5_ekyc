// components/LoginForm/LoginForm.tsx
'use client';

import { useState } from 'react';
import { LoginFormData } from './types';
import { useAuth } from '../../contexts/AuthContext';
import InputField from './InputField';
import PasswordField from './PasswordField';
import SubmitButton from './SubmitButton';
import ErrorAlert from './ErrorAlert';

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    userName: '',
    password: ''
  });
  
  const { login, loading, error, clearError } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) clearError();
  };

  const validateForm = (): boolean => {
    if (!formData.userName.trim()) {
      return false;
    }
    if (!formData.password.trim()) {
      return false;
    }
    if (formData.password.length < 6) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // AuthContext sẽ tự động redirect về home hoặc callbackUrl
    await login(formData);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorAlert error={error || ''} onClose={clearError} />

      <InputField
        id="userName"
        name="userName"
        label="Tên đăng nhập"
        icon="bi-person-fill"
        placeholder="Nhập tên đăng nhập"
        value={formData.userName}
        onChange={handleInputChange}
        disabled={loading}
        required
      />

      <PasswordField
        id="password"
        name="password"
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        value={formData.password}
        onChange={handleInputChange}
        disabled={loading}
        required
      />

      <div className="d-grid">
        <SubmitButton loading={loading} />
      </div>
    </form>
  );
}