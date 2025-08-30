import {
  InternalCreateUserDto,
  InternalUpdateUserDto,
  InternalUserDto
} from '../dtos/internal/user.dto';
import { prisma } from '../lib/prisma';

export class UserRepository {
  async findByEmail(email: string): Promise<InternalUserDto | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async findById(id: string): Promise<InternalUserDto | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async create(data: InternalCreateUserDto): Promise<InternalUserDto> {
    return prisma.user.create({
      data
    });
  }

  async update(id: string, data: InternalUpdateUserDto): Promise<InternalUserDto> {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<InternalUserDto> {
    return prisma.user.delete({
      where: { id }
    });
  }

  async getUserCount(): Promise<number> {
    return prisma.user.count();
  }
}
