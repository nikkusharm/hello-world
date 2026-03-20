import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';

// Firestore collection references
export const usersCollection = firestore().collection('users');
export const cardsCollection = firestore().collection('cards');
export const sessionsCollection = firestore().collection('sessions');
export const playersCollection = firestore().collection('players');
export const packsCollection = firestore().collection('packs');
export const tournamentsCollection = firestore().collection('tournaments');

// Realtime Database references
export const matchRoomsRef = database().ref('matchRooms');

// Auth instance
export const firebaseAuth = auth();

// Firestore instance
export const db = firestore();

// Messaging instance
export const firebaseMessaging = messaging();

// Initialize Firestore settings
firestore().settings({
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

export interface UserDocument {
  email: string;
  displayName: string;
  username: string;
  ownedCards: string[];
  ownedPacks: string[];
  unlockedYears: Record<string, number>;
  activeSessionId: string;
  tournamentIds: string[];
  pushToken: string;
  createdAt: Date;
}

export async function createUserDocument(
  userId: string,
  email: string,
  displayName: string,
  username: string
): Promise<void> {
  await usersCollection.doc(userId).set({
    email,
    displayName,
    username,
    ownedCards: [],
    ownedPacks: [],
    unlockedYears: {},
    activeSessionId: '',
    tournamentIds: [],
    pushToken: '',
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

export async function getUserDocument(userId: string): Promise<UserDocument | null> {
  const doc = await usersCollection.doc(userId).get();
  if (!doc.exists) return null;
  return doc.data() as UserDocument;
}

export async function updateUserPushToken(userId: string, token: string): Promise<void> {
  await usersCollection.doc(userId).update({ pushToken: token });
}

export async function requestNotificationPermission(): Promise<string | null> {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const token = await messaging().getToken();
    return token;
  }
  return null;
}
