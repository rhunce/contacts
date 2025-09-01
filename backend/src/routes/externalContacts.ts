import { Router } from 'express';
import { requireApiKey } from '../middleware/apiKeyAuth';
import { validateRequest } from '../middleware/validation';
import { externalContactSchemas } from '../validation/externalContact.schemas';
import { ExternalContactController } from '../controllers/externalContactController';

const router = Router();
const externalContactController = new ExternalContactController();

// Apply API key authentication to all external contact routes
router.use(requireApiKey);

// GET /api/external/contact/:externalId - Get contact by external ID
router.get('/:externalId', validateRequest(externalContactSchemas.getContactByExternalId), externalContactController.getContactByExternalId);

// PATCH /api/external/contact/:externalId - Update contact by external ID
router.patch('/:externalId', validateRequest(externalContactSchemas.updateContactByExternalId), externalContactController.updateContactByExternalId);

// POST /api/external/contact - Create contact with external ID
router.post('/', validateRequest(externalContactSchemas.createContactWithExternalId), externalContactController.createContactWithExternalId);

// DELETE /api/external/contact/:externalId - Delete contact by external ID
router.delete('/:externalId', validateRequest(externalContactSchemas.deleteContactByExternalId),externalContactController.deleteContactByExternalId);

export default router;
