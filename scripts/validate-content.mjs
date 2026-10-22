/**
 * Contrôle éditorial du contenu : cohérence des leçons, couverture réelle du
 * lexique cible, identifiants des environnements et des leçons thématiques.
 * Usage : bun scripts/validate-content.mjs
 */
import { validateCurriculum, INTRODUCED_WORDS, CURRICULUM, LESSON_TEXT_WORDS } from "../public/js/core/curriculum.js";
import { LEXICON, LEXICON_BY_ID } from "../public/js/data/lexicon.js";
import { SPECIALS } from "../public/js/data/specials.js";
import { ENVIRONMENTS } from "../public/js/data/environments.js";
import { RECITS } from "../public/js/data/recits.js";
import { GRAMMAR, validateGrammar } from "../public/js/core/grammar.js";
import { TESTS, buildTest } from "../public/js/core/tests.js";
import { LISTENINGS, validateListening } from "../public/js/core/listening.js";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { tokenize, resolveToken } from "../public/js/core/lemma.js";

let errors = 0;
const fail = (msg) => {
  errors++;
  console.error("  ✗ " + msg);
};
const ok = (msg) => console.log("  ✓ " + msg);

console.log("Parcours principal");
const report = validateCurriculum();
for (const issue of report.issues) fail(issue);
for (const warning of report.warnings) console.warn("  ! " + warning);
if (!report.issues.length) ok(`${report.lessons} leçons valides, ${report.introduced} mots introduits sur ${report.totalLexicon}.`);
console.log(
  "  Détail : " +
    report.counts.map((c) => `${c.id}(${c.count})`).join(" "),
);

// --- Leçons thématiques -----------------------------------------------------
console.log("\nLeçons thématiques");
const specialIds = new Set();
const specialWordIds = new Set();
for (const s of SPECIALS) {
  if (specialIds.has(s.id)) fail(`thème en double : ${s.id}`);
  specialIds.add(s.id);
  if (!s.title || !s.subtitle) fail(`${s.id}: titre manquant`);
  if (!Array.isArray(s.sections) || !s.sections.length) fail(`${s.id}: aucune section`);
  for (const section of s.sections) {
    if (!section.items?.length) fail(`${s.id}/${section.id}: section vide`);
    for (const item of section.items || []) {
      if (!item.es || !item.fr) fail(`${s.id}: item sans es/fr`);
      if (item.word) {
        if (!LEXICON_BY_ID[item.word]) fail(`${s.id}/${item.es}: mot "${item.word}" absent du lexique`);
        else specialWordIds.add(item.word);
      }
    }
  }
  if (!s.exercises?.length) fail(`${s.id}: aucun exercice`);
  for (const ex of s.exercises || []) {
    if (!ex.prompt || ex.answer === undefined) fail(`${s.id}: exercice incomplet`);
    if (ex.type === "choice" && (!Array.isArray(ex.options) || !ex.options.includes(ex.answer))) {
      fail(`${s.id}: la réponse n'est pas dans les options (${ex.prompt})`);
    }
  }
}
if (!errors) ok(`${SPECIALS.length} thèmes, ${specialWordIds.size} mots du lexique référencés.`);

// --- Environnements ---------------------------------------------------------
console.log("\nEnvironnements interactifs");
let levelCount = 0;
let objectCount = 0;
const envWordIds = new Set();
const levelIds = new Set();
for (const env of ENVIRONMENTS) {
  if (!env.rooms?.length) fail(`${env.id}: aucune pièce`);
  for (const room of env.rooms) {
    if (!room.levels?.length) fail(`${env.id}/${room.id}: aucun niveau`);
    for (const level of room.levels) {
      levelCount++;
      if (levelIds.has(level.id)) fail(`niveau en double : ${level.id}`);
      levelIds.add(level.id);
      const objects = level.scene?.objects || [];
      const focus = level.focus || [];
      if (focus.length < 6) fail(`${level.id}: ${focus.length} objets interactifs (minimum 6)`);
      if (new Set(focus).size !== focus.length) fail(`${level.id}: objets interactifs en double`);
      for (const o of objects) {
        if (!o.id || !o.es || !o.fr) fail(`${level.id}: objet incomplet`);
        if (!o.art || !o.hit) fail(`${level.id}/${o.id}: dessin ou zone interactive manquant`);
        if (!o.labelAt) fail(`${level.id}/${o.id}: point d'ancrage manquant`);
      }
      for (const id of focus) {
        objectCount++;
        const found = objects.find((o) => o.id === id);
        if (!found) fail(`${level.id}: l'objet interactif ${id} n'est pas dessiné`);
        else if (!LEXICON_BY_ID[id]) fail(`${level.id}/${id}: mot absent du lexique cible`);
        else envWordIds.add(id);
      }
      if (!level.lines?.length) fail(`${level.id}: dialogue manquant`);
      for (const line of level.lines || []) if (!line.es || !line.fr) fail(`${level.id}: ligne non traduite`);
      if (!level.quiz?.length) fail(`${level.id}: quiz manquant`);
      for (const q of level.quiz || []) {
        if (!q.answer || !q.options?.includes(q.answer)) fail(`${level.id}: quiz incohérent (${q.prompt})`);
      }
    }
  }
}
if (!errors) ok(`${ENVIRONMENTS.length} environnements, ${levelCount} niveaux, ${objectCount} objets interactifs.`);

// --- Récits de révision -----------------------------------------------------
console.log("\nRécits de révision");
const recitIds = new Set();
const knownByMilestone = [];
{
  const acc = new Set();
  for (const lesson of CURRICULUM) {
    for (const id of lesson.newWords) acc.add(id);
    for (const id of LESSON_TEXT_WORDS.get(lesson.id) || []) acc.add(id);
    knownByMilestone.push(new Set(acc));
  }
}
for (const recit of RECITS) {
  if (recitIds.has(recit.id)) fail(`récit en double : ${recit.id}`);
  recitIds.add(recit.id);
  if (!recit.title || !recit.subtitle) fail(`${recit.id}: titre manquant`);
  const milestone = CURRICULUM.findIndex((lesson) => lesson.order === recit.afterLesson);
  if (milestone < 0) fail(`${recit.id}: leçon ${recit.afterLesson} introuvable`);
  if (!recit.chapters?.length) fail(`${recit.id}: aucun paragraphe`);
  for (const [i, chapter] of (recit.chapters || []).entries()) {
    if (!chapter.es || !chapter.fr) fail(`${recit.id}: paragraphe ${i + 1} sans texte ou traduction`);
    if (chapter.es.length < 40) fail(`${recit.id}: paragraphe ${i + 1} trop court`);
  }
  if (!recit.quiz?.length) fail(`${recit.id}: aucun exercice`);
  for (const ex of recit.quiz || []) {
    if (!ex.prompt || !ex.answer) fail(`${recit.id}: exercice incomplet`);
    if (ex.type === "choice" && (!Array.isArray(ex.options) || !ex.options.includes(ex.answer))) {
      fail(`${recit.id}: la réponse n'est pas dans les options (${ex.prompt})`);
    }
  }
  // Vocabulaire : le récit ne doit pas introduire de mots nouveaux.
  let tokens = 0;
  let known = 0;
  for (const chapter of recit.chapters || []) {
    for (const token of tokenize(chapter.es)) {
      if (!token.word || /^[A-ZÁÉÍÓÚÑ]/.test(token.text)) continue;
      tokens++;
      const hit = resolveToken(token.text);
      if (hit && milestone >= 0 && knownByMilestone[milestone]?.has(hit.id)) known++;
    }
  }
  const ratio = tokens ? known / tokens : 0;
  if (ratio < 0.78) fail(`${recit.id}: seulement ${Math.round(ratio * 100)} % de mots déjà vus`);
  else ok(`${recit.id}: ${recit.chapters.length} paragraphes, ${Math.round(ratio * 100)} % de mots déjà vus, ${recit.quiz.length} exercices`);
}

// --- Grammaire --------------------------------------------------------------
console.log("\nLeçons de grammaire");
const grammarIssues = validateGrammar();
for (const issue of grammarIssues) fail(issue);
for (const g of GRAMMAR) {
  if (!CURRICULUM.some((l) => l.order === g.afterLesson)) fail(`${g.id}: leçon d'accroche ${g.afterLesson} introuvable`);
  if (!g.tables?.length && !g.watch?.length) fail(`${g.id}: ni tableau ni point de vigilance`);
}
if (!grammarIssues.length) {
  const byLevel = ["A1", "A2", "B1"].map((lvl) => `${lvl} ${GRAMMAR.filter((g) => g.level === lvl).length}`).join(" · ");
  ok(`${GRAMMAR.length} points de grammaire valides (${byLevel}), ${GRAMMAR.reduce((n, g) => n + g.exercises.length, 0)} exercices.`);
}

// --- Tests de niveau --------------------------------------------------------
console.log("\nTests de niveau");
const testIssues = [];
for (const test of TESTS) {
  const built = buildTest(test.id);
  if (!built) {
    testIssues.push(`${test.id}: test introuvable`);
    continue;
  }
  if (built.total < 10) testIssues.push(`${test.id}: ${built.total} questions seulement`);
  if (built.required < 1 || built.required > built.total) testIssues.push(`${test.id}: seuil incohérent`);
  for (const [i, q] of built.questions.entries()) {
    if (!q.prompt || !q.answer) testIssues.push(`${test.id} q${i + 1}: énoncé ou réponse manquant`);
    if (q.type === "choice") {
      const options = q.options || [];
      if (options.length < 3) testIssues.push(`${test.id} q${i + 1}: moins de 3 options`);
      if (!options.includes(q.answer)) testIssues.push(`${test.id} q${i + 1}: réponse absente des options`);
      if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) testIssues.push(`${test.id} q${i + 1}: options en double`);
    }
    if (q.lessonId && !GRAMMAR.some((g) => g.id === q.lessonId)) testIssues.push(`${test.id} q${i + 1}: leçon de grammaire inconnue`);
  }
}
for (const issue of testIssues) fail(issue);
if (!testIssues.length) {
  ok("6 tests de niveau valides (12 questions chacun, 10 pour valider) : A1/A2/B1 × grammaire/vocabulaire.");
}

// --- Compréhensions orales ---------------------------------------------------
console.log("\nCompréhensions orales");
const listeningIssues = validateListening();
for (const issue of listeningIssues) fail(issue);
let mediaBytes = 0;
for (const item of LISTENINGS) {
  for (const [kind, rel] of [["vidéo", item.video], ["vignette", item.poster]]) {
    const file = join(process.cwd(), "public", rel);
    if (!existsSync(file)) {
      fail(`${item.id}: ${kind} absente (${rel})`);
      continue;
    }
    const size = statSync(file).size;
    mediaBytes += size;
    if (kind === "vidéo" && size > 3_000_000) fail(`${item.id}: vidéo trop lourde (${Math.round(size / 1024)} Ko)`);
  }
}
if (!listeningIssues.length) {
  const minutes = LISTENINGS.reduce((n, item) => n + item.seconds, 0) / 60;
  ok(`${LISTENINGS.length} écoutes valides (${Math.round(minutes)} min), médias locaux ${(mediaBytes / 1024 / 1024).toFixed(1)} Mo.`);
}

// --- Couverture -------------------------------------------------------------
console.log("\nCouverture du lexique cible");
const introduced = new Set(INTRODUCED_WORDS);
const allIntroduced = new Set([...introduced, ...specialWordIds, ...envWordIds]);
const remaining = LEXICON.filter((w) => !allIntroduced.has(w.id));
const byTheme = {};
for (const w of remaining) byTheme[w.theme] = (byTheme[w.theme] || 0) + 1;
console.log(`  ${allIntroduced.size} / ${LEXICON.length} mots intégrés (${Math.round((allIntroduced.size / LEXICON.length) * 100)} %)`);
console.log(`  parcours principal : ${introduced.size} · thèmes : ${specialWordIds.size} · environnements : ${envWordIds.size}`);
console.log(
  "  restants par thème : " +
    Object.entries(byTheme)
      .map(([t, n]) => `${t} ${n}`)
      .join(" · "),
);
if (allIntroduced.size < 250) fail("Couverture trop faible : moins de 250 mots réellement intégrés.");

console.log(errors ? `\n${errors} erreur(s) de contenu.` : "\n✓ Contenu valide.");
process.exitCode = errors ? 1 : 0;
