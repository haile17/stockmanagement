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
      : styles[`${color}Text`],
    variant === 'outline' && styles.outlineText // Add this line
  ]);
};

  const ButtonContent = () => (
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
);

// Update the return statement to handle gradient for primary solid:
return (
  <Animated.View style={[{ transform: [{ scale: scaleValue }] }, fullWidth && styles.fullWidth]}>
    {variant === 'solid' && color === 'primary' ? (
      <LinearGradient
        colors={['#353a5f', '#9ebaf3']}
        start={{x: 0.8, y: 1}}
        end={{x: 1, y: 0.1}}
        style={[getButtonStyles(), styles.primaryGradient]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={styles.gradientButton}
          activeOpacity={0.8}
        >
          <ButtonContent />
        </TouchableOpacity>
      </LinearGradient>
    ) : (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={getButtonStyles()}
        activeOpacity={0.8}
      >
        <ButtonContent />
      </TouchableOpacity>
    )}
  </Animated.View>
);
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16, // increased from 12
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20, // increased from 16
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
    paddingVertical: 10, // increased from 8
    minHeight: 40, // increased from 36
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 14, // increased from 10
    minHeight: 48, // increased from 44
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 16, // increased from 12
    minHeight: 52, // increased from 48
    paddingHorizontal: 24,
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  smallText: {
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  mediumText: {
    fontSize: 16,
    backgroundColor: 'transparent',
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
    borderWidth: 2, // increased from 1
    borderColor: '#9ebaf3', // updated color
    shadowColor: '#9ebaf3',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryGhost: {
    backgroundColor: 'rgba(158, 186, 243, 0.1)', // subtle background
  },
  primaryText: {
    color: '#353a5f',
  },

  secondarySolid: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#64748b',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  secondaryOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2, // increased from 1
    borderColor: '#cbd5e1',
  },
  secondaryGhost: {
    backgroundColor: 'rgba(241, 245, 249, 0.3)',
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
   primaryGradient: {
    borderRadius: 16,
    shadowColor: '#353a5f',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8, // for Android
    borderWidth: 1,
    borderColor: 'rgba(158, 186, 243, 0.3)',
  },
  
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  outlineText: {
  backgroundColor: 'transparent',
},
});

export default Button;