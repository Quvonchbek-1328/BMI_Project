import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/auth';
import type { RiskMetric, CreateRiskMetricRequest } from '../types/riskMetric';

export const riskMetricsApi = {
  getByProject: (projectId: string) =>
    axiosInstance.get<ApiResponse<RiskMetric[]>>(`/projects/${projectId}/risk-metrics`),

  getById: (id: string) =>
    axiosInstance.get<ApiResponse<RiskMetric>>(`/risk-metrics/${id}`),

  create: (projectId: string, data: CreateRiskMetricRequest) =>
    axiosInstance.post<ApiResponse<RiskMetric>>(`/projects/${projectId}/risk-metrics`, data),

  getHistory: (projectId: string) =>
    axiosInstance.get<ApiResponse<RiskMetric[]>>(`/projects/${projectId}/risk-metrics/history`),
};
