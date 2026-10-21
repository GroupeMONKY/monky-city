// Test de fumée : charge index.html dans Chromium headless (servi en HTTP local
// pour que fetch("db/...") fonctionne), échoue sur toute erreur JS et vérifie
// que le jeu démarre (API window.__mc, MODEL.ZONES, canvas, données db/ appliquées).
// Usage : node tests/smoke.js
const http = require("http"), fs = require("fs"), path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); }
catch (e) { ({ chromium } = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright")); }

const ROOT = path.resolve(__dirname, "..");
const TYPES = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".js": "text/javascript" };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html");
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  const browser = await chromium.launch(fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {});
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" && !/fonts\.(googleapis|gstatic)/.test(m.text() + " " + (m.location().url || ""))) errors.push("console: " + m.text()); });
  page.on("requestfailed", r => { if (!/fonts\.(googleapis|gstatic)/.test(r.url())) errors.push("requestfailed: " + r.url()); });
  // Les polices Google ne sont pas nécessaires au test (réseau parfois bloqué).
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());

  let ok = true;
  const fail = m => { ok = false; console.error("ÉCHEC : " + m); };
  try {
    await page.goto(url, { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(2500);
    const st = await page.evaluate(() => ({
      mc: !!(window.__mc && window.__mc.setPrices && window.__mc.getPrices),
      zones: typeof MODEL !== "undefined" && Array.isArray(MODEL.ZONES) ? MODEL.ZONES.length : 0,
      canvas: !!document.querySelector("canvas"),
      prices: window.__mc && window.__mc.getPrices ? window.__mc.getPrices() : null,
      dbLoaded: !!window.__mcDbLoaded,
    }));
    if (!st.mc) fail("window.__mc (setPrices/getPrices) absent");
    if (!st.zones) fail("MODEL.ZONES vide");
    if (!st.canvas) fail("aucun canvas");
    if (!st.dbLoaded) fail("db/*.json non appliqués (window.__mcDbLoaded absent)");
    const prix = JSON.parse(fs.readFileSync(path.join(ROOT, "db/prix.json"), "utf8"));
    if (st.prices && prix.jeux && st.prices.jeux.kart !== prix.jeux.kart) fail(`prix karting ${st.prices.jeux.kart} ≠ db/prix.json ${prix.jeux.kart}`);
    // Simule quelques touches pour vérifier que la boucle de jeu tourne sans erreur.
    await page.mouse.click(200, 200);
    for (const k of ["Enter", "ArrowUp", "ArrowRight", "Escape"]) { await page.keyboard.press(k); await page.waitForTimeout(150); }
    await page.waitForTimeout(500);
  } catch (e) { fail(e.message); }
  if (errors.length) fail("erreurs JS :\n  " + errors.join("\n  "));
  await browser.close(); server.close();
  console.log(ok ? "OK : la page se charge sans erreur JS et le jeu démarre." : "Test échoué.");
  process.exit(ok ? 0 : 1);
})();
