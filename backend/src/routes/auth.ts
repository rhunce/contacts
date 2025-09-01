import { Request, Response, Router } from 'express';
import { LoginRequestDto } from '../dtos/external/user.dto';
import { requireAuth } from '../middleware/auth';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest, CustomSession } from '../types';

const router = Router();
const authService = new AuthService();

// GET /me - Get current user
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await authService.getUserById(req.userId!);
    if (!user) {
      return res.unauthorized('User not found');
    }

    res.success({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.error('Internal server error');
  }
});

// POST /register - Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.validationError([
        { message: 'Email, password, firstName, and lastName are required', field: 'credentials' }
      ]);
    }

    // Check if user already exists
    const existingUser = await authService.getUserByEmail(email);
    if (existingUser) {
      return res.validationError([
        { message: 'User with this email already exists', field: 'email' }
      ]);
    }

    // Create new user
    const newUser = await authService.createUser({
      email,
      password,
      firstName,
      lastName
    });

    // Create user session
    const userSession = await authService.createUserSession(newUser);

    // Set session
    (req.session as CustomSession).userId = newUser.id;
    (req.session as CustomSession).user = userSession;

    res.success({
      message: 'Registration successful',
      user: userSession
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    res.appError(error);
  }
});

// POST /login - Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequestDto = req.body;

    if (!email || !password) {
      return res.validationError([
        { message: 'Email and password are required', field: 'credentials' }
      ]);
    }

    // Validate credentials
    const user = await authService.validateCredentials({ email, password });
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
