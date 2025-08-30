import { AuthService } from '../../../src/services/authService';
import { UserRepository } from '../../../src/repositories/userRepository';
import { AppErrorClass } from '../../../src/utils/errors';

// Mock the UserRepository
jest.mock('../../../src/repositories/userRepository');

const mockUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should create a user successfully', async () => {
      mockUserRepository.prototype.getUserCount.mockResolvedValue(0);
      mockUserRepository.prototype.create.mockResolvedValue(mockUser);

      const result = await authService.createUser(userData);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.prototype.getUserCount).toHaveBeenCalled();
      expect(mockUserRepository.prototype.create).toHaveBeenCalledWith({
        email: userData.email,
        password: expect.any(String), // Hashed password
        firstName: userData.firstName,
        lastName: userData.lastName
      });
    });

    it('should throw error when user limit is reached', async () => {
      const maxUsers = 50;
      mockUserRepository.prototype.getUserCount.mockResolvedValue(maxUsers);

      await expect(authService.createUser(userData)).rejects.toThrow(
        AppErrorClass.userLimitReached(maxUsers)
      );

      expect(mockUserRepository.prototype.getUserCount).toHaveBeenCalled();
      expect(mockUserRepository.prototype.create).not.toHaveBeenCalled();
    });
  });

  describe('validateCredentials', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should validate credentials successfully', async () => {
      mockUserRepository.prototype.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.validateCredentials(credentials);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(credentials.email);
    });

    it('should return null for invalid email', async () => {
      mockUserRepository.prototype.findByEmail.mockResolvedValue(null);

      const result = await authService.validateCredentials(credentials);

      expect(result).toBeNull();
      expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(credentials.email);
    });

    it('should return null for invalid password', async () => {
      mockUserRepository.prototype.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.validateCredentials({
        ...credentials,
        password: 'wrongpassword'
      });

      expect(result).toBeNull();
      expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(credentials.email);
    });
  });

  describe('getUserById', () => {
    it('should get user by ID', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.prototype.findById.mockResolvedValue(mockUser);

      const result = await authService.getUserById('user-123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.prototype.findById).toHaveBeenCalledWith('user-123');
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by email', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.prototype.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });
});
