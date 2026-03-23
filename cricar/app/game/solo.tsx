import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { useCollectionStore } from '../../store/collectionStore';
import { useAuthStore } from '../../store/authStore';
import { Skill } from '../../types/game';

const DIFFICULTIES = [
  { id: 'rookie', label: '🟢 Rookie', desc: 'Random AI — great for beginners' },
  { id: 'club', label: '🟡 Club', desc: 'AI picks highest power skill' },
  { id: 'international', label: '🟠 International', desc: 'AI counters your last 3 balls' },
  { id: 'legend', label: '🔴 Legend', desc: 'AI learns your patterns across the match' },
];

const OVER_LIMITS = [5, 10, 20];

export default function SoloScreen() {
  const [difficulty, setDifficulty] = useState('club');
  const [overs, setOvers] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);

  const { user } = useAuthStore();
  const { ownedCards, ownedPlayers } = useCollectionStore();
  const { session, matchContext, lastOutcome, selectedSkill, selectSkill, playBall, initSoloGame } = useGameStore();

  const startGame = () => {
    if (ownedPlayers.length === 0) {
      Alert.alert('No Cards', 'Scan a cricket card first to play!');
      return;
    }
    const player = ownedPlayers[0];
    initSoloGame({
      userId: user?.uid || 'guest',
      playerId: player.id,
      teamId: 'human',
      role: player.role === 'bowler' ? 'bowler' : 'batsman',
      stamina: 100,
      stats: { runs: 0, balls: 0, wickets: 0, overs: 0, economy: 0 },
      isAI: false,
    }, difficulty as any, overs);
    setGameStarted(true);
  };

  const handlePlayBall = () => {
    if (!selectedSkill) { Alert.alert('Select a skill first!'); return; }
    const outcome = playBall();
    if (!outcome) return;
  };

  if (!gameStarted) {
    return (
      <ScrollView style={gs.container} contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Text style={gs.title}>Solo Match Setup</Text>

        <Text style={gs.sectionLabel}>Difficulty</Text>
        {DIFFICULTIES.map((d) => (
          <TouchableOpacity key={d.id} onPress={() => setDifficulty(d.id)}
            style={[gs.option, difficulty === d.id && gs.optionSelected]}>
            <Text style={gs.optionTitle}>{d.label}</Text>
            <Text style={gs.optionDesc}>{d.desc}</Text>
          </TouchableOpacity>
        ))}

        <Text style={gs.sectionLabel}>Overs</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {OVER_LIMITS.map((o) => (
            <TouchableOpacity key={o} onPress={() => setOvers(o)}
              style={[gs.overBtn, overs === o && gs.overBtnSelected]}>
              <Text style={[gs.overBtnText, overs === o && { color: '#1a1a2e' }]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={gs.startBtn} onPress={startGame}>
          <Text style={gs.startBtnText}>Start Match →</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const currentInning = session?.innings[session.currentInning];
  const player = ownedPlayers[0];
  const skills: Skill[] = player?.skills || [];

  return (
    <View style={gs.container}>
      <View style={gs.scoreboard}>
        <Text style={gs.score}>{currentInning?.totalRuns || 0}/{currentInning?.totalWickets || 0}</Text>
        <Text style={gs.overs}>Overs: {matchContext.totalOvers - Math.ceil(matchContext.ballsLeft / 6)}/{matchContext.totalOvers}</Text>
        <Text style={gs.stamina}>Stamina: {matchContext.batsmanStamina}%</Text>
      </View>

      {lastOutcome && (
        <View style={gs.outcome}>
          <Text style={gs.outcomeText}>
            {lastOutcome.outcome === 'six' ? '🎯 SIX!' :
             lastOutcome.outcome === 'four' ? '🏃 FOUR!' :
             lastOutcome.outcome === 'wicket' ? '❌ OUT!' :
             `✅ ${lastOutcome.runs} run${lastOutcome.runs !== 1 ? 's' : ''}`}
          </Text>
        </View>
      )}

      <Text style={gs.skillsLabel}>Select Your Shot:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={gs.skillsRow}>
        {skills.length > 0 ? skills.map((skill) => (
          <TouchableOpacity key={skill.id} onPress={() => selectSkill(skill)}
            style={[gs.skillBtn, selectedSkill?.id === skill.id && gs.skillSelected,
                    skill.staminaCost > matchContext.batsmanStamina && gs.skillDisabled]}>
            <Text style={gs.skillName}>{skill.name}</Text>
            <Text style={gs.skillStats}>PWR {skill.power} | RK {skill.risk}</Text>
            <Text style={gs.skillCost}>⚡{skill.staminaCost}</Text>
          </TouchableOpacity>
        )) : (
          <View style={gs.skillBtn}>
            <Text style={{ color: '#aaa', fontSize: 13 }}>Scan a card for skills</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={[gs.playBtn, !selectedSkill && { opacity: 0.5 }]} onPress={handlePlayBall}>
        <Text style={gs.playBtnText}>🏏 Play Ball</Text>
      </TouchableOpacity>
    </View>
  );
}

const gs = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  sectionLabel: { color: '#f4a261', fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  option: { backgroundColor: '#16213e', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#333' },
  optionSelected: { borderColor: '#f4a261', backgroundColor: '#1e2d40' },
  optionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  optionDesc: { color: '#aaa', fontSize: 13, marginTop: 4 },
  overBtn: { flex: 1, backgroundColor: '#16213e', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  overBtnSelected: { backgroundColor: '#f4a261', borderColor: '#f4a261' },
  overBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  startBtn: { backgroundColor: '#f4a261', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  startBtnText: { color: '#1a1a2e', fontSize: 18, fontWeight: 'bold' },
  scoreboard: { backgroundColor: '#16213e', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333' },
  score: { color: '#fff', fontSize: 48, fontWeight: 'bold' },
  overs: { color: '#aaa', fontSize: 16, marginTop: 4 },
  stamina: { color: '#f4a261', fontSize: 14, marginTop: 4 },
  outcome: { backgroundColor: '#2d6a4f', margin: 16, borderRadius: 12, padding: 16, alignItems: 'center' },
  outcomeText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  skillsLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  skillsRow: { paddingHorizontal: 12, marginBottom: 16 },
  skillBtn: { backgroundColor: '#16213e', borderRadius: 12, padding: 14, marginHorizontal: 4, minWidth: 120, borderWidth: 1, borderColor: '#333' },
  skillSelected: { borderColor: '#f4a261', backgroundColor: '#1e2d40' },
  skillDisabled: { opacity: 0.4 },
  skillName: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  skillStats: { color: '#aaa', fontSize: 11, marginTop: 4 },
  skillCost: { color: '#f4a261', fontSize: 11, marginTop: 2 },
  playBtn: { backgroundColor: '#f4a261', margin: 16, borderRadius: 14, padding: 18, alignItems: 'center' },
  playBtnText: { color: '#1a1a2e', fontSize: 20, fontWeight: 'bold' },
});

