/**
 * Home screen
 */


// import { useState, useEffect } from 'react';
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
import { useNotificationSetup } from '@/hooks/useNotificationSetup';
import { FavoriteButton } from '@/components/FavoriteButton';
import { NotificationSetupCard } from '@/components/NotificationSetupCard';
// import { ApiService } from '@/services/api';

export default function HomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { showSetupCard, dismissSetupCard } = useNotificationSetup();
  // const [loading, setLoading] = useState(true);
  //
  // const apiService = new ApiService();

  const popularCryptos = [
    { symbol: 'BTC', name: 'Bitcoin', market_type: 'crypto' as const },
    { symbol: 'ETH', name: 'Ethereum', market_type: 'crypto' as const },
    { symbol: 'BNB', name: 'Binance Coin', market_type: 'crypto' as const },
    { symbol: 'XRP', name: 'Ripple', market_type: 'crypto' as const },
  ];

  const popularTickers = [
    { symbol: 'AAPL', name: 'Apple Inc.', market_type: 'stock' as const },
    { symbol: 'TSLA', name: 'Tesla Inc.', market_type: 'stock' as const },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', market_type: 'stock' as const },
    { symbol: 'MSFT', name: 'Microsoft Corp.', market_type: 'stock' as const },
  ];

  const handleTickerPress = (symbol: string, market_type: 'crypto' | 'stock') => {
    (navigation as any).navigate('TickerDetail', { symbol, market_type });
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

        {/* Educational Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: theme.colors.warning + '20', borderColor: theme.colors.warning }]}>
          <Ionicons name="warning-outline" size={20} color={theme.colors.warning} />
          <View style={styles.disclaimerText}>
            <Text style={[styles.disclaimerTitle, { color: theme.colors.warning }]}>
              Educational Purpose Only
            </Text>
            <Text style={[styles.disclaimerBody, { color: theme.colors.text }]}>
              This app is for educational purposes only. Market data may be delayed or inaccurate.
              Do not make trading or investment decisions based on this information.
              Always consult with a qualified financial advisor.
            </Text>
          </View>
        </View>
      </View>

      {/* Notification Setup Card */}
      {showSetupCard && (
        <NotificationSetupCard
          onDismiss={dismissSetupCard}
        />
      )}

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
        <TouchableOpacity
          style={[styles.popularButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleNavigateToScreen('StockTrending')}
        >
          <Ionicons name="trending-up" size={24} color="white" />
          <Text style={styles.popularButtonText}>View Trending Stocks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.popularButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleNavigateToScreen('StockCategories')}
        >
          <Ionicons name="grid" size={24} color="white" />
          <Text style={styles.popularButtonText}>View Stock Categories</Text>
        </TouchableOpacity>
      </View>

      {/* Popular Cryptocurrencies */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Popular Cryptocurrencies
        </Text>
        {popularCryptos.map((crypto) => (
          <TouchableOpacity
            key={`${crypto.symbol}-${crypto.market_type}`}
            style={styles.tickerItem}
            onPress={() => handleTickerPress(crypto.symbol, crypto.market_type)}
          >
            <View style={styles.tickerInfo}>
              <Text style={[styles.tickerSymbol, { color: theme.colors.text }]}>
                {crypto.symbol}
              </Text>
              <Text style={[styles.tickerName, { color: theme.colors.textSecondary }]}>
                {crypto.name}
              </Text>
            </View>
            <View style={styles.tickerActions}>
              <FavoriteButton
                symbol={crypto.symbol}
                marketType={crypto.market_type}
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
        <TouchableOpacity
          style={[styles.popularButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleNavigateToScreen('CryptoTrending')}
        >
          <Ionicons name="trending-up" size={24} color="white" />
          <Text style={styles.popularButtonText}>View Trending Crypto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.popularButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleNavigateToScreen('CryptoCategories')}
        >
          <Ionicons name="grid" size={24} color="white" />
          <Text style={styles.popularButtonText}>View Crypto Categories</Text>
        </TouchableOpacity>
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
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  disclaimerText: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  disclaimerBody: {
    fontSize: 12,
    lineHeight: 16,
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
  popularButton:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  popularButtonText:{
   color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
