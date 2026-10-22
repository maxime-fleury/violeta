/**
 * Progression : fonctions pures, sérialisables, testables.
 * Aucune dépendance au DOM ni au stockage.
 */
import { MASTERY_TARGET } from "./memory.js";

export const PROGRESS_VERSION = 1;

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function emptyProgress() {
  return {
    version: PROGRESS_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    words: {},
    lessons: {},
    environments: {},
    specials: {},
    stories: {},
    grammar: {},
    listenings: {},
    tests: {},
    reviews: { sessions: 0, lastAt: null, wordsReviewed: 0 },
    settings: { audio: true, showTranslationByDefault: false, name: "" },
    activity: [],
  };
}

function wordEntry(p, id) {
  if (!p.words[id]) p.words[id] = { seen: 0, correct: 0, mistakes: 0, lastSeen: null, lastReview: null };
  return p.words[id];
}

function logActivity(p, type, ref = null) {
  const day = todayKey();
  const last = p.activity[p.activity.length - 1];
  if (last && last.day === day && last.type === type && last.ref === ref) return;
  p.activity.push({ day, type, ref, at: new Date().toISOString() });
  if (p.activity.length > 200) p.activity = p.activity.slice(-200);
}

export function seeWord(p, id) {
  if (!id) return p;
  const w = wordEntry(p, id);
  if (!w.lastSeen) w.seen = 1;
  w.lastSeen = w.lastSeen || new Date().toISOString();
  logActivity(p, "word", id);
  return p;
}

/** Une correspondance Memory réussie compte comme une réussite pour les deux mots. */
export function markCorrect(p, id) {
  if (!id) return p;
  const w = wordEntry(p, id);
  w.correct += 1;
  w.lastReview = new Date().toISOString();
  w.seen = 1;
  return p;
}

export function markMistake(p, id) {
  if (!id) return p;
  const w = wordEntry(p, id);
  w.mistakes += 1;
  w.seen = 1;
  return p;
}

export function isMastered(p, id) {
  return (p.words[id]?.correct || 0) >= MASTERY_TARGET;
}

export function wordStatus(p, id) {
  if (!p.words[id] || (!p.words[id].seen && !p.words[id].lastSeen)) return "unknown";
  return isMastered(p, id) ? "mastered" : "discovered";
}

export function startLesson(p, id) {
  const l = p.lessons[id] || { status: "new", attempts: 0, bestCoups: null, completedAt: null };
  if (l.status !== "done") l.status = "inProgress";
  l.lastAt = new Date().toISOString();
  p.lessons[id] = l;
  return p;
}

export function completeLesson(p, id, { coups = null, words = [] } = {}) {
  const l = p.lessons[id] || { status: "new", attempts: 0, bestCoups: null };
  l.status = "done";
  l.attempts = (l.attempts || 0) + 1;
  l.completedAt = new Date().toISOString();
  l.lastAt = l.completedAt;
  if (typeof coups === "number" && (l.bestCoups === null || coups < l.bestCoups)) l.bestCoups = coups;
  p.lessons[id] = l;
  for (const wid of words) markCorrect(p, wid);
  logActivity(p, "lesson", id);
  return p;
}

export function discoverObject(p, levelId, wordId) {
  const e = p.environments[levelId] || { discovered: [], done: false, attempts: 0, completedAt: null };
  if (!e.discovered.includes(wordId)) e.discovered.push(wordId);
  p.environments[levelId] = e;
  seeWord(p, wordId);
  return p;
}

export function completeEnvironment(p, levelId, { score = 0, total = 0, words = [] } = {}) {
  const e = p.environments[levelId] || { discovered: [], done: false, attempts: 0 };
  e.done = true;
  e.attempts = (e.attempts || 0) + 1;
  e.score = score;
  e.total = total;
  e.completedAt = new Date().toISOString();
  p.environments[levelId] = e;
  for (const wid of words) markCorrect(p, wid);
  logActivity(p, "environment", levelId);
  return p;
}

export function completeSpecial(p, id, { score = 0, total = 0, words = [] } = {}) {
  const s = p.specials[id] || { done: false, attempts: 0 };
  s.done = true;
  s.attempts = (s.attempts || 0) + 1;
  s.score = score;
  s.total = total;
  s.completedAt = new Date().toISOString();
  p.specials[id] = s;
  for (const wid of words) markCorrect(p, wid);
  logActivity(p, "special", id);
  return p;
}

/** Point de grammaire terminé : les exercices sont tous réussis. */
export function completeGrammar(p, id, { score = 0, total = 0 } = {}) {
  const g = p.grammar[id] || { done: false, attempts: 0, bestScore: 0, total: 0 };
  g.done = true;
  g.attempts = (g.attempts || 0) + 1;
  g.bestScore = Math.max(g.bestScore || 0, score);
  g.total = total;
  g.completedAt = new Date().toISOString();
  p.grammar[id] = g;
  logActivity(p, "grammar", id);
  return p;
}

/** Compréhension orale terminée : quiz réussi, meilleur score conservé. */
export function completeListening(p, id, { score = 0, total = 0 } = {}) {
  const l = p.listenings[id] || { done: false, attempts: 0, bestScore: 0, total: 0 };
  l.done = true;
  l.attempts = (l.attempts || 0) + 1;
  l.bestScore = Math.max(l.bestScore || 0, score);
  l.total = total;
  l.completedAt = new Date().toISOString();
  p.listenings[id] = l;
  logActivity(p, "listening", id);
  return p;
}

/** Test de niveau : on garde le meilleur score, et la validation au seuil de 80 %. */
export function recordTest(p, id, { score = 0, total = 0 } = {}) {
  const t = p.tests[id] || { attempts: 0, bestScore: 0, bestTotal: 0, passed: false, passedAt: null };
  t.attempts = (t.attempts || 0) + 1;
  t.lastAt = new Date().toISOString();
  t.lastScore = score;
  t.lastTotal = total;
  const ratio = total ? score / total : 0;
  const bestRatio = t.bestTotal ? t.bestScore / t.bestTotal : -1;
  if (ratio > bestRatio) {
    t.bestScore = score;
    t.bestTotal = total;
  }
  if (total && ratio >= 0.8) {
    t.passed = true;
    t.passedAt = t.passedAt || new Date().toISOString();
  }
  p.tests[id] = t;
  if (t.passed) logActivity(p, "test", id);
  return p;
}

/** Récit de révision terminé : le quiz est obligatoire, la lecture à voix haute non. */
export function completeStory(p, id, { score = 0, total = 0, readAloud = false } = {}) {
  const s = p.stories[id] || { done: false, attempts: 0, readAloud: false };
  s.done = true;
  s.attempts = (s.attempts || 0) + 1;
  s.score = score;
  s.total = total;
  s.readAloud = s.readAloud || Boolean(readAloud);
  s.completedAt = new Date().toISOString();
  p.stories[id] = s;
  logActivity(p, "story", id);
  return p;
}

export function recordReview(p, { words = [], coups = 0 } = {}) {
  p.reviews.sessions += 1;
  p.reviews.lastAt = new Date().toISOString();
  p.reviews.wordsReviewed += words.length;
  for (const wid of words) markCorrect(p, wid);
  logActivity(p, "review");
  return p;
}

export function wordStats(p) {
  const values = Object.values(p.words);
  const mastered = values.filter((w) => w.correct >= MASTERY_TARGET).length;
  return {
    discovered: values.filter((w) => w.seen || w.lastSeen).length,
    mastered,
    touched: values.length,
  };
}

/** Série de jours consécutifs d'activité (aujourd'hui ou hier inclus). */
export function streakDays(p, now = new Date()) {
  const days = new Set(p.activity.map((a) => a.day));
  const cursor = new Date(now);
  if (!days.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(todayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Nettoie une progression importée : types, valeurs et structure. */
export function sanitizeProgress(raw) {
  const base = emptyProgress();
  if (!raw || typeof raw !== "object") return base;
  const p = { ...base, ...raw, version: PROGRESS_VERSION };
  p.words = raw.words && typeof raw.words === "object" ? raw.words : {};
  p.lessons = raw.lessons && typeof raw.lessons === "object" ? raw.lessons : {};
  p.environments = raw.environments && typeof raw.environments === "object" ? raw.environments : {};
  p.specials = raw.specials && typeof raw.specials === "object" ? raw.specials : {};
  p.stories = raw.stories && typeof raw.stories === "object" ? raw.stories : {};
  p.grammar = raw.grammar && typeof raw.grammar === "object" ? raw.grammar : {};
  p.listenings = raw.listenings && typeof raw.listenings === "object" ? raw.listenings : {};
  p.tests = raw.tests && typeof raw.tests === "object" ? raw.tests : {};
  p.reviews = { ...base.reviews, ...(raw.reviews || {}) };
  p.settings = { ...base.settings, ...(raw.settings || {}) };
  p.activity = Array.isArray(raw.activity) ? raw.activity.filter((a) => a && a.day) : [];
  for (const [id, w] of Object.entries(p.words)) {
    if (!w || typeof w !== "object") delete p.words[id];
    else p.words[id] = {
      seen: Number(w.seen) || 0,
      correct: Number(w.correct) || 0,
      mistakes: Number(w.mistakes) || 0,
      lastSeen: w.lastSeen || null,
      lastReview: w.lastReview || null,
    };
  }
  return p;
}
