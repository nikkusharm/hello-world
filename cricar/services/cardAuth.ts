import {
  doc, getDoc, updateDoc, runTransaction, arrayUnion, serverTimestamp, collection
} from 'firebase/firestore';
import { db } from './firebase';
import { Card } from '../types/card';
import { LockResult } from '../types/match';

const SCAN_RATE_LIMIT = 10;
const SCAN_RATE_WINDOW_MS = 60 * 60 * 1000;
const scanAttempts: Map<string, number[]> = new Map();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const attempts = (scanAttempts.get(userId) || []).filter(t => now - t < SCAN_RATE_WINDOW_MS);
  scanAttempts.set(userId, attempts);
  return attempts.length < SCAN_RATE_LIMIT;
}

function recordScanAttempt(userId: string): void {
  const attempts = scanAttempts.get(userId) || [];
  attempts.push(Date.now());
  scanAttempts.set(userId, attempts);
}

interface ScanResult {
  status: 'not_found' | 'activated_self' | 'activated_other' | 'new_activation';
  card?: Card;
  ownerUsername?: string;
}

export async function validateAndActivateCard(serial: string, userId: string): Promise<ScanResult> {
  if (!checkRateLimit(userId)) throw new Error('Rate limit exceeded. Maximum 10 card scans per hour.');
  recordScanAttempt(userId);

  const cardRef = doc(db, 'cards', serial);
  const cardSnap = await getDoc(cardRef);

  if (!cardSnap.exists()) return { status: 'not_found' };

  const card = { id: cardSnap.id, ...cardSnap.data() } as Card;

  if (!card.ownerId) {
    await updateDoc(cardRef, { ownerId: userId, activatedAt: serverTimestamp() });
    await updateDoc(doc(db, 'users', userId), { ownedCards: arrayUnion(serial) });
    return { status: 'new_activation', card: { ...card, ownerId: userId } };
  }

  if (card.ownerId === userId) return { status: 'activated_self', card };

  const ownerSnap = await getDoc(doc(db, 'users', card.ownerId));
  const ownerUsername = ownerSnap.data()?.username || 'Unknown';
  return { status: 'activated_other', card, ownerUsername };
}

export async function validateCardYear(serial: string, yearLock: number): Promise<boolean> {
  const cardSnap = await getDoc(doc(db, 'cards', serial));
  if (!cardSnap.exists()) return false;
  return (cardSnap.data() as Card).packYear === yearLock;
}

export async function verifyNFC(serial: string, scannedNfcId: string): Promise<boolean> {
  const cardSnap = await getDoc(doc(db, 'cards', serial));
  if (!cardSnap.exists()) return false;
  const card = cardSnap.data() as Card;
  if (!card.nfcId) return true;
  return card.nfcId === scannedNfcId;
}

export async function lockAvatar(sessionId: string, playerId: string, userId: string): Promise<LockResult> {
  const sessionRef = doc(db, 'sessions', sessionId);
  return await runTransaction(db, async (transaction) => {
    const session = await transaction.get(sessionRef);
    if (!session.exists()) return { success: false, error: 'Session not found' };

    const lockedAvatars: string[] = session.data()?.lockedAvatars || [];
    if (lockedAvatars.includes(playerId)) {
      const playerMap = session.data()?.playerMap || {};
      const lockedByUserId = playerMap[playerId];
      let lockedByUsername = 'Unknown';
      if (lockedByUserId) {
        const userSnap = await transaction.get(doc(db, 'users', lockedByUserId));
        lockedByUsername = userSnap.data()?.username || 'Unknown';
      }
      return { success: false, error: 'This player is already taken', lockedBy: lockedByUsername };
    }

    transaction.update(sessionRef, {
      lockedAvatars: [...lockedAvatars, playerId],
      [`playerMap.${playerId}`]: userId,
    });
    return { success: true };
  });
}

export async function lockAvatarForTournament(
  tournamentId: string, playerId: string, teamId: string, userId: string
): Promise<LockResult> {
  const tournamentRef = doc(db, 'tournaments', tournamentId);
  return await runTransaction(db, async (transaction) => {
    const tournament = await transaction.get(tournamentRef);
    if (!tournament.exists()) return { success: false, error: 'Tournament not found' };

    const lockedAvatars: string[] = tournament.data()?.lockedAvatars || [];
    if (lockedAvatars.includes(playerId)) {
      return { success: false, error: 'This player is already locked to another team' };
    }

    transaction.update(tournamentRef, {
      lockedAvatars: [...lockedAvatars, playerId],
      [`avatarTeamMap.${playerId}`]: teamId,
      [`avatarUserMap.${playerId}`]: userId,
    });
    return { success: true };
  });
}

export async function releaseLocks(sessionId: string): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), { lockedAvatars: [], playerMap: {} });
}

export async function releaseAllTournamentLocks(tournamentId: string): Promise<void> {
  await updateDoc(doc(db, 'tournaments', tournamentId), {
    lockedAvatars: [], avatarTeamMap: {}, avatarUserMap: {},
  });
}