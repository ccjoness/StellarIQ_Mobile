/**
 * Favorite button component for adding/removing items from watchlist
 */

import { TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWatchlist } from '../contexts/WatchlistContext';

interface FavoriteButtonProps {
  symbol: string;
  marketType: 'stock' | 'crypto';
  size?: number;
  color?: string;
  style?: any;
  onToggle?: (isFavorited: boolean) => void;
}

export function FavoriteButton({
  symbol,
  marketType,
  size = 24,
  color = '#3B82F6',
  style,
  onToggle,
}: FavoriteButtonProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isLoading } = useWatchlist();

  const isFavorited = isInWatchlist(symbol);

  const handleToggle = async () => {
    try {
      if (isFavorited) {
        await removeFromWatchlist(symbol);
        onToggle?.(false);
      } else {
        await addToWatchlist(symbol, marketType);
        onToggle?.(true);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update watchlist'
      );
    }
  };

  if (isLoading) {
    return (
      <TouchableOpacity style={[styles.button, style]} disabled>
        <ActivityIndicator size="small" color={color} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isFavorited ? 'heart' : 'heart-outline'}
        size={size}
        color={isFavorited ? '#EF4444' : color}
      />
    </TouchableOpacity>
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
