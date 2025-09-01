import { Contact, ContactListResponse, CreateContactRequest, UpdateContactRequest } from '@/types/contact';
import api from './api';

export const contactService = {
  async getContacts(page = 1, pageSize = 20, filter?: string): Promise<ContactListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (filter) {
      params.append('filter', filter);
    }
    
    const response = await api.get(`/contacts?${params.toString()}`);
    return response.data;
  },

  async getContact(id: string): Promise<Contact> {
    const response = await api.get(`/contact/${id}`);
    console.log('API response for contact:', response.data);
    return response.data;
  },

  async createContact(contactData: CreateContactRequest): Promise<Contact> {
    try {
      const response = await api.post('/contact', contactData, {
        timeout: 30000, // 30 second timeout for contact creation (20s delay + buffer)
      });
      return response.data;
    } catch (error: any) {
      // Handle validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response?.data?.errors;
        if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
          const errorMessage = validationErrors.length === 1 
            ? validationErrors[0].message 
            : validationErrors.map(err => err.message).join(', ');
          throw new Error(errorMessage);
        }
        throw new Error('Please check your input and try again');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      }
      if (error.response?.status === 409) {
        // Handle conflict errors (like duplicate email)
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
          const errorMessage = error.response.data.errors[0].message;
          throw new Error(errorMessage);
        }
        const errorMessage = error.response?.data?.message || 'A conflict occurred. Please check your input and try again.';
        throw new Error(errorMessage);
      }
      throw new Error(error.response?.data?.message || 'Failed to create contact. Please try again.');
    }
  },

  async updateContact(id: string, contactData: UpdateContactRequest): Promise<Contact> {
    try {
      const response = await api.patch(`/contact/${id}`, contactData);
      return response.data;
    } catch (error: any) {
      // Handle validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response?.data?.errors;
        if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
          const errorMessage = validationErrors.length === 1 
            ? validationErrors[0].message 
            : validationErrors.map(err => err.message).join(', ');
          throw new Error(errorMessage);
        }
        throw new Error('Please check your input and try again');
      }
      if (error.response?.status === 404) {
        throw new Error('Contact not found');
      }
      if (error.response?.status === 409) {
        // Handle conflict errors (like duplicate email)
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
          const errorMessage = error.response.data.errors[0].message;
          throw new Error(errorMessage);
        }
        const errorMessage = error.response?.data?.message || 'A conflict occurred. Please check your input and try again.';
        throw new Error(errorMessage);
      }
      throw new Error(error.response?.data?.message || 'Failed to update contact. Please try again.');
    }
  },

  async deleteContact(id: string): Promise<void> {
    await api.delete(`/contact/${id}`);
  },

  async getContactHistory(id: string): Promise<any[]> {
    const response = await api.get(`/contact-history/${id}`);
    return response.data.data.items; // Extract items from paginated response
  },
};