import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/apiKeyService';
import { AuthenticatedRequest } from '../types';

export interface ApiKeyRequest extends AuthenticatedRequest {
  apiKeyUserId?: string; // User ID from API key authentication
}

const apiKeyService = new ApiKeyService();

/**
 * Middleware to authenticate requests using API key
 * Extracts API key from X-API-Key header
 */
export const requireApiKey = async (req: ApiKeyRequest, res: Response, next: NextFunction) => {
  try {
    // Extract API key from X-API-Key header
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.unauthorized('X-API-Key header required');
    }

    // Validate API key and get user ID
    const userId = await apiKeyService.validateApiKey(apiKey);
    
    // Add user ID to request for use in route handlers
    req.apiKeyUserId = userId;
    
    next();
  } catch (error: any) {
    console.error('API key authentication error:', error);
    return res.unauthorized('Invalid API key');
  }
};

/**
 * Optional API key authentication - doesn't fail if no API key provided
 */
export const optionalApiKey = async (req: ApiKeyRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (apiKey) {
      const userId = await apiKeyService.validateApiKey(apiKey);
      req.apiKeyUserId = userId;
    }
    
    next();
  } catch (error: any) {
    console.error('Optional API key authentication error:', error);
    // Don't fail the request, just continue without API key user
    next();
  }
};
