import { Router } from 'express';
import { ContactController } from '../controllers/contactController';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  contactIdSchema,
  createContactSchema,
  getContactsSchema,
  updateContactSchema
} from '../schemas/contactSchemas';

const router = Router();
const contactController = new ContactController();

// GET /contacts - Get paginated contacts
router.get('/', requireAuth, validateQuery(getContactsSchema), contactController.getContacts);

// GET /contact/:id - Get specific contact
router.get('/:id', requireAuth, validateParams(contactIdSchema), contactController.getContact);

// POST /contact - Create new contact
router.post('/', requireAuth, validateBody(createContactSchema), contactController.createContact);

// PATCH /contact/:id - Update contact
router.patch('/:id', requireAuth, validateParams(contactIdSchema), validateBody(updateContactSchema), contactController.updateContact);

// DELETE /contact/:id - Delete contact
router.delete('/:id', requireAuth, validateParams(contactIdSchema), contactController.deleteContact);

export default router;
