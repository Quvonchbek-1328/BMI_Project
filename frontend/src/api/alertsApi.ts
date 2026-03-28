import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/auth';
import type { Alert } from '../types/alert';
import type { PaginatedResponse } from '../types/project';

export const alertsApi = {
  getAll: (page = 1, pageSize = 10) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<Alert>>>('/alerts', {
      params: { page, pageSize },
    }),

  getUnreadCount: () =>
    axiosInstance.get<ApiResponse<number>>('/alerts/unread-count'),

  markAsRead: (id: string) =>
    axiosInstance.patch<ApiResponse<null>>(`/alerts/${id}/read`),

  markAllAsRead: () =>
    axiosInstance.patch<ApiResponse<null>>('/alerts/read-all'),
};
