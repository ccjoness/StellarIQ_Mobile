/**
 * Alert button component for adding/removing items from watchlist
 */

import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useTheme } from '@/hooks/useTheme';

interface AlertButtonProps {
  symbol: string;
  size?: number;
  color?: string;
  style?: any;
}

export function AlertButton({
  symbol,
  size = 24,
  style,
}: AlertButtonProps) {
  const { theme } = useTheme();
  const { hasAnyAlertsEnabled, isLoading } = useWatchlist();

  const alertsEnabled = hasAnyAlertsEnabled(symbol);

  if (isLoading) {
    return (
      <TouchableOpacity style={[styles.button, style]} disabled>
        <ActivityIndicator size="small" color='#3B82F6' />
      </TouchableOpacity>
    );
  }

  return (
      <Ionicons
        name={alertsEnabled ? 'notifications' : 'notifications-outline'}
        size={size}
        color={alertsEnabled ? theme.colors.primary : theme.colors.textSecondary}
      />
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
