import { ApiKey, ApiKeyResponse, CreateApiKeyRequest } from '@/types/apiKey';
import api from './api';

export const apiKeyService = {
  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const response = await api.get('/api/keys');
      return response.data.data;
    } catch (error: any) {
      // Extract error message from API response
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        const firstError = error.response.data.errors[0];
        throw new Error(firstError.message);
      }
      throw error;
    }
  },

  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyResponse> {
    const response = await api.post('/api/keys', data);
    return response.data;
  },

  async revokeApiKey(id: string): Promise<void> {
    await api.delete(`/api/keys/${id}`);
  },

  async deleteApiKey(id: string): Promise<void> {
    await api.delete(`/api/keys/${id}/permanent`);
  },

  async restoreApiKey(id: string): Promise<void> {
    await api.post(`/api/keys/${id}/restore`);
  }
};
