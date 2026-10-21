// Synchro : copie dans db/ les documents exportés de la base de l'artefact
// (collection config), seulement quand leur contenu JSON a changé.
// Usage : node tools/sync-db.js <dossier d'export contenant <doc>.json>
// N'efface jamais rien. Affiche la liste des fichiers modifiés (vide si aucun).
const fs = require("fs"), path = require("path");
const src = process.argv[2];
if (!src || !fs.statSync(src).isDirectory()) { console.error("Dossier d'export manquant"); process.exit(2); }
const DB = path.resolve(__dirname, "..", "db");
// Comparaison indépendante de l'ordre des clés (l'export les trie).
const norm = v => Array.isArray(v) ? v.map(norm)
  : v && typeof v === "object" ? Object.keys(v).sort().reduce((o, k) => (o[k] = norm(v[k]), o), {}) : v;
const changed = [];
for (const f of fs.readdirSync(src).filter(f => /^[\w-]+\.json$/.test(f)).sort()) {
  const data = JSON.parse(fs.readFileSync(path.join(src, f), "utf8"));
  const dst = path.join(DB, f);
  const old = fs.existsSync(dst) ? JSON.parse(fs.readFileSync(dst, "utf8")) : undefined;
  if (old !== undefined && JSON.stringify(norm(old)) === JSON.stringify(norm(data))) continue;
  fs.writeFileSync(dst, JSON.stringify(data, null, 2) + "\n");
  changed.push(f);
}
console.log(changed.length ? "Modifiés : " + changed.join(", ") : "Aucun changement");
