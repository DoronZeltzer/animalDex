import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CameraStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';
import { resizeAndCompressImage } from '../../utils/imageUtils';
import * as ImagePicker from 'expo-image-picker';

type Nav = StackNavigationProp<CameraStackParamList, 'Camera'>;

export default function CameraScreen() {
  const navigation = useNavigation<Nav>();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>AnimalDex needs camera access to identify animals.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleUpload = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: false,
      });
      if (result.canceled || !result.assets[0]) return;
      const { uri, base64 } = await resizeAndCompressImage(result.assets[0].uri);
      navigation.navigate('Scanning', { photoUri: uri, base64 });
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Failed to load image.');
    }
  };

  const handleCapture = async () => {
    if (capturing || !cameraRef.current) return;
    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: true });
      if (!photo?.uri) throw new Error('No photo captured');

      const { uri, base64 } = await resizeAndCompressImage(photo.uri);
      navigation.navigate('Scanning', { photoUri: uri, base64 });
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Failed to capture photo.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
      />

      {/* Top controls */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Point at an animal</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}>
          <Ionicons name={flash === 'on' ? 'flash' : 'flash-off'} size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Viewfinder overlay */}
      <View style={styles.viewfinderContainer}>
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
          <Ionicons name="camera-reverse" size={28} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.shutterOuter, capturing && styles.shutterActive]} onPress={handleCapture} disabled={capturing}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={handleUpload}>
          <Ionicons name="images-outline" size={26} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background, gap: 12 },
  permissionTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  permissionText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
  permissionBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8 },
  permissionBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  topBar: { position: 'absolute', top: 56, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  topTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  viewfinderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  viewfinder: { width: 260, height: 260, position: 'relative' },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: COLORS.white },
  topLeft: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  topRight: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  bottomBar: { position: 'absolute', bottom: 48, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 40 },
  shutterOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  shutterActive: { borderColor: COLORS.primary },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.white },
});
