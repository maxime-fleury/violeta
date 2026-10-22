/**
 * Construit le lexique cible (1 000 mots) à partir de :
 *  - content/seed/*.txt        : liste curatée (es|fr|pos)
 *  - content/lexicon/*.js      : exemples et variantes produits par lot
 *  - content/sources/*.json    : rangs de fréquence mesurés (sources citées)
 *
 * Usage :
 *   bun scripts/build-lexicon.mjs --targets   # (re)génère content/work/batch-XX.json
 *   bun scripts/build-lexicon.mjs             # écrit public/js/data/lexicon.js
 *   bun scripts/build-lexicon.mjs --check     # vérifie sans écrire (exit 1 si erreur)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dir, "..");
const SEED_DIR = path.join(ROOT, "content/seed");
const LEX_DIR = path.join(ROOT, "content/lexicon");
const WORK_DIR = path.join(ROOT, "content/work");
const SOURCES = path.join(ROOT, "content/sources");

const ID_OVERRIDES = {
  "él": "el-pron",
  "tú": "tu-pron",
  "sí": "si-oui",
  "más": "mas-adv",
  "té": "te-noun",
  "mí": "mi-pron",
  "qué": "que-interrog",
  "cuándo": "cuando-interrog",
  "cómo": "como-interrog",
  "uña": "una-ongle",
};

/** Mots volontairement hors des 1 000 cibles (trop spécialisés ou redondants). */
const OUT_OF_TARGET = new Set([
  "suegro", "suegra", "cuñado",
  "marisco", "gamba", "atún", "sardina", "cordero", "conejo", "pavo",
  "berenjena", "calabaza", "col", "espinaca", "brócoli", "ciruela", "cereza", "aguacate",
  "ballena", "delfín", "tiburón", "águila", "búho", "pato", "gaviota", "mariposa", "hormiga", "mosquito",
  "grandeza", "semejanza", "profundidad", "anchura", "altura", "peso", "tamaño",
  "velocidad", "fuerza", "belleza", "plateado", "beige", "transparente", "curvo", "plano",
  "rey", "reina", "nación", "población", "presidente", "ciudadano", "gobierno",
  "impuesto", "presupuesto", "factura", "actor", "actriz", "festival", "espectáculo",
  "postal", "cámara", "química", "física", "biología", "geografía", "literatura",
  "plancha", "escoba", "colchón", "sábana", "cortina", "cajón", "nevera",
  "amanecer", "atardecer", "madrugada", "arcoíris", "trueno", "rayo", "niebla", "hielo",
  "sobrar", "soler",
  "cerradura", "marido", "temporada", "vecindario",
  "montón", "trozo", "impar", "docena", "siglo", "aventura", "frontera", "nuez",
]);

const THEMES = {
  "01": { theme: "bases", level: "A1" },
  "02": { theme: "verbes", level: "A1" },
  "03": { theme: "personnes", level: "A1" },
  "04": { theme: "maison", level: "A1" },
  "05": { theme: "nourriture", level: "A1" },
  "06": { theme: "temps", level: "A1" },
  "07": { theme: "adjectifs", level: "A2" },
  "08": { theme: "societe", level: "A2" },
  "09": { theme: "maison", level: "A2" },
};

export function slug(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function idFor(es) {
  return ID_OVERRIDES[es] ?? slug(es);
}

function readSeeds() {
  const files = fs.existsSync(SEED_DIR) ? fs.readdirSync(SEED_DIR).filter((f) => f.endsWith(".txt")).sort() : [];
  const out = [];
  const seen = new Map();
  for (const file of files) {
    const batch = file.slice(0, 2);
    const meta = THEMES[batch] ?? { theme: "divers", level: "A1" };
    for (const raw of fs.readFileSync(path.join(SEED_DIR, file), "utf8").split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const [es, fr, pos] = line.split("|").map((x) => x && x.trim());
      if (!es || !fr || !pos) throw new Error(`Ligne invalide dans ${file} : ${raw}`);
      if (OUT_OF_TARGET.has(es)) continue;
      const id = idFor(es);
      if (seen.has(id)) {
        throw new Error(`Doublon d'id "${id}" : ${seen.get(id)} / ${es} (${file})`);
      }
      seen.set(id, es);
      const gender = pos === "n.f" ? "f" : pos === "n.m" ? "m" : undefined;
      out.push({
        id,
        es,
        fr,
        pos: gender ? "n" : pos,
        gender,
        theme: meta.theme,
        level: meta.level,
        rank: null,
        variants: [],
        ex: "",
        exFr: "",
      });
    }
  }
  return out;
}

async function readExamples() {
  const files = fs.existsSync(LEX_DIR) ? fs.readdirSync(LEX_DIR).filter((f) => f.endsWith(".js")).sort() : [];
  const map = new Map();
  for (const file of files) {
    const mod = await import(path.join(LEX_DIR, file) + `?v=${Date.now()}`);
    const arr = Object.values(mod).find(Array.isArray) ?? [];
    for (const e of arr) {
      if (!e || !e.id) throw new Error(`${file}: entrée sans id`);
      if (map.has(e.id)) throw new Error(`${file}: id en double ${e.id}`);
      map.set(e.id, e);
    }
  }
  return map;
}

function loadFrequency() {
  const file = path.join(SOURCES, "frequency.json");
  if (!fs.existsSync(file)) return { lemmas: {}, subtitles: {} };
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function build({ check = false, targets = false } = {}) {
  const words = readSeeds();
  const examples = await readExamples();
  const freq = loadFrequency();
  const problems = [];

  for (const w of words) {
    const e = examples.get(w.id);
    if (e) {
      if (typeof e.ex === "string") w.ex = e.ex.trim();
      if (typeof e.exFr === "string") w.exFr = e.exFr.trim();
      if (Array.isArray(e.variants)) w.variants = e.variants.filter(Boolean);
      if (Array.isArray(e.senses)) w.senses = e.senses.filter((s) => s && s.fr);
      if (e.note) w.note = e.note;
    }
    const lemmaRank = freq.lemmas?.[w.es];
    w.rank = lemmaRank ?? null;
    w.subsRank = freq.subtitles?.[w.id] ?? null;
  }

  words.sort((a, b) => (a.rank ?? 1e9) - (b.rank ?? 1e9) || a.id.localeCompare(b.id));
  words.forEach((w, i) => (w.priority = i + 1));

  if (words.length !== 1000) problems.push(`Le lexique contient ${words.length} entrées au lieu de 1000.`);
  const ids = new Set();
  for (const w of words) {
    if (ids.has(w.id)) problems.push(`id dupliqué : ${w.id}`);
    ids.add(w.id);
    if (w.gender !== undefined && !["f", "m"].includes(w.gender)) problems.push(`${w.id}: genre invalide`);
    if (!w.ex) problems.push(`${w.id}: exemple manquant`);
    else if (w.ex.length < 4 || w.ex.length > 120) problems.push(`${w.id}: exemple de longueur suspecte`);
    if (!w.exFr) problems.push(`${w.id}: traduction d'exemple manquante`);
    if (w.variants.some((v) => !v || v.includes(" "))) problems.push(`${w.id}: variante invalide`);
  }
  const missing = [...examples.keys()].filter((id) => !ids.has(id));
  if (missing.length) problems.push(`${missing.length} exemple(s) pour des id inconnus : ${missing.slice(0, 8).join(", ")}`);

  if (targets) {
    fs.mkdirSync(WORK_DIR, { recursive: true });
    const size = Math.ceil(words.length / 8);
    for (let i = 0; i < 8; i++) {
      const slice = words.slice(i * size, (i + 1) * size);
      fs.writeFileSync(
        path.join(WORK_DIR, `batch-${String(i + 1).padStart(2, "0")}.json`),
        JSON.stringify(slice.map(({ id, es, fr, pos, gender, theme, level }) => ({ id, es, fr, pos, gender, theme, level })), null, 1),
      );
    }
    console.log(`→ ${WORK_DIR}/batch-01..08.json (${size} mots par lot)`);
  }

  if (check) {
    const withEx = words.filter((w) => w.ex).length;
    console.log(`Lexique : ${words.length} entrées · ${withEx} exemples · ${words.filter((w) => w.rank).length} rangs de fréquence`);
    if (problems.length) {
      console.error(`\n${problems.length} problème(s) :`);
      for (const p of problems.slice(0, 40)) console.error(" - " + p);
      process.exitCode = 1;
    } else {
      console.log("✓ Lexique valide (1000 entrées, ids uniques, exemples complets).");
    }
    return;
  }

  const banner = `// GÉNÉRÉ par scripts/build-lexicon.mjs — ne pas éditer à la main.
// Sources : content/seed (liste curatée) + content/sources/frequency.json.
// 1 000 mots cibles ; "priority" = ordre pédagogique, "rank" = rang de fréquence mesuré (source Wiktionary/OpenSubtitles).
`;
  const body = `export const LEXICON = ${JSON.stringify(
    words.map(({ id, es, fr, pos, gender, theme, level, rank, subsRank, priority, ex, exFr, variants, senses }) => ({
      id, es, fr, pos,
      ...(gender ? { gender } : {}),
      theme, level, priority,
      rank: rank ?? null,
      subsRank: subsRank ?? null,
      ex, exFr,
      ...(variants && variants.length ? { variants } : {}),
      ...(senses && senses.length ? { senses } : {}),
    })),
    null,
    1,
  )};\n\nexport const LEXICON_BY_ID = Object.fromEntries(LEXICON.map((w) => [w.id, w]));\n`;
  fs.mkdirSync(path.join(ROOT, "public/js/data"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "public/js/data/lexicon.js"), banner + body);

  const stats = { total: words.length, examples: words.filter((w) => w.ex).length, ranked: words.filter((w) => w.rank).length };
  console.log(`✓ public/js/data/lexicon.js — ${stats.total} mots, ${stats.examples} exemples, ${stats.ranked} rangs`);
  if (problems.length) {
    console.error(`${problems.length} avertissement(s) :`);
    for (const p of problems.slice(0, 20)) console.error(" - " + p);
  }
}

if (import.meta.main) {
  const args = new Set(process.argv.slice(2));
  await build({ check: args.has("--check"), targets: args.has("--targets") });
}
