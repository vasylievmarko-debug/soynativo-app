import React, { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';

export interface SkeletonProps {
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  radius?: number;
}

/**
 * Skeleton placeholder. Subjectively faster than a spinner because the user
 * sees the shape of the content immediately. Animation runs on the UI
 * thread via Reanimated 3 — no JS-thread cost during loads.
 */
export function Skeleton({ width = '100%', height = 16, radius }: SkeletonProps): React.ReactElement {
  const theme = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: theme.motion.duration.slow }),
      -1,
      true
    );
  }, [opacity, theme.motion.duration.slow]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityLabel="Loading"
      style={[
        {
          width,
          height,
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: radius ?? theme.radius.sm,
        },
        animatedStyle,
      ]}
    />
  );
}

export function SkeletonRow(): React.ReactElement {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm, padding: theme.spacing.md }}>
      <Skeleton width="60%" height={20} />
      <Skeleton width="40%" height={14} />
    </View>
  );
}
