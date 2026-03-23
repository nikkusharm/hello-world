import {
  ref, set, get, update, push, onValue, off, serverTimestamp as dbTimestamp,
  onDisconnect, DatabaseReference
} from 'firebase/database';
import { rtdb } from './firebase';
import { Skill } from '../types/game';

const matchRoomsRef = ref(rtdb, 'matchRooms');

export interface Connection {
  type: 'bluetooth' | 'lan' | 'firebase';
  latency: number;
  send: (data: unknown) => Promise<void>;
  onReceive: (callback: (data: unknown) => void) => void;
  disconnect: () => Promise<void>;
}

export function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function establishConnection(roomCode: string): Promise<Connection> {
  return await connectViaFirebase(roomCode);
}

async function connectViaFirebase(roomCode: string): Promise<Connection> {
  const pingRef = ref(rtdb, `matchRooms/${roomCode}/ping`);
  const startTime = Date.now();
  await set(pingRef, dbTimestamp());
  const latency = Date.now() - startTime;

  return {
    type: 'firebase',
    latency,
    send: async (data: unknown) => {
      const messagesRef = ref(rtdb, `matchRooms/${roomCode}/messages`);
      await push(messagesRef, data);
    },
    onReceive: (callback: (data: unknown) => void) => {
      const messagesRef = ref(rtdb, `matchRooms/${roomCode}/messages`);
      onValue(messagesRef, snapshot => {
        if (snapshot.exists()) callback(snapshot.val());
      });
    },
    disconnect: async () => {
      const messagesRef = ref(rtdb, `matchRooms/${roomCode}/messages`);
      off(messagesRef);
      await set(ref(rtdb, `matchRooms/${roomCode}/status`), 'disconnected');
    },
  };
}

export async function hostMatch(
  roomCode: string, hostId: string, hostPlayerId: string, hostUsername: string
): Promise<void> {
  const roomRef = ref(rtdb, `matchRooms/${roomCode}`);
  await set(roomRef, {
    hostId, hostPlayerId, hostUsername,
    status: 'waiting', connectionType: 'firebase',
    createdAt: dbTimestamp(),
  });
  onDisconnect(roomRef).remove();
}

export async function joinMatch(
  roomCode: string, guestId: string, guestPlayerId: string, guestUsername: string
): Promise<any | null> {
  return new Promise(resolve => {
    const roomRef = ref(rtdb, `matchRooms/${roomCode}`);
    onValue(roomRef, async snapshot => {
      off(roomRef);
      if (!snapshot.exists()) { resolve(null); return; }
      const room = snapshot.val();
      if (room.status !== 'waiting') { resolve(null); return; }
      await update(roomRef, { guestId, guestPlayerId, guestUsername, status: 'ready' });
      resolve({ ...room, guestId, guestPlayerId, guestUsername, status: 'ready' });
    }, { onlyOnce: true });
  });
}

export async function commitSkillChoice(
  roomCode: string, ballNumber: number, playerId: string, isHost: boolean, encryptedSkill: string
): Promise<void> {
  const field = isHost ? 'p1_choice' : 'p2_choice';
  await set(ref(rtdb, `matchRooms/${roomCode}/balls/ball_${ballNumber}/${field}`), encryptedSkill);
}

export function onBallResult(
  roomCode: string, ballNumber: number, callback: (result: unknown) => void
): () => void {
  const resultRef = ref(rtdb, `matchRooms/${roomCode}/balls/ball_${ballNumber}/ball_result`);
  onValue(resultRef, snapshot => {
    if (snapshot.exists()) callback(snapshot.val());
  });
  return () => off(resultRef);
}

export function setupDisconnectHandler(
  roomCode: string, isHost: boolean,
  onOpponentDisconnect: () => void, onOpponentReconnect: () => void
): () => void {
  const presenceField = isHost ? 'hostPresence' : 'guestPresence';
  const opponentField = isHost ? 'guestPresence' : 'hostPresence';
  const presenceRef = ref(rtdb, `matchRooms/${roomCode}/${presenceField}`);
  const opponentRef = ref(rtdb, `matchRooms/${roomCode}/${opponentField}`);

  set(presenceRef, true);
  onDisconnect(presenceRef).set(false);

  onValue(opponentRef, snapshot => {
    if (snapshot.val() === false) onOpponentDisconnect();
    else if (snapshot.val() === true) onOpponentReconnect();
  });

  return () => {
    off(opponentRef);
    set(presenceRef, false);
  };
}

export async function saveMatchState(sessionId: string, ballData: {
  over: number; ball: number; batsmanSkill: Skill;
  bowlerSkill: Skill; outcome: string; runs: number;
}): Promise<void> {
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('./firebase');
  await addDoc(collection(db, 'sessions', sessionId, 'balls'), {
    ...ballData, timestamp: serverTimestamp(),
  });
}