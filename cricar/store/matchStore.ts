import { create } from 'zustand';
import { Connection, GameSession, Team, SessionPlayer } from '../types/match';
import { Skill, BallOutcome } from '../types/game';
import {
  generateRoomCode,
  hostMatch,
  joinMatch,
  establishConnection,
  commitSkillChoice,
  onBallResult,
  setupDisconnectHandler,
} from '../services/multiplayer';

interface MatchState {
  roomCode: string | null;
  connection: Connection | null;
  isHost: boolean;
  opponentReady: boolean;
  opponentDisconnected: boolean;
  reconnectTimer: number;
  mySkillCommitted: boolean;
  currentBallResult: BallOutcome | null;

  createRoom: (userId: string, playerId: string, username: string) => Promise<string>;
  joinRoom: (
    roomCode: string,
    userId: string,
    playerId: string,
    username: string
  ) => Promise<boolean>;
  commitSkill: (
    ballNumber: number,
    playerId: string,
    skill: Skill,
    sessionKey: string
  ) => Promise<void>;
  listenForResult: (ballNumber: number, callback: (result: BallOutcome) => void) => () => void;
  disconnect: () => Promise<void>;
  reset: () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  roomCode: null,
  connection: null,
  isHost: false,
  opponentReady: false,
  opponentDisconnected: false,
  reconnectTimer: 0,
  mySkillCommitted: false,
  currentBallResult: null,

  createRoom: async (userId, playerId, username) => {
    const roomCode = generateRoomCode();
    await hostMatch(roomCode, userId, playerId, username);
    const connection = await establishConnection(roomCode);

    set({ roomCode, connection, isHost: true });

    setupDisconnectHandler(
      roomCode,
      true,
      () => {
        set({ opponentDisconnected: true, reconnectTimer: 30 });
        const interval = setInterval(() => {
          const timer = get().reconnectTimer;
          if (timer <= 0) {
            clearInterval(interval);
            return;
          }
          set({ reconnectTimer: timer - 1 });
        }, 1000);
      },
      () => set({ opponentDisconnected: false, reconnectTimer: 0 })
    );

    return roomCode;
  },

  joinRoom: async (roomCode, userId, playerId, username) => {
    const room = await joinMatch(roomCode, userId, playerId, username);
    if (!room) return false;

    const connection = await establishConnection(roomCode);
    set({ roomCode, connection, isHost: false, opponentReady: true });

    setupDisconnectHandler(
      roomCode,
      false,
      () => {
        set({ opponentDisconnected: true, reconnectTimer: 30 });
        const interval = setInterval(() => {
          const timer = get().reconnectTimer;
          if (timer <= 0) {
            clearInterval(interval);
            return;
          }
          set({ reconnectTimer: timer - 1 });
        }, 1000);
      },
      () => set({ opponentDisconnected: false, reconnectTimer: 0 })
    );

    return true;
  },

  commitSkill: async (ballNumber, playerId, skill, sessionKey) => {
    const { roomCode, isHost } = get();
    if (!roomCode) return;

    // Encrypt skill choice so opponent can't intercept
    const encrypted = btoa(JSON.stringify({ skillId: skill.id, key: sessionKey }));
    await commitSkillChoice(roomCode, ballNumber, playerId, isHost, encrypted);
    set({ mySkillCommitted: true });
  },

  listenForResult: (ballNumber, callback) => {
    const { roomCode } = get();
    if (!roomCode) return () => {};

    return onBallResult(roomCode, ballNumber, (result) => {
      set({ currentBallResult: result as BallOutcome, mySkillCommitted: false });
      callback(result as BallOutcome);
    });
  },

  disconnect: async () => {
    const { connection } = get();
    if (connection) await connection.disconnect();
    set({ connection: null, roomCode: null });
  },

  reset: () =>
    set({
      roomCode: null,
      connection: null,
      isHost: false,
      opponentReady: false,
      opponentDisconnected: false,
      reconnectTimer: 0,
      mySkillCommitted: false,
      currentBallResult: null,
    }),
}));

