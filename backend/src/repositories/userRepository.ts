import { prisma } from '../lib/prisma';
import { 
  InternalUserDto, 
  InternalUserWithContactsDto, 
  InternalCreateUserDto, 
  InternalUpdateUserDto 
} from '../dtos/internal/user.dto';

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

  async findByIdWithContacts(id: string): Promise<InternalUserWithContactsDto | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        contacts: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
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

  async exists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email }
    });
    return count > 0;
  }

  async getUserCount(): Promise<number> {
    return prisma.user.count();
  }
}
