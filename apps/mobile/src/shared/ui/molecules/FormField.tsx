import React, { useId } from 'react';
import { View } from 'react-native';
import { Text } from '../atoms/Text';
import { Input, type InputProps } from '../atoms/Input';
import { useTheme } from '../theme/ThemeProvider';

export interface FormFieldProps extends Omit<InputProps, 'invalid'> {
  label: string;
  hint?: string;
  error?: string;
}

/**
 * Label + Input + (hint or error). Use for any form field — keeps spacing,
 * a11y, and error state consistent app-wide.
 */
export function FormField({ label, hint, error, ...inputProps }: FormFieldProps): React.ReactElement {
  const theme = useTheme();
  const id = useId();
  const helpId = `${id}-help`;

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text variant="bodyStrong" nativeID={`${id}-label`}>{label}</Text>
      <Input
        accessibilityLabel={label}
        accessibilityHint={hint}
        aria-labelledby={`${id}-label`}
        aria-describedby={hint || error ? helpId : undefined}
        invalid={Boolean(error)}
        {...inputProps}
      />
      {error ? (
        <Text nativeID={helpId} variant="caption" color={theme.colors.danger}>
          {error}
        </Text>
      ) : hint ? (
        <Text nativeID={helpId} variant="caption" muted>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
