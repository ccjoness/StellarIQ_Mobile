/**
 * Notification settings component for watchlist items
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
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
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    // Market condition alerts
    alert_enabled: item.alert_enabled || false,
    alert_on_overbought: item.alert_on_overbought || true,
    alert_on_oversold: item.alert_on_oversold || true,
    alert_on_neutral: item.alert_on_neutral || false,
    // Price alerts
    price_alert_enabled: item.price_alert_enabled || false,
    alert_price_above: item.alert_price_above,
    alert_price_below: item.alert_price_below,
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

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | number | undefined) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updatePriceThreshold = (key: 'alert_price_above' | 'alert_price_below', value: string) => {
    const numericValue = value === '' ? undefined : parseFloat(value);
    if (value === '' || (!isNaN(numericValue!) && numericValue! > 0)) {
      updatePreference(key, numericValue);
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 20,
      margin: 20,
      maxHeight: '100%',
      minWidth: "95%",
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
      color: theme.colors.text,
    },
    closeButton: {
      padding: 4,
    },
    symbolText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 20,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingLabel: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
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
      backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    primaryButtonText: {
      color: theme.colors.background,
    },
    secondaryButtonText: {
      color: theme.colors.text,
    },
    disabledRow: {
      opacity: 0.5,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: 20,
      marginBottom: 10,
    },
    priceInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    priceInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      minWidth: 100,
      textAlign: 'right',
    },
    currencySymbol: {
      fontSize: 16,
      color: theme.colors.text,
      marginRight: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <Text style={styles.symbolText}>Configure alerts for {item.symbol}</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Market Condition Alerts Section */}
        <Text style={styles.sectionTitle}>Market Condition Alerts</Text>

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
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.background}
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
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.background}
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
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={theme.colors.background}
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
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
          />
        </View>

        {/* Price Alerts Section */}
        <Text style={styles.sectionTitle}>Price Alerts</Text>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Enable Price Alerts</Text>
            <Text style={styles.settingDescription}>
              Get notified when price reaches your target levels
            </Text>
          </View>
          <Switch
            value={preferences.price_alert_enabled}
            onValueChange={(value) => updatePreference('price_alert_enabled', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
          />
        </View>

        <View style={[styles.settingRow, !preferences.price_alert_enabled && styles.disabledRow]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Alert When Price Goes Above</Text>
            <Text style={styles.settingDescription}>
              Set a price threshold for upward alerts
            </Text>
          </View>
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.priceInput}
              value={preferences.alert_price_above?.toString() || ''}
              onChangeText={(value) => updatePriceThreshold('alert_price_above', value)}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="decimal-pad"
              editable={preferences.price_alert_enabled}
            />
          </View>
        </View>

        <View style={[styles.settingRow, !preferences.price_alert_enabled && styles.disabledRow]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Alert When Price Goes Below</Text>
            <Text style={styles.settingDescription}>
              Set a price threshold for downward alerts
            </Text>
          </View>
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.priceInput}
              value={preferences.alert_price_below?.toString() || ''}
              onChangeText={(value) => updatePriceThreshold('alert_price_below', value)}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="decimal-pad"
              editable={preferences.price_alert_enabled}
            />
          </View>
        </View>

        {item.current_price && (
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Current Price</Text>
              <Text style={styles.settingDescription}>
                ${item.current_price.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleTestAlert}
          disabled={loading || !preferences.alert_enabled}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.text} />
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
            <ActivityIndicator size="small" color={theme.colors.background} />
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
