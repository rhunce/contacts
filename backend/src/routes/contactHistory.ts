import { Router, Response } from 'express';
import { ContactHistoryService } from '../services/contactHistoryService';
import { AuthenticatedRequest } from '../types';
import { PaginationQueryDto } from '../dtos/shared/pagination.dto';
import { requireAuth } from '../middleware/auth';

const router = Router();
const contactHistoryService = new ContactHistoryService();

// GET /contact-history/:id - Get contact history with pagination
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { page = '1', pageSize = '10', order = 'desc' } = req.query as PaginationQueryDto;
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);

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
    
    if (error.message === 'Contact not found') {
      return res.notFound('Contact not found');
    }

    res.error('Internal server error');
  }
});

export default router;
