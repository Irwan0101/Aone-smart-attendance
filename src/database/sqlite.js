import * as SQLite from 'expo-sqlite';

/**
 * Menggunakan Nama DB Baru (v2) untuk memaksa pembaharuan kolom nisn, room, address
 */
const db = SQLite.openDatabaseSync('AOneSmartPresent_v2.db');

export const initDatabase = async () => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nis TEXT UNIQUE NOT NULL,
        nisn TEXT,           
        name TEXT NOT NULL,
        class TEXT,
        room TEXT,           
        address TEXT,        
        gender TEXT,
        qr_code_data TEXT
      );

      CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        name TEXT,
        role TEXT, -- admin / guru
        password TEXT
      );

      CREATE TABLE IF NOT EXISTS attendance_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nis TEXT NOT NULL,
        status TEXT NOT NULL, -- hadir, izin, sakit, alfa
        session TEXT, -- masuk, pulang
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (nis) REFERENCES students (nis) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS school_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        school_name TEXT DEFAULT 'YAYASAN MUHAMMAD AL MUMTAZ',
        school_logo TEXT,
        academic_year TEXT DEFAULT '2025/2026',
        time_in_start TIME DEFAULT '06:00',
        time_in_end TIME DEFAULT '07:30',
        time_out_start TIME DEFAULT '13:00',
        is_holiday_mode INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS school_profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  school_name TEXT,
  school_logo TEXT,
  last_updated DATETIME
);
      -- Default settings
      INSERT OR IGNORE INTO school_settings (id) VALUES (1);
    `);
    
    console.log("SQLite Engine: OK. Database v2 Ready.");
  } catch (error) {
    console.error("SQLite Init Error:", error);
  }
};

/**
 * LocalDB - Controller Lengkap
 */
export const LocalDB = {
  // --- CRUD SISWA ---
  addStudent: async ({ nis, nisn, name, className, room, address, gender }) => {
    return await db.runAsync(
      'INSERT INTO students (nis, nisn, name, class, room, address, gender) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [nis, nisn, name, className || '-', room || '-', address || '-', gender || 'L']
    );
  },
  
  updateStudent: async (oldNis, data) => {
    return await db.runAsync(
      'UPDATE students SET nis = ?, nisn = ?, name = ?, class = ?, room = ?, address = ? WHERE nis = ?',
      [data.nis, data.nisn, data.name, data.class, data.room, data.address, oldNis]
    );
  },

  getAllStudents: () => 
    db.getAllAsync('SELECT * FROM students ORDER BY name ASC'),

  getStudentByNis: (nis) =>
    db.getFirstAsync('SELECT * FROM students WHERE nis = ?', [nis]),
  
  deleteStudent: (nis) => 
    db.runAsync('DELETE FROM students WHERE nis = ?', [nis]),

  searchStudents: (query) =>
    db.getAllAsync('SELECT * FROM students WHERE name LIKE ? OR nis LIKE ?', [`%${query}%`, `%${query}%`]),

  // --- LOG ABSENSI ---
  saveAttendance: (nis, status, session) => 
    db.runAsync(
      'INSERT INTO attendance_logs (nis, status, session) VALUES (?, ?, ?)', 
      [nis, status, session]
    ),

  // FUNGSI BARU: Cek apakah sudah absen hari ini di sesi tertentu
  checkAlreadyAbsent: async (nis, session) => {
    const result = await db.getFirstAsync(
      `SELECT id FROM attendance_logs 
       WHERE nis = ? AND session = ? AND date(timestamp, 'localtime') = date('now', 'localtime')`,
      [nis, session]
    );
    return !!result; // Mengembalikan true jika ditemukan, false jika tidak
  },

  getAttendanceHistory: (limit = 50) =>
    db.getAllAsync('SELECT * FROM attendance_logs ORDER BY timestamp DESC LIMIT ?', [limit]),

  getDailyStats: () => 
    db.getAllAsync(`
      SELECT status, COUNT(*) as total 
      FROM attendance_logs 
      WHERE date(timestamp, 'localtime') = date('now', 'localtime') 
      GROUP BY status
    `),

  // --- REPORTING ---
  getAttendanceReport: (filterType, value) => {
    // filterType: 'class', 'month', 'week'
    let query = 'SELECT a.*, s.name, s.class FROM attendance_logs a JOIN students s ON a.nis = s.nis ';
    let params = [];

    if (filterType === 'class') {
      query += 'WHERE s.class = ? ';
      params.push(value);
    } else if (filterType === 'month') {
      query += "WHERE strftime('%m', a.timestamp) = ? ";
      params.push(value);
    }
    
    query += 'ORDER BY a.timestamp DESC';
    return db.getAllAsync(query, params);
  },

  // --- PENGATURAN SEKOLAH ---
  getSettings: () => 
    db.getFirstAsync('SELECT * FROM school_settings WHERE id = 1'),
  
  updateSettings: (schoolName, academicYear, timeIn, timeOut) => 
    db.runAsync(
      'UPDATE school_settings SET school_name = ?, academic_year = ?, time_in_end = ?, time_out_start = ? WHERE id = 1',
      [schoolName, academicYear, timeIn, timeOut]
    ),

  // --- STAFF / USER ---
  addStaff: (username, name, role, password) =>
    db.runAsync('INSERT INTO staff (username, name, role, password) VALUES (?, ?, ?, ?)', [username, name, role, password]),

  loginStaff: (username, password) =>
    db.getFirstAsync('SELECT * FROM staff WHERE username = ? AND password = ?', [username, password])
};

export default db;