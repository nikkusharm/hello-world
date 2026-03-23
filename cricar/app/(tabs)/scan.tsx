import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function ScanScreen() {
  const { user } = useAuthStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Welcome back 👋</Text>
      <Text style={styles.name}>{user?.email?.split('@')[0] || 'Cricketer'}</Text>

      <TouchableOpacity
        style={styles.scanCard}
        onPress={() => router.push('/ar/scanner')}
      >
        <Text style={styles.scanEmoji}>📸</Text>
        <Text style={styles.scanTitle}>Scan a Cricket Card</Text>
        <Text style={styles.scanSub}>Point your camera at a CricAR card to unlock the player</Text>
        <View style={styles.scanBtn}>
          <Text style={styles.scanBtnText}>Open Scanner →</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Quick Play</Text>

      <View style={styles.grid}>
        {[
          { emoji: '🤖', title: 'vs Computer', sub: 'Solo match', route: '/game/solo' },
          { emoji: '🆚', title: '1v1 Match', sub: 'Challenge a friend', route: '/game/multiplayer' },
          { emoji: '🏟️', title: 'Team Match', sub: 'Full 11v11', route: '/game/match' },
          { emoji: '🏆', title: 'Tournament', sub: 'Compete for glory', route: '/game/tournament' },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.gridItem}
            onPress={() => router.push(item.route as any)}
          >
            <Text style={styles.gridEmoji}>{item.emoji}</Text>
            <Text style={styles.gridTitle}>{item.title}</Text>
            <Text style={styles.gridSub}>{item.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 20, paddingBottom: 40 },
  greeting: { color: '#aaaaaa', fontSize: 16, marginTop: 8 },
  name: { color: '#ffffff', fontSize: 26, fontWeight: 'bold', marginBottom: 24 },
  scanCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f4a261',
    marginBottom: 32,
  },
  scanEmoji: { fontSize: 48, marginBottom: 12 },
  scanTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  scanSub: { color: '#aaaaaa', fontSize: 14, textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  scanBtn: { backgroundColor: '#f4a261', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  scanBtnText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    borderWidth: 1,
    borderColor: '#333',
  },
  gridEmoji: { fontSize: 32, marginBottom: 8 },
  gridTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  gridSub: { color: '#888', fontSize: 12 },
});

