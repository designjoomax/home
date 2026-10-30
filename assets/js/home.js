// Render Home dari window.JOOMAX_HOME (lihat home.config.js). Tanpa dependency.
(() => {
  "use strict";
  const C = window.JOOMAX_HOME; if (!C) return;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ph = (h) => (h && h !== "#" ? ` href="${esc(h)}"` : ' href="#" data-ph');
  const date = (d) => { const x = new Date(d); return isNaN(x) ? esc(d) : x.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }); };
  const I = {
    calendar: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    clipboard: '<rect x="6" y="4" width="12" height="17" rx="3"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
    file: '<path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4M9 13h6M9 17h4"/>',
    table: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M10 10v9"/>',
    frame: '<rect x="4" y="4" width="16" height="16" rx="3"/><rect x="8" y="8" width="8" height="8" rx="1.5"/>',
    book: '<path d="M5 5a2 2 0 0 1 2-2h12v16H7a2 2 0 0 0-2 2z"/><path d="M5 19V5M9 7h6"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="m5 17 5-4 4 3 2-2 3 3"/>',
    resize: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'
  };
  const ico = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${I[n] || I.grid}</svg>`;
  const TINT = ["#eceef2", "#f1ecec", "#ecf1ee", "#eeeaf2", "#f2f0e8"];
  // placeholder gambar ringan (SVG), dipakai kalau thumb/img kosong
  const placeholder = (label, i) => "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="${TINT[i % TINT.length]}"/><g fill="none" stroke="#b9b9c4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><rect x="270" y="150" width="100" height="80" rx="14"/><circle cx="300" cy="180" r="9"/><path d="m282 220 26-20 20 14 22-18"/></g><text x="320" y="290" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#9a9aa6">${esc(label)}</text></svg>`);
  const img = (src, label, i) => `<img src="${esc(src || placeholder(label, i))}" alt="${esc(label)}" loading="lazy" decoding="async">`;

  // ---- Render ----
  $("#quick").innerHTML = C.quick.map((q) => `<a class="card q"${ph(q.href)}><span class="ic">${ico(q.icon)}</span><h3>${esc(q.title)}</h3><p>${esc(q.desc)}</p></a>`).join("");
  $("#news").innerHTML = C.announcements.map((a, i) => `<button type="button" class="card an" data-i="${i}"><span class="pill">${esc(a.category)}</span><time datetime="${esc(a.date)}">${date(a.date)}</time><h3>${esc(a.title)}</h3><p>${esc(a.desc)}</p></button>`).join("");
  $("#toolgrid").innerHTML = C.tools.map((t, i) => `<article class="card tool">${img(t.thumb, t.name, i)}<div class="tb"><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p><a class="btn"${ph(t.href)}>Open Tool</a></div></article>`).join("");
  const G = C.gallery;
  $("#viewall").setAttribute("href", G.href || "#"); if (!G.href || G.href === "#") $("#viewall").dataset.ph = "";
  $("#gal").innerHTML = G.items.map((g, i) => `<a${ph(G.href)}><figure style="margin:0;height:100%">${img(g.img, g.title, i)}<figcaption>${esc(g.title)}<small>${date(g.date)}</small></figcaption></figure></a>`).join("");
  document.addEventListener("click", (e) => { if (e.target.closest("a[data-ph]")) e.preventDefault(); });

  // ---- Detail pengumuman ----
  const dlg = $("#dlg");
  const openNews = (i) => {
    const a = C.announcements[i]; if (!a) return;
    $("#dc").textContent = a.category; $("#dt").textContent = a.title; $("#dd").innerHTML = date(a.date);
    $("#db").innerHTML = (a.body && a.body.length ? a.body : [a.desc]).map((p) => `<p>${esc(p)}</p>`).join("");
    dlg.showModal ? dlg.showModal() : dlg.setAttribute("open", "");
  };
  $("#news").addEventListener("click", (e) => { const b = e.target.closest(".an"); if (b) openNews(+b.dataset.i); });
  $("#dx").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  // ---- Pencarian (menu, tools, quick access, pengumuman) ----
  const box = $("#search"), q = $("#q"), list = $("#results");
  const index = () => {
    const out = [], seen = new Set(), add = (it) => { const k = it.title.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(it); } };
    C.quick.forEach((x) => add({ title: x.title, type: "Quick Access", href: x.href, text: x.desc }));
    C.tools.forEach((x) => add({ title: x.name, type: "Tool", href: x.href, text: x.desc }));
    ((window.JOOMAX_LAYOUT && window.JOOMAX_LAYOUT.nav) || []).forEach((n) => (n.children || [n]).forEach((x) => x.href && add({ title: x.label, type: n.children ? n.label : "Menu", href: x.href, text: "" })));
    C.announcements.forEach((x, i) => add({ title: x.title, type: "Pengumuman", news: i, text: x.desc + " " + x.category }));
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
      ? hits.map((h, i) => `<li role="option"><a data-n="${i}"${h.news != null ? ' href="#"' : ph(h.href)}>${esc(h.title)}<small>${esc(h.type)}</small></a></li>`).join("")
      : '<li class="none">Tidak ditemukan</li>';
    show(true);
  };
  const choose = (i) => {
    const h = hits[i]; if (!h) return;
    if (h.news != null) { show(false); openNews(h.news); } else if (h.href && h.href !== "#") location.href = h.href;
  };
  q.addEventListener("input", run);
  q.addEventListener("focus", run);
  q.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!hits.length) return; cur = (cur + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length; mark(); }
    else if (e.key === "Enter") { e.preventDefault(); choose(cur < 0 ? 0 : cur); }
    else if (e.key === "Escape") show(false);
  });
  list.addEventListener("click", (e) => { const a = e.target.closest("a[data-n]"); if (a && (hits[+a.dataset.n].news != null)) { e.preventDefault(); choose(+a.dataset.n); } });
  document.addEventListener("pointerdown", (e) => { if (!box.contains(e.target)) show(false); });
})();
