import { palette, radius, spacing, typography } from './tokens';

export interface Theme {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    primary: string;
    primaryText: string;
    success: string;
    danger: string;
  };
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: palette.neutral[0],
    surface: palette.neutral[50],
    text: palette.neutral[900],
    textMuted: palette.neutral[600],
    border: palette.neutral[200],
    primary: palette.brand[500],
    primaryText: palette.neutral[0],
    success: palette.semantic.success,
    danger: palette.semantic.danger,
  },
  spacing,
  radius,
  typography,
};

export const darkTheme: Theme = {
  ...lightTheme,
  mode: 'dark',
  colors: {
    ...lightTheme.colors,
    background: palette.neutral[900],
    surface: palette.neutral[800],
    text: palette.neutral[50],
    textMuted: palette.neutral[400],
    border: palette.neutral[800],
  },
};
