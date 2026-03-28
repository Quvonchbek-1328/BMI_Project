import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/auth';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import type { PaginatedResponse } from '../types/project';

export const tasksApi = {
  getByProject: (projectId: string, page = 1, pageSize = 20) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<Task>>>(`/projects/${projectId}/tasks`, {
      params: { page, pageSize },
    }),

  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Task>>(`/tasks/${id}`),

  create: (projectId: string, data: CreateTaskRequest) =>
    axiosInstance.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data),

  update: (id: string, data: UpdateTaskRequest) =>
    axiosInstance.put<ApiResponse<Task>>(`/tasks/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/tasks/${id}`),

  updateStatus: (id: string, status: string) =>
    axiosInstance.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status }),

  assign: (id: string, assigneeId: string | null) =>
    axiosInstance.patch<ApiResponse<Task>>(`/tasks/${id}/assign`, { assigneeId }),
};
