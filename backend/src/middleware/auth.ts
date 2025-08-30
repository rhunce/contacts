import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, CustomSession } from '../types';

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const session = req.session as CustomSession;
  
  if (!session.userId) {
    return res.unauthorized('Authentication required');
  }
  
  req.userId = session.userId;
  
  next();
};
