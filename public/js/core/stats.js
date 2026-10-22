/** Statistiques globales, dérivées de la progression et des contenus réellement écrits. */
import { LEXICON } from "../data/lexicon.js";
import { CURRICULUM } from "./curriculum.js";
import { SPECIALS } from "../data/specials.js";
import { RECITS } from "../data/recits.js";
import { allLevels } from "../data/environments.js";
import { GRAMMAR } from "./grammar.js";
import { LISTENINGS } from "./listening.js";
import { TESTS, isTestPassed } from "./tests.js";
import { isMastered, wordStats } from "./progress.js";

export function contentTotals() {
  const levels = allLevels();
  const specialWords = new Set();
  for (const s of SPECIALS) {
    for (const section of s.sections) for (const item of section.items) if (item.word) specialWords.add(item.word);
  }
  return {
    lessons: CURRICULUM.length,
    specials: SPECIALS.length,
    recits: RECITS.length,
    levels: levels.length,
    steps: CURRICULUM.length + SPECIALS.length + RECITS.length + levels.length,
    specialWords,
    levelWords: new Set(levels.flatMap(({ level }) => level.focus || [])),
    grammar: GRAMMAR.length,
    listenings: LISTENINGS.length,
    tests: TESTS.length,
  };
}

export function overallStats(progress) {
  const words = wordStats(progress);
  const lessonsDone = CURRICULUM.filter((l) => progress.lessons[l.id]?.status === "done").length;
  const specialsDone = SPECIALS.filter((s) => progress.specials[s.id]?.done).length;
  const storiesDone = RECITS.filter((r) => progress.stories?.[r.id]?.done).length;
  const levelsDone = allLevels().filter(({ level }) => progress.environments[level.id]?.done).length;
  const grammarDone = GRAMMAR.filter((g) => progress.grammar?.[g.id]?.done).length;
  const listeningsDone = LISTENINGS.filter((l) => progress.listenings?.[l.id]?.done).length;
  const testsPassed = TESTS.filter((t) => isTestPassed(progress, t.id)).length;
  const totals = contentTotals();
  const stepsDone = lessonsDone + specialsDone + storiesDone + levelsDone;
  return {
    discovered: words.discovered,
    mastered: words.mastered,
    lessonsDone,
    specialsDone,
    storiesDone,
    levelsDone,
    grammarDone,
    listeningsDone,
    testsPassed,
    percent: totals.steps ? Math.round((stepsDone / totals.steps) * 100) : 0,
    lessonsPercent: totals.lessons ? Math.round((lessonsDone / totals.lessons) * 100) : 0,
    masteredPercent: LEXICON.length ? Math.round((words.mastered / LEXICON.length) * 100) : 0,
    discoveredPercent: LEXICON.length ? Math.round((words.discovered / LEXICON.length) * 100) : 0,
    totals,
  };
}

/** Prochaine leçon conseillée : la première non validée, sinon la dernière. */
export function nextLessonFor(progress) {
  const pending = CURRICULUM.find((l) => progress.lessons[l.id]?.status !== "done");
  if (pending) return pending;
  return CURRICULUM[CURRICULUM.length - 1] || null;
}

export function lastCompletedLesson(progress) {
  const done = CURRICULUM.filter((l) => progress.lessons[l.id]?.status === "done");
  return done[done.length - 1] || null;
}

export function nextLevelFor(progress) {
  return allLevels().find(({ level }) => !progress.environments[level.id]?.done) || null;
}

export function nextSpecialFor(progress) {
  return SPECIALS.find((s) => !progress.specials[s.id]?.done) || null;
}

export function masteredWordCount(progress) {
  return LEXICON.filter((w) => isMastered(progress, w.id)).length;
}
