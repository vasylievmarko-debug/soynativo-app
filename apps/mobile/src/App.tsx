import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import RootNavigator from './navigation/RootNavigator';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
