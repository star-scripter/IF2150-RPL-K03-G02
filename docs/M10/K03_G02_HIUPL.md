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
    - [4.2.2 C02 Laporan](#422-c02-laporan)
    - [4.2.3 C03 Media](#423-c03-media)
    - [4.2.4 C04 DaftarLaporan](#424-c04-daftarlaporan)
    - [4.2.5 C05 ValidatorLaporan](#425-c05-validatorlaporan)
    - [4.2.6 C06 Lokasi](#426-c06-lokasi)
    - [4.2.7 C07 DaftarLokasi](#427-c07-daftarlokasi)
    - [4.2.8 C08 Pengguna (Auth FE)](#428-c08-pengguna-auth-fe)
    - [4.2.9 C08 Pengguna (Auth BE)](#429-c08-pengguna-auth-be)
    - [4.2.10 C08 Pengguna (Saldo Poin dan Notifikasi)](#4210-c08-pengguna-saldo-poin-dan-notifikasi)
    - [4.2.11 C08 Pengguna (Profil)](#4211-c08-pengguna-profil)
    - [4.2.12 C09 Reward](#4212-c09-reward)
    - [4.2.13 C10 DaftarReward](#4213-c10-daftarreward)
    - [4.2.14 C11 ManagerPoin](#4214-c11-managerpoin)
    - [4.2.15 C12 HalamanPenukaran](#4215-c12-halamanpenukaran)
    - [4.2.16 C13 Penukaran (Model)](#4216-c13-penukaran-model)
    - [4.2.17 C14 LaporanView](#4217-c14-laporanview)
    - [4.2.18 C15 ManagerLaporan (validasi/POST)](#4218-c15-managerlaporan-validasipost)
    - [4.2.19 C15 ManagerLaporan (query/verifikasi)](#4219-c15-managerlaporan-queryverifikasi)
    - [4.2.20 C16 Penukaran (Controller)](#4220-c16-penukaran-controller)
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
| *C* | Pengisian Bab 5 (Traceability) dari SKPL, DPPL, Implementasi, serta Bab 3 dan 4 |
| *D* | Perbaikan konsistensi: perintah dan lokasi test, ID algoritma sesuai DPPL2, tingkat pengujian C08/C15, penomoran Subbab 4.2, Tabel 3.4, dan referensi |

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
5. Kelompok G-02 K-03. [*SoClean — Pembagian Tugas FE & BE v0.8*](<../contracts/SoClean — Pembagian Tugas FE & BE v0.8.md>) (kontrak implementasi, sumber kode keputusan K dan N).
6. Sommerville, I. (2016). *Software Engineering* (10th ed.). Pearson.
7. Vercel. *Next.js Documentation*. https://nextjs.org/docs
8. Vitest. *Vitest Guide* dan *Coverage*. https://vitest.dev/guide/ dan https://vitest.dev/guide/coverage
9. Drizzle Team. *Drizzle ORM Documentation*. https://orm.drizzle.team/docs/overview
10. The PostgreSQL Global Development Group. *PostgreSQL 18 Documentation*. https://www.postgresql.org/docs/18/
11. Google. *Chrome DevTools*. https://developer.chrome.com/docs/devtools
12. Mozilla. *Firefox DevTools User Docs*. https://firefox-source-docs.mozilla.org/devtools-user/

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

<!-- Daftar modul/kelas yang **TELAH** diimplementasikan. Gunakan nama dan ID kelas yang sama dengan DPPL, dan konsisten dengan Tabel B.5 pada dokumen Implementasi (Tugas 9). --> 

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
| 4 | File-file pengujian (`tests/`, misal `tests/akses.test.ts`, serta helper di `tests/helpers/`) | Unit test dan test integrasi Vitest. `tests/helpers/` berisi helper bersama, misalnya koneksi database test (`database-test.ts`) dan global setup yang membuat serta memigrasi `soclean_test` (`global-setup.ts`) |
| 5 | File-file helper ( di `lib/`, misal `lib/api/client.ts`) | Dipakai sebagai fungsi-fungsi yang dipakai bersama. Bisa saja mengacu ke tipe yang terdefinisi sebagai implementasi utama, namun by itself bukan merupakan implementasi utama. |
| 6 | File-file komponen React ( di `components/`, misal `components/Beranda.tsx`) | Sebagai reusable components di front-end |
| 7 | File-file routing NextJS di (`app/`, misal `app/(pages)/(auth)/login/page.tsx`) | By default, routing NextJS adalah di app yang ditandai seperti page.tsx dalam directory tertentu di dalam app |
| 8 | File-file database di (`server/db/`, termasuk file sql seperti `0000_init.sql`, schema-nya, dan profiling) | Database, migrasi, Drizzle, seed data, profiling |

<br>

---

# BAB 4: Hasil Pengujian

Bab ini melaporkan hasil pengujian P/L pada level unit, integrasi, dan sistem. Pengujian dilakukan pada tag release terakhir Tugas 9. Hasil aktual diisi berdasarkan pengamatan saat pengujian. Kesimpulan diisi `Pass` atau `Fail`, dan untuk `Fail` dilengkapi penyebab serta usulan perbaikan.

## 4.1 Strategi dan Kedalaman Pengujian Kelas

Setiap kelas perancangan pada Tabel 4.1 DPPL diklasifikasikan ke dalam tiga tingkat kedalaman pengujian. Tingkat **Mendalam** diberikan pada kelas yang memuat logika bisnis, perhitungan, validasi, aturan status, algoritma, integrasi eksternal, atau keamanan. Tingkat **Sedang** diberikan pada kelas yang hanya mengoordinasikan atau mendelegasikan proses. Tingkat **Tidak perlu** diberikan pada kelas tanpa logika, seperti *entity/DTO* dan kelas konfigurasi, yang teruji secara tidak langsung melalui test case use case. Seluruh kelas wajib dicantumkan beserta alasan penentuan tingkatnya.

Tabel 4.1.1. Identifikasi Tingkat Pengujian Kelas

| ID Kelas | Nama Kelas | Tingkat | Alasan | Test Case Terkait |
| :--- | :--- | :--- | :--- | :--- |
| C01 | *FormLaporan* | Mendalam | Memuat validasi masukan sisi klien (field wajib dan validasi seperti waktu dan koordinat), validasi berkas media (tipe, ukuran, jumlah, kuota penyimpanan), antrean unggah saat offline, draf lokal, serta penyusunan payload dan pemetaan error pengiriman | C01-UT01 s.d. C01-UT08 |
| C02 | *Laporan* | Mendalam | Menyimpan dan membaca laporan dengan aturan per jenis (ReportIt/CleanIt), filter dan paginasi daftar, perubahan status bersyarat (hanya dari `BELUM_DIPERIKSA`), penolakan otomatis CleanIt lain, dan perhitungan CleanIt 30 hari | C02-UT01 s.d. C02-UT05 |
| C03 | *Media* | Mendalam | Memeriksa penggunaan ulang hash SHA-256, kepemilikan media, penautan media ke laporan secara bersyarat, serta pemrosesan watermark dan penyimpanan ke S3 | C03-UT01 s.d. C03-UT05 |
| C04 | *DaftarLaporan* | Mendalam | Mengelola filter jenis, urutan, dan halaman yang tersimpan di URL, format ID `RPT-xxxx` dan waktu, serta state loading, kosong, dan gagal pada daftar validasi | C04-UT01 s.d. C04-UT04 |
| C05 | *ValidatorLaporan* | Mendalam | Memuat aturan verifikasi: setujui ReportIt dengan penggabungan lokasi radius 50 m, setujui CleanIt dengan pemberian poin dan penolakan otomatis, tolak dengan alasan wajib untuk CleanIt, pencegahan verifikasi ganda, dan validasi masukan Operator | C05-UT01 s.d. C05-UT05 |
| C06 | *Lokasi* | Mendalam | Memuat perhitungan jarak haversine dan prefilter kotak untuk radius 50 m, perubahan status `TERCEMAR` → `DIBERSIHKAN` secara bersyarat, serta pembuatan dan pembacaan lokasi beserta laporan asalnya | C06-UT01 s.d. C06-UT05 |
| C07 | *DaftarLokasi* | Sedang | Menampilkan daftar lokasi dan menghitung jarak dari posisi pengguna untuk urutan Terdekat. Logika utamanya hanya pengurutan dan validasi respons, sedangkan data diambil dari API | C07-UT01 s.d. C07-UT03 |
| C08 | *Pengguna* | Mendalam | Memuat aturan akun dan autentikasi (normalisasi email, hash password, sesi JWT), perubahan saldo poin bersyarat agar tidak negatif, serta pemberian notifikasi dari laporan terverifikasi | C08-UT01 s.d. C08-UT16 |
| C09 | *Reward* | Sedang | Membaca katalog reward dengan urutan stok tersedia lalu harga, mencari reward, dan mengurangi stok secara bersyarat. Logikanya sederhana dan transaksi penukarannya diuji di C16 | C09-UT01 s.d. C09-UT03 |
| C10 | *DaftarReward* | Sedang | Menampilkan katalog reward dan menentukan status tombol (Tukar, Kurang, Habis) dari saldo dan stok sehingga tidak mengubah data | C10-UT01 s.d. C10-UT03 |
| C11 | *ManagerPoin* | Sedang | Mengoordinasikan pembacaan saldo dan reward serta meneruskan pengecekan, pengurangan, dan penambahan poin ke model Pengguna dan Reward | C11-UT01 s.d. C11-UT03 |
| C12 | *HalamanPenukaran* | Mendalam | Mengatur alur konfirmasi penukaran, pratinjau sisa poin, pencegahan klik ganda, pemetaan error (`POIN_TIDAK_CUKUP`, `STOK_HABIS`), serta tampilan hasil dan riwayat penukaran | C12-UT01 s.d. C12-UT05 |
| C13 | *Penukaran (Model)* | Mendalam | Membuat kode voucher unik `SC-XXXX-XXXX` dengan percobaan ulang saat bentrok, menyimpan transaksi penukaran, dan membaca riwayat dengan paginasi | C13-UT01 s.d. C13-UT05 |
| C14 | *LaporanView* | Mendalam | Menyusun body setujui/tolak sesuai jenis laporan dan penggabungan lokasi, memvalidasi isian Operator, menampilkan galeri Sebelum/Sesudah, dan menangani hasil serta error verifikasi | C14-UT01 s.d. C14-UT05 |
| C15 | *ManagerLaporan* | Mendalam | Memuat validasi laporan (`is_terisi`, `is_format_valid`, `cek_laporan`), pembuatan laporan dan penautan media dalam transaksi, serta query daftar laporan, pemetaan lokasi, dan perubahan status untuk verifikasi | C15-UT01 s.d. C15-UT08 |
| C16 | *Penukaran (Controller)* | Mendalam | Menjalankan transaksi penukaran: validasi masukan, pengecekan reward, stok, dan saldo, lalu pengurangan saldo, pengurangan stok, dan pencatatan penukaran dalam satu transaksi dengan rollback | C16-UT01 s.d. C16-UT05 |

## 4.2 Pengujian Unit Kelas

Pengujian unit dilakukan pada kelas bertingkat Mendalam dan Sedang. Kelas Mendalam diuji pada seluruh operasi public dengan kasus normal, batas, dan negatif, serta mencapai *coverage* minimal 70%. Kelas Sedang diuji minimal dengan satu kasus normal dan satu kasus gagal pada operasi public utama.

Cara menjalankan unit test (dari folder `src/`, dengan container sudah berjalan):

```bash
docker compose exec web npm test                                  # unit test saja, test integrasi di-skip
docker compose exec -e POSTGRES_DB=soclean_test web npm test      # semua test, termasuk yang memakai PostgreSQL
docker compose exec -e POSTGRES_DB=soclean_test web npm test -- tests/<nama-file>.test.ts --coverage
```

Perintah terakhir menjalankan satu file test sekaligus mengukur *coverage* dengan Vitest Coverage V8. Test yang memakai basis data hanya berjalan kalau `POSTGRES_DB` berakhiran `_test`. Database `soclean_test` dibuat dan dimigrasi otomatis oleh `tests/helpers/global-setup.ts`, jadi data di `soclean_dev` tidak tersentuh.

Lokasi file test: `src/so-clean/tests/` (satu file per modul, misalnya `tests/model-laporan.test.ts`). Helper bersama seperti koneksi database test dan pembuat sesi ada di `src/so-clean/tests/helpers/`.

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

### 4.2.2 C02 Laporan

**ID Kelas:** C02  
**Nama Kelas:** Laporan  
**Tingkat:** Mendalam

Tabel 4.2.2. Hasil Pengujian Unit C02

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

Tabel 4.2.2b. Ringkasan Cakupan C02

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `buatLaporan(input: LaporanBaru, tx: Eksekutor = db): Promise<LaporanTersimpan>`, `getDaftarLaporan(filter: FilterDaftarLaporan, tx: Eksekutor = db,): Promise<{ data: LaporanTersimpan[]; total: number }>`, `ubah_status(idLaporan: number, perubahan: PerubahanStatusLaporan, tx: Eksekutor = db,)`, `simpan_alasan_penolakan(idLaporan: number, alasanPenolakan: string, tx: Eksekutor = db,): Promise<LaporanTersimpan \| null>`, `adaCleanItMenunggu(idPengguna: string,lokasiId: number,tx: Pick<Db, "select"> = db,): Promise<boolean>`, sisanya diuji pada integration testing, yaitu `hitungBersihkanSendiri30Hari(idPengguna: string, kecualiIdLaporan: number, tx: Pick<Db, "select"> = db,): Promise<number>`, `ubah_status_verifikasi(idLaporan: number, keputusan: KeputusanVerifikasi, tx: Eksekutor = db,): Promise<LaporanTersimpan \| null>`, `tolakCleanItMenungguLain(idLokasi: number kecualiIdLaporan: number, diverifikasiOleh: string, tx: Pick<Db, "update"> = db,): Promise<number[]>`|
| Operasi yang diuji | `buatLaporan(input: LaporanBaru, tx: Eksekutor = db): Promise<LaporanTersimpan>`, `getDaftarLaporan(filter: FilterDaftarLaporan, tx: Eksekutor = db,): Promise<{ data: LaporanTersimpan[]; total: number }>`, `ubah_status(idLaporan: number, perubahan: PerubahanStatusLaporan, tx: Eksekutor = db,)`, `simpan_alasan_penolakan(idLaporan: number, alasanPenolakan: string, tx: Eksekutor = db,): Promise<LaporanTersimpan \| null>`, `adaCleanItMenunggu(idPengguna: string,lokasiId: number,tx: Pick<Db, "select"> = db,): Promise<boolean>` |
| ID Algoritma yang tercakup | Algo-005, Algo-006 (berubah bentuk), Algo-007 (berubah bentuk), Algo-008, Algo-009 |
| Coverage (wajib ≥ 70%) | 73.33% branch dan 74.19% lines (hanya mengacu pada `model-laporan.test.ts`), 100% (model-detail-laporan.test.ts, verifikasi-ganda.test.ts, validasi-laporan.test.ts, api-setujui-reportit.test.ts, tests/api-setujui-cleanit.test.ts ) |

### 4.2.3 C03 Media

**ID Kelas:** C03  
**Nama Kelas:** Media  
**Tingkat:** Mendalam

Note: hanya melaporkan operasi pada `server/models/media.ts`. Pengujian controller upload, pemrosesan gambar/video, dan adapter object storage tidak dihitung sebagai coverage Model Media.

Tabel 4.2.3. Hasil Pengujian Unit C03

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *C03-UT01* | `sudahDipakai(sha256: string, tx: Eksekutor = db): Promise<boolean>` | Normal/negatif | Periksa hash yang tertaut ke laporan `VALID`, laporan `TIDAK_VALID`, media belum tertaut, dan hash yang tidak ada | True hanya untuk hash media pada laporan yang tidak ditolak, sisanya false | True hanya untuk hash media pada laporan yang tidak ditolak, sisanya false | *Pass* |
| *C03-UT02* | `buatMedia(input: MediaBaru): Promise<number>` | Normal | Simpan metadata media berisi pengguna, storage key, tipe, ukuran, hash, dan waktu unggah | Baris media tersimpan dengan nilai sesuai input dan `laporan_id` NULL | Baris media tersimpan dengan nilai sesuai input dan `laporan_id` NULL| *Pass* |
| *C03-UT03* | `getUntukLaporan(idMedia: number[], idPengguna: string, tx: Eksekutor = db,): Promise<MediaUntukLaporan[]>` | Normal/negatif | Ambil ID media milik pengguna, ID media milik pengguna lain, ID yang tidak ada, panggil juga dengan daftar ID kosong | Media milik pengguna dikembalikan, daftar kosong menghasilkan `[]` | Media milik pengguna dikembalikan, daftar kosong menghasilkan `[]` | *Pass* |
| *C03-UT04* | `tautkanKeLaporan(idMedia: number[], idPengguna: string, idLaporan: number,: Pick<Db, "update"> = db,): Promise<number>` | Normal/negatif | Tautkan media belum terpakai milik pengguna, sertakan juga media pengguna lain, media yang sudah tertaut, ID tidak ada, dan daftar kosong | Hanya media belum tertaut milik pengguna yang berubah dengan nilai kembalian adalah jumlah baris yang berubah, daftar kosong menghasilkan `0` | Hanya media belum tertaut milik pengguna yang berubah dengan nilai kembalian adalah jumlah baris yang berubah, daftar kosong menghasilkan `0` | *Pass* |
| *C03-UT05* | `getByLaporan(idLaporan: number, tx: Eksekutor = db): Promise<MediaTersimpan[]>` | Normal/negatif | Buat dua media pada satu laporan dan satu media tanpa tautan, lalu ambil media berdasarkan ID laporan | Hanya media pada laporan tersebut yang dikembalikan dalam urutan ID unggah | Hanya media pada laporan tersebut yang dikembalikan dalam urutan ID unggah | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.3b. Ringkasan Cakupan C03

| Informasi | Keterangan |
| :--- | :--- |
| Operasi pada Model Media yang diuji | `sudahDipakai(sha256: string, tx: Eksekutor = db): Promise<boolean>`, `buatMedia(input: MediaBaru): Promise<number>`, `getUntukLaporan(idMedia: number[], idPengguna: string, tx: Eksekutor = db,): Promise<MediaUntukLaporan[]>`, `tautkanKeLaporan(idMedia: number[], idPengguna: string, idLaporan: number,: Pick<Db, "update"> = db,): Promise<number>`, `getByLaporan(idLaporan: number, tx: Eksekutor = db): Promise<MediaTersimpan[]>` |
| Operasi yang diuji | `sudahDipakai(sha256: string, tx: Eksekutor = db): Promise<boolean>`, `buatMedia(input: MediaBaru): Promise<number>`, `getUntukLaporan(idMedia: number[], idPengguna: string, tx: Eksekutor = db,): Promise<MediaUntukLaporan[]>`, `tautkanKeLaporan(idMedia: number[], idPengguna: string, idLaporan: number,: Pick<Db, "update"> = db,): Promise<number>`, `getByLaporan(idLaporan: number, tx: Eksekutor = db): Promise<MediaTersimpan[]>` |
| ID Algoritma yang tercakup | Algo-010 |
| Coverage (wajib ≥ 70%) | 100% |

<br>

### 4.2.4 C04 DaftarLaporan

**ID Kelas:** C04  
**Nama Kelas:** DaftarLaporan  
**Tingkat:** Mendalam  

Note: Yang diuji unit adalah fungsi murni di `lib/laporan.ts` yang dipakai `components/DaftarLaporan.tsx` (I-07), melalui `tests/laporan.test.ts`. Komponen `.tsx` tidak diuji unit karena Vitest berjalan di environment `node` tanpa DOM; tampilannya diverifikasi lewat UC03 dan UC06. Operasi `daftar_laporan(laporan)` tidak diimplementasikan di View karena INSERT laporan dilakukan Model lewat Controller (B.5 Tugas 9, catatan N16), sehingga diuji pada C02.

Tabel 4.2.4. Hasil Pengujian Unit C04

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C04-UT01 | `pilih_menu_verifikasi()` / `buka_laporan_masuk()` → `bacaFilterValidasi(params: BacaParam): FilterValidasi` | Normal | Query `jenis=cleanit&sort=terlama&page=3` | `{ jenis: "CLEANIT", sort: "terlama", page: 3 }` | Mengembalikan `{ jenis: "CLEANIT", sort: "terlama", page: 3 }` | *Pass* |
| C04-UT02 | `bacaFilterValidasi(params: BacaParam): FilterValidasi` | Batas | `page=1000000` (batas atas BE-22), `page=1000001`, dan `page=0` | `1000000` diterima; `1000001` dan `0` dibaca sebagai halaman 1 | `page` = 1.000.000 untuk masukan pertama; 1 untuk dua masukan lainnya | *Pass* |
| C04-UT03 | `bacaFilterValidasi(params: BacaParam): FilterValidasi` | Negatif | Query yang diketik manual: `jenis=CLEANIT&sort=acak`, serta `page` = `-1`, `abc`, `1.5`, `2e3`, dan kosong | Jatuh ke default `{ jenis: "REPORTIT", sort: "terbaru", page: 1 }`, tidak error | Semua masukan menghasilkan nilai default | *Pass* |
| C04-UT04 | `tampilkan_daftar(list)` → `formatIdLaporan(idLaporan: number): string` dan `formatWaktuKirim(iso: string, sekarang: number): string` | Normal | ID 248; laporan yang dikirim 15 menit dan 8 hari sebelum `sekarang` | `"RPT-0248"`, `"15 menit lalu"`, dan tanggal WIB `"29 Okt 2026"` | `"RPT-0248"`, `"15 menit lalu"`, dan `"29 Okt 2026"` | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.4b. Ringkasan Cakupan C04

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `daftar_laporan(laporan)`, `pilih_menu_verifikasi()`, `pilih_laporan(idLaporan)`, `tampilkan_daftar(list)`, `buka_laporan_masuk()` |
| Operasi yang diuji | `pilih_menu_verifikasi()` dan `buka_laporan_masuk()` (tab, urutan, dan halaman dari URL: `bacaFilterValidasi`, `urlValidasi`), `tampilkan_daftar(list)` (`formatIdLaporan`, `formatWaktuKirim`). `pilih_laporan(idLaporan)` hanya membuka modal I-08 dan diverifikasi pada UC03-TC01 dan UC06-TC01. `daftar_laporan(laporan)` diuji pada C02 |
| ID Algoritma yang tercakup | Algo-013 (`pilih_menu_verifikasi`), Algo-014 (`tampilkan_daftar`). Algo-012 (`daftar_laporan`) dipindah ke C02/C15 |
| Coverage (wajib ≥ 70%) | 98,27% lines (57/58) dan 96,55% branch (56/58) pada `lib/laporan.ts`, 93,33% fungsi (14/15). Satu-satunya fungsi yang tidak tereksekusi adalah `urlPeta` (tautan OpenStreetMap di I-08). File ini dipakai bersama C04 dan C14. Alat: Vitest Coverage V8, bukti pada BUKTI-43 |

### 4.2.5 C05 ValidatorLaporan

**ID Kelas:** C05\
**Nama Kelas:** ValidatorLaporan\
**Tingkat:** Mendalam

Note: ValidatorLaporan diwujudkan sebagai controller `server/controllers/validator-laporan.ts` yang dipanggil route handler `GET /api/laporan/:id`, `POST /api/laporan/:id/setujui`, dan `POST /api/laporan/:id/tolak`. Pengujian memanggil route handler nyata dengan PostgreSQL test (`soclean_test`), sehingga setiap kasus juga memeriksa isi database setelah aksi. `setujui` untuk CleanIt dijalankan oleh `setujui_cleanit` di dalam transaksi yang sama.

Tabel 4.2.5. Hasil Pengujian Unit C05

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C05-UT01 | `get_detail(idParam: string): Promise<Response>` | Normal | Buka detail ReportIt menunggu yang berjarak ±30 m dari lokasi TERCEMAR beserta medianya, lalu detail CleanIt milik pelapor asal lokasi dan CleanIt milik pengguna lain | ReportIt memuat media (presigned URL), pelapor, dan `lokasiTerdekat` dengan jarak 30 m; CleanIt memuat `laporanAsal` beserta media Sebelum, `pelaporAsalSama` (`true`/`false`), dan `jumlahBersihkanSendiri30Hari` | ReportIt memuat media, pelapor, dan `lokasiTerdekat` 30 m; CleanIt memuat `laporanAsal`, `pelaporAsalSama: true` dengan jumlah 1 untuk pelapor asal dan `false` dengan jumlah 0 untuk pengguna lain | *Pass* |
| C05-UT02 | `setujui(request, idParam, sesi)` dan `tolak(request, idParam, sesi)` pada nilai batas | Batas | Setujui ReportIt yang di sekitarnya hanya ada lokasi tepat di luar radius (±51 m) dan lokasi yang sudah DIBERSIHKAN; tolak dengan alasan tepat 500 karakter dan 501 karakter | Lokasi ±51 m dan lokasi DIBERSIHKAN tidak dipakai untuk penggabungan sehingga lokasi baru dibuat (batas ≤ 50 m diuji pada C06-UT02); alasan 500 karakter diterima, 501 karakter ditolak `FORMAT_TIDAK_VALID` | `digabung: false` dan jumlah lokasi bertambah satu; alasan 500 karakter diterima, 501 karakter ditolak 400 `FORMAT_TIDAK_VALID` | *Pass* |
| C05-UT03 | `setujui(...)` dan `tolak(...)` dengan masukan tidak valid | Negatif | Setujui dengan `poin: 75`, `poin: "50"`, `namaLokasi` 256 karakter, dan body bukan JSON; tolak CleanIt tanpa body, dengan alasan kosong, spasi, atau `null`, dan alasan bukan string; ID `abc`/`0` dan laporan yang tidak ada | Masukan salah ditolak 400 `FORMAT_TIDAK_VALID`; CleanIt tanpa alasan ditolak 400 `DATA_TIDAK_LENGKAP` pada `fields.alasan`; ID tidak valid 400 dan laporan tidak ada 404; status laporan dan data lokasi tidak berubah | Semua masukan salah ditolak dengan kode dan `fields` sesuai; laporan tetap `BELUM_DIPERIKSA` dan tidak ada lokasi baru | *Pass* |
| C05-UT04 | `setujui(...)` untuk ReportIt dan CleanIt (`setujui_cleanit`), `tolak(...)` | Normal | Setujui ReportIt tanpa body, dengan poin/nama dari Operator, dan di dekat lokasi lama; setujui CleanIt pada lokasi berpoin 100 yang juga punya CleanIt lain menunggu; tolak ReportIt tanpa/dengan alasan dan CleanIt dengan alasan | ReportIt menjadi `VALID` dengan lokasi baru (poin default 50, nama = teks lokasi) atau `digabung: true`, tanpa poin bagi pelapor; CleanIt `VALID`, lokasi `DIBERSIHKAN`, pelapor +100 poin, CleanIt lain ditolak otomatis dengan alasan "Lokasi sudah dibersihkan"; tolak menyimpan status `TIDAK_VALID`, alasan, dan Operator | ReportIt dan CleanIt diverifikasi sesuai harapan, termasuk saldo pelapor ReportIt yang tetap dan saldo pelapor CleanIt yang bertambah 100; penolakan tersimpan dan muncul di notifikasi pelapor | *Pass* |
| C05-UT05 | `setujui(...)` dan `tolak(...)` pada konflik dan akses | Negatif | Verifikasi ulang laporan yang sudah diverifikasi; setujui CleanIt pada lokasi yang sudah DIBERSIHKAN; dua persetujuan CleanIt bersamaan untuk satu lokasi; CleanIt yang tersimpan saat persetujuan menunggu kunci; akses oleh tamu dan Masyarakat | 409 `SUDAH_DIVERIFIKASI` dan 409 `LOKASI_SUDAH_DIBERSIHKAN` tanpa perubahan data; persetujuan kedua menunggu lalu 409 dan poin hanya diberikan sekali; CleanIt yang baru tersimpan ikut ditolak otomatis; tamu 401 dan Masyarakat 403 | Semua kasus menghasilkan kode yang diharapkan; saldo pengguna kedua tetap 0 dan CleanIt yang tersimpan saat menunggu berstatus `TIDAK_VALID` | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.5b. Ringkasan Cakupan C05

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `get_laporan_unverified()`, `get_detail(idLaporan)`, `setujui(idLaporan)`, `tolak(idLaporan)`, `tolak(idLaporan, alasan)`, `tampilkan_konfirmasi()` |
| Operasi yang diuji | `get_detail`, `setujui` (termasuk `setujui_cleanit`), `tolak`. `get_laporan_unverified` diwujudkan sebagai `get_all_laporan_unverified` pada ManagerLaporan dan diuji pada 4.2.19; `tampilkan_konfirmasi` diwujudkan sebagai respons JSON yang diperiksa pada setiap kasus dan ditampilkan oleh LaporanView (C14) |
| ID Algoritma yang tercakup | Algo-015, Algo-016 |
| Coverage (wajib ≥ 70%) | 94,02% line, 88,88% branch, 94,2% statement, 100% function (`validator-laporan.ts`, dari `api-daftar-laporan`, `api-setujui-reportit`, `api-setujui-cleanit`, `api-tolak-laporan`). Baris yang tidak tercakup hanya `throw` defensif: keadaan yang dicegah constraint database (pelapor atau lokasi CleanIt tidak ada) dan pemanggilan internal yang salah (`setujui_cleanit` untuk laporan non-CleanIt). Alat: Vitest Coverage V8, bukti pada BUKTI-44 |

### 4.2.6 C06 Lokasi

**ID Kelas:** C06\
**Nama Kelas:** Lokasi\
**Tingkat:** Mendalam

Note: Q-001 pada DPPL (kesamaan koordinat persis) diganti pencarian lokasi TERCEMAR dalam radius 50 m (`cariTerdekatTercemar`, K13) dengan prefilter kotak lat/lng (`kotakPencarian`, BE-26). `simpan_lokasi` dan `tandaiDibersihkan` diuji melalui persetujuan laporan (C05) karena keduanya hanya dipanggil di dalam transaksi tersebut.

Tabel 4.2.6. Hasil Pengujian Unit C06

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C06-UT01 | `get_all_lokasi_valid(status)` dan `get_lokasi(idLokasi)` | Normal | Buat dua lokasi TERCEMAR dengan waktu laporan asal berbeda dan satu lokasi DIBERSIHKAN beserta media laporan asal; baca daftar dengan status bawaan dan `DIBERSIHKAN`, lalu baca detail satu lokasi | Status bawaan hanya mengembalikan TERCEMAR, urut laporan asal terbaru, dengan `dilaporkanAt` dari laporan asal; filter `DIBERSIHKAN` hanya mengembalikan lokasi itu; detail memuat laporan asal (judul, waktu, sumber) dan media yang tertaut saja | Daftar, urutan, `dilaporkanAt`, filter status, dan detail beserta media sesuai harapan | *Pass* |
| C06-UT02 | `cariTerdekatTercemar(lat, lng)` dan `kotakPencarian(lat, lng)` | Batas | Cari dari titik ±49 m dan ±51 m ke utara, serta 49,9 m dan 50,1 m ke timur dan barat; periksa kotak untuk titik yang tepat 50 m di 7 lintang × 48 arah | Titik ≤ 50 m menemukan lokasi (batas inklusif), titik > 50 m tidak; semua titik tepat 50 m berada di dalam kotak dan kotak hanya ±0,1% lebih lebar dari batas minimal | ±49 m dan 49,9 m menemukan lokasi, ±51 m dan 50,1 m tidak; semua titik 50 m berada di dalam kotak dengan lebar sesuai | *Pass* |
| C06-UT03 | `get_all_lokasi_valid`, `get_lokasi`, `cariTerdekatTercemar`, `kotakPencarian` | Negatif | Baca daftar saat belum ada lokasi; baca detail ID 999; cari lokasi terdekat saat lokasi terdekat sudah DIBERSIHKAN; hitung kotak di dekat kutub dan garis ±180° | Daftar kosong `[]` (bukan null); detail tidak ada `null`; lokasi DIBERSIHKAN diabaikan; kotak tidak memfilter longitude di dekat kutub/±180° agar hasil tetap benar | Daftar kosong, `null`, lokasi DIBERSIHKAN diabaikan, dan `lngMin`/`lngMax` bernilai `null` sesuai harapan | *Pass* |
| C06-UT04 | `simpan_lokasi(data, tx)`, `tandaiDibersihkan(idLokasi, tx)`, `getRingkasanByIds`, `getPelaporAsal` | Normal | Setujui ReportIt tanpa lokasi di sekitarnya, setujui CleanIt pada lokasi berpoin 100; baca ringkasan beberapa lokasi dan pelapor asal lokasi | Lokasi baru tersimpan berstatus TERCEMAR dengan nama, alamat, koordinat, jenis sampah, poin, dan laporan asal; lokasi CleanIt menjadi DIBERSIHKAN dan poinnya dikembalikan; ringkasan dan pelapor asal sesuai | Lokasi baru dan perubahan status sesuai; ringkasan memuat nama, koordinat, dan jenis sampah per lokasi; pelapor asal sesuai | *Pass* |
| C06-UT05 | `tandaiDibersihkan`, `kunciPemetaanLokasi` + `cariTerdekatTercemar(..., { kunci: true })`, `getPelaporAsal`, `getRingkasanByIds` | Negatif | Setujui CleanIt pada lokasi yang sudah DIBERSIHKAN; dua ReportIt berdekatan disetujui bersamaan (transaksi kedua dipastikan menunggu kunci); baca pelapor asal lokasi 999 dan ringkasan untuk ID yang tidak ada | `tandaiDibersihkan` tidak mengubah lokasi DIBERSIHKAN (409 tanpa perubahan data); hanya satu lokasi dibuat dan ReportIt kedua digabung; ID tidak ada menghasilkan `null` dan dilewati pada ringkasan | Lokasi tetap, hanya satu lokasi tersimpan dengan ReportIt kedua `digabung: true`, `null` dan ringkasan tanpa ID yang tidak ada | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.6b. Ringkasan Cakupan C06

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `simpan_lokasi(koordinat)`, `get_all_lokasi_valid()`, `get_lokasi(idLokasi)` |
| Operasi yang diuji | `simpan_lokasi`, `get_all_lokasi_valid`, `get_lokasi`, ditambah operasi implementasi `cariTerdekatTercemar` (pengganti Q-001), `kotakPencarian`, `kunciPemetaanLokasi`, `tandaiDibersihkan`, `getRingkasanByIds`, `getPelaporAsal` |
| ID Algoritma yang tercakup | Algo-017 (berubah bentuk: cek duplikat radius 50 m), Algo-018, Algo-019 |
| Coverage (wajib ≥ 70%) | 97,5% line, 92,1% branch, 97,72% statement, 100% function (`server/models/lokasi.ts`, dari `model-lokasi`, `model-detail-laporan`, `kotak-pencarian`, `api-setujui-reportit`, `api-setujui-cleanit`). Baris yang tidak tercakup hanya `throw` defensif untuk laporan asal tanpa sumber, yang dicegah CHECK `laporan_field_per_jenis_check`. Alat: Vitest Coverage V8, bukti pada BUKTI-45 |

### 4.2.7 C07 DaftarLokasi

**ID Kelas:** C07  
**Nama Kelas:** DaftarLokasi  
**Tingkat:** Sedang  

`DaftarLokasi` mengoordinasikan pembacaan API dan GPS. `KartuLokasi` menautkan detail dan `LokasiKosong` menampilkan I-10 setelah respons daftar kosong yang sah. Logika pengurutan, jarak, dan validasi respons berada di `lib/lokasi.ts`. Jalur pilih lokasi hingga tampilan detail Masyarakat diuji melalui UC04-TC01 di 4.4.

Tabel 4.2.7. Hasil Pengujian Unit C07

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C07-UT01 | `tampilkan_daftar(list)` → `ambilPosisiPengguna()`, `jarakHaversineKm()`, `urutkanLokasi()` | Normal | Tiga lokasi fixture `[31, 32, 33]`, GPS `(-6,886; 107,6065)`, urutan Terdekat | Lokasi 32, 31, 33 diurutkan menurut jarak. Seluruh lokasi tetap ditampilkan | GPS mengembalikan posisi fixture. Urutan `[32, 31, 33]`, jarak pertama sekitar 0,111195 km, dan lokasi lebih dari 100 km masih ada. Array input tetap `[31, 32, 33]` (`lokasi.test.ts`) | Pass |
| C07-UT02 | `buka_fitur_cleanit()` dan `tampilkan_daftar(list)` → `lokasiApi.daftar()`, `bacaDaftarLokasi()` | Batas | Handler `GET /api/lokasi` memakai model fixture yang mengembalikan `[]` | Daftar kosong diterima sebagai hasil sukses untuk I-10 | Client dan parser menerima `[]`. Tampilan I-10 diuji terpisah pada UC04-TC02 (`lokasi-client.test.ts`, `lokasi.test.ts`) | Pass |
| C07-UT03 | `notify(msg)` dan fallback daftar → `ambilPosisiPengguna()`, `urutkanLokasi()`, `bacaDaftarLokasi()` | Negatif | Simulasikan GPS ditolak (`code: 1`), pengurutan tanpa posisi, dan data daftar dengan status `DIBERSIHKAN` | GPS memberi pesan izin ditolak. Urutan kembali ke Terbaru tanpa label jarak. Respons yang tidak memenuhi kontrak ditolak | Pesan izin ditolak muncul dari helper GPS. ID diurutkan `[31, 32, 33]` dengan seluruh `jarakKm: null`. Parser melempar error untuk status di luar kontrak daftar (`lokasi.test.ts`) | Pass |

BUKTI-08 mencatat hasil pengujian unit dan kontrak C07.

### 4.2.8 C08 Pengguna (Auth FE)

**ID Kelas:** C08  
**Nama Kelas:** Pengguna (Auth FE)  
**Tingkat:** Mendalam  

Note: Tingkat mengikuti kelas C08 pada Tabel 4.1.1, sehingga bagian ini juga memuat kasus normal, batas, dan negatif. Ringkasan cakupan kelas C08 dicatat pada 4.2.9b dan 4.2.10b. Operasi C08 pada DPPL (`getSaldoPoin`, `cukupPoin`, `kurangiPoin`, `tambah_poin`, `notify`) berada di sisi server dan diuji pada bagian backend. Bagian ini menguji sisi tampilan C08 sesuai Tabel B.5 dokumen Implementasi: data Beranda (atribut `nama` dan `saldoPoin`) serta validasi Login/Register, yang merupakan tambahan di luar DPPL (B.1 no. 21). 

Tabel 4.2.8. Hasil Pengujian Unit C08 (FE-A)

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C08-UT01 | `authApi.me(): Promise<MeResponse>` dan `formatPoin(poin: number): string` (data Beranda) | Normal | Login ke mock API sebagai `masyarakat@soclean.test`, lalu ambil data pengguna lewat `authApi.me()` dan format saldonya dengan `formatPoin()` | Nama "Dapin Tampan" dan saldo "67" siap ditampilkan di Beranda | Nama "Dapin Tampan" dan saldo "67" | *Pass* |
| C08-UT02 | `validasiRegister(isian: IsianRegister): GalatRegister \| null` | Batas | Nama dan email valid; password 7 karakter (`1234567`), 72 karakter, dan 73 karakter | 7 karakter ditolak ("Password minimal 8 karakter."); 72 karakter diterima; 73 karakter ditolak ("Password maksimal 72 karakter.") | Sesuai harapan untuk ketiga masukan | *Pass* |
| C08-UT03 | `validasiLogin(isian: IsianLogin): GalatLogin \| null` | Negatif | Email `warga@` (format salah), password `x` | Galat pada field email: "Format email tidak valid." | Galat "Format email tidak valid." muncul | *Pass* |

### 4.2.9 C08 Pengguna (Auth BE)

**ID Kelas:** C08
**Nama Kelas:** Pengguna (Auth BE)
**Tingkat:** Mendalam

Note: Operasi C08 pada DPPL yang berkaitan dengan saldo poin (`getSaldoPoin`, `cukupPoin`, `kurangiPoin`, `tambah_poin`) dan `notify` diuji pada 4.2.10 (BE-B). Bagian ini menguji operasi auth dan sesi yang ditambahkan pada implementasi (BE-05): pencarian akun login, pembuatan akun Masyarakat, pembacaan profil, aturan akun, serta token/cookie/guard sesi. `cariUntukLogin`, `buatMasyarakat`, dan `getMe` hanya memakai normal/negatif karena masukannya berupa email atau ID (UUID) tanpa rentang nilai, sehingga tidak ada nilai batas yang menguji aturan berbeda. Batas panjang nama/email/password divalidasi `registerSchema` dan diuji pada C08-UT07, sedangkan batas sesi 7 hari diuji pada C08-UT08.

Tabel 4.2.9. Hasil Pengujian Unit C08 (BE-A)

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C08-UT04 | `cariUntukLogin(email: string): Promise<PenggunaUntukLogin \| null>` | Normal/negatif | Cari akun dengan email yang ditulis berbeda kapital dan spasinya; lalu cari email yang belum terdaftar | Email dinormalisasi sebelum pencarian, data akun beserta `passwordHash` kembali, email tidak ada menghasilkan `null` | Email dinormalisasi sebelum pencarian, data akun beserta `passwordHash` kembali, email tidak ada menghasilkan `null` | *Pass* |
| C08-UT05 | `buatMasyarakat(input): Promise<Pengguna \| null>` | Normal/negatif | Daftarkan akun dengan nama/email berspasi, lalu daftarkan lagi dengan email yang sama dalam kapital berbeda | Nama dan email tersimpan ternormalisasi, role selalu `MASYARAKAT`, email duplikat menghasilkan `null` dan tidak menimpa akun lama | Nama dan email tersimpan ternormalisasi, role selalu `MASYARAKAT`, email duplikat menghasilkan `null` dan tidak menimpa akun lama | *Pass* |
| C08-UT06 | `getMe(idPengguna: string): Promise<PenggunaMe \| null>` | Normal/negatif | Ubah saldo pengguna langsung di database, lalu baca profil lewat `getMe`. Panggil juga dengan ID yang tidak ada | Profil terbaru dari database dikembalikan, termasuk saldo terbaru, ID tidak ada menghasilkan `null` | Profil terbaru dari database dikembalikan, termasuk saldo terbaru, ID tidak ada menghasilkan `null` | *Pass* |
| C08-UT07 | `normalisasiEmail`, `normalisasiNama`, `registerSchema`, `loginSchema`, `hashPassword`, `verifyPassword` | Normal/batas/negatif | Uji normalisasi nama/email, batas nama 1-100 dan password 8-72 karakter (nilai tepat batas dan satu di luarnya), password sama dengan email, hash bcrypt cost 12, serta verifikasi password benar/salah | Normalisasi konsisten, nama 1 dan 100 serta password 8 dan 72 diterima sedangkan nama 101 dan password 7/73 ditolak, password sama dengan email ditolak, hash berformat bcrypt cost 12 dan hanya password benar yang lolos verifikasi | Normalisasi konsisten, nama 1 dan 100 serta password 8 dan 72 diterima sedangkan nama 101 dan password 7/73 ditolak, password sama dengan email ditolak, hash berformat bcrypt cost 12 dan hanya password benar yang lolos verifikasi | *Pass* |
| C08-UT08 | `signSessionToken`, `verifySessionToken`, `sessionCookieOptions`, `setSessionCookie`, `getSessionCookie`, `deleteSessionCookie`, `requireRoleCookie`, `wajibLogin` | Normal/batas/negatif | Tanda tangani dan verifikasi token, uji validitas sesaat sebelum dan tepat pada batas 7 hari, uji token dengan secret berbeda, role tidak valid, set/read/delete cookie, guard tanpa cookie, token palsu, dan role salah | Token valid berisi klaim sesi, masih diterima sesaat sebelum 7 hari dan kedaluwarsa tepat pada batas; token/role tidak valid ditolak, cookie `httpOnly` 7 hari di-set, dibaca, dan dihapus; guard mengembalikan `UNAUTHORIZED`/`FORBIDDEN` sesuai kondisi | Token valid berisi klaim sesi, masih diterima sesaat sebelum 7 hari dan kedaluwarsa tepat pada batas; token/role tidak valid ditolak, cookie `httpOnly` 7 hari di-set, dibaca, dan dihapus; guard mengembalikan `UNAUTHORIZED`/`FORBIDDEN` sesuai kondisi | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.9b. Ringkasan Cakupan C08 (BE-A)

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `tambah_poin(idPengguna, jumlahPoin)`, `notify(msg)`, `getSaldoPoin()`, `cukupPoin(harga)`, `kurangiPoin(jumlah)`, `cariUntukLogin`, `buatMasyarakat`, `getMe`, serta helper `server/auth/*` |
| Operasi yang diuji | `cariUntukLogin`, `buatMasyarakat`, `getMe`, `normalisasiEmail`, `normalisasiNama`, `registerSchema`, `loginSchema`, `hashPassword`, `verifyPassword`, `signSessionToken`, `verifySessionToken`, `sessionCookieOptions`, `setSessionCookie`, `getSessionCookie`, `deleteSessionCookie`, `requireRoleCookie`, `wajibLogin` |
| ID Algoritma yang tercakup | Aturan akun N7 dan aturan sesi 7 hari (tidak punya ID algoritma di DPPL). Algo-024 sampai Algo-028 (saldo poin dan notifikasi) dicakup pada 4.2.10 BE-B |
| Coverage (wajib ≥ 70%) | `server/auth/*`: 96,72% baris dan 96,87% cabang. Operasi auth pada `server/models/pengguna.ts` diuji DB-backed, tetapi angka berkasnya tidak dipakai untuk BE-A karena berkas yang sama memuat operasi saldo/notifikasi milik BE-B. Untuk kelas C08 utuh bersama BE-B: 96,55% baris, 96,87% cabang, 100% fungsi. |

### 4.2.10 C08 Pengguna (Saldo Poin dan Notifikasi)

**ID Kelas:** C08\
**Nama Kelas:** Pengguna (Saldo Poin dan Notifikasi)\
**Tingkat:** Mendalam

Note: Bagian ini menguji operasi C08 pada DPPL yang berkaitan dengan saldo poin (`getSaldoPoin`, `cukupPoin`, `kurangiPoin`, `tambah_poin`) dan `notify`, yang diwujudkan tanpa tabel notifikasi: `getNotifikasi` menurunkan notifikasi dari laporan terverifikasi dan `tandaiNotifikasiDibaca` mengisi `notifikasi_dilihat_at`. Operasi auth dan sesi diuji pada 4.2.9 (BE-A).

Tabel 4.2.10. Hasil Pengujian Unit C08 (BE-B)

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C08-UT09 | `getSaldoPoin(idPengguna, tx)` dan `cukupPoin(idPengguna, harga, tx)` | Normal | Pengguna bersaldo 100; baca saldo, lalu periksa kecukupan untuk harga 50 | Saldo 100 dibaca dari database; `cukupPoin(50)` bernilai `true` | Saldo 100 dan `true` | *Pass* |
| C08-UT10 | `cukupPoin`, `kurangiPoin(idPengguna, jumlah, tx)`, `tambah_poin(idPengguna, jumlahPoin, tx)` pada nilai batas | Batas | Saldo 100: periksa harga 100 dan 101; kurangi 40 lalu 60 sampai saldo tepat 0; tambah poin dengan jumlah 0 | Harga sama dengan saldo `true`, lebih satu `false`; saldo bisa mencapai tepat 0; jumlah 0 tidak mengubah saldo (Algo-027 pada DPPL) | `true`/`false` sesuai, saldo 60 lalu 0, dan saldo tetap 100 untuk jumlah 0 | *Pass* |
| C08-UT11 | `kurangiPoin`, `tambah_poin`, `getSaldoPoin`, `cukupPoin` | Negatif | Kurangi 101 dari saldo 100; kurangi dengan jumlah 0, -5, dan 1,5; tambah poin negatif; baca saldo, cek kecukupan, dan tambah poin untuk pengguna yang tidak ada | Pengurangan melebihi saldo menghasilkan `null` tanpa perubahan; jumlah bukan bilangan bulat positif ditolak `RangeError`; poin negatif diabaikan; pengguna tidak ada menghasilkan `null`/`false` | `null` dengan saldo tetap 100, `RangeError` untuk ketiga jumlah, saldo tetap, `null`/`false` untuk pengguna tidak ada | *Pass* |
| C08-UT12 | `tambah_poin`, `getNotifikasi(idPengguna)`, `tandaiNotifikasiDibaca(idPengguna)` | Normal | Tambah 200 poin; buat ReportIt VALID dan TIDAK_VALID serta CleanIt VALID (lokasi 200 poin) dan TIDAK_VALID milik pengguna, satu laporan menunggu, lalu baca notifikasi sebelum dan sesudah menandai dibaca | Saldo menjadi 300; notifikasi hanya dari laporan terverifikasi, urut terbaru, `poinDiberikan` hanya untuk CleanIt VALID, alasan penolakan ikut; status dibaca mengikuti `notifikasi_dilihat_at` dan verifikasi berikutnya kembali belum dibaca | Saldo 300; 4 notifikasi dengan urutan, `poinDiberikan: 200` hanya pada CleanIt VALID, alasan, dan status dibaca sesuai harapan | *Pass* |
| C08-UT13 | `kurangiPoin`, `getNotifikasi` pada kondisi bersamaan dan kosong | Negatif | Dua `kurangiPoin(70)` bersamaan pada saldo 100; `kurangiPoin(50)` di dalam transaksi yang lalu dibatalkan; baca notifikasi pengguna tanpa laporan terverifikasi; akses endpoint notifikasi oleh tamu dan Operator | Hanya satu pengurangan berhasil dan saldo tidak negatif; rollback mengembalikan saldo; daftar notifikasi kosong; tamu 401 dan Operator 403 | Satu pengurangan berhasil dengan saldo akhir 30, saldo kembali 100 setelah rollback, daftar kosong, 401 dan 403 | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.10b. Ringkasan Cakupan C08 (BE-B)

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `getSaldoPoin()`, `cukupPoin(harga)`, `kurangiPoin(jumlah)`, `tambah_poin(jumlahPoin)`, `notify(msg)` |
| Operasi yang diuji | `getSaldoPoin`, `cukupPoin`, `kurangiPoin`, `tambah_poin`, `getNotifikasi` dan `tandaiNotifikasiDibaca` (pengganti `notify`) |
| ID Algoritma yang tercakup | Algo-024, Algo-025, Algo-026, Algo-027, Algo-028 (berubah bentuk: notifikasi diturunkan dari laporan) |
| Coverage (wajib ≥ 70%) | Fungsi BE-B pada `server/models/pengguna.ts` saja: 95,24% statement, 95,45% branch, 100% function (dari `model-pengguna` dan `api-notifikasi`). Satu-satunya cabang yang tidak tercakup adalah `throw` defensif untuk laporan terverifikasi tanpa `diverifikasi_at`, yang dicegah CHECK `laporan_verifikasi_check`. Satu file penuh bersama test BE-A: 96,15% line, 96,87% branch. Alat: Vitest Coverage V8, bukti pada BUKTI-47 |

### 4.2.11 C08 Pengguna (Profil)

**ID Kelas:** C08  
**Nama Kelas:** Pengguna (Profil)  
**Tingkat:** Mendalam  

Note: Tingkat mengikuti kelas C08 pada Tabel 4.1.1, sehingga bagian ini juga memuat kasus normal, batas, dan negatif. Bagian ini menguji sisi tampilan C08 milik halaman Profil (`components/ProfilMasyarakat.tsx` dan `components/ProfilOperator.tsx`) melalui fungsi murni di `lib/profil.ts` (`tests/profil.test.ts`). Operasi `notify(msg)` diwujudkan di View sebagai teks notifikasi yang disusun dari data `GET /api/notifikasi` (B.1 no. 22, N8).

Tabel 4.2.11. Hasil Pengujian Unit C08 (FE-C)

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C08-UT14 | `notify(msg)` → `pesanNotifikasi(n: Notifikasi): string` | Normal | Notifikasi CleanIt `VALID` dengan `poinDiberikan: 200` | Pesan memuat "disetujui" dan "200 poin" | Pesan "Bukti pembersihan Anda disetujui. Anda mendapat 200 poin." | *Pass* |
| C08-UT15 | `notify(msg)` → `alasanNotifikasi(n: Notifikasi): string \| null` | Batas | Notifikasi ReportIt `TIDAK_VALID` dengan `alasanPenolakan` `null` dan `"   "` (hanya spasi) | `null`, sehingga kotak alasan tidak ditampilkan | Mengembalikan `null` untuk kedua masukan | *Pass* |
| C08-UT16 | `notify(msg)` → `pesanNotifikasi(n: Notifikasi): string` | Negatif | Notifikasi CleanIt `VALID` tanpa data poin (`poinDiberikan: null`) | Pesan tidak memuat "null", "undefined", maupun "poin" | Pesan "Bukti pembersihan Anda disetujui." | *Pass* |

### 4.2.12 C09 Reward

**ID Kelas:** C09\
**Nama Kelas:** Reward\
**Tingkat:** Sedang

Note: `getHargaPoin()` pada DPPL cukup dibaca dari field `hargaPoin`, sehingga tidak diuji tersendiri. `getRewardTersedia` mengikuti N3: semua reward dikembalikan, termasuk stok 0.

Tabel 4.2.12. Hasil Pengujian Unit C09

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C09-UT01 | `getRewardTersedia()` dan `cariReward(idReward)` | Normal | Buat empat reward dengan harga dan stok berbeda (termasuk stok 0), baca katalog, lalu cari satu reward | Semua reward dikembalikan, stok > 0 dulu lalu harga naik, reward stok 0 paling akhir; `cariReward` mengembalikan data reward | Urutan murah, sedang, mahal, lalu stok 0; data reward sesuai | *Pass* |
| C09-UT02 | `kurangiStok(idReward, tx)` dan `tersedia(reward)` pada batas stok | Batas | Kurangi stok 2 sampai 0; dua pengurangan bersamaan pada stok terakhir; periksa `tersedia` untuk stok 1 dan 0 | Stok menjadi 1 lalu 0; hanya satu pengurangan bersamaan berhasil dan stok tidak negatif; `tersedia` `true` untuk stok 1 dan `false` untuk stok 0 | Stok 1 lalu 0, hasil bersamaan `[0, null]` dengan stok akhir 0, `true`/`false` sesuai | *Pass* |
| C09-UT03 | `kurangiStok`, `cariReward`, `getRewardTersedia` | Negatif | Kurangi stok reward yang stoknya 0; cari reward dengan ID yang tidak ada; baca katalog saat belum ada reward | Pengurangan menghasilkan `null` dan stok tetap 0; reward tidak ada `null`; katalog kosong `[]` | `null` dengan stok 0, `null`, dan `[]` | *Pass* |

### 4.2.13 C10 DaftarReward

**ID Kelas:** C10  
**Nama Kelas:** DaftarReward  
**Tingkat:** Sedang  

Note: `tampilkanDaftarReward(daftar)` diwujudkan oleh `components/DaftarReward.tsx`. Logika yang diuji adalah `statusTombolReward` di `lib/reward.ts` (`tests/reward.test.ts`), yang menentukan tombol pada tiap kartu reward.

Tabel 4.2.13. Hasil Pengujian Unit C10

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C10-UT01 | `tampilkanDaftarReward(daftar)` → `statusTombolReward(reward: Pick<Reward, "hargaPoin" \| "stok">, saldoPoin: number): StatusTombolReward` | Normal | Reward harga 50, stok 3; saldo 120 | `{ status: "TUKAR" }` | `{ status: "TUKAR" }` | *Pass* |
| C10-UT02 | `statusTombolReward(reward: Pick<Reward, "hargaPoin" \| "stok">, saldoPoin: number): StatusTombolReward` | Batas | Reward harga 100, stok 1; saldo tepat 100 | `{ status: "TUKAR" }` | `{ status: "TUKAR" }` | *Pass* |
| C10-UT03 | `statusTombolReward(reward: Pick<Reward, "hargaPoin" \| "stok">, saldoPoin: number): StatusTombolReward` | Negatif | (a) Reward harga 200, stok 5; saldo 120.<br>(b) Reward harga 50, stok 0; saldo 500 | (a) `{ status: "KURANG", selisih: 80 }`; (b) `{ status: "HABIS" }` | (a) `{ status: "KURANG", selisih: 80 }`; (b) `{ status: "HABIS" }` | *Pass* |

### 4.2.14 C11 ManagerPoin

**ID Kelas:** C11\
**Nama Kelas:** ManagerPoin\
**Tingkat:** Sedang

Note: `lihatSaldo` dan `lihatRewardTersedia` diuji lewat route `GET /api/poin/saldo` dan `GET /api/reward`. `cekPoin`, `kurangiPoin`, dan `tambah_poin` diuji langsung (`manager-poin.test.ts`) karena hanya dipanggil controller lain di dalam transaksi. Operasi `tambahPoin` yang ganda dengan `tambah_poin` pada DPPL disatukan menjadi `tambah_poin`.

Tabel 4.2.14. Hasil Pengujian Unit C11

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C11-UT01 | `lihatSaldo(sesi)`, `lihatRewardTersedia()`, `cekPoin`, `kurangiPoin`, `tambah_poin` | Normal | Masyarakat bersaldo 150 membuka saldo dan katalog reward; pengguna bersaldo 100 dicek untuk harga 50, dikurangi 30, lalu ditambah 200 | Saldo 150 dan semua reward dengan urutan N3; `cekPoin` `true`; pengurangan 30 menghasilkan saldo 70 dan penambahan 200 (dari saldo awal 100) menghasilkan 300, masing-masing dalam transaksi | `{ saldoPoin: 150 }`, katalog berurutan sesuai N3, `true`, saldo 70, dan saldo 300 | *Pass* |
| C11-UT02 | `cekPoin`, `kurangiPoin`, `tambah_poin` pada nilai batas | Batas | Saldo 100: cek harga tepat 100; kurangi dengan jumlah 0; tambah dengan jumlah 0 | Harga sama dengan saldo `true`; jumlah 0 diabaikan (`null`) tanpa mengubah saldo | `true`, `null`, dan saldo tidak berubah | *Pass* |
| C11-UT03 | `cekPoin`, `kurangiPoin`, `tambah_poin`, `lihatSaldo` | Negatif | Cek harga negatif, harga melebihi saldo, dan pengguna tidak ada; kurangi melebihi saldo dan jumlah negatif; tambah poin pengguna tidak ada; buka saldo sebagai tamu, Operator, dan dengan sesi akun yang sudah dihapus | `cekPoin` `false`; pengurangan gagal (`null`) tanpa perubahan saldo; tambah poin pengguna tidak ada `null`; tamu 401, Operator 403, akun terhapus 401 | `false`, `null` dengan saldo tetap, `null`, 401, 403, dan 401 | *Pass* |

### 4.2.15 C12 HalamanPenukaran

**ID Kelas:** C12  
**Nama Kelas:** HalamanPenukaran  
**Tingkat:** Mendalam  

Note: C12 diwujudkan oleh `components/HalamanPenukaran.tsx` (I-04), `KonfirmasiPenukaran.tsx` (I-05), `PenukaranBerhasil.tsx` (I-06), dan `RiwayatPenukaran.tsx`. Yang diuji unit adalah fungsi murni di `lib/penukaran.ts` (`tests/penukaran.test.ts`). `pilihReward(idReward)` diwujudkan sebagai konfirmasi di I-05 lalu `POST /api/penukaran`; hasil yang berhasil disimpan di `sessionStorage` dan dibaca I-06, sedangkan kegagalan ditangani menurut kode error (B.1 no. 26, N12).

Tabel 4.2.15. Hasil Pengujian Unit C12

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C12-UT01 | `pilihReward(idReward)` (berhasil) → `uraiHasilPenukaran(mentah: string \| null): TukarPoinResponse \| null` | Normal | JSON hasil `POST /api/penukaran` yang valid: `idPenukaran` UUID, `namaReward` "Stiker SoClean", `kodeVoucher` "SC-7KQM-X4TD", `poinDipakai` 20, `sisaPoin` 47, `waktuPenukaran` ISO | Objek `TukarPoinResponse` yang sama dengan masukan | Objek identik dengan masukan | *Pass* |
| C12-UT02 | Riwayat penukaran (N13) → `bacaHalaman(param: string \| null): number` | Batas | `?page=` bernilai `"1"`, `"1000000"`, `"1000001"`, dan `"0"` | `1` → 1; `1000000` → 1.000.000; `1000001` dan `0` → 1 | Sesuai harapan untuk keempat masukan | *Pass* |
| C12-UT03 | `pilihReward(idReward)` (gagal) → `tindakanGagalTukar(code: KodeErrorKlien): TindakanGagalTukar` | Negatif | Kode error `POIN_TIDAK_CUKUP`, `STOK_HABIS`, dan `NOT_FOUND` | `{ tutup: true, muatUlang: true }`: sheet I-05 ditutup, saldo dan daftar reward dimuat ulang | `{ tutup: true, muatUlang: true }` untuk ketiga kode | *Pass* |
| C12-UT04 | `tampilkanNotifikasi(pesan)` (I-06) → `formatWaktuPenukaran(iso: string): string` dan `formatIdPenukaran(id: string): string` | Normal | Waktu `2026-10-28T03:24:00Z`; ID `3f2a9c1e-7b4d-4e2a-9c1e-3f2a9c1e7b4d` | `"28 Okt 2026, 10.24"` (WIB) dan `"3F2A9C1E"` | `"28 Okt 2026, 10.24"` dan `"3F2A9C1E"` | *Pass* |
| C12-UT05 | `uraiHasilPenukaran(mentah: string \| null): TukarPoinResponse \| null` | Negatif | Isi `sessionStorage` yang hilang atau diubah pengguna: `null`, `"{rusak"`, `"42"`, `kodeVoucher` hilang, `sisaPoin` bertipe string, dan `waktuPenukaran` "kemarin" | `null` untuk semua masukan, sehingga I-06 menampilkan state "data tidak ditemukan" | `null` untuk keenam masukan | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.15b. Ringkasan Cakupan C12

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `tampilkanSaldo(saldo)`, `pilihReward(idReward)`, `tampilkanNotifikasi(pesan)` |
| Operasi yang diuji | `pilihReward(idReward)` (berhasil dan gagal: `uraiHasilPenukaran`, `tindakanGagalTukar`), `tampilkanNotifikasi(pesan)` (format I-06: `formatWaktuPenukaran`, `formatIdPenukaran`), riwayat penukaran N13 (`bacaHalaman`). `tampilkanSaldo(saldo)` hanya menampilkan angka dari `GET /api/poin/saldo` di `KartuSaldo` tanpa logika, sehingga diverifikasi pada UC08-TC01 dan UC09-TC01 |
| ID Algoritma yang tercakup | Algo-043 (`pilihReward`); Algo-042 (`tampilkanSaldo`) dan Algo-044 (`tampilkanNotifikasi`) berupa tampilan saja, diverifikasi lewat UC09 |
| Coverage (wajib ≥ 70%) | 100% lines (20/20), 100% branch (31/31), dan 100% fungsi (5/5) pada `lib/penukaran.ts`. Alat: Vitest Coverage V8, bukti pada BUKTI-48 |

### 4.2.16 C13 Penukaran (Model)

**ID Kelas:** C13\
**Nama Kelas:** Penukaran (Model)\
**Tingkat:** Mendalam

Note: `buatPenukaran` mengembalikan data penukaran (bukan Boolean seperti di DPPL) untuk respons `POST /api/penukaran`. Implementasi menambahkan `buatKodeVoucher` (K5) dan `getRiwayat` (riwayat penukaran, N13).

Tabel 4.2.16. Hasil Pengujian Unit C13

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C13-UT01 | `buatPenukaran(idPengguna, reward, tx)` | Normal | Buat penukaran untuk reward berharga 50 | Baris `penukaran` tersimpan dengan `poin_dipakai` 50, ID uuid, waktu ISO, dan kode voucher berformat `SC-XXXX-XXXX` | Baris tersimpan dengan nilai yang sama dengan respons fungsi | *Pass* |
| C13-UT02 | `buatKodeVoucher()` dan `buatPenukaran` saat kode bentrok | Batas | Buat 200 kode voucher; buat penukaran ketika kode pertama yang dihasilkan sudah dipakai | Setiap kode cocok pola `SC-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}` (tanpa 0, O, 1, I); saat bentrok dibuat kode baru tanpa membatalkan transaksi | 200 kode sesuai pola; penukaran kedua memakai kode berikutnya `SC-BBBB-BBBB` | *Pass* |
| C13-UT03 | `buatPenukaran` saat kode terus bentrok | Negatif | Generator kode selalu menghasilkan kode yang sudah dipakai | Gagal dengan error setelah `MAKS_PERCOBAAN_VOUCHER` (5) percobaan | Error "Gagal membuat kode voucher unik…" setelah 5 percobaan | *Pass* |
| C13-UT04 | `getRiwayat(idPengguna, page, limit)` | Normal | Buat penukaran untuk dua pengguna, lalu baca riwayat satu pengguna dengan beberapa halaman | Hanya penukaran milik pengguna, urut waktu terbaru, dengan nama reward dan `total` sesuai | Riwayat, urutan, dan `meta.total` sesuai | *Pass* |
| C13-UT05 | `getRiwayat` pada data kosong dan halaman di luar data | Negatif | Baca riwayat pengguna tanpa penukaran; baca halaman ke-4 dengan limit 2 dari 5 penukaran | Daftar kosong dengan `total` 0; halaman di luar data kosong dengan `total` tetap 5 | `[]` dengan total 0, dan `[]` dengan total 5 | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.16b. Ringkasan Cakupan C13

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `buatPenukaran(pengguna, reward)` |
| Operasi yang diuji | `buatPenukaran`, ditambah operasi implementasi `buatKodeVoucher` dan `getRiwayat` |
| ID Algoritma yang tercakup | Algo-045 |
| Coverage (wajib ≥ 70%) | 100% line, 100% branch, 100% function (`server/models/penukaran.ts`, dari `model-penukaran` dan `api-riwayat-penukaran`). Alat: Vitest Coverage V8, bukti pada BUKTI-49 |

### 4.2.17 C14 LaporanView

**ID Kelas:** C14  
**Nama Kelas:** LaporanView  
**Tingkat:** Mendalam  

Note: Bagian ini mencakup operasi Operator pada `components/LaporanView.tsx` (modal I-08, UC03 dan UC06) melalui fungsi murni di `lib/laporan.ts` (`tests/laporan.test.ts`). Operasi Masyarakat (`tampilkan_lokasi`, `konfirmasi_bersihkan`, `tampilkan_konfirmasi`) diimplementasikan di `components/lokasi/` dan `lib/detail-lokasi.ts`, dan tidak termasuk C14-UT01 sampai C14-UT05.

Tabel 4.2.17. Hasil Pengujian Unit C14

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C14-UT01 | `setujui(idLaporan)` → `bodySetujui(detail, isian)` dan `cekIsianSetujui(detail, isian)` | Normal | ReportIt tanpa lokasi terdekat; isian poin 100, nama lokasi `"  Jembatan Cikapundung  "` | Body `{ poin: 100, namaLokasi: "Jembatan Cikapundung" }`; tidak ada pesan isian | Body sesuai harapan; `cekIsianSetujui` mengembalikan `{}` | *Pass* |
| C14-UT02 | `cekIsianSetujui(detail, isian)` | Batas | Nama lokasi 255 karakter dan 256 karakter (`varchar(255)`, K9) | 255 karakter lolos (`{}`); 256 karakter menghasilkan pesan pada `namaLokasi` | 255 → `{}`; 256 → `{ namaLokasi: "Nama lokasi maksimal 255 karakter." }` | *Pass* |
| C14-UT03 | `tolak(idLaporan)` → `cekAlasanTolak(jenis, alasan)` dan `bodyTolak(alasan)` | Negatif | Tolak CleanIt dengan alasan `" "`; tolak ReportIt dengan alasan kosong | CleanIt: pesan "Alasan penolakan wajib diisi untuk CleanIt."; ReportIt: lolos dengan body `{}` | Sesuai harapan untuk kedua jenis | *Pass* |
| C14-UT04 | `tampilkan_laporan(data)` → `formatWaktuLengkap(iso)`; `notify(msg)` setelah setujui → `pesanSetujui(detail, respons)` | Normal | Waktu `2023-10-14T03:45:00Z`; respons setujui CleanIt `poinDiberikan: 100` dengan pelapor "Dapin Tampan" | `"14 Oktober 2023, 10.45 WIB"` dan `"Laporan disetujui. 100 poin diberikan kepada Dapin Tampan."` | Kedua string sesuai harapan | *Pass* |
| C14-UT05 | `notify(msg)` setelah gagal → `tindakanGagalVerifikasi(code)` | Negatif | Kode error dari setujui/tolak: `SUDAH_DIVERIFIKASI`, `LOKASI_SUDAH_DIBERSIHKAN`, `NOT_FOUND`, `FORMAT_TIDAK_VALID`, `DATA_TIDAK_LENGKAP`, `INTERNAL_ERROR`, `JARINGAN`, dan `FORBIDDEN` | Tiga kode pertama → `"selesai"` (tombol Setujui/Tolak dinonaktifkan, Algo-049); kode isian → `"isian"`; lainnya → `"ulang"` | Setiap kode menghasilkan tindakan sesuai harapan | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.17b. Ringkasan Cakupan C14

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `tampilkan_laporan(data)`, `setujui(idLaporan)`, `tolak(idLaporan)`, `notify(msg)`, `tampilkan_lokasi(detail)`, `konfirmasi_bersihkan()`, `tampilkan_konfirmasi(msg)` |
| Operasi yang diuji | Bagian Operator: `tampilkan_laporan(data)`, `setujui(idLaporan)`, `tolak(idLaporan)`, `notify(msg)`. Fungsi format I-08 lain (`formatWaktuUnggah`, `formatJarak`, `formatKoordinat`) juga diuji di `tests/laporan.test.ts`. Bagian Masyarakat (`tampilkan_lokasi`, `konfirmasi_bersihkan`, `tampilkan_konfirmasi`) juga  diimplementasikan. |
| ID Algoritma yang tercakup | Algo-046 (`tampilkan_laporan`), Algo-047 (`setujui`), Algo-048 (`tolak`), Algo-049 (`notify`). Algo-050 sampai Algo-052 (bagian Masyarakat) diverifikasi lewat UC04-TC01 |
| Coverage (wajib ≥ 70%) | 98,27% lines (57/58) dan 96,55% branch (56/58) pada `lib/laporan.ts`, 93,33% fungsi (14/15). Satu-satunya fungsi yang tidak tereksekusi adalah `urlPeta` (tautan OpenStreetMap di I-08). File ini dipakai bersama C04 dan C14. Alat: Vitest Coverage V8, bukti pada BUKTI-50 |

<br>

### 4.2.18 C15 ManagerLaporan (validasi/POST)

**ID Kelas:** C15
**Nama Kelas:** ManagerLaporan (validasi/POST)
**Tingkat:** Mendalam

Note: Bagian ini menguji operasi validasi dan pembuatan laporan (`is_terisi`, `is_format_valid`, `cek_laporan`, `buat_laporan`). Operasi query/verifikasi (`get_all_laporan_unverified`, `get_daftar_lokasi`, `get_detail_lokasi`, `ubah_status`, `petakan_lokasi`, notifikasi) diuji terpisah pada bagian BE-B C15. C15-UT04 dan C15-UT05 memakai route handler nyata dengan PostgreSQL test dan bukan mock. Tipe kasus menurut operasi dan belum tentu diulang 3 kali. `is_terisi`, `is_format_valid`, dan `cek_laporan` diuji normal di C15-UT01, batas di C15-UT02, dan negatif di C15-UT03. `buat_laporan` diuji normal dan batas di C15-UT04 (satu dan tiga media, yaitu batas maksimum), sedangkan jalur media bermasalah, CleanIt bermasalah, dan rollback penautan ada di C15-UT05. Batas validasi tidak diulang di level endpoint karena sudah diuji langsung pada fungsi validasi.

Tabel 4.2.18. Hasil Pengujian Unit C15 (BE-A)

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C15-UT01 | `is_terisi(input): boolean`, `is_format_valid(input, sekarang): boolean`, `cek_laporan(input, idPengguna, tx, sekarang): Promise<LaporanTervalidasi>` | Normal | Input ReportIt lengkap dengan judul/lokasi berspasi dan media milik pengguna; periksa kelengkapan dan format, lalu panggil `cek_laporan` | `is_terisi` dan `is_format_valid` bernilai `true`, `cek_laporan` mengembalikan data tervalidasi dengan teks ter-trim, `idPengguna`, dan `waktu` bertipe `Date` | `is_terisi` dan `is_format_valid` bernilai `true`, `cek_laporan` mengembalikan data tervalidasi dengan teks ter-trim, `idPengguna`, dan `waktu` bertipe `Date` | *Pass* |
| C15-UT02 | `is_format_valid(input, sekarang): boolean` dan `cek_laporan(...)` pada nilai batas | Batas | Judul 80 dan 81 karakter, waktu tepat sekarang dan satu detik di masa depan, menggunakan 3 dan 4 ID media, koordinat +-90 s.d. +-180 dan 91−181, alamat 256 karakter | Nilai tepat batas diterima. Nilai di luar batas ditolak `FORMAT_TIDAK_VALID` | Nilai tepat batas diterima. Nilai di luar batas ditolak `FORMAT_TIDAK_VALID` | *Pass* |
| C15-UT03 | `cek_laporan(input, idPengguna, tx, sekarang)` | Negatif | Field wajib kosong (`idMedia: []`, lokasi berisi spasi), tipe salah (`latitude` string, `jenis` tidak dikenal), waktu di masa depan, koordinat di luar wilayah | Field kosong menghasilkan error `DATA_TIDAK_LENGKAP`, format/tipe salah dan waktu masa depan menghasilkan error `FORMAT_TIDAK_VALID`, koordinat luar wilayah menghasilkan error `DI_LUAR_WILAYAH` 422 | Kode, status, dan `fields` sesuai untuk setiap masukan (`validasi-laporan.test.ts`) | *Pass* |
| C15-UT04 | `buat_laporan(request, sesi): Promise<Response>` (POST `/api/laporan`) | Normal/batas | Buat ReportIt dengan satu media dan tiga media (batas maksimum), serta CleanIt dengan satu media lalu periksa baris laporan dan `media.laporan_id` di PostgreSQL | Kode `201` dengan luaran `{ idLaporan, status: "BELUM_DIPERIKSA" }`. Laporan tersimpan dan seluruh media, termasuk tiga media sekaligus, tertaut ke laporan baru | Kode `201` dengan luaran `{ idLaporan, status: "BELUM_DIPERIKSA" }`. Laporan tersimpan dan seluruh media, termasuk tiga media sekaligus, tertaut ke laporan baru | *Pass* |
| C15-UT05 | `cek_laporan(...)` dan `buat_laporan(...)` untuk jalur gagal | Negatif | Media tidak ada, milik pengguna lain, sudah tertaut, atau hash dipakai laporan aktif. CleanIt pada lokasi tidak ada, sudah dibersihkan, atau sudah punya CleanIt menunggu. Penautan media diatur agar mengembalikan 0 baris | Media bermasalah menghasilkan error `FORMAT_TIDAK_VALID`/`MEDIA_SUDAH_DIGUNAKAN`, CleanIt bermasalah menghasilkan `NOT_FOUND`/`LOKASI_SUDAH_DIBERSIHKAN`/`CLEANIT_SUDAH_MENUNGGU`, penautan gagal menggagalkan transaksi tanpa menyisakan laporan | Media bermasalah menghasilkan error `FORMAT_TIDAK_VALID`/`MEDIA_SUDAH_DIGUNAKAN`, CleanIt bermasalah menghasilkan `NOT_FOUND`/`LOKASI_SUDAH_DIBERSIHKAN`/`CLEANIT_SUDAH_MENUNGGU`, penautan gagal menggagalkan transaksi tanpa menyisakan laporan | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.18b. Ringkasan Cakupan C15 (BE-A)

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `cek_laporan(lokasi, waktu, idMedia, sumber)`, `is_terisi(lokasi, waktu, idMedia, sumber)`, `is_format_valid(lokasi, waktu, idMedia, sumber)`, `get_daftar_lokasi()`, `get_detail_lokasi(idLokasi)`, `get_all_laporan_unverified()`, `get_data(idLaporan)`, `ubah_status(idLaporan, status)`, `simpan_alasan_penolakan(idLaporan, alasan)`, `petakan_lokasi(idLaporan)`; implementasi menambahkan `buat_laporan` untuk POST `/api/laporan` |
| Operasi yang diuji (BE-A) | `is_terisi`, `is_format_valid`, `cek_laporan`, `buat_laporan` |
| ID Algoritma yang tercakup | Algo-053, Algo-054, Algo-055 |
| Coverage (wajib ≥ 70%) | Test BE-A saja: 55,83% line dan 62.22% branch, sisanya ada di bagian pengujian ManagerLaporan 4.2.19 untuk bagian query dan verifikasi. Gabungan dengan 4.2.19 menghasilkan 96,66% line, 93,33% branch |

### 4.2.19 C15 ManagerLaporan (query/verifikasi)

**ID Kelas:** C15\
**Nama Kelas:** ManagerLaporan (query/verifikasi)\
**Tingkat:** Mendalam

Note: Bagian ini menguji operasi ManagerLaporan untuk daftar laporan Operator, lokasi, notifikasi, dan dukungan verifikasi (`get_all_laporan_unverified`, `get_daftar_lokasi`, `get_detail_lokasi`, `getNotifikasi`, `tandaiNotifikasiDibaca`, `ubah_status`, `petakan_lokasi`). Operasi validasi dan pembuatan laporan diuji pada 4.2.18 (BE-A). Tingkatnya mengikuti kelas C15 pada Tabel 4.1.1, dan kasus normal, batas, serta negatif masing-masing ada di C15-UT06, C15-UT07, dan C15-UT08. Coverage fungsi BE-B: 92,59% statement, 87,5% branch, 100% function (dari `api-daftar-laporan`, `verifikasi-ganda`, `api-setujui-reportit`, `api-lokasi`, `api-notifikasi`).

Tabel 4.2.19. Hasil Pengujian Unit C15 (BE-B)

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C15-UT06 | `get_all_laporan_unverified(request)`, `get_daftar_lokasi(request)`, `get_detail_lokasi(idParam)`, `petakan_lokasi(laporan, opsi, tx)` | Normal | Buka daftar laporan tanpa query dan dengan `status`, `sort=terlama`, `page=2&limit=2`; buka daftar dan detail lokasi; setujui ReportIt tanpa dan dengan lokasi di sekitarnya | Daftar bawaan `BELUM_DIPERIKSA`, terbaru dulu, limit 6, `meta.total` sesuai; CleanIt memakai nama, koordinat, dan jenis sampah lokasi; lokasi bawaan TERCEMAR dan detail memuat media laporan asal; `petakan_lokasi` membuat lokasi baru atau menggabungkan | Daftar, `meta`, filter, urutan, halaman, isi CleanIt, daftar/detail lokasi, dan pemetaan lokasi sesuai harapan | *Pass* |
| C15-UT07 | `ubah_status(idLaporan, keputusan, tx)` dan `petakan_lokasi` pada kondisi bersamaan | Batas | Dua Operator memverifikasi laporan yang sama (transaksi kedua dipastikan menunggu kunci baris); dua ReportIt berjarak ±22 m disetujui bersamaan | Hanya verifikasi pertama tersimpan, verifikasi kedua mendapat `SUDAH_DIVERIFIKASI`; hanya satu lokasi dibuat dan ReportIt kedua digabung | Status tetap `VALID` dari Operator pertama dan transaksi kedua 409; satu lokasi dengan ReportIt kedua `digabung: true` | *Pass* |
| C15-UT08 | `get_all_laporan_unverified`, `get_detail_lokasi`, `ubah_status`, `tandaiNotifikasiDibaca` | Negatif | Query `jenis=SEMUA`, `status=SELESAI`, `sort=acak`, `page=0`, `limit=51`, `limit=1.5`; ID lokasi `abc`, `0`, `-1`, `1.5`, `99999999999` dan lokasi yang tidak ada; `ubah_status` pada laporan terverifikasi dan ID yang tidak ada; akses oleh role yang salah | Query dan ID tidak valid 400 `FORMAT_TIDAK_VALID` dengan `fields`; lokasi tidak ada 404; laporan terverifikasi 409 `SUDAH_DIVERIFIKASI` dan tidak ada 404; tamu 401, role salah 403 | Semua kasus menghasilkan kode dan `fields` yang diharapkan | *Pass* |

### 4.2.20 C16 Penukaran (Controller)

**ID Kelas:** C16\
**Nama Kelas:** Penukaran (Controller)\
**Tingkat:** Mendalam

Note: `tukarPoin` mengikuti Algo-064: pengecekan reward, stok, dan saldo lewat ManagerPoin, lalu pengurangan saldo, pengurangan stok, dan pencatatan penukaran dalam satu `db.transaction`. Respons berupa 201 dengan voucher dan `sisaPoin` (bukan Boolean). Implementasi menambahkan `getRiwayatPenukaran` untuk `GET /api/penukaran`.

Tabel 4.2.20. Hasil Pengujian Unit C16

| ID Pengujian | Operasi yang Diuji | Jenis Kasus | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C16-UT01 | `tukarPoin(request, sesi)` | Normal | Pengguna bersaldo 120 menukar reward seharga 50 dengan stok 3 | 201 dengan `idPenukaran`, `kodeVoucher`, `namaReward`, `poinDipakai`, `waktuPenukaran`, `sisaPoin: 70`; saldo 70, stok 2, satu baris penukaran | 201 dengan isi respons sesuai; saldo 70, stok 2, satu baris penukaran | *Pass* |
| C16-UT02 | `tukarPoin` pada nilai batas | Batas | Saldo tepat sama dengan harga (100); dua pengguna berebut stok terakhir | `sisaPoin` 0; hanya satu penukaran berhasil, yang lain 422 `STOK_HABIS` dan saldonya utuh | `sisaPoin: 0`; status `[201, 422]`, stok 0, saldo pihak yang kalah tetap 100 | *Pass* |
| C16-UT03 | `tukarPoin` dengan masukan dan kondisi tidak valid | Negatif | Body tanpa `idReward`, `idReward` string, pecahan, dan 0; reward tidak ada; stok 0; saldo 49 untuk harga 50; tamu dan Operator | 400 `FORMAT_TIDAK_VALID` pada `fields.idReward`; 404 `NOT_FOUND`; 422 `STOK_HABIS` tanpa mengubah saldo; 422 `POIN_TIDAK_CUKUP` tanpa mengubah stok; tamu 401, Operator 403 | Semua kasus menghasilkan kode yang diharapkan tanpa perubahan saldo, stok, atau baris penukaran | *Pass* |
| C16-UT04 | `getRiwayatPenukaran(request, sesi)` | Normal | Baca riwayat tanpa query, lalu `page=2&limit=2` dari 5 penukaran | Bawaan `page` 1 dan `limit` 10; hanya milik pengguna, urut terbaru; halaman 2 berisi data ke-3 dan ke-4 dengan `meta.total` 5 | `meta` bawaan, isi, urutan, dan halaman sesuai harapan | *Pass* |
| C16-UT05 | `tukarPoin` saat gagal di tengah transaksi dan `getRiwayatPenukaran` dengan query salah | Negatif | Pencatatan penukaran dipaksa gagal; dua penukaran bersamaan dengan saldo untuk satu; saldo dipakai transaksi lain setelah pengecekan awal (transaksi kedua dipastikan menunggu kunci); query riwayat `page=0`, `page=abc`, `limit=0`, `limit=51`, `limit=2.5` | Gagal pencatatan 500 dengan saldo dan stok kembali (rollback); bersamaan `[201, 422 POIN_TIDAK_CUKUP]` tanpa saldo negatif; saldo yang sudah terpakai menghasilkan 422 `POIN_TIDAK_CUKUP` dari dalam transaksi tanpa perubahan stok; query salah 400 | 500 dengan saldo 100 dan stok 1 tetap; `[201, 422]` dengan saldo 0; 422 dengan stok 5 tetap dan tanpa baris penukaran; 400 untuk kelima query | *Pass* |

Khusus kelas **Mendalam**:

Tabel 4.2.20b. Ringkasan Cakupan C16

| Informasi | Keterangan |
| :--- | :--- |
| Daftar operasi public pada DPPL | `tukarPoin(pengguna, idReward)` |
| Operasi yang diuji | `tukarPoin`, ditambah operasi implementasi `getRiwayatPenukaran` |
| ID Algoritma yang tercakup | Algo-064 (memakai Algo-040, Algo-041, Algo-030, Algo-033, Algo-045) |
| Coverage (wajib ≥ 70%) | 100% line, 100% branch, 100% function (`server/controllers/penukaran.ts`, dari `api-penukaran` dan `api-riwayat-penukaran`). Alat: Vitest Coverage V8, bukti pada BUKTI-53 |

## 4.3 Pengujian Integrasi

Pengujian integrasi memeriksa interaksi antarkomponen yang melewati batas, yaitu *Controller* ke *Model*, aplikasi ke basis data, dan aplikasi ke sistem eksternal. Daftar antarmuka mengacu pada dokumen DPPL, dengan minimal satu test case untuk setiap antarmuka. Pengujian memakai komponen nyata, bukan *mock*. Apabila ada antarmuka tambahan yang belum didaftarkan pada dokumen DPPL, cantumkan juga.

Tabel 4.3.1. Daftar Antarmuka Antarkomponen

| ID Antarmuka | Komponen Asal | Komponen Tujuan | Jenis Batas | Test Case |
| :--- | :--- | :--- | :--- | :--- |
| IF-01 | ManagerLaporan (C15) | Laporan (C02), Media (C03) | *Controller* - *Model* | INT-TC01 |
| IF-02 | ValidatorLaporan (C05) | Laporan (C02), Lokasi (C06) | *Controller* - *Model* | INT-TC02 |
| IF-03 | ValidatorLaporan (C05) | ManagerPoin (C11), Pengguna (C08), Lokasi (C06) | *Controller* - *Controller*/*Model* | INT-TC03 |
| IF-04 | Penukaran (C16) | ManagerPoin (C11), Pengguna (C08), Reward (C09), Penukaran (C13) | *Controller* - *Model* | INT-TC04 |
| IF-05 | Laporan (C02), Lokasi (C06) | PostgreSQL (kunci baris dan transaksi) | Aplikasi - Basis data | INT-TC05 |
| IF-06 | Laporan (C02) | PostgreSQL (unique index parsial dan CHECK) | Aplikasi - Basis data | INT-TC06 |
| IF-07 | Media (C03): controller media dan adapter S3 | RustFS (penyimpanan objek S3; Cloudflare R2 di produksi) | Aplikasi - Sistem eksternal | INT-TC07 |
| IF-08 | Route handler dan `wajibLogin` (sesi cookie JWT) | ManagerPoin (C11) | *Route handler* - *Controller* | INT-TC08 |

Tabel 4.3.2. Hasil Pengujian Integrasi

| ID Pengujian | ID Antarmuka | Skenario | Prosedur/Masukan | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| INT-TC01 | IF-01 | Normal: buat ReportIt dan tautkan media | Kirim `POST /api/laporan` berisi ReportIt valid dengan satu media milik pelapor, lalu baca baris `laporan` dan `media` langsung dari PostgreSQL | Respons 201 `{ idLaporan, status: "BELUM_DIPERIKSA" }`; baris laporan tersimpan dengan semua field ReportIt dan `media.laporan_id` terisi ID laporan baru dalam transaksi yang sama | Respons 201 sesuai kontrak; baris laporan dan tautan media sesuai | *Pass* |
| INT-TC02 | IF-02 | Normal: setujui ReportIt membuat lokasi | Operator menyetujui ReportIt tanpa lokasi lain di sekitarnya, lalu baca tabel `lokasi`, `laporan`, dan `pengguna` | Satu transaksi: laporan `VALID` dengan `diverifikasi_oleh`/`diverifikasi_at`, lokasi baru TERCEMAR (poin 50, nama = teks lokasi, `laporan_asal_id`), `laporan.lokasi_id` terisi, saldo pelapor tetap | Laporan, lokasi, dan tautan tersimpan sesuai; saldo pelapor tetap 40 | *Pass* |
| INT-TC03 | IF-03 | Normal: setujui CleanIt memberi poin | Operator menyetujui CleanIt pada lokasi berpoin 100 milik laporan pengguna lain, lalu baca lokasi, saldo, laporan, dan notifikasi pelapor | Lokasi `DIBERSIHKAN`, saldo pelapor +100 lewat ManagerPoin, laporan `VALID`, notifikasi memuat `poinDiberikan: 100`, CleanIt lain untuk lokasi itu ditolak otomatis | Lokasi `DIBERSIHKAN`, saldo 40 → 140, laporan `VALID`, notifikasi belum dibaca dengan poin 100; pada lokasi yang punya CleanIt lain menunggu, CleanIt itu menjadi `TIDAK_VALID` dengan alasan "Lokasi sudah dibersihkan" | *Pass* |
| INT-TC04 | IF-04 | Normal dan gagal: penukaran poin | Tukar reward seharga 50 dengan saldo 120 dan stok 3; lalu, untuk saldo 100 dan reward seharga 100, transaksi lain memakai seluruh saldo dan menahan kunci baris pengguna saat penukaran sudah lolos pengecekan awal (dipastikan menunggu kunci) | Berhasil: saldo 70, stok 2, satu baris `penukaran` dengan voucher; gagal: 422 `POIN_TIDAK_CUKUP` dari dalam transaksi, stok tidak berkurang, dan tidak ada baris penukaran (seluruh transaksi dibatalkan) | Saldo 70, stok 2, satu baris penukaran; saat gagal 422, saldo 0 (dipakai transaksi lain), stok tetap 5, tanpa baris penukaran | *Pass* |
| INT-TC05 | IF-05 | Gagal bersamaan: CleanIt dikirim saat persetujuan berjalan | Transaksi persetujuan CleanIt menahan kunci lokasi; pada saat itu pengguna lain mengirim CleanIt untuk lokasi yang sama lewat `POST /api/laporan` (dipastikan menunggu kunci), lalu persetujuan di-commit | Pengiriman CleanIt menunggu kunci `FOR SHARE`, lalu ditolak 409 `LOKASI_SUDAH_DIBERSIHKAN` dan tidak ada laporan yang tersimpan atau menggantung | 409 `LOKASI_SUDAH_DIBERSIHKAN`; tidak ada laporan milik pengguna tersebut di database | *Pass* |
| INT-TC06 | IF-06 | Gagal bersamaan: dua CleanIt menunggu untuk lokasi yang sama | Pengguna yang sama mengirim dua CleanIt untuk satu lokasi secara bersamaan dengan media berbeda | Satu 201 dan satu 409 `CLEANIT_SUDAH_MENUNGGU` (dijaga pengecekan validator dan unique index parsial `laporan_cleanit_menunggu_uidx`); hanya satu laporan CleanIt dan satu media tertaut | Status `[201, 409]` dengan kode `CLEANIT_SUDAH_MENUNGGU`; satu laporan dan satu media tertaut | *Pass* |
| INT-TC07 | IF-07 | Normal dan gagal: unggah media ke RustFS | Unggah foto PNG lewat `POST /api/media`, ambil kembali dari presigned URL, ubah tanda tangan URL, lalu unggah ulang file yang sama setelah tertaut ke laporan | Objek tersimpan di RustFS dalam bentuk ber-watermark, `media.sha256` = hash file asli; URL valid mengembalikan 200, URL dengan tanda tangan diubah ditolak 403; file identik ditolak 409 `MEDIA_SUDAH_DIGUNAKAN` sebelum diunggah | 201; objek diambil dengan 200 dan isinya berbeda dari file asli; hash asli tersimpan; URL diubah 403; unggah ulang 409 dengan tetap satu baris media | *Pass* |
| INT-TC08 | IF-08 | Gagal akses: sesi dan role | Panggil `GET /api/poin/saldo` tanpa cookie, dengan sesi Operator, dengan sesi akun yang sudah dihapus, dan dengan sesi Masyarakat yang valid | Tanpa cookie 401 `UNAUTHORIZED`, Operator 403 `FORBIDDEN`, akun terhapus 401, Masyarakat valid 200 berisi saldo dari database | 401, 403, 401, dan 200 `{ saldoPoin: 150 }` | *Pass* |

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
| KNF01-TC01 | KNF01 | Response time | Halaman Validasi Laporan (I-07) tampil ≤ 2 detik dengan ratusan laporan menunggu verifikasi | Data uji ditambahkan ke `soclean_dev`: 303 ReportIt dan 203 CleanIt `BELUM_DIPERIKSA` (di atas data seed). (1) Waktu respons API `GET /api/laporan?jenis=REPORTIT/CLEANIT&limit=6` diukur dengan `curl` 5 kali setelah satu permintaan pemanasan. (2) Halaman `/operator/laporan` dibuka sebagai Operator di Chrome DevTools (Network, *Disable cache*), satu kali pengukuran setelah pemanasan. Diukur pada server development (`next dev`), yang lebih lambat dari build produksi | API ReportIt rata-rata 0,041 s (maks 0,056 s), API CleanIt rata-rata 0,034 s (maks 0,038 s). Halaman: DOMContentLoaded 468 ms dan Load 1,38 s, ditambah waktu API daftar ≤ 0,056 s, sehingga daftar tampil ±1,44 s dengan badge "303 menunggu validasi". Daftar dipaginasi 6 kartu per halaman (FE-22) dengan jumlah total pada badge, bukan memuat seluruh laporan sekaligus | *Pass* |
| KNF02-TC01 | KNF02 | Response time | Halaman Daftar Lokasi CleanIt (I-09) tampil ≤ 3 detik | Data uji ditambahkan ke `soclean_dev`: 1.005 lokasi `TERCEMAR`. (1) Waktu respons API `GET /api/lokasi?status=TERCEMAR` (seluruh lokasi, tanpa filter radius sesuai N11) diukur dengan `curl` 5 kali setelah pemanasan. (2) Halaman `/lokasi` dibuka sebagai Masyarakat di Chrome DevTools (Network, *Disable cache*), satu kali pengukuran setelah pemanasan, pada server development | API rata-rata 0,100 s (maks 0,197 s) untuk respons 233 KB berisi 1.005 lokasi. Halaman: DOMContentLoaded 1,09 s dan Load 1,86 s, ditambah waktu API ≤ 0,197 s, sehingga daftar tampil ±2,06 s dengan badge "1.005 lokasi menunggu" | *Pass* |
| KNF03-TC01 | KNF03 | Portability | Semua halaman Masyarakat dan Operator dapat dibuka lewat browser tanpa instalasi tambahan pada (a) desktop 1920×1080 dan (b) mobile 360×800, tanpa scroll horizontal (`scrollWidth ≤ innerWidth`) | Chrome desktop 1920×1080 dan emulasi perangkat mobile 360×800 (Chrome DevTools Protocol, mode mobile dan sentuh). Setiap halaman dibuka setelah login sesuai peran, lalu `document.documentElement.scrollWidth` dibandingkan dengan `innerWidth` | 16 dari 16 halaman lolos di kedua ukuran (32 dari 32 pengukuran, `scrollWidth` = `innerWidth`): I-01, I-02, I-03, I-04, I-05, I-06, Riwayat Penukaran, I-09, Detail Lokasi, I-11, Form CleanIt, Profil Masyarakat, I-07, I-08, Profil Operator, dan halaman 404. I-10, I-12, dan I-13 berada di route yang sama dengan I-09 dan I-11 sehingga tidak diukur terpisah. Alur UC03, UC06, UC08, dan UC09 diselesaikan di ukuran tersebut (4.4) | *Pass* |
| KNF04-TC01 | KNF04 | Reliability | Bila unggah foto/video bukti gagal menampilkan notifikasi kegagalan dan tidak ada laporan yang berubah menjadi terkirim | Uji manual dengan Firefox DevTools (Network → Blocking: blokir `http://localhost:3000/api/media`), lalu unggah bukti di I-12 dan amati notifikasi, tab Network, serta tampilan form | Muncul toast error bahwa media gagal diunggah. Di tab Network, `POST /api/media` tercatat "Blocked by DevTools". Kartu media menampilkan "Media gagal disiapkan. Pilih ulang foto atau video Anda." dengan tombol Coba lagi, sedangkan tombol Lanjut nonaktif dengan keterangan "Tambahkan minimal satu bukti dan tunggu hingga semua unggahan selesai", sehingga laporan tidak bisa dikirim | *Pass* |
| KNF05-TC01 | KNF05 | Reliability | Bila terjadi kegagalan selama penukaran poin, seluruh transaksi dibatalkan: saldo dan stok tidak berubah dan tidak ada catatan penukaran | Test integrasi Vitest pada PostgreSQL `soclean_test` (`tests/api-penukaran.test.ts`): (1) kegagalan sistem disimulasikan dengan memaksa pencatatan penukaran gagal setelah saldo dan stok dikurangi; (2) kegagalan nyata di tengah transaksi: saldo dipakai transaksi lain setelah pengecekan awal; (3) dua penukaran bersamaan. Setelah setiap kasus, saldo, stok, dan tabel `penukaran` diperiksa langsung di database | (1) Respons 500 `INTERNAL_ERROR`; saldo tetap 100, stok tetap 1, tidak ada baris penukaran. (2) Respons 422 `POIN_TIDAK_CUKUP`; stok tetap 5, tidak ada baris penukaran. (3) Satu berhasil dan satu ditolak; saldo tidak pernah negatif dan hanya satu baris penukaran tercatat. Ketiga test lulus | *Pass* |
| KNF06-TC01 | KNF06 | Availability | *Uptime* minimal 99% setiap bulan | Tidak dapat diukur di lingkungan uji: SoClean hanya dijalankan secara lokal dengan Docker Compose, dan *deploy* tidak termasuk deliverable Tugas 9. Pengukuran *uptime* bulanan membutuhkan aplikasi yang berjalan di server produksi selama satu bulan dengan pemantauan terus-menerus | Belum terverifikasi. Pendukung yang sudah ada: layanan `web` dan `db` memakai `restart: unless-stopped` agar dijalankan ulang otomatis bila berhenti, dan `db` memiliki *healthcheck*. Rencana: setelah *deploy*, pasang pemantau *uptime* eksternal yang memeriksa aplikasi setiap menit dan laporkan persentase ketersediaan per bulan | *Fail* (belum dapat diverifikasi) |
| KNF07-TC01 | KNF07 | Reliability | Saat perangkat offline, 100% isian teks form ReportIt tersimpan di perangkat (localStorage) dan pulih utuh ketika form dibuka kembali. Berkas media tidak termasuk; pengguna diminta memilih ulang media. | Uji manual dengan Chrome DevTools (Network: Offline; Application: Local Storage), ditambah unit test `tests/draf-laporan.test.ts` (Vitest) | Banner offline muncul saat koneksi diputus; perubahan judul saat offline tersimpan di kunci `soclean:draf-laporan:reportit`; setelah tab ditutup dan dibuka kembali, 5 dari 5 field teks (judul, alamat, waktu kejadian, sumber, jenis sampah) pulih utuh dengan banner "Isian dari draf sebelumnya sudah dipulihkan"; 13/13 unit test draf lulus | *Pass* |

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
| C05-UT01 – C05-UT05 (BUKTI-06) | Keluaran Vitest pada PostgreSQL `soclean_test` (`api-daftar-laporan`, `api-setujui-reportit`, `api-setujui-cleanit`, `api-tolak-laporan`): 4 file test, 46 test lulus, 0 gagal |
| C06-UT01 – C06-UT05 (BUKTI-07) | Keluaran Vitest pada `soclean_test` (`model-lokasi`, `model-detail-laporan`, `kotak-pencarian`): 3 file test, 16 test lulus, 0 gagal |
| C08-UT09 – C08-UT13 (BUKTI-11) | Keluaran Vitest pada `soclean_test` (`model-pengguna`, `api-notifikasi`): 2 file test, 17 test lulus, 0 gagal |
| C09-UT01 – C09-UT03 (BUKTI-13) | Keluaran Vitest pada `soclean_test` (`model-reward`): 1 file test, 7 test lulus, 0 gagal |
| C11-UT01 – C11-UT03 (BUKTI-15) | Keluaran Vitest pada `soclean_test` (`manager-poin`, `api-poin`, `api-reward`): 3 file test, 10 test lulus, 0 gagal |
| C13-UT01 – C13-UT05 (BUKTI-17) | Keluaran Vitest pada `soclean_test` (`model-penukaran`, `api-riwayat-penukaran`): 2 file test, 13 test lulus, 0 gagal |
| C15-UT06 – C15-UT08 (BUKTI-20) | Keluaran Vitest pada `soclean_test` (`api-daftar-laporan`, `verifikasi-ganda`, `api-lokasi`): 3 file test, 30 test lulus, 0 gagal |
| C16-UT01 – C16-UT05 (BUKTI-21) | Keluaran Vitest pada `soclean_test` (`api-penukaran`, `api-riwayat-penukaran`): 2 file test, 23 test lulus, 0 gagal |
| INT-TC01 – INT-TC08 (BUKTI-22) | Keluaran Vitest dengan PostgreSQL `soclean_test` dan RustFS nyata (`api-laporan`, `api-setujui-reportit`, `api-setujui-cleanit`, `api-penukaran`, `integrasi-media-storage`, `api-poin`): 6 file test, 48 test lulus, 0 gagal, termasuk 3 test unggah media ke RustFS (INT-TC07) |
| KNF01-TC01 (BUKTI-32) | ![BUKTI-32](assets/BUKTI-32.png) |
| KNF02-TC01 (BUKTI-33) | ![BUKTI-33](assets/BUKTI-33.png) |
| KNF05-TC01 (BUKTI-36) | Keluaran Vitest pada `soclean_test` (`api-penukaran`, filter test *rollback*): 3 test lulus, yaitu rollback saldo dan stok saat pencatatan penukaran gagal (500), saldo terpakai transaksi lain setelah pengecekan awal (422 `POIN_TIDAK_CUKUP`), dan dua penukaran bersamaan dengan saldo untuk satu |
| KNF06-TC01 (BUKTI-37) | Belum ada bukti pengukuran karena *uptime* bulanan baru dapat diukur setelah *deploy* (lihat KNF06-TC01). Konfigurasi pendukung ada di `src/compose.yaml`: `restart: unless-stopped` pada layanan `web` dan `db`, serta *healthcheck* pada `db` |
| Coverage C05 (BUKTI-44) | Vitest Coverage V8 pada `server/controllers/validator-laporan.ts` (46 test lulus): 94,2% statement, 88,88% branch, 100% function, 94,02% line. Baris tidak tercakup: 93, 117, 125, 199 |
| Coverage C06 (BUKTI-45) | Vitest Coverage V8 pada `server/models/lokasi.ts` (35 test lulus): 97,72% statement, 92,1% branch, 100% function, 97,5% line. Baris tidak tercakup: 94 |
| Coverage C08 BE-B (BUKTI-47) | Vitest Coverage V8 pada `server/models/pengguna.ts` (17 test lulus). Fungsi BE-B saja (7 fungsi): 95,24% statement (20/21), 95,45% branch (21/22), 100% function (7/7). Satu file: 96,29% statement, 96,87% branch, 96,15% line |
| Coverage C13 (BUKTI-49) | Vitest Coverage V8 pada `server/models/penukaran.ts` (13 test lulus): 100% statement, branch, function, dan line |
| Coverage C15 BE-B (BUKTI-52) | Vitest Coverage V8 pada `server/controllers/manager-laporan.ts` (47 test lulus). Fungsi BE-B saja (10 fungsi): 92,59% statement (50/54), 87,5% branch (28/32), 100% function (10/10). Fungsi BE-A pada file yang sama diukur di BUKTI-51 |
| Coverage C16 (BUKTI-53) | Vitest Coverage V8 pada `server/controllers/penukaran.ts` (23 test lulus): 100% statement, branch, function, dan line |
| *C02-UT01 - C02-UT05 unit test dan coverage* | ![BUKTI-02](assets/BUKTI-02.png) |
| *C03-UT01 - C03-UT05 unit test dan coverage* | ![BUKTI-04](assets/BUKTI-04.png) |
| *C08-UT04 - C08-UT-08 unit test dan coverage* | ![BUKTI-10](assets/BUKTI-10.png) |
| *C15-UT01 - C15-UT-05 unit test dan coverage* | ![BUKTI-19-A](assets/BUKTI-19-A.png)<br>![BUKTI-19-B](assets/BUKTI-19-B.png) |
| *KNF04-TC01* | ![BUKTI-35](assets/BUKTI-35.png) |
<!-- | *UC01-TC01* | *[Sisipkan tangkapan layar UC01-TC01 sesuai prosedur pengujian]* |
| *UC01-TC02* | *[Sisipkan tangkapan layar UC01-TC02 sesuai prosedur pengujian]* |
| *KNF01-TC01* | *[Sisipkan bukti pengukuran parameter KNF01-TC01]* | -->


<br>

---

# BAB 5: Traceability

<!-- Bab ini berisi matriks kerunutan dari KF dan KNF di [SKPL](../M5/K03_G02_SKPL.md) (Tabel 2.1 dan Tabel 3.2) ke use case, kelas perancangan, file implementasi, dan test case di Bab 4. Sebuah KF kami anggap terpenuhi kalau semua test case yang terkait dengannya `Pass`, dan setiap KF punya minimal satu test case.-->

Setiap KF punya minimal satu test case, dan sebuah KF kami anggap terpenuhi kalau semua test case yang terkait dengannya `Pass`.

Supaya isi tabel bisa dicek ulang ke dokumen-dokumen sebelumnya, kami memakai beberapa aturan saat menyusunnya:

1. Kolom Use Case ID diambil dari kolom ID KF Terkait pada Tabel 2.2 (SKPL 4.2).
2. Kolom Kelas Terkait diambil dari matriks kelas–use case di Bab 7 [DPPL](../M8/K03_G02_DPPL2.md). Kami hanya menulis kelas yang benar-benar menjalankan KF tersebut, jadi tidak semua kelas di use case ikut masuk. Kalau implementasinya berbeda dari DPPL, kami mengikuti Tabel B.1 [dokumen Implementasi](../M9/K03_G02_Implementasi.md). Contohnya C04 DaftarLaporan, yang sekarang tidak lagi menyimpan laporan (N16).
3. Sebuah KNF kami kaitkan ke KF kalau ID kebutuhannya (R) sama di SKPL, atau kalau isi KNF itu langsung membahas fitur KF tersebut. KNF05 (R16), misalnya, membahas penukaran poin, jadi kami kaitkan ke KF11 dan KF13. KNF01 (R04) membahas daftar laporan yang menunggu verifikasi, jadi ikut dikaitkan ke KF09.
4. Kolom Test Case (UC) disamakan dengan kolom ID KF di Tabel 4.4.1–4.4.9. Kolom Test Case (Unit/Integrasi/KNF) berisi test case dari 4.2, 4.3, dan 4.5 yang menguji perilaku KF tersebut.
5. Kolom file hanya memuat file utama beserta ID antarmukanya (Tabel 3.3), dengan path relatif terhadap `src/so-clean/`. Daftar file lengkap tiap kelas ada di Tabel 3.2.
6. KNF06-TC01 (*uptime* bulanan) belum bisa dijalankan karena aplikasi belum di-*deploy* (lihat 4.5). KNF06 tetap kami tulis di baris KF01 dan KF02 karena ketiganya berasal dari R01. Namun, KNF06 diberi tanda † dan tidak kami pakai untuk menentukan apakah fungsi KF01 dan KF02 terpenuhi. Status KNF06 dicatat di Tabel 5.2.

Ke-13 KF sudah diimplementasikan, jadi tidak ada baris "Tidak diimplementasikan" di Tabel 5.1.

Tabel 5.1. Matriks Kerunutan KF terhadap Implementasi dan Pengujian

| KF ID | KNF Terkait | Use Case ID | Kelas Terkait | Implementasi File Terkait | Test Case (UC) | Test Case (Unit/Integrasi/KNF) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| KF01 | KNF03, KNF06†, KNF07 | UC01 | C01 - FormLaporan | Antarmuka I-03, I-11–I-13:<br>`components/Beranda.tsx`, `lib/beranda.ts` (kartu ReportIt)<br>`app/(pages)/(laporan)/reportit/page.tsx`<br>`components/laporan/FormLaporan.tsx`, `components/laporan/FormLaporanProvider.tsx`, `lib/form-laporan.ts`<br>`components/laporan/informasi-dasar/FormReportIt.tsx`, `InformasiDasarReportIt.tsx`, `PilihLokasiLaporan.tsx`<br>`lib/draf-laporan.ts`, `components/laporan/useDrafLaporan.ts` (draf offline) | UC01-TC01 | C01-UT01, KNF03-TC01, KNF07-TC01 |
| KF02 | KNF03, KNF04, KNF06†, KNF07 | UC02 | C01 - FormLaporan (`ambil_gambar`)<br>C03 - Media | Antarmuka I-12:<br>`components/laporan/BuktiMedia.tsx`, `components/laporan/UnggahMediaProvider.tsx`<br>`lib/bukti-media.ts`, `lib/antrean-media.ts`<br>`app/api/media/route.ts`, `server/controllers/media.ts`<br>`server/media/processing.ts` (watermark dan timestamp)<br>`server/storage/s3.ts`<br>`server/models/media.ts`, `server/db/schema/media.ts` | UC02-TC01, UC02-TC02, UC02-TC03 | C01-UT04, C01-UT05, C01-UT06, C03-UT01, C03-UT02, INT-TC07, KNF03-TC01, KNF04-TC01, KNF07-TC01 |
| KF03 | - | UC01 | C01 - FormLaporan<br>C15 - ManagerLaporan | Antarmuka I-11, I-13:<br>`lib/informasi-dasar.ts`, `lib/form-cleanit.ts`, `lib/wilayah.ts` (validasi klien)<br>`components/laporan/informasi-dasar/FormReportIt.tsx`<br>`app/api/laporan/route.ts` (POST)<br>`server/controllers/manager-laporan.ts` (`is_terisi`, `is_format_valid`, `cek_laporan`) | UC01-TC01, UC01-TC02, UC01-TC03 | C01-UT02, C01-UT03, C15-UT01, C15-UT02, C15-UT03 |
| KF04 | KNF04 | UC01 | C01 - FormLaporan<br>C02 - Laporan<br>C03 - Media<br>C15 - ManagerLaporan | Antarmuka I-13:<br>`components/laporan/PengirimanLaporanProvider.tsx`, `components/laporan/KirimLaporan.tsx`<br>`lib/kirim-laporan.ts`<br>`app/api/laporan/route.ts` (POST)<br>`server/controllers/manager-laporan.ts` (`buat_laporan`)<br>`server/models/laporan.ts`, `server/db/schema/laporan.ts`<br>`server/models/media.ts` (`getUntukLaporan`, `tautkanKeLaporan`) | UC01-TC01 | C01-UT07, C01-UT08, C02-UT01, C03-UT03, C03-UT04, C15-UT04, C15-UT05, INT-TC01, KNF04-TC01 |
| KF05 | KNF01 | UC03 | C02 - Laporan<br>C03 - Media<br>C04 - DaftarLaporan<br>C05 - ValidatorLaporan<br>C06 - Lokasi<br>C14 - LaporanView<br>C15 - ManagerLaporan | Antarmuka I-07, I-08:<br>`app/(pages)/operator/laporan/page.tsx`<br>`components/DaftarLaporan.tsx`, `components/LaporanView.tsx`, `lib/laporan.ts`<br>`app/api/laporan/route.ts` (GET), `app/api/laporan/[id]/route.ts`, `app/api/laporan/[id]/setujui/route.ts`, `app/api/laporan/[id]/tolak/route.ts`<br>`server/controllers/validator-laporan.ts`, `server/controllers/manager-laporan.ts`<br>`server/models/laporan.ts`, `server/models/lokasi.ts`, `server/models/media.ts` | UC03-TC01, UC03-TC02 | C02-UT02, C02-UT03, C02-UT04, C03-UT05, C04-UT01 – C04-UT04, C05-UT01 – C05-UT05, C06-UT02 – C06-UT05, C14-UT01 – C14-UT05, C15-UT06 – C15-UT08, INT-TC02, KNF01-TC01 |
| KF06 | KNF02 | UC04 | C06 - Lokasi<br>C07 - DaftarLokasi<br>C15 - ManagerLaporan | Antarmuka I-03, I-09, I-10:<br>`components/Beranda.tsx` (kartu CleanIt)<br>`app/(pages)/(masyarakat)/(nav)/lokasi/page.tsx`<br>`components/lokasi/DaftarLokasi.tsx`, `components/lokasi/KartuLokasi.tsx`, `components/lokasi/LokasiKosong.tsx`<br>`lib/lokasi.ts`<br>`app/api/lokasi/route.ts`<br>`server/controllers/manager-laporan.ts` (`get_daftar_lokasi`)<br>`server/models/lokasi.ts` (`get_all_lokasi_valid`) | UC04-TC01, UC04-TC02 | C06-UT01, C06-UT03, C07-UT01 – C07-UT03, C15-UT06, KNF02-TC01 |
| KF07 | KNF02 | UC04 | C03 - Media<br>C06 - Lokasi<br>C14 - LaporanView<br>C15 - ManagerLaporan | Antarmuka Detail Lokasi (tambahan UC04):<br>`app/(pages)/(masyarakat)/(nav)/lokasi/[idLokasi]/page.tsx`<br>`components/lokasi/DetailLokasi.tsx`, `components/lokasi/MediaLokasi.tsx`<br>`lib/detail-lokasi.ts`<br>`app/api/lokasi/[id]/route.ts`<br>`server/controllers/manager-laporan.ts` (`get_detail_lokasi`)<br>`server/models/lokasi.ts` (`get_lokasi`), `server/models/media.ts` (`getByLaporan`) | UC04-TC01 | C03-UT05, C06-UT01, C06-UT03, C15-UT06, C15-UT08, KNF02-TC01 |
| KF08 | KNF04 | UC05 | C01 - FormLaporan<br>C02 - Laporan<br>C06 - Lokasi<br>C14 - LaporanView<br>C15 - ManagerLaporan | Antarmuka Detail Lokasi → Form CleanIt, I-12, I-13:<br>`components/lokasi/KonfirmasiBersihkan.tsx`<br>`app/(pages)/(laporan)/cleanit/[idLokasi]/page.tsx`<br>`components/laporan/cleanit/FormCleanIt.tsx`, `components/laporan/cleanit/InformasiDasarCleanIt.tsx`<br>`lib/form-cleanit.ts`, `lib/judul.ts`, `lib/kirim-laporan.ts`<br>`app/api/laporan/route.ts` (POST)<br>`server/controllers/manager-laporan.ts` (aturan CleanIt)<br>`server/models/laporan.ts` (`adaCleanItMenunggu`), `server/models/lokasi.ts` (`getUntukValidasiCleanIt`) | UC05-TC01, UC05-TC02 | C01-UT03, C01-UT07, C01-UT08, C02-UT05, C15-UT04, C15-UT05, INT-TC05, INT-TC06, KNF04-TC01 |
| KF09 | KNF01 | UC06 | C02 - Laporan<br>C04 - DaftarLaporan<br>C05 - ValidatorLaporan<br>C06 - Lokasi<br>C14 - LaporanView<br>C15 - ManagerLaporan | Antarmuka I-07 (tab CleanIt), I-08 (galeri Sebelum/Sesudah):<br>`app/(pages)/operator/laporan/page.tsx`<br>`components/DaftarLaporan.tsx`, `components/LaporanView.tsx`, `lib/laporan.ts`<br>`app/api/laporan/[id]/route.ts`, `app/api/laporan/[id]/setujui/route.ts`, `app/api/laporan/[id]/tolak/route.ts`<br>`server/controllers/validator-laporan.ts` (`setujui_cleanit`, `tolak`), `server/controllers/manager-laporan.ts`<br>`server/models/laporan.ts` (`tolakCleanItMenungguLain`, `hitungBersihkanSendiri30Hari`), `server/models/lokasi.ts` (`tandaiDibersihkan`) | UC06-TC01, UC06-TC02 | C02-UT04, C04-UT01, C04-UT04, C05-UT01 – C05-UT05, C06-UT04, C06-UT05, C14-UT03 – C14-UT05, C15-UT06 – C15-UT08, INT-TC03, INT-TC05, KNF01-TC01 |
| KF10 | - | UC06 | C05 - ValidatorLaporan<br>C08 - Pengguna<br>C11 - ManagerPoin | Antarmuka I-08, Profil Masyarakat:<br>`server/controllers/validator-laporan.ts` (`setujui_cleanit`)<br>`server/controllers/manager-poin.ts` (`tambah_poin`)<br>`server/models/pengguna.ts` (`tambah_poin`, `getNotifikasi`), `server/models/lokasi.ts` (kolom `poin`)<br>`app/api/notifikasi/route.ts`, `app/api/notifikasi/dibaca/route.ts`<br>`components/ProfilMasyarakat.tsx`, `lib/profil.ts` | UC06-TC01 | C05-UT04, C05-UT05, C08-UT10, C08-UT11, C08-UT12, C08-UT14 – C08-UT16, C11-UT01 – C11-UT03, INT-TC03 |
| KF11 | KNF05 | UC06, UC07, UC08, UC09 | C08 - Pengguna<br>C09 - Reward<br>C11 - ManagerPoin<br>C16 - Penukaran (Controller) | `server/models/pengguna.ts` (`getSaldoPoin`, `cukupPoin`, `kurangiPoin`, `tambah_poin`, `getMe`)<br>`server/models/reward.ts` (`kurangiStok`, `tersedia`)<br>`server/controllers/manager-poin.ts`<br>`server/controllers/penukaran.ts` (`tukarPoin`, transaksi dan rollback)<br>`app/api/poin/saldo/route.ts`, `app/api/me/route.ts`, `app/api/penukaran/route.ts` | UC06-TC01, UC07-TC01, UC07-TC02, UC09-TC01 | C08-UT06, C08-UT09 – C08-UT11, C08-UT13, C09-UT02, C09-UT03, C11-UT01 – C11-UT03, C16-UT01, C16-UT02, C16-UT05, INT-TC03, INT-TC04, INT-TC08, KNF05-TC01 |
| KF12 | - | UC07, UC08, UC09 | C08 - Pengguna<br>C09 - Reward<br>C10 - DaftarReward<br>C11 - ManagerPoin<br>C12 - HalamanPenukaran | Antarmuka I-03, I-04:<br>`components/Beranda.tsx` (kartu Poin Anda), `lib/api/endpoints.ts` (`authApi.me`)<br>`app/(pages)/(masyarakat)/(nav)/hadiah/page.tsx`<br>`components/HalamanPenukaran.tsx`, `components/KartuSaldo.tsx`, `components/DaftarReward.tsx`, `lib/reward.ts`<br>`app/api/poin/saldo/route.ts`, `app/api/reward/route.ts`<br>`server/controllers/manager-poin.ts` (`lihatSaldo`, `lihatRewardTersedia`)<br>`server/models/reward.ts` (`getRewardTersedia`) | UC07-TC01, UC07-TC02, UC08-TC01, UC08-TC02 | C08-UT01, C09-UT01, C10-UT01 – C10-UT03, C11-UT01, C11-UT03, INT-TC08 |
| KF13 | KNF05 | UC09 | C08 - Pengguna<br>C09 - Reward<br>C10 - DaftarReward<br>C11 - ManagerPoin<br>C12 - HalamanPenukaran<br>C13 - Penukaran (Model)<br>C16 - Penukaran (Controller) | Antarmuka I-04, I-05, I-06:<br>`components/DaftarReward.tsx` (tombol Tukar/Kurang/Habis)<br>`components/KonfirmasiPenukaran.tsx`<br>`app/(pages)/(masyarakat)/hadiah/berhasil/page.tsx`, `components/PenukaranBerhasil.tsx`, `components/KodeVoucher.tsx`<br>`lib/penukaran.ts`<br>`app/api/penukaran/route.ts` (POST)<br>`server/controllers/penukaran.ts` (`tukarPoin`)<br>`server/models/penukaran.ts` (`buatPenukaran`, `buatKodeVoucher`), `server/db/schema/penukaran.ts` | UC09-TC01, UC09-TC02 | C10-UT03, C12-UT01, C12-UT03 – C12-UT05, C13-UT01 – C13-UT03, C16-UT01 – C16-UT03, C16-UT05, INT-TC04, KNF05-TC01 |

† KNF06 belum bisa diverifikasi (aturan 6), lihat Tabel 5.2.

Ada beberapa baris di Tabel 5.1 yang perlu penjelasan tambahan.

Pada KF02, media bisa diambil dari kamera maupun berkas lewat satu input file. Di HP, browser akan menawarkan pilihan kamera atau galeri (B.1 no. 6 dan 7). Watermark dan timestamp ditambahkan di server oleh `prosesMediaAsli`, dan itu pun hanya untuk foto. UC02-TC01 dijalankan dengan memilih berkas, jadi pengambilan langsung dari kamera fisik belum kami uji.

UC01, UC02, UC04, dan UC05 diuji memakai fixture HTTP (4.4), bukan basis data dan *object storage* sungguhan. Bagian yang tidak tercakup itu sudah diuji lewat C15-UT04, C15-UT05, INT-TC01, INT-TC05, INT-TC06, dan INT-TC07. Itulah sebabnya baris KF01–KF04 dan KF06–KF08 memuat kedua jenis test case.

Kalau dibaca apa adanya, KF05 hanya meminta antarmuka daftar laporan. Masalahnya, KF05 adalah satu-satunya KF di UC03. Karena itu, proses verifikasi ReportIt (setujui dengan penggabungan lokasi radius 50 m [K13], tolak, dan pencegahan verifikasi ganda [B.1 no. 33]) kami kaitkan ke KF05. KF09 kami perlakukan dengan cara yang sama untuk verifikasi CleanIt.

Daftar lokasi pada KF06 tidak difilter berdasarkan radius. Urutan Terdekat dihitung di sisi klien. Kalau izin GPS ditolak, urutannya kembali ke Terbaru (N11, C07-UT03).

Halaman Detail Lokasi untuk KF07 tidak ada di DPPL karena merupakan tambahan untuk UC04 (Tabel 3.3). Fungsi di `lib/detail-lokasi.ts` sebenarnya sudah dites di `tests/detail-lokasi.test.ts` dan `tests/detail-lokasi-client.test.ts`. Hanya saja, test itu belum diberi ID unit karena C14-UT01–C14-UT05 cuma mencakup sisi Operator.

Untuk KF10, poin hanya diberikan kalau CleanIt dinyatakan valid (N1). Jumlah poinnya diambil dari `lokasi.poin`, yang dipilih Operator ketika menyetujui ReportIt (K3). C05-UT04 juga memastikan saldo pelapor ReportIt tidak ikut bertambah.

Di SKPL, UC08 dikaitkan ke KF11 karena membaca stok reward. Namun, stoknya sendiri baru berubah di UC09, jadi test case UC08 hanya kami catat di KF12.

Pada KF13, penukaran baru dijalankan setelah pengguna menekan konfirmasi di I-05. Kalau gagal, penyebabnya dibedakan menjadi `POIN_TIDAK_CUKUP`, `STOK_HABIS`, atau `NOT_FOUND` (N12).

Tabel 5.2. Matriks Kerunutan KNF terhadap Pengujian

| ID KNF | Parameter | KF/UC Terkait | Test Case | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- |
| KNF01 | *Response time* | KF05, KF09 / UC03, UC06 | KNF01-TC01<br>Pendukung: C15-UT06 (paginasi 6 kartu dan `meta.total`) | *Pass* |
| KNF02 | *Response time* | KF06, KF07 / UC04 | KNF02-TC01<br>Pendukung: C07-UT01 (pengurutan tanpa filter radius) | *Pass* |
| KNF03 | *Portability* | KF01, KF02 / UC01, UC02. Yang diukur 16 halaman dari UC01–UC09, ditambah Login, Register, Profil, Riwayat Penukaran, dan halaman 404 | KNF03-TC01<br>Pendukung: alur UC03, UC06, UC08, dan UC09 diselesaikan pada 360 × 800 (Subbab 4.4) | *Pass* |
| KNF04 | *Reliability* | KF02, KF04, KF08 / UC01, UC02, UC05 | KNF04-TC01<br>Pendukung: C01-UT06, UC02-TC02 | *Pass* |
| KNF05 | *Reliability* | KF11, KF13 / UC09 | KNF05-TC01<br>Pendukung: C08-UT13, C16-UT05, INT-TC04 | *Pass* |
| KNF06 | *Availability* | KF01, KF02 / UC01, UC02 (atribut seluruh sistem) | KNF06-TC01 | *Fail* (belum bisa diverifikasi). Setelah *deploy*, kami akan memasang pemantau *uptime* eksternal dan melaporkan ketersediaannya per bulan (4.5) |
| KNF07 | *Reliability* | KF01, KF02 / UC01 | KNF07-TC01 (termasuk 13 unit test `tests/draf-laporan.test.ts`)<br>Pendukung: UC02-TC03 (antrean media saat offline, N5) | *Pass* |

Tabel 5.3. Ringkasan Status Pemenuhan KF

| KF ID | Test Case (UC) | Test Case (Unit/Integrasi/KNF) | Total | Pass | Fail | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| KF01 | 1 | 3 | 4 | 4 | 0 | Terpenuhi, tetapi KNF06 belum terverifikasi |
| KF02 | 3 | 9 | 12 | 12 | 0 | Terpenuhi, tetapi KNF06 belum terverifikasi dan kamera fisik belum dites |
| KF03 | 3 | 5 | 8 | 8 | 0 | Terpenuhi |
| KF04 | 1 | 9 | 10 | 10 | 0 | Terpenuhi |
| KF05 | 2 | 27 | 29 | 29 | 0 | Terpenuhi |
| KF06 | 2 | 7 | 9 | 9 | 0 | Terpenuhi |
| KF07 | 1 | 6 | 7 | 7 | 0 | Terpenuhi |
| KF08 | 2 | 9 | 11 | 11 | 0 | Terpenuhi |
| KF09 | 2 | 19 | 21 | 21 | 0 | Terpenuhi |
| KF10 | 1 | 12 | 13 | 13 | 0 | Terpenuhi |
| KF11 | 4 | 17 | 21 | 21 | 0 | Terpenuhi |
| KF12 | 4 | 8 | 12 | 12 | 0 | Terpenuhi |
| KF13 | 2 | 14 | 16 | 16 | 0 | Terpenuhi |

Satu test case bisa dihitung di beberapa KF sekaligus. UC01-TC01, misalnya, ikut dihitung di KF01, KF03, dan KF04.

Ada juga bagian implementasi yang ditambahkan saat Tugas 9 (Tabel B.1 dokumen Implementasi) dan tidak punya KF sendiri. Bagian-bagian ini tetap kami runut di Tabel 5.4 supaya semua test case di Bab 4 jelas mengacu ke mana.

Tabel 5.4. Kerunutan Elemen Implementasi di Luar KF

| Elemen | Dasar Perubahan | Kelas Terkait | Implementasi File Terkait | Test Case |
| :--- | :--- | :--- | :--- | :--- |
| Autentikasi dan sesi (Login I-01, Register I-02, pengarahan sesuai role) | B.1 no. 21 dan 32 (N7) | C08 - Pengguna | `app/(pages)/(auth)/login/page.tsx`, `app/(pages)/(auth)/register/page.tsx`<br>`components/FormLogin.tsx`, `components/FormRegister.tsx`, `lib/login.ts`, `lib/register.ts`<br>`server/auth/` (`account.ts`, `password.ts`, `session-token.ts`, `session-cookie.ts`, `guard.ts`)<br>`server/controllers/auth.ts`, `app/api/auth/{login,register,logout}/route.ts`, `app/api/me/route.ts`<br>`proxy.ts`, `lib/akses.ts` | C08-UT02 – C08-UT08, INT-TC08, KNF03-TC01 |
| Profil Masyarakat dan Operator, notifikasi hasil verifikasi | B.1 no. 22 dan 27 (N8, N13) | C08 - Pengguna<br>C15 - ManagerLaporan | `components/ProfilMasyarakat.tsx`, `components/ProfilOperator.tsx`, `lib/profil.ts`<br>`app/api/notifikasi/route.ts`, `app/api/notifikasi/dibaca/route.ts`<br>`server/models/pengguna.ts` (`getNotifikasi`, `tandaiNotifikasiDibaca`) | C08-UT12 – C08-UT16, C15-UT08, UC03-TC02, UC06-TC01, UC06-TC02 |
| Riwayat Penukaran | B.1 no. 27 (N13) | C12 - HalamanPenukaran<br>C13 - Penukaran (Model)<br>C16 - Penukaran (Controller) | `app/(pages)/(masyarakat)/(nav)/hadiah/riwayat/page.tsx`, `components/RiwayatPenukaran.tsx`<br>`lib/penukaran.ts` (`bacaHalaman`)<br>`app/api/penukaran/route.ts` (GET), `server/controllers/penukaran.ts` (`getRiwayatPenukaran`), `server/models/penukaran.ts` (`getRiwayat`) | C12-UT02, C13-UT04, C13-UT05, C16-UT04, UC09-TC01 (langkah 5) |
| Pembatasan wilayah kerja sama | B.1 no. 12 (K10), SKPL 2.4 | C01 - FormLaporan<br>C15 - ManagerLaporan | `lib/wilayah.ts`, `lib/informasi-dasar.ts` (`diLuarWilayah`)<br>`server/controllers/manager-laporan.ts` (`DI_LUAR_WILAYAH`) | C15-UT03 |
| Halaman 404 dan error | FE-25 (Tabel 3.3) | - | `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`, `components/HalamanStatus.tsx` | KNF03-TC01 |

Tabel 5.5 membaca arah sebaliknya, yaitu dari kelas ke KF. Tujuannya untuk mengecek bahwa setiap kelas perancangan memang dipakai oleh minimal satu KF. Kolom Use Case (DPPL) disalin dari Bab 7 DPPL. Kalau isinya tidak sejalan dengan kolom KF, alasannya kami tulis di kolom Keterangan.

Tabel 5.5. Kerunutan Balik Kelas Perancangan terhadap KF

| ID Kelas | Nama Kelas | Tingkat (Tabel 4.1.1) | KF Terkait | Use Case (DPPL) | Test Case Unit | Keterangan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| C01 | FormLaporan | Mendalam | KF01, KF02, KF03, KF04, KF08 | UC01, UC02, UC05 | C01-UT01 – C01-UT08 | - |
| C02 | Laporan | Mendalam | KF04, KF05, KF08, KF09 | UC01, UC03, UC05, UC06 | C02-UT01 – C02-UT05 | - |
| C03 | Media | Mendalam | KF02, KF04, KF05, KF07 | UC02 | C03-UT01 – C03-UT05 | Selain di UC02, media juga dipakai saat membuat, memverifikasi, dan melihat detail laporan karena satu laporan bisa punya 1–3 media (B.1 no. 4) |
| C04 | DaftarLaporan | Mendalam | KF05, KF09 | UC01, UC03, UC05, UC06 | C04-UT01 – C04-UT04 | Tugas `daftar_laporan` di UC01 dan UC05 pindah ke C02/C15 karena View tidak boleh melakukan INSERT (N16) |
| C05 | ValidatorLaporan | Mendalam | KF05, KF09, KF10 | UC03, UC06 | C05-UT01 – C05-UT05 | - |
| C06 | Lokasi | Mendalam | KF05, KF06, KF07, KF08, KF09 | UC03, UC04 | C06-UT01 – C06-UT05 | Ikut terpakai di UC05 dan UC06. Validasi CleanIt membaca status lokasi, lalu persetujuan CleanIt mengubahnya jadi `DIBERSIHKAN` (K2, N6) |
| C07 | DaftarLokasi | Sedang | KF06 | UC04 | C07-UT01 – C07-UT03 | - |
| C08 | Pengguna | Mendalam | KF10, KF11, KF12, KF13 | UC06, UC07, UC09 | C08-UT01 – C08-UT16 | Juga dipakai untuk autentikasi dan profil (Tabel 5.4). Kaitannya dengan KF12 lewat saldo yang tampil di Beranda (B.1 no. 32) |
| C09 | Reward | Sedang | KF11, KF12, KF13 | UC08, UC09 | C09-UT01 – C09-UT03 | - |
| C10 | DaftarReward | Sedang | KF12, KF13 | UC08, UC09 | C10-UT01 – C10-UT03 | - |
| C11 | ManagerPoin | Sedang | KF10, KF11, KF12, KF13 | UC06, UC07, UC08, UC09 | C11-UT01 – C11-UT03 | - |
| C12 | HalamanPenukaran | Mendalam | KF12, KF13 | UC07, UC08, UC09 | C12-UT01 – C12-UT05 | - |
| C13 | Penukaran (Model) | Mendalam | KF13 | UC09 | C13-UT01 – C13-UT05 | - |
| C14 | LaporanView | Mendalam | KF05, KF07, KF08, KF09 | UC03, UC04, UC06 | C14-UT01 – C14-UT05 | Terkait KF08 karena `konfirmasi_bersihkan` yang membuka Form CleanIt (N2) |
| C15 | ManagerLaporan | Mendalam | KF03, KF04, KF05, KF06, KF07, KF08, KF09 | UC01, UC03, UC04, UC05, UC06 | C15-UT01 – C15-UT08 | - |
| C16 | Penukaran (Controller) | Mendalam | KF11, KF13 | UC09 | C16-UT01 – C16-UT05 | - |

Secara keseluruhan, ke-13 KF terpenuhi karena semua test case fungsional yang terkait `Pass`. Untuk KNF, 6 dari 7 sudah terpenuhi. KNF06 (*availability*) baru bisa diukur setelah aplikasi di-*deploy*, jadi kami catat sebagai tindak lanjut.

Bab 4 berisi 123 test case: 88 unit, 8 integrasi, 20 use case, dan 7 KNF. Dari jumlah itu, 122 `Pass` dan 1 `Fail`, yaitu KNF06-TC01. Setiap test case muncul minimal sekali di Tabel 5.1 atau Tabel 5.4. Semua kelas perancangan dari C01 sampai C16 juga sudah terkait ke minimal satu KF dan punya test case unit.
