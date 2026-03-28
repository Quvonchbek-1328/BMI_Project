import axiosInstance from './axiosInstance';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types/auth';

export const authApi = {
  register: (data: RegisterRequest) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: LoginRequest) =>
    axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data),

  getProfile: () =>
    axiosInstance.get<ApiResponse<UserProfile>>('/auth/me'),

  updateProfile: (data: UpdateProfileRequest) =>
    axiosInstance.put<ApiResponse<UserProfile>>('/auth/profile', data),

  changePassword: (data: ChangePasswordRequest) =>
    axiosInstance.post<ApiResponse<null>>('/auth/change-password', data),
};
