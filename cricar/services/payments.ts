import { usersCollection, cardsCollection } from './firebase';
import firestore from '@react-native-firebase/firestore';

interface PaymentResult {
  success: boolean;
  error?: string;
}

interface UpgradeInfo {
  packName: string;
  packYear: number;
  newSkillsCount: number;
  players: { name: string; newSkills: string[] }[];
  price: number;
}

// Fetch upgrade info for display in bottom sheet
export async function getUpgradeInfo(
  packId: string,
  userId: string
): Promise<UpgradeInfo | null> {
  const packDoc = await firestore().collection('packs').doc(packId).get();
  if (!packDoc.exists) return null;

  const pack = packDoc.data()!;
  const userDoc = await usersCollection.doc(userId).get();
  const unlockedYears = userDoc.data()?.unlockedYears || {};
  const lastUnlockedYear = unlockedYears[packId] || 0;

  if (lastUnlockedYear >= pack.year) return null; // Already unlocked

  const players: { name: string; newSkills: string[] }[] = [];
  let totalNewSkills = 0;

  for (const playerId of pack.playerIds) {
    const playerDoc = await firestore().collection('players').doc(playerId).get();
    if (!playerDoc.exists) continue;
    const playerData = playerDoc.data()!;
    const skillsByYear = playerData.skillsByYear || {};
    const newSkills: string[] = [];

    for (const [yr, skills] of Object.entries(skillsByYear)) {
      if (parseInt(yr, 10) > lastUnlockedYear && parseInt(yr, 10) <= pack.year) {
        for (const skill of skills as { name: string }[]) {
          newSkills.push(skill.name);
        }
      }
    }

    if (newSkills.length > 0) {
      players.push({ name: playerData.name, newSkills });
      totalNewSkills += newSkills.length;
    }
  }

  return {
    packName: pack.name,
    packYear: pack.year,
    newSkillsCount: totalNewSkills,
    players,
    price: pack.upgradePrice || 50,
  };
}

// Create a Stripe payment intent via Cloud Function
export async function createPaymentIntent(
  amount: number,
  currency: string,
  metadata: Record<string, string>
): Promise<{ clientSecret: string } | null> {
  try {
    // This calls a Firebase Cloud Function that creates the Stripe PaymentIntent
    const response = await fetch(
      'https://us-central1-cricar-app.cloudfunctions.net/createPaymentIntent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, metadata }),
      }
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Process pack upgrade payment
export async function processUpgradePayment(
  packId: string,
  userId: string,
  paymentIntentId: string
): Promise<PaymentResult> {
  try {
    // Server-side verification happens via Stripe webhook -> Cloud Function
    // The Cloud Function verifies the payment and writes to Firestore
    // Client polls for the unlock to appear
    const timeout = 15000;
    const interval = 1000;
    let elapsed = 0;

    while (elapsed < timeout) {
      const userDoc = await usersCollection.doc(userId).get();
      const unlockedYears = userDoc.data()?.unlockedYears || {};
      const packDoc = await firestore().collection('packs').doc(packId).get();
      const packYear = packDoc.data()?.year;

      if (unlockedYears[packId] >= packYear) {
        return { success: true };
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
      elapsed += interval;
    }

    return { success: false, error: 'Payment processing timeout. Please check your collection.' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

// Initiate card transfer
export async function initiateTransfer(
  serial: string,
  requestingUserId: string
): Promise<PaymentResult> {
  try {
    const cardDoc = await cardsCollection.doc(serial).get();
    if (!cardDoc.exists) return { success: false, error: 'Card not found' };

    const card = cardDoc.data()!;
    if (card.ownerId === requestingUserId) {
      return { success: false, error: 'You already own this card' };
    }

    // Create transfer request document
    await firestore().collection('transferRequests').add({
      serial,
      fromUserId: card.ownerId,
      toUserId: requestingUserId,
      status: 'pending',
      transferFee: 10, // ₹10
      createdAt: firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Push notification to current owner is handled by Cloud Function trigger

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transfer request failed',
    };
  }
}
