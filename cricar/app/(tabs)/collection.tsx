// ════════════════════════════════════════════════════════════════════
// COPY EACH SECTION TO ITS RESPECTIVE FILE
// ════════════════════════════════════════════════════════════════════

// ── FILE: app/(tabs)/collection.tsx ─────────────────────────────────
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCollectionStore } from '../../store/collectionStore';

export default function CollectionScreen() {
  const { user } = useAuthStore();
  const { ownedCards, ownedPlayers, isLoading, loadCollection } = useCollectionStore();

  useEffect(() => {
    if (user) loadCollection(user.uid);
  }, [user]);

  if (isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#f4a261" />
        <Text style={s.loadText}>Loading your collection...</Text>
      </View>
    );
  }

  if (ownedCards.length === 0) {
    return (
      <View style={s.center}>
        <Text style={s.emptyEmoji}>📦</Text>
        <Text style={s.emptyTitle}>No cards yet</Text>
        <Text style={s.emptySub}>Scan your first CricAR card to get started</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.header}>My Collection ({ownedCards.length} cards)</Text>
      <FlatList
        data={ownedCards}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const player = ownedPlayers.find((p) => p.id === item.playerId);
          return (
            <View style={s.card}>
              <Text style={s.cardEmoji}>🏏</Text>
              <Text style={s.cardName}>{player?.name || 'Unknown Player'}</Text>
              <Text style={s.cardTeam}>{player?.team || ''}</Text>
              <Text style={s.cardYear}>{item.packYear}</Text>
              <View style={[s.roleBadge, { backgroundColor: getRoleColor(player?.role) }]}>
                <Text style={s.roleText}>{player?.role || 'player'}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

function getRoleColor(role?: string) {
  switch (role) {
    case 'batsman': return '#2d6a4f';
    case 'bowler': return '#9b2226';
    case 'allrounder': return '#7b2d8b';
    case 'wicketkeeper': return '#1d3557';
    default: return '#333';
  }
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  center: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: { color: '#fff', fontSize: 20, fontWeight: 'bold', padding: 16 },
  list: { paddingHorizontal: 12, paddingBottom: 20 },
  card: { flex: 1, margin: 6, backgroundColor: '#16213e', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  cardEmoji: { fontSize: 36, marginBottom: 8 },
  cardName: { color: '#fff', fontWeight: 'bold', fontSize: 14, textAlign: 'center', marginBottom: 4 },
  cardTeam: { color: '#f4a261', fontSize: 12, marginBottom: 4 },
  cardYear: { color: '#888', fontSize: 11, marginBottom: 8 },
  roleBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  roleText: { color: '#fff', fontSize: 11, textTransform: 'capitalize' },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  emptySub: { color: '#888', fontSize: 15, textAlign: 'center' },
  loadText: { color: '#888', marginTop: 12 },
});

