/**
 * Authentication types and interfaces
 */

export interface User {
  id: number;
  email: string;
  username?: string; // Made optional for backward compatibility
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  // New backend fields
  full_name?: string;
  is_oauth_user?: boolean;
  display_name?: string;
  avatar_url?: string;
  timezone?: string;
  preferred_currency?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  last_login?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  // Optional fields for future compatibility
  full_name?: string;
  timezone?: string;
  preferred_currency?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
}

export interface GoogleOAuthRequest {
  id_token: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  // Optional fields for compatibility
  refresh_token?: string;
  expires_in?: number;
  user?: User;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UserUpdateRequest {
  full_name?: string;
  timezone?: string;
  preferred_currency?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: UserUpdateRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}
