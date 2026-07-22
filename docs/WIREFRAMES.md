# Wireframe (Tekstual) — iNaedaa Blast

Karena deliverable utama adalah source code yang siap dijalankan, wireframe berikut disajikan sebagai deskripsi layout ASCII per halaman — implementasi visual sesungguhnya ada di `apps/web/src/app`.

## Login

```
┌──────────────────────────────────────────┐
│                [Logo] iNaedaa Blast        │
│            Smart WA Campaign Platform      │
│                                            │
│   Masuk ke akun Anda                       │
│   ┌──────────────────────────────────┐     │
│   │ Email                            │     │
│   └──────────────────────────────────┘     │
│   ┌──────────────────────────────────┐     │
│   │ Password                     👁  │     │
│   └──────────────────────────────────┘     │
│   [   Masuk   →   ]                        │
└──────────────────────────────────────────┘
```

## Dashboard Layout (semua halaman setelah login)

```
┌───────────┬──────────────────────────────────────────────────────┐
│  Sidebar  │  Topbar: Halo, Nama 👋      [WA:Connected] [🔔] [👤]  │
│           ├──────────────────────────────────────────────────────┤
│ Dashboard │                                                       │
│ Campaign  │   [Stat Card] [Stat Card] [Stat Card] [Stat Card]     │
│ Contacts  │   [Stat Card] [Stat Card] [Stat Card] [+ Hubungkan]   │
│ Import No │                                                       │
│ Media     │   Campaign Terbaru ──────────────────────────────    │
│ Template  │   [progress bar campaign 1]                          │
│ History   │   [progress bar campaign 2]                          │
│ Report    │                                                       │
│ ───────── │                                                       │
│ WA Connect│                                                       │
│ Settings  │                                                       │
│ Profile   │                                                       │
│ Logout    │                                                       │
└───────────┴──────────────────────────────────────────────────────┘
```

## Koneksi WhatsApp (QR)

```
┌──────────────────────────────────────────┐
│  Status Perangkat            [QR Active]  │
│                                            │
│              ┌────────────┐               │
│              │  QR CODE   │               │
│              │  (260x260) │               │
│              └────────────┘               │
│   Buka WhatsApp → Perangkat Tertaut →     │
│   Tautkan Perangkat, lalu pindai kode ini  │
│                                            │
│           [ 🔄 Muat Ulang QR ]             │
└──────────────────────────────────────────┘
```

## Buat Campaign (Wizard)

```
① Informasi Campaign        → Nama campaign
② Pilih Daftar Kontak       → Grid pilihan contact list (badge jumlah nomor)
③ Media (opsional)          → Thumbnail grid, klik untuk pilih
④ Tulis Pesan                → Toolbar (Bold/Italic/Strike/List/Emoji/Variabel)
                                Textarea + live preview bubble chat
⑤ Atur Jeda Pengiriman       → Preset chip (1-5s ... 45-90s / Custom)
                                Input Maks Pesan/Jam

                    [ Batal ]   [ ✓ Simpan Campaign ]
```

## Detail Campaign (Realtime Progress)

```
┌──────────────────────────────────────────┐
│  ← Kembali          Nama Campaign  [RUNNING]│
│                                            │
│  Progress Pengiriman                       │
│  65%                     Sedang mengirim.. │
│  ██████████████░░░░░░░░░                  │
│                                            │
│  [Total 500] [Berhasil 320] [Gagal 12] [Skip 0]│
│  Estimasi selesai: 22 Jul 2026, 14:30      │
│                                            │
│  [ ⏸ Jeda ]   [ ⏹ Batalkan ]              │
│                                            │
│  Detail Pesan (bubble preview)             │
└──────────────────────────────────────────┘
```

## History

```
┌──────────────────────────────────────────────────────────────┐
│ [Search] [Date From] [Date To]                                │
│ Campaign | Tanggal | Total | Berhasil | Gagal | Durasi | Status | Export │
│ Promo Juli | 20/07 | 500 | 480 | 12 | 45m | COMPLETED | [xlsx][pdf] │
└──────────────────────────────────────────────────────────────┘
```

## Report

```
[Total Campaign] [Success Rate] [Failure Rate] [Delivery Rate]

Grafik Harian (area chart: Berhasil vs Gagal, 14 hari)
Grafik Bulanan (bar chart: Berhasil vs Gagal, 6 bulan)
```
