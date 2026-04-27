import React from 'react';
import { View } from 'react-native';
// @ts-ignore - react-native-web compatibility
import { ThemeProvider } from '../../../apps/mobile/src/shared/ui/theme/ThemeProvider';

export function withThemeProvider(Story: any, context: any) {
  const theme = context.globals.themes || 'light';

  return (
    <ThemeProvider initialTheme={theme === 'dark' ? 'dark' : 'light'}>
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <Story {...context} />
      </View>
    </ThemeProvider>
  );
}
