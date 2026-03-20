import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/gameConfig';

interface PackDisplay {
  id: string;
  name: string;
  tier: string;
  price: string;
  description: string;
  playerCount: number;
}

const PACKS: PackDisplay[] = [
  {
    id: 'starter_india',
    name: 'India Starter Pack',
    tier: 'starter',
    price: 'Free with card purchase',
    description: 'Base skills for all Indian cricket stars',
    playerCount: 15,
  },
  {
    id: 'season_2024',
    name: 'Season 2024 Upgrade',
    tier: 'season',
    price: '₹50',
    description: 'Unlock 2024 season skills and updated stats',
    playerCount: 15,
  },
  {
    id: 'legend_pack',
    name: 'Legends Collection',
    tier: 'legend',
    price: '₹150',
    description: 'Classic cricket legends with premium NFC-verified cards',
    playerCount: 10,
  },
  {
    id: 'rivalry_pack',
    name: 'India vs Australia Rivalry',
    tier: 'rivalry',
    price: '₹100',
    description: 'Special rivalry cards with unique head-to-head skills',
    playerCount: 22,
  },
];

const TIER_COLORS: Record<string, string> = {
  starter: COLORS.success,
  season: COLORS.primaryLight,
  legend: COLORS.cardGold,
  rivalry: COLORS.secondary,
  worldxi: COLORS.cardSilver,
};

export default function ShopTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Card Shop</Text>
      <Text style={styles.subheader}>Upgrade your collection with new skill packs</Text>

      {PACKS.map((pack) => (
        <TouchableOpacity key={pack.id} style={styles.packCard} activeOpacity={0.7}>
          <View style={styles.packHeader}>
            <View
              style={[
                styles.tierBadge,
                { backgroundColor: TIER_COLORS[pack.tier] || COLORS.primary },
              ]}
            >
              <Text style={styles.tierText}>{pack.tier.toUpperCase()}</Text>
            </View>
            <Text style={styles.packPrice}>{pack.price}</Text>
          </View>
          <Text style={styles.packName}>{pack.name}</Text>
          <Text style={styles.packDescription}>{pack.description}</Text>
          <Text style={styles.packPlayers}>{pack.playerCount} players included</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    gap: 14,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  subheader: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  packCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  packHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tierText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  packPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.cardGold,
  },
  packName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  packDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  packPlayers: {
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
});
