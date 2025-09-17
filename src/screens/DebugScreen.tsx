/**
 * Debug screen for testing API connectivity and authentication
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ApiService } from '@/services/api';
import { TokenStorage } from '@/services/tokenStorage';

export default function DebugScreen() {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const apiService = new ApiService();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    addLog('Testing backend connection...');
    
    try {
      const connected = await apiService.testConnection();
      if (connected) {
        addLog('✅ Backend connection successful');
      } else {
        addLog('❌ Backend connection failed');
      }
    } catch (error) {
      addLog(`❌ Connection error: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testAuthentication = async () => {
    setIsLoading(true);
    addLog('Testing authentication...');
    
    try {
      const isAuth = await TokenStorage.isAuthenticated();
      const token = await TokenStorage.getAccessToken();
      
      addLog(`Authentication status: ${isAuth ? '✅ Authenticated' : '❌ Not authenticated'}`);
      addLog(`Access token: ${token ? '✅ Present' : '❌ Missing'}`);
      
      if (token) {
        addLog(`Token preview: ${token.substring(0, 20)}...`);
      }
    } catch (error) {
      addLog(`❌ Auth check error: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testLogin = async () => {
    setIsLoading(true);
    addLog('Testing login with test credentials...');
    
    try {
      const response = await apiService.login({
        email: 'test@example.com',
        password: 'testpass123'
      });
      
      await TokenStorage.storeTokens(response);
      addLog('✅ Login successful');
      addLog(`Token type: ${response.token_type}`);
      addLog(`Expires in: ${response.expires_in} seconds`);
    } catch (error) {
      addLog(`❌ Login failed: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testCandlestickChart = async () => {
    setIsLoading(true);
    addLog('Testing candlestick chart APIs...');

    // Test stock chart
    try {
      const stockData = await apiService.getCandlestickChart('AAPL', 'stock', '5min', 24);
      addLog('✅ Stock candlestick chart successful');
      addLog(`Stock - Symbol: ${stockData.symbol}, Data points: ${stockData.candlestick_data?.length || 0}`);
    } catch (error) {
      addLog(`❌ Stock candlestick chart failed: ${error}`);
    }

    // Test crypto chart
    try {
      const cryptoData = await apiService.getCandlestickChart('BTC', 'crypto', '5min', 24);
      addLog('✅ Crypto candlestick chart successful');
      addLog(`Crypto - Symbol: ${cryptoData.symbol}, Data points: ${cryptoData.candlestick_data?.length || 0}`);
    } catch (error) {
      addLog(`❌ Crypto candlestick chart failed: ${error}`);
    }

    setIsLoading(false);
  };

  const runFullDebugFlow = async () => {
    setIsLoading(true);
    clearLogs();
    addLog('Starting full debug flow...');
    
    try {
      await apiService.debugApiFlow();
      addLog('✅ Debug flow completed - check console for detailed logs');
    } catch (error) {
      addLog(`❌ Debug flow error: ${error}`);
    }
    
    setIsLoading(false);
  };

  const clearAuth = async () => {
    try {
      await TokenStorage.clearAuth();
      addLog('✅ Authentication data cleared');
    } catch (error) {
      addLog(`❌ Error clearing auth: ${error}`);
    }
  };

  const testTechnicalAnalysis = async () => {
    setIsLoading(true);
    addLog('Testing technical analysis summary...');

    try {
      // Test AAPL technical analysis
      const aaplAnalysis = await apiService.getTechnicalAnalysisSummary('AAPL', 'daily');
      addLog('✅ AAPL Technical Analysis successful');
      addLog(`AAPL - Overall: ${aaplAnalysis.overall_condition.toUpperCase()} (${Math.round(aaplAnalysis.confidence_score * 100)}% confidence)`);
      addLog(`AAPL - RSI: ${aaplAnalysis.rsi_condition || 'N/A'}, MACD: ${aaplAnalysis.macd_condition || 'N/A'}, Stoch: ${aaplAnalysis.stoch_condition || 'N/A'}`);
      addLog(`AAPL - Recommendation: ${aaplAnalysis.recommendation}`);

      // Test BTC technical analysis
      const btcAnalysis = await apiService.getTechnicalAnalysisSummary('BTC', 'daily');
      addLog('✅ BTC Technical Analysis successful');
      addLog(`BTC - Overall: ${btcAnalysis.overall_condition.toUpperCase()} (${Math.round(btcAnalysis.confidence_score * 100)}% confidence)`);
      addLog(`BTC - RSI: ${btcAnalysis.rsi_condition || 'N/A'}, MACD: ${btcAnalysis.macd_condition || 'N/A'}, Stoch: ${btcAnalysis.stoch_condition || 'N/A'}`);
      addLog(`BTC - Recommendation: ${btcAnalysis.recommendation}`);

    } catch (error) {
      addLog(`❌ Technical Analysis test failed: ${error}`);
    }

    setIsLoading(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          API Debug Console
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Test backend connectivity and API endpoints
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Quick Tests
        </Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={testConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={testAuthentication}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Check Authentication</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.warning }]}
          onPress={testLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.success }]}
          onPress={testCandlestickChart}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Charts (Stock & Crypto)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#8B5CF6' }]}
          onPress={testTechnicalAnalysis}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Technical Analysis</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Full Debug
        </Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={runFullDebugFlow}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Run Full Debug Flow</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.error }]}
          onPress={clearAuth}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Clear Auth Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.textSecondary }]}
          onPress={clearLogs}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Debug Logs
        </Text>
        
        <View style={[styles.logsContainer, { backgroundColor: theme.colors.background }]}>
          {logs.length === 0 ? (
            <Text style={[styles.noLogs, { color: theme.colors.textSecondary }]}>
              No logs yet. Run a test to see results.
            </Text>
          ) : (
            logs.map((log, index) => (
              <Text
                key={index}
                style={[
                  styles.logText,
                  { color: log.includes('❌') ? theme.colors.error : 
                           log.includes('✅') ? theme.colors.success : 
                           theme.colors.text }
                ]}
              >
                {log}
              </Text>
            ))
          )}
        </View>
      </View>
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
    fontSize: 24,
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logsContainer: {
    padding: 12,
    borderRadius: 8,
    maxHeight: 300,
  },
  noLogs: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
    lineHeight: 16,
  },
});
