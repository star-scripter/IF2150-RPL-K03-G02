ALTER TABLE "lokasi" DROP CONSTRAINT "lokasi_poin_check";--> statement-breakpoint
ALTER TABLE "lokasi" ALTER COLUMN "poin" SET DEFAULT 50;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "sha256" char(64) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "laporan_cleanit_menunggu_uidx" ON "laporan" USING btree ("id_pengguna","lokasi_id") WHERE "laporan"."jenis" = 'CLEANIT' AND "laporan"."status" = 'BELUM_DIPERIKSA';--> statement-breakpoint
CREATE INDEX "media_sha256_idx" ON "media" USING btree ("sha256");--> statement-breakpoint
ALTER TABLE "lokasi" ADD CONSTRAINT "lokasi_poin_check" CHECK ("lokasi"."poin" IN (50, 100, 200));