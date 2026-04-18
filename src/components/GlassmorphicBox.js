// src/components/GlassmorphicBox.js
import { BlurView } from 'expo-blur'; // Pastikan library ini sudah terinstal
import { StyleSheet } from 'react-native';
import { Theme, hexToRGBA } from '../theme/colors';

export default function GlassmorphicBox({ children, intensity = 20, style }) {
  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.box, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: hexToRGBA(Theme.card, 0.3),
    borderWidth: 1,
    borderColor: hexToRGBA(Theme.border, 0.2),
  },
});