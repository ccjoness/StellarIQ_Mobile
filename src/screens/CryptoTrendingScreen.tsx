import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { ApiService } from '@/services/api';
import { CryptoTrendingResponse, CryptoOverview } from '@/types';

export default function CryptoTrendingScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [trendingData, setTrendingData] = useState<CryptoTrendingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const apiService = new ApiService();

  useEffect(() => {
    loadTrendingData();
  }, []);

  const loadTrendingData = async () => {
    try {
      const data = await apiService.getCryptoTrending();
      setTrendingData(data);
    } catch (error) {
      console.error('Error loading trending data:', error);
      Alert.alert('Error', 'Failed to load trending cryptocurrencies');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrendingData();
    setRefreshing(false);
  };

  const handleCryptoPress = (symbol: string) => {
    (navigation as any).navigate('TickerDetail', { 
      symbol, 
      market_type: 'crypto' 
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const renderCryptoItem = (item: CryptoOverview, index: number) => (
    <TouchableOpacity
      key={`${item.symbol}-${index}`}
      style={[styles.cryptoItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleCryptoPress(item.symbol)}
    >
      <View style={styles.cryptoHeader}>
        <View style={styles.cryptoInfo}>
          <Text style={[styles.cryptoSymbol, { color: theme.colors.text }]}>{item.symbol}</Text>
          <Text style={[styles.cryptoName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <View style={styles.cryptoPrice}>
          <Text style={[styles.priceText, { color: theme.colors.text }]}>
            {formatCurrency(item.current_price)}
          </Text>
          {item.change_percent_24h !== undefined && (
            <Text style={[
              styles.changeText,
              { color: item.change_percent_24h >= 0 ? theme.colors.success : theme.colors.error }
            ]}>
              {formatPercentage(item.change_percent_24h)}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.cryptoDetails}>
        {item.volume_24h && (
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            Volume: {formatCurrency(item.volume_24h)}
          </Text>
        )}
        {item.market_cap && (
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            Market Cap: {formatCurrency(item.market_cap)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, data: CryptoOverview[], emptyMessage: string) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {data.length > 0 ? (
        data.map((item, index) => renderCryptoItem(item, index))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
            {emptyMessage}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading trending data...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Trending Crypto</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Discover what's hot in the crypto market
          </Text>
        </View>

        {trendingData && (
          <>
            {renderSection('🔥 Trending', trendingData.trending, 'No trending data available')}
            {renderSection('📈 Top Gainers', trendingData.gainers, 'No gainers data available')}
            {renderSection('📉 Top Losers', trendingData.losers, 'No losers data available')}
          </>
        )}
      </ScrollView>
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
  loadingText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cryptoItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  cryptoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cryptoName: {
    fontSize: 14,
    marginTop: 2,
  },
  cryptoPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  cryptoDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
