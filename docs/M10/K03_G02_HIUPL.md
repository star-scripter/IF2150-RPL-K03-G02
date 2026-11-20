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
    - [4.2.1 C01 FormLaporan](#421-c01-formlaporan)
    - [4.2.2 Kelas Laporan](#422-kelas-laporan)
    - [4.2.3 Kelas Media](#423-kelas-media)
    - [4.2.5 C04 DaftarLaporan](#425-c04-daftarlaporan)
    - [4.2.8 C07 DaftarLokasi](#428-c07-daftarlokasi)
    - [4.2.9 C08 Pengguna](#429-c08-pengguna)
    - [4.2.12 C08 Pengguna – Profil](#4212-c08-pengguna--profil)
    - [4.2.14 C10 DaftarReward](#4214-c10-daftarreward)
    - [4.2.16 C12 HalamanPenukaran](#4216-c12-halamanpenukaran)
    - [4.2.18 C14 LaporanView](#4218-c14-laporanview)
  - [4.3 Pengujian Integrasi](#43-pengujian-integrasi)
  - [4.4 Pengujian Use Case](#44-pengujian-use-case)
    - [4.4.1 UC01 Membuat Laporan Pencemaran](#441-uc01-membuat-laporan-pencemaran)
    - [4.4.2 UC02 Mengambil Bukti Foto/Video](#442-uc02-mengambil-bukti-fotovideo)
    - [4.4.3 UC03 Memverifikasi Laporan ReportIt](#443-uc03-memverifikasi-laporan-reportit)
    - [4.4.4 UC04 Melihat Daftar Lokasi Pencemaran](#444-uc04-melihat-daftar-lokasi-pencemaran)
    - [4.4.5 UC05 Mengirimkan Bukti Pembersihan](#445-uc05-mengirimkan-bukti-pembersihan)
    - [4.4.6 UC06 Memverifikasi Laporan Pembersihan](#446-uc06-memverifikasi-laporan-pembersihan)
    - [4.4.7 UC07 Melihat Saldo Poin](#447-uc07-melihat-saldo-poin)
    - [4.4.8 UC08 Melihat Reward yang Tersedia](#448-uc08-melihat-reward-yang-tersedia)
    - [4.4.9 UC09 Menukarkan Poin dengan Reward](#449-uc09-menukarkan-poin-dengan-reward)
  - [4.5 Pengujian Kebutuhan Non-Fungsional (KNF)](#45-pengujian-kebutuhan-non-fungsional-knf)
  - [4.6 Tangkapan Layar dan Bukti Hasil Pengujian](#46-tangkapan-layar-dan-bukti-hasil-pengujian)
- [BAB 5: Traceability](#bab-5-traceability)

---

## Daftar Perubahan

| Revisi | Deskripsi |
| :--- | :--- |
| *A* | Penyesuaian ID algoritma pada DPPL2 |
| *B* | Update tests dari implementasi |
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

Seluruh path relatif terhadap `src/so-clean/`. SoClean adalah aplikasi web Next.js, jadi tidak ada file executable per modul: semua file TypeScript dikompilasi `next build` menjadi bundel di folder `.next/` lalu dijalankan sebagai satu server (`next start` atau container `web`). Karena itu kolom Nama File Executable diisi `-`.

Tabel 3.2. Implementasi Modul

| No | ID Kelas | Nama Modul/Kelas | Nama File Fisik | Nama File Executable |
| :--- | :--- | :--- | :--- | :--- |
| 1 | C01 | FormLaporan | `app/(pages)/(laporan)/reportit/page.tsx`<br>`app/(pages)/(laporan)/cleanit/[idLokasi]/page.tsx`<br>`components/laporan/FormLaporan.tsx`<br>`components/laporan/FormLaporanProvider.tsx`<br>`components/laporan/PengirimanLaporanProvider.tsx`<br>`lib/form-laporan.ts`<br>`lib/kirim-laporan.ts` | - |
| 2 | C02 | Laporan | `server/db/schema/laporan.ts`<br>`server/models/laporan.ts` | - |
| 3 | C03 | Media | `server/db/schema/media.ts`<br>`server/models/media.ts`<br>`server/controllers/media.ts`<br>`server/media/processing.ts`<br>`server/storage/s3.ts`<br>`app/api/media/route.ts` | - |
| 4 | C04 | DaftarLaporan | `app/(pages)/operator/laporan/page.tsx`<br>`components/DaftarLaporan.tsx`<br>`lib/laporan.ts` | - |
| 5 | C05 | ValidatorLaporan | `server/controllers/validator-laporan.ts`<br>`app/api/laporan/[id]/route.ts`<br>`app/api/laporan/[id]/setujui/route.ts`<br>`app/api/laporan/[id]/tolak/route.ts` | - |
| 6 | C06 | Lokasi | `server/db/schema/lokasi.ts`<br>`server/models/lokasi.ts` | - |
| 7 | C07 | DaftarLokasi | `app/(pages)/(masyarakat)/(nav)/lokasi/page.tsx`<br>`components/lokasi/DaftarLokasi.tsx`<br>`components/lokasi/KartuLokasi.tsx`<br>`components/lokasi/LokasiKosong.tsx`<br>`lib/lokasi.ts` | - |
| 8 | C08 | Pengguna | `server/db/schema/pengguna.ts`<br>`server/models/pengguna.ts`<br>`server/auth/` (`account.ts`, `password.ts`, `session-token.ts`, `session-cookie.ts`, `guard.ts`)<br>`server/controllers/auth.ts`<br>`app/api/auth/{login,register,logout}/route.ts`<br>`app/api/me/route.ts`<br>`components/ProfilMasyarakat.tsx`<br>`components/ProfilOperator.tsx`<br>`lib/profil.ts` | - |
| 9 | C09 | Reward | `server/db/schema/reward.ts`<br>`server/models/reward.ts` | - |
| 10 | C10 | DaftarReward | `components/DaftarReward.tsx`<br>`lib/reward.ts` | - |
| 11 | C11 | ManagerPoin | `server/controllers/manager-poin.ts`<br>`app/api/poin/saldo/route.ts`<br>`app/api/reward/route.ts` | - |
| 12 | C12 | HalamanPenukaran | `app/(pages)/(masyarakat)/(nav)/hadiah/page.tsx`<br>`app/(pages)/(masyarakat)/hadiah/berhasil/page.tsx`<br>`app/(pages)/(masyarakat)/(nav)/hadiah/riwayat/page.tsx`<br>`components/HalamanPenukaran.tsx`<br>`components/KartuSaldo.tsx`<br>`components/KonfirmasiPenukaran.tsx`<br>`components/PenukaranBerhasil.tsx`<br>`components/KodeVoucher.tsx`<br>`components/RiwayatPenukaran.tsx`<br>`lib/penukaran.ts` | - |
| 13 | C13 | Penukaran (Model) | `server/db/schema/penukaran.ts`<br>`server/models/penukaran.ts` | - |
| 14 | C14 | LaporanView | `components/LaporanView.tsx`<br>`lib/laporan.ts`<br>`app/(pages)/(masyarakat)/(nav)/lokasi/[idLokasi]/page.tsx`<br>`components/lokasi/DetailLokasi.tsx`<br>`components/lokasi/MediaLokasi.tsx`<br>`components/lokasi/KonfirmasiBersihkan.tsx`<br>`lib/detail-lokasi.ts` | - |
| 15 | C15 | ManagerLaporan | `server/controllers/manager-laporan.ts`<br>`app/api/laporan/route.ts`<br>`app/api/lokasi/route.ts`<br>`app/api/lokasi/[id]/route.ts`<br>`app/api/notifikasi/route.ts`<br>`app/api/notifikasi/dibaca/route.ts` | - |
| 16 | C16 | Penukaran (Controller) | `server/controllers/penukaran.ts`<br>`app/api/penukaran/route.ts` | - |

## 3.3 Implementasi Antarmuka

Daftar antarmuka yang telah diimplementasikan. Gunakan ID dan nama layar yang sama dengan ID dan nama layar pada tugas DPPL.

Path relatif terhadap `src/so-clean/`. Kolom Nama File Executable diisi `-` dengan alasan yang sama seperti Tabel 3.2. Antarmuka tanpa route sendiri (I-05, I-08, I-10, I-12, I-13) ditampilkan di dalam route induknya, yang dicantumkan pada baris tersebut.

Tabel 3.3. Implementasi Antarmuka

| No | ID Antarmuka | Nama Antarmuka | Nama File Fisik | Nama File Executable |
| :--- | :--- | :--- | :--- | :--- |
| 1 | I-01 | Login | `app/(pages)/(auth)/login/page.tsx`<br>`components/FormLogin.tsx` | - |
| 2 | I-02 | Register | `app/(pages)/(auth)/register/page.tsx`<br>`components/FormRegister.tsx` | - |
| 3 | I-03 | Beranda | `app/(pages)/(masyarakat)/(nav)/beranda/page.tsx`<br>`components/Beranda.tsx` | - |
| 4 | I-04 | Hadiah | `app/(pages)/(masyarakat)/(nav)/hadiah/page.tsx`<br>`components/HalamanPenukaran.tsx`<br>`components/KartuSaldo.tsx`<br>`components/DaftarReward.tsx` | - |
| 5 | I-05 | Konfirmasi Penukaran | `components/KonfirmasiPenukaran.tsx` (bottom sheet di `/hadiah`) | - |
| 6 | I-06 | Penukaran Berhasil | `app/(pages)/(masyarakat)/hadiah/berhasil/page.tsx`<br>`components/PenukaranBerhasil.tsx`<br>`components/KodeVoucher.tsx` | - |
| 7 | I-07 | Daftar Validasi Laporan | `app/(pages)/operator/laporan/page.tsx`<br>`components/DaftarLaporan.tsx` | - |
| 8 | I-08 | Detail Laporan | `components/LaporanView.tsx` (modal di `/operator/laporan`) | - |
| 9 | I-09 | Daftar Lokasi | `app/(pages)/(masyarakat)/(nav)/lokasi/page.tsx`<br>`components/lokasi/DaftarLokasi.tsx`<br>`components/lokasi/KartuLokasi.tsx` | - |
| 10 | I-10 | Lokasi Kosong | `components/lokasi/LokasiKosong.tsx` (state kosong di `/lokasi`) | - |
| 11 | I-11 | FormLaporan — Informasi Dasar | `app/(pages)/(laporan)/reportit/page.tsx`<br>`components/laporan/FormLaporan.tsx`<br>`components/laporan/informasi-dasar/FormReportIt.tsx`<br>`components/laporan/informasi-dasar/InformasiDasarReportIt.tsx`<br>`components/laporan/informasi-dasar/PilihLokasiLaporan.tsx` | - |
| 12 | I-12 | FormLaporan — Bukti Media | `components/laporan/BuktiMedia.tsx` (langkah 2 form laporan) | - |
| 13 | I-13 | FormLaporan — Tinjau & Kirim | `components/laporan/TinjauLaporan.tsx`<br>`components/laporan/KirimLaporan.tsx` (langkah 3 form laporan) | - |
| 14 | Tambahan/N2 | Form CleanIt | `app/(pages)/(laporan)/cleanit/[idLokasi]/page.tsx`<br>`components/laporan/cleanit/FormCleanIt.tsx`<br>`components/laporan/cleanit/InformasiDasarCleanIt.tsx` | - |
| 15 | Tambahan/N13 | Profil Masyarakat | `app/(pages)/(masyarakat)/(nav)/profil/page.tsx`<br>`components/ProfilMasyarakat.tsx` | - |
| 16 | Tambahan/N13 | Profil Operator | `app/(pages)/operator/profil/page.tsx`<br>`components/ProfilOperator.tsx` | - |
| 17 | Tambahan/N13 | Riwayat Penukaran | `app/(pages)/(masyarakat)/(nav)/hadiah/riwayat/page.tsx`<br>`components/RiwayatPenukaran.tsx` | - |
| 18 | Tambahan/UC04 | Detail Lokasi | `app/(pages)/(masyarakat)/(nav)/lokasi/[idLokasi]/page.tsx`<br>`components/lokasi/DetailLokasi.tsx`<br>`components/lokasi/KonfirmasiBersihkan.tsx` | - |
| 19 | Tambahan/FE-25 | Halaman 404 dan Error | `app/not-found.tsx`<br>`app/error.tsx`<br>`app/global-error.tsx`<br>`components/HalamanStatus.tsx` | - |

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

### 4.2.1 C01 FormLaporan

**ID Kelas:** C01  
**Nama Kelas:** FormLaporan  
**Tingkat:** Mendalam  

Pengujian mengikuti pemecahan C01 di [Tugas 9 B.5](../M9/K03_G02_Implementasi.md#b5-traceability-kelas-perancangan-ke-implementasi). `FormLaporanProvider` memakai reducer untuk menyimpan isian dan bukti pada I-11–I-13. `FormReportIt` dan `FormCleanIt` memasang validasi informasi dasar sesuai jenis laporan. `UnggahMediaProvider` mengelola antrean dari I-12 dan `PengirimanLaporanProvider` memakai helper payload serta pemetaan error pada I-13.

Tabel 4.2.1. Hasil Pengujian Unit C01

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C01-UT01 | State `buka_reportit()` dan perpindahan langkah → `buatStateFormLaporan()`, `reducerFormLaporan()` | Normal | Buat state ReportIt, isi informasi dan tambah satu File. Jalankan I-11 → I-12 → I-13 → I-12 → I-11, lalu maju lagi | Form mulai di I-11 dengan data kosong. Saat kembali dan maju lagi, isian serta objek File terpilih tetap sama | State awal `langkah: 0`, judul kosong, koordinat `null`, dan media `[]`. Isian serta referensi File bertahan pada seluruh rangkaian (`form-laporan.test.ts`) | Pass |
| C01-UT02 | `buat_laporan()` → batas isian pada `validasiInformasiDasar()` | Batas | Judul 80/81 karakter dan alamat 255/256 karakter. Tambahkan spasi tepi pada judul 80 karakter | Batas inklusif 80/255 lolos. Nilai yang melebihi batas ditolak pada field terkait. Spasi tepi tidak ikut dihitung | Judul 80 dan alamat 255 lolos. Judul 81 menghasilkan `fields.judul` dan alamat 256 menghasilkan `fields.lokasi`. Judul 80 dengan spasi tepi tetap lolos (`informasi-dasar.test.ts`) | Pass |
| C01-UT03 | `buat_laporan()` → kelengkapan, format, dan waktu pembersihan | Negatif | Validasi ReportIt kosong, koordinat `NaN`, serta waktu CleanIt 1 ms sebelum waktu kejadian asal `2026-11-10T02:15:30.500Z` | Data kosong menghasilkan `DATA_TIDAK_LENGKAP`, koordinat `NaN` menghasilkan `FORMAT_TIDAK_VALID`, dan waktu CleanIt ditolak pada `waktu` | Kedua kode sesuai harapan. CleanIt `09:15:30.499` WIB ditolak dengan pesan waktu sebelum kejadian (`informasi-dasar.test.ts`, `form-cleanit.test.ts`) | Pass |
| C01-UT04 | `ambil_gambar()` → `validasiPilihanMedia()` dan `AntreanMedia` | Normal | Validasi tipe JPG, PNG, dan MP4. Tambah satu File saat antrean aktif dalam keadaan offline, lalu ubah keadaan menjadi online | Ketiga tipe diterima. File menunggu saat offline, lalu unggah mulai satu kali dengan File yang sama | Ketiga MIME lolos. Pemanggilan transport 0 saat offline dan 1 setelah online dengan objek File yang sama (`bukti-media.test.ts`, `antrean-media.test.ts`) | Pass |
| C01-UT05 | `ambil_gambar()` → batas `validasiPilihanMedia()` | Batas | PNG sintetis berukuran 20.971.520 dan 20.971.521 byte. Tambahkan dua bukti pada daftar yang sudah berisi satu atau dua bukti | Tepat 20 MiB dan total tiga media diterima. Satu byte lebih besar atau total empat media ditolak | Pada batas, validator mengembalikan `null`. Di atas batas, validator mengembalikan pesan 20 MB atau maksimal tiga media (`bukti-media.test.ts`) | Pass |
| C01-UT06 | `ambil_gambar()` → kesiapan `mediaSiapDikirim()` dan penanganan `AntreanMedia` | Negatif | Bukti kosong, bukti belum mendapat ID, atau dua bukti dengan ID yang sama. Simulasikan unggahan ditolak dengan `409 MEDIA_SUDAH_DIGUNAKAN` | Bukti belum siap dikirim. Konflik meminta penggantian media | `mediaSiapDikirim()` mengembalikan `false` untuk semua masukan tidak siap. Antrean menghasilkan status `gagal` dengan `bisaUlang: false` pada konflik (`bukti-media.test.ts`, `antrean-media.test.ts`) | Pass |
| C01-UT07 | State `buka_menu_cleanit()` dan `buat_laporan()` → `buatStateFormLaporan()`, `siapkanKirimLaporan()` | Normal | Buat konfigurasi CleanIt dengan nama lokasi Teras Cikapundung. Siapkan payload ReportIt/CleanIt dari fixture waktu 1 Januari 2026 pukul 09.30 WIB dan ID media `[21, 22]` | Judul awal CleanIt mengikuti K7. Payload dikirim sebagai 02.30 UTC. ReportIt membawa lokasi, koordinat, sumber, dan jenis sampah. CleanIt membawa `lokasiId` | Judul awal `Pembersihan Teras Cikapundung`. Kedua payload memakai `2026-01-01T02:30:00.000Z` dan `[21, 22]`. Pada fixture CleanIt, `lokasiId: 7` diteruskan tanpa field khusus ReportIt (`form-cleanit.test.ts`, `kirim-laporan.test.ts`) | Pass |
| C01-UT08 | `notify(msg)` dan hasil `buat_laporan()` → `kegagalanKirimLaporan()`, `hasilKirimValid()` | Negatif | Petakan error `400` dengan `fields.waktu` dan `idMedia.0`, konflik `409` CleanIt menunggu, dan respons `2xx` dengan ID 0 atau status `VALID` | Error dikelompokkan per bagian. Konflik menawarkan daftar lokasi. Respons dengan ID/status tidak sah ditolak | Pesan masuk bagian `waktu` dan `media`. Konflik mengembalikan `pilihLokasiLain: true`. `hasilKirimValid()` mengembalikan `false` untuk respons rusak (`kirim-laporan.test.ts`) | Pass |

Khusus kelas **Mendalam**:

Tabel 4.2.1b. Ringkasan Cakupan C01

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `buka_reportit()`, `notify(msg)`, `buka_menu_cleanit()`, `buat_laporan(lokasi, waktu, idMedia, sumber)` (DPPL §5.1). Operasi privat `ambil_gambar()` tercakup pada pemilihan dan antrean bukti |
| Operasi yang diuji | Inisialisasi ReportIt/CleanIt, reducer, validasi, pemilihan/antrean media, payload, dan pemetaan pesan diuji pada C01-UT01–C01-UT08. Navigasi aktual, tampilan pesan, dan pengiriman browser diuji pada UC01, UC02, dan UC05 di 4.4. |
| ID Algoritma yang tercakup | Algo-001 (`buka_reportit`, C01-UT01 dan UC01-TC01), Algo-002 (`notify`, C01-UT08 dan pengujian pesan di 4.4), Algo-003 (`buka_menu_cleanit`, C01-UT07 dan UC05-TC01), dan Algo-004 (`buat_laporan`, C01-UT02/03/07/08, UC01, UC05) |
| Coverage (wajib ≥ 70%) | **98,64% baris (219/222)**, **94,11% cabang (272/289)**, dan **94,11% fungsi (64/68)** sesuai keluaran Vitest Coverage V8. Pengukuran mencakup tujuh modul logika C01 di `lib/`, yaitu `form-laporan.ts`, `informasi-dasar.ts`, `form-cleanit.ts`, `bukti-media.ts`, `antrean-media.ts`, `kirim-laporan.ts`, dan `judul.ts`. Komponen TSX dan jalur HTTP browser diperiksa terpisah di 4.4. Ringkasan tersedia pada BUKTI-39 |

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
| Coverage (wajib ≥ 70%) | 73.33% branch dan 74.19% lines (hanya mengacu pada `model-laporan.test.ts`), 100% (model-detail-laporan.test.ts, verifikasi-ganda.test.ts, validasi-laporan.test.ts, api-setujui-reportit.test.ts, tests/api-setujui-cleanit.test.ts ) |

### 4.2.3 Kelas Media

**ID Kelas:** *[C03]*
**Nama Kelas:** *[Media]*
**Tingkat:** *[Mendalam]*

Note: hanya melaporkan operasi pada `server/models/media.ts`. Pengujian controller upload, pemrosesan gambar/video, dan adapter object storage tidak dihitung sebagai coverage Model Media.

Tabel 4.2.3. Hasil Pengujian Unit Kelas [C03]

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *C03-UT01* | `sudahDipakai(sha256: string, tx: Eksekutor = db): Promise<boolean>` | Normal/negatif | Periksa hash yang tertaut ke laporan `VALID`, laporan `TIDAK_VALID`, media belum tertaut, dan hash yang tidak ada | True hanya untuk hash media pada laporan yang tidak ditolak, sisanya false | True hanya untuk hash media pada laporan yang tidak ditolak, sisanya false | *Pass* |
| *C03-UT02* | `buatMedia(input: MediaBaru): Promise<number>` | Normal | Simpan metadata media berisi pengguna, storage key, tipe, ukuran, hash, dan waktu unggah | Baris media tersimpan dengan nilai sesuai input dan `laporan_id` NULL | Baris media tersimpan dengan nilai sesuai input dan `laporan_id` NULL| *Pass* |
| *C03-UT03* | `getUntukLaporan(idMedia: number[], idPengguna: string, tx: Eksekutor = db,): Promise<MediaUntukLaporan[]>` | Normal/negatif | Ambil ID media milik pengguna, ID media milik pengguna lain, ID yang tidak ada, panggil juga dengan daftar ID kosong | Media milik pengguna dikembalikan, daftar kosong menghasilkan `[]` | Media milik pengguna dikembalikan, daftar kosong menghasilkan `[]` | *Pass* |
| *C03-UT04* | `tautkanKeLaporan(idMedia: number[], idPengguna: string, idLaporan: number,: Pick<Db, "update"> = db,): Promise<number>` | Normal/negatif | Tautkan media belum terpakai milik pengguna, sertakan juga media pengguna lain, media yang sudah tertaut, ID tidak ada, dan daftar kosong | Hanya media belum tertaut milik pengguna yang berubah dengan nilai kembalian adalah jumlah baris yang berubah, daftar kosong menghasilkan `0` | Hanya media belum tertaut milik pengguna yang berubah dengan nilai kembalian adalah jumlah baris yang berubah, daftar kosong menghasilkan `0` | *Pass* |
| *C03-UT05* | `getByLaporan(idLaporan: number, tx: Eksekutor = db): Promise<MediaTersimpan[]>` | Normal/negatif | Buat dua media pada satu laporan dan satu media tanpa tautan, lalu ambil media berdasarkan ID laporan | Hanya media pada laporan tersebut yang dikembalikan dalam urutan ID unggah | Hanya media pada laporan tersebut yang dikembalikan dalam urutan ID unggah | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.3b. Ringkasan Cakupan Kelas [C03]

| Informasi | Keterangan |
| :--- | :--- |
| Operasi pada Model Media yang diuji | `sudahDipakai(sha256: string, tx: Eksekutor = db): Promise<boolean>`, `buatMedia(input: MediaBaru): Promise<number>`, `getUntukLaporan(idMedia: number[], idPengguna: string, tx: Eksekutor = db,): Promise<MediaUntukLaporan[]>`, `tautkanKeLaporan(idMedia: number[], idPengguna: string, idLaporan: number,: Pick<Db, "update"> = db,): Promise<number>`, `getByLaporan(idLaporan: number, tx: Eksekutor = db): Promise<MediaTersimpan[]>` |
| Operasi yang diuji | `sudahDipakai(sha256: string, tx: Eksekutor = db): Promise<boolean>`, `buatMedia(input: MediaBaru): Promise<number>`, `getUntukLaporan(idMedia: number[], idPengguna: string, tx: Eksekutor = db,): Promise<MediaUntukLaporan[]>`, `tautkanKeLaporan(idMedia: number[], idPengguna: string, idLaporan: number,: Pick<Db, "update"> = db,): Promise<number>`, `getByLaporan(idLaporan: number, tx: Eksekutor = db): Promise<MediaTersimpan[]>` |
| ID Algoritma yang tercakup | Algo-010 |
| Coverage (wajib ≥ 70%) | 100% |

<br>

### 4.2.5 C04 DaftarLaporan

**ID Kelas:** C04  
**Nama Kelas:** DaftarLaporan  
**Tingkat:** Mendalam  

Note: Yang diuji unit adalah fungsi murni di `lib/laporan.ts` yang dipakai `components/DaftarLaporan.tsx` (I-07), melalui `tests/laporan.test.ts`. Komponen `.tsx` tidak diuji unit karena Vitest berjalan di environment `node` tanpa DOM; tampilannya diverifikasi lewat UC03 dan UC06. Operasi `daftar_laporan(laporan)` tidak diimplementasikan di View karena INSERT laporan dilakukan Model lewat Controller (B.5 Tugas 9, catatan N16), sehingga diuji pada C02.

Tabel 4.2.5. Hasil Pengujian Unit C04

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C04-UT01 | `pilih_menu_verifikasi()` / `buka_laporan_masuk()` → `bacaFilterValidasi(params: BacaParam): FilterValidasi` | Normal | Query `jenis=cleanit&sort=terlama&page=3` | `{ jenis: "CLEANIT", sort: "terlama", page: 3 }` | Mengembalikan `{ jenis: "CLEANIT", sort: "terlama", page: 3 }` | *Pass* |
| C04-UT02 | `bacaFilterValidasi(params: BacaParam): FilterValidasi` | Batas | `page=1000000` (batas atas BE-22), `page=1000001`, dan `page=0` | `1000000` diterima; `1000001` dan `0` dibaca sebagai halaman 1 | `page` = 1.000.000 untuk masukan pertama; 1 untuk dua masukan lainnya | *Pass* |
| C04-UT03 | `bacaFilterValidasi(params: BacaParam): FilterValidasi` | Negatif | Query yang diketik manual: `jenis=CLEANIT&sort=acak`, serta `page` = `-1`, `abc`, `1.5`, `2e3`, dan kosong | Jatuh ke default `{ jenis: "REPORTIT", sort: "terbaru", page: 1 }`, tidak error | Semua masukan menghasilkan nilai default | *Pass* |
| C04-UT04 | `tampilkan_daftar(list)` → `formatIdLaporan(idLaporan: number): string` dan `formatWaktuKirim(iso: string, sekarang: number): string` | Normal | ID 248; laporan yang dikirim 15 menit dan 8 hari sebelum `sekarang` | `"RPT-0248"`, `"15 menit lalu"`, dan tanggal WIB `"29 Okt 2026"` | `"RPT-0248"`, `"15 menit lalu"`, dan `"29 Okt 2026"` | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.5b. Ringkasan Cakupan C04

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `daftar_laporan(laporan)`, `pilih_menu_verifikasi()`, `pilih_laporan(idLaporan)`, `tampilkan_daftar(list)`, `buka_laporan_masuk()` |
| Operasi yang diuji | `pilih_menu_verifikasi()` dan `buka_laporan_masuk()` (tab, urutan, dan halaman dari URL: `bacaFilterValidasi`, `urlValidasi`), `tampilkan_daftar(list)` (`formatIdLaporan`, `formatWaktuKirim`). `pilih_laporan(idLaporan)` hanya membuka modal I-08 dan diverifikasi pada UC03-TC01 dan UC06-TC01. `daftar_laporan(laporan)` diuji pada C02 |
| ID Algoritma yang tercakup | Algo-002 (`pilih_menu_verifikasi`), Algo-003 (`tampilkan_daftar`). Algo-001 dipindah ke C02/C15 |
| Coverage (wajib ≥ 70%) | 98,27% lines (57/58) dan 96,55% branch (56/58) pada `lib/laporan.ts`, 93,33% fungsi (14/15). Satu-satunya fungsi yang tidak tereksekusi adalah `urlPeta` (tautan OpenStreetMap di I-08). File ini dipakai bersama C04 dan C14. Alat: Vitest Coverage V8, bukti pada BUKTI-43 |

### 4.2.8 C07 DaftarLokasi

**ID Kelas:** C07  
**Nama Kelas:** DaftarLokasi  
**Tingkat:** Sedang  

`DaftarLokasi` mengoordinasikan pembacaan API dan GPS. `KartuLokasi` menautkan detail dan `LokasiKosong` menampilkan I-10 setelah respons daftar kosong yang sah. Logika pengurutan, jarak, dan validasi respons berada di `lib/lokasi.ts`. Jalur pilih lokasi hingga tampilan detail Masyarakat diuji melalui UC04-TC01 di 4.4.

Tabel 4.2.8. Hasil Pengujian Unit C07

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C07-UT01 | `tampilkan_daftar(list)` → `ambilPosisiPengguna()`, `jarakHaversineKm()`, `urutkanLokasi()` | Normal | Tiga lokasi fixture `[31, 32, 33]`, GPS `(-6,886; 107,6065)`, urutan Terdekat | Lokasi 32, 31, 33 diurutkan menurut jarak. Seluruh lokasi tetap ditampilkan | GPS mengembalikan posisi fixture. Urutan `[32, 31, 33]`, jarak pertama sekitar 0,111195 km, dan lokasi lebih dari 100 km masih ada. Array input tetap `[31, 32, 33]` (`lokasi.test.ts`) | Pass |
| C07-UT02 | `buka_fitur_cleanit()` dan `tampilkan_daftar(list)` → `lokasiApi.daftar()`, `bacaDaftarLokasi()` | Batas | Handler `GET /api/lokasi` memakai model fixture yang mengembalikan `[]` | Daftar kosong diterima sebagai hasil sukses untuk I-10 | Client dan parser menerima `[]`. Tampilan I-10 diuji terpisah pada UC04-TC02 (`lokasi-client.test.ts`, `lokasi.test.ts`) | Pass |
| C07-UT03 | `notify(msg)` dan fallback daftar → `ambilPosisiPengguna()`, `urutkanLokasi()`, `bacaDaftarLokasi()` | Negatif | Simulasikan GPS ditolak (`code: 1`), pengurutan tanpa posisi, dan data daftar dengan status `DIBERSIHKAN` | GPS memberi pesan izin ditolak. Urutan kembali ke Terbaru tanpa label jarak. Respons yang tidak memenuhi kontrak ditolak | Pesan izin ditolak muncul dari helper GPS. ID diurutkan `[31, 32, 33]` dengan seluruh `jarakKm: null`. Parser melempar error untuk status di luar kontrak daftar (`lokasi.test.ts`) | Pass |

BUKTI-08 mencatat hasil pengujian unit dan kontrak C07.

### 4.2.9 C08 Pengguna (Auth FE)

**ID Kelas:** C08  
**Nama Kelas:** Pengguna (Auth FE)
**Tingkat:** Sedang  

Note: Operasi C08 pada DPPL (`getSaldoPoin`, `cukupPoin`, `kurangiPoin`, `tambah_poin`, `notify`) berada di sisi server dan diuji pada bagian backend. Bagian ini menguji sisi tampilan C08 sesuai Tabel B.5 dokumen Implementasi: data Beranda (atribut `nama` dan `saldoPoin`) serta validasi Login/Register, yang merupakan tambahan di luar DPPL (B.1 no. 21). 

Tabel 4.2.9. Hasil Pengujian Unit C08 (FE-A)

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C08-UT01 | `authApi.me(): Promise<MeResponse>` dan `formatPoin(poin: number): string` (data Beranda) | Normal | Login ke mock API sebagai `masyarakat@soclean.test`, lalu ambil data pengguna lewat `authApi.me()` dan format saldonya dengan `formatPoin()` | Nama "Dapin Tampan" dan saldo "67" siap ditampilkan di Beranda | Nama "Dapin Tampan" dan saldo "67" | *Pass* |
| C08-UT02 | `validasiRegister(isian: IsianRegister): GalatRegister \| null` | Batas | Nama dan email valid; password 7 karakter (`1234567`), 72 karakter, dan 73 karakter | 7 karakter ditolak ("Password minimal 8 karakter."); 72 karakter diterima; 73 karakter ditolak ("Password maksimal 72 karakter.") | Sesuai harapan untuk ketiga masukan | *Pass* |
| C08-UT03 | `validasiLogin(isian: IsianLogin): GalatLogin \| null` | Negatif | Email `warga@` (format salah), password `x` | Galat pada field email: "Format email tidak valid." | Galat "Format email tidak valid." muncul | *Pass* |

### 4.2.10 C08 Pengguna (Auth BE)

**ID Kelas:** C08
**Nama Kelas:** Pengguna (Auth BE)
**Tingkat:** Mendalam

Note: Operasi C08 pada DPPL yang berkaitan dengan saldo poin (`getSaldoPoin`, `cukupPoin`, `kurangiPoin`, `tambah_poin`) dan `notify` diuji pada 4.2.11 (BE-B). Bagian ini menguji operasi auth dan sesi yang ditambahkan pada implementasi (BE-05): pencarian akun login, pembuatan akun Masyarakat, pembacaan profil, aturan akun, serta token/cookie/guard sesi. `cariUntukLogin`, `buatMasyarakat`, dan `getMe` hanya memakai normal/negatif karena masukannya berupa email atau ID (UUID) tanpa rentang nilai, sehingga tidak ada nilai batas yang menguji aturan berbeda. Batas panjang nama/email/password divalidasi `registerSchema` dan diuji pada C08-UT07, sedangkan batas sesi 7 hari diuji pada C08-UT08.

Tabel 4.2.10. Hasil Pengujian Unit C08 (BE-A)

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C08-UT04 | `cariUntukLogin(email: string): Promise<PenggunaUntukLogin \| null>` | Normal/negatif | Cari akun dengan email yang ditulis berbeda kapital dan spasinya; lalu cari email yang belum terdaftar | Email dinormalisasi sebelum pencarian, data akun beserta `passwordHash` kembali, email tidak ada menghasilkan `null` | Email dinormalisasi sebelum pencarian, data akun beserta `passwordHash` kembali, email tidak ada menghasilkan `null` | *Pass* |
| C08-UT05 | `buatMasyarakat(input): Promise<Pengguna \| null>` | Normal/negatif | Daftarkan akun dengan nama/email berspasi, lalu daftarkan lagi dengan email yang sama dalam kapital berbeda | Nama dan email tersimpan ternormalisasi, role selalu `MASYARAKAT`, email duplikat menghasilkan `null` dan tidak menimpa akun lama | Nama dan email tersimpan ternormalisasi, role selalu `MASYARAKAT`, email duplikat menghasilkan `null` dan tidak menimpa akun lama | *Pass* |
| C08-UT06 | `getMe(idPengguna: string): Promise<PenggunaMe \| null>` | Normal/negatif | Ubah saldo pengguna langsung di database, lalu baca profil lewat `getMe`. Panggil juga dengan ID yang tidak ada | Profil terbaru dari database dikembalikan, termasuk saldo terbaru, ID tidak ada menghasilkan `null` | Profil terbaru dari database dikembalikan, termasuk saldo terbaru, ID tidak ada menghasilkan `null` | *Pass* |
| C08-UT07 | `normalisasiEmail`, `normalisasiNama`, `registerSchema`, `loginSchema`, `hashPassword`, `verifyPassword` | Normal/batas/negatif | Uji normalisasi nama/email, batas nama 1-100 dan password 8-72 karakter (nilai tepat batas dan satu di luarnya), password sama dengan email, hash bcrypt cost 12, serta verifikasi password benar/salah | Normalisasi konsisten, nama 1 dan 100 serta password 8 dan 72 diterima sedangkan nama 101 dan password 7/73 ditolak, password sama dengan email ditolak, hash berformat bcrypt cost 12 dan hanya password benar yang lolos verifikasi | Normalisasi konsisten, nama 1 dan 100 serta password 8 dan 72 diterima sedangkan nama 101 dan password 7/73 ditolak, password sama dengan email ditolak, hash berformat bcrypt cost 12 dan hanya password benar yang lolos verifikasi | *Pass* |
| C08-UT08 | `signSessionToken`, `verifySessionToken`, `sessionCookieOptions`, `setSessionCookie`, `getSessionCookie`, `deleteSessionCookie`, `requireRoleCookie`, `wajibLogin` | Normal/batas/negatif | Tanda tangani dan verifikasi token, uji validitas sesaat sebelum dan tepat pada batas 7 hari, uji token dengan secret berbeda, role tidak valid, set/read/delete cookie, guard tanpa cookie, token palsu, dan role salah | Token valid berisi klaim sesi, masih diterima sesaat sebelum 7 hari dan kedaluwarsa tepat pada batas; token/role tidak valid ditolak, cookie `httpOnly` 7 hari di-set, dibaca, dan dihapus; guard mengembalikan `UNAUTHORIZED`/`FORBIDDEN` sesuai kondisi | Token valid berisi klaim sesi, masih diterima sesaat sebelum 7 hari dan kedaluwarsa tepat pada batas; token/role tidak valid ditolak, cookie `httpOnly` 7 hari di-set, dibaca, dan dihapus; guard mengembalikan `UNAUTHORIZED`/`FORBIDDEN` sesuai kondisi | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.10b. Ringkasan Cakupan C08 (BE-A)

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `tambah_poin(idPengguna, jumlahPoin)`, `notify(msg)`, `getSaldoPoin()`, `cukupPoin(harga)`, `kurangiPoin(jumlah)`, `cariUntukLogin`, `buatMasyarakat`, `getMe`, serta helper `server/auth/*` |
| Operasi yang diuji | `cariUntukLogin`, `buatMasyarakat`, `getMe`, `normalisasiEmail`, `normalisasiNama`, `registerSchema`, `loginSchema`, `hashPassword`, `verifyPassword`, `signSessionToken`, `verifySessionToken`, `sessionCookieOptions`, `setSessionCookie`, `getSessionCookie`, `deleteSessionCookie`, `requireRoleCookie`, `wajibLogin` |
| ID Algoritma yang tercakup | Aturan akun N7 dan aturan sesi 7 hari. Algo-002 dan Algo-004 (saldo poin) dicakup pada 4.2.11 BE-B |
| Coverage (wajib ≥ 70%) | `server/auth/*`: 96,72% baris dan 96,87% cabang. Operasi auth pada `server/models/pengguna.ts` diuji DB-backed, tetapi angka berkasnya tidak dipakai untuk BE-A karena berkas yang sama memuat operasi saldo/notifikasi milik BE-B. Untuk kelas C08 utuh bersama BE-B: 96,55% baris, 96,87% cabang, 100% fungsi. |
### 4.2.12 C08 Pengguna (Profil)

**ID Kelas:** C08  
**Nama Kelas:** Pengguna (Profil) 
**Tingkat:** Sedang  

Note: Bagian ini menguji sisi tampilan C08 milik halaman Profil (`components/ProfilMasyarakat.tsx` dan `components/ProfilOperator.tsx`) melalui fungsi murni di `lib/profil.ts` (`tests/profil.test.ts`). Operasi `notify(msg)` diwujudkan di View sebagai teks notifikasi yang disusun dari data `GET /api/notifikasi` (B.1 no. 22, N8).

Tabel 4.2.12. Hasil Pengujian Unit C08 (FE-C)

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C08-UT14 | `notify(msg)` → `pesanNotifikasi(n: Notifikasi): string` | Normal | Notifikasi CleanIt `VALID` dengan `poinDiberikan: 200` | Pesan memuat "disetujui" dan "200 poin" | Pesan "Bukti pembersihan Anda disetujui. Anda mendapat 200 poin." | *Pass* |
| C08-UT15 | `notify(msg)` → `alasanNotifikasi(n: Notifikasi): string \| null` | Batas | Notifikasi ReportIt `TIDAK_VALID` dengan `alasanPenolakan` `null` dan `"   "` (hanya spasi) | `null`, sehingga kotak alasan tidak ditampilkan | Mengembalikan `null` untuk kedua masukan | *Pass* |
| C08-UT16 | `notify(msg)` → `pesanNotifikasi(n: Notifikasi): string` | Negatif | Notifikasi CleanIt `VALID` tanpa data poin (`poinDiberikan: null`) | Pesan tidak memuat "null", "undefined", maupun "poin" | Pesan "Bukti pembersihan Anda disetujui." | *Pass* |

### 4.2.14 C10 DaftarReward

**ID Kelas:** C10  
**Nama Kelas:** DaftarReward  
**Tingkat:** Sedang  

Note: `tampilkanDaftarReward(daftar)` diwujudkan oleh `components/DaftarReward.tsx`. Logika yang diuji adalah `statusTombolReward` di `lib/reward.ts` (`tests/reward.test.ts`), yang menentukan tombol pada tiap kartu reward.

Tabel 4.2.14. Hasil Pengujian Unit C10

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C10-UT01 | `tampilkanDaftarReward(daftar)` → `statusTombolReward(reward: Pick<Reward, "hargaPoin" \| "stok">, saldoPoin: number): StatusTombolReward` | Normal | Reward harga 50, stok 3; saldo 120 | `{ status: "TUKAR" }` | `{ status: "TUKAR" }` | *Pass* |
| C10-UT02 | `statusTombolReward(reward: Pick<Reward, "hargaPoin" \| "stok">, saldoPoin: number): StatusTombolReward` | Batas | Reward harga 100, stok 1; saldo tepat 100 | `{ status: "TUKAR" }` | `{ status: "TUKAR" }` | *Pass* |
| C10-UT03 | `statusTombolReward(reward: Pick<Reward, "hargaPoin" \| "stok">, saldoPoin: number): StatusTombolReward` | Negatif | (a) Reward harga 200, stok 5; saldo 120.<br>(b) Reward harga 50, stok 0; saldo 500 | (a) `{ status: "KURANG", selisih: 80 }`; (b) `{ status: "HABIS" }` | (a) `{ status: "KURANG", selisih: 80 }`; (b) `{ status: "HABIS" }` | *Pass* |

### 4.2.16 C12 HalamanPenukaran

**ID Kelas:** C12  
**Nama Kelas:** HalamanPenukaran  
**Tingkat:** Mendalam  

Note: C12 diwujudkan oleh `components/HalamanPenukaran.tsx` (I-04), `KonfirmasiPenukaran.tsx` (I-05), `PenukaranBerhasil.tsx` (I-06), dan `RiwayatPenukaran.tsx`. Yang diuji unit adalah fungsi murni di `lib/penukaran.ts` (`tests/penukaran.test.ts`). `pilihReward(idReward)` diwujudkan sebagai konfirmasi di I-05 lalu `POST /api/penukaran`; hasil yang berhasil disimpan di `sessionStorage` dan dibaca I-06, sedangkan kegagalan ditangani menurut kode error (B.1 no. 26, N12).

Tabel 4.2.16. Hasil Pengujian Unit C12

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C12-UT01 | `pilihReward(idReward)` (berhasil) → `uraiHasilPenukaran(mentah: string \| null): TukarPoinResponse \| null` | Normal | JSON hasil `POST /api/penukaran` yang valid: `idPenukaran` UUID, `namaReward` "Stiker SoClean", `kodeVoucher` "SC-7KQM-X4TD", `poinDipakai` 20, `sisaPoin` 47, `waktuPenukaran` ISO | Objek `TukarPoinResponse` yang sama dengan masukan | Objek identik dengan masukan | *Pass* |
| C12-UT02 | Riwayat penukaran (N13) → `bacaHalaman(param: string \| null): number` | Batas | `?page=` bernilai `"1"`, `"1000000"`, `"1000001"`, dan `"0"` | `1` → 1; `1000000` → 1.000.000; `1000001` dan `0` → 1 | Sesuai harapan untuk keempat masukan | *Pass* |
| C12-UT03 | `pilihReward(idReward)` (gagal) → `tindakanGagalTukar(code: KodeErrorKlien): TindakanGagalTukar` | Negatif | Kode error `POIN_TIDAK_CUKUP`, `STOK_HABIS`, dan `NOT_FOUND` | `{ tutup: true, muatUlang: true }`: sheet I-05 ditutup, saldo dan daftar reward dimuat ulang | `{ tutup: true, muatUlang: true }` untuk ketiga kode | *Pass* |
| C12-UT04 | `tampilkanNotifikasi(pesan)` (I-06) → `formatWaktuPenukaran(iso: string): string` dan `formatIdPenukaran(id: string): string` | Normal | Waktu `2026-10-28T03:24:00Z`; ID `3f2a9c1e-7b4d-4e2a-9c1e-3f2a9c1e7b4d` | `"28 Okt 2026, 10.24"` (WIB) dan `"3F2A9C1E"` | `"28 Okt 2026, 10.24"` dan `"3F2A9C1E"` | *Pass* |
| C12-UT05 | `uraiHasilPenukaran(mentah: string \| null): TukarPoinResponse \| null` | Negatif | Isi `sessionStorage` yang hilang atau diubah pengguna: `null`, `"{rusak"`, `"42"`, `kodeVoucher` hilang, `sisaPoin` bertipe string, dan `waktuPenukaran` "kemarin" | `null` untuk semua masukan, sehingga I-06 menampilkan state "data tidak ditemukan" | `null` untuk keenam masukan | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.16b. Ringkasan Cakupan C12

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `tampilkanSaldo(saldo)`, `pilihReward(idReward)`, `tampilkanNotifikasi(pesan)` |
| Operasi yang diuji | `pilihReward(idReward)` (berhasil dan gagal: `uraiHasilPenukaran`, `tindakanGagalTukar`), `tampilkanNotifikasi(pesan)` (format I-06: `formatWaktuPenukaran`, `formatIdPenukaran`), riwayat penukaran N13 (`bacaHalaman`). `tampilkanSaldo(saldo)` hanya menampilkan angka dari `GET /api/poin/saldo` di `KartuSaldo` tanpa logika, sehingga diverifikasi pada UC08-TC01 dan UC09-TC01 |
| ID Algoritma yang tercakup | Algo-002 (`pilihReward`); Algo-001 dan Algo-003 berupa tampilan saja, diverifikasi lewat UC09 |
| Coverage (wajib ≥ 70%) | 100% lines (20/20), 100% branch (31/31), dan 100% fungsi (5/5) pada `lib/penukaran.ts`. Alat: Vitest Coverage V8, bukti pada BUKTI-48 |

### 4.2.18 C14 LaporanView

**ID Kelas:** C14  
**Nama Kelas:** LaporanView  
**Tingkat:** Mendalam  

Note: Bagian ini mencakup operasi Operator pada `components/LaporanView.tsx` (modal I-08, UC03 dan UC06) melalui fungsi murni di `lib/laporan.ts` (`tests/laporan.test.ts`). Operasi Masyarakat (`tampilkan_lokasi`, `konfirmasi_bersihkan`, `tampilkan_konfirmasi`) diimplementasikan di `components/lokasi/` dan `lib/detail-lokasi.ts`, dan tidak termasuk C14-UT01 sampai C14-UT05.

Tabel 4.2.18. Hasil Pengujian Unit C14

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C14-UT01 | `setujui(idLaporan)` → `bodySetujui(detail, isian)` dan `cekIsianSetujui(detail, isian)` | Normal | ReportIt tanpa lokasi terdekat; isian poin 100, nama lokasi `"  Jembatan Cikapundung  "` | Body `{ poin: 100, namaLokasi: "Jembatan Cikapundung" }`; tidak ada pesan isian | Body sesuai harapan; `cekIsianSetujui` mengembalikan `{}` | *Pass* |
| C14-UT02 | `cekIsianSetujui(detail, isian)` | Batas | Nama lokasi 255 karakter dan 256 karakter (`varchar(255)`, K9) | 255 karakter lolos (`{}`); 256 karakter menghasilkan pesan pada `namaLokasi` | 255 → `{}`; 256 → `{ namaLokasi: "Nama lokasi maksimal 255 karakter." }` | *Pass* |
| C14-UT03 | `tolak(idLaporan)` → `cekAlasanTolak(jenis, alasan)` dan `bodyTolak(alasan)` | Negatif | Tolak CleanIt dengan alasan `" "`; tolak ReportIt dengan alasan kosong | CleanIt: pesan "Alasan penolakan wajib diisi untuk CleanIt."; ReportIt: lolos dengan body `{}` | Sesuai harapan untuk kedua jenis | *Pass* |
| C14-UT04 | `tampilkan_laporan(data)` → `formatWaktuLengkap(iso)`; `notify(msg)` setelah setujui → `pesanSetujui(detail, respons)` | Normal | Waktu `2023-10-14T03:45:00Z`; respons setujui CleanIt `poinDiberikan: 100` dengan pelapor "Dapin Tampan" | `"14 Oktober 2023, 10.45 WIB"` dan `"Laporan disetujui. 100 poin diberikan kepada Dapin Tampan."` | Kedua string sesuai harapan | *Pass* |
| C14-UT05 | `notify(msg)` setelah gagal → `tindakanGagalVerifikasi(code)` | Negatif | Kode error dari setujui/tolak: `SUDAH_DIVERIFIKASI`, `LOKASI_SUDAH_DIBERSIHKAN`, `NOT_FOUND`, `FORMAT_TIDAK_VALID`, `DATA_TIDAK_LENGKAP`, `INTERNAL_ERROR`, `JARINGAN`, dan `FORBIDDEN` | Tiga kode pertama → `"selesai"` (tombol Setujui/Tolak dinonaktifkan, Algo-004); kode isian → `"isian"`; lainnya → `"ulang"` | Setiap kode menghasilkan tindakan sesuai harapan | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.18b. Ringkasan Cakupan C14

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `tampilkan_laporan(data)`, `setujui(idLaporan)`, `tolak(idLaporan)`, `notify(msg)`, `tampilkan_lokasi(detail)`, `konfirmasi_bersihkan()`, `tampilkan_konfirmasi(msg)` |
| Operasi yang diuji | Bagian Operator: `tampilkan_laporan(data)`, `setujui(idLaporan)`, `tolak(idLaporan)`, `notify(msg)`. Fungsi format I-08 lain (`formatWaktuUnggah`, `formatJarak`, `formatKoordinat`) juga diuji di `tests/laporan.test.ts`. Bagian Masyarakat (`tampilkan_lokasi`, `konfirmasi_bersihkan`, `tampilkan_konfirmasi`) juga  diimplementasikan. |
| ID Algoritma yang tercakup | Algo-001, Algo-002, Algo-003, Algo-004 |
| Coverage (wajib ≥ 70%) | 98,27% lines (57/58) dan 96,55% branch (56/58) pada `lib/laporan.ts`, 93,33% fungsi (14/15). Satu-satunya fungsi yang tidak tereksekusi adalah `urlPeta` (tautan OpenStreetMap di I-08). File ini dipakai bersama C04 dan C14. Alat: Vitest Coverage V8, bukti pada BUKTI-50 |

<br>

### 4.2.19 C15 ManagerLaporan (validasi/POST)

**ID Kelas:** C15
**Nama Kelas:** ManagerLaporan (validasi/POST)
**Tingkat:** Mendalam

Note: Bagian ini menguji operasi validasi dan pembuatan laporan (`is_terisi`, `is_format_valid`, `cek_laporan`, `buat_laporan`). Operasi query/verifikasi (`get_all_laporan_unverified`, `get_daftar_lokasi`, `get_detail_lokasi`, `ubah_status`, `petakan_lokasi`, notifikasi) diuji terpisah pada bagian BE-B C15. C15-UT04 dan C15-UT05 memakai route handler nyata dengan PostgreSQL test dan bukan mock. Tipe kasus menurut operasi dan belum tentu diulang 3 kali. `is_terisi`, `is_format_valid`, dan `cek_laporan` diuji normal di C15-UT01, batas di C15-UT02, dan negatif di C15-UT03. `buat_laporan` diuji normal dan batas di C15-UT04 (satu dan tiga media, yaitu batas maksimum), sedangkan jalur media bermasalah, CleanIt bermasalah, dan rollback penautan ada di C15-UT05. Batas validasi tidak diulang di level endpoint karena sudah diuji langsung pada fungsi validasi.

Tabel 4.2.19. Hasil Pengujian Unit C15 (BE-A)

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C15-UT01 | `is_terisi(input): boolean`, `is_format_valid(input, sekarang): boolean`, `cek_laporan(input, idPengguna, tx, sekarang): Promise<LaporanTervalidasi>` | Normal | Input ReportIt lengkap dengan judul/lokasi berspasi dan media milik pengguna; periksa kelengkapan dan format, lalu panggil `cek_laporan` | `is_terisi` dan `is_format_valid` bernilai `true`, `cek_laporan` mengembalikan data tervalidasi dengan teks ter-trim, `idPengguna`, dan `waktu` bertipe `Date` | `is_terisi` dan `is_format_valid` bernilai `true`, `cek_laporan` mengembalikan data tervalidasi dengan teks ter-trim, `idPengguna`, dan `waktu` bertipe `Date` | *Pass* |
| C15-UT02 | `is_format_valid(input, sekarang): boolean` dan `cek_laporan(...)` pada nilai batas | Batas | Judul 80 dan 81 karakter, waktu tepat sekarang dan satu detik di masa depan, menggunakan 3 dan 4 ID media, koordinat +-90 s.d. +-180 dan 91−181, alamat 256 karakter | Nilai tepat batas diterima. Nilai di luar batas ditolak `FORMAT_TIDAK_VALID` | Nilai tepat batas diterima. Nilai di luar batas ditolak `FORMAT_TIDAK_VALID` | *Pass* |
| C15-UT03 | `cek_laporan(input, idPengguna, tx, sekarang)` | Negatif | Field wajib kosong (`idMedia: []`, lokasi berisi spasi), tipe salah (`latitude` string, `jenis` tidak dikenal), waktu di masa depan, koordinat di luar wilayah | Field kosong menghasilkan error `DATA_TIDAK_LENGKAP`, format/tipe salah dan waktu masa depan menghasilkan error `FORMAT_TIDAK_VALID`, koordinat luar wilayah menghasilkan error `DI_LUAR_WILAYAH` 422 | Kode, status, dan `fields` sesuai untuk setiap masukan (`validasi-laporan.test.ts`) | *Pass* |
| C15-UT04 | `buat_laporan(request, sesi): Promise<Response>` (POST `/api/laporan`) | Normal/batas | Buat ReportIt dengan satu media dan tiga media (batas maksimum), serta CleanIt dengan satu media lalu periksa baris laporan dan `media.laporan_id` di PostgreSQL | Kode `201` dengan luaran `{ idLaporan, status: "BELUM_DIPERIKSA" }`. Laporan tersimpan dan seluruh media, termasuk tiga media sekaligus, tertaut ke laporan baru | Kode `201` dengan luaran `{ idLaporan, status: "BELUM_DIPERIKSA" }`. Laporan tersimpan dan seluruh media, termasuk tiga media sekaligus, tertaut ke laporan baru | *Pass* |
| C15-UT05 | `cek_laporan(...)` dan `buat_laporan(...)` untuk jalur gagal | Negatif | Media tidak ada, milik pengguna lain, sudah tertaut, atau hash dipakai laporan aktif. CleanIt pada lokasi tidak ada, sudah dibersihkan, atau sudah punya CleanIt menunggu. Penautan media diatur agar mengembalikan 0 baris | Media bermasalah menghasilkan error `FORMAT_TIDAK_VALID`/`MEDIA_SUDAH_DIGUNAKAN`, CleanIt bermasalah menghasilkan `NOT_FOUND`/`LOKASI_SUDAH_DIBERSIHKAN`/`CLEANIT_SUDAH_MENUNGGU`, penautan gagal menggagalkan transaksi tanpa menyisakan laporan | Media bermasalah menghasilkan error `FORMAT_TIDAK_VALID`/`MEDIA_SUDAH_DIGUNAKAN`, CleanIt bermasalah menghasilkan `NOT_FOUND`/`LOKASI_SUDAH_DIBERSIHKAN`/`CLEANIT_SUDAH_MENUNGGU`, penautan gagal menggagalkan transaksi tanpa menyisakan laporan | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.19b. Ringkasan Cakupan C15 (BE-A)

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `cek_laporan(lokasi, waktu, idMedia, sumber)`, `is_terisi(lokasi, waktu, idMedia, sumber)`, `is_format_valid(lokasi, waktu, idMedia, sumber)`, `get_daftar_lokasi()`, `get_detail_lokasi(idLokasi)`, `get_all_laporan_unverified()`, `get_data(idLaporan)`, `ubah_status(idLaporan, status)`, `simpan_alasan_penolakan(idLaporan, alasan)`, `petakan_lokasi(idLaporan)`; implementasi menambahkan `buat_laporan` untuk POST `/api/laporan` |
| Operasi yang diuji (BE-A) | `is_terisi`, `is_format_valid`, `cek_laporan`, `buat_laporan` |
| ID Algoritma yang tercakup | Algo-053, Algo-054, Algo-055 |
| Coverage (wajib ≥ 70%) | Test BE-A saja: 55,83% line dan 62.22% branch, sisanya ada di bagian pengujian ManagerLaporan 4.2.20 untuk bagian query dan verifikasi. Gabungan dengan 4.2.20 menghasilkan 96,66% line, 93,33% branch |

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

Skenario berikut mengacu pada [SKPL §3.4](../M5/K03_G02_SKPL.md#34-skenario-use-case) dan keputusan K4, K6, K7, N2, N4, N5, N11, dan N15 dalam [kontrak v0.8](<../contracts/SoClean — Pembagian Tugas FE & BE v0.8.md>). Pengujian memakai build produksi dari salinan source lokal, Chrome Headless pada viewport 360 × 800 dan 1920 × 1080, serta akun Masyarakat dan media fiktif. Fixture HTTP menyediakan respons daftar/detail lokasi, unggahan, dan pengiriman. Skenario media menjalankan helper watermark server, sedangkan GPS, kuota, dan tile peta disimulasikan. `Pass` di tabel menunjukkan hasil untuk lingkungan uji tersebut. Integrasi PostgreSQL dan RustFS/R2, pengambilan media melalui kamera fisik, serta GPS perangkat nyata belum diverifikasi pada pengujian ini.

### 4.4.1 UC01 Membuat Laporan Pencemaran

**ID Use Case:** UC01  
**Nama Use Case:** Membuat Laporan Pencemaran  

Tabel 4.4.1. Hasil Pengujian UC01

| ID Pengujian | ID KF | Skenario | Prosedur Pengujian | Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UC01-TC01 | KF01, KF03, KF04 | Normal | Dari Beranda pilih ReportIt. Isi I-11 dengan GPS simulasi, unggah PNG di I-12, lalu gunakan Ubah Judul → Simpan Perubahan di I-13 dan kirim | Teras Cikapundung, `(-6.886, 107.6065)`, 11 November 2026 pukul 11.30 WIB, Pengamatan pribadi, Plastik, satu PNG sintetis | Form tiga langkah terbuka. Bukti tetap ada setelah judul diubah. Satu payload ReportIt memakai waktu UTC dan ID unggahan. UI menampilkan laporan menunggu pemeriksaan | I-13 menampilkan judul yang diubah dan bukti yang sama. Fixture menerima satu `POST /api/laporan` dengan `jenis: REPORTIT`, `waktu: 2026-11-11T04:30:00.000Z`, dan satu ID media. UI menampilkan `RPT-0407 · Menunggu pemeriksaan` (BUKTI-23a–b) | Pass |
| UC01-TC02 | KF03 | Alternatif 1 — Format informasi tidak valid | Isi seluruh field I-11, atur waktu kejadian di masa depan, lalu pilih Lanjut | `2099-11-11T11:30` WIB | Form tetap di I-11 dan menandai waktu. Tidak ada pengiriman laporan | Muncul pesan Waktu kejadian tidak boleh di masa depan. I-11 tetap tampil dan 0 POST laporan tercatat (BUKTI-23c) | Pass |
| UC01-TC03 | KF03 | Alternatif 2 — Informasi belum lengkap | Isi field I-11 selain judul, lalu pilih Lanjut | Judul kosong, field lain valid | Form tetap di I-11 dan menandai judul wajib diisi | Muncul pesan Judul laporan wajib diisi. I-11 tetap tampil dan 0 POST laporan tercatat (BUKTI-23d) | Pass |

### 4.4.2 UC02 Mengambil Bukti Foto/Video

**ID Use Case:** UC02  
**Nama Use Case:** Mengambil Bukti Foto/Video  

Tabel 4.4.2. Hasil Pengujian UC02

| ID Pengujian | ID KF | Skenario | Prosedur Pengujian | Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UC02-TC01 | KF02 | Normal — Pemilihan foto dari berkas | Masuk I-12 dari ReportIt dan pilih satu PNG pada input bukti. Tunggu respons unggahan | `bukti-sintetis.png`, PNG valid di bawah 20 MiB | File asli diunggah melalui multipart. Setelah menerima ID unggahan, UI menampilkan pratinjau foto yang diberi watermark waktu unggah oleh helper server | Satu POST media diterima fixture. Helper `prosesMediaAsli()` menambahkan watermark. UI menampilkan pratinjau dan Berhasil diunggah (BUKTI-24a) | Pass |
| UC02-TC02 | KF02 | Alternatif 1 — Kuota lokal tidak cukup (N15) | Simulasikan estimasi kuota situs melalui `navigator.storage.estimate()`, lalu pilih PNG di I-12 | Sisa estimasi 5 byte, berkas lebih besar | Pesan kegagalan tampil sebelum unggah dan tombol Lanjut tetap nonaktif | Pesan Ruang penyimpanan lokal tidak cukup tampil. 0 POST media tercatat dan tombol Lanjut nonaktif (BUKTI-24b) | Pass |
| UC02-TC03 | KF02 | Alternatif 2 — Antrean saat offline (N5) | Putuskan koneksi browser setelah I-12 terbuka, pilih PNG, lalu sambungkan kembali pada tab yang sama | Satu PNG sintetis dan perubahan jaringan offline → online | File menunggu di memori tab, Lanjut tertahan. Unggah dimulai saat koneksi kembali | UI menampilkan Menunggu koneksi dan Lanjut nonaktif. POST media tercatat 0 saat offline dan 1 setelah online. Status berubah menjadi Berhasil diunggah (BUKTI-24c–d) | Pass |


### 4.4.3 UC03 Memverifikasi Laporan ReportIt

**ID Use Case:** UC03  
**Nama Use Case:** Memverifikasi Laporan ReportIt

Note: Data uji berasal dari seed (`docker compose exec web npm run db:seed` dijalankan sebelum pengujian). Laporan yang dipakai adalah laporan ReportIt seed yang berstatus menunggu.

Tabel 4.4.3. Hasil Pengujian UC03

| ID Pengujian | ID KF | Skenario | Prosedur Pengujian | Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UC03-TC01 | KF05 | Normal | 1. Login sebagai Operator.<br>2. Pada I-07, pastikan tab ReportIt aktif.<br>3. Klik kartu laporan "Sampah plastik mengapung di Pantai Ancol timur".<br>4. Periksa detail di I-08.<br>5. Pilih poin, isi nama lokasi, klik "Setujui".<br>6. Login sebagai Masyarakat dan buka menu Lokasi (I-09). | Email: `operator@soclean.test`<br>Password: `soclean123`<br>Poin: 100<br>Nama lokasi: "Pantai Ancol Timur" | Setelah login, Operator langsung diarahkan ke I-07 berisi laporan menunggu. I-08 menampilkan judul, lokasi, koordinat, waktu WIB, sumber, jenis sampah, dan foto bukti beserta tombol Setujui/Tolak. Setelah disetujui muncul pesan "Laporan disetujui. Lokasi baru ditambahkan ke daftar CleanIt.", tombol dinonaktifkan, dan laporan hilang dari daftar menunggu. "Pantai Ancol Timur" (100 poin) tampil di I-09 | Setelah login, Operator langsung diarahkan ke I-07 yang berisi 3 laporan ReportIt menunggu. I-08 menampilkan judul, lokasi, koordinat, waktu WIB, sumber, jenis sampah, pelapor, dan 2 foto bukti beserta tombol Setujui/Tolak. Setelah disetujui muncul pesan "Laporan disetujui. Lokasi baru ditambahkan ke daftar CleanIt.", tombol Setujui/Tolak nonaktif, dan daftar menunggu menjadi 2. "Pantai Ancol Timur" (+100 poin) tampil di I-09, sesuai hasil yang diharapkan | *Pass* |
| UC03-TC02 | KF05 | Alternatif 1: Laporan tidak valid | 1. Login sebagai Operator.<br>2. Pada I-07 tab ReportIt, klik kartu "Ban bekas dan plastik di tepi Cikapundung".<br>3. Klik "Tolak", isi alasan, lalu konfirmasi.<br>4. Login sebagai pelapor, buka Profil lalu menu Lokasi. | Email Operator: `operator@soclean.test`<br>Email pelapor: `budi@soclean.test`<br>Password: `soclean123`<br>Alasan: "Foto tidak menunjukkan area perairan" | Muncul pesan "Laporan ditolak. Pelapor akan menerima notifikasi."; laporan hilang dari daftar menunggu. Profil pelapor menampilkan notifikasi "Laporan Anda ditolak Operator." beserta alasannya. Lokasi tersebut tidak muncul di I-09 | Muncul pesan "Laporan ditolak. Pelapor akan menerima notifikasi." dan daftar menunggu menjadi 1. Profil Budi menampilkan notifikasi "Laporan Anda ditolak Operator." dengan alasan "Foto tidak menunjukkan area perairan". Lokasi tersebut tidak muncul di I-09, sesuai hasil yang diharapkan | *Pass* |

### 4.4.4 UC04 Melihat Daftar Lokasi Pencemaran

**ID Use Case:** UC04  
**Nama Use Case:** Melihat Daftar Lokasi Pencemaran (CleanIt)  
Tabel 4.4.4. Hasil Pengujian UC04

| ID Pengujian | ID KF | Skenario | Prosedur Pengujian | Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UC04-TC01 | KF06, KF07 | Normal | Pilih CleanIt dari Beranda. Periksa urutan Terdekat, buka detail Teras Cikapundung, pilih Bersihkan, dan lanjutkan dari modal | Tiga lokasi `TERCEMAR` hasil fixture BE-17, GPS simulasi `(-6.886, 107.6065)`, detail lokasi 32 dengan foto laporan asal | Daftar diurutkan menurut jarak. Detail menampilkan lokasi, waktu kejadian, sumber, status/poin, dan bukti. Konfirmasi membuka form lokasi yang dipilih tanpa POST | Urutan kartu `[32, 31, 33]` dengan jarak pertama 111 m. Info laporan asal dan foto tampil. Konfirmasi membuka `/cleanit/32` dengan 0 POST media/laporan (BUKTI-26a–c) | Pass |
| UC04-TC02 | KF06 | Alternatif — Daftar lokasi kosong | Buka `/lokasi` dengan respons sukses kosong, lalu pilih Buat Laporan ReportIt | `GET /api/lokasi` merespons `{ data: [] }` | I-10 menampilkan pesan daftar kosong serta tautan ReportIt | Badge menampilkan 0 lokasi menunggu, pesan Belum terdapat lokasi pencemaran tampil, dan CTA membuka `/reportit` (BUKTI-26d) | Pass |

### 4.4.5 UC05 Mengirimkan Bukti Pembersihan

**ID Use Case:** UC05  
**Nama Use Case:** Mengirimkan Bukti Pembersihan (CleanIt)  

Tabel 4.4.5. Hasil Pengujian UC05

| ID Pengujian | ID KF | Skenario | Prosedur Pengujian | Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UC05-TC01 | KF08 | Normal | Buka form dari konfirmasi Bersihkan pada detail lokasi. Isi waktu, unggah bukti, tinjau, lalu kirim | Lokasi 32, waktu kejadian asal 10 November 2026 pukul 09.15 WIB, waktu pembersihan 11 November 2026 pukul 11.30 WIB, satu PNG | Nama lokasi tetap dan judul awal mengikuti K7. Satu POST `CLEANIT` membawa `lokasiId`, judul, waktu UTC, serta ID media. Sukses menampilkan ID dan status menunggu, lalu menghapus draf terkait | Judul awal Pembersihan Teras Cikapundung. Fixture menerima satu payload `CLEANIT` dengan `lokasiId: 32`, `waktu: 2026-11-11T04:30:00.000Z`, dan satu ID media. UI menampilkan `RPT-0417 · Menunggu pemeriksaan` dan draf lokasi 32 terhapus (BUKTI-27a–b) | Pass |
| UC05-TC02 | KF08 | Alternatif — Bukti tidak dapat dikirim | Coba lanjut dengan waktu sebelum laporan asal. Setelah waktu diperbaiki, pilih file terlalu besar. Ganti dengan PNG valid, lalu kirim ketika fixture menjawab konflik | Pembersihan 10 November 2026 pukul 09.14 WIB, file 20.971.521 byte, lalu `409 CLEANIT_SUDAH_MENUNGGU` | Validasi menahan waktu dan file. Konflik menampilkan pesan dan jalan kembali ke daftar. Isian, bukti, dan draf tetap ada | Waktu ditolak di I-11. File besar ditolak dengan 0 POST media pada upaya itu. Sesudah perbaikan, POST berikutnya mendapat 409, pesan laporan CleanIt menunggu tampil, I-13 dan bukti tetap terlihat, serta draf tidak terhapus (BUKTI-27c–e) | Pass |

### 4.4.6 UC06 Memverifikasi Laporan Pembersihan

**ID Use Case:** UC06  
**Nama Use Case:** Memverifikasi Laporan Pembersihan

Note: Data uji berasal dari seed. UC06-TC01 memakai laporan CleanIt milik Budi pada lokasi "Bibir Pantai Ancol Barat" (50 poin), sedangkan UC06-TC02 memakai laporan CleanIt Andi yang membersihkan sendiri lokasi yang ia laporkan.

Tabel 4.4.6. Hasil Pengujian UC06

| ID Pengujian | ID KF | Skenario | Prosedur Pengujian | Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UC06-TC01 | KF09, KF10, KF11 | Normal | 1. Login sebagai Masyarakat (Budi), catat saldo poin di Beranda, lalu logout.<br>2. Login sebagai Operator, buka tab CleanIt di I-07.<br>3. Klik kartu "Pembersihan Bibir Pantai Ancol Barat".<br>4. Periksa galeri Sebelum/Sesudah di I-08, klik "Setujui".<br>5. Login kembali sebagai Budi, buka Beranda dan Profil. | Email Operator: `operator@soclean.test`<br>Email Masyarakat: `budi@soclean.test`<br>Password: `soclean123` | I-07 tab CleanIt menampilkan daftar laporan pembersihan menunggu. I-08 menampilkan galeri Sebelum (laporan asal) dan Sesudah. Setelah disetujui muncul pesan "Laporan disetujui. 50 poin diberikan kepada Budi Santoso."; laporan hilang dari daftar. Saldo Budi bertambah 50 dan Profil menampilkan notifikasi "Bukti pembersihan Anda disetujui. Anda mendapat 50 poin." | I-07 tab CleanIt menampilkan 3 laporan pembersihan menunggu. I-08 menampilkan galeri Sebelum (dari RPT-0003) dan Sesudah. Setelah disetujui muncul pesan "Laporan disetujui. 50 poin diberikan kepada Budi Santoso." dan laporan hilang dari daftar (CleanIt lain untuk lokasi yang sama ikut ditolak otomatis). Saldo Budi naik dari 100 menjadi 150 dan Profil menampilkan notifikasi "Bukti pembersihan Anda disetujui. Anda mendapat 50 poin.", sesuai hasil yang diharapkan | *Pass* |
| UC06-TC02 | KF09 | Alternatif 1: Bukti tidak sah | 1. Login sebagai Operator, buka tab CleanIt di I-07.<br>2. Klik kartu "Pembersihan Pantai Barat Pangandaran" (tanda Pelapor = Relawan).<br>3. Klik "Tolak" tanpa alasan, lalu isi alasan dan konfirmasi.<br>4. Login sebagai Masyarakat (Andi), buka Profil. | Email Operator: `operator@soclean.test`<br>Email Masyarakat: `andi@soclean.test`<br>Password: `soclean123`<br>Alasan: kosong, lalu "Foto sesudah tidak di lokasi yang sama" | Penolakan tanpa alasan dicegah dengan pesan "Alasan penolakan wajib diisi untuk CleanIt.". Setelah alasan diisi muncul pesan "Laporan ditolak. Pelapor akan menerima notifikasi."; saldo Andi tidak bertambah. Profil Andi menampilkan notifikasi "Bukti pembersihan Anda ditolak Operator." beserta alasannya | I-08 menampilkan tanda "Pelapor = Relawan". Penolakan tanpa alasan dicegah dengan pesan "Alasan penolakan wajib diisi untuk CleanIt.". Setelah alasan diisi muncul pesan "Laporan ditolak. Pelapor akan menerima notifikasi.". Saldo Andi tetap 0 dan Profil Andi menampilkan notifikasi "Bukti pembersihan Anda ditolak Operator." beserta alasannya, sesuai hasil yang diharapkan | *Pass* |

### 4.4.7 UC07 Melihat Saldo Poin

**ID Use Case:** UC07  
**Nama Use Case:** Melihat Saldo Poin

Note: Pada SKPL, tidak ada skenario alternatif untuk UC07, sehingga UC07-TC02 menguji kondisi batas saldo poin 0.

Tabel 4.4.7. Hasil Pengujian UC07

| ID Pengujian | ID KF | Skenario | Prosedur Pengujian | Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UC07-TC01 | KF11, KF12 | Normal | 1. Buka halaman Login.<br>2. Login sebagai Masyarakat.<br>3. Lihat kartu "Poin Anda" di Beranda. | Email: `budi@soclean.test`<br>Password: `soclean123` | Beranda menampilkan saldo poin pengguna, yaitu 100 | Beranda menampilkan sapaan "Budi Santoso" dan kartu "Poin Anda" berisi 100, sesuai hasil yang diharapkan | *Pass* |
| UC07-TC02 | KF11, KF12 | Alternatif: saldo poin 0 | 1. Buka halaman Login.<br>2. Login sebagai Masyarakat yang belum punya poin.<br>3. Lihat kartu "Poin Anda" di Beranda. | Email: `andi@soclean.test`<br>Password: `soclean123` | Beranda menampilkan saldo "0" tanpa pesan error | Beranda menampilkan sapaan "Andi Pratama" dan kartu "Poin Anda" berisi 0 tanpa pesan error, sesuai hasil yang diharapkan | *Pass* |

### 4.4.8 UC08 Melihat Reward yang Tersedia

**ID Use Case:** UC08  
**Nama Use Case:** Melihat Reward yang Tersedia

Note: Pada SKPL, tidak ada skenario alternatif untuk UC08, sehingga UC08-TC02 menguji kondisi reward dengan stok 0 (reward seed "Tote Bag Daur Ulang").

Tabel 4.4.8. Hasil Pengujian UC08

| ID Pengujian | ID KF | Skenario | Prosedur Pengujian | Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UC08-TC01 | KF12 | Normal | 1. Buka halaman Login.<br>2. Login sebagai Masyarakat.<br>3. Klik menu "Hadiah" pada navigasi. | Email: `budi@soclean.test`<br>Password: `soclean123` | I-04 menampilkan kartu saldo poin dan lima reward seed (nama, jenis, harga poin), dengan reward ber-stok diurutkan lebih dulu. Tombol "Tukar" muncul pada reward yang harganya ≤ saldo | I-04 menampilkan kartu saldo (150) dan lima reward seed lengkap dengan jenis, stok, dan harga poin. Reward ber-stok berada di atas. Tombol "Tukar" muncul pada Voucher Kopi Rp25.000 (50 poin) dan Tumbler SoClean (100 poin); reward 200 poin menampilkan "Kurang 50", sesuai hasil yang diharapkan | *Pass* |
| UC08-TC02 | KF12 | Alternatif: reward habis | 1. Buka halaman Login.<br>2. Login sebagai Masyarakat.<br>3. Buka I-04 dan cari "Tote Bag Daur Ulang". | Email: `budi@soclean.test`<br>Password: `soclean123` | Reward tetap tampil di urutan bawah dengan tombol "Habis" yang tidak bisa diklik (B.1 no. 18) | "Tote Bag Daur Ulang" tampil paling bawah dengan keterangan "Stok habis" dan tombol "Habis" yang nonaktif; mengekliknya tidak membuka I-05, sesuai hasil yang diharapkan | *Pass* |

### 4.4.9 UC09 Menukarkan Poin dengan Reward

**ID Use Case:** UC09  
**Nama Use Case:** Menukarkan Poin dengan Reward

Note: Data uji berasal dari seed. Andi dipakai pada UC09-TC02 karena saldo poinnya 0.

Tabel 4.4.9. Hasil Pengujian UC09

| ID Pengujian | ID KF | Skenario | Prosedur Pengujian | Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UC09-TC01 | KF13, KF11 | Normal | 1. Login sebagai Masyarakat, buka I-04, catat saldo.<br>2. Klik "Tukar" pada "Voucher Kopi Rp25.000".<br>3. Periksa sisa poin di I-05, klik "Tukarkan".<br>4. Di I-06, klik salin kode voucher.<br>5. Kembali ke Hadiah lalu buka Riwayat Penukaran. | Email: `budi@soclean.test`<br>Password: `soclean123`<br>Reward: "Voucher Kopi Rp25.000" (50 poin) | I-05 menampilkan reward, harga, dan sisa poin (saldo − 50). Setelah konfirmasi, I-06 menampilkan kode voucher `SC-XXXX-XXXX`, poin dipakai 50, sisa poin, dan waktu WIB; salin memunculkan "Kode voucher disalin". Saldo di I-04 berkurang 50, stok voucher berkurang 1, dan penukaran tercatat paling atas di Riwayat | I-05 menampilkan Voucher Kopi Rp25.000, Poin Anda 150, harga −50, dan sisa poin 100. Setelah "Tukarkan", I-06 menampilkan kode voucher `SC-E9YA-6R2D`, ID penukaran, waktu 20 Nov 2026 16.02 WIB, poin dipakai 50, dan sisa poin 100; tombol salin memunculkan "Kode voucher disalin". Saldo di I-04 menjadi 100, stok voucher turun dari 19 menjadi 18, dan penukaran tercatat paling atas di Riwayat Penukaran, sesuai hasil yang diharapkan | *Pass* |
| UC09-TC02 | KF13 | Alternatif 1: Poin tidak cukup | 1. Login sebagai Masyarakat dengan saldo 0.<br>2. Buka I-04, klik tombol "Kurang 50" pada "Voucher Kopi Rp25.000". | Email: `andi@soclean.test`<br>Password: `soclean123`<br>Reward: "Voucher Kopi Rp25.000" (50 poin) | Tombol menampilkan selisih poin ("Kurang 50") dan klik memunculkan notifikasi "Poin tidak cukup"; I-05 tidak terbuka, saldo dan stok tidak berubah | Semua reward menampilkan tombol selisih ("Kurang 50", "Kurang 100", "Kurang 200"). Klik "Kurang 50" memunculkan notifikasi "Poin tidak cukup"; I-05 tidak terbuka, saldo tetap 0, dan stok voucher tetap 18, sesuai hasil yang diharapkan | *Pass* |

<br>

## 4.5 Pengujian Kebutuhan Non-Fungsional (KNF)

Setiap KNF pada Tabel 3.2 SKPL diuji secara terukur berdasarkan parameter yang telah didefinisikan. Setiap pengujian memuat target terukur, metode dan alat yang sesuai dengan parameter (misalnya Chrome DevTools untuk *response time* dan inspeksi basis data untuk *security*), serta hasil aktual berupa angka atau data. KNF yang belum dipenuhi atau tidak diimplementasikan dicantumkan beserta alasan dan rencana perbaikan.

Tabel 4.5. Hasil Pengujian KNF

| ID Pengujian | ID KNF | Parameter | Target Terukur | Metode dan Alat | Hasil Aktual | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *KNF01-TC01* | *KNF01* | *Reliability* | *Tidak ada data hilang/ganda saat jaringan putus di tengah transaksi* | *Simulasi putus koneksi saat bayar, lalu cek status di DB* | *[Hasil aktual]* | *Pass/Fail* |
| *KNF02-TC01* | *KNF02* | *Security* | *Password tersimpan sebagai hash, bukan plain-text* | *Inspeksi tabel pengguna di DB* | *[...]* | *Pass/Fail* |
| *KNFXX-TC01* | *KNFXX* | *Response time* | *Halaman tampil ≤ 4 detik* | *Chrome DevTools, 5 kali ukur, ambil rata-rata* | *[Rata-rata ... detik, maks ... detik]* | *Pass/Fail* |
| KNF03-TC01 | KNF03 | Portability | Semua halaman Masyarakat dan Operator dapat dibuka lewat browser tanpa instalasi tambahan pada (a) desktop 1920×1080 dan (b) mobile 360×800, tanpa scroll horizontal (`scrollWidth ≤ innerWidth`) | Chrome desktop 1920×1080 dan emulasi perangkat mobile 360×800 (Chrome DevTools Protocol, mode mobile dan sentuh). Setiap halaman dibuka setelah login sesuai peran, lalu `document.documentElement.scrollWidth` dibandingkan dengan `innerWidth` | 16 dari 16 halaman lolos di kedua ukuran (32 dari 32 pengukuran, `scrollWidth` = `innerWidth`): I-01, I-02, I-03, I-04, I-05, I-06, Riwayat Penukaran, I-09, Detail Lokasi, I-11, Form CleanIt, Profil Masyarakat, I-07, I-08, Profil Operator, dan halaman 404. I-10, I-12, dan I-13 berada di route yang sama dengan I-09 dan I-11 sehingga tidak diukur terpisah. Alur UC03, UC06, UC08, dan UC09 diselesaikan di ukuran tersebut (4.4) | *Pass* |
| KNF04-TC01 | KNF04 | Reliability | Bila unggah foto/video bukti gagal menampilkan notifikasi kegagalan dan tidak ada laporan yang berubah menjadi terkirim | Uji manual dengan Chrome DevTools (Network: blokir `POST /api/media`. Amati notifikasi, network, dan tampilan ingin mengunggah) | Muncul toast error tidak bisa mengupload, network bagian post berstatus error karena di-block, button grayed out dan tidk bisa diklik, deskripsi bahwa tidak bisa mengupload | *Pass* |
| KNF07-TC01 | KNF07 | Reliability | Saat perangkat offline, 100% isian teks form ReportIt tersimpan di perangkat (localStorage) dan pulih utuh ketika form dibuka kembali. Berkas media tidak termasuk; pengguna diminta memilih ulang media. | Uji manual dengan Chrome DevTools (Network: Offline; Application: Local Storage), ditambah unit test `tests/draf-laporan.test.ts` (Vitest) | Banner offline muncul saat koneksi diputus; perubahan judul saat offline tersimpan di kunci `soclean:draf-laporan:reportit`; setelah tab ditutup dan dibuka kembali, 5 dari 5 field teks (judul, alamat, waktu kejadian, sumber, jenis sampah) pulih utuh dengan banner "Isian dari draf sebelumnya sudah dipulihkan"; 13/13 unit test draf lulus | *Pass* |
| *...* | *...* | *...* | *...* | *...* | *...* | *...* |

<br>

## 4.6 Tangkapan Layar dan Bukti Hasil Pengujian

Bukti pengujian dilampirkan sesuai ID Pengujian pada Subbab 4.2 sampai 4.5, berupa tangkapan layar aplikasi, keluaran *test runner*, laporan *coverage* untuk setiap kelas Mendalam, atau hasil alat ukur.

Tabel 4.6. Bukti Hasil Pengujian

| ID Pengujian | Bukti Hasil Pengujian |
| :--- | :--- |
| C01-UT01 – C01-UT08 (BUKTI-01) | ![BUKTI-01](assets/BUKTI-01a.png) |
| C01-UT01 – C01-UT08 (BUKTI-01) | ![BUKTI-01](assets/BUKTI-01b.png) |
| C07-UT01 – C07-UT03 (BUKTI-08) | ![BUKTI-08](assets/BUKTI-08.png) |
| C08-UT01 – C08-UT03 (BUKTI-09) | ![BUKTI-09](assets/BUKTI-09.png) |
| UC07-TC01 – UC07-TC02 (BUKTI-29) | ![BUKTI-29a](assets/BUKTI-29a.jpeg)<br>![BUKTI-29b](assets/BUKTI-29b.jpeg) |
| KNF07-TC01 (BUKTI-38) | ![BUKTI-38a](assets/BUKTI-38a.png)<br>![BUKTI-38b](assets/BUKTI-38b.png)<br>![BUKTI-38c](assets/BUKTI-38c.png)<br>![BUKTI-38d](assets/BUKTI-38d.png) |
| C04-UT01 – C04-UT04 (BUKTI-05) | ![BUKTI-05](assets/BUKTI-05-18.png) |
| C08-UT14 – C08-UT16 (BUKTI-12) | ![BUKTI-12](assets/BUKTI-12.png) |
| C10-UT01 – C10-UT03 (BUKTI-14) | ![BUKTI-14](assets/BUKTI-14.png) |
| C12-UT01 – C12-UT05 (BUKTI-16) | ![BUKTI-16](assets/BUKTI-16.png) |
| C14-UT01 – C14-UT05 (BUKTI-18) | ![BUKTI-18](assets/BUKTI-05-18.png) |
| UC01-TC01 – UC01-TC03 (BUKTI-23) | ![Tinjauan](assets/BUKTI-23a.png)<br>![Sukses kirim](assets/BUKTI-23b.png)<br>![Waktu tidak valid](assets/BUKTI-23c.png)<br>![Judul kosong](assets/BUKTI-23d.png) |
| UC02-TC01 – UC02-TC03 (BUKTI-24) | ![Pratinjau hasil unggah](assets/BUKTI-24a.png)<br>![Kuota kurang](assets/BUKTI-24b.png)<br>![Antrean offline](assets/BUKTI-24c.png)<br>![Unggah setelah online](assets/BUKTI-24d.png) |
| UC03-TC01 – UC03-TC02 (BUKTI-25) | ![BUKTI-25a](assets/BUKTI-25a.png)<br>![BUKTI-25b](assets/BUKTI-25b.png)<br>![BUKTI-25c](assets/BUKTI-25c.png)<br>![BUKTI-25d](assets/BUKTI-25d.png)<br>![BUKTI-25e](assets/BUKTI-25e.png)<br>![BUKTI-25f](assets/BUKTI-25f.png)<br>![BUKTI-25g](assets/BUKTI-25g.png)<br>![BUKTI-25h](assets/BUKTI-25h.png) |
| UC04-TC01 – UC04-TC02 (BUKTI-26) | ![Daftar Terdekat](assets/BUKTI-26a.png)<br>![detail lokasi](assets/BUKTI-26b.png)<br> ![konfirmasi Bersihkan](assets/BUKTI-26c.png)<br> ![daftar kosong](assets/BUKTI-26d.png) |
| UC05-TC01 – UC05-TC02 (BUKTI-27) | ![Tinjauan](assets/BUKTI-27a.png)<br>![Sukses kirim](assets/BUKTI-27b.png)<br>![Waktu sebelum kejadian asal](assets/BUKTI-27c.png)<br>![Bukti terlalu besar](assets/BUKTI-27d.png)<br>![Konflik CleanIt menunggu](assets/BUKTI-27e.png) |
| UC06-TC01 – UC06-TC02 (BUKTI-28) | ![BUKTI-28a](assets/BUKTI-28a.png)<br>![BUKTI-28b](assets/BUKTI-28b.png)<br>![BUKTI-28c](assets/BUKTI-28c.png)<br>![BUKTI-28d](assets/BUKTI-28d.png)<br>![BUKTI-28e](assets/BUKTI-28e.png)<br>![BUKTI-28f](assets/BUKTI-28f.png)<br>![BUKTI-28g](assets/BUKTI-28g.png)<br>![BUKTI-28h](assets/BUKTI-28h.png) |
| UC08-TC01 – UC08-TC02 (BUKTI-30) | ![BUKTI-30a](assets/BUKTI-30a.png)<br>![BUKTI-30b](assets/BUKTI-30b.png)<br>![BUKTI-30c](assets/BUKTI-30c.png) |
| UC09-TC01 – UC09-TC02 (BUKTI-31) | ![BUKTI-31a](assets/BUKTI-31a.png)<br>![BUKTI-31b](assets/BUKTI-31b.png)<br>![BUKTI-31c](assets/BUKTI-31c.png)<br>![BUKTI-31d](assets/BUKTI-31d.png)<br>![BUKTI-31e](assets/BUKTI-31e.png) |
| KNF03-TC01 (BUKTI-34) | ![BUKTI-34a](assets/BUKTI-34a.png)<br>![BUKTI-34b](assets/BUKTI-34b.png)<br>![BUKTI-34c](assets/BUKTI-34c.png)<br>![BUKTI-34d](assets/BUKTI-34d.png) |
| Coverage C01 (BUKTI-39) | ![BUKTI-39](assets/BUKTI-39.png) |
| Coverage C04 (BUKTI-43) | ![BUKTI-43a](assets/BUKTI-43-50-A.png)<br>![BUKTI-43b](assets/BUKTI-43-50-B.png) |
| Coverage C12 (BUKTI-48) | ![BUKTI-48](assets/BUKTI-48.png) |
| Coverage C14 (BUKTI-50) | ![BUKTI-50a](assets/BUKTI-43-50-A.png)<br>![BUKTI-50b](assets/BUKTI-43-50-B.png) |
| *C02-UT01 - C02-UT05 unit test dan coverage* | ![BUKTI-02](assets/BUKTI-02.png) |
| *C03-UT01 - C03-UT05 unit test dan coverage* | ![BUKTI-04](assets/BUKTI-04.png) |
| *C08-UT04 - C08-UT-08 unit test dan coverage* | ![BUKTI-10](assets/BUKTI-10.png) |
| *C15-UT01 - C15-UT-05 unit test dan coverage* | ![BUKTI-19-A](assets/BUKTI-19-A.png)<br>![BUKTI-19-B](assets/BUKTI-19-B.png) |
| *UC01-TC01* | *[Sisipkan tangkapan layar UC01-TC01 sesuai prosedur pengujian]* |
| *UC01-TC02* | *[Sisipkan tangkapan layar UC01-TC02 sesuai prosedur pengujian]* |
| *KNF01-TC01* | *[Sisipkan bukti pengukuran parameter KNF01-TC01]* |
| *KNF04-TC01* | ![BUKTI-35](assets/BUKTI-35.png) |
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
