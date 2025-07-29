// components/ScrollingText.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const ScrollingText = ({
  text,
  style,
  containerStyle,
  speed = 50, // pixels per second
  pauseDuration = 1000, // pause at start/end in milliseconds
  enableScrolling = true,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const containerWidth = useRef(0);
  const textWidth = useRef(0);

  useEffect(() => {
    if (!enableScrolling) {
      translateX.setValue(0);
      return;
    }

    const startAnimation = () => {
      // Reset to start position
      translateX.setValue(0);
      
      // Calculate if text needs scrolling
      const scrollDistance = Math.max(0, textWidth.current - containerWidth.current);
      
      if (scrollDistance > 0) {
        // Calculate duration based on speed
        const duration = (scrollDistance / speed) * 1000;
        
        // Animate sequence: pause -> scroll -> pause -> reset
        Animated.sequence([
          Animated.delay(pauseDuration),
          Animated.timing(translateX, {
            toValue: -scrollDistance,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.delay(pauseDuration),
        ]).start(() => {
          // Loop the animation
          startAnimation();
        });
      }
    };

    // Start animation after measuring
    const timer = setTimeout(startAnimation, 100);
    
    return () => {
      clearTimeout(timer);
      translateX.stopAnimation();
    };
  }, [text, speed, pauseDuration, enableScrolling]);

  const handleContainerLayout = (event) => {
    containerWidth.current = event.nativeEvent.layout.width;
  };

  const handleTextLayout = (event) => {
    textWidth.current = event.nativeEvent.layout.width;
  };

  return (
    <View 
      style={[
        {
          overflow: 'hidden',
          flex: 1,
        },
        containerStyle
      ]}
      onLayout={handleContainerLayout}
    >
      <Animated.View
        style={{
          transform: [{ translateX }],
          flexDirection: 'row',
        }}
      >
        <Text
          style={[
            {
              fontSize: 14,
              color: '#333',
            },
            style
          ]}
          onLayout={handleTextLayout}
          numberOfLines={1}
        >
          {text}
        </Text>
      </Animated.View>
    </View>
  );
};

export default ScrollingText;