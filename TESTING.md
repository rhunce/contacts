# Testing Documentation

This document outlines the comprehensive testing strategy for the Contacts application, covering both backend and frontend testing.

## 🧪 Testing Overview

The application uses a multi-layered testing approach:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test API endpoints and component interactions
- **E2E Tests**: Test complete user workflows end-to-end

## 📁 Test Structure

```
├── backend/
│   ├── __tests__/
│   │   ├── setup.ts                 # Global test setup
│   │   ├── unit/
│   │   │   └── services/
│   │   │       ├── authService.test.ts
│   │   │       ├── contactService.test.ts
│   │   │       └── apiKeyService.test.ts
│   │   ├── integration/
│   │   │   ├── auth.test.ts
│   │   │   ├── contacts.test.ts
│   │   │   └── apiKeys.test.ts
│   │   └── e2e/
│   │       └── api.test.ts
│   ├── jest.config.js
│   └── package.json
├── frontend/
│   ├── __tests__/
│   │   ├── unit/
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.test.tsx
│   │   │   └── components/
│   │   │       ├── Contacts/
│   │   │       │   └── ContactCard.test.tsx
│   │   │       └── ApiKeys/
│   │   │           └── ApiKeyCard.test.tsx
│   │   ├── integration/
│   │   └── e2e/
│   ├── jest.config.js
│   ├── jest.setup.js
│   └── package.json
└── .github/workflows/
    └── test.yml
```

## 🚀 Running Tests

### Backend Tests

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Tests

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🎯 Test Coverage Areas

### Priority Testing Areas

1. **Authentication Flows**
   - User registration
   - User login/logout
   - Session management
   - Password validation

2. **CRUD Operations**
   - Contact creation, reading, updating, deletion
   - API key management
   - Data validation

3. **Error Handling**
   - Validation errors
   - API errors
   - Network errors
   - Authentication errors

4. **Security**
   - API key validation
   - Authentication middleware
   - Input sanitization
   - Authorization checks

5. **User Flows**
   - Complete user registration to contact management
   - API key creation and usage
   - Contact management workflows

## 📊 Test Types

### Unit Tests

**Backend Unit Tests:**
- Service layer functions
- Utility functions
- Repository methods
- Middleware functions

**Frontend Unit Tests:**
- React components
- Custom hooks
- Utility functions
- Service functions

### Integration Tests

**Backend Integration Tests:**
- API endpoint testing
- Database interactions
- Authentication flows
- Error handling

**Frontend Integration Tests:**
- Component interactions
- Service integrations
- State management
- User interactions

### E2E Tests

**Complete Workflow Tests:**
- User registration → login → contact management
- API key creation → usage → revocation
- Error scenarios and recovery
- Cross-feature interactions

## 🔧 Test Configuration

### Backend Configuration

```javascript
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testTimeout: 10000,
};
```

### Frontend Configuration

```javascript
// frontend/jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testMatch: [
    '**/__tests__/**/*.test.tsx',
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).tsx',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 10000,
};

module.exports = createJestConfig(customJestConfig);
```

## 🏗️ CI/CD Integration

### GitHub Actions Workflow

The testing is integrated into the CI/CD pipeline via GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    # Backend testing with PostgreSQL service
  test-frontend:
    # Frontend testing
  test-combined:
    # Combined test summary
```

### Automated Testing

- **On Push**: Tests run automatically on main branch
- **On PR**: Tests run for all pull requests
- **Coverage Reports**: Generated and uploaded to Codecov
- **Test Summary**: Posted to GitHub PR comments

## 📈 Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 70%+ coverage
- **E2E Tests**: Critical user flows
- **Performance Tests**: API response times

## 🛠️ Testing Tools

### Backend Tools
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library for API testing
- **Prisma**: Database testing and seeding
- **TypeScript**: Type checking during tests

### Frontend Tools
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers
- **@testing-library/user-event**: User interaction simulation

## 🐛 Debugging Tests

### Common Issues

1. **Database Connection**: Ensure test database is running
2. **Environment Variables**: Check test environment setup
3. **Mocking**: Verify mocks are properly configured
4. **Async Operations**: Use proper async/await patterns

### Debug Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- path/to/test/file.test.ts

# Run tests with debugging
npm test -- --detectOpenHandles --forceExit

# Run tests with coverage and watch
npm run test:coverage -- --watch
```

## 📝 Writing Tests

### Test Naming Convention

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // test implementation
    });
  });
});
```

### Test Structure

```typescript
describe('Feature', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should handle success case', () => {
    // Arrange
    // Act
    // Assert
  });

  it('should handle error case', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## 🔍 Best Practices

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Test names should clearly describe the scenario
3. **AAA Pattern**: Arrange, Act, Assert
4. **Mock External Dependencies**: Don't rely on external services
5. **Test Data Management**: Use factories or fixtures for test data
6. **Error Scenarios**: Test both success and failure cases
7. **Performance**: Keep tests fast and efficient

## 🗄️ Database Isolation & Cleanup

### Database Safety

- **Separate Test Database**: Tests use `contacts_test` database, never your production database
- **Environment Variables**: Tests use `TEST_DATABASE_URL` to ensure isolation
- **Automatic Cleanup**: Test database is reset after each test run
- **Safety Checks**: Setup validates that tests are using test database

### Cleanup Process

1. **Before Each Test**: Database is cleaned via `beforeEach` hooks
2. **After Each Test**: Individual test cleanup in `afterEach` hooks
3. **After All Tests**: Database reset via `--force-reset` flag
4. **CI/CD Cleanup**: GitHub Actions destroys the test database container

### Local Development

```bash
# Set up test database locally
export TEST_DATABASE_URL="postgresql://test:test@localhost:5432/contacts_test"

# Run tests with proper isolation
npm test

# Clean up manually if needed
npx prisma db push --force-reset
```

### Production Safety

- Tests **never** connect to production database
- Environment validation prevents accidental production connections
- CI/CD uses isolated containers for testing

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
