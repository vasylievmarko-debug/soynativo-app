import React from 'react';
import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';

export interface ImageProps extends ExpoImageProps {}

/**
 * Use this everywhere instead of `react-native`'s `Image`. expo-image gives:
 *   - native disk + memory cache (huge difference for list scrolls)
 *   - blurhash/thumbhash placeholders (no layout shift, perceived speed)
 *   - automatic priority handling (in-viewport > offscreen)
 *   - GIF/WebP/AVIF without polyfills
 *
 * Default `cachePolicy` is `memory-disk` — the right choice for almost
 * everything. Override only if you have a reason.
 */
export function Image(props: ImageProps): React.ReactElement {
  return <ExpoImage cachePolicy="memory-disk" transition={150} {...props} />;
}
