# Panduan Deploy — iNaedaa Blast ke `blast.naedaa.online`

Panduan ini untuk deploy iNaedaa Blast secara online memakai **Vercel** (frontend) + **Railway** (backend, database, Redis), sampai domain `blast.naedaa.online` bisa dipakai sungguhan.

Total waktu: sekitar 45–60 menit untuk yang baru pertama kali.

---

## Ringkasan Arsitektur Deploy

```
blast.naedaa.online          → Vercel (Frontend Next.js)
api.blast.naedaa.online      → Railway (Backend Express + Socket.io)
                                 └─ PostgreSQL (Railway addon)
                                 └─ Redis (Railway addon)
                                 └─ Volume /data (sesi WhatsApp + upload media)
```

---

## Bagian 1 — Push Kode ke GitHub

1. Extract folder `inaedaa-blast` yang sudah didownload (kalau belum).
2. Buka folder itu di terminal (klik kanan → Open in Terminal / Open PowerShell here).
3. Karena repo `blast` yang sudah ada isinya beda project (situs statis GitHub Pages), sebaiknya **hapus dulu isi lama repo tersebut dari GitHub** (lewat halaman repo → Settings → paling bawah ada opsi hapus repo, lalu buat baru dengan nama sama — cara paling bersih), ATAU buat repo baru khusus.
4. Jalankan di terminal, di dalam folder `inaedaa-blast`:

   ```bash
   git init
   git add .
   git commit -m "Initial commit - iNaedaa Blast"
   git branch -M main
   git remote add origin https://github.com/Aureliastore1/blast.git
   git push -u origin main
   ```

   Kalau muncul error "remote already exists" atau "failed to push" karena repo lama masih ada isinya, jalankan `git push -u origin main --force` (ini akan **mengganti total** isi repo lama — pastikan Anda memang sudah tidak butuh `CNAME`/`index.html` yang lama).

5. Setelah berhasil push, matikan GitHub Pages di repo ini (Settings → Pages → Source: None) karena kita tidak pakai GitHub Pages lagi — supaya tidak bentrok.

---

## Bagian 2 — Deploy Backend ke Railway

1. Daftar/login di [railway.app](https://railway.com) pakai akun GitHub Anda.
2. Klik **New Project → Deploy from GitHub repo** → pilih repo `blast`.
3. Railway akan minta konfigurasi service. Atur:
   - **Root Directory**: kosongkan / biarkan `/` (root repo) — karena Dockerfile backend butuh akses ke seluruh monorepo.
   - **Builder**: pilih **Dockerfile**.
   - **Dockerfile Path**: `docker/Dockerfile.api`
4. Buka tab **Variables** di service ini, tambahkan semua environment variable dari file `.env.example` di project Anda. Yang paling penting untuk diganti (jangan pakai nilai contoh, buat sendiri yang acak/panjang):
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`, `SESSION_ENCRYPTION_KEY`, `CSRF_SECRET` — isi masing-masing dengan string acak panjang (bisa generate di [randomkeygen.com](https://randomkeygen.com))
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://blast.naedaa.online`
   - `APP_URL=https://blast.naedaa.online`
   - `API_URL=https://api.blast.naedaa.online`
   - `UPLOAD_DIR=/data/uploads`
   - `WA_SESSION_DIR=/data/sessions`
   - `PORT=4000`
5. Tambah database: di project Railway yang sama, klik **New → Database → Add PostgreSQL**. Railway otomatis membuat variabel `DATABASE_URL` — copy nilainya (atau reference otomatis) ke Variables service backend Anda dengan nama `DATABASE_URL`.
6. Tambah Redis: klik **New → Database → Add Redis**. Sama seperti di atas, copy connection string-nya ke variabel `REDIS_URL` di service backend.
7. Tambah **Volume** supaya sesi WhatsApp & file upload tidak hilang tiap kali redeploy: buka service backend → tab **Settings → Volumes → New Volume** → mount path isi `/data`.
8. Buka tab **Settings → Networking** di service backend → klik **Generate Domain** dulu untuk dapat URL sementara (`xxxx.up.railway.app`), pastikan aplikasi jalan (cek log di tab **Deployments**).
9. Setelah backend jalan, jalankan migrasi database. Di Railway, buka service backend → tab **Settings** cari opsi **Deploy → Custom Start Command**, atau paling mudah pakai Railway CLI dari komputer Anda:
   ```bash
   npm install -g @railway/cli
   railway login
   railway link          # pilih project yang tadi dibuat
   railway run --service <nama-service-backend> npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
   railway run --service <nama-service-backend> node -e "require('child_process').execSync('npm run prisma:seed -w apps/api', {stdio:'inherit'})"
   ```
   (Kalau perintah di atas terasa rumit, beri tahu saya — saya bisa bantu sesuaikan.)

---

## Bagian 3 — Deploy Frontend ke Vercel

1. Daftar/login di [vercel.com](https://vercel.com) pakai akun GitHub Anda.
2. **Add New → Project** → pilih repo `blast`.
3. Saat konfigurasi:
   - **Root Directory**: klik Edit, pilih `apps/web`
   - **Framework Preset**: Next.js (biasanya otomatis terdeteksi)
4. Tambahkan Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://api.blast.naedaa.online`
   - `NEXT_PUBLIC_SOCKET_URL=https://api.blast.naedaa.online`
   - `NEXT_PUBLIC_APP_NAME=iNaedaa Blast`
5. Klik **Deploy**. Tunggu sampai selesai — nanti dapat URL sementara `xxxx.vercel.app`, coba buka dulu untuk memastikan tampilan muncul (walau belum bisa login karena domain API belum disambungkan CORS-nya secara final — itu wajar di tahap ini).

---

## Bagian 4 — Sambungkan Domain `blast.naedaa.online`

Anda perlu masuk ke pengaturan DNS domain `naedaa.online` (di tempat Anda beli/kelola domain — misalnya Niagahoster, Cloudflare, dsb).

**Untuk frontend (Vercel):**
1. Di Vercel, buka project → **Settings → Domains** → tambahkan `blast.naedaa.online`.
2. Vercel akan kasih instruksi record DNS yang perlu ditambahkan (biasanya CNAME mengarah ke `cname.vercel-dns.com`). Hapus dulu record `CNAME` lama yang mengarah ke GitHub Pages, ganti dengan yang dari Vercel.

**Untuk backend (Railway):**
1. Di Railway, buka service backend → **Settings → Networking → Custom Domain** → masukkan `api.blast.naedaa.online`.
2. Railway akan kasih target CNAME (biasanya `xxxx.up.railway.app`). Tambahkan record CNAME baru di DNS Anda: `api.blast` → target dari Railway.

DNS biasanya aktif dalam beberapa menit sampai beberapa jam.

---

## Bagian 5 — Sinkronkan CORS & Tes

1. Pastikan variabel `CORS_ORIGIN` di Railway sudah persis `https://blast.naedaa.online` (tanpa garis miring di akhir).
2. Buka `https://blast.naedaa.online` — coba login pakai akun admin dari seed (`admin@inaedaa.local`).
3. Buka menu **Koneksi WhatsApp**, pastikan QR Code muncul (ini tandanya koneksi backend + Socket.io berhasil).
4. Scan QR pakai WhatsApp di HP untuk memastikan koneksi benar-benar jalan.

---

## Troubleshooting Cepat

| Gejala | Kemungkinan Penyebab |
|---|---|
| Halaman putih / gagal load | Cek env `NEXT_PUBLIC_API_URL` di Vercel sudah benar |
| Login gagal terus | Cek `CORS_ORIGIN` di Railway match persis domain frontend |
| QR Code tidak muncul | Cek log service backend di Railway, pastikan `REDIS_URL` & `DATABASE_URL` terisi benar |
| Setelah redeploy harus scan QR ulang terus | Volume `/data` belum ter-mount dengan benar di Railway |

---

Kalau ada langkah yang error atau bingung di tengah jalan, kirim screenshot error-nya — saya bantu telusuri.
