/**
 * Notification setup card component
 * Shows when notifications aren't set up and prompts user to enable them
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useNotifications } from '@/providers/NotificationProvider';

interface NotificationSetupCardProps {
  onDismiss?: () => void;
}

export function NotificationSetupCard({ onDismiss }: NotificationSetupCardProps) {
  const { theme } = useTheme();
  const { isPermissionGranted, requestPermission } = useNotifications();

  // Don't show if permissions are already granted
  if (isPermissionGranted) {
    return null;
  }

  const handleEnableNotifications = async () => {
    try {
      const granted = await requestPermission();
      
      if (granted) {
        Alert.alert(
          'Notifications Enabled! 🎉',
          'You\'ll now receive market alerts and trading signals. Device tokens are being registered automatically.',
          [{ text: 'Great!', onPress: onDismiss }]
        );
      } else {
        Alert.alert(
          'Notifications Disabled',
          'You can enable notifications later in your device settings or from the Profile tab.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to set up notifications. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="notifications-outline" size={32} color={theme.colors.primary} />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Enable Notifications
        </Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Get real-time market alerts and trading signals delivered directly to your device.
        </Text>
        
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="trending-up" size={16} color={theme.colors.success} />
            <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
              Market condition alerts
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="alarm" size={16} color={theme.colors.warning} />
            <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
              Price alerts
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="flash" size={16} color={theme.colors.primary} />
            <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
              Trading signals
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.enableButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleEnableNotifications}
        >
          <Text style={styles.enableButtonText}>Enable Notifications</Text>
        </TouchableOpacity>
        
        {onDismiss && (
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={onDismiss}
          >
            <Text style={[styles.dismissButtonText, { color: theme.colors.textSecondary }]}>
              Maybe Later
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  content: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  features: {
    gap: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  actions: {
    gap: 12,
  },
  enableButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
