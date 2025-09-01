import { Response } from 'express';
import { ContactService } from '../services/contactService';
import { AuthenticatedRequest } from '../types';
import { PaginationQueryDto, validatePaginationParams } from '../dtos/shared/pagination.dto';

export class ContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  /**
   * Get paginated contacts - maintains exact same response structure
   */
  getContacts = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page, pageSize, filter } = req.query as PaginationQueryDto & { filter?: string };
      
      // Validate pagination parameters
      const { page: pageNum, pageSize: pageSizeNum } = validatePaginationParams(page, pageSize);

      const result = await this.contactService.getContacts(req.userId!, pageNum, pageSizeNum, filter);
      
      res.paginated(result.data, result.pagination);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      
      // Handle pagination validation errors
      if (error.message.includes('Page must be between') || error.message.includes('Page size must be between')) {
        return res.validationError([{ message: error.message, field: 'pagination' }]);
      }
      
      res.error('Internal server error');
    }
  };

  /**
   * Get a specific contact by ID - maintains exact same response structure
   */
  getContact = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const contact = await this.contactService.getContact(id, req.userId!);

      if (!contact) {
        return res.notFound('Contact not found');
      }

      res.success(contact);
    } catch (error) {
      console.error('Error fetching contact:', error);
      res.error('Internal server error');
    }
  };

  /**
   * Create a new contact - maintains exact same response structure
   */
  createContact = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { firstName, lastName, email, phone } = req.body;

      const contact = await this.contactService.createContact({
        firstName,
        lastName,
        email,
        phone
      }, req.userId!);

      res.success(contact, 201);
    } catch (error: any) {
      console.error('Error creating contact:', error);
      res.appError(error);
    }
  };

  /**
   * Update an existing contact - maintains exact same response structure
   */
  updateContact = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedContact = await this.contactService.updateContact(id, req.userId!, updateData);

      res.success(updatedContact);
    } catch (error: any) {
      console.error('Error updating contact:', error);
      res.appError(error);
    }
  };

  /**
   * Delete a contact - maintains exact same response structure
   */
  deleteContact = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const contact = await this.contactService.deleteContact(id, req.userId!);

      res.success(contact);
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.error('Internal server error');
    }
  };
}
