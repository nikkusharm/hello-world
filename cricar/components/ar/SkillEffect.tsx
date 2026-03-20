import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BallOutcome } from '../../types/game';
import { COLORS } from '../../constants/gameConfig';

interface SkillEffectProps {
  outcome: BallOutcome | null;
  visible: boolean;
}

// In production, this triggers ViroAnimations and particle effects
// Placeholder for development
export default function SkillEffect({ outcome, visible }: SkillEffectProps) {
  if (!visible || !outcome) return null;

  const colors: Record<string, string> = {
    six: '#FFD700',
    four: '#4CAF50',
    wicket: '#EF5350',
    dot: '#78909C',
    single: '#FFFFFF',
    double: '#FFFFFF',
    triple: '#FFFFFF',
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors[outcome.outcome] || COLORS.text }]}>
        {outcome.outcome.toUpperCase()}
      </Text>
      {outcome.runs > 0 && (
        <Text style={styles.runs}>{outcome.runs} runs</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  text: {
    fontSize: 32,
    fontWeight: '900',
  },
  runs: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
