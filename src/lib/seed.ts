// Data demo deterministik untuk operasi tambang batu bara
// (30 hari terakhir, 12 unit, 3 shift — dibangkitkan dengan PRNG agar konsisten)

import type { DowntimeItem, Equipment, ShiftLog } from '../types';
import { isoDate, addHari } from '../lib/format';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SEED_UNITS: Equipment[] = [
  { id: 'DT-01', nama: 'Dump Truck CAT 777E', tipe: 'Hauling Truck', targetRate: 620, kapasitas: 100, aktif: true },
  { id: 'DT-02', nama: 'Dump Truck CAT 777E', tipe: 'Hauling Truck', targetRate: 620, kapasitas: 100, aktif: true },
  { id: 'DT-03', nama: 'Dump Truck Komatsu HD785-7', tipe: 'Hauling Truck', targetRate: 600, kapasitas: 95, aktif: true },
  { id: 'DT-04', nama: 'Dump Truck Komatsu HD785-7', tipe: 'Hauling Truck', targetRate: 600, kapasitas: 95, aktif: true },
  { id: 'DT-05', nama: 'Dump Truck CAT 773G', tipe: 'Hauling Truck', targetRate: 480, kapasitas: 70, aktif: true },
  { id: 'DT-06', nama: 'Dump Truck CAT 773G', tipe: 'Hauling Truck', targetRate: 480, kapasitas: 70, aktif: true },
  { id: 'EX-01', nama: 'Excavator Komatsu PC2000-8', tipe: 'Excavator', targetRate: 1150, kapasitas: 12, aktif: true },
  { id: 'EX-02', nama: 'Excavator Hitachi EX1200-6', tipe: 'Excavator', targetRate: 1050, kapasitas: 11, aktif: true },
  { id: 'DZ-01', nama: 'Dozer CAT D85ESS', tipe: 'Dozer', targetRate: 700, kapasitas: 0, aktif: true },
  { id: 'DZ-02', nama: 'Dozer Komatsu D375A-8', tipe: 'Dozer', targetRate: 750, kapasitas: 0, aktif: true },
  { id: 'LD-01', nama: 'Wheel Loader Komatsu WA600-3', tipe: 'Wheel Loader', targetRate: 850, kapasitas: 7, aktif: true },
  { id: 'CR-01', nama: 'Coal Crushing Plant', tipe: 'Crusher', targetRate: 1500, kapasitas: 0, aktif: true },
];

const OPERATOR = [
  'Ahmad Fauzi',
  'Budi Santoso',
  'Dedi Kurniawan',
  'Eko Prasetyo',
  'Hendra Wijaya',
  'Irfan Maulana',
  'Joko Susilo',
  'Muhammad Rizki',
  'Rahmat Hidayat',
  'Rudi Hartono',
  'Sugeng Riyanto',
  'Wahyu Setiawan',
  'Yusuf Ramadhan',
  'Zainal Abidin',
];

// Peluang muncul & bobot durasi kategori downtime tidak terencana
const BOBOT_UNSCHEDULED: Array<[string, number]> = [
  ['Breakdown Mekanis', 0.16],
  ['Breakdown Elektris', 0.07],
  ['Menunggu Unit Lain', 0.18],
  ['Menunggu Alat Muat', 0.15],
  ['Hujan / Petir', 0.12],
  ['Jalur Hauling Macet / Rusak', 0.1],
  ['Perbaikan Ban', 0.09],
  ['Menunggu BBM', 0.05],
  ['Operator Tidak Hadir', 0.04],
  ['Insiden / Kecelakaan', 0.015],
  ['Lainnya', 0.05],
];

function pickCategories(rng: () => number, jumlah: number, hujan: boolean): string[] {
  const pool = BOBOT_UNSCHEDULED.map(([kat, bobot]) => ({
    kat,
    w: kat === 'Hujan / Petir' ? bobot * (hujan ? 4 : 0.25) : bobot,
  }));
  const terpilih: string[] = [];
  for (let i = 0; i < jumlah && pool.length > 0; i++) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = rng() * total;
    let idx = 0;
    for (let j = 0; j < pool.length; j++) {
      r -= pool[j].w;
      if (r <= 0) {
        idx = j;
        break;
      }
    }
    terpilih.push(pool[idx].kat);
    pool.splice(idx, 1);
  }
  return terpilih;
}

function bagiMenit(rng: () => number, total: number, n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [Math.round(total / 5) * 5];
  const bobot = Array.from({ length: n }, () => 0.3 + rng());
  const sum = bobot.reduce((s, b) => s + b, 0);
  const hasil = bobot.map((b) => Math.max(Math.round((total * b) / sum / 5) * 5, 5));
  // koreksi pembulatan agar total tepat
  const selisih = Math.round(total / 5) * 5 - hasil.reduce((s, v) => s + v, 0);
  hasil[0] = Math.max(hasil[0] + selisih, 5);
  return hasil;
}

export function generateSeedLogs(units: Equipment[], hari: number = 30, today = new Date()): ShiftLog[] {
  const rng = mulberry32(20261015);
  const logs: ShiftLog[] = [];
  const rateMap = new Map(units.map((u) => [u.id, u.targetRate]));

  for (let d = hari - 1; d >= 0; d--) {
    const tanggal = addHari(isoDate(today), -d);
    const hujan = rng() < 0.22;
    const hujanBerat = hujan && rng() < 0.4;

    units.forEach((unit, ui) => {
      for (const shift of [1, 2, 3] as const) {
        const plannedMinutes = 450;

        // Downtime terencana
        const dtTerencana: DowntimeItem[] = [
          { kategori: 'Istirahat & Sholat', menit: 30 },
          { kategori: 'Briefing / Safety Talk', menit: shift === 1 ? 15 : 10 },
        ];
        if (rng() < 0.6) dtTerencana.push({ kategori: 'Pengisian BBM', menit: 15 + Math.floor(rng() * 3) * 5 });
        if (rng() < 0.06) dtTerencana.push({ kategori: 'Pemeliharaan Terencana (PM)', menit: 60 + Math.floor(rng() * 4) * 30 });

        const dtTercMenit = dtTerencana.reduce((s, i) => s + i.menit, 0);
        const loadingMenit = Math.max(plannedMinutes - dtTercMenit, 0);

        // Target availability harian unit
        let a = 0.86 + (rng() - 0.5) * 0.2; // 0.76 .. 0.96
        if (hujan) a -= hujanBerat ? 0.18 : 0.08;
        if (unit.tipe === 'Hauling Truck' && rng() < 0.12) a -= 0.1; // sebagian truck lebih rewel
        a = Math.min(Math.max(a, 0.45), 0.98);

        const unplannedMenit = Math.round(((1 - a) * loadingMenit) / 5) * 5;
        const nKat = unplannedMenit <= 20 ? 1 : 1 + Math.floor(rng() * 3);
        const kats = pickCategories(rng, nKat, hujan && (shift === 2 || shift === 3 || hujanBerat));
        const menits = bagiMenit(rng, unplannedMenit, kats.length);
        const dtTidakTerencana: DowntimeItem[] = kats.map((kat, i) => ({ kategori: kat, menit: menits[i] }));

        const runMenit = Math.max(loadingMenit - dtTidakTerencana.reduce((s, i) => s + i.menit, 0), 0);

        // Performance & quality
        let p = 0.8 + rng() * 0.28; // 0.80 .. 1.08
        if (hujan) p -= 0.06;
        if (unit.tipe === 'Excavator') p += 0.03;
        p = Math.max(p, 0.55);
        const rate = rateMap.get(unit.id) ?? 500;
        const tonaseAktual = Math.round((runMenit / 60) * rate * p);
        const q = 0.95 + rng() * 0.05;
        const tonaseReject = Math.round(tonaseAktual * (1 - q));

        logs.push({
          id: `seed-${unit.id}-${tanggal}-${shift}`,
          tanggal,
          shift,
          unitId: unit.id,
          operator: OPERATOR[(ui * 3 + shift + d) % OPERATOR.length],
          plannedMinutes,
          dtTerencana,
          dtTidakTerencana,
          tonaseAktual,
          tonaseReject,
        });
      }
    });
  }

  logs.sort((a, b) => (a.tanggal === b.tanggal ? b.shift - a.shift : b.tanggal.localeCompare(a.tanggal)));
  return logs;
}
