import { Response } from 'express';
import { ContactService } from '../services/contactService';
import { AuthenticatedRequest } from '../types';

export class ContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  getContacts = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page = 1, limit = 10, filter } = req.query;
      const result = await this.contactService.getContacts(req.userId!, Number(page), Number(limit), filter as string);
      res.success(result);
    } catch (error: any) {
      res.error(error.message);
    }
  }

  getContact = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const contactId = req.params.id;
      const contact = await this.contactService.getContact(contactId, req.userId!);
      res.success(contact);
    } catch (error: any) {
      res.error(error.message);
    }
  }

  createContact = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const contact = await this.contactService.createContact(req.body, req.userId!);
      res.success(contact);
    } catch (error: any) {
      res.error(error.message);
    }
  }

  updateContact = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const contactId = req.params.id;
      const contact = await this.contactService.updateContact(contactId, req.userId!, req.body as any);
      res.success(contact);
    } catch (error: any) {
      res.error(error.message);
    }
  }

  deleteContact = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const contactId = req.params.id;
      await this.contactService.deleteContact(contactId, req.userId!);
      res.success({ message: 'Contact deleted successfully' });
    } catch (error: any) {
      res.error(error.message);
    }
  }
}
