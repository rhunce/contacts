// Test setup file - runs before all tests
// Set default test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/contacts_test';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret';
process.env.MAX_CONTACTS_PER_USER = process.env.MAX_CONTACTS_PER_USER || '50';
process.env.PORT = process.env.PORT || '3001';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379/1';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3002';


