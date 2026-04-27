import React, { forwardRef } from 'react';
import { TextInput, type TextInputProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export interface InputProps extends TextInputProps {
  invalid?: boolean;
}

/**
 * Single-line text input. Use directly for raw fields; wrap in `<FormField>`
 * to get a label, hint, and error message.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { invalid, style, ...rest },
  ref
) {
  const theme = useTheme();
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={theme.colors.textMuted}
      accessibilityState={{ disabled: rest.editable === false }}
      style={[
        styles.base,
        {
          borderColor: invalid ? theme.colors.danger : theme.colors.border,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.md,
          ...theme.typography.body,
        },
        style,
      ]}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  base: { borderWidth: 1, minHeight: 44 },
});
