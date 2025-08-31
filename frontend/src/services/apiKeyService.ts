import { ApiKey, ApiKeyResponse, CreateApiKeyRequest } from '@/types/apiKey';
import api from './api';

export const apiKeyService = {
  async getApiKeys(): Promise<ApiKey[]> {
    const response = await api.get('/api/keys');
    return response.data.data;
  },

  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyResponse> {
    const response = await api.post('/api/keys', data);
    return response.data.data;
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
