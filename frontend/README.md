# Frontend Application 🎨

> **Next.js 14 application with real-time updates and Material-UI components**

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Component Structure](#component-structure)
- [State Management](#state-management)
- [Real-Time Features](#real-time-features)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Build & Deploy](#build--deploy)

## 🎯 Overview

The ContactFolio frontend is a modern, responsive web application built with Next.js 14, TypeScript, and React. It provides an intuitive user interface for contact management with real-time synchronization, beautiful Material-UI components, and an excellent user experience.

### Key Features
- **Real-time updates** via Server-Sent Events (SSE)
- **Material-UI components** for consistent, beautiful interfaces
- **Type-safe development** with TypeScript
- **Comprehensive testing** with Jest and React Testing Library
- **Optimized performance** with Next.js optimizations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pages         │    │   Components    │    │   Services      │
│                 │    │                 │    │                 │
│ • Dashboard     │───►│ • Layout        │───►│ • API Client    │
│ • Contacts      │    │ • ContactCards  │    │ • Auth Service  │
│ • Contact Hist  │    │ • Modals        │    │ • SSE Service   │
│ • API Keys      │    │ • Forms         │    │ • Contact Svc   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Hooks         │    │   Utils         │    │   Types         │
│                 │    │                 │    │                 │
│ • useAuth       │    │ • Error Handler │    │ • Contact       │
│ • useContacts   │    │ • Limits        │    │ • User          │
│ • useSSE        │    │ • Validation    │    │ • API Response  │
│ • Custom Hooks  │    │ • Formatters    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🧩 Component Structure

### Layout Components
```
Layout/
├── AuthGuard.tsx          # Route protection wrapper
├── Header.tsx             # Navigation and user menu
└── Layout.tsx             # Main layout wrapper
```

### Contact Components
```
Contacts/
├── AddContactModal.tsx     # Contact creation form
├── ContactCard.tsx         # Individual contact display
├── DeleteContactModal.tsx  # Contact deletion confirmation
└── EditContactModal.tsx    # Contact editing form
```

### API Key Components
```
ApiKeys/
├── ApiKeyCard.tsx         # API key display and actions
└── CreateApiKeyModal.tsx  # API key creation form
```

### Page Components
```
pages/
├── _app.tsx               # App wrapper and providers
├── dashboard.tsx          # Main dashboard view
├── contacts.tsx           # Contact list view
├── contact-history/       # Contact history pages
├── api-keys.tsx           # API key management
├── login.tsx              # Authentication
└── register.tsx           # User registration
```

## 🔄 State Management

### React Query (TanStack Query)
The application uses React Query for server state management:

```typescript
// Contact data fetching with pagination
const { data: contacts, isLoading, error } = useQuery({
  queryKey: ['contacts', page, filter],
  queryFn: () => contactService.getContacts(page, pageSize, filter),
  keepPreviousData: true
});

// Contact mutations
const createContactMutation = useMutation({
  mutationFn: contactService.createContact,
  onSuccess: () => {
    queryClient.invalidateQueries(['contacts']);
    toast.success('Contact created successfully!');
  }
});
```

### Local State
Component-level state management with React hooks:

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
const [filter, setFilter] = useState('');
```

### Custom Hooks
Reusable logic encapsulated in custom hooks:

```typescript
// Authentication hook
const { user, login, logout, isLoading } = useAuth();

// Contacts management hook
const { contacts, createContact, updateContact, deleteContact } = useContacts();
```

## 🔄 Real-Time Features

### Server-Sent Events (SSE)
Real-time contact synchronization across all connected clients:

```typescript
// SSE service for real-time updates
const sseService = {
  connect: () => {
    const eventSource = new EventSource('/api/events', {
      withCredentials: true
    });
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleRealTimeUpdate(data);
    };
  }
};

// Real-time update handling
const handleRealTimeUpdate = (data: SSEEvent) => {
  switch (data.type) {
    case 'contact:created':
      queryClient.invalidateQueries(['contacts']);
      break;
    case 'contact:updated':
      queryClient.invalidateQueries(['contacts']);
      break;
    case 'contact:deleted':
      queryClient.invalidateQueries(['contacts']);
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
- npm or yarn package manager

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Development
NODE_ENV=development
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🧪 Testing

### Testing Framework
- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation

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
├── components/            # Component tests
│   ├── ContactCard.test.tsx
│   ├── AddContactModal.test.tsx
│   └── DeleteContactModal.test.tsx
├── utils/                 # Utility function tests
│   └── limits.test.ts
└── setup.tsx             # Test configuration
```

### Testing Examples
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactCard } from '../ContactCard';

describe('ContactCard', () => {
  it('renders contact information correctly', () => {
    const mockContact = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890'
    };

    render(<ContactCard contact={mockContact} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

## 🚀 Build & Deploy

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Build Output
The build process generates:
- **Static assets** in `.next/static/`
- **Server-side code** in `.next/server/`
- **Client-side bundles** optimized for production

### Deployment
The frontend is automatically deployed via GitHub Actions:

1. **Build process** creates optimized production bundle
2. **Assets uploaded** to S3 bucket
3. **CloudFront cache** invalidated for immediate updates

### Environment Variables
Production environment variables:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.contactfolio.com
```

## 🎨 UI/UX Features

### Material-UI Integration
- **Theme customization** with consistent design tokens
- **Responsive breakpoints** for all screen sizes
- **Accessibility features** built-in

### Responsive Design
- **Mobile-first approach** with progressive enhancement
- **Flexible layouts** that adapt to screen size

### User Experience
- **Real-time feedback** for all user actions
- **Loading states** and progress indicators
- **Error handling** with user-friendly messages

## 📱 Performance Optimizations

### Next.js Features
- **Automatic code splitting** for optimal bundle sizes
- **Static generation** where possible

## 🔒 Security Features

### Authentication
- **Route protection** with AuthGuard component

### Data Validation
- **Type safety** with TypeScript

## 📚 Additional Resources

- **[Component Library](./src/components/)** - Reusable UI components
- **[Custom Hooks](./src/hooks/)** - Shared application logic
- **[Type Definitions](./src/types/)** - TypeScript interfaces
- **[Utility Functions](./src/utils/)** - Helper functions
- **[Service Layer](./src/services/)** - API integration

## 🐛 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### TypeScript Errors
```bash
# Check types
npm run type-check

# Regenerate types
npm run build
```

#### Test Failures
```bash
# Clear Jest cache
npm run test -- --clearCache

# Run specific test file
npm test -- ContactCard.test.tsx
```

---

**For more information, see the [main project README](../README.md)**
