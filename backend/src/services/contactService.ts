import { ContactRepository } from '../repositories/contactRepository';
import { ContactHistoryRepository } from '../repositories/contactHistoryRepository';
import { 
  InternalContactWithOwnerDto, 
  InternalCreateContactDto, 
  InternalUpdateContactDto,
  InternalCreateContactHistoryDto
} from '../dtos/internal/contact.dto';
import { 
  ContactDto, 
  CreateContactDto, 
  UpdateContactDto
} from '../dtos/external/contact.dto';
import { PaginationResultDto } from '../dtos/shared/pagination.dto';
import { PaginationOptionsDto } from '../dtos/shared/pagination.dto';
import { ContactMapper } from '../dtos/mappers/contact.mapper';
import { ValidationErrorDto } from '../dtos/shared/common.dto';

export interface ContactValidationResult {
  isValid: boolean;
  errors: ValidationErrorDto[];
}

export class ContactService {
  private contactRepository: ContactRepository;
  private contactHistoryRepository: ContactHistoryRepository;

  constructor() {
    this.contactRepository = new ContactRepository();
    this.contactHistoryRepository = new ContactHistoryRepository();
  }

  async getContacts(ownerId: string, page: number, pageSize: number): Promise<PaginationResultDto<ContactDto>> {
    const options: PaginationOptionsDto = {
      page,
      pageSize,
      skip: (page - 1) * pageSize
    };

    const internalResult = await this.contactRepository.findByOwnerId(ownerId, options);
    
    // Transform internal DTOs to external DTOs
    const externalData = internalResult.data.map(contact => ContactMapper.toContactWithOwnerDto(contact));
    
    return {
      data: externalData,
      total: internalResult.total,
      pagination: internalResult.pagination
    };
  }

  async getContact(id: string, ownerId: string): Promise<ContactDto | null> {
    const internalContact = await this.contactRepository.findById(id, ownerId);
    return internalContact ? ContactMapper.toContactWithOwnerDto(internalContact) : null;
  }

  async createContact(externalData: CreateContactDto, ownerId: string): Promise<ContactDto> {
    // Transform external DTO to internal DTO
    const internalData = ContactMapper.toInternalCreateDto(externalData, ownerId);
    
    // Validate contact data
    const validation = this.validateContactData(internalData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Check if contact with same email already exists for this owner
    const exists = await this.contactRepository.existsByEmailAndOwner(internalData.email, internalData.ownerId);
    if (exists) {
      throw new Error('Contact with this email already exists');
    }

    // Simulate 20-second delay as requested
    await new Promise(resolve => setTimeout(resolve, 20000));

    const internalContact = await this.contactRepository.create(internalData);
    return ContactMapper.toContactWithOwnerDto(internalContact);
  }

  async updateContact(id: string, ownerId: string, externalUpdateData: UpdateContactDto): Promise<ContactDto> {
    // Get current contact
    const currentContact = await this.contactRepository.findByIdForUpdate(id, ownerId);
    if (!currentContact) {
      throw new Error('Contact not found');
    }

    // Transform external DTO to internal DTO
    const internalUpdateData = ContactMapper.toInternalUpdateDto(externalUpdateData);

    // Prepare update data and history changes
    const finalUpdateData: InternalUpdateContactDto = {};
    const historyChanges: InternalCreateContactHistoryDto = {
      contactId: id
    };

    if (internalUpdateData.firstName && internalUpdateData.firstName !== currentContact.firstName) {
      finalUpdateData.firstName = internalUpdateData.firstName;
      historyChanges.firstName = { before: currentContact.firstName, after: internalUpdateData.firstName };
    }

    if (internalUpdateData.lastName && internalUpdateData.lastName !== currentContact.lastName) {
      finalUpdateData.lastName = internalUpdateData.lastName;
      historyChanges.lastName = { before: currentContact.lastName, after: internalUpdateData.lastName };
    }

    if (internalUpdateData.email && internalUpdateData.email !== currentContact.email) {
      finalUpdateData.email = internalUpdateData.email;
      historyChanges.email = { before: currentContact.email, after: internalUpdateData.email };
    }

    if (internalUpdateData.phone && internalUpdateData.phone !== currentContact.phone) {
      finalUpdateData.phone = internalUpdateData.phone;
      historyChanges.phone = { before: currentContact.phone, after: internalUpdateData.phone };
    }

    if (Object.keys(finalUpdateData).length === 0) {
      throw new Error('No changes provided');
    }

    // Check for email conflicts if email is being updated
    if (finalUpdateData.email) {
      const exists = await this.contactRepository.existsByEmailAndOwner(finalUpdateData.email, ownerId);
      if (exists) {
        throw new Error('Contact with this email already exists');
      }
    }

    // Update contact and create history in a transaction
    const [updatedContact] = await Promise.all([
      this.contactRepository.update(id, finalUpdateData),
      this.contactHistoryRepository.createWithTransaction(historyChanges)
    ]);

    return ContactMapper.toContactWithOwnerDto(updatedContact);
  }

  async deleteContact(id: string, ownerId: string): Promise<ContactDto> {
    const contact = await this.contactRepository.findById(id, ownerId);
    if (!contact) {
      throw new Error('Contact not found');
    }

    const deletedContact = await this.contactRepository.delete(id);
    return ContactMapper.toContactWithOwnerDto(deletedContact);
  }

  private validateContactData(data: InternalCreateContactDto): ContactValidationResult {
    const errors: ValidationErrorDto[] = [];

    if (!data.firstName?.trim()) {
      errors.push({ message: 'First name is required', field: 'firstName' });
    }

    if (!data.lastName?.trim()) {
      errors.push({ message: 'Last name is required', field: 'lastName' });
    }

    if (!data.email?.trim()) {
      errors.push({ message: 'Email is required', field: 'email' });
    } else if (!this.isValidEmail(data.email)) {
      errors.push({ message: 'Invalid email format', field: 'email' });
    }

    if (!data.phone?.trim()) {
      errors.push({ message: 'Phone is required', field: 'phone' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
