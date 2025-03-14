import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform, Text, View, Vibration } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function HapticTab({ label, color, ...props }: BottomTabBarButtonProps & { label?: string; color?: string }) {
  const textColor = useThemeColor({ light: color }, 'text');

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (Platform.OS !== 'web') {
          try {
            // Directly trigger haptic without checking settings
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            console.log('Tab haptic triggered directly');
          } catch (err) {
            console.error('Error with direct tab haptic:', err);
            // Fallback to vibration
            try {
              Vibration.vibrate(20);
            } catch (vibErr) {
              console.error('Tab vibration fallback failed:', vibErr);
            }
          }
        }
        props.onPressIn?.(ev);
      }}
    >
      {label && <Text style={{ color: textColor, fontSize: 10, textAlign: 'center' }}>{label}</Text>}
    </PlatformPressable>
  );
}