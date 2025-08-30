import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { prisma } from './lib/prisma';
import { initializeDatabase } from './init-db';
import { responseInterceptor } from './middleware/responseInterceptor';

// Routes
import authRoutes from './routes/auth';
import contactRoutes from './routes/contacts';
import contactHistoryRoutes from './routes/contactHistory';
import apiKeyRoutes from './routes/apiKeys';
import externalContactRoutes from './routes/externalContacts';

// SSE Event Manager
import { SSEEventManager } from './services/sseEventManager';
import { CustomSession } from './types';

export const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 1) Security headers
app.use(helmet());

// 2) Trust the ALB / proxy so `req.secure` is accurate and `secure` cookies are set
app.set('trust proxy', 1);

// 3) CORS (allow localhost for dev + a single production origin via env)
const allowedOrigins = new Set<string>([
  'http://localhost:3001',
]);
if (process.env.CORS_ORIGIN) {
  allowedOrigins.add(process.env.CORS_ORIGIN);
}

// If you want stricter control, use a function. Array also works, but function lets us log mismatches.
const corsMiddleware = cors({
  origin: (origin, callback) => {
    // allow non-browser tools (curl/postman) with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin not allowed -> ${origin}`));
  },
  credentials: true,
});
app.use(corsMiddleware);
// Preflight
app.options('*', corsMiddleware);

// 4) Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) => req.method === 'OPTIONS'
  })
);

// 5) Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 6) Response interceptor (before routes)
app.use(responseInterceptor);

// 7) Health check (works even before DB initialization)
app.get('/health', (req, res) => {
  res.success({ status: 'OK', timestamp: new Date().toISOString() });
});

// 8) Start the server with proper session configuration, then mount routes
async function startServer() {
  try {
    // Ensure DB is migrated/seeded as your helper dictates (only in non-test environments)
    if (process.env.NODE_ENV !== 'test') {
      await initializeDatabase();
    }

    // --- Build session options once ---
    const baseSessionOptions: session.SessionOptions = {
      secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        // Cross-site cookies need SameSite=None and Secure in production
        secure: NODE_ENV === 'production',
        sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24h
      },
    };

    // --- Prefer Redis store in all environments if REDIS_URL provided ---
    if (process.env.REDIS_URL) {
      const redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
          // Use TLS in prod since your ElastiCache has transit encryption enabled
          tls: NODE_ENV === 'production',
          rejectUnauthorized: false,
        },
      });

      await redisClient.connect();
      console.log('Connected to Redis for session storage');

      const redisStore = new RedisStore({
        client: redisClient,
        prefix: 'sess:',
      });

      app.use(
        session({
          ...baseSessionOptions,
          store: redisStore,
        })
      );
    } else {
      console.log('REDIS_URL not set — using in-memory session store');
      app.use(session(baseSessionOptions));
    }

    // 9) Mount API routes AFTER session middleware so req.session is available
    app.use('/', authRoutes);
    app.use('/contact', contactRoutes);
    app.use('/contacts', contactRoutes);
    app.use('/contact-history', contactHistoryRoutes);
    app.use('/api/keys', apiKeyRoutes);
    app.use('/api/external/contact', externalContactRoutes);

    // 10) SSE endpoint for real-time updates
    const sseEventManager = SSEEventManager.getInstance();
    
    app.get('/api/events', (req, res) => {
      const session = req.session as CustomSession;
      if (!session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      sseEventManager.addClient(session.userId, res);
      return; // Explicit return for TypeScript
    });

    // 10) 404 handler
    app.use('*', (req, res) => {
      res.notFound('Route not found');
    });

    // 11) Error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', err);
      res.error('Internal server error');
    });

    // 12) Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
      if (process.env.CORS_ORIGIN) {
        console.log(`CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
      } else {
        console.log('CORS_ORIGIN is not set; only localhost will be allowed for browser origins.');
      }
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
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
