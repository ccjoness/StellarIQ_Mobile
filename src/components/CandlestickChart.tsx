import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { VictoryCandlestick, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@/hooks/useTheme';
import { apiService } from '@/services/api';
import { CandlestickDataPoint } from '@/types';
import { CANDLESTICK_CONFIG } from '@/constants/config';

interface CandlestickChartProps {
  symbol: string;
  marketType: 'crypto' | 'stock';
}

interface TimeframeOption {
  label: string;
  hours: number;
  interval: string;
}

const screenWidth = Dimensions.get('window').width;

const timeframeOptions: TimeframeOption[] = CANDLESTICK_CONFIG.TIMEFRAME_OPTIONS.map(option => ({
  label: option.label,
  hours: option.hours,
  interval: option.interval,
}));

export function CandlestickChart({ symbol, marketType }: CandlestickChartProps) {
  const { theme } = useTheme();
  const selectedTimeframe = timeframeOptions[3];

  const { data: candlestickData, isLoading, error } = useQuery({
    queryKey: ['candlestick', symbol, marketType, selectedTimeframe.hours, selectedTimeframe.interval],
    queryFn: () => apiService.getCandlestickChart(
      symbol, 
      marketType, 
      selectedTimeframe.interval, 
      selectedTimeframe.hours
    ),
    staleTime: CANDLESTICK_CONFIG.REFRESH_INTERVAL, // 1 minute for 1min data
  });

  const formatChartData = (data: CandlestickDataPoint[]) => {
    if (!data || data.length === 0) return [];

    return data.map(point => ({
      x: new Date(point.timestamp),
      open: point.open,
      close: point.close,
      high: point.high,
      low: point.low,
    }));
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading candlestick chart...
          </Text>
        </View>
      );
    }

    if (error || !candlestickData?.candlestick_data || candlestickData.candlestick_data.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Unable to load candlestick data
          </Text>
        </View>
      );
    }

    const chartData = formatChartData(candlestickData.candlestick_data);
    
    if (chartData.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            No chart data available
          </Text>
        </View>
      );
    }

    return (
      <View>
        <VictoryChart
          theme={VictoryTheme.material}
          height={250}
          width={screenWidth - 80}
          padding={{ left: 60, right: 20, top: 20, bottom: 60 }}
          style={{
            background: { fill: theme.colors.surface },
          }}
        >
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: theme.colors.border },
              tickLabels: { 
                fill: theme.colors.textSecondary, 
                fontSize: 10,
                fontFamily: 'System'
              },
              grid: { stroke: theme.colors.border, strokeOpacity: 0.3 }
            }}
            tickFormat={(value) => `$${value.toFixed(2)}`}
          />
          <VictoryAxis
            style={{
              axis: { stroke: theme.colors.border },
              tickLabels: { 
                fill: theme.colors.textSecondary, 
                fontSize: 10,
                fontFamily: 'System',
                angle: -45
              },
              grid: { stroke: theme.colors.border, strokeOpacity: 0.3 }
            }}
            tickFormat={(date) => {
              const d = new Date(date);
                // For 24 hours: show every 4 hours
                return d.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });
            }}
            // fixLabelOverlap={true}
          />
          <VictoryCandlestick
            data={chartData}
            candleColors={{
              positive: theme.colors.success,
              negative: theme.colors.error,
            }}
            style={{
              data: {
                strokeWidth: 1,
                stroke: (datum: any) => (datum.close > datum.open ? theme.colors.success : theme.colors.error),
              }
            }}
          />
        </VictoryChart>
      </View>
    );
  };

  const renderChartInfo = () => {
    if (!candlestickData) return null;

    const latestCandle = candlestickData.candlestick_data[0]; // Most recent data point
    if (!latestCandle) return null;

    const priceChange = latestCandle.close - latestCandle.open;
    const isPositive = priceChange >= 0;

    return (
      <View style={styles.chartInfo}>
        <View style={styles.priceInfo}>
          <Text style={[styles.currentPrice, { color: theme.colors.text }]}>
            ${latestCandle.close.toFixed(2)}
          </Text>
          <Text style={[
            styles.priceChange,
            { color: isPositive ? theme.colors.success : theme.colors.error }
          ]}>
            {isPositive ? '+' : ''}${priceChange.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.ohlcInfo}>
          <View style={styles.ohlcItem}>
            <Text style={[styles.ohlcLabel, { color: theme.colors.textSecondary }]}>O</Text>
            <Text style={[styles.ohlcValue, { color: theme.colors.text }]}>
              ${latestCandle.open.toFixed(2)}
            </Text>
          </View>
          <View style={styles.ohlcItem}>
            <Text style={[styles.ohlcLabel, { color: theme.colors.textSecondary }]}>H</Text>
            <Text style={[styles.ohlcValue, { color: theme.colors.text }]}>
              ${latestCandle.high.toFixed(2)}
            </Text>
          </View>
          <View style={styles.ohlcItem}>
            <Text style={[styles.ohlcLabel, { color: theme.colors.textSecondary }]}>L</Text>
            <Text style={[styles.ohlcValue, { color: theme.colors.text }]}>
              ${latestCandle.low.toFixed(2)}
            </Text>
          </View>
          <View style={styles.ohlcItem}>
            <Text style={[styles.ohlcLabel, { color: theme.colors.textSecondary }]}>C</Text>
            <Text style={[styles.ohlcValue, { color: theme.colors.text }]}>
              ${latestCandle.close.toFixed(2)}
            </Text>
          </View>
          {/*{latestCandle.volume && (*/}
          {/*  <View style={styles.ohlcItem}>*/}
          {/*    <Text style={[styles.ohlcLabel, { color: theme.colors.textSecondary }]}>Vol</Text>*/}
          {/*    <Text style={[styles.ohlcValue, { color: theme.colors.text }]}>*/}
          {/*      {(latestCandle.volume / 1000000).toFixed(1)}M*/}
          {/*    </Text>*/}
          {/*  </View>*/}
          {/*)}*/}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {renderChartInfo()}
      {renderChart()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
  timeframeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  timeframeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartInfo: {
    marginBottom: 16,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  ohlcInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  ohlcItem: {
    alignItems: 'center',
  },
  ohlcLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  ohlcValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
