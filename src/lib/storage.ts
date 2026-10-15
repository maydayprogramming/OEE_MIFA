// Persistensi sederhana ke localStorage browser

import type { Equipment, ShiftLog } from '../types';
import { SEED_UNITS, generateSeedLogs } from './seed';

const LOGS_KEY = 'oee-mifa:logs:v1';
const UNITS_KEY = 'oee-mifa:units:v1';

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // kuota penuh / mode privat — abaikan
  }
}

export function loadUnits(): Equipment[] {
  return readJSON<Equipment[]>(UNITS_KEY) ?? SEED_UNITS.map((u) => ({ ...u }));
}

export function loadLogs(): ShiftLog[] {
  return readJSON<ShiftLog[]>(LOGS_KEY) ?? generateSeedLogs(SEED_UNITS);
}

export function saveUnits(units: Equipment[]): void {
  writeJSON(UNITS_KEY, units);
}

export function saveLogs(logs: ShiftLog[]): void {
  writeJSON(LOGS_KEY, logs);
}

export function resetDemoData(): { units: Equipment[]; logs: ShiftLog[] } {
  const units = SEED_UNITS.map((u) => ({ ...u }));
  const logs = generateSeedLogs(units);
  saveUnits(units);
  saveLogs(logs);
  return { units, logs };
}
