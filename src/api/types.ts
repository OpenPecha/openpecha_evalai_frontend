// API Types for the application

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: ValidationError[];
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserUpdate {
  name?: string;
  picture?: string;
}

export interface UserFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
