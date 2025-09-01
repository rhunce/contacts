import { Contact, ContactListResponse, CreateContactRequest, UpdateContactRequest } from '@/types/contact';
import api from './api';

export const contactService = {
  async getContacts(page = 1, limit = 20, filter?: string): Promise<ContactListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (filter) {
      params.append('filter', filter);
    }
    
    const response = await api.get(`/contacts?${params.toString()}`);
    return response.data;
  },

  async getContact(id: string): Promise<Contact> {
    const response = await api.get(`/contact/${id}`);
    return response.data;
  },

  async createContact(contactData: CreateContactRequest): Promise<Contact> {
    const response = await api.post('/contact', contactData, {
      timeout: 30000, // 30 second timeout for contact creation (20s delay + buffer)
    });
    return response.data;
  },

  async updateContact(id: string, contactData: UpdateContactRequest): Promise<Contact> {
    const response = await api.patch(`/contact/${id}`, contactData);
    return response.data;
  },

  async deleteContact(id: string): Promise<void> {
    await api.delete(`/contact/${id}`);
  },

  async getContactHistory(id: string): Promise<any[]> {
    const response = await api.get(`/contact-history/${id}`);
    return response.data.data;
  },
};