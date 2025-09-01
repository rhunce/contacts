import { Response } from 'express';
import { ApiKeyService, CreateApiKeyDto } from '../services/apiKeyService';
import { AuthenticatedRequest, CustomSession } from '../types';

export class ApiKeyController {
  private apiKeyService: ApiKeyService;

  constructor() {
    this.apiKeyService = new ApiKeyService();
  }

  /**
   * Get all API keys for the authenticated user - maintains exact same response structure
   */
  getUserApiKeys = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const session = req.session as CustomSession;
      const userId = session.userId!;

      const apiKeys = await this.apiKeyService.getUserApiKeys(userId);
      res.success(apiKeys);
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      res.appError(error);
    }
  };

  /**
   * Create a new API key - maintains exact same response structure
   */
  createApiKey = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const session = req.session as CustomSession;
      const userId = session.userId!;
      const data: CreateApiKeyDto = req.body;

      const result = await this.apiKeyService.createApiKey(userId, data);
      
      // Return the API key only once (for security)
      res.success({
        apiKey: result.apiKey,
        info: result.info
      }, 201);
    } catch (error: any) {
      console.error('Error creating API key:', error);
      res.appError(error);
    }
  };

  /**
   * Revoke an API key - maintains exact same response structure
   */
  revokeApiKey = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const session = req.session as CustomSession;
      const userId = session.userId!;
      const { id } = req.params;

      await this.apiKeyService.revokeApiKey(userId, id);
      res.success({ message: 'API key revoked successfully' });
    } catch (error: any) {
      console.error('Error revoking API key:', error);
      res.appError(error);
    }
  };

  /**
   * Restore a revoked API key - maintains exact same response structure
   */
  restoreApiKey = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const session = req.session as CustomSession;
      const userId = session.userId!;
      const { id } = req.params;

      await this.apiKeyService.restoreApiKey(userId, id);
      res.success({ message: 'API key restored successfully' });
    } catch (error: any) {
      console.error('Error restoring API key:', error);
      res.appError(error);
    }
  };

  /**
   * Permanently delete an API key - maintains exact same response structure
   */
  deleteApiKey = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const session = req.session as CustomSession;
      const userId = session.userId!;
      const { id } = req.params;

      await this.apiKeyService.deleteApiKey(userId, id);
      res.success({ message: 'API key permanently deleted' });
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      res.appError(error);
    }
  };
}
