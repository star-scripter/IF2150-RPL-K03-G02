import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { media } from "@/server/db/schema";
import * as MediaModel from "@/server/models/media";
import { DATABASE_TEST_AKTIF, buatLaporan, buatPengguna, kosongkanDatabase } from "./helpers/db";

describe.runIf(DATABASE_TEST_AKTIF)("model Media", () => {
  beforeEach(async () => {
    await kosongkanDatabase();
  });

  it("menandai hash hanya jika sudah tertaut ke laporan selain TIDAK_VALID", async () => {
    const masyarakat = await buatPengguna();
    const operator = await buatPengguna({ role: "OPERATOR" });
    const valid = await buatLaporan({
      jenis: "REPORTIT",
      idPengguna: masyarakat.id,
      status: "VALID",
      diverifikasiOleh: operator.id,
    });
    const ditolak = await buatLaporan({
      jenis: "REPORTIT",
      idPengguna: masyarakat.id,
      status: "TIDAK_VALID",
      diverifikasiOleh: operator.id,
    });
    const hashTerpakai = "a".repeat(64);
    const hashDitolak = "b".repeat(64);
    const hashBelumTertaut = "c".repeat(64);

    await db.insert(media).values([
      {
        idPengguna: masyarakat.id,
        laporanId: valid.idLaporan,
        storageKey: "test/media-valid",
        tipe: "FOTO",
        ukuranByte: 100,
        sha256: hashTerpakai,
      },
      {
        idPengguna: masyarakat.id,
        laporanId: ditolak.idLaporan,
        storageKey: "test/media-ditolak",
        tipe: "FOTO",
        ukuranByte: 100,
        sha256: hashDitolak,
      },
      {
        idPengguna: masyarakat.id,
        laporanId: null,
        storageKey: "test/media-belum-tertaut",
        tipe: "VIDEO",
        ukuranByte: 100,
        sha256: hashBelumTertaut,
      },
    ]);

    await expect(MediaModel.sudahDipakai(hashTerpakai)).resolves.toBe(true);
    await expect(MediaModel.sudahDipakai(hashDitolak)).resolves.toBe(false);
    await expect(MediaModel.sudahDipakai(hashBelumTertaut)).resolves.toBe(false);
    await expect(MediaModel.sudahDipakai("d".repeat(64))).resolves.toBe(false);
  });

  it("menyimpan storage key, hash, dan ukuran sambil membiarkan laporan_id NULL", async () => {
    const masyarakat = await buatPengguna();
    const input = {
      idPengguna: masyarakat.id,
      storageKey: "media/new-upload",
      tipe: "FOTO" as const,
      ukuranByte: 456,
      sha256: "e".repeat(64),
      createdAt: new Date("2026-11-09T10:05:00.000Z"),
    };

    const idMedia = await MediaModel.buatMedia(input);
    const [baris] = await db.select().from(media).where(eq(media.id, idMedia));

    expect(baris).toMatchObject({
      id: idMedia,
      idPengguna: masyarakat.id,
      laporanId: null,
      storageKey: input.storageKey,
      tipe: input.tipe,
      ukuranByte: input.ukuranByte,
      sha256: input.sha256,
      createdAt: input.createdAt,
    });
  });
});
