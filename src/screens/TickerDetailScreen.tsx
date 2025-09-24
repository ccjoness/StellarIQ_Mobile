/**
 * Ticker detail screen with charts and signals
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
// import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { apiService } from '@/services/api';
import { RootStackParamList, WatchlistItem } from '@/types';
import { FavoriteButton } from '@/components/FavoriteButton';
import { AlertButton } from '@/components/AlertButton';
import { TechnicalIndicatorCharts } from '@/components/TechnicalIndicatorCharts';
import { CandlestickChart } from '@/components/CandlestickChart';
import { NotificationSettings } from '@/components/NotificationSettings';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

type TickerDetailRouteProp = RouteProp<RootStackParamList, 'TickerDetail'>;

export default function TickerDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute<TickerDetailRouteProp>();
  const { symbol, market_type } = route.params;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const { items: watchlistItems, isInWatchlist, updateWatchlistItem } = useWatchlist();

  const {
    data: tickerDetail,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tickerDetail', symbol, market_type],
    queryFn: () => apiService.getTickerDetail(symbol, market_type),
    staleTime: 60 * 1000, // 1 minute
  });

  // Check if this ticker is in the watchlist
  const isWatched = isInWatchlist(symbol);
  const watchlistItem = watchlistItems.find((item) => item.symbol === symbol);

  const handleNotificationSettings = () => {
    setShowNotificationSettings(true);
  };

  const handleNotificationUpdate = (updatedItem: WatchlistItem) => {
    updateWatchlistItem(updatedItem);
    setShowNotificationSettings(false);
  };

  const handleCloseNotificationSettings = () => {
    setShowNotificationSettings(false);
  };

  const renderPriceCard = () => {
    if (!tickerDetail) return null;
    const { ticker } = tickerDetail;
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.priceHeader}>
          <View style={styles.tickerInfo}>
            <Text style={[styles.tickerSymbol, { color: theme.colors.text }]}>{ticker.symbol}</Text>
            <Text style={[styles.tickerName, { color: theme.colors.textSecondary }]}>
              {ticker.name}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <FavoriteButton
              symbol={ticker.symbol}
              marketType={ticker.market_type}
              size={28}
              style={styles.favoriteButton}
            />
            {isWatched && (
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={handleNotificationSettings}
              >
                <AlertButton
                  symbol={ticker.symbol}
                  size={28}
                />
              </TouchableOpacity>
            )}
            <View
              style={[
                styles.marketTypeBadge,
                {
                  backgroundColor:
                    ticker.market_type === 'crypto' ? theme.colors.primary : theme.colors.secondary,
                },
              ]}
            >
              <Text style={styles.marketTypeText}>{ticker.market_type.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <View>
          <Text
            style={[styles.description, { color: theme.colors.textSecondary }]}
            numberOfLines={isDescriptionExpanded ? undefined : 4}
          >
            {ticker.description}
          </Text>
          {ticker.description && ticker.description.length > 200 && (
            <TouchableOpacity
              style={styles.readMoreButton}
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <Text
                style={{
                  color:
                    ticker.market_type === 'crypto' ? theme.colors.primary : theme.colors.secondary,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                {isDescriptionExpanded ? 'Read Less' : 'Read More'}{' '}
                <FontAwesomeIcon
                  icon={isDescriptionExpanded ? faChevronUp : faChevronDown}
                  color={
                    ticker.market_type === 'crypto' ? theme.colors.primary : theme.colors.secondary
                  }
                  size={10}
                />
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Candlestick Chart */}
        <View style={styles.chartContainer}>
          <CandlestickChart symbol={ticker.symbol} marketType={ticker.market_type} />
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View
        style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Failed to load ticker details
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {renderPriceCard()}
        <TechnicalIndicatorCharts symbol={symbol} marketType={market_type} />
      </ScrollView>

      {/* Notification Settings Modal */}
      <Modal
        visible={showNotificationSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseNotificationSettings}
      >
        <View style={styles.modalOverlay}>
          {watchlistItem && (
            <NotificationSettings
              item={watchlistItem}
              onUpdate={handleNotificationUpdate}
              onClose={handleCloseNotificationSettings}
            />
          )}
        </View>
      </Modal>
    </>
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
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tickerInfo: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
  },
  notificationButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tickerSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tickerName: {
    fontSize: 16,
    marginTop: 4,
  },
  marketTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  marketTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 16,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChange: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stat: {
    width: '48%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  signalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  signalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 12,
  },
  signalText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  confidence: {
    fontSize: 14,
    fontWeight: '500',
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  indicator: {
    width: '48%',
    marginBottom: 12,
  },
  indicatorLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  indicatorValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 16,
    marginHorizontal: -16, // Extend to card edges
    marginBottom: -16, // Extend to card bottom
  },
});
