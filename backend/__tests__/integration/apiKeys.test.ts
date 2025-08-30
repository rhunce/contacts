import request from 'supertest';
import { app } from '../../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API Keys Endpoints', () => {
  let authCookie: string;
  let userId: string;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.apiKey.deleteMany();
    await prisma.user.deleteMany();

    // Create and login a test user
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    const registerResponse = await request(app)
      .post('/register')
      .send(userData);

    userId = registerResponse.body.data.user.id;

    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authCookie = loginResponse.headers['set-cookie'][0];
  });

  describe('POST /api/keys', () => {
    it('should create an API key successfully', async () => {
      const keyData = {
        name: 'Test API Key'
      };

      const response = await request(app)
        .post('/api/keys')
        .set('Cookie', authCookie)
        .send(keyData)
        .expect(201);

      expect(response.body.status).toBe(201);
      expect(response.body.data).toHaveProperty('apiKey');
      expect(response.body.data).toHaveProperty('info');
      expect(response.body.data.info.name).toBe(keyData.name);
      expect(response.body.data.info.isActive).toBe(true);
      expect(response.body.data.apiKey).toHaveLength(64);
    });

    it('should require authentication', async () => {
      const keyData = {
        name: 'Test API Key'
      };

      const response = await request(app)
        .post('/api/keys')
        .send(keyData)
        .expect(401);

      expect(response.body.status).toBe(401);
    });

    it('should return validation error for missing name', async () => {
      const keyData = {};

      const response = await request(app)
        .post('/api/keys')
        .set('Cookie', authCookie)
        .send(keyData)
        .expect(400);

      expect(response.body.status).toBe(400);
      expect(response.body.errors[0].type).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/keys', () => {
    beforeEach(async () => {
      // Create some test API keys
      const keys = [
        { name: 'Key 1' },
        { name: 'Key 2' }
      ];

      for (const key of keys) {
        await request(app)
          .post('/api/keys')
          .set('Cookie', authCookie)
          .send(key);
      }
    });

    it('should return user API keys', async () => {
      const response = await request(app)
        .get('/api/keys')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data).toHaveProperty('apiKeys');
      expect(Array.isArray(response.body.data.apiKeys)).toBe(true);
      expect(response.body.data.apiKeys).toHaveLength(2);
      expect(response.body.data.apiKeys[0]).toHaveProperty('name');
      expect(response.body.data.apiKeys[0]).toHaveProperty('isActive');
      expect(response.body.data.apiKeys[0]).not.toHaveProperty('keyHash');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/keys')
        .expect(401);

      expect(response.body.status).toBe(401);
    });
  });

  describe('DELETE /api/keys/:id', () => {
    let apiKeyId: string;

    beforeEach(async () => {
      // Create a test API key
      const keyData = { name: 'Test Key' };

      const createResponse = await request(app)
        .post('/api/keys')
        .set('Cookie', authCookie)
        .send(keyData);

      apiKeyId = createResponse.body.data.info.id;
    });

    it('should revoke an API key successfully', async () => {
      const response = await request(app)
        .delete(`/api/keys/${apiKeyId}`)
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data.message).toContain('revoked successfully');

      // Verify key is revoked
      const getResponse = await request(app)
        .get('/api/keys')
        .set('Cookie', authCookie);

      const revokedKey = getResponse.body.data.apiKeys.find((key: any) => key.id === apiKeyId);
      expect(revokedKey.isActive).toBe(false);
    });

    it('should return error for non-existent API key', async () => {
      const response = await request(app)
        .delete('/api/keys/non-existent-id')
        .set('Cookie', authCookie)
        .expect(404);

      expect(response.body.status).toBe(404);
      expect(response.body.errors[0].message).toContain('not found');
    });
  });

  describe('POST /api/keys/:id/restore', () => {
    let apiKeyId: string;

    beforeEach(async () => {
      // Create and revoke a test API key
      const keyData = { name: 'Test Key' };

      const createResponse = await request(app)
        .post('/api/keys')
        .set('Cookie', authCookie)
        .send(keyData);

      apiKeyId = createResponse.body.data.info.id;

      await request(app)
        .delete(`/api/keys/${apiKeyId}`)
        .set('Cookie', authCookie);
    });

    it('should restore a revoked API key successfully', async () => {
      const response = await request(app)
        .post(`/api/keys/${apiKeyId}/restore`)
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data.message).toContain('restored successfully');

      // Verify key is restored
      const getResponse = await request(app)
        .get('/api/keys')
        .set('Cookie', authCookie);

      const restoredKey = getResponse.body.data.apiKeys.find((key: any) => key.id === apiKeyId);
      expect(restoredKey.isActive).toBe(true);
    });
  });

  describe('DELETE /api/keys/:id/permanent', () => {
    let apiKeyId: string;

    beforeEach(async () => {
      // Create a test API key
      const keyData = { name: 'Test Key' };

      const createResponse = await request(app)
        .post('/api/keys')
        .set('Cookie', authCookie)
        .send(keyData);

      apiKeyId = createResponse.body.data.info.id;
    });

    it('should permanently delete an API key', async () => {
      const response = await request(app)
        .delete(`/api/keys/${apiKeyId}/permanent`)
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data.message).toContain('permanently deleted');

      // Verify key is deleted
      const getResponse = await request(app)
        .get('/api/keys')
        .set('Cookie', authCookie);

      expect(getResponse.body.data.apiKeys).toHaveLength(0);
    });
  });
});
