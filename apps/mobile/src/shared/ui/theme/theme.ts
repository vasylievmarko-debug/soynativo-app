import {
  palette,
  spacing,
  radius,
  typography,
  motion,
  elevation,
} from '@soynativo/design-tokens';

/**
 * Theme = semantic mapping over primitive tokens. Components consume **theme**,
 * never the palette directly. To rebrand: change this file. To support a
 * teacher-school white-label: add another theme variant here.
 */
export interface Theme {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    text: string;
    textMuted: string;
    border: string;
    primary: string;
    primaryText: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    danger: string;
    dangerSoft: string;
    info: string;
  };
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  motion: typeof motion;
  elevation: typeof elevation;
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: palette.neutral[0],
    surface: palette.neutral[50],
    surfaceMuted: palette.neutral[100],
    text: palette.neutral[900],
    textMuted: palette.neutral[600],
    border: palette.neutral[200],
    primary: palette.brand[500],
    primaryText: palette.neutral[0],
    success: palette.semantic.success,
    successSoft: palette.semantic.successSoft,
    warning: palette.semantic.warning,
    warningSoft: palette.semantic.warningSoft,
    danger: palette.semantic.danger,
    dangerSoft: palette.semantic.dangerSoft,
    info: palette.semantic.info,
  },
  spacing,
  radius,
  typography,
  motion,
  elevation,
};

export const darkTheme: Theme = {
  ...lightTheme,
  mode: 'dark',
  colors: {
    ...lightTheme.colors,
    background: palette.neutral[1000],
    surface: palette.neutral[900],
    surfaceMuted: palette.neutral[800],
    text: palette.neutral[50],
    textMuted: palette.neutral[400],
    border: palette.neutral[800],
  },
};
