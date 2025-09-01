export interface ApiKey {
  id: string;
  name: string;
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface CreateApiKeyRequest {
  name: string;
  expiresAt?: Date;
}

export interface ApiKeyResponse {
  apiKey: string;
  info: ApiKey;
}
