# Struktur Kode SoClean

Panduan singkat letak kode dan aturan antar-layer untuk semua anggota. Pembagian tugas, kontrak API, dan skema database lengkap ada di [`docs/contracts/SoClean — Pembagian Tugas FE & BE.md`](../../docs/contracts/).

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
            server/models/              (Model)
               │
               ▼
            server/db/  ──►  PostgreSQL
```

- **View → FE**, sedangkan **Controller + Model + Database → BE**.
- FE hanya berkomunikasi dengan BE lewat endpoint `/api/...` sesuai kontrak.

## Folder

```
so-clean/
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
│       └── schema.ts         # definisi tabel Drizzle
├── lib/                      # kode bersama FE–BE tanpa akses DB (mis. lib/wilayah.ts)
├── types/                    # tipe bersama FE–BE (types/api.ts, sesuai kontrak)
├── tests/                    # test (Vitest)
└── public/                   # aset statis
```

`(pages)` adalah *route group*: nama folder ini tidak muncul di URL. Jadi `app/(pages)/login/page.tsx` dapat diakses di `/login`.

## Tanggung jawab tiap layer

| Layer | Folder | Boleh | Tidak boleh |
| --- | --- | --- | --- |
| View | `app/(pages)/`, `components/` | Menampilkan data, menerima input, memanggil `/api/...` | Import apa pun dari `server/` |
| Route handler | `app/api/**/route.ts` | Mengambil `params`, memanggil satu fungsi controller | Berisi logika atau query |
| Controller | `server/controllers/` | Validasi input, cek role, memanggil model, membuka transaksi, menyusun respons `{ data }` atau `{ error }` | Menulis query database langsung |
| Model | `server/models/` | Query lewat `db`, aturan milik satu entitas, memetakan kolom ke field kontrak | Membaca `Request` atau membuat `Response` (tidak tahu soal HTTP) |
| DB | `server/db/` | Koneksi dan skema | Di-import dari luar `server/models/` |
| Bersama | `lib/`, `types/` | Konstanta, tipe, dan fungsi murni yang dipakai FE dan BE | Import dari `server/` atau mengakses database |

## Konvensi penamaan

Nama file mengikuti kelas DPPL (M8) agar tabel *traceability* B.5 di laporan M9 mudah diisi. Tulis kode kelas DPPL di komentar atas setiap file (`Kelas DPPL: C02 - Laporan`).

| Jenis | Format nama file | Contoh |
| --- | --- | --- |
| Model | kebab-case | `server/models/laporan.ts` (C02), `server/models/reward.ts` (C09) |
| Controller | kebab-case | `server/controllers/manager-laporan.ts` (C15), `server/controllers/penukaran.ts` (C16) |
| View / komponen | PascalCase | `components/DaftarLaporan.tsx` (C04), `components/DaftarReward.tsx` (C10) |
| Halaman | `page.tsx` di folder rute | `app/(pages)/reward/page.tsx` |
| Endpoint | `route.ts` di folder rute | `app/api/reward/[id]/route.ts` |

Nama fungsi sebaiknya sama dengan nama method di DPPL, misalnya `getRewardTersedia()` dan `cariReward(idReward)`.

## Memakai template

File `_template` adalah contoh lengkap satu alur (Reward, UC08) dan tidak dipakai aplikasi. Untuk membuat fitur baru:

1. Tambahkan tabel di `server/db/schema.ts` jika belum ada.
2. Salin `server/models/_template.ts` → `server/models/<kelas>.ts`, lalu isi query-nya.
3. Salin `server/controllers/_template.ts` → `server/controllers/<kelas>.ts`, lalu isi validasi dan respons.
4. Buat `app/api/<rute>/route.ts` yang memanggil controller:

   ```ts
   // app/api/reward/[id]/route.ts
   import { getDetailReward } from "@/server/controllers/reward";

   export async function GET(_req: Request, { params }: RouteContext<"/api/reward/[id]">) {
     const { id } = await params; // di Next.js 16, params berupa Promise
     return getDetailReward(id);
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

## Catatan

- Import memakai alias `@/` yang mengarah ke root `so-clean/`, mis. `import { db } from "@/server/db"`.
- Next.js 16 punya banyak perubahan. Sebelum memakai API Next yang belum familiar, baca dokumentasinya di `node_modules/next/dist/docs/`.
- Setelah `package.json` berubah, jalankan ulang Docker dengan `docker compose up --build --renew-anon-volumes`.
