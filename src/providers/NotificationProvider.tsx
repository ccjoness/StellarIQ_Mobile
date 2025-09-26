/**
 * Notification provider for managing push notifications
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NOTIFICATION_CONFIG, STORAGE_KEYS } from '@/constants/config';
import { NotificationData } from '@/types';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationContextType {
  expoPushToken: string | null;
  isPermissionGranted: boolean;
  isRegistered: boolean;
  requestPermission: () => Promise<boolean>;
  sendLocalNotification: (data: NotificationData) => Promise<void>;
  registerWithAPI: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('🔧 NotificationProvider: Initializing...');
    initializeNotifications();
  }, []);

  useEffect(() => {
    console.log('🔧 NotificationProvider: Auth/Token state changed:', {
      isAuthenticated,
      hasToken: !!expoPushToken,
      isRegistered,
      tokenPreview: expoPushToken ? `${expoPushToken.substring(0, 30)}...` : null
    });

    // Register with API when user is authenticated and we have a token
    if (isAuthenticated && expoPushToken && !isRegistered) {
      console.log('🚀 NotificationProvider: Attempting to register with API...');
      registerWithAPI();
    }
  }, [isAuthenticated, expoPushToken, isRegistered]);

  const initializeNotifications = async () => {
    try {
      console.log('🔧 NotificationProvider: Starting initialization...');
      console.log('🔧 Device info:', {
        isDevice: Device.isDevice,
        platform: Platform.OS,
        deviceName: Device.deviceName,
        modelName: Device.modelName
      });

      // Check if we're on a physical device
      if (!Device.isDevice) {
        console.warn('⚠️ Push notifications only work on physical devices');
        return;
      }

      // Check existing permissions
      console.log('🔧 Checking existing permissions...');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('🔧 Permission status:', existingStatus);

      if (existingStatus === 'granted') {
        console.log('✅ Permissions already granted, setting up push token...');
        setIsPermissionGranted(true);
        await setupPushToken();
      } else {
        console.log('⚠️ Permissions not granted, requesting permissions...');
        // Automatically request permissions
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        console.log('🔧 New permission status:', newStatus);
        const granted = newStatus === 'granted';
        setIsPermissionGranted(granted);

        if (granted) {
          console.log('✅ Permissions granted! Setting up push token...');
          await setupPushToken();
        } else {
          console.log('❌ Permissions denied by user');
        }
      }

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        console.log('🔧 Setting up Android notification channel...');
        await Notifications.setNotificationChannelAsync(NOTIFICATION_CONFIG.CHANNEL_ID, {
          name: NOTIFICATION_CONFIG.CHANNEL_NAME,
          description: NOTIFICATION_CONFIG.CHANNEL_DESCRIPTION,
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366f1',
        });
        console.log('✅ Android notification channel configured');
      }

      console.log('✅ NotificationProvider initialization complete');
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return false;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      
      setIsPermissionGranted(granted);

      if (granted) {
        await setupPushToken();
      }

      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  };

  const setupPushToken = async () => {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
      
      // Store token for later use
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_TOKEN, token);
      
      console.log('Expo push token:', token);
    } catch (error) {
      console.error('Failed to get push token:', error);
    }
  };

  const sendLocalNotification = async (data: NotificationData) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data,
          sound: NOTIFICATION_CONFIG.SOUND,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  };

  const registerWithAPI = async (): Promise<boolean> => {
    try {
      if (!expoPushToken || !isAuthenticated) {
        console.warn('Cannot register: missing token or not authenticated');
        return false;
      }

      const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
      const deviceName = `${Platform.OS} Device`;

      await apiService.registerDeviceToken({
        token: expoPushToken,
        device_type: deviceType,
        device_name: deviceName,
      });

      setIsRegistered(true);
      console.log('Device token registered with API successfully');
      return true;

    } catch (error) {
      console.error('Failed to register device token with API:', error);
      return false;
    }
  };

  const value: NotificationContextType = {
    expoPushToken,
    isPermissionGranted,
    isRegistered,
    requestPermission,
    sendLocalNotification,
    registerWithAPI,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
}
