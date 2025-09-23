/**
 * TypeScript type definitions for StellarIQ
 */

// Market data types
export interface Ticker {
  id: number;
  symbol: string;
  name: string;
  market_type: 'crypto' | 'stock';
  exchange?: string;
  current_price?: number;
  price_change_24h?: number;
  price_change_percentage_24h?: number;
  market_cap?: number;
  volume_24h?: number;
  description?: string;
  logo_url?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
  last_data_update?: string;
}

export interface Quote {
  symbol: string;
  current_price?: number;
  price_change_24h?: number;
  price_change_percentage_24h?: number;
  volume_24h?: number;
  market_cap?: number;
  high_24h?: number;
  low_24h?: number;
  last_updated?: string;
}

export interface PriceDataPoint {
  timestamp: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  volume?: number;
}

export interface HistoricalDataResponse {
  symbol: string;
  market_type: string;
  timeframe: string;
  data: PriceDataPoint[];
}

// Candlestick chart types
export interface CandlestickDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandlestickChartResponse {
  symbol: string;
  interval: string;
  last_refreshed: string;
  time_zone: string;
  candlestick_data: CandlestickDataPoint[];
  indicators?: any;
  metadata: any;
}

// Search types
export interface SearchResult {
  symbol: string;
  name: string;
  market_type: 'crypto' | 'stock';
  exchange?: string;
  logo_url?: string;
  market_cap_rank?: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}

// Crypto-specific types
export interface CryptoExchangeRate {
  from_currency_code: string;
  from_currency_name: string;
  to_currency_code: string;
  to_currency_name: string;
  exchange_rate: number;
  last_refreshed: string;
  time_zone: string;
  bid_price?: number;
  ask_price?: number;
}

export interface CryptoQuote {
  symbol: string;
  name: string;
  price: number;
  change_24h?: number;
  change_percent_24h?: number;
  volume_24h?: number;
  market_cap?: number;
  last_updated: string;
}

export interface CryptoSearchResult {
  symbol: string;
  name: string;
  market_type: string;
  exchange?: string;
}

export interface CryptoSearchResponse {
  results: CryptoSearchResult[];
  total_count: number;
}

export interface CryptoOverview {
  symbol: string;
  name: string;
  current_price: number;
  change_24h?: number;
  change_percent_24h?: number;
  volume_24h?: number;
  market_cap?: number;
  last_updated: string;
}

export interface CryptoTrendingResponse {
  trending: CryptoOverview[];
  gainers: CryptoOverview[];
  losers: CryptoOverview[];
}

export interface CryptoCategories {
  major: string[];
  defi: string[];
  gaming: string[];
  layer1: string[];
  meme: string[];
  privacy: string[];
}

export interface CryptoPopularResponse {
  popular_cryptos: string[];
  categories: CryptoCategories;
  description: string;
}

// Crypto Portfolio types
export interface CryptoPortfolioItem {
  symbol: string;
  name: string;
  amount: number;
  average_buy_price: number;
  current_price: number;
  total_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
}

export interface CryptoPortfolioResponse {
  portfolio: CryptoPortfolioItem[];
  total_value: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
}

export interface CryptoPortfolioCreate {
  symbol: string;
  amount: number;
  average_buy_price: number;
}

export interface CryptoPortfolioUpdate {
  amount?: number;
  average_buy_price?: number;
}

// Technical Indicator Response Types
export interface RSIData {
  timestamp: string;
  rsi: number;
}

export interface RSIResponse {
  symbol: string;
  interval: string;
  time_period: number;
  series_type: string;
  last_refreshed: string;
  data: RSIData[];
  current_condition: 'oversold' | 'overbought' | 'neutral';
  analysis: string;
}

export interface MACDData {
  timestamp: string;
  macd: number;
  macd_hist: number;
  macd_signal: number;
}

export interface MACDResponse {
  symbol: string;
  interval: string;
  series_type: string;
  last_refreshed: string;
  data: MACDData[];
  current_condition: 'oversold' | 'overbought' | 'neutral';
  analysis: string;
}

export interface StochData {
  timestamp: string;
  slowk: number;
  slowd: number;
}

export interface StochResponse {
  symbol: string;
  interval: string;
  last_refreshed: string;
  data: StochData[];
  current_condition: 'oversold' | 'overbought' | 'neutral';
  analysis: string;
}

// Market condition types
export type MarketCondition = 'oversold' | 'overbought' | 'neutral';

// Technical Analysis Summary
export interface TechnicalAnalysisSummary {
  symbol: string;
  rsi_condition?: MarketCondition;
  macd_condition?: MarketCondition;
  stoch_condition?: MarketCondition;
  bbands_condition?: MarketCondition;
  overall_condition: MarketCondition;
  confidence_score: number; // 0-1 scale
  recommendation: string;
}

export interface BollingerBandsData {
  timestamp: string;
  real_upper_band: number;
  real_middle_band: number;
  real_lower_band: number;
}

export interface BollingerBandsResponse {
  symbol: string;
  interval: string;
  time_period: number;
  series_type: string;
  last_refreshed: string;
  data: BollingerBandsData[];
  current_condition: 'oversold' | 'overbought' | 'neutral';
  analysis: string;
}

// Analysis Types
export interface BulkAnalysisRequest {
  symbols: string[];
  asset_type: 'crypto' | 'stock';
  interval: string;
}

export interface BulkAnalysisResponse {
  results: SignalAnalysis[];
  total_analyzed: number;
  timestamp: string;
}

export interface MarketScreenerRequest {
  conditions: any;
  asset_type: 'crypto' | 'stock';
  limit: number;
}

export interface ScreenerResult {
  symbol: string;
  name: string;
  current_price: number;
  analysis: SignalAnalysis;
}

export interface MarketScreenerResponse {
  results: ScreenerResult[];
  total_matches: number;
  conditions: any;
  timestamp: string;
}

// Signal types
export interface TechnicalIndicators {
  rsi_value?: number;
  rsi_signal?: 'oversold' | 'overbought' | 'neutral';
  stochastic_k?: number;
  stochastic_d?: number;
  stochastic_signal?: 'oversold' | 'overbought' | 'neutral';
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  bb_signal?: 'oversold' | 'overbought' | 'neutral';
  macd_line?: number;
  macd_signal_line?: number;
  macd_histogram?: number;
  macd_signal?: 'oversold' | 'overbought' | 'neutral';
}

export interface Signals {
  overall_signal: 'oversold' | 'overbought' | 'neutral';
  confidence: number;
  rsi_signal: 'oversold' | 'overbought' | 'neutral';
  macd_signal: 'oversold' | 'overbought' | 'neutral';
  stochastic_signal: 'oversold' | 'overbought' | 'neutral';
  bb_signal: 'oversold' | 'overbought' | 'neutral';
  recommendation: string;
  analysis_timestamp: string;
}

export interface SignalAnalysis {
  signals?: Signals;
  technical_indicators?: TechnicalIndicators;
  symbol?: string;
  asset_type?: 'crypto' | 'stock';
  interval?: string;
  analysis_timestamp?: string;
}

export interface Signal {
  id: number;
  ticker_id: number;
  timeframe: string;
  signal_type: 'oversold' | 'overbought' | 'neutral';
  confidence: number;
  price_at_signal: number;
  volume_at_signal?: number;
  explanation?: string;
  signal_time: string;
  created_at: string;
  rsi_value?: number;
  rsi_signal?: string;
  stochastic_k?: number;
  stochastic_d?: number;
  stochastic_signal?: string;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  bb_signal?: string;
  macd_line?: number;
  macd_signal_line?: number;
  macd_histogram?: number;
  macd_signal?: string;
}

// Technical Indicator History types
export interface TechnicalIndicatorDataPoint {
  timestamp: string;
  rsi?: number;
  stochastic_k?: number;
  stochastic_d?: number;
  macd_line?: number;
  macd_signal_line?: number;
  macd_histogram?: number;
  price: number;
}

export interface TechnicalIndicatorHistoryResponse {
  symbol: string;
  market_type: string;
  timeframe: string;
  data: TechnicalIndicatorDataPoint[];
}

// Watchlist types
export interface WatchlistItem {
  id: number;
  device_id?: string;
  user_id?: number;
  ticker_id: number;
  symbol: string;
  name: string;
  market_type: 'stock' | 'crypto';
  exchange?: string;
  alert_enabled: boolean;
  alert_on_oversold?: boolean;
  alert_on_overbought?: boolean;
  alert_on_neutral?: boolean;
  last_alert_state?: string;
  last_alert_sent?: string;
  created_at: string;
  updated_at?: string;
}

export interface WatchlistItemCreate {
  symbol: string;
  market_type: 'stock' | 'crypto';
  device_id?: string;
  alert_enabled?: boolean;
  alert_on_oversold?: boolean;
  alert_on_overbought?: boolean;
  alert_on_neutral?: boolean;
}

export interface WatchlistResponse {
  device_id: string;
  items: WatchlistItem[];
  total: number;
}

// Ticker detail response
export interface TickerDetail {
  ticker: Ticker;
  quote: Quote;
  signals?: Signals;
  technical_indicators?: TechnicalIndicators;
  latest_signal?: Signal;
  signal_analysis?: SignalAnalysis;
}

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  TickerDetail: {
    symbol: string;
    market_type: 'crypto' | 'stock';
  };
  CryptoPortfolio: undefined;
  CryptoCategories: undefined;
  CryptoTrending: undefined;
  StockCategories: undefined;
  StockTrending: undefined;
  Debug: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: {
    token?: string;
  };
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Profile: undefined;
  CryptoTrending: undefined;
};

// Theme types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
    };
    h3: {
      fontSize: number;
      fontWeight: string;
    };
    body: {
      fontSize: number;
      fontWeight: string;
    };
    caption: {
      fontSize: number;
      fontWeight: string;
    };
  };
}

// API Error types
export interface ApiError {
  error: string;
  detail?: string;
  code?: string;
}

// Chart data types
export interface ChartDataPoint {
  x: number | Date;
  y: number;
  label?: string;
}

export interface ChartData {
  data: ChartDataPoint[];
  domain?: {
    x?: [number, number];
    y?: [number, number];
  };
}

// Notification types
export interface NotificationData {
  title: string;
  body: string;
  data?: {
    symbol?: string;
    market_type?: string;
    signal_type?: string;
  };
}

export interface DeviceToken {
  id: number;
  token: string;
  device_type: 'ios' | 'android' | 'web';
  device_id?: string;
  device_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_used_at?: string;
}

export interface DeviceTokenCreate {
  token: string;
  device_type: 'ios' | 'android' | 'web';
  device_id?: string;
  device_name?: string;
}

export interface NotificationHistory {
  id: number;
  title: string;
  body: string;
  notification_type: 'market_alert' | 'price_alert' | 'system';
  channel: 'push' | 'email' | 'sms';
  symbol?: string;
  market_condition?: string;
  confidence_score?: string;
  status: 'pending' | 'sent' | 'failed' | 'read';
  sent_at?: string;
  read_at?: string;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

export interface NotificationSummary {
  total_notifications: number;
  unread_notifications: number;
  recent_notifications: NotificationHistory[];
}

export interface NotificationPreferences {
  alert_enabled: boolean;
  alert_on_overbought: boolean;
  alert_on_oversold: boolean;
  alert_on_neutral: boolean;
}
