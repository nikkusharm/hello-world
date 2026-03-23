import React from 'react';
import { View, StyleSheet } from 'react-native';

interface BallPhysicsProps {
  x: number;
  y: number;
  visible: boolean;
}

// In production, this renders a ViroSphere with physics-based trajectory
// Placeholder for development
export default function BallPhysics({ x, y, visible }: BallPhysicsProps) {
  if (!visible) return null;

  return (
    <View
      style={[
        styles.ball,
        {
          left: x,
          top: y,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ball: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E53935',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
});

