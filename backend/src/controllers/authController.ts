import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest, CustomSession } from '../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Get current user - maintains exact same response structure
   */
  getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await this.authService.getUserById(req.userId!);
      if (!user) {
        return res.unauthorized('User not found');
      }

      res.success({ user });
    } catch (error) {
      console.error('Get current user error:', error);
      res.error('Internal server error');
    }
  };

  /**
   * Register new user - maintains exact same response structure
   */
  register = async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await this.authService.getUserByEmail(email);
      if (existingUser) {
        return res.validationError([
          { message: 'User with this email already exists', field: 'email' }
        ]);
      }

      // Create new user
      const newUser = await this.authService.createUser({
        email,
        password,
        firstName,
        lastName
      });

      // Create user session
      const userSession = await this.authService.createUserSession(newUser);

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
  };

  /**
   * Login user - maintains exact same response structure
   */
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate credentials
      const user = await this.authService.validateCredentials({ email, password });
      if (!user) {
        return res.unauthorized('Invalid credentials');
      }

      const userSession = await this.authService.createUserSession(user);

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
  };

  /**
   * Logout user - maintains exact same response structure
   */
  logout = (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.error('Error during logout');
      }
      res.clearCookie('connect.sid');
      res.success({ message: 'Logout successful' });
    });
  };
}
