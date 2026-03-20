import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../../store/gameStore';
import Button from '../../components/ui/Button';
import { COLORS, GAME_CONFIG } from '../../constants/gameConfig';
import { AIDifficulty, BallOutcome, Skill } from '../../types/game';
import { SessionPlayer } from '../../types/match';

interface DifficultyOption {
  level: AIDifficulty;
  name: string;
  description: string;
  icon: string;
}

const DIFFICULTIES: DifficultyOption[] = [
  {
    level: 'rookie',
    name: 'Rookie',
    description: 'Random skill selection, no pattern awareness. Perfect for beginners.',
    icon: '🟢',
  },
  {
    level: 'club',
    name: 'Club',
    description: 'Picks highest power skills. Predictable but competent.',
    icon: '🟡',
  },
  {
    level: 'international',
    name: 'International',
    description: 'Tracks your last 3 balls and counters patterns. Saves stamina smartly.',
    icon: '🟠',
  },
  {
    level: 'legend',
    name: 'Legend',
    description: 'Full pattern recognition. Learns your habits and exploits them.',
    icon: '🔴',
  },
];

type Phase = 'setup' | 'playing' | 'innings_break' | 'result';

export default function SoloGameScreen() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('rookie');
  const [selectedOvers, setSelectedOvers] = useState(5);

  const {
    session,
    matchContext,
    selectedSkill,
    lastOutcome,
    initSoloGame,
    selectSkill,
    playBall,
    endInnings,
    resetGame,
  } = useGameStore();

  // Demo player data — in production this comes from scanned card
  const demoPlayer: SessionPlayer = {
    userId: 'demo_user',
    playerId: 'virat_kohli_2023',
    teamId: 'human',
    role: 'batsman',
    stamina: 100,
    stats: {
      runs: 0, ballsFaced: 0, fours: 0, sixes: 0,
      wicketsTaken: 0, oversBowled: 0, runsConceded: 0,
      catches: 0, runOuts: 0,
    },
    isAI: false,
  };

  // Demo skills — in production these come from the player's card
  const availableSkills: Skill[] = [
    { id: 'cover_drive', name: 'Cover Drive', type: 'batting', power: 7, risk: 3, staminaCost: 10, animation: 'cover_drive_anim', unlockYear: 2023, description: 'Classic cover drive' },
    { id: 'pull_shot', name: 'Pull Shot', type: 'batting', power: 8, risk: 6, staminaCost: 20, animation: 'pull_anim', unlockYear: 2023, description: 'Aggressive pull' },
    { id: 'defence', name: 'Solid Defence', type: 'batting', power: 5, risk: 1, staminaCost: 5, animation: 'defence_anim', unlockYear: 2023, description: 'Defensive block' },
    { id: 'helicopter_shot', name: 'Helicopter Shot', type: 'batting', power: 9, risk: 7, staminaCost: 25, animation: 'helicopter_anim', unlockYear: 2023, description: 'Trademark finish' },
    { id: 'sweep', name: 'Sweep Shot', type: 'batting', power: 7, risk: 5, staminaCost: 15, animation: 'sweep_anim', unlockYear: 2023, description: 'Sweep against spin' },
  ];

  function startGame() {
    initSoloGame(demoPlayer, selectedDifficulty, selectedOvers);
    setPhase('playing');
  }

  function handlePlayBall() {
    if (!selectedSkill) {
      Alert.alert('Select a Skill', 'Choose a batting skill before playing the ball.');
      return;
    }
    const outcome = playBall();
    if (!outcome) return;

    // Check if innings is over
    if (matchContext.ballsLeft <= 0 || matchContext.wicketsLeft <= 0) {
      if (session && session.currentInning === 0) {
        setPhase('innings_break');
      } else {
        setPhase('result');
      }
    }
  }

  function handleEndInnings() {
    endInnings();
    setPhase('playing');
  }

  function getOutcomeColor(outcome?: BallOutcome): string {
    if (!outcome) return COLORS.text;
    switch (outcome.outcome) {
      case 'six': return '#FFD700';
      case 'four': return '#4CAF50';
      case 'wicket': return '#EF5350';
      case 'dot': return '#78909C';
      default: return COLORS.text;
    }
  }

  // SETUP PHASE
  if (phase === 'setup') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.setupContent}>
        <Text style={styles.sectionTitle}>Select Difficulty</Text>
        {DIFFICULTIES.map((diff) => (
          <TouchableOpacity
            key={diff.level}
            style={[
              styles.difficultyCard,
              selectedDifficulty === diff.level && styles.difficultySelected,
            ]}
            onPress={() => setSelectedDifficulty(diff.level)}
          >
            <Text style={styles.difficultyIcon}>{diff.icon}</Text>
            <View style={styles.difficultyInfo}>
              <Text style={styles.difficultyName}>{diff.name}</Text>
              <Text style={styles.difficultyDesc}>{diff.description}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Overs</Text>
        <View style={styles.oversRow}>
          {GAME_CONFIG.OVER_OPTIONS.map((overs) => (
            <TouchableOpacity
              key={overs}
              style={[
                styles.overOption,
                selectedOvers === overs && styles.overSelected,
              ]}
              onPress={() => setSelectedOvers(overs)}
            >
              <Text
                style={[
                  styles.overText,
                  selectedOvers === overs && styles.overTextSelected,
                ]}
              >
                {overs}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Start Match"
          onPress={startGame}
          size="large"
          style={{ marginTop: 32 }}
        />
      </ScrollView>
    );
  }

  // PLAYING PHASE
  if (phase === 'playing' && session) {
    const currentInning = session.innings[session.currentInning];
    const isSecondInnings = session.currentInning === 1;
    const target = isSecondInnings ? session.innings[0].totalRuns + 1 : undefined;

    return (
      <View style={styles.container}>
        <View style={styles.scoreboard}>
          <Text style={styles.scoreText}>
            {currentInning.totalRuns}/{currentInning.totalWickets}
          </Text>
          <Text style={styles.oversText}>
            Overs: {Math.floor((selectedOvers * 6 - matchContext.ballsLeft) / 6)}.
            {(selectedOvers * 6 - matchContext.ballsLeft) % 6}/{selectedOvers}
          </Text>
          {target && (
            <Text style={styles.targetText}>
              Target: {target} | Need: {target - currentInning.totalRuns} from{' '}
              {matchContext.ballsLeft} balls
            </Text>
          )}
          <Text style={styles.staminaText}>
            Stamina: {Math.round(matchContext.batsmanStamina)}%
          </Text>
        </View>

        {lastOutcome && (
          <View style={[styles.outcomeBox, { borderColor: getOutcomeColor(lastOutcome) }]}>
            <Text style={[styles.outcomeText, { color: getOutcomeColor(lastOutcome) }]}>
              {lastOutcome.outcome.toUpperCase()}
              {lastOutcome.runs > 0 ? ` — ${lastOutcome.runs} runs` : ''}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Select Skill</Text>
        <ScrollView style={styles.skillList} horizontal showsHorizontalScrollIndicator={false}>
          {availableSkills
            .filter((s) => s.staminaCost <= matchContext.batsmanStamina)
            .map((skill) => (
              <TouchableOpacity
                key={skill.id}
                style={[
                  styles.skillCard,
                  selectedSkill?.id === skill.id && styles.skillSelected,
                ]}
                onPress={() => selectSkill(skill)}
              >
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillPower}>Power: {skill.power}</Text>
                <Text style={styles.skillRisk}>Risk: {skill.risk}</Text>
                <Text style={styles.skillStamina}>Cost: {skill.staminaCost}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>

        <Button
          title="Play Ball"
          onPress={handlePlayBall}
          size="large"
          disabled={!selectedSkill}
          style={styles.playButton}
        />
      </View>
    );
  }

  // INNINGS BREAK
  if (phase === 'innings_break' && session) {
    const firstInnings = session.innings[0];
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.breakTitle}>Innings Break</Text>
        <Text style={styles.scoreText}>{firstInnings.totalRuns}/{firstInnings.totalWickets}</Text>
        <Text style={styles.breakSubtitle}>
          Target: {firstInnings.totalRuns + 1} runs
        </Text>
        <Button
          title="Start 2nd Innings"
          onPress={handleEndInnings}
          size="large"
          style={{ marginTop: 32 }}
        />
      </View>
    );
  }

  // RESULT PHASE
  if (phase === 'result' && session) {
    const first = session.innings[0];
    const second = session.innings[1];
    const humanWon = second
      ? (session.currentInning === 0
          ? first.totalRuns > 0
          : second.totalRuns >= first.totalRuns + 1)
      : false;

    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.resultTitle}>
          {humanWon ? 'You Won!' : 'You Lost!'}
        </Text>
        <View style={styles.resultScores}>
          <Text style={styles.resultScore}>
            1st Innings: {first.totalRuns}/{first.totalWickets}
          </Text>
          {second && (
            <Text style={styles.resultScore}>
              2nd Innings: {second.totalRuns}/{second.totalWickets}
            </Text>
          )}
        </View>
        <View style={styles.resultButtons}>
          <Button
            title="Rematch"
            onPress={() => {
              resetGame();
              setPhase('setup');
            }}
            size="large"
          />
          <Button
            title="Back to Menu"
            onPress={() => {
              resetGame();
              router.back();
            }}
            variant="outline"
            size="large"
          />
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  setupContent: {
    paddingBottom: 40,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  difficultyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: 12,
  },
  difficultySelected: {
    borderColor: COLORS.primaryLight,
  },
  difficultyIcon: {
    fontSize: 28,
  },
  difficultyInfo: {
    flex: 1,
  },
  difficultyName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  difficultyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  oversRow: {
    flexDirection: 'row',
    gap: 12,
  },
  overOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  overSelected: {
    borderColor: COLORS.primaryLight,
  },
  overText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  overTextSelected: {
    color: COLORS.primaryLight,
  },
  scoreboard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.text,
  },
  oversText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  targetText: {
    fontSize: 14,
    color: COLORS.secondaryLight,
    marginTop: 4,
  },
  staminaText: {
    fontSize: 14,
    color: COLORS.primaryLight,
    marginTop: 4,
  },
  outcomeBox: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  outcomeText: {
    fontSize: 20,
    fontWeight: '800',
  },
  skillList: {
    maxHeight: 120,
    marginBottom: 16,
  },
  skillCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  skillSelected: {
    borderColor: COLORS.primaryLight,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  skillPower: {
    fontSize: 12,
    color: COLORS.success,
  },
  skillRisk: {
    fontSize: 12,
    color: COLORS.warning,
  },
  skillStamina: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  playButton: {
    marginTop: 'auto',
  },
  breakTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  breakSubtitle: {
    fontSize: 18,
    color: COLORS.secondaryLight,
    marginTop: 8,
  },
  resultTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primaryLight,
    marginBottom: 24,
  },
  resultScores: {
    gap: 8,
    marginBottom: 32,
  },
  resultScore: {
    fontSize: 18,
    color: COLORS.text,
  },
  resultButtons: {
    gap: 12,
    width: '100%',
  },
});
