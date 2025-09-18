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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ApiService } from '@/services/api';
import { FavoriteButton } from '@/components/FavoriteButton';

interface StockCategories {
  technology: string[];
  healthcare: string[];
  financial: string[];
  energy: string[];
  consumer: string[];
  industrial: string[];
  utilities: string[];
  materials: string[];
  realestate: string[];
  communication: string[];
}

export default function StockCategoriesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [categories, setCategories] = useState<StockCategories | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const apiService = new ApiService();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // Use the dedicated stock categories endpoint
      const data = await apiService.getStockCategories();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load stock categories');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const handleStockPress = (symbol: string) => {
    (navigation as any).navigate('TickerDetail', { 
      symbol, 
      market_type: 'stock' 
    });
  };

  const getCategoryColor = (categoryName: string) => {
    const colors = {
      technology: '#007AFF',
      healthcare: '#34C759',
      financial: '#FF9500',
      energy: '#FF3B30',
      consumer: '#AF52DE',
      industrial: '#5856D6',
      utilities: '#FF2D92',
      materials: '#8E8E93',
      realestate: '#00C7BE',
      communication: '#30B0C7',
    };
    return colors[categoryName as keyof typeof colors] || theme.colors.primary;
  };

  const getCategoryIcon = (categoryName: string) => {
    const icons = {
      technology: 'laptop-outline',
      healthcare: 'medical-outline',
      financial: 'card-outline',
      energy: 'flash-outline',
      consumer: 'storefront-outline',
      industrial: 'construct-outline',
      utilities: 'water-outline',
      materials: 'cube-outline',
      realestate: 'home-outline',
      communication: 'call-outline',
    };
    return icons[categoryName as keyof typeof icons] || 'business-outline';
  };

  const getCategoryDescription = (categoryName: string) => {
    const descriptions = {
      technology: 'Technology and software companies',
      healthcare: 'Healthcare and pharmaceutical companies',
      financial: 'Banks and financial services',
      energy: 'Oil, gas and renewable energy',
      consumer: 'Consumer goods and retail',
      industrial: 'Manufacturing and industrial companies',
      utilities: 'Electric, gas and water utilities',
      materials: 'Mining and chemical companies',
      realestate: 'Real estate investment trusts',
      communication: 'Telecom and media companies',
    };
    return descriptions[categoryName as keyof typeof descriptions] || '';
  };

  const getCategoryDisplayName = (categoryName: string) => {
    const displayNames = {
      technology: 'Technology',
      healthcare: 'Healthcare',
      financial: 'Financial',
      energy: 'Energy',
      consumer: 'Consumer Goods',
      industrial: 'Industrial',
      utilities: 'Utilities',
      materials: 'Materials',
      realestate: 'Real Estate',
      communication: 'Communication',
    };
    return displayNames[categoryName as keyof typeof displayNames] || categoryName;
  };

  const renderCategory = (categoryName: string, symbols: string[]) => (
    <View key={categoryName} style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(categoryName) }]}>
          <Ionicons 
            name={getCategoryIcon(categoryName) as any} 
            size={20} 
            color="white" 
          />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
            {getCategoryDisplayName(categoryName)}
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
          <View key={symbol} style={styles.symbolItem}>
            <TouchableOpacity
              style={[styles.symbolChip, { backgroundColor: theme.colors.background }]}
              onPress={() => handleStockPress(symbol)}
            >
              <Text style={[styles.symbolText, { color: theme.colors.text }]}>{symbol}</Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={theme.colors.textSecondary}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
            <FavoriteButton
              symbol={symbol}
              marketType="stock"
              size={16}
              style={styles.symbolFavoriteButton}
            />
          </View>
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Stock Categories</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Explore stocks by industry sector
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
  symbolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  symbolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 4,
  },
  symbolText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chevronIcon: {
    marginLeft: 2,
  },
  symbolFavoriteButton: {
    padding: 2,
  },
});
