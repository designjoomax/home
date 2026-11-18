const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const DEF = () => JSON.parse(JSON.stringify(JadwalKerja.defaults));
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} };
let cfg; try { cfg = JSON.parse(store('jkDemoCfg4')); } catch (e) {}
if (!cfg || !cfg.shifts || !cfg.data || !cfg.data.manual || !cfg.badge || !cfg.badge.types || !cfg.verify || !cfg.nameStyle || !cfg.list || !cfg.verify.checkout) cfg = DEF();
cfg.badge.people.forEach(p => { if (!p.labels) p.labels = [cfg.badge.verifiedType]; });
let tab = store('jkTab') || 'teks', editOn = store('jkEdit') !== '0', inst, tm;

const get = p => p.split('.').reduce((o, k) => o == null ? o : o[k], cfg);
const set = (p, v) => { const k = p.split('.'), l = k.pop(); k.reduce((o, x) => o[x], cfg)[l] = v; };
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hex = c => /^#[0-9a-f]{6}$/i.test(c || '') ? c : '#333333';
const strip = s => String(s == null ? '' : s).replace(/[\uFE0E\uFE0F\u200B-\u200D\uFEFF]/g, '');
const nk = s => strip(s).trim().toLowerCase();
const parseBg = s => { const m = String(s || '').match(/#[0-9a-f]{6}/gi) || [];
  return { g: /gradient/.test(s || ''), m: m.length >= 3, c1: m[0] || '#cccccc', c3: m.length >= 3 ? m[1] : (m[1] || m[0] || '#cccccc'), c2: m.length >= 3 ? m[2] : (m[1] || m[0] || '#cccccc') }; };
const toast = t => { const e = $('#toast'); e.textContent = t; e.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('show'), 2600); };

/* ---------- data manual ---------- */
const MAN = () => cfg.data.manual;
const nDays = () => new Date(MAN().year, MAN().month, 0).getDate();
const toArr = (s, n) => { const a = Array.from(strip(s)).map(c => /[.\s·]/.test(c) ? '' : c); while (a.length < n) a.push(''); return a.slice(0, n); };
const fromArr = a => a.map(c => c || '.').join('');
const shiftBy = sym => cfg.shifts.find(s => s.symbol === sym);
const symOf = c => { const k = nk(c); if (!k) return ''; const s = cfg.shifts.find(x => [x.key, x.symbol, x.label].concat(x.aliases || []).some(a => a && nk(a) === k)); return s ? s.symbol : strip(c).trim(); };
const cellBg = sym => { const s = shiftBy(sym); return s ? `background:${esc(s.bg)};color:${esc(s.color)}` : ''; };

/* ---------- pembangun form ---------- */
const inp = (p, label, t = 'text', extra = '') => `<label>${label}<input type="${t}" data-p="${p}" data-t="${t}" ${extra} value="${esc(get(p))}"></label>`;
const area = (p, label) => `<label>${label}<textarea data-p="${p}" data-t="lines">${esc((get(p) || []).join('\n'))}</textarea></label>`;
const chk = (p, label) => `<label class="chk"><input type="checkbox" data-p="${p}" data-t="b" ${get(p) ? 'checked' : ''}>${label}</label>`;
const col = (p, label) => `<label>${label || p.split('.').pop()}<input type="color" data-p="${p}" data-t="c" value="${hex(get(p))}"></label>`;
const list = (p, label) => `<label>${label}<input type="text" data-p="${p}" data-t="list" value="${esc((get(p) || []).join(', '))}"></label>`;
const sel = (p, label, opts, t = 'text') => `<label>${label}<select data-p="${p}" data-t="${t}">${opts.map(o => `<option value="${esc(o[0])}" ${String(get(p)) === String(o[0]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select></label>`;
const st = (p, o2) => { const o = get(p), b = parseBg(o.bg), opt = o2 && o2.opt, noText = o2 && o2.noText;
  return `<div class="st" data-st="${p}">${opt ? `<label class="chk"><input type="checkbox" data-k="on" ${o.bg ? 'checked' : ''}>Warna kustom</label>` : ''}<label>Warna<input type="color" data-k="c1" value="${b.c1}"></label>
  <label class="chk"><input type="checkbox" data-k="g" ${b.g ? 'checked' : ''}>Gradasi</label>
  <span data-k="gw" style="${b.g ? '' : 'display:none'}"><input type="color" data-k="c2" value="${b.c2}"><label class="chk"><input type="checkbox" data-k="m" ${b.m ? 'checked' : ''}>Tengah</label><input type="color" data-k="c3" value="${b.c3}" style="${b.m ? '' : 'display:none'}"></span>
  ${noText ? '' : `<label>Teks<input type="color" data-k="tc" value="${hex(o.color)}"></label>`}</div>`; };

/* ikon: ketik lokasi / link / emoji, atau upload file dari komputer */
const isPath = u => /[\/.]/.test(u) || /^data:/i.test(u);
const thumb = u => !u ? '' : isPath(u) ? `<img class="icp" src="${esc(u)}" alt="">` : `<span class="icp emo">${esc(u)}</span>`;
const iconField = (p, label, big) => { const v = get(p) || ''; return `<div class="fld"><span class="fl">${label}</span><div class="icf"><input type="text" data-p="${p}" data-t="text" list="icons" placeholder="assets/icon/..., https://..., atau emoji" value="${esc(v)}"><button type="button" class="mini" data-upload="${big ? 'big:' : ''}${p}">Upload</button><span class="th">${thumb(v)}</span></div>${v.startsWith('data:') ? `<a class="dl" download="icon.png" href="${esc(v)}">Unduh file hasil upload (simpan ke assets/icon/ agar kode lebih ringkas)</a>` : ''}</div>`; };
function readIcon(file, cb, max = 128, mime = 'image/png') {
  const fr = new FileReader();
  fr.onload = () => { if (file.type === 'image/svg+xml') return cb(fr.result);
    const img = new Image(); img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
      const x = c.getContext('2d'); if (mime === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); } x.drawImage(img, 0, 0, c.width, c.height); cb(c.toDataURL(mime, 0.85)); }; img.src = fr.result; };
  fr.readAsDataURL(file);
}
const featO = f => typeof f === 'string' ? { text: f, note: '', icon: '' } : { text: f.text || '', note: f.note || '', icon: f.icon || '' };
function setFeature(i, j, k, v) { const arr = cfg.verify.plans[i].features, cur = featO(arr[j]); cur[k] = k === 'text' ? v : String(v).trim();
  arr[j] = !cur.note && !cur.icon ? cur.text : Object.assign({ text: cur.text }, cur.note ? { note: cur.note } : {}, cur.icon ? { icon: cur.icon } : {}); }
const icoBtn = ic => JadwalKerja.iconSvg(ic || cfg.verify.featureIcon || 'check') || '·';
function setLabelField(i, j, k, v) { const arr = cfg.badge.people[i].labels, cur = lbl(arr[j]); if (k === 'enabled') cur.enabled = !!v; else cur[k] = String(v).trim();
  arr[j] = !cur.label && !cur.icon && cur.enabled ? cur.id : Object.assign({ id: cur.id }, cur.label ? { label: cur.label } : {}, cur.icon ? { icon: cur.icon } : {}, cur.enabled ? {} : { enabled: false }); }

/* ---------- isi tiap tab ---------- */
const tTeks = () => `
  ${inp('texts.label', 'Teks kecil di atas judul')}${inp('texts.title', 'Judul besar ({MMMM} bulan, {MMM}, {YYYY} tahun)')}${inp('texts.searchPlaceholder', 'Teks kotak pencarian')}
  <div class="row2">${inp('texts.viewAll', 'Tombol buka daftar')}${inp('texts.collapse', 'Tombol tutup daftar')}</div>
  <div class="row2">${inp('texts.todayButton', 'Tombol "Hari ini"')}${inp('texts.emptyDay', 'Teks hari kosong')}</div>
  <div class="row2">${inp('texts.noPerson', 'Nama tidak ketemu')}${inp('texts.noData', 'Data belum ada')}</div>
  <details><summary>Nama hari &amp; bulan (ganti bahasa)</summary>${list('texts.dayNames', 'Nama hari, mulai Minggu (7 item)')}${list('texts.monthNames', 'Nama bulan (12 item)')}</details>`;

const tTampilan = () => `
  <div class="card2"><h4>Tampilan</h4>
  ${chk('showSearch', 'Kotak "Cari Nama"')}${chk('showRole', 'Tampilkan jabatan')}${chk('showTodayButton', 'Tombol "Hari ini"')}${chk('highlightToday', 'Tandai tanggal hari ini')}
  ${chk('mergeSameShift', 'Gabungkan shift sama berurutan jadi 1 bar')}${chk('uppercase', 'Teks shift HURUF BESAR')}${chk('showTime', 'Tampilkan jam di dalam bar')}${chk('rememberPerson', 'Ingat karyawan terakhir yang dipilih')}
  ${sel('rolePosition', 'Posisi jabatan', [['below', 'Di bawah nama'], ['beside', 'Di samping nama']])}
  <div class="row2">${sel('weekStart', 'Minggu mulai hari', [[1, 'Senin'], [0, 'Minggu']], 'n')}${sel('startWeek', 'Buka di', [['today', 'Minggu ini'], ['first', 'Minggu pertama']])}</div>
  ${inp('compactLabelChars', 'Bar 1 hari: kecilkan teks jika lebih dari ... huruf', 'number', 'min="0"')}
  <div class="row2">${inp('dateFormat', 'Format tanggal')}${inp('defaultPerson', 'Karyawan awal (nama)')}</div></div>
  <div class="card2"><h4>Warna &amp; ukuran</h4>
  <div class="row3">${col('theme.text', 'Teks')}${col('theme.muted', 'Teks redup')}${col('theme.cardBg', 'Latar kartu')}${col('theme.border', 'Garis')}${col('theme.accent', 'Aksen')}</div>
  <div class="row3">${inp('theme.radius', 'Radius kartu')}${inp('theme.maxWidth', 'Lebar maks')}${inp('theme.barRadius', 'Radius bar')}</div>
  <div class="row3">${inp('theme.barHeight', 'Tinggi bar')}${inp('theme.barFont', 'Font bar')}${inp('theme.font', 'Font (CSS)')}</div>
  <div class="row2">${col('theme.viewAllBg', 'Tombol View All')}${col('theme.viewAllColor', 'Teks tombol')}</div></div>
  <div class="card2"><h4>Daftar semua karyawan (View All)</h4>
  ${chk('showViewAll', 'Tombol View All / Collapse')}${chk('list.startExpanded', 'Buka langsung dalam mode daftar')}
  ${chk('list.showBadges', 'Tampilkan ikon label di daftar')}${chk('list.showUnverified', 'Tampilkan juga ikon non-verified')}${chk('list.showRole', 'Tampilkan jabatan di bawah nama')}
  <div class="row2">${inp('list.height', 'Tinggi area daftar (scroll)')}${inp('list.nameWidth', 'Lebar kolom nama')}</div>
  <div class="row3">${inp('list.barHeight', 'Tinggi bar')}${inp('list.barFont', 'Font bar')}${inp('list.badgeSize', 'Ukuran ikon')}</div>
  ${sel('list.clickName', 'Klik nama di daftar', [['select', 'Tampilkan karyawan itu'], ['none', 'Tidak ngapa-ngapain']])}</div>`;

/* ---------- tab Nama ---------- */
const tNama = () => { const N = cfg.nameStyle; return `
  <div class="card2"><h4>Warna nama semua karyawan</h4><p class="hint">Tidak dicentang = pakai warna teks tema. Pilih warna solid atau gradasi; gradasi bisa dibuat berjalan.</p>
    ${st('nameStyle.default', { opt: true, noText: true })}${chk('nameStyle.default.animate', 'Gradasi berjalan (animasi)')}${inp('nameStyle.default.speed', 'Kecepatan animasi (mis. 3s, makin kecil makin cepat)')}</div>
  <div class="card2"><h4>Warna nama khusus karyawan</h4><p class="hint">Menimpa pengaturan semua karyawan. Nama harus sama dengan di sheet.</p>
    ${N.people.map((p, i) => `<div class="item"><div class="ih">${chk(`nameStyle.people.${i}.enabled`, 'Aktif')}<button class="mini" data-delnp="${i}">Hapus</button></div>
      ${inp(`nameStyle.people.${i}.name`, 'Nama', 'text', 'list="bn"')}${st(`nameStyle.people.${i}`, { opt: true, noText: true })}
      ${chk(`nameStyle.people.${i}.animate`, 'Gradasi berjalan (animasi)')}${inp(`nameStyle.people.${i}.speed`, 'Kecepatan animasi (mis. 3s)')}</div>`).join('')}
    <div class="add"><button data-addnp>+ Karyawan</button></div></div>`; };



const GRIP = '<svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor" aria-hidden="true"><circle cx="4" cy="4" r="1.7"/><circle cx="10" cy="4" r="1.7"/><circle cx="4" cy="10" r="1.7"/><circle cx="10" cy="10" r="1.7"/><circle cx="4" cy="16" r="1.7"/><circle cx="10" cy="16" r="1.7"/></svg>';
const lbl = l => typeof l === 'string' ? { id: l, label: '', icon: '', enabled: true } : { id: l.id, label: l.label || '', icon: l.icon || '', enabled: l.enabled !== false };
const tLabel = () => { const B = cfg.badge, T = B.types; return `
  ${chk('badge.enabled', 'Aktifkan label (saklar utama)')}
  <div class="card2"><h4>Tampilan label</h4>
    <div class="row3">${inp('badge.size', 'Ukuran ikon')}${inp('badge.gap', 'Jarak antar label')}${inp('badge.autoHideMs', 'Auto tutup (ms)', 'number', 'min="0"')}</div>
    ${sel('badge.trigger', 'Teks muncul saat', [['click', 'Ikon diklik'], ['hover', 'Kursor di atas ikon'], ['always', 'Selalu tampil'], ['none', 'Tidak tampil']])}
    <div class="row2">${col('badge.tipBg', 'Warna latar teks')}${col('badge.tipColor', 'Warna tulisan')}</div></div>
  <div class="card2"><h4>Jenis label</h4><p class="hint">Tambah jenis baru (mis. "Creative Pro"). Jenis baru otomatis dipasang ke karyawan pertama; atur siapa yang memakainya di "Karyawan &amp; label" di bawah. Label hanya tampil di preview kalau sudah dipasang ke karyawan.</p>
    ${T.map((t, i) => `<div class="item"><div class="ih"><b>${esc(t.label || t.id)}</b><button class="mini" data-deltype="${i}">Hapus</button></div>
      <div class="row2">${inp(`badge.types.${i}.label`, 'Teks saat ikon diklik')}${inp(`badge.types.${i}.id`, 'Kode unik', 'text', 'data-id="1"')}</div>
      ${iconField(`badge.types.${i}.icon`, 'Ikon (kosong = centang bawaan)')}</div>`).join('')}
    <div class="add"><button data-addtype>+ Jenis label</button></div>
    ${sel('badge.verifiedType', 'Jenis yang dihitung "sudah verified"', T.map(t => [t.id, t.label || t.id]))}</div>
  <div class="card2"><h4>Belum verified</h4>
    ${chk('badge.unverified.enabled', 'Tampilkan ikon non-verified untuk yang belum verified')}
    ${iconField('badge.unverified.icon', 'Ikon non-verified')}${inp('badge.unverified.label', 'Teks saat ikon diklik')}
    ${chk('badge.unverified.button.enabled', 'Tampilkan tombol Get Verified')}${inp('badge.unverified.button.text', 'Teks tombol')}
    <div class="row3">${col('badge.unverified.button.color', 'Warna teks')}${col('badge.unverified.button.bg', 'Latar')}${col('badge.unverified.button.border', 'Garis')}</div></div>
  <div class="card2"><h4>Karyawan &amp; label</h4><p class="hint">Nama harus sama dengan di sheet. Yang tidak terdaftar dianggap belum verified.</p>
    ${B.people.map((p, i) => `<div class="item"><div class="ih">${chk(`badge.people.${i}.enabled`, 'Aktif')}<button class="mini" data-delbp="${i}">Hapus</button></div>
      ${inp(`badge.people.${i}.name`, 'Nama', 'text', 'list="bn"')}
      <p class="hint">Label tampil sesuai urutan di bawah. Tahan <b>⋮⋮</b> lalu geser untuk mengubah urutan; saklar untuk menampilkan / menyembunyikan.</p>
      <div class="lbls" data-lbs="${i}">${(p.labels || []).map((l0, j) => { const l = lbl(l0), K = i + '.' + j; return `<div class="lbl ${l.enabled ? '' : 'off'}" data-j="${j}">
        <div class="l1"><span class="dh" data-drag tabindex="0" role="button" aria-label="Geser untuk mengubah urutan (atau tombol panah atas/bawah)" title="Tahan &amp; geser untuk mengubah urutan">${GRIP}</span>
          <label class="tg" title="Tampilkan / sembunyikan label ini"><input type="checkbox" data-lp="${K}" data-lk="enabled" ${l.enabled ? 'checked' : ''}><i></i></label>
          <select data-lp="${K}" data-lk="id">${T.map(t => `<option value="${esc(t.id)}" ${t.id === l.id ? 'selected' : ''}>${esc(t.label || t.id)}</option>`).join('')}</select>
          <button class="mini del" data-dellb="${K}" title="Hapus label">×</button></div>
        <div class="l2"><input type="text" placeholder="Teks khusus (opsional)" data-lp="${K}" data-lk="label" value="${esc(l.label)}"></div>
        <div class="icf"><input type="text" placeholder="Ikon khusus (opsional)" list="icons" data-lp="${K}" data-lk="icon" value="${esc(l.icon)}"><button type="button" class="mini" data-upload="lp:${K}">Upload</button><span class="th">${thumb(l.icon)}</span></div></div>`; }).join('')}</div>
      <button class="mini" data-addlb="${i}">+ Label</button></div>`).join('')}
    <div class="add"><button data-addbp>+ Karyawan</button></div></div>`; };

/* ---------- products.json untuk Fixs.Arts Checkout ---------- */
const faId = v => /^[a-z0-9-]{1,40}$/.test(v);
const pkgName = p => [p.name, String(p.period || '').replace(/^\s*\/\s*/, '')].filter(Boolean).join(' ');
const toInt = v => parseInt(String(v == null ? '' : v).replace(/\D/g, ''), 10) || 0;
function buildProducts() {
  const co = cfg.verify.checkout, prods = {};
  cfg.verify.plans.forEach(p => { const pid = String(p.product || co.product || '').trim(); if (!pid) return;
    const e = prods[pid] = prods[pid] || { name: pid === co.product ? co.productName : pid, packages: {} };
    e.packages[p.package || p.id] = { name: pkgName(p), price: toInt(p.price) }; });
  return { version: 1, currency: 'IDR', siteName: co.siteName || '', products: prods };
}
function fillPJ() {
  const pj = $('#pj'); if (!pj) return;
  const d = buildProducts(), bad = []; pj.value = JSON.stringify(d, null, 2) + '\n';
  Object.keys(d.products).forEach(pid => { if (!faId(pid)) bad.push('produk "' + pid + '"'); Object.keys(d.products[pid].packages).forEach(k => { if (!faId(k)) bad.push('paket "' + k + '"'); if (!d.products[pid].packages[k].price) bad.push('harga paket "' + k + '" kosong'); }); });
  const w = $('#fawarn'); if (w) w.textContent = bad.length ? 'Periksa: ' + bad.join(', ') + '. ID hanya huruf kecil, angka, "-" (maks. 40 karakter); harga angka bulat Rupiah.' : '';
}

const tPaket = () => { const V = cfg.verify; return `
  ${chk('verify.enabled', 'Aktifkan popup paket (tombol Get Verified)')}
  <div class="card2"><h4>Tampilan kartu paket</h4>
    ${chk('verify.showNormalPrice', 'Tampilkan harga normal (dicoret) di atas harga promo')}${chk('verify.showThumb', 'Tampilkan thumb di atas kartu')}${chk('verify.uppercaseName', 'Nama paket HURUF BESAR')}
    <div class="fld"><span class="fl">Ikon bawaan benefit (untuk benefit yang belum dipilihkan ikon)</span><div class="icf"><button type="button" class="ibtn" data-picki="def" title="Pilih ikon">${icoBtn(V.featureIcon)}</button><span class="hint">Ikon per benefit dipilih di tiap paket di bawah.</span></div></div></div>
  <div class="card2"><h4>Fixs.Arts Checkout</h4>
    ${chk('verify.checkout.enabled', 'Arahkan tombol paket ke Fixs.Arts Checkout')}
    <div class="row2">${inp('verify.checkout.product', 'ID produk', 'text', 'maxlength="40"')}${inp('verify.checkout.productName', 'Nama produk')}</div>
    ${inp('verify.checkout.siteName', 'Nama website')}
    <p class="hint warn" id="fawarn"></p>
    <label>data/products.json (otomatis dari paket di bawah; simpan di Jadwal Kerja/data/)<textarea id="pj" readonly style="min-height:170px"></textarea></label>
    <div class="add"><button data-copypj>Salin</button><button data-dlpj>Unduh products.json</button></div>
    <p class="hint">ID paket = "Kode unik" tiap paket, harga = "Harga promo". Di halaman demo script checkout tidak dimuat, jadi klik paket hanya menampilkan pesan terima kasih; di web (halaman yang memuat fa-checkout.js) klik langsung membuka checkout.</p></div>
  <div class="card2"><h4>Teks popup</h4>${inp('verify.title', 'Judul')}${inp('verify.subtitle', 'Sub judul ({name} = nama karyawan)')}
    <div class="row2">${inp('verify.popularText', 'Tag "Populer"')}${inp('verify.closeText', 'Tombol tutup')}</div>
    ${sel('verify.afterSelect', 'Setelah paket dipilih', [['message', 'Tampilkan pesan terima kasih'], ['close', 'Langsung tutup']])}${inp('verify.selectedText', 'Pesan ({plan}, {name})')}</div>
  <div class="card2"><h4>Paket</h4>
    ${V.plans.map((p, i) => `<div class="item"><div class="ih"><b>${esc(p.name)}</b><button class="mini" data-delplan="${i}">Hapus</button></div>
      <div class="row2">${inp(`verify.plans.${i}.name`, 'Nama paket')}${inp(`verify.plans.${i}.id`, 'Kode unik')}</div>
      <div class="row3">${inp(`verify.plans.${i}.normalPrice`, 'Harga normal (dicoret)')}${inp(`verify.plans.${i}.price`, 'Harga promo')}${inp(`verify.plans.${i}.period`, 'Periode')}</div>
      ${inp(`verify.plans.${i}.desc`, 'Deskripsi singkat')}
      <h5>Thumb (gambar di atas kartu)</h5>
      ${sel(`verify.plans.${i}.thumb`, 'Template modern', [['', 'Tanpa template'], ...JadwalKerja.thumbs.map(t => [t, t])])}
      ${iconField(`verify.plans.${i}.thumbImage`, 'Atau gambar sendiri (upload / link), menimpa template', true)}
      ${iconField(`verify.plans.${i}.icon`, 'Ikon di tengah thumb template (kosong = ikon Verified)')}
      <h5>Benefit</h5>
      ${(p.features || []).map((f0, j) => { const f = featO(f0); return `<div class="frow"><button type="button" class="ibtn" data-picki="${i}.${j}" title="Pilih ikon">${icoBtn(f.icon)}</button>
        <input type="text" data-fp="${i}.${j}" data-fk="text" placeholder="Teks benefit" value="${esc(f.text)}"><input type="text" data-fp="${i}.${j}" data-fk="note" placeholder="Keterangan kecil (opsional)" value="${esc(f.note)}"><button class="mini" data-delf="${i}.${j}">×</button></div>`; }).join('')}
      <button class="mini" data-addf="${i}">+ Benefit</button>
      <div class="row2">${col(`verify.plans.${i}.color`, 'Warna paket')}${inp(`verify.plans.${i}.button`, 'Teks tombol')}</div>
      ${inp(`verify.plans.${i}.url`, 'Link tujuan saat dipilih (opsional; boleh {name} {plan} {id})')}${chk(`verify.plans.${i}.popular`, 'Tandai "Populer" (disorot)')}</div>`).join('')}
    <div class="add"><button data-addplan>+ Paket</button></div></div>
  <div class="card2"><h4>Uji &amp; panggil dari script lain</h4>
    <div class="add"><button data-testgv>Tes popup di widget</button><button data-testext>Tes dari script lain</button></div>
    <pre class="snip">${esc(`// buka popup dari script mana pun di halaman
JadwalKerja.openVerify('Nama Karyawan');

// tangkap paket yang dipilih
document.addEventListener('jadwalkerja:verify', e => {
  console.log(e.detail.plan, e.detail.person);
});`)}</pre></div>`; };

const tShift = () => `${cfg.shifts.map((s, i) => { const P = k => `shifts.${i}.${k}`; return `<div class="card2"><div class="ih"><b>${esc(s.label)}</b><button class="mini" data-delshift="${i}">Hapus</button></div>
    <div class="row2">${inp(P('label'), 'Teks yang tampil')}${inp(P('symbol'), 'Simbol (di sheet / data manual)')}</div>
    <div class="row2">${inp(P('key'), 'Kode unik')}${inp(P('time'), 'Jam (opsional)')}</div>
    ${list(P('aliases'), 'Nama lain di sheet (pisah koma)')}${st(`shifts.${i}`)}</div>`; }).join('')}
  <div class="add"><button data-addshift>+ Jenis shift</button></div>`;

const tData = () => { const d = cfg.data, SY = d.source === 'sheet'; return `
  <div class="card2"><h4>Sumber data</h4>
  ${sel('data.source', 'Sumber', [['sheet', 'Google Sheet'], ['manual', 'Manual (tabel di bawah)']])}
  ${SY ? inp('data.sheetUrl', 'Link CSV tab "Jadwal Kerja"') + inp('data.refreshMinutes', 'Refresh tiap (menit)', 'number', 'min="0"') + chk('data.fallbackToManual', 'Pakai data manual jika sheet gagal') : ''}
  <details><summary>Nama kolom &amp; periode</summary>
    <div class="row3">${inp('data.layout.nameColumn', 'Kolom nama')}${inp('data.layout.roleColumn', 'Kolom jabatan')}${inp('data.layout.legendColumn', 'Kolom keterangan')}</div>
    <div class="row2">${inp('data.period.month', 'Paksa bulan (0 = otomatis)', 'number', 'min="0" max="12"')}${inp('data.period.year', 'Paksa tahun (0 = otomatis)', 'number', 'min="0"')}</div></details></div>
  <div class="card2"><h4>Data manual</h4>
  <div class="hint">${SY ? 'Sumber sekarang Google Sheet, jadi preview mengikuti sheet. Tabel ini dipakai jika sumber = Manual (atau jika sheet gagal dimuat).' : 'Ubah tabel ini, preview langsung berubah.'}</div>
  <div class="row2">${inp('data.manual.month', 'Bulan (1-12)', 'number', 'min="1" max="12"')}${inp('data.manual.year', 'Tahun', 'number', 'min="2000"')}</div>
  <div class="add"><button data-loadsheet>Muat data dari Google Sheet ke tabel</button><span id="msg" class="hint"></span></div>
  <div class="add" id="bulk"></div><div id="manual"></div></div>`; };

const TABS = [['teks', 'Teks', tTeks], ['tampilan', 'Tampilan', tTampilan], ['nama', 'Nama', tNama], ['label', 'Label', tLabel], ['paket', 'Paket', tPaket], ['shift', 'Shift', tShift], ['data', 'Data', tData]];
function setTab(t) {
  tab = t; store('jkTab', t);
  $$('[data-tab]').forEach(s => { s.hidden = s.dataset.tab !== t; });
  $$('[data-tab-btn]').forEach(b => b.classList.toggle('on', b.dataset.tabBtn === t));
}
function renderPanel() {
  const keep = $('#panel').scrollTop;
  $('#tabs').innerHTML = TABS.map(t => `<button data-tab-btn="${t[0]}">${t[1]}</button>`).join('');
  $('#panel').innerHTML = TABS.map(t => `<section data-tab="${t[0]}">${t[2]()}</section>`).join('') +
    `<datalist id="icons"><option value="assets/icon/Verified.png"><option value="assets/icon/Non Verified.png"></datalist><datalist id="bn">${MAN().people.map(p => `<option value="${esc(p.name)}">`).join('')}</datalist>`;
  setTab(tab); renderManual(); fillPJ(); $('#panel').scrollTop = keep;
}

function renderManual() {
  const M = MAN(), n = nDays(), X = cfg.texts, opts = cur => '<option value="">·</option>' + cfg.shifts.map(s => `<option value="${esc(s.symbol)}" ${s.symbol === cur ? 'selected' : ''}>${esc(s.symbol)} ${esc(s.label)}</option>`).join('');
  if (!$('#manual')) return;
  M.people.forEach(p => { if (typeof p.days !== 'string') p.days = fromArr(toArr(Array.isArray(p.days) ? p.days.map(symOf).join('') : '', n)); });
  const dnm = d => (X.dayNames[new Date(M.year, M.month - 1, d).getDay()] || '').slice(0, 3);
  $('#bulk').innerHTML = `<select id="bd" style="width:96px;margin:0">${X.dayNames.map((x, i) => `<option value="${i}">${esc(x)}</option>`).join('')}</select>
    <select id="bs" style="width:130px;margin:0">${opts('')}</select><button data-applybulk>Terapkan ke semua karyawan</button>`;
  $('#manual').innerHTML = `<div class="gscroll"><table class="mg"><thead><tr><th>Nama</th><th>Jabatan</th><th>Isi semua</th>` +
    Array.from({ length: n }, (_, i) => `<th>${i + 1}<small>${esc(dnm(i + 1))}</small></th>`).join('') + '<th></th></tr></thead><tbody>' +
    M.people.map((p, i) => { const a = toArr(p.days, n);
      return `<tr><td class="nm"><input class="t" data-pn="${i}" value="${esc(p.name)}"></td><td><input class="t" data-pr="${i}" value="${esc(p.role)}"></td>
      <td><select class="fill" data-fill="${i}">${opts('')}</select></td>` +
      a.map((c, d) => `<td><select data-pi="${i}" data-d="${d}" style="${cellBg(c)}">${opts(c)}</select></td>`).join('') +
      `<td><button class="mini" data-delperson="${i}">×</button></td></tr>`; }).join('') +
    '</tbody></table></div><div class="add"><button data-addperson>+ Karyawan</button></div>';
}

/* ---------- output kode & preview ---------- */
const diff = (d, c) => { if (Array.isArray(c) || !c || typeof c !== 'object') return JSON.stringify(d) === JSON.stringify(c) ? undefined : c;
  const o = {}; for (const k in c) { const r = diff(d && d[k], c[k]); if (r !== undefined) o[k] = r; } return Object.keys(o).length ? o : undefined; };
function upd() {
  store('jkDemoCfg4', JSON.stringify(cfg)); fillPJ();
  $('#out').value = buildConfigFile();
  clearTimeout(tm);
  tm = setTimeout(() => { const ex = inst && inst.isExpanded(); inst && inst.destroy(); $('#pv').innerHTML = ''; const d = document.createElement('div'); $('#pv').appendChild(d); inst = JadwalKerja.init(d, cfg); inst.setEditMode(editOn); if (ex) inst.setExpanded(true); }, 250);
}
function syncEdit() { $('#edit').checked = editOn; $('#hint').textContent = editOn ? 'Mode edit aktif: klik teks, bar shift, atau label di preview untuk membuka pengaturannya. Matikan untuk mencoba popup & tombol seperti pengunjung.' : 'Mode edit mati: preview berfungsi seperti di web asli (coba klik ikon label atau Get Verified).'; inst && inst.setEditMode(editOn); }

/* ---------- edit via klik di preview ---------- */
function scrollPanelTo(el) {                         // geser HANYA panel, bukan kontainer samping / halaman (supaya tab di atas tidak hilang)
  const P = $('#panel'), r = el.getBoundingClientRect(), pr = P.getBoundingClientRect();
  P.scrollTo({ top: Math.max(0, P.scrollTop + (r.top - pr.top) - (pr.height - r.height) / 2), behavior: 'smooth' });
}
function focusPath(p) {
  if (p.startsWith('person:')) {
    setTab('data');
    if (cfg.data.source === 'sheet') { toast('Nama ini dari Google Sheet. Ubah di sheet, atau pilih sumber data Manual.'); const s = $('[data-p="data.source"]'); scrollPanelTo(s); s.focus({ preventScroll: true }); return; }
    const i = MAN().people.findIndex(x => x.name === p.slice(7)), el = $(`[data-pn="${i}"]`); if (el) { scrollPanelTo(el); el.focus({ preventScroll: true }); el.select(); } return;
  }
  const el = $(`#panel [data-p="${p}"]`) || $(`#panel [data-p^="${p}."]`);
  if (!el) { toast('Pengaturan untuk bagian ini belum ada di panel.'); return; }
  setTab(el.closest('[data-tab]').dataset.tab);
  const dt = el.closest('details'); if (dt) dt.open = true;
  scrollPanelTo(el); el.focus({ preventScroll: true }); if (el.type === 'text') el.select();
  const b = el.closest('label') || el; b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash'); setTimeout(() => b.classList.remove('flash'), 1600);
}
$('#pv').addEventListener('click', e => {
  if (!editOn) return;
  const t = e.composedPath().find(n => n.dataset && n.dataset.edit); if (!t) return;
  e.preventDefault(); e.stopPropagation(); focusPath(t.dataset.edit);
}, true);

/* ---------- event panel ---------- */
$('#panel').addEventListener('input', e => {
  const t = e.target, p = t.dataset.p, k = t.dataset.k;
  if (t.dataset.id) return;                          // kode unik: diproses saat selesai mengetik (change)
  if (p) {
    const ty = t.dataset.t; let v = t.value;
    if (ty === 'b') v = t.checked; else if (ty === 'n' || ty === 'number') v = +v;
    else if (ty === 'list') v = v.split(',').map(x => x.trim()).filter(Boolean);
    else if (ty === 'lines') v = v.split('\n').map(x => x.trim()).filter(Boolean);
    const m = p.match(/^shifts\.(\d+)\.symbol$/);
    if (m) { const old = get(p); v = strip(v).trim(); if (!v) return;
      if (old && old !== v) MAN().people.forEach(pp => { pp.days = Array.from(strip(pp.days)).map(c => c === old ? v : c).join(''); }); }
    set(p, v);
    const icf = t.closest('.icf'); if (icf) icf.querySelector('.th').innerHTML = thumb(v);
  } else if (k) {
    const g = t.closest('.st'), o = get(g.dataset.st), q = x => g.querySelector(`[data-k="${x}"]`);
    const c1 = q('c1').value, c2 = q('c2').value, c3 = q('c3').value, gr = q('g').checked, mid = q('m').checked, on = q('on');
    q('gw').style.display = gr ? '' : 'none'; q('c3').style.display = mid ? '' : 'none';
    o.bg = on && !on.checked ? '' : !gr ? c1 : mid ? `linear-gradient(90deg,${c1} 0%,${c3} 50%,${c2} 100%)` : `linear-gradient(90deg,${c1} 0%,${c2} 100%)`; if (q('tc')) o.color = q('tc').value;
  } else if (t.dataset.lp !== undefined) {           // label milik karyawan
    const [i, j] = t.dataset.lp.split('.').map(Number), lk = t.dataset.lk, row = t.closest('.lbl');
    setLabelField(i, j, lk, lk === 'enabled' ? t.checked : t.value);
    if (lk === 'enabled' && row) row.classList.toggle('off', !t.checked);
    if (lk === 'icon' && row) row.querySelector('.th').innerHTML = thumb(t.value.trim());
  } else if (t.dataset.fp !== undefined) { const [i, j] = t.dataset.fp.split('.').map(Number); setFeature(i, j, t.dataset.fk, t.value);
  } else if (t.dataset.pn !== undefined) MAN().people[+t.dataset.pn].name = t.value;
  else if (t.dataset.pr !== undefined) MAN().people[+t.dataset.pr].role = t.value;
  else return;
  upd();
});

$('#panel').addEventListener('change', e => {
  const t = e.target, p = t.dataset.p;
  if (t.dataset.pi !== undefined) {
    const i = +t.dataset.pi, a = toArr(MAN().people[i].days, nDays()); a[+t.dataset.d] = t.value;
    MAN().people[i].days = fromArr(a); t.setAttribute('style', cellBg(t.value)); upd();
  } else if (t.dataset.fill !== undefined) {
    if (t.value === '') return; MAN().people[+t.dataset.fill].days = fromArr(Array(nDays()).fill(t.value)); renderManual(); upd();
  } else if (t.dataset.id) {                         // ganti kode unik jenis label: ikut perbarui rujukannya
    const i = +p.split('.')[2], old = t.defaultValue, nw = t.value.trim().replace(/\s+/g, '-').toLowerCase(), T = cfg.badge.types;
    if (!nw || nw === old || T.some((x, j) => j !== i && x.id === nw)) { t.value = old; return; }
    T[i].id = nw; if (cfg.badge.verifiedType === old) cfg.badge.verifiedType = nw;
    cfg.badge.people.forEach(pp => { pp.labels = (pp.labels || []).map(l => typeof l === 'string' ? (l === old ? nw : l) : (l.id === old ? Object.assign({}, l, { id: nw }) : l)); });
    renderPanel(); upd();
  } else if (p === 'data.source') { set(p, t.value); renderPanel(); upd(); }
  else if (t.dataset.lp !== undefined) { /* sudah ditangani saat input */ }
  else if (p && (/^shifts\.\d+\.(label|symbol|key)$/.test(p) || /^badge\.types\.\d+\.label$/.test(p) || /^verify\.plans\.\d+\.name$/.test(p))) renderPanel();
  else if (p && (p.startsWith('data.manual.') || p === 'texts.dayNames')) renderManual();
});

$('#panel').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const D = b.dataset, M = MAN(), B = cfg.badge;
  if (D.upload) { uploadTarget = D.upload; $('#file').click(); return; }
  if (D.picki !== undefined) { openPicker(b, D.picki); return; }
  if (D.copypj !== undefined) { const t = $('#pj'); t.select(); (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).catch(() => document.execCommand('copy')); toast('products.json disalin.'); return; }
  if (D.dlpj !== undefined) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([$('#pj').value], { type: 'application/json' })); a.download = 'products.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); return; }
  if (D.delshift !== undefined) cfg.shifts.splice(+D.delshift, 1);
  else if (D.addshift !== undefined) { const free = ['★', '●', '◆', '▲', '■', '♥', '♣', '♠'].find(c => !shiftBy(c)) || '#'; cfg.shifts.push({ key: 'shift' + (cfg.shifts.length + 1), symbol: free, label: 'Shift Baru', aliases: [], time: '', bg: 'linear-gradient(90deg,#34d399 0%,#047857 100%)', color: '#ffffff' }); }
  else if (D.addtype !== undefined) { let n = B.types.length + 1; while (B.types.some(t => t.id === 'label' + n)) n++; B.types.push({ id: 'label' + n, icon: '', label: 'Label Baru' });
    const who = B.people.find(x => x.enabled !== false && x.name); if (who) { (who.labels = who.labels || []).push('label' + n); toast('Jenis baru langsung dipasang ke "' + who.name + '" supaya terlihat di preview. Atur di bagian Karyawan & label.'); } else toast('Jenis baru belum tampil di preview. Pasang ke karyawan di bagian Karyawan & label.'); }
  else if (D.deltype !== undefined) { const t = B.types.splice(+D.deltype, 1)[0]; B.people.forEach(pp => { pp.labels = (pp.labels || []).filter(l => (typeof l === 'string' ? l : l.id) !== t.id); }); if (B.verifiedType === t.id) B.verifiedType = B.types[0] ? B.types[0].id : ''; }
  else if (D.addnp !== undefined) cfg.nameStyle.people.push({ name: '', enabled: true, bg: 'linear-gradient(90deg,#0b1f6e 0%,#4f83f5 100%)', animate: true, speed: '3s' });
  else if (D.delnp !== undefined) cfg.nameStyle.people.splice(+D.delnp, 1);
  else if (D.addbp !== undefined) B.people.push({ name: '', enabled: true, labels: [] });
  else if (D.delbp !== undefined) B.people.splice(+D.delbp, 1);
  else if (D.addlb !== undefined) { const pp = B.people[+D.addlb], used = (pp.labels || []).map(l => typeof l === 'string' ? l : l.id), t = B.types.find(x => !used.includes(x.id)) || B.types[0]; if (t) (pp.labels = pp.labels || []).push(t.id); }
  else if (D.dellb !== undefined) { const [i, j] = D.dellb.split('.').map(Number); B.people[i].labels.splice(j, 1); }
  else if (D.addf !== undefined) cfg.verify.plans[+D.addf].features.push({ text: 'Benefit baru', icon: 'check' });
  else if (D.delf !== undefined) { const [i, j] = D.delf.split('.').map(Number); cfg.verify.plans[i].features.splice(j, 1); }
  else if (D.addplan !== undefined) { let n = cfg.verify.plans.length + 1; while (cfg.verify.plans.some(x => x.id === 'paket' + n)) n++; cfg.verify.plans.push({ id: 'paket' + n, name: 'Paket Baru', normalPrice: '', price: 'Rp0', period: '/ bulan', desc: '', thumb: 'plan', thumbImage: '', color: '#1b8fe6', icon: '', popular: false, button: 'Pilih', url: '', features: [{ text: 'Benefit 1', icon: 'check' }] }); }
  else if (D.delplan !== undefined) cfg.verify.plans.splice(+D.delplan, 1);
  else if (D.testgv !== undefined) { if (!inst || !inst.openVerify('Nama Contoh')) toast('Popup tidak bisa dibuka (cek: Aktifkan popup paket & ada minimal 1 paket).'); return; }
  else if (D.testext !== undefined) { if (!JadwalKerja.openVerify('Nama Contoh', cfg)) toast('Popup tidak bisa dibuka (cek: Aktifkan popup paket & ada minimal 1 paket).'); return; }
  else if (D.addperson !== undefined) M.people.push({ name: 'Karyawan Baru', role: '', days: '.'.repeat(nDays()) });
  else if (D.delperson !== undefined) M.people.splice(+D.delperson, 1);
  else if (D.applybulk !== undefined) {
    const dow = +$('#bd').value, v = $('#bs').value, n = nDays();
    M.people.forEach(p => { const a = toArr(p.days, n); for (let d = 1; d <= n; d++) if (new Date(M.year, M.month - 1, d).getDay() === dow) a[d - 1] = v; p.days = fromArr(a); });
  } else if (D.loadsheet !== undefined) { loadSheet(); return; }
  else return;
  renderPanel(); upd();
});

async function loadSheet() {
  const msg = $('#msg');
  try {
    const u = cfg.data.sheetUrl, r = await fetch(u + (u.includes('?') ? '&' : '?') + 't=' + Date.now());
    if (!r.ok) throw 0;
    const res = JadwalKerja.parseSheet(JadwalKerja.parseMatrix(await r.text()), cfg);
    if (!res || !res.people.length) throw 0;
    const month = res.month || MAN().month, year = res.year || MAN().year, n = new Date(year, month, 0).getDate();
    const conv = c => { const s = symOf(c); return shiftBy(s) || !res.legend[nk(c)] ? s : symOf(res.legend[nk(c)]); };
    cfg.data.manual = { month, year, people: res.people.map(p => ({ name: p.name, role: p.role, days: fromArr(Array.from({ length: n }, (_, i) => conv(p.days[i] || ''))) })) };
    renderPanel(); upd(); $('#msg').textContent = 'Berhasil: ' + res.people.length + ' karyawan dimuat.';
  } catch (e) { msg.textContent = 'Gagal memuat sheet. Cek link dan pastikan tab sudah Publish to web (CSV).'; }
}

/* ---------- tab (klik) & upload ikon ---------- */
let uploadTarget = '';
$('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab-btn]'); if (b) setTab(b.dataset.tabBtn); });
$('#file').addEventListener('change', e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  const big = uploadTarget.startsWith('big:'), tgt = big ? uploadTarget.slice(4) : uploadTarget;
  readIcon(f, url => {
    if (tgt.startsWith('lp:')) { const [i, j] = tgt.slice(3).split('.').map(Number); setLabelField(i, j, 'icon', url); } else set(tgt, url);
    renderPanel(); upd(); toast('Gambar berhasil diupload. Simpan juga file-nya ke assets/ dan isi lokasinya jika mau kode lebih ringkas.');
  }, big ? 720 : 128, big ? 'image/jpeg' : 'image/png');
});

/* ---------- pemilih ikon benefit ---------- */
let pickTarget = '';
function closePicker() { $('#picker').hidden = true; }
function openPicker(btn, target) {
  pickTarget = target;
  $('#picker').innerHTML = `<div class="pgrid">${Object.keys(JadwalKerja.icons).map(n => `<button type="button" data-pickic="${n}" title="${n}">${JadwalKerja.iconSvg(n)}</button>`).join('')}</div>
    <div class="pcus"><input type="text" id="pcus" placeholder="atau emoji / link gambar"><button type="button" class="mini" data-pickok>OK</button><button type="button" class="mini" data-pickclr>Kosongkan</button></div>`;
  const r = btn.getBoundingClientRect(), p = $('#picker'); p.hidden = false;
  p.style.left = Math.max(8, Math.min(r.left, innerWidth - p.offsetWidth - 8)) + 'px'; p.style.top = Math.min(r.bottom + 6, innerHeight - p.offsetHeight - 8) + 'px';
}
function applyPick(v) {
  if (pickTarget === 'def') cfg.verify.featureIcon = v || 'check'; else { const [i, j] = pickTarget.split('.').map(Number); setFeature(i, j, 'icon', v); }
  closePicker(); renderPanel(); upd();
}
$('#picker').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.pickic) applyPick(b.dataset.pickic); else if (b.dataset.pickok !== undefined) applyPick($('#pcus').value.trim()); else if (b.dataset.pickclr !== undefined) applyPick('');
});
document.addEventListener('click', e => { if (!e.target.closest('#picker') && !e.target.closest('[data-picki]')) closePicker(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePicker(); });

/* ---------- bar atas ---------- */

$('#edit').addEventListener('change', e => { editOn = e.target.checked; store('jkEdit', editOn ? '1' : '0'); syncEdit(); });
$('#wd').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('#wd button').forEach(x => x.classList.toggle('on', x === b)); $('#pvin').style.maxWidth = b.dataset.w; });
$('#reset').onclick = () => { cfg = DEF(); renderPanel(); upd(); toast('Pengaturan dikembalikan ke bawaan.'); };
/* ---------- urutan label: geser (mouse & sentuh) + tombol panah ---------- */
let drag = null;
const lblOrder = box => [...box.children].filter(x => x.classList.contains('lbl')).map(x => +x.dataset.j);
function moveLabels(i, order) {
  const arr = cfg.badge.people[i].labels; cfg.badge.people[i].labels = order.map(j => arr[j]); renderPanel(); upd();
}
$('#panel').addEventListener('pointerdown', e => {
  const h = e.target.closest('[data-drag]'); if (!h || (e.pointerType === 'mouse' && e.button !== 0)) return;
  const it = h.closest('.lbl'), box = it.parentElement; e.preventDefault();
  drag = { it, box, pid: e.pointerId, start: lblOrder(box).join(), i: +box.dataset.lbs };
  it.classList.add('drag'); document.body.classList.add('dragging');
});
document.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.pid) return;
  const P = $('#panel'), pr = P.getBoundingClientRect();
  if (e.clientY < pr.top + 36) P.scrollTop -= 14; else if (e.clientY > pr.bottom - 36) P.scrollTop += 14;
  const sibs = [...drag.box.children].filter(x => x.classList.contains('lbl') && x !== drag.it);
  const before = sibs.find(s => { const r = s.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
  if (before) { if (drag.it.nextElementSibling !== before) drag.box.insertBefore(drag.it, before); }
  else if (sibs.length && drag.it.previousElementSibling !== sibs[sibs.length - 1]) sibs[sibs.length - 1].after(drag.it);
});
const endDrag = e => {
  if (!drag || e.pointerId !== drag.pid) return;
  const d = drag, order = lblOrder(d.box); drag = null; d.it.classList.remove('drag'); document.body.classList.remove('dragging');
  if (e.type !== 'pointercancel' && order.join() !== d.start) moveLabels(d.i, order); else if (order.join() !== d.start) renderPanel();
};
document.addEventListener('pointerup', endDrag); document.addEventListener('pointercancel', endDrag);
$('#panel').addEventListener('keydown', e => {
  const h = e.target.closest('[data-drag]'); if (!h || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
  e.preventDefault(); const it = h.closest('.lbl'), box = it.parentElement, order = lblOrder(box), k = order.indexOf(+it.dataset.j), n = k + (e.key === 'ArrowUp' ? -1 : 1);
  if (n < 0 || n >= order.length) return; [order[k], order[n]] = [order[n], order[k]];
  const i = +box.dataset.lbs; moveLabels(i, order);
  const nb = $(`[data-lbs="${i}"] .lbl:nth-child(${n + 1}) [data-drag]`); if (nb) nb.focus({ preventScroll: true });
});

/* ---------- simpan hasil: unduh pengaturan (.js) / products.json / zip ---------- */
const configJs = () => { const c = JSON.parse(JSON.stringify(cfg)); if (c.data.source === 'sheet' && !c.data.fallbackToManual) delete c.data.manual; return JSON.stringify(diff(JadwalKerja.defaults, c) || {}, null, 2); };
const CFG_FILE = 'jadwal-kerja.config.js';
function buildConfigFile() {
  return `/* Pengaturan Jadwal Kerja. Dibuat oleh demo.html (tombol "Unduh pengaturan (.js)").
   Simpan di folder js/ (js/${CFG_FILE}) dan timpa file lama setiap ada perubahan.
   Hanya berisi pengaturan yang berbeda dari bawaan. Untuk mengedit lagi: demo.html > Buka config. */
window.JADWAL_KERJA_CONFIG = ${configJs()};
`;
}
const productsText = () => JSON.stringify(buildProducts(), null, 2) + '\n';
function dlFile(name, data, type) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type: type || 'text/plain' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function makeZip(files) {                            // zip tanpa kompresi (cukup untuk file teks kecil)
  const enc = new TextEncoder(), now = new Date(), u16 = n => [n & 255, (n >> 8) & 255], u32 = n => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];
  const dt = u16((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)), dd = u16(((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate());
  const parts = [], cen = []; let off = 0;
  files.forEach(f => {
    const nm = enc.encode(f.name), d = enc.encode(f.text), crc = crc32(d);
    const lh = new Uint8Array([0x50, 0x4b, 3, 4, ...u16(20), ...u16(0x0800), ...u16(0), ...dt, ...dd, ...u32(crc), ...u32(d.length), ...u32(d.length), ...u16(nm.length), ...u16(0), ...nm]);
    cen.push(new Uint8Array([0x50, 0x4b, 1, 2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...dt, ...dd, ...u32(crc), ...u32(d.length), ...u32(d.length), ...u16(nm.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off), ...nm]));
    parts.push(lh, d); off += lh.length + d.length;
  });
  const cs = cen.reduce((a, b) => a + b.length, 0);
  return new Blob([...parts, ...cen, new Uint8Array([0x50, 0x4b, 5, 6, ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cs), ...u32(off), ...u16(0)])], { type: 'application/zip' });
}
function download(kind) {
  const FOLDER = 'Jadwal Kerja/', warn = $('#fawarn') && $('#fawarn').textContent;
  if (kind === 'config') dlFile(CFG_FILE, buildConfigFile(), 'text/javascript');
  else if (kind === 'json') dlFile('products.json', productsText(), 'application/json');
  else dlFile('Jadwal_Kerja_update.zip', makeZip([{ name: FOLDER + 'js/' + CFG_FILE, text: buildConfigFile() }, { name: FOLDER + 'data/products.json', text: productsText() }]));
  toast(kind === 'config' ? CFG_FILE + ' diunduh. Timpa file lama di folder Jadwal Kerja/js/.' : kind === 'json' ? 'products.json diunduh. Timpa file lama di Jadwal Kerja/data/.' : 'Zip diunduh. Ekstrak ke folder induk Jadwal Kerja dan timpa file lama.');
  if (warn && kind !== 'config') setTimeout(() => toast('Periksa tab Paket: ' + warn), 2800);
}
document.addEventListener('click', e => { const b = e.target.closest('[data-dl]'); if (b) download(b.dataset.dl); });

/* ---------- buka lagi config dari file pengaturan (.js) hasil unduhan ---------- */
const merge = (d, c) => { if (c === undefined) return d; if (Array.isArray(c) || !c || typeof c !== 'object') return c;
  const o = Array.isArray(d) || !d || typeof d !== 'object' ? {} : Object.assign({}, d); for (const k in c) o[k] = merge(d && d[k], c[k]); return o; };
function readConfig(text) {
  const t = text.trim(); if (t[0] === '{') return JSON.parse(t);
  const k = t.indexOf('JADWAL_KERJA_CONFIG'); if (k >= 0) { const a = t.indexOf('{', k), z = t.lastIndexOf('}'); if (a < 0 || z < a) throw new Error('format'); return JSON.parse(t.slice(a, z + 1)); }
  const m = t.match(/JadwalKerja\.init\(\s*(['"])[^'"]*\1\s*,\s*([\s\S]*?)\)\s*;?\s*(?:<\/script>|$)/); if (!m) throw new Error('init tidak ditemukan');
  return JSON.parse(m[2]);
}
$('#open').addEventListener('click', () => $('#cfgfile').click());
$('#cfgfile').addEventListener('change', e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const n = merge(DEF(), readConfig(String(fr.result)));
      if (!n.shifts || !n.data || !n.data.manual || !n.badge || !n.badge.types || !n.verify || !n.nameStyle || !n.list || !n.verify.checkout) throw new Error('format');
      cfg = n; cfg.badge.people.forEach(p => { if (!p.labels) p.labels = [cfg.badge.verifiedType]; });
      renderPanel(); upd(); toast('Config dari ' + f.name + ' berhasil dibuka.');
    } catch (err) { toast('File tidak dikenali. Pilih jadwal-kerja.config.js hasil unduhan dari demo ini.'); }
  };
  fr.readAsText(f);
});

renderPanel(); syncEdit(); upd();
