import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/auth';
import type { Prediction, RunPredictionRequest } from '../types/prediction';

export const predictionsApi = {
  run: (data: RunPredictionRequest) =>
    axiosInstance.post<ApiResponse<Prediction>>('/predictions/run', data),

  getByProject: (projectId: string) =>
    axiosInstance.get<ApiResponse<Prediction[]>>(`/projects/${projectId}/predictions`),

  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Prediction>>(`/predictions/${id}`),

  getLatest: () =>
    axiosInstance.get<ApiResponse<Prediction[]>>('/predictions/latest'),
};
