/**
 * Motion tokens — durations and easings. Always use these instead of magic
 * numbers in `withTiming`/`Animated.timing` so the whole app feels coherent
 * and respects "Reduce Motion".
 */
export const motion = {
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    slow: 400,
    sluggish: 600,
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  },
} as const;
