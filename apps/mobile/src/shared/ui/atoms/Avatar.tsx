import React from 'react';
import { Image, View, StyleSheet, type ImageSourcePropType } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: number;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ source, name = '', size = 40 }: AvatarProps): React.ReactElement {
  const theme = useTheme();
  const radius = size / 2;

  if (source) {
    return (
      <Image
        source={source}
        accessibilityLabel={name ? `Avatar of ${name}` : 'Avatar'}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }

  return (
    <View
      accessibilityLabel={name ? `Avatar of ${name}` : 'Avatar'}
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius, backgroundColor: theme.colors.surfaceMuted },
      ]}
    >
      <Text variant="bodyStrong" color={theme.colors.textMuted}>{initials(name) || '?'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
