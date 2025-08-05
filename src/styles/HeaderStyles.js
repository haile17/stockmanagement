import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const HEADER_HEIGHT = Platform.OS === 'ios' ? 80 : 80;

const styles = StyleSheet.create({
  transparentHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  hamburger: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Add subtle background for better visibility
  },
});

export default styles;