import { Skill } from './game';

export interface PlayerBattingStats {
  average: number;
  strikeRate: number;
  centuries: number;
  boundaryPercent: number;
  spinRecord: number;
  paceRecord: number;
}

export interface PlayerBowlingStats {
  average: number;
  economy: number;
  strikeRate: number;
  swingRating: number;
  spinRating: number;
  deathOversRating: number;
}

export interface PlayerFieldingStats {
  catchRating: number;
  throwAccuracy: number;
  diveRating: number;
}

export interface PlayerStats {
  batting: PlayerBattingStats;
  bowling: PlayerBowlingStats;
  fielding: PlayerFieldingStats;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  year: number;
  role: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';
  stats: PlayerStats;
  skills: Skill[];
  avatarModel: string;
  cardImage: string;
  cardSerial: string;
  isLegacy: boolean;
}
