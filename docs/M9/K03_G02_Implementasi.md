<h1>
IF2150 REKAYASA PERANGKAT LUNAK
<br>
TUGAS 9
<br>
IMPLEMENTASI PERANGKAT LUNAK
</h1>
<br>

## *SoClean*
<img src="./assets/Logo.png" width="100%">

### Untuk: *Aurelia Jennifer Gunawan*

Dipersiapkan oleh:
| Informasi | Keterangan |
| --- | --- |
| Kelas | *K-03* |
| Kelompok | *G-02*  |
| Nama Kelompok | *DapinKoding*  |

| NIM | Nama |
|---|---|
| 13525027 | Faishal Ahmad Nurdin      |
| 13525042 | Justin William            |
| 13525060 | M. Aqsha Bagus R.I.B.     |
| 13525087 | Jovan Nathanael           |
| 13525147 | Muhammad Dhafin Al Khairy |
---

> **Petunjuk pengerjaan:** *[Silahkan hapus bagian ini setelah selesai mengerjakan]*
>
> Dokumen ini adalah **spesifikasi sekaligus template laporan singkat** Tugas 9. Bagian **Ketentuan Implementasi** (Bagian A) adalah aturan yang harus kalian ikuti, boleh dihapus dari laporan akhir. Bagian **Laporan Implementasi** (Bagian B) adalah yang **wajib kalian isi**. Gunakan nama, ID, kebutuhan, use case, dan kelas yang konsisten dengan SKPL, APL, dan DPPL.

---

**Deadline:** Rabu, 11 November 2026, 21.50 WIB

---

# BAGIAN A: Ketentuan Implementasi

## A.1 Deskripsi Tugas

Pada tugas ini, kalian mengimplementasikan perangkat lunak yang telah dirancang pada tugas-tugas sebelumnya (SKPL, APL, DPPL) menjadi aplikasi yang **dapat dijalankan**. Platform bebas (web, desktop, atau mobile) selama aplikasi dapat dijalankan ulang oleh asisten mengikuti petunjuk kalian.

Ketentuan umum:
- Setiap anggota bertanggung jawab atas **minimal satu fitur atau modul** dan harus terlihat jelas di riwayat commit/PR.
- Implementasi harus **mengacu pada DPPL**. Jika ada yang berubah (kelas, layar, basis data, dsb.), catat di Bagian B.1. Perubahan itu wajar, tetapi harus tercatat dan beralasan.
- Implementasi **tidak harus berupa kelas** (misalnya fungsi, komponen, *route/handler*, *stored procedure*, atau skrip). Namun, setiap kelas perancangan pada DPPL **wajib dapat ditelusuri** ke implementasinya, dan penelusuran ini dicatat di Bagian B.5.
- Seluruh use case pada SKPL **diprioritaskan** untuk diimplementasikan. Status tiap use case akan dilaporkan pada HIUPL (Tugas 10).
- Seluruh mahasiswa **wajib** mengikuti asistensi akbar.

## A.2 Platform, Bahasa, dan Teknologi

Kalian **bebas** memilih bahasa, framework, library, dan basis data, dengan syarat:

1. **Dapat dijalankan ulang** oleh asisten pada mesin biasa dengan mengikuti README. Versi bahasa/runtime dan seluruh dependensi harus tertulis jelas.
2. **Dependensi dikelola lewat file standar**, misalnya `package.json` + lockfile, `requirements.txt`/`pyproject.toml`, `pom.xml`/`build.gradle`, `composer.json`, `pubspec.yaml`, dan sejenisnya. Jangan meng-commit folder hasil instalasi (`node_modules/`, `venv/`, `build/`, dll.).
3. **Jika memakai layanan eksternal** (basis data cloud, API pihak ketiga, auth, dll.), sediakan cara menjalankan tanpa akun pribadi kalian, atau sediakan data/akun uji pada README. Basis data **sangat disarankan** dapat dijalankan lokal (SQLite, atau Docker Compose untuk PostgreSQL/MySQL/MongoDB).
4. **Arsitektur sesuai DPPL.** Pola arsitektur yang kalian pilih di APL/DPPL (MVC, layered, client-server, dll.) harus terlihat pada struktur kode.

Ketentuan tambahan per platform:

| Platform | Ketentuan |
| :--- | :--- |
| **Web** | Berjalan lokal lewat satu-dua perintah yang terdokumentasi. Boleh juga di-*deploy*; jika ya, cantumkan URL, tetapi **tetap wajib bisa dijalankan lokal** (URL deploy bisa mati). |
| **Desktop** | Berjalan dari source lewat perintah yang terdokumentasi. Build/installer opsional. |
| **Mobile** | Berjalan di emulator/simulator atau perangkat. Sertakan langkah menjalankan, dan **sangat disarankan** melampirkan APK/build di Release. |

## A.3 Keamanan Repository

Repo fork kelompok bersifat **public**, sehingga:

- **Dilarang** meng-commit password, API key, token, `.env` asli, sertifikat/private key, atau data pribadi. Hal ini dapat mengurangi nilai.
- Sediakan `.env.example` berisi nama variabel tanpa nilai rahasia, dan masukkan `.env` ke `.gitignore`.
- Jika sudah terlanjur ter-commit, **cabut/ganti** kredensial tersebut. Menghapus commit saja tidak cukup.
- Data uji/seed harus berupa data fiktif.

## A.4 Struktur Folder

Seluruh kode ditempatkan di `src/` pada repo fork. Jangan mengubah folder milestone lama.

```
src/                              # SELURUH kode implementasi
	README.md                     # dokumentasi utama aplikasi (lihat A.5)
	.env.example                  # jika memakai environment variable
	<struktur kode kalian>        # bebas, mengikuti pola arsitektur DPPL
	tests/                        # test case (jika ada)
docs/
	M9/
		KXX_GYY_Implementasi.md   # laporan ini (Bagian B)
		KXX_GYY_Form-Asistensi.md
```

Catatan:
- `README.md` aplikasi diletakkan di **`src/README.md`**, bukan di root repo.
- Jika kerangka kerja kalian mewajibkan struktur tertentu (misalnya Maven `src/main/java`, Flutter `lib/`, monorepo `frontend/` dan `backend/`), letakkan semuanya **di dalam `src/`**.
- Nama file dan folder pada `docs/M9/` mengikuti aturan penamaan milestone sebelumnya (`KXX_GYY_...`).

## A.5 Isi Minimal `src/README.md`

README harus cukup bagi orang yang belum pernah melihat proyek kalian untuk menjalankan aplikasi dari nol. Minimal berisi:

1. **Deskripsi singkat** aplikasi.
2. **Teknologi yang digunakan** beserta versi (bahasa, framework, basis data).
3. **Prasyarat dan instalasi** (software yang harus ada, perintah instalasi dependensi).
4. **Konfigurasi** (environment variable, setup basis data, migrasi/seed) dan langkah demi langkah menjalankannya.
5. **Cara menjalankan aplikasi** (dan cara menjalankan test, jika ada).
6. **Akun/data uji** untuk mencoba tiap peran pengguna (jika ada login).
7. **Daftar modul/fitur yang diimplementasi** beserta pembagian anggota.
8. **Daftar tabel/koleksi basis data** beserta atributnya (atau tautan ke skema/ERD).

## A.6 Best Practices

Kalian dianjurkan menerapkan praktik berikut. Bukti penerapannya dirangkum pada Bagian B.2.

### 1. Branching
Sesuai aturan umum di README repository, `main` fork kelompok dijaga agar tetap bisa menerima sync dari asisten. Pada tugas ini **sangat disarankan** memakai branch per fitur dengan format `<tipe>/<nama-fitur>` (contoh: `feat/login-page`, `fix/null-cart`), lalu digabungkan ke `main` melalui Pull Request. Skema Gitflow penuh (dengan `develop`) boleh dipakai, tetapi tidak diwajibkan.

### 2. Semantic Commit
Gunakan format `<tipe>(<scope>): <deskripsi>`, misalnya `feat(auth): tambah validasi email`.

| Tipe | Kegunaan |
| :--- | :--- |
| `feat` | Menambahkan fitur baru |
| `fix` | Memperbaiki bug |
| `docs` | Mengubah dokumentasi |
| `style` | Perubahan format/spasi, tanpa mengubah logika |
| `refactor` | Perubahan kode yang tidak menambah fitur atau memperbaiki bug |
| `test` | Menambah/memperbaiki pengujian |
| `chore` | Tugas rutin (build, dependensi, konfigurasi) |

### 3. Track Tasks
Gunakan **GitHub Issues** (dan opsional GitHub Projects) untuk membagi tugas dan melacak progres.
- Pecah fitur besar menjadi issue yang lebih kecil dan tetapkan penanggung jawabnya.
- Hubungkan PR dengan issue (`Closes #12`) dan tutup issue ketika selesai.

### 4. Pull Request dan Code Review
- Setiap PR berisi penjelasan deskriptif tentang apa yang dikerjakan, beserta bukti (tangkapan layar/rekaman/hasil test).
- Setiap PR di-*review* minimal **1 anggota lain**, dengan komentar konstruktif atau approval.

### 5. Pengujian dan Optimasi Performa
- Tulis pengujian untuk logika inti (unit test dan/atau pengujian alur utama). Cakupan penuh tidak diwajibkan, tetapi pengujian pada logika utama dinilai.
- Lakukan **profiling** pada setidaknya satu fitur yang berat (query besar, proses pengolahan data, render list panjang, dsb.), lalu catat temuan dan perbaikannya. Contoh alat:

| Platform | Contoh alat |
| :--- | :--- |
| Web (frontend) | Chrome DevTools (Performance/Network), Lighthouse |
| Web (backend) | Profiler bawaan bahasa, `EXPLAIN` pada query basis data, logging waktu respons |
| Python | `cProfile`, `PyInstrument` |
| Java | VisualVM, JProfiler |
| Mobile | Android Studio Profiler, Flutter DevTools, Xcode Instruments | 

### 6. Penggunaan AI
Penggunaan AI **tetap harus dicatat** pada `docs/KXX_GYY_AI-Usage.md` sesuai ketentuan yang sudah berlaku.

## A.7 Pengumpulan

Pengumpulan dinilai dari **tag release**, bukan commit terakhir.

1. Pastikan seluruh pekerjaan sudah di-*commit* dan di-*push* ke `main` fork kelompok.
2. Buat release dengan tag **`v9.0`** (revisi berikutnya `v9.1`, `v9.2`, dst.) dengan target branch `main`.
3. Yang dinilai adalah **tag terakhir yang dibuat sebelum deadline**.

## A.8 Aturan Tanya Jawab

Agar semua kelompok mendapat jawaban yang sama, pertanyaan dibagi menjadi dua jalur:

| Jenis Pertanyaan | Jalur |
| :--- | :--- |
| **Ketentuan tugas**, misalnya teknologi yang diperbolehkan, struktur folder, format pengumpulan, dan penilaian | **Sheets QnA:** *[tautan sheets QnA]* |
| **Kendala teknis kelompok sendiri**, misalnya error, setup, dan penggunaan git | Grup kelompok bersama asisten masing-masing |

Ketentuan:
1. Pertanyaan tentang ketentuan tugas **wajib** diajukan melalui Sheets QnA. Periksa terlebih dahulu apakah pertanyaan serupa sudah dijawab.
2. Jika pertanyaan tentang ketentuan tugas tetap diajukan langsung kepada asisten kelompok, asisten **berhak menolak menjawab** dan meminta kelompok memasukkan pertanyaannya ke Sheets QnA.
3. Jika pertanyaan di Sheets QnA **belum dijawab dalam 24 jam**, kelompok boleh menghubungi asisten kelompok masing-masing. Cantumkan pertanyaan yang sudah diajukan di sheets tersebut.
4. Jawaban pada Sheets QnA berlaku untuk **seluruh kelompok** dan menjadi acuan jika terjadi perbedaan pemahaman.

---

# BAGIAN B: Laporan Implementasi

## B.1 Perubahan dari DPPL

Catat semua perbedaan antara perancangan (DPPL) dan implementasi akhir. Jika tidak ada perubahan, tuliskan "Tidak ada perubahan".

Tabel B.1. Perubahan dari DPPL

Acuan implementasi adalah kontrak v0.6 (`docs/contracts/SoClean — Pembagian Tugas FE & BE v0.6.md`). Kode K1–K13 dan N1–N16 merujuk ke tabel keputusan di kontrak tersebut.

| No | Bagian DPPL | Rancangan Awal | Implementasi Akhir | Alasan |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Kelas C02 Laporan (atribut), UC05 sequence | Laporan tidak punya jenis maupun rujukan ke lokasi; `buat_laporan` CleanIt memakai parameter yang sama dengan ReportIt | Tabel `laporan` punya `jenis` (REPORTIT/CLEANIT) dan `lokasi_id`, wajib untuk CleanIt (CHECK per jenis) | Sistem harus tahu lokasi mana yang dibersihkan dan membedakan dua jenis laporan (K1) |
| 2 | Kelas C06 Lokasi, UC04 `konfirmasi_bersihkan` | Status lokasi hanya "Tercemar", tanpa operasi ubah status; UC04 berakhir "Lokasi dipilih untuk dibersihkan" | Status `TERCEMAR` → `DIBERSIHKAN` saat CleanIt valid; `konfirmasi_bersihkan` hanya berpindah ke form, tanpa reservasi | Lokasi yang sudah bersih tidak boleh terus tampil sebagai bounty (K2) |
| 3 | C05 Algo-001, C11 `tambah_poin` | `jumlahPoin` tidak pernah didefinisikan | Kolom `lokasi.poin`, dipilih Operator dari dropdown 50/100/200 saat menyetujui ReportIt (CHECK di database) | Asal poin harus jelas; pilihan tetap mencegah salah ketik nilai besar (K3) |
| 4 | Kelas C01, C02, C14 (`idMedia`), C03 Q-001 | Satu laporan satu `idMedia`; INSERT media hanya `url` | 1–3 media per laporan lewat `media.laporan_id`, media diunggah dulu lalu ditautkan dalam transaksi | Mockup I-12 mendukung banyak media (K4) |
| 5 | Kelas C13 Penukaran, layar I-06 | Kode voucher tampil di I06-03 tetapi tidak ada di model | Kolom `penukaran.kode_voucher`, format `SC-XXXX-XXXX`, dummy tanpa alur klaim | Reward bersifat dummy (SKPL 2.4) (K5, N13) |
| 6 | C03 Algo-001 | Watermark dan timestamp ditambahkan di perangkat sebelum diunggah | Watermark "SoClean · Diunggah … WIB" dibuat di server dengan `sharp`, hanya untuk foto; video tanpa watermark | Watermark dari client bisa dipalsukan; `sharp` tidak memproses video. Watermark menjadi penanda, bukan bukti keaslian (K6, N4) |
| 7 | KF02, UC02, C03 `input_media()` | Media diambil dari kamera perangkat | Media dari kamera atau berkas (satu input file; di HP menawarkan kamera atau galeri) | Sejalan dengan US-04/US-06, mockup I12-07 (pilih file dan drag-drop), UC05 alt 1, dukungan desktop, dan mode offline (N4) |
| 8 | Kelas C03 Media | Tidak ada pengecekan media yang dipakai ulang | Kolom `media.sha256` (hash file asli); file identik dengan media laporan yang berlaku ditolak (`MEDIA_SUDAH_DIGUNAKAN`) | Menutup pemakaian ulang foto, terutama foto laporan asal sebagai bukti pembersihan (Aturan CleanIt) |
| 9 | Kelas C02, layar I-11, I07-11, I08-04 | Judul tampil di I-07/I-08 tetapi tidak ada di form maupun model | Kolom `judul` (maks. 80) dan isian judul; untuk CleanIt diisi otomatis "Pembersihan {nama lokasi}" dan bisa diedit | Menyelaraskan mockup dengan model (K7) |
| 10 | Layar I-08 (I08-08), I-11 (I11-10), I-09 (I09-05) | "Sumber Laporan" vs "Sumber Pencemaran"; jenis sampah tidak ada di model | `sumber` = sumber laporan (enum), label I-08 "Sumber Laporan"; kolom `jenis_sampah` di laporan dan lokasi | Menghilangkan arti ganda dan melengkapi model (K8) |
| 11 | Kelas C06, C15 `petakan_lokasi` | Lokasi punya nama dan alamat, form hanya satu isian; `lokasi` kadang teks kadang koordinat | `lokasi_teks` + `latitude`/`longitude` di laporan; `nama` (diisi Operator) dan `alamat` di lokasi | Teks alamat dan koordinat adalah data berbeda (K9) |
| 12 | DPPL 1.2, SKPL 2.4, C15 | Laporan dibatasi pada wilayah kerja sama tanpa data maupun validasi | Konstanta `lib/wilayah.ts` berisi Sungai Cikapundung (Teras Cikapundung), Pantai Ancol, dan Pantai Pangandaran; ReportIt di luar wilayah → `DI_LUAR_WILAYAH` | Daftar wilayah tidak diubah dari UI, jadi tidak perlu tabel; mitra kerja sama adalah data contoh (K10) |
| 13 | Layar I-01 (IO1-002), I-02 (IO2-003) | Tautan "Lupa password" | Tautan dihapus; tidak ada reset password | Tidak ada use case maupun endpoint untuk fitur ini (K11) |
| 14 | C05 Algo-001 | Persetujuan CleanIt tidak mengecek status lokasi | Disetujui hanya jika lokasi masih TERCEMAR (UPDATE bersyarat dalam transaksi); CleanIt lain yang menunggu untuk lokasi itu otomatis ditolak | Mencegah poin keluar berkali-kali untuk satu lokasi (K12) |
| 15 | C06 Q-001 | Duplikat dicek dengan kesamaan koordinat persis | Lokasi TERCEMAR dalam radius 50 m (haversine) dianggap sama; ReportIt digabung ke lokasi lama, Operator melihat `lokasiTerdekat` sebelum menyetujui | Koordinat GPS hampir tidak pernah sama persis, sehingga satu tempat bisa jadi dua bounty (K13) |
| 16 | DPPL 1.2 | "Setiap kontribusi yang dinyatakan valid diganjar poin" | Poin hanya untuk CleanIt yang valid; ReportIt tidak mendapat poin | Mengikuti KF10 dan sequence UC03 yang tidak memanggil `tambah_poin` (N1) |
| 17 | Layar I-03 (IO3-005 `buka_cleanit()`), UC05 | Method `buka_cleanit()` tidak ada; UC05 langsung membuka form tanpa memilih lokasi | Tombol CleanIt membuka I-09; form CleanIt hanya dari tombol "Bersihkan" lewat route `/cleanit/[idLokasi]` | Form CleanIt membutuhkan `lokasiId` (N2) |
| 18 | C09 Q-001, layar I-04 (I04-08) | Reward difilter `stok > 0`, padahal I-04 punya tombol "Habis" | Semua reward dikembalikan (stok > 0 dulu); stok 0 tampil "Habis" | Agar state "Habis" di mockup bisa muncul (N3) |
| 19 | SKPL 2.4, Tabel 2.1 DPPL, C03 | Mode offline "mengupload media di lokal" | Draf offline hanya isian teks (localStorage); media diambil dengan kamera bawaan HP lalu dipilih saat online; file terpilih disimpan di memori tab dan diunggah saat online | localStorage tidak bisa menyimpan file 20 MB; unggah berkas sudah diizinkan (N5) |
| 20 | C15 `is_format_valid`, UC05 | Hanya mengecek tipe data | Aturan CleanIt: lokasi masih TERCEMAR (dibaca dengan `SELECT … FOR SHARE` dalam transaksi), satu CleanIt menunggu per pengguna per lokasi (unique index parsial), waktu pembersihan ≥ waktu laporan asal, media tidak dipakai ulang, hanya Masyarakat yang membuat laporan. Pelapor asal boleh membersihkan lokasinya sendiri dengan tanda "Pelapor = Relawan" di I-08 | Menutup kecurangan dengan satu akun tanpa melarang alur di diagram aktivitas SKPL 2.1 (N6) |
| 21 | Kelas C08 Pengguna, layar I-01, I-02 | Auth tidak punya UC/KF; C08 tidak punya email, password, maupun role | Tabel `pengguna` punya `email`, `password_hash`, `role`; session JWT di cookie `httpOnly`; akun Operator hanya lewat seed; aturan password 8–72 karakter, hash bcrypt/argon2id | Login dan registrasi ada di US-03 dan SKPL 2.1 (N7) |
| 22 | C08 `notify`, Q-004 | Tabel notifikasi; `notify` tidak dipanggil di sequence mana pun | Tanpa tabel: notifikasi diturunkan dari laporan yang sudah diverifikasi + `pengguna.notifikasi_dilihat_at` | Pengirim (Operator) berbeda dengan penerima (pelapor); data notifikasi sudah ada di laporan (N8) |
| 23 | Layar I-08, kelas C14 | Detail laporan hanya dirancang untuk ReportIt | CleanIt menampilkan galeri Sebelum (media laporan asal) dan Sesudah, tanda "Pelapor = Relawan" + jumlah 30 hari | Operator perlu membandingkan kondisi sebelum dan sesudah (N9) |
| 24 | Layar I-07 (I07-12–I07-14) | Checkbox, "Batalkan", dan "Tinjau laporan" | Pilihan tunggal: klik kartu langsung membuka I-08 | I-08 hanya menampilkan satu laporan (N10) |
| 25 | KNF02, layar I-10 (I10-04) | "Titik laporan di sekitar lokasi pengguna" | Tanpa filter radius; urutan Terdekat di client, jatuh ke Terbaru jika izin GPS ditolak | Query `get_all_lokasi_valid` memang mengambil semua lokasi (N11) |
| 26 | UC09 sequence, C12 `pilihReward`, C16 `tukarPoin` | `pilihReward` langsung memanggil `tukarPoin`; hasil Boolean tanpa skenario stok habis | Konfirmasi di I-05; kegagalan dibedakan lewat `POIN_TIDAK_CUKUP`, `STOK_HABIS`, `NOT_FOUND` | KF13 menyebut "ketika pengguna mengonfirmasi" (N12) |
| 27 | Layar baru (I04-04, I06-10, IO3-009, I07-04) | Riwayat dan Profil dirujuk tanpa UC maupun desain | Halaman Riwayat Penukaran, Profil Masyarakat (nama, email, saldo, notifikasi, logout), Profil Operator (nama, logout); desain dari komponen yang ada | Tautan di mockup harus punya tujuan (N13) |
| 28 | UC03/UC06 sequence, C05 Algo-001 | `ubah_status`, `petakan_lokasi`, `tambah_poin` dipanggil terpisah; Algo-001 memanggil model langsung | Setujui/tolak dalam satu transaksi lewat ManagerLaporan | Mencegah data setengah jadi dan menyelaraskan algoritma dengan sequence (N14) |
| 29 | C03 Algo-002 `is_penyimpanan_penuh()`, `MAX_MEDIA_SIZE` | Mengecek penyimpanan perangkat penuh; batas ukuran tanpa nilai | "Gagal menyimpan media secara lokal" (`QuotaExceededError` atau kuota situs kurang); `MAX_MEDIA_SIZE` = 20 MB | Browser tidak bisa membaca sisa ruang perangkat (N15) |
| 30 | Tipe data, nama method, dan alur MVC di BAB 4–5 | ID dan waktu bertipe campur, status berupa string, nama method ganda, View melakukan INSERT | Kontrak v0.6 sebagai satu-satunya acuan; pemetaan nama di B.5 | Menyatukan acuan implementasi (N16) |
| 31 | Tabel 2.1 DPPL (Storage), komponen middleware | Cloudflare R2; middleware Next.js | RustFS (S3) untuk lokal, R2 untuk deploy; `proxy.ts` | Image MinIO dihapus dari Docker Hub; Next.js 16 mengganti nama middleware menjadi proxy |
| 32 | Layar I-01 (IO1-004), I-03 (IO3-002) | Login yang berhasil selalu membuka Beranda; skor di Beranda ditampilkan lewat C12 `tampilkanSaldo` | Setelah login, Masyarakat diarahkan ke Beranda (I-03) dan Operator ke Validasi Laporan (I-07); halaman dijaga sesuai role dan sesi yang habis (401) kembali ke Login. Beranda menampilkan nama dan saldo dari `GET /api/me` (C08) | Operator tidak punya Beranda maupun saldo poin; nama dan saldo cukup diambil dengan satu request (FE-05, FE-08) |

## B.2 Bukti Penerapan Best Practices

Tabel B.2. Bukti Best Practices

| Praktik | Bukti | Keterangan |
| :--- | :--- | :--- |
| Branching | *[Tautan ke daftar branch / graph commit]* | *[Skema yang dipakai]* |
| Semantic commit | *[Tautan ke riwayat commit]* | *[Ringkasan]* |
| Track tasks | *[Tautan ke Issues/Projects]* | *[Jumlah issue, pembagian]* |
| Pull request dan review | *[Tautan ke 2-3 PR representatif]* | *[Siapa me-review siapa]* |
| Pengujian | *[Tautan ke `src/tests/` dan hasil test]* | *[Apa yang diuji, cara menjalankan]* |

### B.2.1 Profiling dan Optimasi

Profiling dilakukan pada dua query backend (BE-26) dengan skrip `npm run db:profil` (`src/so-clean/server/db/profiling/`) di database terpisah `soclean_test` yang berisi data sintetis: 10.000 lokasi (8.972 TERCEMAR) di dalam tiga wilayah kerja sama dan 22.000 laporan (10.000 menunggu verifikasi). SQL yang diukur adalah SQL asli yang dihasilkan fungsi model, dijalankan dengan `EXPLAIN (ANALYZE, BUFFERS)` sebanyak 7 kali; angka di bawah adalah median.

**1. Pencarian lokasi dalam radius 50 m (diperbaiki)**

| Informasi | Keterangan |
| :--- | :--- |
| Fitur / proses yang diprofil | Pencarian lokasi TERCEMAR terdekat dalam radius 50 m (K13), `cariTerdekatTercemar` di `server/models/lokasi.ts`. Dipakai saat Operator menyetujui ReportIt (penggabungan lokasi, BE-13) dan untuk `lokasiTerdekat` di detail laporan (BE-12) |
| Alat | PostgreSQL `EXPLAIN (ANALYZE, BUFFERS)` lewat skrip `npm run db:profil` |
| Temuan (sebelum) | `Seq Scan on lokasi`: seluruh 10.000 baris dibaca dan rumus haversine dihitung untuk setiap baris, padahal hanya 46 lokasi yang berada dalam radius 50 m (titik uji Cikapundung). Median 2,1–3,6 ms per pencarian (142 buffer) dan naik linear dengan jumlah lokasi. Index `lokasi_status_idx` tidak membantu karena hampir semua lokasi berstatus TERCEMAR |
| Perbaikan | (1) Prefilter kotak lat/lng di query (`kotakPencarian`): rentang lintang dan bujur yang pasti memuat seluruh lingkaran 50 m, sehingga haversine hanya dihitung untuk kandidat di dalam kotak; hasil tidak berubah karena haversine tetap menjadi penentu akhir. (2) Index parsial `lokasi_tercemar_koordinat_idx` pada `(latitude, longitude) WHERE status = 'TERCEMAR'` (migrasi `0003_lokasi_tercemar_koordinat.sql`) agar kotak itu dibaca lewat index |
| Hasil (sesudah) | Query membaca index `lokasi_tercemar_koordinat_idx`: `Index Scan` di Pangandaran dan Ancol (2 dan 4 buffer), `Bitmap Index Scan` di Cikapundung yang terpadat (55 kandidat diperiksa, bukan 10.000, dengan 47 buffer). Median turun menjadi 0,03–0,16 ms, sekitar 23–75 kali lebih cepat. Prefilter kotak saja (tanpa index) sudah menurunkan median ke ±0,62 ms |

| Titik uji | Sebelum | Prefilter kotak | Prefilter + index |
| :--- | ---: | ---: | ---: |
| Pangandaran (−7,7202; 108,6593) | 2,135 ms | 0,619 ms | 0,051 ms |
| Cikapundung (−6,8842; 107,6072), wilayah terpadat | 3,626 ms | 0,651 ms | 0,158 ms |
| Ancol (−6,1310; 106,8672) | 2,567 ms | 0,620 ms | 0,034 ms |

**2. Daftar laporan Operator (sudah memadai)**

| Informasi | Keterangan |
| :--- | :--- |
| Fitur / proses yang diprofil | Daftar laporan Operator `GET /api/laporan` (I-07), `getDaftarLaporan` di `server/models/laporan.ts`: query data per halaman dan query `count` untuk `meta.total` |
| Alat | PostgreSQL `EXPLAIN (ANALYZE, BUFFERS)` lewat skrip `npm run db:profil` |
| Temuan | Query data halaman 1 memakai index `laporan_antrean_idx (jenis, status, created_at)`: 0,03 ms (ReportIt) dan 0,04 ms (CleanIt). `count` ReportIt memakai Seq Scan (2,9 ms) karena 6.000 dari 22.000 baris cocok sehingga planner memilih scan penuh; `count` CleanIt memakai index (0,8 ms). Skenario terberat adalah halaman ke-1.000 (count 4,1 ms + data 3,6 ms, akibat OFFSET) dan daftar tanpa filter `jenis` (count 4,8 ms + data 6,2 ms) |
| Perbaikan | Tidak ada perubahan |
| Hasil | Sudah memadai: semua skenario di bawah 7 ms pada 22.000 laporan. FE-22 selalu mengirim `jenis` dan menampilkan 6 laporan per halaman, sehingga skenario terberat (tanpa `jenis` atau ribuan halaman) tidak terjadi di aplikasi. Karena itu tidak ditambahkan index lain pada tabel `laporan` |

Cara mengulang (dari folder `src/`): `docker compose exec -e POSTGRES_DB=soclean_test web npm run db:profil`. Skrip ini mengosongkan `soclean_test` dan hanya berjalan pada database berakhiran `_test`; sebaliknya, `npm test` juga mengosongkan database itu, jadi jalankan profiling setelah test.

## B.3 Kendala dan Catatan Penting

Tuliskan kendala yang ditemui, fitur yang belum sempurna (*known issues*), serta hal yang perlu diketahui asisten saat menjalankan atau menilai aplikasi (misalnya akun uji khusus, urutan menjalankan, atau batasan).

*Known issues* yang sudah diketahui sejak perancangan (kontrak v0.6):

- **Multi-akun dan kolusi.** Registrasi cukup dengan email tanpa verifikasi identitas, jadi satu orang bisa memakai beberapa akun (akun A melapor, akun B membersihkan). Pertahanannya verifikasi Operator.
- **Membuang sampah lalu membersihkannya sendiri.** Foto sebelum dan sesudah asli, sehingga tidak bisa dideteksi sistem. Tanda "Pelapor = Relawan" dan hitungan 30 hari di I-08 hanya membuat pola ini terlihat oleh Operator.
- **Watermark bukan bukti keaslian.** Di aplikasi web, server tidak bisa memastikan file berasal dari kamera. Watermark hanya membuktikan file sudah ada saat diunggah. Cek SHA-256 hanya menolak file yang identik persis; foto yang dipotong atau diubah ukurannya lolos, dan dua laporan yang dikirim tepat bersamaan dengan file identik juga bisa sama-sama lolos.
- **Wilayah kerja sama dan reward adalah data contoh.** Mitra kerja sama (Sungai Cikapundung, Pantai Ancol, Pantai Pangandaran) dan voucher bersifat dummy. Batas wilayah berupa kotak lat/lng, dan koordinat ReportIt bisa diedit pengguna.
- **Tanpa batas percobaan login** dan tanpa reset password.
- **Draf offline tidak terikat akun.** Draf form laporan disimpan per perangkat di `localStorage`, jadi pada perangkat yang dipakai bersama, pengguna lain yang login di browser yang sama bisa melihat draf yang belum terkirim.
- **Figma belum diperbarui** untuk tautan Lupa password yang dihapus, halaman Profil, Riwayat Penukaran, galeri Sebelum/Sesudah, dan dropdown poin; desainnya dibuat langsung dari komponen yang ada.

## B.4 Kontribusi Anggota

Tabel B.4. Kontribusi Anggota

| NIM | Nama | Modul / Fitur yang Dikerjakan | Persentase Kontribusi |
| :--- | :--- | :--- | :--- |
| 13525027 | Faishal Ahmad Nurdin | *[Modul/fitur]* | *[%]* |
| 13525042 | Justin William | *[Modul/fitur]* | *[%]* |
| 13525060 | M. Aqsha Bagus R.I.B. | *[Modul/fitur]* | *[%]* |
| 13525087 | Jovan Nathanael | **FE-A: fondasi FE, auth, dan draf offline** (FE-01–FE-08, FE-13). Setup Tailwind CSS 4 dan design tokens dari Figma; komponen UI dasar (Button, Card, Badge, Textbox, Dropdown, Modal, Bottom Sheet, Toast `notify`, Pagination, Progress Indicator); layout dan navigasi Masyarakat dan Operator; API client dengan peta pesan error dan mock MSW; auth guard dan pengarahan sesuai role; halaman Login (I-01), Register (I-02), dan Beranda (I-03); draf offline form laporan | 20% |
| 13525147 | Muhammad Dhafin Al Khairy | *[Modul/fitur]* | *[%]* |

## B.5 Traceability Kelas Perancangan ke Implementasi

Pemetaan dari **setiap kelas perancangan** pada DPPL (Tabel 4.1) ke wujud implementasinya. Bentuk implementasi bebas (kelas, fungsi, komponen, *route/handler*, *stored procedure*, skrip, dsb.), tetapi tiap kelas perancangan harus muncul pada tabel ini. Jika implementasi berupa kelas dengan nama yang sama, tetap dicantumkan.

Tabel B.5. Traceability Kelas Perancangan ke Implementasi

| ID Kelas | Nama Kelas Perancangan | Bentuk Implementasi | Lokasi (File dan Nama) | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| C01 | *FormLaporan* | *[Diisi FE-B: komponen form ReportIt dan CleanIt]* | *[Diisi FE-B]* | *[Diisi FE-B]* |
| C01 | *FormLaporan* | Komponen (kartu menu di Beranda) | `src/so-clean/components/Beranda.tsx` - `Beranda`; `src/so-clean/lib/beranda.ts` - `MENU_LAPORAN` | `buka_reportit()` menjadi kartu ReportIt yang membuka `/reportit` (I-11). `buka_menu_cleanit()` menjadi kartu CleanIt yang membuka daftar lokasi `/lokasi` (I-09), bukan form CleanIt langsung (B.1 no. 17) |
| C01 | *FormLaporan* | Fungsi, hook, dan komponen (draf offline) | `src/so-clean/lib/draf-laporan.ts` - `simpanDraf`, `bacaDraf`, `hapusDraf`; `src/so-clean/components/laporan/useDrafLaporan.ts` - `useDrafLaporan`; `src/so-clean/components/laporan/PemberitahuanDraf.tsx` - `PemberitahuanDraf` | Penyimpanan lokal saat luring (Tabel 2.1 DPPL). Atribut teks form (judul, `lokasi`, koordinat, `waktu`, `sumber`, jenis sampah) disimpan di `localStorage` setiap kali berubah, dipulihkan saat form dibuka lagi, dan dihapus setelah laporan terkirim. `idMedia` dan berkas media tidak masuk draf; form meminta pengguna memilih ulang media jika tab sempat ditutup (B.1 no. 19) |
| C01 | *FormLaporan* | Fungsi dan komponen (notifikasi) | `src/so-clean/components/ui/toast-store.ts` - `notify`; `src/so-clean/components/ui/Toast.tsx` - `Toaster` | `notify(msg)` menjadi toast bersama (`notify.sukses`, `notify.gagal`, `notify.info`); dipakai form laporan dan juga View lain, misalnya C12 HalamanPenukaran untuk `tampilkanNotifikasi`. Atribut `msg` menjadi argumen pesan |
| C02 | *Laporan* | *[Diisi BE-A]* | *[Diisi BE-A]* | *[Diisi BE-A]* |
| C03 | *Media* | *[Diisi BE-A]* | *[Diisi BE-A]* | *[Diisi BE-A]* |
| C04 | *DaftarLaporan* | *[Diisi FE-C]* | *[Diisi FE-C]* | *[Diisi FE-C]* |
| C05 | *ValidatorLaporan* | *[Diisi BE-B]* | *[Diisi BE-B]* | *[Diisi BE-B]* |
| C06 | *Lokasi* | *[Diisi BE-B]* | *[Diisi BE-B]* | *[Diisi BE-B]* |
| C07 | *DaftarLokasi* | *[Diisi FE-B]* | *[Diisi FE-B]* | *[Diisi FE-B]* |
| C08 | *Pengguna* | *[Diisi BE-A dan BE-B: model dan tabel `pengguna`]* | *[Diisi BE-A dan BE-B]* | *[Diisi BE-A dan BE-B]* |
| C08 | *Pengguna* | Komponen (tampilan data pengguna) | `src/so-clean/components/Beranda.tsx` - `Beranda`; `src/so-clean/lib/api/endpoints.ts` - `authApi.me` | Atribut `nama` dan `saldoPoin` ditampilkan di Beranda dari `GET /api/me` (B.1 no. 32). Saldo selalu dibaca ulang dari server, tidak disimpan di client |
| C08 | *Pengguna* | Komponen dan fungsi (akun: Login dan Register) | `src/so-clean/components/FormLogin.tsx` - `FormLogin`; `src/so-clean/components/FormRegister.tsx` - `FormRegister`; `src/so-clean/lib/login.ts` - `validasiLogin`; `src/so-clean/lib/register.ts` - `validasiRegister` | Tambahan di luar DPPL karena C08 tidak punya email, password, maupun role (B.1 no. 21). Validasi client meniru aturan akun (nama 1–100, email dinormalisasi, password 8–72 dan tidak sama dengan email); setelah login, Masyarakat diarahkan ke Beranda dan Operator ke validasi laporan |
| C09 | *Reward* | *[Diisi BE-B]* | *[Diisi BE-B]* | *[Diisi BE-B]* |
| C10 | *DaftarReward* | *[Diisi FE-C]* | *[Diisi FE-C]* | *[Diisi FE-C]* |
| C11 | *ManagerPoin* | *[Diisi BE-B]* | *[Diisi BE-B]* | *[Diisi BE-B]* |
| C12 | *HalamanPenukaran* | *[Diisi FE-C]* | *[Diisi FE-C]* | *[Diisi FE-C]* |
| C13 | *Penukaran (Model)* | *[Diisi BE-B]* | *[Diisi BE-B]* | *[Diisi BE-B]* |
| C14 | *LaporanView* | *[Diisi FE-C]* | *[Diisi FE-C]* | *[Diisi FE-C]* |
| C15 | *ManagerLaporan* | *[Diisi BE-A]* | *[Diisi BE-A]* | *[Diisi BE-A]* |
| C16 | *Penukaran (Controller)* | *[Diisi BE-B]* | *[Diisi BE-B]* | *[Diisi BE-B]* |

Unit pendukung FE tanpa acuan terhadap kelas DPPL:

| Unit | Lokasi (File dan Nama) | Peran |
| :--- | :--- | :--- |
| Design tokens | `src/so-clean/app/globals.css` (`@theme`) | Warna, font, dan radius dari Figma menjadi utility Tailwind yang dipakai semua View |
| Komponen UI dasar | `src/so-clean/components/ui/` - `Button`, `Card`, `Badge`, `Textbox`, `Dropdown`, `Modal`, `BottomSheet`, `Pagination`, `ProgressLangkah` | Komponen bersama semua View; contoh pemakaian di halaman `/design` |
| Layout dan navigasi | `src/so-clean/components/BottomNav.tsx` - `BottomNav`; `src/so-clean/components/HeaderOperator.tsx` - `HeaderOperator`; `src/so-clean/lib/nav.ts` - `ROUTE` | Bottom nav Masyarakat (Home/Lokasi/Hadiah/Profil) dan header Operator |
| API client | `src/so-clean/lib/api/client.ts` - `api`, `ApiError`; `src/so-clean/lib/api/endpoints.ts`; `src/so-clean/lib/api/pesan-error.ts` - `PESAN_ERROR` | Satu pintu pemanggilan View ke Controller (`/api/...`): membaca `{ data }`/`{ error }` dan memetakan seluruh kode error kontrak ke pesan Indonesia |
| Mock API | `src/so-clean/mocks/` (MSW) | Meniru respons kontrak agar View bisa dikembangkan sebelum endpoint siap |
| Auth guard | `src/so-clean/lib/akses.ts` - `aturanHalaman`, `halamanAwal`; `src/so-clean/proxy.ts` (bersama BE-06) | Tamu hanya bisa membuka Login/Register; halaman Operator hanya untuk Operator dan halaman Masyarakat hanya untuk Masyarakat; respons 401 mengarahkan ke Login |

Catatan:
- Satu kelas perancangan boleh diwujudkan oleh beberapa file/unit, dan satu file/unit boleh mewujudkan beberapa kelas perancangan. Tuliskan semuanya.
- Kelas perancangan yang **tidak diimplementasikan** atau **digabung/dipecah** tetap dicantumkan, dan alasannya dicatat di Bagian B.1.

Catatan penamaan DPPL ke kode (N16):

- Nama method di kode memakai camelCase. Nama ganda di DPPL disatukan: `tambah_poin`/`tambahPoin` → `tambahPoin`, `simpan_laporan`/`simpanLaporan` → `simpanLaporan`, `is_unverified`/`get_unverified` → `getAllLaporanUnverified`, `get_data`/`get_detail` → `getDetail`.
- ID laporan, lokasi, media, dan reward bertipe `number` (serial); ID pengguna dan penukaran bertipe `string` (uuid). Waktu selalu string ISO 8601 di API dan `timestamptz` di database.
- Status memakai enum huruf besar (`BELUM_DIPERIKSA`, `VALID`, `TIDAK_VALID`, `TERCEMAR`, `DIBERSIHKAN`), bukan string bebas.
- `is_valid()` tidak diimplementasikan karena tidak dipakai di sequence mana pun. `LaporanController` di DPPL diwujudkan sebagai C15 ManagerLaporan.
- Operasi tulis hanya dilakukan Model lewat Controller; View (misalnya C04 DaftarLaporan) tidak melakukan INSERT, dan Model tidak memanggil View.
