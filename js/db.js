// =============================================
// BASRENG POS ONLINE — DATABASE (Supabase)
// =============================================

// Cek config
if (typeof SUPABASE_URL === 'undefined' || SUPABASE_URL.includes('XXXX')) {
  document.body.innerHTML = `<div style="font-family:sans-serif;max-width:500px;margin:60px auto;padding:24px;background:#fcebeb;border-radius:12px;color:#791f1f">
    <h2 style="margin-bottom:12px">⚠️ Konfigurasi Belum Diisi</h2>
    <p>Buka file <code>js/config.js</code> dan isi <b>SUPABASE_URL</b> dan <b>SUPABASE_ANON</b> dengan data dari project Supabase kamu.</p>
    <p style="margin-top:10px">Lihat <b>PANDUAN-DEPLOY.md</b> untuk langkah lengkapnya.</p>
  </div>`;
  throw new Error('Supabase config belum diisi');
}

// Init Supabase client
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ---- CRUD FUNCTIONS ----
async function dbGetAll(table, opts = {}) {
  let q = sb.from(table).select('*');
  if (opts.eq)    q = q.eq(opts.eq[0], opts.eq[1]);
  if (opts.order) q = q.order(opts.order, { ascending: opts.asc ?? false });
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

async function dbGet(table, id) {
  const { data, error } = await sb.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function dbGetByField(table, field, value) {
  const { data, error } = await sb.from(table).select('*').eq(field, value).maybeSingle();
  if (error) throw error;
  return data;
}

async function dbAdd(table, data) {
  const { data: result, error } = await sb.from(table).insert(data).select().single();
  if (error) throw error;
  return result;
}

async function dbUpdate(table, id, data) {
  const { data: result, error } = await sb.from(table).update(data).eq('id', id).select().single();
  if (error) throw error;
  return result;
}

async function dbDelete(table, id) {
  const { error } = await sb.from(table).delete().eq('id', id);
  if (error) throw error;
}

async function dbUpsert(table, data) {
  const { error } = await sb.from(table).upsert(data);
  if (error) throw error;
}

// ---- AUTH ----
function hashPass(p) {
  let h = 0;
  for (let i = 0; i < p.length; i++) h = Math.imul(31, h) + p.charCodeAt(i) | 0;
  return 'h' + Math.abs(h).toString(36) + p.length;
}

function getSession() {
  try { return JSON.parse(sessionStorage.getItem('pos_online_session')); } catch { return null; }
}
function setSession(user) {
  sessionStorage.setItem('pos_online_session', JSON.stringify({
    id: user.id, username: user.username, nama: user.nama, role: user.role
  }));
}
function clearSession() { sessionStorage.removeItem('pos_online_session'); }
function requireAuth(role) {
  const s = getSession();
  if (!s) { location.href = '../index.html'; return null; }
  if (role && s.role !== role) { location.href = '../index.html'; return null; }
  return s;
}

async function login(username, password) {
  const user = await dbGetByField('users', 'username', username.trim().toLowerCase());
  if (!user) throw new Error('Username tidak ditemukan');
  if (user.password !== hashPass(password)) throw new Error('Password salah');
  if (!user.aktif) throw new Error('Akun tidak aktif, hubungi admin');
  setSession(user);
  return user;
}

// ---- STOK ----
async function kurangiStok(items, kode, actor) {
  for (const item of items) {
    const p = await dbGet('produk', item.produkId);
    if (!p) continue;
    const baru = Math.max(0, (p.stok || 0) - item.qty);
    await dbUpdate('produk', p.id, { stok: baru, updated_at: new Date().toISOString() });
    await dbAdd('stok_log', {
      produk_id: p.id, nama_produk: item.nama,
      perubahan: -item.qty, stok_sebelum: p.stok, stok_sesudah: baru,
      keterangan: 'Penjualan #' + kode, actor, waktu: new Date().toISOString()
    });
  }
}

async function kembalikanStok(items, kode, actor) {
  for (const item of items) {
    const p = await dbGet('produk', item.produkId);
    if (!p) continue;
    const baru = (p.stok || 0) + item.qty;
    await dbUpdate('produk', p.id, { stok: baru, updated_at: new Date().toISOString() });
    await dbAdd('stok_log', {
      produk_id: p.id, nama_produk: item.nama,
      perubahan: +item.qty, stok_sebelum: p.stok, stok_sesudah: baru,
      keterangan: 'Batal #' + kode, actor, waktu: new Date().toISOString()
    });
  }
}

// ---- SETTINGS ----
async function getSettings() {
  const data = await dbGetAll('settings');
  const s = {};
  data.forEach(x => s[x.key] = x.value);
  return s;
}
async function setSetting(key, value) {
  await dbUpsert('settings', { key, value });
}

// ---- AUDIT LOG ----
async function addAuditLog(aksi, detail, actor) {
  await dbAdd('audit_log', { aksi, detail, actor });
}

// ---- UTILS ----
function generateKode() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `BSR-${yy}${mm}${dd}-${Math.floor(Math.random()*9000)+1000}`;
}
function fmtRp(n) { return 'Rp ' + Number(n||0).toLocaleString('id-ID'); }
function fmtDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) + ' ' +
         d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
}
function fmtDateShort(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit',year:'2-digit'}) + ' ' +
         d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
}
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.className = 'show ' + type;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.className = '', 3200);
}
function tipePill(tipe) {
  const m = {agen:'pill-agen',ecer:'pill-ecer',mix:'pill-mix'};
  const l = {agen:'Agen',ecer:'Ecer',mix:'Agen+Ecer'};
  return `<span class="pill ${m[tipe]||''}">${l[tipe]||tipe}</span>`;
}
function statusPill(s) {
  const m = {pending:'pill-pending',lunas:'pill-lunas',batal:'pill-batal'};
  const l = {pending:'Pending',lunas:'Lunas',batal:'Batal'};
  return `<span class="pill ${m[s]||''}">${l[s]||s}</span>`;
}

// ---- PRINT ----
async function generatePrintHTML(t) {
  const s = await getSettings();
  const tipeLabel = {agen:'AGEN',ecer:'ECER',mix:'AGEN + ECER'}[t.tipe] || t.tipe;
  const items = t.items.map(i => `
    <div style="display:flex;justify-content:space-between;font-size:12px"><span>${i.nama}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:#666;padding-left:8px;margin-bottom:3px">
      <span>${i.qty} x ${fmtRp(i.harga)}</span><span>${fmtRp(i.subtotal)}</span>
    </div>`).join('');
  return `<div style="font-family:monospace;width:72mm;padding:4mm 5mm;font-size:12px;line-height:1.55">
    <div style="text-align:center;margin-bottom:6px">
      <div style="font-size:15px;font-weight:700;letter-spacing:.04em">${s.toko_nama||'Basreng Store'}</div>
      <div style="font-size:11px;color:#666">${s.toko_alamat||''}</div>
      <div style="font-size:11px;color:#666">${s.toko_telp||''}</div>
    </div>
    <div style="border-top:1px solid #333;margin:4px 0"></div>
    <div style="display:flex;justify-content:space-between;font-size:11px"><span>Kode</span><span style="font-weight:700">${t.kode}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:11px"><span>Tgl</span><span>${fmtDateShort(t.created_at)}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:11px"><span>Pembeli</span><span>${t.nama_pembeli||'-'}</span></div>
    ${t.telp?`<div style="display:flex;justify-content:space-between;font-size:11px"><span>Telp</span><span>${t.telp}</span></div>`:''}
    <div style="display:flex;justify-content:space-between;font-size:11px"><span>Kasir</span><span>${t.processed_by||t.created_by||'-'}</span></div>
    <div style="text-align:center;margin:5px 0">
      <span style="border:1px solid #333;padding:1px 12px;font-size:11px;font-weight:700;letter-spacing:.06em">${tipeLabel}</span>
    </div>
    <div style="border-top:1px dashed #999;margin:4px 0"></div>
    ${items}
    ${t.diskon>0?`<div style="border-top:1px dashed #999;margin:4px 0"></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#a32d2d"><span>Diskon</span><span>- ${fmtRp(t.diskon)}</span></div>`:''}
    <div style="border-top:1px dashed #999;margin:4px 0"></div>
    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:14px"><span>TOTAL</span><span>${fmtRp(t.total)}</span></div>
    ${t.bayar?`<div style="display:flex;justify-content:space-between;font-size:12px"><span>Bayar</span><span>${fmtRp(t.bayar)}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700"><span>Kembali</span><span>${fmtRp(t.kembali||0)}</span></div>`:''}
    <div style="border-top:1px solid #333;margin:6px 0"></div>
    <div style="text-align:center;font-size:10px;color:#666">Terima kasih telah berbelanja!</div>
    <div style="text-align:center;font-size:10px;color:#666">Barang yang sudah dibeli tidak dapat dikembalikan.</div>
    <div style="text-align:center;font-weight:700;font-size:12px;margin-top:4px">*** ${t.status==='lunas'?'LUNAS':'PENDING'} ***</div>
  </div>`;
}

// ---- EXPORT ----
function exportCSV(data, filename) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const rows = [keys.join(',')];
  data.forEach(row => {
    rows.push(keys.map(k => {
      let v = row[k] ?? '';
      if (typeof v === 'string' && (v.includes(',') || v.includes('"'))) v = '"' + v.replace(/"/g,'""') + '"';
      return v;
    }).join(','));
  });
  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

async function exportExcel(transaksi, filename) {
  if (!window.XLSX) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  const rows = transaksi.map(t => ({
    'Kode': t.kode,
    'Tipe': {agen:'Agen',ecer:'Ecer',mix:'Agen+Ecer'}[t.tipe]||t.tipe,
    'Pembeli': t.nama_pembeli||'-',
    'Telepon': t.telp||'-',
    'Items': t.items.map(i=>`${i.nama} x${i.qty}`).join('; '),
    'Subtotal': t.subtotal||t.total,
    'Diskon': t.diskon||0,
    'Total': t.total,
    'Status': {pending:'Pending',lunas:'Lunas',batal:'Batal'}[t.status]||t.status,
    'Admin': t.created_by||'-',
    'Kasir': t.processed_by||'-',
    'Tgl Buat': fmtDate(t.created_at),
    'Tgl Lunas': t.status==='lunas'?fmtDate(t.updated_at):'-',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
  XLSX.writeFile(wb, filename);
}
