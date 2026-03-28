export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  userId: string;
  fullName: string;
  email: string;
  token: string;
  roles: string[];
  expiresAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
