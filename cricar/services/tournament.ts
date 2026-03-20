import firestore from '@react-native-firebase/firestore';
import { tournamentsCollection } from './firebase';
import {
  Tournament,
  TournamentTeam,
  Match,
  Standing,
  TournamentFormat,
} from '../types/match';

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createTournament(
  hostId: string,
  format: TournamentFormat,
  overLimit: number,
  maxTeams: number
): Promise<string> {
  const inviteCode = generateInviteCode();

  const tournament: Omit<Tournament, 'id'> = {
    hostId,
    format,
    teams: [],
    bracket: [],
    standings: [],
    status: 'registration',
    overLimit,
    lockedAvatars: [],
    inviteCode,
    maxTeams,
    createdAt: new Date(),
  };

  const doc = await tournamentsCollection.add({
    ...tournament,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  return doc.id;
}

export async function joinTournament(
  inviteCode: string,
  team: TournamentTeam
): Promise<{ success: boolean; error?: string; tournamentId?: string }> {
  const snapshot = await tournamentsCollection
    .where('inviteCode', '==', inviteCode)
    .where('status', '==', 'registration')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return { success: false, error: 'Tournament not found or registration closed' };
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  if (data.teams.length >= data.maxTeams) {
    return { success: false, error: 'Tournament is full' };
  }

  await doc.ref.update({
    teams: firestore.FieldValue.arrayUnion(team),
  });

  return { success: true, tournamentId: doc.id };
}

export function generateKnockoutBracket(teams: TournamentTeam[]): Match[] {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const matches: Match[] = [];
  const totalRounds = Math.ceil(Math.log2(shuffled.length));

  // First round
  for (let i = 0; i < shuffled.length; i += 2) {
    const match: Match = {
      id: `match_r1_${Math.floor(i / 2)}`,
      round: 1,
      teamAId: shuffled[i].id,
      teamBId: i + 1 < shuffled.length ? shuffled[i + 1].id : 'BYE',
      status: i + 1 < shuffled.length ? 'pending' : 'complete',
      winnerId: i + 1 >= shuffled.length ? shuffled[i].id : undefined,
    };
    matches.push(match);
  }

  // Subsequent rounds (placeholders)
  let matchesInRound = Math.ceil(shuffled.length / 2);
  for (let round = 2; round <= totalRounds; round++) {
    matchesInRound = Math.ceil(matchesInRound / 2);
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: `match_r${round}_${i}`,
        round,
        teamAId: 'TBD',
        teamBId: 'TBD',
        status: 'pending',
      });
    }
  }

  return matches;
}

export function generateRoundRobinSchedule(teams: TournamentTeam[]): Match[] {
  const matches: Match[] = [];
  let matchIndex = 0;

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: `match_rr_${matchIndex}`,
        round: 1, // All matches are round 1 in round robin
        teamAId: teams[i].id,
        teamBId: teams[j].id,
        status: 'pending',
      });
      matchIndex++;
    }
  }

  return matches;
}

export function calculateStandings(
  teams: TournamentTeam[],
  completedMatches: Match[]
): Standing[] {
  const standings: Standing[] = teams.map((team) => ({
    teamId: team.id,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    points: 0,
    nrr: team.nrr || 0,
  }));

  for (const match of completedMatches) {
    if (match.status !== 'complete') continue;

    const teamA = standings.find((s) => s.teamId === match.teamAId);
    const teamB = standings.find((s) => s.teamId === match.teamBId);
    if (!teamA || !teamB) continue;

    teamA.played++;
    teamB.played++;

    if (match.winnerId === match.teamAId) {
      teamA.won++;
      teamA.points += 2;
      teamB.lost++;
    } else if (match.winnerId === match.teamBId) {
      teamB.won++;
      teamB.points += 2;
      teamA.lost++;
    } else {
      // Tie
      teamA.tied++;
      teamB.tied++;
      teamA.points += 1;
      teamB.points += 1;
    }
  }

  // Sort by points, then NRR
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.nrr - a.nrr;
  });

  return standings;
}

export async function advanceKnockoutBracket(
  tournamentId: string,
  completedMatchId: string,
  winnerId: string
): Promise<void> {
  const tournamentDoc = await tournamentsCollection.doc(tournamentId).get();
  if (!tournamentDoc.exists) return;

  const data = tournamentDoc.data()!;
  const bracket: Match[] = data.bracket;

  // Update completed match
  const matchIndex = bracket.findIndex((m) => m.id === completedMatchId);
  if (matchIndex === -1) return;
  bracket[matchIndex].status = 'complete';
  bracket[matchIndex].winnerId = winnerId;

  // Find next round match and assign winner
  const currentRound = bracket[matchIndex].round;
  const positionInRound = bracket
    .filter((m) => m.round === currentRound)
    .findIndex((m) => m.id === completedMatchId);

  const nextRoundSlot = Math.floor(positionInRound / 2);
  const nextRoundMatch = bracket.find(
    (m) => m.round === currentRound + 1 && m.id === `match_r${currentRound + 1}_${nextRoundSlot}`
  );

  if (nextRoundMatch) {
    if (positionInRound % 2 === 0) {
      nextRoundMatch.teamAId = winnerId;
    } else {
      nextRoundMatch.teamBId = winnerId;
    }
  }

  // Check if tournament is complete
  const finalMatch = bracket.find(
    (m) => m.round === Math.max(...bracket.map((b) => b.round))
  );
  const isComplete = finalMatch?.status === 'complete';

  await tournamentsCollection.doc(tournamentId).update({
    bracket,
    status: isComplete ? 'complete' : 'active',
  });
}
