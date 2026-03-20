import { create } from 'zustand';
import { Skill, MatchContext, AIDifficulty, BallOutcome } from '../types/game';
import { GameSession, SessionPlayer, Team, Inning } from '../types/match';
import { resolveBall } from '../utils/physics';
import { selectAISkill, createAIState, recordHumanSkill } from '../services/aiOpponent';

interface GameState {
  session: GameSession | null;
  currentBatsman: SessionPlayer | null;
  currentBowler: SessionPlayer | null;
  selectedSkill: Skill | null;
  lastOutcome: BallOutcome | null;
  matchContext: MatchContext;
  aiState: ReturnType<typeof createAIState> | null;

  initSoloGame: (
    playerData: SessionPlayer,
    aiDifficulty: AIDifficulty,
    overLimit: number
  ) => void;
  selectSkill: (skill: Skill) => void;
  playBall: () => BallOutcome | null;
  endInnings: () => void;
  resetGame: () => void;
}

const defaultMatchContext: MatchContext = {
  isDeathOvers: false,
  batsmanStamina: 100,
  bowlerStamina: 100,
  currentOver: 0,
  totalOvers: 5,
  wicketsLeft: 10,
  ballsLeft: 30,
};

export const useGameStore = create<GameState>((set, get) => ({
  session: null,
  currentBatsman: null,
  currentBowler: null,
  selectedSkill: null,
  lastOutcome: null,
  matchContext: defaultMatchContext,
  aiState: null,

  initSoloGame: (playerData, aiDifficulty, overLimit) => {
    const session: GameSession = {
      id: `solo_${Date.now()}`,
      mode: 'solo',
      players: [playerData],
      lockedAvatars: [playerData.playerId],
      status: 'active',
      innings: [
        {
          battingTeamId: 'human',
          bowlingTeamId: 'ai',
          overs: [],
          totalRuns: 0,
          totalWickets: 0,
          extras: 0,
        },
      ],
      currentInning: 0,
      overLimit,
      teams: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const aiOpponent = createAIState(aiDifficulty, 'bowler', 100);

    set({
      session,
      currentBatsman: playerData,
      aiState: aiOpponent,
      matchContext: {
        ...defaultMatchContext,
        totalOvers: overLimit,
        ballsLeft: overLimit * 6,
      },
    });
  },

  selectSkill: (skill) => set({ selectedSkill: skill }),

  playBall: () => {
    const { selectedSkill, aiState, matchContext, session } = get();
    if (!selectedSkill || !aiState || !session) return null;

    // AI selects counter-skill
    const aiSkills = getAISkillPool(aiState.role);
    const aiSkill = selectAISkill(aiState, aiSkills, matchContext);

    // Record human skill for pattern tracking
    recordHumanSkill(aiState, selectedSkill.id, matchContext);

    // Resolve ball outcome
    const randomSeed = Math.random();
    const outcome = resolveBall(selectedSkill, aiSkill, randomSeed, matchContext);

    // Update session state
    const currentInning = session.innings[session.currentInning];
    currentInning.totalRuns += outcome.runs;
    if (outcome.outcome === 'wicket') {
      currentInning.totalWickets++;
    }

    // Update match context
    const ballsPlayed = matchContext.totalOvers * 6 - matchContext.ballsLeft + 1;
    const currentOver = Math.floor(ballsPlayed / 6);
    const ballsLeft = matchContext.ballsLeft - 1;

    // Update stamina
    const batsmanStamina = Math.max(0, matchContext.batsmanStamina - selectedSkill.staminaCost);
    aiState.staminaPool = Math.max(0, aiState.staminaPool - aiSkill.staminaCost);

    const newContext: MatchContext = {
      ...matchContext,
      currentOver,
      ballsLeft,
      batsmanStamina,
      bowlerStamina: aiState.staminaPool,
      isDeathOvers: matchContext.totalOvers - currentOver <= 2,
      wicketsLeft: 10 - currentInning.totalWickets,
    };

    set({
      lastOutcome: outcome,
      selectedSkill: null,
      matchContext: newContext,
      session: { ...session },
    });

    return outcome;
  },

  endInnings: () => {
    const { session, matchContext } = get();
    if (!session) return;

    const target = session.innings[0].totalRuns + 1;

    session.innings.push({
      battingTeamId: 'ai',
      bowlingTeamId: 'human',
      overs: [],
      totalRuns: 0,
      totalWickets: 0,
      extras: 0,
    });
    session.currentInning = 1;

    set({
      session: { ...session },
      matchContext: {
        ...defaultMatchContext,
        totalOvers: matchContext.totalOvers,
        ballsLeft: matchContext.totalOvers * 6,
        runsNeeded: target,
      },
    });
  },

  resetGame: () =>
    set({
      session: null,
      currentBatsman: null,
      currentBowler: null,
      selectedSkill: null,
      lastOutcome: null,
      matchContext: defaultMatchContext,
      aiState: null,
    }),
}));

function getAISkillPool(role: 'batsman' | 'bowler'): Skill[] {
  // Default AI skill pool — in production these come from the AI's card
  if (role === 'bowler') {
    return [
      { id: 'yorker', name: 'Yorker', type: 'bowling', power: 8, risk: 4, staminaCost: 20, animation: 'yorker_anim', unlockYear: 2000, description: 'Pinpoint yorker' },
      { id: 'outswing', name: 'Outswing', type: 'bowling', power: 7, risk: 3, staminaCost: 15, animation: 'outswing_anim', unlockYear: 2000, description: 'Late outswing' },
      { id: 'bouncer', name: 'Bouncer', type: 'bowling', power: 8, risk: 5, staminaCost: 20, animation: 'bouncer_anim', unlockYear: 2000, description: 'Short delivery' },
      { id: 'slower_ball', name: 'Slower Ball', type: 'bowling', power: 7, risk: 6, staminaCost: 16, animation: 'slower_anim', unlockYear: 2000, description: 'Slower delivery' },
      { id: 'stock_delivery', name: 'Stock Delivery', type: 'bowling', power: 5, risk: 1, staminaCost: 5, animation: 'stock_anim', unlockYear: 2000, description: 'Basic delivery' },
    ];
  }
  return [
    { id: 'cover_drive', name: 'Cover Drive', type: 'batting', power: 7, risk: 3, staminaCost: 10, animation: 'cover_drive_anim', unlockYear: 2000, description: 'Cover drive' },
    { id: 'pull_shot', name: 'Pull Shot', type: 'batting', power: 8, risk: 6, staminaCost: 20, animation: 'pull_anim', unlockYear: 2000, description: 'Pull shot' },
    { id: 'defence', name: 'Solid Defence', type: 'batting', power: 5, risk: 1, staminaCost: 5, animation: 'defence_anim', unlockYear: 2000, description: 'Defensive block' },
  ];
}
