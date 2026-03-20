import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import Button from '../../components/ui/Button';
import { COLORS } from '../../constants/gameConfig';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Scan Your Cards',
    description:
      'Point your camera at any CricAR card to activate your cricketer and unlock their skills. Each card is unique and tied to your account.',
    icon: '📸',
  },
  {
    id: '2',
    title: 'Play in AR',
    description:
      'Watch your cricketers come alive on any flat surface. Bowl, bat, and field in augmented reality with real physics-based outcomes.',
    icon: '🏏',
  },
  {
    id: '3',
    title: 'Compete & Collect',
    description:
      'Challenge friends in 1v1, build teams for multiplayer matches, enter tournaments, and grow your collection with new season packs.',
    icon: '🏆',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  function handleNext() {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(tabs)/scan');
    }
  }

  function handleSkip() {
    router.replace('/(tabs)/scan');
  }

  function renderSlide({ item }: { item: OnboardingSlide }) {
    return (
      <View style={styles.slide}>
        <Text style={styles.icon}>{item.icon}</Text>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          {currentIndex < SLIDES.length - 1 ? (
            <>
              <Button
                title="Skip"
                onPress={handleSkip}
                variant="ghost"
                size="medium"
              />
              <Button
                title="Next"
                onPress={handleNext}
                variant="primary"
                size="medium"
              />
            </>
          ) : (
            <Button
              title="Get Started"
              onPress={handleNext}
              variant="primary"
              size="large"
              style={styles.getStartedButton}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.primaryLight,
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  getStartedButton: {
    flex: 1,
  },
});
