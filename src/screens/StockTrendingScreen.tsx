import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,

  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ApiService } from '@/services/api';
import { FavoriteButton } from '@/components/FavoriteButton';

interface TrendingStock {
  ticker: string;
  name?: string;
  price: number;
  change_amount: number;
  change_percentage: number;
  volume_humanized: string;
  volume: number;
}

interface StockTrendingResponse {
  trending: TrendingStock[];
  gainers: TrendingStock[];
  losers: TrendingStock[];
}

export default function StockTrendingScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [trendingData, setTrendingData] = useState<StockTrendingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const apiService = new ApiService();

  useEffect(() => {
    loadTrendingData();
  }, []);

  const loadTrendingData = async () => {
    try {
      // Use the dedicated stock trending endpoint
      const data = await apiService.getStockTrending();
      setTrendingData(data);
    } catch (error) {
      console.error('Error loading trending data:', error);
      // Fallback to popular stocks
      // const fallbackStocks: TrendingStock[] = [
      //   { symbol: 'AAPL', name: 'Apple Inc.', current_price: 150.00, change_percent_24h: 2.5, volume_24h: 50000000, market_cap: 2500000000000 },
      //   { symbol: 'TSLA', name: 'Tesla Inc.', current_price: 200.00, change_percent_24h: -1.2, volume_24h: 30000000, market_cap: 800000000000 },
      //   { symbol: 'GOOGL', name: 'Alphabet Inc.', current_price: 120.00, change_percent_24h: 1.8, volume_24h: 25000000, market_cap: 1500000000000 },
      //   { symbol: 'MSFT', name: 'Microsoft Corp.', current_price: 300.00, change_percent_24h: 0.5, volume_24h: 20000000, market_cap: 2200000000000 },
      //   { symbol: 'AMZN', name: 'Amazon.com Inc.', current_price: 130.00, change_percent_24h: -0.8, volume_24h: 35000000, market_cap: 1300000000000 },
      // ];
      
      // setTrendingData({
      //   trending: fallbackStocks,
      //   gainers: fallbackStocks.filter(s => (s.change_percent_24h || 0) > 0),
      //   losers: fallbackStocks.filter(s => (s.change_percent_24h || 0) < 0),
      // });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrendingData();
    setRefreshing(false);
  };

  const handleStockPress = (symbol: string) => {
    (navigation as any).navigate('TickerDetail', { 
      symbol, 
      market_type: 'stock' 
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const renderStockItem = (item: TrendingStock, index: number) => (
    <TouchableOpacity
      key={`${item.ticker}-${index}`}
      style={[styles.stockItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleStockPress(item.ticker)}
    >
      <View style={styles.stockHeader}>
        <View style={styles.stockInfo}>
          <Text style={[styles.stockSymbol, { color: theme.colors.text }]}>{item.ticker}</Text>
          <Text style={[styles.stockName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <View style={styles.stockPrice}>
          <Text style={[styles.priceText, { color: theme.colors.text }]}>
            {formatCurrency(item.price)}
          </Text>
          {item.change_percentage !== undefined && (
            <Text style={[
              styles.changeText,
              { color: item.change_percentage >= 0 ? theme.colors.success : theme.colors.error }
            ]}>
              {formatPercentage(item.change_percentage)}
            </Text>
          )}
        </View>
        <View style={styles.stockActions}>
          <FavoriteButton
            symbol={item.ticker}
            marketType="stock"
            size={20}
            style={styles.favoriteButton}
          />
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        </View>
      </View>
      
      <View style={styles.stockDetails}>
        {item.volume_humanized && (
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            Volume: {item.volume_humanized}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, data: TrendingStock[], emptyMessage: string) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {data.length > 0 ? (
        data.map((item, index) => renderStockItem(item, index))
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Trending Stocks</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Discover what's hot in the stock market
          </Text>
        </View>

        {trendingData && (
          <>
            {renderSection('🔥 High Volume', trendingData.trending, 'No trending data available')}
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
  stockItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockInfo: {
    flex: 1,
  },
  stockActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockName: {
    fontSize: 14,
    marginTop: 2,
  },
  exchangeText: {
    fontSize: 12,
    marginTop: 1,
  },
  stockPrice: {
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
  stockDetails: {
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
