import {
  ContactDto,
  CreateContactDto,
  UpdateContactDto
} from '../dtos/external/contact.dto';
import {
  InternalCreateContactDto,
  InternalCreateContactHistoryDto,
  InternalUpdateContactDto
} from '../dtos/internal/contact.dto';
import { ContactMapper } from '../dtos/mappers/contact.mapper';
import { ValidationErrorDto } from '../dtos/shared/common.dto';
import { PaginationOptionsDto, PaginationResultDto } from '../dtos/shared/pagination.dto';
import { ContactHistoryRepository } from '../repositories/contactHistoryRepository';
import { ContactRepository } from '../repositories/contactRepository';
import { AppErrorClass } from '../utils/errors';
import { SSEEventManager } from './sseEventManager';

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

  async getContacts(ownerId: string, page: number, pageSize: number, filter?: string): Promise<PaginationResultDto<ContactDto>> {
    const options: PaginationOptionsDto = {
      page,
      pageSize,
      skip: (page - 1) * pageSize
    };

    const internalResult = await this.contactRepository.findByOwnerId(ownerId, options, filter);
    
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

  async getContactByExternalId(externalId: string, ownerId: string): Promise<ContactDto | null> {
    const internalContact = await this.contactRepository.findByExternalId(externalId, ownerId);
    return internalContact ? ContactMapper.toContactWithOwnerDto(internalContact) : null;
  }

  async createContact(externalData: CreateContactDto, ownerId: string): Promise<ContactDto> {
    // Transform external DTO to internal DTO
    const internalData = ContactMapper.toInternalCreateDto(externalData, ownerId);
    
    // Validate contact data
    const validation = this.validateContactData(internalData);
    if (!validation.isValid) {
      // Use the first validation error for now (we can enhance this later to show multiple errors)
      const firstError = validation.errors[0];
      throw AppErrorClass.validationError(firstError.message, firstError.field);
    }

    // Check if contact with same email already exists for this owner
    const exists = await this.contactRepository.existsByEmailAndOwner(internalData.email, internalData.ownerId);
    if (exists) {
      throw AppErrorClass.duplicateEmail();
    }

    // Check contact limit (configurable via environment variable)
    const maxContacts = parseInt(process.env.MAX_CONTACTS_PER_USER || '50');
    const contactCount = await this.contactRepository.getContactCount(ownerId);
    if (contactCount >= maxContacts) {
      throw AppErrorClass.contactLimitReached(maxContacts);
    }

    // Simulate 20-second delay as requested
    await new Promise(resolve => setTimeout(resolve, 20000));

    const internalContact = await this.contactRepository.create(internalData);
    const externalContact = ContactMapper.toContactWithOwnerDto(internalContact);
    
    // Emit SSE event for real-time updates
    const sseEventManager = SSEEventManager.getInstance();
    sseEventManager.emitContactCreated(ownerId, externalContact);
    
    return externalContact;
  }

  async createContactWithExternalId(externalData: CreateContactDto & { externalId?: string }, ownerId: string): Promise<ContactDto> {
    // Transform external DTO to internal DTO
    const internalData = ContactMapper.toInternalCreateDto(externalData, ownerId);
    
    // Add external ID if provided
    if (externalData.externalId) {
      // Check if external ID already exists globally
      const externalIdExists = await this.contactRepository.existsByExternalId(externalData.externalId);
      if (externalIdExists) {
        throw AppErrorClass.validationError('Contact with this external ID already exists', 'externalId');
      }
      internalData.externalId = externalData.externalId;
    }
    
    // Validate contact data
    const validation = this.validateContactData(internalData);
    if (!validation.isValid) {
      const firstError = validation.errors[0];
      throw AppErrorClass.validationError(firstError.message, firstError.field);
    }

    // Check if contact with same email already exists for this owner
    const exists = await this.contactRepository.existsByEmailAndOwner(internalData.email, internalData.ownerId);
    if (exists) {
      throw AppErrorClass.duplicateEmail();
    }

    // Check contact limit
    const maxContacts = parseInt(process.env.MAX_CONTACTS_PER_USER || '50');
    const contactCount = await this.contactRepository.getContactCount(ownerId);
    if (contactCount >= maxContacts) {
      throw AppErrorClass.contactLimitReached(maxContacts);
    }

    const internalContact = await this.contactRepository.create(internalData);
    const externalContact = ContactMapper.toContactWithOwnerDto(internalContact);
    
    // Emit SSE event for real-time updates
    const sseEventManager = SSEEventManager.getInstance();
    sseEventManager.emitContactCreated(ownerId, externalContact);
    
    return externalContact;
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
      // Validate email format if it's being updated
      if (!this.isValidEmail(internalUpdateData.email)) {
        throw AppErrorClass.validationError(
          'Please enter a valid email address (e.g., john.doe@example.com)', 
          'email'
        );
      }
      finalUpdateData.email = internalUpdateData.email;
      historyChanges.email = { before: currentContact.email, after: internalUpdateData.email };
    }

    if (internalUpdateData.phone && internalUpdateData.phone !== currentContact.phone) {
      finalUpdateData.phone = internalUpdateData.phone;
      historyChanges.phone = { before: currentContact.phone, after: internalUpdateData.phone };
    }

    if (Object.keys(finalUpdateData).length === 0) {
      throw AppErrorClass.validationError('No changes provided');
    }

    // Check for email conflicts if email is being updated
    if (finalUpdateData.email) {
      const exists = await this.contactRepository.existsByEmailAndOwner(finalUpdateData.email, ownerId, id);
      if (exists) {
        throw AppErrorClass.duplicateEmail();
      }
    }

    // Update contact and create history
    const [updatedContact] = await Promise.all([
      this.contactRepository.update(id, finalUpdateData),
      this.contactHistoryRepository.create(historyChanges)
    ]);

    const externalContact = ContactMapper.toContactWithOwnerDto(updatedContact);
    
    // Emit SSE event for real-time updates
    const sseEventManager = SSEEventManager.getInstance();
    sseEventManager.emitContactUpdated(ownerId, externalContact);
    
    return externalContact;
  }

  async updateContactByExternalId(externalId: string, ownerId: string, externalUpdateData: UpdateContactDto): Promise<ContactDto> {
    // Get current contact by external ID
    const currentContact = await this.contactRepository.findByExternalIdForUpdate(externalId, ownerId);
    if (!currentContact) {
      throw AppErrorClass.notFound('Contact not found');
    }

    // Transform external DTO to internal DTO
    const internalUpdateData = ContactMapper.toInternalUpdateDto(externalUpdateData);

    // Prepare update data and history changes
    const finalUpdateData: InternalUpdateContactDto = {};
    const historyChanges: InternalCreateContactHistoryDto = {
      contactId: currentContact.id
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
      // Validate email format if it's being updated
      if (!this.isValidEmail(internalUpdateData.email)) {
        throw AppErrorClass.validationError(
          'Please enter a valid email address (e.g., john.doe@example.com)', 
          'email'
        );
      }
      finalUpdateData.email = internalUpdateData.email;
      historyChanges.email = { before: currentContact.email, after: internalUpdateData.email };
    }

    if (internalUpdateData.phone && internalUpdateData.phone !== currentContact.phone) {
      finalUpdateData.phone = internalUpdateData.phone;
      historyChanges.phone = { before: currentContact.phone, after: internalUpdateData.phone };
    }

    if (Object.keys(finalUpdateData).length === 0) {
      throw AppErrorClass.validationError('No changes provided');
    }

    // Check for email conflicts if email is being updated
    if (finalUpdateData.email) {
      const exists = await this.contactRepository.existsByEmailAndOwner(finalUpdateData.email, ownerId, currentContact.id);
      if (exists) {
        throw AppErrorClass.duplicateEmail();
      }
    }

    // Update contact and create history
    const [updatedContact] = await Promise.all([
      this.contactRepository.updateByExternalId(externalId, ownerId, finalUpdateData),
      this.contactHistoryRepository.create(historyChanges)
    ]);

    const externalContact = ContactMapper.toContactWithOwnerDto(updatedContact);
    
    // Emit SSE event for real-time updates
    const sseEventManager = SSEEventManager.getInstance();
    sseEventManager.emitContactUpdated(ownerId, externalContact);
    
    return externalContact;
  }

  async deleteContact(id: string, ownerId: string): Promise<ContactDto> {
    const contact = await this.contactRepository.findById(id, ownerId);
    if (!contact) {
      throw AppErrorClass.validationError('Contact not found');
    }

    const deletedContact = await this.contactRepository.delete(id);
    const externalContact = ContactMapper.toContactWithOwnerDto(deletedContact);
    
    // Emit SSE event for real-time updates
    const sseEventManager = SSEEventManager.getInstance();
    sseEventManager.emitContactDeleted(ownerId, id);
    
    return externalContact;
  }

  async deleteContactByExternalId(externalId: string, ownerId: string): Promise<ContactDto> {
    const contactExists = await this.contactRepository.existsByExternalIdAndOwner(externalId, ownerId);
    if (!contactExists) {
      throw AppErrorClass.notFound('Contact not found');
    }

    const deletedContact = await this.contactRepository.deleteByExternalId(externalId, ownerId);
    const externalContact = ContactMapper.toContactWithOwnerDto(deletedContact);
    
    // Emit SSE event for real-time updates
    const sseEventManager = SSEEventManager.getInstance();
    sseEventManager.emitContactDeleted(ownerId, deletedContact.id);
    
    return externalContact;
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
      errors.push({ 
        message: 'Please enter a valid email address (e.g., john.doe@example.com)', 
        field: 'email' 
      });
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
    // More comprehensive email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
