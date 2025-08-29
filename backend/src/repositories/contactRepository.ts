import { prisma } from '../lib/prisma';
import { 
  InternalContactDto,
  InternalContactWithOwnerDto, 
  InternalCreateContactDto, 
  InternalUpdateContactDto,
  InternalContactHistoryDto,
  InternalContactHistoryWithContactDto
} from '../dtos/internal/contact.dto';
import { PaginationOptionsDto, PaginationResultDto } from '../dtos/shared/pagination.dto';

export class ContactRepository {
  async findById(id: string, ownerId: string): Promise<InternalContactWithOwnerDto | null> {
    return prisma.contact.findFirst({
      where: {
        id,
        ownerId
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            password: true, // Include password for internal use
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  async findByOwnerId(ownerId: string, options: PaginationOptionsDto, filter?: string): Promise<PaginationResultDto<InternalContactWithOwnerDto>> {
    // Build where clause with optional filter
    const whereClause: any = { ownerId };
    
    if (filter && filter !== 'all') {
      whereClause.lastName = {
        startsWith: filter,
        mode: 'insensitive' // Case-insensitive search
      };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where: whereClause,
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' },
          { createdAt: 'asc' }
        ],
        skip: options.skip,
        take: options.pageSize,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              password: true, // Include password for internal use
              createdAt: true,
              updatedAt: true
            }
          }
        }
      }),
      prisma.contact.count({
        where: whereClause
      })
    ]);

    return {
      data: contacts,
      total,
      pagination: {
        page: options.page,
        pageSize: options.pageSize,
        total,
        totalPages: Math.ceil(total / options.pageSize)
      }
    };
  }

  async create(data: InternalCreateContactDto): Promise<InternalContactWithOwnerDto> {
    return prisma.contact.create({
      data,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            password: true, // Include password for internal use
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  async update(id: string, data: InternalUpdateContactDto): Promise<InternalContactWithOwnerDto> {
    return prisma.contact.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            password: true, // Include password for internal use
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  async delete(id: string): Promise<InternalContactWithOwnerDto> {
    return prisma.contact.delete({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            password: true, // Include password for internal use
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  async existsByEmailAndOwner(email: string, ownerId: string): Promise<boolean> {
    const count = await prisma.contact.count({
      where: {
        email,
        ownerId
      }
    });
    return count > 0;
  }

  async findByIdForUpdate(id: string, ownerId: string): Promise<InternalContactDto | null> {
    return prisma.contact.findFirst({
      where: {
        id,
        ownerId
      }
    });
  }

  async getContactCountByOwner(ownerId: string): Promise<number> {
    return prisma.contact.count({
      where: { ownerId }
    });
  }
}
