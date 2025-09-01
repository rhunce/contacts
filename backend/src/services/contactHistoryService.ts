import { ContactHistoryDto } from '../dtos/external/contact.dto';
import { ContactMapper } from '../dtos/mappers/contact.mapper';
import { PaginationOptionsDto, PaginationResultDto } from '../dtos/shared/pagination.dto';
import { ContactHistoryRepository } from '../repositories/contactHistoryRepository';
import { ContactRepository } from '../repositories/contactRepository';

export class ContactHistoryService {
  private contactHistoryRepository: ContactHistoryRepository;
  private contactRepository: ContactRepository;

  constructor() {
    this.contactHistoryRepository = new ContactHistoryRepository();
    this.contactRepository = new ContactRepository();
  }

  async getContactHistory(
    contactId: string,
    ownerId: string,
    page: number,
    pageSize: number,
    order: 'asc' | 'desc' = 'desc'
  ): Promise<PaginationResultDto<ContactHistoryDto>> {
    // Verify the contact belongs to the user
    const contact = await this.contactRepository.findById(contactId, ownerId);
    if (!contact) {
      throw new Error('Contact not found');
    }

    const options: PaginationOptionsDto = {
      page,
      pageSize,
      skip: (page - 1) * pageSize
    };

    const internalResult = await this.contactHistoryRepository.findByContactId(contactId, options, order);
    
    // Transform internal DTOs to external DTOs
    const externalData = internalResult.items.map(history => ContactMapper.toContactHistoryDto(history));
    
    return {
      items: externalData,
      total: internalResult.total,
      pagination: internalResult.pagination
    };
  }
}
