import { create } from 'zustand';
import { Card, Pack } from '../types/card';
import { Player } from '../types/player';
import { cardsCollection, usersCollection } from '../services/firebase';
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
      const userDoc = await usersCollection.doc(userId).get();
      const ownedSerials: string[] = userDoc.data()?.ownedCards || [];

      const cards: Card[] = [];
      const players: Player[] = [];

      for (const serial of ownedSerials) {
        const cardDoc = await cardsCollection.doc(serial).get();
        if (cardDoc.exists) {
          const card = { id: cardDoc.id, ...cardDoc.data() } as Card;
          cards.push(card);

          const player = await getPlayer(card.playerId);
          if (player) players.push(player);
        }
      }

      set({ ownedCards: cards, ownedPlayers: players, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load collection',
      });
    }
  },

  addCard: (card: Card) => {
    set((state) => ({
      ownedCards: [...state.ownedCards, card],
    }));
  },

  getPlayerForCard: (card: Card) => {
    return get().ownedPlayers.find((p) => p.id === card.playerId);
  },
}));
