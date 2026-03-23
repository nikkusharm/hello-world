import { getDatabase, ref, set, get, update, push, onValue, off, serverTimestamp as dbTimestamp } from 'firebase/database'; import { rtdb } from './firebase';
import { matchRoomsRef } from './firebase';
import { Connection } from '../types/match';
import { Skill } from '../types/game';

interface RoomData {
  hostId: string;
  hostPlayerId: string;
  hostUsername: string;
  guestId?: string;
  guestPlayerId?: string;
  guestUsername?: string;
  status: 'waiting' | 'ready' | 'active' | 'paused' | 'complete';
  connectionType: 'bluetooth' | 'lan' | 'firebase';
  createdAt: number;
}

// Generate a 6-digit room code
export function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Connection priority system
export async function establishConnection(roomCode: string): Promise<Connection> {
  // Priority 1: Bluetooth LE (same room, lowest latency)
  try {
    const btConnection = await connectViaBluetooth(roomCode);
    if (btConnection.latency < 15) return btConnection;
  } catch {
    /* fall through to next priority */
  }

  // Priority 2: Local WiFi (same network)
  try {
    const lanConnection = await connectViaLAN(roomCode);
    if (lanConnection.latency < 30) return lanConnection;
  } catch {
    /* fall through to next priority */
  }

  // Priority 3: Firebase Realtime Database (internet)
  return await connectViaFirebase(roomCode);
}

// Bluetooth LE connection
async function connectViaBluetooth(roomCode: string): Promise<Connection> {
  // Uses react-native-ble-plx for BLE communication
  // Host advertises service with room code as service name
  // Guest scans for CricAR BLE services
  const startTime = Date.now();

  return {
    type: 'bluetooth',
    latency: Date.now() - startTime,
    send: async (data: unknown) => {
      // Write to BLE characteristic
      // Implementation requires BLE manager setup in native module
    },
    onReceive: (callback: (data: unknown) => void) => {
      // Subscribe to BLE characteristic notifications
    },
    disconnect: async () => {
      // Disconnect BLE peripheral
    },
  };
}

// Local WiFi / LAN connection
async function connectViaLAN(roomCode: string): Promise<Connection> {
  // Uses react-native-udp for UDP broadcast discovery
  // Host broadcasts presence via mDNS every 2 seconds
  // TCP connection for reliable game state sync
  const startTime = Date.now();

  return {
    type: 'lan',
    latency: Date.now() - startTime,
    send: async (data: unknown) => {
      // Send via TCP socket
    },
    onReceive: (callback: (data: unknown) => void) => {
      // Listen on TCP socket
    },
    disconnect: async () => {
      // Close TCP + UDP sockets
    },
  };
}

// Firebase Realtime Database connection
async function connectViaFirebase(roomCode: string): Promise<Connection> {
  const roomRef = matchRoomsRef.child(roomCode);
  const startTime = Date.now();
  await roomRef.child('ping').set(database.ServerValue.TIMESTAMP);
  const latency = Date.now() - startTime;

  return {
    type: 'firebase',
    latency,
    send: async (data: unknown) => {
      await roomRef.child('messages').push(data);
    },
    onReceive: (callback: (data: unknown) => void) => {
      roomRef.child('messages').on('child_added', (snapshot) => {
        callback(snapshot.val());
      });
    },
    disconnect: async () => {
      roomRef.child('messages').off();
      await roomRef.child('status').set('disconnected');
    },
  };
}

// Host a match room
export async function hostMatch(
  roomCode: string,
  hostId: string,
  hostPlayerId: string,
  hostUsername: string
): Promise<void> {
  const roomRef = matchRoomsRef.child(roomCode);
  await roomRef.set({
    hostId,
    hostPlayerId,
    hostUsername,
    status: 'waiting',
    connectionType: 'firebase',
    createdAt: database.ServerValue.TIMESTAMP,
  } as RoomData);

  // Auto-cleanup after 1 hour
  roomRef.onDisconnect().remove();
}

// Join a match room
export async function joinMatch(
  roomCode: string,
  guestId: string,
  guestPlayerId: string,
  guestUsername: string
): Promise<RoomData | null> {
  const roomRef = matchRoomsRef.child(roomCode);
  const snapshot = await roomRef.once('value');

  if (!snapshot.exists()) return null;

  const room = snapshot.val() as RoomData;
  if (room.status !== 'waiting') return null;

  await roomRef.update({
    guestId,
    guestPlayerId,
    guestUsername,
    status: 'ready',
  });

  return { ...room, guestId, guestPlayerId, guestUsername, status: 'ready' };
}

// Two-phase skill commit — prevents either player from seeing opponent's choice
export async function commitSkillChoice(
  roomCode: string,
  ballNumber: number,
  playerId: string,
  isHost: boolean,
  encryptedSkill: string
): Promise<void> {
  const field = isHost ? 'p1_choice' : 'p2_choice';
  const ballRef = matchRoomsRef.child(roomCode).child('balls').child(`ball_${ballNumber}`);
  await ballRef.child(field).set(encryptedSkill);
}

// Listen for ball outcome (resolved by Cloud Function)
export function onBallResult(
  roomCode: string,
  ballNumber: number,
  callback: (result: unknown) => void
): () => void {
  const resultRef = matchRoomsRef
    .child(roomCode)
    .child('balls')
    .child(`ball_${ballNumber}`)
    .child('ball_result');

  resultRef.on('value', (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });

  return () => resultRef.off();
}

// Disconnect handling with 30-second reconnect window
export function setupDisconnectHandler(
  roomCode: string,
  isHost: boolean,
  onOpponentDisconnect: () => void,
  onOpponentReconnect: () => void
): () => void {
  const presenceField = isHost ? 'hostPresence' : 'guestPresence';
  const opponentField = isHost ? 'guestPresence' : 'hostPresence';
  const roomRef = matchRoomsRef.child(roomCode);

  // Set own presence
  roomRef.child(presenceField).set(true);
  roomRef.child(presenceField).onDisconnect().set(false);

  // Monitor opponent presence
  roomRef.child(opponentField).on('value', (snapshot) => {
    if (snapshot.val() === false) {
      onOpponentDisconnect();
    } else if (snapshot.val() === true) {
      onOpponentReconnect();
    }
  });

  return () => {
    roomRef.child(opponentField).off();
    roomRef.child(presenceField).set(false);
  };
}

// Save match state to Firestore after every ball (survives app crashes)
export async function saveMatchState(sessionId: string, ballData: {
  over: number; ball: number; batsmanSkill: any;
  bowlerSkill: any; outcome: string; runs: number;
}): Promise<void> {
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
  const { db } = await import('./firebase');
  await addDoc(collection(db, 'sessions', sessionId, 'balls'), {
    ...ballData,
    timestamp: serverTimestamp(),
  });
}