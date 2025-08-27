import { InternalUserDto, InternalUserWithContactsDto, InternalUserSessionDto } from '../internal/user.dto';
import { UserDto, UserWithContactsDto, UserSessionDto, CreateUserDto, UpdateUserDto } from '../external/user.dto';
import { ContactDto } from '../external/contact.dto';

// Mapper functions to transform between internal and external DTOs

export class UserMapper {
  // Transform internal user to external user (removes sensitive data)
  static toUserDto(internal: InternalUserDto): UserDto {
    return {
      id: internal.id,
      firstName: internal.firstName,
      lastName: internal.lastName,
      email: internal.email,
      createdAt: internal.createdAt.toISOString(),
      updatedAt: internal.updatedAt.toISOString(),
      // NO password field - security!
    };
  }

  // Transform internal user with contacts to external user with contacts
  static toUserWithContactsDto(internal: InternalUserWithContactsDto): UserWithContactsDto {
    const userDto = this.toUserDto(internal);
    const contactDtos: ContactDto[] = internal.contacts.map(contact => ({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
      owner: {
        id: internal.id,
        firstName: internal.firstName,
        lastName: internal.lastName,
        email: internal.email,
        // NO password field - security!
      }
    }));

    return {
      ...userDto,
      contacts: contactDtos
    };
  }

  // Transform internal user session to external user session
  static toUserSessionDto(internal: InternalUserSessionDto): UserSessionDto {
    return {
      id: internal.id,
      email: internal.email,
      firstName: internal.firstName,
      lastName: internal.lastName,
      // NO password field - security!
    };
  }

  // Transform external create user to internal create user
  static toInternalCreateDto(external: CreateUserDto): Omit<InternalUserDto, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      email: external.email,
      firstName: external.firstName,
      lastName: external.lastName,
      password: external.password, // This should be hashed before saving
    };
  }

  // Transform external update user to internal update user
  static toInternalUpdateDto(external: UpdateUserDto): Partial<InternalUserDto> {
    const update: Partial<InternalUserDto> = {};
    
    if (external.email !== undefined) update.email = external.email;
    if (external.firstName !== undefined) update.firstName = external.firstName;
    if (external.lastName !== undefined) update.lastName = external.lastName;
    if (external.password !== undefined) update.password = external.password; // This should be hashed before saving
    
    return update;
  }
}
