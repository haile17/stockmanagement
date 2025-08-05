import React from 'react';
import { Text } from 'react-native';

// Map fontWeight or custom prop to actual Montserrat font files
const getFontFamily = (weight = 'regular') => {
  switch (weight.toLowerCase()) {
    case 'light':
    case '300':
      return 'Montserrat-Light';
    case 'medium':
    case '500':
      return 'Montserrat-Medium';
    case 'bold':
    case '700':
      return 'Montserrat-Bold';
    case 'black':
    case '900':
      return 'Montserrat-Black';
    case 'regular':
    case '400':
    default:
      return 'Montserrat-Regular';
  }
};

const CustomText = ({ children, weight = 'regular', style = {}, ...props }) => {
  // Combine default fontFamily with passed style
  const fontFamily = getFontFamily(weight);

  return (
    <Text
      {...props}
      style={[{ fontFamily }, style]}
    >
      {children}
    </Text>
  );
};

export default CustomText;
