import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/auth';
import type { PaginatedResponse } from '../types/project';

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  totalPredictions: number;
  highRiskProjects: number;
  activeAlerts: number;
}

export const adminApi = {
  getUsers: (page = 1, pageSize = 10) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<UserListItem>>>('/admin/users', {
      params: { page, pageSize },
    }),

  changeUserRole: (userId: string, role: string) =>
    axiosInstance.patch<ApiResponse<null>>(`/admin/users/${userId}/role`, { role }),

  changeUserStatus: (userId: string, isActive: boolean) =>
    axiosInstance.patch<ApiResponse<null>>(`/admin/users/${userId}/status`, { isActive }),

  getStats: () =>
    axiosInstance.get<ApiResponse<SystemStats>>('/admin/stats'),

  getModelInfo: () =>
    axiosInstance.get<ApiResponse<object>>('/admin/model-info'),
};
