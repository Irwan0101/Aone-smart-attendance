import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { CheckCircle2, History, XCircle } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlassmorphicBox from '../../components/GlassmorphicBox';
import { LocalDB } from '../../database/sqlite';
import { Theme } from '../../theme/colors';

export default function AttendanceScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [status, setStatus] = useState('ready'); // ready, success, error
  const [mode, setMode] = useState('masuk'); // masuk, pulang
  const [lastStudent, setLastStudent] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);

  // --- ANIMASI SCAN ---
  const translateY = useRef(new Animated.Value(0)).current;
  const SCAN_FRAME_SIZE = 220;

  useEffect(() => {
    if (permission?.granted) {
      startScanningAnimation();
    }
  }, [permission]);

  const startScanningAnimation = () => {
    translateY.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: SCAN_FRAME_SIZE,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Butuh izin kamera untuk scan kartu</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnText}>Beri Izin</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const students = await LocalDB.getAllStudents();
      const student = students.find(s => s.nis === data || s.nisn === data);

      if (!student) {
        provideFeedback('error', "Tidak Dikenal", "Data tidak ditemukan");
        return;
      }

      // Cek Duplikat di Sesi yang Sama (Membutuhkan fungsi checkAlreadyAbsent di sqlite.js)
      const isAlready = await LocalDB.checkAlreadyAbsent(student.nis, mode);
      if (isAlready) {
        provideFeedback('error', student.name, `SUDAH ABSEN ${mode.toUpperCase()}`);
        Speech.speak(`${student.name} sudah absen ${mode}`, { language: 'id-ID' });
        return;
      }

      // Simpan Absensi
      await LocalDB.saveAttendance(student.nis, 'hadir', mode);
      
      // Update Log Sesi Sementara
      const newLog = {
        id: Date.now().toString(),
        name: student.name,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setSessionLogs(prev => [newLog, ...prev]);
      setLastStudent(student);

      provideFeedback('success', student.name, `BERHASIL ABSEN ${mode.toUpperCase()}`);
      Speech.speak(`Hadir ${mode}, ${student.name}`, { language: 'id-ID' });

    } catch (error) {
      console.error(error);
      setScanned(false);
    }
  };

  const provideFeedback = (type, name, msg) => {
    setStatus(type);
    Haptics.notificationAsync(
      type === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );

    setTimeout(() => {
      setScanned(false);
      setStatus('ready');
    }, 2500);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeSettings={{ barcodeTypes: ["qr"] }}
      />

      {/* HEADER: MODE SELECTOR */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.modeBtn, mode === 'masuk' && styles.modeActive]} 
          onPress={() => { setMode('masuk'); setSessionLogs([]); }}
        >
          <Text style={styles.modeText}>ABSEN MASUK</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modeBtn, mode === 'pulang' && styles.modeActive]} 
          onPress={() => { setMode('pulang'); setSessionLogs([]); }}
        >
          <Text style={styles.modeText}>ABSEN PULANG</Text>
        </TouchableOpacity>
      </View>

      {/* OVERLAY SCANNER */}
      <View style={styles.overlay}>
        <View style={[
          styles.scanFrame, 
          { borderColor: status === 'success' ? Theme.success : status === 'error' ? Theme.danger : 'rgba(255,255,255,0.3)' }
        ]}>
          <Animated.View 
            style={[
              styles.scanBar,
              {
                backgroundColor: status === 'success' ? Theme.success : status === 'error' ? Theme.danger : Theme.primary,
                transform: [{ translateY: translateY }]
              }
            ]} 
          />
          <View style={[styles.corner, styles.topRight, { borderColor: status === 'success' ? Theme.success : status === 'error' ? Theme.danger : Theme.primary }]} />
          <View style={[styles.corner, styles.bottomLeft, { borderColor: status === 'success' ? Theme.success : status === 'error' ? Theme.danger : Theme.primary }]} />
        </View>
      </View>

      {/* BOTTOM PANEL: STATUS & TABLE */}
      <View style={styles.bottomPanel}>
        <GlassmorphicBox intensity={60} style={styles.infoBox}>
          {status === 'ready' ? (
            <View style={styles.historySection}>
              <View style={styles.tableHeader}>
                <History size={16} color={Theme.primary} />
                <Text style={styles.tableTitle}>RIWAYAT SESI {mode.toUpperCase()}</Text>
              </View>
              <FlatList
                data={sessionLogs}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.tableRow}>
                    <Text style={styles.rowTime}>{item.time}</Text>
                    <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
                    <CheckCircle2 size={14} color={Theme.success} />
                  </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Belum ada data di sesi ini</Text>}
              />
            </View>
          ) : (
            <View style={styles.resultRow}>
              {status === 'success' ? <CheckCircle2 color={Theme.success} size={40} /> : <XCircle color={Theme.danger} size={40} />}
              <View style={styles.textGroup}>
                <Text style={styles.resName}>{status === 'success' ? lastStudent?.name : "Gagal"}</Text>
                <Text style={[styles.resStatus, { color: status === 'success' ? Theme.success : Theme.danger }]}>
                  {status === 'success' ? `BERHASIL ABSEN ${mode.toUpperCase()}` : "QR TIDAK TERDAFTAR / DUPLIKAT"}
                </Text>
              </View>
            </View>
          )}
        </GlassmorphicBox>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { position: 'absolute', top: 60, flexDirection: 'row', width: '100%', paddingHorizontal: 20, gap: 10, zIndex: 10 },
  modeBtn: { flex: 1, paddingVertical: 12, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  modeActive: { backgroundColor: Theme.primary, borderColor: Theme.primary },
  modeText: { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  scanFrame: { width: 220, height: 220, borderWidth: 1, position: 'relative', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  scanBar: { position: 'absolute', width: '90%', height: 2, zIndex: 5, shadowBlur: 10, shadowColor: '#fff', elevation: 5 },
  corner: { position: 'absolute', width: 30, height: 30, borderWidth: 4 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  
  bottomPanel: { position: 'absolute', bottom: 40, left: 20, right: 20, height: 260 },
  infoBox: { flex: 1, padding: 15, borderRadius: 24, overflow: 'hidden' },
  
  // Result Styles
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 20, flex: 1 },
  textGroup: { flex: 1 },
  resName: { color: Theme.textMain, fontSize: 20, fontWeight: '900' },
  resStatus: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginTop: 4 },

  // Table Styles
  historySection: { flex: 1 },
  tableHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  tableTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '800' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rowTime: { color: Theme.primary, fontWeight: 'bold', width: 50, fontSize: 12 },
  rowName: { color: '#fff', flex: 1, fontSize: 14, fontWeight: '600', marginRight: 10 },
  emptyText: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 30, fontSize: 12 },

  message: { color: '#fff', textAlign: 'center', marginBottom: 20 },
  btn: { backgroundColor: Theme.primary, padding: 15, borderRadius: 12, alignSelf: 'center' },
  btnText: { color: '#000', fontWeight: 'bold' },
});