# Arsitektur Sistem — iNaedaa Blast

## 1. Gambaran Umum

iNaedaa Blast dibangun dengan tiga lapisan yang dipisahkan secara jelas, agar setiap lapisan dapat berkembang atau diganti secara independen:

```
┌─────────────────────┐      REST API / WebSocket      ┌──────────────────────┐      Baileys (WS)     ┌────────────────┐
│   Frontend (Next.js) │ ──────────────────────────────▶│   Backend (Express)   │ ─────────────────────▶│   WhatsApp      │
│   Dashboard SPA-like │◀────────────────────────────── │   + Socket.io server  │◀───────────────────── │   (multi-device)│
└─────────────────────┘                                 └──────────┬───────────┘                        └────────────────┘
                                                                     │
                                     ┌───────────────────────────────┼───────────────────────────────┐
                                     ▼                                ▼                                ▼
                              ┌────────────┐                  ┌────────────┐                   ┌──────────────┐
                              │ PostgreSQL │                  │   Redis    │                   │  Local Disk   │
                              │  (Prisma)  │                  │  (BullMQ)  │                   │ (uploads/sess)│
                              └────────────┘                  └────────────┘                   └──────────────┘
```

Frontend **tidak pernah** berbicara langsung ke WhatsApp — semua interaksi melalui REST API & Socket.io milik backend. Ini membuat WhatsApp Engine dapat diganti (mis. ke WhatsApp Business Platform / Cloud API resmi) tanpa menyentuh kode frontend.

## 2. Alur Penggunaan End-to-End

1. **Login** → backend menerbitkan access token (JWT, 15 menit) + refresh token (httpOnly cookie, 7 hari).
2. **Hubungkan WhatsApp** → frontend memanggil `POST /whatsapp/connect`; backend memulai sesi Baileys, meng-generate QR, dan mem-broadcast event `whatsapp:status` (berisi QR sebagai data URL) melalui Socket.io ke room `user:{userId}`.
3. **Pilih/Buat Campaign** → frontend memanggil `POST /campaigns` dengan `contactListId`, `messageBody`, opsi delay, dsb. Backend membuat baris `Campaign` + baris `Message` (status `PENDING`) untuk setiap kontak — pesan sudah dipersonalisasi (`{nama}`, `{nomor}`, `{tanggal}`) saat pembuatan.
4. **Jalankan Campaign** → `POST /campaigns/:id/start` menghitung jadwal delay (`buildDelaySchedule`) lalu mendorong setiap pesan sebagai job BullMQ dengan delay kumulatif masing-masing.
5. **Worker memproses job** → `campaign.worker.ts` mengambil job satu per satu (concurrency dapat dikonfigurasi), memanggil `whatsappEngine.sendMessage()`, memperbarui status `Message` & counter `Campaign`, lalu mem-broadcast `campaign:progress` ke room `campaign:{campaignId}`.
6. **Auto-pause & retry** → jika pengiriman gagal, job di-retry dengan exponential backoff (hingga `MAX_RETRY_ATTEMPTS`). Jika tingkat kegagalan melewati `AUTO_PAUSE_FAILURE_THRESHOLD` (setelah sampel minimum), campaign otomatis di-set `PAUSED` dan user diberi notifikasi.
7. **Progress & Laporan** → frontend men-subscribe `campaign:{id}` untuk progress bar realtime; setelah selesai, data tersimpan permanen di `History` dan dapat diekspor ke PDF/Excel.

## 3. WhatsApp Engine — Modularitas

`apps/api/src/modules/whatsapp/whatsapp.types.ts` mendefinisikan interface `IWhatsAppEngine`:

```ts
interface IWhatsAppEngine {
  startSession(userId: string): Promise<void>;
  logoutSession(userId: string): Promise<void>;
  isConnected(userId: string): boolean;
  sendMessage(input: SendMessageInput): Promise<SendMessageResult>;
}
```

Implementasi saat ini (`baileys.engine.ts`) menggunakan [Baileys](https://github.com/WhiskeySockets/Baileys) — library WebSocket murni tanpa Chromium, sehingga jauh lebih ringan dibanding solusi berbasis Puppeteer. Kredensial sesi dienkripsi AES-256-GCM sebelum ditulis ke disk (`authState.ts`), bukan disimpan plaintext seperti implementasi bawaan library.

**Migrasi ke WhatsApp Business Platform (Cloud API) di masa depan** hanya memerlukan class baru yang mengimplementasikan `IWhatsAppEngine` (mis. `cloudApi.engine.ts` yang memanggil REST API resmi Meta), lalu menukar instance yang di-`export`. Tidak ada kode di `campaign.worker.ts`, controller, atau frontend yang perlu diubah.

## 4. Manajemen Queue & Keamanan Pengiriman

- **BullMQ** (di atas Redis) menjadi backbone antrean — setiap pesan adalah satu job dengan `delay` (ms) terhitung dari `buildDelaySchedule()`.
- Fungsi tersebut menghormati dua batasan sekaligus: rentang delay acak (mis. 5–10 detik) **dan** batas pesan/jam (`maxPerHour`) — spacing efektif adalah nilai terbesar dari keduanya.
- **Retry** memakai backoff eksponensial (30s → 60s → 120s → ... maks 10 menit) — bukan retry instan yang berisiko membebani sesi.
- **Auto-pause**: worker mengevaluasi ulang `failedCount / processed` setiap kali sebuah pesan selesai diproses; begitu melewati ambang batas, campaign dihentikan otomatis.
- **Pause/Resume**: pause menghapus job yang masih `delayed`/`waiting` di queue (`drainCampaignJobs`) dan meninggalkan pesan berstatus `PENDING`; resume menghitung ulang jadwal delay dan mendorong ulang job untuk pesan yang tersisa.

## 5. Keamanan

| Lapisan | Mekanisme |
|---|---|
| Autentikasi | JWT access (short-lived) + refresh token httpOnly cookie, revocation list di DB |
| Otorisasi | Middleware `requireAuth` + `requireRole` (role `ADMIN`/`USER`) |
| CSRF | Double-submit cookie (`csrf-csrf`) — token diambil via `GET /csrf-token` |
| Rate limiting | `express-rate-limit` — limiter global + limiter ketat untuk auth & WhatsApp actions |
| Validasi input | Zod schema di setiap endpoint (`validate()` middleware) |
| Enkripsi sesi WA | AES-256-GCM per file kredensial (bukan bawaan library) |
| Audit log | Tabel `audit_logs` mencatat aksi sensitif dengan IP & user agent |
| Header keamanan | Helmet (CSP di production, cross-origin resource policy, dll.) |

## 6. Realtime Layer (Socket.io)

Socket.io di-mount di server HTTP yang sama dengan Express (`server.ts`). Autentikasi dilakukan di level handshake (`io.use`) dengan memverifikasi JWT access token yang dikirim melalui `socket.handshake.auth.token`. Setiap koneksi otomatis join room `user:{userId}`; klien dapat subscribe tambahan ke room `campaign:{campaignId}` untuk menerima progres granular tanpa membanjiri user lain.

## 7. Skalabilitas & Deployment

- API dan Worker BullMQ berjalan dalam proses yang sama pada `server.ts` untuk kesederhanaan MVP; untuk beban tinggi, worker dapat dipisah menjadi proses/container tersendiri (`node dist/modules/queue/campaign.worker.js`) yang terhubung ke Redis yang sama.
- Sesi WhatsApp (Baileys) bersifat **stateful per instance** — jika API di-scale horizontal, gunakan **sticky session** per user atau pindahkan WhatsApp Engine ke service terpisah dengan Redis pub/sub sebagai koordinator (tercantum di roadmap).
- Database PostgreSQL & Redis sebaiknya di-host managed (mis. RDS/Cloud SQL, ElastiCache/Upstash) untuk produksi.
