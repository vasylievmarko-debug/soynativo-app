import React from 'react';
import { View, type ViewProps } from 'react-native';
import type { ElevationToken } from '@soynativo/design-tokens';
import { useTheme } from '../theme/ThemeProvider';

export interface CardProps extends ViewProps {
  elevation?: ElevationToken;
  padded?: boolean;
}

export function Card({ elevation = 'sm', padded = true, style, ...rest }: CardProps): React.ReactElement {
  const theme = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: padded ? theme.spacing.lg : 0,
          ...theme.elevation[elevation],
        },
        style,
      ]}
    />
  );
}
