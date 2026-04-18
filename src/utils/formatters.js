import { format } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format Tanggal Indonesia Lengkap
 * Contoh: Senin, 16 April 2026
 */
export const formatDateFull = (date) => {
  if (!date) return "-";
  return format(new Date(date), "EEEE, d MMMM yyyy", { locale: id });
};

/**
 * Format Jam & Menit
 * Contoh: 07:15
 */
export const formatTime = (date) => {
  if (!date) return "--:--";
  return format(new Date(date), "HH:mm");
};

/**
 * Kapitalisasi Nama Siswa (Proper Case)
 * Contoh: "MUHAMMAD ALGI" -> "Muhammad Algi"
 */
export const formatName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Singkat Nama Panjang (Untuk UI yang sempit)
 * Contoh: "Muhammad Algi Mumtaz" -> "M. Algi Mumtaz"
 */
export const formatShortName = (name) => {
  if (!name) return "";
  const words = name.split(' ');
  if (words.length <= 2) return name;
  return `${words[0].charAt(0)}. ${words.slice(1).join(' ')}`;
};

/**
 * Format ID Kehadiran / NIS
 * Mencegah karakter aneh masuk ke Database
 */
export const formatNIS = (text) => {
  return text.replace(/[^0-9]/g, ''); // Hanya angka
};

/**
 * Label Status Kehadiran dengan Warna
 * Digunakan untuk indikator status di UI
 */
export const getStatusLabel = (status) => {
  switch (status?.toLowerCase()) {
    case 'hadir':
      return { label: 'HADIR', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
    case 'izin':
      return { label: 'IZIN', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
    case 'sakit':
      return { label: 'SAKIT', color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.1)' };
    case 'alfa':
      return { label: 'ALFA', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' };
    default:
      return { label: 'UNKNOWN', color: '#64748B', bg: 'rgba(100, 116, 139, 0.1)' };
  }
};