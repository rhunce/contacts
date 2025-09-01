// Mock environment variables
const originalEnv = process.env;

// Helper function to get fresh module imports
const getFreshLimits = () => {
  jest.resetModules();
  return require('../../utils/limits');
};

describe('Limits Utility', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('getMaxUsers', () => {
    it('returns default value when environment variable is not set', () => {
      delete process.env.NEXT_PUBLIC_MAX_USERS;
      
      const { getMaxUsers } = getFreshLimits();
      
      expect(getMaxUsers()).toBe(50);
    });

    it('returns environment variable value when set', () => {
      process.env.NEXT_PUBLIC_MAX_USERS = '100';
      
      const { getMaxUsers } = getFreshLimits();
      
      expect(getMaxUsers()).toBe(100);
    });

    it('parses string environment variable to number', () => {
      process.env.NEXT_PUBLIC_MAX_USERS = '75';
      
      const { getMaxUsers } = getFreshLimits();
      
      expect(getMaxUsers()).toBe(75);
      expect(typeof getMaxUsers()).toBe('number');
    });
  });

  describe('getMaxContactsPerUser', () => {
    it('returns default value when environment variable is not set', () => {
      delete process.env.NEXT_PUBLIC_MAX_CONTACTS_PER_USER;
      
      const { getMaxContactsPerUser } = getFreshLimits();
      
      expect(getMaxContactsPerUser()).toBe(50);
    });

    it('returns environment variable value when set', () => {
      process.env.NEXT_PUBLIC_MAX_CONTACTS_PER_USER = '200';
      
      const { getMaxContactsPerUser } = getFreshLimits();
      
      expect(getMaxContactsPerUser()).toBe(200);
    });

    it('parses string environment variable to number', () => {
      process.env.NEXT_PUBLIC_MAX_CONTACTS_PER_USER = '150';
      
      const { getMaxContactsPerUser } = getFreshLimits();
      
      expect(getMaxContactsPerUser()).toBe(150);
      expect(typeof getMaxContactsPerUser()).toBe('number');
    });
  });

  describe('edge cases', () => {
    it('handles invalid environment variable values gracefully', () => {
      process.env.NEXT_PUBLIC_MAX_USERS = 'invalid';
      process.env.NEXT_PUBLIC_MAX_CONTACTS_PER_USER = 'not-a-number';
      
      const { getMaxUsers, getMaxContactsPerUser } = getFreshLimits();
      
      // parseInt('invalid') returns NaN, which is the current behavior
      // This test documents the current behavior, not ideal behavior
      expect(getMaxUsers()).toBe(NaN);
      expect(getMaxContactsPerUser()).toBe(NaN);
    });

    it('handles empty environment variable values', () => {
      process.env.NEXT_PUBLIC_MAX_USERS = '';
      process.env.NEXT_PUBLIC_MAX_CONTACTS_PER_USER = '';
      
      const { getMaxUsers, getMaxContactsPerUser } = getFreshLimits();
      
      // Should fall back to default values when empty
      expect(getMaxUsers()).toBe(50);
      expect(getMaxContactsPerUser()).toBe(50);
    });
  });
});
