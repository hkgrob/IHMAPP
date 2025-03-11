import React from 'react';
import { View, Image, StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';

export function Header() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = Dimensions.get('window');
  const isMobileSmall = width < 360;

  return (
    <View style={[
      styles.container, 
      { paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 10 },
      { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
      { height: isMobileSmall ? 70 : 90 + (Platform.OS === 'ios' ? insets.top : (StatusBar.currentHeight || 0))}
    ]}>
      <Image 
        source={require('../assets/images/logo-igniting-hope.png')} 
        style={[styles.logo, isMobileSmall && {maxWidth: '80%'}]} //adjust max width for smaller screens
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logo: {
    height: 50,
    width: 250,
    maxWidth: '90%',
  }
});