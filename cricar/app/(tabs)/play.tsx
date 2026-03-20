import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../constants/gameConfig';

interface GameModeOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  players: string;
}

const GAME_MODES: GameModeOption[] = [
  {
    id: 'solo',
    title: 'Solo Match',
    description: 'Play against AI opponents with four difficulty levels',
    icon: '🤖',
    route: '/game/solo',
    players: '1 Player',
  },
  {
    id: 'multiplayer',
    title: '1v1 Match',
    description: 'Challenge a friend via Bluetooth, WiFi, or online',
    icon: '⚔️',
    route: '/game/multiplayer',
    players: '2 Players',
  },
  {
    id: 'team',
    title: 'Team Match',
    description: 'Build teams of up to 11 players and compete',
    icon: '👥',
    route: '/game/match',
    players: '2-22 Players',
  },
  {
    id: 'tournament',
    title: 'Tournament',
    description: 'Knockout or round-robin with multiple teams',
    icon: '🏆',
    route: '/game/tournament',
    players: '4-16 Teams',
  },
];

export default function PlayTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose Game Mode</Text>
      <View style={styles.modes}>
        {GAME_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={styles.modeCard}
            onPress={() => router.push(mode.route as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.modeIcon}>{mode.icon}</Text>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>{mode.title}</Text>
              <Text style={styles.modeDescription}>{mode.description}</Text>
              <Text style={styles.modePlayers}>{mode.players}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 20,
  },
  modes: {
    gap: 14,
  },
  modeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 16,
  },
  modeIcon: {
    fontSize: 40,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  modePlayers: {
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
});
