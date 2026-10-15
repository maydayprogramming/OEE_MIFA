// Kategori downtime khas operasi tambang batu bara

export const DT_TERENCANA = [
  'Istirahat & Sholat',
  'Briefing / Safety Talk',
  'Pengisian BBM',
  'Pemeliharaan Terencana (PM)',
  'Pergantian Shift',
  'Pindah Titik Kerja',
] as const;

export const DT_TIDAK_TERENCANA = [
  'Breakdown Mekanis',
  'Breakdown Elektris',
  'Menunggu Unit Lain',
  'Menunggu Alat Muat',
  'Hujan / Petir',
  'Jalur Hauling Macet / Rusak',
  'Perbaikan Ban',
  'Menunggu BBM',
  'Operator Tidak Hadir',
  'Insiden / Kecelakaan',
  'Lainnya',
] as const;

/** Warna chart per kategori downtime (kelas penuh agar terbaca Tailwind JIT). */
export const WARNA_KATEGORI: Record<string, string> = {
  'Breakdown Mekanis': '#e11d48',
  'Breakdown Elektris': '#f43f5e',
  'Menunggu Unit Lain': '#f59e0b',
  'Menunggu Alat Muat': '#f97316',
  'Hujan / Petir': '#3b82f6',
  'Jalur Hauling Macet / Rusak': '#8b5cf6',
  'Perbaikan Ban': '#06b6d4',
  'Menunggu BBM': '#84cc16',
  'Operator Tidak Hadir': '#a855f7',
  'Insiden / Kecelakaan': '#dc2626',
  Lainnya: '#64748b',
  'Istirahat & Sholat': '#94a3b8',
  'Briefing / Safety Talk': '#78716c',
  'Pengisian BBM': '#0ea5e9',
  'Pemeliharaan Terencana (PM)': '#10b981',
  'Pergantian Shift': '#6b7280',
  'Pindah Titik Kerja': '#7c3aed',
};
