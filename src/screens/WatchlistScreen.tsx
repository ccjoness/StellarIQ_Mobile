/**
 * Watchlist screen for managing tracked tickers
 */


import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { WatchlistItem } from '@/types';

export default function WatchlistScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { items: watchlistItems, isLoading, error, refreshWatchlist } = useWatchlist();

  const handleTickerPress = (item: WatchlistItem) => {
    (navigation as any).navigate('TickerDetail', {
      symbol: item.symbol,
      market_type: item.market_type,
    });
  };

  const renderWatchlistItem = ({ item }: { item: WatchlistItem }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleTickerPress(item)}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.symbol, { color: theme.colors.text }]}>
            {item.symbol}
          </Text>
          <View style={[
            styles.marketTypeBadge,
            { backgroundColor: item.market_type === 'crypto' ? theme.colors.primary : theme.colors.secondary }
          ]}>
            <Text style={styles.marketTypeText}>
              {item.market_type.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={[styles.name, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.alertsContainer}>
          <Ionicons
            name={item.alert_enabled || item.price_alert_enabled ? 'notifications' : 'notifications-off'}
            size={16}
            color={item.alert_enabled || item.price_alert_enabled ? theme.colors.primary : theme.colors.textSecondary}
          />
          <Text style={[
            styles.alertsText,
            { color: item.alert_enabled || item.price_alert_enabled ? theme.colors.primary : theme.colors.textSecondary }
          ]}>
            {item.alert_enabled || item.price_alert_enabled ? 'Alerts On' : 'Alerts Off'}
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="bookmark-outline"
        size={64}
        color={theme.colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        Your Watchlist is Empty
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Search for tickers and add them to your watchlist to track their performance
      </Text>
      <TouchableOpacity
        style={[styles.searchButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => (navigation as any).navigate('Search')}
      >
        <Text style={styles.searchButtonText}>Search Tickers</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Failed to load watchlist
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={watchlistItems}
        renderItem={renderWatchlistItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        onRefresh={refreshWatchlist}
        refreshing={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  marketTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  marketTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  name: {
    fontSize: 14,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
  },
  alertsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertsText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  searchButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
