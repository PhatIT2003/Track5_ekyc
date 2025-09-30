// app/login/page.tsx
'use client';

import React from 'react';
import AuthLayout from '../components/Layout/AuthLayout';
import LoginCard from '../components/LoginForm/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginCard />
    </AuthLayout>
  );
}