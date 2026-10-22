/**
 * Les leçons de grammaire vivent à côté du parcours : elles ne comptent pas
 * dans les 76 leçons, mais sont proposées au bon moment dans le parcours.
 */
import { GRAMMAR_A } from "../data/grammar-a.js";
import { GRAMMAR_B } from "../data/grammar-b.js";

export const GRAMMAR = [...GRAMMAR_A, ...GRAMMAR_B].sort((a, b) => a.order - b.order);
export const GRAMMAR_BY_ID = Object.fromEntries(GRAMMAR.map((g) => [g.id, g]));

/** Le point de grammaire conseillé après une leçon donnée (0 ou 1 par leçon). */
export const GRAMMAR_AFTER = (() => {
  const map = {};
  for (const lesson of GRAMMAR) {
    if (!map[lesson.afterLesson]) map[lesson.afterLesson] = lesson;
  }
  return map;
})();

export function grammarForLevel(level) {
  return GRAMMAR.filter((g) => g.level === level);
}

export function grammarDoneCount(progress) {
  return GRAMMAR.filter((g) => progress.grammar?.[g.id]?.done).length;
}

/**
 * Point de grammaire à conseiller : la première leçon dont la leçon d'accroche
 * est validée, mais qui n'est pas encore faite. Sinon, la suivante.
 */
export function nextGrammarFor(progress) {
  return (
    GRAMMAR.find((g) => progress.lessons?.[`l${String(g.afterLesson).padStart(2, "0")}`]?.status === "done" && !progress.grammar?.[g.id]?.done) ||
    GRAMMAR.find((g) => !progress.grammar?.[g.id]?.done) ||
    null
  );
}

/** Point de grammaire à proposer à l'élève qui vient de terminer une leçon. */
export function grammarSuggestionFor(lessonOrder, progress) {
  const g = GRAMMAR_AFTER[lessonOrder];
  if (!g || progress.grammar?.[g.id]?.done) return null;
  return g;
}

/** Hash déterministe, pour mélanger les options sans changer à chaque rendu. */
function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed(items, seedText) {
  const rand = rng(hash(seedText));
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Exercices prêts à afficher : options mélangées de façon stable. */
export function exercisesOf(lesson) {
  return lesson.exercises.map((exercise, index) => ({
    ...exercise,
    lessonId: lesson.id,
    word: null,
    options: exercise.type === "choice" ? shuffleWithSeed(exercise.options, `${lesson.id}:${index}`) : undefined,
  }));
}

/** Contrôle éditorial des leçons de grammaire. */
export function validateGrammar() {
  const issues = [];
  const seen = new Set();
  for (const g of GRAMMAR) {
    if (seen.has(g.id)) issues.push(`Leçon de grammaire en double : ${g.id}`);
    seen.add(g.id);
    if (!g.title || !g.goal) issues.push(`${g.id}: titre ou objectif manquant`);
    if (!["A1", "A2", "B1"].includes(g.level)) issues.push(`${g.id}: niveau invalide (${g.level})`);
    if (!Number.isInteger(g.afterLesson) || g.afterLesson < 1 || g.afterLesson > 76) issues.push(`${g.id}: afterLesson invalide`);
    if (!Array.isArray(g.rules) || g.rules.length < 3) issues.push(`${g.id}: moins de 3 règles`);
    if (!Array.isArray(g.exercises) || g.exercises.length < 4) issues.push(`${g.id}: moins de 4 exercices`);
    for (const [i, ex] of (g.exercises || []).entries()) {
      if (!ex.prompt || !ex.answer) issues.push(`${g.id} ex ${i + 1}: énoncé ou réponse manquant`);
      if (ex.type === "choice") {
        if (!Array.isArray(ex.options) || ex.options.length < 3) issues.push(`${g.id} ex ${i + 1}: moins de 3 options`);
        else if (!ex.options.some((o) => normalizeAnswer(o) === normalizeAnswer(ex.answer))) {
          issues.push(`${g.id} ex ${i + 1}: la bonne réponse n'est pas dans les options`);
        }
        if (new Set((ex.options || []).map(normalizeAnswer)).size !== (ex.options || []).length) {
          issues.push(`${g.id} ex ${i + 1}: options en double`);
        }
      }
      if (ex.type === "input" && !ex.why) issues.push(`${g.id} ex ${i + 1}: correction absente`);
    }
  }
  return issues;
}

/** Comparaison tolérante aux accents, à la casse et à la ponctuation. */
export function normalizeAnswer(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(el|la|los|las|un|una|unos|unas)\s+/, "")
    .replace(/[¿?¡!.,;:"'«»()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
