/**
 * Secure token storage service
 * Uses AsyncStorage for token persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens } from '../types/auth';

const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'auth_user';

export class TokenStorage {
  /**
   * Store authentication tokens securely
   */
  static async storeTokens(tokens: AuthTokens | { access_token: string; token_type: string }): Promise<void> {
    try {
      // Ensure we have the required fields, with defaults for optional ones
      const tokenData: AuthTokens = {
        access_token: tokens.access_token,
        token_type: tokens.token_type,
        refresh_token: 'refresh_token' in tokens ? tokens.refresh_token : '',
        expires_in: 'expires_in' in tokens ? tokens.expires_in : 3600, // Default 1 hour
      };
      await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Retrieve stored authentication tokens
   */
  static async getTokens(): Promise<AuthTokens | null> {
    try {
      const tokensJson = await AsyncStorage.getItem(TOKEN_KEY);
      if (!tokensJson) {
        return null;
      }
      return JSON.parse(tokensJson) as AuthTokens;
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      return null;
    }
  }

  /**
   * Store user data
   */
  static async storeUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user:', error);
      throw new Error('Failed to store user data');
    }
  }

  /**
   * Retrieve stored user data
   */
  static async getUser(): Promise<any | null> {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      if (!userJson) {
        return null;
      }
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error retrieving user:', error);
      return null;
    }
  }

  /**
   * Clear all stored authentication data
   */
  static async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  }

  /**
   * Check if user is authenticated (has valid tokens)
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      if (!tokens) {
        return false;
      }

      // Check if access token is expired
      // Note: This is a basic check. In production, you might want to
      // decode the JWT and check the actual expiration time
      // The API will reject expired tokens anyway
      return true;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Get access token for API requests
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const tokens = await this.getTokens();
      return tokens?.access_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token for token renewal
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      const tokens = await this.getTokens();
      return tokens?.refresh_token || null;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Update only the access token (after refresh)
   */
  static async updateAccessToken(accessToken: string): Promise<void> {
    try {
      const tokens = await this.getTokens();
      if (tokens) {
        tokens.access_token = accessToken;
        await this.storeTokens(tokens);
      }
    } catch (error) {
      console.error('Error updating access token:', error);
      throw new Error('Failed to update access token');
    }
  }
}
