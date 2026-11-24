/* Panel de edición: login con GitHub, edición y publicación */
const $ = (id) => document.getElementById(id);
const API = "https://api.github.com";
const TOKEN_KEY = "dqvel-token", PREVIEW_KEY = "dqvel-preview";
const COLORS = ["#e85d75", "#d9a441", "#4f8fe6", "#3dbb8a", "#9b6bff", "#ff7a45", "#14b8a6", "#ec4899"];

let token = "", REPO = "", BRANCH = "main";
let books = [], themes = [], S = mergeSettings({});
let tab = "books", dirty = 0, settingsDirty = false, edQ = "", edT = "", tt, busy = false;

const edBody = $("ed-body"), eModal = $("e-modal"), pubBtn = $("publish");
const themeBy = (n) => themeIn(themes, n);
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
  del: (k) => { try { localStorage.removeItem(k); } catch (e) {} }
};

/* ---------- utilidades ---------- */
function show(id) { ["loading", "login", "editor"].forEach((x) => ($(x).hidden = x !== id)); }
function toast(m, ms = 2800) { const el = $("toast"); el.textContent = m; el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), ms); }
function updPublish() {
  if (busy) return;
  pubBtn.innerHTML = dirty ? `<span class="e-pending"></span>Publicar (${dirty})` : "✓ Todo publicado";
  pubBtn.disabled = !dirty;
}
function savePreview() {
  const data = { books, themes, settings: S, img: IMG_CACHE, at: Date.now() };
  if (!store.set(PREVIEW_KEY, JSON.stringify(data))) store.set(PREVIEW_KEY, JSON.stringify({ ...data, img: {} }));
}
function changed(msg) { dirty++; updPublish(); renderEditor(); savePreview(); if (msg) toast(msg); }
function settingsChanged() { if (!settingsDirty) { settingsDirty = true; dirty++; updPublish(); } savePreview(); }
function sure(btn) {
  if (btn.dataset.sure) return true;
  btn.dataset.sure = 1; const o = btn.innerHTML; btn.innerHTML = "¿Seguro?";
  setTimeout(() => { delete btn.dataset.sure; btn.innerHTML = o; }, 3000);
  return false;
}
const themeOptions = (sel) => themes.map((t) => `<option value="${esc(t.name)}" ${t.name === sel ? "selected" : ""}>${esc(t.icon || "")} ${esc(t.name)}</option>`).join("") + '<option value="__new">➕ Crear nueva temática…</option>';

// Lee una imagen, la reduce y la devuelve como JPEG (dataURL)
function readImg(input, max, cb) {
  const f = input.files[0]; if (!f) return;
  const url = URL.createObjectURL(f), img = new Image();
  img.onload = () => {
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url); cb(c.toDataURL("image/jpeg", 0.85));
  };
  img.onerror = () => toast("No se pudo leer la imagen");
  img.src = url;
}

/* ---------- GitHub ---------- */
async function gh(path, opt = {}) {
  const r = await fetch(API + path, { ...opt, cache: "no-store", headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(opt.headers || {}) } });
  if (r.status === 401) { logout("Tu sesión ha caducado. Vuelve a entrar."); throw new Error("401"); }
  if (!r.ok) { let m = ""; try { m = (await r.json()).message; } catch (e) {} throw new Error(`${r.status} ${m || ""}`.trim()); }
  return r.status === 204 ? null : r.json();
}
async function readJSON(path) {
  const r = await fetch(`${API}/repos/${REPO}/contents/${path}?ref=${encodeURIComponent(BRANCH)}`, { cache: "no-store", headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github.raw+json" } });
  if (r.status === 404) return {};
  if (r.status === 401) { logout("Tu sesión ha caducado. Vuelve a entrar."); throw new Error("401"); }
  if (!r.ok) throw new Error("No se pudo leer " + path);
  return r.json();
}
function logout(msg) { store.del(TOKEN_KEY); token = ""; show("login"); $("lerr").textContent = msg || ""; }

async function init() {
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get("token")) store.set(TOKEN_KEY, h.get("token"));
  if (location.hash) history.replaceState(null, "", location.pathname);
  if (h.get("error")) return logout("No se pudo entrar: " + h.get("error"));
  token = store.get(TOKEN_KEY) || "";
  if (!token) return show("login");
  show("loading");
  try {
    const cfg = await fetch("/api/config", { cache: "no-store" }).then((r) => r.json());
    REPO = cfg.repo; BRANCH = cfg.branch || "main";
    if (!REPO) throw new Error("falta la variable GITHUB_REPO en Vercel (mira la guía, paso 7)");
    let repo;
    try { repo = await gh(`/repos/${REPO}`); }
    catch (e) { if (e.message === "401") return; throw new Error(`no encuentro el repositorio "${REPO}". Revisa GITHUB_REPO en Vercel`); }
    if (!repo.permissions || !repo.permissions.push) return logout("Tu cuenta de GitHub no tiene permiso para editar este proyecto.");
    const [b, t, s] = await Promise.all(["books", "themes", "settings"].map((n) => readJSON(`data/${n}.json`)));
    books = b.books || []; themes = t.themes || []; S = mergeSettings(s);
    show("editor"); updPublish(); renderEditor(); savePreview();
  } catch (e) {
    if (e.message !== "401") { show("login"); $("lerr").textContent = "Error: " + e.message; }
  }
}

async function publish() {
  if (!dirty || busy) return;
  busy = true; pubBtn.disabled = true; pubBtn.textContent = "Publicando…";
  try {
    const files = [], newCache = {};
    const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "img";
    const up = (d, name) => {
      const path = `images/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}-${slug(name)}.jpg`;
      files.push({ path, content: d.split(",")[1], enc: "base64" }); newCache["/" + path] = d; return "/" + path;
    };
    const B = books.map((b) => ({ ...b, cover: b.cover && b.cover.startsWith("data:") ? up(b.cover, b.title) : b.cover || "" }));
    const T = themes.map((t) => ({ ...t, image: t.image && t.image.startsWith("data:") ? up(t.image, "tema-" + t.name) : t.image || "" }));
    const j = (o) => JSON.stringify(o, null, 2) + "\n";
    files.push({ path: "data/books.json", content: j({ books: B }) }, { path: "data/themes.json", content: j({ themes: T }) }, { path: "data/settings.json", content: j(S) });

    const ref = await gh(`/repos/${REPO}/git/ref/heads/${BRANCH}`);
    const base = await gh(`/repos/${REPO}/git/commits/${ref.object.sha}`);
    const tree = [];
    for (const f of files) {
      const bl = await gh(`/repos/${REPO}/git/blobs`, { method: "POST", body: JSON.stringify({ content: f.content, encoding: f.enc || "utf-8" }) });
      tree.push({ path: f.path, mode: "100644", type: "blob", sha: bl.sha });
    }
    const nt = await gh(`/repos/${REPO}/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: base.tree.sha, tree }) });
    const c = await gh(`/repos/${REPO}/git/commits`, { method: "POST", body: JSON.stringify({ message: "Actualizar biblioteca desde el panel", tree: nt.sha, parents: [ref.object.sha] }) });
    await gh(`/repos/${REPO}/git/refs/heads/${BRANCH}`, { method: "PATCH", body: JSON.stringify({ sha: c.sha }) });

    books = B; themes = T; Object.assign(IMG_CACHE, newCache);
    dirty = 0; settingsDirty = false; busy = false;
    updPublish(); renderEditor(); savePreview();
    toast("✓ Publicado. La web se actualizará en 1-2 minutos", 5000);
  } catch (e) {
    busy = false; updPublish();
    if (e.message !== "401") toast("❌ No se pudo publicar: " + e.message, 7000);
  }
}

/* ---------- pantallas del editor ---------- */
function renderEditor() {
  document.querySelectorAll(".ed-tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
  if (tab === "books") {
    edBody.innerHTML = `<div class="ed-bar"><input class="e-in" id="ed-q" type="search" placeholder="🔍 Buscar libro o autor…" value="${esc(edQ)}"><select class="e-in" id="ed-t"><option value="">Todas las temáticas</option>${themes.map((t) => `<option value="${esc(t.name)}" ${edT === t.name ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select><button class="e-btn pri" data-act="new-book">+ Nuevo libro</button></div><div class="e-list" id="ed-list"></div>`;
    drawBookList();
  } else if (tab === "themes") {
    edBody.innerHTML = `<div class="ed-bar"><span class="hint" style="flex:1">Las flechas ↑↓ cambian el orden en la web.</span><button class="e-btn pri" data-act="new-theme">+ Nueva temática</button></div><div class="e-list">${themes.map((t, i) => {
      const n = books.filter((b) => b.theme === t.name).length;
      return `<div class="e-item"><div class="e-sw" style="background:${t.image ? `url('${cssUrl(t.image)}') center/cover` : t.color}">${t.image ? "" : esc(t.icon || "")}</div><div><h4>${esc(t.name)}</h4><small>${n} ${n === 1 ? "libro" : "libros"}${t.description ? " · " + esc(t.description) : ""}</small></div><div class="e-acts"><button class="e-ic" data-act="up" data-i="${i}" ${i ? "" : "disabled"} title="Subir">↑</button><button class="e-ic" data-act="down" data-i="${i}" ${i < themes.length - 1 ? "" : "disabled"} title="Bajar">↓</button><button class="e-ic" data-act="edit-theme" data-i="${i}" title="Editar">✏️</button><button class="e-ic" data-act="del-theme" data-i="${i}" title="Borrar">🗑</button></div></div>`;
    }).join("") || '<p class="hint" style="text-align:center;padding:30px">Aún no hay temáticas. Crea la primera.</p>'}</div>`;
  } else if (tab === "settings") {
    const f = (k, l, p = "") => `<div class="e-field"><label>${l}</label><input class="e-in" data-s="${k}" value="${esc(S[k])}" placeholder="${esc(p)}"></div>`;
    const num = (k, l, mn, mx) => `<div class="e-field"><label>${l}</label><input type="number" inputmode="numeric" class="e-in" data-s="${k}" data-num="1" min="${mn}" max="${mx}" value="${S[k]}"></div>`;
    edBody.innerHTML = `<div class="e-form card">
      <h3>Cabecera</h3>${f("eyebrow", "Etiqueta superior")}${f("title", "Título (lo que pongas entre *asteriscos* sale destacado)")}${f("lead", "Subtítulo")}
      <h3>Redes sociales</h3><p class="hint" style="margin-top:-6px">Pega el enlace completo. Las que dejes vacías no aparecen en la web.</p>
      ${SOCIALS.map((x) => `<div class="e-field"><label>${x.l}</label><input class="e-in" type="url" data-s="${x.k}" data-url="1" value="${esc(S[x.k])}" placeholder="${x.ph}"></div>`).join("")}
      <h3>Portada</h3><div class="e-grid2">${num("maxFeatured", "Máximo de destacados", 1, 10)}${num("newDays", "Días que un libro se marca como NUEVO", 1, 90)}</div>${num("latestCount", "Libros en «Últimos subidos»", 3, 20)}
    </div>`;
  } else {
    const L = S.look;
    const opt = (key, map, label) => `<div class="opts">${Object.entries(map).map(([k, v]) => `<button class="opt${L[key] === k ? " on" : ""}" data-look="${key}" data-v="${k}">${label ? label(v) : v}</button>`).join("")}</div>`;
    edBody.innerHTML = `<div class="e-form card">
      <p class="hint">Pulsa <b>👁 Vista previa</b> (arriba) para ver los cambios en la web antes de publicar. Se actualiza sola mientras eliges.</p>
      <div class="e-section">Paleta de colores</div>${opt("palette", PALETTES, (p) => `<span class="sw"><i><b style="background:${p.bg}"></b><b style="background:${p.accent}"></b><b style="background:${p.ink}"></b></i>${p.n}</span>`)}
      <div class="crow"><span>Color de acento</span><span><input type="color" id="accent" value="${L.accent || PALETTES[L.palette].accent}"> <button class="e-btn sm" data-act="accent-reset">Usar el de la paleta</button></span></div>
      <div class="e-section">Tipografía</div>${opt("font", FONTS, (f) => `<span style="font-family:${f[1]};font-size:1.05rem">${f[0]}</span>`)}
      <div class="e-section">Fondo</div>${opt("bg", LOOK_OPTS.bg)}
      <div class="e-section">Tarjetas de temática</div>${opt("tstyle", LOOK_OPTS.tstyle)}
      <div class="e-section">Tamaño de las tarjetas</div>${opt("tsize", LOOK_OPTS.tsize)}
      <div class="e-section">Filas de libros</div>${opt("density", LOOK_OPTS.density)}
      <div class="e-section">Cabecera</div>${opt("hero", LOOK_OPTS.hero)}
      <div class="e-section">Redondeo de esquinas</div><input type="range" id="radius" min="0" max="26" value="${L.radius}">
    </div>`;
  }
}

function drawBookList() {
  const list = books.map((b, i) => ({ b, i }))
    .filter(({ b }) => (!edT || b.theme === edT) && (!edQ || norm(b.title + " " + b.author).includes(norm(edQ))))
    .sort((x, y) => byDate(x.b, y.b));
  $("ed-list").innerHTML = list.map(({ b, i }) => {
    const t = themeBy(b.theme);
    return `<div class="e-item"><div class="thumb" data-ph="${esc(ph(b))}">${cover(b)}</div><div><h4>${esc(b.title)}<span class="e-tag" style="background:${t.color}">${esc(t.name)}</span></h4><small>${b.date ? "📅 " + relDate(b) + " · " : ""}${esc(b.author)} · ${b.youtube ? "▶ vídeo" : "⚠️ sin vídeo"} · ${b.amazon ? "🛒 Amazon" : "⚠️ sin Amazon"}</small></div><div class="e-acts"><button class="e-ic${b.featured ? " on" : ""}" data-act="star" data-i="${i}" title="Destacar">${b.featured ? "⭐" : "☆"}</button><button class="e-ic" data-act="edit-book" data-i="${i}" title="Editar">✏️</button><button class="e-ic" data-act="del-book" data-i="${i}" title="Borrar">🗑</button></div></div>`;
  }).join("") || `<p class="hint" style="text-align:center;padding:30px">${books.length ? "No hay libros que coincidan." : "Aún no hay libros. Pulsa «+ Nuevo libro»."}</p>`;
}

edBody.addEventListener("input", (e) => {
  const el = e.target;
  if (el.id === "ed-q") { edQ = el.value; drawBookList(); }
  if (el.id === "ed-t") { edT = el.value; drawBookList(); }
  if (el.dataset.s) {
    S[el.dataset.s] = el.dataset.num ? Math.min(+el.max, Math.max(+el.min, parseInt(el.value, 10) || +el.min)) : el.value;
    settingsChanged();
  }
  if (el.id === "accent") { S.look.accent = el.value; settingsChanged(); }
  if (el.id === "radius") { S.look.radius = +el.value; settingsChanged(); }
});
edBody.addEventListener("change", (e) => {
  const el = e.target;
  if (el.dataset.url && el.value.trim() && !/^https?:\/\//i.test(el.value.trim())) {
    el.value = "https://" + el.value.trim().replace(/^\/+/, ""); S[el.dataset.s] = el.value; settingsChanged();
  }
});
edBody.addEventListener("click", (e) => {
  const lk = e.target.closest("[data-look]");
  if (lk) { S.look[lk.dataset.look] = lk.dataset.v; if (lk.dataset.look === "palette") S.look.accent = ""; settingsChanged(); renderEditor(); return; }
  const b = e.target.closest("[data-act]"); if (!b) return;
  const i = +b.dataset.i, a = b.dataset.act;
  if (a === "new-book") bookForm(null);
  if (a === "edit-book") bookForm(i);
  if (a === "star") {
    const bk = books[i];
    if (!bk.featured && books.filter((x) => x.featured).length >= S.maxFeatured) return toast(`Máximo ${S.maxFeatured} destacados. Quita otro o sube el límite en Ajustes`);
    bk.featured = !bk.featured; changed(bk.featured ? "⭐ Añadido a destacados" : "Quitado de destacados");
  }
  if (a === "del-book" && sure(b)) { const t = books[i].title; books.splice(i, 1); changed(`«${t}» borrado`); }
  if (a === "new-theme") themeForm(null);
  if (a === "edit-theme") themeForm(i);
  if (a === "up" && i > 0) { [themes[i - 1], themes[i]] = [themes[i], themes[i - 1]]; changed(); }
  if (a === "down" && i < themes.length - 1) { [themes[i + 1], themes[i]] = [themes[i], themes[i + 1]]; changed(); }
  if (a === "del-theme") {
    const n = books.filter((x) => x.theme === themes[i].name).length;
    if (n) return toast(`Tiene ${n} ${n === 1 ? "libro" : "libros"}: muévelos antes a otra temática`);
    if (sure(b)) { themes.splice(i, 1); changed("Temática borrada"); }
  }
  if (a === "accent-reset") { S.look.accent = ""; settingsChanged(); renderEditor(); }
});

/* ---------- ficha de libro ---------- */
function bookForm(i) {
  const b = i == null
    ? { title: "", author: "", year: "", date: todayISO(), featured: false, featuredLabel: "", theme: edT || (themes[0] ? themes[0].name : ""), isbn: "", cover: "", synopsis: "", youtube: "", amazon: "" }
    : { ...books[i] };
  eModal.innerHTML = `<div class="e-form" id="bf"><h3>${i == null ? "➕ Nuevo libro" : "✏️ Editar libro"}</h3>
  <div class="e-field"><label>Título *</label><input class="e-in" name="title" value="${esc(b.title)}"></div>
  <div class="e-grid2"><div class="e-field"><label>Autor</label><input class="e-in" name="author" value="${esc(b.author)}"></div><div class="e-field"><label>Año de publicación</label><input class="e-in" name="year" inputmode="numeric" value="${esc(b.year)}"></div></div>
  <div class="e-field"><label>Temática</label><select class="e-in" name="theme">${themeOptions(b.theme)}</select>
   <div id="newt" class="e-grid2" style="margin-top:8px;display:none"><input class="e-in" id="newt-name" placeholder="Nombre de la nueva temática"><button type="button" class="e-btn pri" id="newt-ok">Crear temática</button></div></div>
  <div class="e-field"><label>Portada</label><div class="e-cover"><div class="prev" id="cprev"></div><div style="display:grid;gap:8px;align-content:start"><label class="e-btn" style="text-align:center;cursor:pointer">📷 Subir imagen<input type="file" accept="image/*" id="cfile" hidden></label><input class="e-in" name="isbn" placeholder="…o pon el ISBN para buscarla" value="${esc(b.isbn)}"><button type="button" class="e-btn" id="cclear">Quitar imagen</button></div></div></div>
  <div class="e-field"><label>Sinopsis</label><textarea class="e-in" name="synopsis" rows="5">${esc(b.synopsis)}</textarea></div>
  <div class="e-field"><label>Enlace al vídeo de YouTube</label><input class="e-in" name="youtube" type="url" placeholder="https://youtu.be/…" value="${esc(b.youtube)}"><div class="e-yt" id="ytprev"></div></div>
  <div class="e-field"><label>Enlace de compra en Amazon</label><input class="e-in" name="amazon" type="url" placeholder="https://amzn.to/…" value="${esc(b.amazon)}"></div>
  <div class="e-grid2"><div class="e-field"><label>Fecha de subida</label><input type="date" class="e-in" name="date" value="${esc(b.date || "")}"></div><div class="e-field"><label>Destacado</label><label class="e-check"><input type="checkbox" name="featured" ${b.featured ? "checked" : ""}> ⭐ Mostrar en destacados</label></div></div>
  <div class="e-field" id="flab" style="display:${b.featured ? "" : "none"}"><label>Texto del destacado (opcional)</label><input class="e-in" name="featuredLabel" placeholder="Ej: Recomendado del mes" value="${esc(b.featuredLabel || "")}"></div>
 </div><div class="e-foot">${i != null ? '<button class="e-btn del" id="bdel">🗑 Borrar</button>' : "<span></span>"}<div style="display:flex;gap:8px"><button class="e-btn" id="bcancel">Cancelar</button><button class="e-btn pri" id="bsave">Guardar</button></div></div>`;
  const q = (x) => eModal.querySelector(x);
  const prev = () => {
    const c = q("#cprev"); c.dataset.ph = ph(b, true); c.innerHTML = b.title || b.cover || b.isbn ? cover(b, true) : "";
    q("#cclear").style.display = b.cover ? "" : "none";
    const id = ytId(b.youtube);
    q("#ytprev").innerHTML = !b.youtube ? "" : id ? `<img src="https://img.youtube.com/vi/${id}/mqdefault.jpg" alt=""><span style="color:#16a34a;font-weight:600">✓ Vídeo detectado</span>` : `<span style="color:#b91c1c">⚠️ No parece un enlace de YouTube válido</span>`;
  };
  prev();
  q("#bf").addEventListener("input", (e) => {
    const n = e.target.name; if (!n) return;
    if (n === "theme") {
      const isNewT = e.target.value === "__new";
      q("#newt").style.display = isNewT ? "grid" : "none";
      if (!isNewT) b.theme = e.target.value; else q("#newt-name").focus();
      return;
    }
    b[n] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (n === "featured") q("#flab").style.display = b.featured ? "" : "none";
    if (["title", "isbn", "youtube"].includes(n)) prev();
  });
  q("#newt-ok").onclick = () => {
    const name = q("#newt-name").value.trim(); if (!name) return;
    if (!themes.some((t) => t.name === name)) { themes.push({ name, description: "", color: COLORS[themes.length % COLORS.length], icon: "📚", image: "" }); dirty++; updPublish(); savePreview(); }
    b.theme = name; q("[name=theme]").innerHTML = themeOptions(name); q("#newt").style.display = "none";
    toast(`Temática «${name}» creada`);
  };
  q("#cfile").onchange = (e) => readImg(e.target, 700, (d) => { b.cover = d; prev(); });
  q("#cclear").onclick = () => { b.cover = ""; prev(); };
  q("#bcancel").onclick = () => eModal.close();
  q("#bsave").onclick = () => {
    b.title = b.title.trim();
    if (!b.title) { q("[name=title]").focus(); return toast("El título es obligatorio"); }
    if (!b.theme || b.theme === "__new") return toast("Elige una temática");
    if (b.featured && books.filter((x, j) => x.featured && j !== i).length >= S.maxFeatured) return toast(`Ya hay ${S.maxFeatured} destacados. Quita otro o sube el límite en Ajustes`);
    if (i == null) books.push(b); else books[i] = b;
    eModal.close(); changed(i == null ? "Libro añadido" : "Libro guardado");
  };
  if (q("#bdel")) q("#bdel").onclick = (e) => { if (sure(e.currentTarget)) { books.splice(i, 1); eModal.close(); changed("Libro borrado"); } };
  eModal.showModal(); eModal.scrollTop = 0;
}

/* ---------- ficha de temática ---------- */
function themeForm(i) {
  const t = i == null ? { name: "", description: "", color: COLORS[themes.length % COLORS.length], icon: "📚", image: "" } : { ...themes[i] };
  const old = i == null ? null : themes[i].name;
  eModal.innerHTML = `<div class="e-form" id="tf"><h3>${i == null ? "➕ Nueva temática" : "✏️ Editar temática"}</h3>
  <div id="tprev"></div>
  <div class="e-grid2"><div class="e-field"><label>Nombre *</label><input class="e-in" name="name" value="${esc(t.name)}"></div><div class="e-field"><label>Icono (un emoji)</label><input class="e-in" name="icon" value="${esc(t.icon)}"></div></div>
  <div class="e-field"><label>Descripción corta</label><input class="e-in" name="description" value="${esc(t.description)}"></div>
  <div class="e-grid2"><div class="e-field"><label>Color</label><input type="color" class="e-in" name="color" value="${esc(t.color)}" style="height:44px;padding:4px"></div><div class="e-field"><label>Imagen de fondo (opcional)</label><label class="e-btn" style="display:block;text-align:center;cursor:pointer">📷 Subir imagen<input type="file" accept="image/*" id="tfile" hidden></label></div></div>
  <button type="button" class="e-btn" id="tclear" style="justify-self:start">Quitar imagen</button>
 </div><div class="e-foot"><span></span><div style="display:flex;gap:8px"><button class="e-btn" id="tcancel">Cancelar</button><button class="e-btn pri" id="tsave">Guardar</button></div></div>`;
  const q = (x) => eModal.querySelector(x);
  const prev = () => {
    q("#tprev").innerHTML = `<div class="tile${t.image ? " has-img" : ""}" style="--tc:${esc(t.color)}">${t.image ? bgimg(t) : ""}<span class="ico">${esc(t.icon)}</span><h3>${esc(t.name || "Nombre")}</h3>${t.description ? `<p>${esc(t.description)}</p>` : ""}</div>`;
    q("#tclear").style.display = t.image ? "" : "none";
  };
  prev();
  q("#tf").addEventListener("input", (e) => { if (e.target.name) { t[e.target.name] = e.target.value; prev(); } });
  q("#tfile").onchange = (e) => readImg(e.target, 1400, (d) => { t.image = d; prev(); });
  q("#tclear").onclick = () => { t.image = ""; prev(); };
  q("#tcancel").onclick = () => eModal.close();
  q("#tsave").onclick = () => {
    t.name = t.name.trim();
    if (!t.name) return toast("El nombre es obligatorio");
    if (themes.some((x, j) => x.name === t.name && j !== i)) return toast("Ya existe una temática con ese nombre");
    if (i == null) themes.push(t);
    else { themes[i] = t; if (old !== t.name) { books.forEach((b) => { if (b.theme === old) b.theme = t.name; }); if (edT === old) edT = t.name; } }
    eModal.close(); changed(i == null ? "Temática creada" : "Temática guardada");
  };
  eModal.showModal(); eModal.scrollTop = 0;
}

/* ---------- eventos generales ---------- */
eModal.addEventListener("click", (e) => { if (e.target === eModal) eModal.close(); });
document.querySelector(".ed-tabs").onclick = (e) => { const b = e.target.closest("button"); if (b) { tab = b.dataset.tab; renderEditor(); } };
pubBtn.onclick = publish;
$("logout").onclick = () => { if (dirty && !confirm("Tienes cambios sin publicar. ¿Salir igualmente?")) return; logout("Has cerrado sesión."); };
window.addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
init();
