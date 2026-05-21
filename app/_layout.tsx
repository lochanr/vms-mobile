import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,       // we build our own headers
            contentStyle: { backgroundColor: '#080c14' },
            animation: 'slide_from_right',
          }}
        />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
