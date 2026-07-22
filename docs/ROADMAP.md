# Roadmap Pengembangan — iNaedaa Blast

## v1.0 (MVP — cakupan repositori ini)

- [x] Autentikasi JWT + refresh token
- [x] Koneksi WhatsApp via QR (Baileys), sesi terenkripsi, auto-reconnect
- [x] CRUD Campaign, Contact List, Template, Media
- [x] Import kontak (manual, TXT, CSV, XLSX, PDF) + normalisasi & dedupe nomor Indonesia
- [x] Queue pengiriman (BullMQ) dengan delay acak, rate limit/jam, retry backoff, auto-pause
- [x] Progress realtime via Socket.io
- [x] History + export PDF/Excel
- [x] Report (grafik harian/bulanan, success/failure/delivery rate)
- [x] Swagger/OpenAPI docs
- [x] Docker & docker-compose
- [x] Unit test inti (normalisasi nomor, scheduler, template variable)

## v1.1 — Kualitas & Observability

- [ ] Integration test end-to-end (supertest) untuk seluruh endpoint kritikal
- [ ] E2E test frontend (Playwright) untuk flow: login → connect WA → buat campaign → jalankan
- [ ] Structured logging terpusat (mis. OpenTelemetry / Sentry) untuk error tracking produksi
- [ ] Dashboard admin: monitoring kesehatan sesi WhatsApp lintas user
- [ ] Rate-limit & auto-pause yang dapat dikonfigurasi per jam-operasional (jam kerja saja)

## v1.2 — Kolaborasi & Skala

- [ ] Multi-user per organisasi (tim dengan role Owner/Admin/Member)
- [ ] Multi-sesi WhatsApp per user (mis. beberapa nomor sekaligus)
- [ ] Pisahkan WhatsApp Engine menjadi microservice tersendiri (Redis pub/sub sebagai koordinator), agar API dapat di-scale horizontal tanpa masalah sticky session
- [ ] Worker BullMQ sebagai proses/container terpisah dari API

## v1.3 — Integrasi Resmi

- [ ] Implementasi `IWhatsAppEngine` baru untuk **WhatsApp Business Platform (Cloud API)** resmi — opsional dipilih per user/organisasi
- [ ] Webhook inbound message (auto-reply sederhana, deteksi kata kunci opt-out "STOP")
- [ ] Template message resmi (HSM) untuk kepatuhan WhatsApp Business Platform

## v1.4 — Storage & Media Lanjutan

- [ ] Adapter Supabase Storage penuh (upload langsung dari browser, signed URL)
- [ ] Dukungan dokumen (PDF invoice, dsb.) sebagai lampiran campaign
- [ ] Optimasi video (transcoding) sebelum pengiriman

## v1.5 — Analitik Lanjutan

- [ ] Laporan per-kontak (riwayat pesan per nomor lintas campaign)
- [ ] A/B testing pesan dalam satu campaign
- [ ] Export laporan terjadwal otomatis (email mingguan/bulanan)

## Backlog Ide Lain

- Import kontak dari Google Contacts / CRM eksternal
- Tag & segmentasi kontak
- Penjadwalan campaign (mulai otomatis di waktu tertentu)
- Mode "sandbox" untuk simulasi pengiriman tanpa akun WA nyata (demo/testing)
