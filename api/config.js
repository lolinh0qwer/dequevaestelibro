// Le dice al panel en qué repositorio de GitHub están los datos
module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({
    repo: (process.env.GITHUB_REPO || "").trim(),
    branch: (process.env.GITHUB_BRANCH || "main").trim(),
  }));
};
