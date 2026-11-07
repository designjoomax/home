/*! Jadwal Kerja Section v1 | pakai: JadwalKerja.init('#el', config) */
(function () {
  'use strict';
  const SRC = (document.currentScript && document.currentScript.src) || '';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const merge = (a, b) => { if (!isObj(a) || !isObj(b)) return b === undefined ? a : b; const o = { ...a }; for (const k in b) o[k] = merge(a[k], b[k]); return o; };
  const strip = s => String(s == null ? '' : s).replace(/[\uFE0E\uFE0F\u200B-\u200D\uFEFF]/g, '');   // buang variation selector simbol
  const sym = s => strip(s).trim();
  const nk = s => sym(s).toLowerCase().replace(/\s+/g, ' ');
  const sod = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const WEEK = 604800000, cache = {}, LS = 'jk_';

  const DEFAULTS = {
    texts: {
      label: 'Jadwal Kerja',                 // teks kecil di atas judul
      title: '{MMMM}',                       // judul besar. Token: {MMMM} {MMM} {YYYY}
      searchPlaceholder: 'Cari Nama...',
      noPerson: 'Karyawan tidak ditemukan',
      noData: 'Data jadwal belum tersedia',
      loading: 'Memuat jadwal...',
      todayButton: 'Hari ini',
      prevWeek: 'Minggu sebelumnya',
      nextWeek: 'Minggu berikutnya',
      emptyDay: '',                          // teks untuk hari tanpa jadwal (kosong = tidak tampil apa-apa)
      dayNames: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      monthNames: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    },
    weekStart: 1,                            // 1 = Senin, 0 = Minggu
    dateFormat: '{DD} {MMM}',                // tanggal di bawah nama hari. Token: {DD} {D} {MM} {MMM} {MMMM} {YYYY} {dddd}
    showSearch: true,                        // kotak "Cari Nama"
    showRole: true,                          // jabatan di samping nama
    showTodayButton: true,                   // tombol "Hari ini" saat bukan di minggu ini
    highlightToday: true,                    // tandai tanggal hari ini
    mergeSameShift: true,                    // shift sama berurutan digabung jadi 1 bar panjang
    uppercase: true,                         // teks shift huruf besar
    showTime: false,                         // tampilkan jam (isi "time" pada shift) di dalam bar
    startWeek: 'today',                      // 'today' = buka di minggu ini, 'first' = minggu pertama bulan
    defaultPerson: '',                       // nama yang tampil pertama (kosong = urutan pertama)
    rememberPerson: true,                    // ingat karyawan terakhir yang dipilih di browser
    urlParam: 'nama',                        // contoh: halaman?nama=Fikri langsung menampilkan Fikri
    maxSuggestions: 20,
    cssUrl: '', cssText: '',
    data: {
      source: 'sheet',                       // 'sheet' (Google Sheet) atau 'manual'
      sheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSUmsrC4CoI2JPKviLCamojF-XzrlSjPotY-JMSBcGomTjeViBxjcpOfUktoKM9Iq_ByiR1GuWF8x-I/pub?gid=575147739&single=true&output=csv',
      refreshMinutes: 15,
      fallbackToManual: true,                // pakai data manual jika sheet gagal dimuat
      layout: { nameColumn: 'Nama', roleColumn: 'Jabatan', legendColumn: 'Keterangan' },
      period: { month: 0, year: 0 },         // 0 = otomatis (dibaca dari tanggal di header sheet, atau bulan sekarang)
      // Data manual. "days" = satu karakter per tanggal (simbol shift), "." = kosong
      manual: { month: 11, year: 2026, people: [
        {"name": "Arnita", "role": "Leader Admin", "days": "✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀"},
        {"name": "Ahmad Jamilurrahman", "role": "Leader Marketplace", "days": "✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾"},
        {"name": "Wahidah", "role": "Leader Warehouse", "days": "✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀"},
        {"name": "Nur Alifa Ranita Andriani", "role": "Staff Admin", "days": "✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾"},
        {"name": "Rusliana Dewi", "role": "Staff Admin", "days": "✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀"},
        {"name": "Irawati", "role": "Staff Marketplace", "days": "✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾"},
        {"name": "Mila Kurniati", "role": "Staff Marketplace", "days": "✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀"},
        {"name": "Fikri Saputra", "role": "Staff Creative Design", "days": "✈☀☀☀☾☾☾✈☾☾☾☾☾☾✈☀☀☀☀☀☀✈☾☾☾☾☾☾✈☀"},
        {"name": "Kevyn Hidayat", "role": "Staff Creative Design", "days": "✈☾☾☾☀☀☀✈☀☀☀☀☀☀✈☾☾☾☾☾☾✈☀☀☀☀☀☀✈☾"},
        {"name": "Muhammad Fahriza", "role": "Staff Warehouse", "days": "✈𖤓𖤓𖤓𖤓𖤓𖤓✈𖤓𖤓𖤓𖤓𖤓𖤓✈𖤓𖤓𖤓𖤓𖤓𖤓✈𖤓𖤓𖤓𖤓𖤓𖤓✈𖤓"},
        {"name": "Muhammad Aqli", "role": "Staff Packing", "days": "✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀"},
        {"name": "Muhammad Helmi Risnawan", "role": "Staff Warehouse", "days": "✈☀☀☀☾☾☾✈☀☾☾☀☀☀✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☀"},
        {"name": "Muhammad Nabil", "role": "Staff Packing", "days": "✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾"},
        {"name": "Maulida Ayu Pratiwi", "role": "Staff Content Creator", "days": "✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀"},
        {"name": "Noor Amelia Febrianti", "role": "Staff Content Creator", "days": "✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾"},
        {"name": "Zihan Muzdalifah Akhyari", "role": "Staff Content Creator", "days": "✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾"},
        {"name": "Zhakiah Azahra", "role": "Staff Content Creator", "days": "✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀☀☀☾☾☾✈☾☾☾☀☀☀✈☀"}
      ] }
    },
    // Jenis shift. symbol/label/aliases dipakai untuk mencocokkan isi sel. "label" = teks yang tampil (bebas diganti).
    shifts: [
      { key: 'pagi', symbol: '☀', label: 'Shift Pagi', aliases: ['Shift Pagi', 'Pagi'], time: '', bg: 'linear-gradient(90deg,#ffb90f 0%,#e8470c 100%)', color: '#ffffff' },
      { key: 'siang', symbol: '☾', label: 'Shift Siang', aliases: ['Shift Siang', 'Siang'], time: '', bg: 'linear-gradient(90deg,#00b4ff 0%,#00246b 100%)', color: '#ffffff' },
      { key: 'full', symbol: '𖤓', label: 'Full Time', aliases: ['Full Time', 'Fulltime'], time: '', bg: 'linear-gradient(90deg,#ffb90f 0%,#f26a0a 50%,#00246b 100%)', color: '#ffffff' },
      { key: 'off', symbol: '✈', label: 'OFF', aliases: ['OFF', 'Libur'], time: '', bg: 'linear-gradient(90deg,#ff0000 0%,#a50000 100%)', color: '#ffffff' }
    ],
    unknownShift: { bg: '#e5e7eb', color: '#333333' },   // untuk simbol yang belum didaftarkan di "shifts"
    theme: {
      font: "'Poppins', sans-serif", fontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
      text: '#111111', muted: '#8f8f8f', cardBg: '#ffffff', border: '#ececec', accent: '#e8470c',
      radius: '28px', shadow: '0 12px 40px rgba(0,0,0,.08)', maxWidth: '900px',
      barRadius: '14px', barHeight: '48px', barFont: '22px'
    }
  };

  const fmt = (d, f, X) => f.replace(/\{(DD|D|MMMM|MMM|MM|YYYY|dddd)\}/g, (_, t) => {
    const mn = X.monthNames[d.getMonth()];
    return ({ DD: pad(d.getDate()), D: d.getDate(), MM: pad(d.getMonth() + 1), MMM: mn.slice(0, 3), MMMM: mn, YYYY: d.getFullYear(), dddd: X.dayNames[d.getDay()] }[t]);
  });

  function parseMatrix(text) {
    const rows = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
      else cur += c;
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows.map(r => r.map(x => x.trim()));
  }

  // Membaca tab "Jadwal Kerja": baris angka 1..31 = tanggal, kolom Nama/Jabatan, legenda simbol di kolom "Keterangan"
  function parseSheet(rows, user) {
    const C = merge(DEFAULTS, user || {}), L = C.data.layout, MN = C.texts.monthNames;
    let dr = -1, dc = -1, n = 0;
    for (let r = 0; r < Math.min(rows.length, 10) && dr < 0; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length - 1; c++) if (row[c] === '1' && row[c + 1] === '2') { let k = 1; while (row[c + k] === String(k + 1)) k++; dr = r; dc = c; n = k; break; }
    }
    if (dr < 0) return null;
    const find = name => { const t = nk(name); for (let r = 0; r <= dr; r++) { const c = rows[r].findIndex(x => nk(x) === t); if (c >= 0) return c; } return -1; };
    let nc = find(L.nameColumn); if (nc < 0) nc = 1;
    let rc = find(L.roleColumn); if (rc < 0) rc = nc + 1;
    const lc = find(L.legendColumn);
    let month = 0, year = 0;
    for (let r = 0; r <= dr && !month; r++) for (const cell of rows[r]) {
      const m = cell.match(/(\d{1,2})\s+([^\s\d,]+)\s+(\d{4})/);
      if (m) { const i = MN.findIndex(x => nk(x).slice(0, 3) === nk(m[2]).slice(0, 3)); if (i >= 0) { month = i + 1; year = +m[3]; break; } }
    }
    const people = [], legend = {};
    for (let r = dr + 1; r < rows.length; r++) {
      const row = rows[r], name = row[nc] || '';
      if (name) people.push({ name, role: row[rc] || '', days: Array.from({ length: n }, (_, i) => sym(row[dc + i])) });
      if (lc >= 0) { const s = sym(row[lc]), l = row[lc + 1] || ''; if (s && l) legend[nk(s)] = l; }
    }
    return { month, year, people, legend };
  }

  function fromManual(m) {
    const toDays = d => Array.isArray(d) ? d.map(sym)
      : typeof d === 'string' ? Array.from(strip(d)).map(ch => /[.\s·]/.test(ch) ? '' : ch)
      : isObj(d) ? Object.keys(d).reduce((a, k) => { a[k - 1] = sym(d[k]); return a; }, []) : [];
    return { month: +m.month || 0, year: +m.year || 0, legend: {}, people: (m.people || []).map(p => ({ name: p.name || '', role: p.role || '', days: toDays(p.days) })) };
  }

  function init(root, user) {
    const host = typeof root === 'string' ? document.querySelector(root) : root;
    if (!host) return;
    if (host.__jkDestroy) host.__jkDestroy();
    const C = merge(DEFAULTS, user || {}), X = C.texts, Th = C.theme, DT = C.data;
    if (Th.fontUrl && !document.querySelector('link[href="' + Th.fontUrl + '"]')) {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = Th.fontUrl; document.head.appendChild(l);
    }
    const sh = host.shadowRoot || host.attachShadow({ mode: 'open' });
    const cssUrl = C.cssUrl || SRC.replace(/[^\/?#]*(\?.*)?$/, 'jadwal-kerja.css');
    sh.innerHTML = (C.cssText ? '<style>' + C.cssText + '</style>' : '<link rel="stylesheet" href="' + esc(cssUrl) + '">') + '<div class="w" style="visibility:hidden"></div>';
    const box = sh.querySelector('.w'), lk = sh.querySelector('link'), $ = s => sh.querySelector(s);
    const show = () => { box.style.visibility = ''; };
    if (lk) { lk.addEventListener('load', show); lk.addEventListener('error', show); setTimeout(show, 1500); } else show();
    Object.entries({ font: Th.font, text: Th.text, muted: Th.muted, 'card-bg': Th.cardBg, border: Th.border, accent: Th.accent, radius: Th.radius, shadow: Th.shadow,
      'max-width': Th.maxWidth, 'bar-radius': Th.barRadius, 'bar-height': Th.barHeight, 'bar-font': Th.barFont }).forEach(([k, v]) => box.style.setProperty('--jk-' + k, v));

    box.innerHTML = '<div class="card"><div class="top"><div class="ttl"><div class="lb">' + esc(X.label) + '</div><h2 id="title"></h2></div>' +
      (C.showSearch ? '<div class="search"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
        '<input id="q" type="text" placeholder="' + esc(X.searchPlaceholder) + '" autocomplete="off"><div class="sugg" id="sugg" hidden></div></div>' : '') +
      '</div><hr><div class="scroll"><div id="grid" class="grid' + (C.uppercase ? ' up' : '') + '"></div></div>' +
      '<div class="foot"><div class="who"><b id="name"></b><span id="role"></span></div><div class="nav"><button class="tb" id="today" data-today hidden>' + esc(X.todayButton) + '</button>' +
      '<button id="prev" data-w="-1" aria-label="' + esc(X.prevWeek) + '">&#8249;</button><span class="range" id="range"></span>' +
      '<button id="next" data-w="1" aria-label="' + esc(X.nextWeek) + '">&#8250;</button></div></div></div>';

    let data = null, w0 = null, nW = 1, wi = 0, pi = 0, dead = false, lastKey = new Date().toDateString(), loaded = false;
    const virt = {};

    function resolve(code) {
      const v = sym(code); if (!v) return null;
      const k = nk(v), match = (s, k2) => [s.key, s.symbol, s.label].concat(s.aliases || []).some(a => a && nk(a) === k2);
      let s = C.shifts.find(x => match(x, k));
      if (!s && data && data.legend[k]) { const lk2 = nk(data.legend[k]); s = C.shifts.find(x => match(x, lk2)); }
      return s || virt[k] || (virt[k] = Object.assign({ key: k, label: (data && data.legend[k]) || v }, C.unknownShift));
    }
    const ws = d => addDays(sod(d), -((d.getDay() - C.weekStart + 7) % 7));
    const todayWeek = () => {
      const t = sod(new Date()), f = new Date(data.year, data.month - 1, 1), l = new Date(data.year, data.month, 0);
      return C.startWeek === 'today' && t >= f && t <= l ? Math.round((ws(t) - w0) / WEEK) : 0;
    };

    function update() {
      if (dead) return;
      const nameEl = $('#name'), roleEl = $('#role'), grid = $('#grid');
      if (!data || !data.people.length) {
        $('#title').textContent = ''; grid.innerHTML = '<div class="msg">' + esc(loaded ? X.noData : X.loading) + '</div>';
        nameEl.textContent = ''; roleEl.textContent = ''; $('#range').textContent = ''; $('#prev').disabled = $('#next').disabled = true; $('#today').hidden = true; return;
      }
      wi = Math.max(0, Math.min(nW - 1, wi));
      const P = data.people[pi] || data.people[0], start = addDays(w0, wi * 7), today = sod(new Date());
      $('#title').textContent = fmt(addDays(start, 3), X.title, X);
      const cells = []; let h = '';
      for (let i = 0; i < 7; i++) {
        const d = addDays(start, i), inM = d.getFullYear() === data.year && d.getMonth() === data.month - 1;
        cells.push({ inM, s: inM ? resolve(P.days[d.getDate() - 1]) : null });
        h += '<div class="d' + (inM ? '' : ' out') + (C.highlightToday && d.getTime() === today.getTime() ? ' today' : '') + '" style="grid-column:' + (i + 1) + '"><span class="dn">' +
          esc(X.dayNames[d.getDay()]) + '</span><b class="dt">' + esc(fmt(d, C.dateFormat, X)) + '</b></div>';
      }
      for (let i = 0; i < 7;) {
        const s = cells[i].s;
        if (!s) { if (X.emptyDay && cells[i].inM) h += '<div class="em" style="grid-column:' + (i + 1) + '">' + esc(X.emptyDay) + '</div>'; i++; continue; }
        let j = i; while (C.mergeSameShift && j + 1 < 7 && cells[j + 1].s === s) j++;
        const span = j - i + 1, a = fmt(addDays(start, i), '{DD} {MMM}', X), b = fmt(addDays(start, j), '{DD} {MMM}', X);
        h += '<div class="bar' + (span === 1 ? ' s1' : '') + '" style="grid-column:' + (i + 1) + '/span ' + span + ';background:' + esc(s.bg) + ';color:' + esc(s.color) + '" title="' +
          esc(s.label + (s.time ? ' (' + s.time + ')' : '') + ' · ' + (a === b ? a : a + ' - ' + b)) + '"><span>' + esc(s.label) + '</span>' +
          (C.showTime && s.time ? '<small>' + esc(s.time) + '</small>' : '') + '</div>';
        i = j + 1;
      }
      grid.innerHTML = h;
      nameEl.textContent = P.name; roleEl.textContent = C.showRole ? P.role : '';
      $('#range').textContent = fmt(start, '{DD} {MMM}', X) + ' - ' + fmt(addDays(start, 6), '{DD} {MMM} {YYYY}', X);
      $('#prev').disabled = wi <= 0; $('#next').disabled = wi >= nW - 1; $('#today').hidden = !(C.showTodayButton && wi !== todayWeek());
    }

    function setData(d) {
      const t = new Date(), p = DT.period || {}, prev = data && data.people[pi] && data.people[pi].name;
      d.month = +p.month || d.month || t.getMonth() + 1; d.year = +p.year || d.year || t.getFullYear();
      data = d;
      const f = new Date(d.year, d.month - 1, 1), l = new Date(d.year, d.month, 0);
      w0 = ws(f); nW = Math.round((ws(l) - w0) / WEEK) + 1;
      if (!loaded || prev == null) {
        let want = ''; try { want = new URLSearchParams(location.search).get(C.urlParam) || ''; } catch (e) {}
        if (!want && C.rememberPerson) try { want = localStorage.getItem(LS + 'person') || ''; } catch (e) {}
        want = want || C.defaultPerson;
        const i = want ? d.people.findIndex(p => nk(p.name).includes(nk(want))) : -1;
        pi = i >= 0 ? i : 0; wi = todayWeek();
      } else { const i = d.people.findIndex(p => p.name === prev); pi = i >= 0 ? i : 0; }
      loaded = true; update();
    }

    async function load(force) {
      let d = null;
      if (DT.source === 'sheet' && DT.sheetUrl) {
        try {
          let text; const c = cache[DT.sheetUrl];
          if (!force && c && Date.now() - c.t < 15000) text = c.text;
          else {
            const r = await fetch(DT.sheetUrl + (DT.sheetUrl.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' });
            if (!r.ok) throw 0; text = await r.text(); cache[DT.sheetUrl] = { t: Date.now(), text };
            try { localStorage.setItem(LS + DT.sheetUrl, text); } catch (e) {}
          }
          d = parseSheet(parseMatrix(text), C);
        } catch (e) { try { d = parseSheet(parseMatrix(localStorage.getItem(LS + DT.sheetUrl) || ''), C); } catch (e2) {} }
        if (d && !d.people.length) d = null;
      }
      if (!d && (DT.source !== 'sheet' || DT.fallbackToManual)) d = fromManual(DT.manual || {});
      if (dead) return;
      if (d) setData(d); else { loaded = true; update(); }
    }

    // ---- pencarian nama ----
    const sugg = $('#sugg'), qi = $('#q');
    const found = v => { const t = nk(v); return (data ? data.people.map((p, i) => ({ p, i })) : []).filter(o => !t || nk(o.p.name).includes(t) || nk(o.p.role).includes(t))
      .sort((a, b) => (nk(b.p.name).startsWith(t) ? 1 : 0) - (nk(a.p.name).startsWith(t) ? 1 : 0)).slice(0, C.maxSuggestions); };
    const openSugg = () => { if (!sugg) return; const r = found(qi.value);
      sugg.innerHTML = r.length ? r.map(o => '<button class="sg" data-i="' + o.i + '"><b>' + esc(o.p.name) + '</b><small>' + esc(o.p.role) + '</small></button>').join('') : '<div class="sg none">' + esc(X.noPerson) + '</div>';
      sugg.hidden = false; };
    const closeSugg = () => { if (sugg) sugg.hidden = true; };
    const pick = i => { pi = i; try { if (C.rememberPerson) localStorage.setItem(LS + 'person', data.people[i].name); } catch (e) {} if (qi) { qi.value = ''; qi.blur(); } closeSugg(); update(); };

    const on = [];
    const listen = (t, fn) => { sh.addEventListener(t, fn); on.push([t, fn]); };
    listen('click', e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.w) { wi += +b.dataset.w; update(); } else if (b.dataset.today !== undefined) { wi = todayWeek(); update(); }
    });
    listen('mousedown', e => { const b = e.target.closest('.sg[data-i]'); if (b) { e.preventDefault(); pick(+b.dataset.i); } });
    listen('input', e => { if (e.target.id === 'q') openSugg(); });
    listen('focusin', e => { if (e.target.id === 'q') openSugg(); });
    listen('focusout', e => { if (e.target.id === 'q') setTimeout(closeSugg, 150); });
    listen('keydown', e => {
      if (e.target.id !== 'q') return;
      if (e.key === 'Enter') { const r = found(qi.value); if (r.length) pick(r[0].i); } else if (e.key === 'Escape') closeSugg();
    });

    load();
    const t1 = DT.source === 'sheet' && DT.refreshMinutes > 0 ? setInterval(() => load(true), DT.refreshMinutes * 60000) : 0;
    const t2 = setInterval(() => { const k = new Date().toDateString(); if (k !== lastKey) { lastKey = k; if (data) { wi = todayWeek(); update(); } } }, 30000);
    const destroy = () => { dead = true; clearInterval(t1); clearInterval(t2); on.forEach(([t, fn]) => sh.removeEventListener(t, fn)); sh.innerHTML = ''; delete host.__jkDestroy; };
    host.__jkDestroy = destroy;
    return { destroy, reload: () => load(true) };
  }

  window.JadwalKerja = { init, defaults: DEFAULTS, parseMatrix, parseSheet, version: 1 };
  const auto = () => document.querySelectorAll('[data-jadwal-kerja]').forEach(el => {
    let c = {}; try { c = JSON.parse(el.getAttribute('data-config') || '{}'); } catch (e) {}
    init(el, c);
  });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();
