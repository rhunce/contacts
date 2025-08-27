// Shared pagination DTOs used across different domains

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
