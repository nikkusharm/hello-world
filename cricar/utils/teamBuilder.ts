import { RoleAssignment, SessionPlayer, Team } from '../types/match';
import { Player } from '../types/player';
import { AIDifficulty } from '../types/game';

export function assignRoles(teamSize: number): RoleAssignment {
  switch (teamSize) {
    case 1:
      return { batters: 1, bowlers: 0, fielders: 0, needsAIFill: 10 };
    case 2:
      return { batters: 1, bowlers: 1, fielders: 0, needsAIFill: 9 };
    case 3:
      return { batters: 2, bowlers: 1, fielders: 0, needsAIFill: 8 };
    case 4:
      return { batters: 2, bowlers: 2, fielders: 0, needsAIFill: 7 };
    case 5:
      return { batters: 3, bowlers: 2, fielders: 0, needsAIFill: 6 };
    case 6:
      return { batters: 3, bowlers: 3, fielders: 0, needsAIFill: 5 };
    case 7:
      return { batters: 4, bowlers: 3, fielders: 0, needsAIFill: 4 };
    case 8:
      return { batters: 4, bowlers: 3, fielders: 1, needsAIFill: 3 };
    case 9:
      return { batters: 4, bowlers: 4, fielders: 1, needsAIFill: 2 };
    case 10:
      return { batters: 5, bowlers: 4, fielders: 1, needsAIFill: 1 };
    case 11:
      return { batters: 5, bowlers: 4, fielders: 2, needsAIFill: 0 };
    default:
      return calculateRoles(teamSize);
  }
}

function calculateRoles(teamSize: number): RoleAssignment {
  const clamped = Math.min(teamSize, 11);
  const batters = Math.ceil(clamped * 0.45);
  const bowlers = Math.ceil(clamped * 0.36);
  const fielders = clamped - batters - bowlers;
  return {
    batters,
    bowlers,
    fielders: Math.max(0, fielders),
    needsAIFill: Math.max(0, 11 - clamped),
  };
}

export function autoAssignTeams(
  players: { userId: string; player: Player }[]
): Map<string, { userId: string; player: Player }[]> {
  const teams = new Map<string, { userId: string; player: Player }[]>();

  for (const entry of players) {
    const teamName = entry.player.team;
    if (!teams.has(teamName)) {
      teams.set(teamName, []);
    }
    teams.get(teamName)!.push(entry);
  }

  return teams;
}

export function buildTeam(
  teamId: string,
  teamName: string,
  captainUserId: string,
  humanPlayers: { userId: string; playerId: string }[],
  aiDifficulty: AIDifficulty
): Team {
  const roles = assignRoles(humanPlayers.length);
  const sessionPlayers: SessionPlayer[] = [];

  // Assign human players
  humanPlayers.forEach((hp, index) => {
    let role: SessionPlayer['role'];
    if (index === 0) role = 'captain';
    else if (index < roles.batters) role = 'batsman';
    else if (index < roles.batters + roles.bowlers) role = 'bowler';
    else role = 'fielder';

    sessionPlayers.push({
      userId: hp.userId,
      playerId: hp.playerId,
      teamId,
      role,
      stamina: 100,
      stats: {
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        wicketsTaken: 0,
        oversBowled: 0,
        runsConceded: 0,
        catches: 0,
        runOuts: 0,
      },
      isAI: false,
    });
  });

  // Fill remaining slots with AI players
  for (let i = 0; i < roles.needsAIFill; i++) {
    const aiRole = i < 3 ? 'batsman' : i < 6 ? 'bowler' : 'fielder';
    sessionPlayers.push({
      userId: `ai_${teamId}_${i}`,
      playerId: `ai_player_${i}`,
      teamId,
      role: aiRole as SessionPlayer['role'],
      stamina: 100,
      stats: {
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        wicketsTaken: 0,
        oversBowled: 0,
        runsConceded: 0,
        catches: 0,
        runOuts: 0,
      },
      isAI: true,
      aiDifficulty,
    });
  }

  return {
    id: teamId,
    name: teamName,
    captainId: captainUserId,
    players: sessionPlayers,
    battingOrder: sessionPlayers
      .filter((p) => p.role === 'batsman' || p.role === 'captain')
      .map((p) => p.userId),
    bowlingRotation: sessionPlayers
      .filter((p) => p.role === 'bowler')
      .map((p) => ({
        playerId: p.userId,
        oversAssigned: 4,
        oversCompleted: 0,
      })),
    fieldPositions: [],
  };
}
