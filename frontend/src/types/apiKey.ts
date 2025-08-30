export interface ApiKey {
  id: string;
  name: string;
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  usageStats?: {
    totalRequests: number;
    monthlyRequests: number;
    dailyRequests: number;
  };
}

export interface CreateApiKeyRequest {
  name: string;
  expiresAt?: Date;
  permissions?: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

export interface ApiKeyResponse {
  apiKey: string;
  info: ApiKey;
}

export interface ApiKeyUsageStats {
  totalRequests: number;
  monthlyRequests: number;
  dailyRequests: number;
  lastUsedAt?: Date;
}
