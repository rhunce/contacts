import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, CustomSession } from '../types';

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const session = req.session as CustomSession;
  if (!session.userId) {
    return res.unauthorized();
  }
  next();
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // This middleware doesn't block the request, just adds user info if available
  next();
};
