import { ContactService } from '../../../src/services/contactService';
import { ContactRepository } from '../../../src/repositories/contactRepository';
import { AppErrorClass } from '../../../src/utils/errors';

// Mock the ContactRepository
jest.mock('../../../src/repositories/contactRepository');

const mockContactRepository = ContactRepository as jest.MockedClass<typeof ContactRepository>;

describe('ContactService', () => {
  let contactService: ContactService;

  beforeEach(() => {
    contactService = new ContactService();
    jest.clearAllMocks();
  });

  describe('createContact', () => {
    const userId = 'user-123';
    const contactData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890'
    };

    const mockContact = {
      id: 'contact-123',
      ownerId: userId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      externalId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: {
        id: userId,
        email: 'user@example.com',
        firstName: 'User',
        lastName: 'Name',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    it('should create a contact successfully', async () => {
      mockContactRepository.prototype.existsByEmailAndOwner.mockResolvedValue(false);
      mockContactRepository.prototype.getContactCount.mockResolvedValue(0);
      mockContactRepository.prototype.create.mockResolvedValue(mockContact);

      const result = await contactService.createContact(contactData, userId);

      expect(result).toBeDefined();
      expect(mockContactRepository.prototype.existsByEmailAndOwner).toHaveBeenCalledWith(contactData.email, userId);
      expect(mockContactRepository.prototype.getContactCount).toHaveBeenCalledWith(userId);
      expect(mockContactRepository.prototype.create).toHaveBeenCalled();
    });

    it('should throw error when contact with same email exists', async () => {
      mockContactRepository.prototype.existsByEmailAndOwner.mockResolvedValue(true);

      await expect(contactService.createContact(contactData, userId)).rejects.toThrow(
        AppErrorClass.duplicateEmail()
      );

      expect(mockContactRepository.prototype.existsByEmailAndOwner).toHaveBeenCalledWith(contactData.email, userId);
      expect(mockContactRepository.prototype.create).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      const invalidContactData = {
        ...contactData,
        email: 'invalid-email'
      };

      await expect(contactService.createContact(invalidContactData, userId)).rejects.toThrow(
        AppErrorClass.validationError('Please enter a valid email address (e.g., john.doe@example.com)', 'email')
      );

      expect(mockContactRepository.prototype.create).not.toHaveBeenCalled();
    });
  });

  describe('updateContact', () => {
    const userId = 'user-123';
    const contactId = 'contact-123';
    const updateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '987-654-3210'
    };

    const mockContact = {
      id: contactId,
      ownerId: userId,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '987-654-3210',
      externalId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: {
        id: userId,
        email: 'user@example.com',
        firstName: 'User',
        lastName: 'Name',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    it('should update a contact successfully', async () => {
      mockContactRepository.prototype.findById.mockResolvedValue(mockContact);
      mockContactRepository.prototype.existsByEmailAndOwner.mockResolvedValue(false);
      mockContactRepository.prototype.update.mockResolvedValue(mockContact);

      const result = await contactService.updateContact(contactId, updateData, userId);

      expect(result).toBeDefined();
      expect(mockContactRepository.prototype.findById).toHaveBeenCalledWith(contactId, userId);
      expect(mockContactRepository.prototype.existsByEmailAndOwner).toHaveBeenCalledWith(updateData.email, userId, contactId);
      expect(mockContactRepository.prototype.update).toHaveBeenCalled();
    });

    it('should throw error when contact not found', async () => {
      mockContactRepository.prototype.findById.mockResolvedValue(null);

      await expect(contactService.updateContact(contactId, updateData, userId)).rejects.toThrow(
        AppErrorClass.notFound('Contact not found')
      );

      expect(mockContactRepository.prototype.findById).toHaveBeenCalledWith(contactId, userId);
      expect(mockContactRepository.prototype.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteContact', () => {
    const userId = 'user-123';
    const contactId = 'contact-123';

    const mockContact = {
      id: contactId,
      ownerId: userId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      externalId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: {
        id: userId,
        email: 'user@example.com',
        firstName: 'User',
        lastName: 'Name',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    it('should delete a contact successfully', async () => {
      mockContactRepository.prototype.findById.mockResolvedValue(mockContact);
      mockContactRepository.prototype.delete.mockResolvedValue(mockContact);

      await contactService.deleteContact(contactId, userId);

      expect(mockContactRepository.prototype.findById).toHaveBeenCalledWith(contactId, userId);
      expect(mockContactRepository.prototype.delete).toHaveBeenCalledWith(contactId, userId);
    });

    it('should throw error when contact not found', async () => {
      mockContactRepository.prototype.findById.mockResolvedValue(null);

      await expect(contactService.deleteContact(contactId, userId)).rejects.toThrow(
        AppErrorClass.notFound('Contact not found')
      );

      expect(mockContactRepository.prototype.findById).toHaveBeenCalledWith(contactId, userId);
      expect(mockContactRepository.prototype.delete).not.toHaveBeenCalled();
    });
  });
});
