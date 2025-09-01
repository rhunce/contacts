import { Contact, ContactHistory } from '@prisma/client';
import { BaseEntityInternalDto } from '../shared/common.dto';

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
  firstName?: any; // JsonValue from Prisma
  lastName?: any; // JsonValue from Prisma
  email?: any; // JsonValue from Prisma
  phone?: any; // JsonValue from Prisma
  createdAt: Date;
  // Note: ContactHistory doesn't have updatedAt in the schema
}

export interface InternalCreateContactHistoryDto {
  contactId: string;
  firstName?: { before: string; after: string };
  lastName?: { before: string; after: string };
  email?: { before: string; after: string };
  phone?: { before: string; after: string };
}
