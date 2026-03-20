import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import { COLORS, GAME_CONFIG } from '../../constants/gameConfig';
import { createTournament, joinTournament } from '../../services/tournament';
import { TournamentFormat } from '../../types/match';

type Phase = 'menu' | 'create' | 'join' | 'bracket';

export default function TournamentScreen() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [format, setFormat] = useState<TournamentFormat>('knockout');
  const [overLimit, setOverLimit] = useState(10);
  const [maxTeams, setMaxTeams] = useState<number>(8);
  const [inviteCode, setInviteCode] = useState('');
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuthStore();

  async function handleCreate() {
    if (!user) return;
    setIsLoading(true);
    try {
      const id = await createTournament(user.uid, format, overLimit, maxTeams);
      setTournamentId(id);
      setPhase('bracket');
    } catch {
      Alert.alert('Error', 'Failed to create tournament.');
    }
    setIsLoading(false);
  }

  async function handleJoin() {
    if (!inviteCode.trim()) return;
    setIsLoading(true);
    try {
      const result = await joinTournament(inviteCode.trim(), {
        id: `team_${Date.now()}`,
        name: user?.displayName || 'Team',
        captainUserId: user?.uid || '',
        playerIds: [],
        points: 0,
        nrr: 0,
      });
      if (result.success) {
        setTournamentId(result.tournamentId || null);
        setPhase('bracket');
      } else {
        Alert.alert('Error', result.error || 'Failed to join tournament.');
      }
    } catch {
      Alert.alert('Error', 'Failed to join tournament.');
    }
    setIsLoading(false);
  }

  // MAIN MENU
  if (phase === 'menu') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tournament</Text>
        <Text style={styles.subtitle}>
          Compete in multi-team knockout or round-robin tournaments
        </Text>

        <View style={styles.options}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => setPhase('create')}
          >
            <Text style={styles.optionIcon}>🏆</Text>
            <Text style={styles.optionTitle}>Create Tournament</Text>
            <Text style={styles.optionDesc}>
              Set format, overs, and invite teams
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => setPhase('join')}
          >
            <Text style={styles.optionIcon}>🎫</Text>
            <Text style={styles.optionTitle}>Join Tournament</Text>
            <Text style={styles.optionDesc}>Enter an invite code to join</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // CREATE FLOW
  if (phase === 'create') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Tournament</Text>

        <Text style={styles.sectionTitle}>Format</Text>
        <View style={styles.formatRow}>
          <TouchableOpacity
            style={[
              styles.formatOption,
              format === 'knockout' && styles.formatSelected,
            ]}
            onPress={() => setFormat('knockout')}
          >
            <Text style={styles.formatText}>Knockout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.formatOption,
              format === 'round_robin' && styles.formatSelected,
            ]}
            onPress={() => setFormat('round_robin')}
          >
            <Text style={styles.formatText}>Round Robin</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Overs per Match</Text>
        <View style={styles.oversRow}>
          {GAME_CONFIG.OVER_OPTIONS.map((o) => (
            <TouchableOpacity
              key={o}
              style={[styles.overOption, overLimit === o && styles.overSelected]}
              onPress={() => setOverLimit(o)}
            >
              <Text style={[styles.overText, overLimit === o && styles.overTextSelected]}>
                {o}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Max Teams</Text>
        <View style={styles.oversRow}>
          {GAME_CONFIG.MAX_TOURNAMENT_TEAMS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.overOption, maxTeams === t && styles.overSelected]}
              onPress={() => setMaxTeams(t)}
            >
              <Text style={[styles.overText, maxTeams === t && styles.overTextSelected]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Create Tournament"
          onPress={handleCreate}
          loading={isLoading}
          size="large"
          style={{ marginTop: 32 }}
        />
        <Button
          title="Back"
          onPress={() => setPhase('menu')}
          variant="ghost"
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    );
  }

  // JOIN FLOW
  if (phase === 'join') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Join Tournament</Text>
        <View style={styles.joinSection}>
          <Text style={styles.joinLabel}>Invite Code</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="Enter code"
            placeholderTextColor={COLORS.textSecondary}
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <Button
            title="Join"
            onPress={handleJoin}
            loading={isLoading}
            disabled={inviteCode.length < 4}
            size="large"
          />
        </View>
        <Button
          title="Back"
          onPress={() => setPhase('menu')}
          variant="ghost"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  // BRACKET VIEW
  return (
    <View style={[styles.container, styles.centered]}>
      <Text style={styles.title}>Tournament Bracket</Text>
      <Text style={styles.subtitle}>
        Tournament ID: {tournamentId?.slice(0, 8)}...
      </Text>
      <Text style={styles.subtitle}>
        Waiting for teams to register. Avatar locks are enforced for the full tournament.
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
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  options: {
    gap: 14,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 8,
  },
  optionIcon: {
    fontSize: 40,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formatRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formatOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  formatSelected: {
    borderColor: COLORS.primaryLight,
  },
  formatText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  oversRow: {
    flexDirection: 'row',
    gap: 12,
  },
  overOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  overSelected: {
    borderColor: COLORS.primaryLight,
  },
  overText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  overTextSelected: {
    color: COLORS.primaryLight,
  },
  joinSection: {
    gap: 12,
  },
  joinLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  codeInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
