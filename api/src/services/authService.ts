import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/userRepository';
import { InternalUserDto } from '../dtos/internal/user.dto';
import { UserSessionDto, LoginRequestDto } from '../dtos/external/user.dto';
import { UserMapper } from '../dtos/mappers/user.mapper';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async validateCredentials(credentials: LoginRequestDto): Promise<InternalUserDto | null> {
    const { email, hashedPassword } = credentials;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(hashedPassword, user.password);
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
}
