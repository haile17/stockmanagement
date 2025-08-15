import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomDrawer from './components/CustomDrawer';
import { AlertProvider } from './context/AlertContext';
import { StatusBar, Platform, View, ImageBackground, AppState } from 'react-native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import LandingPage from './screens/LandingPage';
import NotificationService from './components/NotificationService';
import notifee, { EventType } from '@notifee/react-native';
import StockAlertManager from './components/StockAlertManager';

const Stack = createNativeStackNavigator();

const CreditScreen = lazy(() => import('./screens/CreditScreen'));
const DashboardScreen = lazy(() => import('./screens/DashboardScreen'));
const InventoryScreen = lazy(() => import('./screens/InventoryScreen'));
const PurchaseScreen = lazy(() => import('./screens/PurchaseScreen'));
const ReportsScreen = lazy(() => import('./screens/ReportsScreen'));
const SalesScreen = lazy(() => import('./screens/SalesScreen'));

// Create a navigation reference to use from NotificationService
export const navigationRef = React.createRef();

function App() {
  const [hasSeenLandingPage, setHasSeenLandingPage] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Handle navigation from notifications
  const handleNotificationNavigation = useCallback((screen, params = {}) => {
    if (isNavigationReady && navigationRef.current) {
      navigationRef.current.navigate(screen, params);
    }
  }, [isNavigationReady]);

  useEffect(() => {
    const checkLandingPageSeen = async () => {
      const seenLandingPage = await AsyncStorage.getItem('hasSeenLandingPage');
      if (seenLandingPage) {
        setHasSeenLandingPage(true);
      }
    };

    checkLandingPageSeen();
  }, []);

  // Initialize notification service and handle notification events
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Initialize NotificationService
        await NotificationService.configure();
        await NotificationService.createDefaultChannels();

        await StockAlertManager.initializeSettings();

        console.log('Notification service initialized');
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();

    // Handle notification events when app is in foreground
    const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      console.log('Foreground notification event:', type, detail);
      
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          console.log('User pressed notification', detail.notification);
          handleNotificationPress(detail.notification);
          break;
        case EventType.ACTION_PRESS:
          console.log('User pressed an action', detail.pressAction.id, detail.notification);
          if (detail.pressAction.id === 'view') {
            handleNotificationPress(detail.notification);
          }
          break;
      }
    });

    // Handle notification events when app is in background
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log('Background notification event:', type, detail);
      
      if (type === EventType.PRESS) {
        console.log('User pressed notification in background');
        // The app will be brought to foreground, and we'll handle navigation there
      }
    });

    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // App became active, check for any pending notification actions
        checkInitialNotification();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup
    return () => {
      unsubscribeForeground();
      appStateSubscription?.remove();
    };
  }, [handleNotificationNavigation]);

  // Check if app was opened from a notification
  const checkInitialNotification = async () => {
    try {
      const initialNotification = await notifee.getInitialNotification();
      if (initialNotification) {
        console.log('App opened from notification:', initialNotification);
        handleNotificationPress(initialNotification.notification);
      }
    } catch (error) {
      console.error('Error checking initial notification:', error);
    }
  };

  // Handle notification press and navigate accordingly
  const handleNotificationPress = (notification) => {
    const { type, itemName, screen, purchaseId, salesId } = notification.data || {};
    
    console.log('Handling notification press:', { type, itemName, screen });
    
    // Wait a bit to ensure navigation is ready
    setTimeout(() => {
      switch (type) {
        case 'low_stock':
        case 'stock_reminder':
          handleNotificationNavigation('Inventory', { 
            highlightItem: itemName,
            showLowStock: true 
          });
          break;
        case 'purchase_reminder':
        case 'purchase_update':
          handleNotificationNavigation('Purchase', { 
            purchaseId,
            showNotification: true 
          });
          break;
        case 'sales':
        case 'sales_update':
          handleNotificationNavigation('Sales', { 
            salesId,
            showNotification: true 
          });
          break;
        case 'credit_due':
          handleNotificationNavigation('Credit', { 
            showOverdue: true 
          });
          break;
        default:
          // Default to Dashboard for unknown types
          handleNotificationNavigation('Dashboard');
          break;
      }
    }, 100);
  };

  const hideSystemBars = useCallback(() => {
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setBackgroundColor('transparent', true);
    
    if (Platform.OS === 'android') {
      try {
        if (changeNavigationBarColor) {
          changeNavigationBarColor('transparent', true, true);
        }
      } catch (error) {
        console.warn('Navigation bar color change failed:', error);
      }
    }
  }, []);

  useEffect(() => {
    hideSystemBars();
    
    const interval = setInterval(() => {
      hideSystemBars();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [hideSystemBars]);

  const handleLandingPageShown = async () => {
    await AsyncStorage.setItem('hasSeenLandingPage', 'true');
    setHasSeenLandingPage(true);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleNavigationReady = () => {
    setIsNavigationReady(true);
    hideSystemBars();
    
    // Check for initial notification after navigation is ready
    checkInitialNotification();
  };

  // Remove header completely from navigation
  const commonScreenOptions: NativeStackNavigationOptions = {
    headerShown: false,
    statusBarHidden: false,
    statusBarStyle: 'light',
    statusBarBackgroundColor: 'transparent',
    navigationBarHidden: true,
    freezeOnBlur: true,
    animation: 'slide_from_right',
    animationDuration: 200,
  };

  return (
    <AlertProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer
          ref={navigationRef}
          onReady={handleNavigationReady}
          onStateChange={hideSystemBars}
        >
          <Stack.Navigator
            initialRouteName={hasSeenLandingPage ? "Dashboard" : "Landing"}
          >
            <Stack.Screen
              name="Landing"
              options={{ 
                headerShown: false,
                statusBarHidden: true,
                statusBarStyle: 'light',
                navigationBarHidden: true,
              }}
            >
              {props => <LandingPage {...props} onShown={handleLandingPageShown} />}
            </Stack.Screen>
            
            <Stack.Screen name="Dashboard" options={commonScreenOptions}>
              {props => (
                <Suspense fallback={
                  <View style={{ flex: 1, backgroundColor: '#000' }}>
                    <ImageBackground 
                      source={require('./components/images/lion.jpg')}
                      style={{flex: 1}}
                      resizeMode="cover"
                    />
                  </View>
                }>
                  <DashboardScreen {...props} onToggleDrawer={toggleDrawer} />
                </Suspense>
              )}
            </Stack.Screen>
            
            <Stack.Screen name="Inventory" options={commonScreenOptions}>
              {props => <InventoryScreen {...props} onToggleDrawer={toggleDrawer} />}
            </Stack.Screen>
            
            <Stack.Screen name="Credit" options={commonScreenOptions}>
              {props => <CreditScreen {...props} onToggleDrawer={toggleDrawer} />}
            </Stack.Screen>
            
            <Stack.Screen name="Purchase" options={commonScreenOptions}>
              {props => <PurchaseScreen {...props} onToggleDrawer={toggleDrawer} />}
            </Stack.Screen>
            
            <Stack.Screen name="Reports" options={commonScreenOptions}>
              {props => <ReportsScreen {...props} onToggleDrawer={toggleDrawer} />}
            </Stack.Screen>
            
            <Stack.Screen name="Sales" options={commonScreenOptions}>
              {props => <SalesScreen {...props} onToggleDrawer={toggleDrawer} />}
            </Stack.Screen>
          </Stack.Navigator>
          
          <CustomDrawer 
            isOpen={isDrawerOpen} 
            onClose={() => setIsDrawerOpen(false)} 
          />
        </NavigationContainer>
      </GestureHandlerRootView>
    </AlertProvider>
  );
}

export default App;