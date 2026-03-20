import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/gameConfig';

interface PitchPlaneProps {
  width: number;
  height: number;
  scale?: number;
}

// In production, this renders a ViroARPlane with pitch texture
// Placeholder for development
export default function PitchPlane({ width, height, scale = 1 }: PitchPlaneProps) {
  return (
    <View
      style={[
        styles.pitch,
        {
          width: width * scale,
          height: height * scale,
        },
      ]}
    >
      <View style={styles.centerLine} />
      <View style={[styles.crease, styles.creaseTop]} />
      <View style={[styles.crease, styles.creaseBottom]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pitch: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerLine: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  crease: {
    position: 'absolute',
    width: '50%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  creaseTop: {
    top: '15%',
  },
  creaseBottom: {
    bottom: '15%',
  },
});
