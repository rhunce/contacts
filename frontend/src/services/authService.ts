import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

// Simple client-side hashing function (in production, use a proper crypto library)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Hash the password on the client side
      const hashedPassword = await hashPassword(credentials.password);
      const response = await api.post('/login', {
        email: credentials.email,
        hashedPassword
      });
      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      if (error.response?.status === 422) {
        throw new Error('Please check your input and try again');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Hash the password on the client side
      const hashedPassword = await hashPassword(userData.password);
      const response = await api.post('/register', {
        ...userData,
        password: hashedPassword
      });
      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 409) {
        throw new Error('An account with this email already exists');
      }
      if (error.response?.status === 422) {
        throw new Error('Please check your input and try again');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch (error: any) {
      // Log error but don't throw - we want to logout locally even if server fails
      console.error('Logout API error:', error);
    }
  },

  async getCurrentUser(): Promise<any> {
    try {
      const response = await api.get('/me');
      return response.data.data?.user || null;
    } catch (error: any) {
      // Re-throw the error so the auth context can handle it
      throw error;
    }
  },
};