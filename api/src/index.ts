import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { prisma } from './lib/prisma';
import { initializeDatabase } from './init-db';
import { CustomSession } from './types';
import { responseInterceptor } from './middleware/responseInterceptor';

// Import routes
import authRoutes from './routes/auth';
import contactRoutes from './routes/contacts';
import contactHistoryRoutes from './routes/contactHistory';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Response interceptor middleware (add this before routes)
app.use(responseInterceptor);

// Session configuration (will be updated with Redis store in startServer)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Always secure in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.success({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/', authRoutes);
app.use('/contact', contactRoutes);
app.use('/contacts', contactRoutes);
app.use('/contact-history', contactHistoryRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.notFound('Route not found');
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.error('Internal server error');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database (run migrations and seed if needed)
    await initializeDatabase();
    
    // Initialize Redis for sessions (only if REDIS_URL is provided)
    if (process.env.REDIS_URL) {
      const redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
          tls: true, // Always use TLS in production
          rejectUnauthorized: false
        }
      });

      // Connect to Redis
      await redisClient.connect();
      console.log('Connected to Redis for session storage');

      // Update session configuration with Redis store
      const redisStore = new RedisStore({
        client: redisClient,
        prefix: 'sess:',
      });

      // Update the session middleware with Redis store
      app.use(session({
        store: redisStore,
        secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: true, // Always secure in production
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
      }));
    } else {
      console.log('Redis not configured, using in-memory session store');
      // Session middleware is already configured above with default in-memory store
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Environment: production');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
