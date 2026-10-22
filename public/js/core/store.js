/**
 * Stockage local de la progression : une seule clé versionnée, sauvegarde
 * automatique et abonnement pour rafraîchir l'interface.
 */
import {
  completeEnvironment,
  completeLesson,
  completeGrammar,
  completeListening,
  completeSpecial,
  completeStory,
  recordTest,
  discoverObject,
  emptyProgress,
  markCorrect,
  markMistake,
  recordReview,
  sanitizeProgress,
  seeWord,
  startLesson,
  todayKey,
} from "./progress.js";

export const STORAGE_KEY = "violeta.progress.v1";

function read() {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(value) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* mode privé ou quota : la session reste utilisable en mémoire */
  }
}

let state = sanitizeProgress(read());
const listeners = new Set();
let saveTimer = null;

function commit(next, { persist = true } = {}) {
  next.updatedAt = new Date().toISOString();
  state = next;
  if (persist) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => write(state), 120);
  }
  for (const fn of listeners) {
    try {
      fn(state);
    } catch (error) {
      console.error("Erreur d'abonné au store", error);
    }
  }
  return state;
}

export const store = {
  get: () => state,
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  /** Applique une mutation pure puis sauvegarde. */
  update(fn) {
    const draft = structuredClone(state);
    fn(draft);
    return commit(draft);
  },
  saveSettings(patch) {
    return store.update((p) => Object.assign(p.settings, patch));
  },
  reset() {
    const fresh = emptyProgress();
    write(fresh);
    return commit(fresh, { persist: false });
  },
  /** Remplace la progression (import / test) en repartant d'un état propre. */
  replace(raw) {
    return commit(sanitizeProgress(raw));
  },
  export() {
    return JSON.stringify(state, null, 2);
  },
  hasProgress() {
    const s = state;
    return (
      Object.keys(s.words).length > 0 ||
      Object.keys(s.lessons).length > 0 ||
      Object.keys(s.environments).length > 0 ||
      Object.keys(s.specials).length > 0 ||
      Object.keys(s.stories || {}).length > 0 ||
      Object.keys(s.grammar || {}).length > 0 ||
      Object.keys(s.listenings || {}).length > 0 ||
      Object.keys(s.tests || {}).length > 0
    );
  },
};

/** Petites actions nommées utilisées par les vues. */
export const actions = {
  seeWord: (id) => store.update((p) => seeWord(p, id)),
  seeWords: (ids) => store.update((p) => ids.forEach((id) => seeWord(p, id))),
  markCorrect: (ids) => store.update((p) => ids.forEach((id) => markCorrect(p, id))),
  markMistake: (ids) => store.update((p) => ids.forEach((id) => markMistake(p, id))),
  startLesson: (id) => store.update((p) => startLesson(p, id)),
  completeLesson: (id, payload) => store.update((p) => completeLesson(p, id, payload)),
  discoverObject: (levelId, wordId) => store.update((p) => discoverObject(p, levelId, wordId)),
  completeEnvironment: (levelId, payload) => store.update((p) => completeEnvironment(p, levelId, payload)),
  completeSpecial: (id, payload) => store.update((p) => completeSpecial(p, id, payload)),
  completeGrammar: (id, payload) => store.update((p) => completeGrammar(p, id, payload)),
  completeListening: (id, payload) => store.update((p) => completeListening(p, id, payload)),
  recordTest: (id, payload) => store.update((p) => recordTest(p, id, payload)),
  completeStory: (id, payload) => store.update((p) => completeStory(p, id, payload)),
  recordReview: (payload) => store.update((p) => recordReview(p, payload)),
};

/** Date du jour (pour l'affichage de la série). */
export { todayKey };
