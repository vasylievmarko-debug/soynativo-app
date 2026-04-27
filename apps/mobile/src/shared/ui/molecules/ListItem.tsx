import React from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import { Text } from '../atoms/Text';
import { useTheme } from '../theme/ThemeProvider';

export interface ListItemProps extends Omit<PressableProps, 'children'> {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  ...pressableProps
}: ListItemProps): React.ReactElement {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
      })}
      {...pressableProps}
    >
      {leading}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong">{title}</Text>
        {subtitle ? <Text variant="caption" muted>{subtitle}</Text> : null}
      </View>
      {trailing}
    </Pressable>
  );
}
