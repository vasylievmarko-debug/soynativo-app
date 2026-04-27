import React from 'react';
import { View } from 'react-native';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { useTheme } from '../theme/ThemeProvider';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps): React.ReactElement {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="summary"
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        gap: theme.spacing.md,
      }}
    >
      <Text variant="h2">{title}</Text>
      {description ? (
        <Text muted style={{ textAlign: 'center' }}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}
