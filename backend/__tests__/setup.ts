import { PrismaClient } from '@prisma/client';

// Global test setup
global.beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/contacts_test';
  
  // Ensure we're using the test database
  if (!process.env.DATABASE_URL?.includes('test')) {
    throw new Error('Tests must use a test database! Check TEST_DATABASE_URL environment variable.');
  }
});

// Global test teardown
global.afterAll(async () => {
  // Clean up any global resources
  // Note: The test database will be destroyed by the CI/CD system
});

// Clean up after each test
global.afterEach(async () => {
  // This ensures each test starts with a clean slate
  // Individual test files handle their own cleanup
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: global.jest.fn(),
  debug: global.jest.fn(),
  info: global.jest.fn(),
  warn: global.jest.fn(),
  error: global.jest.fn(),
};
