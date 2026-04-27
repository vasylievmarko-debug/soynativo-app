import React from 'react';
import { View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

export interface ScreenProps extends ViewProps {
  padded?: boolean;
}

export function Screen({ padded = true, style, children, ...rest }: ScreenProps): React.ReactElement {
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <View
        {...rest}
        style={[{ flex: 1, paddingHorizontal: padded ? theme.spacing.lg : 0 }, style]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
