<h1>
IF2150 REKAYASA PERANGKAT LUNAK
<br>
TUGAS 1
<br>
TOPIC BRAINSTORMING
</h1>
<br>

## _Nama Perangkat Lunak_

### Untuk: Aurelia Jennifer Gunawan

Dipersiapkan oleh:
| Informasi | Keterangan |
| --- | --- |
| Kelas | _K-03_ |
| Kelompok | _G-02_ |

| NIM      | Nama                      |
| -------- | ------------------------- |
| 13525027 | Faishal Ahmad Nurdin      |
| 13525042 | Justin William            |
| 13525060 | M. Aqsha Bagus R.I.B.     |
| 13525087 | Jovan Nathanael           |
| 13525147 | Muhammad Dhafin Al Khairy |

---

<br>
<br>

# BAB 1: Analisis Permasalahan

## 1.1 Latar Belakang Masalah

Indonesia sedang menghadapi krisis polusi laut yang sangat dahsyat. Berdasarkan [laporan dari World Bank](https://www.worldbank.org/en/country/indonesia/publication/plastic-waste-discharges-from-rivers-and-coastlines-in-indonesia), Indonesia menghasilkan sekitar 7,8 juta ton sampah plastik setiap tahunnya, dan diperkirakan 346.000 ton di antaranya bocor dan mencemari ekosistem laut. Tingginya angka kebocoran ini sebagian besar berasal dari aktivitas darat dan pemukiman di sekitar aliran sungai atau daerah pesisir yang belum terjangkau oleh infrastruktur pengelolaan sampah yang memadai.

Permasalahan utama yang diangkat dalam proyek perangkat lunak ini adalah masih tingginya tingkat pembuangan dan kebocoran sampah ke ekosistem perairan seperti laut dan sungai, serta belum optimalnya media pelaporan bagi masyarakat pinggir perairan. Meskipun kesadaran lingkungan sebagian warga mulai tumbuh, tidak adanya sistem yang terintegrasi dan insentif ekonomi membuat masyarakat kurang termotivasi untuk berpartisipasi aktif dalam penanggulangan dan pembersihan tumpukan sampah liar di sekitar mereka.

Pengembangan perangkat lunak berkontribusi langsung pada pencapaian Sustainable Development Goals (SDGs) Tujuan 14: Life Below Water (Ekosistem Lautan). Proyek ini secara spesifik beririsan dengan [Target 14.1](https://globalgoals.org/goals/14-life-below-water/) yang berfokus pada upaya mencegah dan mengurangi segala jenis polusi perairan, khususnya polusi yang berasal dari aktivitas darat (*land-based activities*). Lantas, diharapkan aplikasi ini mampu menekan laju kebocoran sampah plastik dari darat ke perairan, sembari menjaga ekosistem perairan Indonesia.

## 1.2 Analisis Kondisi Saat Ini

Saat ini sistem pelaporan untuk kerusakan lingkungan baik itu di darat maupun perairan sudah dapat dilakukan secara online. Masyarakat dapat melaporkannya pada beberapa saluran yang disediakan oleh pemerintah seperti [S4AN-Lapor](https://kemenlh.lapor.go.id/), [e-GAKKUM LH](https://egakkum.kemenlh.go.id/), dan saluran pelaporan Dinas Lingkungan Hidup Setempat. Walaupun saluran-saluran tersebut sudah dapat menyalurkan aspirasi masyarakat terkait kerusakan lingkungan kepada pemerintah, tetapi respon pemerintah terhadap laporan tersebut masih sangat kurang. Kurangnya respon ini dapat dibuktikan dengan ditemukannya kasus penundaan berlarut oleh Dinas Lingkungan Hidup dan Kehutanan Provinsi Sumatera Utara dalam menindaklanjuti laporan masyarakat terkait pencemaran lingkungan oleh PT Universal Gloves. 

Menanggapi lambatnya respon dari pemerintah, peran masyarkat setempat menjadi sangat penting dalam menanggapi masalah lingkungan, terutama di ekosistem perairan. Oleh karena itu, sistem pelaporan kerusakan ekosistem perairan yang dapat diakses oleh masyarakat setempat menjadi sangat penting agar mereka dapat membantu dalam menanganinya. Sudah terdapat beberapa _software_ yang dibuat untuk tujuan ini, salah satu contohnya adalah Clean Swell. Tetapi _software-software_ tersebut kurang memberikan insentif nyata kepada masyarakat setempat sehingga mereka kurang terdorong untuk membantu menjaga ekosistem perairan.

---

# BAB 2: Analisis Solusi

## 2.1 Deskripsi Perangkat Lunak

<italic>Blm tau nama softwarenya apa &trade;</italic> adalah perangkat lunak berbasis <italic>crowdsourcing</italic> yang menyediakan sarana bagi publik untuk berkontribusi dalam upaya pelestarian lingkungan laut melalui pembersihan laut dari sampah-sampah domestik. Dalam implementasinya, perangkat lunak ini menggunakan metode gamifikasi yang kolaboratif sebagai bentuk dorongan komunal dalam usaha memajukan progres SDG ke-14.
Sebelum mendapatkan akses terhadap fitur-fitur di perangkat lunak, pengguna dapat melakukan registrasi serta <italic>log in</italic> menggunakan kredensial akunnya. Terdapat dua fitur utama dalam perangkat lunak ini: 1) laporan pembersihan sampah secara langsung (sementara disebut CleanIt), dan 2) laporan daerah penuh sampah (sementara disebut ReportIt). CleanIt merupakan fitur yang memungkinkan pengguna untuk melaporkan kontribusi langsungnya dalam membersihkan laut. Kontribusi tersebut dapat dikonfirmasi dengan mengunggah bukti, seperti foto atau video yang kemudian ditinjau oleh operator. Setelah hasil CleanIt-nya dinyatakan valid oleh operator, pengguna memperoleh poin untuk akunnya. ReportIt merupakan sarana bagi pengguna untuk melaporkan daerah lautan yang terkontaminasi sampah tanpa harus membersihkan secara langsung daerah tersebut. Pelaporan tersebut bersifat seperti <italic>bounty</italic> yang dapat diambil oleh pengguna lainnya untuk mendapatkan poin.

## 2.2 Asumsi dan Batasan

### 2.2.1 Asumsi

- Pengguna memiliki HP, akses ke internet, dan memiliki pengetahuan dasar mengenai teknologi (tidak gagap teknologi) sehingga dapat mengakses software serta menggunakan fitur-fitur didalamnya.
- Pengguna bersedia ikut serta dalam kegiatan membersihkan sampah dan juga melaporkannya dengan jujur.
- Gamifikasi dan sistem bounty dapat meningkatkan motivasi pengguna dalam membersihkan sampah.

### 2.2.2 Batasan

- Software hanya berfokus pada sampah-sampah domestik yang dapat ditangani dengan keikutsertaan masyarakat. Pelanggaran/pencemaran pada ekosistem perairan lain seperti illegal fishing, dan sebagainya tidak termasuk ruang lingkup sistem.
- Verifikasi pada media bukti ditinjau oleh operatornya langsung, sehingga bisa mengurangi efisiensi.
- Waktu kerja yang terbatas sehingga kemungkinan hanya fitur utama yang akan ditambahkan.

---

# BAB 3: Spesifikasi Kebutuhan dan Proses Bisnis

## 3.1 Identifikasi Aktor

Buatlah daftar seluruh aktor (pengguna) yang akan berinteraksi langsung dengan sistem solusi yang kalian kembangkan. Berikan penjelasan singkat mengenai peran dan karakteristik dari masing-masing aktor tersebut.

| Aktor   | Deskripsi                                                                                                                                                                                                                         |
| :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operator | _Pengguna ini bertindak sebagai pihak yang bertanggung jawab untuk memvalidasi laporan dari ReportIt dan CleanIt. Karakteristik dari pengguna ini adalah mengutamakan kecepatan untuk memverifikasi laporan dalam jumlah yang banyak._ |
| Masyarakat | _Pengguna ini bertindak sebagai pihak yang melaporkan pencemaran (Pelapor) maupun beraksi membersihkan sampah (Relawan) di ekosistem laut dan sungai. Karakteristik dari pengguna ini adalah mengutamakan kemudahan pelaporan dan melihat lokasi._ |

## 3.2 Kebutuhan Pengguna Awal

Definisikan apa yang ingin dicapai oleh pengguna saat menggunakan sistem ini dalam format _User Story_ (Sebagai [Aktor], saya ingin [Aktivitas/Kebutuhan], sehingga [Tujuan/Nilai]). Pastikan kalian berfokus pada "apa yang ingin dilakukan pengguna".

| ID    | Aktor          | Kebutuhan / Aktivitas     | Tujuan / Nilai                                |
| :---- | :------------- | :------------------------ | :-------------------------------------------- |
| US-01 | _Operator_ | _Melihat laporan (foto/video) yang masuk dan menentukan valid/tidak_ | _Melakukan verifikasi dengan cepat_ |
| US-02 | _Masyarakat_ | _Mendaftar akun baru dan masuk ke dalam sistem_ | _Mengakses fitur ReportIt dan CleanIt_ |
| US-03 | _Masyarakat_ | _Mengupload foto/video serta menandai titik lokasi pencemaran (ReportIt)_ | _Lokasi tersebut dapat diverifikasi dan dijadikan bounty_ |
| US-04 | _Masyarakat_ | _Melihat daftar laporan lokasi pencemaran yang tersedia di sekitar lokasi (CleanIt)_ | _Mudah mencari dan menuju ke lokasi pencemaran_ |
| US-05 | _Masyarakat_ | _Mengupload foto/video setelah lokasi pencemaran dibersihkan (CleanIt)_ | _Memberikan bukti penyelesaian_ |

## 3.3 Model Proses Bisnis

Buatlah _Activity Diagram_ atau _Swimlane Diagram_ yang menunjukkan alur kerja proses bisnis dari sistem solusi. Diagram ini harus memvisualisasikan bagaimana alur operasional di dunia nyata berjalan lebih efisien dengan adanya interaksi antara aktor (yang didefinisikan pada poin 3.1) dan sistem perangkat lunak. Perhatikan notasi yang digunakan dalam pembuatannya.
<br>

<p align="center">
<img alt="Contoh Activity Diagram" src="./assets/diagram/diagram-act-1.avif" width="70%">
</p>
<p align="center">
<i>Gambar 1. Contoh Activity Diagram</i>
</p>

<br>

# Referensi

- Diagram UML: https://www.drawio.com/, https://staruml.io/
