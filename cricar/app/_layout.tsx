import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#1a1a2e' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ar/scanner" options={{ title: 'Scan Card', presentation: 'modal' }} />
        <Stack.Screen name="ar/pitch" options={{ title: 'AR Pitch', headerShown: false }} />
        <Stack.Screen name="game/solo" options={{ title: 'Solo Match' }} />
        <Stack.Screen name="game/multiplayer" options={{ title: '1v1 Match' }} />
        <Stack.Screen name="game/match" options={{ title: 'Team Match' }} />
        <Stack.Screen name="game/tournament" options={{ title: 'Tournament' }} />
      </Stack>
    </>
  );
}

