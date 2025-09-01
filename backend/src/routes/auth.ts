import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { authSchemas } from '../validation/auth.schemas';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

// GET /me - Get current user
router.get('/me', requireAuth, authController.getCurrentUser);

// POST /register - Register new user
router.post('/register', validateRequest(authSchemas.register), authController.register);

// POST /login - Login user
router.post('/login', validateRequest(authSchemas.login), authController.login);

// POST /logout - Logout user
router.post('/logout', authController.logout);

export default router;
