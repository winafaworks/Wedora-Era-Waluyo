export type BookingStatus =
  | "belum_dikonfirmasi"
  | "dikonfirmasi"
  | "perlu_koreksi"
  | "dibatalkan";

export interface BookingSummary {
  id: string;
  namaPelanggan: string;
  noWa: string;
  tanggalAcara: string;
  paket: string;
  status: BookingStatus;
  nominalDp: number;
  dpDiterima: boolean;
}

export interface DashboardStats {
  totalBooking: number;
  acaraBulanIni: number;
  belumDikonfirmasi: number;
  acaraMendatang: number;
}
