// Shared pagination DTOs used across different domains

// Pagination constants
export const PAGINATION_LIMITS = {
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 10,
  MIN_PAGE_SIZE: 1,
  MAX_PAGE: 10000, // Prevent extremely large page numbers
};

export interface PaginationOptionsDto {
  page: number;
  pageSize: number;
  skip: number;
}

export interface PaginationResultDto<T> {
  data: T[];
  total: number;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQueryDto {
  page?: string;
  pageSize?: string;
  order?: 'asc' | 'desc';
}

// Validation functions
export function validatePaginationParams(page?: string, pageSize?: string): { page: number; pageSize: number } {
  const pageNum = parseInt(page || '1');
  const pageSizeNum = parseInt(pageSize || PAGINATION_LIMITS.DEFAULT_PAGE_SIZE.toString());

  // Validate page number
  if (isNaN(pageNum) || pageNum < 1 || pageNum > PAGINATION_LIMITS.MAX_PAGE) {
    throw new Error(`Page must be between 1 and ${PAGINATION_LIMITS.MAX_PAGE}`);
  }

  // Validate page size
  if (isNaN(pageSizeNum) || pageSizeNum < PAGINATION_LIMITS.MIN_PAGE_SIZE || pageSizeNum > PAGINATION_LIMITS.MAX_PAGE_SIZE) {
    throw new Error(`Page size must be between ${PAGINATION_LIMITS.MIN_PAGE_SIZE} and ${PAGINATION_LIMITS.MAX_PAGE_SIZE}`);
  }

  return { page: pageNum, pageSize: pageSizeNum };
}
