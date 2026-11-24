// GitHub vuelve aquí después del login: cambia el código por un token y regresa al panel
module.exports = async (req, res) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const url = new URL(req.url, `https://${host}`);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = (req.headers.cookie || "").split(";").map((c) => c.trim()).find((c) => c.startsWith("dqvel_state="));
  const saved = cookie ? cookie.slice("dqvel_state=".length) : "";

  const back = (hash) => {
    res.setHeader("Set-Cookie", "dqvel_state=; Path=/api; Max-Age=0");
    res.setHeader("Cache-Control", "no-store");
    res.writeHead(302, { Location: "/admin/#" + hash });
    res.end();
  };

  const ghError = url.searchParams.get("error");
  if (ghError) return back("error=" + encodeURIComponent(url.searchParams.get("error_description") || ghError));
  if (!code || !state || state !== saved) return back("error=" + encodeURIComponent("El inicio de sesión caducó. Inténtalo de nuevo."));

  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await r.json();
    if (!data.access_token) return back("error=" + encodeURIComponent(data.error_description || data.error || "GitHub no devolvió acceso"));
    return back("token=" + encodeURIComponent(data.access_token));
  } catch (e) {
    return back("error=" + encodeURIComponent("No se pudo contactar con GitHub"));
  }
};
