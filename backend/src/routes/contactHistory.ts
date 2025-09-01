import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { contactHistorySchemas } from '../validation/contactHistory.schemas';
import { ContactHistoryController } from '../controllers/contactHistoryController';

const router = Router();
const contactHistoryController = new ContactHistoryController();

// GET /contact-history/:id - Get contact history with pagination
router.get('/:id', requireAuth, validateRequest(contactHistorySchemas.getContactHistory), contactHistoryController.getContactHistory);

export default router;
