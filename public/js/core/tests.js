/**
 * Tests de niveau : six épreuves finales (grammaire et vocabulaire pour A1, A2, B1).
 * Les questions sont construites de façon déterministe à partir du contenu réel :
 * les exercices de grammaire des leçons et le lexique gradué par niveau.
 */
import { LEXICON } from "../data/lexicon.js";
import { GRAMMAR, GRAMMAR_BY_ID, normalizeAnswer, shuffleWithSeed } from "./grammar.js";

export const LEVELS = {
  A1: { label: "A1", name: "Découverte", gate: 0, hint: "Les bases : se présenter, décrire, survivre au quotidien." },
  A2: { label: "A2", name: "Autonomie", gate: 24, hint: "Raconter, se débrouiller, comprendre l'essentiel." },
  B1: { label: "B1", name: "Seuil", gate: 48, hint: "Argumenter, nuancer, produire sans filet." },
};

export const DOMAINS = {
  grammaire: { label: "Grammaire", icon: "layers", hint: "Reconnaître et appliquer les structures." },
  vocabulaire: { label: "Vocabulaire", icon: "book", hint: "Comprendre et produire les mots du niveau." },
};

export const TESTS = [
  { id: "a1-grammaire", level: "A1", domain: "grammaire", subtitle: "Articles, présent, ser/estar, négation" },
  { id: "a1-vocabulaire", level: "A1", domain: "vocabulaire", subtitle: "Les mots indispensables du quotidien" },
  { id: "a2-grammaire", level: "A2", domain: "grammaire", subtitle: "Passés, pronoms, impératif" },
  { id: "a2-vocabulaire", level: "A2", domain: "vocabulaire", subtitle: "Le lexique de l'autonomie" },
  { id: "b1-grammaire", level: "B1", domain: "grammaire", subtitle: "Futur, conditionnel, subjonctif, connecteurs" },
  { id: "b1-vocabulaire", level: "B1", domain: "vocabulaire", subtitle: "Production active des mots avancés" },
].map((test) => ({
  ...test,
  title: `${DOMAINS[test.domain].label} ${test.level}`,
  questions: 12,
  required: 10,
}));

export const TESTS_BY_ID = Object.fromEntries(TESTS.map((t) => [t.id, t]));

const CONTENT_POS = new Set(["n", "v", "adj", "adv"]);

function shortFr(word) {
  return String(word.fr || "").split(" / ")[0].split(" (")[0].trim();
}

function usable(word) {
  return word && CONTENT_POS.has(word.pos) && word.es.length >= 3 && word.fr && normalizeAnswer(word.es) !== normalizeAnswer(word.fr);
}

function spaced(items, count) {
  if (items.length <= count) return [...items];
  const out = [];
  const step = (items.length - 1) / (count - 1 || 1);
  for (let i = 0; i < count; i++) out.push(items[Math.round(i * step)]);
  return out.filter((item, index) => out.indexOf(item) === index).slice(0, count);
}

function vocabWords(level) {
  if (level === "B1") {
    // Le lexique de l'app s'arrête à l'A2 : le test B1 porte sur la production
    // active des mots A2 les moins fréquents, le seuil réel du B1.
    const pool = LEXICON.filter((w) => w.level === "A2" && usable(w)).sort((a, b) => (b.subsRank || 0) - (a.subsRank || 0));
    return spaced(pool, 14);
  }
  const pool = LEXICON.filter((w) => w.level === level && usable(w)).sort((a, b) => (a.rank || 0) - (b.rank || 0));
  // A1 : on reste dans les mots les plus fréquents ; A2 : tout le palier.
  const target = level === "A1" ? pool.filter((w) => (w.rank || 999) <= 250) : pool;
  return spaced(target.length >= 12 ? target : pool, 14);
}

function distractors(word, level, used) {
  const pool = LEXICON.filter((w) => usable(w) && w.id !== word.id && w.level === level);
  const sameTheme = pool.filter((w) => w.theme === word.theme && shortFr(w) !== shortFr(word));
  const others = pool.filter((w) => w.theme !== word.theme && shortFr(w) !== shortFr(word));
  const picks = [];
  for (const candidate of [...sameTheme, ...others]) {
    const fr = shortFr(candidate);
    if (!fr) continue;
    if (normalizeAnswer(fr) === normalizeAnswer(shortFr(word))) continue;
    if (used.has(normalizeAnswer(fr))) continue;
    used.add(normalizeAnswer(fr));
    picks.push(fr);
    if (picks.length === 3) break;
  }
  return picks;
}

/** Construit un test complet, stable d'une session à l'autre. */
export function buildTest(id) {
  const test = TESTS_BY_ID[id];
  if (!test) return null;
  const questions = test.domain === "grammaire" ? grammarQuestions(test) : vocabQuestions(test);
  const total = questions.length;
  const required = Math.max(1, Math.ceil(total * 0.8));
  return { ...test, questions, total, required };
}

function grammarQuestions(test) {
  const lessons = GRAMMAR.filter((g) => g.level === test.level);
  const byLesson = lessons.map((g) => ({
    lesson: g,
    exercises: g.exercises.map((exercise, index) => ({ ...exercise, lessonId: g.id, lessonTitle: g.title, index })),
  }));
  const picked = [];
  let round = 0;
  while (picked.length < Math.min(test.questions, byLesson.reduce((n, l) => n + l.exercises.length, 0)) && round < 8) {
    for (const entry of byLesson) {
      const exercise = entry.exercises[round];
      if (exercise) picked.push(exercise);
    }
    round++;
  }
  return picked.slice(0, test.questions).map((exercise, i) => ({
    ...exercise,
    id: `${test.id}-${i}`,
    prompt: exercise.prompt,
    options: exercise.type === "choice" ? shuffleWithSeed(exercise.options, `${test.id}:${exercise.lessonId}:${exercise.index}`) : undefined,
    reference: `${GRAMMAR_BY_ID[exercise.lessonId]?.title || ""}`,
  }));
}

function vocabQuestions(test) {
  const words = vocabWords(test.level);
  const count = Math.min(test.questions, words.length);
  const chosen = words.slice(0, count);
  const usedFr = new Set(chosen.map((w) => normalizeAnswer(shortFr(w))));
  return chosen.map((word, index) => {
    const format = test.level === "A1" ? "es-fr" : test.level === "B1" ? "fr-es" : index % 2 === 0 ? "es-fr" : "fr-es";
    if (format === "es-fr") {
      const used = new Set([normalizeAnswer(shortFr(word))]);
      const wrong = distractors(word, test.level === "B1" ? "A2" : test.level, used);
      const options = [shortFr(word), ...wrong].slice(0, 4);
      return {
        id: `${test.id}-${index}`,
        type: "choice",
        dir: "es-fr",
        wordId: word.id,
        prompt: `Que signifie « ${word.es} » ?`,
        options: sortOptions(options, word.id),
        answer: shortFr(word),
        why: `${word.es} = ${shortFr(word)}.`,
        example: word.ex,
        exampleFr: word.exFr,
      };
    }
    return {
      id: `${test.id}-${index}`,
      type: "input",
      dir: "fr-es",
      wordId: word.id,
      prompt: `Comment dit-on « ${shortFr(word)} » en espagnol ?`,
      answer: word.es,
      alternatives: word.es.includes(" / ") ? word.es.split(" / ") : [],
      why: `${shortFr(word)} = ${word.es}.`,
      example: word.ex,
      exampleFr: word.exFr,
    };
  });
}

function sortOptions(options, seed) {
  let h = 2166136261;
  for (const ch of `${seed}`) h = (h ^ ch.charCodeAt(0)) >>> 0;
  const out = [...new Set(options)];
  for (let i = out.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Réponse libre : plusieurs graphies acceptées (accents, articles, variantes). */
export function isCorrectAnswer(question, value) {
  const given = normalizeAnswer(value);
  if (!given) return false;
  const accepted = [question.answer, ...(question.alternatives || [])].map(normalizeAnswer);
  return accepted.includes(given);
}

export function testEntry(progress, id) {
  return progress.tests?.[id] || null;
}

export function isTestPassed(progress, id) {
  return Boolean(progress.tests?.[id]?.passed);
}

export function testUnlocked(progress, test) {
  const done = Object.values(progress.lessons || {}).filter((l) => l.status === "done").length;
  return done >= (LEVELS[test.level]?.gate || 0);
}

export function testsSummary(progress) {
  const passed = TESTS.filter((t) => isTestPassed(progress, t.id)).length;
  const levels = Object.keys(LEVELS).map((level) => {
    const own = TESTS.filter((t) => t.level === level);
    return {
      level,
      tests: own,
      passed: own.filter((t) => isTestPassed(progress, t.id)).length,
      complete: own.every((t) => isTestPassed(progress, t.id)),
    };
  });
  return { passed, total: TESTS.length, levels, complete: passed === TESTS.length };
}

/** Liste des points de grammaire évalués par un test, pour l'explication. */
export function grammarCoverage(level) {
  return GRAMMAR.filter((g) => g.level === level).map((g) => g.title);
}
