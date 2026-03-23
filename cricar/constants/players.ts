// Sample player data for testing and development
// In production, all player data comes from Firestore

import { Player } from '../types/player';

export const SAMPLE_PLAYERS: Player[] = [
  {
    id: 'virat_kohli_2023',
    name: 'Virat Kohli',
    team: 'India',
    year: 2023,
    role: 'batsman',
    stats: {
      batting: {
        average: 53.5,
        strikeRate: 137.8,
        centuries: 46,
        boundaryPercent: 52,
        spinRecord: 8.2,
        paceRecord: 7.5,
      },
      bowling: {
        average: 0,
        economy: 0,
        strikeRate: 0,
        swingRating: 0,
        spinRating: 0,
        deathOversRating: 0,
      },
      fielding: {
        catchRating: 8,
        throwAccuracy: 7,
        diveRating: 6,
      },
    },
    skills: [],
    avatarModel: 'kohli_avatar',
    cardImage: 'kohli_card',
    cardSerial: 'IND-VK18-2023',
    isLegacy: false,
  },
  {
    id: 'jasprit_bumrah_2023',
    name: 'Jasprit Bumrah',
    team: 'India',
    year: 2023,
    role: 'bowler',
    stats: {
      batting: {
        average: 6.2,
        strikeRate: 62.0,
        centuries: 0,
        boundaryPercent: 15,
        spinRecord: 2,
        paceRecord: 1,
      },
      bowling: {
        average: 21.3,
        economy: 6.6,
        strikeRate: 18.2,
        swingRating: 9,
        spinRating: 0,
        deathOversRating: 9.5,
      },
      fielding: {
        catchRating: 5,
        throwAccuracy: 6,
        diveRating: 4,
      },
    },
    skills: [],
    avatarModel: 'bumrah_avatar',
    cardImage: 'bumrah_card',
    cardSerial: 'IND-JB93-2023',
    isLegacy: false,
  },
  {
    id: 'ms_dhoni_2011',
    name: 'MS Dhoni',
    team: 'India',
    year: 2011,
    role: 'wicketkeeper',
    stats: {
      batting: {
        average: 50.6,
        strikeRate: 155.0,
        centuries: 10,
        boundaryPercent: 48,
        spinRecord: 8.5,
        paceRecord: 9.0,
      },
      bowling: {
        average: 0,
        economy: 0,
        strikeRate: 0,
        swingRating: 0,
        spinRating: 0,
        deathOversRating: 0,
      },
      fielding: {
        catchRating: 9.5,
        throwAccuracy: 8,
        diveRating: 7,
      },
    },
    skills: [],
    avatarModel: 'dhoni_avatar',
    cardImage: 'dhoni_card',
    cardSerial: 'IND-MSD7-2011',
    isLegacy: true,
  },
];

