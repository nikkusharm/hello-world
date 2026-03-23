import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, cardsCollection, usersCollection } from './firebase';

interface PaymentResult { success: boolean; error?: string; }

interface UpgradeInfo {
  packName: string; packYear: number; newSkillsCount: number;
  players: { name: string; newSkills: string[] }[]; price: number;
}

export async function getUpgradeInfo(packId: string, userId: string): Promise<UpgradeInfo | null> {
  const packSnap = await getDoc(doc(db, 'packs', packId));
  if (!packSnap.exists()) return null;
  const pack = packSnap.data();

  const userSnap = await getDoc(doc(db, 'users', userId));
  const unlockedYears = userSnap.data()?.unlockedYears || {};
  const lastUnlockedYear = unlockedYears[packId] || 0;
  if (lastUnlockedYear >= pack.year) return null;

  const players: { name: string; newSkills: string[] }[] = [];
  let totalNewSkills = 0;

  for (const playerId of pack.playerIds) {
    const playerSnap = await getDoc(doc(db, 'players', playerId));
    if (!playerSnap.exists()) continue;
    const playerData = playerSnap.data();
    const skillsByYear = playerData.skillsByYear || {};
    const newSkills: string[] = [];

    for (const [yr, skills] of Object.entries(skillsByYear)) {
      if (parseInt(yr, 10) > lastUnlockedYear && parseInt(yr, 10) <= pack.year) {
        for (const skill of skills as { name: string }[]) newSkills.push(skill.name);
      }
    }
    if (newSkills.length > 0) {
      players.push({ name: playerData.name, newSkills });
      totalNewSkills += newSkills.length;
    }
  }

  return { packName: pack.name, packYear: pack.year, newSkillsCount: totalNewSkills, players, price: pack.upgradePrice || 50 };
}

export async function createPaymentIntent(
  amount: number, currency: string, metadata: Record<string, string>
): Promise<{ clientSecret: string } | null> {
  try {
    const response = await fetch('https://us-central1-cricar-app.cloudfunctions.net/createPaymentIntent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency, metadata }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch { return null; }
}

export async function processUpgradePayment(
  packId: string, userId: string, paymentIntentId: string
): Promise<PaymentResult> {
  try {
    const timeout = 15000; const interval = 1000; let elapsed = 0;
    while (elapsed < timeout) {
      const userSnap = await getDoc(doc(db, 'users', userId));
      const unlockedYears = userSnap.data()?.unlockedYears || {};
      const packSnap = await getDoc(doc(db, 'packs', packId));
      const packYear = packSnap.data()?.year;
      if (unlockedYears[packId] >= packYear) return { success: true };
      await new Promise(resolve => setTimeout(resolve, interval));
      elapsed += interval;
    }
    return { success: false, error: 'Payment processing timeout.' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Payment failed' };
  }
}

export async function initiateTransfer(serial: string, requestingUserId: string): Promise<PaymentResult> {
  try {
    const cardSnap = await getDoc(doc(db, 'cards', serial));
    if (!cardSnap.exists()) return { success: false, error: 'Card not found' };
    const card = cardSnap.data();
    if (card.ownerId === requestingUserId) return { success: false, error: 'You already own this card' };

    await addDoc(collection(db, 'transferRequests'), {
      serial, fromUserId: card.ownerId, toUserId: requestingUserId,
      status: 'pending', transferFee: 10,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Transfer failed' };
  }
}