import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View, 
  ViewStyle, 
  TextStyle, 
  Animated,
  Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';
type ButtonColor = 'primary' | 'secondary' | 'danger' | 'success';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'solid',
  size = 'medium',
  color = 'primary',
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  loading = false,
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyles = () => {
  return StyleSheet.flatten([
    styles.button,
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    variant === 'solid' 
      ? styles[`${color}Solid`] 
      : variant === 'outline' 
        ? styles[`${color}Outline`] 
        : styles[`${color}Ghost`]
  ]);
};

  const getTextStyles = () => {
  return StyleSheet.flatten([
    styles.text,
    styles[`${size}Text`],
    disabled && styles.disabledText,
    variant === 'solid' && color !== 'secondary'
      ? styles.solidText
      : styles[`${color}Text`]
  ]);
};

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }, fullWidth && styles.fullWidth]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={getButtonStyles()}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          
          {loading ? (
            <Text style={getTextStyles()}>Loading...</Text>
          ) : (
            <Text style={getTextStyles()} numberOfLines={1}>
              {title}
            </Text>
          )}
          
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    minHeight: 44,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },

  // Size styles
  small: {
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingVertical: 10,
    minHeight: 44,
  },
  large: {
    paddingVertical: 12,
    minHeight: 48,
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  solidText: {
    color: '#ffffff',
  },

  // Color variants
  primarySolid: {
    backgroundColor: '#393247',
  },
  primaryOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#393247',
  },
  primaryGhost: {
    backgroundColor: 'transparent',
  },
  primaryText: {
    color: '#393247',
  },

  secondarySolid: {
    backgroundColor: '#f1f5f9',
  },
  secondaryOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryGhost: {
    backgroundColor: 'transparent',
  },
  secondaryText: {
    color: '#475569',
  },

  dangerSolid: {
    backgroundColor: '#dc2626',
  },
  dangerOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  dangerGhost: {
    backgroundColor: 'transparent',
  },
  dangerText: {
    color: '#dc2626',
  },

  successSolid: {
    backgroundColor: '#059669',
  },
  successOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#059669',
  },
  successGhost: {
    backgroundColor: 'transparent',
  },
  successText: {
    color: '#059669',
  },
});

export default Button;