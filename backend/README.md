# Backend API Documentation 🚀

> **Express.js REST API with real-time SSE capabilities and comprehensive validation**

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Real-Time Features](#real-time-features)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Deployment](#deployment)

## 🎯 Overview

The ContactFolio backend is a robust, scalable API server built with Express.js and TypeScript. It provides comprehensive contact management capabilities with real-time synchronization, external API integration, and enterprise-grade security features.

### Key Features
- **RESTful API** with comprehensive CRUD operations
- **Real-time updates** via Server-Sent Events (SSE)
- **External API integration** with API key authentication
- **Layered architecture** (Routes → Controllers → Services → Repositories)
- **Request validation** using Joi schemas
- **Rate limiting** and security middleware
- **Response compression** with Gzip optimization
- **Comprehensive testing** with Jest

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Routes        │    │  Controllers    │    │   Services      │
│                 │    │                 │    │                 │
│ • /auth         │───►│ • AuthCtrl      │───►│ • AuthService   │
│ • /contacts     │    │ • ContactCtrl   │    │ • ContactSvc    │
│ • /api-keys     │    │ • HistoryCtrl   │    │ • HistorySvc    │
│ • /external     │    │ • ApiKeyCtrl    │    │ • ApiKeySvc     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Middleware     │    │  Validation     │    │  Repositories   │
│                 │    │                 │    │                 │
│ • Auth          │    │ • Joi Schemas   │    │ • UserRepo      │
│ • CORS          │    │ • Request Val   │    │ • ContactRepo   │
│ • Rate Limit    │    │ • Response Int  │    │ • HistoryRepo   │
│ • Compression   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | User registration | ❌ |
| `POST` | `/auth/login` | User login | ❌ |
| `POST` | `/auth/logout` | User logout | ✅ |
| `GET` | `/auth/me` | Get current user | ✅ |

### Contacts
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/contacts` | List contacts (paginated) | ✅ |
| `POST` | `/contact` | Create new contact | ✅ |
| `GET` | `/contact/:id` | Get contact by ID | ✅ |
| `PATCH` | `/contact/:id` | Update contact | ✅ |
| `DELETE` | `/contact/:id` | Delete contact | ✅ |

### Contact History
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/contact-history/:id` | Get contact history (paginated) | ✅ |

### API Keys
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api-keys` | List user's API keys | ✅ |
| `POST` | `/api-keys` | Create new API key | ✅ |
| `DELETE` | `/api-keys/:id` | Revoke API key | ✅ |
| `POST` | `/api-keys/:id/restore` | Restore revoked key | ✅ |

### External API (API Key Auth)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/external/contacts/:externalId` | Get contact by external ID | ✅ |
| `POST` | `/external/contacts` | Create contact with external ID | ✅ |
| `PATCH` | `/external/contacts/:externalId` | Update contact by external ID | ✅ |
| `DELETE` | `/external/contacts/:externalId` | Delete contact by external ID | ✅ |

### Real-Time Events
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/events` | Server-Sent Events stream | ✅ |

## 🔐 Authentication

### Session-Based Authentication
The API uses session-based authentication with secure cookies:

```bash
# Login to create a session
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}' \
  -c cookies.txt

# Use session cookie for subsequent requests
curl -b cookies.txt http://localhost:3001/contacts

# Or use the session cookie directly
curl -H "Cookie: connect.sid=<SESSION_ID>" \
  http://localhost:3001/contacts
```

### API Key Authentication
External integrations use API keys:

```bash
# Use API key for external endpoints
curl -H "X-API-Key: <API_KEY>" \
  http://localhost:3001/external/contacts/123
```

### Session Management
- **Redis-based sessions** in production
- **In-memory sessions** for development
- **Secure cookies** with SameSite and Secure flags

## 🔄 Real-Time Features

### Server-Sent Events (SSE)
The backend provides real-time updates via SSE for instant contact synchronization:

```typescript
// Frontend connection
const eventSource = new EventSource('/api/events', {
  withCredentials: true
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
  switch(data.type) {
    case 'contact:created':
      // Update UI
      break;
    case 'contact:updated':
      // Refresh contact data
      break;
    case 'contact:deleted':
      // Remove from UI
      break;
  }
};
```

### Event Types
- `contact:created` - New contact added
- `contact:updated` - Contact modified
- `contact:deleted` - Contact removed
- `connected` - SSE connection established

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis (optional, for production-like sessions)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/contacts"

# Authentication
SESSION_SECRET="your-super-secret-key"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# CORS
CORS_ORIGIN="http://localhost:3001"

# Server
PORT=3000
NODE_ENV=development
```

### 3. Database Setup
```bash
# Run migrations
npx prisma migrate dev

# Seed database
npm run seed

# Generate Prisma client
npx prisma generate
```

### 4. Start Development Server
```bash
npm run dev
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Structure
```
src/__tests__/
├── controllers/          \# Controller unit tests
├── middleware/          # Middleware tests
├── services/            # Service layer tests (TODO)
├── utils/               # Utility function tests
└── setup.ts             # Test configuration
```

### Test Utilities
The project includes comprehensive test utilities:

```typescript
import { createMockRequest, createMockResponse, expectSuccessResponse } from '../utils/testUtils';

describe('ContactController', () => {
  it('should create a contact', async () => {
    const req = createMockRequest({ body: contactData });
    const res = createMockResponse();
    
    await contactController.createContact(req, res);
    
    expectSuccessResponse(res, 201);
  });
});
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -t contactfolio-backend .

# Run container
docker run -p 3001:3001 contactfolio-backend
```

### Environment Variables
Production environment variables:

```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
SESSION_SECRET="..."
JWT_SECRET="..."
REDIS_URL="redis://..."
CORS_ORIGIN="https://yourdomain.com"
```

### Health Checks
The API includes a basic health check endpoint:

```bash
# Health check
curl http://localhost:3000/health
```

## 📊 Performance & Monitoring

### Rate Limiting
- **1000 requests per 10 minutes** per IP
- **OPTIONS requests excluded** for CORS preflight

### Compression
- **Gzip compression** for responses > 1KB
- **SSE endpoints excluded** from compression
- **Configurable compression levels**

### Logging
- **Error logging** with stack traces
- **Server status logging** for monitoring

## 🔒 Security Features

### Input Validation
- **Joi schemas** for all request validation
- **SQL injection protection** via Prisma ORM
- **XSS protection** via Helmet.js security headers

### Authentication Security
- **bcrypt hashing** for passwords and API keys
- **Secure session cookies** with proper flags

### API Security
- **CORS protection** with origin validation
- **Rate limiting** to prevent abuse
- **Request size limits** to prevent DoS

## 📚 Additional Resources

- **[API Error Handling](./src/utils/errors.ts)** - Error types and handling
- **[Database Schema](./prisma/schema.prisma)** - Prisma schema definition
- **[Validation Schemas](./src/validation/)** - Joi validation schemas
- **[Test Utilities](./src/__tests__/utils/)** - Testing helper functions

---

**For more information, see the [main project README](../README.md)**
