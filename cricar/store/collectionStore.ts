import { create } from 'zustand';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Card } from '../types/card';
import { Player } from '../types/player';
import { getPlayer } from '../services/playerApi';

interface CollectionState {
  ownedCards: Card[];
  ownedPlayers: Player[];
  isLoading: boolean;
  error: string | null;
  loadCollection: (userId: string) => Promise<void>;
  addCard: (card: Card) => void;
  getPlayerForCard: (card: Card) => Player | undefined;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  ownedCards: [],
  ownedPlayers: [],
  isLoading: false,
  error: null,

  loadCollection: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const userSnap = await getDoc(doc(db, 'users', userId));
      const ownedSerials: string[] = userSnap.data()?.ownedCards || [];

      const cards: Card[] = [];
      const players: Player[] = [];

      for (const serial of ownedSerials) {
        const cardSnap = await getDoc(doc(db, 'cards', serial));
        if (cardSnap.exists()) {
          const card = { id: cardSnap.id, ...cardSnap.data() } as Card;
          cards.push(card);
          const player = await getPlayer(card.playerId);
          if (player) players.push(player);
        }
      }
      set({ ownedCards: cards, ownedPlayers: players, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to load collection' });
    }
  },

  addCard: (card: Card) => set(state => ({ ownedCards: [...state.ownedCards, card] })),
  getPlayerForCard: (card: Card) => get().ownedPlayers.find(p => p.id === card.playerId),
}));