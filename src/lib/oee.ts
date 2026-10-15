// Mesin perhitungan OEE untuk konteks pertambangan
//
// Availability  = Run Time / Loading Time
// Performance   = Aktual / (Run Time x Target Rate)   [dibatasi 100% untuk OEE]
// Quality       = (Aktual - Reject) / Aktual
// OEE           = Availability x Performance x Quality
//
// Loading Time  = Waktu Rencana - Downtime Terencana
// Run Time      = Loading Time - Downtime Tidak Terencana

import type { DowntimeItem, OeeMetrics, ShiftLog } from '../types';

export function sumMenit(items: DowntimeItem[]): number {
  return items.reduce((s, i) => s + (Number(i.menit) || 0), 0);
}

export function computeLogMetrics(log: ShiftLog, targetRate: number): OeeMetrics {
  const dtTercMenit = sumMenit(log.dtTerencana);
  const dtUnplannedMenit = sumMenit(log.dtTidakTerencana);
  const plannedMenit = Math.max(Number(log.plannedMinutes) || 0, 0);
  const loadingMenit = Math.max(plannedMenit - dtTercMenit, 0);
  const runMenit = Math.max(loadingMenit - dtUnplannedMenit, 0);

  const availability = loadingMenit > 0 ? runMenit / loadingMenit : 0;

  const rate = Number(targetRate) || 0;
  const expectedTon = (runMenit / 60) * rate;
  const tonaseAktual = Math.max(Number(log.tonaseAktual) || 0, 0);
  const tonaseReject = Math.min(
    Math.max(Number(log.tonaseReject) || 0, 0),
    tonaseAktual,
  );

  const performanceRaw = expectedTon > 0 ? tonaseAktual / expectedTon : 0;
  const performance = Math.min(performanceRaw, 1);
  const quality = tonaseAktual > 0 ? (tonaseAktual - tonaseReject) / tonaseAktual : 0;

  return {
    plannedMenit,
    dtTercMenit,
    dtUnplannedMenit,
    loadingMenit,
    runMenit,
    expectedTon,
    tonaseAktual,
    tonaseReject,
    availability,
    performance,
    performanceRaw,
    quality,
    oee: availability * performance * quality,
  };
}

export interface MetricEntry {
  log: ShiftLog;
  targetRate: number;
}

/** Agregasi benar (weighted): jumlahkan pembilang & penyebut dulu, baru hitung rasio. */
export function aggregateMetrics(entries: MetricEntry[]): OeeMetrics {
  const total = {
    plannedMenit: 0,
    dtTercMenit: 0,
    dtUnplannedMenit: 0,
    loadingMenit: 0,
    runMenit: 0,
    expectedTon: 0,
    tonaseAktual: 0,
    tonaseReject: 0,
  };

  for (const { log, targetRate } of entries) {
    const m = computeLogMetrics(log, targetRate);
    total.plannedMenit += m.plannedMenit;
    total.dtTercMenit += m.dtTercMenit;
    total.dtUnplannedMenit += m.dtUnplannedMenit;
    total.loadingMenit += m.loadingMenit;
    total.runMenit += m.runMenit;
    total.expectedTon += m.expectedTon;
    total.tonaseAktual += m.tonaseAktual;
    total.tonaseReject += m.tonaseReject;
  }

  const availability = total.loadingMenit > 0 ? total.runMenit / total.loadingMenit : 0;
  const performanceRaw = total.expectedTon > 0 ? total.tonaseAktual / total.expectedTon : 0;
  const performance = Math.min(performanceRaw, 1);
  const quality =
    total.tonaseAktual > 0
      ? (total.tonaseAktual - total.tonaseReject) / total.tonaseAktual
      : 0;

  return {
    ...total,
    availability,
    performance,
    performanceRaw,
    quality,
    oee: availability * performance * quality,
  };
}

export type OeeBand = 'baik' | 'sedang' | 'kritis';

export function oeeBand(oee: number): OeeBand {
  if (oee >= 0.85) return 'baik';
  if (oee >= 0.7) return 'sedang';
  return 'kritis';
}

export const OEE_TARGET = 0.85; // standar world-class
