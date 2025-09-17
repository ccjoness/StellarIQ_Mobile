import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ApiService } from '@/services/api';
import {
  CryptoPortfolioResponse,
  CryptoPortfolioItem,
  CryptoPortfolioCreate,
} from '@/types';

export default function CryptoPortfolioScreen() {
  const { theme } = useTheme();
  const [portfolio, setPortfolio] = useState<CryptoPortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCrypto, setNewCrypto] = useState<CryptoPortfolioCreate>({
    symbol: '',
    amount: 0,
    average_buy_price: 0,
  });

  const apiService = new ApiService();

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const data = await apiService.getCryptoPortfolio();
      setPortfolio(data);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      Alert.alert('Error', 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPortfolio();
    setRefreshing(false);
  };

  const handleAddCrypto = async () => {
    if (!newCrypto.symbol || newCrypto.amount <= 0 || newCrypto.average_buy_price <= 0) {
      Alert.alert('Error', 'Please fill in all fields with valid values');
      return;
    }

    try {
      await apiService.addCryptoToPortfolio({
        ...newCrypto,
        symbol: newCrypto.symbol.toUpperCase(),
      });
      setShowAddModal(false);
      setNewCrypto({ symbol: '', amount: 0, average_buy_price: 0 });
      await loadPortfolio();
      Alert.alert('Success', `${newCrypto.symbol.toUpperCase()} added to portfolio`);
    } catch (error) {
      console.error('Error adding crypto:', error);
      Alert.alert('Error', 'Failed to add cryptocurrency to portfolio');
    }
  };

  const handleRemoveCrypto = (symbol: string) => {
    Alert.alert(
      'Remove Cryptocurrency',
      `Are you sure you want to remove ${symbol} from your portfolio?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.removeCryptoFromPortfolio(symbol);
              await loadPortfolio();
              Alert.alert('Success', `${symbol} removed from portfolio`);
            } catch (error) {
              console.error('Error removing crypto:', error);
              Alert.alert('Error', 'Failed to remove cryptocurrency');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const renderPortfolioItem = (item: CryptoPortfolioItem) => (
    <View key={item.symbol} style={[styles.portfolioItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.itemHeader}>
        <View>
          <Text style={[styles.symbol, { color: theme.colors.text }]}>{item.symbol}</Text>
          <Text style={[styles.name, { color: theme.colors.textSecondary }]}>{item.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleRemoveCrypto(item.symbol)}
          style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.itemDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Amount:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.amount}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Avg Buy Price:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {formatCurrency(item.average_buy_price)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Current Price:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {formatCurrency(item.current_price)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Total Value:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {formatCurrency(item.total_value)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>P&L:</Text>
          <Text style={[
            styles.detailValue,
            { color: item.profit_loss >= 0 ? theme.colors.success : theme.colors.error }
          ]}>
            {formatCurrency(item.profit_loss)} ({formatPercentage(item.profit_loss_percentage)})
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Cryptocurrency</Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Symbol (e.g., BTC)"
            placeholderTextColor={theme.colors.textSecondary}
            value={newCrypto.symbol}
            onChangeText={(text) => setNewCrypto({ ...newCrypto, symbol: text.toUpperCase() })}
            autoCapitalize="characters"
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Amount"
            placeholderTextColor={theme.colors.textSecondary}
            value={newCrypto.amount.toString()}
            onChangeText={(text) => setNewCrypto({ ...newCrypto, amount: parseFloat(text) || 0 })}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            placeholder="Average Buy Price (USD)"
            placeholderTextColor={theme.colors.textSecondary}
            value={newCrypto.average_buy_price.toString()}
            onChangeText={(text) => setNewCrypto({ ...newCrypto, average_buy_price: parseFloat(text) || 0 })}
            keyboardType="numeric"
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.textSecondary }]}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddCrypto}
            >
              <Text style={styles.modalButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading portfolio...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Portfolio Summary */}
        {portfolio && (
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Portfolio Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total Value:</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {formatCurrency(portfolio.total_value)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total P&L:</Text>
              <Text style={[
                styles.summaryValue,
                { color: portfolio.total_profit_loss >= 0 ? theme.colors.success : theme.colors.error }
              ]}>
                {formatCurrency(portfolio.total_profit_loss)} ({formatPercentage(portfolio.total_profit_loss_percentage)})
              </Text>
            </View>
          </View>
        )}

        {/* Portfolio Items */}
        {portfolio?.portfolio.map(renderPortfolioItem)}

        {/* Empty State */}
        {portfolio?.portfolio.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              No cryptocurrencies in your portfolio yet.
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
              Tap the + button to add your first cryptocurrency.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {renderAddModal()}
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
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  portfolioItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 14,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  itemDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 24,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});
