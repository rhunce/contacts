export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
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

export interface ContactHistoryChange {
  before: string;
  after: string;
}

export interface ContactHistory {
  id: string;
  firstName?: ContactHistoryChange;
  lastName?: ContactHistoryChange;
  email?: ContactHistoryChange;
  phone?: ContactHistoryChange;
  createdAt: string;
  updatedAt: string;
}