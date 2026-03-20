import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Skill } from '../../types/game';
import { COLORS } from '../../constants/gameConfig';

interface SkillBadgeProps {
  skill: Skill;
  showDetails?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  batting: '#4CAF50',
  bowling: '#2196F3',
  fielding: '#FF9800',
};

export default function SkillBadge({ skill, showDetails = false }: SkillBadgeProps) {
  const color = TYPE_COLORS[skill.type] || COLORS.textSecondary;

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.name, { color }]}>{skill.name}</Text>
      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.detail}>PWR {skill.power}</Text>
          <Text style={styles.detail}>RSK {skill.risk}</Text>
          <Text style={styles.detail}>STA {skill.staminaCost}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  detail: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
});
