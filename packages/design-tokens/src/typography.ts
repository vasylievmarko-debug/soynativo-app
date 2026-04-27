/**
 * Typography scale. `fontFamily` defaults to system; override per-platform
 * once we add a custom font.
 */
export const typography = {
  display: { fontSize: 36, lineHeight: 44, fontWeight: '700' as const, letterSpacing: -0.5 },
  h1: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const, letterSpacing: -0.25 },
  h2: { fontSize: 22, lineHeight: 30, fontWeight: '700' as const },
  h3: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  button: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
