// play.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
export default function PlayScreen() {
  const modes = [
    { emoji: '🤖', title: 'Solo vs Computer', sub: 'Play against AI — 4 difficulty levels', route: '/game/solo', color: '#2d6a4f' },
    { emoji: '🆚', title: '1v1 Online', sub: 'Challenge a friend anywhere', route: '/game/multiplayer', color: '#9b2226' },
    { emoji: '🏟️', title: 'Team Match', sub: 'Full 11v11 with your squad', route: '/game/match', color: '#1d3557' },
    { emoji: '🏆', title: 'Tournament', sub: 'Compete in knockout or round robin', route: '/game/tournament', color: '#7b2d8b' },
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1a1a2e' }} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 8 }}>Choose Mode</Text>
      {modes.map((m, i) => (
        <TouchableOpacity key={i} onPress={() => router.push(m.route as any)}
          style={{ backgroundColor: '#16213e', borderRadius: 20, padding: 20, borderLeftWidth: 4, borderLeftColor: m.color }}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>{m.emoji}</Text>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{m.title}</Text>
          <Text style={{ color: '#aaa', fontSize: 14, marginTop: 4 }}>{m.sub}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

