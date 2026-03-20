import { Player } from '../types/player';
import { Skill } from '../types/game';

export function generateSkillsFromStats(player: Player, year: number): Skill[] {
  const skills: Skill[] = [];

  if (player.role === 'batsman' || player.role === 'allrounder') {
    if (player.stats.batting.boundaryPercent > 40) {
      skills.push({
        id: 'cover_drive',
        name: 'Cover Drive',
        type: 'batting',
        power: Math.min(10, Math.floor(player.stats.batting.average / 6)),
        risk: 3,
        staminaCost: 10,
        animation: 'cover_drive_anim',
        unlockYear: year,
        description: 'Classic cover drive through the off side',
      });
    }

    if (player.stats.batting.strikeRate > 150) {
      skills.push({
        id: 'helicopter_shot',
        name: 'Helicopter Shot',
        type: 'batting',
        power: 9,
        risk: 7,
        staminaCost: 25,
        animation: 'helicopter_anim',
        unlockYear: year,
        description: 'Trademark finish over fine leg',
      });
    }

    if (player.stats.batting.spinRecord > 7) {
      skills.push({
        id: 'sweep',
        name: 'Sweep Shot',
        type: 'batting',
        power: Math.min(10, Math.floor(player.stats.batting.spinRecord)),
        risk: 5,
        staminaCost: 15,
        animation: 'sweep_anim',
        unlockYear: year,
        description: 'Aggressive sweep against spin',
      });
    }

    if (player.stats.batting.average > 45) {
      skills.push({
        id: 'defence',
        name: 'Solid Defence',
        type: 'batting',
        power: Math.min(10, Math.floor(player.stats.batting.average / 5)),
        risk: 1,
        staminaCost: 5,
        animation: 'defence_anim',
        unlockYear: year,
        description: 'Textbook defensive block',
      });
    }

    if (player.stats.batting.strikeRate > 130 && player.stats.batting.paceRecord > 6) {
      skills.push({
        id: 'pull_shot',
        name: 'Pull Shot',
        type: 'batting',
        power: 8,
        risk: 6,
        staminaCost: 20,
        animation: 'pull_anim',
        unlockYear: year,
        description: 'Aggressive pull over square leg',
      });
    }

    if (player.stats.batting.centuries > 10) {
      skills.push({
        id: 'reverse_sweep',
        name: 'Reverse Sweep',
        type: 'batting',
        power: 7,
        risk: 8,
        staminaCost: 22,
        animation: 'reverse_sweep_anim',
        unlockYear: year,
        description: 'Unorthodox reverse sweep',
      });
    }
  }

  if (player.role === 'bowler' || player.role === 'allrounder') {
    if (player.stats.bowling.deathOversRating > 7) {
      skills.push({
        id: 'yorker',
        name: 'Yorker',
        type: 'bowling',
        power: Math.min(10, Math.floor(player.stats.bowling.deathOversRating)),
        risk: 4,
        staminaCost: 20,
        animation: 'yorker_anim',
        unlockYear: year,
        description: 'Pinpoint yorker at the stumps',
      });
    }

    if (player.stats.bowling.swingRating > 7) {
      skills.push({
        id: 'outswing',
        name: 'Outswing',
        type: 'bowling',
        power: Math.min(10, Math.floor(player.stats.bowling.swingRating)),
        risk: 3,
        staminaCost: 15,
        animation: 'outswing_anim',
        unlockYear: year,
        description: 'Late outswing movement',
      });
    }

    if (player.stats.bowling.spinRating > 7) {
      skills.push({
        id: 'googly',
        name: 'Googly',
        type: 'bowling',
        power: 8,
        risk: 5,
        staminaCost: 18,
        animation: 'googly_anim',
        unlockYear: year,
        description: 'Deceptive googly delivery',
      });
    }

    if (player.stats.bowling.economy < 7) {
      skills.push({
        id: 'slower_ball',
        name: 'Slower Ball',
        type: 'bowling',
        power: 7,
        risk: 6,
        staminaCost: 16,
        animation: 'slower_anim',
        unlockYear: year,
        description: 'Well disguised slower delivery',
      });
    }

    if (player.stats.bowling.strikeRate < 20) {
      skills.push({
        id: 'bouncer',
        name: 'Bouncer',
        type: 'bowling',
        power: 8,
        risk: 5,
        staminaCost: 20,
        animation: 'bouncer_anim',
        unlockYear: year,
        description: 'Aggressive short pitched delivery',
      });
    }

    if (player.stats.bowling.spinRating > 8) {
      skills.push({
        id: 'doosra',
        name: 'Doosra',
        type: 'bowling',
        power: 9,
        risk: 6,
        staminaCost: 22,
        animation: 'doosra_anim',
        unlockYear: year,
        description: 'The other one — turns the wrong way',
      });
    }
  }

  if (player.role === 'wicketkeeper') {
    skills.push({
      id: 'stumping',
      name: 'Lightning Stumping',
      type: 'fielding',
      power: Math.min(10, Math.floor(player.stats.fielding.catchRating)),
      risk: 2,
      staminaCost: 10,
      animation: 'stumping_anim',
      unlockYear: year,
      description: 'Fast hands stumping opportunity',
    });
  }

  return skills;
}
