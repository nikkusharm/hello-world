import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SessionPlayer } from '../../types/match';
import { COLORS } from '../../constants/gameConfig';

interface CaptainControlsProps {
  bowlers: SessionPlayer[];
  drsRemaining: number;
  onSelectBowler: (playerId: string) => void;
  onDRS: () => void;
  onFieldPlacement: () => void;
}

export default function CaptainControls({
  bowlers,
  drsRemaining,
  onSelectBowler,
  onDRS,
  onFieldPlacement,
}: CaptainControlsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Captain Controls</Text>

      <TouchableOpacity style={styles.actionButton} onPress={onFieldPlacement}>
        <Text style={styles.actionIcon}>🗺️</Text>
        <Text style={styles.actionText}>Field Placement</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Next Bowler</Text>
      {bowlers.map((bowler) => (
        <TouchableOpacity
          key={bowler.userId}
          style={styles.bowlerRow}
          onPress={() => onSelectBowler(bowler.userId)}
        >
          <Text style={styles.bowlerName}>{bowler.playerId}</Text>
          <Text style={styles.bowlerStats}>
            {bowler.stats.oversBowled} overs | Econ: {
              bowler.stats.oversBowled > 0
                ? (bowler.stats.runsConceded / bowler.stats.oversBowled).toFixed(1)
                : '0.0'
            }
          </Text>
        </TouchableOpacity>
      ))}

      {drsRemaining > 0 && (
        <TouchableOpacity style={styles.drsButton} onPress={onDRS}>
          <Text style={styles.drsText}>DRS Review ({drsRemaining} left)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  bowlerRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bowlerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  bowlerStats: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  drsButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  drsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

