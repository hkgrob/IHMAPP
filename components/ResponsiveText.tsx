
import React from 'react';
import { Text, TextProps, StyleSheet, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ResponsiveTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body' | 'caption';
  lightColor?: string;
  darkColor?: string;
  numberOfLines?: number;
}

export default function ResponsiveText(props: ResponsiveTextProps) {
  const { style, lightColor, darkColor, variant = 'body', numberOfLines, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Get the appropriate base styles based on the variant
  const variantStyles = getVariantStyles(variant);

  // Safely ensure children is treated as a string if defined
  const children = otherProps.children !== undefined ? otherProps.children : '';
  
  return (
    <Text
      style={[variantStyles, { color }, styles.baseText, style]}
      numberOfLines={numberOfLines}
      {...otherProps}
    >
      {children}
    </Text>
  );
}

function getVariantStyles(variant: string) {
  switch (variant) {
    case 'h1':
      return styles.h1;
    case 'h2':
      return styles.h2;
    case 'h3':
      return styles.h3;
    case 'h4':
      return styles.h4;
    case 'h5':
      return styles.h5;
    case 'caption':
      return styles.caption;
    case 'body':
    default:
      return styles.body;
  }
}

const styles = StyleSheet.create({
  baseText: {
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  h1: {
    fontSize: Platform.OS === 'web' ? 36 : 30,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  h2: {
    fontSize: Platform.OS === 'web' ? 28 : 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  h3: {
    fontSize: Platform.OS === 'web' ? 22 : 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  h4: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: 'bold',
    marginVertical: 3,
  },
  h5: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  body: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    lineHeight: Platform.OS === 'web' ? 24 : 22,
  },
  caption: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    color: '#666',
  },
});
