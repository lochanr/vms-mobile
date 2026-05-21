import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import Screen from '../components/layout/Screen';
import Button from '../components/ui/Button';
import { useVisitorStore } from '../store/useVisitorStore';
import { Colors } from '../constants/colors';

export default function PhotoScreen() {
  const router = useRouter();
  const { returningVisitor, setPhoto, photoUri } = useVisitorStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('front');
  const [captured, setCaptured] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      if (photo && photo.uri && photo.base64) {
        setPhoto(photo.uri, `data:image/jpeg;base64,${photo.base64}`);
        setCaptured(true);
      }
    } catch {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleUsePrevious = () => {
    setPhoto('previous', returningVisitor.photoBase64);
    router.push('/details');
  };

  const handleNext = () => router.push('/details');
  const handleRetake = () => setCaptured(false);

  if (!permission?.granted) {
    return (
      <Screen centered>
        <Text style={{ color: Colors.text, fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
          Camera permission needed
        </Text>
        <Button label="Grant Permission" onPress={requestPermission} />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      {/* Back button */}
      <View style={{ position: 'absolute', top: 56, left: 24, zIndex: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.muted, fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={{ position: 'absolute', top: 100, left: 0, right: 0, zIndex: 10, alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: Colors.accent, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 6 }}>
          STEP 2 OF 3
        </Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.text }}>Visitor Photo</Text>
        {returningVisitor && !captured && (
          <Text style={{ color: Colors.success, fontSize: 12, marginTop: 4 }}>
            👋 Welcome back, {returningVisitor.name}!
          </Text>
        )}
      </View>

      {/* Camera / Photo preview */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{
          width: 240, height: 240, borderRadius: 24, overflow: 'hidden',
          borderWidth: 2, borderColor: Colors.accent,
        }}>
          {captured && photoUri ? (
            <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : returningVisitor && !captured ? (
            <Image source={{ uri: returningVisitor.photoBase64 }} style={{ width: '100%', height: '100%', opacity: 0.7 }} resizeMode="cover" />
          ) : (
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />
          )}
        </View>
      </View>

      {/* Bottom buttons */}
      <View style={{ padding: 24, gap: 12, paddingBottom: 48 }}>
        {captured ? (
          <>
            <Button label="Continue →" onPress={handleNext} />
            <Button label="↺ Retake" onPress={handleRetake} variant="ghost" />
          </>
        ) : returningVisitor ? (
          <>
            <Button label="Use Previous Photo" onPress={handleUsePrevious} />
            <Button label="📷 Take New Photo" onPress={handleCapture} variant="ghost" />
          </>
        ) : (
          <Button label="📸 Capture Photo" onPress={handleCapture} />
        )}
      </View>
    </View>
  );
}
