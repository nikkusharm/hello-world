import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useCollectionStore } from '../../store/collectionStore';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { ownedCards } = useCollectionStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await signOut();
        router.replace('/(auth)/onboarding');
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>🏏</Text>
      </View>
      <Text style={styles.name}>{user?.email?.split('@')[0] || 'Cricketer'}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.stats}>
        {[
          { label: 'Cards', value: ownedCards.length.toString() },
          { label: 'Matches', value: '0' },
          { label: 'Wins', value: '0' },
        ].map((s, i) => (
          <View key={i} style={styles.stat}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', padding: 24, paddingTop: 48 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#16213e', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 3, borderColor: '#f4a261' },
  avatarEmoji: { fontSize: 48 },
  name: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  email: { color: '#888', fontSize: 14, marginBottom: 32 },
  stats: { flexDirection: 'row', gap: 24, marginBottom: 40 },
  stat: { alignItems: 'center', backgroundColor: '#16213e', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 16, minWidth: 80 },
  statValue: { color: '#f4a261', fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: '#aaa', fontSize: 12, marginTop: 4 },
  signOutBtn: { backgroundColor: '#9b2226', borderRadius: 12, paddingHorizontal: 40, paddingVertical: 14, marginTop: 'auto' },
  signOutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

