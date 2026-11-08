/**
 * Logika seed (BE-03). Dipisah dari `index.ts` supaya bisa diuji dengan database lain
 * (mis. PGlite di test) tanpa koneksi Postgres/RustFS sungguhan.
 *
 * Seed MENGHAPUS semua data (TRUNCATE) lalu mengisi ulang. Semua tulisan ke database berjalan
 * dalam satu transaksi; jika ada yang gagal, database kembali seperti sebelum seed.
 */
import { randomInt } from "node:crypto";
import { hash } from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { diDalamWilayah } from "@/lib/wilayah";
import * as schema from "../schema";
import { AKUN, CLEANIT, PASSWORD_UJI, PENUKARAN, REPORTIT, REWARD } from "./data";
import { buatGambar } from "./media";

export type DbSeed = PgDatabase<PgQueryResultHKT, typeof schema>;
/** Mengunggah satu objek ke storage S3 (RustFS/R2). */
export type Unggah = (key: string, isi: Buffer, contentType: string) => Promise<void>;

const JAM = 60 * 60 * 1000;
const HARI = 24 * JAM;

// ---------------------------------------------------------------------------
// Pemeriksaan data sebelum menulis apa pun
// ---------------------------------------------------------------------------

function jarakMeter(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function periksaData(): void {
  const akun = new Set(AKUN.map((a) => a.kunci));
  const reportIt = new Map(REPORTIT.map((r) => [r.kunci, r]));

  for (const r of REPORTIT) {
    if (!akun.has(r.pelapor)) throw new Error(`ReportIt ${r.kunci}: pelapor ${r.pelapor} tidak ada`);
    if (!diDalamWilayah(r.latitude, r.longitude)) {
      throw new Error(`ReportIt ${r.kunci}: koordinat di luar wilayah kerja sama (K10)`);
    }
    if ((r.status === "VALID") !== Boolean(r.lokasi)) {
      throw new Error(`ReportIt ${r.kunci}: hanya laporan VALID yang punya lokasi`);
    }
    if (r.status !== "BELUM_DIPERIKSA" && r.hariLalu < 2) {
      throw new Error(`ReportIt ${r.kunci}: laporan terverifikasi butuh hariLalu >= 2`);
    }
  }

  // K13: lokasi yang dibuat seed harus berjarak > 50 m satu sama lain.
  const valid = REPORTIT.filter((r) => r.lokasi);
  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      const a = valid[i];
      const b = valid[j];
      if (jarakMeter(a.latitude, a.longitude, b.latitude, b.longitude) <= 50) {
        throw new Error(`Lokasi ${a.kunci} dan ${b.kunci} berjarak <= 50 m (K13)`);
      }
    }
  }

  for (const c of CLEANIT) {
    const asal = reportIt.get(c.lokasiDari);
    if (!asal?.lokasi) throw new Error(`CleanIt ${c.kunci}: ${c.lokasiDari} bukan ReportIt VALID`);
    if (c.hariLalu >= asal.hariLalu) {
      throw new Error(`CleanIt ${c.kunci}: harus setelah laporan asal (Aturan CleanIt 3)`);
    }
    if (c.status === "TIDAK_VALID" && !c.alasanPenolakan) {
      throw new Error(`CleanIt ${c.kunci}: CleanIt ditolak wajib punya alasan`);
    }
  }
  const lokasiDibersihkan = CLEANIT.filter((c) => c.status === "VALID").map((c) => c.lokasiDari);
  if (new Set(lokasiDibersihkan).size !== lokasiDibersihkan.length) {
    throw new Error("Satu lokasi hanya boleh punya satu CleanIt VALID (K12)");
  }
}

function kodeVoucher(): string {
  const huruf = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa 0/O/1/I agar mudah dibaca
  const blok = () => Array.from({ length: 4 }, () => huruf[randomInt(huruf.length)]).join("");
  return `SC-${blok()}-${blok()}`;
}

// ---------------------------------------------------------------------------
// Media placeholder (dibuat dan diunggah sebelum transaksi database)
// ---------------------------------------------------------------------------

type MediaSiap = {
  kunciLaporan: string;
  pelapor: string;
  storageKey: string;
  sha256: string;
  ukuranByte: number;
  createdAt: Date;
};

async function siapkanMedia(sekarang: number, unggah: Unggah | undefined, log: (pesan: string) => void) {
  if (!unggah) {
    log("Media dilewati: storage tidak dikonfigurasi.");
    return [];
  }

  const daftar = [
    ...REPORTIT.map((r) => ({ ...r, jenisGambar: "sebelum" as const })),
    ...CLEANIT.map((c) => ({ ...c, jenisGambar: "sesudah" as const })),
  ];

  const hasil: MediaSiap[] = [];
  let nomor = 0;
  try {
    for (const lap of daftar) {
      const createdAt = new Date(sekarang - lap.hariLalu * HARI);
      for (let i = 1; i <= lap.jumlahMedia; i++) {
        nomor++;
        const gambar = await buatGambar(nomor, lap.judul, lap.jenisGambar, createdAt);
        const storageKey = `seed/${lap.kunci}-${i}.png`;
        await unggah(storageKey, gambar.isi, "image/png");
        hasil.push({
          kunciLaporan: lap.kunci,
          pelapor: lap.pelapor,
          storageKey,
          sha256: gambar.sha256,
          ukuranByte: gambar.ukuranByte,
          createdAt,
        });
      }
    }
  } catch (err) {
    log(`Media dilewati: gagal mengunggah ke storage (${(err as Error).message}).`);
    return [];
  }
  log(`${hasil.length} media placeholder diunggah.`);
  return hasil;
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

export async function seed(db: DbSeed, unggah?: Unggah, log: (pesan: string) => void = console.log) {
  periksaData();
  const sekarang = Date.now();
  const waktuLalu = (hariLalu: number) => new Date(sekarang - hariLalu * HARI);

  const media = await siapkanMedia(sekarang, unggah, log);
  const passwordHash = await hash(PASSWORD_UJI, 10);

  await db.transaction(async (tx) => {
    await tx.execute(
      sql`TRUNCATE TABLE penukaran, media, laporan, lokasi, reward, pengguna RESTART IDENTITY CASCADE`,
    );

    // --- Pengguna (saldo diisi di akhir) ---
    const idPengguna = new Map<string, string>();
    for (const a of AKUN) {
      const [baris] = await tx
        .insert(schema.pengguna)
        .values({
          nama: a.nama,
          email: a.email,
          passwordHash,
          role: a.role,
          notifikasiDilihatAt:
            a.notifikasiDilihatHariLalu === undefined ? null : waktuLalu(a.notifikasiDilihatHariLalu),
        })
        .returning({ id: schema.pengguna.id });
      idPengguna.set(a.kunci, baris.id);
    }
    const idOperator = idPengguna.get("operator")!;
    const saldo = new Map<string, number>(AKUN.map((a) => [a.kunci, 0]));

    // --- Reward (stok dikurangi penukaran) ---
    const idReward = new Map<string, { id: number; harga: number; nama: string }>();
    for (const r of REWARD) {
      const dipakai = PENUKARAN.filter((p) => p.reward === r.kunci).length;
      if (dipakai > r.stokAwal) throw new Error(`Reward ${r.kunci}: stok tidak cukup untuk penukaran seed`);
      const [baris] = await tx
        .insert(schema.reward)
        .values({
          nama: r.nama,
          jenis: r.jenis,
          deskripsi: r.deskripsi,
          hargaPoin: r.hargaPoin,
          stok: r.stokAwal - dipakai,
        })
        .returning({ id: schema.reward.id });
      idReward.set(r.kunci, { id: baris.id, harga: r.hargaPoin, nama: r.nama });
    }

    // --- ReportIt, lalu lokasi untuk yang VALID ---
    const idLaporan = new Map<string, number>();
    const idLokasi = new Map<string, number>(); // kunci ReportIt asal → id lokasi
    for (const r of REPORTIT) {
      const dibuat = waktuLalu(r.hariLalu);
      const diverifikasi = r.status === "BELUM_DIPERIKSA" ? null : new Date(dibuat.getTime() + HARI);
      const [baris] = await tx
        .insert(schema.laporan)
        .values({
          jenis: "REPORTIT",
          idPengguna: idPengguna.get(r.pelapor)!,
          judul: r.judul,
          waktuKejadian: new Date(dibuat.getTime() - 2 * JAM),
          lokasiTeks: r.lokasiTeks,
          latitude: r.latitude,
          longitude: r.longitude,
          sumber: r.sumber,
          jenisSampah: r.jenisSampah,
          status: r.status,
          alasanPenolakan: r.alasanPenolakan ?? null,
          diverifikasiOleh: diverifikasi ? idOperator : null,
          diverifikasiAt: diverifikasi,
          createdAt: dibuat,
        })
        .returning({ id: schema.laporan.id });
      idLaporan.set(r.kunci, baris.id);

      if (r.lokasi) {
        const [lok] = await tx
          .insert(schema.lokasi)
          .values({
            nama: r.lokasi.nama,
            alamat: r.lokasiTeks,
            latitude: r.latitude,
            longitude: r.longitude,
            jenisSampah: r.jenisSampah,
            poin: r.lokasi.poin,
            laporanAsalId: baris.id,
            createdAt: diverifikasi!,
          })
          .returning({ id: schema.lokasi.id });
        idLokasi.set(r.kunci, lok.id);
        await tx.update(schema.laporan).set({ lokasiId: lok.id }).where(eq(schema.laporan.id, baris.id));
      }
    }

    // --- CleanIt ---
    for (const c of CLEANIT) {
      const dibuat = waktuLalu(c.hariLalu);
      const diverifikasi = c.status === "BELUM_DIPERIKSA" ? null : new Date(dibuat.getTime() + 0.5 * HARI);
      const lokasiId = idLokasi.get(c.lokasiDari)!;
      const [baris] = await tx
        .insert(schema.laporan)
        .values({
          jenis: "CLEANIT",
          idPengguna: idPengguna.get(c.pelapor)!,
          judul: c.judul,
          waktuKejadian: new Date(dibuat.getTime() - 3 * JAM),
          lokasiId,
          status: c.status,
          alasanPenolakan: c.alasanPenolakan ?? null,
          diverifikasiOleh: diverifikasi ? idOperator : null,
          diverifikasiAt: diverifikasi,
          createdAt: dibuat,
        })
        .returning({ id: schema.laporan.id });
      idLaporan.set(c.kunci, baris.id);

      if (c.status === "VALID") {
        const [lok] = await tx
          .update(schema.lokasi)
          .set({ status: "DIBERSIHKAN" })
          .where(eq(schema.lokasi.id, lokasiId))
          .returning({ poin: schema.lokasi.poin });
        saldo.set(c.pelapor, saldo.get(c.pelapor)! + lok.poin);
      }
    }

    // --- Penukaran ---
    for (const p of PENUKARAN) {
      const reward = idReward.get(p.reward)!;
      saldo.set(p.pengguna, saldo.get(p.pengguna)! - reward.harga);
      await tx.insert(schema.penukaran).values({
        idPengguna: idPengguna.get(p.pengguna)!,
        idReward: reward.id,
        poinDipakai: reward.harga,
        kodeVoucher: kodeVoucher(),
        waktu: waktuLalu(p.hariLalu),
      });
    }

    // --- Saldo akhir (CHECK saldo_poin >= 0 menolak data yang tidak konsisten) ---
    for (const [kunci, nilai] of saldo) {
      await tx
        .update(schema.pengguna)
        .set({ saldoPoin: nilai })
        .where(eq(schema.pengguna.id, idPengguna.get(kunci)!));
    }

    // --- Media ---
    for (const m of media) {
      await tx.insert(schema.media).values({
        idPengguna: idPengguna.get(m.pelapor)!,
        laporanId: idLaporan.get(m.kunciLaporan)!,
        storageKey: m.storageKey,
        tipe: "FOTO",
        ukuranByte: m.ukuranByte,
        sha256: m.sha256,
        createdAt: m.createdAt,
      });
    }

    log(
      `Seed selesai: ${AKUN.length} akun, ${REWARD.length} reward, ` +
        `${REPORTIT.length} ReportIt, ${CLEANIT.length} CleanIt, ${idLokasi.size} lokasi, ` +
        `${PENUKARAN.length} penukaran, ${media.length} media.`,
    );
  });
}
