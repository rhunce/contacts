import { User } from '@prisma/client';
import { BaseEntityInternalDto } from '../shared/common.dto';

// Internal DTOs - Used between Repository and Service layers
// These can include sensitive data and internal fields

export interface InternalUserDto extends User, BaseEntityInternalDto {
  // Full user data including sensitive fields
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // Internal - includes sensitive data
  createdAt: Date;
  updatedAt: Date;
}

export interface InternalUserWithContactsDto extends InternalUserDto {
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export interface InternalCreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string; // Hashed password
}



export interface InternalUserSessionDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // NO password in session data for security
}
