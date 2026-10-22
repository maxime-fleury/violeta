/**
 * Compréhensions orales : registre, progression et contrôle éditorial.
 * Les vidéos sont locales (public/media/ecoute) et sous licence CC BY 4.0.
 */
import { LISTENINGS } from "../data/listenings.js";
import { normalizeAnswer } from "./grammar.js";

export { LISTENINGS };

export const LISTENING_BY_ID = Object.fromEntries(LISTENINGS.map((item) => [item.id, item]));

/** Le point d'écoute conseillé après une leçon donnée (0 ou 1 par leçon). */
export const LISTENING_AFTER = (() => {
  const map = {};
  for (const item of LISTENINGS) {
    if (!map[item.afterLesson]) map[item.afterLesson] = item;
  }
  return map;
})();

export function listeningForLevel(level) {
  return LISTENINGS.filter((item) => item.level === level);
}

export function listeningDoneCount(progress) {
  return LISTENINGS.filter((item) => progress.listenings?.[item.id]?.done).length;
}

/** Prochaine écoute : d'abord celle dont la leçon est validée, sinon la suivante. */
export function nextListeningFor(progress) {
  const unlocked = LISTENINGS.find(
    (item) => progress.lessons?.[`l${String(item.afterLesson).padStart(2, "0")}`]?.status === "done" && !progress.listenings?.[item.id]?.done,
  );
  if (unlocked) return unlocked;
  return LISTENINGS.find((item) => !progress.listenings?.[item.id]?.done) || null;
}

export function listeningSuggestionFor(lessonOrder, progress) {
  const item = LISTENING_AFTER[lessonOrder];
  if (!item || progress.listenings?.[item.id]?.done) return null;
  return item;
}

export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds || 0));
  const min = Math.floor(total / 60);
  const sec = String(total % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

/** Contrôle éditorial : appelé par le validateur. */
export function validateListening() {
  const issues = [];
  const seen = new Set();
  for (const item of LISTENINGS) {
    if (seen.has(item.id)) issues.push(`Écoute en double : ${item.id}`);
    seen.add(item.id);
    if (!item.title || !item.subtitle || !item.goal) issues.push(`${item.id}: titre, sous-titre ou objectif manquant`);
    if (!["A2", "B1"].includes(item.level)) issues.push(`${item.id}: niveau inattendu (${item.level})`);
    if (!Number.isInteger(item.afterLesson) || item.afterLesson < 1 || item.afterLesson > 76) issues.push(`${item.id}: afterLesson invalide`);
    if (!item.speaker || !item.origin) issues.push(`${item.id}: locuteur ou origine manquant`);
    if (!item.video?.endsWith(".mp4") || !item.poster?.endsWith(".jpg")) issues.push(`${item.id}: chemins média invalides`);
    if (!(item.seconds > 10 && item.seconds < 180)) issues.push(`${item.id}: durée invalide`);
    if (!item.source?.license || !item.source?.url || !item.source?.author) issues.push(`${item.id}: attribution incomplète`);
    if (!item.transcript?.es || !item.transcript?.fr) issues.push(`${item.id}: transcription ou traduction manquante`);
    if ((item.glossary || []).length < 4) issues.push(`${item.id}: glossaire trop court`);
    if ((item.quiz || []).length < 4) issues.push(`${item.id}: moins de 4 questions`);
    for (const [i, q] of (item.quiz || []).entries()) {
      if (!q.prompt || !q.answer) issues.push(`${item.id} q${i + 1}: énoncé ou réponse manquant`);
      if (q.type === "choice") {
        const options = q.options || [];
        if (options.length < 3) issues.push(`${item.id} q${i + 1}: moins de 3 options`);
        if (!options.some((option) => normalizeAnswer(option) === normalizeAnswer(q.answer))) {
          issues.push(`${item.id} q${i + 1}: la bonne réponse n'est pas dans les options`);
        }
        if (new Set(options.map(normalizeAnswer)).size !== options.length) issues.push(`${item.id} q${i + 1}: options en double`);
      }
      if (!q.why) issues.push(`${item.id} q${i + 1}: correction absente`);
    }
  }
  return issues;
}
