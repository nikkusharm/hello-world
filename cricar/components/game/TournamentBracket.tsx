import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Match, TournamentTeam } from '../../types/match';
import { COLORS } from '../../constants/gameConfig';

interface TournamentBracketProps {
  matches: Match[];
  teams: TournamentTeam[];
  onMatchPress?: (matchId: string) => void;
}

export default function TournamentBracket({
  matches,
  teams,
  onMatchPress,
}: TournamentBracketProps) {
  const rounds = [...new Set(matches.map((m) => m.round))].sort();

  function getTeamName(teamId: string): string {
    if (teamId === 'TBD') return 'TBD';
    if (teamId === 'BYE') return 'BYE';
    return teams.find((t) => t.id === teamId)?.name || teamId;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {rounds.map((round) => {
          const roundMatches = matches.filter((m) => m.round === round);
          return (
            <View key={round} style={styles.round}>
              <Text style={styles.roundTitle}>
                {round === rounds[rounds.length - 1] ? 'Final' : `Round ${round}`}
              </Text>
              {roundMatches.map((match) => (
                <TouchableOpacity
                  key={match.id}
                  style={[
                    styles.matchCard,
                    match.status === 'complete' && styles.matchComplete,
                  ]}
                  onPress={() => onMatchPress?.(match.id)}
                >
                  <View style={styles.teamRow}>
                    <Text
                      style={[
                        styles.teamName,
                        match.winnerId === match.teamAId && styles.winnerName,
                      ]}
                    >
                      {getTeamName(match.teamAId)}
                    </Text>
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.teamRow}>
                    <Text
                      style={[
                        styles.teamName,
                        match.winnerId === match.teamBId && styles.winnerName,
                      ]}
                    >
                      {getTeamName(match.teamBId)}
                    </Text>
                  </View>
                  <Text style={styles.statusText}>
                    {match.status === 'complete'
                      ? 'Complete'
                      : match.status === 'active'
                      ? 'Live'
                      : 'Pending'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    gap: 24,
  },
  round: {
    gap: 12,
    minWidth: 160,
  },
  roundTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  matchCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  matchComplete: {
    borderColor: COLORS.primaryLight,
  },
  teamRow: {
    paddingVertical: 6,
  },
  teamName: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  winnerName: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  statusText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
});
