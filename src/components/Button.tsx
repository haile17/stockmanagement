import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View, 
  ViewStyle, 
  TextStyle, 
  Animated, 
  Dimensions,
  Platform 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface ButtonProps {
  onPress: () => void;
  children?: React.ReactNode;
  title?: string;
  type?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'gradient';
  size?: 'xs' | 'small' | 'medium' | 'large' | 'xl';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  ariaLabel?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  gradientColors?: string[];
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal';
  variant?: 'solid' | 'soft' | 'ghost' | 'outline';
  autoResize?: boolean;
  maxLines?: number;
  minFontSize?: number;
}

const Button: React.FC<ButtonProps> = ({ 
  onPress, 
  children, 
  title, 
  type = 'primary',
  size = 'medium',
  disabled = false,
  style = {},
  textStyle = {},
  ariaLabel = 'button',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  loading = false,
  gradientColors = ['#393247', '#8DA9A4'],
  gradientDirection = 'diagonal',
  variant = 'solid',
  autoResize = false,
  maxLines = 2,
  minFontSize = 8,
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const opacityValue = React.useRef(new Animated.Value(1)).current;
  const [fontSize, setFontSize] = React.useState<number>(0);
  const [textLines, setTextLines] = React.useState<number>(1);

  React.useEffect(() => {
    if (autoResize && (title || children)) {
      const textContent = title || children?.toString() || '';
      const baseSize = styles[`${size}Text`].fontSize;
      
      // Simple heuristic: reduce font size based on text length
      if (textContent.length > 20) {
        const reductionFactor = Math.min(0.8, Math.max(0.6, 20 / textContent.length));
        setFontSize(Math.max(minFontSize, baseSize * reductionFactor));
        setTextLines(textContent.length > 40 ? maxLines : 1);
      } else {
        setFontSize(baseSize);
        setTextLines(1);
      }
    }
  }, [title, children, size, autoResize, maxLines, minFontSize]);
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  };

  const getGradientStart = () => {
    switch (gradientDirection) {
      case 'horizontal': return { x: 0, y: 0.5 };
      case 'vertical': return { x: 0.5, y: 0 };
      case 'diagonal': return { x: 0, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };

  const getGradientEnd = () => {
    switch (gradientDirection) {
      case 'horizontal': return { x: 1, y: 0.5 };
      case 'vertical': return { x: 0.5, y: 1 };
      case 'diagonal': return { x: 1, y: 1 };
      default: return { x: 1, y: 1 };
    }
  };

  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <Text style={[
        styles.text, 
        styles[`${type}Text`], 
        styles[`${size}Text`],
        disabled && styles.disabledText,
        textStyle
      ]}>
        Loading...
      </Text>
    </View>
  );

  const ButtonContent = () => {
  // Function to split text into two lines
  const splitText = (text: string) => {
    const words = text.split(' ');
    if (words.length <= 1) return { firstLine: text, secondLine: '' };
    
    const midPoint = Math.ceil(words.length / 2);
    const firstLine = words.slice(0, midPoint).join(' ');
    const secondLine = words.slice(midPoint).join(' ');
    
    return { firstLine, secondLine };
  };

  const textContent = title || children?.toString() || '';
  const { firstLine, secondLine } = splitText(textContent);
  const hasMultipleWords = textContent.includes(' ');
  const hasIcon = icon !== undefined; // Check if button has an icon

  return (
    <View style={[
      styles.contentContainer,
      fullWidth && styles.fullWidthContent
    ]}>
      {icon && iconPosition === 'left' && (
        <View style={[styles.iconLeft, styles[`${size}Icon`]]}>{icon}</View>
      )}
      {loading ? (
        <LoadingIndicator />
      ) : (hasMultipleWords && !hasIcon) ? ( // Only split text if no icon
        <View style={styles.twoLineTextContainer}>
          <Text 
            style={[
              styles.text, 
              styles[`${type}Text`], 
              styles[`${size}Text`],
              styles.firstLineText, // Add specific style for first line
              disabled && styles.disabledText,
              textStyle
            ]}
            numberOfLines={1}
          >
            {firstLine}
          </Text>
          {secondLine && (
            <Text 
              style={[
                styles.text, 
                styles[`${type}Text`], 
                styles[`${size}Text`],
                styles.secondLineText,
                disabled && styles.disabledText,
                textStyle
              ]}
              numberOfLines={1}
            >
              {secondLine}
            </Text>
          )}
        </View>
      ) : (
        <Text 
          style={[
            styles.text, 
            styles[`${type}Text`], 
            styles[`${size}Text`],
            disabled && styles.disabledText,
            textStyle
          ]}
          numberOfLines={1}
        >
          {textContent}
        </Text>
      )}
      {icon && iconPosition === 'right' && (
        <View style={[styles.iconRight, styles[`${size}Icon`]]}>{icon}</View>
      )}
    </View>
  );
};

  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      styles[size],
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
      style
    ];

    if (type === 'gradient') {
      return [...baseStyle, styles.gradientButton];
    }

    return [...baseStyle, styles[type], styles[`${type}${variant}`]];
  };

  const animatedStyle = {
    transform: [{ scale: scaleValue }],
    opacity: opacityValue,
  };

  // Gradient button with enhanced styling
  if (type === 'gradient' && !disabled) {
    return (
      <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={getButtonStyle()}
          accessibilityLabel={ariaLabel}
          activeOpacity={1}
        >
          <LinearGradient
            colors={gradientColors}
            start={getGradientStart()}
            end={getGradientEnd()}
            style={[
              styles.gradientBackground,
              styles[`${size}Gradient`],
              fullWidth && styles.fullWidthGradient
            ]}
          >
            <ButtonContent />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={getButtonStyle()}
        accessibilityLabel={ariaLabel}
        activeOpacity={1}
      >
        <ButtonContent />
      </TouchableOpacity>
    </Animated.View>
  );
  
};


const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    minHeight: 42,
    marginVertical: 6,
    marginHorizontal: 2,
    position: 'relative',
    overflow: 'hidden',
    alignSelf: 'stretch',
  },

  twoLineTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: -2,

  },
  secondLineText: {
    fontSize: 8, 
    fontWeight: '500',
    marginTop: -2,
    lineHeight: 15,
    opacity: 0.7,
  },
  
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    alignSelf: 'center',
    paddingHorizontal: 4,
    minHeight: 28,
  },

  fullWidthContent: {
    width: '100%',
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icon spacing based on size
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },

  // Size-specific icon spacing
  xsIcon: {
    marginHorizontal: 4,
  },
  smallIcon: {
    marginHorizontal: 5,
  },
  mediumIcon: {
    marginHorizontal: 6,
  },
  largeIcon: {
    marginHorizontal: 7,
  },
  xlIcon: {
    marginHorizontal: 8,
  },

  // Enhanced gradient styles
  gradientButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },

  gradientBackground: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  fullWidthGradient: {
    width: '100%',
  },
  
  // Full width variant
  fullWidth: {
    width: '100%',
    marginHorizontal: 0,
  },

  // Enhanced button types with variants
  primary: {
    backgroundColor: '#393247',
    borderWidth: 0,
  },
  primarysoft: {
  backgroundColor: '#f0f0f1', // Adjusted to match primary color theme
  borderWidth: 0,
  },
  primaryghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  primaryoutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#393247', // Changed from '#2563eb'
  },

  secondary: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondarysoft: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1, // Added border
    borderColor: '#e2e8f0', // Added border color
  },
  secondaryghost: {
    backgroundColor: 'transparent',
    borderWidth: 1, // Added border
    borderColor: '#e2e8f0', // Added border color
  },
  secondaryoutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#64748b',
  },

  danger: {
    backgroundColor: '#dc2626', // Changed from '#ef4444' for better contrast
    borderWidth: 1, // Added border
    borderColor: '#b91c1c', // Added border color
  },
  dangersoft: {
    backgroundColor: '#fef2f2',
    borderWidth: 1, // Added border
    borderColor: '#fca5a5', // Added border color
  },
  dangerghost: {
    backgroundColor: 'transparent',
    borderWidth: 1, // Added border
    borderColor: '#dc2626', // Added border color
  },
  dangeroutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#dc2626', // Updated to match new danger color
  },

  success: {
    backgroundColor: '#059669', // Changed from '#10b981'
    borderWidth: 1, // Added border
    borderColor: '#047857', // Added border color
  },
  successsoft: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1, // Added border
    borderColor: '#86efac', // Added border color
  },
  successghost: {
    backgroundColor: 'transparent',
    borderWidth: 1, // Added border
    borderColor: '#059669', // Added border color
  },
  successoutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#059669', // Updated to match new success color
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#393247', // Changed from '#2563eb'
  },
  outlinesoft: {
    backgroundColor: 'rgba(57, 50, 71, 0.05)', // Adjusted to match primary color
    borderWidth: 1.5,
    borderColor: '#393247', // Changed from '#2563eb'
  },
  outlineghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(57, 50, 71, 0.3)', // Adjusted to match primary color
  },
  outlineoutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#393247', // Changed from '#2563eb'
  },

  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  // Phone-optimized sizes
  xs: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 32,
    width: Math.min(80, screenWidth * 0.2),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    height: 36,
    width: Math.min(100, screenWidth * 0.25),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medium: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 44,
    width: Math.min(120, screenWidth * 0.3),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100, 
  },
  large: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    height: 48,
    width: Math.min(140, screenWidth * 0.35),
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xl: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    height: 52,
    width: Math.min(160, screenWidth * 0.4),
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },


  // Size-specific gradient backgrounds
 xsGradient: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallGradient: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediumGradient: {
    height: 44,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeGradient: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xlGradient: {
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Responsive text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
    includeFontPadding: false,
    textAlignVertical: 'center',
    alignSelf: 'center',
   
  },
  firstLineText: {
  lineHeight: 12, // Only apply reduced line height to first line of split text
},
  // Size-specific text styles
  xsText: {
    fontSize: 8,
    fontWeight: '500',
    lineHeight: 16,
  },
  smallText: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 18,
  },
  mediumText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 20,
  },
  largeText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
  },
  xlText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },

  // Enhanced type-specific text styles
  primaryText: {
  color: '#ffffff',
  },
  secondaryText: {
    color: '#475569',
  },
  dangerText: {
    color: '#ffffff',
  },
  successText: {
    color: '#ffffff',
  },
  outlineText: {
    color: '#393247', // Changed from '#2563eb'
  },
  ghostText: {
    color: '#475569',
  },
  gradientText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  // Enhanced disabled state
  disabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    opacity: 0.6,
  },
  disabledText: {
    color: '#94a3b8',
  },
});

export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  direction?: 'row' | 'column';
  spacing?: number;
  fullWidth?: boolean;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
}> = ({ 
  children, 
  direction = 'row', 
  spacing = 8,
  fullWidth = false,
  align = 'center'
}) => (
  <View style={[
    groupStyles.container,
    { 
      flexDirection: direction,
      gap: spacing,
      width: fullWidth ? '100%' : 'auto',
      alignItems: align, // Ensures consistent alignment
    }
  ]}>
    {children}
  </View>
);

const groupStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    // Ensures baseline alignment for buttons in row
    ...(Platform.OS === 'ios' && {
      alignItems: 'baseline',
    }),
  },
});

export default Button;