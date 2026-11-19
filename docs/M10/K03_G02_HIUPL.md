<h1>
IF2150 REKAYASA PERANGKAT LUNAK
<br>
TUGAS 10
<br>
HASIL IMPLEMENTASI DAN UJI PERANGKAT LUNAK (HIUPL)
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

## Daftar Isi

- [BAB 1: Pendahuluan](#bab-1-pendahuluan)
  - [1.1 Tujuan Penulisan Dokumen](#11-tujuan-penulisan-dokumen)
  - [1.2 Lingkup Masalah](#12-lingkup-masalah)
  - [1.3 Definisi, Istilah, dan Singkatan](#13-definisi-istilah-dan-singkatan)
  - [1.4 Aturan Penomoran](#14-aturan-penomoran)
  - [1.5 Referensi](#15-referensi)
  - [1.6 Deskripsi Umum Dokumen (Ikhtisar)](#16-deskripsi-umum-dokumen-ikhtisar)
- [BAB 2: Deskripsi Umum Perangkat Lunak](#bab-2-deskripsi-umum-perangkat-lunak)
- [BAB 3: Implementasi](#bab-3-implementasi)
  - [3.1 Lingkungan Implementasi](#31-lingkungan-implementasi)
  - [3.2 Implementasi Modul](#32-implementasi-modul)
  - [3.3 Implementasi Antarmuka](#33-implementasi-antarmuka)
  - [3.4 File Lain](#34-file-lain)
- [BAB 4: Hasil Pengujian](#bab-4-hasil-pengujian)
  - [4.1 Strategi dan Kedalaman Pengujian Kelas](#41-strategi-dan-kedalaman-pengujian-kelas)
  - [4.2 Pengujian Unit Kelas](#42-pengujian-unit-kelas)
    - [4.2.1 Kelas \[Nama Kelas 1\]](#421-kelas-nama-kelas-1)
    - [4.2.2 Kelas \[Nama Kelas 2\]](#422-kelas-nama-kelas-2)
  - [4.3 Pengujian Integrasi](#43-pengujian-integrasi)
  - [4.4 Pengujian Use Case](#44-pengujian-use-case)
    - [4.4.1 Use Case \[Nama Use Case 1\]](#441-use-case-nama-use-case-1)
    - [4.4.2 Use Case \[Nama Use Case 2\]](#442-use-case-nama-use-case-2)
  - [4.5 Pengujian Kebutuhan Non-Fungsional (KNF)](#45-pengujian-kebutuhan-non-fungsional-knf)
  - [4.6 Tangkapan Layar dan Bukti Hasil Pengujian](#46-tangkapan-layar-dan-bukti-hasil-pengujian)
- [BAB 5: Traceability](#bab-5-traceability)

---

## Daftar Perubahan

| Revisi | Deskripsi |
| :--- | :--- |
| *A* | Penyesuaian ID algoritma pada DPPL2 |
| *B* |  |
| *C* |  |
| ... |  |

---

# BAB 1: Pendahuluan

## 1.1 Tujuan Penulisan Dokumen
<!-- Tuliskan uraian ringkas mengenai isi dokumen, tujuan pembuatan dokumen HIUPL ini, dan siapa saja target pembacanya. -->

Dokumen Hasil Implementasi dan Uji Perangkat Lunak (HIUPL) ini melanjutkan dokumen SKPL, APL, DPPL, dan Implementasi perangkat lunak SoClean. Terdapat dua bagian pada isinya. Bagian pertama adalah laporan implementasi: elemen P/L yang sudah dibangun (kelas/modul, interface, dan file pendukung), lingkungan implementasinya, serta perubahan terhadap rancangan di DPPL. Bagian kedua adalah laporan pengujian: pengujian unit kelas, pengujian integrasi antarkomponen, pengujian use case, dan pengujian kebutuhan non-fungsional, lengkap dengan bukti dan matriks kerunutan (traceability) dari KF dan KNF ke implementasi dan test case. Dengan dokumen ini, kita bisa memastikan seluruh kebutuhan di SKPL sudah diimplementasikan dan diverifikasi.

Pembaca dokumen ini ada tiga. Tim pengembang (kelompok kami) memakainya sebagai catatan status implementasi dan dasar perbaikan. Asisten dan penguji memakainya untuk memeriksa dan mengulang pengujian. Pemangku kepentingan, misalnya pihak pengelola SoClean yang berperan sebagai Operator, bisa melihat sejauh mana P/L sudah memenuhi kebutuhan yang disepakati.

## 1.2 Lingkup Masalah
<!-- Tuliskan lingkup masalah, yaitu membangun perangkat lunak *[nama perangkat lunak]*. Jelaskan dengan singkat dan jelas deskripsi aplikasi serta keterkaitannya dengan perangkat lunak atau sistem lain (jika ada). Bagian ini maksimal berisi satu paragraf, dapat diambil dari SKPL/DPPL. -->

SoClean adalah perangkat lunak berbasis web yang dapat diakses melalui perangkat desktop maupun mobile untuk menekan kebocoran sampah domestik dari aktivitas darat ke ekosistem perairan Indonesia. Permasalahan ini tergolong mendesak: World Bank memperkirakan Indonesia menghasilkan sekitar 7,8 juta ton sampah plastik setiap tahun dengan sekitar 346.000 ton di antaranya bocor ke laut, sementara kanal pelaporan pemerintah yang tersedia seperti SP4N-LAPOR! dan e-GAKKUM LH hanya menampung laporan tanpa melibatkan masyarakat dalam penanganannya dan kerap lambat ditindaklanjuti, sedangkan aplikasi sejenis seperti Clean Swell hanya bergantung pada sukarelawan tanpa insentif nyata. SoClean menjawab celah tersebut melalui pendekatan crowdsourcing dan gamifikasi dengan dua fitur utama, yaitu ReportIt, tempat masyarakat melaporkan lokasi perairan tercemar beserta bukti foto/video yang kemudian diverifikasi oleh Operator dan dipublikasikan sebagai bounty, serta CleanIt, tempat masyarakat memilih lokasi tercemar tersebut, membersihkannya, lalu mengunggah bukti pembersihan untuk diverifikasi oleh Operator; setiap kontribusi yang dinyatakan valid diganjar poin yang dapat ditukarkan dengan reward. Lingkup sistem dibatasi pada sampah domestik yang dapat ditangani langsung oleh masyarakat (tidak mencakup limbah B3 maupun pelanggaran lain seperti illegal fishing) serta pada wilayah yang bekerja sama, sejalan dengan SDG 14 Target 14.1 mengenai pengurangan polusi laut yang bersumber dari aktivitas darat.

## 1.3 Definisi, Istilah, dan Singkatan
Semua definisi dan singkatan yang digunakan dalam dokumen ini beserta penjelasannya.

Tabel 1.3. Definisi Istilah dan Singkatan

| Singkatan, Akronim, atau Istilah | Penjelasan |
| :--- | :--- |
| *P/L* | *Singkatan dari Perangkat Lunak, yaitu aplikasi yang memberikan perintah kepada komputer untuk menjalankan tugas tertentu.* |
| *SKPL* | *Singkatan dari Spesifikasi Kebutuhan Perangkat Lunak, yaitu dokumen yang mendefinisikan kebutuhan fungsional, kebutuhan non-fungsional, use case, pemodelan kelas dan use case dari P/L.* |
| *APL* | *Singkatan dari Arsitektur Perangkat Lunak, yaitu dokumen yang mendefinisikan style/pattern arsitektur, komponen, dan model arsitektur P/L.* |
| *DPPL* | *Singkatan dari Deskripsi Perancangan Perangkat Lunak, yaitu dokumen yang menjabarkan rancangan arsitektur, realisasi use case, dan kelas perancangan sebagai acuan implementasi P/L.* |
| *HIUPL* | *Singkatan dari Hasil Implementasi dan Uji Perangkat Lunak, yaitu dokumen yang melaporkan hasil implementasi dan pengujian P/L.* |
| *KF* | *Singkatan dari Kebutuhan Fungsional.* |
| *KNF* | *Singkatan dari Kebutuhan Non-Fungsional.* |
| *UC* | *Singkatan dari Use Case.* |
| *TC* | *Singkatan dari Test Case, yaitu satu kasus uji untuk skenario tertentu.* |
| *UT* | *Singkatan dari Unit Test, yaitu test case tingkat kelas/operasi.* |
| *INT* | *Singkatan dari Integration Test, yaitu test case yang menguji interaksi antarkomponen.* |
| *Boundary* | *Kasus uji pada nilai batas masukan, misalnya nilai minimum, maksimum, atau tepat di ambang aturan.* |
| *Coverage* | *Persentase baris/cabang kode yang dieksekusi oleh pengujian.* |
| *SDG* | *Sustainable Development Goals, yaitu 17 tujuan utama dan 169 target yang disepakati oleh negara-negara anggota PBB untuk mencapai kesejahteraan manusia dan pelestarian lingkungan.* |
| *SoClean* | *Nama perangkat lunak berbasis web yang dirancang untuk mengurangi kebocoran sampah domestik ke ekosistem perairan.* |
| *ReportIt* | *Fitur untuk melaporkan pencemaran perairan pada perangkat lunak SoClean.* |
| *CleanIt* | *Fitur pada perangkat lunak SoClean tempat masyarakat memilih lokasi tercemar, membersihkannya, lalu mengunggah bukti pembersihan untuk diverifikasi.* |
| *B3* | *Bahan Berbahaya dan Beracun, yaitu kategori sampah yang mengandung zat atau komponen yang memiliki sifat dapat membahayakan lingkungan hidup, makhluk hidup, dan kesehatan.* |

## 1.4 Aturan Penomoran
Tuliskan aturan penomoran (ID) yang digunakan dalam dokumen ini. Gunakan pola ID yang **sama** dengan yang sudah dipakai pada dokumen-dokumen sebelumnya (SKPL, APL, DPPL), kecuali untuk ID pengujian yang baru diperkenalkan pada dokumen ini.

Tabel 1.4. Aturan Penomoran

| Hal/Bagian | Penomoran | Keterangan |
| :--- | :--- | :--- |
| *Kebutuhan* | *RXX* | *Digunakan untuk menomori Kebutuhan/Requirements, dengan 'XX' adalah dua digit angka berurutan.* |
| *Kebutuhan Fungsional* | *KFXX* | *Digunakan untuk menomori Kebutuhan Fungsional, dengan 'XX' adalah dua digit angka berurutan.* |
| *Kebutuhan Non-Fungsional* | *KNFXX* | *Digunakan untuk menomori Kebutuhan Non-Fungsional, dengan 'XX' adalah dua digit angka berurutan.* |
| *Aktor* | *AXX* | *Digunakan untuk menomori Aktor, dengan 'XX' adalah dua digit angka berurutan.* |
| *Use Case* | *UCXX* | *Digunakan untuk menomori Use Case, dengan 'XX' adalah dua digit angka berurutan.* |
| *Kelas* | *CXX* | *Digunakan untuk menomori Kelas, dengan 'XX' adalah dua digit angka berurutan.* |
| *Antarmuka* | *I-XX* | *Sesuai DPPL* |
| *Test Case Unit* | *CXX-UTYY* | *XX adalah nomor kelas, YY adalah nomor urut test case unit pada kelas tersebut* |
| *Test Case Integrasi* | *INT-TCYY* | *YY adalah nomor urut test case integrasi* |
| *Test Case Use Case* | *UCXX-TCYY* | *XX adalah nomor use case, YY adalah nomor urut test case pada use case tersebut* |
| *Test Case KNF* | *KNFXX-TCYY* | *XX adalah nomor KNF, YY adalah nomor urut test case pada KNF tersebut* |

## 1.5 Referensi
<!-- Cantumkan daftar buku, panduan, atau dokumentasi lain yang dirujuk dalam pembuatan dokumen dan pengembangan P/L, **minimal dokumen SKPL, APL, DPPL, dan Implementasi (Tugas 9)**. Tambahkan dokumentasi *framework*/*library*/*testing tool* atau referensi lain apabila digunakan. -->
1. Kelompok G-02 K-03. [*Spesifikasi Kebutuhan Perangkat Lunak (SKPL) SoClean*](../M5/K03_G02_SKPL.md).
2. Kelompok G-02 K-03. [*Arsitektur Perangkat Lunak (APL) SoClean*](../M6/K03_G02_APL.md).
3. Kelompok G-02 K-03. [*Deskripsi Perancangan Perangkat Lunak (DPPL) SoClean*](../M8/K03_G02_DPPL2.md).
4. Kelompok G-02 K-03. [*Implementasi Perangkat Lunak SoClean*](../M9/K03_G02_Implementasi.md).
5. Sommerville, I. (2016). *Software Engineering* (10th ed.). Pearson.

<!-- Note, nanti tambahin dokumentasi testing tool jika sudah ada -->

## 1.6 Deskripsi Umum Dokumen (Ikhtisar)
Dokumen ini terdiri atas 5 bab. Bab 1 (Pendahuluan) memuat tujuan penulisan dokumen, lingkup masalah, definisi dan istilah spesifik di dalam dokumen, aturan penomoran, referensi, serta ikhtisar dokumen. Bab 2 (Deskripsi Umum Perangkat Lunak) memuat gambaran umum P/L beserta diagram use case. Bab 3 (Implementasi) memuat lingkungan implementasi, implementasi modul, implementasi antarmuka, serta file lain. Bab 4 (Hasil Pengujian) memuat strategi dan kedalaman pengujian kelas, pengujian unit kelas, pengujian integrasi, pengujian use case, pengujian KNF, serta bukti hasil pengujian. Bab 5 (Traceability) memuat pemetaan kerunutan antara KF dan KNF dengan use case, kelas, file implementasi, dan test case.

<br>

---

# BAB 2: Deskripsi Umum Perangkat Lunak

<!-- Bagian ini diisi dengan *System Overview*, dalam bentuk gambar dan narasi yang memberikan gambaran tentang aplikasi dan konteksnya. **Batasan dan keterkaitan** antara sistem yang dibangun dengan sistem lain di luarnya harus jelas. Deskripsi umum sistem perlu dilengkapi dengan pemodelan kasus yang dihadapi, seperti *use case diagram*. Berikan narasi yang jelas untuk setiap gambar yang ditampilkan.

Bagian ini dapat menyalin atau meringkas dari dokumen SKPL atau DPPL.

<p align="center">
<img alt="System Overview / Use Case Diagram" src="./assets/contoh-uc-diagram.webp" width="90%">
</p>
<p align="center">
<i>Gambar 2.1. Use Case Diagram [Nama P/L]</i>
</p>

<br> -->

SoClean merupakan perangkat lunak berbasis web yang digunakan untuk mendukung proses bisnis yaitu pelaporan dan penanganan pencemaran sampah domestik pada ekosistem perairan. Perangkat lunak ini dapat diakses melalui browser pada perangkat desktop maupun mobile tanpa memerlukan instalasi tambahan. SoClean menerima input dari Masyarakat dan Operator melalui antarmuka aplikasi serta menyediakan fungsionalitas untuk membuat dan memverifikasi laporan pencemaran, mengirim dan memverifikasi bukti pembersihan, mengelola poin, serta melakukan penukaran poin dengan reward.

SoClean menyediakan fitur ReportIt yang memungkinkan Masyarakat membuat laporan pencemaran dengan memasukkan informasi lokasi, waktu, sumber, dan bukti berupa foto atau video. Dalam pengambilan bukti, SoClean berinteraksi dengan kamera pada perangkat pengguna untuk memperoleh media yang dilengkapi timestamp dan watermark sebagai lampiran laporan. Perangkat lunak memeriksa kelengkapan laporan sebelum dikirim, lalu menyimpan laporan beserta media untuk ditampilkan kepada Operator dalam proses verifikasi. Apabila koneksi internet terputus saat pengisian, input disimpan sementara pada perangkat pengguna, sedangkan pengiriman laporan tetap membutuhkan koneksi internet.

SoClean juga menyediakan fitur CleanIt yang memungkinkan Masyarakat melihat daftar lokasi pencemaran yang telah diverifikasi, melihat informasi lokasi, memilih lokasi untuk dibersihkan, serta mengirimkan bukti pembersihan. Laporan ReportIt yang dinyatakan tidak valid tidak ditampilkan dalam daftar lokasi. Bukti pembersihan ditampilkan kepada Operator untuk diverifikasi. Apabila dinyatakan valid, perangkat lunak memperbarui status laporan dan menambahkan poin ke saldo pengguna. Apabila ditolak, perangkat lunak mengirimkan notifikasi beserta alasan penolakan kepada pengguna.

Selain itu, SoClean menyediakan fitur untuk melihat saldo poin, melihat reward yang tersedia, dan menukarkan poin dengan reward. Dalam proses penukaran, perangkat lunak memeriksa kecukupan poin pengguna dan ketersediaan reward, kemudian mengurangi saldo poin dan persediaan reward serta mencatat transaksi penukaran. Selain kamera dan layanan peta, SoClean tidak terhubung dengan sistem eksternal lain karena reward berupa dummy, tidak terdapat integrasi dengan payment gateway maupun penyedia reward.

Batasan dalam pengembangan perangkat lunak meliputi:
- Software hanya berfokus pada sampah-sampah domestik, sehingga operator hanya menerima laporan ReportIt atau CleanIt dengan bukti sampah domestik.
- Software juga hanya berfokus pada sampah atau limbah yang tidak memerlukan penanganan khusus. Karena berdasarkan UU Nomor 32 Tahun 2009 Pasal 59, pengelolaan limbah B3 butuh dikelola dengan baik dan benar sesuai ketentuan yang berlaku. Operator hanya menerima laporan dengan bukti sampah non-B3.
- Verifikasi laporan dilakukan oleh manusia (operator) sehingga penambahan daerah tercemar (melalui ReportIt) maupun pemberian poin (melalui CleanIt) hanya dapat dilakukan setelah operator menilai sebuah laporan valid.
- Software hanya menyediakan daerah operasional tertentu sehingga laporan hanya dapat dibuat pada wilayah yang terdaftar.
- Berjalan sebagai web app dan berfungsi pada desktop maupun platform mobile.
- Reward yang dapat ditukarkan berupa dummy reward.
- Perangkat lunak dapat digunakan dalam mode offline (mengupload media di lokal), namun untuk pengiriman bukti tetap membutuhkan koneksi internet.

<br>
<p align="center">
<img alt="Use Case Diagram SoClean" src="../M5/assets/diagram/UseCaseDiagram.svg" width="80%">
</p>
<p align="center">
<i>Gambar 2.1. Use Case Diagram SoClean</i>
</p>
<br>

Gambar 2.1 menunjukkan use case diagram SoClean yang melibatkan dua aktor sebagai berikut.

Tabel 2.1. Identifikasi Aktor

| ID Aktor | Aktor | Deskripsi |
| :--- | :--- | :--- |
| A01 | Operator | _Pengguna ini bertindak sebagai pihak yang bertanggung jawab untuk memvalidasi laporan dari ReportIt dan CleanIt. Karakteristik dari pengguna ini adalah mengutamakan kecepatan untuk memverifikasi laporan dalam jumlah yang banyak._ |
| A02 | Masyarakat | _Pengguna ini bertindak sebagai pihak yang melaporkan pencemaran (Pelapor) maupun beraksi membersihkan sampah (Relawan) di ekosistem laut dan sungai. Karakteristik dari pengguna ini adalah mengutamakan kemudahan pelaporan dan melihat lokasi._ |

Use case yang terdapat pada diagram adalah sebagai berikut.

Tabel 2.2. Identifikasi Use Case

| ID UC | Nama Use Case | Deskripsi Singkat | Aktor Terlibat | ID KF Terkait |
| :--- | :--- | :--- | :--- | :--- |
| *UC01* | *Membuat Laporan Pencemaran (konsep ReportIt)* | *Masyarakat melaporkan lokasi perairan yang terkontaminasi sampah beserta bukti foto/video untuk diajukan ke Operator.* | *Masyarakat* | *KF01, KF03, KF04* |
| *UC02* | *Mengambil Bukti Foto/Video* | *Sistem menggunakan kamera device pengguna untuk mengambil foto/video bukti yang otomatis diberi watermark dan timestamp, digunakan sebagai lampiran pada laporan ReportIt maupun CleanIt.* | *Masyarakat* | *KF02* |
| *UC03* | *Memverifikasi Laporan ReportIt* | *Operator meninjau laporan pencemaran yang masuk beserta buktinya dan menentukan validitasnya agar laporan valid dapat ditampilkan sebagai bounty di daftar lokasi.* | *Operator* | *KF05* |
| *UC04* | *Melihat Daftar Lokasi Pencemaran (CleanIt)* | *Masyarakat periksa daftar lokasi tercemar yang telah terverifikasi beserta detail informasinya (lokasi, waktu, sumber, bukti) sebelum memilih lokasi untuk dibersihkan.* | *Masyarakat* | *KF06, KF07* |
| *UC05* | *Mengirimkan Bukti Pembersihan (CleanIt)* | *Masyarakat yang telah membersihkan lokasi tercemar mengirimkan laporan penyelesaian beserta bukti foto/video pembersihan untuk diverifikasi Operator.* | *Masyarakat* | *KF08* |
| *UC06* | *Memverifikasi Laporan Pembersihan (CleanIt)* | *Operator meninjau laporan penyelesaian CleanIt yang masuk dan menentukan validitasnya. Apabila laporan valid, sistem memberikan poin reward ke akun Masyarakat terkait.* | *Operator* | *KF09, KF10, KF11* |
| *UC07* | *Melihat Saldo Poin* | *Masyarakat melihat saldo poin* | *Masyarakat* | *KF11, KF12* |
| *UC08* | *Melihat Reward yang Tersedia* | *Masyarakat melihat daftar reward yang tersedia* | *Masyarakat* | *KF11, KF12* |
| *UC09* | *Menukarkan Poin dengan Reward* | *Masyarakat menukarkan poin yang dimiliki dengan reward yang dipilihnya* | *Masyarakat* | *KF11, KF12, KF13* |

<br>

---

# BAB 3: Implementasi

Bagian ini diisi dengan informasi tentang elemen P/L yang dikembangkan (*executable files*, *configuration files*, *data files*, dan sebagainya) serta perubahannya terhadap rancangan pada DPPL (jika ada).

## 3.1 Lingkungan Implementasi

Tuliskan *hardware* dan *software* yang digunakan untuk implementasi, mencakup *operating system*, bahasa pemrograman beserta versinya, *framework*/*library*, DBMS, *development tools*, dan *version control*. Lingkungan ini harus konsisten dengan **Subbab 2.1 DPPL**; jelaskan jika ada perubahan. Cantumkan juga *framework* dan alat pengujian yang dipakai.

Tabel 3.1. Lingkungan Implementasi

| Aspek | Keterangan |
| :--- | :--- |
| *Hardware* | Perangkat desktop maupun mobile yang dilengkapi dengan internet, GPS, dan kamera. |
| *Operating System* | Cross-platform: Linux (di dalam container Docker untuk server), serta Windows, Linux, dan Android (diakses melalui web browser pada perangkat desktop maupun mobile). |
| *Bahasa Pemrograman* | TypeScript / JavaScript, HTML, CSS, dan SQL. |
| *Framework/Library* | Next.js 16 (Node.js). |
| *DBMS* | PostgreSQL 18 (untuk penyimpanan data relasional dan persisten). |
| *Development Tools* | Docker (untuk kontainerisasi), Git & GitHub (untuk manajemen versi kode), Visual Studio Code (sebagai IDE/code editor), serta Mermaid.js, Draw.io, dan StarUML (untuk pemodelan diagram). |
| *Testing Tools* | Vitest (unit testing), Chrome DevTools & Firefox DevTools (non-functional testing), Vitest Coverage V8 (coverage testing) |

## 3.2 Implementasi Modul

Daftar modul/kelas yang **TELAH** diimplementasikan. Gunakan nama dan ID kelas yang sama dengan DPPL, dan konsisten dengan Tabel B.5 pada dokumen Implementasi (Tugas 9).

Tabel 3.2. Implementasi Modul

| No | ID Kelas | Nama Modul/Kelas | Nama File Fisik | Nama File Executable |
| :--- | :--- | :--- | :--- | :--- |
| 1 | *[C01]* | *[Nama modul/kelas]* | *[path/ke/file]* | *[Nama file executable, atau - jika tidak ada]* |
| 2 | *[C02]* | *[Nama modul/kelas]* | *[path/ke/file]* | *[...]* |
| ... | *...* | *...* | *...* | *...* |

## 3.3 Implementasi Antarmuka

Daftar antarmuka yang telah diimplementasikan. Gunakan ID dan nama layar yang sama dengan ID dan nama layar pada tugas DPPL.

Tabel 3.3. Implementasi Antarmuka

| No | ID Antarmuka | Nama Antarmuka | Nama File Fisik | Nama File Executable |
| :--- | :--- | :--- | :--- | :--- |
| 1 | *[I-01]* | *[Nama layar]* | *[path/ke/file]* | *[Nama file executable, atau - jika tidak ada]* |
| 2 | *[I-02]* | *[Nama layar]* | *[path/ke/file]* | *[...]* |
| ... | *...* | *...* | *...* | *...* |

## 3.4 File Lain

Daftar file lain yang dibuat selain file kelas dan antarmuka, misalnya file *utility*, *configuration*, *database schema/seed*, *file test*, atau *data*.

Tabel 3.4. File Lain

| No | Nama File | Keterangan |
| :--- | :--- | :--- |
| 1 | Dockerfile dan konfigurasinya (`.env.example`, `compose.yaml`, `compose.override.yaml`, `.dockerignore`) | Kontainerisasi web, PostgreSQL, dan RustFS dengan Docker (`Dockerfile` biasa untuk production, `Dockerfile.dev` untuk development), termasuk konfigurasi Docker Compose serta contoh environment variables |
| 2 | File-file konfigurasi (`tsconfig.json`, `vitest.config.mjs`, `next.config.ts`, `eslint.config.mjs`) | Konfigurasi NextJS, Typescript, Vitest, dan Linter |
| 3 | Dependensi (`package.json`, `package-lock.json`) | Dependensi NextJS |
| 4 | File-file pengujian (`tests/helpers`, misal `tests/helpers/akses.test.ts`)| Unit testing |
| 5 | File-file helper ( di `lib/`, misal `lib/api/client.ts`) | Dipakai sebagai fungsi-fungsi yang dipakai bersama. Bisa saja mengacu ke tipe yang terdefinisi sebagai implementasi utama, namun by itself bukan merupakan implementasi utama. |
| 6 | File-file komponen React ( di `components/`, misal `components/Beranda.tsx`) | Sebagai reusable components di front-end |
| 7 | File-file routing NextJS di (`app/`, misal `app/(pages)/(auth)/login/page.tsx`) | By default, routing NextJS adalah di app yang ditandai seperti page.tsx dalam directory tertentu di dalam app |
| 7 | File-file database di (`server/db/`, termasuk file sql seperti `0000_init.sql`, schema-nya, dan profiling) | Database, migrasi, Drizzle, seed data, profiling |

<br>

---

# BAB 4: Hasil Pengujian

Bab ini melaporkan hasil pengujian P/L pada level unit, integrasi, dan sistem. Pengujian dilakukan pada tag release terakhir Tugas 9. Hasil aktual diisi berdasarkan pengamatan saat pengujian. Kesimpulan diisi `Pass` atau `Fail`, dan untuk `Fail` dilengkapi penyebab serta usulan perbaikan.

## 4.1 Strategi dan Kedalaman Pengujian Kelas

Setiap kelas perancangan pada Tabel 4.1 DPPL diklasifikasikan ke dalam tiga tingkat kedalaman pengujian. Tingkat **Mendalam** diberikan pada kelas yang memuat logika bisnis, perhitungan, validasi, aturan status, algoritma, integrasi eksternal, atau keamanan. Tingkat **Sedang** diberikan pada kelas yang hanya mengoordinasikan atau mendelegasikan proses. Tingkat **Tidak perlu** diberikan pada kelas tanpa logika, seperti *entity/DTO* dan kelas konfigurasi, yang teruji secara tidak langsung melalui test case use case. Seluruh kelas wajib dicantumkan beserta alasan penentuan tingkatnya.

Tabel 4.1.1. Identifikasi Tingkat Pengujian Kelas

| ID Kelas | Nama Kelas | Tingkat | Alasan | Test Case Terkait |
| :--- | :--- | :--- | :--- | :--- |
| *C02* | *Pesanan* | *Mendalam* | *Memuat `hitungTotal()` dan transisi status pembayaran* | *C02-UT01 s.d. C02-UT08* |
| *C03* | *Keranjang* | *Sedang* | *Delegasi sederhana ke Produk dan Pesanan* | *C03-UT01 s.d. C03-UT03, INT-TC02* |
| *C01* | *Pelanggan* | *Tidak perlu* | *Hanya menyimpan data akun, tanpa logika* | *-* |
| *[CXX]* | *[Nama kelas]* | *[Mendalam/Sedang/Tidak perlu]* | *[Alasan penentuan tingkat pengujian]* | *[ID test case atau -]* |
| *...* | *...* | *...* | *...* | *...* |

## 4.2 Pengujian Unit Kelas

Pengujian unit dilakukan pada kelas bertingkat Mendalam dan Sedang. Kelas Mendalam diuji pada seluruh operasi public dengan kasus normal, batas, dan negatif, serta mencapai *coverage* minimal 70%. Kelas Sedang diuji minimal dengan satu kasus normal dan satu kasus gagal pada operasi public utama.

Cara menjalankan unit test: *[tuliskan perintah, mis. `pytest src/tests/`]*.

Lokasi file test: *[path, mis. `src/tests/`]*.

### 4.2.1 Kelas [Nama Kelas 1]

**ID Kelas:** *[C02]*  
**Nama Kelas:** *[Pesanan]*  
**Tingkat:** *[Mendalam]*

Tabel 4.2.1. Hasil Pengujian Unit Kelas [C02]

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *C02-UT01* | *`hitungTotal(): Decimal`* | *Normal* | *Pesanan berisi 2 item: 10.000 x 2 dan 5.000 x 1* | *Total = 25.000* | *[Hasil aktual]* | *Pass/Fail* |
| *C02-UT02* | *`hitungTotal(): Decimal`* | *Batas* | *Pesanan berisi tepat 1 item dengan jumlah 1* | *Total = harga item tersebut* | *[...]* | *Pass/Fail* |
| *C02-UT03* | *`hitungTotal(): Decimal`* | *Negatif* | *Pesanan tanpa item* | *Total = 0 atau melempar kesalahan sesuai rancangan* | *[...]* | *Pass/Fail* |
| *...* | *...* | *...* | *...* | *...* | *...* | *...* |

Khusus kelas **Mendalam**:

Tabel 4.2.1b. Ringkasan Cakupan Kelas [C02]

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | *[op1(), op2(), ...]* |
| Operasi yang diuji | *[op1(), op2(), ...]* |
| ID Algoritma yang tercakup | *[Algo-001, ...]* |
| Coverage (wajib ≥ 70%) | *[% baris / % cabang, alat dan bukti pada 4.6]* |

### 4.2.2 Kelas Laporan

**ID Kelas:** *[C02]*  
**Nama Kelas:** *[Laporan]*  
**Tingkat:** *[Mendalam]*

Tabel 4.2.1. Hasil Pengujian Unit Kelas [C02]

Note: `buatLaporan(...)` tidak punya kasus batas dan negatif. Validasi dilakukan sepenuhnya pada ManagerLaporan. Kasus batas `getLaporanById(...)` juga sudah cukup direpresentasikan melalui jalur normal pada satu laporan dan ID laporan yang belum ada. Untuk `simpan_alasan_penolakan(...)`, batas panjang alasan divalidasi di ValidatorLaporan. Untuk `ubah_status_verifikasi` tidak ada kasus batas.

Coverage fungsi hanya di atas 70% jika mengacu juga pada file pada testing integrasi. Hal ini karena fungsi-fungsi pada model laporan banyak pula digunakan pada file testing di luar testing kelas. Lebih lanjut akan diuraikan pada bagian tersebut.

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *C02-UT01* | *`buatLaporan(input: LaporanBaru, tx: Eksekutor = db): Promise<LaporanTersimpan>` dan `getLaporanById(id: number)`* | Normal/negatif | Laporan, baik CleanIt maupun ReportIt diinisialisasi dengan operasi bersangkutan, lalu dicek keberadaannya melalui `getLaporanById`. Juga melakukan pengujian untuk id laporan yang belum pernah ada seperti 99999 | Laporan dengan ID yang sama dengan ID laporan yang baru dibuat adalah laporan yang sama. Untuk id tidak valid, NULL. | Laporan dengan ID yang sama dengan ID laporan yang baru dibuat adalah laporan yang sama. Id tidak valid NULL | *Pass* |
| *C02-UT02* | *`getDaftarLaporan(filter: FilterDaftarLaporan, tx: Eksekutor = db,): Promise<{ data: LaporanTersimpan[]; total: number }>`* | Normal/batas | Beberapa laporan sudah diinisialisasi, lalu ambil daftar laporan dengan filter jenis/status, lalu uji paginasi, limit, dan sorting berdasarkan `createdAt` | Data yang muncul sesuai filter, sorting berdasarkan `createdAt`, `total` sesuai dengan jumlah elemen yang muncul dengan at most `limit`, tapi jika elemen di bawah `limit` maka sesuai jumlah elemennya | Data yang muncul sesuai filter, sorting berdasarkan `createdAt`, `total` sesuai dengan jumlah elemen yang muncul dengan at most `limit`, tapi jika elemen di bawah `limit` maka sesuai jumlah elemennya | *Pass* |
| *C02-UT03* | *`getDaftarLaporan(filter: FilterDaftarLaporan, tx: Eksekutor = db,): Promise<{ data: LaporanTersimpan[]; total: number }>`* | Negatif/batas | Sebuah laporan ReportIt yang diinisialisasi, lalu difilter dengan filter yang tidak sesuai. Dilakukan juga pengecekan halaman melewati hasil terakhir | Daftar laporan menunjukkan list kosong | Daftar laporan menunjukkan list kosong | *Pass* |
| *C02-UT04* | `ubah_status(idLaporan: number, perubahan: PerubahanStatusLaporan, tx: Eksekutor = db,)` dan `simpan_alasan_penolakan(idLaporan: number, alasanPenolakan: string, tx: Eksekutor = db,): Promise<LaporanTersimpan \| null>`| Normal/negatif | Ubah status laporan dan menyimpan alasan | Status laporan, alasan penolakan, metadata verifikasi berubah disesuaikan dan disimpan, untuk ID yang tidak ada menghasilkan NULL | Status laporan, alasan penolakan, metadata verifikasi berubah disesuaikan dan disimpan, untuk ID yang tidak ada menghasilkan NULL | *Pass* |
| *C02-UT05* | `adaCleanItMenunggu(idPengguna: string,lokasiId: number,tx: Pick<Db, "select"> = db,): Promise<boolean>` | Normal/negatif | Laporan CleanIt dengan status belum diperiksa pada lokasi tertentu | Kalau pengguna dan lokasi sesuai, true. False jika pengguna/lokasi berbeda, tidak ada yang menunggu, atau sudah diverifikasi | Kalau pengguna dan lokasi sesuai, true. False jika pengguna/lokasi berbeda, tidak ada yang menunggu, atau sudah diverifikasi | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.1b. Ringkasan Cakupan Kelas [C02]

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `buatLaporan(input: LaporanBaru, tx: Eksekutor = db): Promise<LaporanTersimpan>`, `getDaftarLaporan(filter: FilterDaftarLaporan, tx: Eksekutor = db,): Promise<{ data: LaporanTersimpan[]; total: number }>`, `ubah_status(idLaporan: number, perubahan: PerubahanStatusLaporan, tx: Eksekutor = db,)`, `simpan_alasan_penolakan(idLaporan: number, alasanPenolakan: string, tx: Eksekutor = db,): Promise<LaporanTersimpan \| null>`, `adaCleanItMenunggu(idPengguna: string,lokasiId: number,tx: Pick<Db, "select"> = db,): Promise<boolean>`, sisanya diuji pada integration testing, yaitu `hitungBersihkanSendiri30Hari(idPengguna: string, kecualiIdLaporan: number, tx: Pick<Db, "select"> = db,): Promise<number>`, `ubah_status_verifikasi(idLaporan: number, keputusan: KeputusanVerifikasi, tx: Eksekutor = db,): Promise<LaporanTersimpan \| null>`, `tolakCleanItMenungguLain(idLokasi: number kecualiIdLaporan: number, diverifikasiOleh: string, tx: Pick<Db, "update"> = db,): Promise<number[]>`|
| Operasi yang diuji | `buatLaporan(input: LaporanBaru, tx: Eksekutor = db): Promise<LaporanTersimpan>`, `getDaftarLaporan(filter: FilterDaftarLaporan, tx: Eksekutor = db,): Promise<{ data: LaporanTersimpan[]; total: number }>`, `ubah_status(idLaporan: number, perubahan: PerubahanStatusLaporan, tx: Eksekutor = db,)`, `simpan_alasan_penolakan(idLaporan: number, alasanPenolakan: string, tx: Eksekutor = db,): Promise<LaporanTersimpan \| null>`, `adaCleanItMenunggu(idPengguna: string,lokasiId: number,tx: Pick<Db, "select"> = db,): Promise<boolean>` |
| ID Algoritma yang tercakup | Algo-005, Algo-006 (berubah bentuk), Algo-007 (berubah bentuk), Algo-008, Algo-009 |
| Coverage (wajib ≥ 70%) | 58.33% function (hanya mengacu pada `model-laporan.test.ts`), 100% (model-detail-laporan.test.ts, verifikasi-ganda.test.ts, validasi-laporan.test.ts, api-setujui-reportit.test.ts, tests/api-setujui-cleanit.test.ts ) |

<br>

## 4.3 Pengujian Integrasi

Pengujian integrasi memeriksa interaksi antarkomponen yang melewati batas, yaitu *Controller* ke *Model*, aplikasi ke basis data, dan aplikasi ke sistem eksternal. Daftar antarmuka mengacu pada dokumen DPPL, dengan minimal satu test case untuk setiap antarmuka. Pengujian memakai komponen nyata, bukan *mock*. Apabila ada antarmuka tambahan yang belum didaftarkan pada dokumen DPPL, cantumkan juga.

Tabel 4.3.1. Daftar Antarmuka Antarkomponen

| ID Antarmuka | Komponen Asal | Komponen Tujuan | Jenis Batas | Test Case |
| :--- | :--- | :--- | :--- | :--- |
| *I-01* | *KeranjangController* | *Keranjang (Model)* | *Controller - Model* | *INT-TC01, INT-TC02* |
| *I-02* | *Pesanan (Model)* | *Database* | *Aplikasi - Basis data* | *INT-TC03* |
| *I-03* | *PaymentGatewayAdapter* | *Payment Gateway (dummy)* | *Aplikasi - Sistem eksternal* | *INT-TC04, INT-TC05* |
| *[I-XX]* | *[Komponen asal]* | *[Komponen tujuan]* | *[Jenis batas]* | *[ID test case]* |
| *...* | *...* | *...* | *...* | *...* |

Tabel 4.3.2. Hasil Pengujian Integrasi

| ID Pengujian | ID Antarmuka | Skenario | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *INT-TC01* | *I-01* | *Normal: tambah item ke keranjang* | *Panggil `tambahItem()` melalui KeranjangController dengan produk valid* | *Item tersimpan pada Keranjang dan tampil pada daftar item* | *[Hasil aktual]* | *Pass/Fail* |
| *INT-TC03* | *I-02* | *Normal: simpan pesanan* | *Buat pesanan, lalu baca ulang langsung dari basis data* | *Baris pesanan ada dengan nilai total dan status yang sama* | *[...]* | *Pass/Fail* |
| *INT-TC05* | *I-03* | *Gagal: gateway mengembalikan status gagal* | *Kirim otorisasi dengan saldo dummy tidak cukup* | *Status pesanan tidak berubah menjadi "Lunas", pesan gagal diteruskan ke pengguna* | *[...]* | *Pass/Fail* |
| *...* | *...* | *...* | *...* | *...* | *...* | *...* |

<br>

## 4.4 Pengujian Use Case

Pengujian use case dilakukan pada seluruh skenario normal dan alternatif sesuai Subbab 4.4 SKPL, dengan minimal satu test case untuk setiap skenario. Kolom ID KF menunjukkan KF yang diverifikasi oleh test case tersebut.

### 4.4.1 Use Case [Nama Use Case 1]

**ID Use Case:** *[UC01 sesuai SKPL]*  
**Nama Use Case:** *[Nama use case sesuai SKPL]*

Tabel 4.4.1. Hasil Pengujian Use Case [UC01]

| ID Pengujian | ID KF | Skenario | Prosedur Pengujian | Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *UC01-TC01* | *KF01* | *Normal* | *1. Buka halaman login.<br>2. Masukkan kredensial.<br>3. Klik tombol "Login".* | *User: rpl@gmail.com<br>Pass: 123456* | *Pengguna diarahkan ke Halaman Dashboard.* | *Pengguna diarahkan ke Halaman Dashboard sesuai hasil yang diharapkan.* | *Pass* |
| *UC01-TC02* | *KF01* | *Alternatif 1: [Nama skenario]* | *[Langkah-langkah pengujian]* | *[Data masukan]* | *[Hasil yang diharapkan]* | *[Hasil aktual]* | *[Pass/Fail. Jika Fail: penjelasan dan solusi]* |
| *...* | *...* | *...* | *...* | *...* | *...* | *...* | *...* |

### 4.4.2 Use Case [Nama Use Case 2]

*[Lanjutkan untuk seluruh use case dengan pola yang sama, hingga 4.4.N.]*

<br>

## 4.5 Pengujian Kebutuhan Non-Fungsional (KNF)

Setiap KNF pada Tabel 3.2 SKPL diuji secara terukur berdasarkan parameter yang telah didefinisikan. Setiap pengujian memuat target terukur, metode dan alat yang sesuai dengan parameter (misalnya Chrome DevTools untuk *response time* dan inspeksi basis data untuk *security*), serta hasil aktual berupa angka atau data. KNF yang belum dipenuhi atau tidak diimplementasikan dicantumkan beserta alasan dan rencana perbaikan.

Tabel 4.5. Hasil Pengujian KNF

| ID Pengujian | ID KNF | Parameter | Target Terukur | Metode dan Alat | Hasil Aktual | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *KNF01-TC01* | *KNF01* | *Reliability* | *Tidak ada data hilang/ganda saat jaringan putus di tengah transaksi* | *Simulasi putus koneksi saat bayar, lalu cek status di DB* | *[Hasil aktual]* | *Pass/Fail* |
| *KNF02-TC01* | *KNF02* | *Security* | *Password tersimpan sebagai hash, bukan plain-text* | *Inspeksi tabel pengguna di DB* | *[...]* | *Pass/Fail* |
| *KNFXX-TC01* | *KNFXX* | *Response time* | *Halaman tampil ≤ 4 detik* | *Chrome DevTools, 5 kali ukur, ambil rata-rata* | *[Rata-rata ... detik, maks ... detik]* | *Pass/Fail* |
| *...* | *...* | *...* | *...* | *...* | *...* | *...* |

<br>

## 4.6 Tangkapan Layar dan Bukti Hasil Pengujian

Bukti pengujian dilampirkan sesuai ID Pengujian pada Subbab 4.2 sampai 4.5, berupa tangkapan layar aplikasi, keluaran *test runner*, laporan *coverage* untuk setiap kelas Mendalam, atau hasil alat ukur.

Tabel 4.6. Bukti Hasil Pengujian

| ID Pengujian | Bukti Hasil Pengujian |
| :--- | :--- |
| *C02-UT01 – C02-UT08* | *[Sisipkan hasil keluaran unit test]* |
| *C02 (coverage)* | *[Sisipkan laporan coverage kelas C02]* |
| *INT-TC01* | *[Sisipkan bukti pengujian integrasi]* |
| *UC01-TC01* | *[Sisipkan tangkapan layar UC01-TC01 sesuai prosedur pengujian]* |
| *UC01-TC02* | *[Sisipkan tangkapan layar UC01-TC02 sesuai prosedur pengujian]* |
| *KNF01-TC01* | *[Sisipkan bukti pengukuran parameter KNF01-TC01]* |
| *...* | *...* |

<br>

---

# BAB 5: Traceability

Petakan setiap KF ke KNF, use case, kelas perancangan, file implementasi, dan test case. Tabel traceability berikut akan menjadi sarana verifikasi KF. Setiap KF memiliki minimal satu test case dan dinyatakan terpenuhi apabila **seluruh** test case terkaitnya berkesimpulan `Pass`. KF yang tidak diimplementasikan tetap dicantumkan beserta alasannya.

Tabel 5.1. Matriks Kerunutan KF terhadap Implementasi dan Pengujian

| KF ID | KNF Terkait | Use Case ID | Kelas Terkait | Implementasi File Terkait | Test Case (UC) | Test Case (Unit/Integrasi/KNF) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *KF05* | *KNF01* | *UC03* | *C02 - Pesanan* | *`src/...`* | *UC03-TC01* | *C02-UT05, INT-TC04, KNF01-TC01* |
| *KF01* | *-* | *UC01<br>UC02* | *[C01 - Nama kelas]<br>[C02 - Nama kelas]* | *[path/ke/file1]<br>[path/ke/file2]* | *UC01-TC01, UC01-TC02<br>UC02-TC01* | *-* |
| *KF02* | *[KNFXX atau -]* | *[UCXX]* | *[CXX - Nama kelas]* | *[path/ke/file]* | *[UCXX-TCYY]* | *[CXX-UTYY, INT-TCYY, KNFXX-TCYY atau -]* |
| *KFXX* | *-* | *[UCXX atau -]* | *[CXX - Nama kelas atau -]* | *Tidak diimplementasikan: [alasan]* | *-* | *-* |
| *...* | *...* | *...* | *...* | *...* | *...* | *...* |

Tabel 5.2. Matriks Kerunutan KNF terhadap Pengujian

| ID KNF | Parameter | KF/UC Terkait | Test Case |
| :--- | :--- | :--- | :--- |
| *KNF01* | *Reliability* | *KF05 / UC03* | *KNF01-TC01* |
| *KNFXX* | *[Parameter]* | *[KFXX / UCXX atau -]* | *[KNFXX-TCYY]* |
| *...* | *...* | *...* | *...* |