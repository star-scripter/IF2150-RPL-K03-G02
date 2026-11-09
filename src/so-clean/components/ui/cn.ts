/** Gabungkan class Tailwind; nilai falsy dilewati. Pengganti kecil `clsx` (tanpa dependensi). */
export function cn(...kelas: Array<string | false | null | undefined>): string {
  return kelas.filter(Boolean).join(" ");
}
