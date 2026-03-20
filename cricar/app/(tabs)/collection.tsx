import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useCollectionStore } from '../../store/collectionStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { COLORS } from '../../constants/gameConfig';
import { Card } from '../../types/card';

export default function CollectionTab() {
  const user = useAuthStore((s) => s.user);
  const { ownedCards, ownedPlayers, isLoading, loadCollection, getPlayerForCard } =
    useCollectionStore();

  useEffect(() => {
    if (user) loadCollection(user.uid);
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading collection..." />;
  }

  function renderCard({ item }: { item: Card }) {
    const player = getPlayerForCard(item);
    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.playerName}>{player?.name || 'Unknown'}</Text>
          <Text style={styles.playerYear}>{item.packYear}</Text>
        </View>
        <Text style={styles.playerTeam}>{player?.team || ''}</Text>
        <Text style={styles.playerRole}>{player?.role || ''}</Text>
        <Text style={styles.skillCount}>
          {player?.skills.length || 0} skills unlocked
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        My Collection ({ownedCards.length} cards)
      </Text>
      {ownedCards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🃏</Text>
          <Text style={styles.emptyText}>
            Your collection is empty. Scan a card to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={ownedCards}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  playerYear: {
    fontSize: 12,
    color: COLORS.cardGold,
    fontWeight: '600',
  },
  playerTeam: {
    fontSize: 13,
    color: COLORS.primaryLight,
    marginBottom: 2,
  },
  playerRole: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  skillCount: {
    fontSize: 12,
    color: COLORS.secondaryLight,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
