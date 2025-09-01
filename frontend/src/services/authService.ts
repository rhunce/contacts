import { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';
import api from './api';
import { ApiErrorHandler } from '@/utils/apiErrorHandler';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error: any) {
      const customMessages = {
        401: 'Invalid email or password',
        422: 'Please check your input and try again'
      };
      
      throw ApiErrorHandler.createError(error, customMessages);
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error: any) {
      const customMessages = {
        409: 'An account with this email already exists',
        422: 'Please check your input and try again'
      };
      
      throw ApiErrorHandler.createError(error, customMessages);
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