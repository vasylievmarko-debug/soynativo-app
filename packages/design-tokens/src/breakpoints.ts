/**
 * Breakpoints in dp. Mobile-first: code defaults assume the smallest, and we
 * adapt up. Used today for tablet layouts; reused by web admin in future.
 */
export const breakpoints = {
  phone: 0,
  phablet: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export type Breakpoint = keyof typeof breakpoints;
