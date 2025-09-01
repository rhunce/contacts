import { Request, Response } from 'express';
import { ContactDto } from '../../dtos/external/contact.dto';

// Mock response object for testing
export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.success = jest.fn().mockReturnValue(res);
  res.error = jest.fn().mockReturnValue(res);
  res.unauthorized = jest.fn().mockReturnValue(res);
  res.notFound = jest.fn().mockReturnValue(res);
  res.validationError = jest.fn().mockReturnValue(res);
  res.appError = jest.fn().mockReturnValue(res);
  return res;
};

// Mock request object for testing
export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
  return {
    body: {},
    params: {},
    query: {},
    ...overrides,
  };
};

// Mock API key request object for testing
export const createMockApiKeyRequest = (overrides: Partial<any> = {}): any => {
  return {
    body: {},
    params: {},
    query: {},
    apiKeyUserId: 'test-user-id',
    ...overrides,
  };
};

// Create mock contact data for testing
export const createMockContact = (overrides: Partial<ContactDto> = {}): ContactDto => ({
  id: 'test-contact-id',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  owner: {
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
  },
  ...overrides,
});

// Helper to check if response has expected structure
export const expectSuccessResponse = (res: any, expectedData?: any) => {
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 200,
      data: expectedData || expect.any(Object),
      errors: [],
    })
  );
};

// Helper to check if response has error structure
export const expectErrorResponse = (res: any, statusCode: number, expectedMessage?: string) => {
  expect(res.status).toHaveBeenCalledWith(statusCode);
  if (expectedMessage) {
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: statusCode,
        data: null,
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining(expectedMessage),
          }),
        ]),
      })
    );
  }
};
