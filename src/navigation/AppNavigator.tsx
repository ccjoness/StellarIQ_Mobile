/**
 * Main app navigation structure
 */

import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Ionicons} from '@expo/vector-icons';

import {TabParamList, RootStackParamList} from '@/types';
import {useTheme} from '@/hooks/useTheme';
import {useAuth} from '@/contexts/AuthContext';
import {Logo} from '@/components/Logo';

// Import screens
import HomeScreen from '@/screens/HomeScreen';
import SearchScreen from '@/screens/SearchScreen';
import WatchlistScreen from '@/screens/WatchlistScreen';
import TickerDetailScreen from '@/screens/TickerDetailScreen';

// Import crypto screens
import CryptoPortfolioScreen from '@/screens/CryptoPortfolioScreen';
import CryptoCategoriesScreen from '@/screens/CryptoCategoriesScreen';
import CryptoTrendingScreen from '@/screens/CryptoTrendingScreen';

// Import auth screens
import {LoginScreen} from '@/screens/auth/LoginScreen';
import {RegisterScreen} from '@/screens/auth/RegisterScreen';
import {ProfileScreen} from '@/screens/auth/ProfileScreen';
import {ForgotPasswordScreen} from '@/screens/auth/ForgotPasswordScreen';
import {ResetPasswordScreen} from '@/screens/auth/ResetPasswordScreen';

// Import debug screen
import DebugScreen from '@/screens/DebugScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Header logo component
function HeaderLogo() {
    return <Logo size={32} style={{marginRight: 8}}/>;
}

function TabNavigator() {
    const {theme} = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                tabBarIcon: ({focused, color, size}) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Search') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Watchlist') {
                        iconName = focused ? 'bookmark' : 'bookmark-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else {
                        iconName = 'help-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color}/>;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                },
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontWeight: '600'
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Home',
                    headerTitleAlign: 'center',
                    headerLeft: () => <View/>,
                    headerRight: () => <HeaderLogo/>,
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    title: 'Search',
                    headerTitleAlign: 'center',
                    headerLeft: () => <View/>,
                    headerRight: () => <HeaderLogo/>,
                }}
            />
            <Tab.Screen
                name="Watchlist"
                component={WatchlistScreen}
                options={{
                    title: 'Watchlist',
                    headerTitleAlign: 'center',
                    headerLeft: () => <View/>,
                    headerRight: () => <HeaderLogo/>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    headerTitleAlign: 'center',
                    headerLeft: () => <View/>,
                    headerRight: () => <HeaderLogo/>,
                }}
            />
        </Tab.Navigator>
    );
}

// Loading component
function LoadingScreen() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6"/>
        </View>
    );
}

// Auth Navigator for login/register screens
function AuthNavigator() {
    const {theme} = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontWeight: '600',
                },
            }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{
                    title: 'Reset Password',
                    headerTitleAlign: 'center',
                    headerRight: () => <HeaderLogo/>,
                    headerBackTitle: 'Back',
                }}
            />
            <Stack.Screen
                name="ResetPassword"
                component={ResetPasswordScreen}
                options={{
                    title: 'Reset Password',
                    headerTitleAlign: 'center',
                    headerRight: () => <HeaderLogo/>,
                    headerBackTitle: 'Back',
                }}
            />
        </Stack.Navigator>
    );
}

// Main App Navigator
export function AppNavigator() {
    const {theme} = useTheme();
    const {isAuthenticated, isLoading} = useAuth();

    // Show loading screen while checking authentication
    if (isLoading) {
        return <LoadingScreen/>;
    }

    // Show auth screens if not authenticated
    if (!isAuthenticated) {
        return <AuthNavigator/>;
    }

    // Show main app if authenticated
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontWeight: '600',
                },
                headerBackVisible: true,
            }}
        >
            <Stack.Screen
                name="MainTabs"
                component={TabNavigator}
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="TickerDetail"
                component={TickerDetailScreen}
                options={({route}) => ({
                    title: (route.params as any)?.symbol || 'Ticker Detail',
                    headerTitleAlign: 'center',
                    headerRight: () => <HeaderLogo/>,
                    headerBackTitle: 'Back',
                })}
            />
            <Stack.Screen
                name="CryptoPortfolio"
                component={CryptoPortfolioScreen}
                options={{
                    title: 'Crypto Portfolio',
                    headerTitleAlign: 'center',
                    headerRight: () => <HeaderLogo/>,
                    headerBackTitle: 'Back',
                }}
            />
            <Stack.Screen
                name="CryptoCategories"
                component={CryptoCategoriesScreen}
                options={{
                    title: 'Crypto Categories',
                    headerTitleAlign: 'center',
                    headerRight: () => <HeaderLogo/>,
                    headerBackTitle: 'Back',
                }}
            />
            <Stack.Screen
                name="CryptoTrending"
                component={CryptoTrendingScreen}
                options={{
                    title: 'Trending Crypto',
                    headerTitleAlign: 'center',
                    headerRight: () => <HeaderLogo/>,
                    headerBackTitle: 'Back',
                }}
            />
            <Stack.Screen
                name="Debug"
                component={DebugScreen}
                options={{
                    title: 'API Debug',
                    headerTitleAlign: 'center',
                    headerRight: () => <HeaderLogo/>,
                    headerBackTitle: 'Back',
                }}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});
