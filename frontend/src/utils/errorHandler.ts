import { ErrorType } from '@/types/errors';
import { getMaxContactsPerUser, getMaxUsers } from './limits';

export function getErrorType(error: any): ErrorType | null {
  // Check if it's in the errors array first (our backend structure)
  if (error?.response?.data?.errors && error.response.data.errors.length > 0) {
    return error.response.data.errors[0].type as ErrorType;
  }
  
  // Check if it's a structured error from our backend
  if (error?.response?.data?.type) {
    return error.response.data.type as ErrorType;
  }
  
  // Check if it's an AppError instance
  if (error?.type) {
    return error.type as ErrorType;
  }
  
  // Network/timeout errors (these are external to our app)
  if (error?.code === 'ECONNABORTED') {
    return ErrorType.TIMEOUT_ERROR;
  }
  
  // Log unstructured errors for debugging
  if (error && !error?.response?.data?.type && !error?.response?.data?.errors && !error?.type && error?.code !== 'ECONNABORTED') {
    console.warn('Unstructured error detected:', {
      error,
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status
    });
  }
  
  return null;
}

export function getErrorMessage(error: any): string {
  console.log('getErrorMessage called with:', error);
  const errorType = getErrorType(error);
  console.log('Error type detected:', errorType);
  
  switch (errorType) {
    case ErrorType.USER_LIMIT_REACHED:
      return `Maximum number of users reached (${getMaxUsers()}). Registration is temporarily disabled.`;
    
    case ErrorType.CONTACT_LIMIT_REACHED:
      return `You have reached the maximum limit of ${getMaxContactsPerUser()} contacts. Please delete some contacts before adding new ones.`;
    
    case ErrorType.DUPLICATE_EMAIL:
      return 'You already have a contact with this email address';
    
    case ErrorType.TIMEOUT_ERROR:
      return 'Request timed out. The server is processing your request, but it may take longer than expected. Please try again.';
    
    case ErrorType.VALIDATION_ERROR:
      // Check for structured error response from backend
      if (error?.response?.data?.errors && error.response.data.errors.length > 0) {
        const message = error.response.data.errors[0].message;
        console.log('Validation error message from backend:', message);
        return message;
      }
      const fallbackMessage = error?.response?.data?.message || error?.message || 'Validation error occurred.';
      console.log('Using fallback validation message:', fallbackMessage);
      return fallbackMessage;
    
    case ErrorType.UNAUTHORIZED:
      return 'You are not authorized to perform this action.';
    
    case ErrorType.NOT_FOUND:
      return 'The requested resource was not found.';
    
    default:
      // For unstructured errors, try to get a meaningful message
      const message = error?.response?.data?.message || error?.message;
      console.log('Default error message:', message);
      if (message) {
        return message;
      }
      
      // Log unexpected errors for debugging
      console.error('Unstructured error received:', error);
      return 'An unexpected error occurred. Please try again.';
  }
}


