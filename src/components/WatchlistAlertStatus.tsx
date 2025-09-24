/**
 * Simple component to demonstrate the new alert status context functionality
 */

import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useWatchlist } from '@/contexts/WatchlistContext';

interface WatchlistAlertStatusProps {
  symbol: string;
}

export function WatchlistAlertStatus({ symbol }: WatchlistAlertStatusProps) {
  const { theme } = useTheme();
  const { 
    hasAnyAlertsEnabled, 
    hasMarketAlertsEnabled, 
    hasPriceAlertsEnabled, 
    getAlertSummary 
  } = useWatchlist();

  const hasAlerts = hasAnyAlertsEnabled(symbol);
  const hasMarketAlerts = hasMarketAlertsEnabled(symbol);
  const hasPriceAlerts = hasPriceAlertsEnabled(symbol);
  const alertSummary = getAlertSummary(symbol);

  if (!hasAlerts) {
    return (
      <View style={styles.container}>
        <Ionicons
          name="notifications-off"
          size={20}
          color={theme.colors.textSecondary}
        />
        <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
          No alerts
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons
        name="notifications"
        size={20}
        color={theme.colors.primary}
      />
      <View style={styles.alertInfo}>
        <Text style={[styles.statusText, { color: theme.colors.primary }]}>
          Alerts Active
        </Text>
        
        {hasMarketAlerts && alertSummary && (
          <Text style={[styles.detailText, { color: theme.colors.text }]}>
            Market: {alertSummary.marketAlertTypes.join(', ')}
          </Text>
        )}
        
        {hasPriceAlerts && alertSummary && (
          <Text style={[styles.detailText, { color: theme.colors.text }]}>
            Price: {alertSummary.priceAlertTypes.join(', ')}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 12,
    marginTop: 2,
  },
});
