import {
  ContactDto,
  ContactHistoryDto,
  CreateContactDto,
  UpdateContactDto
} from '../external/contact.dto';
import {
  InternalContactDto,
  InternalContactHistoryDto,
  InternalContactWithOwnerDto,
  InternalCreateContactDto,
  InternalUpdateContactDto
} from '../internal/contact.dto';

// Mapper functions to transform between internal and external DTOs

export class ContactMapper {
  // Transform internal contact to external contact (removes sensitive data)
  static toContactDto(internal: InternalContactDto): Omit<ContactDto, 'owner'> {
    return {
      id: internal.id,
      firstName: internal.firstName,
      lastName: internal.lastName,
      email: internal.email,
      phone: internal.phone,
      createdAt: internal.createdAt.toISOString(),
      updatedAt: internal.updatedAt.toISOString(),
    };
  }

  // Transform internal contact with owner to external contact with owner
  static toContactWithOwnerDto(internal: InternalContactWithOwnerDto): ContactDto {
    return {
      id: internal.id,
      firstName: internal.firstName,
      lastName: internal.lastName,
      email: internal.email,
      phone: internal.phone,
      createdAt: internal.createdAt.toISOString(),
      updatedAt: internal.updatedAt.toISOString(),
      owner: {
        id: internal.owner.id,
        firstName: internal.owner.firstName,
        lastName: internal.owner.lastName,
        email: internal.owner.email,
        // NO password field - security!
      }
    };
  }

  // Transform external create contact to internal create contact
  static toInternalCreateDto(external: CreateContactDto, ownerId: string): InternalCreateContactDto {
    return {
      ownerId,
      firstName: external.firstName,
      lastName: external.lastName,
      email: external.email,
      phone: external.phone
    };
  }

  // Transform external update contact to internal update contact
  static toInternalUpdateDto(external: UpdateContactDto): InternalUpdateContactDto {
    const update: InternalUpdateContactDto = {};
    
    if (external.firstName !== undefined) update.firstName = external.firstName;
    if (external.lastName !== undefined) update.lastName = external.lastName;
    if (external.email !== undefined) update.email = external.email;
    if (external.phone !== undefined) update.phone = external.phone;
    
    return update;
  }

  // Transform internal contact history to external contact history
  static toContactHistoryDto(internal: InternalContactHistoryDto): ContactHistoryDto {
    const result: ContactHistoryDto = {
      id: internal.id,
      createdAt: internal.createdAt.toISOString(),
      updatedAt: internal.createdAt.toISOString(), // ContactHistory doesn't have updatedAt, use createdAt
    };

    // Only include fields that actually changed (not null)
    if (internal.firstName !== null) {
      result.firstName = internal.firstName as { before: string; after: string };
    }
    if (internal.lastName !== null) {
      result.lastName = internal.lastName as { before: string; after: string };
    }
    if (internal.email !== null) {
      result.email = internal.email as { before: string; after: string };
    }
    if (internal.phone !== null) {
      result.phone = internal.phone as { before: string; after: string };
    }

    return result;
  }
}
