import { z } from "zod";

export const bookingSchema = z.object({
  namaPelanggan: z
    .string()
    .min(3, "Nama pelanggan minimal 3 karakter"),
  noWa: z
    .string()
    .min(9, "Nomor WhatsApp tidak valid (minimal 9 digit)"),
  tanggalAcara: z
    .string()
    .min(1, "Tanggal acara wajib dipilih"),
  lokasi: z
    .string()
    .min(3, "Lokasi acara wajib diisi"),
  packageId: z.string().optional().nullable(),
  kebayaBaju: z.string().optional(),
  ukuran: z.string().optional(),
  dekorasi: z.string().optional(),
  mc: z.string().optional(),
  makeup: z.string().optional(),
  fotografer: z.string().optional(),
  video: z.string().optional(),
  hiburan: z.string().optional(),
  catatanKhusus: z.string().optional(),
  nominalDp: z.coerce.number().min(0, "Nominal DP tidak boleh negatif"),
  dpDiterima: z.boolean().default(true),
});

export type BookingInput = z.infer<typeof bookingSchema>;
