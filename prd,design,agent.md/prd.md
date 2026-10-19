# PRD — WEDORA (Wedding Digital Management)

**Klien/Mitra:** Era Waluyo Purwokerto
**Versi:** 1.0
**Tanggal:** 19 Oktober 2026
**Sumber acuan:** Scope Management Plan WEDORA (4 Oktober 2026)
**Pemilik baseline:** Project Manager
**Persetujuan akhir:** Sponsor (Pemilik Era Waluyo)

---

## 1. Ringkasan Produk

WEDORA adalah website manajemen booking pernikahan dan acara untuk Era Waluyo. Saat ini pencatatan booking dilakukan manual di buku, sehingga rincian pesanan sulit dicari, barang sering tertinggal, tidak ada bukti kesepakatan dengan pelanggan, dan belum ada rekap pembayaran maupun acara.

WEDORA mendigitalkan proses itu melalui:

1. **Sisi Admin**: dashboard internal untuk 3 admin mengelola booking, katalog, checklist barang, dan rekap.
2. **Sisi Pelanggan**: satu halaman konfirmasi publik (tanpa login) yang dibuka lewat tautan dari WhatsApp.

WEDORA **tidak menggantikan** komunikasi WhatsApp. Pelanggan tetap menghubungi Era Waluyo lewat WhatsApp atau datang langsung, dan admin yang mencatat booking.

## 2. Tujuan dan Indikator Keberhasilan

| Tujuan | Indikator |
|---|---|
| Semua booking tercatat digital | 100% booking yang sudah DP tercatat di sistem |
| Rincian pesanan mudah dicari | Detail pesanan tampil benar sesuai input saat tanggal dipilih di kalender |
| Barang tidak tertinggal | Status dimuat/kembali tersimpan, jumlah barang belum kembali terlihat jelas |
| Ada bukti kesepakatan | Pelanggan dapat memeriksa dan mengonfirmasi; status berubah di sistem admin |
| Ada rekap acara dan pembayaran | Rekap bulanan, per paket, dan per status tersedia |
| Admin mampu mengoperasikan sistem | Setiap admin mencatat satu pesanan sampai konfirmasi tanpa bantuan |
| Performa baik | Halaman utama termuat < 3 detik |
| Kualitas | 95% skenario uji berhasil, 0 bug kritis, maksimal 1 bug mayor |

**Indikator kolaborasi (dari dokumen):** cacat kebutuhan < 2%, respons terhadap permintaan mitra < 24 jam, kepuasan mitra ≥ 90%.

## 3. Pengguna

| Peran | Deskripsi | Akses |
|---|---|---|
| **Admin** | 3 pegawai administrasi Era Waluyo. Terbiasa manual, adopsi teknologi rendah. | Login, seluruh fitur dashboard |
| **Pelanggan** | Calon pengantin/penyelenggara acara. | Tanpa akun; hanya membuka tautan konfirmasi |
| **Sponsor** | Pemilik Era Waluyo, pemberi persetujuan akhir. | Memakai sistem lewat akun admin bila perlu; sign-off deliverable |

**Prinsip UX:** karena admin terbiasa manual, antarmuka harus sederhana, label berbahasa Indonesia, alur pendek, dan minim istilah teknis.

## 4. Alur Kerja Utama

1. **Pelanggan menghubungi** Era Waluyo (WhatsApp/datang langsung), menanyakan harga dan paket.
2. **Admin mencatat booking** ke sistem setelah **DP diterima**. Tanggal baru dicatat setelah DP masuk.
3. **Admin mengirim tautan konfirmasi** lewat tombol WhatsApp (nomor dan pesan terisi otomatis, admin menekan kirim).
4. **Pelanggan mengonfirmasi** di halaman konfirmasi, atau menulis koreksi bila ada data keliru.
5. **Checklist hari acara**: tim menandai barang saat dimuat dan saat kembali setelah pembongkaran.
6. **Rekap & evaluasi** lewat dashboard dan rekap booking.

## 5. Ruang Lingkup

### 5.1 Dalam Lingkup (In Scope)

Mengikuti struktur WBS pada dokumen scope.

#### F1. Foundation & Desain Produk (WBS 1.1)
- 1.1.1 Analisis kebutuhan dan pemetaan alur layanan
- 1.1.2 Arsitektur informasi dan user flow (login → catat booking → konfirmasi pelanggan)
- 1.1.3 Desain UI hi-fidelity semua layar (nuansa cream, putih, gold)
- 1.1.4 Design system dan style guide (lihat `design.md`)

#### F2. Kalender & Data Booking (WBS 1.2)
- 1.2.1 **Kalender booking**: tampilan bulanan, tanggal yang terisi diberi penanda.
- 1.2.2 **Pengelolaan data booking**: tambah, ubah, hapus, cari.
- 1.2.3 **Detail pesanan per tanggal**: klik tanggal/baris untuk melihat rincian lengkap.

Setiap booking memuat: nama, nomor WhatsApp pelanggan, tanggal acara, lokasi, paket, kebaya/baju, ukuran, dekorasi, MC, makeup, fotografer, video, hiburan, dan catatan khusus. Status DP dicatat karena menjadi syarat sahnya booking.

#### F3. Katalog & Foto (WBS 1.3)
- 1.3.1 Katalog kebaya dan baju (dengan foto dan ukuran)
- 1.3.2 Katalog dekorasi dan layanan
- 1.3.3 Unggah dan tampilkan foto: foto tampil di detail pesanan dan halaman pelanggan

#### F4. Checklist Acara (WBS 1.4)
- 1.4.1 Daftar barang per acara (berdasarkan paket)
- 1.4.2 Penanda **dimuat** dan **kembali**; status tersimpan
- 1.4.3 Ringkasan kelengkapan barang, termasuk jumlah barang yang belum kembali

#### F5. Konfirmasi Pelanggan (WBS 1.5)
- 1.5.1 Halaman konfirmasi: rincian pesanan, foto, kolom koreksi, tombol konfirmasi
- 1.5.2 Tombol kirim tautan via WhatsApp (pesan terisi otomatis)
- 1.5.3 Catatan dan koreksi pelanggan, terlihat oleh admin

#### F6. Dashboard & Rekap (WBS 1.6)
- 1.6.1 Login admin dan hak akses
- 1.6.2 Dashboard ringkasan: Total Booking, Acara Bulan Ini, Belum Dikonfirmasi, Acara Mendatang, daftar Acara Terdekat
- 1.6.3 Rekap booking: bulanan, per paket, per status

#### F7. Arsitektur Teknis & Penyimpanan (WBS 1.7)
- 1.7.1 Struktur data dan penyimpanan
- 1.7.2 Domain dan hosting
- 1.7.3 Keamanan dan pencadangan data

#### F8. Assurance & Kualitas (WBS 1.8)
- 1.8.1 QA plan dan test case
- 1.8.2 User Acceptance Testing (UAT) dengan 20+ skenario
- 1.8.3 Peluncuran (deployment)

#### Non-produk (kerja proyek, bukan fitur aplikasi)
- **2.0 Konten & Operasional Mitra:** pengumpulan foto/ukuran busana, data paket dan dekorasi, daftar checklist, migrasi catatan manual ke sistem, pelatihan admin, panduan dan SOP, masa pendampingan, evaluasi satu bulan.
- **3.0 Manajemen Proyek & Dokumentasi:** perencanaan, risiko dan perubahan, anggaran, rapat kemajuan dan demo prototipe, dokumentasi, serah terima, laporan akhir, lesson learned.

### 5.2 Di Luar Lingkup (Out of Scope)

- Pembayaran online
- Aplikasi seluler (native)
- Integrasi akuntansi
- Pengelolaan kost
- Booking mandiri oleh pelanggan
- Landing page / halaman promosi publik dan katalog publik
- Pengiriman WhatsApp otomatis (API/bot); pengiriman tetap manual oleh admin lewat tautan *click-to-chat*
- Akun/login pelanggan

Semua penambahan di luar daftar ini adalah **Scope Change** dan wajib lewat Formal Change Control (lihat bagian 11).

## 6. Kebutuhan Fungsional Rinci

### 6.1 Autentikasi Admin
- Admin masuk dengan email dan kata sandi.
- Semua halaman admin dilindungi; akses tanpa login diarahkan ke halaman login.
- Tombol **Keluar** mengakhiri sesi.
- Hak akses: seluruh admin dapat mengelola data; peran Sponsor bersifat lihat saja bila diperlukan (ditetapkan saat desain 1.1.2).

### 6.2 Dashboard
- Empat kartu ringkasan: **Total Booking**, **Acara Bulan Ini**, **Belum Dikonfirmasi**, **Acara Mendatang**.
- Tabel **Acara Terdekat**: tanggal, nama pasangan/pelanggan, paket, badge status, tombol **Detail**.
- Tombol **+ Booking Baru** di pojok kanan atas.
- Navigasi samping: Dashboard, Kalender Booking, Data Booking, Katalog, Checklist Acara, Rekap Booking, Keluar.

### 6.3 Kalender Booking
- Tampilan bulan dengan navigasi bulan sebelumnya/berikutnya.
- Tanggal ber-booking diberi penanda; klik tanggal membuka detail pesanan.
- Mencegah dua booking pada tanggal yang sama tanpa peringatan (aturan bisnis dikonfirmasi dengan mitra, lihat bagian 13).

### 6.4 Data Booking
- Daftar booking dengan pencarian (nama, tanggal, paket) dan filter status.
- Formulir tambah/ubah dengan validasi kolom wajib.
- Hapus dengan dialog konfirmasi.
- Status booking: **Belum dikonfirmasi**, **Dikonfirmasi pelanggan**, **Perlu koreksi**.

### 6.5 Katalog
- Dua bagian: busana (kebaya/baju adat + ukuran) dan dekorasi/layanan.
- Unggah foto dengan batas ukuran dan format (JPG/PNG/WebP), kompresi otomatis.
- Foto dari katalog dapat dikaitkan ke booking dan tampil di detail pesanan serta halaman pelanggan.

### 6.6 Checklist Acara
- Daftar barang dibuat dari template per paket, dapat disesuaikan per acara.
- Dua penanda per barang: **Dimuat** dan **Kembali**, masing-masing tersimpan dengan waktu.
- Ringkasan: total barang, sudah dimuat, sudah kembali, **belum kembali** (disorot).

### 6.7 Halaman Konfirmasi Pelanggan
- Akses lewat tautan unik, tanpa login.
- Menampilkan identitas Era Waluyo (nama, logo, kontak) agar tautan dikenali resmi.
- Menampilkan rincian pesanan dan foto, sama persis dengan data di sistem.
- Pelanggan dapat menulis koreksi dan/atau menekan **Konfirmasi**.
- Setelah aksi, status di sistem admin berubah dan admin dapat melihat catatan koreksi.
- Responsif untuk ponsel (mayoritas pelanggan membuka dari WhatsApp).

### 6.8 Kirim via WhatsApp
- Tombol di detail pesanan membuka `https://wa.me/<nomor>?text=<pesan>` dengan nomor pelanggan dan pesan berisi tautan konfirmasi.
- Admin menekan kirim secara manual.

Contoh pesan:

> Halo Kak {nama}, terima kasih sudah memesan di Era Waluyo. Mohon cek rincian pesanan Kakak lewat tautan berikut, lalu konfirmasi jika sudah sesuai: {tautan}

### 6.9 Rekap Booking
- Rekap per bulan (jumlah acara), per paket, dan per status konfirmasi.
- Ringkasan pembayaran (DP) per booking.
- Dapat difilter berdasarkan rentang tanggal.

## 7. Model Data (Usulan)

| Entitas | Kolom utama |
|---|---|
| `users` | id, nama, email, peran, dibuat_pada |
| `packages` | id, nama (Basic, Premium, dst.), deskripsi |
| `bookings` | id, nama_pelanggan, no_wa, tanggal_acara, lokasi, package_id, kebaya_baju, ukuran, dekorasi, mc, makeup, fotografer, video, hiburan, catatan_khusus, dp_nominal, dp_diterima, status, token_konfirmasi, dikonfirmasi_pada, dibuat_oleh, dibuat_pada |
| `catalog_items` | id, jenis (busana/dekorasi/layanan), nama, ukuran, deskripsi, aktif |
| `catalog_photos` | id, item_id, url, urutan |
| `booking_items` | booking_id, catalog_item_id (relasi busana/dekorasi ke booking) |
| `checklist_templates` | id, package_id, nama_barang |
| `checklist_items` | id, booking_id, nama_barang, dimuat, dimuat_pada, kembali, kembali_pada |
| `customer_notes` | id, booking_id, isi, dibuat_pada |

Aturan: tanggal acara dicatat setelah `dp_diterima = true`. `token_konfirmasi` acak, unik, dan sulit ditebak.

## 8. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| Performa | Halaman utama < 3 detik |
| Responsif | Tampil baik di ponsel dan komputer |
| Keamanan | HTTPS, kata sandi ter-hash, tautan konfirmasi acak, validasi input, pembatasan akses data per peran |
| Pencadangan | Backup basis data terjadwal |
| Ketersediaan | Dapat diakses melalui domain dan hosting yang stabil |
| Aksesibilitas | Kontras teks memadai, target sentuh ≥ 44px, label jelas |
| Bahasa | Antarmuka berbahasa Indonesia |
| Kemudahan | Admin baru dapat mencatat pesanan setelah pelatihan tanpa bantuan |

## 9. Teknologi (Ringkas)

Detail ada di `agent.md`. Ringkasnya: Next.js + TypeScript + Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), deploy di Vercel.

## 10. Jadwal dan Milestone

| Minggu | Milestone |
|---|---|
| 1–3 | Analisis kebutuhan, user flow, desain UI, fondasi proyek |
| 4 | **Demo prototipe** ke mitra |
| 5–9 | Pengembangan fitur inti, katalog, checklist, konfirmasi, dashboard |
| 10 | **UAT** dengan admin (20+ skenario) |
| 11 | Perbaikan bug, peluncuran, migrasi data, pelatihan admin |
| 12 | **Serah terima** (Berita Acara) |
| +1 bulan | Evaluasi satu bulan dan laporan akhir |

Anggaran: realisasi tidak boleh melebihi **Rp16.225.000** tanpa persetujuan Sponsor. Selisih anggaran harus < 10%.

## 11. Pengendalian Perubahan

- **Revisi** (tidak mengubah fungsi, jadwal, biaya, indikator inti, misalnya warna, salah ketik, teks tombol): disetujui Project Manager dan dicatat di catatan rapat.
- **Scope Change**: wajib lewat Change Request Form → analisis dampak → keputusan CCB (PM sebagai ketua dan Sponsor; dosen pembimbing diinformasikan) → update baseline → komunikasi ke pemangku kepentingan.

## 12. Kriteria Penerimaan

**Website siap digunakan**
- 95% skenario UAT berhasil, 0 bug kritis, maksimal 1 bug mayor
- Halaman utama < 3 detik
- Tampilan baik di ponsel dan komputer
- Tautan konfirmasi menampilkan data yang sama dengan sistem
- Sign-off: Berita Acara Penerimaan oleh Sponsor dan Project Manager

**Konten dan migrasi**
- 100% busana aktif memiliki foto dan ukuran
- 100% booking ber-DP tercatat di sistem
- Daftar checklist tersedia untuk setiap paket

**Pelatihan admin**
- 3 dari 3 admin mengikuti pelatihan
- Setiap admin mencatat satu pesanan sampai konfirmasi tanpa bantuan
- Panduan penggunaan diterima admin

**Evaluasi satu bulan**
- Seluruh pemesanan baru selama satu bulan tercatat di sistem
- Setiap acara punya checklist dan tautan konfirmasi terkirim
- Admin mengoperasikan sistem secara mandiri

**Eskalasi penerimaan:** < 85% ditolak; 85–95% diterima bersyarat dengan rencana perbaikan; ≥ 95% diterima penuh.

## 13. Asumsi, Risiko, dan Pertanyaan Terbuka

**Asumsi**
- Admin tersedia untuk sesi pelatihan dan UAT.
- Koneksi internet di kantor mitra memadai.
- Foto dan data ukuran busana dapat dikumpulkan dari mitra tepat waktu.

**Risiko**
| Risiko | Mitigasi |
|---|---|
| Admin terbiasa manual, adopsi rendah | Pelatihan, SOP, masa pendampingan, UI sederhana |
| Data migrasi tidak lengkap | Pemeriksaan kelengkapan bersama admin |
| Tautan konfirmasi disalahgunakan | Token acak, tanpa data sensitif berlebih |
| Scope creep | Formal change control |
| Anggaran melebihi batas | Pemantauan mingguan, persetujuan Sponsor |

**Pertanyaan terbuka (untuk dikonfirmasi ke mitra)**
1. Bolehkah dua acara pada tanggal yang sama? Jika boleh, berapa maksimal?
2. Apakah admin perlu notifikasi saat pelanggan menulis koreksi, atau cukup melihat di dashboard?
3. Apakah tautan konfirmasi punya masa berlaku, dan bisa dikonfirmasi ulang setelah data dikoreksi?
4. Apakah pelanggan boleh membatalkan konfirmasi?
5. Apakah perlu pembedaan hak akses antar admin?
6. Apakah pencatatan dilakukan segera saat DP diterima? (dimasukkan ke SOP 2.2.3)

## 14. Catatan Konsistensi Dokumen Sumber

PRD ini memakai penomoran WBS yang dirapikan: 1.2 = Kalender & Data Booking, 1.3 = Katalog & Foto, 1.4 = Checklist Acara, 1.5 = Konfirmasi Pelanggan, 1.6 = Dashboard & Rekap, 1.7 = Arsitektur Teknis, 1.8 = Assurance. Laporan akhir dan evaluasi satu bulan mengacu ke WBS 3.3.2 dan 2.3.2 (dokumen sumber menyebutnya "4.0 Laporan Proyek").
