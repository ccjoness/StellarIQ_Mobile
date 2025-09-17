/**
 * Hook for managing device ID (MVP auth solution)
 */

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { STORAGE_KEYS } from '@/constants/config';

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDeviceId();
  }, []);

  const initializeDeviceId = async () => {
    try {
      // Try to get existing device ID from storage
      let storedDeviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      
      if (!storedDeviceId) {
        // Generate new device ID
        storedDeviceId = generateDeviceId();
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, storedDeviceId);
      }
      
      setDeviceId(storedDeviceId);
    } catch (error) {
      console.error('Failed to initialize device ID:', error);
      // Fallback to a basic device ID
      const fallbackId = generateDeviceId();
      setDeviceId(fallbackId);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDeviceId = (): string => {
    // Create a unique device ID using device info and timestamp
    const timestamp = Date.now().toString();
    const deviceName = Device.deviceName || 'unknown';
    const random = Math.random().toString(36).substring(2, 15);
    
    return `${deviceName}-${timestamp}-${random}`.replace(/[^a-zA-Z0-9-]/g, '');
  };

  const resetDeviceId = async (): Promise<string> => {
    try {
      const newDeviceId = generateDeviceId();
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, newDeviceId);
      setDeviceId(newDeviceId);
      return newDeviceId;
    } catch (error) {
      console.error('Failed to reset device ID:', error);
      throw error;
    }
  };

  return {
    deviceId,
    isLoading,
    resetDeviceId,
  };
}
