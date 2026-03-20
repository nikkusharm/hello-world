export interface Skill {
  id: string;
  name: string;
  type: 'batting' | 'bowling' | 'fielding';
  power: number;
  risk: number;
  staminaCost: number;
  animation: string;
  unlockYear: number;
  description: string;
  specialCondition?: string;
}

export type BallOutcomeType = 'dot' | 'single' | 'double' | 'triple' | 'four' | 'six' | 'wicket';

export interface Ball {
  bowlerSkill: Skill;
  batsmanSkill: Skill;
  outcome: BallOutcomeType;
  runs: number;
  animation: string;
}

export interface BallOutcome {
  runs: number;
  outcome: BallOutcomeType;
  animation: string;
}

export interface MatchContext {
  isDeathOvers: boolean;
  batsmanStamina: number;
  bowlerStamina: number;
  currentOver: number;
  totalOvers: number;
  runsNeeded?: number;
  wicketsLeft: number;
  ballsLeft: number;
}

export interface InningStats {
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  wicketsTaken: number;
  oversBowled: number;
  runsConceded: number;
  catches: number;
  runOuts: number;
}

export interface BowlingSlot {
  playerId: string;
  oversAssigned: number;
  oversCompleted: number;
}

export interface FieldPosition {
  playerId: string;
  position: string;
  x: number;
  y: number;
}

export type AIDifficulty = 'rookie' | 'club' | 'international' | 'legend';
