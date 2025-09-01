import { Contact, Prisma } from '@prisma/client';
import { BaseEntityInternalDto, ContactHistoryChangeDto } from '../shared/common.dto';

// Internal DTOs - Used between Repository and Service layers
// These can include sensitive data and internal fields

export interface InternalContactDto extends Contact, BaseEntityInternalDto {
  // Full contact data including internal fields
  id: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InternalContactWithOwnerDto extends InternalContactDto {
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string; // Internal - includes sensitive data
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface InternalCreateContactDto {
  ownerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  externalId?: string;
}

export interface InternalUpdateContactDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface InternalContactHistoryDto {
  id: string;
  contactId: string;
  firstName?: Prisma.JsonValue;
  lastName?: Prisma.JsonValue;
  email?: Prisma.JsonValue;
  phone?: Prisma.JsonValue;
  createdAt: Date;
  // Note: ContactHistory doesn't have updatedAt in the schema
}

export interface InternalCreateContactHistoryDto {
  contactId: string;
  firstName?: ContactHistoryChangeDto;
  lastName?: ContactHistoryChangeDto;
  email?: ContactHistoryChangeDto;
  phone?: ContactHistoryChangeDto;
}
