/**
 * Couverture réelle du lexique : parcours principal, leçons thématiques et
 * environnements réunis. Les trois sources partagent les identifiants du
 * lexique, la comparaison est donc directe.
 */
import { INTRODUCED_WORDS } from "./curriculum.js";
import { LEXICON } from "../data/lexicon.js";
import { SPECIALS } from "../data/specials.js";
import { allLevels } from "../data/environments.js";

const ids = new Set(INTRODUCED_WORDS);
for (const theme of SPECIALS) {
  for (const section of theme.sections || []) {
    for (const item of section.items || []) if (item.word) ids.add(item.word);
  }
}
for (const { level } of allLevels()) {
  for (const id of level.focus || []) ids.add(id);
}

export const INTEGRATED_WORDS = [...ids];
export const MISSING_WORDS = LEXICON.filter((w) => !ids.has(w.id));
export const COVERAGE_PERCENT = Math.round((ids.size / LEXICON.length) * 100);
