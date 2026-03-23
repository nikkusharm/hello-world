import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function IndexScreen() {
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)/scan');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏏 CricAR</Text>
      <ActivityIndicator size="large" color="#f4a261" style={{ marginTop: 20 }} />
      <Text style={styles.sub}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 48,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  sub: {
    color: '#aaaaaa',
    marginTop: 12,
    fontSize: 14,
  },
});

