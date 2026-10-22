/**
 * Le parcours principal est entièrement dérivé des données :
 * quels mots chaque leçon introduit, dans quel ordre, et ce qui reste à écrire.
 */
import { LESSONS } from "../data/lessons.js";
import { LEXICON, LEXICON_BY_ID } from "../data/lexicon.js";
import { resolveToken, tokenize, tokenMatchesWord } from "./lemma.js";

export const CURRICULUM = [...LESSONS].sort((a, b) => a.order - b.order);

export function lessonById(id) {
  return CURRICULUM.find((l) => l.id === id) || null;
}
export function nextLesson(id) {
  const i = CURRICULUM.findIndex((l) => l.id === id);
  return i >= 0 ? CURRICULUM[i + 1] || null : null;
}
export function previousLesson(id) {
  const i = CURRICULUM.findIndex((l) => l.id === id);
  return i > 0 ? CURRICULUM[i - 1] : null;
}

/** Mots de la leçon, dans l'ordre déclaré, enrichis depuis le lexique. */
export function lessonWordList(lesson) {
  return (lesson?.newWords || []).map((id) => LEXICON_BY_ID[id]).filter(Boolean);
}

/** Premier passage d'un mot dans le parcours : {lessonId, lessonIndex, lessonTitle}. */
export const WORD_INTRO = (() => {
  const map = {};
  CURRICULUM.forEach((lesson, index) => {
    for (const id of lesson.newWords || []) {
      if (!map[id]) map[id] = { lessonId: lesson.id, lessonIndex: index, lessonTitle: lesson.title };
    }
  });
  return map;
})();

/**
 * Mots du lexique réellement présents dans le texte de chaque leçon.
 * Sert à considérer comme « déjà rencontré » tout mot lu dans une leçon
 * précédente, et pas seulement les dix mots ciblés.
 */
export const LESSON_TEXT_WORDS = (() => {
  const map = new Map();
  for (const lesson of CURRICULUM) {
    const set = new Set();
    const text = lesson.lines.map((line) => line.es).join(" ");
    for (const token of tokenize(text)) {
      if (!token.word) continue;
      const hit = resolveToken(token.text, { lesson });
      if (hit) set.add(hit.id);
    }
    map.set(lesson.id, [...set]);
  }
  return map;
})();

/**
 * Introduction implicite : un mot est considéré comme intégré dès qu'il apparaît
 * dans le dialogue d'une leçon, même s'il n'est pas l'une des cibles déclarées.
 * C'est ce que lit l'élève (avec son infobulle), donc le mot est bien jouable.
 */
export const TEXT_INTRO = (() => {
  const map = {};
  for (const lesson of CURRICULUM) {
    for (const id of LESSON_TEXT_WORDS.get(lesson.id) || []) {
      if (!map[id]) map[id] = { lessonId: lesson.id, lessonTitle: lesson.title, implicit: true };
    }
  }
  return map;
})();

/** Où rencontrer un mot : cible déclarée d'abord, sinon première apparition dans un texte. */
export function introOf(id) {
  return WORD_INTRO[id] || TEXT_INTRO[id] || null;
}

/** Union des cibles déclarées et des mots déjà lus dans un dialogue. */
export const INTRODUCED_WORDS = [...new Set([...Object.keys(WORD_INTRO), ...Object.keys(TEXT_INTRO)])];

/** Leçons terminées dans l'ordre du parcours (indépendant de la progression). */
export function wordsKnownBefore(lessonId) {
  const idx = CURRICULUM.findIndex((l) => l.id === lessonId);
  const set = new Set();
  for (const lesson of CURRICULUM.slice(0, Math.max(0, idx))) {
    lesson.newWords.forEach((id) => set.add(id));
    for (const id of LESSON_TEXT_WORDS.get(lesson.id) || []) set.add(id);
  }
  return set;
}

/** Contrôle éditorial : appelé par les tests et par scripts/validate-content.mjs. */
export function validateCurriculum() {
  const issues = [];
  const warnings = [];
  const seenIds = new Set();
  const introduced = new Set();
  const counts = [];

  if (!CURRICULUM.length) issues.push("Aucune leçon.");
  for (const lesson of CURRICULUM) {
    if (seenIds.has(lesson.id)) issues.push(`Leçon en double : ${lesson.id}`);
    seenIds.add(lesson.id);
    if (!lesson.title || !lesson.subtitle) issues.push(`${lesson.id}: titre ou sous-titre manquant`);
    if (!Array.isArray(lesson.lines) || lesson.lines.length < 3) issues.push(`${lesson.id}: dialogue trop court`);
    if (!Array.isArray(lesson.newWords)) {
      issues.push(`${lesson.id}: newWords manquant`);
      continue;
    }
    if (lesson.newWords.length < 8 || lesson.newWords.length > 12) {
      issues.push(`${lesson.id}: ${lesson.newWords.length} nouveaux mots (attendu 8 à 12)`);
    }
    const words = lessonWordList(lesson);
    if (words.length !== lesson.newWords.length) {
      const missing = lesson.newWords.filter((id) => !LEXICON_BY_ID[id]);
      issues.push(`${lesson.id}: mots absents du lexique : ${missing.join(", ")}`);
    }
    const text = lesson.lines.map((l) => l.es).join(" ");
    const tokens = tokenize(text).filter((t) => t.word);
    const notFound = words.filter((w) => !tokens.some((t) => tokenMatchesWord(t.text, w)));
    if (notFound.length) issues.push(`${lesson.id}: mots annoncés mais absents du texte : ${notFound.map((w) => w.es).join(", ")}`);
    for (const line of lesson.lines) {
      if (!line.es || !line.fr) issues.push(`${lesson.id}: ligne sans texte ou sans traduction`);
      if (line.es.length > 220) warnings.push(`${lesson.id}: ligne très longue`);
    }
    for (const id of lesson.newWords) {
      if (introduced.has(id)) warnings.push(`${lesson.id}: « ${id} » est déjà introduit ailleurs (${WORD_INTRO[id]?.lessonId})`);
      introduced.add(id);
    }
    counts.push({ id: lesson.id, title: lesson.title, count: words.length });
  }

  const declared = Object.keys(WORD_INTRO).length;
  const unknown = introduced.size - declared;
  if (unknown) warnings.push(`${unknown} introduction(s) en double`);
  return {
    issues,
    warnings,
    lessons: CURRICULUM.length,
    introduced: INTRODUCED_WORDS.length,
    totalLexicon: LEXICON.length,
    counts,
  };
}

/** Ce qui reste du lexique cible, regroupé par thème (pour la page Vocabulaire). */
export function remainingWords() {
  const done = new Set(INTRODUCED_WORDS);
  return LEXICON.filter((w) => !done.has(w.id));
}

export function themeGroups(words = LEXICON) {
  const groups = new Map();
  for (const w of words) {
    if (!groups.has(w.theme)) groups.set(w.theme, []);
    groups.get(w.theme).push(w);
  }
  return groups;
}
