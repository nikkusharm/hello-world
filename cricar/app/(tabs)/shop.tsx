import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
export default function ShopScreen() {
  const packs = [
    { name: 'Team India 2011 WC', price: '₹1,000', type: 'Starter', emoji: '🇮🇳', color: '#2d6a4f', desc: '15 player cards • Required first purchase' },
    { name: 'Team India 2012', price: '₹1,000 + ₹50', type: 'Season', emoji: '🇮🇳', color: '#1d3557', desc: 'Updated skills from 2012 season' },
    { name: 'Sachin Tendulkar', price: '₹1,500', type: 'Legend', emoji: '⭐', color: '#7b2d8b', desc: 'Career peak skills • Never updated' },
    { name: 'India vs Pakistan 2007', price: '₹800', type: 'Rivalry', emoji: '🔥', color: '#9b2226', desc: 'Pre-balanced for head-to-head play' },
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1a1a2e' }} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 8 }}>Card Packs</Text>
      <Text style={{ color: '#aaa', marginBottom: 16 }}>Scan physical cards after purchase to unlock avatars</Text>
      {packs.map((p, i) => (
        <View key={i} style={{ backgroundColor: '#16213e', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#333' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <View style={{ backgroundColor: p.color, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{p.type.toUpperCase()}</Text>
              </View>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{p.emoji} {p.name}</Text>
              <Text style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>{p.desc}</Text>
            </View>
            <Text style={{ color: '#f4a261', fontSize: 16, fontWeight: 'bold', marginLeft: 12 }}>{p.price}</Text>
          </View>
          <TouchableOpacity style={{ backgroundColor: '#f4a261', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 16 }}>
            <Text style={{ color: '#1a1a2e', fontWeight: 'bold' }}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

