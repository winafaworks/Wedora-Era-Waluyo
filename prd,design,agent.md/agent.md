# AGENT — Aturan untuk Model AI (WEDORA)

Dokumen ini adalah aturan wajib bagi setiap model AI/asisten coding yang bekerja di repositori WEDORA. Baca file ini, `prd.md`, dan `design.md` sebelum mengerjakan apa pun.

## 1. Dokumen Acuan

| File | Fungsi |
|---|---|
| `prd.md` | Apa yang dibangun: fitur, scope, kriteria penerimaan |
| `design.md` | Bagaimana tampilannya: warna, tipografi, komponen |
| `agent.md` | Bagaimana AI bekerja (file ini) |

Jika instruksi pengguna bertentangan dengan dokumen di atas, **hentikan dan tanyakan**, jangan menebak.

## 2. Aturan Utama: Jangan Ubah Selain yang Diperintahkan

1. Kerjakan **hanya** yang diminta pengguna pada perintah saat ini.
2. **Dilarang** mengubah, menghapus, memindahkan, merapikan, atau me-refactor file, fungsi, gaya, nama, dependensi, atau konfigurasi yang tidak disebut dalam perintah.
3. Jangan menambah fitur, halaman, kolom basis data, atau paket baru atas inisiatif sendiri.
4. Jangan memperbarui versi dependensi kecuali diminta.
5. Jangan memformat ulang file secara massal (auto-format seluruh proyek) karena membuat diff besar dan tidak relevan.
6. Jangan mengubah desain (warna, font, tata letak) di luar permintaan. Semua perubahan visual wajib mengikuti `design.md`.
7. Jika menemukan bug atau masalah lain di luar tugas: **laporkan saja** di akhir jawaban, jangan diperbaiki sendiri.
8. Jika perintah ambigu, ajukan **satu pertanyaan klarifikasi** sebelum bekerja.
9. Hal di bagian "Di Luar Lingkup" pada `prd.md` (pembayaran online, aplikasi seluler, integrasi akuntansi, pengelolaan kost, booking mandiri, landing page, WhatsApp otomatis, akun pelanggan) **tidak boleh dikerjakan** tanpa persetujuan eksplisit. Itu adalah Scope Change.

## 3. Alur Kerja Git (Otomatis)

Setelah **setiap** perubahan selesai dan lolos pemeriksaan (bagian 4), AI langsung menjalankan:

```bash
git add <file yang diubah>
git commit -m "<pesan commit>"
git push
```

Aturan:

1. **Otomatis push** setelah tiap perubahan selesai, tanpa menunggu diminta lagi.
2. Gunakan `git add` pada **file yang diubah saja**, bukan `git add .` atau `git add -A`, agar tidak ikut membawa file tak sengaja.
3. **Satu perubahan logis = satu commit.** Jangan menggabungkan banyak hal tak terkait.
4. Push ke **branch aktif**. Jangan membuat atau berpindah branch kecuali diminta.
5. **Dilarang**: `git push --force`, `git reset --hard`, `git rebase` pada riwayat yang sudah di-push, dan menghapus branch, kecuali diminta eksplisit.
6. **Jangan pernah** commit: `.env`, kunci API, kata sandi, `node_modules`, folder build, atau data pelanggan nyata.
7. Jika push gagal (konflik, autentikasi, jaringan), **berhenti dan laporkan** penyebabnya. Jangan memaksa.
8. Jangan push bila build/lint/tes gagal. Perbaiki dahulu (jika masih dalam lingkup tugas) atau laporkan.

### Format Pesan Commit

Gunakan **Conventional Commits**, deskripsi dalam Bahasa Indonesia, singkat dan jelas.

```
<tipe>(<area>): <ringkasan singkat, huruf kecil, tanpa titik>

<badan opsional: apa yang berubah dan kenapa>
Refs: WBS <kode>
```

| Tipe | Kegunaan |
|---|---|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `style` | Perubahan tampilan/CSS tanpa mengubah logika |
| `refactor` | Perubahan kode tanpa mengubah perilaku (hanya jika diminta) |
| `docs` | Dokumentasi |
| `test` | Menambah/mengubah tes |
| `chore` | Konfigurasi, dependensi, tooling |

Contoh:

```
feat(booking): tambah formulir tambah booking

Menambahkan kolom nama, lokasi, paket, busana, ukuran, dekorasi, MC,
makeup, fotografer, video, hiburan, dan catatan khusus.
Refs: WBS 1.2.2
```

```
style(dashboard): sesuaikan warna kartu statistik dengan design.md
```

### Laporan Setelah Push

Di akhir setiap pekerjaan, AI memberi keterangan singkat:

1. **Apa yang diubah** (daftar file).
2. **Pesan commit** yang dipakai dan hash commit.
3. **Status push** (berhasil/gagal, ke branch mana).
4. **Temuan di luar tugas** (jika ada) yang tidak disentuh.

## 4. Pemeriksaan Sebelum Commit

Jalankan sesuai yang relevan dengan perubahan:

```bash
npm run lint
npm run typecheck
npm run build
npm test        # jika tes tersedia
```

Perubahan hanya boleh di-commit bila pemeriksaan di atas lolos. Jika sebuah skrip tidak ada, lewati dan sebutkan di laporan.

## 5. Teknologi yang Digunakan

### 5.1 Rekomendasi

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Satu proyek untuk dashboard admin dan halaman konfirmasi pelanggan; rendering cepat (target < 3 detik); ekosistem besar |
| Styling | **Tailwind CSS** | Cepat dan konsisten dengan design token; mudah responsif |
| Komponen UI | **shadcn/ui** (di atas Radix) | Aksesibel, mudah disesuaikan dengan tema `design.md` |
| Ikon | **Lucide** | Gaya garis sesuai desain |
| Font | **Cormorant Garamond** + **Inter** (via `next/font`) | Sesuai `design.md` |
| Basis data | **PostgreSQL via Supabase** | Data relasional (booking, katalog, checklist); paket gratis memadai; ada backup |
| Autentikasi | **Supabase Auth** (email + kata sandi) | Login admin siap pakai, aman |
| Penyimpanan foto | **Supabase Storage** | Satu platform dengan basis data; mendukung unggah foto katalog |
| Validasi | **Zod** + **React Hook Form** | Validasi formulir booking yang ketat |
| Tanggal | **date-fns** (locale `id`) | Format tanggal Indonesia |
| Kalender | Komponen kalender kustom atau **react-day-picker** | Mudah ditata sesuai tema |
| Tes | **Vitest** (unit), **Playwright** (alur UAT utama) | Mendukung 20+ skenario uji |
| Hosting | **Vercel** | Deploy otomatis dari Git, HTTPS, domain kustom |
| Versi kode | **Git + GitHub** | Sesuai alur push otomatis |

### 5.2 Alasan Memilih Supabase (Bukan Basis Data Terpisah)

- Satu layanan memberi **database, login, dan penyimpanan foto**, sehingga lebih sedikit bagian yang dipelihara oleh tim kecil.
- Cocok untuk anggaran terbatas (Rp16.225.000 untuk seluruh proyek).
- **Row Level Security (RLS)** membatasi akses data per peran.
- Backup tersedia, mendukung kebutuhan WBS 1.7.3.

### 5.3 Alternatif (Jika Tim Lebih Menguasai)

| Opsi | Kapan dipilih |
|---|---|
| **Laravel + MySQL** | Tim sudah mahir PHP/Laravel dan hosting yang dipakai shared hosting/cPanel |
| **Firebase** | Butuh realtime kuat dan tidak butuh query relasional rumit (kurang cocok untuk rekap) |

Jangan mengganti teknologi tanpa persetujuan (lihat bagian 2).

### 5.4 Struktur Proyek (Usulan)

```
wedora/
├── agent.md
├── prd.md
├── design.md
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (admin)/
│   │   │   ├── dashboard/
│   │   │   ├── kalender/
│   │   │   ├── booking/
│   │   │   ├── katalog/
│   │   │   ├── checklist/
│   │   │   └── rekap/
│   │   └── konfirmasi/[token]/      # halaman pelanggan, tanpa login
│   ├── components/ui/               # komponen dasar sesuai design.md
│   ├── components/features/
│   ├── lib/                         # supabase client, util, validasi
│   └── types/
├── supabase/migrations/             # skema SQL berversi
├── tests/
└── .env.example
```

## 6. Aturan Kode

1. **TypeScript ketat** (`strict: true`). Hindari `any`.
2. Nama variabel dan fungsi dalam bahasa Inggris; teks yang tampil ke pengguna dalam Bahasa Indonesia.
3. Warna, spasi, radius **wajib memakai token** dari `design.md` (CSS variables / konfigurasi Tailwind). Jangan menulis hex acak.
4. Komponen kecil dan fokus satu fungsi. Gunakan ulang komponen yang sudah ada sebelum membuat baru.
5. Akses basis data hanya lewat lapisan `lib/` atau server action, bukan langsung dari komponen UI.
6. Semua input divalidasi di **server** (Zod), bukan hanya di klien.
7. Tangani state **loading, kosong, dan error** di setiap halaman data.
8. Komentar hanya untuk menjelaskan "mengapa", bukan "apa".
9. Tidak ada `console.log` tertinggal saat commit.

## 7. Keamanan dan Data

1. Rahasia hanya di `.env.local` (tidak di-commit). Sediakan `.env.example` tanpa nilai asli.
2. Kunci `service_role` Supabase **hanya di server**, tidak pernah dikirim ke klien.
3. Aktifkan **RLS** pada semua tabel. Halaman admin hanya dapat dibaca oleh pengguna terautentikasi.
4. Tautan konfirmasi memakai **token acak panjang** (minimal 32 karakter, mis. `crypto.randomUUID()` atau lebih kuat), bukan ID berurutan. Halaman pelanggan hanya menampilkan data satu booking sesuai token dan tidak membocorkan data lain.
5. Sanitasi seluruh input teks (catatan khusus, koreksi pelanggan) untuk mencegah XSS.
6. Batasi unggah foto: JPG/PNG/WebP, ukuran maksimal wajar (mis. 5 MB), kompresi sebelum simpan.
7. Jangan memakai data pelanggan nyata untuk pengembangan. Gunakan data contoh.
8. Migrasi basis data dibuat sebagai file SQL berversi di `supabase/migrations/` dan diterapkan lewat Supabase CLI. Jangan mengubah skema langsung di dasbor. Aturan lengkap ada di bagian 8.

## 8. Database dan Migrasi (Supabase CLI)

Skema database **hanya** boleh diubah lewat file migrasi SQL yang diterapkan dengan Supabase CLI. Dilarang mengubah skema lewat dasbor Supabase, dan dilarang menjalankan SQL bebas ke database tanpa file migrasi.

### 8.1 Persiapan (sekali di awal, dilakukan pengguna)

```bash
supabase init                              # membuat folder supabase/
supabase login
supabase link --project-ref <id-proyek>    # id dari Project Settings → General
```

- `<id-proyek>` dan kata sandi database diberikan pengguna. AI tidak menebak dan tidak menyimpannya di Git.
- Folder `supabase/.temp/` dan file `.env*` masuk `.gitignore`.
- Sambungkan CLI ke **proyek pengembangan** terlebih dahulu, bukan proyek produksi berisi data asli Era Waluyo.

### 8.2 Alur Membuat atau Mengubah Tabel

1. **Buat file migrasi baru** (nama otomatis bertanda waktu):
   ```bash
   supabase migration new <nama_singkat>      # contoh: create_bookings
   ```
2. **Tulis SQL** di file tersebut. Mengacu pada model data di `prd.md` bagian 7.
3. **Periksa** SQL: tabel, tipe data, relasi, indeks, dan RLS (bagian 8.3).
4. **Commit dan push ke Git** sesuai bagian 3. Pesan commit contoh:
   ```
   feat(db): buat tabel bookings dan checklist_items

   Menambahkan skema awal beserta kebijakan RLS.
   Refs: WBS 1.7.1
   ```
5. **Terapkan ke database:**
   ```bash
   supabase db push
   ```
   Langkah ini **hanya dijalankan setelah pengguna menyetujui** (lihat 8.4).
6. **Perbarui tipe TypeScript** bila skema berubah:
   ```bash
   supabase gen types typescript --linked > src/types/database.ts
   ```
7. Laporkan hasilnya: file migrasi yang dibuat, hasil `db push`, dan tabel yang terdampak.

### 8.3 Aturan Isi Migrasi

1. **Setiap tabel baru wajib `ENABLE ROW LEVEL SECURITY`** pada migrasi yang sama, beserta kebijakan (policy) eksplisit. Tabel tanpa RLS dianggap cacat.
2. Kebijakan dasar:
   - Pengguna **terautentikasi (admin)** boleh membaca dan menulis tabel data.
   - Pengguna **anonim tidak punya akses langsung** ke tabel. Halaman konfirmasi pelanggan diakses lewat server yang mencari booking berdasarkan `token_konfirmasi`.
3. Gunakan primary key `uuid` (`gen_random_uuid()`), kolom `created_at` dan `updated_at` bertipe `timestamptz`.
4. Kolom `token_konfirmasi` bersifat unik, acak, dan panjang.
5. Tambahkan foreign key dengan perilaku hapus yang jelas (`ON DELETE CASCADE` atau `RESTRICT`), bukan dibiarkan default tanpa alasan.
6. Tambahkan indeks pada kolom yang sering dicari: `tanggal_acara`, `status`, `token_konfirmasi`.
7. Satu file migrasi = satu tujuan perubahan. Nama file deskriptif.
8. Bucket Storage untuk foto (`catalog-photos`) juga dibuat lewat migrasi, lengkap dengan kebijakan aksesnya.

### 8.4 Batasan Keras

- **Jangan mengedit file migrasi yang sudah diterapkan.** Untuk koreksi, buat migrasi baru.
- **Jangan menjalankan** `supabase db reset`, `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, atau `DELETE`/`UPDATE` massal tanpa `WHERE`, kecuali pengguna menyetujui secara eksplisit pada perintah yang sama.
- **`supabase db push` ke proyek yang berisi data asli (produksi) hanya dengan persetujuan eksplisit pengguna.** Auto-push Git (bagian 3) tidak berlaku untuk `db push`, karena perubahan ini langsung memengaruhi data hidup.
- Sebelum `db push`, jalankan `supabase db push --dry-run` dan tampilkan hasilnya kepada pengguna.
- Jangan menaruh kata sandi database, `service_role key`, atau `access token` di file yang di-commit.
- Jangan mengubah skema agar menyimpang dari `prd.md`. Penambahan kolom atau tabel baru di luar PRD adalah Scope Change (bagian 9).
- Bila `db push` gagal, **berhenti dan laporkan** pesan error. Jangan mencoba memperbaiki dengan SQL langsung ke dasbor.

### 8.5 Data Contoh (Seed)

- Data contoh untuk pengembangan ditaruh di `supabase/seed.sql` dan hanya memakai data fiktif (misalnya "Aulia & Fajar", paket Basic/Premium).
- Jangan memasukkan data pelanggan nyata ke repositori.

## 9. Aturan Perubahan Fitur (Change Control)

- **Revisi kecil** (warna, salah ketik, teks tombol): boleh dikerjakan sesuai perintah, dicatat di pesan commit.
- **Scope Change** (fitur baru, mengubah fungsi/jadwal/biaya): AI **tidak mengerjakan**. AI menyampaikan bahwa ini memerlukan Change Request dan persetujuan CCB (Project Manager dan Sponsor), lalu menunggu keputusan pengguna.

## 10. Perilaku Saat Bekerja

1. Awali dengan membaca file terkait, jangan mengubah dari asumsi.
2. Lakukan perubahan sekecil mungkin untuk mencapai tujuan.
3. Jangan menghapus kode "yang tampak tidak terpakai" tanpa diminta.
4. Jangan membuat file dokumentasi, README, atau contoh tambahan yang tidak diminta.
5. Jelaskan dengan bahasa sederhana. Pengguna bukan selalu programmer berpengalaman.
6. Bila tidak yakin, **tanya**. Lebih baik satu pertanyaan daripada perubahan yang salah.

## 11. Ringkasan Cepat

```
1. Baca prd.md, design.md, agent.md.
2. Kerjakan HANYA yang diperintahkan.
3. Ikuti design.md untuk semua tampilan.
4. Lint + typecheck + build harus lolos.
5. git add (file terkait) → git commit (Conventional Commits, Indonesia) → git push.
6. Laporkan: file diubah, pesan commit, status push, temuan lain.
7. Dilarang: force push, commit rahasia, ubah di luar perintah, kerjakan fitur out-of-scope.
8. Database: ubah skema HANYA lewat file migrasi (`supabase migration new`), RLS wajib di setiap tabel,
   `supabase db push` hanya setelah persetujuan pengguna dan setelah `--dry-run` ditampilkan.
```
