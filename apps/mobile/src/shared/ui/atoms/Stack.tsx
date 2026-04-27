import React from 'react';
import { View, type ViewProps } from 'react-native';
import type { SpacingToken } from '@soynativo/design-tokens';
import { useTheme } from '../theme/ThemeProvider';

export interface StackProps extends ViewProps {
  direction?: 'row' | 'column';
  gap?: SpacingToken;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
}

/**
 * Layout primitive — replaces ad-hoc View+styles for stacking children.
 * Pull from spacing tokens, not magic numbers.
 */
export function Stack({
  direction = 'column',
  gap = 'md',
  align,
  justify,
  style,
  ...rest
}: StackProps): React.ReactElement {
  const theme = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: direction,
          gap: theme.spacing[gap],
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
    />
  );
}
