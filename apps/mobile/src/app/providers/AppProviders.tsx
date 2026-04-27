import React, { useMemo } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@shared/i18n';
import { ThemeProvider } from '@shared/ui/theme/ThemeProvider';
import { queryCacheStorage } from '@shared/api/query-cache-storage';

const ONE_HOUR = 1000 * 60 * 60;

/**
 * Build a persistent React Query cache. On cold start, the cache is hydrated
 * synchronously from MMKV before first paint — users see real data
 * immediately while the app refetches in the background.
 *
 * - `staleTime: 30s` — most data is "fresh enough" for half a minute, no
 *   refetch on focus.
 * - `gcTime: 1h` — unreferenced cache stays around for an hour so navigating
 *   back doesn't refetch.
 * - `retry` is conservative on 4xx (client error → retry won't help).
 */
function createClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: ONE_HOUR,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: unknown) => {
          const status = (error as { response?: { status?: number } }).response?.status;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 3;
        },
      },
      mutations: { retry: 1 },
    },
  });
}

const persister = createSyncStoragePersister({ storage: queryCacheStorage });

export function AppProviders({ children }: { children: React.ReactNode }): React.ReactElement {
  const queryClient = useMemo(() => createClient(), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister,
            maxAge: ONE_HOUR,
            // Bump this when the schema of cached data changes — old cache
            // is dropped instead of silently feeding stale shapes to UI.
            buster: 'v1',
          }}
        >
          <ThemeProvider>{children}</ThemeProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
