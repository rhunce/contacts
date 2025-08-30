import { prisma } from '../lib/prisma';
import { 
  InternalContactHistoryDto,
  InternalContactHistoryWithContactDto,
  InternalCreateContactHistoryDto
} from '../dtos/internal/contact.dto';
import { PaginationOptionsDto, PaginationResultDto } from '../dtos/shared/pagination.dto';

export class ContactHistoryRepository {
  async findByContactId(
    contactId: string,
    options: PaginationOptionsDto,
    order: 'asc' | 'desc' = 'desc'
  ): Promise<PaginationResultDto<InternalContactHistoryWithContactDto>> {
    const [history, total] = await Promise.all([
      prisma.contactHistory.findMany({
        where: { contactId },
        orderBy: {
          createdAt: order
        },
        skip: options.skip,
        take: options.pageSize,
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              ownerId: true,
              externalId: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      }),
      prisma.contactHistory.count({
        where: { contactId }
      })
    ]);

    return {
      data: history,
      total,
      pagination: {
        page: options.page,
        pageSize: options.pageSize,
        total,
        totalPages: Math.ceil(total / options.pageSize)
      }
    };
  }

  async create(data: InternalCreateContactHistoryDto): Promise<InternalContactHistoryDto> {
    return prisma.contactHistory.create({
      data
    });
  }

  async createWithTransaction(data: InternalCreateContactHistoryDto): Promise<InternalContactHistoryDto> {
    return prisma.contactHistory.create({
      data
    });
  }

  async findByContactIdForValidation(contactId: string): Promise<Pick<InternalContactHistoryDto, 'id'>[]> {
    return prisma.contactHistory.findMany({
      where: { contactId },
      select: { id: true }
    });
  }
}
