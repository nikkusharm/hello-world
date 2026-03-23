import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Skill } from '../../types/game';
import { COLORS } from '../../constants/gameConfig';

interface SkillSelectorProps {
  skills: Skill[];
  selectedSkill: Skill | null;
  stamina: number;
  onSelect: (skill: Skill) => void;
}

export default function SkillSelector({
  skills,
  selectedSkill,
  stamina,
  onSelect,
}: SkillSelectorProps) {
  const affordable = skills.filter((s) => s.staminaCost <= stamina);
  const unaffordable = skills.filter((s) => s.staminaCost > stamina);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {affordable.map((skill) => (
        <TouchableOpacity
          key={skill.id}
          style={[
            styles.card,
            selectedSkill?.id === skill.id && styles.cardSelected,
          ]}
          onPress={() => onSelect(skill)}
        >
          <Text style={styles.name}>{skill.name}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.bar, { width: `${skill.power * 10}%`, backgroundColor: COLORS.success }]} />
          </View>
          <Text style={styles.statLabel}>Power {skill.power}/10</Text>
          <View style={styles.statsRow}>
            <View style={[styles.bar, { width: `${skill.risk * 10}%`, backgroundColor: COLORS.warning }]} />
          </View>
          <Text style={styles.statLabel}>Risk {skill.risk}/10</Text>
          <Text style={styles.stamina}>Cost: {skill.staminaCost}</Text>
        </TouchableOpacity>
      ))}
      {unaffordable.map((skill) => (
        <View key={skill.id} style={[styles.card, styles.cardDisabled]}>
          <Text style={[styles.name, styles.nameDisabled]}>{skill.name}</Text>
          <Text style={styles.disabledLabel}>Not enough stamina</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    gap: 10,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    minWidth: 130,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.surfaceLight,
  },
  cardDisabled: {
    opacity: 0.4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  nameDisabled: {
    color: COLORS.textSecondary,
  },
  statsRow: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  stamina: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  disabledLabel: {
    fontSize: 11,
    color: COLORS.error,
  },
});

