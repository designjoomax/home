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
      viewAll: 'View All',                   // tombol buka daftar semua karyawan
      collapse: 'Collapse',                  // tombol tutup daftar
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
    showRole: true,                          // tampilkan jabatan
    rolePosition: 'below',                   // posisi jabatan: 'below' = di bawah nama, 'beside' = di samping nama
    showViewAll: true,                       // tombol View All / Collapse (daftar semua karyawan)
    // Daftar semua karyawan (tombol View All). Area daftar bisa di-scroll, header tanggal tetap diam.
    list: {
      startExpanded: false,                  // buka langsung dalam mode daftar
      height: '380px',                       // tinggi area daftar (lebih dari ini bisa di-scroll)
      nameWidth: '240px',                    // lebar kolom nama
      showRole: false,                       // tampilkan jabatan di bawah nama
      showBadges: true,                      // tampilkan ikon label di samping nama
      showUnverified: false,                 // tampilkan juga ikon non-verified (yang belum verified)
      badgeSize: '16px',
      clickName: 'select',                   // klik nama: 'select' = tampilkan karyawan itu, 'none' = tidak ngapa-ngapain
      barHeight: '34px', barFont: '13px'
    },
    // Warna nama karyawan: solid atau gradasi, gradasi bisa berjalan (animasi). bg kosong = warna teks tema.
    nameStyle: {
      default: { bg: '', animate: false, speed: '3s' },        // untuk semua karyawan
      people: [ { name: 'Fikri Saputra', enabled: true, bg: 'linear-gradient(90deg,#0b1f6e 0%,#4f83f5 100%)', animate: true, speed: '3s' } ]
    },
    // Label di samping nama (centang Verified, dll). Klik ikon untuk memunculkan teksnya.
    badge: {
      enabled: true,                         // saklar utama: false = semua label mati
      size: '20px', gap: '8px',              // ukuran ikon & jarak antar label
      trigger: 'click',                      // teks muncul saat: 'click' | 'hover' | 'always' (selalu tampil) | 'none'
      autoHideMs: 3000,                      // teks otomatis tertutup setelah ... ms (0 = tidak otomatis)
      tipBg: '#111111', tipColor: '#ffffff', // warna balon teks
      verifiedType: 'verified',              // id jenis label yang dianggap "sudah verified"
      // Jenis label (bisa ditambah). icon = lokasi ikon (relatif ke folder jadwal-kerja.js / link penuh / data URI), label = teks saat ikon diklik
      types: [ { id: 'verified', icon: 'assets/icon/Verified.png', label: 'Verified' } ],
      // Untuk yang BELUM verified: ikon non-verified + tombol "Get Verified" (membuka popup paket, lihat "verify")
      unverified: { enabled: true, icon: 'assets/icon/Non Verified.png', label: 'Belum verified',
        button: { enabled: true, text: 'Get Verified', color: '#1b8fe6', bg: '#ffffff', border: '#1b8fe6' } },
      // Siapa dapat label apa. Nama sama dengan di sheet (huruf besar/kecil bebas). Tidak terdaftar = belum verified.
      // labels: daftar id jenis (urutan = urutan tampil), atau { id, label, icon, enabled } untuk teks/ikon khusus orang itu. enabled:false pada label = disembunyikan; pada orang = semua labelnya mati sementara.
      people: [ { name: 'Fikri Saputra', enabled: true, labels: ['verified'] } ]
    },
    // Popup pilihan paket (dibuka tombol "Get Verified", atau dari script lain: JadwalKerja.openVerify('Nama'))
    verify: {
      enabled: true,
      title: 'Pilih Paket Verified', subtitle: 'Untuk {name}', popularText: 'Populer', closeText: 'Tutup',
      // Tombol paket diarahkan ke Fixs.Arts Checkout (butuh <script src="https://fixsarts.github.io/checkout/fa-checkout.js" defer></script> di halaman,
      // dan Jadwal Kerja/data/products.json). ID produk = checkout.product, ID paket = id paket (plan.id). Boleh diganti per paket: product / package.
      // Jika script checkout tidak dimuat, tombol memakai alur lama (url paket / pesan terima kasih).
      checkout: { enabled: true, product: 'verified-badge', productName: 'Verified Badge', siteName: 'Joomax' },   // productName & siteName hanya dipakai demo untuk membuat products.json
      showNormalPrice: true,                 // harga normal (dicoret) di atas harga promo
      showThumb: true,                       // gambar thumb di atas tiap kartu paket
      uppercaseName: true,                   // nama paket HURUF BESAR
      featureIcon: 'check',                  // ikon bawaan untuk benefit (lihat daftar ikon di demo)
      afterSelect: 'message',                // 'message' = tampilkan pesan terima kasih, 'close' = langsung tutup
      selectedText: 'Terima kasih! Paket {plan} dipilih untuk {name}.',
      // thumb: template ('plan' 'ocean' 'sunset' 'royal' 'mint' 'aurora' 'mono'), atau thumbImage: link / data URI gambar sendiri (menimpa template).
      // features: teks, atau { text, note, icon } (icon = nama ikon, emoji, atau link gambar). url boleh berisi {name} {plan} {id}.
      plans: [
        { id: 'basic', name: 'Basic', normalPrice: 'Rp15.000', price: 'Rp5.000', period: '/ 3 Bulan', desc: 'Pilihan tepat untuk memulai.',
          thumb: 'ocean', thumbImage: '', color: '#1b8fe6', icon: '', popular: false, button: 'Pilih Basic', url: '',
          features: [ { text: 'Verified Badge', icon: 'badge' }, { text: 'Tampilan di Jadwal Kerja', icon: 'layout' } ] },
        { id: 'premium', name: 'Premium', normalPrice: 'Rp30.000', price: 'Rp15.000', period: '/ 3 Bulan', desc: 'Tampil lebih standout dan berbeda.',
          thumb: 'sunset', thumbImage: '', color: '#e8470c', icon: '', popular: true, button: 'Pilih Premium', url: '',
          features: [ { text: 'Verified Badge', icon: 'badge' }, { text: 'Animated Gradient Name', note: 'Efek warna gradient bergerak pada nama', icon: 'wave' }, { text: 'Tampilan di Jadwal Kerja', icon: 'layout' } ] },
        { id: 'platinum', name: 'Platinum', normalPrice: 'Rp50.000', price: 'Rp25.000', period: '/ 1 Tahun', desc: 'Eksklusivitas maksimal untuk profil kamu.',
          thumb: 'royal', thumbImage: '', color: '#6d4aff', icon: '', popular: false, button: 'Pilih Platinum', url: '',
          features: [ { text: 'Verified Badge', icon: 'badge' }, { text: 'Custom Design Badge', icon: 'palette' }, { text: 'Animated Gradient Name', note: 'Efek warna gradient bergerak pada nama', icon: 'wave' }, { text: 'Tampilan di Jadwal Kerja', icon: 'layout' } ] }
      ]
    },
    showTodayButton: true,                   // tombol "Hari ini" saat bukan di minggu ini
    highlightToday: true,                    // tandai tanggal hari ini
    mergeSameShift: true,                    // shift sama berurutan digabung jadi 1 bar panjang
    uppercase: true,                         // teks shift huruf besar
    compactLabelChars: 6,                    // bar 1 hari: label lebih dari ... huruf dikecilkan agar muat (label pendek seperti OFF tetap ukuran penuh)
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
      barRadius: '14px', barHeight: '48px', barFont: '22px', viewAllBg: '#1d1d1f', viewAllColor: '#ffffff'
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

  const DIR = SRC.replace(/[^\/?#]*(\?.*)?$/, '');                      // folder tempat jadwal-kerja.js
  const ROOT = DIR.replace(/js\/$/, '');                                 // folder induk (assets/ ada di sini)
  const CSS_DEFAULT = (ROOT !== DIR ? ROOT + 'css/' : DIR) + 'jadwal-kerja.css';
  const iconUrl = u => /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(u) ? u : ROOT + u;
  const isPath = u => /[\/.]/.test(u) || /^data:/i.test(u);              // bukan path = dianggap emoji / teks
  const seal = c => { const p = []; for (let i = 0; i < 32; i++) { const a = Math.PI * 2 * i / 32 - Math.PI / 2, r = i % 2 ? 9.8 : 11.6; p.push((12 + r * Math.cos(a)).toFixed(2) + ',' + (12 + r * Math.sin(a)).toFixed(2)); }
    return 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polygon fill="' + c + '" points="' + p.join(' ') + '"/><path d="M7.4 12.3l3.1 3.1 6.1-6.4" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'); };
  const SEAL = { ok: seal('#1b8fe6'), no: seal('#c9c9c9') };   // ikon cadangan jika file ikon tidak ketemu
  // ikon: file gambar (path / link / data URI) atau emoji
  function iconTag(icon, fb, size, cls) {
    if (icon && !isPath(icon)) return '<span class="emo ' + (cls || '') + '" style="font-size:' + esc(size || '20px') + '">' + esc(icon) + '</span>';
    return '<img class="' + (cls || '') + '" data-fb="' + fb + '" alt="" ' + (size ? 'style="height:' + esc(size) + ';width:' + esc(size) + '" ' : '') + 'src="' + esc(icon ? iconUrl(icon) : SEAL[fb]) + '">';
  }
  function fixImgs(root) { root.querySelectorAll('img[data-fb]').forEach(img => img.addEventListener('error', () => { if (img.dataset.done !== '1') { img.dataset.done = '1'; img.src = SEAL[img.dataset.fb]; } })); }

  // memasang CSS + variabel tema ke shadow root, mengembalikan elemen .w
  function mount(sh, C) {
    const Th = C.theme, B = C.badge || {};
    if (Th.fontUrl && !document.querySelector('link[href="' + Th.fontUrl + '"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = Th.fontUrl; document.head.appendChild(l); }
    const cssUrl = C.cssUrl || CSS_DEFAULT;
    sh.innerHTML = (C.cssText ? '<style>' + C.cssText + '</style>' : '<link rel="stylesheet" href="' + esc(cssUrl) + '">') + '<div class="w" style="visibility:hidden"></div>';
    const box = sh.querySelector('.w'), lk = sh.querySelector('link'), show = () => { box.style.visibility = ''; };
    if (lk) { lk.addEventListener('load', show); lk.addEventListener('error', show); setTimeout(show, 1500); } else show();
    Object.entries({ font: Th.font, text: Th.text, muted: Th.muted, 'card-bg': Th.cardBg, border: Th.border, accent: Th.accent, radius: Th.radius, shadow: Th.shadow,
      'max-width': Th.maxWidth, 'bar-radius': Th.barRadius, 'bar-height': Th.barHeight, 'bar-font': Th.barFont, 'tip-bg': B.tipBg, 'tip-color': B.tipColor, 'badge-gap': B.gap, 'va-bg': Th.viewAllBg, 'va-color': Th.viewAllColor, 'list-bar-height': (C.list || {}).barHeight, 'list-bar-font': (C.list || {}).barFont })
      .forEach(([k, v]) => { if (v != null) box.style.setProperty('--jk-' + k, v); });
    return box;
  }

  // ikon benefit (minimalis, garis): dipakai di popup paket. Nama ikon dipakai di config: features[].icon
  const THUMBS = ['plan', 'ocean', 'sunset', 'royal', 'mint', 'aurora', 'mono'];
  const ICONS = (() => {
    const burst = []; for (let i = 0; i < 24; i++) { const a = Math.PI * 2 * i / 24 - Math.PI / 2, r = i % 2 ? 8.6 : 10.2; burst.push((12 + r * Math.cos(a)).toFixed(2) + ',' + (12 + r * Math.sin(a)).toFixed(2)); }
    return {
      'check': '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
      'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
      'dot': '<circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/>',
      'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>',
      'badge': '<polygon points="' + burst.join(' ') + '"/><path d="M8.2 12.4l2.7 2.7 5-5.4"/>',
      'star': '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z"/>',
      'sparkle': '<path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z"/>',
      'shield': '<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/><path d="M9 12l2.2 2.2L15 10"/>',
      'crown': '<path d="M4 18h16M5 18L4 8l5 4 3-6 3 6 5-4-1 10"/>',
      'bolt': '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
      'heart': '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
      'gem': '<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4L7.5 9 12 20M15 4l1.5 5L12 20"/>',
      'palette': '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10.5" r="1" fill="currentColor"/><circle cx="12" cy="7.8" r="1" fill="currentColor"/><circle cx="15.5" cy="10.5" r="1" fill="currentColor"/><path d="M9 15.5c1.2 1.2 4.8 1.2 6 0"/>',
      'calendar': '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
      'layout': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
      'wave': '<path d="M3 9c3-5 6-5 9 0s6 5 9 0"/><path d="M3 16c3-5 6-5 9 0s6 5 9 0"/>',
      'user': '<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>',
      'eye': '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
      'gift': '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M12 9v11M4 13h16M12 9c-2-4-6-3-5 0 .5 1.5 3 1 5 0zM12 9c2-4 6-3 5 0-.5 1.5-3 1-5 0z"/>',
      'tag': '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>',
      'lock': '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
    };
  })();
  // ikon benefit: nama ikon bawaan, emoji, atau link gambar
  function featIcon(icon) {
    const k = String(icon || '').trim();
    if (ICONS[k]) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[k] + '</svg>';
    if (k && isPath(k)) return '<img alt="" src="' + esc(iconUrl(k)) + '">';
    return k ? '<span class="fe">' + esc(k) + '</span>' : '';
  }

  // popup pilihan paket. box = elemen .w tempat popup dipasang
  function openVerifyModal(box, C, name, emitFrom, onClose) {
    const V = C.verify || {}, B = C.badge || {};
    if (V.enabled === false || !(V.plans || []).length) return null;
    const old = box.querySelector('.ov'); if (old) old.remove();
    const vt = (B.types || []).find(t => t.id === B.verifiedType), vIcon = (vt && vt.icon) || '';
    const rep = (t, p, enc) => String(t == null ? '' : t).replace(/\{(name|plan|id)\}/g, (_, k) => { const v = k === 'name' ? (name || '') : p ? (k === 'plan' ? p.name : p.id) : ''; return enc ? encodeURIComponent(v) : v; });
    const ov = document.createElement('div'); ov.className = 'ov';
    const co = V.checkout || {}, fa = p => co.enabled !== false && (p.product || co.product) ? { product: p.product || co.product, pkg: p.package || p.id } : null;
    const featHTML = (p, f) => { const o = typeof f === 'string' ? { text: f } : f || {};
      return '<li><span class="fi">' + featIcon(o.icon || p.featureIcon || V.featureIcon || 'check') + '</span><span class="ft">' + esc(o.text) + (o.note ? '<small>' + esc(o.note) + '</small>' : '') + '</span></li>'; };
    const tplThumb = p => '<div class="thumb t-' + (THUMBS.includes(p.thumb) ? p.thumb : 'plan') + '"><i class="c1"></i><i class="c2"></i><span class="emb">' + iconTag(p.icon || vIcon, 'ok', '30px') + '</span></div>';
    const thumbHTML = p => {
      if (V.showThumb === false) return '';
      if (p.thumbImage) return '<img class="thumb-img" data-pid="' + esc(p.id) + '" alt="" decoding="async" src="' + esc(iconUrl(p.thumbImage)) + '">';   // gambar sendiri: ukuran mengikuti proporsi aslinya
      return THUMBS.includes(p.thumb) ? tplThumb(p) : '';
    };
    const planHTML = p => '<div class="plan' + (p.popular ? ' pop' : '') + '" style="--pc:' + esc(p.color || '#1b8fe6') + '">' + (p.popular ? '<span class="ptag">' + esc(V.popularText) + '</span>' : '') + thumbHTML(p) +
      '<div class="pbody"><div class="pn">' + esc(p.name) + '</div>' + (p.desc ? '<p class="pd">' + esc(p.desc) + '</p>' : '') +
      '<div class="ppr">' + (V.showNormalPrice !== false ? (p.normalPrice ? '<s class="p0">' + esc(p.normalPrice) + '</s>' : '<span class="p0">&nbsp;</span>') : '') +
      '<div class="pp"><b>' + esc(p.price) + '</b><small>' + esc(p.period) + '</small></div></div>' +
      '<ul class="pf">' + (p.features || []).map(f => featHTML(p, f)).join('') + '</ul>' +
      (fa(p) ? '<a class="pb" role="button" tabindex="0" data-plan="' + esc(p.id) + '" data-fa-product="' + esc(fa(p).product) + '" data-fa-package="' + esc(fa(p).pkg) + '">' + esc(p.button || 'Pilih ' + p.name) + '</a>'
        : '<button class="pb" data-plan="' + esc(p.id) + '">' + esc(p.button || 'Pilih ' + p.name) + '</button>') + '</div></div>';
    ov.innerHTML = '<div class="dlg" role="dialog" aria-modal="true" aria-label="' + esc(V.title) + '"><button class="x" data-close aria-label="' + esc(V.closeText) + '">&times;</button>' +
      '<div class="dh"><h3>' + esc(V.title) + '</h3><p>' + esc(rep(V.subtitle)) + '</p></div><div class="plans' + (V.uppercaseName !== false ? ' up' : '') + '">' + V.plans.map(planHTML).join('') + '</div></div>';
    box.appendChild(ov); fixImgs(ov);
    ov.querySelectorAll('img.thumb-img').forEach(img => img.addEventListener('error', () => { const p = V.plans.find(x => x.id === img.dataset.pid); if (p) img.outerHTML = tplThumb(p); }, { once: true }));   // gambar gagal dimuat: pakai thumb template
    const onKey = e => { if (e.key === 'Escape') close(); };
    const close = () => { document.removeEventListener('keydown', onKey); ov.remove(); if (onClose) onClose(); };
    document.addEventListener('keydown', onKey);
    ov.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('a[data-plan]')) { e.preventDefault(); e.target.click(); } });
    ov.addEventListener('click', e => {
      if (e.target === ov || e.target.closest('[data-close]')) return close();
      const b = e.target.closest('[data-plan]'); if (!b) return;
      const p = V.plans.find(x => x.id === b.dataset.plan); if (!p) return;
      const detail = { plan: p, person: name, source: 'jadwal-kerja' };
      (emitFrom || box).dispatchEvent(new CustomEvent('jadwalkerja:verify', { detail, bubbles: true, composed: true }));
      try { if (typeof V.onSelect === 'function') V.onSelect(detail); } catch (err) { console.error(err); }
      if (b.dataset.faProduct !== undefined && document.querySelector('script[src*="fa-checkout"]')) {   // teruskan ke Fixs.Arts Checkout
        const x = document.createElement('a'); x.hidden = true; x.setAttribute('data-fa-product', b.dataset.faProduct); x.setAttribute('data-fa-package', b.dataset.faPackage);
        document.body.appendChild(x); x.click(); setTimeout(() => x.remove(), 0); return;
      }
      if (p.url) window.open(rep(p.url, p, true), '_blank', 'noopener');
      if (V.afterSelect === 'close') return close();
      ov.querySelector('.dlg').innerHTML = '<button class="x" data-close aria-label="' + esc(V.closeText) + '">&times;</button><div class="done">' + iconTag(p.icon || vIcon, 'ok', '', 'pi') + '<h3>' + esc(p.name) + '</h3><p>' + esc(rep(V.selectedText, p)) + '</p><button class="pb" style="--pc:' + esc(p.color || '#1b8fe6') + '" data-close>' + esc(V.closeText) + '</button></div>'; fixImgs(ov);
    });
    const x = ov.querySelector('.x'); if (x) x.focus();
    return { close };
  }

  // dipanggil dari script lain: JadwalKerja.openVerify('Nama', { verify: { plans: [...] } })
  function openVerify(name, user) {
    const C = merge(DEFAULTS, user || {});
    const host = document.createElement('div'); document.body.appendChild(host);
    const m = openVerifyModal(mount(host.attachShadow({ mode: 'open' }), C), C, name, host, () => host.remove());
    if (!m) host.remove();
    return m;
  }

  function init(root, user) {
    const host = typeof root === 'string' ? document.querySelector(root) : root;
    if (!host) return;
    if (host.__jkDestroy) host.__jkDestroy();
    const C = merge(DEFAULTS, user || {}), X = C.texts, Th = C.theme, DT = C.data;
    const B0 = C.badge || {};                 // kompatibel dengan config lama (badge.icon / badge.label)
    if (B0.icon || B0.label) B0.types = (B0.types || []).map(t => t.id === B0.verifiedType ? Object.assign({}, t, B0.icon ? { icon: B0.icon } : {}, B0.label ? { label: B0.label } : {}) : t);
    const sh = host.shadowRoot || host.attachShadow({ mode: 'open' });
    const box = mount(sh, C), $ = s => sh.querySelector(s);

    box.innerHTML = '<div class="card" id="card"><div class="top"><div class="ttl"><div class="lb" data-edit="texts.label">' + esc(X.label) + '</div><h2 id="title" data-edit="texts.title"></h2></div><div class="tr">' +
      (C.showViewAll ? '<button class="va" id="vall" type="button" data-viewall hidden></button>' : '') +
      (C.showSearch ? '<div class="search" data-edit="texts.searchPlaceholder"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
        '<input id="q" type="text" placeholder="' + esc(X.searchPlaceholder) + '" autocomplete="off"><div class="sugg" id="sugg" hidden></div></div>' : '') + '</div></div>' +
      '<div id="single"><hr><div class="scroll"><div id="grid" class="grid' + (C.uppercase ? ' up' : '') + '"></div></div>' +
      '<div class="foot"><div class="who ' + (C.rolePosition === 'beside' ? 'beside' : 'below') + '"><div class="nm' + (C.badge && C.badge.trigger === 'hover' ? ' hover' : '') + '"><b id="name"></b>' +
      '<span class="bds" id="bds"></span></div><span id="role" data-edit="rolePosition"></span></div><div class="nav"><button class="tb" id="today" data-today data-edit="texts.todayButton" hidden>' + esc(X.todayButton) + '</button>' +
      '<button id="prev" data-w="-1" aria-label="' + esc(X.prevWeek) + '">&#8249;</button><span class="range" id="range"></span>' +
      '<button id="next" data-w="1" aria-label="' + esc(X.nextWeek) + '">&#8250;</button></div></div></div>' +
      '<div class="lv' + (C.uppercase ? ' up' : '') + '" id="lv" hidden></div></div>';

    let tipT; let data = null, w0 = null, nW = 1, wi = 0, pi = 0, dead = false, lastKey = new Date().toDateString(), loaded = false, expanded = !!(C.list && C.list.startExpanded), lq = '';
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

    // ---- label / badge ----
    function badgeInfo(name) {
      const B = C.badge || {}; if (!B.enabled) return null;
      const types = B.types || [], o = (B.people || []).find(p => p && nk(p.name) === nk(name));
      const ls = o && o.enabled !== false ? (o.labels || [{ id: B.verifiedType, icon: o.icon, label: o.label }]) : [], items = [];
      let verified = false;
      ls.forEach(l => { const it = typeof l === 'string' ? { id: l } : l, ti = types.findIndex(t => t.id === it.id); if (ti < 0) return;
        if (types[ti].id === B.verifiedType) verified = true;                 // label disembunyikan (enabled:false) tetap dihitung verified
        if (it.enabled === false) return;
        items.push({ ti, icon: it.icon || types[ti].icon, label: it.label || types[ti].label, edit: 'badge.types.' + ti + '.label' }); });
      return { items, verified };
    }
    function hideTip() { clearTimeout(tipT); sh.querySelectorAll('.tip.show').forEach(t => t.classList.remove('show')); }
    function badgeHTML(P, list) {                       // list = tampil di dalam daftar (lebih ringkas)
      const B = C.badge || {}, L = C.list || {}, info = badgeInfo(P.name); if (!info) return '';
      const U = B.unverified || {}, items = info.items.slice(), showU = !info.verified && U.enabled !== false && (!list || L.showUnverified);
      if (showU) items.unshift({ icon: U.icon, label: U.label, un: true, edit: 'badge.unverified.label' });
      const sz = list ? (L.badgeSize || '16px') : (B.size || '20px'), click = B.trigger === 'click', always = !list && B.trigger === 'always';
      let h = items.map(it => '<span class="vbw"><button class="vb" type="button" data-edit="' + esc(it.edit) + '"' + (list ? ' title="' + esc(it.label || '') + '"' : '') + ' aria-label="' + esc(it.label || 'Label') + '">' + iconTag(it.icon, it.un ? 'no' : 'ok', sz) + '</button>' +
        (list ? (click && it.label ? '<span class="tip fx">' + esc(it.label) + '</span>' : '') : '<span class="tip' + (always ? ' inline' : '') + '"' + (!it.label || B.trigger === 'none' ? ' hidden' : '') + '>' + esc(it.label) + '</span>') + '</span>').join('');
      const bt = U.button || {};
      if (!list && showU && bt.enabled !== false && (C.verify || {}).enabled !== false && ((C.verify || {}).plans || []).length)
        h += '<button class="gv" type="button" data-getverified data-edit="badge.unverified.button.text" style="color:' + esc(bt.color) + ';background:' + esc(bt.bg) + ';border-color:' + esc(bt.border) + '">' + esc(bt.text) + '</button>';
      return h;
    }
    function renderBadges(P) { hideTip(); const w = $('#bds'); w.innerHTML = P ? badgeHTML(P, false) : ''; fixImgs(w); }
    const openGV = n => openVerifyModal(box, C, n || (data && data.people[pi] ? data.people[pi].name : ''), host, null);

    // ---- warna nama (solid / gradasi / gradasi berjalan) ----
    function nameStyle(name) {
      const NS = C.nameStyle || {}, o = (NS.people || []).find(p => p && p.enabled !== false && nk(p.name) === nk(name)), st = o || NS.default || {}, bg = st.bg || '';
      if (!bg) return { cls: '', style: '' };
      if (!/gradient/i.test(bg)) return { cls: '', style: 'color:' + bg };
      const cols = bg.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi) || [];
      if (st.animate && cols.length > 1) return { cls: 'ngr ani', style: 'background-image:linear-gradient(90deg,' + cols.concat(cols[0]).join(',') + ');background-size:200% 100%;animation-duration:' + (st.speed || '3s') };
      return { cls: 'ngr', style: 'background-image:' + bg };
    }

    // ---- minggu: header tanggal + bar shift ----
    function cellsFor(P, start) {
      const out = [];
      for (let i = 0; i < 7; i++) { const d = addDays(start, i), inM = d.getFullYear() === data.year && d.getMonth() === data.month - 1; out.push({ inM, s: inM ? resolve(P.days[d.getDate() - 1]) : null }); }
      return out;
    }
    function headHTML(start, off, today) {
      let h = '';
      for (let i = 0; i < 7; i++) {
        const d = addDays(start, i), inM = d.getFullYear() === data.year && d.getMonth() === data.month - 1;
        h += '<div class="d' + (inM ? '' : ' out') + (C.highlightToday && d.getTime() === today.getTime() ? ' today' : '') + '" style="grid-column:' + (i + 1 + off) + '"><span class="dn" data-edit="texts.dayNames">' +
          esc(X.dayNames[d.getDay()]) + '</span><b class="dt" data-edit="dateFormat">' + esc(fmt(d, C.dateFormat, X)) + '</b></div>';
      }
      return h;
    }
    function barsHTML(cells, start, off, list) {
      let h = '';
      for (let i = 0; i < 7;) {
        const s = cells[i].s;
        if (!s) { if (!list && X.emptyDay && cells[i].inM) h += '<div class="em" style="grid-column:' + (i + 1 + off) + '">' + esc(X.emptyDay) + '</div>'; i++; continue; }
        let j = i; while (C.mergeSameShift && j + 1 < 7 && cells[j + 1].s === s) j++;
        const span = j - i + 1, a = fmt(addDays(start, i), '{DD} {MMM}', X), b = fmt(addDays(start, j), '{DD} {MMM}', X), si = C.shifts.indexOf(s);
        h += '<div class="bar' + (span === 1 && String(s.label).length > C.compactLabelChars ? ' s1' : '') + '" data-edit="' + (si >= 0 ? 'shifts.' + si + '.label' : 'unknownShift.bg') + '" style="grid-column:' + (i + 1 + off) + '/span ' + span +
          ';background:' + esc(s.bg) + ';color:' + esc(s.color) + '" title="' + esc(s.label + (s.time ? ' (' + s.time + ')' : '') + ' · ' + (a === b ? a : a + ' - ' + b)) + '"><span>' + esc(s.label) + '</span>' +
          (!list && C.showTime && s.time ? '<small>' + esc(s.time) + '</small>' : '') + '</div>';
        i = j + 1;
      }
      return h;
    }
    function navHTML(start) {
      return '<button data-w="-1" aria-label="' + esc(X.prevWeek) + '"' + (wi <= 0 ? ' disabled' : '') + '>&#8249;</button><span class="range">' + esc(fmt(start, '{DD} {MMM}', X) + ' - ' + fmt(addDays(start, 6), '{DD} {MMM} {YYYY}', X)) +
        '</span><button data-w="1" aria-label="' + esc(X.nextWeek) + '"' + (wi >= nW - 1 ? ' disabled' : '') + '>&#8250;</button>' + (C.showTodayButton && wi !== todayWeek() ? '<button class="tb" data-today>' + esc(X.todayButton) + '</button>' : '');
    }

    // ---- daftar semua karyawan (View All): header tanggal sticky, daftar bisa di-scroll ----
    function renderList(start, today) {
      const L = C.list || {}, lv = $('#lv'), keep = lv.scrollTop, t = nk(lq);
      const rows = data.people.map((p, i) => ({ p, i })).filter(o => !t || nk(o.p.name).includes(t) || nk(o.p.role).includes(t));
      let h = '<div class="li"><div class="lh"><div class="lnav">' + navHTML(start) + '</div>' + headHTML(start, 1, today) + '</div>';
      h += rows.length ? rows.map(o => { const ns = nameStyle(o.p.name), bd = L.showBadges !== false ? badgeHTML(o.p, true) : '';
        return '<div class="lr"><div class="ln"><b class="' + ns.cls + '" style="' + esc(ns.style) + '" data-pick="' + o.i + '" data-edit="person:' + esc(o.p.name) + '">' + esc(o.p.name) + '</b>' +
          (bd ? '<span class="bds">' + bd + '</span>' : '') + (L.showRole ? '<small>' + esc(o.p.role) + '</small>' : '') + '</div>' + barsHTML(cellsFor(o.p, start), start, 1, true) + '</div>'; }).join('')
        : '<div class="msg">' + esc(X.noPerson) + '</div>';
      lv.innerHTML = h + '</div>'; fixImgs(lv); lv.style.maxHeight = L.height || '380px'; lv.style.setProperty('--lc', L.nameWidth || '240px'); lv.scrollTop = keep;
    }

    function update() {
      if (dead) return;
      const nameEl = $('#name'), roleEl = $('#role'), grid = $('#grid'), card = $('#card'), single = $('#single'), lv = $('#lv'), va = $('#vall');
      if (!data || !data.people.length) {
        $('#title').textContent = ''; single.hidden = false; lv.hidden = true; card.classList.remove('ex'); if (va) va.hidden = true;
        grid.innerHTML = '<div class="msg">' + esc(loaded ? X.noData : X.loading) + '</div>';
        nameEl.textContent = ''; roleEl.textContent = ''; $('#bds').innerHTML = ''; $('#range').textContent = ''; $('#prev').disabled = $('#next').disabled = true; $('#today').hidden = true; return;
      }
      if (va) { va.hidden = false; va.textContent = expanded ? X.collapse : X.viewAll; }
      wi = Math.max(0, Math.min(nW - 1, wi));
      const P = data.people[pi] || data.people[0], start = addDays(w0, wi * 7), today = sod(new Date());
      $('#title').textContent = fmt(addDays(start, 3), X.title, X);
      card.classList.toggle('ex', expanded); single.hidden = expanded; lv.hidden = !expanded;
      if (expanded) { renderList(start, today); return; }
      grid.innerHTML = headHTML(start, 0, today) + barsHTML(cellsFor(P, start), start, 0, false);
      const ns = nameStyle(P.name);
      nameEl.className = ns.cls; nameEl.style.cssText = ns.style; nameEl.textContent = P.name; nameEl.setAttribute('data-edit', 'person:' + P.name);
      roleEl.textContent = C.showRole ? P.role : ''; renderBadges(P);
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
      const pk = e.target.closest('[data-pick]');
      if (pk) { if ((C.list || {}).clickName !== 'none') { expanded = false; lq = ''; pick(+pk.dataset.pick); } return; }
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.viewall !== undefined) { expanded = !expanded; lq = ''; if (qi) qi.value = ''; closeSugg(); hideTip(); update(); return; }
      if (b.classList.contains('vb')) {
        const t = b.parentNode.querySelector('.tip');
        if ((C.badge || {}).trigger === 'click' && t && !t.hidden) {
          const open = !t.classList.contains('show'); hideTip();
          if (open) {
            if (t.classList.contains('fx')) { const r = b.getBoundingClientRect(); t.style.left = (r.left + r.width / 2) + 'px'; t.style.top = (r.top - 10) + 'px'; }
            t.classList.add('show'); if (C.badge.autoHideMs > 0) tipT = setTimeout(hideTip, C.badge.autoHideMs);
          }
        }
        return;
      }
      if (b.dataset.getverified !== undefined) { openGV(); return; }
      if (b.dataset.w) { wi += +b.dataset.w; update(); } else if (b.dataset.today !== undefined) { wi = todayWeek(); update(); }
    });
    listen('mousedown', e => { const b = e.target.closest('.sg[data-i]'); if (b) { e.preventDefault(); pick(+b.dataset.i); } });
    listen('input', e => { if (e.target.id !== 'q') return; if (expanded) { lq = qi.value; update(); } else openSugg(); });
    listen('focusin', e => { if (e.target.id === 'q' && !expanded) openSugg(); });
    listen('focusout', e => { if (e.target.id === 'q') setTimeout(closeSugg, 150); });
    listen('keydown', e => {
      if (e.target.id !== 'q') return;
      if (e.key === 'Enter') { const r = found(qi.value); if (r.length) { expanded = false; lq = ''; pick(r[0].i); } } else if (e.key === 'Escape') closeSugg();
    });

    const onDoc = e => { if (e.type === 'keydown' ? e.key === 'Escape' : !e.composedPath().some(n => n.classList && n.classList.contains('vb'))) hideTip(); };
    document.addEventListener('click', onDoc); document.addEventListener('keydown', onDoc);

    load();
    const t1 = DT.source === 'sheet' && DT.refreshMinutes > 0 ? setInterval(() => load(true), DT.refreshMinutes * 60000) : 0;
    const t2 = setInterval(() => { const k = new Date().toDateString(); if (k !== lastKey) { lastKey = k; if (data) { wi = todayWeek(); update(); } } }, 30000);
    const destroy = () => { dead = true; clearInterval(t1); clearInterval(t2); clearTimeout(tipT); document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onDoc); on.forEach(([t, fn]) => sh.removeEventListener(t, fn)); sh.innerHTML = ''; delete host.__jkDestroy; };
    host.__jkDestroy = destroy;
    return { destroy, reload: () => load(true), openVerify: openGV, setEditMode: on => box.classList.toggle('edit', !!on),
      setExpanded: v => { expanded = !!v; lq = ''; if (qi) qi.value = ''; update(); }, isExpanded: () => expanded };
  }

  window.JadwalKerja = { init, openVerify, defaults: DEFAULTS, parseMatrix, parseSheet, icons: ICONS, iconSvg: featIcon, thumbs: THUMBS, version: 4 };
  const auto = () => document.querySelectorAll('[data-jadwal-kerja]').forEach(el => {
    let c = {}; try { c = JSON.parse(el.getAttribute('data-config') || '{}'); } catch (e) {}
    init(el, c);
  });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();
