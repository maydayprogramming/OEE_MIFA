// Transformasi log -> data chart / agregasi

import type { Equipment, OeeMetrics, ShiftLog } from '../types';
import { aggregateMetrics, computeLogMetrics, sumMenit } from './oee';

export interface TrendPoint {
  tanggal: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  tonase: number;
}

export function trendByTanggal(
  logs: ShiftLog[],
  unitMap: Map<string, Equipment>,
): TrendPoint[] {
  const perHari = new Map<string, ShiftLog[]>();
  for (const log of logs) {
    const arr = perHari.get(log.tanggal) ?? [];
    arr.push(log);
    perHari.set(log.tanggal, arr);
  }
  const tanggalList = [...perHari.keys()].sort();
  return tanggalList.map((tanggal) => {
    const entries = perHari.get(tanggal)!.map((log) => ({
      log,
      targetRate: unitMap.get(log.unitId)?.targetRate ?? 0,
    }));
    const m = aggregateMetrics(entries);
    return {
      tanggal,
      oee: m.oee,
      availability: m.availability,
      performance: m.performance,
      quality: m.quality,
      tonase: m.tonaseAktual,
    };
  });
}

export function downtimeByKategori(logs: ShiftLog[], hanyaTidakTerencana = true) {
  const map = new Map<string, number>();
  for (const log of logs) {
    const items = hanyaTidakTerencana
      ? log.dtTidakTerencana
      : [...log.dtTerencana, ...log.dtTidakTerencana];
    for (const item of items) {
      map.set(item.kategori, (map.get(item.kategori) ?? 0) + (Number(item.menit) || 0));
    }
  }
  return [...map.entries()]
    .map(([kategori, menit]) => ({ kategori, menit }))
    .filter((d) => d.menit > 0)
    .sort((a, b) => b.menit - a.menit);
}

export interface UnitRow {
  unit: Equipment;
  metrics: OeeMetrics;
  jumlahLog: number;
}

export function byUnit(
  logs: ShiftLog[],
  units: Equipment[],
  unitMap: Map<string, Equipment>,
): UnitRow[] {
  const perUnit = new Map<string, ShiftLog[]>();
  for (const log of logs) {
    const arr = perUnit.get(log.unitId) ?? [];
    arr.push(log);
    perUnit.set(log.unitId, arr);
  }
  return units
    .filter((u) => perUnit.has(u.id))
    .map((unit) => ({
      unit,
      jumlahLog: perUnit.get(unit.id)!.length,
      metrics: aggregateMetrics(
        perUnit.get(unit.id)!.map((log) => ({
          log,
          targetRate: unitMap.get(log.unitId)?.targetRate ?? 0,
        })),
      ),
    }))
    .sort((a, b) => b.metrics.oee - a.metrics.oee);
}

export function byShift(logs: ShiftLog[], unitMap: Map<string, Equipment>) {
  return [1, 2, 3].map((shift) => {
    const subset = logs.filter((l) => l.shift === shift);
    const dtMenit = subset.reduce(
      (s, l) => s + sumMenit(l.dtTidakTerencana),
      0,
    );
    const m = aggregateMetrics(
      subset.map((log) => ({
        log,
        targetRate: unitMap.get(log.unitId)?.targetRate ?? 0,
      })),
    );
    return { shift: `Shift ${shift}`, downtimeMenit: dtMenit, oee: m.oee, jumlahLog: subset.length };
  });
}

export function rekapDowntime(logs: ShiftLog[]) {
  let unplanned = 0;
  let planned = 0;
  let frekuensi = 0;
  const freqMap = new Map<string, number>();
  for (const log of logs) {
    unplanned += sumMenit(log.dtTidakTerencana);
    planned += sumMenit(log.dtTerencana);
    for (const item of log.dtTidakTerencana) {
      if (item.menit > 0) {
        frekuensi += 1;
        freqMap.set(item.kategori, (freqMap.get(item.kategori) ?? 0) + 1);
      }
    }
  }
  return { unplanned, planned, frekuensi, freqMap };
}

export function metricsOfLogs(
  logs: ShiftLog[],
  unitMap: Map<string, Equipment>,
): OeeMetrics {
  return aggregateMetrics(
    logs.map((log) => ({
      log,
      targetRate: unitMap.get(log.unitId)?.targetRate ?? 0,
    })),
  );
}

export function logMetrics(log: ShiftLog, unitMap: Map<string, Equipment>): OeeMetrics {
  return computeLogMetrics(log, unitMap.get(log.unitId)?.targetRate ?? 0);
}
