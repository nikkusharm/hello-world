import { Skill, InningStats, BowlingSlot, FieldPosition, AIDifficulty } from './game';

export type GameMode = 'solo' | '1v1' | 'team' | 'tournament';
export type SessionStatus = 'waiting' | 'active' | 'complete';
export type TournamentFormat = 'knockout' | 'round_robin';
export type TournamentStatus = 'registration' | 'active' | 'complete';

export interface SessionPlayer {
  userId: string;
  playerId: string;
  teamId: string;
  role: 'batsman' | 'bowler' | 'fielder' | 'captain';
  stamina: number;
  stats: InningStats;
  isAI: boolean;
  aiDifficulty?: AIDifficulty;
}

export interface Team {
  id: string;
  name: string;
  captainId: string;
  players: SessionPlayer[];
  battingOrder: string[];
  bowlingRotation: BowlingSlot[];
  fieldPositions: FieldPosition[];
}

export interface Inning {
  battingTeamId: string;
  bowlingTeamId: string;
  overs: Over[];
  totalRuns: number;
  totalWickets: number;
  extras: number;
}

export interface Over {
  number: number;
  bowlerId: string;
  balls: BallRecord[];
}

export interface BallRecord {
  ballNumber: number;
  batsmanId: string;
  bowlerId: string;
  batsmanSkill: Skill;
  bowlerSkill: Skill;
  outcome: string;
  runs: number;
  timestamp: Date;
}

export interface GameSession {
  id: string;
  mode: GameMode;
  players: SessionPlayer[];
  lockedAvatars: string[];
  status: SessionStatus;
  yearLock?: number;
  innings: Inning[];
  currentInning: number;
  overLimit: number;
  teams: Team[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleAssignment {
  batters: number;
  bowlers: number;
  fielders: number;
  needsAIFill: number;
}

export interface TournamentTeam {
  id: string;
  name: string;
  captainUserId: string;
  playerIds: string[];
  points: number;
  nrr: number;
}

export interface Standing {
  teamId: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  points: number;
  nrr: number;
}

export interface Match {
  id: string;
  round: number;
  teamAId: string;
  teamBId: string;
  sessionId?: string;
  winnerId?: string;
  status: 'pending' | 'active' | 'complete';
}

export interface Tournament {
  id: string;
  hostId: string;
  format: TournamentFormat;
  teams: TournamentTeam[];
  bracket: Match[];
  standings: Standing[];
  status: TournamentStatus;
  overLimit: number;
  lockedAvatars: string[];
  inviteCode: string;
  maxTeams: number;
  createdAt: Date;
}

export interface LockResult {
  success: boolean;
  error?: string;
  lockedBy?: string;
}

export interface Connection {
  type: 'bluetooth' | 'lan' | 'firebase';
  latency: number;
  send: (data: unknown) => Promise<void>;
  onReceive: (callback: (data: unknown) => void) => void;
  disconnect: () => Promise<void>;
}
