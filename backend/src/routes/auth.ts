import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { loginSchema, registerSchema } from '../schemas/authSchemas';

const router = Router();
const authController = new AuthController();

// GET /me - Get current user
router.get('/me', requireAuth, authController.getCurrentUser);

// POST /register - Register new user
router.post('/register', validateBody(registerSchema), authController.register);

// POST /login - Login user
router.post('/login', validateBody(loginSchema), authController.login);

// POST /logout - Logout user
router.post('/logout', authController.logout);

export default router;
