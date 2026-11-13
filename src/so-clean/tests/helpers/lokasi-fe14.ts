import type { Lokasi } from "@/types/api";

/** Data fiktif: urutan waktu berbeda dengan jarak dari Teras Cikapundung. */
export const LOKASI_UJI_FE14: Lokasi[] = [
  { idLokasi: 31, nama: "Pantai Ancol", alamat: "Jakarta Utara", latitude: -6.12, longitude: 106.84, jenisSampah: "KEMASAN_STYROFOAM", status: "TERCEMAR", poin: 100, dilaporkanAt: "2026-11-11T12:00:00.000Z" },
  { idLokasi: 32, nama: "Teras Cikapundung", alamat: "Bandung", latitude: -6.885, longitude: 107.6065, jenisSampah: "PLASTIK", status: "TERCEMAR", poin: 50, dilaporkanAt: "2026-11-10T12:00:00.000Z" },
  { idLokasi: 33, nama: "Pantai Pangandaran", alamat: "Pangandaran", latitude: -7.7, longitude: 108.65, jenisSampah: "RUMAH_TANGGA", status: "TERCEMAR", poin: 200, dilaporkanAt: "2026-11-09T12:00:00.000Z" },
];
export const POSISI_UJI_FE14 = { latitude: -6.886, longitude: 107.6065 };
