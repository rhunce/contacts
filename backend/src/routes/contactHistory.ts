import { Response, Router } from 'express';
import { PaginationQueryDto, validatePaginationParams } from '../dtos/shared/pagination.dto';
import { requireAuth } from '../middleware/auth';
import { ContactHistoryService } from '../services/contactHistoryService';
import { AuthenticatedRequest } from '../types';

const router = Router();
const contactHistoryService = new ContactHistoryService();

// GET /contact-history/:id - Get contact history with pagination
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { page, pageSize, order = 'desc' } = req.query as PaginationQueryDto;
    
    // Validate pagination parameters
    const { page: pageNum, pageSize: pageSizeNum } = validatePaginationParams(page, pageSize);

    const result = await contactHistoryService.getContactHistory(
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
});

export default router;
