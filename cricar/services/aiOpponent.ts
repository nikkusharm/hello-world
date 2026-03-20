import { Skill, MatchContext, AIDifficulty } from '../types/game';

interface SkillUsage {
  skillId: string;
  over: number;
  ball: number;
  runsNeeded: number;
  wicketsLeft: number;
  wasDeathOver: boolean;
}

interface AIState {
  difficulty: AIDifficulty;
  skillHistory: SkillUsage[];
  staminaPool: number;
  patternMap: Map<string, number>;
  role: 'batsman' | 'bowler';
}

// Counter skill mapping for International AI
const COUNTER_SKILL_MAP: Record<string, string[]> = {
  pull_shot: ['yorker', 'bouncer'],
  cover_drive: ['outswing', 'slower_ball'],
  sweep: ['googly', 'faster_delivery'],
  helicopter_shot: ['yorker', 'bouncer'],
  reverse_sweep: ['googly', 'doosra'],
  defence: ['doosra', 'googly', 'slower_ball'],
  yorker: ['helicopter_shot', 'pull_shot'],
  outswing: ['cover_drive', 'defence'],
  googly: ['sweep', 'reverse_sweep'],
  bouncer: ['pull_shot', 'helicopter_shot'],
  slower_ball: ['cover_drive', 'sweep'],
  doosra: ['sweep', 'reverse_sweep'],
};

function getDefaultSkill(role: 'batsman' | 'bowler'): Skill {
  if (role === 'batsman') {
    return {
      id: 'defence',
      name: 'Solid Defence',
      type: 'batting',
      power: 3,
      risk: 1,
      staminaCost: 5,
      animation: 'defence_anim',
      unlockYear: 2000,
      description: 'Basic defensive block',
    };
  }
  return {
    id: 'stock_delivery',
    name: 'Stock Delivery',
    type: 'bowling',
    power: 3,
    risk: 1,
    staminaCost: 5,
    animation: 'stock_anim',
    unlockYear: 2000,
    description: 'Basic stock delivery',
  };
}

function detectPattern(lastThree: SkillUsage[]): string | null {
  if (lastThree.length < 2) return null;

  // Check if human repeated the same skill
  const skillCounts: Record<string, number> = {};
  for (const usage of lastThree) {
    skillCounts[usage.skillId] = (skillCounts[usage.skillId] || 0) + 1;
  }

  for (const [skillId, count] of Object.entries(skillCounts)) {
    if (count >= 2) return skillId;
  }
  return null;
}

function getCounterSkill(
  patternSkillId: string | null,
  affordable: Skill[]
): Skill | null {
  if (!patternSkillId) return null;

  const counterIds = COUNTER_SKILL_MAP[patternSkillId];
  if (!counterIds) return null;

  for (const counterId of counterIds) {
    const counter = affordable.find((s) => s.id === counterId);
    if (counter) return counter;
  }
  return null;
}

function detectPressure(context: MatchContext): string {
  if (context.isDeathOvers && context.runsNeeded && context.runsNeeded > 30) {
    return 'high_pressure_death';
  }
  if (context.isDeathOvers) return 'death_overs';
  if (context.wicketsLeft <= 3) return 'low_wickets';
  if (context.runsNeeded && context.runsNeeded < 20 && context.ballsLeft > 12) {
    return 'comfortable_chase';
  }
  return 'normal';
}

function getMostUsedInSituation(
  patternMap: Map<string, number>,
  situation: string
): string | null {
  let maxCount = 0;
  let mostUsed: string | null = null;

  for (const [key, count] of patternMap.entries()) {
    if (key.startsWith(situation + ':') && count > maxCount) {
      maxCount = count;
      mostUsed = key.split(':')[1];
    }
  }
  return mostUsed;
}

function getHardCounter(
  humanFavoriteId: string | null,
  affordable: Skill[]
): Skill | null {
  if (!humanFavoriteId) return null;
  return getCounterSkill(humanFavoriteId, affordable);
}

function getSituationalBest(affordable: Skill[], context: MatchContext): Skill {
  if (context.isDeathOvers) {
    // Prefer high-power skills in death overs
    return affordable.reduce(
      (best, s) => (s.power > best.power ? s : best),
      affordable[0]
    );
  }
  // Balance power and risk in normal situations
  return affordable.reduce(
    (best, s) =>
      s.power / (s.risk + 1) > best.power / (best.risk + 1) ? s : best,
    affordable[0]
  );
}

export function selectAISkill(
  aiState: AIState,
  availableSkills: Skill[],
  matchContext: MatchContext
): Skill {
  const affordable = availableSkills.filter(
    (s) => s.staminaCost <= aiState.staminaPool
  );
  if (affordable.length === 0) return getDefaultSkill(aiState.role);

  switch (aiState.difficulty) {
    case 'rookie':
      // Random selection, no strategy
      return affordable[Math.floor(Math.random() * affordable.length)];

    case 'club':
      // Always pick highest power
      return affordable.reduce(
        (best, s) => (s.power > best.power ? s : best),
        affordable[0]
      );

    case 'international': {
      // Track last 3 balls and counter patterns
      const lastThree = aiState.skillHistory.slice(-3);
      const humanPattern = detectPattern(lastThree);
      const counter = getCounterSkill(humanPattern, affordable);

      // Save stamina for death overs
      if (!matchContext.isDeathOvers && matchContext.totalOvers - matchContext.currentOver <= 2) {
        const conservative = affordable.filter((s) => s.staminaCost <= aiState.staminaPool * 0.3);
        if (conservative.length > 0) {
          return conservative.reduce(
            (best, s) => (s.power > best.power ? s : best),
            conservative[0]
          );
        }
      }

      return counter || affordable.reduce(
        (b, s) => (s.power > b.power ? s : b),
        affordable[0]
      );
    }

    case 'legend': {
      // Full pattern recognition across the entire match
      const pressureSituation = detectPressure(matchContext);
      const humanFavorite = getMostUsedInSituation(
        aiState.patternMap,
        pressureSituation
      );
      const hardCounter = getHardCounter(humanFavorite, affordable);

      // Save best counter for death overs
      if (hardCounter && matchContext.isDeathOvers) return hardCounter;

      // Use situational best otherwise
      const situational = getSituationalBest(affordable, matchContext);
      return situational;
    }
  }
}

export function updatePatternMap(
  patternMap: Map<string, number>,
  skillId: string,
  context: MatchContext
): Map<string, number> {
  const situation = detectPressure(context);
  const key = `${situation}:${skillId}`;
  patternMap.set(key, (patternMap.get(key) || 0) + 1);
  return patternMap;
}

export function createAIState(
  difficulty: AIDifficulty,
  role: 'batsman' | 'bowler',
  initialStamina: number
): AIState {
  return {
    difficulty,
    skillHistory: [],
    staminaPool: initialStamina,
    patternMap: new Map(),
    role,
  };
}

export function recordHumanSkill(
  aiState: AIState,
  skillId: string,
  context: MatchContext
): void {
  aiState.skillHistory.push({
    skillId,
    over: context.currentOver,
    ball: 0,
    runsNeeded: context.runsNeeded || 0,
    wicketsLeft: context.wicketsLeft,
    wasDeathOver: context.isDeathOvers,
  });

  if (aiState.difficulty === 'legend') {
    updatePatternMap(aiState.patternMap, skillId, context);
  }
}
