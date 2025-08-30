import request from 'supertest';
import { app } from '../../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Contacts Endpoints', () => {
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
    await prisma.contact.deleteMany();
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

  describe('POST /api/contact', () => {
    it('should create a contact successfully', async () => {
      const contactData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '123-456-7890'
      };

      const response = await request(app)
        .post('/api/contact')
        .set('Cookie', authCookie)
        .send(contactData)
        .expect(201);

      expect(response.body.status).toBe(201);
      expect(response.body.data).toHaveProperty('contact');
      expect(response.body.data.contact.firstName).toBe(contactData.firstName);
      expect(response.body.data.contact.lastName).toBe(contactData.lastName);
      expect(response.body.data.contact.email).toBe(contactData.email);
      expect(response.body.data.contact.phone).toBe(contactData.phone);
      expect(response.body.data.contact.ownerId).toBe(userId);
    });

    it('should return error for duplicate email', async () => {
      const contactData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '123-456-7890'
      };

      // Create first contact
      await request(app)
        .post('/api/contact')
        .set('Cookie', authCookie)
        .send(contactData)
        .expect(201);

      // Try to create second contact with same email
      const response = await request(app)
        .post('/api/contact')
        .set('Cookie', authCookie)
        .send(contactData)
        .expect(409);

      expect(response.body.status).toBe(409);
      expect(response.body.errors[0].message).toContain('already exists');
    });

    it('should return validation error for invalid email', async () => {
      const contactData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'invalid-email',
        phone: '123-456-7890'
      };

      const response = await request(app)
        .post('/api/contact')
        .set('Cookie', authCookie)
        .send(contactData)
        .expect(400);

      expect(response.body.status).toBe(400);
      expect(response.body.errors[0].type).toBe('VALIDATION_ERROR');
    });

    it('should require authentication', async () => {
      const contactData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '123-456-7890'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(401);

      expect(response.body.status).toBe(401);
    });
  });

  describe('GET /api/contact', () => {
    beforeEach(async () => {
      // Create some test contacts
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

      for (const contact of contacts) {
        await request(app)
          .post('/api/contact')
          .set('Cookie', authCookie)
          .send(contact);
      }
    });

    it('should return user contacts', async () => {
      const response = await request(app)
        .get('/api/contact')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data).toHaveProperty('contacts');
      expect(Array.isArray(response.body.data.contacts)).toBe(true);
      expect(response.body.data.contacts).toHaveLength(2);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/contact')
        .expect(401);

      expect(response.body.status).toBe(401);
    });
  });

  describe('PUT /api/contact/:id', () => {
    let contactId: string;

    beforeEach(async () => {
      // Create a test contact
      const contactData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '123-456-7890'
      };

      const createResponse = await request(app)
        .post('/api/contact')
        .set('Cookie', authCookie)
        .send(contactData);

      contactId = createResponse.body.data.contact.id;
    });

    it('should update a contact successfully', async () => {
      const updateData = {
        firstName: 'Jane Updated',
        lastName: 'Smith Updated',
        email: 'jane.updated@example.com',
        phone: '111-222-3333'
      };

      const response = await request(app)
        .put(`/api/contact/${contactId}`)
        .set('Cookie', authCookie)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data).toHaveProperty('contact');
      expect(response.body.data.contact.firstName).toBe(updateData.firstName);
      expect(response.body.data.contact.lastName).toBe(updateData.lastName);
      expect(response.body.data.contact.email).toBe(updateData.email);
      expect(response.body.data.contact.phone).toBe(updateData.phone);
    });

    it('should return error for non-existent contact', async () => {
      const updateData = {
        firstName: 'Jane Updated',
        lastName: 'Smith Updated',
        email: 'jane.updated@example.com',
        phone: '111-222-3333'
      };

      const response = await request(app)
        .put('/api/contact/non-existent-id')
        .set('Cookie', authCookie)
        .send(updateData)
        .expect(404);

      expect(response.body.status).toBe(404);
      expect(response.body.errors[0].message).toContain('not found');
    });
  });

  describe('DELETE /api/contact/:id', () => {
    let contactId: string;

    beforeEach(async () => {
      // Create a test contact
      const contactData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '123-456-7890'
      };

      const createResponse = await request(app)
        .post('/api/contact')
        .set('Cookie', authCookie)
        .send(contactData);

      contactId = createResponse.body.data.contact.id;
    });

    it('should delete a contact successfully', async () => {
      const response = await request(app)
        .delete(`/api/contact/${contactId}`)
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body.data.message).toContain('deleted successfully');

      // Verify contact is deleted
      const getResponse = await request(app)
        .get('/api/contact')
        .set('Cookie', authCookie);

      expect(getResponse.body.data.contacts).toHaveLength(0);
    });

    it('should return error for non-existent contact', async () => {
      const response = await request(app)
        .delete('/api/contact/non-existent-id')
        .set('Cookie', authCookie)
        .expect(404);

      expect(response.body.status).toBe(404);
      expect(response.body.errors[0].message).toContain('not found');
    });
  });
});
