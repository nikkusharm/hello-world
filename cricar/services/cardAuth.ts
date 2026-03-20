import firestore from '@react-native-firebase/firestore';
import { cardsCollection, usersCollection, sessionsCollection, tournamentsCollection } from './firebase';
import { Card } from '../types/card';
import { LockResult } from '../types/match';

const SCAN_RATE_LIMIT = 10;
const SCAN_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface ScanResult {
  status: 'not_found' | 'activated_self' | 'activated_other' | 'new_activation';
  card?: Card;
  ownerUsername?: string;
}

// Track scan attempts for rate limiting
const scanAttempts: Map<string, number[]> = new Map();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const attempts = scanAttempts.get(userId) || [];
  const recentAttempts = attempts.filter((t) => now - t < SCAN_RATE_WINDOW_MS);
  scanAttempts.set(userId, recentAttempts);
  return recentAttempts.length < SCAN_RATE_LIMIT;
}

function recordScanAttempt(userId: string): void {
  const attempts = scanAttempts.get(userId) || [];
  attempts.push(Date.now());
  scanAttempts.set(userId, attempts);
}

export async function validateAndActivateCard(
  serial: string,
  userId: string
): Promise<ScanResult> {
  if (!checkRateLimit(userId)) {
    throw new Error('Rate limit exceeded. Maximum 10 card scans per hour.');
  }
  recordScanAttempt(userId);

  const cardDoc = await cardsCollection.doc(serial).get();

  // Tier 1: Serial must exist in database
  if (!cardDoc.exists) {
    return { status: 'not_found' };
  }

  const card = { id: cardDoc.id, ...cardDoc.data() } as Card;

  // Card exists but not activated — register to current user
  if (!card.ownerId) {
    await cardsCollection.doc(serial).update({
      ownerId: userId,
      activatedAt: firestore.FieldValue.serverTimestamp(),
    });
    await usersCollection.doc(userId).update({
      ownedCards: firestore.FieldValue.arrayUnion(serial),
    });
    return { status: 'new_activation', card: { ...card, ownerId: userId } };
  }

  // Card activated by current user
  if (card.ownerId === userId) {
    return { status: 'activated_self', card };
  }

  // Card activated by different user
  const ownerDoc = await usersCollection.doc(card.ownerId).get();
  const ownerUsername = ownerDoc.data()?.username || 'Unknown';
  return { status: 'activated_other', card, ownerUsername };
}

export async function validateCardYear(
  serial: string,
  yearLock: number
): Promise<boolean> {
  const cardDoc = await cardsCollection.doc(serial).get();
  if (!cardDoc.exists) return false;
  const card = cardDoc.data() as Card;
  return card.packYear === yearLock;
}

// Tier 3: NFC verification for premium legend cards
export async function verifyNFC(
  serial: string,
  scannedNfcId: string
): Promise<boolean> {
  const cardDoc = await cardsCollection.doc(serial).get();
  if (!cardDoc.exists) return false;
  const card = cardDoc.data() as Card;
  if (!card.nfcId) return true; // Non-NFC cards pass by default
  return card.nfcId === scannedNfcId;
}

// Avatar locking with Firestore transactions
export async function lockAvatar(
  sessionId: string,
  playerId: string,
  userId: string
): Promise<LockResult> {
  const db = firestore();

  return await db.runTransaction(async (transaction) => {
    const sessionRef = sessionsCollection.doc(sessionId);
    const session = await transaction.get(sessionRef);

    if (!session.exists) {
      return { success: false, error: 'Session not found' };
    }

    const lockedAvatars: string[] = session.data()?.lockedAvatars || [];

    if (lockedAvatars.includes(playerId)) {
      const playerMap = session.data()?.playerMap || {};
      const lockedByUserId = playerMap[playerId];
      let lockedByUsername = 'Unknown';
      if (lockedByUserId) {
        const userDoc = await usersCollection.doc(lockedByUserId).get();
        lockedByUsername = userDoc.data()?.username || 'Unknown';
      }
      return {
        success: false,
        error: 'This player is already taken in this session',
        lockedBy: lockedByUsername,
      };
    }

    transaction.update(sessionRef, {
      lockedAvatars: [...lockedAvatars, playerId],
      [`playerMap.${playerId}`]: userId,
    });

    return { success: true };
  });
}

// Tournament-level avatar locking
export async function lockAvatarForTournament(
  tournamentId: string,
  playerId: string,
  teamId: string,
  userId: string
): Promise<LockResult> {
  const db = firestore();

  return await db.runTransaction(async (transaction) => {
    const tournamentRef = tournamentsCollection.doc(tournamentId);
    const tournament = await transaction.get(tournamentRef);

    if (!tournament.exists) {
      return { success: false, error: 'Tournament not found' };
    }

    const lockedAvatars: string[] = tournament.data()?.lockedAvatars || [];

    if (lockedAvatars.includes(playerId)) {
      return {
        success: false,
        error: 'This player is already locked to another team in this tournament',
      };
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
  await sessionsCollection.doc(sessionId).update({
    lockedAvatars: [],
    playerMap: {},
  });
}

export async function releaseAllTournamentLocks(tournamentId: string): Promise<void> {
  await tournamentsCollection.doc(tournamentId).update({
    lockedAvatars: [],
    avatarTeamMap: {},
    avatarUserMap: {},
  });
}
