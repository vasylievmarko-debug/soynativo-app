import React, { useCallback } from 'react';
import { FlashList, type FlashListProps } from '@shopify/flash-list';

export interface ListProps<T> extends Omit<FlashListProps<T>, 'estimatedItemSize'> {
  estimatedItemSize?: number;
}

/**
 * Wrapper over Shopify's FlashList. Use this for any list ≥ 20 items —
 * it recycles cells (no layout-thrashing on scroll) and outperforms FlatList
 * by ~5-10x on large datasets.
 *
 * `estimatedItemSize` is REQUIRED for best perf. Measure once on the device
 * (a typical row in pixels) and hard-code it. Wrong value = jank, not crash.
 */
export function List<T>({
  estimatedItemSize = 64,
  ...rest
}: ListProps<T>): React.ReactElement {
  // FlashList expects keyExtractor to be referentially stable. Provide a
  // sensible default that uses `id` if items have one.
  const keyExtractor = useCallback(
    (item: T, index: number): string => {
      const maybeId = (item as { id?: string }).id;
      return maybeId ?? String(index);
    },
    []
  );

  return <FlashList keyExtractor={keyExtractor} estimatedItemSize={estimatedItemSize} {...rest} />;
}
