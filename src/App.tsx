import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Header from './components/Header';
import CustomDrawer from './components/CustomDrawer';
import { AlertProvider } from './context/AlertContext';
import { StatusBar, Platform, View, ImageBackground } from 'react-native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import LandingPage from './screens/LandingPage';

const Stack = createNativeStackNavigator();

const CreditScreen = lazy(() => import('./screens/CreditScreen'));
const DashboardScreen = lazy(() => import('./screens/DashboardScreen'));
const InventoryScreen = lazy(() => import('./screens/InventoryScreen'));
const PurchaseScreen = lazy(() => import('./screens/PurchaseScreen'));
const ReportsScreen = lazy(() => import('./screens/ReportsScreen'));
const SalesScreen = lazy(() => import('./screens/SalesScreen'));

function App() {
  const [hasSeenLandingPage, setHasSeenLandingPage] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const checkLandingPageSeen = async () => {
      const seenLandingPage = await AsyncStorage.getItem('hasSeenLandingPage');
      if (seenLandingPage) {
        setHasSeenLandingPage(true);
      }
    };

    checkLandingPageSeen();
  }, []);
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
    
    // Set up interval to keep bars hidden
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

  const commonScreenOptions: NativeStackNavigationOptions = {
  headerTitle: () => <Header onToggleDrawer={toggleDrawer} />,
  headerStyle: { 
    backgroundColor: 'transparent',
  },
  headerTitleAlign: 'center',
  headerLeft: () => null,
  headerRight: () => null,
  headerBackVisible: false,
  statusBarHidden: false,
  statusBarStyle: 'light',
  statusBarBackgroundColor: 'transparent',
  navigationBarHidden: true,
  // Add these for better performance
  freezeOnBlur: true,
  animation: 'slide_from_right',
  animationDuration: 200,
};

  return (
    <AlertProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer
          onReady={hideSystemBars}
          onStateChange={hideSystemBars}
        >
          <Stack.Navigator
            initialRouteName={hasSeenLandingPage ? "Dashboard" : "Landing"}
          >
            {/* Always include the Landing screen in the stack */}
            <Stack.Screen
              name="Landing"
              options={{ headerShown: false,
                statusBarHidden: true,
                statusBarStyle: 'light',
                navigationBarHidden: true, // This helps hide navigation bar on Android
              }}
            >
              {props => <LandingPage {...props} onShown={handleLandingPageShown} />}
            </Stack.Screen>
            
            {/* Always include all other screens */}
            <Stack.Screen
              name="Dashboard"
              options={commonScreenOptions}
              >
              {props => (
               <Suspense fallback={
                  <View style={{
                    flex: 1, 
                    backgroundColor: '#000' // Keep as fallback
                  }}>
                    <ImageBackground 
                      source={require('./components/images/judas.jpg')} // Replace with your image path
                      style={{flex: 1}}
                      resizeMode="cover"
                    />
                  </View>
                }>
                  <DashboardScreen {...props} />
                </Suspense>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Inventory"
              component={InventoryScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="Credit"
              component={CreditScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="Purchase"
              component={PurchaseScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="Reports"
              component={ReportsScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="Sales"
              component={SalesScreen}
              options={commonScreenOptions}
            />
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
