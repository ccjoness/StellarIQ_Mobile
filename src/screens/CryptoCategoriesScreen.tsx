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

interface CryptoCategories {
  major: string[];
  defi: string[];
  gaming: string[];
  layer1: string[];
  meme: string[];
  privacy: string[];
}

export default function CryptoCategoriesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [categories, setCategories] = useState<CryptoCategories | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const apiService = new ApiService();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCryptoCategories();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load crypto categories');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const handleCryptoPress = (symbol: string) => {
    (navigation as any).navigate('TickerDetail', { 
      symbol, 
      market_type: 'crypto' 
    });
  };

  const getCategoryColor = (categoryName: string) => {
    const colors = {
      major: '#FFD700',
      defi: '#00D4AA',
      gaming: '#FF6B6B',
      layer1: '#4ECDC4',
      meme: '#FFA726',
      privacy: '#9C27B0',
    };
    return colors[categoryName as keyof typeof colors] || theme.colors.primary;
  };

  const getCategoryDescription = (categoryName: string) => {
    const descriptions = {
      major: 'Top market cap cryptocurrencies',
      defi: 'Decentralized Finance tokens',
      gaming: 'Gaming and metaverse tokens',
      layer1: 'Layer 1 blockchain protocols',
      meme: 'Meme and community tokens',
      privacy: 'Privacy-focused cryptocurrencies',
    };
    return descriptions[categoryName as keyof typeof descriptions] || '';
  };

  const renderCategory = (categoryName: string, symbols: string[]) => (
    <View key={categoryName} style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(categoryName) }]}>
          <Text style={styles.categoryIconText}>{categoryName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
            {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
          </Text>
          <Text style={[styles.categoryDescription, { color: theme.colors.textSecondary }]}>
            {getCategoryDescription(categoryName)}
          </Text>
        </View>
        <Text style={[styles.categoryCount, { color: theme.colors.textSecondary }]}>
          {symbols.length}
        </Text>
      </View>
      
      <View style={styles.symbolsContainer}>
        {symbols.map((symbol) => (
          <TouchableOpacity
            key={symbol}
            style={[styles.symbolChip, { backgroundColor: theme.colors.background }]}
            onPress={() => handleCryptoPress(symbol)}
          >
            <Text style={[styles.symbolText, { color: theme.colors.text }]}>{symbol}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading categories...</Text>
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Crypto Categories</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Explore cryptocurrencies by category
          </Text>
        </View>

        {categories && Object.entries(categories).map(([categoryName, symbols]) =>
          renderCategory(categoryName, symbols)
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
  categoryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 14,
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  symbolsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symbolChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  symbolText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
