// Copie le site statique dans dist/ et génère dist/config.js à partir des variables
// d'environnement (Vercel > Settings > Environment Variables, ou un fichier .env en local).
// Un site statique ne peut pas lire les variables d'environnement au chargement :
// c'est ce script qui les injecte au moment du build.

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

// Fichiers/dossiers du dépôt qui ne font PAS partie du site publié.
const EXCLUDED = new Set([
  "dist",
  "node_modules",
  "scripts",
  "supabase",
  "package.json",
  "package-lock.json",
  "vercel.json",
  "README.md",
]);

function loadDotEnv() {
  const file = join(root, ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

function isSecretKey(key) {
  if (key.startsWith("sb_secret_")) return true;
  const payload = key.split(".")[1];
  if (!payload) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return decoded.role === "service_role";
  } catch {
    return false;
  }
}

loadDotEnv();

const url = (process.env.SUPABASE_URL ?? "").trim();
const anonKey = (process.env.SUPABASE_ANON_KEY ?? "").trim();

if (anonKey && isSecretKey(anonKey)) {
  console.error(
    "\n✖ SUPABASE_ANON_KEY contient une clé secrète (service_role). Elle serait visible par tous les\n" +
      "  visiteurs de ton site. Utilise la clé « anon » / « publishable » (Supabase > Settings > API).\n"
  );
  process.exit(1);
}

if (!url || !anonKey) {
  console.warn(
    "\n⚠ SUPABASE_URL et/ou SUPABASE_ANON_KEY sont vides : le site sera publié sans connexion Supabase.\n" +
      "  Ajoute-les dans Vercel > Settings > Environment Variables, puis redéploie.\n"
  );
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const entry of readdirSync(root)) {
  if (EXCLUDED.has(entry) || entry.startsWith(".")) continue;
  cpSync(join(root, entry), join(dist, entry), { recursive: true });
}

const config = { SUPABASE_URL: url, SUPABASE_ANON_KEY: anonKey };
writeFileSync(join(dist, "config.js"), `window.ENV = Object.freeze(${JSON.stringify(config)});\n`);

console.log(`✔ Site construit dans dist/ (Supabase ${url && anonKey ? "configuré" : "non configuré"})`);
