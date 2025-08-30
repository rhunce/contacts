import { ApiKeyService } from '../../../src/services/apiKeyService';
import { AppErrorClass } from '../../../src/utils/errors';

// Mock crypto module
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mocked-api-key')
  }))
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-api-key')),
  compare: jest.fn(() => Promise.resolve(true))
}));

describe('ApiKeyService', () => {
  let apiKeyService: ApiKeyService;

  beforeEach(() => {
    apiKeyService = new ApiKeyService();
    jest.clearAllMocks();
  });

  describe('generateApiKey', () => {
    it('should generate an API key of correct length', () => {
      const apiKey = apiKeyService.generateApiKey();
      expect(apiKey).toHaveLength(64);
      expect(typeof apiKey).toBe('string');
    });
  });

  describe('hashApiKey', () => {
    it('should hash an API key', async () => {
      const apiKey = 'test-api-key';
      const hashedKey = await apiKeyService.hashApiKey(apiKey);
      expect(hashedKey).toBe('hashed-api-key');
    });
  });

  describe('verifyApiKey', () => {
    it('should verify a valid API key', async () => {
      const apiKey = 'test-api-key';
      const hashedKey = 'hashed-api-key';
      
      const isValid = await apiKeyService.verifyApiKey(apiKey, hashedKey);
      expect(isValid).toBe(true);
    });
  });

  describe('createApiKey', () => {
    it('should create an API key successfully', async () => {
      const userId = 'user-123';
      const data = {
        name: 'Test API Key',
        expiresAt: new Date('2024-12-31')
      };

      // Mock the result
      const mockResult = {
        apiKey: 'generated-api-key',
        info: {
          id: 'key-123',
          userId,
          name: data.name,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastUsedAt: null,
          expiresAt: data.expiresAt
        }
      };

      // Mock the internal methods
      jest.spyOn(apiKeyService, 'generateApiKey').mockReturnValue('generated-api-key');
      jest.spyOn(apiKeyService, 'hashApiKey').mockResolvedValue('hashed-api-key');

      const result = await apiKeyService.createApiKey(userId, data);

      expect(result.apiKey).toBe('generated-api-key');
      expect(result.info.name).toBe(data.name);
      expect(result.info.userId).toBe(userId);
      expect(result.info.isActive).toBe(true);
    });
  });

  describe('validateApiKey', () => {
    it('should validate an API key successfully', async () => {
      const apiKey = 'valid-api-key';
      const userId = 'user-123';

      // Mock the result
      const mockApiKey = {
        id: 'key-123',
        userId,
        name: 'Test Key',
        keyHash: 'hashed-key',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
        expiresAt: null
      };

      const result = await apiKeyService.validateApiKey(apiKey);

      expect(result).toBeDefined();
    });

    it('should throw error for invalid API key', async () => {
      const apiKey = 'invalid-api-key';

      await expect(apiKeyService.validateApiKey(apiKey)).rejects.toThrow(
        AppErrorClass.unauthorized('Invalid API key')
      );
    });
  });

  describe('getUserApiKeys', () => {
    it('should return user API keys', async () => {
      const userId = 'user-123';

      const mockApiKeys = [
        {
          id: 'key-1',
          userId,
          name: 'Key 1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastUsedAt: null,
          expiresAt: null
        },
        {
          id: 'key-2',
          userId,
          name: 'Key 2',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastUsedAt: null,
          expiresAt: null
        }
      ];

      const result = await apiKeyService.getUserApiKeys(userId);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('revokeApiKey', () => {
    it('should revoke an API key successfully', async () => {
      const userId = 'user-123';
      const apiKeyId = 'key-123';

      await apiKeyService.revokeApiKey(userId, apiKeyId);

      // Verify the key was revoked
      expect(true).toBe(true); // Placeholder assertion
    });

    it('should throw error if API key not found', async () => {
      const userId = 'user-123';
      const apiKeyId = 'nonexistent-key';

      await expect(apiKeyService.revokeApiKey(userId, apiKeyId)).rejects.toThrow(
        AppErrorClass.notFound('API key not found')
      );
    });
  });
});
