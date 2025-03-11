
import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Dimensions, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';

interface MobileContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  padded?: boolean;
}

export default function MobileContainer({ 
  children, 
  style, 
  scrollable = true,
  padded = true 
}: MobileContainerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const { width } = Dimensions.get('window');
  
  // Adjust padding based on screen size
  const horizontalPadding = width < 360 ? 12 : 16;

  const containerStyle = [
    styles.container,
    { backgroundColor: Colors[colorScheme].background },
    padded && { padding: horizontalPadding },
    style
  ];

  const content = (
    <View style={containerStyle}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme].background }]}>
      {scrollable ? (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {content}
        </ScrollView>
      ) : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  }
});
