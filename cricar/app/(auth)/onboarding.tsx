import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🏏</Text>
        <Text style={styles.title}>CricAR</Text>
        <Text style={styles.subtitle}>Scan cricket cards.{'\n'}Play AR matches.</Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '📸', text: 'Scan physical cards to unlock player avatars' },
          { icon: '🏟️', text: 'Play on an AR pitch in your living room' },
          { icon: '⚡', text: 'Use real player skills and stats' },
          { icon: '🌐', text: 'Challenge friends online or nearby' },
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#f4a261',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 26,
  },
  features: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    color: '#cccccc',
    fontSize: 15,
    flex: 1,
  },
  buttons: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#f4a261',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f4a261',
  },
  secondaryBtnText: {
    color: '#f4a261',
    fontSize: 16,
  },
});

