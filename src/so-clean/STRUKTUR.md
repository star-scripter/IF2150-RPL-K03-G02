# Struktur Kode SoClean

Panduan singkat letak kode dan aturan antar-layer untuk semua anggota. Pembagian tugas, kontrak API, dan skema database lengkap mengacu pada [kontrak final v0.7](<../../docs/contracts/SoClean — Pembagian Tugas FE & BE v0.7.md>); v0.5 tanpa akhiran versi dan v0.6 adalah arsip.

## Pola MVC

Aplikasi memakai pola MVC di atas Next.js 16 (App Router). Alurnya:

```
Browser ──► app/(pages) + components/   (View)
               │  fetch("/api/...")
               ▼
            app/api/**/route.ts         (hanya meneruskan request)
               │
               ▼
            server/controllers/         (Controller)
               │
               ▼
            server/models/              (Model: operasi)
               │  memakai
               ▼
            server/db/schema/           (Model: atribut / bentuk tabel)
               │
               ▼
            server/db/index.ts  ──►  PostgreSQL
```

Sebelum halaman dirender, request yang cocok dengan `proxy.ts` dapat melewati **Proxy Next.js 16** untuk pemeriksaan sesi cepat dan redirect halaman. Proxy bukan bagian dari alur MVC dan bukan pengganti autentikasi/otorisasi di endpoint.

- **View → FE**, sedangkan **Controller + Model + Database → BE**.
- FE hanya berkomunikasi dengan BE lewat endpoint `/api/...` sesuai kontrak.

### Model = schema + model

Layer Model terdiri dari dua folder dengan nama file berpasangan. Satu kelas model DPPL diwujudkan oleh keduanya:

| | `server/db/schema/laporan.ts` | `server/models/laporan.ts` |
| --- | --- | --- |
| Isi | **Bentuk data**: kolom, tipe, constraint, index, relasi | **Perilaku**: fungsi yang membaca/mengubah data dan aturan bisnisnya |
| Padanan DPPL | Tabel *Atribut Kelas* (5.x.2) | Tabel *Operasi Kelas* (5.x.1) beserta algoritma/query |
| Contoh | `status: statusLaporanEnum(...)`, `CHECK (...)` | `ubah_status(idLaporan, status)`, `get_detail(idLaporan)` |
| Dipakai oleh | Model, dan `drizzle-kit` untuk membuat migrasi | Controller |
| Berubah ketika | Struktur tabel berubah (perlu migrasi baru) | Logika berubah (tanpa migrasi) |

Alasan dipisah, tidak digabung dalam satu file seperti model Laravel/Rails:

1. `drizzle-kit` memuat file schema tanpa menjalankan aplikasi. Jika tabel ditaruh di file model, `db:generate` ikut memuat import model, termasuk koneksi database.
2. Tabel laporan, lokasi, dan media saling merujuk. Import melingkar aman di file yang hanya berisi definisi tabel, tapi rawan di file model yang juga berisi fungsi.
3. Model dan tabel tidak selalu satu banding satu: model `laporan` membaca tabel `laporan`, `media`, dan `lokasi`; notifikasi tidak punya tabel (diturunkan dari `laporan`); kelas seperti `ManagerLaporan` adalah controller tanpa tabel.

Untuk tabel *traceability* B.5, tulis keduanya, misalnya C02 *Laporan* → `server/db/schema/laporan.ts` + `server/models/laporan.ts`.

## Folder

```
so-clean/
├── proxy.ts                  # Proxy Next.js 16: cek sesi cepat dan redirect halaman (BE-06)
├── app/
│   ├── (pages)/              # halaman FE: app/(pages)/<rute>/page.tsx
│   ├── api/                  # route handler BE: app/api/<rute>/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/               # komponen UI dan kelas view DPPL
│   └── _Template.tsx         # template view
├── server/                   # kode BE, tidak boleh di-import oleh view
│   ├── controllers/
│   │   └── _template.ts      # template controller
│   ├── models/
│   │   └── _template.ts      # template model
│   └── db/
│       ├── index.ts          # koneksi Drizzle + pg (dari POSTGRES_* di .env)
│       ├── schema/           # definisi tabel Drizzle, satu file per tabel
│       │   ├── index.ts      # menyatukan semua tabel (export *)
│       │   ├── enums.ts      # enum dan helper kolom bersama
│       │   └── <tabel>.ts    # pengguna, media, lokasi, laporan, reward, penukaran
│       └── migrations/       # file SQL hasil drizzle-kit (jangan diedit manual)
├── lib/                      # kode bersama FE–BE tanpa akses DB (mis. lib/wilayah.ts)
├── types/                    # tipe bersama FE–BE (types/api.ts, sesuai kontrak)
├── tests/                    # test (Vitest)
└── public/                   # aset statis
```

`(pages)` adalah *route group*: nama folder ini tidak muncul di URL. Jadi `app/(pages)/login/page.tsx` dapat diakses di `/login`.

`proxy.ts` berada di root proyek, sejajar dengan `app/` (bukan di dalam `app/` atau `server/`). Di Next.js 16 nama konvensi ini adalah `proxy.ts`; jangan membuat `middleware.ts`. Atur matcher agar Proxy menangani halaman yang perlu diarahkan berdasarkan sesi. Pemeriksaan sesi di Proxy hanya untuk navigasi/redirect yang cepat, bukan keputusan akses akhir.

## Tanggung jawab tiap layer

| Layer | Folder | Boleh | Tidak boleh |
| --- | --- | --- | --- |
| Proxy | `proxy.ts` | Pemeriksaan sesi cepat untuk redirect halaman sesuai BE-06 | Menjadi satu-satunya penjaga autentikasi/otorisasi; melakukan query DB |
| View | `app/(pages)/`, `components/` | Menampilkan data, menerima input, memanggil `/api/...` | Import apa pun dari `server/` |
| Route handler | `app/api/**/route.ts` | Mengambil `params`, menerapkan cek autentikasi/role sesuai akses endpoint, memanggil satu fungsi controller | Berisi logika bisnis atau query |
| Controller | `server/controllers/` | Validasi input, memanggil model, membuka batas transaksi dengan `db.transaction` dan meneruskan `tx` ke model, menyusun respons `{ data }` atau `{ error }` | Menulis query langsung (`db.select/insert/update/delete` atau SQL) |
| Model (operasi) | `server/models/` | Query lewat `db`, aturan milik satu entitas, memetakan kolom ke field kontrak | Membaca `Request` atau membuat `Response` (tidak tahu soal HTTP) |
| Model (atribut) | `server/db/schema/` | Definisi tabel: kolom, tipe, constraint, index, relasi | Berisi fungsi/query, atau import selain `drizzle-orm` dan file schema lain |
| DB | `server/db/index.ts`, `server/db/migrations/` | Koneksi database dan file migrasi hasil `drizzle-kit`; `db` boleh diimpor model untuk query dan controller hanya untuk membuka `db.transaction` | Diimpor oleh view atau kode bersama; controller menjalankan query langsung |
| Bersama | `lib/`, `types/` | Konstanta, tipe, dan fungsi murni yang dipakai FE dan BE | Import dari `server/` atau mengakses database |

**Pengecualian import DB:** controller boleh mengimpor `db` hanya sebagai koordinator transaksi (`db.transaction(...)`). Semua operasi baca/tulis di dalam transaksi tetap dilakukan melalui fungsi model dengan `tx` yang diteruskan. Controller tidak boleh memanggil query Drizzle atau SQL secara langsung.

## Konvensi penamaan

Nama file mengikuti kelas DPPL (M8) agar tabel *traceability* B.5 di laporan M9 mudah diisi. Tulis kode kelas DPPL di komentar atas setiap file (`Kelas DPPL: C02 - Laporan`).

| Jenis | Format nama file | Contoh |
| --- | --- | --- |
| Model (operasi) | kebab-case | `server/models/laporan.ts` (C02), `server/models/reward.ts` (C09) |
| Model (atribut / tabel) | sama dengan nama tabel, berpasangan dengan file model | `server/db/schema/laporan.ts` (C02), `server/db/schema/reward.ts` (C09) |
| Controller | kebab-case | `server/controllers/manager-laporan.ts` (C15), `server/controllers/penukaran.ts` (C16) |
| View / komponen | PascalCase | `components/DaftarLaporan.tsx` (C04), `components/DaftarReward.tsx` (C10) |
| Halaman | `page.tsx` di folder rute | `app/(pages)/reward/page.tsx` |
| Endpoint | `route.ts` di folder rute | `app/api/laporan/[id]/route.ts` (`GET /api/laporan/:id`, sesuai kontrak) |

Nama fungsi sebaiknya sama dengan nama method di DPPL, misalnya `getRewardTersedia()` dan `cariReward(idReward)`.

## Memakai template

File `_template` adalah contoh lengkap satu alur (Reward, UC08) dan tidak dipakai aplikasi. Untuk membuat fitur baru:

1. Jika tabelnya belum ada, buat `server/db/schema/<tabel>.ts` dan tambahkan `export *` di `server/db/schema/index.ts`.
2. Salin `server/models/_template.ts` → `server/models/<kelas>.ts`, lalu isi query-nya.
3. Salin `server/controllers/_template.ts` → `server/controllers/<kelas>.ts`, lalu isi validasi dan respons.
4. Buat `app/api/<rute>/route.ts` yang memanggil controller:

   ```ts
   // app/api/laporan/[id]/route.ts — GET /api/laporan/:id (kontrak v0.7)
   import { getDetailLaporan } from "@/server/controllers/manager-laporan";

   export async function GET(_req: Request, { params }: RouteContext<"/api/laporan/[id]">) {
     const { id } = await params; // di Next.js 16, params berupa Promise
     // Terapkan cek akses Operator sesuai BE-06.
     return getDetailLaporan(id);
   }
   ```

5. Salin `components/_Template.tsx` → `components/<NamaKomponen>.tsx`, lalu pakai di `app/(pages)/<rute>/page.tsx`.

## Format respons API

```jsonc
// sukses
{ "data": { ... } }
// sukses (list)
{ "data": [ ... ], "meta": { "page": 1, "limit": 6, "total": 20 } }
// gagal
{ "error": { "code": "NOT_FOUND", "message": "Reward tidak ditemukan.", "fields": { } } }
```

Daftar `code` dan status HTTP-nya ada di bagian "Kode error" pada dokumen kontrak. Nama field memakai camelCase, sedangkan nama kolom database memakai snake_case.

## Database dan migrasi

Skema ditulis di `server/db/schema/` (Drizzle), satu file per tabel dengan nama sama seperti file model (`schema/laporan.ts` ↔ `models/laporan.ts`), lalu disatukan di `schema/index.ts`. Skema mengikuti bagian "Skema database" pada kontrak. Migrasi SQL dibuat otomatis oleh `drizzle-kit` ke `server/db/migrations/`.

Perintah `db:*` dijalankan dari dalam container `web` (folder `src/`), karena kredensial database dibaca dari env yang diset docker compose:

```bash
docker compose up -d --build --renew-anon-volumes   # pertama kali / setelah package.json berubah
docker compose exec web npm run db:migrate          # menerapkan migrasi yang belum dijalankan
docker compose exec web npm run db:generate         # membuat file migrasi baru setelah skema diubah
```

Aturan:

- Mengubah skema = edit file di `server/db/schema/`, lalu `npm run db:generate`, lalu commit perubahan skema **bersama** file migrasi baru dan folder `meta/`.
- Relasi ke tabel di file lain memakai *callback*, mis. `.references((): AnyPgColumn => laporan.id)`, supaya import melingkar antar file (laporan ↔ lokasi) tetap aman.
- Jangan mengedit atau menghapus file migrasi yang sudah ada di `main`; buat migrasi baru.
- Perubahan skema juga mengubah kontrak, jadi perbarui bagian "Skema database" di kontrak dalam PR yang sama.
- Setelah menarik (`git pull`) perubahan yang berisi migrasi baru, jalankan `db:migrate` lagi.

## Catatan

- Import memakai alias `@/` yang mengarah ke root `so-clean/`, mis. `import { db } from "@/server/db"`.
- Next.js 16 punya banyak perubahan. Sebelum memakai API Next yang belum familiar, baca dokumentasinya di `node_modules/next/dist/docs/`.
- Setelah `package.json` berubah, jalankan ulang Docker dengan `docker compose up --build --renew-anon-volumes`.
