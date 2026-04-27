import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  centered?: boolean;
}

export function Spinner({ size = 'small', color, centered }: SpinnerProps): React.ReactElement {
  const theme = useTheme();
  const indicator = <ActivityIndicator size={size} color={color ?? theme.colors.primary} />;
  if (!centered) return indicator;
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>{indicator}</View>;
}
