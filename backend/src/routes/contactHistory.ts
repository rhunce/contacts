import { Router } from 'express';
import { ContactHistoryController } from '../controllers/contactHistoryController';
import { requireAuth } from '../middleware/auth';
import { validateParams, validateQuery } from '../middleware/validation';
import { contactHistoryIdSchema, getContactHistorySchema } from '../schemas/contactHistorySchemas';

const router = Router();
const contactHistoryController = new ContactHistoryController();

// GET /contact-history/:id - Get contact history with pagination
router.get('/:id', requireAuth, validateParams(contactHistoryIdSchema), validateQuery(getContactHistorySchema), contactHistoryController.getContactHistory);

export default router;
