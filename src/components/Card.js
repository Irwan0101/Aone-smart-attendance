// src/components/Card.js
import { StyleSheet, View } from 'react-native';
import { Theme } from '../theme/colors';

// Gunakan Default Export Langsung agar tidak salah import
export default function Card({ children, style, statusColor }) {
  return (
    <View style={[styles.card, style]}>
      {statusColor && <View style={[styles.indicator, { backgroundColor: statusColor }]} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    // Shadow untuk iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // Elevation untuk Android
    elevation: 3,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  }
});