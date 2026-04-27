// Design tokens — single source of truth for colors, spacing, typography.
// Components MUST consume these via the theme; never hard-code values.

export const palette = {
  brand: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#2563eb',
    600: '#1d4ed8',
    700: '#1e40af',
  },
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    400: '#a1a1aa',
    600: '#52525b',
    800: '#27272a',
    900: '#18181b',
  },
  semantic: {
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#dc2626',
    info: '#0ea5e9',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 } as const;

export const typography = {
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
  h2: { fontSize: 22, lineHeight: 30, fontWeight: '700' as const },
  button: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
} as const;
