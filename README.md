# ¿De qué va este libro?

Web de libros por temáticas con vídeo resumen de YouTube y enlace de compra en Amazon, más un panel de edición en `/admin`.

👉 **Para ponerla en marcha, sigue `GUIA.md` paso a paso.**

## Estructura
- `index.html`, `assets/`: la web pública.
- `admin/`: el panel de edición. Entras con GitHub y al pulsar Publicar se guarda en este repositorio.
- `api/`: inicio de sesión con GitHub (funciones de Vercel).
- `data/`: los datos de la web: `books.json`, `themes.json` y `settings.json`. Se editan desde el panel.
- `images/`: portadas e imágenes subidas desde el panel. La carpeta se crea sola al subir la primera.

Variables de entorno en Vercel: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REPO` (opcional: `GITHUB_BRANCH`, por defecto `main`).
