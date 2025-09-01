import {
  InternalContactHistoryDto,
  InternalCreateContactHistoryDto
} from '../dtos/internal/contact.dto';
import { PaginationOptionsDto, PaginationResultDto } from '../dtos/shared/pagination.dto';
import { prisma } from '../lib/prisma';

export class ContactHistoryRepository {
  async findByContactId(
    contactId: string,
    options: PaginationOptionsDto,
    order: 'asc' | 'desc' = 'desc'
  ): Promise<PaginationResultDto<InternalContactHistoryDto>> {
    const [history, total] = await Promise.all([
      prisma.contactHistory.findMany({
        where: { contactId },
        orderBy: {
          createdAt: order
        },
        skip: options.skip,
        take: options.pageSize
      }),
      prisma.contactHistory.count({
        where: { contactId }
      })
    ]);

    return {
      items: history,
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
}
