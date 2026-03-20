import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Button from '../../components/ui/Button';
import { COLORS } from '../../constants/gameConfig';

export default function ScanTab() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📸</Text>
        <Text style={styles.title}>Scan a Card</Text>
        <Text style={styles.description}>
          Point your camera at a CricAR card to activate your player and unlock their skills.
        </Text>
        <Button
          title="Open Scanner"
          onPress={() => router.push('/ar/scanner')}
          size="large"
          style={styles.button}
        />
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recently Scanned</Text>
        <Text style={styles.emptyText}>No cards scanned yet. Tap above to start!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
  recentSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
