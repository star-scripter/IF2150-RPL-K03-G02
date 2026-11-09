# Mock API (MSW)

Mock untuk seluruh endpoint di kontrak (FE-04), supaya FE bisa dikerjakan sebelum BE siap.
Mock memakai [MSW](https://mswjs.io): request `fetch("/api/...")` dicegat di browser dan dijawab
sesuai kontrak. Kode halaman tidak perlu diubah saat pindah ke BE sungguhan.

## Menyalakan di browser

1. Buat `src/so-clean/.env.local` (sudah di-ignore git) berisi:

   ```
   NEXT_PUBLIC_API_MOCKING=enabled
   ```

2. Jalankan ulang dev server (`docker compose restart web` dari folder `src/`).
3. Di console browser akan muncul `[MSW] Mocking enabled.`

Hapus baris itu (atau ubah nilainya) untuk kembali memakai BE sungguhan. Mock tidak pernah aktif
di build production.

## Akun uji

Semua password: `password123`.

| Email | Role | Catatan |
| --- | --- | --- |
| `masyarakat@soclean.test` | Masyarakat | Saldo 67, punya notifikasi belum dibaca |
| `rina@soclean.test` | Masyarakat | Saldo 250 |
| `operator@soclean.test` | Operator | Untuk halaman validasi (I-07, I-08) |

Data mock disimpan di memori, jadi kembali ke kondisi awal setiap halaman dimuat ulang. Sesi login
disimpan di sessionStorage agar tetap login setelah reload.

## Skenario yang bisa dicoba

- Login dengan password salah → `LOGIN_GAGAL`.
- Register dengan email yang sudah ada → `EMAIL_TERDAFTAR`; isian tidak valid → `FORMAT_TIDAK_VALID` + `fields`.
- Tukar "Tas Belanja Kain" → `STOK_HABIS`; tukar "Voucher Transportasi" dengan akun saldo 67 → `POIN_TIDAK_CUKUP`.
- ReportIt dengan koordinat di luar tiga wilayah K10 → `DI_LUAR_WILAYAH`.
- CleanIt untuk lokasi yang sudah DIBERSIHKAN (Pantai Barat Pangandaran) → `LOKASI_SUDAH_DIBERSIHKAN`.
- Operator membuka laporan #6 → `lokasiTerdekat` terisi (penggabungan K13).

## Struktur

| File | Isi |
| --- | --- |
| `db.ts` | Data awal fiktif dan sesi mock |
| `handlers/*.ts` | Handler per kelompok endpoint |
| `utils.ts` | Helper respons `{ data }` / `{ error }` dan cek role |
| `browser.ts` | Worker untuk browser |
| `worker.ts` | Stub untuk server; di browser di-alias ke `browser.ts` (lihat `next.config.ts`) |
| `node.ts` | Server MSW untuk test Vitest |

## Batasan

- `MEDIA_SUDAH_DIGUNAKAN` disederhanakan: media yang sudah tertaut ke laporan dianggap dipakai ulang (tanpa cek SHA-256).
- Register langsung login (asumsi agar FE-07 bisa lanjut ke Beranda).
- Alasan tolak CleanIt yang kosong dijawab `DATA_TIDAK_LENGKAP` dengan `fields.alasan`.
- Mock browser butuh Turbopack (`next dev` biasa / Docker), karena alias `@/mocks/worker` diatur di `turbopack.resolveAlias`.
- Jika handler diubah setelah `msw` di-upgrade, jalankan `npx msw init public` untuk memperbarui `public/mockServiceWorker.js`.
