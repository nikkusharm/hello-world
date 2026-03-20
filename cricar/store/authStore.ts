import { create } from 'zustand';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createUserDocument, getUserDocument, UserDocument } from '../services/firebase';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  userDoc: UserDocument | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string,
    username: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userDoc: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: () => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getUserDocument(user.uid);
        set({ user, userDoc, isInitialized: true, isLoading: false });
      } else {
        set({ user: null, userDoc: null, isInitialized: true, isLoading: false });
      }
    });
    return unsubscribe;
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      const message = getAuthErrorMessage(error);
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  signUpWithEmail: async (
    email: string,
    password: string,
    displayName: string,
    username: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const credential = await auth().createUserWithEmailAndPassword(email, password);
      await credential.user.updateProfile({ displayName });
      await createUserDocument(credential.user.uid, email, displayName, username);
    } catch (error) {
      const message = getAuthErrorMessage(error);
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      });
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      if (!idToken) throw new Error('No ID token from Google Sign-In');

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const credential = await auth().signInWithCredential(googleCredential);

      // Create user document if first sign-in
      const existingDoc = await getUserDocument(credential.user.uid);
      if (!existingDoc) {
        await createUserDocument(
          credential.user.uid,
          credential.user.email || '',
          credential.user.displayName || '',
          credential.user.displayName?.toLowerCase().replace(/\s+/g, '_') || ''
        );
      }
    } catch (error) {
      const message = getAuthErrorMessage(error);
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await auth().signOut();
      try { await GoogleSignin.signOut(); } catch { /* not signed in with Google */ }
      set({ user: null, userDoc: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to sign out' });
    }
  },

  clearError: () => set({ error: null }),
}));

function getAuthErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}
