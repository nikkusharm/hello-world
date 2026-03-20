import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useCollectionStore } from '../../store/collectionStore';
import { validateAndActivateCard } from '../../services/cardAuth';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { COLORS } from '../../constants/gameConfig';

type ScanPhase = 'scanning' | 'processing' | 'success' | 'error';

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<ScanPhase>('scanning');
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));

  const { user } = useAuthStore();
  const { addCard } = useCollectionStore();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    // Pulsing reticle animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  async function handleBarCodeScanned({ data }: BarCodeScannerResult) {
    if (phase !== 'scanning' || !user) return;

    setPhase('processing');
    setScannedData(data);

    try {
      const result = await validateAndActivateCard(data, user.uid);

      switch (result.status) {
        case 'not_found':
          setErrorMessage('Invalid card — not registered in the CricAR system.');
          setPhase('error');
          break;

        case 'new_activation':
          setResultMessage('Card activated! Your player has been added to your collection.');
          if (result.card) addCard(result.card);
          setPhase('success');
          break;

        case 'activated_self':
          setResultMessage('Welcome back! This card is already in your collection.');
          setPhase('success');
          break;

        case 'activated_other':
          Alert.alert(
            'Card Owned by Another Player',
            `This card belongs to ${result.ownerUsername}. Would you like to request a transfer for ₹10?`,
            [
              { text: 'Cancel', onPress: () => setPhase('scanning') },
              {
                text: 'Request Transfer',
                onPress: () => {
                  setResultMessage('Transfer request sent! The owner has 24 hours to respond.');
                  setPhase('success');
                },
              },
            ]
          );
          break;
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Scan failed. Please try again.'
      );
      setPhase('error');
    }
  }

  if (hasPermission === null) {
    return <LoadingSpinner fullScreen message="Requesting camera permission..." />;
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>
          Camera permission is required to scan CricAR cards.
        </Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {phase === 'scanning' && (
        <>
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          />
          <View style={styles.overlay}>
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <Animated.View
                style={[
                  styles.reticle,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </Animated.View>
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom}>
              <Text style={styles.instructionText}>
                Point camera at a CricAR card QR code
              </Text>
            </View>
          </View>
        </>
      )}

      {phase === 'processing' && (
        <LoadingSpinner fullScreen message="Validating card..." />
      )}

      {phase === 'success' && (
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successText}>{resultMessage}</Text>
          <View style={styles.actionButtons}>
            <Button
              title="Scan Another"
              onPress={() => setPhase('scanning')}
              variant="outline"
              size="large"
            />
            <Button
              title="Play Now"
              onPress={() => router.replace('/(tabs)/play')}
              size="large"
            />
          </View>
        </View>
      )}

      {phase === 'error' && (
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.errorIcon}>✕</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <Button
            title="Try Again"
            onPress={() => setPhase('scanning')}
            size="large"
          />
        </View>
      )}

      <Button
        title="Close"
        onPress={() => router.back()}
        variant="ghost"
        style={styles.closeButton}
        textStyle={{ color: '#FFFFFF' }}
      />
    </View>
  );
}

const RETICLE_SIZE = 250;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: RETICLE_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  reticle: {
    width: RETICLE_SIZE,
    height: RETICLE_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primaryLight,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 24,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  successIcon: {
    fontSize: 64,
    color: COLORS.success,
    marginBottom: 16,
  },
  successText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  actionButtons: {
    gap: 12,
    width: '100%',
  },
  errorIcon: {
    fontSize: 64,
    color: COLORS.error,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 18,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 32,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
});
