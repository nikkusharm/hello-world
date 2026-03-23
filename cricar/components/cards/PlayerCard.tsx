import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player } from '../../types/player';
import { COLORS } from '../../constants/gameConfig';
import SkillBadge from './SkillBadge';

interface PlayerCardProps {
  player: Player;
  compact?: boolean;
}

export default function PlayerCard({ player, compact = false }: PlayerCardProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <Text style={styles.name}>{player.name}</Text>
        <View style={styles.yearBadge}>
          <Text style={styles.yearText}>{player.year}</Text>
        </View>
      </View>
      <Text style={styles.team}>{player.team}</Text>
      <Text style={styles.role}>{player.role}</Text>

      {!compact && (
        <>
          <View style={styles.statsRow}>
            {player.role !== 'bowler' && (
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {player.stats.batting.average.toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Avg</Text>
              </View>
            )}
            {player.role !== 'bowler' && (
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {player.stats.batting.strikeRate.toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>SR</Text>
              </View>
            )}
            {(player.role === 'bowler' || player.role === 'allrounder') && (
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {player.stats.bowling.economy.toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Econ</Text>
              </View>
            )}
          </View>

          <View style={styles.skills}>
            {player.skills.slice(0, 4).map((skill) => (
              <SkillBadge key={skill.id} skill={skill} />
            ))}
            {player.skills.length > 4 && (
              <Text style={styles.moreSkills}>+{player.skills.length - 4}</Text>
            )}
          </View>
        </>
      )}

      {player.isLegacy && (
        <View style={styles.legacyBadge}>
          <Text style={styles.legacyText}>LEGEND</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardCompact: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },
  yearBadge: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.cardGold,
  },
  team: {
    fontSize: 14,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  role: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  moreSkills: {
    fontSize: 12,
    color: COLORS.textSecondary,
    alignSelf: 'center',
  },
  legacyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.cardGold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  legacyText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
});

