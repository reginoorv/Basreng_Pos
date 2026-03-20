# 🚀 PANDUAN DEPLOY — Basreng POS Online
### Supabase + Vercel (Gratis, Tanpa Server)

---

## PERSIAPAN
Kamu butuh:
- Email (untuk daftar Supabase & Vercel)
- File folder `basreng-online` dari ZIP ini
- Laptop/PC (lebih mudah dari HP)

Estimasi waktu: **15–20 menit**

---

## LANGKAH 1 — Buat Database di Supabase

### 1.1 Daftar Supabase
1. Buka https://supabase.com
2. Klik **Start your project** → **Sign up**
3. Daftar pakai email atau akun GitHub/Google
4. Verifikasi email jika diminta

### 1.2 Buat Project Baru
1. Klik **New project**
2. Isi:
   - **Organization**: biarkan default
   - **Name**: `basreng-pos` (bebas)
   - **Database Password**: buat password kuat, **simpan di tempat aman!**
   - **Region**: pilih **Southeast Asia (Singapore)**
3. Klik **Create new project**
4. Tunggu 1–2 menit sampai project siap (ada loading bar)

### 1.3 Jalankan Schema Database
1. Di sidebar kiri, klik **SQL Editor**
2. Klik **New query**
3. Buka file `schema.sql` dari folder ini dengan Notepad/TextEdit
4. **Select All** (Ctrl+A) → **Copy** semua isinya
5. **Paste** ke SQL Editor Supabase
6. Klik tombol **Run** (atau Ctrl+Enter)
7. Tunggu sampai muncul pesan **"Success. No rows returned"**
8. ✅ Database siap!

### 1.4 Ambil API Key
1. Di sidebar kiri, klik **Project Settings** (ikon gear)
2. Klik **API**
3. Catat dua hal ini:
   - **Project URL** → contoh: `https://abcdefghijklm.supabase.co`
   - **anon public** key → string panjang mulai dari `eyJhbGci...`

---

## LANGKAH 2 — Isi Konfigurasi Aplikasi

1. Buka folder `basreng-online` di komputer kamu
2. Buka file `js/config.js` dengan Notepad (klik kanan → Open with → Notepad)
3. Ganti bagian ini:

```
const SUPABASE_URL  = 'https://XXXXXXXXXXXXXXXX.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXX';
```

Menjadi (isi dengan data dari langkah 1.4):

```
const SUPABASE_URL  = 'https://abcdefghijklm.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIs....(paste full key disini)';
```

4. **Simpan** file (Ctrl+S)

---

## LANGKAH 3 — Deploy ke Vercel (Dapat URL Online)

### 3.1 Daftar Vercel
1. Buka https://vercel.com
2. Klik **Sign Up** → pilih **Continue with Email** atau GitHub
3. Selesaikan proses pendaftaran

### 3.2 Upload & Deploy
1. Setelah login, klik **Add New → Project**
2. Scroll ke bawah, cari tombol **"Or deploy from your local files"** 
   *(atau klik "Browse" / "Import Local")*
3. **Upload seluruh folder** `basreng-online`
   - Cara upload: drag-and-drop folder ke area upload
   - Atau klik Browse dan pilih semua file
4. Klik **Deploy**
5. Tunggu 1–2 menit
6. Vercel akan memberikan URL seperti: `https://basreng-pos.vercel.app`
7. ✅ Aplikasi online!

### Catatan penting saat upload ke Vercel:
- Upload **semua file** di dalam folder `basreng-online`, termasuk subfolder `admin/`, `kasir/`, `css/`, `js/`
- Jangan upload folder `basreng-online` sebagai container, tapi **isi di dalamnya**

---

## LANGKAH 4 — Test Aplikasi

1. Buka URL dari Vercel di browser
2. Pastikan muncul halaman login dengan status **"🟢 Terhubung ke database"**
3. Login dengan akun bawaan:

| Level | Username | Password |
|-------|----------|----------|
| Admin | `admin` | `admin123` |
| Kasir | `kasir1` | `kasir123` |

4. Coba buat struk dari Admin → proses dari Kasir
5. ✅ Selesai!

---

## SETELAH DEPLOY — Yang Perlu Dilakukan

### Ganti password segera!
1. Login sebagai Admin → **Pengaturan** → **Ubah password admin**
2. Ganti password `admin123` ke password yang kuat

### Update info toko
1. Admin → **Pengaturan** → isi nama toko, alamat, telepon

### Update harga produk
1. Admin → **Produk & Stok** → klik **Edit** di tiap produk

### Tambah kasir yang sebenarnya
1. Admin → **Kasir** → **+ Tambah kasir**
2. Hapus kasir1 dan kasir2 bawaan setelah menambah kasir baru

---

## CARA BAGI URL KE KASIR

Setelah deploy, bagikan URL Vercel ke kasir:
- Kasir buka URL di browser HP atau komputer
- Pilih tab **Kasir** → login dengan username kasir
- Tidak perlu install apapun!

### Cara Install di Layar HP (Opsional)
1. Buka URL di Chrome Android
2. Tap menu titik tiga (⋮) di kanan atas
3. Pilih **"Add to Home Screen"**
4. Tap **Add**
5. Ikon Basreng POS muncul di layar HP seperti aplikasi biasa

---

## FITUR REALTIME

Saat kasir sedang login:
- Kalau admin membuat struk baru → **kasir langsung dapat notifikasi otomatis** tanpa refresh
- Notifikasi muncul di bagian atas layar kasir dengan kode struk yang baru masuk

---

## TROUBLESHOOTING

**❌ Muncul pesan "Konfigurasi Belum Diisi"**
→ Buka `js/config.js`, pastikan sudah diisi dengan URL dan Key dari Supabase

**❌ Status "🔴 Gagal terhubung"**
→ Cek lagi URL dan Key di `config.js`, pastikan tidak ada spasi atau karakter berlebih

**❌ Login gagal dengan username/password bawaan**
→ Kemungkinan seed data belum jalan. Buka SQL Editor Supabase → jalankan ulang bagian `SEED DATA AWAL` dari `schema.sql`

**❌ Struk tidak muncul di kasir**
→ Cek di Supabase → Table Editor → tabel `transaksi`. Kalau ada data tapi tidak tampil, cek koneksi internet

**❌ Upload ke Vercel gagal**
→ Coba cara alternatif: buat akun GitHub → upload folder ke GitHub repo → connect repo ke Vercel

---

## BIAYA

| Layanan | Plan | Biaya |
|---------|------|-------|
| Supabase | Free | **Gratis** (500MB database, 50.000 baris) |
| Vercel | Hobby | **Gratis** (100GB bandwidth/bulan) |

Untuk toko basreng dengan ratusan transaksi per bulan, **plan gratis lebih dari cukup**.

Jika suatu saat data transaksi sangat banyak (>50.000 baris dalam setahun), Supabase Pro sekitar **$25/bulan** (~Rp 400.000).

---

## BACKUP DATA

Data tersimpan di server Supabase, jadi aman meski ganti HP/komputer.

Untuk backup tambahan:
1. Admin → **Laporan** → pilih periode → **Export Excel**
2. Simpan file Excel sebagai arsip bulanan

---

*Selamat berjualan online! 🎉*
*Basreng POS Online v1.0*
