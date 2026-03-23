import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FieldPosition } from '../../types/game';
import { COLORS } from '../../constants/gameConfig';

interface FieldPlacementProps {
  positions: FieldPosition[];
  isCaptain?: boolean;
}

export default function FieldPlacement({
  positions,
  isCaptain = false,
}: FieldPlacementProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isCaptain ? 'Set Field Positions' : 'Field Placement'}
      </Text>
      <View style={styles.field}>
        <View style={styles.pitch} />
        {positions.map((pos) => (
          <View
            key={pos.playerId}
            style={[
              styles.fielder,
              { left: `${pos.x}%`, top: `${pos.y}%` },
            ]}
          >
            <View style={styles.fielderDot} />
            <Text style={styles.fielderLabel}>{pos.position}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  field: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    position: 'relative',
  },
  pitch: {
    position: 'absolute',
    top: '35%',
    left: '45%',
    width: '10%',
    height: '30%',
    backgroundColor: 'rgba(76, 175, 80, 0.4)',
    borderRadius: 2,
  },
  fielder: {
    position: 'absolute',
    alignItems: 'center',
  },
  fielderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondaryLight,
  },
  fielderLabel: {
    fontSize: 8,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

