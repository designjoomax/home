/*! Joomax Schedule Section v2 | pakai: JoomaxSchedule.init('#el', config) */
(function () {
  'use strict';
  const SRC = (document.currentScript && document.currentScript.src) || '';
  const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const DAYS = ['Minggu','Senin','Selasa','Rabu','Kamis',"Jum'at",'Sabtu'];
  const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = n => String(n).padStart(2, '0');
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const merge = (a, b) => { if (!isObj(a) || !isObj(b)) return b === undefined ? a : b; const o = { ...a }; for (const k in b) o[k] = merge(a[k], b[k]); return o; };
  const cache = {}, LS = 'joomax_sched_';

  const DEFAULTS = {
    title: 'Schedule',
    showDate: true,                    // tampilkan tanggal hari yang dipilih
    dateFormat: '{DD}, {MMMM} {YYYY}', // token: {DD} {D} {MM} {MMM} {MMMM} {YYYY} {dddd}
    showNav: true,                     // navigasi minggu sebelumnya / selanjutnya
    maxWeeksBack: 0,                   // boleh mundur berapa minggu
    maxWeeksAhead: 8,                  // boleh maju berapa minggu
    showDayDate: true,                 // tanggal kecil di bawah nama hari
    cssUrl: '',                        // opsional: link schedule.css kustom (default: satu folder dengan schedule.js)
    dayTabs: 'auto',                   // tab pilih hari: 'auto' (muncul jika tidak ada tabel) | true | false
    labels: { prevWeek: 'Minggu sebelumnya', nextWeek: 'Minggu selanjutnya', backToToday: 'Hari ini', today: 'Hari ini' },
    data: {
      source: 'sheet',                 // 'sheet' atau 'manual'
      sheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSUmsrC4CoI2JPKviLCamojF-XzrlSjPotY-JMSBcGomTjeViBxjcpOfUktoKM9Iq_ByiR1GuWF8x-I/pub?output=csv',
      refreshMinutes: 15,
      fallbackToManual: true,
      dayColumn: 'Hari',
      days: ['Senin','Selasa','Rabu','Kamis',"Jum'at",'Sabtu'],
      manualRows: [
        { Hari: 'Senin',  Pakaian: 'PDH JOOMAX',        'Piket Sampah': 'Nabil',   'Piket Toilet Lt. 2': 'Wahidah', 'Piket Toilet Lt. 3': 'Zihan' },
        { Hari: 'Selasa', Pakaian: 'Bebas Sopan',       'Piket Sampah': 'Fikri',   'Piket Toilet Lt. 2': 'Alifa',   'Piket Toilet Lt. 3': 'Ayu' },
        { Hari: 'Rabu',   Pakaian: 'Kaos Usams',        'Piket Sampah': 'Aqli',    'Piket Toilet Lt. 2': 'Ira',     'Piket Toilet Lt. 3': 'Febri' },
        { Hari: 'Kamis',  Pakaian: 'PDH JOOMAX',        'Piket Sampah': 'Helmi',   'Piket Toilet Lt. 2': 'Dewi',    'Piket Toilet Lt. 3': 'Arnita' },
        { Hari: "Jum'at", Pakaian: 'Batik, Sasirangan', 'Piket Sampah': 'Fahriza', 'Piket Toilet Lt. 2': 'Mila',    'Piket Toilet Lt. 3': 'Zahro' },
        { Hari: 'Sabtu',  Pakaian: 'Bebas Sopan',       'Piket Sampah': 'Kevyn',   'Piket Toilet Lt. 2': 'Jamil',   'Piket Toilet Lt. 3': 'Zhakiah' }
      ]
    },
    theme: {
      font: "'Poppins', sans-serif",
      fontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
      text: '#111111', muted: '#9a9a9a', cardBg: '#ffffff', cardBorder: '#efefef',
      highlight: '#51677d14', radius: '28px', maxWidth: '840px',
      shadow: '0 8px 30px rgba(0,0,0,.07)'
    },
    // type 'table' = tabel seminggu | type 'duty' = kartu petugas di hari yang dipilih
    sections: [
      { type: 'table', label: 'Jadwal', title: 'Pakaian', column: 'Pakaian',
        defaultStyle: { bg: '#e5e7eb', color: '#333333' },
        rules: [
          { match: 'PDH', bg: '#51677d', color: '#ffffff' },
          { match: 'Bebas Sopan', bg: '#a9c9a4', color: '#1f3d1b' },
          { match: 'Kaos', bg: '#8a9bb0', color: '#ffffff' },
          { match: 'Batik', bg: '#e58150', color: '#ffffff' }
        ] },
      { type: 'duty', label: 'Piket', title: 'Sampah', column: 'Piket Sampah', style: { bg: '#51677d', color: '#ffffff' }, people: {} },
      { type: 'duty', label: 'Piket', title: 'Toilet lt.2', column: 'Piket Toilet Lt. 2', style: { bg: '#e58150', color: '#ffffff' }, people: {} },
      { type: 'duty', label: 'Piket', title: 'Toilet lt.3', column: 'Piket Toilet Lt. 3', style: { bg: 'linear-gradient(90deg,#ffd9dc,#ffa9ad)', color: '#ff1744' }, people: {} }
    ]
  };

  function parseCSV(text) {
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
    const head = (rows.shift() || []).map(h => h.trim());
    return rows.filter(r => r.some(x => x.trim())).map(r => { const o = {}; head.forEach((h, i) => o[h] = (r[i] || '').trim()); return o; });
  }

  const fmt = (d, f) => f.replace(/\{(DD|D|MMMM|MMM|MM|YYYY|dddd)\}/g, (_, t) => ({
    DD: pad(d.getDate()), D: d.getDate(), MM: pad(d.getMonth() + 1), MMM: MONTHS[d.getMonth()].slice(0, 3),
    MMMM: MONTHS[d.getMonth()], YYYY: d.getFullYear(), dddd: DAYS[d.getDay()]
  }[t]));

  function init(root, user) {
    const host = typeof root === 'string' ? document.querySelector(root) : root;
    if (!host) return;
    if (host.__jsDestroy) host.__jsDestroy();
    const C = merge(DEFAULTS, user || {}), T = C.theme, D = C.data, L = C.labels;
    if (T.fontUrl && !document.querySelector('link[href="' + T.fontUrl + '"]')) {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = T.fontUrl; document.head.appendChild(l);
    }
    const sh = host.shadowRoot || host.attachShadow({ mode: 'open' });
    const cssUrl = C.cssUrl || SRC.replace(/[^\/?#]*(\?.*)?$/, 'schedule.css');
    sh.innerHTML = '<link rel="stylesheet" href="' + esc(cssUrl) + '"><div class="w" style="visibility:hidden"></div>';
    const box = sh.querySelector('.w'), lk = sh.querySelector('link');
    const show = () => { box.style.visibility = ''; };
    lk.addEventListener('load', show); lk.addEventListener('error', show); setTimeout(show, 1500);
    Object.entries({ font: T.font, text: T.text, muted: T.muted, 'card-bg': T.cardBg, border: T.cardBorder, highlight: T.highlight, radius: T.radius, 'max-width': T.maxWidth, shadow: T.shadow })
      .forEach(([k, v]) => box.style.setProperty('--js-' + k, v));
    const days = D.days, hasSun = days.some(d => norm(d) === 'minggu');
    let rows = [], week = 0, dead = false, lastKey = new Date().toDateString();
    const todayName = () => days.find(d => norm(d) === norm(DAYS[new Date().getDay()])) || days[0];
    let sel = todayName();
    const byDay = () => { const m = {}; rows.forEach(r => m[norm(r[D.dayColumn])] = r); return m; };
    const dateOf = (dn, w) => {
      const d = new Date(); d.setHours(0, 0, 0, 0);
      if (!d.getDay() && !hasSun) d.setDate(d.getDate() + 1);       // hari Minggu -> tampilkan minggu depan
      const idx = DAYS.findIndex(x => norm(x) === norm(dn));
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + w * 7 + ((idx + 6) % 7));
      return d;
    };
    const pill = s => 'background:' + s.bg + ';color:' + s.color;

    function render() {
      if (dead) return;
      const hasT = C.sections.some(s => s.type === 'table');
      const sd = dateOf(sel, week), row = byDay()[norm(sel)] || {};
      const range = fmt(dateOf(days[0], week), '{DD} {MMM}') + ' – ' + fmt(dateOf(days[days.length - 1], week), '{DD} {MMM} {YYYY}');
      let h = '<div class="head"><div class="tw"><h2>' + esc(C.title) + '</h2>' +
        (C.showDate ? '<span class="sep">|</span><span class="date">' + esc(fmt(sd, C.dateFormat)) + '</span>' : '') + '</div>';
      if (C.showNav) h += '<div class="nav"><button data-w="-1" aria-label="' + esc(L.prevWeek) + '"' + (week <= -C.maxWeeksBack ? ' disabled' : '') + '>&#8249;</button>' +
        '<span class="chip">' + esc(range) + '</span>' +
        '<button data-w="1" aria-label="' + esc(L.nextWeek) + '"' + (week >= C.maxWeeksAhead ? ' disabled' : '') + '>&#8250;</button>' +
        (week !== 0 || norm(sel) !== norm(todayName()) ? '<button class="rs" data-w="0">' + esc(L.backToToday) + '</button>' : '') + '</div>';
      h += '</div>';
      const dayBtn = (dn, cls) => {
        const d = dateOf(dn, week), tdy = d.toDateString() === new Date().toDateString();
        return '<button class="' + cls + (norm(dn) === norm(sel) ? ' on' : '') + (tdy ? ' td' : '') + '" data-day="' + esc(dn) + '">' + esc(dn) +
          (C.showDayDate ? '<small>' + fmt(d, '{DD} {MMM}') + '</small>' : '') + '</button>';
      };
      if (C.dayTabs === true || (C.dayTabs === 'auto' && !hasT)) h += '<div class="tabs">' + days.map(d => dayBtn(d, 'tab')).join('') + '</div>';

      C.sections.filter(s => s.type === 'table').forEach(s => {
        h += '<div class="card wide"><div class="lb">' + esc(s.label) + '</div><div class="ct">' + esc(s.title) + '</div><div class="tbl">' +
          days.map(dn => {
            const v = (byDay()[norm(dn)] || {})[s.column] || '';
            const st = (s.rules || []).find(r => r.match && v.toLowerCase().includes(String(r.match).toLowerCase())) || s.defaultStyle;
            return '<div class="col' + (norm(dn) === norm(sel) ? ' on' : '') + '">' + dayBtn(dn, 'dh') +
              '<div class="cell">' + (v ? '<span class="pl" style="' + pill(st) + '">' + esc(v) + '</span>' : '<span class="em">-</span>') + '</div></div>';
          }).join('') + '</div></div>';
      });
      const duties = C.sections.filter(s => s.type === 'duty');
      if (duties.length) h += '<div class="duties">' + duties.map(s => {
        const p = row[s.column] || '', st = (s.people && s.people[p]) || s.style;
        return '<div class="card"><div class="lb">' + esc(s.label) + '</div><div class="ct">' + esc(s.title) + '</div><div class="pr" style="' + pill(st) + '">' + (p ? esc(p) : '-') + '</div></div>';
      }).join('') + '</div>';
      box.innerHTML = h;
    }


    const onClick = e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.w !== undefined) {
        const v = +b.dataset.w;
        if (v === 0) { week = 0; sel = todayName(); } else week = Math.max(-C.maxWeeksBack, Math.min(C.maxWeeksAhead, week + v));
        render();
      } else if (b.dataset.day) { sel = b.dataset.day; render(); }
    };
    sh.addEventListener('click', onClick);

    async function load(force) {
      let ok = false;
      if (D.source === 'sheet' && D.sheetUrl) {
        try {
          const c = cache[D.sheetUrl];
          if (!force && c && Date.now() - c.t < 15000) rows = c.r;
          else {
            const r = await fetch(D.sheetUrl + (D.sheetUrl.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' });
            if (!r.ok) throw 0;
            rows = parseCSV(await r.text()); cache[D.sheetUrl] = { t: Date.now(), r: rows };
            try { localStorage.setItem(LS + D.sheetUrl, JSON.stringify(rows)); } catch (e) {}
          }
          ok = rows.length > 0;
        } catch (e) { try { const c = JSON.parse(localStorage.getItem(LS + D.sheetUrl)); if (c && c.length) { rows = c; ok = true; } } catch (e2) {} }
      }
      if (!ok && (D.source !== 'sheet' || D.fallbackToManual)) rows = D.manualRows || [];
      render();
    }
    load();
    const t1 = D.source === 'sheet' && D.refreshMinutes > 0 ? setInterval(() => load(true), D.refreshMinutes * 60000) : 0;
    const t2 = setInterval(() => { const k = new Date().toDateString(); if (k !== lastKey) { lastKey = k; week = 0; sel = todayName(); render(); } }, 30000);

    const destroy = () => { dead = true; clearInterval(t1); clearInterval(t2); sh.removeEventListener('click', onClick); sh.innerHTML = ''; delete host.__jsDestroy; };
    host.__jsDestroy = destroy;
    return { destroy };
  }

  window.JoomaxSchedule = { init, defaults: DEFAULTS, parseCSV, version: 2 };
  const auto = () => document.querySelectorAll('[data-joomax-schedule]').forEach(el => {
    let c = {}; try { c = JSON.parse(el.getAttribute('data-config') || '{}'); } catch (e) {}
    init(el, c);
  });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();
