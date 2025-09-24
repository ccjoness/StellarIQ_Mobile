/**
 * Alert Status Indicator Component
 * Shows alert status for watchlist items with detailed information
 */

import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useWatchlist } from '@/contexts/WatchlistContext';

interface AlertStatusIndicatorProps {
  symbol: string;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function AlertStatusIndicator({ 
  symbol, 
  showDetails = false, 
  size = 'medium' 
}: AlertStatusIndicatorProps) {
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
      <View style={[styles.container, styles[size]]}>
        <Ionicons
          name="notifications-off"
          size={getIconSize(size)}
          color={theme.colors.textSecondary}
        />
        {showDetails && (
          <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
            No alerts
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, styles[size]]}>
      <Ionicons
        name="notifications"
        size={getIconSize(size)}
        color={theme.colors.primary}
      />
      {showDetails && alertSummary && (
        <View style={styles.detailsContainer}>
          <Text style={[styles.alertsOnText, { color: theme.colors.primary }]}>
            Alerts On
          </Text>
          
          {hasMarketAlerts && (
            <View style={styles.alertTypeContainer}>
              <Text style={[styles.alertTypeLabel, { color: theme.colors.textSecondary }]}>
                Market:
              </Text>
              <Text style={[styles.alertTypeValue, { color: theme.colors.text }]}>
                {alertSummary.marketAlertTypes.join(', ')}
              </Text>
            </View>
          )}
          
          {hasPriceAlerts && (
            <View style={styles.alertTypeContainer}>
              <Text style={[styles.alertTypeLabel, { color: theme.colors.textSecondary }]}>
                Price:
              </Text>
              <Text style={[styles.alertTypeValue, { color: theme.colors.text }]}>
                {alertSummary.priceAlertTypes.join(', ')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function getIconSize(size: 'small' | 'medium' | 'large'): number {
  switch (size) {
    case 'small':
      return 16;
    case 'medium':
      return 20;
    case 'large':
      return 24;
    default:
      return 20;
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  small: {
    gap: 4,
  },
  medium: {
    gap: 6,
  },
  large: {
    gap: 8,
  },
  text: {
    fontSize: 12,
  },
  detailsContainer: {
    marginLeft: 4,
  },
  alertsOnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  alertTypeLabel: {
    fontSize: 10,
    marginRight: 4,
  },
  alertTypeValue: {
    fontSize: 10,
    flex: 1,
  },
});
