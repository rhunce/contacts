import { Response } from 'express';
import { ContactHistoryService } from '../services/contactHistoryService';
import { AuthenticatedRequest } from '../types';
import { PaginationQueryDto, validatePaginationParams } from '../dtos/shared/pagination.dto';

export class ContactHistoryController {
  private contactHistoryService: ContactHistoryService;

  constructor() {
    this.contactHistoryService = new ContactHistoryService();
  }

  /**
   * Get contact history with pagination - maintains exact same response structure
   */
  getContactHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { page, pageSize, order = 'desc' } = req.query as PaginationQueryDto;
      
      // Validate pagination parameters
      const { page: pageNum, pageSize: pageSizeNum } = validatePaginationParams(page, pageSize);

      const result = await this.contactHistoryService.getContactHistory(
        id,
        req.userId!,
        pageNum,
        pageSizeNum,
        order as 'asc' | 'desc'
      );

      res.paginated(result.data, result.pagination);
    } catch (error: any) {
      console.error('Error fetching contact history:', error);
      
      // Handle pagination validation errors
      if (error.message.includes('Page must be between') || error.message.includes('Page size must be between')) {
        return res.validationError([{ message: error.message, field: 'pagination' }]);
      }
      
      if (error.message === 'Contact not found') {
        return res.notFound('Contact not found');
      }

      res.error('Internal server error');
    }
  };
}
