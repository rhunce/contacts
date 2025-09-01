import { Response } from 'express';
import { ContactService } from '../services/contactService';
import { ApiKeyRequest } from '../middleware/apiKeyAuth';
import { CreateContactDto, UpdateContactDto } from '../dtos/external/contact.dto';

export class ExternalContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  /**
   * Get contact by external ID - maintains exact same response structure
   */
  getContactByExternalId = async (req: ApiKeyRequest, res: Response) => {
    try {
      const { externalId } = req.params;
      const userId = req.apiKeyUserId;

      if (!userId) {
        return res.unauthorized('API key authentication required');
      }

      const contact = await this.contactService.getContactByExternalId(externalId, userId);

      if (!contact) {
        return res.notFound('Contact not found');
      }

      res.success(contact);
    } catch (error: any) {
      console.error('Error fetching external contact:', error);
      res.appError(error);
    }
  };

  /**
   * Update contact by external ID - maintains exact same response structure
   */
  updateContactByExternalId = async (req: ApiKeyRequest, res: Response) => {
    try {
      const { externalId } = req.params;
      const userId = req.apiKeyUserId;
      const updateData: UpdateContactDto = req.body;

      if (!userId) {
        return res.unauthorized('API key authentication required');
      }

      const updatedContact = await this.contactService.updateContactByExternalId(externalId, userId, updateData);

      res.success(updatedContact);
    } catch (error: any) {
      console.error('Error updating external contact:', error);
      res.appError(error);
    }
  };

  /**
   * Create contact with external ID - maintains exact same response structure
   */
  createContactWithExternalId = async (req: ApiKeyRequest, res: Response) => {
    try {
      const userId = req.apiKeyUserId;
      const { firstName, lastName, email, phone, externalId }: CreateContactDto & { externalId?: string } = req.body;

      if (!userId) {
        return res.unauthorized('API key authentication required');
      }

      // Validate required fields
      if (!firstName || !lastName || !email || !phone) {
        const errors = [];
        if (!firstName) errors.push({ message: 'First name is required', field: 'firstName' });
        if (!lastName) errors.push({ message: 'Last name is required', field: 'lastName' });
        if (!email) errors.push({ message: 'Email is required', field: 'email' });
        if (!phone) errors.push({ message: 'Phone is required', field: 'phone' });
        
        return res.validationError(errors);
      }

      const contact = await this.contactService.createContactWithExternalId({
        firstName,
        lastName,
        email,
        phone,
        externalId
      }, userId);

      res.success(contact, 201);
    } catch (error: any) {
      console.error('Error creating external contact:', error);
      res.appError(error);
    }
  };

  /**
   * Delete contact by external ID - maintains exact same response structure
   */
  deleteContactByExternalId = async (req: ApiKeyRequest, res: Response) => {
    try {
      const { externalId } = req.params;
      const userId = req.apiKeyUserId;

      if (!userId) {
        return res.unauthorized('API key authentication required');
      }

      const contact = await this.contactService.deleteContactByExternalId(externalId, userId);

      res.success(contact);
    } catch (error: any) {
      console.error('Error deleting external contact:', error);
      res.appError(error);
    }
  };
}
