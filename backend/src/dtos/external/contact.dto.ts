import { BaseEntityDto, ContactHistoryChangeDto } from '../shared/common.dto';

// External DTOs - Used between Service and API layers
// These exclude sensitive data and are safe for external consumption

export interface ContactDto extends BaseEntityDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string; // ISO string for API
  updatedAt: string; // ISO string for API
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    // NO password field - security!
  };
}

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface UpdateContactDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface ContactHistoryDto extends BaseEntityDto {
  id: string;
  firstName?: ContactHistoryChangeDto;
  lastName?: ContactHistoryChangeDto;
  email?: ContactHistoryChangeDto;
  phone?: ContactHistoryChangeDto;
  createdAt: string; // ISO string for API
}

export interface ContactHistoryWithContactDto extends ContactHistoryDto {
  contact: ContactDto;
}
