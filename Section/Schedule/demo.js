const $ = s => document.querySelector(s);
const DEF = () => JSON.parse(JSON.stringify(JoomaxSchedule.defaults));
let cfg; try { cfg = JSON.parse(localStorage.getItem('jsDemoCfg')); } catch (e) {}
if (!cfg || !cfg.sections) cfg = DEF();
if (!cfg.data.manualRows) cfg.data.manualRows = [];

const get = p => p.split('.').reduce((o, k) => o == null ? o : o[k], cfg);
const set = (p, v) => { const k = p.split('.'), l = k.pop(); k.reduce((o, x) => o[x], cfg)[l] = v; };
const hex = c => /^#[0-9a-f]{6}$/i.test(c || '') ? c : '#333333';
const parseBg = s => { const m = (s || '').match(/#[0-9a-f]{6}/gi) || []; return { g: /gradient/.test(s || ''), c1: m[0] || '#cccccc', c2: m[1] || m[0] || '#cccccc' }; };
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const allCols = () => { const s = [cfg.data.dayColumn]; (cfg.data.manualRows || []).forEach(r => Object.keys(r).forEach(k => !s.includes(k) && s.push(k)));
  cfg.sections.forEach(x => x.column && !s.includes(x.column) && s.push(x.column)); return s; };
const ensureCols = () => { const c = allCols(); (cfg.data.manualRows || []).forEach(r => c.forEach(k => { if (!(k in r)) r[k] = ''; })); };
function renderGrid() {
  ensureCols(); const c = allCols(), rows = cfg.data.manualRows || [];
  $('#grid').innerHTML = '<div class="gscroll"><table class="grid"><thead><tr>' + c.map(x => `<th>${esc(x)}</th>`).join('') + '<th></th></tr></thead><tbody>' +
    rows.map((r, i) => '<tr>' + c.map(k => `<td><input type="text" data-r="${i}" data-c="${esc(k)}" value="${esc(r[k])}"></td>`).join('') + `<td><button data-delrow="${i}">×</button></td></tr>`).join('') +
    '</tbody></table></div><div class="add" style="margin-top:8px"><button data-addrow>+ Baris (hari)</button><input type="text" id="newcol" placeholder="Nama kolom baru" style="width:150px;margin:0"><button data-addcol>+ Kolom</button></div>';
  $('#gridnote').textContent = cfg.data.source === 'sheet'
    ? 'Sumber data sekarang Google Sheet, jadi preview memakai data dari sheet. Tabel ini baru dipakai jika sumber = Manual (atau jika sheet gagal dimuat).'
    : 'Sumber data Manual: ubah nama di tabel ini, preview langsung berubah.';
}
async function loadSheet() {
  try {
    const u = cfg.data.sheetUrl, r = await fetch(u + (u.includes('?') ? '&' : '?') + 't=' + Date.now());
    if (!r.ok) throw 0; const rows = JoomaxSchedule.parseCSV(await r.text()); if (!rows.length) throw 0;
    cfg.data.manualRows = rows; renderGrid(); upd(); $('#gridnote').textContent = 'Data dari Google Sheet berhasil dimuat ke tabel.';
  } catch (e) { $('#gridnote').textContent = 'Gagal memuat sheet. Cek link dan pastikan sudah Publish to web (CSV).'; }
}

const inp = (p, label, t = 'text', extra = '') => `<label>${label}<input type="${t}" data-p="${p}" data-t="${t}" ${extra} value="${String(get(p) ?? '').replace(/"/g, '&quot;')}"></label>`;
const chk = (p, label) => `<label class="chk"><input type="checkbox" data-p="${p}" data-t="b" ${get(p) ? 'checked' : ''}>${label}</label>`;
const col = (p, label, hl) => `<label>${label}<input type="color" data-p="${p}" data-t="${hl ? 'hl' : 'c'}" value="${hex(String(get(p)).slice(0, 7))}"></label>`;
const st = p => { const o = get(p), b = parseBg(o.bg);
  return `<div class="st" data-st="${p}"><label>Warna<input type="color" data-k="c1" value="${b.c1}"></label>
  <label class="chk"><input type="checkbox" data-k="g" ${b.g ? 'checked' : ''}>Gradasi</label>
  <input type="color" data-k="c2" value="${b.c2}" style="${b.g ? '' : 'display:none'}"><label>Teks<input type="color" data-k="tc" value="${hex(o.color)}"></label></div>`; };

function secHTML(s, i) {
  const P = k => `sections.${i}.${k}`;
  return `<div class="sec"><div class="sh"><b>${s.type === 'table' ? 'Tabel mingguan' : 'Kartu piket'} #${i + 1}</b><button data-del="${i}">Hapus</button></div>
  <div class="row2">${inp(P('label'), 'Label kecil')}${inp(P('title'), 'Judul')}</div>
  ${inp(P('column'), 'Nama kolom data (sama dengan header sheet)', 'text', 'list="cols"')}
  ${s.type === 'table'
    ? `<h5>Warna default</h5>${st(P('defaultStyle'))}<h5>Aturan warna (jika teks mengandung kata kunci)</h5>` +
      (s.rules || []).map((r, j) => `<div class="rule">${inp(P(`rules.${j}.match`), 'Kata kunci')}${st(P(`rules.${j}`))}<button data-delrule="${i},${j}">×</button></div>`).join('') +
      `<button data-addrule="${i}">+ Aturan warna</button>`
    : `<h5>Warna kartu</h5>${st(P('style'))}`}
  </div>`;
}

function renderPanel() {
  const d = cfg.data;
  $('#panel').innerHTML = `
  <h3>Umum</h3>${inp('title', 'Judul section')}${chk('showDate', 'Tampilkan tanggal')}${inp('dateFormat', 'Format tanggal ({DD} {MMM} {MMMM} {YYYY} {dddd})')}
  ${chk('showNav', 'Tombol minggu sebelumnya / selanjutnya')}${chk('showDayDate', 'Tanggal kecil di bawah nama hari')}
  <div class="row2">${inp('maxWeeksBack', 'Boleh mundur (minggu)', 'number', 'min="0"')}${inp('maxWeeksAhead', 'Boleh maju (minggu)', 'number', 'min="0"')}</div>
  <label>Tab pilih hari<select data-p="dayTabs" data-t="tabs"><option value="auto">Otomatis</option><option value="true">Selalu tampil</option><option value="false">Sembunyikan</option></select></label>
  <h3>Data</h3>
  <label>Sumber data<select data-p="data.source" data-t="text"><option value="sheet">Google Sheet</option><option value="manual">Manual</option></select></label>
  ${d.source === 'sheet' ? inp('data.sheetUrl', 'Link CSV Google Sheet') + inp('data.refreshMinutes', 'Refresh tiap (menit)', 'number', 'min="0"') + chk('data.fallbackToManual', 'Pakai data manual jika sheet gagal') : ''}
  ${inp('data.dayColumn', 'Nama kolom hari')}
  <label>Urutan hari (pisah koma)<input type="text" data-p="data.days" data-t="list" value="${d.days.join(', ')}"></label>
  <h5>Data tabel (nama pakaian &amp; petugas per hari)</h5><div class="hint" id="gridnote"></div>
  ${d.source === 'sheet' ? '<button data-loadsheet style="margin:6px 0">Muat data dari Google Sheet ke tabel</button>' : ''}
  <div id="grid"></div>
  <datalist id="cols">${allCols().map(c => `<option value="${esc(c)}">`).join('')}</datalist>
  <h3>Warna &amp; Tampilan</h3>
  <div class="row2">${col('theme.text', 'Teks')}${col('theme.muted', 'Teks redup')}${col('theme.cardBg', 'Latar kartu')}${col('theme.cardBorder', 'Garis kartu')}${col('theme.highlight', 'Highlight hari', 1)}</div>
  <div class="row2">${inp('theme.radius', 'Radius sudut')}${inp('theme.maxWidth', 'Lebar maksimal')}</div>${inp('theme.font', 'Font (CSS)')}
  <h3>Daftar jadwal</h3>${cfg.sections.map(secHTML).join('')}
  <div class="add"><button data-add="table">+ Tabel mingguan (mis. Pakaian)</button><button data-add="duty">+ Kartu piket</button></div>`;
  $('[data-p="dayTabs"]').value = String(cfg.dayTabs);
  $('[data-p="data.source"]').value = d.source;
  renderGrid();
}

let tm, inst;
function upd() {
  try { localStorage.setItem('jsDemoCfg', JSON.stringify(cfg)); } catch (e) {}
  const code = `<div id="joomax-schedule"></div>\n<script src="${$('#src').value}"><\/script>\n<script>\nJoomaxSchedule.init('#joomax-schedule', ${JSON.stringify(cfg, null, 2)});\n<\/script>`;
  $('#out').value = code;
  clearTimeout(tm);
  tm = setTimeout(() => { inst && inst.destroy(); $('#pv').innerHTML = ''; const d = document.createElement('div'); $('#pv').appendChild(d); inst = JoomaxSchedule.init(d, cfg); }, 250);
}

$('#panel').addEventListener('input', e => {
  const t = e.target, p = t.dataset.p, k = t.dataset.k;
  if (p) {
    const ty = t.dataset.t;
    let v = t.value;
    if (ty === 'b') v = t.checked; else if (ty === 'n' || ty === 'number') v = +v;
    else if (ty === 'hl') v = v + '14'; else if (ty === 'list') v = v.split(',').map(x => x.trim()).filter(Boolean);
    else if (ty === 'tabs') v = v === 'auto' ? 'auto' : v === 'true';
    set(p, v);
  } else if (k) {
    const g = t.closest('.st'), o = get(g.dataset.st), q = x => g.querySelector(`[data-k="${x}"]`);
    const c1 = q('c1').value, c2 = q('c2').value, gr = q('g').checked;
    q('c2').style.display = gr ? '' : 'none';
    o.bg = gr ? `linear-gradient(90deg,${c1},${c2})` : c1; o.color = q('tc').value;
  } else if (t.dataset.r !== undefined) cfg.data.manualRows[+t.dataset.r][t.dataset.c] = t.value;
  upd();
});
$('#panel').addEventListener('change', e => {
  const p = e.target.dataset.p;
  if (p === 'data.source') { set(p, e.target.value); renderPanel(); upd(); }
  else if (p && (p.endsWith('.column') || p === 'data.dayColumn')) { renderGrid(); }
});
$('#panel').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const D = b.dataset, S = cfg.sections;
  if (D.loadsheet !== undefined) { loadSheet(); return; }
  if (D.addrow !== undefined) { const r = {}; allCols().forEach(c => r[c] = ''); cfg.data.manualRows.push(r); renderGrid(); upd(); return; }
  if (D.delrow !== undefined) { cfg.data.manualRows.splice(+D.delrow, 1); renderGrid(); upd(); return; }
  if (D.addcol !== undefined) { const n = $('#newcol').value.trim(); if (n && !allCols().includes(n)) { cfg.data.manualRows.forEach(r => r[n] = ''); renderGrid(); upd(); } return; }
  if (D.del !== undefined) S.splice(+D.del, 1);
  else if (D.add === 'table') S.push({ type: 'table', label: 'Jadwal', title: 'Jadwal Baru', column: '', defaultStyle: { bg: '#e5e7eb', color: '#333333' }, rules: [] });
  else if (D.add === 'duty') S.push({ type: 'duty', label: 'Piket', title: 'Piket Baru', column: '', style: { bg: '#51677d', color: '#ffffff' }, people: {} });
  else if (D.addrule !== undefined) S[+D.addrule].rules.push({ match: '', bg: '#cccccc', color: '#111111' });
  else if (D.delrule !== undefined) { const [i, j] = D.delrule.split(',').map(Number); S[i].rules.splice(j, 1); }
  else return;
  renderPanel(); upd();
});
$('#src').addEventListener('input', upd);
$('#copy').onclick = () => { const o = $('#out'); o.select(); (navigator.clipboard ? navigator.clipboard.writeText(o.value) : Promise.reject()).catch(() => document.execCommand('copy')); $('#copy').textContent = 'Tersalin!'; setTimeout(() => $('#copy').textContent = 'Salin kode', 1500); };
$('#reset').onclick = () => { cfg = DEF(); renderPanel(); upd(); };
renderPanel(); upd();
