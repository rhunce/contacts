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

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockUser = {
        id: 'user-123',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.prototype.findByEmail.mockResolvedValue(null);
      mockUserRepository.prototype.create.mockResolvedValue(mockUser);

      const result = await authService.register(userData);

      expect(result.user.email).toBe(userData.email);
      expect(result.user.firstName).toBe(userData.firstName);
      expect(result.user.lastName).toBe(userData.lastName);
      expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.prototype.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        })
      );
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const existingUser = {
        id: 'user-123',
        email: userData.email,
        firstName: 'Jane',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.prototype.findByEmail.mockResolvedValue(existingUser);

      await expect(authService.register(userData)).rejects.toThrow(
        AppErrorClass.conflict('User with this email already exists')
      );
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2b$10$hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserRepository.prototype.findByEmail.mockResolvedValue(mockUser);
      mockUserRepository.prototype.updateLastLogin.mockResolvedValue(mockUser);

      const result = await authService.login(loginData);

      expect(result.user.email).toBe(loginData.email);
      expect(mockUserRepository.prototype.findByEmail).toHaveBeenCalledWith(loginData.email);
    });

    it('should throw error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      mockUserRepository.prototype.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(
        AppErrorClass.unauthorized('Invalid email or password')
      );
    });
  });
});
