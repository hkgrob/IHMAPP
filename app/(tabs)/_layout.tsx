
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { HapticTab } from '@/components/HapticTab';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { 
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderTopColor: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
          }
        ],
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
          tabBarLabel: ({ color }) => <HapticTab label="Home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="counter"
        options={{
          title: 'Counter',
          tabBarIcon: ({ color }) => (
            <Ionicons name="stopwatch-outline" size={24} color={color} />
          ),
          tabBarLabel: ({ color }) => <HapticTab label="Clicker" color={color} />,
        }}
      />
      <Tabs.Screen
        name="podcast"
        options={{
          title: 'Podcast',
          tabBarIcon: ({ color }) => <Ionicons name="mic-outline" size={24} color={color} />,
          tabBarLabel: ({ color }) => <HapticTab label="Podcast" color={color} />,
        }}
      />
      <Tabs.Screen
        name="blog"
        options={{
          title: 'Blog',
          tabBarIcon: ({ color }) => <Ionicons name="newspaper-outline" size={24} color={color} />,
          tabBarLabel: ({ color }) => <HapticTab label="Blog" color={color} />,
        }}
      />
      <Tabs.Screen
        name="declarations"
        options={{
          title: 'Declarations',
          tabBarIcon: ({ color }) => <Ionicons name="book-outline" size={24} color={color} />,
          tabBarLabel: ({ color }) => <HapticTab label="Declarations" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart-outline" size={24} color={color} />,
          tabBarLabel: ({ color }) => <HapticTab label="Stats" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
          tabBarLabel: ({ color }) => <HapticTab label="Settings" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    // Theme-aware styling will be applied via screenOptions
    borderTopWidth: 1,
  },
});
