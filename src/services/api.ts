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
      // console.log(`API Request: ${config.method || 'GET'} ${url}`);
      // console.log("config",config);
      const response = await fetch(url, config);

      // console.log(`API Response: ${response.status} ${response.statusText}`, response);

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
              refresh_token: refreshResponse.refresh_token,
              token_type: refreshResponse.token_type,
              expires_in: refreshResponse.expires_in,
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
      exchange: item.exchange,
      logo_url: item.logo_url,
      market_cap_rank: item.market_cap_rank,
    })) || [];

    return {
      query,
      results: searchResults,
      total: searchResults.length,
    };
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    // For now, return empty array as this endpoint doesn't exist in current backend
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

      // Transform to expected TickerDetail format
      return {
        ticker: {
          id: 0, // Not available from backend
          symbol: stockQuote.symbol || symbol,
          name: stockQuote.name || symbol,
          market_type: 'stock',
          exchange: stockQuote.exchange,
          current_price: stockQuote.price,
          price_change_24h: stockQuote.change,
          price_change_percentage_24h: stockQuote.change_percent,
          market_cap: stockQuote.market_cap,
          volume_24h: stockQuote.volume,
          description: stockQuote.description || `${symbol} stock information`,
          logo_url: stockQuote.logo_url,
          website_url: stockQuote.website_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_data_update: stockQuote.last_updated,
        },
        quote: {
          symbol: stockQuote.symbol || symbol,
          current_price: stockQuote.price,
          price_change_24h: stockQuote.change,
          price_change_percentage_24h: stockQuote.change_percent,
          volume_24h: stockQuote.volume,
          market_cap: stockQuote.market_cap,
          high_24h: stockQuote.high,
          low_24h: stockQuote.low,
          last_updated: stockQuote.last_updated,
        },
        signals: {
          overall_signal: 'neutral',
          confidence: 0.5,
          rsi_signal: 'neutral',
          macd_signal: 'neutral',
          stochastic_signal: 'neutral',
          bb_signal: 'neutral',
          recommendation: 'Hold',
          analysis_timestamp: new Date().toISOString(),
        },
        technical_indicators: {
          rsi_value: 50,
          rsi_signal: 'neutral',
          stochastic_k: 50,
          stochastic_d: 50,
          stochastic_signal: 'neutral',
          bb_upper: 0,
          bb_middle: 0,
          bb_lower: 0,
          bb_signal: 'neutral',
          macd_line: 0,
          macd_signal_line: 0,
          macd_histogram: 0,
          macd_signal: 'neutral',
        }
      };
    } else {
      // For crypto, use crypto endpoints
      const quote = await this.getCryptoQuote(symbol);
      return {
        ticker: {
          id: 0,
          symbol: symbol,
          name: quote.name,
          market_type: 'crypto',
          current_price: quote.price,
          price_change_24h: quote.change_24h,
          price_change_percentage_24h: quote.change_percent_24h,
          volume_24h: quote.volume_24h,
          market_cap: quote.market_cap,
          created_at: new Date().toISOString(),
          updated_at: quote.last_updated,
        },
        quote: {
          symbol: quote.symbol,
          current_price: quote.price,
          price_change_24h: quote.change_24h,
          price_change_percentage_24h: quote.change_percent_24h,
          volume_24h: quote.volume_24h,
          market_cap: quote.market_cap,
          last_updated: quote.last_updated,
        },
        technical_indicators: {
          rsi_value: 50,
          rsi_signal: 'neutral',
          stochastic_k: 50,
          stochastic_d: 50,
          stochastic_signal: 'neutral',
          bb_upper: 0,
          bb_middle: 0,
          bb_lower: 0,
          bb_signal: 'neutral',
          macd_line: 0,
          macd_signal_line: 0,
          macd_histogram: 0,
          macd_signal: 'neutral',
        }
      };
    }
  }

  async getTickerQuote(
    symbol: string,
    marketType: 'crypto' | 'stock'
  ): Promise<Quote> {
    if (marketType === 'stock') {
      return this.request<Quote>(`/stocks/quote/${symbol}`, {}, true);
    } else {
      // For crypto, use crypto quote endpoint
      const cryptoQuote = await this.getCryptoQuote(symbol);
      return {
        symbol: cryptoQuote.symbol,
        current_price: cryptoQuote.price,
        price_change_24h: cryptoQuote.change_24h,
        price_change_percentage_24h: cryptoQuote.change_percent_24h,
        volume_24h: cryptoQuote.volume_24h,
        market_cap: cryptoQuote.market_cap,
        last_updated: cryptoQuote.last_updated,
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
    // Map timeframe to backend format
    const interval = timeframe === '1min' ? 'daily' : timeframe;

    // Get comprehensive technical analysis
    return this.request<TechnicalIndicatorHistoryResponse>(
      `/indicators/analysis/${symbol}?interval=${interval}`,
      {},
      true // require auth
    );
  }

  async getCandlestickChart(
    symbol: string,
    marketType: 'crypto' | 'stock',
    interval: string = '1min',
    hours: number = 24
  ): Promise<CandlestickChartResponse> {
    // Use charts endpoint for candlestick data
    const params = new URLSearchParams({
      interval: interval === '1min' ? '5min' : interval, // Backend uses 5min as minimum
      include_volume: 'true'
    });

    return this.request<CandlestickChartResponse>(
      `/charts/candlestick/${symbol}?${params}`,
      {},
      true
    );
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
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async loginWithGoogle(data: GoogleOAuthRequest): Promise<AuthResponse> {
    // Google OAuth not implemented in current backend
    throw new Error('Google OAuth not yet implemented');
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }, true);
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me', {}, true);
  }

  async updateProfile(data: UserUpdateRequest): Promise<User> {
    // Profile update not implemented in current backend
    throw new Error('Profile update not yet implemented');
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    // Password change not implemented in current backend
    throw new Error('Password change not yet implemented');
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password-reset-request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: PasswordResetConfirm): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/password-reset-confirm', {
      method: 'POST',
      body: JSON.stringify({ token: data.token, new_password: data.new_password }),
    });
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
      alert_price_above: null,
      alert_price_below: null,
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
}

export { ApiService };
export const apiService = new ApiService();
