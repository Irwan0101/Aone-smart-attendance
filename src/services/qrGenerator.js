import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Theme } from '../theme/colors';

export const QRService = {
  /**
   * Fungsi untuk membagikan QR Code yang sudah di-render oleh ViewShot
   * @param {string} uri - URI sementara dari captureRef
   * @param {string} fileName - Nama file (misal: NIS_NamaSiswa.png)
   */
  shareQRCode: async (uri, fileName) => {
    try {
      // Cek apakah fitur sharing tersedia
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        alert("Fitur sharing tidak tersedia di perangkat ini");
        return;
      }

      // Tentukan path folder sementara
      const newPath = `${FileSystem.cacheDirectory}${fileName}.png`;
      
      // Salin file dari cache ViewShot ke path yang bisa dibagikan
      await FileSystem.copyAsync({
        from: uri,
        to: newPath
      });

      await Sharing.shareAsync(newPath, {
        mimeType: 'image/png',
        dialogTitle: `Bagikan QR Code ${fileName}`,
        UTI: 'public.png'
      });
    } catch (error) {
      console.error("Gagal membagikan QR:", error);
      alert("Terjadi kesalahan saat membagikan QR Code");
    }
  },

  /**
   * Konfigurasi UI QR Code agar senada dengan Brand AOne
   */
  getQRConfig: (value) => {
    return {
      value: value,                 // Data yang di-encode (NIS)
      size: 200,                    // Ukuran QR
      color: Theme.background,      // Warna batang QR (Gelap)
      backgroundColor: 'white',     // Background (Harus terang agar mudah di-scan)
      logo: require('../assets/images/logo_square.png'), // Logo sekolah di tengah QR
      logoSize: 50,
      logoBackgroundColor: 'white',
      logoBorderRadius: 10,
      quietZone: 10,
    };
  }
};