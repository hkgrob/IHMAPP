
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform, Text, View } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function HapticTab({ label, color, ...props }: BottomTabBarButtonProps & { label?: string; color?: string }) {
  const textColor = useThemeColor({ light: color }, 'text');

  return (
    <PlatformPressable
      {...props}
      onPressIn={async (ev) => {
        if (Platform.OS !== 'web') {
          try {
            const hapticEnabled = await AsyncStorage.getItem('hapticEnabled');
            console.log('Tab haptic setting:', hapticEnabled);
            
            // Only disable if explicitly set to 'false'
            if (hapticEnabled !== 'false') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          } catch (err) {
            console.error('Tab haptic error:', err);
          }
        }
        props.onPressIn?.(ev);
      }}
    >
      {label && <Text style={{ color: textColor, fontSize: 10, textAlign: 'center' }}>{label}</Text>}
    </PlatformPressable>
  );
}
