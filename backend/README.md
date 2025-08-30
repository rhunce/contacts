# Contacts API

A TypeScript Express.js backend for managing contacts with Prisma ORM and PostgreSQL.

## Features

- User authentication with session management
- CRUD operations for contacts
- Contact history tracking
- Pagination support
- Rate limiting
- Security middleware (Helmet, CORS)
- Docker support

## Database Schema

### Users
- `id` (UUID, Primary Key)
- `firstName` (string, required)
- `lastName` (string, required)
- `email` (string, required, unique, indexed)
- `password` (string, required, hashed)

### Contacts
- `id` (UUID, Primary Key)
- `ownerId` (UUID, Foreign Key to Users)
- `firstName` (string, required)
- `lastName` (string, required)
- `email` (string, required, unique per owner)
- `phone` (string, required)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- Unique constraint on (ownerId, email)

### ContactHistory
- `id` (UUID, Primary Key)
- `contactId` (UUID, Foreign Key to Contacts)
- `firstName` (JSON: { before: string, after: string }, optional)
- `lastName` (JSON: { before: string, after: string }, optional)
- `email` (JSON: { before: string, after: string }, optional)
- `phone` (JSON: { before: string, after: string }, optional)
- `createdAt` (timestamp)

## API Endpoints

### Authentication
- `POST /login` - Login with email and hashed password
- `POST /logout` - Logout and destroy session

### Contacts
- `GET /contacts` - Get paginated contacts (query params: page, pageSize)
- `GET /contact/:id` - Get specific contact
- `POST /contact` - Create new contact (20-second delay simulation)
- `PATCH /contact/:id` - Update contact and create history
- `DELETE /contact/:id` - Delete contact

### Contact History
- `GET /contact-history/:id` - Get contact history (query params: page, pageSize, order)

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Docker (optional)

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your database connection string
   ```

3. **Set up database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Docker

1. **Build image**
   ```bash
   docker build -t contacts-api .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 --env-file .env contacts-api
   ```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (.../production)
- `SESSION_SECRET` - Session encryption key
- `CORS_ORIGIN` - Allowed CORS origin

## Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Deploy migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

## Testing

The API includes a seed script that creates test data:

```bash
npm run db:seed
```

This creates:
- Test user: `test@example.com` / `password123`
- Sample contacts
- Sample contact history

## Production Deployment

The application is designed to run in ECS Fargate with the provided Dockerfile. Make sure to:

1. Set appropriate environment variables
2. Configure database connection
3. Set up proper session storage for production
4. Configure CORS origins
5. Set up proper logging and monitoring

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection protection (Prisma)
