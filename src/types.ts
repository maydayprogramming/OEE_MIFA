// Tipe data utama aplikasi OEE tambang batu bara

export type EquipmentType =
  | 'Hauling Truck'
  | 'Excavator'
  | 'Dozer'
  | 'Wheel Loader'
  | 'Crusher'
  | 'Drill Rig';

export interface Equipment {
  id: string; // kode unit, mis. DT-01
  nama: string; // nama/model alat
  tipe: EquipmentType;
  targetRate: number; // target produksi ideal (ton / jam)
  kapasitas: number; // kapasitas angkut/muat (ton)
  aktif: boolean;
}

export interface DowntimeItem {
  kategori: string;
  menit: number;
}

export interface ShiftLog {
  id: string;
  tanggal: string; // YYYY-MM-DD
  shift: 1 | 2 | 3;
  unitId: string;
  operator: string;
  plannedMinutes: number; // waktu rencana produksi (menit) per shift
  dtTerencana: DowntimeItem[];
  dtTidakTerencana: DowntimeItem[];
  tonaseAktual: number; // ton aktual yang diproduksi
  tonaseReject: number; // ton material reject / tidak memenuhi spesifikasi
}

export interface OeeMetrics {
  plannedMenit: number;
  dtTercMenit: number;
  dtUnplannedMenit: number;
  loadingMenit: number; // waktu muat = planned - downtime terencana
  runMenit: number; // waktu operasi efektif = loading - downtime tidak terencana
  expectedTon: number; // target ton pada run time
  tonaseAktual: number;
  tonaseReject: number;
  availability: number; // 0..1 (bisa >1 bila data tidak konsisten)
  performance: number; // dibatasi 1 untuk perhitungan OEE
  performanceRaw: number; // nilai asli, bisa > 1 saat produksi melampaui target
  quality: number;
  oee: number;
}

export interface Filters {
  dari: string; // YYYY-MM-DD
  sampai: string; // YYYY-MM-DD
  unitId: string; // 'semua' | kode unit
  shift: 0 | 1 | 2 | 3; // 0 = semua shift
}
