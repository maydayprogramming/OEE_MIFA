# OEE MIFA — Aplikasi Monitoring OEE Tambang Batu Bara

Aplikasi web untuk memantau dan menganalisis **Overall Equipment Effectiveness (OEE)** alat berat
pada operasi tambang batu bara: hauling truck, excavator, dozer, wheel loader, crusher, dan drill rig.

![Stack](https://img.shields.io/badge/React_19-Vite_8-Tailwind_4-Recharts-blue)

## Konsep Perhitungan OEE

```
Loading Time = Waktu Rencana Produksi − Downtime Terencana
Run Time     = Loading Time − Downtime Tidak Terencana

Availability = Run Time / Loading Time
Performance  = Produksi Aktual / (Run Time × Target Rate)   ← dibatasi 100% untuk hitungan OEE
Quality      = (Produksi Aktual − Material Reject) / Produksi Aktual

OEE = Availability × Performance × Quality
```

- **Performance** ditampilkan apa adanya di tabel/detail (bisa > 100% saat produksi melampaui
  target rate), tetapi dibatasi 100% saat menghitung OEE agar nilai OEE tetap ≤ 100%.
- Nilai **OEE** dibandingkan dengan target world-class **85%** (ditandai garis putus-putus pada tren).
- Agregasi (harian, per unit, periode) memakai pembobotan benar: jumlah pembilang & penyebut
  dulu, baru rasio — bukan rata-rata rata-rata.

### Kategori downtime

| Terencana | Tidak Terencana |
| --- | --- |
| Istirahat & Sholat | Breakdown Mekanis / Elektris |
| Briefing / Safety Talk | Menunggu Unit Lain / Alat Muat |
| Pengisian BBM | Hujan / Petir |
| Pemeliharaan Terencana (PM) | Jalur Hauling Macet / Rusak |
| Pergantian Shift | Perbaikan Ban |
| Pindah Titik Kerja | Menunggu BBM, Operator Tidak Hadir, Insiden, Lainnya |

## Fitur

- **Dashboard OEE** — kartu KPI (OEE, Availability, Performance, Quality, produksi, downtime),
  gauge OEE vs target 85%, tren harian A/P/Q/OEE, Pareto downtime (analisis 80/20),
  komposisi downtime terencana vs tidak terencana, peringkat OEE per unit.
- **Log Shift** — input/edit/hapus data per shift (tanggal, shift, unit, operator, waktu rencana,
  downtime per kategori, tonase aktual & reject) dengan **pratinjau perhitungan OEE secara live**,
  pencarian, filter, dan **export CSV**.
- **Analisis Downtime** — Pareto penyebab, downtime per unit (top 8), perbandingan per shift,
  rincian kategori (durasi, frekuensi, rata-rata per kejadian), termasuk dampak cuaca.
- **Master Unit** — CRUD data alat berat: tipe, target rate (ton/jam), kapasitas, status aktif,
  beserta OEE periode berjalan.
- **Filter global** — rentang tanggal (preset 7/14 hari), unit, dan shift, berlaku di semua halaman.
- Data tersimpan di **localStorage** browser + **data demo 30 hari** (12 unit × 3 shift)
  yang dibangkitkan secara deterministik.

## Menjalankan Aplikasi

```bash
npm install
npm run dev        # buka http://localhost:5173
```

Perintah lain:

```bash
npm run typecheck  # cek tipe TypeScript
npm run build      # build produksi (hasil di dist/)
npm run preview    # sajikan hasil build
```

## Struktur Proyek

```
src/
├── App.tsx                 # state global, routing halaman, CRUD
├── types.ts                # tipe data: Equipment, ShiftLog, OeeMetrics, Filters
├── data/categories.ts      # kategori downtime + warna chart
├── lib/
│   ├── oee.ts              # mesin perhitungan OEE (per log & agregat)
│   ├── seed.ts             # generator data demo deterministik
│   ├── storage.ts          # persistensi localStorage
│   ├── transform.ts        # agregasi untuk chart/tabel
│   └── format.ts           # format angka, tanggal, durasi (id-ID)
├── components/             # KpiCard, OeeGauge, TrendChart, DowntimePareto,
│                           # UnitRanking, LogForm, LogTable, UnitForm, FilterBar, Sidebar
└── pages/                  # DashboardPage, LogPage, DowntimePage, UnitsPage
```

## Teknologi

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite 8](https://vite.dev) (dev server & build)
- [Tailwind CSS 4](https://tailwindcss.com) (utility-first styling)
- [Recharts](https://recharts.org) (grafik tren, Pareto, bar, pie)
- [Lucide React](https://lucide.dev) (ikon)

## Catatan Implementasi

- Aplikasi ini **client-side penuh** — cocok untuk demo, prototipe, atau penggunaan single-user.
  Untuk produksi multi-user, sambungkan `src/lib/storage.ts` ke API/database
  (struktur data di `src/types.ts` sudah siap dipetakan ke tabel relasional).
- Target rate per unit mengikuti kondisi ideal lapangan; sesuaikan di **Master Unit**.
- Dozer/loader/crusher diperlakukan sama (ton/jam) untuk keseragaman perhitungan;
  untuk alat non-hauling dapat diganti satuan lain pada `targetRate`.
