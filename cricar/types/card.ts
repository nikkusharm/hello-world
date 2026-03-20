export interface Transfer {
  fromUserId: string;
  toUserId: string;
  transferredAt: Date;
  paymentId: string;
}

export interface Card {
  id: string;
  playerId: string;
  serial: string;
  packId: string;
  packYear: number;
  ownerId: string;
  activatedAt: Date;
  isTransferred: boolean;
  transferHistory: Transfer[];
  nfcId?: string;
}

export type PackTier = 'starter' | 'season' | 'legend' | 'rivalry' | 'worldxi';

export interface Pack {
  id: string;
  name: string;
  team: string;
  year: number;
  price: number;
  upgradePrice: number;
  playerIds: string[];
  isStarter: boolean;
  tier: PackTier;
  availableFrom: Date;
}
