
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { HapticTab } from '@/components/HapticTab';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="declarations"
        options={{
          title: 'Declarations',
          tabBarIcon: ({ color }) => <Ionicons name="book-outline" size={24} color={color} />,
          tabBarLabel: ({ color }) => <HapticTab label="Declarations" color={color} />,
        }}
      />
      <Tabs.Screen
        name="counter"
        options={{
          title: 'Counter',
          tabBarIcon: ({ color }) => <Ionicons name="calculator-outline" size={24} color={color} />,
          tabBarLabel: ({ color }) => <HapticTab label="Counter" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});
