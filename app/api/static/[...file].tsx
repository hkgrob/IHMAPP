
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function StaticFile() {
  const { file } = useLocalSearchParams();
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Serving file: {Array.isArray(file) ? file.join('/') : file}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});
