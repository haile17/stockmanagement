import React, { useRef, useEffect, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import { PanGestureHandler, State, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

type CustomDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

// 👉 Modern Drawer Button Component
const DrawerButton: React.FC<{
  title: string;
  onPress: () => void;
  icon: React.ReactNode;
}> = ({ title, onPress, icon }) => {
  return (
    <TouchableOpacity style={styles.modernButton} onPress={onPress}>
      <View style={styles.modernButtonIconContainer}>
        {icon}
      </View>
      <Text style={styles.modernButtonText}>{title}</Text>
      <View style={styles.modernButtonArrow}>
        <Feather name="chevron-right" size={20} color="#373b4d" />
      </View>
    </TouchableOpacity>
  );
};

const CustomDrawer: React.FC<CustomDrawerProps> = memo(({ isOpen, onClose }) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const translateX = useRef(new Animated.Value(isOpen ? 0 : 300)).current;
  const overlayOpacity = useRef(new Animated.Value(isOpen ? 0.4 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: isOpen ? 0 : 300,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(overlayOpacity, {
        toValue: isOpen ? 0.5 : 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, [isOpen, translateX, overlayOpacity]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      if (event.nativeEvent.translationX < -50) {
        onClose();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const navigateAndClose = useCallback((screenName: string) => {
    onClose();
    setTimeout(() => {
      navigation.navigate(screenName);
    }, 100);
  }, [navigation, onClose]);

  const menuItems = [
    { name: 'Dashboard', route: 'Dashboard', icon: 'home' },
    { name: 'Inventory', route: 'Inventory', icon: 'box' },
    { name: 'Sales', route: 'Sales', icon: 'shopping-cart' },
    { name: 'Credits', route: 'Credit', icon: 'credit-card' },
    { name: 'Purchases', route: 'Purchase', icon: 'truck' },
    { name: 'Reports', route: 'Reports', icon: 'bar-chart-2' },
  ];

  return (
    <>
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
            display: isOpen ? 'flex' : 'none',
          },
        ]}
        onTouchStart={onClose}
      />

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={['#fcfcfcff', '#e2e8f0', '#545a74ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBackground}
          />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={24} color="#ffffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuContent}>
            {menuItems.map((item, index) => (
              <DrawerButton
                key={index}
                title={item.name}
                onPress={() => navigateAndClose(item.route)}
                icon={<Feather name={item.icon} size={20} color="#fcfcfcff" />}
              />
            ))}
          </View>

          <View style={styles.footer}>
            <Image
              source={require('./images/judas2.png')}
              style={styles.bottomImage}
              resizeMode="contain"
            />
            <Text style={styles.footerText}>v1.0.0</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 280,
    height: '100%',
    backgroundColor: 'transparent',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1000,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0f172a',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#373b4d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    padding: 20,
    flex: 1,
  },
  modernButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modernButtonIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#373b4d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modernButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  modernButtonArrow: {
    opacity: 0.7,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
   
  },
  bottomImage: {
    width: 50,
    height: 50,
    opacity: 0.4,
    marginBottom: 5,
  },
  footerText: {
    fontSize: 12,
    color: '#000000ff',
    fontWeight: 'bold',
  },
});

export default CustomDrawer;