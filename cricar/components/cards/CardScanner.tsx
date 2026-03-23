import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../constants/gameConfig';

interface CardScannerProps {
  onScanComplete?: (serial: string) => void;
}

export default function CardScanner({ onScanComplete }: CardScannerProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/ar/scanner')}
    >
      <View style={styles.scanArea}>
        <Text style={styles.icon}>📸</Text>
        <Text style={styles.text}>Tap to Scan Card</Text>
        <Text style={styles.subtext}>QR code or NFC for premium cards</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  scanArea: {
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 40,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  subtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});

