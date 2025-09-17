/**
 * Google Sign-In service
 */

// Conditional import for Google Sign-In (may not be available in Expo Go)
let GoogleSignin: any = null;
let statusCodes: any = null;

try {
  const googleSignInModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignInModule.GoogleSignin;
  statusCodes = googleSignInModule.statusCodes;
} catch (error) {
  console.warn('Google Sign-In module not available:', error);
}

export class GoogleSignInService {
  private static isConfigured = false;

  /**
   * Check if Google Sign-In is available
   */
  static isAvailable(): boolean {
    return GoogleSignin !== null;
  }

  /**
   * Configure Google Sign-In
   * Call this once during app initialization
   */
  static configure(webClientId: string) {
    if (this.isConfigured || !this.isAvailable()) {
      return;
    }

    try {
      GoogleSignin.configure({
        webClientId, // From Google Cloud Console
        offlineAccess: true, // To get refresh token
        hostedDomain: '', // Optional: restrict to specific domain
        forceCodeForRefreshToken: true, // Android only
      });

      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to configure Google Sign-In:', error);
    }
  }

  /**
   * Check if user is signed in
   */
  static async isSignedIn(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      return userInfo !== null;
    } catch (error) {
      console.error('Error checking Google sign-in status:', error);
      return false;
    }
  }

  /**
   * Get current user info if signed in
   */
  static async getCurrentUser() {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const userInfo = await GoogleSignin.signInSilently();
      return userInfo;
    } catch (error) {
      console.error('Error getting current Google user:', error);
      return null;
    }
  }

  /**
   * Sign in with Google
   */
  static async signIn() {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Google Sign-In not available in this environment',
      };
    }

    try {
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices();

      // Sign in
      const userInfo = await GoogleSignin.signIn();

      return {
        success: true,
        userInfo,
        idToken: userInfo.data?.idToken || null,
      };
    } catch (error: any) {
      console.error('Google Sign-In error:', error);

      let errorMessage = 'Google Sign-In failed';

      if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign-in was cancelled';
      } else if (statusCodes && error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign-in is already in progress';
      } else if (statusCodes && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Services not available';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Sign out from Google
   */
  static async signOut() {
    if (!this.isAvailable()) {
      return { success: true }; // Nothing to sign out from
    }

    try {
      await GoogleSignin.signOut();
      return { success: true };
    } catch (error) {
      console.error('Google Sign-Out error:', error);
      return {
        success: false,
        error: 'Failed to sign out from Google',
      };
    }
  }

  /**
   * Revoke access (disconnect)
   */
  static async revokeAccess() {
    if (!this.isAvailable()) {
      return { success: true }; // Nothing to revoke
    }

    try {
      await GoogleSignin.revokeAccess();
      return { success: true };
    } catch (error) {
      console.error('Google revoke access error:', error);
      return {
        success: false,
        error: 'Failed to revoke Google access',
      };
    }
  }

  /**
   * Get access tokens
   */
  static async getTokens() {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Google Sign-In not available',
      };
    }

    try {
      const tokens = await GoogleSignin.getTokens();
      return {
        success: true,
        tokens,
      };
    } catch (error) {
      console.error('Error getting Google tokens:', error);
      return {
        success: false,
        error: 'Failed to get Google tokens',
      };
    }
  }
}
