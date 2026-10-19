# DESIGN — WEDORA

Panduan visual untuk seluruh tampilan WEDORA. Acuan utama: tampilan dashboard gelap bernuansa emas yang sudah dibuat. Semua UI baru harus konsisten dengan dokumen ini.

## 1. Prinsip Desain

- **Modern**: tata letak bersih, sudut membulat, ruang kosong lapang.
- **Elegan**: palet hitam, emas, dan krem dengan skala abu netral, heading serif bergaya klasik.
- **Simple**: satu aksi utama per layar, label Indonesia yang jelas, tidak ada dekorasi berlebihan. Admin terbiasa manual, jadi kejelasan lebih penting daripada gaya.
- **Hangat dan terpercaya**: sesuai dunia pernikahan; tidak dingin seperti aplikasi korporat.

## 2. Warna

Palet WEDORA dibangun dari tiga warna utama: **hitam (item)**, **emas (gold)**, dan **krem (cream)**, dilengkapi skala **abu netral** untuk lapisan, garis, dan teks sekunder. Hitam dan abu netral membentuk latar gelap, emas menjadi aksen, krem menjadi warna teks dan latar halaman pelanggan.

### 2.1 Warna Utama

| Token | Hex | Penggunaan |
|---|---|---|
| `--black` | `#111111` | Latar halaman admin (hitam) |
| `--gold` | `#D4AD5C` | Aksen utama: tombol utama, angka statistik, item menu aktif, ikon penting |
| `--cream` | `#F5EDDC` | Krem: teks utama di atas gelap, latar halaman pelanggan |

### 2.2 Skala Hitam dan Abu Netral (Tema Gelap)

| Token | Hex | Penggunaan |
|---|---|---|
| `--bg` | `#111111` | Latar halaman |
| `--surface` | `#1A1A1A` | Kartu, sidebar, panel |
| `--surface-2` | `#242424` | Hover baris/kartu, latar input |
| `--surface-3` | `#2E2E2E` | Elemen terangkat, dropdown |
| `--border` | `#2F2F2F` | Garis pemisah, border kartu |
| `--border-strong` | `#444444` | Border input saat hover |
| `--text` | `#F5EDDC` | Teks utama (krem) |
| `--text-muted` | `#A8A49B` | Teks sekunder, subjudul |
| `--text-faint` | `#6E6B64` | Placeholder, teks nonaktif |

### 2.3 Skala Emas

| Token | Hex | Penggunaan |
|---|---|---|
| `--gold` | `#D4AD5C` | Emas utama |
| `--gold-hover` | `#E3C27D` | Hover tombol emas |
| `--gold-press` | `#B8923F` | Tombol emas ditekan; emas pada latar terang |
| `--gold-soft` | `rgba(212,173,92,0.14)` | Latar badge dan item menu aktif |
| `--on-gold` | `#111111` | Teks di atas tombol emas |

### 2.4 Skala Krem dan Putih (Halaman Pelanggan / Tema Terang)

| Token | Hex | Penggunaan |
|---|---|---|
| `--cream` | `#F5EDDC` | Latar halaman pelanggan |
| `--cream-soft` | `#FBF7EC` | Kartu pada halaman pelanggan |
| `--cream-deep` | `#EADFC8` | Garis, pemisah, hover pada latar krem |
| `--white` | `#FFFFFF` | Input dan permukaan yang perlu menonjol di latar krem |
| `--ink` | `#111111` | Teks utama di latar krem |
| `--ink-muted` | `#5E5A52` | Teks sekunder di latar krem |
| `--ink-faint` | `#8F8A7F` | Placeholder di latar krem |
| `--line-light` | `#DDD2BA` | Border di latar krem |

### 2.5 Warna Status

| Status | Teks (gelap) | Latar (gelap) | Teks (krem) |
|---|---|---|---|
| Belum dikonfirmasi | `#D4AD5C` | `rgba(212,173,92,0.14)` | `#8A6A22` |
| Dikonfirmasi pelanggan | `#7FD39B` | `rgba(127,211,155,0.14)` | `#2F7A4B` |
| Perlu koreksi | `#E8A25F` | `rgba(232,162,95,0.14)` | `#A5601C` |
| Dibatalkan / bahaya | `#E07A6E` | `rgba(224,122,110,0.14)` | `#B13C30` |
| Info | `#8DB4D9` | `rgba(141,180,217,0.14)` | `#2E5F8A` |

Status tidak boleh dibedakan hanya lewat warna: selalu sertakan teks label.

### 2.6 Aturan Penggunaan Warna

- Latar admin hitam dan abu netral. Tidak ada warna cokelat atau biru pada permukaan.
- Emas hanya untuk elemen penting (aksi utama, angka kunci, item aktif). Jangan dipakai untuk semua teks.
- Rasio komposisi tema gelap: ±70% hitam dan abu (`--bg`, `--surface`), ±20% teks krem/abu, ±10% emas.
- Rasio komposisi halaman pelanggan: ±70% krem dan putih, ±20% teks hitam/abu, ±10% emas.
- Kontras teks utama terhadap latar minimal 4.5:1. Emas `#D4AD5C` hanya untuk teks di latar gelap; di latar krem pakai `--gold-press` atau warna status versi krem.
- Tidak memakai gradien mencolok. Gradien halus (emas ke emas lebih gelap) hanya untuk tombol utama bila perlu.

### 2.7 CSS Variables

```css
:root {
  /* Warna utama */
  --black: #111111;
  --gold: #d4ad5c;
  --cream: #f5eddc;

  /* Tema gelap (admin) */
  --bg: #111111;
  --surface: #1a1a1a;
  --surface-2: #242424;
  --surface-3: #2e2e2e;
  --border: #2f2f2f;
  --border-strong: #444444;
  --text: #f5eddc;
  --text-muted: #a8a49b;
  --text-faint: #6e6b64;

  /* Emas */
  --gold-hover: #e3c27d;
  --gold-press: #b8923f;
  --gold-soft: rgba(212, 173, 92, 0.14);
  --on-gold: #111111;

  /* Krem dan putih (halaman pelanggan) */
  --cream-soft: #fbf7ec;
  --cream-deep: #eadfc8;
  --white: #ffffff;
  --ink: #111111;
  --ink-muted: #5e5a52;
  --ink-faint: #8f8a7f;
  --line-light: #ddd2ba;

  /* Status */
  --success: #7fd39b;
  --warning: #e8a25f;
  --danger: #e07a6e;
  --info: #8db4d9;
}

/* Halaman pelanggan: tema krem */
.theme-cream {
  --bg: var(--cream);
  --surface: var(--cream-soft);
  --surface-2: var(--cream-deep);
  --border: var(--line-light);
  --text: var(--ink);
  --text-muted: var(--ink-muted);
  --text-faint: var(--ink-faint);
  --gold: var(--gold-press);
  --success: #2f7a4b;
  --warning: #a5601c;
  --danger: #b13c30;
  --info: #2e5f8a;
}
```

## 3. Tipografi

| Peran | Font | Fallback |
|---|---|---|
| Heading, logo, angka statistik | **Cormorant Garamond** (serif) | `Georgia, serif` |
| Body, label, tombol, tabel | **Inter** | `system-ui, sans-serif` |

| Gaya | Ukuran / Berat | Contoh |
|---|---|---|
| Logo "WEDORA" | 28px, serif, letter-spacing 0.2em, kapital | Sidebar |
| H1 | 36px, serif, 500 | "Dashboard" |
| H2 | 24px, serif, 500 | "Acara Terdekat" |
| H3 | 18px, Inter, 600 | Judul kartu |
| Angka statistik | 40px, serif, 500, warna emas | "5" |
| Body | 15px, Inter, 400 | Isi tabel |
| Label / kecil | 13px, Inter, 500 | Badge, caption |
| Subjudul | 15px, `--text-muted` | "Ringkasan booking Era Waluyo" |

Line-height body 1.5, heading 1.2. Jangan memakai lebih dari dua font.

## 4. Spacing, Radius, Bayangan

- Skala spasi (px): 4, 8, 12, 16, 24, 32, 48.
- Padding kartu: 24px. Jarak antar kartu: 16–24px.
- Radius: kartu `16px`, tombol/pil `999px`, input `12px`, badge `999px`.
- Border: `1px solid var(--border)`.
- Bayangan: minim. Pada tema gelap, pembeda lapisan cukup dari skala abu (`--surface`, `--surface-2`, `--surface-3`) dan border. Bila perlu: `0 8px 24px rgba(0,0,0,0.25)` untuk modal/dropdown.

## 5. Tata Letak

### 5.1 Layout Admin (desktop)

- **Sidebar** kiri lebar 260–290px, latar `--surface`, border kanan `--border`.
  - Atas: logo "WEDORA" dan teks kecil kapital "ERA WALUYO" (muted, letter-spacing lebar).
  - Menu: Dashboard, Kalender Booking, Data Booking, Katalog, Checklist Acara, Rekap Booking.
  - Bawah: tombol **Keluar** (outline emas, lebar penuh).
- **Konten**: padding 32–40px, lebar maksimal ±1400px.
- **Header halaman**: H1 + subjudul di kiri, aksi utama (**+ Booking Baru**, tombol emas pil) di kanan.
- **Kartu statistik**: grid 4 kolom (Total Booking, Acara Bulan Ini, Belum Dikonfirmasi, Acara Mendatang).
- **Tabel/daftar**: dalam kartu `--surface`, baris dipisah garis `--border`.

### 5.2 Layout Admin (ponsel)

- Sidebar menjadi **drawer** (tombol menu di header) atau bottom navigation untuk 4–5 menu utama.
- Kartu statistik 2 kolom, lalu 1 kolom di bawah 380px.
- Tabel berubah menjadi **daftar kartu** (tanggal, nama, paket, status, tombol Detail).
- Tombol utama dapat berupa FAB emas di kanan bawah.

### 5.3 Breakpoint

| Nama | Lebar |
|---|---|
| sm | ≥ 640px |
| md | ≥ 768px |
| lg | ≥ 1024px |
| xl | ≥ 1280px |

Desain **mobile-first**.

### 5.4 Halaman Pelanggan (konfirmasi)

- Mode **krem**: pakai kelas `.theme-cream`. Latar `--cream`, kartu `--cream-soft`, input `--white`, teks `--ink`, aksen emas `--gold-press` (lebih gelap agar kontras di latar terang), status memakai versi krem (bagian 2.5).
- Satu kolom, lebar maksimal 560px, rata tengah.
- Header: logo Era Waluyo dan kontak, agar tautan terlihat resmi.
- Urutan: sapaan → rincian pesanan → foto → kolom koreksi → tombol **Konfirmasi** (lebar penuh, emas).
- Dioptimalkan untuk ponsel karena dibuka dari WhatsApp.

## 6. Komponen

### Tombol
| Varian | Gaya |
|---|---|
| Utama | Latar `--gold`, teks `--on-gold`, pil, tinggi 44px, font 600. Hover `--gold-hover`. |
| Sekunder (outline) | Border 1px `--gold`, teks `--gold`, latar transparan. Hover latar `--gold-soft`. Contoh: **Detail**, **Keluar**. |
| Teks | Tanpa border, teks `--text-muted`, hover `--text`. |
| Bahaya | Border/teks `--danger`; hanya untuk hapus, selalu dengan dialog konfirmasi. |
| Disabled | Opasitas 40%, kursor `not-allowed`. |

Fokus: ring 2px `--gold` dengan offset 2px.

### Kartu Statistik
Latar `--surface`, border `--border`, radius 16px, padding 24px. Judul 15px `--text`, angka 40px serif emas.

### Badge Status
Pil, padding 4px 12px, font 12–13px 600, warna sesuai bagian 2.3.

### Item Menu Sidebar
Tinggi 48px, radius 12px, padding horizontal 16px. Aktif: latar `--gold-soft`, teks `--gold`, font 600. Hover: latar `--surface-2`.

### Input & Form
Latar `--surface-2`, border `--border`, radius 12px, tinggi 44px, teks `--text`, placeholder `--text-faint`. Fokus: border `--gold` + ring emas lembut. Label di atas input, 13px `--text-muted`. Pesan error di bawah input berwarna `--danger` dengan teks jelas.

### Tabel / Daftar
Tanpa border vertikal. Baris tinggi ±60px, hover `--surface-2`. Kolom tanggal ditebalkan. Tombol aksi di kolom paling kanan.

### Kalender Booking
Grid 7 kolom. Hari ini: lingkaran outline emas. Tanggal ber-booking: titik atau bar emas kecil; status belum konfirmasi memakai warna `--warning`, terkonfirmasi `--success`. Tanggal dipilih: latar `--gold-soft`.

### Checklist
Setiap barang: dua checkbox bergaya toggle (**Dimuat**, **Kembali**). Checkbox tercentang berlatar emas. Ringkasan di atas: "Belum kembali: N" disorot `--warning` bila N > 0.

### Unggah Foto
Area drop berborder putus-putus `--border-strong`, ikon kamera, teks "Seret foto atau klik untuk memilih". Pratinjau grid 3 kolom, radius 12px.

### Modal & Dialog
Overlay `rgba(0,0,0,0.6)`, panel `--surface`, radius 20px, padding 24px. Tombol utama di kanan, batal di kiri-nya.

### Toast / Notifikasi
Pojok kanan atas (desktop) atau atas tengah (ponsel), muncul 4 detik, ikon dan teks jelas.

### State Kosong
Ikon garis sederhana, judul serif, satu kalimat penjelasan, satu tombol aksi. Contoh: "Belum ada booking. Tambahkan booking pertama."

### Loading
Skeleton berwarna `--surface-2` dengan animasi halus. Hindari spinner layar penuh.

## 7. Ikonografi

- Gaya garis (outline) 1.5px, sudut membulat. Disarankan pustaka **Lucide**.
- Ukuran 20px di menu dan tombol, 24px di state kosong.
- Warna mengikuti teks; emas hanya untuk ikon aktif/penting.

## 8. Gerak (Motion)

- Durasi 150–250ms, easing `ease-out`.
- Dipakai untuk hover, fokus, buka/tutup drawer dan modal.
- Hormati `prefers-reduced-motion`: matikan animasi non-esensial.
- Tidak ada animasi dekoratif berulang.

## 9. Aksesibilitas

- Kontras teks ≥ 4.5:1, komponen UI ≥ 3:1.
- Target sentuh ≥ 44×44px.
- Semua kontrol dapat dioperasikan dengan keyboard; fokus selalu terlihat.
- Gambar bermakna punya `alt`; ikon dekoratif `aria-hidden`.
- Status tidak hanya dibedakan warna.
- Ukuran teks minimal 14px di ponsel.

## 10. Nada Bahasa (Microcopy)

- Bahasa Indonesia, sopan, singkat, hangat.
- Tombol berupa kata kerja: "Simpan", "Kirim via WhatsApp", "Konfirmasi", "Tandai Dimuat".
- Pesan error menjelaskan solusi: "Nomor WhatsApp belum diisi. Mohon lengkapi agar tautan dapat dikirim."
- Konfirmasi hapus menyebut objeknya: "Hapus booking Aulia & Fajar (24 Oktober 2026)?"
- Format tanggal: `24 Oktober 2026`. Format uang: `Rp1.500.000`.

## 11. Hal yang Dihindari

- Warna neon, gradien ramai, bayangan tebal.
- Lebih dari satu tombol emas utama per layar.
- Ornamen berlebihan (bunga, garis hias) yang mengganggu keterbacaan.
- Teks emas panjang atau berukuran kecil di atas latar gelap.
- Istilah teknis (misalnya "token", "database") pada antarmuka.

## 12. Checklist Konsistensi Sebelum Rilis

- [ ] Semua warna memakai token (hitam, emas, krem, abu netral), tanpa hex acak
- [ ] Heading serif, body Inter
- [ ] Satu aksi utama per layar
- [ ] Tampilan teruji di lebar 375px dan 1280px
- [ ] Fokus keyboard terlihat
- [ ] State kosong, loading, dan error tersedia
- [ ] Label dan pesan berbahasa Indonesia
