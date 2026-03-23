// ── FILE: app/ar/scanner.tsx ─────────────────────────────────────────
import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { validateAndActivateCard } from '../../services/cardAuth';
import { useAuthStore } from '../../store/authStore';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  if (!permission) return <View style={ss.container}><ActivityIndicator color="#f4a261" /></View>;

  if (!permission.granted) {
    return (
      <View style={ss.container}>
        <Text style={ss.title}>Camera Permission Required</Text>
        <Text style={ss.sub}>We need camera access to scan your cricket cards</Text>
        <TouchableOpacity style={ss.btn} onPress={requestPermission}>
          <Text style={ss.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScan = async ({ data }: { data: string }) => {
    if (scanned || loading || !user) return;
    setScanned(true);
    setLoading(true);
    try {
      const result = await validateAndActivateCard(data, user.uid);
      if (result.status === 'not_found') {
        Alert.alert('Invalid Card', 'This card is not registered in the CricAR system.', [
          { text: 'Try Again', onPress: () => setScanned(false) }
        ]);
      } else if (result.status === 'activated_other') {
        Alert.alert('Card Taken', `This card belongs to ${result.ownerUsername}. Request a transfer?`, [
          { text: 'Cancel', onPress: () => setScanned(false) },
          { text: 'Request Transfer', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('🎉 Card Scanned!', `Player unlocked successfully!`, [
          { text: 'Play Now', onPress: () => router.replace('/(tabs)/scan') }
        ]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message, [{ text: 'OK', onPress: () => setScanned(false) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={ss.container}>
      <CameraView style={ss.camera} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={scanned ? undefined : handleScan}>
        <View style={ss.overlay}>
          <Text style={ss.instruction}>Point camera at CricAR card QR code</Text>
          <View style={ss.reticle} />
          {loading && <ActivityIndicator size="large" color="#f4a261" style={{ marginTop: 20 }} />}
        </View>
      </CameraView>
      {scanned && !loading && (
        <TouchableOpacity style={ss.rescanBtn} onPress={() => setScanned(false)}>
          <Text style={ss.rescanText}>Scan Another Card</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const ss = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  camera: { flex: 1, width: '100%' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  instruction: { color: '#fff', fontSize: 16, marginBottom: 32, textAlign: 'center', paddingHorizontal: 24 },
  reticle: { width: 250, height: 250, borderWidth: 3, borderColor: '#f4a261', borderRadius: 20 },
  rescanBtn: { position: 'absolute', bottom: 40, backgroundColor: '#f4a261', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  rescanText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', paddingHorizontal: 24 },
  sub: { color: '#aaa', fontSize: 15, textAlign: 'center', marginBottom: 24, paddingHorizontal: 24 },
  btn: { backgroundColor: '#f4a261', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  btnText: { color: '#1a1a2e', fontWeight: 'bold', fontSize: 16 },
});

