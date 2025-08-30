import bcrypt from 'bcryptjs';
import { LoginRequestDto, UserSessionDto } from '../dtos/external/user.dto';
import { InternalUserDto } from '../dtos/internal/user.dto';
import { UserMapper } from '../dtos/mappers/user.mapper';
import { UserRepository } from '../repositories/userRepository';
import { AppErrorClass } from '../utils/errors';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async validateCredentials(credentials: LoginRequestDto): Promise<InternalUserDto | null> {
    const { email, password } = credentials;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async createUserSession(user: InternalUserDto): Promise<UserSessionDto> {
    return UserMapper.toUserSessionDto({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getUserById(userId: string): Promise<InternalUserDto | null> {
    return this.userRepository.findById(userId);
  }

  async getUserByEmail(email: string): Promise<InternalUserDto | null> {
    return this.userRepository.findByEmail(email);
  }

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<InternalUserDto> {
    // Check Global user limit (configurable)
    const maxUsers = parseInt(process.env.MAX_USERS || '50');
    const userCount = await this.userRepository.getUserCount();
    if (userCount >= maxUsers) {
      throw AppErrorClass.userLimitReached(maxUsers);
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(userData.password);

    // Create user
    const user = await this.userRepository.create({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName
    });

    return user;
  }
}
