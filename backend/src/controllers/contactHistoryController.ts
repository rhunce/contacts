import { Response } from 'express';
import { ContactHistoryService } from '../services/contactHistoryService';
import { AuthenticatedRequest } from '../types';

export class ContactHistoryController {
  private contactHistoryService: ContactHistoryService;

  constructor() {
    this.contactHistoryService = new ContactHistoryService();
  }

  getContactHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const contactId = req.params.id;
      const { page = 1, limit = 10 } = req.query;
      const result = await this.contactHistoryService.getContactHistory(contactId, req.userId!, Number(page), Number(limit));
      res.success(result.items);
    } catch (error: any) {
      res.error(error.message);
    }
  }
}
