/**
 * Gabungkan class Tailwind; nilai falsy dilewati. Pengganti kecil `clsx` (tanpa dependensi).
 *
 * PENTING: `cn` hanya menyambung string, TIDAK menyelesaikan class yang bentrok seperti
 * `tailwind-merge`. Jika dua class mengatur properti yang sama (mis. `px-6` bawaan Button dan
 * `px-2` dari `className`), yang menang ditentukan urutan di CSS hasil Tailwind, bukan urutan
 * di string. Jadi untuk menimpa gaya bawaan komponen lewat `className`:
 *
 * - pakai prop komponen jika ada (mis. `lebarPenuh`, `ukuran`, `varian`), atau
 * - tambahkan penanda important `!` di akhir class (Tailwind 4), mis. `className="px-2!"`.
 *
 * Class yang tidak bentrok (mis. `mt-4`, `sm:max-w-[370px]`) aman ditambahkan biasa.
 */
export function cn(...kelas: Array<string | false | null | undefined>): string {
  return kelas.filter(Boolean).join(" ");
}
