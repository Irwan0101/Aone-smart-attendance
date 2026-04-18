import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Ganti dengan URL dan Anon Key dari Dashboard Supabase Anda
const supabaseUrl = 'https://hyekpkcwruafuhqptbtp.supabase.co';
const supabaseAnonKey = 'sb_publishable_kYiHpgg6R3i7namjdoXHhw_Fuj1_fQL';

/**
 * Inisialisasi Client Supabase
 * Menggunakan AsyncStorage agar session login (Admin/Guru) tetap tersimpan meski aplikasi ditutup
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Helper untuk query Supabase yang sering digunakan
 */
export const CloudDB = {
  // Cek apakah NIS sudah terdaftar di Cloud
  checkStudentCloud: async (nis) => {
    const { data, error } = await supabase
      .from('students')
      .select('name')
      .eq('nis', nis)
      .single();
    return { data, error };
  },

  // Mendapatkan profil guru/admin yang sedang login
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Logout sistem
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return error;
  }
};