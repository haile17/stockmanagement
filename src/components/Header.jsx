import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../styles/HeaderStyles';

const Header = ({ onToggleDrawer, iconColor = "#ffffff", backgroundColor = "transparent" }) => {
  return (
    <View style={[styles.transparentHeader, { backgroundColor }]}>
      <TouchableOpacity onPress={onToggleDrawer} style={styles.hamburger}>
        <Icon name="menu" size={24} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

export default memo(Header);