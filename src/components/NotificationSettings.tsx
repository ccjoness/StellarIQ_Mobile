/**
 * Notification settings component for watchlist items
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { WatchlistItem, NotificationPreferences } from '@/types';
import { apiService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';

interface NotificationSettingsProps {
  item: WatchlistItem;
  onUpdate: (updatedItem: WatchlistItem) => void;
  onClose: () => void;
}

export function NotificationSettings({ item, onUpdate, onClose }: NotificationSettingsProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    alert_enabled: item.alert_enabled || false,
    alert_on_overbought: item.alert_on_overbought || true,
    alert_on_oversold: item.alert_on_oversold || true,
    alert_on_neutral: item.alert_on_neutral || false,
  });

  const handleSave = async () => {
    try {
      setLoading(true);

      const updatedItem = await apiService.updateNotificationPreferences(
        item.id,
        preferences
      );

      onUpdate(updatedItem);
      onClose();

      Alert.alert(
        'Success',
        'Notification preferences updated successfully',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      Alert.alert(
        'Error',
        'Failed to update notification preferences. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTestAlert = async () => {
    try {
      setLoading(true);
      
      const result = await apiService.testMarketAlert(item.symbol);
      
      Alert.alert(
        'Test Alert',
        result.message,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Failed to test alert:', error);
      Alert.alert(
        'Error',
        'Failed to send test alert. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 20,
      margin: 20,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    symbolText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 20,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    settingDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    primaryButtonText: {
      color: colors.background,
    },
    secondaryButtonText: {
      color: colors.text,
    },
    disabledRow: {
      opacity: 0.5,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.symbolText}>Configure alerts for {item.symbol}</Text>

      <View style={styles.settingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>Enable Alerts</Text>
          <Text style={styles.settingDescription}>
            Turn on/off all notifications for this symbol
          </Text>
        </View>
        <Switch
          value={preferences.alert_enabled}
          onValueChange={(value) => updatePreference('alert_enabled', value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.background}
        />
      </View>

      <View style={[styles.settingRow, !preferences.alert_enabled && styles.disabledRow]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>Overbought Alerts</Text>
          <Text style={styles.settingDescription}>
            Alert when the stock shows overbought signals
          </Text>
        </View>
        <Switch
          value={preferences.alert_on_overbought}
          onValueChange={(value) => updatePreference('alert_on_overbought', value)}
          disabled={!preferences.alert_enabled}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.background}
        />
      </View>

      <View style={[styles.settingRow, !preferences.alert_enabled && styles.disabledRow]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>Oversold Alerts</Text>
          <Text style={styles.settingDescription}>
            Alert when the stock shows oversold signals
          </Text>
        </View>
        <Switch
          value={preferences.alert_on_oversold}
          onValueChange={(value) => updatePreference('alert_on_oversold', value)}
          disabled={!preferences.alert_enabled}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.background}
        />
      </View>

      <View style={[styles.settingRow, !preferences.alert_enabled && styles.disabledRow]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>Neutral Alerts</Text>
          <Text style={styles.settingDescription}>
            Alert when the stock returns to neutral conditions
          </Text>
        </View>
        <Switch
          value={preferences.alert_on_neutral}
          onValueChange={(value) => updatePreference('alert_on_neutral', value)}
          disabled={!preferences.alert_enabled}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.background}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleTestAlert}
          disabled={loading || !preferences.alert_enabled}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Test Alert
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Save Settings
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
