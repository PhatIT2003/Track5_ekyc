// components/LoginForm/types.ts
export interface LoginFormData {
  userName: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
  };
}

export interface User {
  id: string;
  userName: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}