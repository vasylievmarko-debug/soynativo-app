import React from 'react';
import { View } from 'react-native';
import { Text } from '../atoms/Text';
import { useTheme } from '../theme/ThemeProvider';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  label: string;
  tone?: Tone;
}

export function Badge({ label, tone = 'neutral' }: BadgeProps): React.ReactElement {
  const theme = useTheme();
  const tones: Record<Tone, { bg: string; fg: string }> = {
    neutral: { bg: theme.colors.surfaceMuted, fg: theme.colors.textMuted },
    success: { bg: theme.colors.successSoft, fg: theme.colors.success },
    warning: { bg: theme.colors.warningSoft, fg: theme.colors.warning },
    danger: { bg: theme.colors.dangerSoft, fg: theme.colors.danger },
    info: { bg: theme.colors.surfaceMuted, fg: theme.colors.info },
  };
  const { bg, fg } = tones[tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: bg,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.full,
      }}
    >
      <Text variant="overline" color={fg}>{label}</Text>
    </View>
  );
}
