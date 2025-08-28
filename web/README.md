# Contacts App Frontend

A Next.js frontend application for managing contacts with authentication and real-time updates.

## Features

- 🔐 **Authentication System**
  - Login/Register with email and password
  - Session-based authentication with cookies
  - Automatic redirects based on auth state
  - Protected routes

- 📱 **Contact Management**
  - View, create, edit, and delete contacts
  - Infinite scroll pagination
  - Alphabetical filtering
  - Contact history tracking

- 🎨 **Modern UI**
  - Material-UI components
  - Responsive design
  - Toast notifications
  - Loading states

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context + React Query
- **HTTP Client**: Axios with interceptors
- **Authentication**: Session-based with cookies

## Getting Started

### Prerequisites

- Node.js 18+
- Running backend API (see `../api/README.md`)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3001`

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# For production
# NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Authentication Flow

### Login Process
1. User enters email/password
2. Form validates input
3. API call to `/login` endpoint
4. Server validates credentials and sets session cookie
5. Frontend receives user data and updates auth context
6. User is redirected to dashboard

### Session Management
- Sessions are managed via HTTP-only cookies
- Automatic session validation on app load
- 401 responses trigger automatic logout
- Session persistence across browser tabs

### Protected Routes
- Dashboard requires authentication
- Unauthenticated users are redirected to login
- Loading states prevent flash of content

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Contacts/       # Contact-related components
│   └── Layout/         # Layout components
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication context
│   └── useContacts.ts  # Contact data management
├── pages/              # Next.js pages
│   ├── login.tsx       # Login page
│   ├── register.tsx    # Registration page
│   ├── dashboard.tsx   # Main dashboard
│   └── _app.tsx        # App wrapper
├── services/           # API service layer
│   ├── api.ts          # Axios configuration
│   ├── authService.ts  # Authentication API calls
│   └── contactService.ts # Contact API calls
├── types/              # TypeScript type definitions
│   ├── auth.ts         # Authentication types
│   └── contact.ts      # Contact types
└── utils/              # Utility functions
    └── constants.ts    # App constants
```

## API Integration

The frontend communicates with the backend API through:

- **Axios Instance**: Configured with base URL and interceptors
- **Service Layer**: Organized API calls by feature
- **Error Handling**: Centralized error handling with user-friendly messages
- **Type Safety**: Full TypeScript integration with API responses

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting
- Material-UI theming system

## Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

### Environment Configuration

For production deployment:

1. Set `NEXT_PUBLIC_API_URL` to your deployed API URL
2. Ensure CORS is configured on the backend
3. Configure proper session settings for production

## Security Features

- HTTP-only cookies for session management
- CSRF protection via session tokens
- Input validation and sanitization
- Secure API communication
- Automatic logout on authentication errors

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Ensure backend API is running
   - Verify CORS configuration

2. **Authentication Issues**
   - Clear browser cookies
   - Check session configuration
   - Verify API endpoints

3. **Build Errors**
   - Check TypeScript compilation
   - Verify all dependencies are installed
   - Clear `.next` cache if needed

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test authentication flows
4. Update documentation as needed
