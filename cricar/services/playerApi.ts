import { playersCollection, packsCollection } from './firebase';
import { Player } from '../types/player';
import { Pack } from '../types/card';
import { Skill } from '../types/game';

export async function getPlayer(playerId: string): Promise<Player | null> {
  const doc = await playersCollection.doc(playerId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Player;
}

export async function getPlayersByTeam(team: string): Promise<Player[]> {
  const snapshot = await playersCollection.where('team', '==', team).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Player);
}

export async function getPlayerSkillsForYear(
  playerId: string,
  year: number
): Promise<Skill[]> {
  const doc = await playersCollection.doc(playerId).get();
  if (!doc.exists) return [];
  const data = doc.data();
  const skillsByYear = data?.skillsByYear as Record<string, Skill[]> | undefined;
  if (!skillsByYear) return [];

  // Collect skills from all unlocked years up to the requested year
  const skills: Skill[] = [];
  for (const [yr, yearSkills] of Object.entries(skillsByYear)) {
    if (parseInt(yr, 10) <= year) {
      skills.push(...yearSkills);
    }
  }
  return skills;
}

export async function getPack(packId: string): Promise<Pack | null> {
  const doc = await packsCollection.doc(packId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Pack;
}

export async function getPacksByTier(tier: string): Promise<Pack[]> {
  const snapshot = await packsCollection.where('tier', '==', tier).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Pack);
}

export async function getPacksByTeam(team: string): Promise<Pack[]> {
  const snapshot = await packsCollection.where('team', '==', team).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Pack);
}

export async function searchPlayers(query: string): Promise<Player[]> {
  // Firestore doesn't support full-text search natively,
  // so we use a prefix match on the name field
  const snapshot = await playersCollection
    .where('name', '>=', query)
    .where('name', '<=', query + '\uf8ff')
    .limit(20)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Player);
}
