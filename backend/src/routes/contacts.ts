import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { contactSchemas } from '../validation/contact.schemas';
import { ContactController } from '../controllers/contactController';

const router = Router();
const contactController = new ContactController();

// GET /contacts - Get paginated contacts
router.get('/', requireAuth, validateRequest(contactSchemas.getContacts), contactController.getContacts);

// GET /contact/:id - Get specific contact
router.get('/:id', requireAuth, validateRequest(contactSchemas.getContact), contactController.getContact);

// POST /contact - Create new contact
router.post('/', requireAuth, validateRequest(contactSchemas.createContact), contactController.createContact);

// PATCH /contact/:id - Update contact and create history
router.patch('/:id', requireAuth, validateRequest(contactSchemas.updateContact), contactController.updateContact);

// DELETE /contact/:id - Delete contact
router.delete('/:id', requireAuth, validateRequest(contactSchemas.deleteContact), contactController.deleteContact);

export default router;
