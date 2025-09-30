// components/ProtectedRoute/ProtectedRoute.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireRole?: string[];
}

export default function ProtectedRoute({ 
  children, 
  fallback = <div>Loading...</div>,
  requireRole = []
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  // Handle redirect in useEffect to avoid render issues
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [loading, isAuthenticated, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, show fallback while redirecting
  if (!isAuthenticated) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Redirecting...</span>
          </div>
          <p>Đang chuyển hướng đến trang đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Check role-based access if required
  if (requireRole.length > 0 && user?.role && !requireRole.includes(user.role)) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-danger text-center">
              <h4>Không có quyền truy cập</h4>
              <p>Bạn không có quyền truy cập vào trang này.</p>
              <button 
                className="btn btn-primary"
                onClick={() => router.back()}
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}