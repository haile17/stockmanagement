import React, { useRef, useEffect, memo, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Button from './Button'; // Import your Button component

const CustomDrawer = memo(({ isOpen, onClose }) => {
  const navigation = useNavigation();
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

  const onHandlerStateChange = (event) => {
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

  const navigateAndClose = useCallback((screenName) => {
    onClose(); // Close drawer first for immediate feedback
    setTimeout(() => {
      navigation.navigate(screenName);
    }, 100); // Small delay to ensure smooth closing
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
      {/* Overlay */}
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

      {/* Drawer */}
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
            colors={['rgba(157, 178, 191, 0)','rgba(157, 178, 191, 0.6)', 'rgba(157, 178, 191, 0.8)', 'rgb(157, 180, 191)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBackground}
          />
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.menuContent}>
            {menuItems.map((item, index) => (
              <View key={index} style={styles.menuItemWrapper}>
                <Button
                  title={item.name}
                  onPress={() => navigateAndClose(item.route)}
                  type="ghost"
                  size="medium"
                  fullWidth={true}
                  icon={<Feather name={item.icon} size={20} color="#393247" />}
                  iconPosition="left"
                  style={styles.menuButton}
                  textStyle={styles.menuButtonText}
                  ariaLabel={`Navigate to ${item.name}`}
                />
              </View>
            ))}
          </View>

          {/* Bottom Image */}
          <View style={styles.bottomImageContainer}>
            <Image
              source={require('./images/judas2.png')} // Replace with your image path
              style={styles.bottomImage}
              resizeMode="contain"
            />
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
    width: 250,
    height: '100%',
    backgroundColor: 'transparent',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  closeButtonText: {
    color: '#DDE6ED',
    fontSize: 34,
    marginRight: 15,
  },
  menuContent: {
    marginTop: 80,
    paddingHorizontal: 20,
    flex: 1,
  },
  menuItemWrapper: {
    width: '100%',
    marginBottom: 20, // Increased spacing between items
    alignItems: 'stretch', // Ensures all items align properly
  },
  menuButton: {
    backgroundColor: 'rgba(157, 178, 191, 0.25)',
    borderRadius: 12,
    height: 55, // Fixed height for consistent alignment
    width: '100%', // Ensures full width
    alignSelf: 'stretch', // Stretch to fill wrapper
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 0, // Remove vertical padding since we have fixed height
    marginVertical: 0, // Remove margin as spacing is handled by wrapper
    flexDirection: 'row', // Ensure horizontal layout
  },
  menuButtonText: {
    color: '#393247',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'left',
    marginLeft: 12, // Add space between icon and text
    flex: 1, // Take remaining space
  },
  bottomImageContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomImage: {
    width: 200,
    height: 200,
    opacity: 0.4,
  },
});

export default CustomDrawer;