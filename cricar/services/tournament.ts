import {
  doc, getDoc, getDocs, addDoc, updateDoc, query, where, limit,
  arrayUnion, serverTimestamp, runTransaction
} from 'firebase/firestore';
import { db, tournamentsCollection } from './firebase';
import { Tournament, TournamentTeam, Match, Standing } from '../types/match';

export type TournamentFormat = 'knockout' | 'round_robin';

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createTournament(
  hostId: string, format: TournamentFormat, overLimit: number, maxTeams: number
): Promise<string> {
  const inviteCode = generateInviteCode();
  const docRef = await addDoc(tournamentsCollection, {
    hostId, format, teams: [], bracket: [], standings: [],
    status: 'registration', overLimit, lockedAvatars: [],
    inviteCode, maxTeams, createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function joinTournament(
  inviteCode: string, team: TournamentTeam
): Promise<{ success: boolean; error?: string; tournamentId?: string }> {
  const q = query(tournamentsCollection,
    where('inviteCode', '==', inviteCode),
    where('status', '==', 'registration'),
    limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return { success: false, error: 'Tournament not found or registration closed' };

  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  if (data.teams.length >= data.maxTeams) return { success: false, error: 'Tournament is full' };

  await updateDoc(docSnap.ref, { teams: arrayUnion(team) });
  return { success: true, tournamentId: docSnap.id };
}

export function generateKnockoutBracket(teams: TournamentTeam[]): Match[] {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const matches: Match[] = [];
  const totalRounds = Math.ceil(Math.log2(shuffled.length));

  for (let i = 0; i < shuffled.length; i += 2) {
    matches.push({
      id: `match_r1_${Math.floor(i / 2)}`, round: 1,
      teamAId: shuffled[i].id,
      teamBId: i + 1 < shuffled.length ? shuffled[i + 1].id : 'BYE',
      status: i + 1 < shuffled.length ? 'pending' : 'complete',
      winnerId: i + 1 >= shuffled.length ? shuffled[i].id : undefined,
    });
  }

  let matchesInRound = Math.ceil(shuffled.length / 2);
  for (let round = 2; round <= totalRounds; round++) {
    matchesInRound = Math.ceil(matchesInRound / 2);
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({ id: `match_r${round}_${i}`, round, teamAId: 'TBD', teamBId: 'TBD', status: 'pending' });
    }
  }
  return matches;
}

export function generateRoundRobinSchedule(teams: TournamentTeam[]): Match[] {
  const matches: Match[] = [];
  let matchIndex = 0;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({ id: `match_rr_${matchIndex}`, round: 1, teamAId: teams[i].id, teamBId: teams[j].id, status: 'pending' });
      matchIndex++;
    }
  }
  return matches;
}

export function calculateStandings(teams: TournamentTeam[], completedMatches: Match[]): Standing[] {
  const standings: Standing[] = teams.map(t => ({
    teamId: t.id, played: 0, won: 0, lost: 0, tied: 0, points: 0, nrr: t.nrr || 0,
  }));
  for (const match of completedMatches) {
    if (match.status !== 'complete') continue;
    const a = standings.find(s => s.teamId === match.teamAId);
    const b = standings.find(s => s.teamId === match.teamBId);
    if (!a || !b) continue;
    a.played++; b.played++;
    if (match.winnerId === match.teamAId) { a.won++; a.points += 2; b.lost++; }
    else if (match.winnerId === match.teamBId) { b.won++; b.points += 2; a.lost++; }
    else { a.tied++; b.tied++; a.points++; b.points++; }
  }
  return standings.sort((a, b) => b.points !== a.points ? b.points - a.points : b.nrr - a.nrr);
}

export async function advanceKnockoutBracket(
  tournamentId: string, completedMatchId: string, winnerId: string
): Promise<void> {
  const tournamentRef = doc(db, 'tournaments', tournamentId);
  const tournamentSnap = await getDoc(tournamentRef);
  if (!tournamentSnap.exists()) return;

  const data = tournamentSnap.data();
  const bracket: Match[] = data.bracket;
  const matchIndex = bracket.findIndex(m => m.id === completedMatchId);
  if (matchIndex === -1) return;

  bracket[matchIndex].status = 'complete';
  bracket[matchIndex].winnerId = winnerId;

  const currentRound = bracket[matchIndex].round;
  const positionInRound = bracket.filter(m => m.round === currentRound)
    .findIndex(m => m.id === completedMatchId);
  const nextRoundSlot = Math.floor(positionInRound / 2);
  const nextRoundMatch = bracket.find(
    m => m.round === currentRound + 1 && m.id === `match_r${currentRound + 1}_${nextRoundSlot}`
  );
  if (nextRoundMatch) {
    if (positionInRound % 2 === 0) nextRoundMatch.teamAId = winnerId;
    else nextRoundMatch.teamBId = winnerId;
  }

  const finalMatch = bracket.find(m => m.round === Math.max(...bracket.map(b => b.round)));
  await updateDoc(tournamentRef, { bracket, status: finalMatch?.status === 'complete' ? 'complete' : 'active' });
}