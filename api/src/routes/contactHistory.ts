import { Router, Response } from 'express';
import { ContactHistoryService } from '../services/contactHistoryService';
import { AuthenticatedRequest, CustomSession } from '../types';
import { PaginationQueryDto } from '../dtos/shared/pagination.dto';

const router = Router();
const contactHistoryService = new ContactHistoryService();

// GET /contact-history/:id - Get contact history with pagination
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = req.session as CustomSession;
    if (!session.userId) {
      return res.unauthorized();
    }

    const { id } = req.params;
    const { page = '1', pageSize = '10', order = 'desc' } = req.query as PaginationQueryDto;
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);

    const result = await contactHistoryService.getContactHistory(
      id,
      session.userId,
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
