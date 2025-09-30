// services/authService.ts
import { LoginFormData, LoginResponse } from '../components/LoginForm/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

class AuthService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async login(credentials: LoginFormData): Promise<LoginResponse> {
    const response = await this.makeRequest<LoginResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Nếu login thành công, lưu token vào sessionStorage
    if (response.success && response.data?.access_token) {
      sessionStorage.setItem('accessToken', response.data.access_token);
      sessionStorage.setItem('userName', credentials.userName);
    }

    return response;
  }

  async logout(): Promise<void> {
    const token = sessionStorage.getItem('accessToken');
    
    if (token) {
      try {
        await this.makeRequest('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
      }
    }

    // Clear session storage regardless of API call result
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userName');
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!sessionStorage.getItem('accessToken');
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const token = sessionStorage.getItem('accessToken');
    return token;
  }

  getUsername(): string | null {
    if (typeof window === 'undefined') return null;
    
    const username = sessionStorage.getItem('userName');
    return username;
  }

  async refreshToken(): Promise<string | null> {
    const currentToken = this.getToken();
    
    if (!currentToken) return null;

    try {
      const response = await this.makeRequest<{ access_token: string }>('/api/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      const newToken = response.access_token;
      sessionStorage.setItem('accessToken', newToken);
      return newToken;
    } catch (error) {
      this.logout(); // Clear invalid token
      return null;
    }
  }
}

export const loginService = new AuthService();