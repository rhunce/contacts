import { ApiKeyService } from '../../../src/services/apiKeyService';
import { AppErrorClass } from '../../../src/utils/errors';

// Mock bcrypt
jest.mock('bcrypt');

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mocked-api-key')
  })
}));

// Mock prisma
jest.mock('../../../src/lib/prisma', () => ({
  prisma: {
    apiKey: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}));

describe('ApiKeyService', () => {
  let apiKeyService: ApiKeyService;

  beforeEach(() => {
    apiKeyService = new ApiKeyService();
    jest.clearAllMocks();
  });

  describe('createApiKey', () => {
    const userId = 'user-123';
    const apiKeyData = {
      name: 'Test API Key',
      expiresAt: new Date('2024-12-31')
    };

    const mockApiKeyRecord = {
      id: 'api-key-123',
      userId,
      name: apiKeyData.name,
      keyHash: 'hashed-api-key',
      isActive: true,
      lastUsedAt: null,
      expiresAt: apiKeyData.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should create an API key successfully', async () => {
      const { prisma } = require('../../../src/lib/prisma');
      
      prisma.apiKey.findUnique.mockResolvedValue(null);
      prisma.apiKey.create.mockResolvedValue(mockApiKeyRecord);

      const result = await apiKeyService.createApiKey(userId, apiKeyData);

      expect(result.apiKey).toBe('mocked-api-key');
      expect(result.info.id).toBe(mockApiKeyRecord.id);
      expect(result.info.name).toBe(mockApiKeyRecord.name);
      expect(result.info.isActive).toBe(mockApiKeyRecord.isActive);
      expect(prisma.apiKey.findUnique).toHaveBeenCalledWith({
        where: {
          userId_name: {
            userId,
            name: apiKeyData.name
          }
        }
      });
      expect(prisma.apiKey.create).toHaveBeenCalled();
    });

    it('should throw error when API key name already exists', async () => {
      const { prisma } = require('../../../src/lib/prisma');
      
      prisma.apiKey.findUnique.mockResolvedValue(mockApiKeyRecord);

      await expect(apiKeyService.createApiKey(userId, apiKeyData)).rejects.toThrow(
        AppErrorClass.validationError('API key with this name already exists', 'name')
      );

      expect(prisma.apiKey.findUnique).toHaveBeenCalledWith({
        where: {
          userId_name: {
            userId,
            name: apiKeyData.name
          }
        }
      });
      expect(prisma.apiKey.create).not.toHaveBeenCalled();
    });
  });

  describe('validateApiKey', () => {
    const apiKey = 'test-api-key';
    const userId = 'user-123';

    const mockApiKeyRecord = {
      id: 'api-key-123',
      userId,
      name: 'Test API Key',
      keyHash: 'hashed-api-key',
      isActive: true,
      lastUsedAt: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should validate API key successfully', async () => {
      const { prisma } = require('../../../src/lib/prisma');
      const bcrypt = require('bcrypt');
      
      prisma.apiKey.findMany.mockResolvedValue([mockApiKeyRecord]);
      bcrypt.compare.mockResolvedValue(true);

      const result = await apiKeyService.validateApiKey(apiKey);

      expect(result).toBe(userId);
      expect(prisma.apiKey.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: expect.any(Date) } }
          ]
        }
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(apiKey, mockApiKeyRecord.keyHash);
    });

    it('should throw error for invalid API key', async () => {
      const { prisma } = require('../../../src/lib/prisma');
      const bcrypt = require('bcrypt');
      
      prisma.apiKey.findMany.mockResolvedValue([mockApiKeyRecord]);
      bcrypt.compare.mockResolvedValue(false);

      await expect(apiKeyService.validateApiKey(apiKey)).rejects.toThrow(
        AppErrorClass.unauthorized('Invalid API key')
      );

      expect(prisma.apiKey.findMany).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(apiKey, mockApiKeyRecord.keyHash);
    });

    it('should throw error when no API keys found', async () => {
      const { prisma } = require('../../../src/lib/prisma');
      
      prisma.apiKey.findMany.mockResolvedValue([]);

      await expect(apiKeyService.validateApiKey(apiKey)).rejects.toThrow(
        AppErrorClass.unauthorized('Invalid API key')
      );

      expect(prisma.apiKey.findMany).toHaveBeenCalled();
    });
  });

  describe('getUserApiKeys', () => {
    const userId = 'user-123';

    const mockApiKeyRecords = [
      {
        id: 'api-key-1',
        userId,
        name: 'Test API Key 1',
        keyHash: 'hashed-api-key-1',
        isActive: true,
        lastUsedAt: null,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'api-key-2',
        userId,
        name: 'Test API Key 2',
        keyHash: 'hashed-api-key-2',
        isActive: false,
        lastUsedAt: new Date(),
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    it('should get user API keys successfully', async () => {
      const { prisma } = require('../../../src/lib/prisma');
      
      prisma.apiKey.findMany.mockResolvedValue(mockApiKeyRecords);

      const result = await apiKeyService.getUserApiKeys(userId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(mockApiKeyRecords[0].id);
      expect(result[0].name).toBe(mockApiKeyRecords[0].name);
      expect(result[0].isActive).toBe(mockApiKeyRecords[0].isActive);
      expect(result[1].id).toBe(mockApiKeyRecords[1].id);
      expect(result[1].name).toBe(mockApiKeyRecords[1].name);
      expect(result[1].isActive).toBe(mockApiKeyRecords[1].isActive);

      expect(prisma.apiKey.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('revokeApiKey', () => {
    const userId = 'user-123';
    const apiKeyId = 'api-key-123';

    const mockApiKeyRecord = {
      id: apiKeyId,
      userId,
      name: 'Test API Key',
      keyHash: 'hashed-api-key',
      isActive: true,
      lastUsedAt: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should revoke API key successfully', async () => {
      const { prisma } = require('../../../src/lib/prisma');
      
      prisma.apiKey.findFirst.mockResolvedValue(mockApiKeyRecord);
      prisma.apiKey.update.mockResolvedValue({ ...mockApiKeyRecord, isActive: false });

      await apiKeyService.revokeApiKey(apiKeyId, userId);

      expect(prisma.apiKey.findFirst).toHaveBeenCalledWith({
        where: { id: apiKeyId }
      });
      expect(prisma.apiKey.update).toHaveBeenCalledWith({
        where: { id: apiKeyId },
        data: { isActive: false }
      });
    });

    it('should throw error when API key not found', async () => {
      const { prisma } = require('../../../src/lib/prisma');
      
      prisma.apiKey.findFirst.mockResolvedValue(null);

      await expect(apiKeyService.revokeApiKey(apiKeyId, userId)).rejects.toThrow(
        AppErrorClass.notFound('API key not found')
      );

      expect(prisma.apiKey.findFirst).toHaveBeenCalledWith({
        where: { id: apiKeyId }
      });
      expect(prisma.apiKey.update).not.toHaveBeenCalled();
    });

    it('should throw error when API key belongs to different user', async () => {
      const { prisma } = require('../../../src/lib/prisma');
      
      const differentUserApiKey = { ...mockApiKeyRecord, userId: 'different-user' };
      prisma.apiKey.findFirst.mockResolvedValue(differentUserApiKey);

      await expect(apiKeyService.revokeApiKey(apiKeyId, userId)).rejects.toThrow(
        AppErrorClass.notFound('API key not found')
      );

      expect(prisma.apiKey.findFirst).toHaveBeenCalledWith({
        where: { id: apiKeyId }
      });
      expect(prisma.apiKey.update).not.toHaveBeenCalled();
    });
  });
});
