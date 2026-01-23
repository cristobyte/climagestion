import { USER_ROLES, TASK_STATUSES, SERVICE_TYPES, PRIORITIES } from './constants';

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type TaskStatus = typeof TASK_STATUSES[keyof typeof TASK_STATUSES];
export type ServiceType = typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES];
export type Priority = typeof PRIORITIES[keyof typeof PRIORITIES];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  serviceType: ServiceType;
  status: TaskStatus;
  priority: Priority;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string;
  scheduledDate: string;
  notes: string | null;
  completionNotes: string | null;
  assignedTo: string | null;
  assignedUser?: User | null;
  createdBy: string;
  createdByUser?: User;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
  phone?: string;
}

export interface CreateTaskRequest {
  title: string;
  serviceType: ServiceType;
  priority: Priority;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  scheduledDate: string;
  notes?: string;
  assignedTo?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  serviceType?: ServiceType;
  priority?: Priority;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  address?: string;
  scheduledDate?: string;
  notes?: string;
  assignedTo?: string | null;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
  completionNotes?: string;
}

export interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  assignedTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  cancelledTasks: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  serviceType?: ServiceType;
  priority?: Priority;
  assignedTo?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
