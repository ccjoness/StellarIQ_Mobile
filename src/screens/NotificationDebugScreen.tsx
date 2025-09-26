/**
 * Debug screen for testing notifications in production builds
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/providers/NotificationProvider';
import { apiService } from '@/services/api';
import { API_CONFIG, STORAGE_KEYS } from '@/constants/config';

interface DebugInfo {
  isDevice: boolean;
  platform: string;
  deviceName: string | null;
  modelName: string | null;
  permissionStatus: string;
  expoPushToken: string | null;
  isAuthenticated: boolean;
  isRegistered: boolean;
  apiBaseUrl: string;
  storedToken: string | null;
  lastError: string | null;
}

export function NotificationDebugScreen() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const { 
    expoPushToken, 
    isPermissionGranted, 
    isRegistered, 
    requestPermission, 
    registerWithAPI 
  } = useNotifications();

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_TOKEN);
      
      setDebugInfo({
        isDevice: Device.isDevice,
        platform: Platform.OS,
        deviceName: Device.deviceName,
        modelName: Device.modelName,
        permissionStatus: status,
        expoPushToken,
        isAuthenticated,
        isRegistered,
        apiBaseUrl: API_CONFIG.BASE_URL,
        storedToken,
        lastError: null,
      });
    } catch (error) {
      setDebugInfo(prev => prev ? {
        ...prev,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      } : null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDebugInfo();
    setRefreshing(false);
  };

  const handleRequestPermissions = async () => {
    try {
      setTesting(true);
      const granted = await requestPermission();
      Alert.alert(
        'Permission Result',
        granted ? 'Permissions granted!' : 'Permissions denied',
        [{ text: 'OK', onPress: loadDebugInfo }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to request permissions: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const handleRegisterWithAPI = async () => {
    try {
      setTesting(true);
      const success = await registerWithAPI();
      Alert.alert(
        'Registration Result',
        success ? 'Successfully registered with API!' : 'Failed to register with API',
        [{ text: 'OK', onPress: loadDebugInfo }]
      );
    } catch (error) {
      Alert.alert('Error', `Registration failed: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const handleTestAPIConnection = async () => {
    try {
      setTesting(true);
      
      // Test basic API connectivity
      const response = await fetch(`${API_CONFIG.BASE_URL}/docs`);
      if (response.ok) {
        Alert.alert('API Test', 'API is reachable!');
      } else {
        Alert.alert('API Test', `API returned status: ${response.status}`);
      }
    } catch (error) {
      Alert.alert('API Test', `Failed to reach API: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const handleTestDeviceTokenEndpoint = async () => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'You must be logged in to test this endpoint');
      return;
    }

    try {
      setTesting(true);
      const tokens = await apiService.getDeviceTokens();
      Alert.alert(
        'Device Tokens',
        `Found ${tokens.length} device tokens for your account`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to fetch device tokens: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const handleGenerateTestToken = async () => {
    try {
      setTesting(true);
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      Alert.alert(
        'Test Token Generated',
        `Token: ${token.substring(0, 50)}...`,
        [{ text: 'OK', onPress: loadDebugInfo }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to generate token: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  if (!debugInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading debug info...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>🔧 Notification Debug</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Info</Text>
        <Text style={styles.info}>Is Physical Device: {debugInfo.isDevice ? '✅' : '❌'}</Text>
        <Text style={styles.info}>Platform: {debugInfo.platform}</Text>
        <Text style={styles.info}>Device Name: {debugInfo.deviceName || 'Unknown'}</Text>
        <Text style={styles.info}>Model: {debugInfo.modelName || 'Unknown'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        <Text style={styles.info}>Status: {debugInfo.permissionStatus}</Text>
        <Text style={styles.info}>Granted: {isPermissionGranted ? '✅' : '❌'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication</Text>
        <Text style={styles.info}>Authenticated: {debugInfo.isAuthenticated ? '✅' : '❌'}</Text>
        <Text style={styles.info}>User: {user?.email || 'Not logged in'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Push Token</Text>
        <Text style={styles.info}>Has Token: {debugInfo.expoPushToken ? '✅' : '❌'}</Text>
        <Text style={styles.info}>Registered: {debugInfo.isRegistered ? '✅' : '❌'}</Text>
        {debugInfo.expoPushToken && (
          <Text style={styles.tokenText}>
            Token: {debugInfo.expoPushToken.substring(0, 50)}...
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>
        <Text style={styles.info}>Base URL: {debugInfo.apiBaseUrl}</Text>
      </View>

      {debugInfo.lastError && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last Error</Text>
          <Text style={styles.error}>{debugInfo.lastError}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, testing && styles.buttonDisabled]} 
          onPress={handleRequestPermissions}
          disabled={testing}
        >
          <Text style={styles.buttonText}>Request Permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, testing && styles.buttonDisabled]} 
          onPress={handleGenerateTestToken}
          disabled={testing}
        >
          <Text style={styles.buttonText}>Generate Token</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, testing && styles.buttonDisabled]} 
          onPress={handleRegisterWithAPI}
          disabled={testing}
        >
          <Text style={styles.buttonText}>Register with API</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, testing && styles.buttonDisabled]} 
          onPress={handleTestAPIConnection}
          disabled={testing}
        >
          <Text style={styles.buttonText}>Test API Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, testing && styles.buttonDisabled]} 
          onPress={handleTestDeviceTokenEndpoint}
          disabled={testing}
        >
          <Text style={styles.buttonText}>Check My Device Tokens</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loading: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  tokenText: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 8,
    marginTop: 4,
  },
  error: {
    fontSize: 14,
    color: 'red',
  },
  actions: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
