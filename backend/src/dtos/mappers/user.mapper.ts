import { InternalUserDto, InternalUserWithContactsDto, InternalUserSessionDto } from '../internal/user.dto';
import { UserDto, UserWithContactsDto, UserSessionDto } from '../external/user.dto';
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
}
