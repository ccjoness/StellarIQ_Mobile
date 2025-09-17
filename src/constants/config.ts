/**
 * App configuration constants
 */

import Constants from 'expo-constants';

// API Configuration
const getApiUrl = () => {
  // Use the configured URL from app.json
  const configuredUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configuredUrl) {
    return configuredUrl;
  }

  // Fallback URLs based on platform
  if (__DEV__) {
    // In development, try to use the dev server URL
    const devUrl = Constants.expoConfig?.hostUri;
    if (devUrl) {
      const host = devUrl.split(':')[0];
      return `http://${host}:8000`;
    }
  }

  // Final fallback
  return 'http://localhost:8000';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Cache Configuration
export const CACHE_CONFIG = {
  QUOTES_TTL: 30 * 1000, // 30 seconds
  SEARCH_TTL: 5 * 60 * 1000, // 5 minutes
  HISTORICAL_TTL: 60 * 60 * 1000, // 1 hour
  SIGNALS_TTL: 5 * 60 * 1000, // 5 minutes
};

// Chart Configuration
export const CHART_CONFIG = {
  DEFAULT_TIMEFRAME: '1min' as const,
  DEFAULT_HOURS: 24,
  DEFAULT_DAYS: 30,
  ANIMATION_DURATION: 300,
  GRID_LINES: 5,
  POINT_RADIUS: 3,
  CANDLESTICK_WIDTH: 8, // Width per candlestick for 1min data
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  CHANNEL_ID: 'stellariq-alerts',
  CHANNEL_NAME: 'StellarIQ Alerts',
  CHANNEL_DESCRIPTION: 'Trading signal alerts and market notifications',
  SOUND: 'default',
  VIBRATE: true,
};

// Watchlist Configuration
export const WATCHLIST_CONFIG = {
  MAX_ITEMS: 50,
  DEFAULT_ALERTS: {
    enable_alerts: true,
    alert_on_oversold: true,
    alert_on_overbought: true,
    alert_on_neutral: false,
  },
};

// Search Configuration
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 1,
  MAX_QUERY_LENGTH: 50,
  DEBOUNCE_DELAY: 300,
  MAX_RESULTS: 20,
  MAX_SUGGESTIONS: 10,
};

// Signal Configuration
export const SIGNAL_CONFIG = {
  CONFIDENCE_THRESHOLD: 0.6,
  TIMEFRAMES: ['1D', '1W', '1M'] as const,
  SIGNAL_TYPES: ['oversold', 'overbought', 'neutral'] as const,
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
};

// Candlestick Chart Configuration
export const CANDLESTICK_CONFIG = {
  DEFAULT_INTERVAL: '1min' as const,
  DEFAULT_HOURS: 24,
  TIMEFRAME_OPTIONS: [
    { label: '1H', hours: 1, interval: '1min' },
    { label: '4H', hours: 4, interval: '1min' },
    { label: '12H', hours: 12, interval: '1min' },
    { label: '24H', hours: 24, interval: '1min' },
  ] as const,
  CHART_WIDTH_PER_CANDLE: 8,
  REFRESH_INTERVAL: 60 * 1000, // 1 minute for 1min data
};

// Technical Indicators Configuration
export const TECHNICAL_INDICATORS_CONFIG = {
  DEFAULT_TIMEFRAME: '1min' as const, // Backend now supports 1min intervals
  DEFAULT_HOURS: 24,
  REFRESH_INTERVAL: 1 * 60 * 1000, // 1 minute refresh
};

// Storage Keys
export const STORAGE_KEYS = {
  DEVICE_ID: 'stellariq_device_id',
  THEME_MODE: 'stellariq_theme_mode',
  WATCHLIST_CACHE: 'stellariq_watchlist_cache',
  NOTIFICATION_TOKEN: 'stellariq_notification_token',
  USER_PREFERENCES: 'stellariq_user_preferences',
};

// App Information
export const APP_INFO = {
  NAME: 'StellarIQ',
  VERSION: Constants.expoConfig?.version || '1.0.0',
  BUILD_NUMBER: Constants.expoConfig?.ios?.buildNumber || '1',
  BUNDLE_ID: Constants.expoConfig?.ios?.bundleIdentifier || 'com.stellariq.app',
};

// Feature Flags
export const FEATURES = {
  PUSH_NOTIFICATIONS: true,
  DARK_MODE: true,
  OFFLINE_MODE: false,
  ANALYTICS: false,
  CRASH_REPORTING: false,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  API_ERROR: 'Unable to fetch data. Please try again later.',
  SEARCH_ERROR: 'Search failed. Please try again.',
  WATCHLIST_ERROR: 'Unable to update watchlist. Please try again.',
  NOTIFICATION_ERROR: 'Unable to setup notifications.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  WATCHLIST_ADDED: 'Added to watchlist',
  WATCHLIST_REMOVED: 'Removed from watchlist',
  WATCHLIST_UPDATED: 'Watchlist updated',
  NOTIFICATIONS_ENABLED: 'Notifications enabled',
  NOTIFICATIONS_DISABLED: 'Notifications disabled',
};

// Validation Rules
export const VALIDATION = {
  SYMBOL_PATTERN: /^[A-Z0-9]{1,10}$/,
  MIN_CONFIDENCE: 0,
  MAX_CONFIDENCE: 1,
  MIN_PRICE: 0,
  MAX_PRICE: Number.MAX_SAFE_INTEGER,
};

// Default Values
export const DEFAULTS = {
  CURRENCY: 'USD',
  LOCALE: 'en-US',
  TIMEZONE: 'UTC',
  DECIMAL_PLACES: 2,
  PERCENTAGE_PLACES: 2,
};
