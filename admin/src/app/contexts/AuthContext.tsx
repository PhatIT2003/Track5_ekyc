// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginService } from '../services/authService';
import { AuthState, User } from '../components/LoginForm/types';

interface AuthContextType extends AuthState {
  login: (credentials: { userName: string; password: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Đảm bảo chỉ chạy trên client-side
        if (typeof window === 'undefined') {
          setAuthState(prev => ({ ...prev, loading: false }));
          return;
        }

        const token = loginService.getToken();
        const username = loginService.getUsername();


        if (token && username) {
          // Verify token format (optional - kiểm tra token có hợp lệ không)
          try {
            // Basic token validation - bạn có thể thêm logic validate JWT ở đây
            if (token.length < 10) {
              throw new Error('Invalid token format');
            }

            // Set session cookie for middleware
            document.cookie = `accessToken=${token}; path=/; SameSite=Strict`; // Session cookie
            
            setAuthState({
              isAuthenticated: true,
              user: { id: username, userName: username },
              token,
              loading: false,
              error: null,
            });
          } catch (tokenError) {
            // Clear invalid token
            loginService.logout();
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            setAuthState(prev => ({ ...prev, loading: false }));
          }
        } else {
          // Clear cookie if no token
          document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          setAuthState(prev => ({
            ...prev,
            loading: false,
          }));
        }
      } catch (error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Lỗi khởi tạo xác thực',
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { userName: string; password: string }) => {
    setAuthState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await loginService.login(credentials);
      
      if (response.success) {
        const user: User = {
          id: credentials.userName,
          userName: credentials.userName,
        };

        // Set cookie for middleware với session-only cookie
        document.cookie = `accessToken=${response.data.access_token}; path=/; SameSite=Strict`; // Session cookie (không có max-age)

        setAuthState({
          isAuthenticated: true,
          user,
          token: response.data.access_token,
          loading: false,
          error: null,
        });

        // Check for callback URL and redirect in next tick
        setTimeout(() => {
          const urlParams = new URLSearchParams(window.location.search);
          const callbackUrl = urlParams.get('callbackUrl') || '/'; 
          router.push(callbackUrl);
        }, 0);

        return { success: true, message: response.message };
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: response.message,
        }));
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi đăng nhập';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    setAuthState(prev => ({
      ...prev,
      loading: true,
    }));

    try {
      await loginService.logout();
      
      // Clear cookie
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      });

      // Redirect in next tick
      setTimeout(() => {
        router.push('/login');
      }, 0);
    } catch (error) {
      // Even if logout API fails, clear local state
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      });
      
      // Redirect in next tick
      setTimeout(() => {
        router.push('/login');
      }, 0);
    }
  };

  const refreshToken = async () => {
    try {
      const newToken = await loginService.refreshToken();
      
      if (newToken) {
        // Update session cookie
        document.cookie = `accessToken=${newToken}; path=/; SameSite=Strict`; // Session cookie
        
        setAuthState(prev => ({
          ...prev,
          token: newToken,
        }));
        return true;
      } else {
        // Refresh failed, logout user
        await logout();
        return false;
      }
    } catch (error) {
      await logout();
      return false;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({
      ...prev,
      error: null,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshToken,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}