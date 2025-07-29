import React, { memo } from 'react';
import { View, Image, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../styles/HeaderStyles';

// Move these outside the component (before the component definition)
const logo = require('./images/icon.png');
const backgroundImage = require('./images/header2.jpg');

const Header = ({ onToggleDrawer }) => {
  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(57, 50, 71, 0.7)', 'rgba(141, 169, 164, 0.7)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      >
        <View style={styles.container}>
          <View style={styles.leftSection}>
            <Image source={logo} style={styles.logo} />
          </View>
          <View style={styles.rightSection}>
            <TouchableOpacity onPress={onToggleDrawer} style={styles.hamburger}>
              <Icon name="menu" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

export default memo(Header);