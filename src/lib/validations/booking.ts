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
  jamAkad: z.string().optional().nullable(),
  jamAdat: z.string().optional().nullable(),
  jamResepsi: z.string().optional().nullable(),
  lokasiMakeup: z.string().optional().nullable(),
  packageId: z.string().optional().nullable(),
  kebayaBaju: z.string().optional().nullable(),
  ukuran: z.string().optional().nullable(),
  dekorasi: z.string().optional().nullable(),
  mc: z.string().optional().nullable(),
  makeup: z.string().optional().nullable(),
  fotografer: z.string().optional().nullable(),
  video: z.string().optional().nullable(),
  hiburan: z.string().optional().nullable(),
  catatanKhusus: z.string().optional().nullable(),
  totalBiaya: z.coerce.number().min(0).default(0),
  nominalDp: z.coerce.number().min(0, "Nominal DP tidak boleh negatif"),
  sisaPembayaran: z.coerce.number().default(0),
  dpDiterima: z.boolean().default(true),
  itemsMua: z.any().optional().nullable(),
  itemsDekorasi: z.any().optional().nullable(),
  itemsAdat: z.any().optional().nullable(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
