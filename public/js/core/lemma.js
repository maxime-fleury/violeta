/**
 * Tokenisation espagnole + résolution des formes fléchies vers le lemme.
 *
 * Objectif : surligner en violet les mots introduits par une leçon et fournir
 * une infobulle de traduction pour tout mot connu, sans dépendre d'un service
 * externe. Les règles couvrent le pluriel, le féminin et la conjugaison
 * régulière ; les formes irrégulières viennent du champ `variants` du lexique.
 */
import { LEXICON } from "../data/lexicon.js";

export function norm(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const WORD_RE = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g;

/** Découpe un texte en segments { text, word } en conservant la ponctuation. */
export function tokenize(text) {
  const out = [];
  let last = 0;
  for (const m of String(text).matchAll(WORD_RE)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), word: false });
    out.push({ text: m[0], word: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), word: false });
  return out;
}

/** Formes régulières d'un verbe, sans les pronoms (les clitiques sont des tokens séparés). */
function verbForms(infinitiveRaw) {
  // Les verbes pronominaux sont stockés avec « se » : on conjugue la base.
  const infinitive = infinitiveRaw.endsWith("se") ? infinitiveRaw.slice(0, -2) : infinitiveRaw;
  const stem = infinitive.slice(0, -2);
  const ending = infinitive.slice(-2);
  const forms = [];
  if (ending === "ar") {
    for (const e of ["o", "as", "a", "amos", "áis", "an"]) forms.push(stem + e);
    for (const e of ["é", "aste", "ó", "amos", "asteis", "aron"]) forms.push(stem + e);
    for (const e of ["aba", "abas", "ábamos", "abais", "aban"]) forms.push(stem + e);
    for (const e of ["e", "es", "emos", "éis", "en"]) forms.push(stem + e);
    for (const e of ["ando", "ado", "ada", "ados", "adas"]) forms.push(stem + e);
    for (const e of ["aré", "arás", "ará", "aremos", "aréis", "arán", "aría", "arías", "aríamos", "arían"]) forms.push(stem + e);
  } else if (ending === "er" || ending === "ir") {
    const present = ending === "er" ? ["o", "es", "e", "emos", "éis", "en"] : ["o", "es", "e", "imos", "ís", "en"];
    for (const e of present) forms.push(stem + e);
    for (const e of ["í", "iste", "ió", "imos", "isteis", "ieron"]) forms.push(stem + e);
    for (const e of ["ía", "ías", "íamos", "íais", "ían"]) forms.push(stem + e);
    for (const e of ["a", "as", "amos", "áis", "an"]) forms.push(stem + e);
    for (const e of ["iendo", "ido", "ida", "idos", "idas"]) forms.push(stem + e);
    for (const e of ["iré", "irás", "irá", "iremos", "iréis", "irán", "iría", "irías", "iríamos", "irían"]) forms.push(stem + e);
  }
  return forms;
}

function adjectiveForms(word) {
  if (word.pos !== "adj") return [];
  const es = word.es;
  if (/(o)$/.test(es)) {
    const base = es.slice(0, -1);
    return [base + "a", base + "os", base + "as"];
  }
  if (/(e|a)$/.test(es)) return [es + "s"];
  return [es + "es"];
}

function nounForms(word) {
  if (word.pos !== "n") return [];
  const es = word.es;
  if (/[aeiouáéó]$/.test(es)) return [es + "s"];
  if (/z$/.test(es)) return [es.slice(0, -1) + "ces"];
  if (/s$/.test(es)) return []; // pluriel invariable (lunes, análisis)
  return [es + "es"];
}

const formCache = new Map();
/** Toutes les formes écrites connues d'une entrée, normalisées, sans doublons. */
export function formsFor(word) {
  if (formCache.has(word.id)) return formCache.get(word.id);
  const set = new Set([norm(word.es)]);
  for (const v of word.variants || []) set.add(norm(v));
  for (const f of [...verbForms(word.es), ...adjectiveForms(word), ...nounForms(word)]) set.add(norm(f));
  const arr = [...set].filter(Boolean);
  formCache.set(word.id, arr);
  return arr;
}

let index = null;
let exactIndex = null;
/** Index normalisé -> entrées candidates. Construit une seule fois. */
export function buildIndex(lexicon = LEXICON) {
  const map = new Map();
  for (const word of lexicon) {
    for (const form of formsFor(word)) {
      if (!map.has(form)) map.set(form, []);
      map.get(form).push(word);
    }
  }
  return map;
}
/**
 * Index exact (accents conservés) : « el » article et « él » pronom, « si » et
 * « sí » sont des entrées distinctes, l'index normalisé ne doit pas les
 * fusionner. Sert de première tentative de résolution.
 */
export function buildExactIndex(lexicon = LEXICON) {
  const map = new Map();
  const add = (form, word) => {
    const key = String(form).toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(word);
  };
  for (const word of lexicon) {
    add(word.es, word);
    for (const variant of word.variants || []) add(variant, word);
  }
  return map;
}
export function getIndex() {
  if (!index) index = buildIndex();
  return index;
}
export function getExactIndex() {
  if (!exactIndex) exactIndex = buildExactIndex();
  return exactIndex;
}
/** Réinitialise les index (utilisé par les tests après modification du lexique). */
export function resetIndex() {
  index = null;
  exactIndex = null;
  formCache.clear();
}

const STEM_ENDINGS = [
  "aríamos", "eríamos", "iríamos", "ábamos", "ábamos", "aremos", "eremos", "iremos",
  "aban", "ando", "iendo", "ieron", "ieron", "amos", "emos", "imos", "aron", "irán", "arán",
  "aba", "abas", "adas", "ados", "ada", "ado", "ida", "ido", "áis", "éis", "ías", "ían",
  "aré", "ará", "eré", "erá", "iré", "irá", "aste", "iste", "aron", "ieron",
  "an", "en", "as", "es", "os", "as", "ís", "ía", "ió", "ía", "ar", "er", "ir",
  "o", "a", "e", "é", "ó", "s",
];

/**
 * Résolution « large » d'un token inconnu : radical de verbe, pluriel ou féminin.
 * Sert uniquement aux infobulles ; le surlignage s'appuie sur les formes exactes.
 */
function contextGlossFor(token, lesson) {
  const glosses = lesson?.contextGloss;
  if (!glosses) return "";
  const n = norm(token);
  for (const [key, value] of Object.entries(glosses)) {
    if (norm(key) === n) return value;
  }
  return "";
}

function asHit(word) {
  return { id: word.id, es: word.es, fr: word.fr, word };
}

/** Priorité aux mots de la leçon courante (évite « como » conj. vs « comer »). */
function chooseCandidate(candidates, lesson) {
  const inLesson = candidates.find((w) => lesson?.newWords?.includes(w.id));
  return asHit(inLesson || candidates[0]);
}

export function resolveToken(token, { lesson } = {}) {
  const raw = String(token).toLowerCase();
  const n = norm(token);
  if (!n) return null;
  // 1. Forme exacte, accents compris : « él » n'est pas l'article « el ».
  const exact = getExactIndex().get(raw);
  if (exact?.length) return chooseCandidate(exact, lesson);
  const candidates = getIndex().get(n) || [];
  if (candidates.length) return chooseCandidate(candidates, lesson);
  for (const ending of STEM_ENDINGS) {
    if (n.length <= ending.length + 1 || !n.endsWith(ending)) continue;
    const stem = n.slice(0, -ending.length);
    for (const w of LEXICON) {
      if (w.pos !== "v") continue;
      const base = norm(w.es).slice(0, -2);
      if (base === stem && base.length >= 2) return { id: w.id, es: w.es, fr: w.fr, word: w, fuzzy: true };
    }
  }
  if (n.endsWith("s")) {
    const singular = n.slice(0, -1);
    const c = getIndex().get(singular);
    if (c?.length) return { id: c[0].id, es: c[0].es, fr: c[0].fr, word: c[0], fuzzy: true };
  }
  return null;
}

/** Signature d'accents d'une forme : « el » -> "", « él » -> "´". */
function accentMark(surface) {
  return String(surface).normalize("NFD").replace(/[^\u0300-\u036f]/g, "");
}

/**
 * Vrai si le token correspond à l'une des formes d'un mot. Un homographe sans
 * accent (« el ») ne doit pas valider l'entrée accentuée (« él ») quand celle-ci
 * existe aussi dans le lexique.
 */
export function tokenMatchesWord(token, word) {
  const n = norm(token);
  if (!formsFor(word).includes(n)) return false;
  if (accentMark(String(token).toLowerCase()) === accentMark(String(word.es).toLowerCase())) return true;
  const rivals = (getIndex().get(n) || []).filter(
    (other) => other.id !== word.id && accentMark(String(other.es).toLowerCase()) === accentMark(String(token).toLowerCase()),
  );
  return rivals.length === 0;
}

/**
 * Découpe un texte pour l'affichage.
 *
 * Règle pédagogique : tout mot que l'apprenant n'a jamais rencontré est violet,
 * pas seulement les dix mots « ciblés » de la leçon. Les prénoms et les mots
 * hors lexique restent en couleur normale ; les formes fléchies reconnues
 * approximativement gardent leur infobulle mais ne sont pas mises en avant.
 *
 * @param {string} text
 * @param {{newWords?: string[], knownWords?: Set<string>|string[], gloss?: Record<string,string>, lexiconById?: Record<string,object>}} opts
 */
export function annotate(text, opts = {}) {
  const newWords = opts.newWords || [];
  const known = opts.knownWords instanceof Set ? opts.knownWords : new Set(opts.knownWords || []);
  return tokenize(text).map((t) => {
    if (!t.word) return { ...t };
    const gloss = contextGlossFor(t.text, opts.lesson);
    const targets = newWords.map((id) => opts.lexiconById?.[id]).filter(Boolean);
    const raw = t.text.toLowerCase();
    const wordHit =
      targets.find((w) => String(w.es).toLowerCase() === raw) || targets.find((w) => tokenMatchesWord(t.text, w));
    if (wordHit) {
      return { ...t, state: "new", wordId: wordHit.id, es: wordHit.es, fr: gloss || wordHit.fr };
    }
    const hit = resolveToken(t.text, { lesson: opts.lesson });
    if (!hit) return { ...t, state: "none" };
    const state = known.has(hit.id) ? "seen" : hit.fuzzy ? "plain" : "new";
    return {
      ...t,
      state,
      wordId: hit.id,
      es: hit.es,
      fr: gloss || hit.fr,
    };
  });
}

/** Mots du lexique présents dans un texte (formes exactes). */
export function wordsInText(text, lexicon = LEXICON) {
  const found = new Set();
  for (const t of tokenize(text)) {
    if (!t.word) continue;
    const hit = resolveToken(t.text, {});
    if (hit && !hit.fuzzy) found.add(hit.id);
  }
  return [...found];
}

/** Formes exactes d'un ensemble de mots (utile pour les cartes Memory). */
export function exampleFor(word) {
  return { es: word.ex, fr: word.exFr };
}
