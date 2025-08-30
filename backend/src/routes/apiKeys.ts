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

export default router;
