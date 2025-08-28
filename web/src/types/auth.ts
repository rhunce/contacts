export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  status: number;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
    message: string;
  };
  errors: any[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}