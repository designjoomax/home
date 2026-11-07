const $ = s => document.querySelector(s);
const DEF = () => JSON.parse(JSON.stringify(JadwalKerja.defaults));
let cfg; try { cfg = JSON.parse(localStorage.getItem('jkDemoCfg')); } catch (e) {}
if (!cfg || !cfg.shifts || !cfg.data || !cfg.data.manual) cfg = DEF();

const get = p => p.split('.').reduce((o, k) => o == null ? o : o[k], cfg);
const set = (p, v) => { const k = p.split('.'), l = k.pop(); k.reduce((o, x) => o[x], cfg)[l] = v; };
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hex = c => /^#[0-9a-f]{6}$/i.test(c || '') ? c : '#333333';
const strip = s => String(s == null ? '' : s).replace(/[\uFE0E\uFE0F\u200B-\u200D\uFEFF]/g, '');
const nk = s => strip(s).trim().toLowerCase();
const parseBg = s => { const m = String(s || '').match(/#[0-9a-f]{6}/gi) || [];
  return { g: /gradient/.test(s || ''), m: m.length >= 3, c1: m[0] || '#cccccc', c3: m.length >= 3 ? m[1] : (m[1] || m[0] || '#cccccc'), c2: m.length >= 3 ? m[2] : (m[1] || m[0] || '#cccccc') }; };
const MAN = () => cfg.data.manual;
const nDays = () => new Date(MAN().year, MAN().month, 0).getDate();
const toArr = (s, n) => { const a = Array.from(strip(s)).map(c => /[.\s·]/.test(c) ? '' : c); while (a.length < n) a.push(''); return a.slice(0, n); };
const fromArr = a => a.map(c => c || '.').join('');
const shiftBy = sym => cfg.shifts.find(s => s.symbol === sym);
const symOf = c => { const k = nk(c); if (!k) return ''; const s = cfg.shifts.find(x => [x.key, x.symbol, x.label].concat(x.aliases || []).some(a => a && nk(a) === k)); return s ? s.symbol : strip(c).trim(); };
const cellBg = sym => { const s = shiftBy(sym); return s ? `background:${esc(s.bg)};color:${esc(s.color)}` : ''; };

const inp = (p, label, t = 'text', extra = '') => `<label>${label}<input type="${t}" data-p="${p}" data-t="${t}" ${extra} value="${esc(get(p))}"></label>`;
const chk = (p, label) => `<label class="chk"><input type="checkbox" data-p="${p}" data-t="b" ${get(p) ? 'checked' : ''}>${label}</label>`;
const col = p => `<label>${p.split('.').pop()}<input type="color" data-p="${p}" data-t="c" value="${hex(get(p))}"></label>`;
const list = (p, label) => `<label>${label}<input type="text" data-p="${p}" data-t="list" value="${esc((get(p) || []).join(', '))}"></label>`;
const sel = (p, label, opts, t = 'text') => `<label>${label}<select data-p="${p}" data-t="${t}">${opts.map(o => `<option value="${o[0]}" ${String(get(p)) === String(o[0]) ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></label>`;
const st = p => { const o = get(p), b = parseBg(o.bg);
  return `<div class="st" data-st="${p}"><label>Warna<input type="color" data-k="c1" value="${b.c1}"></label>
  <label class="chk"><input type="checkbox" data-k="g" ${b.g ? 'checked' : ''}>Gradasi</label>
  <span data-k="gw" style="${b.g ? '' : 'display:none'}"><input type="color" data-k="c2" value="${b.c2}"><label class="chk"><input type="checkbox" data-k="m" ${b.m ? 'checked' : ''}>Tengah</label><input type="color" data-k="c3" value="${b.c3}" style="${b.m ? '' : 'display:none'}"></span>
  <label>Teks<input type="color" data-k="tc" value="${hex(o.color)}"></label></div>`; };

function renderPanel() {
  const d = cfg.data, SY = d.source === 'sheet';
  $('#panel').innerHTML = `
  <h3>Teks</h3>
  ${inp('texts.label', 'Teks kecil di atas judul')}${inp('texts.title', 'Judul besar ({MMMM} bulan, {MMM}, {YYYY} tahun)')}
  ${inp('texts.searchPlaceholder', 'Teks kotak pencarian')}
  <div class="row2">${inp('texts.todayButton', 'Tombol "Hari ini"')}${inp('texts.emptyDay', 'Teks hari kosong')}</div>
  <div class="row2">${inp('texts.noPerson', 'Nama tidak ketemu')}${inp('texts.noData', 'Data belum ada')}</div>
  <details><summary>Nama hari &amp; bulan (ganti bahasa)</summary>${list('texts.dayNames', 'Nama hari, mulai Minggu (7 item)')}${list('texts.monthNames', 'Nama bulan (12 item)')}</details>
  <h3>Tampilan</h3>
  ${chk('showSearch', 'Kotak "Cari Nama"')}${chk('showRole', 'Tampilkan jabatan')}${chk('showTodayButton', 'Tombol "Hari ini"')}
  ${chk('highlightToday', 'Tandai tanggal hari ini')}${chk('mergeSameShift', 'Gabungkan shift sama berurutan jadi 1 bar')}${chk('uppercase', 'Teks shift HURUF BESAR')}${chk('showTime', 'Tampilkan jam di dalam bar')}${chk('rememberPerson', 'Ingat karyawan terakhir yang dipilih')}
  <div class="row2">${sel('weekStart', 'Minggu mulai hari', [[1, 'Senin'], [0, 'Minggu']], 'n')}${sel('startWeek', 'Buka di', [['today', 'Minggu ini'], ['first', 'Minggu pertama']])}</div>
  <div class="row2">${inp('dateFormat', 'Format tanggal')}${inp('defaultPerson', 'Karyawan awal (nama)')}</div>
  <h3>Warna &amp; ukuran</h3>
  <div class="row3">${col('theme.text')}${col('theme.muted')}${col('theme.cardBg')}${col('theme.border')}${col('theme.accent')}</div>
  <div class="row3">${inp('theme.radius', 'radius')}${inp('theme.maxWidth', 'lebar maks')}${inp('theme.barRadius', 'radius bar')}</div>
  <div class="row3">${inp('theme.barHeight', 'tinggi bar')}${inp('theme.barFont', 'font bar')}${inp('theme.font', 'font (CSS)')}</div>
  <h3>Jenis shift</h3>
  ${cfg.shifts.map((s, i) => { const P = k => `shifts.${i}.${k}`; return `<div class="sec"><div class="sh"><b>${esc(s.label)}</b><button data-delshift="${i}">Hapus</button></div>
    <div class="row2">${inp(P('label'), 'Teks yang tampil')}${inp(P('symbol'), 'Simbol (di sheet / data manual)')}</div>
    <div class="row2">${inp(P('key'), 'Kode unik')}${inp(P('time'), 'Jam (opsional, mis. 08:00 - 16:00)')}</div>
    ${list(P('aliases'), 'Nama lain di sheet (pisah koma)')}${st(`shifts.${i}`)}</div>`; }).join('')}
  <div class="add"><button data-addshift>+ Jenis shift</button></div>
  <h3>Data</h3>
  ${sel('data.source', 'Sumber data', [['sheet', 'Google Sheet'], ['manual', 'Manual (tabel di bawah)']])}
  ${SY ? inp('data.sheetUrl', 'Link CSV tab "Jadwal Kerja"') + inp('data.refreshMinutes', 'Refresh tiap (menit)', 'number', 'min="0"') + chk('data.fallbackToManual', 'Pakai data manual jika sheet gagal') : ''}
  <details><summary>Nama kolom &amp; periode</summary>
    <div class="row3">${inp('data.layout.nameColumn', 'Kolom nama')}${inp('data.layout.roleColumn', 'Kolom jabatan')}${inp('data.layout.legendColumn', 'Kolom keterangan')}</div>
    <div class="row2">${inp('data.period.month', 'Paksa bulan (1-12, 0 = otomatis)', 'number', 'min="0" max="12"')}${inp('data.period.year', 'Paksa tahun (0 = otomatis)', 'number', 'min="0"')}</div></details>
  <h5>Data manual</h5>
  <div class="hint">${SY ? 'Sumber data sekarang Google Sheet, jadi preview mengikuti sheet. Tabel ini dipakai jika sumber = Manual (atau jika sheet gagal dimuat).' : 'Ubah tabel ini, preview langsung berubah.'}</div>
  <div class="row2">${inp('data.manual.month', 'Bulan (1-12)', 'number', 'min="1" max="12"')}${inp('data.manual.year', 'Tahun', 'number', 'min="2000"')}</div>
  <div class="add"><button data-loadsheet>Muat data dari Google Sheet ke tabel</button><span id="msg" class="hint"></span></div>
  <div class="add" id="bulk"></div>
  <div id="manual"></div>`;
  renderManual();
}

function renderManual() {
  const M = MAN(), n = nDays(), X = cfg.texts, opts = cur => '<option value="">·</option>' + cfg.shifts.map(s => `<option value="${esc(s.symbol)}" ${s.symbol === cur ? 'selected' : ''}>${esc(s.symbol)} ${esc(s.label)}</option>`).join('');
  M.people.forEach(p => { if (!Array.isArray(p.days) && typeof p.days === 'string') return; p.days = fromArr(toArr(Array.isArray(p.days) ? p.days.map(symOf).join('') : '', n)); });
  const dnm = d => (X.dayNames[new Date(M.year, M.month - 1, d).getDay()] || '').slice(0, 3);
  $('#bulk').innerHTML = `<select id="bd" style="width:96px;margin:0">${X.dayNames.map((x, i) => `<option value="${i}">${esc(x)}</option>`).join('')}</select>
    <select id="bs" style="width:130px;margin:0">${opts('')}</select><button data-applybulk>Terapkan ke semua karyawan</button>`;
  $('#manual').innerHTML = `<div class="gscroll"><table class="mg"><thead><tr><th>Nama</th><th>Jabatan</th><th>Isi semua</th>` +
    Array.from({ length: n }, (_, i) => `<th>${i + 1}<small>${esc(dnm(i + 1))}</small></th>`).join('') + '<th></th></tr></thead><tbody>' +
    M.people.map((p, i) => { const a = toArr(p.days, n);
      return `<tr><td class="nm"><input class="t" data-pn="${i}" value="${esc(p.name)}"></td><td><input class="t" data-pr="${i}" value="${esc(p.role)}"></td>
      <td><select class="fill" data-fill="${i}">${opts('')}</select></td>` +
      a.map((c, d) => `<td><select data-pi="${i}" data-d="${d}" style="${cellBg(c)}">${opts(c)}</select></td>`).join('') +
      `<td><button data-delperson="${i}">×</button></td></tr>`; }).join('') +
    '</tbody></table></div><div class="add"><button data-addperson>+ Karyawan</button></div>';
}

const diff = (d, c) => { if (Array.isArray(c) || !c || typeof c !== 'object') return JSON.stringify(d) === JSON.stringify(c) ? undefined : c;
  const o = {}; for (const k in c) { const r = diff(d && d[k], c[k]); if (r !== undefined) o[k] = r; } return Object.keys(o).length ? o : undefined; };

let tm, inst;
function upd() {
  try { localStorage.setItem('jkDemoCfg', JSON.stringify(cfg)); } catch (e) {}
  const c = JSON.parse(JSON.stringify(cfg));
  if (c.data.source === 'sheet' && !c.data.fallbackToManual) delete c.data.manual;
  $('#out').value = `<div id="jadwal-kerja"></div>\n<script src="${$('#src').value}"><\/script>\n<script>\nJadwalKerja.init('#jadwal-kerja', ${JSON.stringify(diff(JadwalKerja.defaults, c) || {}, null, 2)});\n<\/script>`;
  clearTimeout(tm);
  tm = setTimeout(() => { inst && inst.destroy(); $('#pv').innerHTML = ''; const d = document.createElement('div'); $('#pv').appendChild(d); inst = JadwalKerja.init(d, cfg); }, 250);
}

$('#panel').addEventListener('input', e => {
  const t = e.target, p = t.dataset.p, k = t.dataset.k;
  if (p) {
    const ty = t.dataset.t; let v = t.value;
    if (ty === 'b') v = t.checked; else if (ty === 'n' || ty === 'number') v = +v;
    else if (ty === 'list') v = v.split(',').map(x => x.trim()).filter(Boolean);
    const m = p.match(/^shifts\.(\d+)\.symbol$/);
    if (m) {                                         // ganti simbol: pindahkan juga isi data manual
      const old = get(p); v = strip(v).trim(); if (!v) return;
      if (old && old !== v) MAN().people.forEach(pp => { pp.days = Array.from(strip(pp.days)).map(c => c === old ? v : c).join(''); });
    }
    set(p, v);
  } else if (k) {
    const g = t.closest('.st'), o = get(g.dataset.st), q = x => g.querySelector(`[data-k="${x}"]`);
    const c1 = q('c1').value, c2 = q('c2').value, c3 = q('c3').value, gr = q('g').checked, mid = q('m').checked;
    q('gw').style.display = gr ? '' : 'none'; q('c3').style.display = mid ? '' : 'none';
    o.bg = !gr ? c1 : mid ? `linear-gradient(90deg,${c1} 0%,${c3} 50%,${c2} 100%)` : `linear-gradient(90deg,${c1} 0%,${c2} 100%)`; o.color = q('tc').value;
  } else if (t.dataset.pn !== undefined) MAN().people[+t.dataset.pn].name = t.value;
  else if (t.dataset.pr !== undefined) MAN().people[+t.dataset.pr].role = t.value;
  else return;
  upd();
});

$('#panel').addEventListener('change', e => {
  const t = e.target, p = t.dataset.p;
  if (t.dataset.pi !== undefined) {                  // ubah satu sel shift
    const i = +t.dataset.pi, a = toArr(MAN().people[i].days, nDays()); a[+t.dataset.d] = t.value;
    MAN().people[i].days = fromArr(a); t.setAttribute('style', cellBg(t.value)); upd();
  } else if (t.dataset.fill !== undefined) {         // isi semua hari 1 karyawan
    if (t.value === '' ) return; const i = +t.dataset.fill; MAN().people[i].days = fromArr(Array(nDays()).fill(t.value)); renderManual(); upd();
  } else if (p === 'data.source') { set(p, t.value); renderPanel(); upd(); }
  else if (p && (p.startsWith('data.manual.') || /^shifts\.\d+\.(label|symbol|key)$/.test(p) || p === 'texts.dayNames')) { if (p.startsWith('shifts')) renderPanel(); else renderManual(); }
});

$('#panel').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const D = b.dataset, M = MAN();
  if (D.delshift !== undefined) cfg.shifts.splice(+D.delshift, 1);
  else if (D.addshift !== undefined) { const free = ['★', '●', '◆', '▲', '■', '♥', '♣', '♠'].find(c => !shiftBy(c)) || '#'; cfg.shifts.push({ key: 'shift' + (cfg.shifts.length + 1), symbol: free, label: 'Shift Baru', aliases: [], time: '', bg: 'linear-gradient(90deg,#34d399 0%,#047857 100%)', color: '#ffffff' }); }
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

$('#src').addEventListener('input', upd);
const copyBtn = (btn, area) => { $(btn).onclick = () => { const o = $(area), b = $(btn), t = b.textContent; o.select(); (navigator.clipboard ? navigator.clipboard.writeText(o.value) : Promise.reject()).catch(() => document.execCommand('copy')); b.textContent = 'Tersalin!'; setTimeout(() => b.textContent = t, 1500); }; };
copyBtn('#copy', '#out');
$('#reset').onclick = () => { cfg = DEF(); renderPanel(); upd(); };
renderPanel(); upd();
