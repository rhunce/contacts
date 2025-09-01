import { ExternalContactController } from '../../controllers/externalContactController';
import { ContactService } from '../../services/contactService';
import { createMockRequest, createMockResponse, createMockContact, createMockApiKeyRequest } from '../utils/testUtils';
import { ApiKeyRequest } from '../../middleware/apiKeyAuth';

// Mock the ContactService
jest.mock('../../services/contactService');
const MockedContactService = ContactService as jest.MockedClass<typeof ContactService>;

describe('ExternalContactController', () => {
  let controller: ExternalContactController;
  let mockContactService: jest.Mocked<ContactService>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a fresh mock instance
    mockContactService = new MockedContactService() as jest.Mocked<ContactService>;
    
    // Create controller with mocked service
    controller = new ExternalContactController();
    
    // Replace the service instance with our mock
    (controller as any).contactService = mockContactService;
  });

  describe('getContactByExternalId', () => {
    it('should return contact when found', async () => {
      // Arrange
      const mockContact = createMockContact();
      const req = createMockApiKeyRequest({
        params: { externalId: 'test-external-id' },
        apiKeyUserId: 'test-user-id',
      });
      const res = createMockResponse();

      mockContactService.getContactByExternalId.mockResolvedValue(mockContact);

      // Act
      await controller.getContactByExternalId(req, res as any);

      // Assert
      expect(mockContactService.getContactByExternalId).toHaveBeenCalledWith('test-external-id', 'test-user-id');
      expect(res.success).toHaveBeenCalledWith(mockContact);
    });

    it('should return 404 when contact not found', async () => {
      // Arrange
      const req = createMockApiKeyRequest({
        params: { externalId: 'non-existent-id' },
        apiKeyUserId: 'test-user-id',
      });
      const res = createMockResponse();

      mockContactService.getContactByExternalId.mockResolvedValue(null);

      // Act
      await controller.getContactByExternalId(req, res as any);

      // Assert
      expect(mockContactService.getContactByExternalId).toHaveBeenCalledWith('non-existent-id', 'test-user-id');
      expect(res.notFound).toHaveBeenCalledWith('Contact not found');
    });

    it('should return 401 when no userId provided', async () => {
      // Arrange
      const req = createMockApiKeyRequest({
        params: { externalId: 'test-external-id' },
        apiKeyUserId: undefined,
      });
      const res = createMockResponse();

      // Act
      await controller.getContactByExternalId(req, res as any);

      // Assert
      expect(mockContactService.getContactByExternalId).not.toHaveBeenCalled();
      expect(res.unauthorized).toHaveBeenCalledWith('API key authentication required');
    });
  });

  describe('createContactWithExternalId', () => {
    it('should create contact successfully', async () => {
      // Arrange
      const mockContact = createMockContact();
      const req = createMockApiKeyRequest({
        body: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1987654321',
          externalId: 'external-123',
        },
        apiKeyUserId: 'test-user-id',
      });
      const res = createMockResponse();

      mockContactService.createContactWithExternalId.mockResolvedValue(mockContact);

      // Act
      await controller.createContactWithExternalId(req, res as any);

      // Assert
      expect(mockContactService.createContactWithExternalId).toHaveBeenCalledWith(
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1987654321',
          externalId: 'external-123',
        },
        'test-user-id'
      );
      expect(res.success).toHaveBeenCalledWith(mockContact, 201);
    });

    it('should return validation error when required fields missing', async () => {
      // Arrange
      const req = createMockApiKeyRequest({
        body: {
          firstName: 'Jane',
          // Missing lastName, email, phone
        },
        apiKeyUserId: 'test-user-id',
      });
      const res = createMockResponse();

      // Act
      await controller.createContactWithExternalId(req, res as any);

      // Assert
      expect(mockContactService.createContactWithExternalId).not.toHaveBeenCalled();
      expect(res.validationError).toHaveBeenCalledWith([
        { message: 'Last name is required', field: 'lastName' },
        { message: 'Email is required', field: 'email' },
        { message: 'Phone is required', field: 'phone' },
      ]);
    });

    it('should return 401 when no userId provided', async () => {
      // Arrange
      const req = createMockApiKeyRequest({
        body: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1987654321',
        },
        apiKeyUserId: undefined,
      });
      const res = createMockResponse();

      // Act
      await controller.createContactWithExternalId(req, res as any);

      // Assert
      expect(mockContactService.createContactWithExternalId).not.toHaveBeenCalled();
      expect(res.unauthorized).toHaveBeenCalledWith('API key authentication required');
    });
  });
});
