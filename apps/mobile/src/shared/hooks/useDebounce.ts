import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Debounces a value. Use for search inputs to avoid firing a request on every
 * keystroke.
 *
 *   const [q, setQ] = useState('');
 *   const debouncedQ = useDebounce(q, 250);
 *   const { data } = useQuery({ queryKey: ['search', debouncedQ], ... });
 */
export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Debounces a callback. Use when the callback identity matters (passing to a
 * memoized child) and you want to throttle invocations.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delayMs = 250
): (...args: TArgs) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return useCallback(
    (...args: TArgs) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fnRef.current(...args), delayMs);
    },
    [delayMs]
  );
}
