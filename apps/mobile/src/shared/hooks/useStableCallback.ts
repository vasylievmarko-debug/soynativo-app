import { useCallback, useRef } from 'react';

/**
 * Returns a referentially stable function whose body is always the latest
 * version. Use as a drop-in replacement for `useCallback(fn, [a, b, c])`
 * when you want stability without dependency-array maintenance.
 *
 * Prefer this for callbacks passed as props to memoized children: they get
 * a stable identity so React.memo actually pays off.
 *
 *   const onPress = useStableCallback(() => doStuff(state));
 *   <ListItem onPress={onPress} />  // never re-renders
 *
 * Caveat: never use the returned function during render (e.g. as a render
 * prop's value during the same render where state changed) — it reads the
 * latest, which may be a render-time stale closure.
 */
export function useStableCallback<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn
): (...args: TArgs) => TReturn {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: TArgs) => ref.current(...args), []);
}
