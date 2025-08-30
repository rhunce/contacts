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
    it('should create a contact successfully', async () => {
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890'
      };

      const userId = 'user-123';

      const mockContact = {
        id: 'contact-123',
        ownerId: userId,
        ...contactData,
        externalId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockContactRepository.prototype.existsByEmailAndOwner.mockResolvedValue(false);
      mockContactRepository.prototype.create.mockResolvedValue(mockContact);

      const result = await contactService.createContact(userId, contactData);

      expect(result.firstName).toBe(contactData.firstName);
      expect(result.lastName).toBe(contactData.lastName);
      expect(result.email).toBe(contactData.email);
      expect(mockContactRepository.prototype.existsByEmailAndOwner).toHaveBeenCalledWith(
        contactData.email,
        userId
      );
      expect(mockContactRepository.prototype.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: userId,
          ...contactData
        })
      );
    });

    it('should throw error if email already exists for user', async () => {
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890'
      };

      const userId = 'user-123';

      mockContactRepository.prototype.existsByEmailAndOwner.mockResolvedValue(true);

      await expect(contactService.createContact(userId, contactData)).rejects.toThrow(
        AppErrorClass.conflict('Contact with this email already exists')
      );
    });

    it('should throw error for invalid email format', async () => {
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '123-456-7890'
      };

      const userId = 'user-123';

      await expect(contactService.createContact(userId, contactData)).rejects.toThrow(
        AppErrorClass.validationError('Please enter a valid email address (e.g., john.doe@example.com)')
      );
    });
  });

  describe('updateContact', () => {
    it('should update a contact successfully', async () => {
      const contactId = 'contact-123';
      const userId = 'user-123';
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '098-765-4321'
      };

      const mockContact = {
        id: contactId,
        ownerId: userId,
        ...updateData,
        externalId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockContactRepository.prototype.findByIdAndOwner.mockResolvedValue(mockContact);
      mockContactRepository.prototype.existsByEmailAndOwner.mockResolvedValue(false);
      mockContactRepository.prototype.update.mockResolvedValue(mockContact);

      const result = await contactService.updateContact(userId, contactId, updateData);

      expect(result.firstName).toBe(updateData.firstName);
      expect(result.lastName).toBe(updateData.lastName);
      expect(result.email).toBe(updateData.email);
    });

    it('should throw error if contact not found', async () => {
      const contactId = 'contact-123';
      const userId = 'user-123';
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '098-765-4321'
      };

      mockContactRepository.prototype.findByIdAndOwner.mockResolvedValue(null);

      await expect(contactService.updateContact(userId, contactId, updateData)).rejects.toThrow(
        AppErrorClass.notFound('Contact not found')
      );
    });
  });

  describe('deleteContact', () => {
    it('should delete a contact successfully', async () => {
      const contactId = 'contact-123';
      const userId = 'user-123';

      const mockContact = {
        id: contactId,
        ownerId: userId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        externalId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockContactRepository.prototype.findByIdAndOwner.mockResolvedValue(mockContact);
      mockContactRepository.prototype.delete.mockResolvedValue(mockContact);

      await contactService.deleteContact(userId, contactId);

      expect(mockContactRepository.prototype.findByIdAndOwner).toHaveBeenCalledWith(contactId, userId);
      expect(mockContactRepository.prototype.delete).toHaveBeenCalledWith(contactId);
    });
  });
});
