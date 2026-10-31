// Render Home dari window.JOOMAX_HOME (lihat home.config.js). Tanpa dependency.
(() => {
  "use strict";
  const C = window.JOOMAX_HOME; if (!C) return;
  const $ = (s) => document.querySelector(s);
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ------------------------------------------------------------------ util
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const date = (d) => { const x = new Date(d); return isNaN(x) ? esc(d) : x.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }); };
  const external = (h) => { try { return new URL(h, location.href).origin !== location.origin; } catch { return false; } };
  // atribut link: "#" / kosong = link sementara, link luar dibuka di tab baru
  const lnk = (h) => !h || h === "#" ? ' href="#" data-ph' : ` href="${esc(h)}"` + (external(h) ? ' target="_blank" rel="noopener noreferrer"' : "");
  const I = {
    calendar: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    clipboard: '<rect x="6" y="4" width="12" height="17" rx="3"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
    file: '<path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4M9 13h6M9 17h4"/>',
    table: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M9.5 9.5v10"/>',
    frame: '<rect x="4" y="4" width="16" height="16" rx="3"/><rect x="8" y="8" width="8" height="8" rx="1.5"/>',
    book: '<path d="M5 5a2 2 0 0 1 2-2h12v16H7a2 2 0 0 0-2 2z"/><path d="M5 19V5M9 7h6"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="m5 17 5-4 4 3 2-2 3 3"/>',
    resize: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'
  };
  const ico = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[n] || I.grid}</svg>`;
  const TINT = ["#ececf0", "#f1ecea", "#ebf0ed", "#eeeaf2", "#f2f0e7"];
  // placeholder ringan (SVG) kalau thumb/img kosong
  const placeholder = (i) => "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice"><rect width="640" height="400" fill="${TINT[i % TINT.length]}"/>` +
    `<g fill="none" stroke="#a9a9b4" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><rect x="262" y="146" width="116" height="92" rx="16"/><circle cx="296" cy="180" r="10"/><path d="m276 228 30-23 22 16 26-21"/></g></svg>`);
  const img = (src, label, i) => `<img src="${esc(src || placeholder(i))}" alt="${esc(label)}" loading="lazy" decoding="async">`;

  // ------------------------------------------------------------------ hero
  if (C.hero) {
    if (C.hero.title) $("#heroTitle").textContent = C.hero.title;
    if (C.hero.subtitle) $("#heroSub").textContent = C.hero.subtitle;
    if (C.hero.placeholder) $("#q").placeholder = C.hero.placeholder;
  }

  // ------------------------------------------------------------------ banner slide
  (function banner() {
    const B = C.banner || {}, items = (B.items || []).filter((x) => x && x.img);
    const root = $("#banner"), track = $("#bnTrack"), view = $("#bnView"), dots = $("#bnDots");
    if (!items.length) { root.hidden = true; return; }
    const n = items.length;
    const slide = (it, i, clone, first) => {
      const im = `<img src="${esc(it.img)}" alt="${esc(clone ? "" : it.alt || "")}" draggable="false" decoding="async"${first ? ' fetchpriority="high"' : ""}>`;
      const inner = it.href ? `<a${lnk(it.href)} draggable="false"${clone ? ' tabindex="-1"' : ""}>${im}</a>` : im;
      return `<div class="bn-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${n}"${clone ? ' aria-hidden="true"' : ""}>${inner}</div>`;
    };
    if (n === 1) { track.innerHTML = slide(items[0], 0, false, true); root.classList.add("single"); return; }
    // [salinan slide terakhir] [slide 1..n] [salinan slide pertama] => putaran tanpa lompatan
    track.innerHTML = slide(items[n - 1], n - 1, true) + items.map((it, i) => slide(it, i, false, i === 0)).join("") + slide(items[0], 0, true);
    dots.innerHTML = B.dots === false ? "" : items.map((_, i) => `<button type="button" aria-label="Banner ${i + 1}"></button>`).join("");

    let pos = 1, busy = false, token = 0, timer = 0, paused = false, visible = true, down = false, dragging = false, sx = 0, dx = 0;
    const put = (p) => { track.style.transform = `translateX(${-p * 100}%)`; };
    const idx = () => (pos - 1 + n) % n;
    const sync = () => [...dots.children].forEach((d, i) => d.setAttribute("aria-current", String(i === idx())));
    const settle = () => {
      if (!busy) return; busy = false;
      if (pos === n + 1 || pos === 0) {
        pos = pos === 0 ? n : 1;
        track.classList.add("nt"); put(pos); void track.offsetWidth; track.classList.remove("nt");
      }
    };
    const move = (p) => {
      if (busy) return; busy = true; const t = ++token;
      track.classList.remove("nt"); pos = p; put(p); sync();
      setTimeout(() => { if (t === token) settle(); }, 1100);   // cadangan kalau transitionend tidak datang
    };
    track.addEventListener("transitionend", (e) => { if (e.target === track && e.propertyName === "transform") settle(); });
    put(pos); sync();

    // autoplay (berhenti saat disorot, tab tersembunyi, atau banner di luar layar)
    const delay = +B.autoplay || 0;
    const stop = () => clearInterval(timer);
    const play = () => { stop(); if (delay > 0 && !REDUCED && !paused && visible && !document.hidden) timer = setInterval(() => { if (!busy && !dragging) move(pos + 1); }, delay); };
    root.addEventListener("pointerenter", () => { paused = true; stop(); });
    root.addEventListener("pointerleave", () => { paused = false; play(); });
    root.addEventListener("focusin", () => { paused = true; stop(); });
    root.addEventListener("focusout", () => { paused = false; play(); });
    document.addEventListener("visibilitychange", play);
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; play(); }).observe(root);
    play();

    $("#bnNext").addEventListener("click", () => move(pos + 1));
    $("#bnPrev").addEventListener("click", () => move(pos - 1));
    dots.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) move([...dots.children].indexOf(b) + 1); });
    root.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") move(pos + 1); else if (e.key === "ArrowLeft") move(pos - 1); });

    // geser dengan jari / mouse
    view.addEventListener("pointerdown", (e) => { if (busy || (e.pointerType === "mouse" && e.button !== 0)) return; down = true; dragging = false; sx = e.clientX; dx = 0; });
    view.addEventListener("pointermove", (e) => {
      if (!down) return; dx = e.clientX - sx;
      if (!dragging && Math.abs(dx) > 6) { dragging = true; view.classList.add("drag"); track.classList.add("nt"); view.setPointerCapture(e.pointerId); }
      if (dragging) track.style.transform = `translateX(calc(${-pos * 100}% + ${dx}px))`;
    });
    const end = () => {
      if (!down) return; down = false; if (!dragging) return;
      view.classList.remove("drag"); track.classList.remove("nt");
      const w = view.offsetWidth;
      if (dx < -w * 0.14) move(pos + 1); else if (dx > w * 0.14) move(pos - 1); else put(pos);
      setTimeout(() => { dragging = false; }, 0);
    };
    view.addEventListener("pointerup", end); view.addEventListener("pointercancel", end);
    view.addEventListener("click", (e) => { if (dragging) { e.preventDefault(); e.stopPropagation(); } }, true);
  })();

  // ------------------------------------------------------------------ Quick Access
  (function quick() {
    const el = $("#quick"), prev = $("#qaPrev"), next = $("#qaNext");
    el.innerHTML = C.quick.map((q, i) =>
      `<a class="qcard"${lnk(q.href)}><div class="qthumb">${img(q.thumb, q.title, i)}</div><div class="qbody"><span class="ic">${ico(q.icon)}</span><div><h3>${esc(q.title)}</h3><p>${esc(q.desc)}</p></div></div></a>`).join("");
    const step = () => { const c = el.querySelector(".qcard"); return c ? c.offsetWidth + 20 : 300; };
    const update = () => {
      const over = el.scrollWidth > el.clientWidth + 4;
      prev.hidden = next.hidden = !over;
      prev.disabled = el.scrollLeft <= 2;
      next.disabled = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    };
    prev.addEventListener("click", () => el.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => el.scrollBy({ left: step(), behavior: "smooth" }));
    el.addEventListener("scroll", update, { passive: true });
    if ("ResizeObserver" in window) new ResizeObserver(update).observe(el); else addEventListener("resize", update);
    update();
  })();

  // ------------------------------------------------------------------ Featured Tools
  $("#toolgrid").innerHTML = C.tools.map((t, i) =>
    `<a class="tool"${lnk(t.href)}><div class="timg">${img(t.thumb, t.name, i)}</div><div class="tb"><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p><span class="btn">Open Tool</span></div></a>`).join("");

  // ------------------------------------------------------------------ Latest Memories
  const G = C.gallery || { items: [] };
  const va = $("#viewall"); va.setAttribute("href", G.href || "#"); if (!G.href || G.href === "#") va.dataset.ph = "";
  else if (external(G.href)) { va.target = "_blank"; va.rel = "noopener noreferrer"; }
  const gUrl = (g) => (G.href ? G.href.replace(/#.*$/, "").replace(/\/?$/, "/") + (g.id ? "#" + encodeURIComponent(g.id) : "") : "#");
  $("#gal").innerHTML = G.items.map((g, i) =>
    `<a${lnk(gUrl(g))}><figure style="margin:0;height:100%">${img(g.img, g.title, i)}<figcaption>${esc(g.title)}<small>${date(g.date)}</small></figcaption></figure></a>`).join("");
  document.addEventListener("click", (e) => { if (e.target.closest("a[data-ph]")) e.preventDefault(); });

  // ------------------------------------------------------------------ Pencarian
  const box = $("#search"), q = $("#q"), list = $("#results");
  const index = () => {
    const out = [], seen = new Set(), add = (it) => { const k = it.title.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(it); } };
    C.quick.forEach((x) => add({ title: x.title, type: "Quick Access", href: x.href, text: x.desc }));
    C.tools.forEach((x) => add({ title: x.name, type: "Tool", href: x.href, text: x.desc }));
    ((window.JOOMAX_LAYOUT && window.JOOMAX_LAYOUT.nav) || []).forEach((n) => (n.children || [n]).forEach((x) => x.href && add({ title: x.label, type: n.children ? n.label : "Menu", href: x.href, text: x.desc || "" })));
    G.items.forEach((x) => add({ title: x.title, type: "Gallery", href: gUrl(x), text: "" }));
    return out;
  };
  let hits = [], cur = -1;
  const show = (on) => { list.hidden = !on; q.setAttribute("aria-expanded", String(on)); };
  const mark = () => list.querySelectorAll("a").forEach((a, i) => a.setAttribute("aria-selected", String(i === cur)));
  const run = () => {
    const v = q.value.trim().toLowerCase(); cur = -1;
    if (!v) { show(false); return; }
    hits = index().filter((x) => (x.title + " " + x.type + " " + x.text).toLowerCase().includes(v)).slice(0, 6);
    list.innerHTML = hits.length
      ? hits.map((h) => `<li role="option"><a${lnk(h.href)}>${esc(h.title)}<small>${esc(h.type)}</small></a></li>`).join("")
      : '<li class="none">Tidak ditemukan</li>';
    show(true);
  };
  const choose = (i) => { const h = hits[i]; if (h && h.href && h.href !== "#") { external(h.href) ? window.open(h.href, "_blank", "noopener") : (location.href = h.href); } };
  q.addEventListener("input", run);
  q.addEventListener("focus", run);
  q.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!hits.length) return; cur = (cur + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length; mark(); }
    else if (e.key === "Enter") { e.preventDefault(); choose(cur < 0 ? 0 : cur); }
    else if (e.key === "Escape") show(false);
  });
  document.addEventListener("pointerdown", (e) => { if (!box.contains(e.target)) show(false); });

  // ------------------------------------------------------------------ Muncul halus saat digulir
  if ("IntersectionObserver" in window && !REDUCED) {
    const els = [...document.querySelectorAll(".hero .wrap, .sec .wrap")];
    els.forEach((e) => e.classList.add("rv"));
    const io = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
    els.forEach((e) => io.observe(e));
  }
})();
