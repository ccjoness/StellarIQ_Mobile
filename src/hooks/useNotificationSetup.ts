/**
 * Hook for managing notification setup state
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotifications } from '@/providers/NotificationProvider';

const NOTIFICATION_SETUP_DISMISSED_KEY = 'stellariq_notification_setup_dismissed';

export function useNotificationSetup() {
  const [showSetupCard, setShowSetupCard] = useState(false);
  const { isPermissionGranted } = useNotifications();

  useEffect(() => {
    checkShouldShowSetupCard();
  }, [isPermissionGranted]);

  const checkShouldShowSetupCard = async () => {
    try {
      // Don't show if permissions are already granted
      if (isPermissionGranted) {
        setShowSetupCard(false);
        return;
      }

      // Check if user has dismissed the card before
      const dismissed = await AsyncStorage.getItem(NOTIFICATION_SETUP_DISMISSED_KEY);
      
      // Show the card if permissions aren't granted and user hasn't dismissed it
      setShowSetupCard(!dismissed);
    } catch (error) {
      console.error('Error checking notification setup state:', error);
      // Default to showing the card if we can't check storage
      setShowSetupCard(!isPermissionGranted);
    }
  };

  const dismissSetupCard = async () => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETUP_DISMISSED_KEY, 'true');
      setShowSetupCard(false);
    } catch (error) {
      console.error('Error saving notification setup dismissal:', error);
      // Still hide the card even if we can't save to storage
      setShowSetupCard(false);
    }
  };

  const resetSetupCard = async () => {
    try {
      await AsyncStorage.removeItem(NOTIFICATION_SETUP_DISMISSED_KEY);
      await checkShouldShowSetupCard();
    } catch (error) {
      console.error('Error resetting notification setup state:', error);
    }
  };

  return {
    showSetupCard,
    dismissSetupCard,
    resetSetupCard,
  };
}
