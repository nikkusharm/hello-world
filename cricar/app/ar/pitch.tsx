import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Button from '../../components/ui/Button';
import { COLORS } from '../../constants/gameConfig';

// ViroReact AR scene — requires native build (not Expo Go)
// In production this renders ViroARScene with ViroARPlaneSelector,
// ViroSphere for ball, Viro3DObject for avatars, and ViroARPlane for pitch

type PitchPhase = 'detecting' | 'placed' | 'playing';

export default function PitchScreen() {
  const [phase, setPhase] = useState<PitchPhase>('detecting');
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <View style={styles.container}>
      {/* AR Camera view placeholder — ViroARScene renders here in production */}
      <View style={styles.arPlaceholder}>
        {phase === 'detecting' && (
          <View style={styles.detectingOverlay}>
            <View style={styles.pulsingRing} />
            <Text style={styles.detectingText}>
              Point camera at a flat surface to place the cricket pitch
            </Text>
            <TouchableOpacity
              style={styles.placeButton}
              onPress={() => setPhase('placed')}
            >
              <Text style={styles.placeButtonText}>Simulate Surface Detection</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'placed' && (
          <View style={styles.placedOverlay}>
            <Text style={styles.placedText}>Pitch placed! Avatars spawning...</Text>
            <View style={styles.pitchPreview}>
              <View style={styles.pitchLine} />
              <View style={styles.crease} />
              <Text style={styles.batsmanLabel}>Batsman</Text>
              <Text style={styles.bowlerLabel}>Bowler</Text>
            </View>
            <Button
              title="Start Playing"
              onPress={() => setPhase('playing')}
              size="large"
              style={{ marginTop: 24 }}
            />
          </View>
        )}

        {phase === 'playing' && (
          <View style={styles.playingOverlay}>
            <Text style={styles.playingText}>AR Match Active</Text>
            <Text style={styles.playingSubtext}>
              Pinch to zoom, two-finger drag to orbit
            </Text>
          </View>
        )}
      </View>

      {/* Mini-map */}
      <View style={styles.miniMap}>
        <View style={styles.miniMapDot} />
        <Text style={styles.miniMapLabel}>Top View</Text>
      </View>

      {/* Settings toggle */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setSoundEnabled(!soundEnabled)}
      >
        <Text style={styles.settingsIcon}>
          {soundEnabled ? '🔊' : '🔇'}
        </Text>
      </TouchableOpacity>

      {/* Close button */}
      <Button
        title="Exit AR"
        onPress={() => router.back()}
        variant="ghost"
        style={styles.closeButton}
        textStyle={{ color: '#FFFFFF' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  arPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectingOverlay: {
    alignItems: 'center',
    padding: 24,
  },
  pulsingRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
    marginBottom: 24,
    opacity: 0.7,
  },
  detectingText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  placeButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  placeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  placedOverlay: {
    alignItems: 'center',
    padding: 24,
  },
  placedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  pitchPreview: {
    width: 200,
    height: 300,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pitchLine: {
    width: 2,
    height: '80%',
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
  },
  crease: {
    position: 'absolute',
    width: '60%',
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
    top: '20%',
  },
  batsmanLabel: {
    position: 'absolute',
    bottom: 20,
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
  bowlerLabel: {
    position: 'absolute',
    top: 20,
    color: COLORS.secondaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
  playingOverlay: {
    alignItems: 'center',
  },
  playingText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  playingSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  miniMap: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 80,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMapDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryLight,
  },
  miniMapLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
});

