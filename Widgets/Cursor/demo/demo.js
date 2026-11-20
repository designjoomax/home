// Demo: panel konfigurasi yang memanggil FixsCursor.configure() dari library utama.
(() => {
  const C = window.FixsCursor;
  if (!C) { document.body.insertAdjacentHTML("afterbegin", "<p style='padding:20px'>cursor.js gagal dimuat. Cek path script.</p>"); return; }
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const kebab = (k) => k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
  const isHex = (v) => /^#[0-9a-f]{6}$/i.test(v);
  const hex = (v, fb) => (isHex(v) ? v : fb);
  const colors = (s) => String(s || "").split(/,(?![^(]*\))/).map((x) => x.trim()).filter(isHex);
  const SW = { default: "#3330ff", rocket: "#ffd23f,#ff7a00,#e01e37", ink: "#16161a", neon: "#00f0ff,#7a5cff,#ff2bd6", aurora: "#ff5f6d,#ffc371,#47e5bc,#5b8def,#c471ed", stardust: "#ffb703,#fb5607,#ff006e", glass: "#c9d4ff,#ffffff" };
  const grad = (c) => { const l = c.split(","); return l.length > 1 ? `linear-gradient(135deg,${c})` : l[0]; };

  // Skema kontrol: [tipe, kunci, label, min, max, step] atau [tipe, kunci, label, daftar opsi]
  const UI = {
    Gaya: [["color", "color", "Warna cursor"], ["range", "size", "Ukuran", 4, 64, 1], ["range", "opacity", "Transparansi", 0.05, 1, 0.01], ["range", "hoverOpacity", "Opacity hover (-1 = sama)", -1, 1, 0.01],
      ["range", "blur", "Blur kaca (glass)", 0, 20, 1], ["range", "smoothing", "Kehalusan gerak", 0.05, 1, 0.01], ["check", "dot", "Tampilkan lingkaran"]],
    Trail: [["check", "trail", "Aktifkan trail"], ["range", "trailLength", "Panjang kuas (0 = bebas)", 0, 1000, 10], ["grad"],
      ["select", "trailColorMode", "Mode gradasi", [["age", "Umur (api roket)"], ["flow", "Mengalir (pelangi)"]]],
      ["range", "trailSize", "Tebal maksimum", 2, 48, 1], ["range", "trailDuration", "Lama menghilang (ms)", 200, 3000, 50], ["range", "trailTaper", "Runcing di ujung", 0, 1, 0.05],
      ["range", "trailFade", "Kecepatan pudar", 0, 3, 0.05], ["range", "trailOpacity", "Opacity", 0.05, 1, 0.01], ["range", "trailGlow", "Glow", 0, 1, 0.05],
      ["range", "trailPressure", "Tekanan kuas", 0, 1, 0.05], ["range", "trailFlowSpeed", "Kecepatan aliran warna", 0.1, 4, 0.1],
      ["select", "trailBlend", "Blend", [["normal", "Normal"], ["additive", "Additive (menyala)"]]]],
    Percikan: [["check", "sparks", "Aktifkan percikan"], ["select", "sparkShape", "Bentuk", [["dot", "Titik"], ["spark", "Garis api"], ["star", "Bintang"], ["mix", "Campur"]]],
      ["range", "sparkRate", "Jumlah per 100px", 1, 30, 1], ["range", "sparkSize", "Ukuran", 1, 14, 0.5], ["range", "sparkLife", "Umur (ms)", 200, 2000, 50],
      ["range", "sparkSpeed", "Kecepatan lontar", 0, 8, 0.1], ["range", "sparkSpread", "Sebaran sudut", 0, 180, 5], ["range", "sparkGravity", "Gravitasi (minus = naik)", -1, 1, 0.05]],
    Klik: [["check", "ripple", "Aktifkan efek klik dan tap"], ["fx"], ["color", "rippleColor", "Warna cincin"], ["pal"], ["range", "rippleSize", "Ukuran efek", 30, 240, 1],
      ["range", "rippleDuration", "Durasi (ms)", 200, 1500, 50], ["range", "rippleWidth", "Tebal cincin", 1, 8, 1], ["range", "rippleOpacity", "Opacity efek", 0.05, 1, 0.01],
      ["range", "clickCount", "Jumlah partikel", 4, 60, 1], ["range", "pressScale", "Skala saat ditekan", 0.2, 1, 0.05]],
    Sentuhan: [["note", "Di smartphone, jari berperan sebagai cursor. Efek klik muncul saat tap, jadi menggeser halaman tidak memicu ledakan efek."],
      ["check", "touch", "Aktifkan efek sentuhan"], ["check", "touchDot", "Lingkaran di titik sentuh"], ["check", "touchHaptic", "Getar saat tap (Android)"]],
    Lanjutan: [["check", "toggle", "Tombol on/off melayang"], ["select", "togglePosition", "Posisi tombol", [["bottom-right", "Kanan bawah"], ["bottom-left", "Kiri bawah"], ["top-right", "Kanan atas"], ["top-left", "Kiri atas"]]],
      ["check", "remember", "Ingat status on/off"], ["check", "hoverEffect", "Efek hover"], ["range", "hoverScale", "Skala hover", 1, 4, 0.1], ["check", "hideNativeCursor", "Sembunyikan cursor bawaan"],
      ["select", "reducedMotion", "Reduce motion sistem", [["respect", "Ikuti sistem"], ["ignore", "Abaikan (selalu tampil)"]]]]
  };

  // ---- Bangun panel ----
  const tabs = $("#tabs"), pages = $("#pages"), stopEls = [], palEls = [];
  const input = (t, k, a, b, c) => {
    let i;
    if (t === "select") { i = mk("select"); a.forEach(([v, l]) => { const o = mk("option", "", l); o.value = v; i.append(o); }); }
    else { i = mk("input"); i.type = t === "check" ? "checkbox" : t; if (t === "range") { i.min = a; i.max = b; i.step = c; } }
    i.dataset.k = k; return i;
  };
  const field = ([t, k, label, a, b, c]) => {
    if (t === "note") return mk("p", "note", k);
    if (t === "fx") { const w = mk("div", "fxchips"); w.id = "fxchips"; C.effects.forEach((fx) => { const x = mk("button", "chip", fx); x.type = "button"; x.dataset.fx = fx; x.setAttribute("aria-pressed", "false"); w.append(x); }); return w; }
    const wrap = (n, cnt, store, id) => { const w = mk("div", "f"); w.append(mk("span", "", n)); const r = mk("div", "stops"); for (let j = 0; j < cnt; j++) { const e = mk("input"); e.type = "color"; e.setAttribute("aria-label", n + " " + (j + 1)); store.push(e); r.append(e); } w.append(r); return [w, r]; };
    if (t === "grad") {
      const [w, r] = wrap("Gradasi trail", 5, stopEls), n = input("range", "", 1, 5, 1); n.removeAttribute("data-k"); n.id = "gcount";
      const bar = mk("div", "gradbar"); bar.id = "gradbar"; w.append(n, bar); return w;
    }
    if (t === "pal") return wrap("Palet partikel klik", 3, palEls)[0];
    const w = mk("label", "f " + t), i = input(t, k, a, b, c);
    if (t === "check") w.append(mk("span", "", label), i, mk("span", "sw"));
    else if (t === "range") { const h = mk("span", "fh"); h.append(mk("span", "", label), mk("output")); w.append(h, i); }
    else w.append(mk("span", "", label), i);
    return w;
  };
  Object.entries(UI).forEach(([name, defs], n) => {
    const b = mk("button", "", name); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", String(n === 0)); b.dataset.t = name; tabs.append(b);
    const p = mk("div", "page"); p.dataset.p = name; p.hidden = n !== 0; defs.forEach((d) => p.append(field(d))); pages.append(p);
  });
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$("button", tabs).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    $$(".page", pages).forEach((p) => (p.hidden = p.dataset.p !== b.dataset.t));
  });

  // ---- Baca / tulis konfigurasi ----
  const inputs = () => $$("[data-k]", pages), gcount = $("#gcount"), fxList = () => $$("#fxchips [aria-pressed=true]").map((b) => b.dataset.fx);
  const stops = () => stopEls.slice(0, +gcount.value).map((e) => e.value);
  const read = () => {
    const o = {};
    inputs().forEach((i) => (o[i.dataset.k] = i.type === "checkbox" ? i.checked : i.type === "range" ? +i.value : i.value));
    o.trailColors = stops().join(","); o.clickColors = palEls.map((e) => e.value).join(","); o.clickEffect = fxList().join(",") || "none";
    return o;
  };
  const fill = () => {
    const o = C.options;
    inputs().forEach((i) => { const v = o[i.dataset.k]; if (i.type === "checkbox") i.checked = !!v; else if (i.type === "color") i.value = hex(v || o.color, "#3330ff"); else i.value = v; });
    const l = colors(o.trailColors).slice(0, 5); if (l.length) { gcount.value = l.length; l.forEach((c, n) => (stopEls[n].value = c)); }
    const cl = colors(o.clickColors), cc = cl.length ? cl : [hex(o.rippleColor || o.color, "#3330ff")];
    palEls.forEach((e, n) => (e.value = cc[n % cc.length]));
    const on = String(o.clickEffect).toLowerCase().split(/[\s,|+]+/);
    $$("#fxchips button").forEach((b) => b.setAttribute("aria-pressed", String(on.includes(b.dataset.fx))));
  };

  // ---- Kode pemasangan ----
  let fmt = "html";
  const code = $("#code");
  const build = (o) => {
    const d = C.defaults;
    const keys = Object.keys(o).filter((k) => o[k] !== d[k] && !(k === "rippleColor" && o[k] === o.color) && (k !== "trailColors" || o.trail) && !(k === "clickColors" && !/burst|confetti|sparkle/.test(o.clickEffect)));
    if (fmt === "js") return `FixsCursor.configure({\n${keys.map((k) => `  ${k}: ${JSON.stringify(o[k])}`).join(",\n")}\n});`;
    const a = keys.map((k) => `  data-${kebab(k)}="${o[k]}"`).join("\n");
    return `<script\n  src="https://fixsarts.github.io/cursor/cursor.js"${a ? "\n" + a : ""}\n></script>`;
  };
  const render = () => {
    const o = read(); C.configure(o);
    inputs().concat(gcount).forEach((i) => { const out = i.parentElement.querySelector("output"); if (out) out.textContent = i.dataset.k === "trailLength" && +i.value === 0 ? "bebas" : i.value; });
    stopEls.forEach((e, n) => e.classList.toggle("off", n >= +gcount.value));
    const s = stops(); $("#gradbar").style.background = s.length > 1 ? `linear-gradient(90deg,${s.join(",")})` : s[0];
    code.textContent = build(o);
  };
  $("#fmt").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; fmt = b.dataset.f; $$("#fmt button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); render(); });

  // ---- Preset, acak, reset ----
  const presets = $("#presets"), mark = (n) => $$("button", presets).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.p === n)));
  const usePreset = (n) => { C.configure({ preset: n }); C.clearTrail(); fill(); render(); mark(n); };
  C.presets.forEach((p) => { const b = mk("button", "chip"); b.type = "button"; b.dataset.p = p; b.setAttribute("aria-pressed", "false"); const i = mk("i"); i.style.background = grad(SW[p] || "#6d5dfc"); b.append(i, p); b.addEventListener("click", () => usePreset(p)); presets.append(b); });
  const hsl = (h, s, l) => { s /= 100; l /= 100; const a = s * Math.min(l, 1 - l), f = (n) => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }; return "#" + [f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join(""); };
  const pickOf = (a) => a[(Math.random() * a.length) | 0];
  const randomize = () => {
    const h = Math.random() * 360, n = 2 + ((Math.random() * 3) | 0), cols = [...Array(n)].map((_, i) => hsl((h + i * (30 + Math.random() * 50)) % 360, 85, 58)).join(",");
    C.configure({ preset: "default", color: cols.split(",")[0], rippleColor: cols.split(",")[0], size: 8 + ((Math.random() * 8) | 0), trail: true, trailColors: cols, trailColorMode: pickOf(["age", "flow"]),
      trailLength: 150 + ((Math.random() * 400) | 0), trailSize: 8 + ((Math.random() * 14) | 0), trailGlow: Math.random(), trailBlend: pickOf(["normal", "additive"]),
      sparks: Math.random() > 0.35, sparkShape: pickOf(["dot", "spark", "star", "mix"]), clickEffect: pickOf(["ripple,burst", "double,sparkle", "ripple,confetti", "pulse"]), clickColors: cols });
    C.clearTrail(); fill(); render(); mark("");
  };
  $("#rand").addEventListener("click", randomize);
  $("#reset").addEventListener("click", () => usePreset("default"));
  pages.addEventListener("input", () => { render(); mark(""); });
  $("#fxchips").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); render(); mark(""); if (b.getAttribute("aria-pressed") === "true") { const r = b.getBoundingClientRect(); C.click(r.left + r.width / 2, r.top + r.height / 2); } });

  // ---- Salin script ----
  const toast = $("#toast"); let tt = 0;
  const say = (m) => { toast.textContent = m; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("show"), 1800); };
  const copy = async () => {
    const txt = code.textContent;
    try { await navigator.clipboard.writeText(txt); }
    catch (err) { const t = mk("textarea"); t.value = txt; t.style.cssText = "position:fixed;opacity:0"; document.body.append(t); t.select(); try { document.execCommand("copy"); } catch (e2) {} t.remove(); }
    say(fmt === "js" ? "Kode JavaScript tersalin" : "Script tersalin ke clipboard");
  };
  $$("[data-copy]").forEach((b) => b.addEventListener("click", copy));

  // ---- On/off utama, tema, status perangkat ----
  const master = $("#master"), syncMaster = () => { master.setAttribute("aria-checked", String(C.enabled)); $("#master-t").textContent = C.enabled ? "On" : "Off"; };
  master.addEventListener("click", () => { C.toggle(); say(C.enabled ? "Efek dinyalakan" : "Efek dimatikan"); });
  window.addEventListener("fixscursor:change", syncMaster); syncMaster();
  const root = document.documentElement;
  $("#theme").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark"; try { localStorage.setItem("fixs-theme", root.dataset.theme); } catch (e) {}
  });
  try { const t = localStorage.getItem("fixs-theme"); if (t) root.dataset.theme = t; } catch (e) {}
  const modes = [matchMedia("(any-pointer: fine)").matches && "Mouse", C.touchSupported && "Sentuhan"].filter(Boolean);
  $("#mode").textContent = "Perangkat ini: " + (modes.join(" + ") || "tidak terdeteksi");

  usePreset("rocket");
})();
