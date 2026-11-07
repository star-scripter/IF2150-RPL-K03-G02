CREATE TYPE "public"."jenis_laporan" AS ENUM('REPORTIT', 'CLEANIT');--> statement-breakpoint
CREATE TYPE "public"."jenis_sampah" AS ENUM('PLASTIK', 'KEMASAN_STYROFOAM', 'RUMAH_TANGGA', 'ORGANIK', 'LAINNYA');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('MASYARAKAT', 'OPERATOR');--> statement-breakpoint
CREATE TYPE "public"."status_laporan" AS ENUM('BELUM_DIPERIKSA', 'VALID', 'TIDAK_VALID');--> statement-breakpoint
CREATE TYPE "public"."status_lokasi" AS ENUM('TERCEMAR', 'DIBERSIHKAN');--> statement-breakpoint
CREATE TYPE "public"."sumber" AS ENUM('PENGAMATAN_PRIBADI', 'INFO_WARGA', 'MEDIA_SOSIAL', 'LAINNYA');--> statement-breakpoint
CREATE TYPE "public"."tipe_media" AS ENUM('FOTO', 'VIDEO');--> statement-breakpoint
CREATE TABLE "laporan" (
	"id" serial PRIMARY KEY NOT NULL,
	"jenis" "jenis_laporan" NOT NULL,
	"id_pengguna" uuid NOT NULL,
	"judul" varchar(80) NOT NULL,
	"waktu_kejadian" timestamp with time zone NOT NULL,
	"lokasi_teks" varchar(255),
	"latitude" double precision,
	"longitude" double precision,
	"sumber" "sumber",
	"jenis_sampah" "jenis_sampah",
	"lokasi_id" integer,
	"status" "status_laporan" DEFAULT 'BELUM_DIPERIKSA' NOT NULL,
	"alasan_penolakan" text,
	"diverifikasi_oleh" uuid,
	"diverifikasi_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "laporan_field_per_jenis_check" CHECK (("laporan"."jenis" = 'REPORTIT'
            AND "laporan"."lokasi_teks" IS NOT NULL AND "laporan"."latitude" IS NOT NULL AND "laporan"."longitude" IS NOT NULL
            AND "laporan"."sumber" IS NOT NULL AND "laporan"."jenis_sampah" IS NOT NULL)
          OR ("laporan"."jenis" = 'CLEANIT'
            AND "laporan"."lokasi_id" IS NOT NULL
            AND "laporan"."lokasi_teks" IS NULL AND "laporan"."latitude" IS NULL AND "laporan"."longitude" IS NULL
            AND "laporan"."sumber" IS NULL AND "laporan"."jenis_sampah" IS NULL)),
	CONSTRAINT "laporan_verifikasi_check" CHECK (("laporan"."status" = 'BELUM_DIPERIKSA') = ("laporan"."diverifikasi_at" IS NULL)
          AND ("laporan"."status" = 'BELUM_DIPERIKSA') = ("laporan"."diverifikasi_oleh" IS NULL)),
	CONSTRAINT "laporan_alasan_cleanit_check" CHECK (NOT ("laporan"."jenis" = 'CLEANIT' AND "laporan"."status" = 'TIDAK_VALID' AND "laporan"."alasan_penolakan" IS NULL)),
	CONSTRAINT "laporan_koordinat_check" CHECK ("laporan"."latitude" BETWEEN -90 AND 90 AND "laporan"."longitude" BETWEEN -180 AND 180)
);
--> statement-breakpoint
CREATE TABLE "lokasi" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(100) NOT NULL,
	"alamat" varchar(255) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"jenis_sampah" "jenis_sampah" NOT NULL,
	"status" "status_lokasi" DEFAULT 'TERCEMAR' NOT NULL,
	"poin" integer NOT NULL,
	"laporan_asal_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lokasi_poin_check" CHECK ("lokasi"."poin" > 0),
	CONSTRAINT "lokasi_koordinat_check" CHECK ("lokasi"."latitude" BETWEEN -90 AND 90 AND "lokasi"."longitude" BETWEEN -180 AND 180)
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_pengguna" uuid NOT NULL,
	"laporan_id" integer,
	"storage_key" varchar(255) NOT NULL,
	"tipe" "tipe_media" NOT NULL,
	"ukuran_byte" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_storage_key_unique" UNIQUE("storage_key"),
	CONSTRAINT "media_ukuran_byte_check" CHECK ("media"."ukuran_byte" > 0)
);
--> statement-breakpoint
CREATE TABLE "pengguna" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'MASYARAKAT' NOT NULL,
	"saldo_poin" integer DEFAULT 0 NOT NULL,
	"notifikasi_dilihat_at" timestamp with time zone,
	CONSTRAINT "pengguna_email_unique" UNIQUE("email"),
	CONSTRAINT "pengguna_saldo_poin_check" CHECK ("pengguna"."saldo_poin" >= 0)
);
--> statement-breakpoint
CREATE TABLE "penukaran" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_pengguna" uuid NOT NULL,
	"id_reward" integer NOT NULL,
	"poin_dipakai" integer NOT NULL,
	"kode_voucher" varchar(32) NOT NULL,
	"waktu" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "penukaran_kode_voucher_unique" UNIQUE("kode_voucher"),
	CONSTRAINT "penukaran_poin_dipakai_check" CHECK ("penukaran"."poin_dipakai" > 0)
);
--> statement-breakpoint
CREATE TABLE "reward" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(100) NOT NULL,
	"jenis" varchar(50) NOT NULL,
	"deskripsi" text,
	"harga_poin" integer NOT NULL,
	"stok" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "reward_harga_poin_check" CHECK ("reward"."harga_poin" > 0),
	CONSTRAINT "reward_stok_check" CHECK ("reward"."stok" >= 0)
);
--> statement-breakpoint
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_id_pengguna_pengguna_id_fk" FOREIGN KEY ("id_pengguna") REFERENCES "public"."pengguna"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_lokasi_id_lokasi_id_fk" FOREIGN KEY ("lokasi_id") REFERENCES "public"."lokasi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_diverifikasi_oleh_pengguna_id_fk" FOREIGN KEY ("diverifikasi_oleh") REFERENCES "public"."pengguna"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lokasi" ADD CONSTRAINT "lokasi_laporan_asal_id_laporan_id_fk" FOREIGN KEY ("laporan_asal_id") REFERENCES "public"."laporan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_id_pengguna_pengguna_id_fk" FOREIGN KEY ("id_pengguna") REFERENCES "public"."pengguna"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_laporan_id_laporan_id_fk" FOREIGN KEY ("laporan_id") REFERENCES "public"."laporan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "penukaran" ADD CONSTRAINT "penukaran_id_pengguna_pengguna_id_fk" FOREIGN KEY ("id_pengguna") REFERENCES "public"."pengguna"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "penukaran" ADD CONSTRAINT "penukaran_id_reward_reward_id_fk" FOREIGN KEY ("id_reward") REFERENCES "public"."reward"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "laporan_antrean_idx" ON "laporan" USING btree ("jenis","status","created_at");--> statement-breakpoint
CREATE INDEX "laporan_notifikasi_idx" ON "laporan" USING btree ("id_pengguna","diverifikasi_at");--> statement-breakpoint
CREATE INDEX "laporan_lokasi_id_idx" ON "laporan" USING btree ("lokasi_id");--> statement-breakpoint
CREATE INDEX "lokasi_status_idx" ON "lokasi" USING btree ("status");--> statement-breakpoint
CREATE INDEX "media_laporan_id_idx" ON "media" USING btree ("laporan_id");--> statement-breakpoint
CREATE INDEX "penukaran_riwayat_idx" ON "penukaran" USING btree ("id_pengguna","waktu");