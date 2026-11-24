/* Web pública */
const $ = (id) => document.getElementById(id);
const view = $("view"), search = $("search"), modal = $("modal"), modalBody = $("modal-body");
let books = [], themes = [], S = mergeSettings({});
let current = null, sortBy = "recent", onlyNew = false, carT, ignorePop = false;

const themeBy = (n) => themeIn(themes, n);
const isNew = (b) => daysAgo(b) < S.newDays;
const SORTS = {
  recent: ["Más recientes", byDate],
  title: ["Título A-Z", (a, b) => String(a.title).localeCompare(String(b.title), "es")],
  author: ["Autor", (a, b) => String(a.author).localeCompare(String(b.author), "es")],
  year: ["Año de publicación", (a, b) => (+b.year || 0) - (+a.year || 0)]
};

function header() {
  $("t-eyebrow").textContent = S.eyebrow; $("t-eyebrow").hidden = !S.eyebrow;
  $("t-title").innerHTML = titleHTML(S.title);
  $("t-lead").textContent = S.lead; $("t-lead").hidden = !S.lead;
  $("social").innerHTML = socialsHTML(S);
  $("year").textContent = new Date().getFullYear();
}

function row(b, i, n, showTag) {
  const t = themeBy(b.theme);
  return `<button class="row" data-i="${i}" style="--tc:${t.color};--d:${Math.min(n, 15) * 30}ms">
  <div class="thumb" data-ph="${esc(ph(b))}">${cover(b)}</div>
  <div class="info"><h4>${b.featured ? '<span class="star">⭐</span>' : ""}${esc(b.title)}${isNew(b) ? '<span class="new">NUEVO</span>' : ""}${showTag ? `<span class="tag">${esc(t.name)}</span>` : ""}</h4><div class="au">${esc(b.author)}</div>${b.synopsis ? `<div class="snip">${esc(b.synopsis)}</div>` : ""}</div>
  <div class="side"><span class="y">${relDate(b)}</span>${b.youtube ? '<span class="ic" title="Vídeo">▶</span>' : ""}${b.amazon ? '<span class="ic" title="Amazon">🛒</span>' : ""}</div>
 </button>`;
}

const toolbar = () => `<div class="toolbar"><select id="sort" aria-label="Ordenar">${Object.entries(SORTS).map(([k, [l]]) => `<option value="${k}" ${k === sortBy ? "selected" : ""}>${l}</option>`).join("")}</select><label class="tog"><input type="checkbox" id="onlynew" ${onlyNew ? "checked" : ""}> Solo novedades</label></div>`;

function listRows(filter, showTag) {
  const list = books.map((b, i) => ({ b, i })).filter(({ b }) => filter(b) && (!onlyNew || isNew(b))).sort((x, y) => SORTS[sortBy][1](x.b, y.b));
  return list.length ? `<div class="rows">${list.map(({ b, i }, n) => row(b, i, n, showTag)).join("")}</div>`
    : `<p class="empty">${onlyNew ? "Aquí no hay novedades todavía." : "No hay libros que coincidan."}</p>`;
}

function featuredHTML() {
  const f = books.map((b, i) => ({ b, i })).filter(({ b }) => b.featured).sort((x, y) => byDate(x.b, y.b)).slice(0, S.maxFeatured);
  if (!f.length) return "";
  return `<section><div class="section-title">⭐ Destacados</div><div class="feat" id="feat">${f.map(({ b, i }) => {
    const t = themeBy(b.theme);
    return `<article class="fcard" data-i="${i}" style="--tc:${t.color}"><div class="fcover" data-ph="${esc(ph(b, true))}">${cover(b, true)}</div><div class="fbody"><span class="flabel">${esc(b.featuredLabel || "⭐ Destacado")}</span><h3>${esc(b.title)}</h3><p class="fau">${esc(b.author)} · ${esc(t.icon || "")} ${esc(t.name)}</p>${b.synopsis ? `<p class="fsyn">${esc(b.synopsis)}</p>` : ""}<span class="fbtn">▶ Ver resumen</span></div></article>`;
  }).join("")}</div>${f.length > 1 ? `<div class="dots">${f.map((_, k) => `<button data-dot="${k}" class="${k ? "" : "on"}" aria-label="Destacado ${k + 1}"></button>`).join("")}</div>` : ""}</section>`;
}

function latestHTML() {
  const l = books.map((b, i) => ({ b, i })).filter(({ b }) => b.date).sort((x, y) => byDate(x.b, y.b)).slice(0, S.latestCount);
  if (!l.length) return "";
  return `<section><div class="section-title">🆕 Últimos subidos<button class="link" data-all>Ver todos →</button></div><div class="strip-wrap"><button class="sbtn l" data-sprev aria-label="Anterior">‹</button><div class="strip" id="strip">${l.map(({ b, i }) => {
    const t = themeBy(b.theme);
    return `<button class="mini" data-i="${i}" style="--tc:${t.color}"><div class="mcover" data-ph="${esc(ph(b, true))}">${cover(b, true)}${isNew(b) ? '<span class="new abs">NUEVO</span>' : ""}</div><h4>${esc(b.title)}</h4><small>${relDate(b)}</small></button>`;
  }).join("")}</div><button class="sbtn r" data-snext aria-label="Siguiente">›</button></div><div class="dots">${l.map((_, k) => `<button data-sdot="${k}" aria-label="Libro ${k + 1}"></button>`).join("")}</div></section>`;
}

function initStrip() {
  const st = document.getElementById("strip"); if (!st) return;
  const items = [...st.children], dots = [...view.querySelectorAll("[data-sdot]")];
  const prev = view.querySelector("[data-sprev]"), next = view.querySelector("[data-snext]");
  let cur = 0, raf;
  const upd = () => {
    const c = st.scrollLeft + st.clientWidth / 2; let bd = 1e9;
    items.forEach((el, k) => {
      const d = (el.offsetLeft + el.offsetWidth / 2 - c) / el.offsetWidth, a = Math.min(Math.abs(d), 3), cl = Math.max(-1, Math.min(1, d));
      el.style.transform = `perspective(900px) translateX(${-Math.sign(d) * (Math.min(a, 1) * 18 + Math.max(0, a - 1) * 48)}px) rotateY(${-cl * 38}deg) scale(${1 - a * 0.13})`;
      el.style.opacity = 1 - a * 0.2; el.style.zIndex = 10 - Math.round(a);
      if (Math.abs(d) < bd) { bd = Math.abs(d); cur = k; }
    });
    items.forEach((el, k) => el.classList.toggle("cur", k === cur));
    dots.forEach((x, k) => x.classList.toggle("on", k === cur));
    prev.disabled = cur === 0; next.disabled = cur === items.length - 1;
  };
  const go = (k) => { k = Math.max(0, Math.min(items.length - 1, k)); const el = items[k]; st.scrollTo({ left: el.offsetLeft + el.offsetWidth / 2 - st.clientWidth / 2, behavior: "smooth" }); };
  st.onscroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(upd); };
  upd();
  prev.onclick = () => go(cur - 1); next.onclick = () => go(cur + 1);
  dots.forEach((x, k) => (x.onclick = () => go(k)));
  let down = false, moved = false, sx = 0, sl = 0;
  st.onpointerdown = (e) => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = st.scrollLeft; st.setPointerCapture(e.pointerId); };
  st.onpointermove = (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; st.classList.add("drag"); } st.scrollLeft = sl - dx; };
  st.onpointerup = () => { if (!down) return; down = false; st.classList.remove("drag"); if (moved) go(cur); };
  st.addEventListener("click", (e) => {
    const m = e.target.closest(".mini");
    if (moved) { e.stopPropagation(); moved = false; return; }
    if (m && items.indexOf(m) !== cur) { e.stopPropagation(); go(items.indexOf(m)); }
  }, true);
}

function startCarousel() {
  clearInterval(carT);
  const f = document.getElementById("feat"); if (!f || f.children.length < 2) return;
  const dots = [...view.querySelectorAll("[data-dot]")];
  f.ontouchstart = () => (f._t = Date.now());
  f.onscroll = () => { const k = Math.round(f.scrollLeft / f.clientWidth); dots.forEach((d, j) => d.classList.toggle("on", j === k)); };
  carT = setInterval(() => {
    if (!document.body.contains(f)) return clearInterval(carT);
    if (f.matches(":hover") || Date.now() - (f._t || 0) < 8000 || modal.open) return;
    const k = Math.round(f.scrollLeft / f.clientWidth);
    f.scrollTo({ left: ((k + 1) % f.children.length) * f.clientWidth, behavior: "smooth" });
  }, 6000);
}

function render() {
  const q = norm(search.value.trim());
  if (q) {
    view.innerHTML = `<div class="section-title">Resultados</div>${toolbar()}${listRows((b) => (!current || current === "__all" || b.theme === current) && norm(b.title + " " + b.author).includes(q), true)}`;
    return;
  }
  if (current === "__all") {
    view.innerHTML = `<div class="banner" style="--tc:var(--accent)"><span class="ico">📚</span><button class="back" data-back>← Inicio</button><h2>Todos los libros</h2><p>${books.length} libros</p></div>${toolbar()}${listRows(() => true, true)}`;
    return;
  }
  if (!current) {
    view.innerHTML = featuredHTML() + latestHTML() + `<section><div class="section-title">Temáticas<small>${books.length} ${books.length === 1 ? "libro" : "libros"}</small></div><div class="themes">${themes.map((t, n) => {
      const all = books.filter((b) => b.theme === t.name), c = all.length, nn = all.filter(isNew).length;
      return `<button class="theme" data-t="${esc(t.name)}" style="--tc:${t.color};--d:${n * 60}ms">${bgimg(t)}<span class="ico">${esc(t.icon || "")}</span><span class="n">${c} ${c === 1 ? "libro" : "libros"}${nn ? ` · <b>${nn} ${nn === 1 ? "nuevo" : "nuevos"}</b>` : ""}</span><h3>${esc(t.name)}</h3>${t.description ? `<p>${esc(t.description)}</p>` : ""}</button>`;
    }).join("")}</div></section>`;
    startCarousel(); initStrip();
    return;
  }
  const t = themeBy(current), c = books.filter((b) => b.theme === current).length;
  view.innerHTML = `<div class="banner${t.image ? " has-img" : ""}" style="--tc:${t.color}">${t.image ? bgimg(t) : ""}<span class="ico">${esc(t.icon || "")}</span><button class="back" data-back>← Todas las temáticas</button><h2>${esc(t.name)}</h2><p>${t.description ? esc(t.description) + " · " : ""}${c} ${c === 1 ? "libro" : "libros"}</p></div>${toolbar()}${listRows((b) => b.theme === current, false)}`;
}

/* navegación (el botón "atrás" del móvil funciona) */
const hashFor = (n) => (n === "__all" ? "#todos" : "#" + encodeURIComponent(n));
function fromHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h === "todos") return "__all";
  return themes.some((t) => t.name === h) ? h : null;
}
function go(name) {
  current = name; search.value = "";
  history.pushState({ v: name }, "", name ? hashFor(name) : location.pathname + location.search);
  render();
  window.scrollTo({ top: name ? view.getBoundingClientRect().top + scrollY - 12 : 0, behavior: "smooth" });
}
window.addEventListener("popstate", () => {
  if (ignorePop) { ignorePop = false; return; }
  if (modal.open) { modal._pop = true; modal.close(); return; }
  current = fromHash(); search.value = ""; render();
});

view.addEventListener("click", (e) => {
  const th = e.target.closest(".theme"); if (th) return go(th.dataset.t);
  if (e.target.closest("[data-back]")) return history.length > 1 && history.state ? history.back() : go(null);
  if (e.target.closest("[data-all]")) return go("__all");
  const dot = e.target.closest("[data-dot]");
  if (dot) { const f = $("feat"); f.scrollTo({ left: dot.dataset.dot * f.clientWidth, behavior: "smooth" }); return; }
  const r = e.target.closest(".row,.fcard,.mini"); if (r) openBook(books[r.dataset.i]);
});
view.addEventListener("change", (e) => {
  if (e.target.id === "sort") { sortBy = e.target.value; render(); }
  if (e.target.id === "onlynew") { onlyNew = e.target.checked; render(); }
});
search.addEventListener("input", render);

function openBook(b) {
  const t = themeBy(b.theme), id = ytId(b.youtube), az = safeUrl(b.amazon), yt = safeUrl(b.youtube);
  modal.style.setProperty("--tc", t.color);
  modalBody.innerHTML = `<article class="detail">
  <div class="dhead"><div class="big" data-ph="${esc(ph(b, true))}">${cover(b, true)}</div><div><p class="meta-top">${esc(t.icon || "")} ${esc([t.name, b.year].filter(Boolean).join(" · "))}</p><h2>${esc(b.title)}</h2><p class="author">${esc(b.author)}${b.date ? ` · <span class="when">Subido ${relDate(b)}</span>` : ""}</p></div></div>
  ${id ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Vídeo resumen" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>` : ""}
  ${b.synopsis ? `<p class="synopsis">${esc(b.synopsis)}</p>` : ""}
  <div class="actions">${az ? `<a class="btn btn-amazon" href="${esc(az)}" target="_blank" rel="noopener sponsored">🛒 Comprar en Amazon</a>` : ""}${yt ? `<a class="btn btn-yt" href="${esc(yt)}" target="_blank" rel="noopener">▶ YouTube</a>` : ""}</div>
 </article>`;
  modal.showModal(); modal.scrollTop = 0;
  history.pushState({ m: 1 }, "");
}
modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest("[data-close]")) modal.close(); });
modal.addEventListener("close", () => {
  modalBody.innerHTML = "";
  if (modal._pop) modal._pop = false;
  else { ignorePop = true; history.back(); }
});

/* carga de datos */
function start(b, t, s) {
  books = (b && b.books) || []; themes = (t && t.themes) || []; S = mergeSettings(s);
  applyLook(S.look); header();
  current = fromHash(); render();
  document.body.classList.add("ready");
}
const PREVIEW = new URLSearchParams(location.search).has("preview");
function loadPreview() {
  try {
    const p = JSON.parse(localStorage.getItem("dqvel-preview") || "null");
    if (!p) return false;
    Object.assign(IMG_CACHE, p.img || {});
    start({ books: p.books }, { themes: p.themes }, p.settings);
    $("pv-banner").hidden = false;
    return true;
  } catch (e) { return false; }
}
if (PREVIEW) window.addEventListener("storage", (e) => { if (e.key === "dqvel-preview") loadPreview(); });
if (!(PREVIEW && loadPreview())) {
  Promise.all(["books", "themes", "settings"].map((n) => fetch(`/data/${n}.json`, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : {})).catch(() => ({}))))
    .then(([b, t, s]) => start(b, t, s));
}
