import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/auth';
import type { Project, CreateProjectRequest, UpdateProjectRequest, ProjectSummary, PaginatedResponse } from '../types/project';

export const projectsApi = {
  getAll: (page = 1, pageSize = 10) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<Project>>>('/projects', {
      params: { page, pageSize },
    }),

  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Project>>(`/projects/${id}`),

  create: (data: CreateProjectRequest) =>
    axiosInstance.post<ApiResponse<Project>>('/projects', data),

  update: (id: string, data: UpdateProjectRequest) =>
    axiosInstance.put<ApiResponse<Project>>(`/projects/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete<ApiResponse<null>>(`/projects/${id}`),

  getSummary: (id: string) =>
    axiosInstance.get<ApiResponse<ProjectSummary>>(`/projects/${id}/summary`),
};
