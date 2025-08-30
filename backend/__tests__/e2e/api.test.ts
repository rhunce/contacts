import request from 'supertest';
import { app } from '../../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('API End-to-End Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up all test data
    await prisma.contactHistory.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('Complete User Workflow', () => {
    it('should handle complete user registration, login, and contact management', async () => {
      // 1. Register a new user
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const registerResponse = await request(app)
        .post('/register')
        .send(userData)
        .expect(201);

      const userId = registerResponse.body.data.user.id;
      expect(userId).toBeDefined();

      // 2. Login the user
      const loginResponse = await request(app)
        .post('/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      const authCookie = loginResponse.headers['set-cookie'][0];
      expect(authCookie).toBeDefined();

      // 3. Verify user can access protected endpoint
      const meResponse = await request(app)
        .get('/me')
        .set('Cookie', authCookie)
        .expect(200);

      expect(meResponse.body.data.user.email).toBe(userData.email);

      // 4. Create contacts
      const contacts = [
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '123-456-7890'
        },
        {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob.johnson@example.com',
          phone: '098-765-4321'
        }
      ];

      const createdContacts = [];
      for (const contact of contacts) {
        const createResponse = await request(app)
          .post('/contact')
          .set('Cookie', authCookie)
          .send(contact)
          .expect(201);

        createdContacts.push(createResponse.body.data.contact);
      }

      expect(createdContacts).toHaveLength(2);

      // 5. Get all contacts
      const getContactsResponse = await request(app)
        .get('/contact')
        .set('Cookie', authCookie)
        .expect(200);

      expect(getContactsResponse.body.data.contacts).toHaveLength(2);

      // 6. Update a contact
      const contactToUpdate = createdContacts[0];
      const updateData = {
        firstName: 'Jane Updated',
        lastName: 'Smith Updated',
        email: 'jane.updated@example.com',
        phone: '111-222-3333'
      };

      const updateResponse = await request(app)
        .put(`/contact/${contactToUpdate.id}`)
        .set('Cookie', authCookie)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.data.contact.firstName).toBe(updateData.firstName);

      // 7. Create API key
      const apiKeyData = { name: 'Test API Key' };
      const createKeyResponse = await request(app)
        .post('/api/keys')
        .set('Cookie', authCookie)
        .send(apiKeyData)
        .expect(201);

      const apiKey = createKeyResponse.body.data.apiKey;
      const apiKeyInfo = createKeyResponse.body.data.info;
      expect(apiKey).toHaveLength(64);
      expect(apiKeyInfo.name).toBe(apiKeyData.name);

      // 8. Use API key to access external endpoints
      const externalContactData = {
        firstName: 'External',
        lastName: 'Contact',
        email: 'external@example.com',
        phone: '555-555-5555'
      };

      const externalCreateResponse = await request(app)
        .post('/api/external/contact')
        .set('X-API-Key', apiKey)
        .send(externalContactData)
        .expect(201);

      expect(externalCreateResponse.body.data.contact.firstName).toBe(externalContactData.firstName);

      // 9. Get API keys
      const getKeysResponse = await request(app)
        .get('/api/keys')
        .set('Cookie', authCookie)
        .expect(200);

      expect(getKeysResponse.body.data.apiKeys).toHaveLength(1);

      // 10. Revoke API key
      const revokeResponse = await request(app)
        .delete(`/api/keys/${apiKeyInfo.id}`)
        .set('Cookie', authCookie)
        .expect(200);

      expect(revokeResponse.body.data.message).toContain('revoked successfully');

      // 11. Verify API key no longer works
      const failedExternalResponse = await request(app)
        .post('/api/external/contact')
        .set('X-API-Key', apiKey)
        .send(externalContactData)
        .expect(401);

      expect(failedExternalResponse.body.status).toBe(401);

      // 12. Delete a contact
      const contactToDelete = createdContacts[1];
      const deleteResponse = await request(app)
        .delete(`/contact/${contactToDelete.id}`)
        .set('Cookie', authCookie)
        .expect(200);

      expect(deleteResponse.body.data.message).toContain('deleted successfully');

      // 13. Verify contact count decreased
      const finalContactsResponse = await request(app)
        .get('/contact')
        .set('Cookie', authCookie)
        .expect(200);

      expect(finalContactsResponse.body.data.contacts).toHaveLength(1);

      // 14. Logout
      const logoutResponse =       await request(app)
        .post('/logout')
        .set('Cookie', authCookie)
        .expect(200);

      expect(logoutResponse.body.data.message).toContain('Logged out successfully');

      // 15. Verify user can no longer access protected endpoints
      const failedMeResponse = await request(app)
        .get('/me')
        .set('Cookie', authCookie)
        .expect(401);

      expect(failedMeResponse.body.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors properly', async () => {
      // Try to access protected endpoint without authentication
      const response = await request(app)
        .get('/contact')
        .expect(401);

      expect(response.body.status).toBe(401);
      expect(response.body.errors[0].message).toContain('Authentication required');
    });

    it('should handle validation errors properly', async () => {
      // Try to register with missing required fields
      const response = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
          // Missing firstName and lastName
        })
        .expect(400);

      expect(response.body.status).toBe(400);
      expect(response.body.errors[0].type).toBe('VALIDATION_ERROR');
    });

    it('should handle not found errors properly', async () => {
      // Create and login a user
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      await request(app)
        .post('/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      const authCookie = loginResponse.headers['set-cookie'][0];

      // Try to access non-existent contact
      const response = await request(app)
        .get('/contact/non-existent-id')
        .set('Cookie', authCookie)
        .expect(404);

      expect(response.body.status).toBe(404);
      expect(response.body.errors[0].message).toContain('not found');
    });
  });

  describe('Rate Limiting and Security', () => {
    it('should prevent duplicate email registrations', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      // First registration should succeed
      await request(app)
        .post('/register')
        .send(userData)
        .expect(201);

      // Second registration with same email should fail
      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe(400);
      expect(response.body.errors[0].message).toContain('already exists');
    });

    it('should prevent duplicate contact emails for same user', async () => {
      // Create and login a user
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      await request(app)
        .post('/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      const authCookie = loginResponse.headers['set-cookie'][0];

      const contactData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '123-456-7890'
      };

      // First contact should succeed
      await request(app)
        .post('/contact')
        .set('Cookie', authCookie)
        .send(contactData)
        .expect(201);

      // Second contact with same email should fail
      const response = await request(app)
        .post('/contact')
        .set('Cookie', authCookie)
        .send(contactData)
        .expect(409);

      expect(response.body.status).toBe(409);
      expect(response.body.errors[0].message).toContain('You already have a contact with this email address');
    });
  });
});
