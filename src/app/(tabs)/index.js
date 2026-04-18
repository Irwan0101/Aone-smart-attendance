import { Bell, UserCheck, UserMinus, UserPlus, Users, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../../components/Card';
import GlassmorphicBox from '../../components/GlassmorphicBox';
import SyncIndicator from '../../components/SyncIndicator';
import { LocalDB } from '../../database/sqlite';
import { AIInsightService } from '../../services/aiInsight';
import { Theme, hexToRGBA } from '../../theme/colors';

export default function DashboardScreen() {
  const [stats, setStats] = useState({ hadir: 0, izin: 0, alfa: 0 });
  const [aiInsight, setAiInsight] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load Statistik & AI Insight
  const loadDashboardData = async () => {
    // 1. Ambil data real-time dari SQLite
    const dailyData = await LocalDB.getDailyStats();
    const newStats = { hadir: 0, izin: 0, alfa: 0 };
    
    dailyData.forEach(item => {
      if (newStats.hasOwnProperty(item.status.toLowerCase())) {
        newStats[item.status.toLowerCase()] = item.total;
      }
    });
    setStats(newStats);

    // 2. Ambil Insight dari "AI Engine" kita
    const insights = await AIInsightService.getAtRiskStudents();
    if (insights.length > 0) {
      setAiInsight(insights[0]); // Ambil satu insight paling prioritas
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDashboardData().then(() => setRefreshing(false));
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.primary} />
      }
    >
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Halo, Administrator</Text>
          <Text style={styles.schoolName}>Ponpes Miftahul Ulum</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Bell color={Theme.textMain} size={22} />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      {/* SYNC STATUS INDICATOR */}
      <View style={styles.syncWrapper}>
        <SyncIndicator isOnline={true} unsyncedCount={3} />
      </View>

      {/* MAIN STATS (GLASSMORPHIC) */}
      <View style={styles.statsGrid}>
        <GlassmorphicBox style={styles.mainStatBox} intensity={30}>
          <UserCheck color={Theme.success} size={32} />
          <Text style={styles.statNumber}>{stats.hadir}</Text>
          <Text style={styles.statLabel}>Siswa Hadir</Text>
        </GlassmorphicBox>

        <View style={styles.sideStats}>
          <View style={[styles.miniStat, { backgroundColor: hexToRGBA(Theme.warning, 0.15) }]}>
            <UserPlus color={Theme.warning} size={20} />
            <Text style={[styles.miniStatNumber, { color: Theme.warning }]}>{stats.izin}</Text>
            <Text style={styles.miniStatLabel}>Izin/Sakit</Text>
          </View>
          
          <View style={[styles.miniStat, { backgroundColor: hexToRGBA(Theme.danger, 0.15) }]}>
            <UserMinus color={Theme.danger} size={20} />
            <Text style={[styles.miniStatNumber, { color: Theme.danger }]}>{stats.alfa}</Text>
            <Text style={styles.miniStatLabel}>Alfa</Text>
          </View>
        </View>
      </View>

      {/* AI INSIGHT SECTION (Predictive Analysis) */}
      {aiInsight && (
        <Card statusColor={Theme.primary} style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Zap color={Theme.primary} size={18} fill={Theme.primary} />
            <Text style={styles.aiTitle}>AI SMART INSIGHT</Text>
          </View>
          <Text style={styles.aiBody}>{aiInsight.insight}</Text>
          <TouchableOpacity style={styles.aiAction}>
            <Text style={styles.aiActionText}>Tindak Lanjuti Sekarang</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* QUICK ACTIONS */}
      <Text style={styles.sectionTitle}>Aksi Cepat</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionScroll}>
        <TouchableOpacity style={styles.actionItem}>
          <View style={[styles.actionIcon, { backgroundColor: Theme.primary }]}>
            <Users color={Theme.background} size={24} />
          </View>
          <Text style={styles.actionText}>Data Siswa</Text>
        </TouchableOpacity>
        
        {/* Tambahkan aksi lainnya di sini */}
      </ScrollView>

      <View style={{ height: 100 }} /> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.background },
  content: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcomeText: { color: Theme.textMuted, fontSize: 14, fontWeight: '600' },
  schoolName: { color: Theme.textMain, fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  notifBtn: { backgroundColor: Theme.card, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: Theme.border },
  notifBadge: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.danger, borderWidth: 2, borderColor: Theme.card },
  syncWrapper: { marginBottom: 25, alignItems: 'flex-start' },
  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  mainStatBox: { flex: 1.2, alignItems: 'center', justifyContent: 'center', paddingVertical: 25 },
  statNumber: { color: Theme.textMain, fontSize: 42, fontWeight: '900', marginVertical: 5 },
  statLabel: { color: Theme.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  sideStats: { flex: 1, gap: 15 },
  miniStat: { flex: 1, borderRadius: 20, padding: 15, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  miniStatNumber: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  miniStatLabel: { color: Theme.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  aiCard: { backgroundColor: hexToRGBA(Theme.card, 0.8), borderStyle: 'dashed' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  aiTitle: { color: Theme.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  aiBody: { color: Theme.textMain, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  aiAction: { marginTop: 15, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Theme.border },
  aiActionText: { color: Theme.primary, fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  sectionTitle: { color: Theme.textMain, fontSize: 18, fontWeight: '800', marginBottom: 15, marginTop: 10 },
  actionScroll: { flexDirection: 'row' },
  actionItem: { alignItems: 'center', marginRight: 25 },
  actionIcon: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionText: { color: Theme.textMuted, fontSize: 11, fontWeight: '700' }
});