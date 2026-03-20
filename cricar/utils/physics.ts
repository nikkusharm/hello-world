import { Skill, MatchContext, BallOutcome } from '../types/game';

export function resolveBall(
  batsmanSkill: Skill,
  bowlerSkill: Skill,
  randomSeed: number,
  matchContext: MatchContext
): BallOutcome {
  let batsmanScore = (batsmanSkill.power / 10) * randomSeed;
  let bowlerScore = (bowlerSkill.power / 10) * (1 - randomSeed);

  const batsmanVariance =
    (batsmanSkill.risk / 10) * (Math.random() - 0.5) * 0.4;
  const bowlerVariance =
    (bowlerSkill.risk / 10) * (Math.random() - 0.5) * 0.4;

  batsmanScore += batsmanVariance;
  bowlerScore += bowlerVariance;

  // Pressure modifier — last 2 overs, stamina below 30%
  if (matchContext.isDeathOvers) {
    if (matchContext.batsmanStamina < 30) batsmanScore -= 0.1;
    if (matchContext.bowlerStamina < 30) bowlerScore -= 0.08;
  }

  // Special condition check
  if (
    batsmanSkill.specialCondition === 'vs_spin' &&
    bowlerSkill.type !== 'bowling' // non-spin bowling
  ) {
    batsmanScore -= 0.05;
  }

  const margin = batsmanScore - bowlerScore;

  if (margin > 0.4)
    return { runs: 6, outcome: 'six', animation: 'big_hit_anim' };
  if (margin > 0.25)
    return { runs: 4, outcome: 'four', animation: 'boundary_anim' };
  if (margin > 0.15)
    return { runs: 3, outcome: 'triple', animation: 'running_anim' };
  if (margin > 0.08)
    return { runs: 2, outcome: 'double', animation: 'running_anim' };
  if (margin > 0)
    return { runs: 1, outcome: 'single', animation: 'single_anim' };
  if (margin > -0.2)
    return { runs: 0, outcome: 'dot', animation: 'defended_anim' };
  return { runs: 0, outcome: 'wicket', animation: 'dismissal_anim' };
}

// Calculate catch probability based on fielding stats
export function calculateCatchProbability(
  catchRating: number,
  tappedInTime: boolean
): boolean {
  if (!tappedInTime) return false;
  const probability = catchRating / 10;
  return Math.random() < probability;
}

// Calculate tap window for fielder minigame based on catch rating
export function getFielderTapWindow(catchRating: number): number {
  // 8+ catch rating = 2 second window, 4 rating = 0.8 second window
  // Linear interpolation between these bounds
  const minWindow = 0.8;
  const maxWindow = 2.0;
  const minRating = 4;
  const maxRating = 10;

  const clampedRating = Math.max(minRating, Math.min(maxRating, catchRating));
  const t = (clampedRating - minRating) / (maxRating - minRating);
  return minWindow + t * (maxWindow - minWindow);
}

// Calculate run-out probability based on throw accuracy
export function calculateRunOutProbability(
  throwAccuracy: number,
  crosshairAccuracy: number // 0-1, how centered the tap was
): boolean {
  const probability = (throwAccuracy / 10) * crosshairAccuracy;
  return Math.random() < probability;
}

// Calculate DRS review success probability
export function calculateDRSOutcome(bowlerSkillRisk: number): boolean {
  // High risk skill = 40% chance of being overturned (60% upheld)
  // Low risk skill = 80% chance of being upheld
  const upheldProbability = 0.8 - (bowlerSkillRisk / 10) * 0.4;
  return Math.random() < upheldProbability;
}
