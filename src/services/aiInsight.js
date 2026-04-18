import db from '../database/sqlite';
import { formatName } from '../utils/formatters';

export const AIInsightService = {
  /**
   * Menganalisis siswa yang berisiko (Tidak masuk berturut-turut)
   * Fitur: "Siswa A sudah tidak masuk 3 hari, apakah ingin menghubungi orang tuanya?"
   */
  getAtRiskStudents: async () => {
    try {
      // Query untuk mengambil siswa yang absen (Alfa) dalam 3 hari terakhir aktif
      const query = `
        SELECT s.name, s.nis, COUNT(a.id) as total_alfa
        FROM students s
        JOIN attendance_logs a ON s.nis = a.nis
        WHERE a.status = 'alfa' 
        AND a.timestamp >= date('now', '-3 days')
        GROUP BY s.nis
        HAVING total_alfa >= 3
      `;
      
      const results = await db.getAllAsync(query);
      
      return results.map(item => ({
        ...item,
        insight: `${formatName(item.name)} tidak hadir 3 hari berturut-turut. AI menyarankan untuk segera melakukan home visit atau menelpon wali murid.`,
        priority: 'high'
      }));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      return [];
    }
  },

  /**
   * Prediksi Kehadiran Besok (Simple Trend Analysis)
   * Menganalisis rata-rata kehadiran harian
   */
  getAttendancePredictive: async () => {
    try {
      const stats = await db.getAllAsync(`
        SELECT 
          date(timestamp) as day, 
          COUNT(*) as total 
        FROM attendance_logs 
        WHERE status = 'hadir'
        GROUP BY day 
        ORDER BY day DESC LIMIT 7
      `);

      if (stats.length === 0) return "Belum ada data cukup untuk prediksi.";

      const average = stats.reduce((acc, curr) => acc + curr.total, 0) / stats.length;
      
      return {
        predictedCount: Math.round(average),
        message: `Berdasarkan tren 7 hari terakhir, diperkirakan besok akan ada sekitar ${Math.round(average)} siswa yang hadir.`
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * Smart Search (Fuzzy Logic)
   * Guru bisa mencari nama meski typo (Contoh: "Algie" untuk "Algi")
   */
  fuzzySearchSiswa: (query, studentList) => {
    if (!query) return [];
    
    const searchKey = query.toLowerCase();
    return studentList.filter(student => {
      const name = student.name.toLowerCase();
      // Logika sederhana: Cek apakah mengandung substring atau kemiripan karakter
      return name.includes(searchKey) || 
             name.split(' ').some(word => word.startsWith(searchKey.substring(0, 3)));
    });
  }
};