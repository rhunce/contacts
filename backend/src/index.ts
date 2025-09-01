import compression from 'compression';
import RedisStore from 'connect-redis';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import helmet from 'helmet';
import { createClient } from 'redis';
import { initializeDatabase } from './init-db';
import { prisma } from './lib/prisma';
import { responseInterceptor } from './middleware/responseInterceptor';

// Routes
import apiKeyRoutes from './routes/apiKeys';
import authRoutes from './routes/auth';
import contactHistoryRoutes from './routes/contactHistory';
import contactRoutes from './routes/contacts';
import externalContactRoutes from './routes/externalContacts';

// SSE Event Manager
import { requireAuth } from './middleware/auth';
import { SSEEventManager } from './services/sseEventManager';
import { AuthenticatedRequest } from './types';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV;

// 1) Security headers
app.use(helmet());

// 2) Trust the ALB / proxy so `req.secure` is accurate and `secure` cookies are set
app.set('trust proxy', 1);

// 3) CORS (allow localhost for dev + production origin via env)
const allowedOrigins = new Set<string>([
  'http://localhost:3001',
]);
if (process.env.CORS_ORIGIN) {
  allowedOrigins.add(process.env.CORS_ORIGIN);
}

// 4) CORS middleware
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

app.options('*', corsMiddleware);

// 5) Compression middleware (reduces response size by 70-85%)
app.use(compression({
  threshold: 1024, // Only compress responses larger than 1KB
  level: 6, // Compression level (1-9, higher = smaller but slower)
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use default compression filter
    return compression.filter(req, res);
  }
}));

// 6) Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) => req.method === 'OPTIONS'
  })
);

// 7) Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 8) Response interceptor (adds custom response methods for response formatting/standardization)
app.use(responseInterceptor);

// 9) Start the server with proper session configuration, then mount routes
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Build session options
    const baseSessionOptions: session.SessionOptions = {
      secret: process.env.SESSION_SECRET || 'super-secret-session-key',
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

    let redisClient: ReturnType<typeof createClient> | undefined;
    // Prefer Redis store in all environments if REDIS_URL provided
    if (process.env.REDIS_URL) {
      redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
          // Use TLS in prod since our ElastiCache has transit encryption enabled
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

    // 10) Mount API routes AFTER session middleware so req.session is available
    app.use('/', authRoutes);
    app.use('/contact', contactRoutes);
    app.use('/contacts', contactRoutes);
    app.use('/contact-history', contactHistoryRoutes);
    app.use('/api/keys', apiKeyRoutes);
    app.use('/api/external/contact', externalContactRoutes);
    // Health check
    app.get('/health', (req, res) => res.success({ status: 'OK', timestamp: new Date().toISOString() }));

    // 11) SSE endpoint for real-time updates
    const sseEventManager = SSEEventManager.getInstance();
    
    app.get('/api/events', requireAuth, (req: AuthenticatedRequest, res) => {
      sseEventManager.addClient(req.userId!, res);
      return; // Explicit return for TypeScript
    });

    // 12) 404 handler
    app.use('*', (req, res) => {
      res.notFound('Route not found');
    });

    // 13) Error handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', err);
      res.error('Internal server error');
    });

    // 14) Start server
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
      if (redisClient) await redisClient.disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully');
      await prisma.$disconnect();
      if (redisClient) await redisClient.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();