import { Stack } from 'expo-router';

export default function ARLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="scanner" />
      <Stack.Screen name="pitch" />
    </Stack>
  );
}
