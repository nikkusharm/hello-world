import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#16213e', borderTopColor: '#333' },
        tabBarActiveTintColor: '#f4a261',
        tabBarInactiveTintColor: '#666',
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#ffffff',
      }}
    >
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ color, size }) => <Ionicons name="scan" size={size} color={color} /> }} />
      <Tabs.Screen name="play" options={{ title: 'Play', tabBarIcon: ({ color, size }) => <Ionicons name="game-controller" size={size} color={color} /> }} />
      <Tabs.Screen name="collection" options={{ title: 'Collection', tabBarIcon: ({ color, size }) => <Ionicons name="albums" size={size} color={color} /> }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop', tabBarIcon: ({ color, size }) => <Ionicons name="bag" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tabs>
  );
}
