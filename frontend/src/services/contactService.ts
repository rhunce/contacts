import { Contact, ContactListResponse, CreateContactRequest, UpdateContactRequest } from '@/types/contact';
import api from './api';
import { ApiErrorHandler } from '@/utils/apiErrorHandler';

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
      const customMessages = {
        409: 'A conflict occurred. Please check your input and try again.',
        422: 'Please check your input and try again'
      };
      
      throw ApiErrorHandler.createError(error, customMessages);
    }
  },

  async updateContact(id: string, contactData: UpdateContactRequest): Promise<Contact> {
    try {
      const response = await api.patch(`/contact/${id}`, contactData);
      return response.data;
    } catch (error: any) {
      const customMessages = {
        404: 'Contact not found',
        409: 'A conflict occurred. Please check your input and try again.',
        422: 'Please check your input and try again'
      };
      
      throw ApiErrorHandler.createError(error, customMessages);
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