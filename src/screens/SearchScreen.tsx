/**
 * Search screen for finding tickers
 */

import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { ApiService } from '@/services/api';
import { SearchResult, CryptoSearchResult } from '@/types';
import { FavoriteButton } from '@/components/FavoriteButton';
import { SEARCH_CONFIG } from '@/constants/config';

export default function SearchScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'crypto' | 'stocks'>('all');

  const apiService = new ApiService();

  // Debounce search query
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      setDebouncedQuery(text);
    }, SEARCH_CONFIG.DEBOUNCE_DELAY);
  }, []);

  // Stock search query
  const { data: stockResults, isLoading: isLoadingStocks, error: stockError } = useQuery({
    queryKey: ['search-stocks', debouncedQuery],
    queryFn: () => apiService.searchTickers(debouncedQuery, SEARCH_CONFIG.MAX_RESULTS),
    enabled: debouncedQuery.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH && (searchType === 'all' || searchType === 'stocks'),
  });

  // Crypto search query
  const { data: cryptoResults, isLoading: isLoadingCrypto, error: cryptoError } = useQuery({
    queryKey: ['search-crypto', debouncedQuery],
    queryFn: () => apiService.searchCrypto(debouncedQuery),
    enabled: debouncedQuery.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH && (searchType === 'all' || searchType === 'crypto'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combine search results
  const isLoading = isLoadingStocks || isLoadingCrypto;
  const error = stockError || cryptoError;
  const allResults: SearchResult[] = [
    ...(stockResults?.results || []),
    ...(cryptoResults?.results?.map((crypto: CryptoSearchResult) => ({
      symbol: crypto.symbol,
      name: crypto.name,
      market_type: 'crypto' as const,
      exchange: crypto.exchange,
    })) || [])
  ];

  const handleTickerPress = (result: SearchResult) => {
    (navigation as any).navigate('TickerDetail', {
      symbol: result.symbol,
      market_type: result.market_type,
    });
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.resultItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleTickerPress(item)}
    >
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
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
        {item.exchange && (
          <Text style={[styles.exchange, { color: theme.colors.textSecondary }]}>
            {item.exchange}
          </Text>
        )}
      </View>
      <View style={styles.resultActions}>
        <FavoriteButton
          symbol={item.symbol}
          marketType={item.market_type}
          size={20}
          style={styles.favoriteButton}
          onToggle={(_isFavorited) => {
            // Optional: Show a toast or feedback
          }}
        />
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (searchQuery.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons
            name="search-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Search Markets
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Find cryptocurrencies and stocks by symbol or name
          </Text>
        </View>
      );
    }

    if (debouncedQuery.length > 0 && allResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons
            name="search-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No Results Found
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Try searching with a different term
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons
          name="search"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search symbols or names..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setDebouncedQuery('');
            }}
            style={styles.clearButton}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Type Filter */}
      <View style={styles.filterContainer}>
        {(['all', 'crypto', 'stocks'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              {
                backgroundColor: searchType === type ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.primary,
              }
            ]}
            onPress={() => setSearchType(type)}
          >
            <Text style={[
              styles.filterButtonText,
              { color: searchType === type ? 'white' : theme.colors.text }
            ]}>
              {type === 'all' ? 'All' : type === 'crypto' ? 'Crypto' : 'Stocks'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Search failed. Please try again.
          </Text>
        </View>
      )}

      <FlatList
        data={allResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => `${item.symbol}-${item.market_type}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
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
    marginBottom: 2,
  },
  exchange: {
    fontSize: 12,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    padding: 4,
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
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
