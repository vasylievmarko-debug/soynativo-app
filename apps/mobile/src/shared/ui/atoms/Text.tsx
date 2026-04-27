import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Variant = 'body' | 'caption' | 'h1' | 'h2' | 'button';

export interface TextProps extends RNTextProps {
  variant?: Variant;
  muted?: boolean;
  color?: string;
}

export function Text({ variant = 'body', muted, color, style, ...rest }: TextProps): React.ReactElement {
  const theme = useTheme();
  const base: TextStyle = {
    ...theme.typography[variant],
    color: color ?? (muted ? theme.colors.textMuted : theme.colors.text),
  };
  return <RNText {...rest} style={[base, style]} />;
}
