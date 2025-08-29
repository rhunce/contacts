import { BaseEntityDto } from '../shared/common.dto';

// External DTOs - Used between Service and API layers
// These exclude sensitive data and are safe for external consumption

export interface UserDto extends BaseEntityDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string; // ISO string for API
  updatedAt: string; // ISO string for API
  // NO password field - security!
}

export interface UserWithContactsDto extends UserDto {
  contacts: ContactDto[];
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string; // Plain text password for registration
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string; // Plain text password for updates
}

export interface UserSessionDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // NO password field - security!
}

export interface LoginRequestDto {
  email: string;
  password: string; // Plain text password (sent over HTTPS)
}

// Import contact DTO for the UserWithContactsDto
import { ContactDto } from './contact.dto';
