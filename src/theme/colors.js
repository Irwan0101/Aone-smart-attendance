// src/theme/colors.js

export const Theme = {
  // --- BACKGROUND COLORS ---
  background: "#0F172A",    // Slate 900 - Dasar aplikasi (gelap tapi bukan hitam pekat)
  card: "#1E293B",          // Slate 800 - Background untuk kartu atau container
  overlay: "rgba(15, 23, 42, 0.8)", // Efek transparan untuk modal/blur

  // --- BRAND COLORS (AOne Signature) ---
  primary: "#22D3EE",       // Cyan 400 - Warna utama untuk icon, tombol aktif, & glow
  primaryDark: "#0891B2",   // Cyan 600 - Untuk gradasi atau state saat ditekan
  secondary: "#38BDF8",      // Sky 400 - Aksen tambahan agar tidak monoton

  // --- ATTENDANCE STATUS COLORS ---
  success: "#10B981",       // Emerald 500 - Hadir (Centang Hijau)
  warning: "#F59E0B",       // Amber 500 - Izin / Sakit
  danger: "#EF4444",        // Red 500 - Alfa / Gagal Scan
  info: "#6366F1",          // Indigo 500 - Pengumuman / Info Guru

  // --- TEXT COLORS ---
  textMain: "#F8FAFC",      // Slate 50 - Teks utama (sangat terang)
  textMuted: "#94A3B8",     // Slate 400 - Teks pendukung (abu-abu halus)
  textDark: "#0F172A",      // Slate 900 - Teks di atas background terang (seperti tombol Cyan)

  // --- UI ELEMENTS ---
  border: "rgba(255, 255, 255, 0.08)", // Garis tipis transparan untuk kesan Glassmorphism
  divider: "rgba(148, 163, 184, 0.1)", // Garis pemisah antar list
  
  // --- SHADOWS & GLOW ---
  glow: "rgba(34, 211, 238, 0.3)", // Glow effect untuk tombol utama
};

/**
 * Helper untuk memberikan transparansi pada warna secara instan
 * Penggunaan: hexToRGBA(Theme.primary, 0.1)
 */
export const hexToRGBA = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};