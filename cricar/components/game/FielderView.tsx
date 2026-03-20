import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { getFielderTapWindow, calculateCatchProbability } from '../../utils/physics';
import { COLORS } from '../../constants/gameConfig';

interface FielderViewProps {
  catchRating: number;
  throwAccuracy: number;
  onCatchAttempt: (success: boolean) => void;
  onThrowAttempt: (accuracy: number) => void;
  ballIncoming: boolean;
}

export default function FielderView({
  catchRating,
  throwAccuracy,
  onCatchAttempt,
  onThrowAttempt,
  ballIncoming,
}: FielderViewProps) {
  const [showCatchButton, setShowCatchButton] = useState(false);
  const [catchWindowExpired, setCatchWindowExpired] = useState(false);
  const shrinkAnim = useRef(new Animated.Value(1)).current;
  const tapWindow = getFielderTapWindow(catchRating);

  useEffect(() => {
    if (ballIncoming) {
      setShowCatchButton(true);
      setCatchWindowExpired(false);
      shrinkAnim.setValue(1);

      Animated.timing(shrinkAnim, {
        toValue: 0,
        duration: tapWindow * 1000,
        useNativeDriver: true,
      }).start(() => {
        setCatchWindowExpired(true);
        setShowCatchButton(false);
        onCatchAttempt(false); // Missed the tap window
      });
    }
  }, [ballIncoming]);

  function handleCatchTap() {
    if (catchWindowExpired) return;
    shrinkAnim.stopAnimation();
    setShowCatchButton(false);

    const success = calculateCatchProbability(catchRating, true);
    onCatchAttempt(success);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.positionText}>Your Field Position</Text>
      <Text style={styles.ratingText}>
        Catch: {catchRating}/10 | Throw: {throwAccuracy}/10
      </Text>
      <Text style={styles.windowText}>
        Tap window: {tapWindow.toFixed(1)}s
      </Text>

      {showCatchButton && (
        <TouchableOpacity style={styles.catchButton} onPress={handleCatchTap}>
          <Animated.View
            style={[
              styles.shrinkCircle,
              { transform: [{ scale: shrinkAnim }] },
            ]}
          />
          <Text style={styles.catchText}>CATCH!</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  positionText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  windowText: {
    fontSize: 12,
    color: COLORS.primaryLight,
    marginTop: 4,
  },
  catchButton: {
    marginTop: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shrinkCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  catchText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
