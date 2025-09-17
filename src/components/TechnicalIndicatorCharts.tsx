/**
 * Technical Indicator Charts Component
 * Displays RSI, Stochastic %K, and MACD charts for the last 24 hours
 */


import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@/hooks/useTheme';
import { apiService } from '@/services/api';
import { TechnicalIndicatorDataPoint, TechnicalAnalysisSummary, MarketCondition } from '@/types';
import { TECHNICAL_INDICATORS_CONFIG } from '@/constants/config';

interface TechnicalIndicatorChartsProps {
  symbol: string;
  marketType: 'crypto' | 'stock';
}

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 80; // Account for margins

const getMarketConditionDisplay = (condition: MarketCondition) => {
  switch (condition) {
    case 'oversold':
      return {
        text: 'OVERSOLD',
        color: '#10B981', // Green
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        description: 'Potential buying opportunity'
      };
    case 'overbought':
      return {
        text: 'OVERBOUGHT',
        color: '#EF4444', // Red
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        description: 'Potential selling opportunity'
      };
    case 'neutral':
    default:
      return {
        text: 'NEUTRAL',
        color: '#6B7280', // Gray
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        description: 'Mixed signals'
      };
  }
};

export function TechnicalIndicatorCharts({ symbol, marketType }: TechnicalIndicatorChartsProps) {
  const { theme } = useTheme();

  const { data: indicatorData, isLoading, error } = useQuery({
    queryKey: ['technicalIndicators', symbol, marketType],
    queryFn: () => apiService.getTechnicalIndicatorsHistory(
      symbol,
      marketType,
      TECHNICAL_INDICATORS_CONFIG.DEFAULT_TIMEFRAME, // '1H' timeframe for indicators
      TECHNICAL_INDICATORS_CONFIG.DEFAULT_HOURS // 24 hours
    ),
    staleTime: TECHNICAL_INDICATORS_CONFIG.REFRESH_INTERVAL, // 1 minute refresh
  });

  const { data: analysisSummary, isLoading: isAnalysisLoading } = useQuery({
    queryKey: ['technicalAnalysisSummary', symbol],
    queryFn: () => apiService.getTechnicalAnalysisSummary(symbol, 'daily'),
    staleTime: TECHNICAL_INDICATORS_CONFIG.REFRESH_INTERVAL, // 1 minute refresh
  });

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
    labelColor: () => theme.colors.textSecondary,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: '3',
      strokeWidth: '1',
      stroke: theme.colors.primary,
    },
  };

  const formatChartData = (data: TechnicalIndicatorDataPoint[], valueKey: keyof TechnicalIndicatorDataPoint) => {
    const validData = data.filter(point => point[valueKey] !== null && point[valueKey] !== undefined);
    
    if (validData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    // Take last 12 points for better readability (every 2 hours for 24h)
    const step = Math.max(1, Math.floor(validData.length / 12));
    const sampledData = validData.filter((_, index) => index % step === 0);

    return {
      labels: sampledData.map((point, index) => {
        const date = new Date(point.timestamp);
        return index % 2 === 0 ? date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }) : '';
      }),
      datasets: [
        {
          data: sampledData.map(point => Number(point[valueKey]) || 0),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const formatMACDChartData = (data: TechnicalIndicatorDataPoint[]) => {
    const validData = data.filter(point => 
      point.macd_line !== null && point.macd_line !== undefined &&
      point.macd_signal_line !== null && point.macd_signal_line !== undefined
    );
    
    if (validData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }, { data: [0] }],
      };
    }

    // Take last 12 points for better readability
    const step = Math.max(1, Math.floor(validData.length / 12));
    const sampledData = validData.filter((_, index) => index % step === 0);

    return {
      labels: sampledData.map((point, index) => {
        const date = new Date(point.timestamp);
        return index % 2 === 0 ? date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }) : '';
      }),
      datasets: [
        {
          data: sampledData.map(point => Number(point.macd_line) || 0),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue for MACD line
          strokeWidth: 2,
        },
        {
          data: sampledData.map(point => Number(point.macd_signal_line) || 0),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for signal line
          strokeWidth: 2,
        },
      ],
    };
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Technical Indicators (24h • 1min intervals)
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading charts...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !indicatorData?.data || indicatorData.data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Technical Indicators (24h)
        </Text>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Unable to load indicator data
        </Text>
        {error && (
          <Text style={[styles.errorDetails, { color: theme.colors.textSecondary }]}>
            {error.message || 'Network error or data unavailable'}
          </Text>
        )}
      </View>
    );
  }

  const rsiData = formatChartData(indicatorData.data, 'rsi');
  const stochasticData = formatChartData(indicatorData.data, 'stochastic_k');
  const macdData = formatMACDChartData(indicatorData.data);

  const conditionDisplay = analysisSummary ? getMarketConditionDisplay(analysisSummary.overall_condition) : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Technical Indicators (24h)
      </Text>

      {/* Market Condition Status */}
      {conditionDisplay && !isAnalysisLoading && (
        <View style={[styles.statusContainer, { backgroundColor: conditionDisplay.backgroundColor }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusTitle, { color: conditionDisplay.color }]}>
              Market Status: {conditionDisplay.text}
            </Text>
            <Text style={[styles.confidenceText, { color: theme.colors.textSecondary }]}>
              Confidence: {Math.round((analysisSummary?.confidence_score || 0) * 100)}%
            </Text>
          </View>
          <Text style={[styles.statusDescription, { color: theme.colors.textSecondary }]}>
            {conditionDisplay.description}
          </Text>
          {analysisSummary?.recommendation && (
            <Text style={[styles.recommendation, { color: theme.colors.text }]}>
              {analysisSummary.recommendation}
            </Text>
          )}
        </View>
      )}
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartsContainer}>
          {/* RSI Chart */}
          <View style={styles.chartSection}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              RSI (Relative Strength Index)
            </Text>
            <View style={styles.chartWrapper}>
              <LineChart
                data={rsiData}
                width={chartWidth}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                yAxisSuffix=""
                yAxisInterval={1}
                fromZero={false}
              />
              <View style={styles.rsiLevels}>
                <View style={[styles.levelLine, styles.overboughtLine]} />
                <Text style={[styles.levelText, { color: theme.colors.error }]}>70</Text>
                <View style={[styles.levelLine, styles.oversoldLine]} />
                <Text style={[styles.levelText, { color: theme.colors.success }]}>30</Text>
              </View>
            </View>
          </View>

          {/* Stochastic %K Chart */}
          <View style={styles.chartSection}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              Stochastic %K
            </Text>
            <LineChart
              data={stochasticData}
              width={chartWidth}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisSuffix=""
              yAxisInterval={1}
              fromZero={false}
            />
          </View>

          {/* MACD Chart */}
          <View style={styles.chartSection}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              MACD
            </Text>
            <View style={styles.macdLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: 'rgba(59, 130, 246, 1)' }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>MACD Line</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: 'rgba(239, 68, 68, 1)' }]} />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Signal Line</Text>
              </View>
            </View>
            <LineChart
              data={macdData}
              width={chartWidth}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisSuffix=""
              yAxisInterval={1}
              fromZero={false}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusDescription: {
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  recommendation: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  errorDetails: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  chartsContainer: {
    flexDirection: 'column',
  },
  chartSection: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartWrapper: {
    position: 'relative',
  },
  chart: {
    borderRadius: 12,
  },
  rsiLevels: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  levelLine: {
    position: 'absolute',
    left: 60,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  overboughtLine: {
    top: 40, // Approximate position for 70 level
  },
  oversoldLine: {
    top: 140, // Approximate position for 30 level
  },
  levelText: {
    position: 'absolute',
    left: 20,
    fontSize: 10,
    fontWeight: '500',
  },
  macdLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
  },
});
