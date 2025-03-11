
import React from 'react';
import { Text, StyleSheet, TextStyle, Platform, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';

const { width } = Dimensions.get('window');
const scale = width < 375 ? 0.85 : width > 768 ? 1.2 : 1;

interface ResponsiveTextProps {
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  numberOfLines?: number;
}

export default function ResponsiveText({ 
  style, 
  children, 
  variant = 'body', 
  numberOfLines 
}: ResponsiveTextProps) {
  return (
    <ThemedText 
      style={[
        styles.text, 
        styles[variant],
        Array.isArray(style) ? style : style ? [style] : null
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  text: {
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'Roboto' },
      default: { fontFamily: 'System' }
    }),
    flexWrap: 'wrap',
  },
  h1: {
    fontSize: 28 * scale,
    fontWeight: 'bold',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  h2: {
    fontSize: 24 * scale,
    fontWeight: 'bold',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  h3: {
    fontSize: 20 * scale,
    fontWeight: 'bold',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  h4: {
    fontSize: 18 * scale,
    fontWeight: 'bold',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  body: {
    fontSize: 16 * scale,
    lineHeight: 24 * scale,
    flexWrap: 'wrap',
  },
  caption: {
    fontSize: 14 * scale,
    color: '#666',
    flexWrap: 'wrap',
  },
});
