import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/gameConfig';

interface AvatarRendererProps {
  playerId: string;
  position: 'batting' | 'bowling';
  animation?: string;
}

// In production, this wraps a Viro3DObject with the player's avatar model
// For now, renders a placeholder indicating where the AR avatar would appear
export default function AvatarRenderer({
  playerId,
  position,
  animation,
}: AvatarRendererProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatar,
          position === 'batting' ? styles.batsman : styles.bowler,
        ]}
      >
        <Text style={styles.positionLabel}>
          {position === 'batting' ? '🏏' : '⚾'}
        </Text>
        <Text style={styles.playerLabel}>{playerId}</Text>
        {animation && <Text style={styles.animLabel}>Anim: {animation}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  batsman: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: COLORS.primaryLight,
  },
  bowler: {
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    borderColor: '#2196F3',
  },
  positionLabel: {
    fontSize: 24,
  },
  playerLabel: {
    fontSize: 8,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  animLabel: {
    fontSize: 7,
    color: COLORS.textSecondary,
  },
});
