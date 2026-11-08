# SoClean — Pembagian Tugas FE & BE

Nov 4, 2026 · @Man · diperbarui Nov 8, 2026 (v0.6)

> **Dokumen ini menggantikan kontrak v0.5** (`SoClean — Pembagian Tugas FE & BE.md` di folder yang sama, dibiarkan apa adanya sebagai arsip). Mulai v0.6, kontrak inilah **satu-satunya acuan implementasi**. Jika DPPL2 (M8) berbeda dengan dokumen ini, ikuti dokumen ini; setiap perbedaannya tercatat di Tabel B.1 laporan M9.

## Ringkasan

Pekerjaan SoClean dibagi menjadi 26 tugas Frontend (FE) dan 26 tugas Backend (BE), diturunkan dari DPPL (UC01–UC09, kelas C01–C16, antarmuka I-01–I-13). Pembagiannya mengikuti MVC: **View → FE**, sedangkan **Controller + Model + Database/Storage → BE**.

- **Stack:** Next.js 16.4 (TypeScript, React 19.3, Tailwind CSS 4) full-stack di Node.js 22, PostgreSQL 18, Cloudflare R2 (di lokal diganti RustFS, lihat BE-01 dan BE-07), Docker.
- **Batas FE/BE:** FE hanya memanggil API pada bagian Kontrak Awal. FE tidak mengakses database atau R2 secara langsung.
- **Struktur folder:** proyek sudah di-init di `src/so-clean/` (Next.js 16.4.5, alias `@/*` ke root proyek). FE di `app/(pages)/` dan `components/`; BE di `app/api/**/route.ts`, `server/controllers/`, `server/models/`, dan `server/db/`; kode bersama FE dan BE di `lib/` (misalnya `lib/wilayah.ts`); test di `tests/`. Nama file controller dan model mengikuti kelas DPPL (misalnya `server/models/laporan.ts` untuk C02) supaya tabel traceability B.5 mudah diisi.
- **ID tugas:** `FE-xx` atau `BE-xx`. Estimasi memakai ukuran S (≤ 0,5 hari), M (1–2 hari), dan L (3+ hari).
- **Kolom Butuh:** tugas yang harus selesai (atau minimal kontraknya disepakati) sebelum tugas tersebut bisa diselesaikan. Selama BE belum siap, FE bisa memakai mock data sesuai kontrak.

## Keputusan yang sudah disepakati

### K1–K13

Tiga belas hal berikut belum dijelaskan atau saling bertentangan di dokumen M1–M8 (acuan utama: DPPL2 di M8). K1–K6 berasal dari DPPL; K7–K11 dari cek silang mockup I-01–I-13, SKPL (M5), dan dokumen M1–M2; K12–K13 dari review soal proses bersamaan dan duplikasi. Semuanya sudah diputuskan dan dipakai di kontrak di bawah.

| No | Celah di DPPL | Keputusan |
| --- | --- | --- |
| K1 | Laporan CleanIt tidak menyimpan lokasi mana yang dibersihkan | Kolom `lokasi_id` (nullable) di tabel `laporan`, wajib diisi untuk jenis CLEANIT. `lokasi` (teks bebas + koordinat) hanya dipakai ReportIt untuk *mendeskripsikan* tempat baru; `lokasiId` dipakai CleanIt untuk *merujuk* lokasi bounty yang sudah ada |
| K2 | Status lokasi setelah dibersihkan tidak didefinisikan | Lokasi `TERCEMAR` → `DIBERSIHKAN` saat laporan CleanIt dinyatakan valid; tanpa reservasi atau lock, jadi siapa pun boleh membersihkan lokasi yang masih tercemar (konflik diatur K12). `konfirmasi_bersihkan()` hanya berpindah ke form, bukan klaim |
| K3 | Jumlah poin per pembersihan belum ada | Kolom `poin` di tabel `lokasi`, **dipilih Operator dari dropdown 50 / 100 / 200** saat menyetujui ReportIt (default 50). Nilai lain ditolak (`FORMAT_TIDAK_VALID`) dan dijaga CHECK di database |
| K4 | UI mendukung banyak media, model hanya satu `idMedia` | Kolom `laporan_id` (nullable) di tabel `media`, 1–3 media per laporan. Media diunggah lebih dulu (`laporan_id` masih NULL), lalu ditautkan saat laporan dibuat dalam transaksi yang sama |
| K5 | Kode voucher muncul di I-06, tapi tidak ada di model | Kolom `kode_voucher` di tabel `penukaran`, di-generate server saat transaksi dengan format `SC-XXXX-XXXX`. Voucher bersifat **dummy** (SKPL 2.4): tidak ada alur klaim |
| K6 | Watermark dibuat di client atau server | Server (pakai `sharp`), hanya untuk **foto**, berisi waktu **unggah**: "SoClean · Diunggah dd MMM yyyy HH.mm WIB". Video diterima tanpa watermark. Watermark adalah penanda, bukan bukti keaslian; pertahanan terhadap foto lama atau foto pinjaman ada di Aturan CleanIt dan verifikasi Operator |
| K7 | I-07 dan I-08 menampilkan judul laporan, tapi form I-11 dan model Laporan tidak punya field judul | Isian judul (wajib, maks. 80 karakter) di form dan kolom `judul` di tabel laporan. Untuk CleanIt, judul diisi otomatis "Pembersihan {nama lokasi}" dan bisa diedit |
| K8 | Arti sumber bentrok: I-11 "Sumber Laporan" vs I-08 "Sumber Pencemaran"; jenis sampah di I-09 tidak ada di model | sumber = sumber laporan (PENGAMATAN\_PRIBADI \| INFO\_WARGA \| MEDIA\_SOSIAL \| LAINNYA); label I-08 jadi "Sumber Laporan". Tambah jenisSampah (PLASTIK \| KEMASAN\_STYROFOAM \| RUMAH\_TANGGA \| ORGANIK \| LAINNYA) di I-11, disalin ke lokasi saat ReportIt disetujui |
| K9 | Lokasi punya nama dan alamat (I-09), tapi form hanya punya satu isian "Alamat / Deskripsi Lokasi" | alamat = `lokasi_teks` laporan; nama diisi Operator saat menyetujui ReportIt (default = `lokasi_teks`), bersama poin dari K3. Teks lokasi dan koordinat disimpan terpisah |
| K10 | SKPL 2.4 dan M1 membatasi laporan pada wilayah kerja sama, tapi belum ada data maupun aturan validasinya | Tiga wilayah (tabel Wilayah kerja sama di bawah) di-*hardcode* sebagai konstanta di `lib/wilayah.ts` beserta fungsi `diDalamWilayah(lat, lng)`, dipakai bersama FE dan BE (tanpa tabel). Validasi penentu di BE: koordinat ReportIt di luar semua wilayah ditolak dengan 422 `DI_LUAR_WILAYAH`. Cek ini aturan bisnis, bukan pengaman, karena koordinat bisa diedit pengguna |
| K11 | Tautan "Lupa password" ada di I-01 dan I-02, tapi tidak ada use case maupun endpoint-nya | **Dihapus** dari I-01 dan I-02. Tidak ada endpoint reset password |
| K12 | Beberapa CleanIt bisa menunggu untuk lokasi yang sama; tanpa cek status lokasi, poin keluar berkali-kali | Setujui CleanIt hanya jika lokasi masih TERCEMAR, dicek dalam transaksi yang sama (`UPDATE lokasi … WHERE status = 'TERCEMAR'`); jika 0 baris → 409 `LOKASI_SUDAH_DIBERSIHKAN`. Setelah satu disetujui, CleanIt lain yang menunggu untuk lokasi itu otomatis TIDAK\_VALID dengan alasan "Lokasi sudah dibersihkan" dan pelapornya diberi notifikasi |
| K13 | Deteksi duplikat di DPPL (C06 Q-001) memakai kesamaan koordinat persis, yang hampir tidak pernah terjadi dengan GPS | Lokasi dianggap sama jika berjarak ≤ 50 m dari lokasi TERCEMAR (haversine). ReportIt yang disetujui dalam radius itu tidak membuat lokasi baru, tetapi ditautkan ke lokasi yang ada; poin dan nama dari Operator diabaikan. Sebelum menyetujui, Operator melihat `lokasiTerdekat` di I-08, dan respons setujui mengembalikan `digabung: true` |

### N1–N16 (ditambahkan di v0.6)

| No | Celah | Keputusan |
| --- | --- | --- |
| N1 | DPPL 1.2 bilang setiap kontribusi valid diganjar poin, sedangkan KF10 dan UC03 hanya memberi poin untuk CleanIt | **ReportIt tidak mendapat poin.** Poin hanya dari CleanIt yang valid (KF10) |
| N2 | IO3-005 memanggil `buka_cleanit()` yang tidak ada; tidak jelas dari mana form CleanIt mendapat `lokasiId` | Tombol CleanIt di Beranda selalu membuka I-09. Form CleanIt hanya dibuka dari tombol "Bersihkan" di detail lokasi, lewat route `/cleanit/[idLokasi]`; akses tanpa lokasi yang valid diarahkan ke I-09 |
| N3 | C09 Q-001 memfilter `stok > 0`, padahal I-04 mendesain tombol "Habis" | `GET /api/reward` mengembalikan **semua** reward (stok > 0 dulu, lalu harga naik); FE menampilkan "Habis" untuk stok 0 |
| N4 | KF02/UC02 hanya menyebut kamera, sedangkan US-04/US-06, I12-07, dan UC05 alt 1 mengarah ke unggah file | Masyarakat **boleh memakai kamera atau mengunggah file** di semua perangkat. Pertahanannya: watermark server (K6), hash SHA-256 (Aturan CleanIt), galeri Sebelum/Sesudah di I-08 (N9), dan verifikasi Operator |
| N5 | SKPL 2.4 menyebut mode offline dengan media lokal, padahal localStorage tidak bisa menyimpan file 20 MB | Draf offline hanya menyimpan isian teks (localStorage). Media diambil dengan kamera bawaan HP saat offline (tersimpan di galeri) lalu dipilih saat online; file yang sudah dipilih disimpan di memori tab dan diunggah otomatis begitu online. Jika tab ditutup, banner meminta memilih ulang media |
| N6 | `is_format_valid` hanya mengecek tipe data; CleanIt rawan dicurangi | Lihat Aturan CleanIt di bawah. Pelapor asal **boleh** membersihkan lokasinya sendiri (sesuai diagram aktivitas SKPL 2.1) |
| N7 | Autentikasi tidak punya UC, KF, maupun atribut di C08 | Auth tetap di luar UC01–UC09 (US-03). Aturan akun di Konvensi bagian Auth |
| N8 | `Pengguna.notify` (Q-004) tidak pernah dipanggil di sequence mana pun | Notifikasi diturunkan dari laporan yang sudah diverifikasi, tanpa tabel (lihat Catatan skema) |
| N9 | I-08 hanya dirancang untuk ReportIt; Operator tidak bisa membandingkan sebelum/sesudah | `LaporanDetail` CleanIt membawa `laporanAsal` (media sebelum) dan tanda pelapor asal; I-08 menampilkan galeri Sebelum dan Sesudah |
| N10 | Checkbox di I-07 menyiratkan pilih banyak, padahal I-08 hanya satu laporan | Pilihan tunggal: klik kartu langsung membuka I-08; checkbox dihapus |
| N11 | KNF02 dan I-10 menyebut "di sekitarmu", tapi query mengambil semua lokasi | Tanpa filter radius: semua lokasi TERCEMAR ditampilkan. Urutan "Terdekat" dihitung di client; jika izin GPS ditolak, urutan jatuh ke "Terbaru" (`dilaporkanAt`) |
| N12 | Sequence UC09 langsung `tukarPoin` tanpa konfirmasi I-05 dan tanpa skenario stok habis | Konfirmasi lewat I-05; kegagalan dibedakan lewat `POIN_TIDAK_CUKUP`, `STOK_HABIS`, dan `NOT_FOUND` |
| N13 | Riwayat, Profil, dan arti voucher tidak punya UC, query baca, maupun desain | Voucher dummy (K5). Riwayat: nama reward, kode voucher + salin, poin dipakai, waktu. Profil Masyarakat: nama, email, saldo, notifikasi, logout. Profil Operator: nama, logout. Desain dibuat FE-C dari komponen yang ada |
| N14 | Di sequence UC03/UC06 langkah verifikasi adalah panggilan terpisah tanpa transaksi; C05 Algo-001 melewati ManagerLaporan | Setujui/tolak berjalan dalam satu transaksi lewat ManagerLaporan (BE-13–BE-16); versi sequence yang dijadikan acuan |
| N15 | `is_penyimpanan_penuh()` tidak bisa membaca sisa ruang perangkat dari browser; `MAX_MEDIA_SIZE` tanpa nilai | Didefinisikan ulang sebagai "gagal menyimpan media secara lokal" (`QuotaExceededError` atau kuota situs < ukuran file); `MAX_MEDIA_SIZE` = 20 MB. Hanya penanganan error, bukan fitur utama |
| N16 | Tipe ID, nama method, dan alur MVC di DPPL tidak konsisten | Kontrak ini satu-satunya acuan. Pemetaan nama DPPL ke kode dicatat di B.5 |

### Aturan CleanIt (N4, N6)

Dicek di BE-10/BE-11 untuk setiap `POST /api/laporan` jenis CLEANIT:

1. **Lokasi masih TERCEMAR.** Jika lokasi tidak ada → 404 `NOT_FOUND`; jika sudah DIBERSIHKAN → 409 `LOKASI_SUDAH_DIBERSIHKAN`. Status dibaca di dalam transaksi pembuatan laporan dengan `SELECT status FROM lokasi WHERE id = … FOR SHARE`, sehingga persetujuan CleanIt lain untuk lokasi itu (BE-14) menunggu sampai laporan baru tersimpan, lalu ikut menolaknya otomatis (K12). Tanpa kunci ini, CleanIt yang dikirim tepat saat lokasi disetujui akan tersimpan untuk lokasi yang sudah DIBERSIHKAN dan menggantung di antrean.
2. **Satu CleanIt menunggu per pengguna per lokasi.** Jika pengguna masih punya CleanIt `BELUM_DIPERIKSA` untuk lokasi yang sama → 409 `CLEANIT_SUDAH_MENUNGGU`. Dijaga juga oleh unique index parsial `laporan_cleanit_menunggu_uidx`, jadi aman dari dua request bersamaan.
3. **Urutan waktu.** `waktu` pembersihan harus ≥ `waktu_kejadian` laporan asal lokasi dan ≤ sekarang; jika tidak → 400 `FORMAT_TIDAK_VALID` pada `fields.waktu`. Waktu pembersihan boleh lebih awal dari saat lokasi disetujui.
4. **Media tidak dipakai ulang.** SHA-256 file asli (sebelum watermark) tidak boleh sama dengan media yang sudah tertaut ke laporan berstatus selain `TIDAK_VALID`, termasuk media laporan asal lokasi itu → 409 `MEDIA_SUDAH_DIGUNAKAN`. Media yang belum tertaut (misalnya unggah ulang setelah gagal) tidak dihitung. Aturan ini berlaku juga untuk ReportIt.
5. **Hanya akun Masyarakat yang bisa membuat laporan** (Operator → 403), supaya Operator tidak bisa memverifikasi laporannya sendiri.
6. **Pelapor asal boleh membersihkan lokasinya sendiri.** I-08 menampilkan tanda "Pelapor = Relawan" beserta jumlah CleanIt pengguna itu untuk lokasi laporannya sendiri dalam 30 hari terakhir, supaya Operator lebih teliti membandingkan foto Sebelum/Sesudah.

Celah yang tidak ditutup sistem (multi-akun, kolusi, membuang sampah lalu membersihkannya sendiri) dicatat sebagai *known issue* di B.3; pertahanannya verifikasi Operator.

### Wilayah kerja sama (K10)

Isi `lib/wilayah.ts`. Batasnya berupa kotak lat/lng (bounding box), cukup untuk aturan bisnis. Angka di bawah sudah dicek di peta (bboxfinder.com) pada 8 November 2026 dan memakai tanda minus biasa (`-`), jadi aman disalin langsung ke kode.

| Kode | Nama | Lat min | Lat max | Lng min | Lng max |
| --- | --- | --- | --- | --- | --- |
| `CIKAPUNDUNG` | Sungai Cikapundung (Zona Teras Cikapundung), Bandung | -6.893000 | -6.878028 | 107.605000 | 107.608809 |
| `ANCOL` | Pantai Ancol, Jakarta Utara | -6.135000 | -6.110000 | 106.815000 | 106.870000 |
| `PANGANDARAN` | Pantai Pangandaran | -7.725000 | -7.670000 | 108.630000 | 108.680000 |

Format "Box" di bboxfinder adalah `lng min, lat min, lng max, lat max` (bujur dulu), terbalik dari urutan kolom tabel ini. Contoh untuk Cikapundung: `107.605000,-6.893000,107.608809,-6.878028`.

Mitra kerja sama ini adalah asumsi proyek (data contoh), sama seperti reward dummy.

Halaman Profil, Riwayat Penukaran, input alasan penolakan, galeri Sebelum/Sesudah, serta dropdown poin dan nama lokasi saat menyetujui ReportIt belum ada desainnya di Figma; FE-C membuatnya dari komponen yang sudah ada.

## Kontrak awal

Kontrak ini adalah versi 0.6 yang disepakati FE dan BE sebelum coding (perubahan dari versi sebelumnya: lihat "Riwayat perubahan kontrak" di bawah). Perubahan kontrak wajib lewat PR yang di-review minimal satu orang dari tiap tim. Tipe TypeScript-nya disimpan bersama di `types/api.ts`.

### Konvensi

- **Base path:** `/api`, format JSON, nama field `camelCase`.
- **Auth:** session *stateless* berupa cookie `httpOnly` bertanda tangan (JWT HS256, misalnya dengan `jose`; kunci dari env `SESSION_SECRET`), berisi `{ idPengguna, role }` dan kedaluwarsa 7 hari. Tidak ada tabel sesi; logout menghapus cookie. Data yang bisa berubah (saldo, nama) selalu dibaca dari database, bukan dari cookie. Endpoint bertanda Operator menolak role lain dengan `403`. Akun Operator hanya dibuat lewat seed; register selalu menghasilkan role `MASYARAKAT`.
- **Aturan akun (N7):** email di-trim dan diubah ke huruf kecil sebelum dicek unik dan sebelum login. Nama 1–100 karakter setelah di-trim. Password 8–72 karakter (bcrypt mengabaikan byte setelah ke-72), tidak sama dengan email, tanpa aturan wajib huruf besar atau simbol. Password di-hash dengan bcrypt (cost 10–12) atau argon2id, bukan SHA-256. Pelanggaran → 400 `FORMAT_TIDAK_VALID` dengan `fields`. Login gagal selalu satu pesan generik `LOGIN_GAGAL`.
- **Waktu:** string ISO 8601 UTC, misalnya `2026-11-04T03:45:00Z`. FE menampilkannya dalam WIB.
- **Respons sukses:** `{ "data": … }`. Respons list menambahkan `"meta": { "page", "limit", "total" }`.
- **Respons gagal:** `{ "error": { "code", "message", "fields"? } }`. `fields` berisi pesan per field untuk error validasi.
- **Enum:** ditulis huruf besar, misalnya `REPORTIT`, `BELUM_DIPERIKSA`, `TERCEMAR`.
- ID laporan di UI ditulis RPT- diikuti idLaporan 4 digit (misalnya RPT-0248); API tetap memakai angka.

### Skema database

Semua kolom NOT NULL kecuali bertanda `NULL`. `ts` = `timestamptz`, `coord` = `double precision`; enum ditulis `A|B`. Migrasi: `0000_init.sql` (v0.5) dan `0001_v0_6_hash_poin_cleanit.sql` (v0.6).

```sql
pengguna   (id uuid PK DEFAULT gen_random_uuid(), nama varchar(100), email varchar UNIQUE, password_hash varchar,
            role MASYARAKAT|OPERATOR DEFAULT 'MASYARAKAT',
            saldo_poin int DEFAULT 0 CHECK (saldo_poin >= 0),
            notifikasi_dilihat_at ts NULL)

media      (id serial PK, id_pengguna uuid FK → pengguna, laporan_id int FK → laporan NULL,
            storage_key varchar UNIQUE, tipe FOTO|VIDEO, ukuran_byte int CHECK (ukuran_byte > 0),
            sha256 char(64),                                                       -- v0.6
            created_at ts DEFAULT now())
            INDEX (laporan_id), INDEX (sha256)

lokasi     (id serial PK, nama varchar(100), alamat varchar,
            latitude coord CHECK (latitude BETWEEN -90 AND 90),
            longitude coord CHECK (longitude BETWEEN -180 AND 180),
            jenis_sampah JenisSampah, status TERCEMAR|DIBERSIHKAN DEFAULT 'TERCEMAR',
            poin int DEFAULT 50 CHECK (poin IN (50, 100, 200)),                    -- v0.6
            laporan_asal_id int FK → laporan, created_at ts DEFAULT now())
            INDEX (status)

laporan    (id serial PK, jenis REPORTIT|CLEANIT, id_pengguna uuid FK → pengguna, judul varchar(80),
            waktu_kejadian ts,
            lokasi_teks varchar NULL, latitude coord NULL, longitude coord NULL,   -- khusus ReportIt
            sumber Sumber NULL, jenis_sampah JenisSampah NULL,                    -- khusus ReportIt
            lokasi_id int FK → lokasi NULL,       -- CleanIt: wajib; ReportIt: diisi saat disetujui
            status BELUM_DIPERIKSA|VALID|TIDAK_VALID DEFAULT 'BELUM_DIPERIKSA',
            alasan_penolakan text NULL, diverifikasi_oleh uuid FK → pengguna NULL, diverifikasi_at ts NULL,
            created_at ts DEFAULT now(),
            CHECK (jenis = 'REPORTIT' AND lokasi_teks, latitude, longitude, sumber, jenis_sampah NOT NULL
                OR jenis = 'CLEANIT'  AND lokasi_id NOT NULL
                                      AND lokasi_teks, latitude, longitude, sumber, jenis_sampah IS NULL),
            CHECK ((status = 'BELUM_DIPERIKSA') = (diverifikasi_at IS NULL)),
            CHECK ((status = 'BELUM_DIPERIKSA') = (diverifikasi_oleh IS NULL)),
            CHECK (NOT (jenis = 'CLEANIT' AND status = 'TIDAK_VALID' AND alasan_penolakan IS NULL)),
            CHECK (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180))
            INDEX (jenis, status, created_at), INDEX (id_pengguna, diverifikasi_at), INDEX (lokasi_id),
            UNIQUE (id_pengguna, lokasi_id) WHERE jenis = 'CLEANIT' AND status = 'BELUM_DIPERIKSA'   -- v0.6

reward     (id serial PK, nama varchar(100), jenis varchar(50), deskripsi text NULL,
            harga_poin int CHECK (harga_poin > 0), stok int DEFAULT 0 CHECK (stok >= 0))

penukaran  (id uuid PK DEFAULT gen_random_uuid(), id_pengguna uuid FK → pengguna, id_reward int FK → reward,
            poin_dipakai int CHECK (poin_dipakai > 0), kode_voucher varchar UNIQUE, waktu ts DEFAULT now())
            INDEX (id_pengguna, waktu)
```

Catatan skema:

- `laporan.created_at` (waktu laporan masuk, diisi server) berbeda dengan `waktu_kejadian` (diisi pengguna). Urutan `terbaru`/`terlama` di I-07 memakai `created_at`.
- `lokasi_teks`, `latitude`, dan `longitude` hanya diisi untuk ReportIt, karena baris `lokasi` baru dibuat setelah ReportIt disetujui. CleanIt cukup memakai `lokasi_id`; di respons API, field `lokasi`/`latitude`/`longitude` CleanIt diisi dari lokasi terkait.
- `media.laporan_id` masih NULL setelah `POST /api/media`, lalu ditautkan saat `POST /api/laporan` dalam transaksi yang sama: `UPDATE media SET laporan_id = … WHERE id = ANY(…) AND id_pengguna = … AND laporan_id IS NULL`. Jika jumlah baris yang berubah tidak sama dengan jumlah `idMedia`, request ditolak (`FORMAT_TIDAK_VALID`). Media yang tetap NULL lebih dari 24 jam boleh dihapus berkala berdasarkan `created_at`.
- `media.sha256` adalah hash hex dari file **asli** sebelum watermark. Dicek di `POST /api/media` (umpan balik awal) dan dicek ulang di `POST /api/laporan` dalam transaksi (Aturan CleanIt nomor 4). Index-nya biasa, bukan UNIQUE, karena file yang sama boleh diunggah ulang selama belum tertaut ke laporan yang berlaku. Akibatnya, dua laporan yang dikirim tepat bersamaan dengan file identik masih bisa sama-sama lolos; risikonya kecil dan dicatat di B.3.
- Tidak ada tabel notifikasi. Penerima notifikasi (pelapor) berbeda dengan pengirim request (Operator), jadi tidak bisa lewat response atau cookie; isinya diturunkan dari laporan milik pengguna yang sudah diverifikasi (`status`, `alasan_penolakan`, `diverifikasi_at`, dan `lokasi.poin` untuk CleanIt yang valid). Notifikasi belum dibaca jika `diverifikasi_at > pengguna.notifikasi_dilihat_at` (atau kolom itu NULL). Notifikasi penukaran cukup lewat respons `POST /api/penukaran`.
- Tidak ada tabel wilayah; lihat K10.
- Tidak ada tabel sesi; lihat Konvensi bagian Auth.
- `media.storage_key` menyimpan *key* objek di RustFS/R2, bukan URL. URL dibuat saat dibaca lewat `getUrl(key)` (BE-07) karena *presigned URL* punya masa berlaku; pindah dari RustFS ke R2 juga tidak mengubah isi database.
- CleanIt mengisi `judul`, `waktu_kejadian` (waktu pembersihan), media, dan `lokasi_id`. `sumber` dan `jenis_sampah` kosong karena hanya relevan untuk laporan pencemaran; jenis sampah CleanIt diambil dari lokasi terkait.
- Saat ReportIt disetujui, `laporan.lokasi_id` diisi dengan lokasi baru atau lokasi lama dalam radius 50 m (K13). FK dua arah `laporan.lokasi_id` ↔ `lokasi.laporan_asal_id` aman karena laporan selalu dibuat lebih dulu.
- CleanIt yang otomatis ditolak karena K12 diisi `diverifikasi_oleh` = Operator yang menyetujui CleanIt lain untuk lokasi itu.
- Batas 1–3 media per laporan dicek di controller (BE-10), tidak bisa dinyatakan sebagai CHECK.
- Waktu foto di I08-11 memakai `media.created_at` (waktu unggah) dengan label "Diunggah …"; waktu yang sama tercetak di foto lewat watermark server (K6). Lokasinya memakai lokasi laporan.
- `Lokasi.dilaporkanAt` = `created_at` laporan asal lokasi itu (waktu laporan masuk). Dipakai juga untuk urutan "Terbaru" di I-09 (N11).
- Pelapor asal sebuah lokasi = `id_pengguna` dari `laporan` dengan `id = lokasi.laporan_asal_id`; tanda "Pelapor = Relawan" dan hitungan 30 hari diturunkan dari sini, tanpa kolom baru.

### Riwayat perubahan kontrak

| Versi | Perubahan |
| --- | --- |
| 0.1 | Versi awal |
| 0.2 | K4: tabel `laporan_media` diganti kolom `media.laporan_id`. `pengguna.created_at` dihapus karena tidak dipakai use case mana pun. `laporan.lokasi_teks`/`latitude`/`longitude` menjadi nullable (wajib hanya untuk ReportIt) dengan CHECK per jenis |
| 0.3 | Tabel `notifikasi` dihapus: notifikasi diturunkan dari laporan, ditambah kolom `pengguna.notifikasi_dilihat_at`; bentuk `Notifikasi` berubah dan ada endpoint `POST /api/notifikasi/dibaca`. Tabel `wilayah` dihapus: K10 memakai konstanta di `lib/wilayah.ts` |
| 0.4 | Session ditetapkan *stateless* (cookie JWT bertanda tangan, tanpa tabel sesi). `media.url` diganti `media.storage_key`. `laporan.sumber` dan `jenis_sampah` khusus ReportIt (CleanIt tetap mengisi judul dan waktu). Tipe kolom ditetapkan (`timestamptz`, `double precision` untuk koordinat), ditambah CHECK status–verifikasi, alasan penolakan CleanIt, nilai poin/harga positif, rentang koordinat, serta index untuk I-07, I-09, notifikasi, dan riwayat penukaran |
| 0.5 | Penyimpanan objek lokal diganti dari MinIO ke RustFS karena image MinIO sudah dihapus dari Docker Hub (September 2026). Variabel env `S3_*` (termasuk `S3_PUBLIC_ENDPOINT` untuk *presigned URL*) dan `SESSION_SECRET` ditetapkan di `.env.example`. Tidak ada perubahan skema atau API |
| 0.6 | Kontrak dijadikan satu-satunya acuan (N16) dan dipindah ke file baru. Keputusan N1–N16 dan Aturan CleanIt ditambahkan. **Skema (migrasi `0001`):** kolom `media.sha256` + index; `lokasi.poin` hanya 50/100/200 dengan default 50; unique index parsial satu CleanIt menunggu per pengguna per lokasi. **API:** `poin` setujui dibatasi 50/100/200 dan respons ditambah `digabung`; `LaporanDetail` ditambah `lokasiTerdekat`, `laporanAsal`, `pelaporAsalSama`, `jumlahBersihkanSendiri30Hari`; `GET /api/reward` mengembalikan semua reward; aturan akun register. Kode error baru `MEDIA_SUDAH_DIGUNAKAN` dan `CLEANIT_SUDAH_MENUNGGU`; `LOKASI_SUDAH_DIBERSIHKAN` juga dipakai saat membuat CleanIt, dengan status lokasi dibaca memakai `SELECT … FOR SHARE`. K3, K5, K6, K7, K10, K11, K13 difinalkan (dropdown poin, voucher `SC-XXXX-XXXX`, label watermark, judul otomatis CleanIt, tiga wilayah, Lupa password dihapus, penggabungan lokasi). Ringkasan diperbaiki menjadi 26 tugas BE |

### Daftar endpoint

| Method | Path | Akses | Request | Respons `data` | UC / Kelas |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | Publik | `{ nama, email, password }` (aturan akun di Konvensi) | `{ id, nama, email, role }` | I-02 |
| POST | `/api/auth/login` | Publik | `{ email, password }` | `{ id, nama, email, role }` + cookie | I-01 |
| POST | `/api/auth/logout` | Login | – | `{ ok: true }` | – |
| GET | `/api/me` | Login | – | `{ id, nama, email, role, saldoPoin }` | I-03, Profil |
| POST | `/api/media` | Masyarakat | `multipart/form-data`: `file` (JPG/PNG/MP4, maks. 20 MB), dari kamera atau berkas | `{ idMedia, url, tipe }` | UC02, C03 |
| POST | `/api/laporan` | Masyarakat | `{ jenis, judul, waktu, idMedia: number[] }` + `{ lokasi, latitude, longitude, sumber, jenisSampah }` (ReportIt) atau `{ lokasiId }` (CleanIt) | `{ idLaporan, status: "BELUM_DIPERIKSA" }` | UC01, UC05, C15 `cek_laporan` |
| GET | `/api/laporan` | Operator | query `jenis`, `status` (default `BELUM_DIPERIKSA`), `sort=terbaru\|terlama`, `page`, `limit` (default 6) | `Laporan[]` + `meta` | UC03, UC06, I-07 |
| GET | `/api/laporan/:id` | Operator | – | `LaporanDetail` | UC03, UC06, I-08 |
| POST | `/api/laporan/:id/setujui` | Operator | `{ poin?: 50 \| 100 \| 200, namaLokasi? }` (khusus ReportIt; default poin 50, nama = lokasi laporan; diabaikan jika digabung) | `{ idLaporan, status: "VALID", idLokasi?, digabung?, poinDiberikan? }` (`idLokasi` dan `digabung` untuk ReportIt, `poinDiberikan` untuk CleanIt) | C05 `setujui` |
| POST | `/api/laporan/:id/tolak` | Operator | `{ alasan? }` (wajib untuk CleanIt) | `{ idLaporan, status: "TIDAK_VALID" }` | C05 `tolak` |
| GET | `/api/lokasi` | Login | query `status` (default `TERCEMAR`); tanpa filter radius (N11) | `Lokasi[]` (bisa kosong) | UC04, I-09, I-10 |
| GET | `/api/lokasi/:id` | Login | – | `LokasiDetail` | UC04, C06 `get_lokasi` |
| GET | `/api/poin/saldo` | Masyarakat | – | `{ saldoPoin }` | UC07, C11 `lihatSaldo` |
| GET | `/api/reward` | Login | – | `Reward[]` (semua reward; stok > 0 dulu, lalu harga naik) | UC08, C09 |
| POST | `/api/penukaran` | Masyarakat | `{ idReward }` | `{ idPenukaran, kodeVoucher, namaReward, poinDipakai, waktuPenukaran, sisaPoin }` | UC09, C16 `tukarPoin` |
| GET | `/api/penukaran` | Masyarakat | query `page`, `limit` | `Penukaran[]` + `meta` | Riwayat (I-04, I-06) |
| GET | `/api/notifikasi` | Masyarakat | – | `Notifikasi[]` (urut `waktu` terbaru) | C08 `notify` |
| POST | `/api/notifikasi/dibaca` | Masyarakat | – | `{ ok: true }` (set `notifikasi_dilihat_at` = sekarang) | C08 `notify` |

### Bentuk objek utama

```ts
type Sumber = "PENGAMATAN_PRIBADI" | "INFO_WARGA" | "MEDIA_SOSIAL" | "LAINNYA";
type JenisSampah = "PLASTIK" | "KEMASAN_STYROFOAM" | "RUMAH_TANGGA" | "ORGANIK" | "LAINNYA";
type PilihanPoin = 50 | 100 | 200; // K3
type Media = { idMedia: number; url: string; tipe: "FOTO" | "VIDEO"; createdAt: string }; // url = presigned, dibuat saat dibaca; createdAt = waktu unggah
type Laporan = {
  idLaporan: number; jenis: "REPORTIT" | "CLEANIT"; judul: string;
  lokasi: string; latitude: number; longitude: number; // CleanIt: diisi dari lokasi terkait
  waktu: string; createdAt: string;
  sumber: Sumber | null;      // null untuk CleanIt
  jenisSampah: JenisSampah;   // CleanIt: diisi dari lokasi terkait
  status: "BELUM_DIPERIKSA" | "VALID" | "TIDAK_VALID";
};
type LaporanDetail = Laporan & {
  media: Media[];
  pelapor: { id: string; nama: string };
  lokasiId: number | null; alasanPenolakan: string | null;
  // Khusus ReportIt yang masih BELUM_DIPERIKSA (K13): lokasi TERCEMAR terdekat dalam radius 50 m yang akan menjadi
  // tujuan penggabungan; null jika tidak ada, jika laporan sudah diverifikasi, atau untuk CleanIt
  lokasiTerdekat: { idLokasi: number; nama: string; jarakMeter: number } | null;
  // Khusus CleanIt (N9); null untuk ReportIt
  laporanAsal: { idLaporan: number; judul: string; waktu: string; media: Media[] } | null;
  pelaporAsalSama: boolean | null;              // CleanIt: pengirim = pelapor asal lokasi
  jumlahBersihkanSendiri30Hari: number | null;  // CleanIt: CleanIt pengguna ini untuk lokasi laporannya sendiri, 30 hari terakhir, tidak termasuk laporan ini
};
type Lokasi = {
  idLokasi: number; nama: string; alamat: string;
  latitude: number; longitude: number; jenisSampah: JenisSampah;
  status: "TERCEMAR" | "DIBERSIHKAN"; poin: PilihanPoin;
  dilaporkanAt: string; // created_at laporan asal
};
// KF07: detail lokasi memuat waktu, sumber, dan bukti dari laporan asal
type LokasiDetail = Lokasi & {
  laporanAsal: { idLaporan: number; judul: string; waktu: string; sumber: Sumber; media: Media[] };
};
type Reward = { idReward: number; nama: string; jenis: string; hargaPoin: number; stok: number }; // stok 0 → "Habis"
type Penukaran = {
  idPenukaran: string; namaReward: string;
  kodeVoucher: string; // SC-XXXX-XXXX, dummy
  poinDipakai: number; waktuPenukaran: string;
};
// Diturunkan dari laporan yang sudah diverifikasi; FE menyusun teks pesannya.
type Notifikasi = {
  idLaporan: number; jenis: "REPORTIT" | "CLEANIT"; judul: string;
  status: "VALID" | "TIDAK_VALID"; alasanPenolakan: string | null;
  poinDiberikan: number | null; // hanya CleanIt yang VALID (ReportIt tidak mendapat poin, N1)
  waktu: string; // diverifikasi_at
  dibaca: boolean;
};
```

Kode voucher: `SC-` + 4 karakter + `-` + 4 karakter dari huruf besar dan angka tanpa karakter yang mirip (tanpa 0, O, 1, I), misalnya `SC-7KQM-X4TD`. Jika bentrok dengan UNIQUE, server membuat ulang.

### Kode error

| HTTP | `code` | Kapan | Ditampilkan FE di |
| --- | --- | --- | --- |
| 400 | `DATA_TIDAK_LENGKAP` | Field wajib laporan kosong (`is_terisi` = false) | I-11, I-13 notifikasi |
| 400 | `FORMAT_TIDAK_VALID` | Tipe atau format field salah (`is_format_valid` = false), termasuk poin di luar 50/100/200, urutan waktu CleanIt, dan aturan akun | I-02, I-08, I-11, I-13 notifikasi |
| 401 | `UNAUTHORIZED` | Belum login atau session habis | Redirect ke I-01 |
| 401 | `LOGIN_GAGAL` | Email atau password salah | I-01 |
| 403 | `FORBIDDEN` | Role tidak sesuai | Halaman error |
| 404 | `NOT_FOUND` | Laporan, lokasi, atau reward tidak ditemukan | Toast |
| 409 | `EMAIL_TERDAFTAR` | Email sudah dipakai | I-02 |
| 409 | `SUDAH_DIVERIFIKASI` | Laporan sudah disetujui atau ditolak Operator lain | I-08 |
| 409 | `LOKASI_SUDAH_DIBERSIHKAN` | CleanIt dikirim atau disetujui padahal lokasinya sudah DIBERSIHKAN (K12) | Form CleanIt, I-08 |
| 409 | `CLEANIT_SUDAH_MENUNGGU` | Pengguna masih punya CleanIt yang menunggu untuk lokasi yang sama (Aturan CleanIt nomor 2) | Form CleanIt |
| 409 | `MEDIA_SUDAH_DIGUNAKAN` | File identik (SHA-256) dengan media yang sudah dipakai laporan lain (Aturan CleanIt nomor 4) | I-12, I-13 |
| 413 | `FILE_TERLALU_BESAR` | File > 20 MB | I-12 |
| 415 | `TIPE_FILE_TIDAK_DIDUKUNG` | Bukan JPG, PNG, atau MP4 | I-12 |
| 422 | `POIN_TIDAK_CUKUP` | Saldo < harga reward | I-04 / I-05 |
| 422 | `STOK_HABIS` | Stok reward 0 saat transaksi | I-05 |
| 422 | `DI_LUAR_WILAYAH` | Koordinat ReportIt di luar wilayah kerja sama (K10) | I-11, I-13 notifikasi |
| 500 | `INTERNAL_ERROR` | Error tak terduga, termasuk rollback penukaran | Toast umum |

## Tugas Frontend

Ada 26 tugas FE dalam 7 modul. Selama endpoint BE belum siap, semua halaman bisa dikerjakan dengan mock dari FE-04.

### Fondasi

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-01 | Setup proyek FE | Tailwind (atau CSS modules), design tokens dari Figma (warna, font, radius), struktur folder `components/` dan `app/` | Figma | S | – |
| FE-02 | Komponen UI dasar | Button (varian + disabled), Card, Badge, Textbox, Dropdown, Modal, Bottom Sheet, Toast (`notify`), Pagination, Progress Indicator; tiap komponen punya contoh pemakaian | Semua I-xx | M | FE-01 |
| FE-03 | Layout dan navigasi | Bottom nav Home/Lokasi/Hadiah/Profil dengan state aktif; layout Operator (header + nav Laporan + Profil) | I-03, I-07 | S | FE-02 |
| FE-04 | API client dan mock | Wrapper `fetch` yang membaca `data`/`error`, peta kode error → pesan Indonesia (termasuk kode baru v0.6), mock (misalnya MSW) persis sesuai kontrak | Kontrak awal | M | Kontrak |
| FE-05 | Auth guard | Respons 401 → redirect ke I-01; setelah login, Operator ke I-07 dan Masyarakat ke I-03 | – | S | FE-04, BE-06 |

### Auth dan Beranda

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-06 | Halaman Login | Form email + password, pesan `LOGIN_GAGAL`, link Daftar; tautan Lupa password **dihapus** (K11) | I-01 | M | FE-04, BE-05 |
| FE-07 | Halaman Register | Validasi client sesuai Aturan akun (nama 1–100, email, password 8–72 dan tidak sama dengan email), pesan per field dari `fields`, pesan `EMAIL_TERDAFTAR`, tautan Lupa password dihapus (K11), berhasil → Beranda | I-02 | S | BE-05 |
| FE-08 | Beranda | Username dan saldo dari `GET /api/me`; tombol ReportIt, CleanIt (→ I-09, N2), Tukar Hadiah | I-03 | S | BE-05 |

### ReportIt (UC01, UC02)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-09 | State form multi-step | Data bertahan saat pindah I-11 ↔ I-12 ↔ I-13; tombol "Ubah" kembali ke step yang benar tanpa menghapus data lain | C01 | M | FE-02 |
| FE-10 | Step Informasi Dasar | Peta pilih lokasi (Leaflet + OpenStreetMap) dan tombol pakai GPS, date-time picker, isian judul, dropdown sumber dan jenis sampah (K7, K8), validasi client yang meniru `is_terisi` dan `is_format_valid`, peringatan dini jika titik di luar wilayah (`diDalamWilayah`, K10) | I-11, UC01 alt 1–2 | L | FE-09 |
| FE-11 | Step Bukti Media | Satu input file JPG/PNG/MP4 (di HP menawarkan kamera atau galeri) dan drag-drop di desktop (N4), preview, hapus, maks. 3 media; upload ke `/api/media` dengan progress; saat offline file disimpan di memori tab lalu diunggah otomatis saat online (N5); `QuotaExceededError` atau file > 20 MB → notify "Gagal" (N15); pesan `MEDIA_SUDAH_DIGUNAKAN` | I-12, UC02 + alt 1 | L | FE-09, BE-08 |
| FE-12 | Step Tinjau dan Kirim | Ringkasan + peta kecil, `POST /api/laporan`, notifikasi sukses; error 400/409/422 ditampilkan tanpa me-reset form | I-13, C01 `buat_laporan` | M | FE-10, FE-11, BE-11 |
| FE-13 | Draf offline | Isian teks form tersimpan di localStorage, dipulihkan saat dibuka lagi, dihapus setelah terkirim; media tidak masuk draf; banner saat offline, dan banner "pilih ulang media" jika tab sempat ditutup (N5) | Tabel 2.1 DPPL, SKPL 2.4 | M | FE-09 |

### CleanIt (UC04, UC05)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-14 | Halaman Lokasi | Kartu lokasi dari `GET /api/lokasi` (tanpa filter radius), badge jumlah, urutan "Terdekat" dihitung di client (haversine dari GPS); jika izin GPS ditolak, urutan "Terbaru" berdasarkan `dilaporkanAt` (N11) | I-09, C07 | M | BE-17 |
| FE-15 | Empty state lokasi | Tampil saat list kosong; teks "di sekitarmu" diganti karena tidak ada filter radius (N11); tombol ke form ReportIt | I-10, UC04 alt 1 | S | FE-14 |
| FE-16 | Detail lokasi | Peta, status, poin, info laporan asal (KF07), tombol "Bersihkan" → konfirmasi (hanya navigasi, K2) → `/cleanit/[idLokasi]` (N2) | C14 `tampilkan_lokasi`, `konfirmasi_bersihkan` | M | FE-14 |
| FE-17 | Form bukti pembersihan | Route `/cleanit/[idLokasi]`; lokasi tidak ada atau sudah DIBERSIHKAN → kembali ke I-09 dengan pesan (N2). Memakai ulang FE-09–FE-12 dengan `jenis: CLEANIT` dan `lokasiId` dari URL; isian hanya judul (default "Pembersihan {nama lokasi}", bisa diedit, K7), waktu pembersihan, dan media; pesan `LOKASI_SUDAH_DIBERSIHKAN`, `CLEANIT_SUDAH_MENUNGGU`, `MEDIA_SUDAH_DIGUNAKAN`, dan gagal sesuai UC05 alt 1 | UC05 | M | FE-16, FE-12 |

### Penukaran (UC07–UC09)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-18 | Halaman Hadiah | Kartu saldo, list semua reward, tiga state tombol: Tukar / Kurang \[selisih\] / Habis (stok 0, N3) | I-04, C10, C12 | M | BE-19, BE-20 |
| FE-19 | Konfirmasi penukaran | Bottom sheet dengan pratinjau sisa poin, Batal, Tukarkan (cegah klik ganda); tangani `POIN_TIDAK_CUKUP` dan `STOK_HABIS` (N12) | I-05, UC09 alt 1 | M | FE-18, BE-21 |
| FE-20 | Penukaran berhasil | Detail transaksi, kode voucher `SC-XXXX-XXXX` + salin (Clipboard API), saldo ter-refresh, tombol Kembali dan Lihat Riwayat | I-06 | S | FE-19 |
| FE-21 | Riwayat penukaran | List dengan pagination: nama reward, kode voucher + salin, poin dipakai, waktu (N13; desain dibuat FE-C) | I-04 "Riwayat" | M | BE-22 |

### Operator (UC03, UC06)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-22 | Halaman validasi | Tab ReportIt/CleanIt, badge dari `meta.total`, sort terbaru/terlama, list kartu, pagination 6 per halaman; tanpa checkbox, klik kartu langsung membuka I-08 (N10) | I-07, C04 | L | BE-12 |
| FE-23 | Modal detail laporan | Info laporan dan galeri foto/video. **ReportIt:** Setujui dengan dropdown poin 50/100/200 (default 50) dan nama lokasi; jika `lokasiTerdekat` ada, tampilkan "Akan digabung ke {nama} ({jarak} m)" dan nonaktifkan input poin/nama (K13). **CleanIt:** galeri Sebelum (`laporanAsal.media`) dan Sesudah (N9), tanda "Pelapor = Relawan" + `jumlahBersihkanSendiri30Hari` jika `pelaporAsalSama`, Tolak dengan alasan wajib. Tombol nonaktif setelah aksi; tangani `SUDAH_DIVERIFIKASI` dan `LOKASI_SUDAH_DIBERSIHKAN`; list ter-refresh | I-08, C14 | L | FE-22, BE-13–BE-16 |

### Lainnya

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-24 | Halaman Profil | Masyarakat: nama, email, saldo, daftar notifikasi (termasuk alasan penolakan dan poin), tandai dibaca, logout. Operator: nama dan logout (N13; desain dibuat FE-C) | I-03 "Profil", I-07, C08 `notify` | M | BE-23 |
| FE-25 | Responsif dan state umum | Tampilan rapi di 360 px dan desktop; skeleton loading, error, dan empty state di semua halaman | KNF | M | Semua halaman |
| FE-26 | Uji end-to-end UI | Checklist skenario normal + alternatif tiap UC dijalankan di HP dan desktop, termasuk kamera vs berkas, offline, wilayah, Aturan CleanIt, dan reward Habis; bug dicatat dan diperbaiki | UC01–UC09 | M | Semua |

## Tugas Backend

Ada 26 tugas BE dalam 7 modul. Setiap endpoint mengikuti alur MVC: route handler → controller (C05, C11, C15, C16) → model (C02, C03, C06, C08, C09, C13).

### Infrastruktur

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-01 | Docker Compose | Service app + PostgreSQL 18 + RustFS (S3 lokal, hanya di `compose.override.yaml`; image MinIO sudah dihapus dari Docker Hub sejak September 2026) + pembuatan bucket otomatis, `SESSION_SECRET` dan variabel `S3_*` di `.env.example`, `.env.example` berisi nama variabel tanpa nilai rahasia, satu perintah menjalankan semuanya secara lokal tanpa akun pribadi. `.gitignore` bawaan berpola `.env*` sehingga `.env.example` ikut terabaikan; tambahkan `!.env.example` | Tabel 2.1 DPPL | S | – |
| BE-02 | ORM dan migrasi | Semua tabel di Skema database dibuat lewat migrasi Drizzle: `0000_init.sql` (v0.5) dan `0001_v0_6_hash_poin_cleanit.sql` (v0.6), termasuk CHECK `saldo_poin >= 0`, `stok >= 0`, `poin IN (50, 100, 200)`, dan unique index parsial CleanIt | Kontrak awal | M | BE-01, K1–K13 |
| BE-03 | Seed data | Akun Operator, beberapa akun Masyarakat, reward (harga diselaraskan dengan poin 50/100/200, minimal satu reward stok 0 untuk demo "Habis"), dan lokasi contoh di dalam ketiga wilayah `lib/wilayah.ts`; semua data fiktif | K10 | S | BE-02 |
| BE-04 | Kerangka API | Helper respons `data`/`error`, error handler global ke kode error, validasi request (misalnya zod), logging | Kontrak awal | M | BE-01 |

### Auth

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-05 | Register, login, logout, `/api/me` | Aturan akun di Konvensi (normalisasi email, nama, password 8–72, hash bcrypt/argon2id), session cookie JWT `httpOnly` bertanda tangan, register selalu role `MASYARAKAT`, email unik → `EMAIL_TERDAFTAR`, login gagal → `LOGIN_GAGAL` generik | I-01, I-02, N7 | M | BE-02, BE-04 |
| BE-06 | Proxy dan cek role | `proxy.ts` (nama baru middleware di Next.js 16) hanya cek cepat sesi untuk redirect halaman; cek role tetap di tiap route handler: endpoint Operator menolak Masyarakat (403), endpoint Masyarakat (termasuk `POST /api/laporan`) menolak Operator (403), dan semua endpoint login menolak tamu (401) | – | S | BE-05 |

### Media (UC02)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-07 | Storage adapter S3 (R2/RustFS) | Fungsi `upload(file)` dan `getUrl(key)` (presigned read) lewat API S3; endpoint, bucket, dan kredensial dari env, jadi lokal memakai RustFS dan deploy memakai Cloudflare R2. Client server memakai `S3_ENDPOINT`, sedangkan *presigned URL* dibuat dengan `S3_PUBLIC_ENDPOINT` agar bisa dibuka browser | Komponen Storage | M | BE-01 |
| BE-08 | `POST /api/media` | Validasi tipe dan ukuran (413/415); hitung SHA-256 file asli dan tolak lebih awal jika sudah dipakai (`MEDIA_SUDAH_DIGUNAKAN`); watermark "SoClean · Diunggah … WIB" pada **foto** dengan `sharp`, video tanpa watermark (K6); upload, insert `media` dengan `storage_key` dan `sha256`, kembalikan `idMedia` dan URL hasil `getUrl(key)` | C03 `input_media`, Q-001 | L | BE-07, BE-04 |

### Laporan (UC01, UC05)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-09 | Model Laporan | Fungsi create, get by id, list dengan filter + pagination, `ubah_status`, `simpan_alasan_penolakan` | C02 | M | BE-02 |
| BE-10 | Validasi laporan | Buat `lib/wilayah.ts` (tabel Wilayah kerja sama). `is_terisi` dan `is_format_valid`: judul 1–80 karakter dan waktu tidak di masa depan (semua jenis); khusus ReportIt: lokasi, latitude/longitude dalam rentang dan di dalam wilayah (K10), sumber dan jenis sampah dari enum; khusus CleanIt: Aturan CleanIt nomor 1–3, field khusus ReportIt diabaikan; 1–3 media milik pelapor yang belum tertaut ke laporan lain (K4) dan lolos cek SHA-256 (Aturan CleanIt nomor 4) | C15 `cek_laporan` | M | BE-09 |
| BE-11 | `POST /api/laporan` | Menerima ReportIt dan CleanIt; insert laporan, cek ulang hash, dan penautan `media.laporan_id` dalam satu transaksi; untuk CleanIt, status lokasi dibaca dengan `SELECT … FOR SHARE` di transaksi yang sama (Aturan CleanIt nomor 1); pelanggaran unique index CleanIt menunggu → `CLEANIT_SUDAH_MENUNGGU`; error `DATA_TIDAK_LENGKAP` / `FORMAT_TIDAK_VALID` / `DI_LUAR_WILAYAH` / `LOKASI_SUDAH_DIBERSIHKAN` / `MEDIA_SUDAH_DIGUNAKAN` | UC01, UC05 | M | BE-10, BE-08 |
| BE-12 | `GET /api/laporan` dan `/:id` | Filter jenis + status, sort, pagination, `meta.total`; detail berisi media (URL dibuat dari `storage_key`) dan pelapor; untuk CleanIt, lokasi, koordinat, dan jenis sampah diisi dari lokasi terkait, ditambah `laporanAsal`, `pelaporAsalSama`, dan `jumlahBersihkanSendiri30Hari`; untuk ReportIt yang menunggu, `lokasiTerdekat` (radius 50 m, K13) | C15 `get_all_laporan_unverified`, `get_detail` | M | BE-09, BE-06 |

### Verifikasi (UC03, UC06)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-13 | Setujui ReportIt | Satu transaksi lewat ManagerLaporan (N14): status → `VALID` dan `petakan_lokasi` (tidak membuat lokasi baru jika ada lokasi dalam radius 50 m yang masih `TERCEMAR`; K13, respons `digabung: true` dan input Operator diabaikan); poin hanya 50/100/200 (K3), simpan poin, nama, dan jenis sampah lokasi; tanpa poin untuk pelapor (N1) | C05 `setujui`, C06 Q-001/Q-002 | M | BE-12, BE-17 |
| BE-14 | Setujui CleanIt | Satu transaksi: status → `VALID`, lokasi → `DIBERSIHKAN`, `tambah_poin` ke pelapor sebesar `lokasi.poin`, isi `diverifikasi_oleh`/`diverifikasi_at` (sumber notifikasi); hanya jika lokasi masih TERCEMAR, lalu CleanIt lain yang menunggu untuk lokasi itu otomatis ditolak (K12). Urutannya: UPDATE lokasi lebih dulu, baru UPDATE penolakan otomatis, dengan isolasi bawaan PostgreSQL (READ COMMITTED), supaya CleanIt yang baru tersimpan saat menunggu kunci ikut tertolak | C05 `setujui`, C08 Q-003 | M | BE-12, BE-18 |
| BE-15 | Tolak laporan | Status → `TIDAK_VALID`; alasan wajib untuk CleanIt dan disimpan; isi `diverifikasi_oleh`/`diverifikasi_at` (sumber notifikasi) | C05 `tolak` | S | BE-12 |
| BE-16 | Cegah verifikasi ganda | `UPDATE … WHERE status = 'BELUM_DIPERIKSA'`; jika 0 baris berubah → `SUDAH_DIVERIFIKASI` | – | S | BE-13–BE-15 |

### Lokasi, Poin, dan Reward (UC04, UC07–UC09)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-17 | Model + API Lokasi | `GET /api/lokasi` (default `TERCEMAR`, tanpa filter radius, list kosong jika tidak ada; `dilaporkanAt` dari laporan asal) dan `GET /api/lokasi/:id` | C06, Q-003/Q-004 | S | BE-02 |
| BE-18 | Model Pengguna | `getSaldoPoin`, `cukupPoin`, `kurangiPoin`, `tambah_poin` memakai query di DPPL | C08 Q-001–Q-003 | S | BE-02 |
| BE-19 | ManagerPoin + saldo | `GET /api/poin/saldo` lewat ManagerPoin, bukan model langsung | C11 `lihatSaldo` | S | BE-18 |
| BE-20 | Model + API Reward | `GET /api/reward` mengembalikan semua reward, urut stok > 0 dulu lalu harga naik (N3) | C09 Q-001/Q-002 | S | BE-02 |
| BE-21 | Transaksi penukaran | `tukarPoin` dalam BEGIN/COMMIT/ROLLBACK; UPDATE bersyarat saldo dan stok; generate `kodeVoucher` unik berformat `SC-XXXX-XXXX` (ulang jika bentrok); insert `penukaran`; kembalikan sisa poin | C16, C13, UC09 | L | BE-18, BE-20 |
| BE-22 | Riwayat penukaran | `GET /api/penukaran` milik pengguna yang login, dengan pagination | C13 | S | BE-21 |
| BE-23 | Notifikasi | `GET /api/notifikasi` (query laporan milik pengguna yang sudah diverifikasi + `lokasi.poin` untuk CleanIt valid, `dibaca` dari `notifikasi_dilihat_at`) dan `POST /api/notifikasi/dibaca` | C08 `notify` (pengganti Q-004) | S | BE-02, BE-09 |

### Kualitas dan rilis

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-24 | Testing | Unit test validasi laporan, aturan akun, wilayah (di dalam/di luar), dan aturan poin (di luar 50/100/200 ditolak); integration test dua penukaran bersamaan (saldo dan stok tidak negatif), verifikasi ganda, dua CleanIt untuk satu lokasi, CleanIt menunggu ganda (termasuk dua request bersamaan), CleanIt dikirim bersamaan dengan persetujuan CleanIt lain untuk lokasi yang sama (berakhir 409 atau tertolak otomatis, tidak menggantung), media dipakai ulang, pelapor asal membersihkan lokasinya sendiri (boleh, tanda muncul), Operator membuat laporan (403), dan penggabungan ReportIt dalam radius 50 m; Vitest di `tests/`, dijalankan dengan `npm test` | UC01, UC06, UC09 | M | BE-11, BE-16, BE-21 |
| BE-25 | Dokumentasi dan rilis | `src/README.md` memuat 8 isi minimal A.5 Tugas 9 (deskripsi, teknologi dan versi, prasyarat, konfigurasi termasuk migrasi dan seed, cara menjalankan dan test, akun uji tiap peran, modul dan pembagian anggota, daftar tabel); koleksi Postman/Bruno untuk semua endpoint; release `v9.0` dari `main` sebelum deadline. Deploy opsional; jika ada, URL dicantumkan dan migrasi berjalan saat deploy | – | M | Semua BE |
| BE-26 | Profiling | EXPLAIN ANALYZE pada query daftar lokasi (status + radius 50 m, K13) dan daftar laporan Operator dengan seed besar (±10.000 baris); index yang ditambahkan serta angka sebelum dan sesudah dicatat di B.2.1 laporan | Q-001, A.6 Tugas 9 | S | BE-03, BE-13 |

## Urutan pengerjaan dan paket pembagian

Pekerjaan berjalan dalam 5 milestone. Milestone berikutnya baru dimulai setelah gerbang (kriteria lolos) milestone sebelumnya terpenuhi. Deadline Tugas 9 adalah **Rabu, 11 November 2026, 21.50 WIB**, jadi usulan jadwalnya: M0 4–5 Nov, M1 6 Nov, M2 7–8 Nov, M3 9–10 Nov, dan M4 11 Nov dengan tag `v9.0` dibuat paling lambat sore itu.

&#91;embedded content: urutan milestone · 5 tahap, tiap tahap punya gerbang\]

M2 dan M3 adalah alur inti SoClean; tiap milestone diakhiri demo singkat ke seluruh tim.

Kelima paket di bawah bisa langsung dibagikan, satu paket per orang. Bebannya dibuat kira-kira seimbang dari ukuran S/M/L.

| Paket | Fokus | Tugas |
| --- | --- | --- |
| FE-A | Fondasi, auth, draf offline | FE-01–FE-08, FE-13 |
| FE-B | Alur ReportIt dan CleanIt (sisi Masyarakat) | FE-09–FE-12, FE-14–FE-17 |
| FE-C | Penukaran, Operator, profil, QA UI | FE-18–FE-26 |
| BE-A | Infrastruktur, auth, media, pembuatan laporan | BE-01, BE-02, BE-04–BE-11 |
| BE-B | Verifikasi, poin, penukaran, testing, rilis | BE-03, BE-12–BE-26 |

Pemilik FE-A sebaiknya menyelesaikan FE-02 dan FE-04 paling lambat 5 November, karena kedua tugas ini dipakai oleh FE-B dan FE-C.

## Definition of Done dan konvensi kerja

Sebuah tugas dianggap selesai jika semua poin di bawah terpenuhi.

- [ ] Kriteria selesai di tabel tugas terpenuhi, termasuk skenario alternatif UC terkait
- [ ] Request dan respons sama persis dengan Kontrak awal; jika berbeda, kontrak diperbarui di PR yang sama
- [ ] PR di-review dan di-approve minimal satu anggota lain
- [ ] Tidak ada error TypeScript maupun lint; test BE terkait lolos
- [ ] Untuk tugas FE: sudah dicek di lebar 360 px dan desktop

**Konvensi Git**

- Branch `main` selalu bisa dijalankan dan tetap bisa menerima sync dari repo asisten; pengembangan lewat branch `feat/FE-xx-nama-singkat` atau `feat/BE-xx-nama-singkat` (`fix/…` untuk perbaikan), lalu digabung lewat PR.
- Commit memakai semantic commit dengan ID tugas sebagai scope, misalnya `feat(FE-11): upload media dengan progress` atau `fix(BE-14): tolak CleanIt ganda`; judul PR memakai format yang sama.
- Perubahan skema database hanya lewat file migrasi baru, tidak mengedit migrasi lama.
- Rahasia (kredensial R2, URL database) hanya di `.env`, tidak pernah di-commit.
- Satu GitHub Issue per tugas FE/BE dengan assignee pemilik paket, dan PR menulis `Closes #n`. Issues di repo fork saat ini **nonaktif**, jadi aktifkan dulu di Settings → General → Features.
- Penggunaan AI, termasuk agent coding, dicatat di `docs/K03_G02_AI-Usage.md`.
- Seed hanya berisi data fiktif, dan folder milestone lama (`docs/M1`–`docs/M8`) tidak diubah. Perbedaan dengan DPPL dicatat di B.1, bukan dengan mengedit DPPL.

## Laporan Tugas 9

Bagian B di `docs/M9/K03_G02_Implementasi.md` diisi sambil mengerjakan, bukan di hari terakhir. Sebagian besar isinya sudah ada di dokumen ini.

| Bagian | Isi diambil dari | Penanggung jawab |
| --- | --- | --- |
| B.1 Perubahan dari DPPL | Sudah diisi di v0.6 (satu baris per perubahan: K1–K13, N1–N16, Aturan CleanIt, infrastruktur). Perubahan baru selama coding ditambahkan sebagai baris baru | BE-B, dikumpulkan dari semua paket |
| B.2 Bukti best practices | Daftar branch, riwayat commit, Issues, 2–3 PR beserta review, hasil `npm test` | FE-C |
| B.2.1 Profiling | BE-26 | BE-B |
| B.3 Kendala | Known issues yang sudah dicatat di v0.6, ditambah temuan dari checklist QA di tabel Lainnya | FE-C |
| B.4 Kontribusi | Lima paket di atas, satu paket per anggota | Semua |
| B.5 Traceability | Tabel di bawah, kolom lokasi file diisi saat kode jadi; catatan penamaan DPPL → kode (N16) sudah ada | Pemilik paket untuk kelas yang dikerjakannya |

Pemetaan awal kelas DPPL (Tabel 4.1) ke paket:

| Kelas | Paket | Wujud yang direncanakan |
| --- | --- | --- |
| C01 FormLaporan | FE-B | Komponen form ReportIt dan CleanIt |
| C02 Laporan | BE-A | Model dan tabel `laporan` |
| C03 Media | BE-A | Model, tabel `media`, dan storage adapter (BE-07, BE-08) |
| C04 DaftarLaporan | FE-C | Halaman daftar laporan Operator |
| C05 ValidatorLaporan | BE-B | Controller setujui dan tolak (BE-13, BE-14) |
| C06 Lokasi | BE-B | Model dan tabel `lokasi` |
| C07 DaftarLokasi | FE-B | Halaman daftar dan peta lokasi CleanIt |
| C08 Pengguna | BE-A, BE-B | Model dan tabel `pengguna` (auth di BE-A, saldo poin di BE-B) |
| C09 Reward | BE-B | Model dan tabel `reward` |
| C10 DaftarReward | FE-C | Halaman katalog reward |
| C11 ManagerPoin | BE-B | Controller poin |
| C12 HalamanPenukaran | FE-C | Halaman penukaran |
| C13 Penukaran (Model) | BE-B | Model dan tabel `penukaran` |
| C14 LaporanView | FE-C | Halaman detail laporan Operator |
| C15 ManagerLaporan | BE-A | Controller laporan (`is_terisi`, `is_format_valid`) |
| C16 Penukaran (Controller) | BE-B | Controller `tukarPoin` |

Hal lain dari ketentuan Tugas 9:

- Yang dinilai adalah tag release terakhir sebelum deadline (`v9.0`, revisi `v9.1`, dan seterusnya) dengan target `main`.
- README aplikasi wajib di `src/README.md`. README bawaan create-next-app di `src/so-clean/README.md` diganti atau diarahkan ke sana.
- Laporan merujuk `docs/M9/assets/Logo.png`, tapi file itu belum ada di folder assets.
- Semua anggota wajib ikut asistensi akbar; jadwalnya belum diisi di laporan.
