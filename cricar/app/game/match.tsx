import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Button from '../../components/ui/Button';
import { COLORS, GAME_CONFIG } from '../../constants/gameConfig';
import { assignRoles } from '../../utils/teamBuilder';

type Phase = 'setup' | 'lobby' | 'playing';

export default function TeamMatchScreen() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedOvers, setSelectedOvers] = useState(10);
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([]);

  const teamARoles = assignRoles(teamAPlayers.length || 1);
  const teamBRoles = assignRoles(teamBPlayers.length || 1);

  if (phase === 'setup') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Team Match</Text>
        <Text style={styles.subtitle}>2-22 players, auto-assigned by card team</Text>

        <Text style={styles.sectionTitle}>Match Overs</Text>
        <View style={styles.oversRow}>
          {GAME_CONFIG.OVER_OPTIONS.map((overs) => (
            <TouchableOpacity
              key={overs}
              style={[
                styles.overOption,
                selectedOvers === overs && styles.overSelected,
              ]}
              onPress={() => setSelectedOvers(overs)}
            >
              <Text
                style={[
                  styles.overText,
                  selectedOvers === overs && styles.overTextSelected,
                ]}
              >
                {overs}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Team Setup</Text>
        <View style={styles.teamInfo}>
          <View style={styles.teamCard}>
            <Text style={styles.teamName}>Team A</Text>
            <Text style={styles.teamDetail}>Players: {teamAPlayers.length || 0}</Text>
            <Text style={styles.teamDetail}>AI Fill: {teamARoles.needsAIFill}</Text>
          </View>
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.teamCard}>
            <Text style={styles.teamName}>Team B</Text>
            <Text style={styles.teamDetail}>Players: {teamBPlayers.length || 0}</Text>
            <Text style={styles.teamDetail}>AI Fill: {teamBRoles.needsAIFill}</Text>
          </View>
        </View>

        <Text style={styles.instructionText}>
          Players scan their cards to join. Teams are auto-assigned based on the
          cricketer's national team. The room creator becomes captain with field
          placement and bowling rotation controls.
        </Text>

        <Button
          title="Create Room"
          onPress={() => setPhase('lobby')}
          size="large"
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    );
  }

  if (phase === 'lobby') {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>Team Lobby</Text>
        <Text style={styles.subtitle}>Waiting for players to scan cards and join...</Text>

        <View style={styles.teamInfo}>
          <View style={styles.teamCard}>
            <Text style={styles.teamName}>Team A</Text>
            <Text style={styles.teamDetail}>0/11 players</Text>
          </View>
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.teamCard}>
            <Text style={styles.teamName}>Team B</Text>
            <Text style={styles.teamDetail}>0/11 players</Text>
          </View>
        </View>

        <Button
          title="Start Match"
          onPress={() => setPhase('playing')}
          size="large"
          style={{ marginTop: 24 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.centered]}>
      <Text style={styles.title}>Match In Progress</Text>
      <Text style={styles.subtitle}>
        Captain controls, fielder minigames, and AR pitch active
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  content: {
    paddingBottom: 40,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  oversRow: {
    flexDirection: 'row',
    gap: 12,
  },
  overOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  overSelected: {
    borderColor: COLORS.primaryLight,
  },
  overText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  overTextSelected: {
    color: COLORS.primaryLight,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  teamCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  teamDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondaryLight,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 16,
  },
});
