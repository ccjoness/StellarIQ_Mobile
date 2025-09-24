/**
 * Watchlist context for managing favorites
 */

import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';
import { WatchlistItem, WatchlistItemCreate } from '../types';
import { TokenStorage } from '../services/tokenStorage';

// State interface
interface WatchlistState {
  items: WatchlistItem[];
  isLoading: boolean;
  error: string | null;
}

// Context interface
interface WatchlistContextType extends WatchlistState {
  addToWatchlist: (symbol: string, marketType: 'stock' | 'crypto') => Promise<void>;
  removeFromWatchlist: (symbol: string) => Promise<void>;
  isInWatchlist: (symbol: string) => boolean;
  refreshWatchlist: () => Promise<void>;
  clearError: () => void;
  updateWatchlistItem: (updatedItem: WatchlistItem) => void;
  // Alert status helpers
  hasAnyAlertsEnabled: (symbol: string) => boolean;
  hasMarketAlertsEnabled: (symbol: string) => boolean;
  hasPriceAlertsEnabled: (symbol: string) => boolean;
  getWatchlistItem: (symbol: string) => WatchlistItem | undefined;
  getAlertSummary: (symbol: string) => {
    hasMarketAlerts: boolean;
    hasPriceAlerts: boolean;
    hasAnyAlerts: boolean;
    marketAlertTypes: string[];
    priceAlertTypes: string[];
  } | null;
}

// Initial state
const initialState: WatchlistState = {
  items: [],
  isLoading: false,
  error: null,
};

// Action types
type WatchlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: WatchlistItem[] }
  | { type: 'ADD_ITEM'; payload: WatchlistItem }
  | { type: 'REMOVE_ITEM'; payload: string } // symbol
  | { type: 'UPDATE_ITEM'; payload: WatchlistItem }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Reducer
function watchlistReducer(state: WatchlistState, action: WatchlistAction): WatchlistState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, isLoading: false };
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
        isLoading: false,
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.symbol !== action.payload),
        isLoading: false,
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.symbol === action.payload.symbol ? action.payload : item
        ),
        isLoading: false,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Create context
const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

// Provider component
interface WatchlistProviderProps {
  children: ReactNode;
}

export function WatchlistProvider({ children }: WatchlistProviderProps) {
  const [state, dispatch] = useReducer(watchlistReducer, initialState);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Load watchlist only for authenticated users
  useEffect(() => {
    // Only initialize if auth loading is complete and user is authenticated
    if (!authLoading && isAuthenticated) {
      // Add a small delay to ensure token is stored
      const timer = setTimeout(() => {
        initializeWatchlist();
      }, 100);
      return () => clearTimeout(timer);
    } else if (!authLoading && !isAuthenticated) {
      // Clear watchlist for non-authenticated users
      dispatch({ type: 'SET_ITEMS', payload: [] });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
    // Return undefined for other cases
    return undefined;
  }, [isAuthenticated, authLoading]);

  const initializeWatchlist = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Ensure we have a valid token before making API calls
      const token = await TokenStorage.getAccessToken();
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      // Load watchlist for authenticated users only
      await loadWatchlist();
    } catch (error) {
      console.error('Error initializing watchlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize watchlist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadWatchlist = async () => {
    try {
      // Authentication required
      const response = await apiService.getWatchlist();
      dispatch({ type: 'SET_ITEMS', payload: response.items });
    } catch (error) {
      console.error('Error loading watchlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load watchlist' });
    }
  };

  const addToWatchlist = async (symbol: string, marketType: 'stock' | 'crypto') => {
    try {
      // Require authentication
      if (!isAuthenticated) {
        dispatch({ type: 'SET_ERROR', payload: 'Authentication required' });
        return;
      }

      // Ensure we have a valid token
      const token = await TokenStorage.getAccessToken();
      if (!token) {
        dispatch({ type: 'SET_ERROR', payload: 'Authentication token not available' });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Check if already in watchlist
      if (isInWatchlist(symbol)) {
        dispatch({ type: 'SET_ERROR', payload: 'Item already in watchlist' });
        return;
      }

      const watchlistData: WatchlistItemCreate = {
        symbol,
        market_type: marketType,
        alert_enabled: false,
      };

      const newItem = await apiService.addToWatchlist(watchlistData);

      dispatch({ type: 'ADD_ITEM', payload: newItem });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to watchlist';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      // Require authentication
      if (!isAuthenticated) {
        dispatch({ type: 'SET_ERROR', payload: 'Authentication required' });
        return;
      }

      // Ensure we have a valid token
      const token = await TokenStorage.getAccessToken();
      if (!token) {
        dispatch({ type: 'SET_ERROR', payload: 'Authentication token not available' });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Find the item to remove
      const item = state.items.find(item => item.symbol === symbol);
      if (!item) {
        dispatch({ type: 'SET_ERROR', payload: 'Item not found in watchlist' });
        return;
      }

      await apiService.removeFromWatchlist(item.id);
      dispatch({ type: 'REMOVE_ITEM', payload: symbol });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove from watchlist';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const isInWatchlist = (symbol: string): boolean => {
    return state.items.some(item => item.symbol === symbol);
  };

  const refreshWatchlist = async () => {
    if (isAuthenticated) {
      const token = await TokenStorage.getAccessToken();
      if (token) {
        await loadWatchlist();
      }
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateWatchlistItem = (updatedItem: WatchlistItem) => {
    dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });
  };

  // Alert status helper functions
  const getWatchlistItem = (symbol: string): WatchlistItem | undefined => {
    return state.items.find(item => item.symbol === symbol);
  };

  const hasMarketAlertsEnabled = (symbol: string): boolean => {
    const item = getWatchlistItem(symbol);
    if (!item) return false;

    return item.alert_enabled && (
      item.alert_on_overbought === true ||
      item.alert_on_oversold === true ||
      item.alert_on_neutral === true
    );
  };

  const hasPriceAlertsEnabled = (symbol: string): boolean => {
    const item = getWatchlistItem(symbol);
    if (!item) return false;

    return item.price_alert_enabled === true && (
      (item.alert_price_above !== undefined && item.alert_price_above > 0) ||
      (item.alert_price_below !== undefined && item.alert_price_below > 0)
    );
  };

  const hasAnyAlertsEnabled = (symbol: string): boolean => {
    return hasMarketAlertsEnabled(symbol) || hasPriceAlertsEnabled(symbol);
  };

  const getAlertSummary = (symbol: string) => {
    const item = getWatchlistItem(symbol);
    if (!item) return null;

    const hasMarketAlerts = hasMarketAlertsEnabled(symbol);
    const hasPriceAlerts = hasPriceAlertsEnabled(symbol);
    const hasAnyAlerts = hasMarketAlerts || hasPriceAlerts;

    // Build market alert types array
    const marketAlertTypes: string[] = [];
    if (item.alert_enabled) {
      if (item.alert_on_overbought) marketAlertTypes.push('Overbought');
      if (item.alert_on_oversold) marketAlertTypes.push('Oversold');
      if (item.alert_on_neutral) marketAlertTypes.push('Neutral');
    }

    // Build price alert types array
    const priceAlertTypes: string[] = [];
    if (item.price_alert_enabled) {
      if (item.alert_price_above && item.alert_price_above > 0) {
        priceAlertTypes.push(`Above $${item.alert_price_above.toFixed(2)}`);
      }
      if (item.alert_price_below && item.alert_price_below > 0) {
        priceAlertTypes.push(`Below $${item.alert_price_below.toFixed(2)}`);
      }
    }

    return {
      hasMarketAlerts,
      hasPriceAlerts,
      hasAnyAlerts,
      marketAlertTypes,
      priceAlertTypes,
    };
  };

  const value: WatchlistContextType = {
    ...state,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refreshWatchlist,
    clearError,
    updateWatchlistItem,
    // Alert status helpers
    hasAnyAlertsEnabled,
    hasMarketAlertsEnabled,
    hasPriceAlertsEnabled,
    getWatchlistItem,
    getAlertSummary,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

// Hook to use watchlist context
export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
