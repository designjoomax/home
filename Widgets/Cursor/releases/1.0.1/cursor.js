/*! fixs.arts Custom Cursor v1.0.1 | MIT | https://github.com/fixsarts/cursor */
(() => {
  "use strict";
  const VERSION = "1.0.1";
  if (window.FixsCursor && window.FixsCursor.version) return; // aman bila dimuat dua kali

  const SCRIPT = document.currentScript;
  const DEFAULTS = {
    color: "#3330ff", size: 18, smoothing: 0.22, zIndex: 2147483647,
    ripple: true, rippleColor: "", rippleSize: 90, rippleDuration: 600, rippleWidth: 2,
    hoverEffect: true, hoverScale: 1.8, hideNativeCursor: false, force: false,
    selector: 'a[href],button,summary,label[for],select,[role=button],[role=link],[role=tab],[data-cursor-hover],input[type=button],input[type=submit],input[type=reset],input[type=checkbox],input[type=radio],input[type=range]'
  };
  const TEXT = 'input:not([type=button]):not([type=submit]):not([type=reset]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]):not([type=image]),textarea,[contenteditable=""],[contenteditable="true"]';
  const MAX_RIPPLES = 30;

  const CSS = `
    :host{all:initial}
    *{box-sizing:border-box;pointer-events:none}
    .p{position:fixed;left:0;top:0;width:0;height:0;will-change:transform}
    .d{position:absolute;left:calc(var(--s) / -2);top:calc(var(--s) / -2);width:var(--s);height:var(--s);border-radius:50%;background:var(--c);opacity:0;transition:transform .25s cubic-bezier(.22,.8,.24,1),opacity .2s ease}
    .p.on .d{opacity:1}.p.hv .d{transform:scale(var(--h))}
    .r{position:fixed;border-radius:50%}
    @media (prefers-reduced-motion:reduce){.d{transition:none}}`;
  const NATIVE_CSS = `html.fx-cursor-hide,html.fx-cursor-hide *{cursor:none !important}
    html.fx-cursor-hide :is(input:not([type=button]):not([type=submit]):not([type=reset]):not([type=checkbox]):not([type=radio]):not([type=range]),textarea,select,[contenteditable=""],[contenteditable="true"]){cursor:auto !important}`;

  // ---- Util ----
  const mqFine = matchMedia("(any-hover: hover) and (any-pointer: fine)");
  const mqTouch = matchMedia("(hover: none) and (pointer: coarse)");
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  // addEventListener di MediaQueryList tidak ada di Safari lama
  const listen = (mq, fn) => { try { mq.addEventListener("change", fn); } catch (e) { try { mq.addListener(fn); } catch (e2) {} } };
  const unlisten = (mq, fn) => { try { mq.removeEventListener("change", fn); } catch (e) { try { mq.removeListener(fn); } catch (e2) {} } };
  const coerce = (k, v) => {
    const d = DEFAULTS[k];
    if (typeof d === "boolean") return !(v === false || v === "false" || v === "0" || v === "off");
    if (typeof d === "number") { const n = parseFloat(v); return isNaN(n) ? d : n; }
    return v == null ? d : String(v);
  };
  const pick = (src) => { const o = {}; for (const k in DEFAULTS) if (src && src[k] != null) o[k] = coerce(k, src[k]); return o; };
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

  const setState = () => {
    if (!pos) return;
    pos.classList.toggle("on", seen && shown && !inText);
    pos.classList.toggle("hv", hover && opts.hoverEffect);
  };
  const apply = () => {
    if (!host) return;
    const s = host.style;
    s.setProperty("z-index", String(opts.zIndex)); s.setProperty("--c", opts.color);
    s.setProperty("--s", opts.size + "px"); s.setProperty("--h", String(opts.hoverScale));
    document.documentElement.classList.toggle("fx-cursor-hide", !!opts.hideNativeCursor);
    setState();
  };
  const loop = () => {
    raf = 0;
    const k = mqReduce.matches ? 1 : Math.min(1, Math.max(0.02, opts.smoothing));
    x += (tx - x) * k; y += (ty - y) * k;
    pos.style.transform = `translate3d(${x}px,${y}px,0)`;
    if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

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
    const a = el.animate([{ transform: "scale(0)", opacity: 0.8 }, { transform: "scale(1)", opacity: 0 }], { duration: Math.max(50, r.rippleDuration), easing: "cubic-bezier(.22,.8,.24,1)", fill: "forwards" });
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
      if (e.pointerType !== "mouse") { shown = false; setState(); return; }
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
      setState();
    }, cap);
    on(document, "pointerdown", (e) => { if (opts.ripple && e.pointerType === "mouse") ripple(e.clientX, e.clientY); }, cap);
    on(document.documentElement, "mouseleave", () => { shown = false; setState(); });
    on(document.documentElement, "mouseenter", () => { shown = true; setState(); });
    apply();
  };
  const unmount = () => {
    if (!mounted) return; mounted = false;
    listeners.forEach((f) => f()); listeners = [];
    cancelAnimationFrame(raf); raf = 0; ripples.clear();
    undoCss && undoCss(); undoNative && undoNative();
    document.documentElement.classList.remove("fx-cursor-hide");
    host && host.remove(); host = shadow = pos = null; seen = shown = hover = inText = false;
  };
  const supported = () => opts.force || mqFine.matches || !mqTouch.matches;
  const sync = () => {
    if (started && enabled && supported()) {
      // satu cursor per halaman: jangan menumpuk dengan library cursor Joomax/fixs.arts lain
      if (!mounted && document.querySelector("[data-joomax-cursor],[data-fixs-cursor]")) { console.warn("[FixsCursor] Ada cursor library lain di halaman ini, FixsCursor tidak diaktifkan."); return; }
      mount();
    } else unmount();
  };
  const onMq = () => sync();
  listen(mqFine, onMq); listen(mqTouch, onMq);

  // ---- API publik ----
  const api = {
    version: VERSION,
    get options() { return { ...opts }; },
    init(o) { opts = { ...opts, ...pick(o) }; started = true; sync(); apply(); return api; },
    configure(o) { opts = { ...opts, ...pick(o) }; apply(); return api; },
    enable() { enabled = true; sync(); return api; },
    disable() { enabled = false; sync(); return api; },
    ripple(cx, cy, o) { ripple(cx, cy, o); return api; },
    destroy() { started = false; unmount(); unlisten(mqFine, onMq); unlisten(mqTouch, onMq); delete window.FixsCursor; }
  };
  window.FixsCursor = api;
  if (!SCRIPT || SCRIPT.dataset.auto !== "false") { try { api.init(); } catch (e) { console.error("[FixsCursor] gagal memulai:", e); } }
})();
