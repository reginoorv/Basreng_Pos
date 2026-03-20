-- =============================================
-- BASRENG POS — SCHEMA SUPABASE
-- Jalankan seluruh file ini di Supabase SQL Editor
-- =============================================

-- 1. USERS (admin & kasir)
create table if not exists users (
  id bigserial primary key,
  username text unique not null,
  password text not null,
  nama text not null,
  role text not null check (role in ('admin','kasir')),
  aktif boolean default true,
  created_at timestamptz default now()
);

-- 2. PRODUK
create table if not exists produk (
  id bigserial primary key,
  nama text not null,
  harga_agen integer not null default 0,
  harga_ecer integer not null default 0,
  stok integer not null default 0,
  aktif boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TRANSAKSI
create table if not exists transaksi (
  id bigserial primary key,
  kode text unique not null,
  tipe text not null check (tipe in ('agen','ecer','mix')),
  nama_pembeli text,
  telp text,
  items jsonb not null default '[]',
  subtotal integer default 0,
  diskon integer default 0,
  total integer not null default 0,
  status text default 'pending' check (status in ('pending','lunas','batal')),
  created_by text,
  processed_by text,
  bayar integer,
  kembali integer,
  tanggal date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. SETTINGS
create table if not exists settings (
  key text primary key,
  value text
);

-- 5. STOK LOG
create table if not exists stok_log (
  id bigserial primary key,
  produk_id bigint references produk(id) on delete set null,
  nama_produk text,
  perubahan integer,
  stok_sebelum integer,
  stok_sesudah integer,
  keterangan text,
  actor text,
  waktu timestamptz default now()
);

-- 6. AUDIT LOG
create table if not exists audit_log (
  id bigserial primary key,
  aksi text,
  detail text,
  actor text,
  waktu timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- Izinkan akses penuh untuk anon key
-- (aplikasi punya auth sendiri)
-- =============================================
alter table users      enable row level security;
alter table produk     enable row level security;
alter table transaksi  enable row level security;
alter table settings   enable row level security;
alter table stok_log   enable row level security;
alter table audit_log  enable row level security;

create policy "allow_all_users"     on users      for all using (true) with check (true);
create policy "allow_all_produk"    on produk     for all using (true) with check (true);
create policy "allow_all_transaksi" on transaksi  for all using (true) with check (true);
create policy "allow_all_settings"  on settings   for all using (true) with check (true);
create policy "allow_all_stok_log"  on stok_log   for all using (true) with check (true);
create policy "allow_all_audit_log" on audit_log  for all using (true) with check (true);

-- =============================================
-- REALTIME — aktifkan untuk tabel transaksi
-- =============================================
alter publication supabase_realtime add table transaksi;

-- =============================================
-- SEED DATA AWAL
-- =============================================

-- Akun admin & kasir default
-- Password di-hash oleh aplikasi, ini hash dari 'admin123' dan 'kasir123'
insert into users (username, password, nama, role, aktif) values
  ('admin',  'h2ry17bma8', 'Admin Utama', 'admin', true),
  ('kasir1', 'h1v9bfy9ma8', 'Dewi Kasir',  'kasir', true),
  ('kasir2', 'h1v9bfy9ma8', 'Andi Kasir',  'kasir', true)
on conflict (username) do nothing;

-- Produk basreng default
insert into produk (nama, harga_agen, harga_ecer, stok, aktif) values
  ('Basreng Original 50gr',   4000,  6000,  200, true),
  ('Basreng Pedas 50gr',      4000,  6000,  200, true),
  ('Basreng Keju 50gr',       4500,  7000,  150, true),
  ('Basreng Original 100gr',  8000, 12000,  150, true),
  ('Basreng Pedas 100gr',     8000, 12000,  150, true),
  ('Basreng Keju 100gr',      9000, 14000,  100, true),
  ('Basreng Original 250gr', 18000, 28000,  100, true),
  ('Basreng Pedas 250gr',    18000, 28000,  100, true),
  ('Basreng Keju 250gr',     20000, 30000,   80, true)
on conflict do nothing;

-- Settings toko
insert into settings (key, value) values
  ('toko_nama',   'Basreng Store'),
  ('toko_alamat', 'Jl. Contoh No. 10, Sumedang'),
  ('toko_telp',   '0812-xxxx-xxxx'),
  ('min_agen',    '5'),
  ('stok_min',    '10')
on conflict (key) do nothing;
