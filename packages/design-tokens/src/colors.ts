/**
 * Color palette — primitives. Components MUST NOT use these directly; they
 * should consume semantic colors from `theme.colors` (in apps/mobile). This
 * separation means we can change the palette (rebrand) without touching
 * components.
 */
export const palette = {
  brand: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#2563eb',
    600: '#1d4ed8',
    700: '#1e40af',
    800: '#1e3a8a',
    900: '#172554',
  },
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    1000: '#09090b',
  },
  semantic: {
    success: '#16a34a',
    successSoft: '#dcfce7',
    warning: '#f59e0b',
    warningSoft: '#fef3c7',
    danger: '#dc2626',
    dangerSoft: '#fee2e2',
    info: '#0ea5e9',
    infoSoft: '#e0f2fe',
  },
} as const;
