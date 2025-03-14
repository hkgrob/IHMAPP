
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
            // Check if haptic is enabled in settings
            const hapticEnabled = await AsyncStorage.getItem('hapticEnabled');
            console.log('Tab haptic setting:', hapticEnabled);
            
            // Apply haptic if NOT explicitly disabled (only 'false' string disables)
            if (hapticEnabled !== 'false') {
              console.log('Attempting tab haptic feedback');
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              console.log('Tab haptic feedback applied successfully');
            } else {
              console.log('Tab haptics disabled by user settings');
            }
          } catch (err) {
            console.error('Error with tab haptic feedback:', err);
            // No fallback for tab press - keeps it lightweight
          }
        }
        props.onPressIn?.(ev);
      }}
    >
      {label && <Text style={{ color: textColor, fontSize: 10, textAlign: 'center' }}>{label}</Text>}
    </PlatformPressable>
  );
}
