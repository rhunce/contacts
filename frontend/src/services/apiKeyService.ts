import { ApiKey, ApiKeyResponse, CreateApiKeyRequest } from '@/types/apiKey';
import api from './api';
import { ApiErrorHandler } from '@/utils/apiErrorHandler';

export const apiKeyService = {
  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const response = await api.get('/api/keys');
      return response.data.data;
    } catch (error: any) {
      const customMessages = {
        401: 'Authentication required. Please log in again.',
        403: 'Access denied. You do not have permission to view API keys.'
      };
      
      throw ApiErrorHandler.createError(error, customMessages);
    }
  },

  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyResponse> {
    try {
      const response = await api.post('/api/keys', data);
      return response.data.data;
    } catch (error: any) {
      const customMessages = {
        422: 'Please check your input and try again',
        409: 'An API key with this name already exists'
      };
      
      throw ApiErrorHandler.createError(error, customMessages);
    }
  },

  async revokeApiKey(id: string): Promise<void> {
    try {
      await api.delete(`/api/keys/${id}`);
    } catch (error: any) {
      const customMessages = {
        404: 'API key not found',
        403: 'Access denied. You do not have permission to revoke this API key.'
      };
      
      throw ApiErrorHandler.createError(error, customMessages);
    }
  },

  async deleteApiKey(id: string): Promise<void> {
    try {
      await api.delete(`/api/keys/${id}/permanent`);
    } catch (error: any) {
      const customMessages = {
        404: 'API key not found',
        403: 'Access denied. You do not have permission to delete this API key.'
      };
      
      throw ApiErrorHandler.createError(error, customMessages);
    }
  },

  async restoreApiKey(id: string): Promise<void> {
    try {
      await api.post(`/api/keys/${id}/restore`);
    } catch (error: any) {
      const customMessages = {
        404: 'API key not found',
        403: 'Access denied. You do not have permission to restore this API key.'
      };
      
      throw ApiErrorHandler.createError(error, customMessages);
    }
  }
};
