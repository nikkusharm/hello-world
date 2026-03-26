import { View, Text } from 'react-native';

export default function IndexScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A1128', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>CricAR ✓</Text>
      <Text style={{ color: '#f4a261', fontSize: 16, marginTop: 12 }}>App is working!</Text>
    </View>
  );
}