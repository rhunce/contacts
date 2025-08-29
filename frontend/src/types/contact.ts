export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface ContactListResponse {
  status: number;
  data: {
    items: Contact[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  errors: any[];
}

export interface ContactHistory {
  id: string;
  contactId: string;
  action: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  createdAt: string;
}