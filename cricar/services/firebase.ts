import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore, collection
} from 'firebase/firestore';
import { getDatabase, ref } from 'firebase/database';

cconst firebaseConfig = {
  apiKey:            'AIzaSyBAwG2rEWpJWPGFa2FvTwDzuc7aB_5QDIk',
  authDomain:        'cricar-4041b.firebaseapp.com',
  projectId:         'cricar-4041b',
  storageBucket:     'cricar-4041b.firebasestorage.app',
  messagingSenderId: '884387305478',
  appId:             '1:884387305478:android:4d3e26845a4e8234ad8b87',
  databaseURL:       'https://cricar-4041b-default-rtdb.asia-southeast1.firebasedatabase.app',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export const usersCollection       = collection(db, 'users');
export const cardsCollection       = collection(db, 'cards');
export const sessionsCollection    = collection(db, 'sessions');
export const playersCollection     = collection(db, 'players');
export const packsCollection       = collection(db, 'packs');
export const tournamentsCollection = collection(db, 'tournaments');

export const matchRoomsRef = ref(rtdb, 'matchRooms');

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
  createdAt: any;
}

export async function createUserDocument(
  userId: string, email: string, displayName: string, username: string
): Promise<void> {
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  await setDoc(doc(db, 'users', userId), {
    email, displayName, username,
    ownedCards: [], ownedPacks: [], unlockedYears: {},
    activeSessionId: '', tournamentIds: [], pushToken: '',
    createdAt: serverTimestamp(),
  });
}

export async function getUserDocument(userId: string): Promise<UserDocument | null> {
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return snap.data() as UserDocument;
}

export async function updateUserPushToken(userId: string, token: string): Promise<void> {
  const { doc, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'users', userId), { pushToken: token });
}