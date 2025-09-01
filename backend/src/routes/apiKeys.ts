import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { apiKeySchemas } from '../validation/apiKey.schemas';
import { ApiKeyController } from '../controllers/apiKeyController';

const router = Router();
const apiKeyController = new ApiKeyController();

// GET /api/keys - Get all API keys for the authenticated user
router.get('/', requireAuth, apiKeyController.getUserApiKeys);

// POST /api/keys - Create a new API key
router.post('/', requireAuth, validateRequest(apiKeySchemas.createApiKey), apiKeyController.createApiKey);

// DELETE /api/keys/:id - Revoke an API key
router.delete('/:id', requireAuth, validateRequest(apiKeySchemas.revokeApiKey), apiKeyController.revokeApiKey);

// POST /api/keys/:id/restore - Restore a revoked API key
router.post('/:id/restore', requireAuth, validateRequest(apiKeySchemas.restoreApiKey), apiKeyController.restoreApiKey);

// DELETE /api/keys/:id/permanent - Permanently delete an API key
router.delete('/:id/permanent', requireAuth, validateRequest(apiKeySchemas.deleteApiKey), apiKeyController.deleteApiKey);

export default router;
