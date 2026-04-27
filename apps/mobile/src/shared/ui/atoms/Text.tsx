import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import type { TypographyVariant } from '@soynativo/design-tokens';
import { useTheme } from '../theme/ThemeProvider';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  muted?: boolean;
  color?: string;
}

/**
 * Typed text component. Always use this instead of RN's `Text`. Variant
 * choices come from the typography scale in `@soynativo/design-tokens`, so
 * adding a new variant means adding it there once.
 */
export function Text({ variant = 'body', muted, color, style, ...rest }: TextProps): React.ReactElement {
  const theme = useTheme();
  const base: TextStyle = {
    ...theme.typography[variant],
    color: color ?? (muted ? theme.colors.textMuted : theme.colors.text),
  };
  return <RNText {...rest} style={[base, style]} />;
}
