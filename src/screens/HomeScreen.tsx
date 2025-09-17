/**
 * Home screen
 */


import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ApiService } from '@/services/api';

export default function HomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [popularCryptos, setPopularCryptos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const apiService = new ApiService();

  useEffect(() => {
    loadPopularCryptos();
  }, []);

  const loadPopularCryptos = async () => {
    try {
      const data = await apiService.getCryptoPopular();
      setPopularCryptos(data.popular_cryptos.slice(0, 8)); // Show top 8
    } catch (error) {
      console.error('Error loading popular cryptos:', error);
      // Fallback to hardcoded list
      setPopularCryptos(['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOT', 'AVAX']);
    } finally {
      setLoading(false);
    }
  };

  const popularTickers = [
    { symbol: 'AAPL', name: 'Apple Inc.', market_type: 'stock' as const },
    { symbol: 'TSLA', name: 'Tesla Inc.', market_type: 'stock' as const },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', market_type: 'stock' as const },
    { symbol: 'MSFT', name: 'Microsoft Corp.', market_type: 'stock' as const },
  ];

  const handleTickerPress = (symbol: string, market_type: 'crypto' | 'stock') => {
    (navigation as any).navigate('TickerDetail', { symbol, market_type });
  };

  const handleCryptoPress = (symbol: string) => {
    handleTickerPress(symbol, 'crypto');
  };

  const handleNavigateToScreen = (screenName: string) => {
    (navigation as any).navigate(screenName);
  };

  const handleNavigateToDebug = () => {
    (navigation as any).navigate('Debug');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome to StellarIQ
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Your intelligent trading companion
        </Text>
      </View>

      {/* Crypto Quick Actions */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Crypto Hub
        </Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleNavigateToScreen('CryptoPortfolio')}
          >
            <Ionicons name="wallet" size={24} color="white" />
            <Text style={styles.quickActionText}>Portfolio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.secondary }]}
            onPress={() => handleNavigateToScreen('CryptoCategories')}
          >
            <Ionicons name="grid" size={24} color="white" />
            <Text style={styles.quickActionText}>Categories</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.colors.warning }]}
            onPress={() => handleNavigateToScreen('CryptoTrending')}
          >
            <Ionicons name="trending-up" size={24} color="white" />
            <Text style={styles.quickActionText}>Trending</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Popular Cryptocurrencies */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Popular Cryptocurrencies
        </Text>
        {loading ? (
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading...
          </Text>
        ) : (
          <View style={styles.cryptoGrid}>
            {popularCryptos.map((symbol) => (
              <TouchableOpacity
                key={symbol}
                style={[styles.cryptoChip, { backgroundColor: theme.colors.background }]}
                onPress={() => handleCryptoPress(symbol)}
              >
                <Text style={[styles.cryptoSymbol, { color: theme.colors.text }]}>{symbol}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Popular Stocks */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Popular Stocks
        </Text>
        {popularTickers.map((ticker) => (
          <TouchableOpacity
            key={`${ticker.symbol}-${ticker.market_type}`}
            style={styles.tickerItem}
            onPress={() => handleTickerPress(ticker.symbol, ticker.market_type)}
          >
            <View style={styles.tickerInfo}>
              <Text style={[styles.tickerSymbol, { color: theme.colors.text }]}>
                {ticker.symbol}
              </Text>
              <Text style={[styles.tickerName, { color: theme.colors.textSecondary }]}>
                {ticker.name}
              </Text>
            </View>
            <View style={styles.tickerActions}>
              <FavoriteButton
                symbol={ticker.symbol}
                marketType={ticker.market_type}
                size={20}
                style={styles.favoriteButton}
              />
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Debug Section - Only show in development */}
      {__DEV__ && (
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Development Tools
          </Text>
          <TouchableOpacity
            style={[styles.debugButton, { backgroundColor: theme.colors.error }]}
            onPress={handleNavigateToDebug}
          >
            <Ionicons name="bug" size={24} color="white" />
            <Text style={styles.debugButtonText}>API Debug Console</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tickerInfo: {
    flex: 1,
  },
  tickerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  tickerSymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  tickerName: {
    fontSize: 14,
    marginTop: 2,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  cryptoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cryptoChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cryptoSymbol: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
