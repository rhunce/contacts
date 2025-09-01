import { Request, Response } from 'express';
import { ApiKeyService } from '../services/apiKeyService';
import { ContactService } from '../services/contactService';

export class ExternalContactController {
  private contactService: ContactService;
  private apiKeyService: ApiKeyService;

  constructor() {
    this.contactService = new ContactService();
    this.apiKeyService = new ApiKeyService();
  }

  getContacts = async (req: Request, res: Response) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      if (!apiKey) {
        return res.unauthorized('API key required');
      }

      // Validate API key and get user ID
      const userId = await this.apiKeyService.validateApiKey(apiKey);

      const { page = 1, limit = 10, filter } = req.query;
      const result = await this.contactService.getContacts(userId, Number(page), Number(limit), filter as string);
      res.success(result);
    } catch (error: any) {
      res.error(error.message);
    }
  }

  getContact = async (req: Request, res: Response) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      if (!apiKey) {
        return res.unauthorized('API key required');
      }

      // Validate API key and get user ID
      const userId = await this.apiKeyService.validateApiKey(apiKey);

      const contactId = req.params.id;
      const contact = await this.contactService.getContact(contactId, userId);
      res.success(contact);
    } catch (error: any) {
      res.error(error.message);
    }
  }

  createContact = async (req: Request, res: Response) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      if (!apiKey) {
        return res.unauthorized('API key required');
      }

      // Validate API key and get user ID
      const userId = await this.apiKeyService.validateApiKey(apiKey);

      const contact = await this.contactService.createContact(req.body, userId);
      res.success(contact);
    } catch (error: any) {
      res.error(error.message);
    }
  }

  updateContact = async (req: Request, res: Response) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      if (!apiKey) {
        return res.unauthorized('API key required');
      }

      // Validate API key and get user ID
      const userId = await this.apiKeyService.validateApiKey(apiKey);

      const contactId = req.params.id;
      const contact = await this.contactService.updateContact(contactId, userId, req.body as any);
      res.success(contact);
    } catch (error: any) {
      res.error(error.message);
    }
  }

  deleteContact = async (req: Request, res: Response) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;
      if (!apiKey) {
        return res.unauthorized('API key required');
      }

      // Validate API key and get user ID
      const userId = await this.apiKeyService.validateApiKey(apiKey);

      const contactId = req.params.id;

      await this.contactService.deleteContact(contactId, userId);
      res.success({ message: 'Contact deleted successfully' });
    } catch (error: any) {
      res.error(error.message);
    }
  }
}
