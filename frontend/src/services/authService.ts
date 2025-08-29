import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('authService: Making login API call');
      const response = await api.post('/login', credentials);
      console.log('authService: Login API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('authService: Login API error:', error);
      // Handle specific error cases
      if (error.response?.status === 401) {
        console.log('authService: 401 error, throwing invalid credentials');
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
      const response = await api.post('/register', userData);
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