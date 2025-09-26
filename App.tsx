/**
 * StellarIQ Mobile App
 * Main application entry point
 */
import '@expo/metro-runtime';

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


// Authentication and navigation
import { AuthProvider } from '@/contexts/AuthContext';
import { WatchlistProvider } from '@/contexts/WatchlistContext';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { useTheme } from '@/hooks/useTheme';
import { AppNavigator } from '@/navigation/AppNavigator';

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

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <NotificationProvider>
            <WatchlistProvider>
              <ThemeProvider>
                <NavigationContainer>
                  <AppNavigator />
                  <ThemedStatusBar />
                </NavigationContainer>
              </ThemeProvider>
            </WatchlistProvider>
          </NotificationProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
