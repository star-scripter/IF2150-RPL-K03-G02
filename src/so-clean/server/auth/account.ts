import { z } from "zod";

/** Email dinormalisasi sebelum validasi keunikan dan login (N7). */
export function normalisasiEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalisasiNama(nama: string): string {
  return nama.trim();
}

const emailSchema = z
  .string()
  .transform(normalisasiEmail)
  .pipe(z.email().max(255, "Email maksimal 255 karakter."));

const namaSchema = z
  .string()
  .transform(normalisasiNama)
  .pipe(z.string().min(1, "Nama wajib diisi.").max(100, "Nama maksimal 100 karakter."));

const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .max(72, "Password maksimal 72 karakter.");

/** Validasi dan normalisasi payload register; role tidak boleh berasal dari klien. */
export const registerSchema = z
  .object({
    nama: namaSchema,
    email: emailSchema,
    password: passwordSchema,
  })
  .superRefine((data, context) => {
    if (data.password === data.email) {
      context.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password tidak boleh sama dengan email.",
      });
    }
  });

/** Login menormalisasi email; kredensial yang tidak cocok tetap ditolak secara generik. */
export const loginSchema = z.object({
  email: z.string().transform(normalisasiEmail),
  password: z.string(),
});

export type RegisterInput = z.output<typeof registerSchema>;
export type LoginInput = z.output<typeof loginSchema>;
