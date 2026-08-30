<h1>
IF2150 REKAYASA PERANGKAT LUNAK
<br>
TUGAS 1
<br>
TOPIC BRAINSTORMING
</h1>
<br>

## _Nama Perangkat Lunak_

### Untuk: _[Nama Asisten]_

Dipersiapkan oleh:
| Informasi | Keterangan |
| --- | --- |
| Kelas | _\[Kelas\]_ |
| Kelompok | _\[Nomor Kelompok\]_ |

| NIM       | Nama               |
| --------- | ------------------ |
| _[NIM 1]_ | _[Nama Anggota 1]_ |
| _[NIM 2]_ | _[Nama Anggota 2]_ |
| _[NIM 3]_ | _[Nama Anggota 3]_ |
| _[NIM 4]_ | _[Nama Anggota 4]_ |
| _[NIM 5]_ | _[Nama Anggota 5]_ |

---

<br>
<br>

# BAB 1: Analisis Permasalahan

## 1.1 Latar Belakang Masalah

Permasalahan utama yang diangkat dalam proyek perangkat lunak ini adalah masih tingginya tingkat pembuangan dan kebocoran sampah ke ekosistem perairan seperti laut dan sungai, serta belum optimalnya media pelaporan maupun insentif bagi masyarakat pinggir perairan untuk berpartisipasi aktif dalam penanggulangannya.

Indonesia sedang menghadapi krisis polusi laut yang sangat dahsyat. Berdasarkan laporan dari World Bank, Indonesia menghasilkan sekitar 7,8 juta ton sampah plastik setiap tahunnya, dan diperkirakan 346.000 ton di antaranya bocor dan mencemari ekosistem laut.

## 1.2 Analisis Kondisi Saat Ini

Lakukan analisis terhadap proses yang berjalan saat ini di dunia nyata, baik itu sistem lama ataupun solusi yang sudah ada. Soroti kesenjangan atau celah dari kondisi tersebut yang nantinya akan diselesaikan oleh perangkat lunak kalian.

---

# BAB 2: Analisis Solusi

## 2.1 Deskripsi Perangkat Lunak

<italic>Blm tau nama softwarenya apa &trade;</italic> adalah perangkat lunak berbasis <italic>crowdsourcing</italic> yang menyediakan sarana bagi publik untuk berkontribusi dalam upaya pelestarian lingkungan laut melalui pembersihan laut dari sampah-sampah domestik. Dalam implementasinya, perangkat lunak ini menggunakan metode gamifikasi yang kolaboratif sebagai bentuk dorongan komunal dalam usaha memajukan progres SDG ke-14.
Sebelum mendapatkan akses terhadap fitur-fitur di perangkat lunak, pengguna dapat melakukan registrasi serta <italic>log in</italic> menggunakan kredensial akunnya. Terdapat dua fitur utama dalam perangkat lunak ini: 1) laporan pembersihan sampah secara langsung (sementara disebut CleanIt), dan 2) laporan daerah penuh sampah (sementara disebut ReportIt). CleanIt merupakan fitur yang memungkinkan pengguna untuk melaporkan kontribusi langsungnya dalam membersihkan laut. Kontribusi tersebut dapat dikonfirmasi dengan mengunggah bukti, seperti foto atau video yang kemudian ditinjau oleh operator. Setelah hasil CleanIt-nya dinyatakan valid oleh operator, pengguna memperoleh poin untuk akunnya. ReportIt merupakan sarana bagi pengguna untuk melaporkan daerah lautan yang terkontaminasi sampah tanpa harus membersihkan secara langsung daerah tersebut. Pelaporan tersebut bersifat seperti <italic>bounty</italic> yang dapat diambil oleh pengguna lainnya untuk mendapatkan poin.

## 2.2 Asumsi dan Batasan

Definisikan secara tegas asumsi (baik teknis maupun dari sisi pengguna) yang menjadi dasar pengembangan. Tuliskan batasan seperti regulasi/hukum, keterbatasan sumber daya, dan ruang lingkup solusi.

---

# BAB 3: Spesifikasi Kebutuhan dan Proses Bisnis

## 3.1 Identifikasi Aktor

Buatlah daftar seluruh aktor (pengguna) yang akan berinteraksi langsung dengan sistem solusi yang kalian kembangkan. Berikan penjelasan singkat mengenai peran dan karakteristik dari masing-masing aktor tersebut.

| Aktor   | Deskripsi                                                                                                                                                                                                                         |
| :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operator | _Pengguna ini bertindak sebagai pihak yang bertanggung jawab untuk memvalidasi laporan dari ReportIt dan CleanIt. Karakteristik dari pengguna ini adalah mengutamakan kecepatan untuk memverifikasi laporan dalam jumlah yang banyak._ |
| Masyarakat (Pelapor) | _Pengguna ini bertindak sebagai pihak yang melaporkan pencemaran di ekosistem laut dan sungai. Karakteristik dari pengguna ini adalah mengutamakan kemudahan pelaporan._ |
| Masyarakat (Relawan) | _Pengguna ini bertindak sebagai pihak yang beraksi di lokasi pencemaran untuk membersihkan sampah tersebut. Karakteristik dari pengguna ini adalah mengutamakan kemudahan melihat lokasi dan membuat laporan._ |

## 3.2 Kebutuhan Pengguna Awal

Definisikan apa yang ingin dicapai oleh pengguna saat menggunakan sistem ini dalam format _User Story_ (Sebagai [Aktor], saya ingin [Aktivitas/Kebutuhan], sehingga [Tujuan/Nilai]). Pastikan kalian berfokus pada "apa yang ingin dilakukan pengguna".

| ID    | Aktor          | Kebutuhan / Aktivitas     | Tujuan / Nilai                                |
| :---- | :------------- | :------------------------ | :-------------------------------------------- |
| US-01 | _Kasir_        | _Memindai barcode barang_ | _Proses pembayaran berjalan cepat dan akurat_ |
| US-02 | _[Nama Aktor]_ | _[Kebutuhan pengguna]_    | _[Tujuan yang dicapai pengguna]_              |
| ...   | ...            | ...                       | ...                                           |

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
