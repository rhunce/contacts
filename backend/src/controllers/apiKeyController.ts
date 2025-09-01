import { Response } from 'express';
import { ApiKeyService } from '../services/apiKeyService';
import { AuthenticatedRequest } from '../types';

export class ApiKeyController {
  private apiKeyService: ApiKeyService;

  constructor() {
    this.apiKeyService = new ApiKeyService();
  }

  getApiKeys = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await this.apiKeyService.getUserApiKeys(req.userId!);
      res.success(result);
    } catch (error: any) {
      res.error(error.message);
    }
  }

  createApiKey = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const apiKey = await this.apiKeyService.createApiKey(req.userId!, req.body);
      res.success(apiKey);
    } catch (error: any) {
      res.error(error.message);
    }
  }

  deleteApiKey = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const apiKeyId = parseInt(req.params.id);
      await this.apiKeyService.deleteApiKey(req.userId!, apiKeyId.toString());
      res.success({ message: 'API key deleted successfully' });
    } catch (error: any) {
      res.error(error.message);
    }
  }

  deleteApiKeyPermanent = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const apiKeyId = parseInt(req.params.id);
      await this.apiKeyService.deleteApiKey(req.userId!, apiKeyId.toString());
      res.success({ message: 'API key permanently deleted' });
    } catch (error: any) {
      res.error(error.message);
    }
  }

  restoreApiKey = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const apiKeyId = parseInt(req.params.id);
      await this.apiKeyService.restoreApiKey(req.userId!, apiKeyId.toString());
      res.success({ message: 'API key restored successfully' });
    } catch (error: any) {
      res.error(error.message);
    }
  }
}
