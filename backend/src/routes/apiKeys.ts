import { Router } from 'express';
import { ApiKeyController } from '../controllers/apiKeyController';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { apiKeyIdSchema, createApiKeySchema } from '../schemas/apiKeySchemas';

const router = Router();
const apiKeyController = new ApiKeyController();

// GET /api/keys - Get all API keys for the authenticated user
router.get('/', requireAuth, apiKeyController.getApiKeys);

// POST /api/keys - Create a new API key
router.post('/', requireAuth, validateBody(createApiKeySchema), apiKeyController.createApiKey);

// DELETE /api/keys/:id - Revoke an API key
router.delete('/:id', requireAuth, validateParams(apiKeyIdSchema), apiKeyController.deleteApiKey);

// POST /api/keys/:id/restore - Restore a revoked API key
router.post('/:id/restore', requireAuth, validateParams(apiKeyIdSchema), apiKeyController.restoreApiKey);

// DELETE /api/keys/:id/permanent - Permanently delete an API key
router.delete('/:id/permanent', requireAuth, validateParams(apiKeyIdSchema), apiKeyController.deleteApiKeyPermanent);

export default router;
