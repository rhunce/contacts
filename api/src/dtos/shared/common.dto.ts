// Common DTOs and utilities used across different domains

export interface ValidationErrorDto {
  message: string;
  field?: string;
  code?: string;
}

export interface ApiErrorDto {
  message: string;
  field?: string;
  code?: string;
}

export interface ContactHistoryChangeDto {
  before: string;
  after: string;
}

// Base interfaces for common fields
export interface BaseEntityDto {
  id: string;
  createdAt: string; // ISO string for API
  updatedAt: string; // ISO string for API
}

export interface BaseEntityInternalDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
