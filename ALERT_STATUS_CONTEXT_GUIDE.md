# StellarIQ Mobile - Alert Status Context Guide

## 🎉 Enhanced WatchlistContext with Alert Status Tracking

The WatchlistContext has been enhanced with comprehensive alert status tracking functionality. You can now easily check if watchlist items have alerts enabled and get detailed information about the types of alerts configured.

## ✅ New Context Functions

### 1. **hasAnyAlertsEnabled(symbol: string): boolean**
Checks if a watchlist item has any alerts enabled (market or price alerts).

```typescript
const { hasAnyAlertsEnabled } = useWatchlist();

// Check if AAPL has any alerts enabled
const hasAlerts = hasAnyAlertsEnabled('AAPL');
```

### 2. **hasMarketAlertsEnabled(symbol: string): boolean**
Checks if a watchlist item has market condition alerts enabled (overbought/oversold/neutral).

```typescript
const { hasMarketAlertsEnabled } = useWatchlist();

// Check if AAPL has market alerts enabled
const hasMarketAlerts = hasMarketAlertsEnabled('AAPL');
```

### 3. **hasPriceAlertsEnabled(symbol: string): boolean**
Checks if a watchlist item has price threshold alerts enabled.

```typescript
const { hasPriceAlertsEnabled } = useWatchlist();

// Check if AAPL has price alerts enabled
const hasPriceAlerts = hasPriceAlertsEnabled('AAPL');
```

### 4. **getWatchlistItem(symbol: string): WatchlistItem | undefined**
Gets the complete watchlist item for a symbol.

```typescript
const { getWatchlistItem } = useWatchlist();

// Get the full watchlist item for AAPL
const item = getWatchlistItem('AAPL');
if (item) {
  console.log('Current price:', item.current_price);
  console.log('Alert enabled:', item.alert_enabled);
}
```

### 5. **getAlertSummary(symbol: string): AlertSummary | null**
Gets a comprehensive summary of all alert settings for a symbol.

```typescript
const { getAlertSummary } = useWatchlist();

const summary = getAlertSummary('AAPL');
if (summary) {
  console.log('Has market alerts:', summary.hasMarketAlerts);
  console.log('Has price alerts:', summary.hasPriceAlerts);
  console.log('Market alert types:', summary.marketAlertTypes); // ['Overbought', 'Oversold']
  console.log('Price alert types:', summary.priceAlertTypes); // ['Above $200.00', 'Below $180.00']
}
```

### 6. **updateWatchlistItem(updatedItem: WatchlistItem): void**
Updates a watchlist item in the context state (useful after notification preferences are changed).

```typescript
const { updateWatchlistItem } = useWatchlist();

// Update item after notification preferences change
const handleNotificationUpdate = (updatedItem: WatchlistItem) => {
  updateWatchlistItem(updatedItem);
};
```

## 🚀 Usage Examples

### Example 1: Simple Alert Status Display
```typescript
import { useWatchlist } from '@/contexts/WatchlistContext';

function WatchlistItem({ symbol }: { symbol: string }) {
  const { hasAnyAlertsEnabled } = useWatchlist();
  
  return (
    <View>
      <Text>{symbol}</Text>
      <Ionicons
        name={hasAnyAlertsEnabled(symbol) ? 'notifications' : 'notifications-off'}
        color={hasAnyAlertsEnabled(symbol) ? 'blue' : 'gray'}
      />
    </View>
  );
}
```

### Example 2: Detailed Alert Information
```typescript
import { useWatchlist } from '@/contexts/WatchlistContext';

function DetailedAlertStatus({ symbol }: { symbol: string }) {
  const { getAlertSummary } = useWatchlist();
  const summary = getAlertSummary(symbol);
  
  if (!summary?.hasAnyAlerts) {
    return <Text>No alerts configured</Text>;
  }
  
  return (
    <View>
      <Text>Alerts Active:</Text>
      {summary.hasMarketAlerts && (
        <Text>Market: {summary.marketAlertTypes.join(', ')}</Text>
      )}
      {summary.hasPriceAlerts && (
        <Text>Price: {summary.priceAlertTypes.join(', ')}</Text>
      )}
    </View>
  );
}
```

### Example 3: Conditional UI Based on Alert Status
```typescript
import { useWatchlist } from '@/contexts/WatchlistContext';

function TickerDetailScreen({ symbol }: { symbol: string }) {
  const { isInWatchlist, hasAnyAlertsEnabled } = useWatchlist();
  
  const isWatched = isInWatchlist(symbol);
  const hasAlerts = hasAnyAlertsEnabled(symbol);
  
  return (
    <View>
      <Text>{symbol}</Text>
      
      {/* Show notification bell only for watched items */}
      {isWatched && (
        <TouchableOpacity onPress={openNotificationSettings}>
          <Ionicons
            name="notifications-outline"
            color={hasAlerts ? 'blue' : 'gray'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
```

## 📱 Components Updated

### 1. **WatchlistScreen**
- Now uses `hasAnyAlertsEnabled()` instead of checking individual fields
- More reliable alert status detection

### 2. **TickerDetailScreen**
- Uses `updateWatchlistItem()` for efficient state updates
- No longer needs to refresh entire watchlist when preferences change

### 3. **AlertStatusIndicator** (New Component)
- Reusable component for displaying alert status
- Shows detailed alert information
- Configurable size and detail level

## 🔧 Alert Summary Object

The `getAlertSummary()` function returns an object with this structure:

```typescript
interface AlertSummary {
  hasMarketAlerts: boolean;        // True if market alerts are enabled
  hasPriceAlerts: boolean;         // True if price alerts are enabled
  hasAnyAlerts: boolean;           // True if any alerts are enabled
  marketAlertTypes: string[];      // ['Overbought', 'Oversold', 'Neutral']
  priceAlertTypes: string[];       // ['Above $200.00', 'Below $180.00']
}
```

## 🎯 Benefits

### 1. **Performance**
- No need to refresh entire watchlist when updating preferences
- Efficient state updates with `updateWatchlistItem()`

### 2. **Reliability**
- Centralized alert status logic
- Consistent alert detection across the app

### 3. **Developer Experience**
- Simple, intuitive API
- Type-safe functions
- Comprehensive alert information

### 4. **User Experience**
- Real-time alert status updates
- Detailed alert information display
- Consistent UI behavior

## 🧪 Testing the New Functionality

```typescript
// Test in any component
import { useWatchlist } from '@/contexts/WatchlistContext';

function TestComponent() {
  const { 
    hasAnyAlertsEnabled, 
    hasMarketAlertsEnabled, 
    hasPriceAlertsEnabled, 
    getAlertSummary 
  } = useWatchlist();
  
  const testSymbol = 'AAPL';
  
  console.log('Has any alerts:', hasAnyAlertsEnabled(testSymbol));
  console.log('Has market alerts:', hasMarketAlertsEnabled(testSymbol));
  console.log('Has price alerts:', hasPriceAlertsEnabled(testSymbol));
  console.log('Alert summary:', getAlertSummary(testSymbol));
  
  return null;
}
```

## 🔄 Migration Guide

If you were previously checking alert status manually:

### Before:
```typescript
const hasAlerts = item.alert_enabled || item.price_alert_enabled;
```

### After:
```typescript
const { hasAnyAlertsEnabled } = useWatchlist();
const hasAlerts = hasAnyAlertsEnabled(item.symbol);
```

The new approach is more reliable and handles edge cases better!

## 🎉 Ready to Use!

The enhanced WatchlistContext is now available throughout your app. Use these functions to create rich, responsive UIs that accurately reflect the alert status of watchlist items.

All existing functionality remains unchanged - these are purely additive enhancements! 🚀
