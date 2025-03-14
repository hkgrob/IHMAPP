
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform, Text, View } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export function HapticTab({ label, color, ...props }: BottomTabBarButtonProps & { label?: string; color?: string }) {
  const textColor = useThemeColor({ light: color }, 'text');

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (Platform.OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            .then(() => console.log('Tab haptic feedback applied'))
            .catch(err => console.error('Error with haptic feedback:', err));
        }
        props.onPressIn?.(ev);
      }}
    >
      {label && <Text style={{ color: textColor, fontSize: 10, textAlign: 'center' }}>{label}</Text>}
    </PlatformPressable>
  );
}
