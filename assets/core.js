/* Núcleo compartido entre la web pública y el panel de edición */

const PALETTES = {
  noche:     { n: "Noche dorada", bg: "#0f1424", bg2: "#1d2540", surface: "#182036", ink: "#f2ecdf", soft: "#9aa3b8", accent: "#e9b949", line: "#2c3655" },
  editorial: { n: "Editorial",    bg: "#f6f1e7", bg2: "#ecdcc0", surface: "#fffdf8", ink: "#1f1a14", soft: "#6b6156", accent: "#c2410c", line: "#e4dac8" },
  pop:       { n: "Pop",          bg: "#ffe94d", bg2: "#ff9ecf", surface: "#ffffff", ink: "#121212", soft: "#3d3d3d", accent: "#ff3d7f", line: "#121212" },
  bosque:    { n: "Bosque",       bg: "#1d3a2c", bg2: "#2f5a43", surface: "#24463a", ink: "#f4efe1", soft: "#b9c7b5", accent: "#f2a65a", line: "#3c6b52" },
  atardecer: { n: "Atardecer",    bg: "#ffd9c0", bg2: "#c9a7ff", surface: "#fff7f2", ink: "#2a1638", soft: "#6e4f7d", accent: "#ff5e5b", line: "#f0bfae" },
  oceano:    { n: "Océano",       bg: "#06283d", bg2: "#1363df", surface: "#0b3550", ink: "#e8f6ff", soft: "#8fb3c9", accent: "#47b5ff", line: "#1b4a68" },
  minimal:   { n: "Minimal",      bg: "#ffffff", bg2: "#f1f1f1", surface: "#ffffff", ink: "#111111", soft: "#777777", accent: "#111111", line: "#e6e6e6" },
  neon:      { n: "Neón",         bg: "#0b0b0f", bg2: "#2a0a3d", surface: "#15151d", ink: "#f5f5f5", soft: "#9a9aae", accent: "#39ff88", line: "#2a2a38" }
};

// [nombre, fuente títulos, fuente texto, parámetro Google Fonts]
const FONTS = {
  elegante:   ["Elegante",   "'Playfair Display',serif", "'DM Sans',sans-serif", "family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@400;600"],
  editorial:  ["Editorial",  "'Fraunces',serif", "'Inter',sans-serif", "family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400&family=Inter:wght@400;600"],
  clasica:    ["Clásica",    "'DM Serif Display',serif", "'Outfit',sans-serif", "family=DM+Serif+Display:ital@0;1&family=Outfit:wght@400;600"],
  revista:    ["Revista",    "'Abril Fatface',serif", "'Lato',sans-serif", "family=Abril+Fatface&family=Lato:wght@400;700"],
  moderna:    ["Moderna",    "'Space Grotesk',sans-serif", "'Space Grotesk',sans-serif", "family=Space+Grotesk:wght@400;600;700"],
  divertida:  ["Divertida",  "'Bricolage Grotesque',sans-serif", "'Bricolage Grotesque',sans-serif", "family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800"],
  vanguardia: ["Vanguardia", "'Syne',sans-serif", "'Outfit',sans-serif", "family=Syne:wght@600;800&family=Outfit:wght@400;600"]
};

const LOOK_OPTS = {
  bg:      { plain: "Liso", paper: "Papel", dots: "Puntos", gradient: "Degradado", blobs: "Manchas de color" },
  tstyle:  { gradient: "Degradado", solid: "Color sólido", pattern: "Con patrón", outline: "Contorno" },
  tsize:   { big: "Grandes", small: "Compactas" },
  density: { compact: "Compactas", normal: "Normales", comfy: "Amplias" },
  hero:    { center: "Centrada", left: "Izquierda" }
};

const SOCIALS = [
  { k: "youtube",   l: "YouTube",   ph: "https://www.youtube.com/@tucanal", p: "M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9l5.8 3.1-5.8 3.1z" },
  { k: "instagram", l: "Instagram", ph: "https://www.instagram.com/tuusuario", p: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM12 2.2c-2.7 0-3 0-4 .1C4.5 2.4 2.5 4.4 2.3 8c-.1 1-.1 1.3-.1 4s0 3 .1 4c.2 3.6 2.2 5.6 5.7 5.7 1 .1 1.3.1 4 .1s3 0 4-.1c3.6-.2 5.6-2.2 5.7-5.7.1-1 .1-1.3.1-4s0-3-.1-4C21.6 4.4 19.6 2.4 16 2.3c-1-.1-1.3-.1-4-.1zm0 1.8c2.6 0 2.9 0 4 .1 2.6.1 3.8 1.4 3.9 3.9.1 1 .1 1.3.1 4s0 2.9-.1 4c-.1 2.5-1.3 3.8-3.9 3.9-1 .1-1.4.1-4 .1s-2.9 0-4-.1C5.4 19.8 4.2 18.5 4.1 16 4 15 4 14.6 4 12s0-2.9.1-4C4.2 5.5 5.4 4.2 8 4.1c1-.1 1.4-.1 4-.1z" },
  { k: "tiktok",    l: "TikTok",    ph: "https://www.tiktok.com/@tuusuario", p: "M16.6 5.8a4.3 4.3 0 0 1-1-2.8h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 0 0-.8-.1 5.7 5.7 0 1 0 5.7 5.7V9a7.3 7.3 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.3-1.5z" },
  { k: "facebook",  l: "Facebook",  ph: "https://www.facebook.com/tupagina", p: "M14 8.5V6.6c0-.9.6-1.1 1-1.1h2.6V1.6H14c-4 0-4.9 3-4.9 4.9v2H6.8v4h2.3v9.9h4.9v-9.9h3.3l.4-4H14z" },
  { k: "x",         l: "X (Twitter)", ph: "https://x.com/tuusuario", p: "M17.8 2.5h3.1l-6.8 7.8 8 10.6h-6.3l-4.9-6.4-5.6 6.4H2.2l7.3-8.3L1.9 2.5h6.4l4.4 5.9 5.1-5.9zm-1.1 16.5h1.7L7.4 4.3H5.6l11.1 14.7z" },
  { k: "web",       l: "Web",       ph: "https://tuweb.com", p: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-2.9a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.8 1.9-4zM4.3 14a8 8 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4H4.3zm.8 2h2.9c.3 1.3.8 2.5 1.4 3.6A8 8 0 0 1 5.1 16zM8 8H5.1a8 8 0 0 1 4.3-3.6C8.8 5.5 8.3 6.7 8 8zm4 12c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.8-1.9 4zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4zm.3 5.6c.6-1.1 1.1-2.3 1.4-3.6h2.9a8 8 0 0 1-4.3 3.6zm1.7-5.6a16.5 16.5 0 0 0 0-4h3.4a8 8 0 0 1 0 4h-3.4z" }
];

const DEFAULT_SETTINGS = {
  eyebrow: "📚 Libros de mis vídeos",
  title: "¿De qué va *este libro*?",
  lead: "Elige una temática, abre un libro y mira mi resumen en vídeo.",
  youtube: "", instagram: "", tiktok: "", facebook: "", x: "", web: "",
  maxFeatured: 5, newDays: 15, latestCount: 8,
  look: { palette: "noche", accent: "", font: "elegante", bg: "blobs", tstyle: "gradient", tsize: "big", density: "normal", radius: 12, hero: "center" }
};

const IMG_CACHE = {}; // imágenes recién subidas (se ven antes de que Vercel termine de publicar)

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const hue = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
const safeUrl = (u) => (/^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : "");

const DAY = 864e5;
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const daysAgo = (b) => (b.date ? Math.round((today0() - new Date(b.date + "T00:00")) / DAY) : 9999);
const relDate = (b) => {
  const n = daysAgo(b);
  if (n >= 9999) return "";
  if (n <= 0) return "hoy";
  if (n === 1) return "ayer";
  if (n < 30) return `hace ${n} días`;
  return new Date(b.date + "T00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
};
const byDate = (a, b) => String(b.date || "").localeCompare(String(a.date || ""));

const src = (u) => IMG_CACHE[u] || u;
const cssUrl = (u) => String(src(u) || "").replace(/["'()\\\s]/g, "");
const coverUrl = (b) => {
  if (b.cover) return src(b.cover);
  const i = String(b.isbn || "").replace(/[^0-9Xx]/g, "");
  return i ? `https://covers.openlibrary.org/b/isbn/${i}-L.jpg?default=false` : "";
};
const ph = (b, big) => `<div class="ph" style="--h:${hue(b.title)}">${esc(big ? b.title : String(b.title || "?")[0])}</div>`;
const cover = (b, big) => {
  const u = coverUrl(b);
  return u ? `<img src="${esc(u)}" alt="" loading="lazy" onerror="this.outerHTML=this.parentNode.dataset.ph">` : ph(b, big);
};
const ytId = (u) => (String(u || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/) || [])[1];
const themeIn = (themes, n) => themes.find((t) => t.name === n) || { name: n || "Otros", color: "#888888", icon: "📚", image: "", description: "" };
const bgimg = (t) => (t.image ? `<div class="bgimg img" style="background-image:url('${cssUrl(t.image)}')"></div>` : `<div class="bgimg"></div>`);
const titleHTML = (t) => esc(t).replace(/\*(.+?)\*/g, "<em>$1</em>");
const socialsHTML = (s) => SOCIALS.filter((x) => safeUrl(s[x.k])).map((x) =>
  `<a href="${esc(safeUrl(s[x.k]))}" target="_blank" rel="noopener" aria-label="${x.l}"><svg viewBox="0 0 24 24"><path d="${x.p}"/></svg></a>`).join("");

const mergeSettings = (s) => ({ ...DEFAULT_SETTINGS, ...(s || {}), look: { ...DEFAULT_SETTINGS.look, ...((s && s.look) || {}) } });

function applyLook(L) {
  const p = PALETTES[L.palette] || PALETTES.noche;
  const r = document.documentElement.style;
  for (const k of ["bg", "bg2", "surface", "ink", "soft", "line"]) r.setProperty("--" + k, p[k]);
  r.setProperty("--accent", L.accent || p.accent);
  const f = FONTS[L.font] || FONTS.elegante;
  r.setProperty("--fd", f[1]);
  r.setProperty("--fb", f[2]);
  r.setProperty("--radius", (+L.radius || 0) + "px");
  let link = document.getElementById("gf");
  if (!link) { link = document.createElement("link"); link.id = "gf"; link.rel = "stylesheet"; document.head.appendChild(link); }
  const href = `https://fonts.googleapis.com/css2?${f[3]}&display=swap`;
  if (link.href !== href) link.href = href;
  Object.assign(document.body.dataset, { bg: L.bg, tstyle: L.tstyle, tsize: L.tsize, density: L.density, hero: L.hero });
  const m = document.querySelector("meta[name=theme-color]");
  if (m) m.content = p.bg;
}
