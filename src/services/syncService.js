import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import db from '../database/sqlite';
import { supabase } from '../database/supabase';

/**
 * SyncService: Jembatan antara SQLite Lokal dan Cloud Supabase
 */
export const SyncService = {
  
  /**
   * Helper: Memastikan kolom 'synced' ada di SQLite HP.
   */
  ensureColumns: async () => {
    try {
      await db.execAsync(`ALTER TABLE students ADD COLUMN synced INTEGER DEFAULT 1;`);
    } catch (e) { /* Kolom sudah ada */ }

    try {
      await db.execAsync(`ALTER TABLE attendance_logs ADD COLUMN synced INTEGER DEFAULT 0;`);
    } catch (e) { /* Kolom sudah ada */ }
  },

  /**
   * Cek Koneksi Internet
   */
  checkConnection: async () => {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  },

  /**
   * 1. UPLOAD ABSENSI: Kirim log absen dari HP ke Cloud
   */
  uploadAttendance: async () => {
    await SyncService.ensureColumns();
    const isOnline = await SyncService.checkConnection();
    if (!isOnline) return { success: false, message: 'Mode Offline' };

    try {
      const unsyncedData = await db.getAllAsync(
        'SELECT * FROM attendance_logs WHERE synced = 0 LIMIT 100'
      );

      if (unsyncedData.length === 0) return { success: true, count: 0, message: 'Data sudah sinkron' };

      const payload = unsyncedData.map(item => ({
        student_nis: item.nis || item.student_nis, // Menyesuaikan nama kolom
        timestamp: item.timestamp || item.created_at,
        status: (item.status || 'masuk').toLowerCase().trim(),
        method: item.method || 'QR',
        device_id: 'GURU_HP_MAIN' 
      }));

      const { data, error } = await supabase.from('attendance_logs').insert(payload).select();
      if (error) throw error;

      if (data) {
        const ids = unsyncedData.map(item => item.id).join(',');
        await db.execAsync(`UPDATE attendance_logs SET synced = 1 WHERE id IN (${ids})`);
      }

      return { success: true, count: unsyncedData.length };
    } catch (error) {
      console.error('Sync Upload Error:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * 2. PULL MASTER DATA (Termasuk Profil & Jadwal Waktu)
   */
  pullMasterData: async () => {
    await SyncService.ensureColumns();
    const isOnline = await SyncService.checkConnection();
    if (!isOnline) return { success: false, message: 'Butuh internet' };

    try {
      // Pull Profil Sekolah (Nama, Logo, Waktu)
      await SyncService.pullSchoolProfile();

      // Pull Data Kelas
      const { data: classes } = await supabase.from('classes').select('*');
      if (classes) {
        for (const c of classes) {
          await db.runAsync('INSERT OR REPLACE INTO classes (id, class) VALUES (?, ?)', [c.id, c.class]);
        }
      }

      // Pull Data Santri
      const { data: students, error: studentErr } = await supabase.from('students').select('*');
      if (studentErr) throw studentErr;

      for (const s of students) {
        await db.runAsync(
          'INSERT OR REPLACE INTO students (nis, nisn, name, class, room, synced) VALUES (?, ?, ?, ?, ?, ?)',
          [s.nis, s.nisn, s.name, s.class, s.room, 1]
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Pull Master Data Error:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * 3. PUSH MASTER DATA: Kirim santri baru ke Cloud
   */
  pushMasterData: async () => {
    await SyncService.ensureColumns();
    const isOnline = await SyncService.checkConnection();
    if (!isOnline) return { success: false, message: 'Offline' };

    try {
      const localStudents = await db.getAllAsync('SELECT * FROM students WHERE synced = 0');
      if (localStudents.length === 0) return { success: true, count: 0, message: 'Tidak ada santri baru' };

      const payload = localStudents.map(s => ({
        nis: s.nis,
        name: s.name,
        class: s.class,
        room: s.room,
        nisn: s.nisn
      }));

      const { error } = await supabase.from('students').upsert(payload, { onConflict: 'nis' });
      if (error) throw error;

      await db.execAsync('UPDATE students SET synced = 1 WHERE synced = 0');
      return { success: true, count: localStudents.length };
    } catch (error) {
      console.error('Push Master Error:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * 4. PULL & SYNC PROFILE (Nama, Logo, Waktu)
   */
  pullSchoolProfile: async () => {
    try {
      const { data, error } = await supabase.from('school_profile').select('*').eq('id', 1).single();
      if (error) throw error;

      if (data) {
        const currentSettings = await AsyncStorage.getItem('@app_settings');
        const parsed = currentSettings ? JSON.parse(currentSettings) : {};
        
        const newSettings = {
          ...parsed,
          school_name: data.school_name,
          school_logo: data.school_logo,
          holiday_mode: data.holiday_mode,
          checkin_time: data.checkin_time || '07:00',
          checkout_time: data.checkout_time || '14:00'
        };

        await AsyncStorage.setItem('@app_settings', JSON.stringify(newSettings));
        return newSettings;
      }
    } catch (error) {
      console.error('Pull Profile Error:', error.message);
    }
  },

  /**
   * 5. UPLOAD LOGO TO STORAGE
   */
uploadLogo: async (uri) => {
  try {
    // 1. Ekstrak informasi file
    const fileExt = uri.split('.').pop();
    const fileName = `logo_${Date.now()}.${fileExt}`;
    const type = `image/${fileExt === 'png' ? 'png' : 'jpeg'}`;

    // 2. Bungkus dalam FormData (Standar Android untuk kirim file)
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      name: fileName,
      type: type,
    });

    // 3. Upload menggunakan API Storage Supabase
    // Note: Kita kirim formData langsung ke bucket 'logos'
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(fileName, formData, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // 4. Ambil Public URL
    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(fileName);
    
    return { success: true, url: urlData.publicUrl };
  } catch (e) {
    // Jika masih Network Request Failed, cek dua hal di bawah kode ini
    console.error("Storage Error:", e.message);
    return { success: false, message: e.message };
  }
},
  /**
   * 6. MAINTENANCE: EXPORT DATABASE
   */
  exportDatabase: async () => {
    try {
      const dbUri = `${FileSystem.documentDirectory}SQLite/aone_database.db`; // Pastikan nama file cocok
      const fileInfo = await FileSystem.getInfoAsync(dbUri);
      if (!fileInfo.exists) return { success: false, message: "File DB tidak ditemukan" };

      await Sharing.shareAsync(dbUri);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  /**
   * 7. BACKGROUND SYNC
   */
  startBackgroundSync: () => {
    setInterval(async () => {
      await SyncService.uploadAttendance();
    }, 60000); // 1 Menit
    
    setInterval(async () => {
      await SyncService.pullMasterData();
    }, 600000); // 10 Menit
  }
};