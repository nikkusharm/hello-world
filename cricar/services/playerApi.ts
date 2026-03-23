import { doc, getDoc, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db, playersCollection, packsCollection } from './firebase';
import { Player } from '../types/player';
import { Pack } from '../types/card';
import { Skill } from '../types/game';

export async function getPlayer(playerId: string): Promise<Player | null> {
  const snap = await getDoc(doc(db, 'players', playerId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Player;
}

export async function getPlayersByTeam(team: string): Promise<Player[]> {
  const q = query(playersCollection, where('team', '==', team));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Player);
}

export async function getPlayerSkillsForYear(playerId: string, year: number): Promise<Skill[]> {
  const snap = await getDoc(doc(db, 'players', playerId));
  if (!snap.exists()) return [];
  const skillsByYear = snap.data()?.skillsByYear as Record<string, Skill[]> | undefined;
  if (!skillsByYear) return [];
  const skills: Skill[] = [];
  for (const [yr, yearSkills] of Object.entries(skillsByYear)) {
    if (parseInt(yr, 10) <= year) skills.push(...yearSkills);
  }
  return skills;
}

export async function getPack(packId: string): Promise<Pack | null> {
  const snap = await getDoc(doc(db, 'packs', packId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Pack;
}

export async function getPacksByTier(tier: string): Promise<Pack[]> {
  const q = query(packsCollection, where('tier', '==', tier));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Pack);
}

export async function getPacksByTeam(team: string): Promise<Pack[]> {
  const q = query(packsCollection, where('team', '==', team));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Pack);
}

export async function searchPlayers(searchQuery: string): Promise<Player[]> {
  const q = query(
    playersCollection,
    where('name', '>=', searchQuery),
    where('name', '<=', searchQuery + '\uf8ff'),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Player);
}