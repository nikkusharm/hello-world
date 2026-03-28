import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      initialize();
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    }
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a2e', padding: 20, paddingTop: 60 }}>
        <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          App Error:
        </Text>
        <ScrollView>
          <Text style={{ color: 'white', fontSize: 14 }}>{error}</Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#ffffff',
          contentStyle: { backgroundColor: '#1a1a2e' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ar/scanner" options={{ title: 'Scan Card' }} />
        <Stack.Screen name="game/solo" options={{ title: 'Solo Match' }} />
        <Stack.Screen name="game/multiplayer" options={{ title: '1v1 Match' }} />
        <Stack.Screen name="game/match" options={{ title: 'Team Match' }} />
        <Stack.Screen name="game/tournament" options={{ title: 'Tournament' }} />
      </Stack>
    </>
  );
}