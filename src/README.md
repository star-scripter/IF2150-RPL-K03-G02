# SoClean

SoClean adalah aplikasi web untuk melaporkan dan membersihkan pencemaran sampah di wilayah kerja sama (Sungai Cikapundung di Bandung, Pantai Ancol, dan Pantai Pangandaran). Masyarakat melaporkan lokasi tercemar lewat **ReportIt**, membersihkannya lewat **CleanIt**, lalu mendapat poin yang bisa ditukar dengan reward. Operator memverifikasi setiap laporan sebelum lokasi dipetakan atau poin diberikan.

Aplikasi ini adalah hasil Tugas Besar IF2150 Rekayasa Perangkat Lunak kelompok K-03/G-02 (*DapinKoding*). Dokumen perancangan ada di `docs/`, dan kontrak implementasi FE–BE ada di `docs/contracts/`.

## Daftar isi

1. [Teknologi](#1-teknologi)
2. [Prasyarat dan instalasi](#2-prasyarat-dan-instalasi)
3. [Konfigurasi](#3-konfigurasi)
4. [Menjalankan aplikasi dan test](#4-menjalankan-aplikasi-dan-test)
5. [Akun uji](#5-akun-uji)
6. [Modul, fitur, dan pembagian anggota](#6-modul-fitur-dan-pembagian-anggota)
7. [Tabel basis data](#7-tabel-basis-data)
8. [Struktur folder](#8-struktur-folder)

## 1. Teknologi

| Bagian | Teknologi | Versi |
| --- | --- | --- |
| Bahasa | TypeScript | 5.9.3 |
| Runtime | Node.js | 22 (image `node:22-alpine`) |
| Framework web (FE + BE) | Next.js (App Router), React | 16.4.5, 19.3.0 |
| Styling | Tailwind CSS | 4.3.4 |
| Peta | Leaflet, React Leaflet (OpenStreetMap) | 1.9.4, 5.0.0 |
| Basis data | PostgreSQL | 18 (image `postgres:18`) |
| ORM dan migrasi | Drizzle ORM, Drizzle Kit, node-postgres (`pg`) | 0.45.4, 0.31.11, 8.23.1 |
| Validasi request | Zod | 4.6.7 |
| Auth | `jose` (JWT HS256 di cookie `httpOnly`), `bcryptjs` | 6.2.15, 3.0.3 |
| Penyimpanan media | API S3 (`@aws-sdk/client-s3`): RustFS di lokal, Cloudflare R2 di produksi | SDK 3.1164.0, RustFS 1.0.4 |
| Pemrosesan gambar | `sharp` (watermark foto) | 0.35.5 |
| Test | Vitest, MSW (mock API untuk FE) | 5.1.0, 3.0.4 |
| Kontainer | Docker dan Docker Compose | — |

Versi di atas sesuai `src/so-clean/package-lock.json` dan `src/compose.yaml`.

## 2. Prasyarat dan instalasi

Yang perlu terpasang:

- **Git**.
- **Docker Engine dengan Docker Compose v2** (perintah `docker compose`). Di Windows, jalankan Docker di WSL 2 (Docker Desktop dengan integrasi WSL, atau Docker Engine di dalam WSL) dan jalankan semua perintah di bawah dari terminal WSL.
- **Node.js 22 dan npm** hanya jika ingin menjalankan lint/test langsung di host. Untuk menjalankan aplikasi, Node.js tidak diperlukan karena semuanya berjalan di Docker.

Ambil kode:

```bash
git clone https://github.com/star-scripter/IF2150-RPL-K03-G02.git
cd IF2150-RPL-K03-G02/src
```

Dependensi npm dipasang otomatis saat image Docker dibangun (`npm ci`), jadi tidak ada langkah instalasi terpisah.

## 3. Konfigurasi

### Environment variable

Salin contoh konfigurasi. Nilai bawaannya sudah cukup untuk menjalankan aplikasi di lokal:

```bash
cp .env.example .env
```

| Variabel | Kegunaan | Nilai bawaan (lokal) |
| --- | --- | --- |
| `APP_PORT` | Port aplikasi di host | `3000` |
| `DB_HOST_PORT` | Port PostgreSQL di host (hanya mode development) | `5432` |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Kredensial dan nama database | `soclean_user`, `s0Clean2026!`, `soclean_dev` |
| `POSTGRES_HOST`, `POSTGRES_PORT` | Alamat database dari dalam kontainer | `db`, `5432` |
| `SESSION_SECRET` | Kunci tanda tangan cookie sesi (JWT HS256) | nilai development; buat baru untuk produksi (`openssl rand -base64 32`) |
| `S3_ENDPOINT` | Endpoint S3 yang dipakai server (dari dalam Docker) | `http://rustfs:9000` |
| `S3_PUBLIC_ENDPOINT` | Host yang dimasukkan ke presigned URL media; harus bisa dibuka browser | `http://localhost:9000` |
| `S3_REGION`, `S3_BUCKET`, `S3_FORCE_PATH_STYLE` | Pengaturan bucket | `us-east-1`, `soclean-media`, `true` |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Kredensial RustFS/R2 | kredensial RustFS lokal |
| `RUSTFS_HOST_PORT`, `RUSTFS_CONSOLE_HOST_PORT` | Port RustFS (API dan konsol) di host | `9000`, `9001` |

File `.env` tidak di-commit. Jika port 3000, 5432, 9000, atau 9001 sudah dipakai program lain, ubah variabel port di atas (dan sesuaikan `S3_PUBLIC_ENDPOINT` jika `RUSTFS_HOST_PORT` diubah).

### Basis data dan penyimpanan

Docker Compose menjalankan tiga layanan: `web` (Next.js), `db` (PostgreSQL 18), dan `rustfs` (penyimpanan S3 lokal). Bucket `soclean-media` dibuat otomatis saat RustFS pertama kali berjalan. Tabel dibuat lewat migrasi Drizzle (`src/so-clean/server/db/migrations/`), dan data contoh diisi lewat seed. Kedua langkah itu ada di bagian 4.

## 4. Menjalankan aplikasi dan test

Semua perintah dijalankan dari folder `src/`.

### Menjalankan (mode development)

```bash
docker compose up -d --build                 # 1. bangun image dan jalankan web, db, rustfs
docker compose exec web npm run db:migrate   # 2. buat tabel (jalankan juga setiap ada migrasi baru)
docker compose exec web npm run db:seed      # 3. isi data contoh fiktif dan akun uji
```

Lalu buka:

- Aplikasi: <http://localhost:3000> (login dengan akun di bagian 5)
- Konsol RustFS: <http://localhost:9001> (login dengan `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`)

Catatan:

- `db:seed` **menghapus semua data** lalu mengisi ulang data contoh. Seed juga mengunggah gambar placeholder ke RustFS; jika RustFS belum siap, media dilewati dengan peringatan dan data lain tetap terisi.
- Mode development memakai `next dev` dengan hot reload: perubahan kode di `src/so-clean/` langsung terlihat.
- Setelah `package.json` berubah, bangun ulang dengan `docker compose up -d --build --renew-anon-volumes`.
- Menghentikan: `docker compose down` (data tetap ada) atau `docker compose down -v` (data database dan RustFS ikut dihapus).
- Mode produksi (`COMPOSE_FILE=compose.yaml`, build standalone dengan Cloudflare R2) dijelaskan di komentar `src/.env.example` dan `src/compose.yaml`; README ini hanya membahas mode development.

### Menjalankan test

```bash
docker compose exec web npm test                                   # unit test; test integrasi di-skip
docker compose exec -e POSTGRES_DB=soclean_test web npm test       # semua test, termasuk integrasi
docker compose exec web npm run lint                               # ESLint
docker compose exec web npx tsc --noEmit                           # typecheck
```

Test integrasi memakai PostgreSQL sungguhan di **database terpisah** `soclean_test`, yang dibuat dan dimigrasi otomatis; `soclean_dev` tidak pernah disentuh. Test integrasi hanya berjalan jika `POSTGRES_DB` berakhiran `_test`, karena setiap test mengosongkan tabel. Test ada di `src/so-clean/tests/` (Vitest).

Untuk menjalankan lint/test di host (tanpa Docker), pasang dependensi dulu dengan `npm ci` di `src/so-clean/`, lalu `npm test` dan `npm run lint`; test integrasi akan di-skip.

Profiling query (BE-26, hasilnya di B.2.1 laporan M9) dijalankan dengan `docker compose exec -e POSTGRES_DB=soclean_test web npm run db:profil`. Skrip ini juga mengosongkan `soclean_test`.

## 5. Akun uji

Dibuat oleh `npm run db:seed`. Password semua akun: **`soclean123`**. Semua data seed fiktif.

| Email | Peran | Kondisi untuk dicoba |
| --- | --- | --- |
| `operator@soclean.test` | Operator | Memverifikasi laporan di antrean (ReportIt dan CleanIt) |
| `operator2@soclean.test` | Operator | Uji dua Operator memverifikasi laporan yang sama (`SUDAH_DIVERIFIKASI`) |
| `budi@soclean.test` | Masyarakat | Saldo 100, punya riwayat penukaran, dan satu notifikasi penolakan CleanIt yang belum dibaca |
| `sari@soclean.test` | Masyarakat | Saldo 50, pelapor asal lokasi yang sedang dibersihkan orang lain |
| `andi@soclean.test` | Masyarakat | Saldo 0 (tombol "Kurang" di Hadiah), membersihkan lokasi laporannya sendiri (tanda "Pelapor = Relawan") |

Data seed lainnya: 5 reward (satu stok 0 untuk tampilan "Habis"), 7 lokasi di ketiga wilayah, serta antrean Operator berisi 3 ReportIt (satu berjarak ±30 m dari lokasi yang ada, untuk mencoba penggabungan lokasi) dan 3 CleanIt (dua untuk lokasi yang sama). Akun Operator hanya dibuat lewat seed; registrasi selalu menghasilkan akun Masyarakat.

## 6. Modul, fitur, dan pembagian anggota

### Fitur

| Fitur | Use case | Halaman | Endpoint utama |
| --- | --- | --- | --- |
| Registrasi, login, logout, sesi | Auth (US-03) | `/register`, `/login` | `/api/auth/*`, `GET /api/me` |
| Laporan pencemaran (ReportIt) dengan peta, GPS, dan unggah foto/video | UC01, UC02 | `/reportit` | `POST /api/media`, `POST /api/laporan` |
| Draf laporan offline (isian teks) | KNF, SKPL 2.4 | `/reportit` | — |
| Daftar dan detail lokasi tercemar | UC04 | `/lokasi`, `/lokasi/[idLokasi]` | `GET /api/lokasi`, `GET /api/lokasi/:id` |
| Laporan pembersihan (CleanIt) | UC05 | `/cleanit/[idLokasi]` | `POST /api/media`, `POST /api/laporan` |
| Verifikasi ReportIt dan CleanIt oleh Operator (setujui/tolak, penggabungan lokasi 50 m, pemberian poin) | UC03, UC06 | `/operator/laporan` | `GET /api/laporan`, `GET /api/laporan/:id`, `POST /api/laporan/:id/setujui`, `POST /api/laporan/:id/tolak` |
| Saldo poin dan katalog reward | UC07, UC08 | `/beranda`, `/hadiah` | `GET /api/me` (Beranda), `GET /api/poin/saldo`, `GET /api/reward` |
| Penukaran poin dan riwayat penukaran | UC09 | `/hadiah`, `/hadiah/berhasil`, `/hadiah/riwayat` | `POST /api/penukaran`, `GET /api/penukaran` |
| Profil dan notifikasi hasil verifikasi | — | `/profil`, `/operator/profil` | `GET /api/notifikasi`, `POST /api/notifikasi/dibaca` |

### Pembagian anggota

| Paket | Anggota | Tugas | Isi |
| --- | --- | --- | --- |
| FE-A | Jovan Nathanael (13525087) | FE-01–FE-08, FE-13 | Fondasi FE, komponen UI, layout dan navigasi, API client dan mock, auth guard, Login, Register, Beranda, draf offline |
| FE-B | Justin William (13525042) | FE-09–FE-12, FE-14–FE-17 | Form ReportIt dan CleanIt (sisi Masyarakat), daftar dan detail lokasi |
| FE-C | Faishal Ahmad Nurdin (13525027) | FE-18–FE-26 | Hadiah dan penukaran, halaman validasi dan detail laporan Operator, Profil, responsif, uji end-to-end UI |
| BE-A | M. Aqsha Bagus R.I.B. (13525060) | BE-01, BE-02, BE-04–BE-11 | Docker Compose, skema dan migrasi, helper API, auth dan sesi, cek role, storage S3, unggah media, validasi dan pembuatan laporan |
| BE-B | Muhammad Dhafin Al Khairy (13525147) | BE-03, BE-12–BE-26 | Seed, daftar/detail dan verifikasi laporan, lokasi, saldo poin, reward, penukaran, notifikasi, testing, profiling |

Rincian kontribusi ada di B.4 `docs/M9/K03_G02_Implementasi.md`, dan pembagian tugas lengkap di kontrak `docs/contracts/`.

## 7. Tabel basis data

Enam tabel PostgreSQL, didefinisikan di `src/so-clean/server/db/schema/` (satu file per tabel) dan dibuat oleh migrasi `0000`–`0003`. Semua kolom `NOT NULL` kecuali bertanda *null*; waktu bertipe `timestamptz`.

**`pengguna`**: akun Masyarakat dan Operator

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | `uuid` | PK, dibuat otomatis |
| `nama` | `varchar(100)` | |
| `email` | `varchar(255)` | unik |
| `password_hash` | `varchar(255)` | hash bcrypt |
| `role` | enum `MASYARAKAT` \| `OPERATOR` | default `MASYARAKAT` |
| `saldo_poin` | `integer` | default 0, `CHECK ≥ 0` |
| `notifikasi_dilihat_at` | `timestamptz`, *null* | batas notifikasi yang sudah dibaca |

**`laporan`**: ReportIt dan CleanIt

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | `serial` | PK |
| `jenis` | enum `REPORTIT` \| `CLEANIT` | |
| `id_pengguna` | `uuid` | FK → `pengguna`, pelapor |
| `judul` | `varchar(80)` | |
| `waktu_kejadian` | `timestamptz` | waktu kejadian atau pembersihan |
| `lokasi_teks`, `latitude`, `longitude` | `varchar(255)`, `double precision`, *null* | khusus ReportIt |
| `sumber`, `jenis_sampah` | enum, *null* | khusus ReportIt |
| `lokasi_id` | `integer`, *null* | FK → `lokasi`; wajib untuk CleanIt, diisi saat ReportIt disetujui |
| `status` | enum `BELUM_DIPERIKSA` \| `VALID` \| `TIDAK_VALID` | default `BELUM_DIPERIKSA` |
| `alasan_penolakan` | `text`, *null* | wajib jika CleanIt ditolak |
| `diverifikasi_oleh`, `diverifikasi_at` | `uuid` FK → `pengguna`, `timestamptz`, *null* | terisi saat diverifikasi |
| `created_at` | `timestamptz` | waktu laporan masuk |

Constraint: field per jenis laporan, konsistensi status–verifikasi, alasan wajib untuk CleanIt ditolak, rentang koordinat. Index: antrean Operator (`jenis`, `status`, `created_at`), notifikasi (`id_pengguna`, `diverifikasi_at`), `lokasi_id`, dan unique index parsial "satu CleanIt menunggu per pengguna per lokasi".

**`lokasi`**: lokasi pencemaran hasil ReportIt yang disetujui

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | `serial` | PK |
| `nama`, `alamat` | `varchar(255)` | |
| `latitude`, `longitude` | `double precision` | |
| `jenis_sampah` | enum | |
| `status` | enum `TERCEMAR` \| `DIBERSIHKAN` | default `TERCEMAR` |
| `poin` | `integer` | default 50, `CHECK IN (50, 100, 200)` |
| `laporan_asal_id` | `integer` | FK → `laporan` (ReportIt asal) |
| `created_at` | `timestamptz` | |

Index: `status`, dan index parsial (`latitude`, `longitude`) untuk lokasi `TERCEMAR` (pencarian radius 50 m).

**`media`**: foto/video bukti laporan

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | `serial` | PK |
| `id_pengguna` | `uuid` | FK → `pengguna`, pengunggah |
| `laporan_id` | `integer`, *null* | FK → `laporan`; terisi saat laporan dibuat |
| `storage_key` | `varchar(255)` | unik, key objek di RustFS/R2 (bukan URL) |
| `tipe` | enum `FOTO` \| `VIDEO` | |
| `ukuran_byte` | `integer` | `CHECK > 0` |
| `sha256` | `char(64)` | hash file asli, untuk menolak media yang dipakai ulang |
| `created_at` | `timestamptz` | waktu unggah |

**`reward`**: katalog reward (dummy)

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | `serial` | PK |
| `nama` | `varchar(100)` | |
| `jenis` | `varchar(50)` | |
| `deskripsi` | `text`, *null* | |
| `harga_poin` | `integer` | `CHECK > 0` |
| `stok` | `integer` | default 0, `CHECK ≥ 0` |

**`penukaran`**: transaksi penukaran poin

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | `uuid` | PK, dibuat otomatis |
| `id_pengguna` | `uuid` | FK → `pengguna` |
| `id_reward` | `integer` | FK → `reward` |
| `poin_dipakai` | `integer` | `CHECK > 0` |
| `kode_voucher` | `varchar(32)` | unik, format `SC-XXXX-XXXX` (dummy) |
| `waktu` | `timestamptz` | default `now()` |

Notifikasi tidak punya tabel sendiri: isinya diturunkan dari laporan yang sudah diverifikasi dan `pengguna.notifikasi_dilihat_at`. Skema lengkap beserta keputusan desainnya ada di bagian "Skema database" kontrak `docs/contracts/`.

## 8. Struktur folder

```text
src/
├── compose.yaml              # layanan web + db (dipakai juga di produksi)
├── compose.override.yaml     # tambahan development: next dev, RustFS, port database
├── .env.example              # contoh konfigurasi (salin ke .env)
└── so-clean/                 # proyek Next.js
    ├── app/(pages)/          # halaman (View)
    ├── app/api/              # route handler API
    ├── components/           # komponen UI dan kelas view DPPL
    ├── server/               # backend: controllers/, models/, db/ (schema, migrasi, seed), auth/, storage/
    ├── lib/                  # kode bersama FE–BE tanpa akses database
    ├── types/api.ts          # tipe kontrak API bersama FE–BE
    └── tests/                # test Vitest
```

Aturan antar-layer (MVC) dan konvensi penamaan dijelaskan di [`so-clean/STRUKTUR.md`](so-clean/STRUKTUR.md).
