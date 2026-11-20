/*! fixs.arts Custom Cursor v1.1.0 | MIT | https://github.com/fixsarts/cursor */
(() => {
  "use strict";
  const VERSION = "1.1.0";
  if (window.FixsCursor && window.FixsCursor.version) return; // aman bila dimuat dua kali

  const SCRIPT = document.currentScript;
  const DEFAULTS = {
    color: "#3330ff", size: 18, smoothing: 0.22, zIndex: 2147483647,
    // transparan / glass
    opacity: 1, hoverOpacity: -1, blur: 0, dot: true,
    // ripple
    ripple: true, rippleColor: "", rippleSize: 90, rippleDuration: 600, rippleWidth: 2, rippleOpacity: 0.8,
    hoverEffect: true, hoverScale: 1.8, hideNativeCursor: false,
    // trail (efek menggambar)
    preset: "",
    trail: false, trailColors: "#ff9a3c,#ff2e63,#7b2ff7", trailColorMode: "age",
    trailSize: 14, trailDuration: 900, trailTaper: 0.8, trailFade: 1, trailOpacity: 0.9,
    trailGlow: 0.4, trailPressure: 0.3, trailFlowSpeed: 1, trailBlend: "normal",
    selector: 'a[href],button,summary,label[for],select,[role=button],[role=link],[role=tab],[data-cursor-hover],input[type=button],input[type=submit],input[type=reset],input[type=checkbox],input[type=radio],input[type=range]'
  };
  // Preset selalu mengatur ulang semua opsi tampilan ini, jadi pindah preset tidak menyisakan sisa pengaturan lama.
  const RESET = ["color", "size", "smoothing", "opacity", "hoverOpacity", "blur", "dot", "rippleColor", "trail", "trailColors", "trailColorMode", "trailSize", "trailDuration", "trailTaper", "trailFade", "trailOpacity", "trailGlow", "trailPressure", "trailFlowSpeed", "trailBlend"];
  const BASE = {}; RESET.forEach((k) => (BASE[k] = DEFAULTS[k]));
  const PRESETS = {
    default: { ...BASE },
    rocket: { ...BASE, color: "#ff6b00", rippleColor: "#ff6b00", size: 10, smoothing: 0.3, trail: true, trailColors: "#ffd23f,#ff7a00,#e01e37,#4a0a3d", trailSize: 18, trailDuration: 850, trailTaper: 1, trailFade: 1.1, trailOpacity: 0.95, trailGlow: 0.55, trailPressure: 0.25 },
    ink: { ...BASE, color: "#16161a", rippleColor: "#16161a", size: 7, smoothing: 0.35, trail: true, trailColors: "#16161a", trailSize: 8, trailDuration: 1200, trailTaper: 0.9, trailFade: 0.6, trailOpacity: 0.95, trailGlow: 0, trailPressure: 0.7 },
    neon: { ...BASE, color: "#00f0ff", rippleColor: "#00f0ff", size: 8, smoothing: 0.3, trail: true, trailColors: "#00f0ff,#7a5cff,#ff2bd6", trailSize: 12, trailDuration: 950, trailTaper: 0.9, trailOpacity: 1, trailGlow: 0.85, trailPressure: 0.2, trailBlend: "additive" },
    aurora: { ...BASE, color: "#5b8def", rippleColor: "#5b8def", size: 10, smoothing: 0.26, trail: true, trailColors: "#ff5f6d,#ffc371,#47e5bc,#5b8def,#c471ed", trailColorMode: "flow", trailSize: 16, trailDuration: 1200, trailTaper: 0.75, trailGlow: 0.35 },
    glass: { ...BASE, size: 30, opacity: 0.28, hoverOpacity: 0.18, blur: 6 }
  };
  const TEXT = 'input:not([type=button]):not([type=submit]):not([type=reset]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]):not([type=image]),textarea,[contenteditable=""],[contenteditable="true"]';
  const MAX_RIPPLES = 30, MAX_PTS = 700;

  const CSS = `
    :host{all:initial}
    *{box-sizing:border-box;pointer-events:none}
    .t{position:fixed;left:0;top:0}
    .p{position:fixed;left:0;top:0;width:0;height:0;will-change:transform}
    .d{position:absolute;left:calc(var(--s) / -2);top:calc(var(--s) / -2);width:var(--s);height:var(--s);border-radius:50%;background:var(--c);opacity:0;transition:transform .25s cubic-bezier(.22,.8,.24,1),opacity .2s ease}
    .p.on .d{opacity:var(--o)}.p.on.hv .d{opacity:var(--ho)}.p.hv .d{transform:scale(var(--h))}
    .p.gl .d{-webkit-backdrop-filter:blur(var(--b));backdrop-filter:blur(var(--b))}
    .p.nd .d{display:none}
    .r{position:fixed;border-radius:50%}
    @media (prefers-reduced-motion:reduce){.d{transition:none}}`;
  const NATIVE_CSS = `html.fx-cursor-hide,html.fx-cursor-hide *{cursor:none !important}
    html.fx-cursor-hide :is(input:not([type=button]):not([type=submit]):not([type=reset]):not([type=checkbox]):not([type=radio]):not([type=range]),textarea,select,[contenteditable=""],[contenteditable="true"]){cursor:auto !important}`;

  // ---- Util ----
  const mqFine = matchMedia("(any-hover: hover) and (any-pointer: fine)");
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
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
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0, seen = false, shown = false, hover = false, inText = false;
  const ripples = new Set();
  // trail
  let tcv = null, tctx = null, tW = 0, tH = 0, traf = 0, pts = [], dist = 0, brk = true, lut = null, lutKey = null, probe = null;

  const setState = () => {
    if (!pos) return;
    pos.classList.toggle("on", seen && shown && !inText);
    pos.classList.toggle("hv", hover && opts.hoverEffect);
    pos.classList.toggle("gl", opts.blur > 0);
    pos.classList.toggle("nd", !opts.dot);
  };
  const apply = () => {
    if (!host) return;
    const s = host.style, o = clamp01(opts.opacity);
    s.setProperty("z-index", String(opts.zIndex)); s.setProperty("--c", opts.color);
    s.setProperty("--s", opts.size + "px"); s.setProperty("--h", String(opts.hoverScale));
    s.setProperty("--o", String(o)); s.setProperty("--ho", String(opts.hoverOpacity < 0 ? o : clamp01(opts.hoverOpacity)));
    s.setProperty("--b", Math.max(0, opts.blur) + "px");
    document.documentElement.classList.toggle("fx-cursor-hide", !!opts.hideNativeCursor);
    trailSync();
    setState();
  };
  const loop = () => {
    raf = 0;
    const k = mqReduce.matches ? 1 : Math.min(1, Math.max(0.02, opts.smoothing));
    x += (tx - x) * k; y += (ty - y) * k;
    pos.style.transform = `translate3d(${x}px,${y}px,0)`;
    if (tcv && seen && shown && !inText) trailAdd(x, y);
    if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  // ---- Trail (efek menggambar) ----
  const toRGB = (c) => {
    try {
      probe = probe || document.createElement("canvas").getContext("2d");
      probe.fillStyle = "#000"; probe.fillStyle = c;
      const v = String(probe.fillStyle);
      if (v[0] === "#") { const n = parseInt(v.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
      const m = v.match(/[\d.]+/g); return [+m[0], +m[1], +m[2]];
    } catch (e) { return [255, 255, 255]; }
  };
  // Tabel 256 warna hasil interpolasi semua titik gradasi
  const getLut = () => {
    if (lut && lutKey === opts.trailColors) return lut;
    lutKey = opts.trailColors;
    let st = String(lutKey).split(/\||,(?![^(]*\))/).map((s) => s.trim()).filter(Boolean).map(toRGB);
    if (!st.length) st = [[51, 48, 255]];
    if (st.length === 1) st.push(st[0]);
    lut = [];
    for (let i = 0; i < 256; i++) {
      const f = (i / 255) * (st.length - 1), j = Math.min(st.length - 2, Math.floor(f)), t = f - j, a = st[j], b = st[j + 1];
      lut.push([(a[0] + (b[0] - a[0]) * t) | 0, (a[1] + (b[1] - a[1]) * t) | 0, (a[2] + (b[2] - a[2]) * t) | 0]);
    }
    return lut;
  };
  const trailSize = () => {
    if (!tcv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    tW = window.innerWidth; tH = window.innerHeight;
    tcv.width = Math.round(tW * dpr); tcv.height = Math.round(tH * dpr);
    tcv.style.width = tW + "px"; tcv.style.height = tH + "px";
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const trailClear = () => { pts.length = 0; dist = 0; brk = true; if (tctx) tctx.clearRect(0, 0, tW, tH); };
  const trailSync = () => {
    if (!shadow || !pos) return;
    if (opts.trail && !tcv) {
      const c = document.createElement("canvas"), g = c.getContext("2d");
      if (!g) return;
      c.className = "t"; tcv = c; tctx = g;
      shadow.insertBefore(c, pos); trailSize();
    } else if (!opts.trail && tcv) {
      cancelAnimationFrame(traf); traf = 0; trailClear(); tcv.remove(); tcv = tctx = null;
    }
  };
  const trailKick = () => { if (!traf && tcv) traf = requestAnimationFrame(drawTrail); };
  const trailAdd = (px, py) => {
    if (mqReduce.matches) return;
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
    trailKick();
  };
  const drawTrail = () => {
    traf = 0;
    if (!tctx) return;
    const now = performance.now(), life = Math.max(100, opts.trailDuration);
    while (pts.length && now - pts[0].t >= life) pts.shift();
    tctx.clearRect(0, 0, tW, tH);
    if (!pts.length) return;
    if (mqReduce.matches) { pts.length = 0; return; }
    tctx.globalCompositeOperation = /^add|^light/.test(opts.trailBlend) ? "lighter" : "source-over";
    const L = getLut();
    let s = 0;
    for (let i = 1; i <= pts.length; i++) {
      if (i === pts.length || pts[i].b) { if (i - s > 1) drawRun(pts.slice(s, i), now, life, L); s = i; }
    }
    traf = requestAnimationFrame(drawTrail);
  };
  // Satu goresan menerus: dihaluskan (Catmull-Rom), lalu digambar sebagai pita dengan lebar, warna, dan alpha per titik
  const drawRun = (run, now, life, L) => {
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
      const q = S[i], a = clamp01((now - q.t) / life), inv = 1 - a;
      q.w = Math.max(0, W * Math.pow(inv, taper) * (1 - press * Math.min(1, q.v / 2.5) * 0.75)); // lebar (diameter)
      q.al = op * Math.pow(inv, fade);                                                          // opacity akhir di titik ini
      q.u = a;                                                                                  // posisi pada gradasi 0..1
      if (flow) { const f = (q.d * 0.004 * fs) % 2; q.u = f < 1 ? f : 2 - f; }                  // warna "menempel" pada goresan
    }
    // Teknik kuas: stamp bulat rapat sepanjang jalur. Alpha tiap stamp dikompensasi jumlah stamp yang bertumpuk,
    // sehingga opacity di tengah goresan tepat sesuai target, tanpa sambungan antar segmen dan dengan tepi yang lembut.
    const stamp = (px, py, w, al, u, step) => {
      const n = Math.max(1, w / step), c = L[(clamp01(u) * 255) | 0];
      tctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${1 - Math.pow(1 - Math.min(1, al), 1 / n)})`;
      tctx.beginPath(); tctx.arc(px, py, w / 2, 0, 6.2832); tctx.fill();
    };
    const pass = (wm, am) => {
      let carry = 0;
      for (let i = 0; i < m - 1; i++) {
        const a = S[i], b = S[i + 1], sx = b.x - a.x, sy = b.y - a.y, len = Math.hypot(sx, sy);
        if (len < 1e-6) continue;
        let d = carry;
        while (d < len) {
          const t = d / len, w = (a.w + (b.w - a.w) * t) * wm, al = (a.al + (b.al - a.al) * t) * am, step = Math.max(0.8, w * 0.22);
          if (w > 0.4 && al > 0.004) stamp(a.x + sx * t, a.y + sy * t, w, al, a.u + (b.u - a.u) * t, step);
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

  // ---- Ripple ----
  const ripple = (cx, cy, o) => {
    if (!shadow || mqReduce.matches || !("animate" in Element.prototype)) return;
    const r = { ...opts, ...pick(o) }, size = r.rippleSize, color = r.rippleColor || r.color;
    if (ripples.size >= MAX_RIPPLES) { const old = ripples.values().next().value; old.remove(); ripples.delete(old); }
    const el = document.createElement("div"); el.className = "r";
    const s = el.style;
    s.setProperty("left", cx - size / 2 + "px"); s.setProperty("top", cy - size / 2 + "px");
    s.setProperty("width", size + "px"); s.setProperty("height", size + "px");
    s.setProperty("border", `${r.rippleWidth}px solid ${color}`);
    shadow.append(el); ripples.add(el);
    const done = () => { el.remove(); ripples.delete(el); };
    const a = el.animate([{ transform: "scale(0)", opacity: clamp01(r.rippleOpacity) }, { transform: "scale(1)", opacity: 0 }], { duration: Math.max(50, r.rippleDuration), easing: "cubic-bezier(.22,.8,.24,1)", fill: "forwards" });
    a.onfinish = done; a.oncancel = done;
  };

  // ---- Mount / unmount ----
  const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); listeners.push(() => t.removeEventListener(ev, fn, o)); };
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
      if (e.pointerType !== "mouse") { shown = false; brk = true; setState(); return; }
      tx = e.clientX; ty = e.clientY;
      if (!seen) { x = tx; y = ty; seen = true; }
      shown = true; setState(); kick();
    }, cap);
    on(document, "pointerover", (e) => {
      if (e.pointerType !== "mouse") return;
      const t = e.composedPath()[0], el = t && (t.nodeType === 1 ? t : t.parentElement);
      if (!el) return;
      try {
        inText = !!el.closest(TEXT);
        const m = !inText && el.closest(opts.selector);
        hover = !!m && !m.disabled && m.getAttribute("aria-disabled") !== "true";
      } catch (err) { hover = false; }
      if (inText) brk = true; // goresan putus saat masuk kolom teks
      setState();
    }, cap);
    on(document, "pointerdown", (e) => { if (opts.ripple && e.pointerType === "mouse") ripple(e.clientX, e.clientY); }, cap);
    on(document.documentElement, "mouseleave", () => { shown = false; brk = true; setState(); });
    on(document.documentElement, "mouseenter", () => { shown = true; setState(); });
    on(window, "resize", trailSize, { passive: true });
    apply();
  };
  const unmount = () => {
    if (!mounted) return; mounted = false;
    listeners.forEach((f) => f()); listeners = [];
    cancelAnimationFrame(raf); raf = 0; cancelAnimationFrame(traf); traf = 0; ripples.clear();
    pts.length = 0; dist = 0; brk = true; tcv = tctx = null;
    undoCss && undoCss(); undoNative && undoNative();
    document.documentElement.classList.remove("fx-cursor-hide");
    host && host.remove(); host = shadow = pos = null; seen = shown = hover = inText = false;
  };
  const sync = () => { if (started && enabled && mqFine.matches) mount(); else unmount(); };
  const onMq = () => sync();
  mqFine.addEventListener("change", onMq);

  // ---- API publik ----
  const api = {
    version: VERSION,
    get options() { return { ...opts }; },
    get defaults() { return { ...DEFAULTS }; },
    get presets() { return Object.keys(PRESETS); },
    init(o) { opts = { ...opts, ...pick(o) }; started = true; sync(); apply(); return api; },
    configure(o) { opts = { ...opts, ...pick(o) }; apply(); return api; },
    preset(name, o) { return api.configure({ ...o, preset: name }); },
    clearTrail() { trailClear(); return api; },
    enable() { enabled = true; sync(); return api; },
    disable() { enabled = false; sync(); return api; },
    ripple(cx, cy, o) { ripple(cx, cy, o); return api; },
    destroy() { started = false; unmount(); mqFine.removeEventListener("change", onMq); delete window.FixsCursor; }
  };
  window.FixsCursor = api;
  if (!SCRIPT || SCRIPT.dataset.auto !== "false") api.init();
})();
