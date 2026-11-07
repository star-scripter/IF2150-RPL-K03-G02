# SoClean — Pembagian Tugas FE & BE

Nov 4, 2026 · @Man

## Ringkasan

Pekerjaan SoClean dibagi menjadi 26 tugas Frontend (FE) dan 25 tugas Backend (BE), diturunkan dari DPPL (UC01–UC09, kelas C01–C16, antarmuka I-01–I-13). Pembagiannya mengikuti MVC: **View → FE**, sedangkan **Controller + Model + Database/Storage → BE**.

- **Stack:** Next.js 16.4 (TypeScript, React 19.3, Tailwind CSS 4) full-stack di Node.js 22, PostgreSQL 18, Cloudflare R2 (di lokal diganti MinIO, lihat BE-07), Docker.
- **Batas FE/BE:** FE hanya memanggil API pada bagian Kontrak Awal. FE tidak mengakses database atau R2 secara langsung.
- **Struktur folder:** proyek sudah di-init di `src/so-clean/` (Next.js 16.4.5, alias `@/*` ke root proyek). FE di `app/(pages)/` dan `components/`; BE di `app/api/**/route.ts`, `server/controllers/`, `server/models/`, dan `server/db/`; test di `tests/`. Nama file controller dan model mengikuti kelas DPPL (misalnya `server/models/laporan.ts` untuk C02) supaya tabel traceability B.5 mudah diisi.
- **ID tugas:** `FE-xx` atau `BE-xx`. Estimasi memakai ukuran S (≤ 0,5 hari), M (1–2 hari), dan L (3+ hari).
- **Kolom Butuh:** tugas yang harus selesai (atau minimal kontraknya disepakati) sebelum tugas tersebut bisa diselesaikan. Selama BE belum siap, FE bisa memakai mock data sesuai kontrak.

## Keputusan yang harus disepakati dulu

Tiga belas hal berikut belum dijelaskan atau saling bertentangan di dokumen M1–M8 (acuan utama: DPPL2 di M8). K1–K6 berasal dari DPPL; K7–K11 dari cek silang mockup I-01–I-13, SKPL (M5), dan dokumen M1–M2; K12–K13 dari review temuan tambahan soal proses bersamaan dan duplikasi. Hal-hal ini mengubah skema database dan kontrak API, jadi perlu diputuskan sebelum sprint pertama. Kolom Usulan adalah saran default yang sudah dipakai di kontrak di bawah.

| No | Celah di DPPL | Usulan default |
| --- | --- | --- |
| K1 | Laporan CleanIt tidak menyimpan lokasi mana yang dibersihkan | Tambah kolom `lokasi_id` (nullable) di tabel `laporan`, wajib diisi untuk jenis CLEANIT |
| K2 | Status lokasi setelah dibersihkan tidak didefinisikan | Lokasi `TERCEMAR` → `DIBERSIHKAN` saat laporan CleanIt dinyatakan valid; tanpa reservasi atau lock, jadi siapa pun boleh membersihkan lokasi yang masih tercemar (konflik diatur K12) |
| K3 | Jumlah poin per pembersihan belum ada | Kolom `poin` di tabel `lokasi`, ditentukan Operator saat menyetujui ReportIt (default 50) |
| K4 | UI mendukung banyak media, model hanya satu `idMedia` | Kolom `laporan_id` (nullable) di tabel `media`, maks. 3 media per laporan. Media diunggah lebih dulu (`laporan_id` masih NULL), lalu ditautkan saat laporan dibuat dalam transaksi yang sama. Tabel relasi tidak dipakai karena satu media hanya milik satu laporan |
| K5 | Kode voucher muncul di I-06, tapi tidak ada di model | Kolom `kode_voucher` di tabel `penukaran`, di-generate server saat transaksi |
| K6 | Watermark dibuat di client atau server | Server (pakai `sharp`) agar tidak bisa dipalsukan dari client |
| K7 | I-07 dan I-08 menampilkan judul laporan ("Sampah plastik di Sungai Cikapundung"), tapi form I-11 dan model Laporan tidak punya field judul | Tambah isian judul (wajib, maks. 80 karakter) di I-11 dan kolom judul di tabel laporan |
| K8 | Arti sumber bentrok: I-11 "Sumber Laporan" (Pengamatan pribadi), I-08 "Sumber Pencemaran" (Limbah Cair Industri). Kartu I-09 juga menampilkan jenis sampah yang tidak ada di model. Isi dropdown sumber belum didefinisikan | sumber = sumber laporan (PENGAMATAN\_PRIBADI \| INFO\_WARGA \| MEDIA\_SOSIAL \| LAINNYA); label I-08 jadi "Sumber Laporan". Tambah jenisSampah (PLASTIK \| KEMASAN\_STYROFOAM \| RUMAH\_TANGGA \| ORGANIK \| LAINNYA) di I-11, disalin ke lokasi saat ReportIt disetujui |
| K9 | Lokasi punya nama dan alamat (I-09: "Sungai Mahakam"), tapi form hanya punya satu isian "Alamat / Deskripsi Lokasi" | alamat = lokasi\_teks laporan; nama diisi Operator saat menyetujui ReportIt (default = lokasi\_teks), bersama poin dari K3 |
| K10 | SKPL 2.4 dan M1 membatasi laporan pada wilayah yang bekerja sama, tapi belum ada data maupun aturan validasinya | Daftar wilayah (nama, batas lat/lng min–maks) di-*hardcode* sebagai konstanta di `lib/wilayah.ts` beserta fungsi `diDalamWilayah(lat, lng)`, dipakai bersama FE dan BE (tidak ada tabel, karena tidak bisa diubah dari UI). Validasi penentu tetap di BE: koordinat ReportIt di luar semua wilayah ditolak dengan 422 DI\_LUAR\_WILAYAH |
| K11 | Tautan "Lupa password" ada di I-01 dan I-02, tapi tidak ada use case maupun endpoint-nya | Di luar lingkup: tautan disembunyikan atau hanya menampilkan info "Hubungi operator"; tidak ada endpoint reset password |
| K12 | Beberapa CleanIt bisa menunggu untuk lokasi yang sama. BE-14 tidak mengecek status lokasi, jadi jika semuanya disetujui, poin keluar berkali-kali | Setujui CleanIt hanya jika lokasi masih TERCEMAR, dicek dalam transaksi yang sama (UPDATE lokasi … WHERE status = 'TERCEMAR'); jika gagal → 409 LOKASI\_SUDAH\_DIBERSIHKAN. Setelah satu disetujui, CleanIt lain yang menunggu untuk lokasi itu otomatis TIDAK\_VALID dengan alasan "Lokasi sudah dibersihkan" dan pelapornya diberi notifikasi |
| K13 | Deteksi duplikat lokasi di DPPL (C06 Q-001) memakai kesamaan koordinat persis, yang hampir tidak pernah terjadi dengan GPS | Lokasi dianggap sama jika berjarak ≤ 50 m dari lokasi TERCEMAR (haversine). ReportIt yang disetujui dalam radius itu tidak membuat lokasi baru, tetapi ditautkan ke lokasi yang ada lewat lokasi\_id; respons setujui mengembalikan idLokasi lama |

Selain itu, halaman Profil, Riwayat Penukaran, input alasan penolakan, serta input poin dan nama lokasi saat menyetujui ReportIt belum ada desainnya di Figma.

## Kontrak awal

Kontrak ini adalah versi 0.3 yang disepakati FE dan BE sebelum coding (perubahan dari versi sebelumnya: lihat "Riwayat perubahan kontrak" di bawah). Perubahan kontrak wajib lewat PR yang di-review minimal satu orang dari tiap tim. Tipe TypeScript-nya disimpan bersama di `types/api.ts`.

### Konvensi

- **Base path:** `/api`, format JSON, nama field `camelCase`.
- **Auth:** session di cookie `httpOnly`. Endpoint bertanda Operator menolak role lain dengan `403`.
- **Waktu:** string ISO 8601 UTC, misalnya `2026-11-04T03:45:00Z`. FE menampilkannya dalam WIB.
- **Respons sukses:** `{ "data": … }`. Respons list menambahkan `"meta": { "page", "limit", "total" }`.
- **Respons gagal:** `{ "error": { "code", "message", "fields"? } }`. `fields` berisi pesan per field untuk error validasi.
- **Enum:** ditulis huruf besar, misalnya `REPORTIT`, `BELUM_DIPERIKSA`, `TERCEMAR`.
- ID laporan di UI ditulis RPT- diikuti idLaporan 4 digit (misalnya RPT-0248); API tetap memakai angka.

### Skema database

```sql
pengguna      (id uuid PK, nama, email UNIQUE, password_hash,
               role MASYARAKAT|OPERATOR, saldo_poin int DEFAULT 0 CHECK (saldo_poin >= 0),
               notifikasi_dilihat_at NULL)
media         (id serial PK, id_pengguna FK, laporan_id FK NULL, url, tipe FOTO|VIDEO, ukuran_byte, created_at)
lokasi        (id serial PK, nama, alamat, latitude, longitude, jenis_sampah,
               status TERCEMAR|DIBERSIHKAN, poin int, laporan_asal_id FK, created_at)
laporan       (id serial PK, jenis REPORTIT|CLEANIT, id_pengguna FK, judul,
               lokasi_teks NULL, latitude NULL, longitude NULL,
               waktu_kejadian, sumber, jenis_sampah, status BELUM_DIPERIKSA|VALID|TIDAK_VALID,
               alasan_penolakan NULL, lokasi_id FK NULL, diverifikasi_oleh FK NULL, diverifikasi_at NULL, created_at,
               CHECK (jenis = 'REPORTIT' AND lokasi_teks, latitude, longitude NOT NULL
                   OR jenis = 'CLEANIT' AND lokasi_id NOT NULL))
reward        (id serial PK, nama, jenis, deskripsi, harga_poin int, stok int CHECK (stok >= 0))
penukaran     (id uuid PK, id_pengguna FK, id_reward FK, poin_dipakai int, kode_voucher UNIQUE, waktu)
```

Catatan skema:

- `laporan.created_at` (waktu laporan masuk, diisi server) berbeda dengan `waktu_kejadian` (diisi pengguna). Urutan `terbaru`/`terlama` di I-07 memakai `created_at`.
- `lokasi_teks`, `latitude`, dan `longitude` hanya diisi untuk ReportIt, karena baris `lokasi` baru dibuat setelah ReportIt disetujui. CleanIt cukup memakai `lokasi_id`; di respons API, field `lokasi`/`latitude`/`longitude` CleanIt diisi dari lokasi terkait.
- `media.laporan_id` masih NULL setelah `POST /api/media`, lalu ditautkan saat `POST /api/laporan` dalam transaksi yang sama: `UPDATE media SET laporan_id = … WHERE id = ANY(…) AND id_pengguna = … AND laporan_id IS NULL`. Jika jumlah baris yang berubah tidak sama dengan jumlah `idMedia`, request ditolak (`FORMAT_TIDAK_VALID`). Media yang tetap NULL lebih dari 24 jam boleh dihapus berkala berdasarkan `created_at`.
- Tidak ada tabel notifikasi. Penerima notifikasi (pelapor) berbeda dengan pengirim request (Operator), jadi tidak bisa lewat response atau cookie; isinya diturunkan dari laporan milik pengguna yang sudah diverifikasi (`status`, `alasan_penolakan`, `diverifikasi_at`, dan `lokasi.poin` untuk CleanIt yang valid). Notifikasi belum dibaca jika `diverifikasi_at > pengguna.notifikasi_dilihat_at` (atau kolom itu NULL). Notifikasi penukaran cukup lewat respons `POST /api/penukaran`.
- Tidak ada tabel wilayah; lihat K10.

### Riwayat perubahan kontrak

| Versi | Perubahan |
| --- | --- |
| 0.1 | Versi awal |
| 0.2 | K4: tabel `laporan_media` diganti kolom `media.laporan_id`. `pengguna.created_at` dihapus karena tidak dipakai use case mana pun. `laporan.lokasi_teks`/`latitude`/`longitude` menjadi nullable (wajib hanya untuk ReportIt) dengan CHECK per jenis |
| 0.3 | Tabel `notifikasi` dihapus: notifikasi diturunkan dari laporan, ditambah kolom `pengguna.notifikasi_dilihat_at`; bentuk `Notifikasi` berubah dan ada endpoint `POST /api/notifikasi/dibaca`. Tabel `wilayah` dihapus: K10 memakai konstanta di `lib/wilayah.ts` |

### Daftar endpoint

| Method | Path | Akses | Request | Respons `data` | UC / Kelas |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | Publik | `{ nama, email, password }` | `{ id, nama, email, role }` | I-02 |
| POST | `/api/auth/login` | Publik | `{ email, password }` | `{ id, nama, email, role }` + cookie | I-01 |
| POST | `/api/auth/logout` | Login | – | `{ ok: true }` | – |
| GET | `/api/me` | Login | – | `{ id, nama, email, role, saldoPoin }` | I-03 |
| POST | `/api/media` | Masyarakat | `multipart/form-data`: `file` (JPG/PNG/MP4, maks. 20 MB) | `{ idMedia, url, tipe }` | UC02, C03 |
| POST | `/api/laporan` | Masyarakat | `{ jenis, judul, waktu, sumber, jenisSampah, idMedia: number[] }` + `{ lokasi, latitude, longitude }` (ReportIt) atau `{ lokasiId }` (CleanIt) | `{ idLaporan, status: "BELUM_DIPERIKSA" }` | UC01, UC05, C15 `cek_laporan` |
| GET | `/api/laporan` | Operator | query `jenis`, `status` (default `BELUM_DIPERIKSA`), `sort=terbaru\|terlama`, `page`, `limit` (default 6) | `Laporan[]` + `meta` | UC03, UC06, I-07 |
| GET | `/api/laporan/:id` | Operator | – | `LaporanDetail` (termasuk `media[]` dan `pelapor`) | UC03, UC06, I-08 |
| POST | `/api/laporan/:id/setujui` | Operator | `{ poin?`, namaLokasi? } (khusus ReportIt; default poin 50, nama = lokasi laporan) | `{ idLaporan, status: "VALID", idLokasi?, poinDiberikan? }` | C05 `setujui` |
| POST | `/api/laporan/:id/tolak` | Operator | `{ alasan? }` (wajib untuk CleanIt) | `{ idLaporan, status: "TIDAK_VALID" }` | C05 `tolak` |
| GET | `/api/lokasi` | Login | query `status` (default `TERCEMAR`) | `Lokasi[]` (bisa kosong) | UC04, I-09, I-10 |
| GET | `/api/lokasi/:id` | Login | – | `LokasiDetail` | UC04, C06 `get_lokasi` |
| GET | `/api/poin/saldo` | Masyarakat | – | `{ saldoPoin }` | UC07, C11 `lihatSaldo` |
| GET | `/api/reward` | Login | – | `Reward[]` (stok > 0, urut harga naik) | UC08, C09 |
| POST | `/api/penukaran` | Masyarakat | `{ idReward }` | `{ idPenukaran, kodeVoucher, namaReward, poinDipakai, waktuPenukaran, sisaPoin }` | UC09, C16 `tukarPoin` |
| GET | `/api/penukaran` | Masyarakat | query `page`, `limit` | `Penukaran[]` + `meta` | Riwayat (I-04, I-06) |
| GET | `/api/notifikasi` | Masyarakat | – | `Notifikasi[]` (urut `waktu` terbaru) | C08 `notify` |
| POST | `/api/notifikasi/dibaca` | Masyarakat | – | `{ ok: true }` (set `notifikasi_dilihat_at` = sekarang) | C08 `notify` |

### Bentuk objek utama

```ts
type Sumber = "PENGAMATAN_PRIBADI" | "INFO_WARGA" | "MEDIA_SOSIAL" | "LAINNYA";
type JenisSampah = "PLASTIK" | "KEMASAN_STYROFOAM" | "RUMAH_TANGGA" | "ORGANIK" | "LAINNYA";
type Media = { idMedia: number; url: string; tipe: "FOTO" | "VIDEO" };
type Laporan = {
  idLaporan: number; jenis: "REPORTIT" | "CLEANIT"; judul: string;
  lokasi: string; latitude: number; longitude: number; // CleanIt: diisi dari lokasi terkait
  waktu: string; sumber: Sumber; jenisSampah: JenisSampah; createdAt: string;
  status: "BELUM_DIPERIKSA" | "VALID" | "TIDAK_VALID";
};
type LaporanDetail = Laporan & {
  media: Media[];
  pelapor: { id: string; nama: string };
  lokasiId: number | null; alasanPenolakan: string | null;
};
type Lokasi = {
  idLokasi: number; nama: string; alamat: string;
  latitude: number; longitude: number; jenisSampah: JenisSampah;
  status: "TERCEMAR" | "DIBERSIHKAN"; poin: number; dilaporkanAt: string;
};
// KF07: detail lokasi memuat waktu, sumber, dan bukti dari laporan asal
type LokasiDetail = Lokasi & {
  laporanAsal: { idLaporan: number; judul: string; waktu: string; sumber: Sumber; media: Media[] };
};
type Reward = { idReward: number; nama: string; jenis: string; hargaPoin: number; stok: number };
type Penukaran = {
  idPenukaran: string; namaReward: string; kodeVoucher: string;
  poinDipakai: number; waktuPenukaran: string;
};
// Diturunkan dari laporan yang sudah diverifikasi; FE menyusun teks pesannya.
type Notifikasi = {
  idLaporan: number; jenis: "REPORTIT" | "CLEANIT"; judul: string;
  status: "VALID" | "TIDAK_VALID"; alasanPenolakan: string | null;
  poinDiberikan: number | null; // hanya CleanIt yang VALID
  waktu: string; // diverifikasi_at
  dibaca: boolean;
};
```

### Kode error

| HTTP | `code` | Kapan | Ditampilkan FE di |
| --- | --- | --- | --- |
| 400 | `DATA_TIDAK_LENGKAP` | Field wajib laporan kosong (`is_terisi` = false) | I-11, I-13 notifikasi |
| 400 | `FORMAT_TIDAK_VALID` | Tipe atau format field salah (`is_format_valid` = false) | I-11, I-13 notifikasi |
| 401 | `UNAUTHORIZED` | Belum login atau session habis | Redirect ke I-01 |
| 401 | `LOGIN_GAGAL` | Email atau password salah | I-01 |
| 403 | `FORBIDDEN` | Role tidak sesuai | Halaman error |
| 404 | `NOT_FOUND` | Laporan, lokasi, atau reward tidak ditemukan | Toast |
| 409 | `EMAIL_TERDAFTAR` | Email sudah dipakai | I-02 |
| 409 | `SUDAH_DIVERIFIKASI` | Laporan sudah disetujui atau ditolak Operator lain | I-08 |
| 409 | LOKASI\_SUDAH\_DIBERSIHKAN | CleanIt disetujui padahal lokasinya sudah DIBERSIHKAN oleh CleanIt lain (K12) | I-08 |
| 413 | `FILE_TERLALU_BESAR` | File > 20 MB | I-12 |
| 415 | `TIPE_FILE_TIDAK_DIDUKUNG` | Bukan JPG, PNG, atau MP4 | I-12 |
| 422 | `POIN_TIDAK_CUKUP` | Saldo < harga reward | I-04 / I-05 |
| 422 | `STOK_HABIS` | Stok reward 0 saat transaksi | I-05 |
| 422 | DI\_LUAR\_WILAYAH | Koordinat laporan di luar wilayah kerja sama (K10) | I-11, I-13 notifikasi |
| 500 | `INTERNAL_ERROR` | Error tak terduga, termasuk rollback penukaran | Toast umum |

## Tugas Frontend

Ada 26 tugas FE dalam 7 modul. Selama endpoint BE belum siap, semua halaman bisa dikerjakan dengan mock dari FE-04.

### Fondasi

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-01 | Setup proyek FE | Tailwind (atau CSS modules), design tokens dari Figma (warna, font, radius), struktur folder `components/` dan `app/` | Figma | S | – |
| FE-02 | Komponen UI dasar | Button (varian + disabled), Card, Badge, Textbox, Dropdown, Modal, Bottom Sheet, Toast (`notify`), Pagination, Progress Indicator; tiap komponen punya contoh pemakaian | Semua I-xx | M | FE-01 |
| FE-03 | Layout dan navigasi | Bottom nav Home/Lokasi/Hadiah/Profil dengan state aktif; layout Operator (header + nav Laporan) | I-03, I-07 | S | FE-02 |
| FE-04 | API client dan mock | Wrapper `fetch` yang membaca `data`/`error`, peta kode error → pesan Indonesia, mock (misalnya MSW) persis sesuai kontrak | Kontrak awal | M | Kontrak |
| FE-05 | Auth guard | Respons 401 → redirect ke I-01; setelah login, Operator ke I-07 dan Masyarakat ke I-03 | – | S | FE-04, BE-06 |

### Auth dan Beranda

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-06 | Halaman Login | Form email + password, pesan `LOGIN_GAGAL`, link Daftar; tautan Lupa password mengikuti K11 | I-01 | M | FE-04, BE-05 |
| FE-07 | Halaman Register | Validasi format email di client, pesan `EMAIL_TERDAFTAR`, berhasil → Beranda | I-02 | S | BE-05 |
| FE-08 | Beranda | Username dan saldo dari `GET /api/me`; tombol ReportIt, CleanIt, Tukar Hadiah | I-03 | S | BE-05 |

### ReportIt (UC01, UC02)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-09 | State form multi-step | Data bertahan saat pindah I-11 ↔ I-12 ↔ I-13; tombol "Ubah" kembali ke step yang benar tanpa menghapus data lain | C01 | M | FE-02 |
| FE-10 | Step Informasi Dasar | Peta pilih lokasi (Leaflet + OpenStreetMap) dan tombol pakai GPS, date-time picker, isian judul, dropdown sumber dan jenis sampah (K7, K8), validasi client yang meniru `is_terisi` dan `is_format_valid` | I-11, UC01 alt 1–2 | L | FE-09 |
| FE-11 | Step Bukti Media | Kamera (`capture`/`getUserMedia`), pilih file dan drag-drop, preview, hapus, maks. 3 media; cek sisa penyimpanan (`navigator.storage.estimate`) → notify "Gagal"; upload ke `/api/media` dengan progress | I-12, UC02 + alt 1 | L | FE-09, BE-08 |
| FE-12 | Step Tinjau dan Kirim | Ringkasan + peta kecil, `POST /api/laporan`, notifikasi sukses; error 400 ditampilkan tanpa me-reset form | I-13, C01 `buat_laporan` | M | FE-10, FE-11, BE-11 |
| FE-13 | Draf offline | State form tersimpan di localStorage, dipulihkan saat dibuka lagi, dihapus setelah terkirim; banner saat offline | Tabel 2.1 DPPL | M | FE-09 |

### CleanIt (UC04, UC05)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-14 | Halaman Lokasi | Kartu lokasi dari `GET /api/lokasi`, badge jumlah, sort "Terdekat" dihitung di client (rumus haversine dari GPS) | I-09, C07 | M | BE-17 |
| FE-15 | Empty state lokasi | Tampil saat list kosong; tombol ke form ReportIt | I-10, UC04 alt 1 | S | FE-14 |
| FE-16 | Detail lokasi | Peta, status, poin, tombol "Bersihkan" → konfirmasi (desain belum ada) | C14 `tampilkan_lokasi`, `konfirmasi_bersihkan` | M | FE-14 |
| FE-17 | Form bukti pembersihan | Memakai ulang FE-09–FE-12 dengan `jenis: CLEANIT` dan `lokasiId` otomatis; pesan gagal sesuai UC05 alt 1 | UC05 | M | FE-16, FE-12 |

### Penukaran (UC07–UC09)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-18 | Halaman Hadiah | Kartu saldo, list reward, tiga state tombol: Tukar / Kurang \[selisih\] / Habis | I-04, C10, C12 | M | BE-19, BE-20 |
| FE-19 | Konfirmasi penukaran | Bottom sheet dengan pratinjau sisa poin, Batal, Tukarkan (cegah klik ganda); tangani `POIN_TIDAK_CUKUP` dan `STOK_HABIS` | I-05, UC09 alt 1 | M | FE-18, BE-21 |
| FE-20 | Penukaran berhasil | Detail transaksi, salin kode voucher (Clipboard API), saldo ter-refresh, tombol Kembali dan Lihat Riwayat | I-06 | S | FE-19 |
| FE-21 | Riwayat penukaran | List dengan pagination (desain belum ada) | I-04 "Riwayat" | M | BE-22 |

### Operator (UC03, UC06)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-22 | Halaman validasi | Tab ReportIt/CleanIt, badge dari `meta.total`, sort terbaru/terlama, list kartu, pagination 6 per halaman | I-07, C04 | L | BE-12 |
| FE-23 | Modal detail laporan | Info laporan, galeri foto/video, Setujui (ReportIt: input poin dan nama lokasi), Tolak (CleanIt: alasan wajib); tombol nonaktif setelah aksi; tangani `SUDAH_DIVERIFIKASI` dan LOKASI\_SUDAH\_DIBERSIHKAN; list ter-refresh | I-08, C14 | L | FE-22, BE-13–BE-16 |

### Lainnya

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| FE-24 | Halaman Profil | Nama, email, saldo, daftar notifikasi, logout (desain belum ada) | I-03 "Profil", C08 `notify` | M | BE-23 |
| FE-25 | Responsif dan state umum | Tampilan rapi di 360 px dan desktop; skeleton loading, error, dan empty state di semua halaman | KNF | M | Semua halaman |
| FE-26 | Uji end-to-end UI | Checklist skenario normal + alternatif tiap UC dijalankan di HP dan desktop; bug dicatat dan diperbaiki | UC01–UC09 | M | Semua |

## Tugas Backend

Ada 26 tugas BE dalam 7 modul. Setiap endpoint mengikuti alur MVC: route handler → controller (C05, C11, C15, C16) → model (C02, C03, C06, C08, C09, C13).

### Infrastruktur

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-01 | Docker Compose | Service app + PostgreSQL 18 + MinIO, `.env.example` berisi nama variabel tanpa nilai rahasia, satu perintah menjalankan semuanya secara lokal tanpa akun pribadi. `.gitignore` bawaan berpola `.env*` sehingga `.env.example` ikut terabaikan; tambahkan `!.env.example` | Tabel 2.1 DPPL | S | – |
| BE-02 | ORM dan migrasi | Semua tabel di Skema database dibuat lewat migrasi (Prisma/Drizzle), termasuk CHECK `saldo_poin >= 0` dan `stok >= 0` | Kontrak awal | M | BE-01, K1–K5, K7–K10 |
| BE-03 | Seed data | Akun Operator, beberapa akun Masyarakat, reward, dan lokasi contoh (koordinatnya di dalam `lib/wilayah.ts`) untuk demo dan testing | – | S | BE-02 |
| BE-04 | Kerangka API | Helper respons `data`/`error`, error handler global ke kode error, validasi request (misalnya zod), logging | Kontrak awal | M | BE-01 |

### Auth

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-05 | Register, login, logout, `/api/me` | Password di-hash (bcrypt/argon2), session cookie `httpOnly`, email unik → `EMAIL_TERDAFTAR` | I-01, I-02 | M | BE-02, BE-04 |
| BE-06 | Proxy dan cek role | `proxy.ts` (nama baru middleware di Next.js 16) hanya cek cepat sesi untuk redirect halaman; cek role tetap di tiap route handler: endpoint Operator menolak Masyarakat (403) dan semua endpoint login menolak tamu (401) | – | S | BE-05 |

### Media (UC02)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-07 | Storage adapter S3 (R2/MinIO) | Fungsi `upload(file)` dan `getUrl(key)` (presigned read) lewat API S3; endpoint, bucket, dan kredensial dari env, jadi lokal memakai MinIO dan deploy memakai Cloudflare R2 | Komponen Storage | M | BE-01 |
| BE-08 | `POST /api/media` | Validasi tipe dan ukuran (413/415), watermark + timestamp pada foto dengan `sharp`, upload, insert `media`, kembalikan `idMedia` | C03 `input_media`, Q-001 | L | BE-07, BE-04 |

### Laporan (UC01, UC05)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-09 | Model Laporan | Fungsi create, get by id, list dengan filter + pagination, `ubah_status`, `simpan_alasan_penolakan` | C02 | M | BE-02 |
| BE-10 | Validasi laporan | `is_terisi` dan `is_format_valid`: latitude/longitude dalam rentang, waktu tidak di masa depan, sumber dan jenis sampah dari enum, koordinat di dalam wilayah (K10, khusus ReportIt), 1–3 media milik pelapor yang belum tertaut ke laporan lain (K4) | C15 `cek_laporan` | M | BE-09 |
| BE-11 | `POST /api/laporan` | Menerima ReportIt dan CleanIt; CleanIt wajib `lokasiId` berstatus `TERCEMAR`; insert laporan dan penautan `media.laporan_id` dalam satu transaksi; error `DATA_TIDAK_LENGKAP` / `FORMAT_TIDAK_VALID` / DI\_LUAR\_WILAYAH | UC01, UC05 | M | BE-10, BE-08 |
| BE-12 | `GET /api/laporan` dan `/:id` | Filter jenis + status, sort, pagination, `meta.total`; detail berisi media (URL) dan pelapor | C15 `get_all_laporan_unverified`, `get_detail` | M | BE-09, BE-06 |

### Verifikasi (UC03, UC06)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-13 | Setujui ReportIt | Satu transaksi: status → `VALID` dan `petakan_lokasi` (tidak membuat lokasi baru jika ada lokasi dalam radius 50 m yang masih `TERCEMAR`; K13), simpan poin, nama, dan jenis sampah lokasi | C05 `setujui`, C06 Q-001/Q-002 | M | BE-12, BE-17 |
| BE-14 | Setujui CleanIt | Satu transaksi: status → `VALID`, lokasi → `DIBERSIHKAN`, `tambah_poin` ke pelapor, isi `diverifikasi_oleh`/`diverifikasi_at` (sumber notifikasi); hanya jika lokasi masih TERCEMAR, lalu CleanIt lain yang menunggu untuk lokasi itu otomatis ditolak (K12) | C05 `setujui`, C08 Q-003 | M | BE-12, BE-18 |
| BE-15 | Tolak laporan | Status → `TIDAK_VALID`; alasan wajib untuk CleanIt dan disimpan; isi `diverifikasi_oleh`/`diverifikasi_at` (sumber notifikasi) | C05 `tolak` | S | BE-12 |
| BE-16 | Cegah verifikasi ganda | `UPDATE … WHERE status = 'BELUM_DIPERIKSA'`; jika 0 baris berubah → `SUDAH_DIVERIFIKASI` | – | S | BE-13–BE-15 |

### Lokasi, Poin, dan Reward (UC04, UC07–UC09)

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-17 | Model + API Lokasi | `GET /api/lokasi` (default `TERCEMAR`, list kosong jika tidak ada) dan `GET /api/lokasi/:id` | C06, Q-003/Q-004 | S | BE-02 |
| BE-18 | Model Pengguna | `getSaldoPoin`, `cukupPoin`, `kurangiPoin`, `tambah_poin` memakai query di DPPL | C08 Q-001–Q-003 | S | BE-02 |
| BE-19 | ManagerPoin + saldo | `GET /api/poin/saldo` lewat ManagerPoin, bukan model langsung | C11 `lihatSaldo` | S | BE-18 |
| BE-20 | Model + API Reward | `GET /api/reward` (stok > 0, urut harga naik) | C09 Q-001/Q-002 | S | BE-02 |
| BE-21 | Transaksi penukaran | `tukarPoin` dalam BEGIN/COMMIT/ROLLBACK; UPDATE bersyarat saldo dan stok; generate `kodeVoucher` unik; insert `penukaran`; kembalikan sisa poin | C16, C13, UC09 | L | BE-18, BE-20 |
| BE-22 | Riwayat penukaran | `GET /api/penukaran` milik pengguna yang login, dengan pagination | C13 | S | BE-21 |
| BE-23 | Notifikasi | `GET /api/notifikasi` (query laporan milik pengguna yang sudah diverifikasi + `lokasi.poin`, `dibaca` dari `notifikasi_dilihat_at`) dan `POST /api/notifikasi/dibaca` | C08 `notify` (pengganti Q-004) | S | BE-02, BE-09 |

### Kualitas dan rilis

| ID | Tugas | Kriteria selesai | Referensi | Ukuran | Butuh |
| --- | --- | --- | --- | --- | --- |
| BE-24 | Testing | Unit test validasi laporan dan aturan poin; integration test dua penukaran bersamaan (saldo dan stok tidak negatif), verifikasi ganda, serta dua CleanIt untuk satu lokasi; Vitest di `tests/`, dijalankan dengan `npm test` | UC01, UC06, UC09 | M | BE-11, BE-16, BE-21 |
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
- Seed hanya berisi data fiktif, dan folder milestone lama (`docs/M1`–`docs/M8`) tidak diubah.

## Laporan Tugas 9

Bagian B di `docs/M9/K03_G02_Implementasi.md` diisi sambil mengerjakan, bukan di hari terakhir. Sebagian besar isinya sudah ada di dokumen ini.

| Bagian | Isi diambil dari | Penanggung jawab |
| --- | --- | --- |
| B.1 Perubahan dari DPPL | K1–K13 (judul, sumber dan jenis sampah, wilayah sebagai konstanta, radius 50 m, dan seterusnya), tabel `notifikasi` (Q-004 C08) diganti notifikasi turunan dari laporan, MinIO sebagai pengganti R2 di lokal, `proxy.ts` | BE-B, dikumpulkan dari semua paket |
| B.2 Bukti best practices | Daftar branch, riwayat commit, Issues, 2–3 PR beserta review, hasil `npm test` | FE-C |
| B.2.1 Profiling | BE-26 | BE-B |
| B.3 Kendala | Known issues dari checklist QA di tabel Lainnya | FE-C |
| B.4 Kontribusi | Lima paket di atas, satu paket per anggota | Semua |
| B.5 Traceability | Tabel di bawah, kolom lokasi file diisi saat kode jadi | Pemilik paket untuk kelas yang dikerjakannya |

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
