// src/components/SyncIndicator.js
import { Cloud, CloudOff, RefreshCcw } from 'lucide-react-native'; // Perbaikan permanen: CloudCloud -> Cloud
import { StyleSheet, Text, View } from 'react-native';
import { Theme, hexToRGBA } from '../theme/colors';

export default function SyncIndicator({ isOnline, unsyncedCount, isSyncing }) {
  const statusColor = isOnline ? Theme.success : Theme.danger;
  const bgColor = isOnline ? hexToRGBA(Theme.success, 0.1) : hexToRGBA(Theme.danger, 0.1);

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor: hexToRGBA(statusColor, 0.3) }]}>
      <View style={styles.row}>
        {isSyncing ? (
          <RefreshCcw color={Theme.primary} size={14} />
        ) : isOnline ? (
          <Cloud color={Theme.success} size={16} /> 
        ) : (
          <CloudOff color={Theme.danger} size={16} />
        )}

        <View style={styles.textContainer}>
          <Text style={[styles.statusText, { color: isOnline ? Theme.textMain : Theme.danger }]}>
            {isOnline ? 'System Online' : 'Offline Mode'}
          </Text>
          
          {unsyncedCount > 0 && (
            <Text style={styles.pendingText}>
              {unsyncedCount} data pending
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.dot, { backgroundColor: statusColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 140,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  textContainer: { marginLeft: 8 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  pendingText: { fontSize: 9, color: Theme.textMuted, marginTop: -1 },
  dot: { width: 6, height: 6, borderRadius: 3, marginLeft: 10 },
});