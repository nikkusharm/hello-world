// ── FILE: app/game/multiplayer.tsx ───────────────────────────────────
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useMatchStore } from '../../store/matchStore';
import { useAuthStore } from '../../store/authStore';
import { useCollectionStore } from '../../store/collectionStore';

export default function MultiplayerScreen() {
  const [mode, setMode] = useState<'menu' | 'host' | 'join'>('menu');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { ownedPlayers } = useCollectionStore();
  const { createRoom, joinRoom } = useMatchStore();

  const handleHost = async () => {
    if (!user || ownedPlayers.length === 0) { Alert.alert('No Cards', 'Scan a card first!'); return; }
    setLoading(true);
    const code = await createRoom(user.uid, ownedPlayers[0].id, user.email?.split('@')[0] || 'Player');
    setLoading(false);
    setRoomCode(code);
    setMode('host');
  };

  const handleJoin = async () => {
    if (!roomCode || roomCode.length !== 6) { Alert.alert('Invalid code'); return; }
    if (!user || ownedPlayers.length === 0) { Alert.alert('No Cards', 'Scan a card first!'); return; }
    setLoading(true);
    const success = await joinRoom(roomCode, user.uid, ownedPlayers[0].id, user.email?.split('@')[0] || 'Player');
    setLoading(false);
    if (!success) Alert.alert('Room not found', 'Check the code and try again');
  };

  if (mode === 'host') {
    return (
      <View style={ms.container}>
        <Text style={ms.title}>Waiting for opponent...</Text>
        <View style={ms.codeBox}>
          <Text style={ms.codeLabel}>Your Room Code</Text>
          <Text style={ms.code}>{roomCode}</Text>
          <Text style={ms.codeSub}>Share this code with your friend</Text>
        </View>
        <ActivityIndicator size="large" color="#f4a261" style={{ marginTop: 32 }} />
      </View>
    );
  }

  return (
    <View style={ms.container}>
      <Text style={ms.title}>1v1 Match</Text>
      <Text style={ms.sub}>Challenge a friend to a cricket duel</Text>

      <TouchableOpacity style={ms.primaryBtn} onPress={handleHost} disabled={loading}>
        <Text style={ms.primaryBtnText}>🏠 Host a Match</Text>
      </TouchableOpacity>

      <Text style={ms.divider}>— or join an existing room —</Text>

      <TextInput style={ms.input} placeholder="Enter 6-digit room code"
        placeholderTextColor="#666" value={roomCode}
        onChangeText={(t) => setRoomCode(t.toUpperCase())} maxLength={6}
        autoCapitalize="characters" />

      <TouchableOpacity style={[ms.secondaryBtn, loading && { opacity: 0.5 }]} onPress={handleJoin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={ms.secondaryBtnText}>Join Match →</Text>}
      </TouchableOpacity>
    </View>
  );
}

const ms = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 24, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  sub: { color: '#aaa', fontSize: 15, textAlign: 'center', marginBottom: 32 },
  primaryBtn: { backgroundColor: '#f4a261', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 24 },
  primaryBtnText: { color: '#1a1a2e', fontSize: 18, fontWeight: 'bold' },
  divider: { color: '#555', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: '#16213e', borderRadius: 12, padding: 16, color: '#fff', fontSize: 24, textAlign: 'center', letterSpacing: 8, borderWidth: 1, borderColor: '#333', marginBottom: 16 },
  secondaryBtn: { backgroundColor: '#16213e', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 2, borderColor: '#f4a261' },
  secondaryBtnText: { color: '#f4a261', fontSize: 18, fontWeight: 'bold' },
  codeBox: { backgroundColor: '#16213e', borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 2, borderColor: '#f4a261' },
  codeLabel: { color: '#aaa', fontSize: 14, marginBottom: 12 },
  code: { color: '#f4a261', fontSize: 42, fontWeight: 'bold', letterSpacing: 8 },
  codeSub: { color: '#888', fontSize: 13, marginTop: 12 },
});

