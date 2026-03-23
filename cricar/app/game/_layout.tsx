import { Stack } from 'expo-router';
import { COLORS } from '../../constants/gameConfig';

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="solo" options={{ title: 'Solo Match' }} />
      <Stack.Screen name="multiplayer" options={{ title: '1v1 Match' }} />
      <Stack.Screen name="match" options={{ title: 'Team Match' }} />
      <Stack.Screen name="tournament" options={{ title: 'Tournament' }} />
    </Stack>
  );
}

