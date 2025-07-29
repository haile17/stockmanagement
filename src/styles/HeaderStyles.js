import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Calculate proper header height including status bar
const HEADER_HEIGHT = Platform.OS === 'ios' ? 80 : 80;

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    minWidth: SCREEN_WIDTH,
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    backgroundColor: 'transparent',
   
  },

  backgroundImageStyle: {
    position: 'absolute',
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
      position: 'absolute',
     left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: HEADER_HEIGHT,
    justifyContent: 'center',
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    height: HEADER_HEIGHT,
    paddingVertical: 8,
    flex: 1,
  },

  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 16,
    height: '100%',
  },

  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 16,
    height: '100%',
  },

  logo: {
    height: 70,
    width: 90,
    resizeMode: 'contain',
  },

  hamburger: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
});

export default styles;