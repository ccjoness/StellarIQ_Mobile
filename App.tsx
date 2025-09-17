/**
 * StellarIQ Mobile App
 * Main application entry point
 */
import '@expo/metro-runtime';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Constants from 'expo-constants';

// Authentication and navigation
import { AuthProvider } from './src/contexts/AuthContext';
import { WatchlistProvider } from './src/contexts/WatchlistContext';
import { GoogleSignInService } from './src/services/googleSignIn';
import { ThemeProvider } from './src/providers/ThemeProvider';
import { useTheme } from './src/hooks/useTheme';
import { AppNavigator } from './src/navigation/AppNavigator';

// Theme-aware StatusBar component
function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (renamed from cacheTime in v5)
    },
  },
});

export default function App() {
  // Initialize Google Sign-In
  useEffect(() => {
    // Check if Google Sign-In is available
    if (!GoogleSignInService.isAvailable()) {
      console.warn('Google Sign-In not available in this environment (Expo Go)');
      return;
    }

    // Get Google client ID from app config
    const googleWebClientId = Constants.expoConfig?.extra?.googleWebClientId;
    if (googleWebClientId && googleWebClientId !== 'your-google-web-client-id.googleusercontent.com') {
      GoogleSignInService.configure(googleWebClientId);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <WatchlistProvider>
            <ThemeProvider>
              <NavigationContainer>
                <AppNavigator />
                <ThemedStatusBar />
              </NavigationContainer>
            </ThemeProvider>
          </WatchlistProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
