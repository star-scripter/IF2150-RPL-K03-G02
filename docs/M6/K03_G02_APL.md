<h1>
IF2150 REKAYASA PERANGKAT LUNAK
<br>
TUGAS 6
<br>
ARSITEKTUR PERANGKAT LUNAK (APL)
</h1>
<br>

## *SoClean*

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

<br>
<br>

# BAB 1: Style/Pattern Arsitektur Acuan

<!--Pada bagian ini, tentukan *architectural style* atau *pattern* yang menjadi acuan untuk aplikasi yang Anda kembangkan. Misalnya *layered architecture*, *client-server*, *repository*, *pipe and filter architecture*, atau MVC (*Model-View-Controller*).-->

<p align="center">

```mermaid
flowchart TD
    %% Definisi komponen Controller
    C["<div style='text-align: left;'><b>CONTROLLER</b><hr/>Laporan<br/>ValidatorLaporan<br/>ManagerPoin<br/>Penukaran</div>"]
    
    %% Definisi komponen View
    V["<div style='text-align: left;'><b>VIEW</b><hr/>FormLaporan<br/>Laporan<br/>DaftarLaporan<br/>DaftarLokasi<br/>HalamanPenukaran<br/>DaftarReward</div>"]
    
    %% Definisi komponen Model
    M["<div style='text-align: left;'><b>MODEL</b><hr/>Laporan<br/>Lokasi<br/>Media<br/>Pengguna<br/>Reward<br/>Penukaran</div>"]
    
    %% Definisi Penyimpanan dan Integrasi Eksternal
    DB[("<b>Database</b><br/>(PostgreSQL)")]
    SA(["<b>StorageAdapter</b><br/>(Cloudflare R2)"])

    %% Relasi antar komponen berdasarkan referensi arsitektur MVC
    C -->|"Update"| V
    V -->|"User events"| C
    
    C -->|"Update request"| M
    M -->|"State query"| V
    
    M -->|"Data access"| DB
    M -->|"Upload/Fetch files"| SA

    %% Styling untuk menyamakan dengan visual kotak hitam-putih
    classDef mvcBox fill:#ffffff,stroke:#000000,stroke-width:1px,color:#000000;
    class C,V,M mvcBox;
```

</p>
<p align="center">
<i>Gambar 1. Arsitektur MVC</i>
</p>

<!--1. **Style/pattern yang dipilih** beserta penjelasan singkat peran setiap bagiannya. Untuk MVC, jelaskan peran *Model*, *View*, dan *Controller*.-->
<!--2. **Alasan pemilihan** berdasarkan karakteristik P/L Anda, misalnya jenis pengguna, alur proses bisnis, serta KF dan KNF pada dokumen SKPL.-->
<!--3. **Gambar style/pattern yang diterapkan pada P/L Anda.** Jangan hanya menyalin Gambar 1. Isi setiap bagian pattern dengan komponen milik P/L Anda. Misalnya, kotak *Controller* berisi daftar *controller* yang ada di aplikasi dan kotak *Model* berisi daftar *model* yang ada di aplikasi.-->
Style/pattern arsitektur yang digunakan dalam pengembangan P/L SoClean adalah MVC (Model-View-Controller). Model berperan sebagai pendefinisi struktur data dan logika bisnis. View berperan sebagai media penyajian informasi kepada pengguna. Controller berperan sebagai handler logic utama yang mengkoordinasi interaksi antar model dan view.

SoClean menggunakan style/pattern MVC dengan tujuan utama agar arsitektur mengutamakan simplisitas dan modularitas fitur-fitur yang dimiliki oleh P/L ini. Proses bisnis relatif sederhana sehingga pola yang dapat diabstraksikan menggunakan pemodelan MVC. Sebagai contoh, ketika pengguna membuat laporan (model) melalui request interface (view), operator dapat memverifikasi laporan dengan luaran sistem menolak atau menerima dan menyimpan status laporan ke dalam daftar lokasi (controller). KF dalam P/L ini juga dapat dipetakan dan digeneralisasi menjadi sebuah operasi yang melibatkan komponen-komponen MVC, sebagai contoh KF02, KF11, KF04, dll. (model); KF01, KF05, KF08, dll. (view); KF03, KF10, KF13, dll. (controller). Pemisahan berdasarkan MVC juga mendukung KNF yang ada, misalnya dari segi performa dan kemudahan maintenance. Modularitas struktural yang direncanakan juga membuat proses pengembangan lebih efisien karena pembagian kerja yang relatif lebih independen. Sebagai contoh dari efisiensi alur kerja proses dengan MVC, salah satu pengembang dapat mengerjakan bagian A (misal komponen view) sedangkan pengembang lain dapat mengerjakan fitur B (misal controller) secara bersamaan.

Selain *style/pattern*, tuliskan juga lingkungan operasi P/L. Tabel berikut **disalin dari subbab 2.5 *Lingkungan Operasi Perangkat Lunak* pada dokumen SKPL** tanpa perubahan. Setelah tabel, jelaskan kaitan teknologi yang dipakai dengan *style/pattern* yang dipilih. Contohnya, Django (Python) secara bawaan mengikuti pola MVT (*Model-View-Template*), yaitu varian dari MVC.

Tabel 1.1. Lingkungan Operasi Perangkat Lunak

| Komponen | Spesifikasi |
| :--- | :--- |
| *Server* | *Next.js 16, dijalankan di docker (bisa local maupun cloud)* |
| *Client* | *Web Browser modern (Chrome, Firefox) pada desktop maupun mobile* |
| *DBMS* | *PostgreSQL 18* |
| *Object Storage* | *S3 based seperti Cloudflare R2* |
| *OS* | *Cross-platform dapat dijalankan di Windows, Linux, dan Android (melalui browser)* |
| *Hardware* | *Perangkat pengguna yang dilengkapi dengan kamera dan GPS untuk melakukan pelaporan* |

---
<sub><b><i>Catatan</i></b>: <i>Style/pattern yang dipilih di bab ini menjadi acuan untuk BAB 2 (pengelompokan komponen) dan BAB 3 (model arsitektur). Contoh pada dokumen ini memakai MVC secara konsisten dari BAB 1 sampai BAB 3. Kelompok boleh memakai pattern lain selama alasannya dijelaskan dan BAB 2 serta BAB 3 disesuaikan. Tabel 1.1 harus sama persis dengan subbab 2.5 dokumen SKPL; jangan menambah atau mengubah isinya karena SKPL sudah final.</i></sub>

---

# BAB 2: Identifikasi Komponen / Modul / Subsistem

Pada bagian ini, lakukan identifikasi terhadap komponen, modul, atau subsistem yang menyusun aplikasi berdasarkan *pattern* arsitektur yang telah ditetapkan sebelumnya. Setiap komponen memiliki tanggung jawab tertentu dalam mendukung fungsionalitas sistem.

Setiap komponen memiliki tanggung jawab tertentu dalam mendukung fungsionalitas sistem secara keseluruhan. Komponen dapat dikelompokkan berdasarkan lapisan arsitektur (misalnya *Model*, *View*, dan *Controller* pada pattern MVC), atau berdasarkan fungsi atau peran komponen di dalam sistem (misalnya modul autentikasi, manajemen data, dan integrasi eksternal).

Tabel 2.1. Identifikasi Komponen/Modul/Subsistem

| Nama Komponen/Modul/Subsistem | Jenis                 | Penjelasan                                                                                                           |
| :---------------------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------- |
| *FormLaporan* | *View* | *Menampilkan form pembuatan laporan dan meneruskannya dalam bentuk Laporan ke ValidatorLaporan* |
| *Laporan* | *View* | *Menampilakan informasi dalam suatu laporan yang sudah dibuat pada FormLaporan* |
| *DaftarLaporan* | *View*| *Menampilakan daftar laporan yang sudah dibuat pada FormLaporan* |
| *DaftarLokasi* | *View* | *Menampilkan daftar lokasi yang diambil dari laporan yang sudah dibuat* |
| *HalamanPenukaran* | *View* | *Menampilakn halaman penukaran yang berisi DaftarReward dan jumlah poin serta meneruskan aksi pengguna (seperti menukar poin dengan reward) ke ManagerPoin dan Penukaran* |
| *DaftarReward* | *View* | *Menampilkan daftar reward yang tersedia untuk ditukarkan dengan poin* |
| *Laporan* | *Controller* | *Memproses status validasi suatu laporan pada DaftarLaporan* |
| *ValidatorLaporan* | *Controller* | *Memproses permintaan validasi laporan yang berada pada DaftarLaporan* |
| *ManagerPoin* | *Controller* | *Memproses perubahan jumlah poin yang dimiliki pengguna* |
| *Penukaran* | *Controller* | *Memproses permintaan penukaran poin dengan reward* |
| Nama Komponen/Modul/Subsistem | Jenis | Penjelasan |
| *Laporan* | *Model* | *Mendefinisikan struktur data dan informasi utama suatu laporan, termasuk data laporan dan status validasinya.* |
| *Lokasi* | *Model* | *Mendefinisikan struktur data lokasi yang berkaitan dengan suatu laporan dan digunakan untuk membentuk daftar lokasi.* |
| *Media* | *Model* | *Mendefinisikan struktur data media yang digunakan sebagai bukti pendukung laporan, seperti foto atau video.* |
| *Pengguna* | *Model* | *Mendefinisikan struktur data pengguna dan informasi yang berkaitan dengan pengguna dalam sistem.* |
| *Reward* | *Model* | *Mendefinisikan struktur data reward yang tersedia untuk ditukarkan menggunakan poin.* |
| *Penukaran* | *Model* | *Mendefinisikan struktur data transaksi penukaran poin pengguna dengan reward.* |
| *Database* | *Pendukung* | *Menyediakan penyimpanan data persisten bagi komponen model dan menggunakan PostgreSQL sebagai DBMS.* |
| *Storage* | *Pendukung* | *Menyediakan abstraksi akses object storage untuk melakukan proses upload file.* |
| *...*                         | *...*                 | *...*                                                                                                                |

Ketentuan pengisian Tabel 2.1:
1. Kolom **Jenis** mengikuti pengelompokan pada *style/pattern* di BAB 1. Untuk MVC, jenisnya adalah *Model*, *View*, dan *Controller*. Jenis lain boleh ditambahkan, misalnya *Pendukung* untuk komponen bantu yang dipakai bersama, atau *Integrasi Eksternal* untuk penghubung ke sistem di luar P/L yang disebutkan pada subbab 2.2 dokumen SKPL. Kolom ini juga boleh diisi dengan *Subsistem*, *Modul*, atau *Komponen* apabila komponen dikelompokkan berdasarkan fungsinya. Tuliskan subsistem terlebih dahulu, lalu komponen penyusunnya di baris-baris berikutnya.
2. Komponen **tidak sama dengan** kelas. Satu komponen boleh mewadahi beberapa kelas dari diagram kelas pada dokumen SKPL. Pastikan seluruh kelas tercakup oleh setidaknya satu komponen.
3. Pastikan seluruh use case pada dokumen SKPL dapat dijalankan oleh komponen-komponen yang didaftarkan di tabel ini. Jangan menambahkan komponen untuk fitur yang tidak ada di SKPL.

<sub><b><i>Catatan</i></b>: <i>Nama komponen pada Tabel 2.1 harus dipakai sama persis pada gambar di BAB 1 dan setiap view di BAB 3. Jika saat membuat view ternyata dibutuhkan komponen baru, tambahkan komponen tersebut ke Tabel 2.1 terlebih dahulu.</i></sub>

---

# BAB 3: Model Arsitektur Perangkat Lunak

*Architectural View* adalah bagaimana cara kita melihat/mendeskripsikan arsitektur sebuah sistem dari sudut pandang tertentu. Dalam perancangan arsitektur aplikasi, dibutuhkan *Architectural View* yang dapat mempermudah pemahaman dari proses aplikasi yang akan dikembangkan. Tujuan dari *Architectural View* adalah menjadi bahan komunikasi, pemisahan masalah, mempermudah analisis, dan pemandu saat eksekusi pengembangan sistem tersebut.

Buatlah model arsitektur dari aplikasi yang akan dirancang dalam bentuk *view*. Model arsitektur ini berfungsi untuk memperlihatkan bagaimana setiap komponen, modul, dan subsistem saling berinteraksi serta berkolaborasi dalam menjalankan fungsi utama sistem secara keseluruhan. Anda dapat membuat satu atau lebih *view* tergantung kebutuhan dalam bentuk gambar. Pilihlah notasi yang sesuai. Contoh *view* yang dapat digunakan antara lain ***Logical View***, ***Process View***, ***Development View***, serta ***Physical View***.

Ketentuan pengisian BAB 3:
1. Setiap view menggambarkan **keseluruhan sistem**, bukan satu use case atau satu fitur saja.
2. Buat **minimal satu view**. Setiap view dituliskan dalam subbab tersendiri (3.1, 3.2, dan seterusnya). Tidak perlu membuat keempat view, pilih yang paling membantu menjelaskan P/L Anda, lalu jelaskan alasan pemilihannya.
3. Setiap view harus **konsisten dengan BAB 2**. Seluruh komponen pada Tabel 2.1 harus muncul dengan nama yang sama, dan tidak boleh ada komponen pada view yang tidak terdaftar di Tabel 2.1.
4. Setiap view harus **mencerminkan style/pattern pada BAB 1**. Misalnya, jika memilih MVC, pembagian *Model*, *View*, dan *Controller* harus terlihat jelas pada diagram.
5. Jika membuat lebih dari satu view, setiap view harus menggambarkan sistem yang sama dari sudut pandang berbeda. View tambahan melengkapi view pertama, bukan mengulanginya.
6. Beri label pada setiap garis atau panah yang menghubungkan komponen agar hubungan antarkomponen dapat dipahami tanpa penjelasan tambahan.
7. Jika membuat *Physical View*, gambarkan lingkungan operasi pada Tabel 1.1.

## 3.1 XXX View

Tuliskan secara singkat mengenai model arsitektur perangkat lunak yang Anda pilih dan sertakan alasan mengapa model arsitektur tersebut cocok untuk aplikasi Anda.

<p align="center">
<img alt="Contoh Logical View pada P/L E-Commerce" src="./assets/diagram/contoh-logical-view.webp" width="100%">
</p>
<p align="center">
<i>Gambar 2. Contoh Logical View pada P/L E-Commerce</i>
</p>

Gambar 2 adalah contoh *Logical View* dalam bentuk *block diagram*. Seluruh komponen pada Tabel 2.1 digambarkan dan dikelompokkan sesuai pola MVC (*View*, *Controller*, *Model*), ditambah komponen pendukung dan basis data. Sistem di luar P/L, seperti *Payment Gateway (dummy)*, digambarkan dengan garis putus-putus dan tidak perlu dimasukkan ke Tabel 2.1. Setiap garis diberi label: "Memanggil" untuk *View* yang memanggil *Controller*, "akses" untuk *Controller* yang mengakses *Model*, serta agregasi dan komposisi untuk hubungan antar-*Model*.

<sub><b><i>Catatan</i></b>: <i>Ganti XXX dengan nama view yang dibuat, misalnya Logical View. Gambar 2 hanya contoh untuk P/L e-commerce, ganti dengan view milik kelompok Anda yang memuat seluruh komponen pada Tabel 2.1. Jenis view dan notasinya boleh berbeda dari contoh. Jika membuat view tambahan, lanjutkan pola 3.x ini (3.2, 3.3, dan seterusnya).</i></sub>

---

# Referensi

- Sommerville, I. (2016). *Software Engineering* (10th ed.). Pearson. Chapter 6: *Architectural Design*: [https://software-engineering-book.com/slides/](https://software-engineering-book.com/slides/)
- Diagram arsitektur: [https://www.drawio.com/](https://www.drawio.com/), [https://staruml.io/](https://staruml.io/)
