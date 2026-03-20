import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useMatchStore } from '../../store/matchStore';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { COLORS } from '../../constants/gameConfig';

type Phase = 'menu' | 'hosting' | 'joining' | 'lobby' | 'playing';

export default function MultiplayerScreen() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [joinCode, setJoinCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const { user } = useAuthStore();
  const {
    roomCode,
    isHost,
    opponentReady,
    opponentDisconnected,
    reconnectTimer,
    connection,
    createRoom,
    joinRoom,
  } = useMatchStore();

  async function handleHost() {
    if (!user) return;
    setIsConnecting(true);
    try {
      const code = await createRoom(user.uid, 'demo_player', user.displayName || 'Host');
      setPhase('hosting');
    } catch {
      Alert.alert('Error', 'Failed to create match room.');
    }
    setIsConnecting(false);
  }

  async function handleJoin() {
    if (!user || !joinCode.trim()) return;
    setIsConnecting(true);
    try {
      const success = await joinRoom(
        joinCode.trim(),
        user.uid,
        'demo_player',
        user.displayName || 'Guest'
      );
      if (success) {
        setPhase('lobby');
      } else {
        Alert.alert('Error', 'Room not found or already full.');
      }
    } catch {
      Alert.alert('Error', 'Failed to join match room.');
    }
    setIsConnecting(false);
  }

  if (isConnecting) {
    return <LoadingSpinner fullScreen message="Connecting..." />;
  }

  // MAIN MENU
  if (phase === 'menu') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>1v1 Match</Text>
        <Text style={styles.subtitle}>
          Challenge a friend via Bluetooth, WiFi, or online
        </Text>

        <View style={styles.options}>
          <TouchableOpacity style={styles.optionCard} onPress={handleHost}>
            <Text style={styles.optionIcon}>📡</Text>
            <Text style={styles.optionTitle}>Host Match</Text>
            <Text style={styles.optionDesc}>
              Create a room and share the code with your opponent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => setPhase('joining')}
          >
            <Text style={styles.optionIcon}>🔗</Text>
            <Text style={styles.optionTitle}>Join Match</Text>
            <Text style={styles.optionDesc}>
              Enter a room code, scan QR, or find nearby hosts
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // JOIN FLOW
  if (phase === 'joining') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Join Match</Text>

        <View style={styles.joinOption}>
          <Text style={styles.joinLabel}>Enter Room Code</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="6-digit code"
            placeholderTextColor={COLORS.textSecondary}
            value={joinCode}
            onChangeText={setJoinCode}
            maxLength={6}
            keyboardType="number-pad"
            autoFocus
          />
          <Button
            title="Join"
            onPress={handleJoin}
            disabled={joinCode.length !== 6}
            size="large"
          />
        </View>

        <TouchableOpacity style={styles.altJoinOption}>
          <Text style={styles.altJoinIcon}>📷</Text>
          <Text style={styles.altJoinText}>Scan QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.altJoinOption}>
          <Text style={styles.altJoinIcon}>📶</Text>
          <Text style={styles.altJoinText}>Find Nearby Hosts</Text>
        </TouchableOpacity>

        <Button
          title="Back"
          onPress={() => setPhase('menu')}
          variant="ghost"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  // HOSTING — waiting for opponent
  if (phase === 'hosting') {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>Waiting for Opponent</Text>
        <View style={styles.codeDisplay}>
          <Text style={styles.codeLabel}>Room Code</Text>
          <Text style={styles.codeValue}>{roomCode}</Text>
        </View>
        <Text style={styles.waitingText}>
          Share this code with your opponent or let them scan the QR code
        </Text>
        {opponentReady && (
          <Button
            title="Start Match"
            onPress={() => setPhase('lobby')}
            size="large"
            style={{ marginTop: 24 }}
          />
        )}
      </View>
    );
  }

  // LOBBY — both players connected
  if (phase === 'lobby') {
    return (
      <View style={[styles.container, styles.centered]}>
        {opponentDisconnected ? (
          <>
            <Text style={styles.disconnectTitle}>Opponent Disconnected</Text>
            <Text style={styles.disconnectTimer}>
              Reconnecting in {reconnectTimer}s...
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>Match Ready</Text>
            <View style={styles.connectionInfo}>
              <Text style={styles.connectionType}>
                Connection: {connection?.type || 'firebase'}
              </Text>
              <Text style={styles.connectionLatency}>
                Latency: {connection?.latency || 0}ms
              </Text>
            </View>
            <Text style={styles.lobbyText}>Coin toss to decide who bats first...</Text>
            <Button
              title="Start Playing"
              onPress={() => setPhase('playing')}
              size="large"
              style={{ marginTop: 24 }}
            />
          </>
        )}
      </View>
    );
  }

  // PLAYING placeholder
  return (
    <View style={[styles.container, styles.centered]}>
      <Text style={styles.title}>Match In Progress</Text>
      <Text style={styles.subtitle}>AR pitch and two-phase skill commit active</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  options: {
    gap: 14,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 8,
  },
  optionIcon: {
    fontSize: 40,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  joinOption: {
    gap: 12,
    marginBottom: 24,
  },
  joinLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  codeInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  altJoinOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  altJoinIcon: {
    fontSize: 24,
  },
  altJoinText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  codeDisplay: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  codeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  codeValue: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.primaryLight,
    letterSpacing: 8,
  },
  waitingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  disconnectTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.error,
    marginBottom: 8,
  },
  disconnectTimer: {
    fontSize: 18,
    color: COLORS.text,
  },
  connectionInfo: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  connectionType: {
    fontSize: 14,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  connectionLatency: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  lobbyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
