import { Router, Response } from 'express';
import { ApiKeyService, CreateApiKeyDto } from '../services/apiKeyService';
import { AuthenticatedRequest, CustomSession } from '../types';
import { requireAuth } from '../middleware/auth';

const router = Router();
const apiKeyService = new ApiKeyService();

// GET /api/keys - Get all API keys for the authenticated user
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = req.session as CustomSession;
    const userId = session.userId!;

    const apiKeys = await apiKeyService.getUserApiKeys(userId);
    res.success(apiKeys);
  } catch (error: any) {
    console.error('Error fetching API keys:', error);
    res.appError(error);
  }
});

// POST /api/keys - Create a new API key
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = req.session as CustomSession;
    const userId = session.userId!;
    const data: CreateApiKeyDto = req.body;

    // Validate required fields
    if (!data.name) {
      return res.validationError([{ message: 'API key name is required', field: 'name' }]);
    }

    const result = await apiKeyService.createApiKey(userId, data);
    
    // Return the API key only once (for security)
    res.success({
      apiKey: result.apiKey,
      info: result.info
    }, 201);
  } catch (error: any) {
    console.error('Error creating API key:', error);
    res.appError(error);
  }
});

// DELETE /api/keys/:id - Revoke an API key
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = req.session as CustomSession;
    const userId = session.userId!;
    const { id } = req.params;

    await apiKeyService.revokeApiKey(userId, id);
    res.success({ message: 'API key revoked successfully' });
  } catch (error: any) {
    console.error('Error revoking API key:', error);
    res.appError(error);
  }
});

// POST /api/keys/:id/restore - Restore a revoked API key
router.post('/:id/restore', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = req.session as CustomSession;
    const userId = session.userId!;
    const { id } = req.params;

    await apiKeyService.restoreApiKey(userId, id);
    res.success({ message: 'API key restored successfully' });
  } catch (error: any) {
    console.error('Error restoring API key:', error);
    res.appError(error);
  }
});

// DELETE /api/keys/:id/permanent - Permanently delete an API key
router.delete('/:id/permanent', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = req.session as CustomSession;
    const userId = session.userId!;
    const { id } = req.params;

    await apiKeyService.deleteApiKey(userId, id);
    res.success({ message: 'API key permanently deleted' });
  } catch (error: any) {
    console.error('Error deleting API key:', error);
    res.appError(error);
  }
});

// GET /api/keys/:id/usage - Get API key usage statistics
router.get('/:id/usage', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = req.session as CustomSession;
    const userId = session.userId!;
    const { id } = req.params;

    const usageStats = await apiKeyService.getApiKeyUsage(userId, id);
    res.success(usageStats);
  } catch (error: any) {
    console.error('Error fetching API key usage:', error);
    res.appError(error);
  }
});

export default router;
