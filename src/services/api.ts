/**
 * API service for communicating with StellarIQ backend
 */

import { API_CONFIG } from '@/constants/config';
import { TokenStorage } from './tokenStorage';
import {
  SearchResponse,
  TickerDetail,
  HistoricalDataResponse,
  TechnicalIndicatorHistoryResponse,
  TechnicalIndicatorDataPoint,
  SignalAnalysis,
  WatchlistResponse,
  WatchlistItemCreate,
  WatchlistItem,
  Quote,
  CandlestickChartResponse,
  CryptoExchangeRate,
  CryptoQuote,
  CryptoSearchResponse,
  CryptoTrendingResponse,
  CryptoPopularResponse,
  CryptoPortfolioResponse,
  CryptoPortfolioCreate,
  CryptoPortfolioUpdate,
  TechnicalAnalysisSummary,
  DeviceToken,
  DeviceTokenCreate,
  NotificationHistory,
  NotificationSummary,
  NotificationPreferences,
} from '@/types';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  GoogleOAuthRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  UserUpdateRequest,
  User
} from '@/types/auth';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    console.log('ApiService initialized with baseUrl:', this.baseUrl);
  }

  // Test connectivity to backend
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing connection to backend...');
      const response = await fetch(`${this.baseUrl}/docs`);
      console.log('Connection test response:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Debug method to test full authentication and API flow
  async debugApiFlow(): Promise<void> {
    console.log('=== Starting API Debug Flow ===');

    // Test 1: Basic connectivity
    console.log('1. Testing basic connectivity...');
    const connected = await this.testConnection();
    console.log('Connection result:', connected);

    if (!connected) {
      console.error('❌ Cannot connect to backend. Check if backend is running and URL is correct.');
      return;
    }

    // Test 2: Check authentication status
    console.log('2. Checking authentication status...');
    const isAuth = await TokenStorage.isAuthenticated();
    const token = await TokenStorage.getAccessToken();
    console.log('Is authenticated:', isAuth);
    console.log('Has access token:', !!token);

    if (!token) {
      console.log('❌ No access token found. User needs to login.');
      return;
    }

    // Test 3: Try a simple authenticated request
    console.log('3. Testing authenticated request...');
    try {
      const healthResponse = await this.healthCheck();
      console.log('✅ Health check successful:', healthResponse);
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return;
    }

    // Test 4: Try stock candlestick chart request
    console.log('4. Testing stock candlestick chart request...');
    try {
      const stockChartData = await this.getCandlestickChart('AAPL', 'stock', '5min', 24);
      console.log('✅ Stock candlestick chart request successful');
      console.log('Stock chart data points:', stockChartData.candlestick_data?.length || 0);
    } catch (error) {
      console.error('❌ Stock candlestick chart request failed:', error);
    }

    // Test 5: Try crypto candlestick chart request
    console.log('5. Testing crypto candlestick chart request...');
    try {
      const cryptoChartData = await this.getCandlestickChart('BTC', 'crypto', '5min', 24);
      console.log('✅ Crypto candlestick chart request successful');
      console.log('Crypto chart data points:', cryptoChartData.candlestick_data?.length || 0);
    } catch (error) {
      console.error('❌ Crypto candlestick chart request failed:', error);
    }

    console.log('=== API Debug Flow Complete ===');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get authentication token if required
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (requireAuth) {
      const accessToken = await TokenStorage.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      console.log("Request config:", JSON.stringify(config, null, 2));
      const response = await fetch(url, config);

      console.log(`API Response: ${response.status} ${response.statusText}`);

      // Handle authentication errors
      if (response.status === 401 && requireAuth) {
        console.log('Access token expired, attempting refresh...');

        try {
          // Try to refresh the token
          const refreshToken = await TokenStorage.getRefreshToken();
          if (refreshToken) {
            const refreshResponse = await this.refreshToken(refreshToken);

            // Store new tokens
            await TokenStorage.storeTokens({
              access_token: refreshResponse.access_token,
              refresh_token: refreshResponse.refresh_token || refreshToken, // Keep existing refresh token if not provided
              token_type: refreshResponse.token_type,
              expires_in: refreshResponse.expires_in || 1800,
            });

            // Retry the original request with new token
            headers['Authorization'] = `Bearer ${refreshResponse.access_token}`;
            const retryResponse = await fetch(url, { ...config, headers });

            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }
        } catch (refreshError) {
          console.log('Token refresh failed:', refreshError);
          // If refresh fails, clear auth and throw error
          console.log('Authentication failed, clearing stored tokens');
          await TokenStorage.clearAuth();
          throw new Error('Authentication required');
        }

        // If refresh fails, clear auth and throw error
        console.log('Authentication failed, clearing stored tokens');
        await TokenStorage.clearAuth();
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `HTTP ${response.status}`;
        console.error(`API Error: ${errorMessage}`);
        console.error('Full error response:', errorData);
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);

      if (error instanceof Error) {
        // Add more specific error messages for common network issues
        if (error.message.includes('Network request failed') ||
            error.message.includes('fetch')) {
          throw new Error('Cannot connect to server. Check if backend is running and network connection.');
        }
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  // Search endpoints
  async searchTickers(query: string, limit: number = 20): Promise<SearchResponse> {
    const params = new URLSearchParams({
      keywords: query,
    });

    // Get backend response and transform it
    const backendResponse = await this.request<any>(`/stocks/search?${params}`, {}, true);

    // Transform backend response to expected format
    const searchResults = backendResponse.results?.map((item: any) => ({
      symbol: item.symbol,
      name: item.name || item.symbol,
      market_type: 'stock' as const,
      exchange: item.exchange || '',
      logo_url: item.logo_url || null,
      market_cap_rank: item.market_cap_rank || null,
    })) || [];

    return {
      query,
      results: searchResults,
      total: searchResults.length,
    };
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    // Search suggestions not implemented in current backend
    return [];
  }

  // Ticker endpoints
  async getTickerDetail(
    symbol: string,
    marketType: 'crypto' | 'stock'
  ): Promise<TickerDetail> {
    if (marketType === 'stock') {
      // Get stock quote from backend
      const stockQuote = await this.request<any>(`/stocks/quote/${symbol}`, {}, true);

      // Get technical analysis if available
      let signals = {
        overall_signal: 'neutral' as const,
        confidence: 0.5,
        rsi_signal: 'neutral' as const,
        macd_signal: 'neutral' as const,
        stochastic_signal: 'neutral' as const,
        bb_signal: 'neutral' as const,
        recommendation: 'Hold',
        analysis_timestamp: new Date().toISOString(),
      };

      let technicalIndicators = {
        rsi_value: 50,
        rsi_signal: 'neutral' as const,
        stochastic_k: 50,
        stochastic_d: 50,
        stochastic_signal: 'neutral' as const,
        bb_upper: 0,
        bb_middle: 0,
        bb_lower: 0,
        bb_signal: 'neutral' as const,
        macd_line: 0,
        macd_signal_line: 0,
        macd_histogram: 0,
        macd_signal: 'neutral' as const,
      };

      try {
        // Try to get technical analysis
        const analysis = await this.analyzeSignals(symbol, marketType);
        signals = analysis.signals || signals;
        technicalIndicators = analysis.technical_indicators || technicalIndicators;
      } catch (error) {
        console.warn('Failed to get technical analysis for', symbol, error);
      }

      // Transform to expected TickerDetail format
      return {
        ticker: {
          id: 0, // Not available from backend
          symbol: stockQuote.symbol || symbol,
          name: stockQuote.name || symbol,
          market_type: 'stock',
          exchange: stockQuote.exchange || '',
          current_price: stockQuote.price || 0,
          price_change_24h: stockQuote.change || 0,
          price_change_percentage_24h: stockQuote.change_percent || 0,
          market_cap: stockQuote.market_cap || 0,
          volume_24h: stockQuote.volume || 0,
          description: stockQuote.description || `${symbol} stock information`,
          logo_url: stockQuote.logo_url || null,
          website_url: stockQuote.website_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_data_update: stockQuote.last_updated || new Date().toISOString(),
        },
        quote: {
          symbol: stockQuote.symbol || symbol,
          current_price: stockQuote.price || 0,
          price_change_24h: stockQuote.change || 0,
          price_change_percentage_24h: stockQuote.change_percent || 0,
          volume_24h: stockQuote.volume || 0,
          market_cap: stockQuote.market_cap || 0,
          high_24h: stockQuote.high || 0,
          low_24h: stockQuote.low || 0,
          last_updated: stockQuote.last_updated || new Date().toISOString(),
        },
        signals,
        technical_indicators: technicalIndicators,
      };
    } else {
      // For crypto, use crypto endpoints
      const quote = await this.getCryptoQuote(symbol);

      let signals = {
        overall_signal: 'neutral' as const,
        confidence: 0.5,
        rsi_signal: 'neutral' as const,
        macd_signal: 'neutral' as const,
        stochastic_signal: 'neutral' as const,
        bb_signal: 'neutral' as const,
        recommendation: 'Hold',
        analysis_timestamp: new Date().toISOString(),
      };

      let technicalIndicators = {
        rsi_value: 50,
        rsi_signal: 'neutral' as const,
        stochastic_k: 50,
        stochastic_d: 50,
        stochastic_signal: 'neutral' as const,
        bb_upper: 0,
        bb_middle: 0,
        bb_lower: 0,
        bb_signal: 'neutral' as const,
        macd_line: 0,
        macd_signal_line: 0,
        macd_histogram: 0,
        macd_signal: 'neutral' as const,
      };

      try {
        // Try to get technical analysis
        const analysis = await this.analyzeSignals(symbol, marketType);
        signals = analysis.signals || signals;
        technicalIndicators = analysis.technical_indicators || technicalIndicators;
      } catch (error) {
        console.warn('Failed to get technical analysis for', symbol, error);
      }

      return {
        ticker: {
          id: 0,
          symbol: symbol,
          name: quote.name || symbol,
          market_type: 'crypto',
          current_price: quote.price || 0,
          price_change_24h: quote.change_24h || 0,
          price_change_percentage_24h: quote.change_percent_24h || 0,
          volume_24h: quote.volume_24h || 0,
          market_cap: quote.market_cap || 0,
          created_at: new Date().toISOString(),
          updated_at: quote.last_updated || new Date().toISOString(),
        },
        quote: {
          symbol: quote.symbol,
          current_price: quote.price || 0,
          price_change_24h: quote.change_24h || 0,
          price_change_percentage_24h: quote.change_percent_24h || 0,
          volume_24h: quote.volume_24h || 0,
          market_cap: quote.market_cap || 0,
          last_updated: quote.last_updated || new Date().toISOString(),
        },
        signals,
        technical_indicators: technicalIndicators,
      };
    }
  }

  async getTickerQuote(
    symbol: string,
    marketType: 'crypto' | 'stock'
  ): Promise<Quote> {
    if (marketType === 'stock') {
      const stockQuote = await this.request<any>(`/stocks/quote/${symbol}`, {}, true);

      // Transform backend response to expected Quote format
      return {
        symbol: stockQuote.symbol || symbol,
        current_price: stockQuote.price || 0,
        price_change_24h: stockQuote.change || 0,
        price_change_percentage_24h: stockQuote.change_percent || 0,
        volume_24h: stockQuote.volume || 0,
        market_cap: stockQuote.market_cap || 0,
        high_24h: stockQuote.high || 0,
        low_24h: stockQuote.low || 0,
        last_updated: stockQuote.last_updated || new Date().toISOString(),
      };
    } else {
      // For crypto, use crypto quote endpoint
      const cryptoQuote = await this.getCryptoQuote(symbol);
      return {
        symbol: cryptoQuote.symbol,
        current_price: cryptoQuote.price || 0,
        price_change_24h: cryptoQuote.change_24h || 0,
        price_change_percentage_24h: cryptoQuote.change_percent_24h || 0,
        volume_24h: cryptoQuote.volume_24h || 0,
        market_cap: cryptoQuote.market_cap || 0,
        high_24h: 0, // Not available in crypto quote
        low_24h: 0, // Not available in crypto quote
        last_updated: cryptoQuote.last_updated || new Date().toISOString(),
      };
    }
  }

  async getHistoricalData(
    symbol: string,
    marketType: 'crypto' | 'stock',
    timeframe: string = '1D',
    days: number = 30
  ): Promise<HistoricalDataResponse> {
    if (marketType === 'stock') {
      if (timeframe === '1D') {
        const params = new URLSearchParams({
          outputsize: days > 100 ? 'full' : 'compact'
        });
        return this.request<HistoricalDataResponse>(`/stocks/daily/${symbol}?${params}`, {}, true);
      } else {
        // For intraday data
        const params = new URLSearchParams({
          interval: timeframe,
          outputsize: 'compact'
        });
        return this.request<HistoricalDataResponse>(`/stocks/intraday/${symbol}?${params}`, {}, true);
      }
    } else {
      // For crypto - support multiple timeframes
      const params = new URLSearchParams({
        market: 'USD'
      });

      if (timeframe === '1D') {
        return this.request<HistoricalDataResponse>(`/crypto/daily/${symbol}?${params}`, {}, true);
      } else if (timeframe === '1W') {
        return this.request<HistoricalDataResponse>(`/crypto/weekly/${symbol}?${params}`, {}, true);
      } else if (timeframe === '1M') {
        return this.request<HistoricalDataResponse>(`/crypto/monthly/${symbol}?${params}`, {}, true);
      } else {
        // For intraday data (1min, 5min, 15min, 30min, 60min)
        const intradayParams = new URLSearchParams({
          market: 'USD',
          interval: timeframe
        });
        return this.request<HistoricalDataResponse>(`/crypto/intraday/${symbol}?${intradayParams}`, {}, true);
      }
    }
  }

  async getTechnicalIndicatorsHistory(
    symbol: string,
    marketType: 'crypto' | 'stock',
    timeframe: string = 'daily',
    hours: number = 24
  ): Promise<TechnicalIndicatorHistoryResponse> {
    try {
      // Map timeframe to backend format
      const interval = timeframe === '1min' ? 'daily' : timeframe;

      // Get individual indicators to combine into historical data
      const [rsiResponse, macdResponse, stochResponse] = await Promise.all([
        this.getRSI(symbol, interval),
        this.getMACD(symbol, interval),
        this.getStochastic(symbol, interval)
      ]);

      // Combine the data into the expected format
      const combinedData: TechnicalIndicatorDataPoint[] = [];

      // Use RSI data as the base timeline since it's most commonly available
      if (rsiResponse.data && rsiResponse.data.length > 0) {
        rsiResponse.data.forEach((rsiPoint: any, index: number) => {
          const macdPoint = macdResponse.data?.[index];
          const stochPoint = stochResponse.data?.[index];

          combinedData.push({
            timestamp: rsiPoint.timestamp,
            rsi: rsiPoint.rsi,
            stochastic_k: stochPoint?.slowk,
            stochastic_d: stochPoint?.slowd,
            macd_line: macdPoint?.macd,
            macd_signal_line: macdPoint?.macd_signal,
            macd_histogram: macdPoint?.macd_hist,
            price: 0 // We don't have price data in indicators, set to 0
          });
        });
      }

      return {
        symbol: symbol,
        market_type: marketType,
        timeframe: interval,
        data: combinedData
      };
    } catch (error) {
      console.warn('Failed to get technical indicators for', symbol, error);
      // Return empty data structure on error
      return {
        symbol: symbol,
        market_type: marketType,
        timeframe: timeframe,
        data: []
      };
    }
  }

  // Individual technical indicator endpoints
  async getRSI(
    symbol: string,
    interval: string = 'daily',
    timePeriod: number = 14,
    seriesType: string = 'close'
  ): Promise<any> {
    const params = new URLSearchParams({
      interval: interval,
      time_period: timePeriod.toString(),
      series_type: seriesType
    });
    return this.request<any>(`/indicators/rsi/${symbol}?${params}`, {}, true);
  }

  async getMACD(
    symbol: string,
    interval: string = 'daily',
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9,
    seriesType: string = 'close'
  ): Promise<any> {
    const params = new URLSearchParams({
      interval: interval,
      fastperiod: fastPeriod.toString(),
      slowperiod: slowPeriod.toString(),
      signalperiod: signalPeriod.toString(),
      series_type: seriesType
    });
    return this.request<any>(`/indicators/macd/${symbol}?${params}`, {}, true);
  }

  async getStochastic(
    symbol: string,
    interval: string = 'daily',
    fastkPeriod: number = 5,
    slowkPeriod: number = 3,
    slowdPeriod: number = 3,
    slowkMatype: number = 0,
    slowdMatype: number = 0
  ): Promise<any> {
    const params = new URLSearchParams({
      interval: interval,
      fastkperiod: fastkPeriod.toString(),
      slowkperiod: slowkPeriod.toString(),
      slowdperiod: slowdPeriod.toString(),
      slowkmatype: slowkMatype.toString(),
      slowdmatype: slowdMatype.toString()
    });
    return this.request<any>(`/indicators/stoch/${symbol}?${params}`, {}, true);
  }

  async getBollingerBands(
    symbol: string,
    interval: string = 'daily',
    timePeriod: number = 20,
    seriesType: string = 'close',
    nbdevup: number = 2,
    nbdevdn: number = 2,
    matype: number = 0
  ): Promise<any> {
    const params = new URLSearchParams({
      interval: interval,
      time_period: timePeriod.toString(),
      series_type: seriesType,
      nbdevup: nbdevup.toString(),
      nbdevdn: nbdevdn.toString(),
      matype: matype.toString()
    });
    return this.request<any>(`/indicators/bbands/${symbol}?${params}`, {}, true);
  }

  async getTechnicalAnalysisSummary(
    symbol: string,
    interval: string = 'daily'
  ): Promise<TechnicalAnalysisSummary> {
    const params = new URLSearchParams({
      interval,
    });

    return this.request<TechnicalAnalysisSummary>(
      `/indicators/analysis/${symbol}?${params}`,
      {},
      true
    );
  }

  async getCandlestickChart(
    symbol: string,
    marketType: 'crypto' | 'stock',
    interval: string = '1min',
    hours: number = 24
  ): Promise<CandlestickChartResponse> {
    console.log(`Getting candlestick chart for ${symbol}, interval: ${interval}, marketType: ${marketType}`);

    // Use charts endpoint for candlestick data
    const params = new URLSearchParams({
      interval: interval === '1min' ? '5min' : interval, // Backend uses 5min as minimum
      market_type: marketType, // Pass market type to backend
      include_volume: 'true'
    });

    console.log(`Candlestick API URL: ${this.baseUrl}/charts/candlestick/${symbol}?${params}`);

    try {
      const result = await this.request<CandlestickChartResponse>(
        `/charts/candlestick/${symbol}?${params}`,
        {},
        true
      );
      console.log('Candlestick chart data received successfully');
      console.log(`Market type: ${marketType}, Data points: ${result.candlestick_data?.length || 0}`);
      return result;
    } catch (error) {
      console.error('Error getting candlestick chart:', error);
      throw error;
    }
  }

  // Additional chart endpoints
  async getComparisonChart(
    symbols: string[],
    interval: string = 'daily',
    normalize: boolean = false,
    outputsize: string = 'compact'
  ): Promise<any> {
    const params = new URLSearchParams({
      symbols: symbols.join(','),
      interval: interval,
      normalize: normalize.toString(),
      outputsize: outputsize
    });
    return this.request<any>(`/charts/comparison?${params}`, {}, true);
  }

  async getMultiSymbolCharts(
    symbols: string[],
    interval: string = 'daily',
    includeIndicators: boolean = false
  ): Promise<any> {
    const params = new URLSearchParams({
      interval: interval,
      include_indicators: includeIndicators.toString()
    });
    return this.request<any>(`/charts/multi/${symbols.join(',')}?${params}`, {}, true);
  }

  // Signal endpoints
  async analyzeSignals(
    symbol: string,
    marketType: 'crypto' | 'stock',
    timeframe: string = '1D',
    days: number = 30
  ): Promise<SignalAnalysis> {
    const params = new URLSearchParams({
      asset_type: marketType,
      interval: timeframe === '1D' ? 'daily' : timeframe,
    });

    return this.request<SignalAnalysis>(
      `/analysis/symbol/${symbol}?${params}`,
      {},
      true
    );
  }

  // Additional analysis endpoints
  async bulkAnalysis(
    symbols: string[],
    assetType: 'crypto' | 'stock' = 'stock',
    interval: string = 'daily'
  ): Promise<any> {
    const requestBody = {
      symbols: symbols,
      asset_type: assetType,
      interval: interval
    };
    return this.request<any>('/analysis/bulk', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    }, true);
  }

  async analyzeWatchlist(
    interval: string = 'daily'
  ): Promise<any> {
    const params = new URLSearchParams({
      interval: interval
    });
    return this.request<any>(`/analysis/watchlist?${params}`, {}, true);
  }

  async marketScreener(
    conditions: any,
    assetType: 'crypto' | 'stock' = 'stock',
    limit: number = 50
  ): Promise<any> {
    const requestBody = {
      conditions: conditions,
      asset_type: assetType,
      limit: limit
    };
    return this.request<any>('/analysis/screener', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    }, true);
  }

  // Stock-specific endpoints
  async getStockPopular(): Promise<any> {
    return this.request<any>('/stocks/popular', {}, true);
  }

  async getStockCategories(): Promise<{ categories: any }> {
    return this.request<{ categories: any }>('/stocks/categories', {}, true);
  }

  async getStockTrending(): Promise<any> {
    return this.request<any>('/stocks/trending', {}, true);
  }

  // Crypto-specific endpoints
  async getCryptoPopular(): Promise<CryptoPopularResponse> {
    return this.request<CryptoPopularResponse>('/crypto/popular', {}, true);
  }

  async getCryptoCategories(): Promise<{ categories: any }> {
    return this.request<{ categories: any }>('/crypto/categories', {}, true);
  }

  async getCryptoExchangeRate(
    fromCurrency: string,
    toCurrency: string = 'USD'
  ): Promise<CryptoExchangeRate> {
    const params = new URLSearchParams({
      to_currency: toCurrency
    });
    return this.request<CryptoExchangeRate>(`/crypto/rate/${fromCurrency}?${params}`, {}, true);
  }

  async getCryptoMultipleRates(
    symbols: string[],
    toCurrency: string = 'USD'
  ): Promise<CryptoExchangeRate[]> {
    const params = new URLSearchParams({
      symbols: symbols.join(','),
      to_currency: toCurrency
    });
    return this.request<CryptoExchangeRate[]>(`/crypto/rates/multiple?${params}`, {}, true);
  }

  async getCryptoQuote(
    symbol: string,
    toCurrency: string = 'USD'
  ): Promise<CryptoQuote> {
    const params = new URLSearchParams({
      to_currency: toCurrency
    });
    return this.request<CryptoQuote>(`/crypto/quote/${symbol}?${params}`, {}, true);
  }

  async searchCrypto(query: string): Promise<CryptoSearchResponse> {
    const params = new URLSearchParams({
      query: query
    });
    return this.request<CryptoSearchResponse>(`/crypto/search?${params}`, {}, true);
  }

  async getCryptoTrending(): Promise<CryptoTrendingResponse> {
    return this.request<CryptoTrendingResponse>('/crypto/trending', {}, true);
  }

  // Additional crypto data endpoints
  async getCryptoDailyData(
    symbol: string,
    market: string = 'USD'
  ): Promise<any> {
    const params = new URLSearchParams({
      market: market
    });
    return this.request<any>(`/crypto/daily/${symbol}?${params}`, {}, true);
  }

  async getCryptoIntradayData(
    symbol: string,
    market: string = 'USD',
    interval: string = '5min'
  ): Promise<any> {
    const params = new URLSearchParams({
      market: market,
      interval: interval
    });
    return this.request<any>(`/crypto/intraday/${symbol}?${params}`, {}, true);
  }

  async getCryptoWeeklyData(
    symbol: string,
    market: string = 'USD'
  ): Promise<any> {
    const params = new URLSearchParams({
      market: market
    });
    return this.request<any>(`/crypto/weekly/${symbol}?${params}`, {}, true);
  }

  async getCryptoMonthlyData(
    symbol: string,
    market: string = 'USD'
  ): Promise<any> {
    const params = new URLSearchParams({
      market: market
    });
    return this.request<any>(`/crypto/monthly/${symbol}?${params}`, {}, true);
  }

  // Crypto Portfolio endpoints
  async getCryptoPortfolio(): Promise<CryptoPortfolioResponse> {
    return this.request<CryptoPortfolioResponse>('/crypto/portfolio', {}, true);
  }

  async addCryptoToPortfolio(data: CryptoPortfolioCreate): Promise<{ message: string; item: any }> {
    return this.request<{ message: string; item: any }>('/crypto/portfolio', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async updateCryptoInPortfolio(
    symbol: string,
    data: CryptoPortfolioUpdate
  ): Promise<{ message: string; item: any }> {
    return this.request<{ message: string; item: any }>(`/crypto/portfolio/${symbol}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async removeCryptoFromPortfolio(symbol: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/crypto/portfolio/${symbol}`, {
      method: 'DELETE',
    }, true);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.request<{ status: string; service: string }>('/health');
  }

  // Authentication methods
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    // Transform backend response to expected AuthResponse format
    return {
      access_token: response.access_token,
      refresh_token: response.refresh_token || '',
      token_type: response.token_type || 'bearer',
      expires_in: response.expires_in || 1800,
    };
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Backend register returns UserResponse, not tokens
    const userResponse = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        agreed_to_disclaimer: data.agreed_to_disclaimer,
        full_name: data.full_name || data.username,
      }),
    });

    // After registration, automatically login to get tokens
    const loginResponse = await this.login({
      email: data.email,
      password: data.password,
    });

    return loginResponse;
  }

  async loginWithGoogle(data: GoogleOAuthRequest): Promise<AuthResponse> {
    // Google OAuth not implemented in current backend
    throw new Error('Google OAuth not yet implemented');
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.request<any>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    return {
      access_token: response.access_token,
      refresh_token: response.refresh_token || refreshToken,
      token_type: response.token_type || 'bearer',
      expires_in: response.expires_in || 1800,
    };
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }, true);
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<any>('/auth/me', {}, true);

    // Transform backend user response to expected User format
    return {
      id: response.id,
      email: response.email,
      username: response.username,
      fullName: response.full_name || response.username,
      isEmailVerified: response.is_active || false,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
      // Profile fields
      full_name: response.full_name,
      timezone: response.timezone,
      preferred_currency: response.preferred_currency,
      email_notifications: response.email_notifications,
      push_notifications: response.push_notifications,
      is_oauth_user: response.is_oauth_user,
      agreed_to_disclaimer: response.agreed_to_disclaimer,
      disclaimer_agreed_at: response.disclaimer_agreed_at,
    };
  }

  async updateProfile(data: UserUpdateRequest): Promise<User> {
    const response = await this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);

    // Transform backend user response to expected User format
    return {
      id: response.id,
      email: response.email,
      username: response.username,
      fullName: response.full_name || response.username,
      isEmailVerified: response.is_active || false,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
      // Profile fields
      full_name: response.full_name,
      timezone: response.timezone,
      preferred_currency: response.preferred_currency,
      email_notifications: response.email_notifications,
      push_notifications: response.push_notifications,
      is_oauth_user: response.is_oauth_user,
      agreed_to_disclaimer: response.agreed_to_disclaimer,
      disclaimer_agreed_at: response.disclaimer_agreed_at,
    };
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: data.current_password,
        new_password: data.new_password,
      }),
    }, true);
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    // Password reset not implemented in current backend
    throw new Error('Password reset not yet implemented');
  }

  async resetPassword(data: PasswordResetConfirm): Promise<{ message: string }> {
    // Password reset not implemented in current backend
    throw new Error('Password reset not yet implemented');
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    // Email verification not implemented in current backend
    throw new Error('Email verification not yet implemented');
  }

  // Watchlist methods (authentication required) - using favorites endpoint
  async getWatchlist(): Promise<WatchlistResponse> {
    const favoritesResponse = await this.request<any>('/favorites/', {}, true);

    // Transform favorites response to watchlist format
    const watchlistItems = favoritesResponse.favorites?.map((fav: any) => ({
      id: fav.id,
      ticker_id: fav.id,
      symbol: fav.symbol,
      name: fav.symbol, // Backend doesn't provide name, use symbol
      market_type: fav.asset_type,
      exchange: fav.exchange || '',
      alert_enabled: false,
      alert_price_above: null,
      alert_price_below: null,
      created_at: fav.created_at,
    })) || [];

    return {
      items: watchlistItems,
      total: watchlistItems.length,
      device_id: 'mobile-app', // Default device ID for mobile app
    };
  }

  async addToWatchlist(data: WatchlistItemCreate): Promise<WatchlistItem> {
    // Map to favorites format
    const body = {
      symbol: data.symbol,
      asset_type: data.market_type, // map market_type to asset_type
      notes: '', // optional field
    };

    const favoriteResponse = await this.request<any>('/favorites/', {
      method: 'POST',
      body: JSON.stringify(body),
    }, true);

    // Transform favorite response to watchlist item format
    return {
      id: favoriteResponse.id,
      ticker_id: favoriteResponse.id,
      symbol: favoriteResponse.symbol,
      name: favoriteResponse.symbol,
      market_type: favoriteResponse.asset_type,
      exchange: favoriteResponse.exchange || '',
      alert_enabled: false,
      created_at: favoriteResponse.created_at,
    };
  }

  async removeFromWatchlist(itemId: number): Promise<{ message: string }> {
    // For favorites, we need symbol instead of ID
    throw new Error('Remove from watchlist requires symbol, not ID. Use removeFromWatchlistBySymbol instead.');
  }

  async removeFromWatchlistBySymbol(symbol: string, assetType: 'stock' | 'crypto'): Promise<{ message: string }> {
    const params = new URLSearchParams({ asset_type: assetType });
    return this.request<{ message: string }>(`/favorites/${symbol}?${params}`, {
      method: 'DELETE',
    }, true); // Authentication required
  }

  async updateWatchlistItem(itemId: number, data: Partial<WatchlistItemCreate>): Promise<WatchlistItem> {
    // Update not implemented in current backend
    throw new Error('Watchlist item update not yet implemented');
  }

  // Additional favorites/watchlist endpoints
  async checkIfFavorite(symbol: string, assetType: 'stock' | 'crypto'): Promise<{ is_favorite: boolean }> {
    const params = new URLSearchParams({ asset_type: assetType });
    return this.request<{ is_favorite: boolean }>(`/favorites/check/${symbol}?${params}`, {}, true);
  }

  async getFavoritesStats(): Promise<{ total_favorites: number; stock_favorites: number; crypto_favorites: number }> {
    return this.request<{ total_favorites: number; stock_favorites: number; crypto_favorites: number }>('/favorites/stats', {}, true);
  }

  async getFavoritesByType(assetType: 'stock' | 'crypto', includeQuotes: boolean = true): Promise<WatchlistResponse> {
    const params = new URLSearchParams({
      asset_type: assetType,
      include_quotes: includeQuotes.toString()
    });

    const favoritesResponse = await this.request<any>(`/favorites/?${params}`, {}, true);

    // Transform favorites response to watchlist format
    const watchlistItems = favoritesResponse.favorites?.map((fav: any) => ({
      id: fav.id,
      ticker_id: fav.id,
      symbol: fav.symbol,
      name: fav.name || fav.symbol,
      market_type: fav.asset_type,
      exchange: fav.exchange || '',
      alert_enabled: false,
      alert_price_above: null,
      alert_price_below: null,
      created_at: fav.created_at,
      // Include quote data if available
      current_price: fav.current_price || 0,
      price_change_24h: fav.price_change_24h || 0,
      price_change_percentage_24h: fav.price_change_percentage_24h || 0,
    })) || [];

    return {
      items: watchlistItems,
      total: watchlistItems.length,
      device_id: 'mobile-app', // Default device ID for mobile app
    };
  }

  // Notification methods
  async registerDeviceToken(tokenData: DeviceTokenCreate): Promise<DeviceToken> {
    return this.request<DeviceToken>('/notifications/device-tokens', {
      method: 'POST',
      body: JSON.stringify(tokenData),
    }, true);
  }

  async getDeviceTokens(): Promise<DeviceToken[]> {
    return this.request<DeviceToken[]>('/notifications/device-tokens', {}, true);
  }

  async deleteDeviceToken(tokenId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/device-tokens/${tokenId}`, {
      method: 'DELETE',
    }, true);
  }

  async getNotificationHistory(limit: number = 50, offset: number = 0): Promise<NotificationHistory[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.request<NotificationHistory[]>(`/notifications/history?${params}`, {}, true);
  }

  async getNotificationSummary(): Promise<NotificationSummary> {
    return this.request<NotificationSummary>('/notifications/summary', {}, true);
  }

  async markNotificationRead(notificationId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/mark-read/${notificationId}`, {
      method: 'POST',
    }, true);
  }

  async updateNotificationPreferences(favoriteId: number, preferences: Partial<NotificationPreferences>): Promise<WatchlistItem> {
    return this.request<WatchlistItem>(`/favorites/${favoriteId}/notifications`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }, true);
  }

  async testMarketAlert(symbol: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/test-alert/${symbol}`, {
      method: 'POST',
    }, true);
  }

  async getMonitoringStatus(): Promise<any> {
    return this.request<any>('/notifications/monitoring-status', {}, true);
  }

  async triggerMonitoring(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/notifications/trigger-monitoring', {
      method: 'POST',
    }, true);
  }
}

export { ApiService };
export const apiService = new ApiService();
