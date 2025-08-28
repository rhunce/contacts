import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginRequestDto } from '../dtos/external/user.dto';
import { CustomSession } from '../types';

const router = Router();
const authService = new AuthService();

// POST /login - Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, hashedPassword }: LoginRequestDto = req.body;

    if (!email || !hashedPassword) {
      return res.validationError([
        { message: 'Email and password are required', field: 'credentials' }
      ]);
    }

    // Validate credentials
    const user = await authService.validateCredentials({ email, hashedPassword });
    if (!user) {
      return res.unauthorized('Invalid credentials');
    }

    // Create user session
    const userSession = await authService.createUserSession(user);

    // Set session
    (req.session as CustomSession).userId = user.id;
    (req.session as CustomSession).user = userSession;

    res.success({
      message: 'Login successful',
      user: userSession
    });
  } catch (error) {
    console.error('Login error:', error);
    res.error('Internal server error');
  }
});

// POST /logout - Logout user
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.error('Error during logout');
    }
    res.clearCookie('connect.sid');
    res.success({ message: 'Logout successful' });
  });
});

export default router;
