import { buatStateFormLaporan, type StateFormLaporan } from "@/lib/form-laporan";

/** Data fiktif dengan bukti yang sudah berhasil diunggah FE-11. */
export function formTerisi(cleanit = false): StateFormLaporan {
  return {
    ...buatStateFormLaporan({ konfigurasi: cleanit ? { jenis: "CLEANIT", lokasiId: 7, namaLokasi: "Teras Cikapundung" } : { jenis: "REPORTIT" } }),
    langkah: 2,
    informasi: { judul: " Sampah di tepi sungai ", lokasi: " Teras Cikapundung ", latitude: -6.885, longitude: 107.6065, waktu: "2026-01-01T09:30", sumber: "PENGAMATAN_PRIBADI", jenisSampah: "PLASTIK" },
    media: [21, 22].map((id) => ({ idLokal: `lokal-${id}`, berkas: new File(["bukti uji"], `bukti-${id}.png`, { type: "image/png" }), unggahan: { idMedia: id, tipe: "FOTO", url: `https://media.example.test/${id}.png` } })),
  };
}
