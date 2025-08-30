import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AppErrorClass } from '../utils/errors';

export interface CreateApiKeyDto {
  name: string;
  expiresAt?: Date;
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export class ApiKeyService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly API_KEY_LENGTH = 32;

  /**
   * Generate a new API key
   */
  private generateApiKey(): string {
    return crypto.randomBytes(ApiKeyService.API_KEY_LENGTH).toString('hex');
  }

  /**
   * Hash an API key for storage
   */
  private async hashApiKey(apiKey: string): Promise<string> {
    return bcrypt.hash(apiKey, ApiKeyService.SALT_ROUNDS);
  }

  /**
   * Verify an API key against its hash
   */
  private async verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
    return bcrypt.compare(apiKey, hash);
  }

  /**
   * Create a new API key for a user
   */
  async createApiKey(userId: string, data: CreateApiKeyDto): Promise<{ apiKey: string; info: ApiKeyInfo }> {
    // Check if API key name already exists for this user
    const existingKey = await prisma.apiKey.findUnique({
      where: {
        userId_name: {
          userId,
          name: data.name
        }
      }
    });

    if (existingKey) {
      throw AppErrorClass.validationError('API key with this name already exists', 'name');
    }

    // Generate new API key
    const apiKey = this.generateApiKey();
    const keyHash = await this.hashApiKey(apiKey);

    // Create API key record
    const apiKeyRecord = await prisma.apiKey.create({
      data: {
        userId,
        name: data.name,
        keyHash,
        expiresAt: data.expiresAt
      }
    });

    const info: ApiKeyInfo = {
      id: apiKeyRecord.id,
      name: apiKeyRecord.name,
      isActive: apiKeyRecord.isActive,
      lastUsedAt: apiKeyRecord.lastUsedAt || undefined,
      expiresAt: apiKeyRecord.expiresAt || undefined,
      createdAt: apiKeyRecord.createdAt
    };

    return { apiKey, info };
  }

  /**
   * Validate an API key and return user ID
   */
  async validateApiKey(apiKey: string): Promise<string> {
    // Find all active API keys
    const apiKeyRecords = await prisma.apiKey.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    // Check each API key against the provided key
    for (const record of apiKeyRecords) {
      const isValid = await this.verifyApiKey(apiKey, record.keyHash);
      if (isValid) {
        // Update last used timestamp
        await prisma.apiKey.update({
          where: { id: record.id },
          data: { lastUsedAt: new Date() }
        });
        return record.userId;
      }
    }

    throw AppErrorClass.unauthorized('Invalid API key');
  }

  /**
   * Get all API keys for a user
   */
  async getUserApiKeys(userId: string): Promise<ApiKeyInfo[]> {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      isActive: key.isActive,
      lastUsedAt: key.lastUsedAt || undefined,
      expiresAt: key.expiresAt || undefined,
      createdAt: key.createdAt
    }));
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(userId: string, apiKeyId: string): Promise<void> {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        userId
      }
    });

    if (!apiKey) {
      throw AppErrorClass.notFound('API key not found');
    }

    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: { isActive: false }
    });
  }

  /**
   * Delete an API key permanently
   */
  async deleteApiKey(userId: string, apiKeyId: string): Promise<void> {
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKeyId,
        userId
      }
    });

    if (!apiKey) {
      throw AppErrorClass.notFound('API key not found');
    }

    await prisma.apiKey.delete({
      where: { id: apiKeyId }
    });
  }
}
