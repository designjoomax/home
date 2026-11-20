/*! fixs.arts Custom Cursor v1.3.0 | MIT | https://github.com/fixsarts/cursor */
(() => {
  "use strict";
  const VERSION = "1.3.0";
  if (window.FixsCursor && window.FixsCursor.version) return; // aman bila dimuat dua kali

  const SCRIPT = document.currentScript;
  const DEFAULTS = {
    color: "#3330ff", size: 18, smoothing: 0.22, zIndex: 2147483647,
    // transparan / glass
    opacity: 1, hoverOpacity: -1, blur: 0, dot: true,
    // efek klik (ripple = saklar utama semua efek klik)
    ripple: true, clickEffect: "ripple", clickColors: "", clickCount: 16, pressScale: 0.6,
    rippleColor: "", rippleSize: 90, rippleDuration: 600, rippleWidth: 2, rippleOpacity: 0.8,
    hoverEffect: true, hoverScale: 1.8, hideNativeCursor: false,
    reducedMotion: "respect", // "respect" = efek gerak dikurangi bila sistem meminta; "ignore" = selalu tampil
    preset: "",
    // sentuhan (layar sentuh), tombol on/off, simpan status
    touch: true, touchDot: true, touchHaptic: false, remember: false, toggle: false, togglePosition: "bottom-right", toggleLabel: "Fixs Cursor",
    // trail (efek kuas)
    trail: false, trailColors: "#ff9a3c,#ff2e63,#7b2ff7", trailColorMode: "age", trailLength: 0,
    trailSize: 14, trailDuration: 900, trailTaper: 0.8, trailFade: 1, trailOpacity: 0.9,
    trailGlow: 0.4, trailPressure: 0.3, trailFlowSpeed: 1, trailBlend: "normal",
    // percikan partikel saat cursor bergerak
    sparks: false, sparkColors: "", sparkShape: "dot", sparkRate: 8, sparkSize: 3, sparkLife: 700, sparkSpeed: 3, sparkSpread: 70, sparkGravity: 0.3,
    selector: 'a[href],button,summary,label[for],select,[role=button],[role=link],[role=tab],[data-cursor-hover],input[type=button],input[type=submit],input[type=reset],input[type=checkbox],input[type=radio],input[type=range]'
  };
  // Preset selalu mengatur ulang semua opsi tampilan ini, jadi pindah preset tidak menyisakan sisa pengaturan lama.
  const RESET = ["color", "size", "smoothing", "opacity", "hoverOpacity", "blur", "dot", "rippleColor", "clickEffect", "clickColors", "clickCount", "pressScale",
    "trail", "trailColors", "trailColorMode", "trailLength", "trailSize", "trailDuration", "trailTaper", "trailFade", "trailOpacity", "trailGlow", "trailPressure", "trailFlowSpeed", "trailBlend",
    "sparks", "sparkColors", "sparkShape", "sparkRate", "sparkSize", "sparkLife", "sparkSpeed", "sparkSpread", "sparkGravity"];
  const BASE = {}; RESET.forEach((k) => (BASE[k] = DEFAULTS[k]));
  const PRESETS = {
    default: { ...BASE },
    rocket: { ...BASE, color: "#ff6b00", rippleColor: "#ff6b00", size: 10, smoothing: 0.3, clickEffect: "ripple,burst", clickColors: "#ffd23f,#ff7a00,#e01e37",
      trail: true, trailColors: "#ffd23f,#ff7a00,#e01e37,#4a0a3d", trailLength: 320, trailSize: 18, trailDuration: 850, trailTaper: 1, trailFade: 1.1, trailOpacity: 0.95, trailGlow: 0.55, trailPressure: 0.25,
      sparks: true, sparkShape: "spark", sparkRate: 12, sparkSize: 3, sparkLife: 700, sparkSpeed: 3.2, sparkSpread: 75, sparkGravity: 0.15 },
    ink: { ...BASE, color: "#16161a", rippleColor: "#16161a", size: 7, smoothing: 0.35, clickEffect: "pulse", clickColors: "#16161a",
      trail: true, trailColors: "#16161a", trailLength: 260, trailSize: 8, trailDuration: 1200, trailTaper: 0.9, trailFade: 0.6, trailOpacity: 0.95, trailGlow: 0, trailPressure: 0.7 },
    neon: { ...BASE, color: "#00f0ff", rippleColor: "#00f0ff", size: 8, smoothing: 0.3, clickEffect: "double,sparkle", clickColors: "#00f0ff,#7a5cff,#ff2bd6",
      trail: true, trailColors: "#00f0ff,#7a5cff,#ff2bd6", trailLength: 380, trailSize: 12, trailDuration: 950, trailTaper: 0.9, trailOpacity: 1, trailGlow: 0.85, trailPressure: 0.2, trailBlend: "additive",
      sparks: true, sparkShape: "star", sparkRate: 6, sparkSize: 6, sparkLife: 850, sparkSpeed: 2, sparkSpread: 180, sparkGravity: 0 },
    aurora: { ...BASE, color: "#5b8def", rippleColor: "#5b8def", size: 10, smoothing: 0.26, clickEffect: "ripple,confetti", clickColors: "#ff5f6d,#ffc371,#47e5bc,#5b8def,#c471ed",
      trail: true, trailColors: "#ff5f6d,#ffc371,#47e5bc,#5b8def,#c471ed", trailColorMode: "flow", trailLength: 430, trailSize: 16, trailDuration: 1200, trailTaper: 0.75, trailGlow: 0.35,
      sparks: true, sparkShape: "dot", sparkRate: 7, sparkSize: 4.5, sparkLife: 900, sparkSpeed: 1.8, sparkSpread: 180, sparkGravity: -0.1 },
    stardust: { ...BASE, color: "#fb5607", rippleColor: "#fb5607", size: 8, smoothing: 0.3, clickEffect: "sparkle,burst", clickColors: "#ffb703,#fb5607,#ff006e",
      trail: true, trailColors: "#ffb703,#fb5607,#ff006e", trailLength: 200, trailSize: 8, trailDuration: 800, trailTaper: 1, trailGlow: 0.5,
      sparks: true, sparkShape: "mix", sparkRate: 8, sparkSize: 5.5, sparkLife: 900, sparkSpeed: 1.6, sparkSpread: 180, sparkGravity: -0.05 },
    glass: { ...BASE, size: 30, opacity: 0.28, hoverOpacity: 0.18, blur: 6, clickEffect: "ripple,press", pressScale: 0.7 }
  };
  const CONFETTI = "#ff5f6d,#ffc371,#47e5bc,#5b8def,#c471ed";
  const TEXT = 'input:not([type=button]):not([type=submit]):not([type=reset]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]):not([type=image]),textarea,[contenteditable=""],[contenteditable="true"]';
  const MAX_RIPPLES = 30, MAX_PTS = 700, MAX_PARTS = 500;

  const CSS = `
    :host{all:initial}
    *{box-sizing:border-box;pointer-events:none}
    .t{position:fixed;left:0;top:0}
    .p{position:fixed;left:0;top:0;width:0;height:0;will-change:transform}
    .d{position:absolute;left:calc(var(--s) / -2);top:calc(var(--s) / -2);width:var(--s);height:var(--s);border-radius:50%;background:var(--c);opacity:0;transition:transform .25s cubic-bezier(.22,.8,.24,1),opacity .2s ease}
    .p.on .d{opacity:var(--o)}.p.on.hv .d{opacity:var(--ho)}.p.hv .d{transform:scale(var(--h))}
    .p.pr .d{transform:scale(var(--ps))}.p.hv.pr .d{transform:scale(calc(var(--h) * var(--ps)))}
    .p.gl .d{-webkit-backdrop-filter:blur(var(--b));backdrop-filter:blur(var(--b))}
    .p.nd .d{display:none}
    .r{position:fixed;border-radius:50%}
    @media (prefers-reduced-motion:reduce){.d{transition:none}}`;
  const NATIVE_CSS = `html.fx-cursor-hide,html.fx-cursor-hide *{cursor:none !important}
    html.fx-cursor-hide :is(input:not([type=button]):not([type=submit]):not([type=reset]):not([type=checkbox]):not([type=radio]):not([type=range]),textarea,select,[contenteditable=""],[contenteditable="true"]){cursor:auto !important}`;

  const TCSS = `
    :host{all:initial}*{box-sizing:border-box}
    button{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:9px;padding:10px 14px 10px 12px;border-radius:999px;background:rgba(18,18,26,.8);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);color:#f4f4f8;font:600 12.5px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;border:1px solid rgba(255,255,255,.16);box-shadow:0 8px 28px rgba(0,0,0,.3);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .2s ease}
    button:active{transform:scale(.95)}button:focus-visible{outline:2px solid #8f7bff;outline-offset:2px}
    i{width:9px;height:9px;border-radius:50%;background:#7c7c8c;transition:background .2s,box-shadow .2s}
    button[aria-pressed=true] i{background:#37e08a;box-shadow:0 0 10px #37e08a}
    em{font-style:normal;opacity:.6;min-width:1.7em}`;

  // ---- Util ----
  const mqFine = matchMedia("(any-hover: hover) and (any-pointer: fine)");
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const coerce = (k, v) => {
    const d = DEFAULTS[k];
    if (typeof d === "boolean") return !(v === false || v === "false" || v === "0" || v === "off");
    if (typeof d === "number") { const n = parseFloat(v); return isNaN(n) ? d : n; }
    return v == null ? d : String(v);
  };
  // Preset dipasang lebih dulu, lalu opsi yang ditulis eksplisit menimpanya.
  const pick = (src) => {
    const o = {}, p = src && src.preset && PRESETS[String(src.preset).toLowerCase()];
    if (p) for (const k in p) o[k] = coerce(k, p[k]);
    for (const k in DEFAULTS) if (src && src[k] != null) o[k] = coerce(k, src[k]);
    return o;
  };
  // CSS lewat CSSOM supaya tetap jalan di situs ber-CSP ketat
  const addSheet = (root, css) => {
    try {
      const s = new CSSStyleSheet(); s.replaceSync(css);
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, s];
      return () => { root.adoptedStyleSheets = root.adoptedStyleSheets.filter((x) => x !== s); };
    } catch (e) {
      const el = document.createElement("style"); el.textContent = css;
      (root.host ? root : document.head).append(el);
      return () => el.remove();
    }
  };

  // ---- State ----
  let opts = { ...DEFAULTS, ...pick(window.FixsCursorConfig), ...pick(SCRIPT && SCRIPT.dataset) };
  let started = false, enabled = true, mounted = false;
  let host, shadow, pos, undoCss, undoNative, listeners = [];
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0, seen = false, shown = false, hover = false, inText = false, pressed = false;
  const ripples = new Set();
  let isTouch = false, tdown = null, tgl = null;
  // kanvas efek (trail + partikel)
  let tcv = null, tctx = null, tW = 0, tH = 0, traf = 0, lastF = 0, headD = 0;
  let pts = [], parts = [], dist = 0, brk = true, sbrk = true, sx = 0, sy = 0, sacc = 0;
  const lutCache = {};

  const reduce = () => opts.reducedMotion !== "ignore" && mqReduce.matches;
  const effects = (v) => String(v).toLowerCase().split(/[\s,|+]+/).filter(Boolean);
  const wantFx = () => opts.trail || opts.sparks || effects(opts.clickEffect).some((k) => k === "burst" || k === "confetti" || k === "sparkle");
  const breakStroke = () => { brk = true; sbrk = true; };

  const setState = () => {
    if (!pos) return;
    pos.classList.toggle("on", seen && shown && !inText);
    pos.classList.toggle("hv", hover && opts.hoverEffect);
    pos.classList.toggle("pr", pressed && opts.ripple && effects(opts.clickEffect).includes("press"));
    pos.classList.toggle("gl", opts.blur > 0);
    pos.classList.toggle("nd", !opts.dot || (isTouch && !opts.touchDot));
  };
  const apply = () => {
    if (!host) return;
    const s = host.style, o = clamp01(opts.opacity);
    s.setProperty("z-index", String(opts.zIndex)); s.setProperty("--c", opts.color);
    s.setProperty("--s", opts.size + "px"); s.setProperty("--h", String(opts.hoverScale)); s.setProperty("--ps", String(opts.pressScale));
    s.setProperty("--o", String(o)); s.setProperty("--ho", String(opts.hoverOpacity < 0 ? o : clamp01(opts.hoverOpacity)));
    s.setProperty("--b", Math.max(0, opts.blur) + "px");
    document.documentElement.classList.toggle("fx-cursor-hide", !!opts.hideNativeCursor);
    fxSync();
    setState();
  };
  const loop = () => {
    raf = 0;
    const k = reduce() ? 1 : Math.min(1, Math.max(0.02, opts.smoothing));
    x += (tx - x) * k; y += (ty - y) * k;
    pos.style.transform = `translate3d(${x}px,${y}px,0)`;
    if (tcv && seen && shown && !inText) {
      if (opts.trail) trailAdd(x, y);
      if (opts.sparks) sparkEmit(x, y);
    }
    if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  // ---- Kanvas efek ----
  const toRGB = (c) => {
    try {
      toRGB.p = toRGB.p || document.createElement("canvas").getContext("2d");
      toRGB.p.fillStyle = "#000"; toRGB.p.fillStyle = c;
      const v = String(toRGB.p.fillStyle);
      if (v[0] === "#") { const n = parseInt(v.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
      const m = v.match(/[\d.]+/g); return [+m[0], +m[1], +m[2]];
    } catch (e) { return [255, 255, 255]; }
  };
  // Tabel 256 warna hasil interpolasi semua titik gradasi (di-cache per teks warna)
  const getLut = (str) => {
    str = String(str);
    if (lutCache[str]) return lutCache[str];
    if (Object.keys(lutCache).length > 16) for (const k in lutCache) delete lutCache[k];
    let st = str.split(/\||,(?![^(]*\))/).map((s) => s.trim()).filter(Boolean).map(toRGB);
    if (!st.length) st = [[51, 48, 255]];
    if (st.length === 1) st.push(st[0]);
    const lut = [];
    for (let i = 0; i < 256; i++) {
      const f = (i / 255) * (st.length - 1), j = Math.min(st.length - 2, Math.floor(f)), t = f - j, a = st[j], b = st[j + 1];
      lut.push([(a[0] + (b[0] - a[0]) * t) | 0, (a[1] + (b[1] - a[1]) * t) | 0, (a[2] + (b[2] - a[2]) * t) | 0]);
    }
    return (lutCache[str] = lut);
  };
  const rndColor = (str) => getLut(str)[Math.floor(Math.random() * 256)];

  const fxSize = () => {
    if (!tcv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    tW = window.innerWidth; tH = window.innerHeight;
    tcv.width = Math.round(tW * dpr); tcv.height = Math.round(tH * dpr);
    tcv.style.width = tW + "px"; tcv.style.height = tH + "px";
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const fxEnsure = () => {
    if (tcv) return true;
    if (!shadow || !pos) return false;
    const c = document.createElement("canvas"), g = c.getContext("2d");
    if (!g) return false;
    c.className = "t"; tcv = c; tctx = g;
    shadow.insertBefore(c, pos); fxSize();
    return true;
  };
  const fxClear = () => { pts.length = 0; parts.length = 0; dist = 0; breakStroke(); if (tctx) tctx.clearRect(0, 0, tW, tH); };
  const fxRemove = () => { cancelAnimationFrame(traf); traf = 0; lastF = 0; pts.length = 0; parts.length = 0; dist = 0; breakStroke(); if (tcv) tcv.remove(); tcv = tctx = null; };
  const fxSync = () => {
    if (!shadow || !pos) return;
    if (wantFx()) { fxEnsure(); if (!opts.trail) pts.length = 0; }
    else if (tcv) fxRemove();
  };
  const fxKick = () => { if (!traf && tcv) traf = requestAnimationFrame(drawFx); };

  // ---- Trail (kuas) ----
  const trailAdd = (px, py) => {
    if (reduce()) return;
    const now = performance.now(), l = pts[pts.length - 1];
    let v = 0;
    if (l && !brk) {
      const d = Math.hypot(px - l.x, py - l.y);
      if (d < 1.5) return;
      dist += d; v = l.v * 0.7 + (d / Math.max(1, now - l.t)) * 0.3; // kecepatan px/ms (dihaluskan)
    }
    pts.push({ x: px, y: py, t: now, v, d: dist, b: brk || !l });
    brk = false;
    if (pts.length > MAX_PTS) pts.shift();
    fxKick();
  };
  const drawFx = () => {
    traf = 0;
    if (!tctx) return;
    const now = performance.now(), dt = Math.min(50, lastF ? now - lastF : 16.7), life = Math.max(100, opts.trailDuration), Lmax = Math.max(0, opts.trailLength);
    lastF = now;
    if (reduce()) { pts.length = 0; parts.length = 0; }
    while (pts.length && now - pts[0].t >= life) pts.shift();
    if (Lmax) { // buang titik yang sudah melewati panjang kuas (sisakan satu titik agar ujungnya tetap lancip)
      const hd = pts.length ? pts[pts.length - 1].d : 0;
      while (pts.length > 2 && hd - pts[1].d >= Lmax) pts.shift();
    }
    tctx.clearRect(0, 0, tW, tH);
    if (!pts.length && !parts.length) { lastF = 0; if (!wantFx()) fxRemove(); return; }
    tctx.globalCompositeOperation = /^add|^light/.test(opts.trailBlend) ? "lighter" : "source-over";
    if (pts.length) {
      headD = pts[pts.length - 1].d;
      const L = getLut(opts.trailColors);
      let s = 0;
      for (let i = 1; i <= pts.length; i++) {
        if (i === pts.length || pts[i].b) { if (i - s > 1) drawRun(pts.slice(s, i), now, life, L, Lmax); s = i; }
      }
    }
    if (parts.length) drawParts(now, dt);
    traf = requestAnimationFrame(drawFx);
  };
  // Satu goresan menerus: dihaluskan (Catmull-Rom), lalu dilukis dengan teknik stamp kuas
  const drawRun = (run, now, life, L, Lmax) => {
    const S = [], n = run.length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = run[i - 1] || run[i], p1 = run[i], p2 = run[i + 1], p3 = run[i + 2] || p2;
      const m = Math.min(12, Math.max(1, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / 5)));
      for (let k = 0; k < m; k++) {
        const t = k / m, t2 = t * t, t3 = t2 * t;
        S.push({
          x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
          t: p1.t + (p2.t - p1.t) * t, v: p1.v + (p2.v - p1.v) * t, d: p1.d + (p2.d - p1.d) * t
        });
      }
    }
    const e = run[n - 1]; S.push({ x: e.x, y: e.y, t: e.t, v: e.v, d: e.d });

    const m = S.length, W = Math.max(0, opts.trailSize), taper = clamp01(opts.trailTaper) * 1.4, fade = Math.max(0, opts.trailFade);
    const press = clamp01(opts.trailPressure), op = clamp01(opts.trailOpacity), flow = opts.trailColorMode === "flow", fs = opts.trailFlowSpeed, g = clamp01(opts.trailGlow);
    for (let i = 0; i < m; i++) {
      const q = S[i];
      // "umur" goresan = yang lebih besar antara usia waktu dan jarak dari kepala (panjang kuas)
      const a = clamp01(Math.max((now - q.t) / life, Lmax ? (headD - q.d) / Lmax : 0)), inv = 1 - a;
      q.w = Math.max(0, W * Math.pow(inv, taper) * (1 - press * Math.min(1, q.v / 2.5) * 0.75)); // lebar (diameter)
      q.al = op * Math.pow(inv, fade);                                                          // opacity akhir di titik ini
      q.u = a;                                                                                  // posisi pada gradasi 0..1
      if (flow) { const f = (q.d * 0.004 * fs) % 2; q.u = f < 1 ? f : 2 - f; }                  // warna "menempel" pada goresan
    }
    // Teknik kuas: stamp bulat rapat sepanjang jalur. Alpha tiap stamp dikompensasi jumlah stamp yang bertumpuk,
    // sehingga opacity di tengah goresan tepat sesuai target, tanpa sambungan antar segmen dan dengan tepi yang lembut.
    const stamp = (px, py, w, al, u, step) => {
      const nn = Math.max(1, w / step), c = L[(clamp01(u) * 255) | 0];
      tctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${1 - Math.pow(1 - Math.min(1, al), 1 / nn)})`;
      tctx.beginPath(); tctx.arc(px, py, w / 2, 0, 6.2832); tctx.fill();
    };
    const pass = (wm, am) => {
      let carry = 0;
      for (let i = 0; i < m - 1; i++) {
        const a = S[i], b = S[i + 1], dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
        if (len < 1e-6) continue;
        let d = carry;
        while (d < len) {
          const t = d / len, w = (a.w + (b.w - a.w) * t) * wm, al = (a.al + (b.al - a.al) * t) * am, step = Math.max(0.8, w * 0.22);
          if (w > 0.4 && al > 0.004) stamp(a.x + dx * t, a.y + dy * t, w, al, a.u + (b.u - a.u) * t, step);
          d += step;
        }
        carry = d - len;
      }
      const h = S[m - 1], w = h.w * wm;
      if (w > 0.4 && h.al * am > 0.004) stamp(h.x, h.y, w, h.al * am, h.u, Math.max(0.8, w * 0.22));
    };
    if (g > 0) { pass(1 + 2.2 * g, 0.16 * g); pass(1 + g, 0.24 * g); } // halo lembut
    pass(1, 1);
  };

  // ---- Partikel ----
  const spawn = (p) => { if (parts.length >= MAX_PARTS) parts.shift(); parts.push(p); fxKick(); };
  const starPath = (px, py, r, rot) => {
    tctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = rot + (i * Math.PI) / 4, rr = i % 2 ? r * 0.36 : r; tctx.lineTo(px + Math.cos(a) * rr, py + Math.sin(a) * rr); }
    tctx.closePath();
  };
  const drawParts = (now, dt) => {
    const k = dt / 16.667;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i], age = (now - p.t0) / p.life;
      if (age >= 1) { parts.splice(i, 1); continue; }
      const dr = Math.pow(p.drag, k);
      p.vx *= dr; p.vy *= dr; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      const al = p.al * Math.pow(1 - age, 0.8), sz = p.pop ? p.s * Math.sin(Math.PI * age) : p.s * (1 - age * 0.45);
      if (al < 0.01 || sz < 0.2) continue;
      const col = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${al})`;
      tctx.fillStyle = col; tctx.strokeStyle = col;
      if (p.shape === "spark") {
        tctx.lineWidth = Math.max(0.8, sz * 0.85); tctx.lineCap = "round";
        tctx.beginPath(); tctx.moveTo(p.x, p.y); tctx.lineTo(p.x - p.vx * 90, p.y - p.vy * 90); tctx.stroke();
      } else if (p.shape === "star") { starPath(p.x, p.y, sz * 1.1, p.r); tctx.fill(); }
      else if (p.shape === "rect") {
        tctx.save(); tctx.translate(p.x, p.y); tctx.rotate(p.r); tctx.scale(1, Math.cos(age * p.fl + p.ph));
        tctx.fillRect(-sz / 2, -sz * 0.3, sz, sz * 0.6); tctx.restore();
      } else { tctx.beginPath(); tctx.arc(p.x, p.y, sz / 2, 0, 6.2832); tctx.fill(); }
    }
  };
  // Percikan saat cursor bergerak: muncul sebanding jarak tempuh, melesat ke belakang arah gerak (kerucut sparkSpread)
  const sparkEmit = (px, py) => {
    if (reduce()) return;
    if (sbrk) { sx = px; sy = py; sbrk = false; return; }
    const dx = px - sx, dy = py - sy, d = Math.hypot(dx, dy);
    if (d < 0.5) return;
    sx = px; sy = py; sacc += (d * Math.max(0, opts.sparkRate)) / 100;
    const nn = Math.min(12, Math.floor(sacc)); sacc -= Math.floor(sacc);
    const base = Math.atan2(-dy, -dx), spread = (Math.min(180, Math.max(0, opts.sparkSpread)) * Math.PI) / 180;
    const spd = Math.max(0, opts.sparkSpeed) * 0.09 * (1 + Math.min(d, 40) / 40), cols = opts.sparkColors || opts.trailColors, now = performance.now();
    for (let i = 0; i < nn; i++) {
      const ang = base + rnd(-spread, spread), v = spd * rnd(0.25, 1);
      const shape = opts.sparkShape === "mix" ? ["dot", "spark", "star"][(Math.random() * 3) | 0] : opts.sparkShape;
      spawn({ x: px + rnd(-4, 4), y: py + rnd(-4, 4), vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, g: opts.sparkGravity * 0.0006, drag: 0.96,
        t0: now, life: Math.max(100, opts.sparkLife) * rnd(0.6, 1.1), s: Math.max(0.5, opts.sparkSize) * rnd(0.6, 1.2), c: rndColor(cols), al: 1,
        shape, r: rnd(0, 6.28), vr: rnd(-0.006, 0.006) });
    }
  };

  // ---- Efek klik ----
  const ring = (cx, cy, r, o) => {
    o = o || {};
    const still = reduce(), size = r.rippleSize * (o.k || 1), color = r.rippleColor || r.color;
    if (ripples.size >= MAX_RIPPLES) { const old = ripples.values().next().value; old.remove(); ripples.delete(old); }
    const el = document.createElement("div"); el.className = "r";
    const s = el.style;
    s.setProperty("left", cx - size / 2 + "px"); s.setProperty("top", cy - size / 2 + "px");
    s.setProperty("width", size + "px"); s.setProperty("height", size + "px");
    if (o.fill) s.setProperty("background", color); else s.setProperty("border", `${r.rippleWidth}px solid ${color}`);
    shadow.append(el); ripples.add(el);
    const T = still ? 350 : Math.max(50, r.rippleDuration), op = clamp01(r.rippleOpacity) * (o.fill ? 0.55 : 1);
    const done = () => { el.remove(); ripples.delete(el); };
    const base = { duration: T, delay: still ? 0 : o.delay || 0, fill: "both" };
    // ukuran dan opacity memakai easing berbeda: cincin tetap terlihat jelas sampai hampir akhir
    if (!still) el.animate([{ transform: "scale(0)" }, { transform: "scale(1)" }], { ...base, easing: "cubic-bezier(.22,.8,.24,1)" });
    const a = el.animate([{ opacity: op }, { opacity: 0 }], { ...base, easing: "cubic-bezier(.3,.1,.9,.7)" });
    a.onfinish = done; a.oncancel = done;
  };
  const burstFx = (cx, cy, r) => {
    if (reduce() || !fxEnsure()) return;
    const n = Math.max(1, r.clickCount), now = performance.now(), cols = r.clickColors || r.rippleColor || r.color;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * 6.2832 + rnd(-0.25, 0.25), v = r.rippleSize * 0.0034 * rnd(0.55, 1.15);
      spawn({ x: cx, y: cy, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, g: 0, drag: 0.94, t0: now, life: Math.max(100, r.rippleDuration) * rnd(0.8, 1.2),
        s: i % 2 ? rnd(3, 5) : rnd(3.2, 5.2), c: rndColor(cols), al: Math.min(1, r.rippleOpacity * 1.25), shape: i % 2 ? "dot" : "spark", r: 0, vr: 0 });
    }
  };
  const confettiFx = (cx, cy, r) => {
    if (reduce() || !fxEnsure()) return;
    const n = Math.round(Math.max(1, r.clickCount) * 1.5), now = performance.now(), cols = r.clickColors || CONFETTI;
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + rnd(-1.1, 1.1), v = r.rippleSize * 0.005 * rnd(0.5, 1.2);
      spawn({ x: cx, y: cy, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, g: 0.0004, drag: 0.955, t0: now, life: Math.max(100, r.rippleDuration) * rnd(1.3, 2),
        s: rnd(5, 9), c: rndColor(cols), al: Math.min(1, r.rippleOpacity * 1.2), shape: "rect", r: rnd(0, 6.28), vr: rnd(-0.012, 0.012), fl: rnd(0.006, 0.014), ph: rnd(0, 6.28) });
    }
  };
  const sparkleFx = (cx, cy, r) => {
    if (reduce() || !fxEnsure()) return;
    const n = Math.max(3, Math.round(r.clickCount / 4)), now = performance.now(), cols = r.clickColors || r.rippleColor || r.color, k = r.rippleSize / 90;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, 6.28), d = rnd(0.1, 0.5) * r.rippleSize;
      spawn({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, vx: 0, vy: 0, g: 0, drag: 1, t0: now + i * 40, life: Math.max(100, r.rippleDuration) * rnd(0.7, 1.1),
        s: rnd(9, 16) * k, c: rndColor(cols), al: Math.min(1, r.rippleOpacity * 1.2), shape: "star", pop: true, r: rnd(0, 1.5), vr: rnd(-0.004, 0.004) });
    }
  };
  const CLICK = {
    ripple: (cx, cy, r) => ring(cx, cy, r),
    double: (cx, cy, r) => { ring(cx, cy, r); ring(cx, cy, r, { k: 0.62, delay: 120 }); },
    pulse: (cx, cy, r) => ring(cx, cy, r, { fill: true }),
    burst: burstFx, confetti: confettiFx, sparkle: sparkleFx
  };
  const clickFx = (cx, cy, o) => {
    if (!shadow) return;
    const r = { ...opts, ...pick(o) };
    effects(r.clickEffect).forEach((k) => {
      try { if (CLICK[k]) CLICK[k](cx, cy, r); } catch (err) { console.warn("[FixsCursor] efek klik gagal:", k, err); }
    });
  };

  // ---- Mount / unmount ----
  const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push(() => t.removeEventListener(ev, fn, o)); };
  const release = () => { if (pressed) { pressed = false; setState(); } };
  const mount = () => {
    if (mounted) return; mounted = true;
    host = document.createElement("div"); host.setAttribute("data-fixs-cursor", "");
    for (const [k, v] of [["all", "initial"], ["position", "fixed"], ["left", "0"], ["top", "0"], ["width", "0"], ["height", "0"], ["pointer-events", "none"]]) host.style.setProperty(k, v);
    shadow = host.attachShadow({ mode: "closed" });
    undoCss = addSheet(shadow, CSS);
    pos = document.createElement("div"); pos.className = "p";
    const d = document.createElement("div"); d.className = "d"; pos.append(d); shadow.append(pos);
    undoNative = addSheet(document, NATIVE_CSS);
    document.documentElement.append(host);
    const cap = { capture: true, passive: true };
    on(document, "pointermove", (e) => {
      if (e.pointerType === "touch") return; // sentuhan ditangani touch events di bawah
      if (isTouch) { isTouch = false; breakStroke(); }
      tx = e.clientX; ty = e.clientY;
      if (!seen) { x = tx; y = ty; seen = true; }
      shown = true; setState(); kick();
    }, cap);
    on(document, "pointerover", (e) => {
      if (e.pointerType === "touch") return;
      const t = e.composedPath()[0], el = t && (t.nodeType === 1 ? t : t.parentElement);
      if (!el) return;
      try {
        inText = !!el.closest(TEXT);
        const m = !inText && el.closest(opts.selector);
        hover = !!m && !m.disabled && m.getAttribute("aria-disabled") !== "true";
      } catch (err) { hover = false; }
      if (inText) breakStroke(); // goresan putus saat masuk kolom teks
      setState();
    }, cap);
    on(document, "pointerdown", (e) => {
      if (e.pointerType === "touch" || !opts.ripple) return;
      pressed = true; setState(); clickFx(e.clientX, e.clientY);
    }, cap);
    on(document, "pointerup", release, cap);
    on(document, "pointercancel", release, cap);
    on(window, "blur", release);
    on(document.documentElement, "mouseleave", () => { shown = false; breakStroke(); setState(); });
    on(document.documentElement, "mouseenter", () => { shown = true; setState(); });
    on(window, "resize", fxSize, { passive: true });
    // ---- Sentuhan: jari = cursor. Pakai touch events supaya tetap terbaca saat halaman di-scroll ----
    on(document, "touchstart", (e) => {
      if (!opts.touch || !e.touches.length) return;
      const t = e.touches[0];
      isTouch = true; inText = false; hover = false;
      tx = x = t.clientX; ty = y = t.clientY; seen = shown = pressed = true;
      tdown = { x: tx, y: ty, t: performance.now(), moved: false };
      breakStroke(); setState(); kick();
    }, cap);
    on(document, "touchmove", (e) => {
      if (!isTouch || !opts.touch || !e.touches.length) return;
      const t = e.touches[0]; tx = t.clientX; ty = t.clientY; shown = true;
      if (tdown && Math.hypot(tx - tdown.x, ty - tdown.y) > 12) tdown.moved = true;
      setState(); kick();
    }, cap);
    const tend = (e, cancel) => {
      if (!isTouch || (e.touches && e.touches.length)) return;
      const d = tdown; tdown = null; pressed = false; shown = false; breakStroke(); setState();
      if (!cancel && opts.touch && opts.ripple && d && !d.moved && performance.now() - d.t < 500) { // tap = efek klik
        clickFx(d.x, d.y);
        if (opts.touchHaptic && navigator.vibrate) try { navigator.vibrate(8); } catch (err) {}
      }
    };
    on(document, "touchend", (e) => tend(e, false), cap);
    on(document, "touchcancel", (e) => tend(e, true), cap);
    apply();
  };
  const unmount = () => {
    if (!mounted) return; mounted = false;
    listeners.forEach((f) => f()); listeners = [];
    cancelAnimationFrame(raf); raf = 0; ripples.clear();
    fxRemove(); // host dilepas di bawah, kanvas ikut hilang
    undoCss && undoCss(); undoNative && undoNative();
    document.documentElement.classList.remove("fx-cursor-hide");
    host && host.remove(); host = shadow = pos = null; seen = shown = hover = inText = pressed = false; isTouch = false; tdown = null;
  };
  const hasTouch = () => (navigator.maxTouchPoints || 0) > 0 || "ontouchstart" in window;
  const sync = () => { if (started && enabled && (mqFine.matches || (opts.touch && hasTouch()))) mount(); else unmount(); };
  const KEY = "fixscursor:enabled";
  const store = (v) => { try { v == null ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, v ? "1" : "0"); } catch (e) {} };
  const stored = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  // Tombol on/off melayang (opsional, data-toggle="true"), hidup terpisah dari cursor supaya tetap ada saat efek mati
  const tglUI = () => {
    if (!(started && opts.toggle)) { if (tgl) { tgl.undo(); tgl.host.remove(); tgl = null; } return; }
    if (!tgl) {
      const h = document.createElement("div"), sh = h.attachShadow({ mode: "closed" }), b = document.createElement("button");
      h.setAttribute("data-fixs-cursor-toggle", ""); b.type = "button"; b.setAttribute("aria-label", "Nyalakan atau matikan efek kursor dan sentuhan");
      const dot = document.createElement("i"), lb = document.createElement("span"), st = document.createElement("em");
      b.append(dot, lb, st); const undo = addSheet(sh, TCSS); sh.append(b);
      b.addEventListener("click", () => api.toggle());
      document.documentElement.append(h); tgl = { host: h, b, lb, st, undo };
    }
    const s = tgl.host.style, p = String(opts.togglePosition).toLowerCase(), v = p.includes("top") ? "top" : "bottom", z = p.includes("left") ? "left" : "right";
    s.setProperty("all", "initial"); s.setProperty("position", "fixed"); s.setProperty("z-index", String(opts.zIndex));
    ["top", "bottom", "left", "right"].forEach((k) => s.setProperty(k, "auto"));
    s.setProperty(v, "calc(16px + env(safe-area-inset-" + v + ", 0px))"); s.setProperty(z, "calc(16px + env(safe-area-inset-" + z + ", 0px))");
    tgl.lb.textContent = opts.toggleLabel; tgl.st.textContent = enabled ? "On" : "Off"; tgl.b.setAttribute("aria-pressed", String(enabled));
  };
  const setEnabled = (v) => {
    v = !!v;
    if (v !== enabled) {
      enabled = v; if (opts.remember) store(v);
      sync();
      try { window.dispatchEvent(new CustomEvent("fixscursor:change", { detail: { enabled } })); } catch (e) {}
    }
    tglUI();
  };
  const onMq = () => sync();
  mqFine.addEventListener("change", onMq);

  // ---- API publik ----
  const api = {
    version: VERSION,
    get options() { return { ...opts }; },
    get defaults() { return { ...DEFAULTS }; },
    get presets() { return Object.keys(PRESETS); },
    get effects() { return Object.keys(CLICK).concat("press"); },
    init(o) { opts = { ...opts, ...pick(o) }; started = true; if (opts.remember && stored() === "0") enabled = false; sync(); apply(); tglUI(); return api; },
    configure(o) { opts = { ...opts, ...pick(o) }; if (o && "remember" in o) store(opts.remember ? enabled : null); sync(); apply(); tglUI(); return api; },
    preset(name, o) { return api.configure({ ...o, preset: name }); },
    clearTrail() { fxClear(); return api; },
    enable() { setEnabled(true); return api; },
    disable() { setEnabled(false); return api; },
    toggle() { setEnabled(!enabled); return api; },
    get enabled() { return enabled; },
    get touchSupported() { return hasTouch(); },
    click(cx, cy, o) { clickFx(cx, cy, o); return api; },
    ripple(cx, cy, o) { clickFx(cx, cy, o); return api; },
    destroy() { started = false; unmount(); tglUI(); mqFine.removeEventListener("change", onMq); delete window.FixsCursor; }
  };
  window.FixsCursor = api;
  if (!SCRIPT || SCRIPT.dataset.auto !== "false") api.init();
})();
