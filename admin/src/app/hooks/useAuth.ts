// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loginService } from '../services/authService';
import { AuthState, User } from '../components/LoginForm/types';

export function useAuth() {
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
        const token = loginService.getToken();
        const username = loginService.getUsername();

        if (token && username) {
          setAuthState({
            isAuthenticated: true,
            user: { id: username, userName: username },
            token,
            loading: false,
            error: null,
          });
        } else {
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

  const login = useCallback(async (credentials: { userName: string; password: string }) => {
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

        setAuthState({
          isAuthenticated: true,
          user,
          token: response.data.access_token,
          loading: false,
          error: null,
        });

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
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({
      ...prev,
      loading: true,
    }));

    try {
      await loginService.logout();
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      });

      router.push('/login');
    } catch (error) {
      // Even if logout API fails, clear local state
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      });
      router.push('/login');
    }
  }, [router]);

  const refreshToken = useCallback(async () => {
    try {
      const newToken = await loginService.refreshToken();
      
      if (newToken) {
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
  }, [logout]);

  const clearError = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...authState,
    login,
    logout,
    refreshToken,
    clearError,
  };
}