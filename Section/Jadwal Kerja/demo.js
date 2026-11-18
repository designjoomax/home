const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const DEF = () => JSON.parse(JSON.stringify(JadwalKerja.defaults));
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} };
let cfg; try { cfg = JSON.parse(store('jkDemoCfg2')); } catch (e) {}
if (!cfg || !cfg.shifts || !cfg.data || !cfg.data.manual || !cfg.badge || !cfg.badge.types || !cfg.verify) cfg = DEF();
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
const st = p => { const o = get(p), b = parseBg(o.bg);
  return `<div class="st" data-st="${p}"><label>Warna<input type="color" data-k="c1" value="${b.c1}"></label>
  <label class="chk"><input type="checkbox" data-k="g" ${b.g ? 'checked' : ''}>Gradasi</label>
  <span data-k="gw" style="${b.g ? '' : 'display:none'}"><input type="color" data-k="c2" value="${b.c2}"><label class="chk"><input type="checkbox" data-k="m" ${b.m ? 'checked' : ''}>Tengah</label><input type="color" data-k="c3" value="${b.c3}" style="${b.m ? '' : 'display:none'}"></span>
  <label>Teks<input type="color" data-k="tc" value="${hex(o.color)}"></label></div>`; };

/* ---------- isi tiap tab ---------- */
const tTeks = () => `
  ${inp('texts.label', 'Teks kecil di atas judul')}${inp('texts.title', 'Judul besar ({MMMM} bulan, {MMM}, {YYYY} tahun)')}${inp('texts.searchPlaceholder', 'Teks kotak pencarian')}
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
  <div class="row3">${inp('theme.barHeight', 'Tinggi bar')}${inp('theme.barFont', 'Font bar')}${inp('theme.font', 'Font (CSS)')}</div></div>`;

const lbl = l => typeof l === 'string' ? { id: l, label: '', icon: '' } : { id: l.id, label: l.label || '', icon: l.icon || '' };
const tLabel = () => { const B = cfg.badge, T = B.types; return `
  ${chk('badge.enabled', 'Aktifkan label (saklar utama)')}
  <div class="card2"><h4>Tampilan label</h4>
    <div class="row3">${inp('badge.size', 'Ukuran ikon')}${inp('badge.gap', 'Jarak antar label')}${inp('badge.autoHideMs', 'Auto tutup (ms)', 'number', 'min="0"')}</div>
    ${sel('badge.trigger', 'Teks muncul saat', [['click', 'Ikon diklik'], ['hover', 'Kursor di atas ikon'], ['always', 'Selalu tampil'], ['none', 'Tidak tampil']])}
    <div class="row2">${col('badge.tipBg', 'Warna latar teks')}${col('badge.tipColor', 'Warna tulisan')}</div></div>
  <div class="card2"><h4>Jenis label</h4><p class="hint">Tambah jenis baru (mis. "Creative Pro"), lalu pasang ke karyawan di bawah.</p>
    ${T.map((t, i) => `<div class="item"><div class="ih"><b>${esc(t.label || t.id)}</b><button class="mini" data-deltype="${i}">Hapus</button></div>
      <div class="row2">${inp(`badge.types.${i}.label`, 'Teks saat ikon diklik')}${inp(`badge.types.${i}.id`, 'Kode unik', 'text', 'data-id="1"')}</div>
      ${inp(`badge.types.${i}.icon`, 'Lokasi ikon (kosong = ikon centang bawaan)')}</div>`).join('')}
    <div class="add"><button data-addtype>+ Jenis label</button></div>
    ${sel('badge.verifiedType', 'Jenis yang dihitung "sudah verified"', T.map(t => [t.id, t.label || t.id]))}</div>
  <div class="card2"><h4>Belum verified</h4>
    ${chk('badge.unverified.enabled', 'Tampilkan ikon non-verified untuk yang belum verified')}
    ${inp('badge.unverified.icon', 'Lokasi ikon (assets/icon/Non Verified.png)')}${inp('badge.unverified.label', 'Teks saat ikon diklik')}
    ${chk('badge.unverified.button.enabled', 'Tampilkan tombol Get Verified')}${inp('badge.unverified.button.text', 'Teks tombol')}
    <div class="row3">${col('badge.unverified.button.color', 'Warna teks')}${col('badge.unverified.button.bg', 'Latar')}${col('badge.unverified.button.border', 'Garis')}</div></div>
  <div class="card2"><h4>Karyawan &amp; label</h4><p class="hint">Nama harus sama dengan di sheet. Yang tidak terdaftar dianggap belum verified.</p>
    ${B.people.map((p, i) => `<div class="item"><div class="ih">${chk(`badge.people.${i}.enabled`, 'Aktif')}<button class="mini" data-delbp="${i}">Hapus</button></div>
      ${inp(`badge.people.${i}.name`, 'Nama', 'text', 'list="bn"')}
      ${(p.labels || []).map((l0, j) => { const l = lbl(l0); return `<div class="lrow"><select data-lp="${i}.${j}" data-lk="id">${T.map(t => `<option value="${esc(t.id)}" ${t.id === l.id ? 'selected' : ''}>${esc(t.label || t.id)}</option>`).join('')}</select>
        <input type="text" placeholder="Teks khusus (opsional)" data-lp="${i}.${j}" data-lk="label" value="${esc(l.label)}"><input type="text" placeholder="Ikon khusus (opsional)" data-lp="${i}.${j}" data-lk="icon" value="${esc(l.icon)}"><button class="mini" data-dellb="${i}.${j}">×</button></div>`; }).join('')}
      <button class="mini" data-addlb="${i}">+ Label</button></div>`).join('')}
    <div class="add"><button data-addbp>+ Karyawan</button></div></div>`; };

const tPaket = () => { const V = cfg.verify; return `
  ${chk('verify.enabled', 'Aktifkan popup paket (tombol Get Verified)')}
  <div class="card2"><h4>Teks popup</h4>${inp('verify.title', 'Judul')}${inp('verify.subtitle', 'Sub judul ({name} = nama karyawan)')}
    <div class="row2">${inp('verify.popularText', 'Tag "Populer"')}${inp('verify.closeText', 'Tombol tutup')}</div>
    ${sel('verify.afterSelect', 'Setelah paket dipilih', [['message', 'Tampilkan pesan terima kasih'], ['close', 'Langsung tutup']])}${inp('verify.selectedText', 'Pesan ({plan}, {name})')}</div>
  <div class="card2"><h4>Paket</h4>
    ${V.plans.map((p, i) => `<div class="item"><div class="ih"><b>${esc(p.name)}</b><button class="mini" data-delplan="${i}">Hapus</button></div>
      <div class="row2">${inp(`verify.plans.${i}.name`, 'Nama paket')}${inp(`verify.plans.${i}.id`, 'Kode unik')}</div>
      <div class="row2">${inp(`verify.plans.${i}.price`, 'Harga')}${inp(`verify.plans.${i}.period`, 'Periode')}</div>
      ${inp(`verify.plans.${i}.desc`, 'Deskripsi singkat')}${area(`verify.plans.${i}.features`, 'Fitur (satu baris satu fitur)')}
      <div class="row2">${col(`verify.plans.${i}.color`, 'Warna paket')}${inp(`verify.plans.${i}.button`, 'Teks tombol')}</div>
      ${inp(`verify.plans.${i}.icon`, 'Ikon khusus paket (opsional)')}${inp(`verify.plans.${i}.url`, 'Link tujuan saat dipilih (opsional; boleh {name} {plan} {id})')}
      ${chk(`verify.plans.${i}.popular`, 'Tandai "Populer"')}</div>`).join('')}
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

const TABS = [['teks', 'Teks', tTeks], ['tampilan', 'Tampilan', tTampilan], ['label', 'Label', tLabel], ['paket', 'Paket', tPaket], ['shift', 'Shift', tShift], ['data', 'Data', tData]];
function setTab(t) {
  tab = t; store('jkTab', t);
  $$('[data-tab]').forEach(s => { s.hidden = s.dataset.tab !== t; });
  $$('[data-tab-btn]').forEach(b => b.classList.toggle('on', b.dataset.tabBtn === t));
}
function renderPanel() {
  const keep = $('#panel').scrollTop;
  $('#tabs').innerHTML = TABS.map(t => `<button data-tab-btn="${t[0]}">${t[1]}</button>`).join('');
  $('#panel').innerHTML = TABS.map(t => `<section data-tab="${t[0]}">${t[2]()}</section>`).join('') +
    `<datalist id="bn">${MAN().people.map(p => `<option value="${esc(p.name)}">`).join('')}</datalist>`;
  setTab(tab); renderManual(); $('#panel').scrollTop = keep;
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
  store('jkDemoCfg2', JSON.stringify(cfg));
  const c = JSON.parse(JSON.stringify(cfg));
  if (c.data.source === 'sheet' && !c.data.fallbackToManual) delete c.data.manual;
  $('#out').value = `<div id="jadwal-kerja"></div>\n<script src="${$('#src').value}"><\/script>\n<script>\nJadwalKerja.init('#jadwal-kerja', ${JSON.stringify(diff(JadwalKerja.defaults, c) || {}, null, 2)});\n<\/script>`;
  clearTimeout(tm);
  tm = setTimeout(() => { inst && inst.destroy(); $('#pv').innerHTML = ''; const d = document.createElement('div'); $('#pv').appendChild(d); inst = JadwalKerja.init(d, cfg); inst.setEditMode(editOn); }, 250);
}
function syncEdit() { $('#edit').checked = editOn; $('#hint').textContent = editOn ? 'Mode edit aktif: klik teks, bar shift, atau label di preview untuk membuka pengaturannya. Matikan untuk mencoba popup & tombol seperti pengunjung.' : 'Mode edit mati: preview berfungsi seperti di web asli (coba klik ikon label atau Get Verified).'; inst && inst.setEditMode(editOn); }

/* ---------- edit via klik di preview ---------- */
function focusPath(p) {
  if (p.startsWith('person:')) {
    setTab('data');
    if (cfg.data.source === 'sheet') { toast('Nama ini dari Google Sheet. Ubah di sheet, atau pilih sumber data Manual.'); const s = $('[data-p="data.source"]'); s.scrollIntoView({ block: 'center', behavior: 'smooth' }); s.focus(); return; }
    const i = MAN().people.findIndex(x => x.name === p.slice(7)), el = $(`[data-pn="${i}"]`); if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.focus(); el.select(); } return;
  }
  const el = $(`#panel [data-p="${p}"]`) || $(`#panel [data-p^="${p}."]`);
  if (!el) { toast('Pengaturan untuk bagian ini belum ada di panel.'); return; }
  setTab(el.closest('[data-tab]').dataset.tab);
  const dt = el.closest('details'); if (dt) dt.open = true;
  el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.focus({ preventScroll: true }); if (el.type === 'text') el.select();
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
  } else if (k) {
    const g = t.closest('.st'), o = get(g.dataset.st), q = x => g.querySelector(`[data-k="${x}"]`);
    const c1 = q('c1').value, c2 = q('c2').value, c3 = q('c3').value, gr = q('g').checked, mid = q('m').checked;
    q('gw').style.display = gr ? '' : 'none'; q('c3').style.display = mid ? '' : 'none';
    o.bg = !gr ? c1 : mid ? `linear-gradient(90deg,${c1} 0%,${c3} 50%,${c2} 100%)` : `linear-gradient(90deg,${c1} 0%,${c2} 100%)`; o.color = q('tc').value;
  } else if (t.dataset.lp !== undefined) {           // label milik karyawan
    const [i, j] = t.dataset.lp.split('.').map(Number), arr = cfg.badge.people[i].labels, cur = lbl(arr[j]); cur[t.dataset.lk] = t.value.trim();
    arr[j] = !cur.label && !cur.icon ? cur.id : Object.assign({ id: cur.id }, cur.label ? { label: cur.label } : {}, cur.icon ? { icon: cur.icon } : {});
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
  if (D.tabBtn) return setTab(D.tabBtn);
  if (D.delshift !== undefined) cfg.shifts.splice(+D.delshift, 1);
  else if (D.addshift !== undefined) { const free = ['★', '●', '◆', '▲', '■', '♥', '♣', '♠'].find(c => !shiftBy(c)) || '#'; cfg.shifts.push({ key: 'shift' + (cfg.shifts.length + 1), symbol: free, label: 'Shift Baru', aliases: [], time: '', bg: 'linear-gradient(90deg,#34d399 0%,#047857 100%)', color: '#ffffff' }); }
  else if (D.addtype !== undefined) { let n = B.types.length + 1; while (B.types.some(t => t.id === 'label' + n)) n++; B.types.push({ id: 'label' + n, icon: '', label: 'Label Baru' }); }
  else if (D.deltype !== undefined) { const t = B.types.splice(+D.deltype, 1)[0]; B.people.forEach(pp => { pp.labels = (pp.labels || []).filter(l => (typeof l === 'string' ? l : l.id) !== t.id); }); if (B.verifiedType === t.id) B.verifiedType = B.types[0] ? B.types[0].id : ''; }
  else if (D.addbp !== undefined) B.people.push({ name: '', enabled: true, labels: [] });
  else if (D.delbp !== undefined) B.people.splice(+D.delbp, 1);
  else if (D.addlb !== undefined) { const pp = B.people[+D.addlb], used = (pp.labels || []).map(l => typeof l === 'string' ? l : l.id), t = B.types.find(x => !used.includes(x.id)) || B.types[0]; if (t) (pp.labels = pp.labels || []).push(t.id); }
  else if (D.dellb !== undefined) { const [i, j] = D.dellb.split('.').map(Number); B.people[i].labels.splice(j, 1); }
  else if (D.addplan !== undefined) { let n = cfg.verify.plans.length + 1; while (cfg.verify.plans.some(x => x.id === 'paket' + n)) n++; cfg.verify.plans.push({ id: 'paket' + n, name: 'Paket Baru', price: 'Rp 0', period: '/bulan', desc: '', features: ['Fitur 1'], color: '#1b8fe6', icon: '', popular: false, button: 'Pilih', url: '' }); }
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

/* ---------- bar atas ---------- */
$('#src').addEventListener('input', upd);
$('#edit').addEventListener('change', e => { editOn = e.target.checked; store('jkEdit', editOn ? '1' : '0'); syncEdit(); });
$('#wd').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('#wd button').forEach(x => x.classList.toggle('on', x === b)); $('#pvin').style.maxWidth = b.dataset.w; });
$('#copy').onclick = () => { const o = $('#out'), b = $('#copy'); o.select(); (navigator.clipboard ? navigator.clipboard.writeText(o.value) : Promise.reject()).catch(() => document.execCommand('copy')); b.textContent = 'Tersalin!'; setTimeout(() => b.textContent = 'Salin kode', 1500); };
$('#reset').onclick = () => { cfg = DEF(); renderPanel(); upd(); toast('Pengaturan dikembalikan ke bawaan.'); };
renderPanel(); syncEdit(); upd();
