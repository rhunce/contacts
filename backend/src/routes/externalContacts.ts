import { Router } from 'express';
import { ExternalContactController } from '../controllers/externalContactController';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
  contactIdSchema,
  createContactSchema,
  getContactsSchema,
  updateContactSchema
} from '../schemas/contactSchemas';

const router = Router();
const externalContactController = new ExternalContactController();

// GET /api/external/contact - Get contacts
router.get('/', validateQuery(getContactsSchema), externalContactController.getContacts);

// GET /api/external/contact/:id - Get specific contact
router.get('/:id', validateParams(contactIdSchema), externalContactController.getContact);

// POST /api/external/contact - Create contact
router.post('/', validateBody(createContactSchema), externalContactController.createContact);

// PATCH /api/external/contact/:id - Update contact
router.patch('/:id', validateParams(contactIdSchema), validateBody(updateContactSchema), externalContactController.updateContact);

// DELETE /api/external/contact/:id - Delete contact
router.delete('/:id', validateParams(contactIdSchema), externalContactController.deleteContact);

export default router;
