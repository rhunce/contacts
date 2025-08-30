import api from './api';
import { ApiKey, CreateApiKeyRequest, ApiKeyResponse } from '@/types/apiKey';

export const apiKeyService = {
  async getApiKeys(): Promise<ApiKey[]> {
    const response = await api.get('/api/keys');
    return response.data.data || response.data;
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
  },

  async updateApiKey(id: string, data: Partial<CreateApiKeyRequest>): Promise<ApiKey> {
    const response = await api.patch(`/api/keys/${id}`, data);
    return response.data;
  }
};
