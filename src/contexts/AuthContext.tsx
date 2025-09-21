/**
 * Authentication context and provider
 */

import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { apiService } from '@/services/api';
import { TokenStorage } from '@/services/tokenStorage';

import {
  AuthState,
  AuthContextType,
  User,
  AuthTokens,
  RegisterRequest,
  ChangePasswordRequest,
  UserUpdateRequest,
} from '@/types/auth';

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKENS'; payload: AuthTokens | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case 'SET_TOKENS':
      return { ...state, tokens: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Check if user has stored tokens
      const tokens = await TokenStorage.getTokens();
      const user = await TokenStorage.getUser();

      if (tokens && user) {
        dispatch({ type: 'SET_TOKENS', payload: tokens });
        dispatch({ type: 'SET_USER', payload: user });

        // Verify token is still valid by fetching current user
        try {
          const currentUser = await apiService.getCurrentUser();
          dispatch({ type: 'SET_USER', payload: currentUser });
          await TokenStorage.storeUser(currentUser);
        } catch (error) {
          // Token is invalid, clear auth
          await TokenStorage.clearAuth();
          dispatch({ type: 'LOGOUT' });
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      await TokenStorage.clearAuth();
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiService.login({ email, password });

      // Store tokens (now includes refresh token)
      await TokenStorage.storeTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token || '',
        token_type: response.token_type,
        expires_in: response.expires_in || 1800,
      });

      // Get user info separately since login doesn't return user data
      const user = await apiService.getCurrentUser();
      await TokenStorage.storeUser(user);

      dispatch({ type: 'SET_TOKENS', payload: {
        access_token: response.access_token,
        refresh_token: response.refresh_token || '',
        token_type: response.token_type,
        expires_in: response.expires_in || 1800,
      }});
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiService.register(data);

      // Current backend returns user data directly from register
      // Store the user data and create a simple token structure
      await TokenStorage.storeUser(response);

      // For now, we'll need to login after registration to get tokens
      // This is because the current backend register endpoint returns UserResponse, not tokens
      const loginResponse = await apiService.login({ email: data.email, password: data.password });

      await TokenStorage.storeTokens({
        access_token: loginResponse.access_token,
        refresh_token: loginResponse.refresh_token || '',
        token_type: loginResponse.token_type,
        expires_in: loginResponse.expires_in || 1800,
      });

      dispatch({ type: 'SET_TOKENS', payload: {
        access_token: loginResponse.access_token,
        refresh_token: loginResponse.refresh_token || '',
        token_type: loginResponse.token_type,
        expires_in: loginResponse.expires_in || 1800,
      }});
      // AuthResponse doesn't have all User fields, so we need to handle this properly
      if (response.user) {
        dispatch({ type: 'SET_USER', payload: response.user });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiService.loginWithGoogle({ id_token: idToken });

      // Store tokens and user
      await TokenStorage.storeTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_type: response.token_type,
        expires_in: response.expires_in,
      });
      await TokenStorage.storeUser(response.user);

      dispatch({ type: 'SET_TOKENS', payload: {
        access_token: response.access_token,
        refresh_token: response.refresh_token || '',
        token_type: response.token_type,
        expires_in: response.expires_in || 1800,
      }});
      if (response.user) {
        dispatch({ type: 'SET_USER', payload: response.user });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to revoke refresh token
      try {
        await apiService.logout();
      } catch (error) {
        console.log('Backend logout failed, continuing with local logout:', error);
      }

      // Clear local storage
      await TokenStorage.clearAuth();

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      await TokenStorage.clearAuth();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = await TokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.refreshToken(refreshToken);

      // Update stored tokens
      await TokenStorage.storeTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token || '',
        token_type: response.token_type,
        expires_in: response.expires_in || 1800,
      });

      dispatch({ type: 'SET_TOKENS', payload: {
        access_token: response.access_token,
        refresh_token: response.refresh_token || '',
        token_type: response.token_type,
        expires_in: response.expires_in || 1800,
      }});
    } catch (error) {
      console.error('Error refreshing token:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  const updateProfile = async (data: UserUpdateRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const updatedUser = await apiService.updateProfile(data);
      await TokenStorage.storeUser(updatedUser);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      await apiService.changePassword(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password change failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      await apiService.requestPasswordReset({ email });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset request failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      await apiService.resetPassword({ token, new_password: newPassword });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
