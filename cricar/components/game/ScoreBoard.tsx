import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MatchContext } from '../../types/game';
import { COLORS } from '../../constants/gameConfig';

interface ScoreBoardProps {
  runs: number;
  wickets: number;
  overs: number;
  totalOvers: number;
  ballsInOver: number;
  target?: number;
  matchContext: MatchContext;
}

export default function ScoreBoard({
  runs,
  wickets,
  overs,
  totalOvers,
  ballsInOver,
  target,
  matchContext,
}: ScoreBoardProps) {
  const runsNeeded = target ? target - runs : undefined;

  return (
    <View style={styles.container}>
      <Text style={styles.score}>
        {runs}/{wickets}
      </Text>
      <Text style={styles.overs}>
        {overs}.{ballsInOver}/{totalOvers} overs
      </Text>
      {runsNeeded !== undefined && runsNeeded > 0 && (
        <Text style={styles.target}>
          Need {runsNeeded} from {matchContext.ballsLeft} balls
        </Text>
      )}
      <View style={styles.staminaRow}>
        <Text style={styles.staminaLabel}>Stamina</Text>
        <View style={styles.staminaBar}>
          <View
            style={[
              styles.staminaFill,
              {
                width: `${matchContext.batsmanStamina}%`,
                backgroundColor:
                  matchContext.batsmanStamina > 50
                    ? COLORS.success
                    : matchContext.batsmanStamina > 25
                    ? COLORS.warning
                    : COLORS.error,
              },
            ]}
          />
        </View>
        <Text style={styles.staminaValue}>
          {Math.round(matchContext.batsmanStamina)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  score: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.text,
  },
  overs: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  target: {
    fontSize: 14,
    color: COLORS.secondaryLight,
    fontWeight: '600',
    marginTop: 4,
  },
  staminaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    width: '100%',
  },
  staminaLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 50,
  },
  staminaBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  staminaFill: {
    height: '100%',
    borderRadius: 3,
  },
  staminaValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 35,
    textAlign: 'right',
  },
});
