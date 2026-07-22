# iNaedaa Blast

**Smart WhatsApp Campaign Platform** — kelola pengiriman WhatsApp bertahap melalui akun WhatsApp Anda sendiri, dengan dashboard premium, queue yang aman, dan laporan realtime.

![Node](https://img.shields.io/badge/node-%3E%3D18.18-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)

---

## Daftar Isi

1. [Ringkasan](#ringkasan)
2. [Fitur Utama](#fitur-utama)
3. [Tumpukan Teknologi](#tumpukan-teknologi)
4. [Struktur Folder](#struktur-folder)
5. [Instalasi & Menjalankan Secara Lokal](#instalasi--menjalankan-secara-lokal)
6. [Menjalankan dengan Docker](#menjalankan-dengan-docker)
7. [Environment Variables](#environment-variables)
8. [Dokumentasi API](#dokumentasi-api)
9. [Testing](#testing)
10. [Keamanan](#keamanan)
11. [Catatan Penting Tentang WhatsApp](#catatan-penting-tentang-whatsapp)
12. [Dokumen Terkait](#dokumen-terkait)

---

## Ringkasan

iNaedaa Blast adalah aplikasi web **WhatsApp Campaign Manager**. Pengguna login, menghubungkan akun WhatsApp pribadi mereka via QR Code (mirip WhatsApp Web), lalu membuat campaign: import nomor tujuan, unggah media, tulis pesan (dengan variabel personalisasi), atur jeda pengiriman, dan menjalankan campaign sambil memantau progres secara realtime. Semua riwayat pengiriman tersimpan dan dapat diekspor sebagai laporan PDF/Excel.

Arsitektur memisahkan **frontend** (Next.js dashboard), **backend REST + WebSocket API** (Express + Socket.io), dan **WhatsApp Engine** (modul terisolasi berbasis [Baileys](https://github.com/WhiskeySockets/Baileys)) sehingga engine dapat diganti ke penyedia resmi (WhatsApp Business Platform / Cloud API) di masa depan tanpa mengubah frontend.

## Fitur Utama

- **Autentikasi JWT** (access + refresh token, httpOnly cookie) dengan role user/admin.
- **Koneksi WhatsApp via QR Code** — status realtime (connecting/QR pending/connected/reconnecting/logged out), auto-reconnect, sesi terenkripsi AES-256-GCM di disk.
- **Manajemen Campaign** — draft, jalankan, jeda, lanjutkan, batalkan; progres realtime via Socket.io.
- **Import Kontak** — manual paste, TXT, CSV, XLSX, PDF (ekstraksi otomatis); normalisasi nomor Indonesia, deduplikasi, maksimum 1.000 nomor/campaign.
- **Editor Pesan** — format WhatsApp (`*bold*`, `_italic_`, `~strike~`), emoji, variabel `{nama}` `{nomor}` `{tanggal}`, preview bubble chat, counter karakter.
- **Media Manager** — upload gambar/video (maks 50MB), kompresi & thumbnail otomatis.
- **Template Pesan** — kategori Promosi/Reminder/Follow Up/Tagihan/Custom.
- **Pengaturan Pengiriman** — delay acak (preset maupun custom 1–90 detik), batas pesan/jam, retry dengan exponential backoff, **auto-pause otomatis** saat tingkat kegagalan tinggi.
- **History & Report** — pencarian, filter tanggal/status, ekspor PDF & Excel, grafik harian/bulanan, delivery/failure/success rate.
- **Keamanan** — JWT, CSRF (double-submit cookie), rate limiting, audit log, sesi WA terenkripsi, security headers (Helmet).
- **Dokumentasi API lengkap** via Swagger/OpenAPI di `/api/docs`.

## Tumpukan Teknologi

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, lucide-react, Recharts, Zustand |
| Backend | Node.js, Express, TypeScript, Socket.io, Prisma ORM, Zod |
| WhatsApp Engine | Baileys (`@whiskeysockets/baileys`) — koneksi WebSocket murni, tanpa Chromium |
| Database | PostgreSQL 16 |
| Queue & Cache | Redis 7 + BullMQ |
| Storage | Local disk (default) — arsitektur modular siap untuk Supabase Storage |
| Dokumentasi API | Swagger / OpenAPI 3 |
| Kontainerisasi | Docker & docker-compose |

## Struktur Folder

```
inaedaa-blast/
├── apps/
│   ├── api/                     # Backend REST API + WhatsApp Engine + Queue
│   │   ├── prisma/              # schema.prisma, migrations, seed.ts
│   │   └── src/
│   │       ├── config/          # env, logger, prisma client, redis
│   │       ├── docs/            # swagger setup
│   │       ├── middleware/      # auth, csrf, rateLimiter, upload, errorHandler, auditLog
│   │       ├── modules/
│   │       │   ├── auth/
│   │       │   ├── whatsapp/    # Baileys engine, encrypted auth state
│   │       │   ├── campaign/
│   │       │   ├── contact/     # import parsers + normalization
│   │       │   ├── media/
│   │       │   ├── template/
│   │       │   ├── history/     # exports (PDF/Excel)
│   │       │   ├── report/
│   │       │   ├── settings/
│   │       │   └── queue/       # BullMQ queue, worker, scheduler
│   │       ├── sockets/         # Socket.io setup + emit helpers
│   │       ├── routes/          # route aggregator
│   │       ├── __tests__/       # Jest unit tests
│   │       ├── app.ts
│   │       └── server.ts
│   └── web/                     # Frontend dashboard (Next.js)
│       ├── public/              # logo, favicon, manifest
│       └── src/
│           ├── app/             # App Router pages (login, dashboard route group)
│           ├── components/      # ui/, layout/, campaign/, dashboard/, providers/
│           ├── lib/              # apiClient (axios), socket.io client, utils
│           └── store/            # zustand stores (auth, whatsapp, notifications)
├── packages/shared/              # (reserved) shared types between apps
├── docker/                       # Dockerfile.api, Dockerfile.web
├── docs/                         # ERD, ARCHITECTURE, ROADMAP, WIREFRAMES
├── docker-compose.yml
└── .env.example
```

## Instalasi & Menjalankan Secara Lokal

### Prasyarat

- Node.js ≥ 18.18
- PostgreSQL ≥ 14 (atau gunakan Docker — lihat bawah)
- Redis ≥ 6 (atau gunakan Docker)
- npm ≥ 10

> **Catatan:** Kode ini disusun dan ditinjau secara menyeluruh di lingkungan pengembangan yang **tidak memiliki akses ke registry npm** (sandbox tanpa internet ke `registry.npmjs.org`), sehingga `npm install` dan kompilasi TypeScript **belum dapat dijalankan/diverifikasi secara otomatis di lingkungan tersebut**. Jalankan langkah-langkah di bawah ini di komputer/CI Anda yang memiliki akses internet normal untuk instalasi dependency, lalu laporkan jika ada error kompilasi — strukturnya sudah lengkap dan konsisten dengan API resmi tiap library per Juli 2026.

### 1. Clone & install dependency

```bash
npm install
```

Perintah ini akan menginstall dependency untuk seluruh workspace (`apps/api`, `apps/web`) karena project menggunakan npm workspaces.

### 2. Siapkan environment variables

```bash
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
```

Sesuaikan `DATABASE_URL`, `REDIS_URL`, dan seluruh secret (`JWT_*_SECRET`, `COOKIE_SECRET`, `SESSION_ENCRYPTION_KEY`, `CSRF_SECRET`) — **wajib diganti** sebelum produksi.

### 3. Jalankan PostgreSQL & Redis

Opsi termudah — jalankan hanya database via Docker sementara API/Web berjalan native:

```bash
docker compose up -d postgres redis
```

### 4. Migrasi database & seed data awal

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Seed akan membuat akun admin default: `admin@inaedaa.local` / `Admin123!` (override via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).

### 5. Jalankan aplikasi (dev mode)

```bash
npm run dev
```

Ini menjalankan API (port `4000`) dan Web (port `3000`) secara bersamaan. Buka `http://localhost:3000`, login, lalu buka menu **Koneksi WhatsApp** untuk memindai QR Code.

## Menjalankan dengan Docker

Untuk menjalankan seluruh stack (Postgres, Redis, API, Web) sekaligus:

```bash
cp .env.example .env   # sesuaikan secrets terlebih dahulu
docker compose up -d --build
```

Setelah container `api` naik, jalankan migrasi sekali:

```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npm run prisma:seed
```

Akses aplikasi di `http://localhost:3000`, API di `http://localhost:4000`, dan dokumentasi Swagger di `http://localhost:4000/api/docs`.

## Environment Variables

Lihat `.env.example` untuk daftar lengkap. Variabel penting:

| Variabel | Keterangan |
|---|---|
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secret JWT — wajib unik & panjang (≥32 karakter) di produksi |
| `SESSION_ENCRYPTION_KEY` | Kunci untuk mengenkripsi sesi WhatsApp (AES-256-GCM) di disk |
| `CSRF_SECRET` | Secret untuk proteksi CSRF (double-submit cookie) |
| `STORAGE_DRIVER` | `local` (default) atau `supabase` |
| `MAX_MESSAGES_PER_HOUR`, `DEFAULT_MIN_DELAY_SEC`, `DEFAULT_MAX_DELAY_SEC` | Default pengiriman bertahap |
| `AUTO_PAUSE_FAILURE_THRESHOLD` | Ambang batas tingkat kegagalan sebelum campaign otomatis dijeda |

## Dokumentasi API

Setelah backend berjalan, dokumentasi interaktif Swagger tersedia di:

```
http://localhost:4000/api/docs
```

Spesifikasi OpenAPI mentah (JSON) tersedia di `http://localhost:4000/api/docs.json`.

### Realtime (Socket.io)

Client melakukan handshake dengan `auth: { token: <accessToken> }` ke `http://localhost:4000` (path `/socket.io`). Event yang tersedia:

| Event | Arah | Deskripsi |
|---|---|---|
| `whatsapp:status` | server → client | Update status koneksi WA (`status`, `qr`, `phoneNumber`, `profileName`) |
| `campaign:subscribe` / `campaign:unsubscribe` | client → server | Subscribe ke progres campaign tertentu (payload: `campaignId`) |
| `campaign:progress` | server → client | Progres realtime campaign (`percentage`, `sentCount`, `failedCount`, dst.) |
| `notification` | server → client | Toast notifikasi (`type`, `title`, `message`) |

## Testing

```bash
npm run test -w apps/api
```

Mencakup unit test untuk normalisasi nomor Indonesia, penjadwalan delay (`buildDelaySchedule`), dan rendering variabel template. Tambahkan integration test (supertest) untuk endpoint kritikal sebelum go-live produksi.

## Keamanan

- **JWT** access token berumur pendek (15 menit default) + refresh token httpOnly cookie (7 hari), dengan revocation list di database.
- **CSRF** — double-submit cookie pattern (`csrf-csrf`); ambil token dari `GET /api/v1/csrf-token` lalu kirim sebagai header `X-CSRF-Token` pada request state-changing.
- **Rate limiting** — global limiter + limiter khusus lebih ketat untuk endpoint auth & koneksi WhatsApp.
- **Enkripsi sesi WhatsApp** — kredensial Baileys dienkripsi AES-256-GCM sebelum disimpan ke disk (`SESSION_ENCRYPTION_KEY`), bukan implementasi bawaan `useMultiFileAuthState` yang menyimpan plaintext.
- **Audit log** — mencatat login, start/pause/cancel campaign, connect/disconnect WhatsApp, import kontak, dan export laporan.
- **Helmet** untuk security headers, serta validasi input konsisten via Zod di seluruh endpoint.

## Catatan Penting Tentang WhatsApp

iNaedaa Blast **tidak** dan **tidak akan pernah** mengklaim dapat menghindari atau membuat akun WhatsApp kebal terhadap pemblokiran — klaim semacam itu tidak dapat dijamin oleh pihak manapun di luar WhatsApp/Meta. Sebagai gantinya, sistem menerapkan praktik terbaik untuk memperkecil risiko pembatasan akun:

- Antrean pengiriman (queue) dengan pemrosesan satu-per-satu.
- Delay acak antar pesan (dapat dikonfigurasi 1–90 detik).
- Batas maksimal pesan per jam yang dapat diatur pengguna.
- Retry dengan exponential backoff (bukan spam ulang instan).
- **Auto-pause** otomatis ketika tingkat kegagalan melewati ambang batas.
- Monitoring status koneksi & sesi secara realtime.
- Pengiriman bertahap, bukan blast serentak.
- Arsitektur WhatsApp Engine terpisah — siap diganti ke **WhatsApp Business Platform (Cloud API)** resmi tanpa mengubah frontend/backend lainnya.

## Dokumen Terkait

- [`docs/ERD.md`](docs/ERD.md) — Entity Relationship Diagram
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Arsitektur sistem & alur data
- [`docs/WIREFRAMES.md`](docs/WIREFRAMES.md) — Wireframe tekstual tiap halaman
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — Rencana pengembangan lanjutan

---

Dibangun dengan ⚡ oleh tim iNaedaa — *Smart WhatsApp Campaign Platform*.
