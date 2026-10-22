import { RECITS, RECITS_BY_ID } from "../data/recits.js";
import { CURRICULUM, INTRODUCED_WORDS, LESSON_TEXT_WORDS } from "../core/curriculum.js";
import { store, actions } from "../core/store.js";
import { annotate, resolveToken, tokenize } from "../core/lemma.js";
import { LEXICON_BY_ID } from "../data/lexicon.js";
import { mountQuiz } from "../components/quiz.js";
import { $, bindSpeakButtons, enableWordTips, esc, icon, plural } from "../ui.js";

const KNOWN = new Set(INTRODUCED_WORDS);

/** Part du texte déjà rencontrée dans les leçons qui précèdent le récit. */
function coverage(recit) {
  const milestone = CURRICULUM.findIndex((l) => l.order === recit.afterLesson);
  const known = new Set();
  for (const lesson of CURRICULUM.slice(0, milestone + 1)) {
    for (const id of lesson.newWords) known.add(id);
    for (const id of LESSON_TEXT_WORDS.get(lesson.id) || []) known.add(id);
  }
  let total = 0;
  let seen = 0;
  for (const chapter of recit.chapters) {
    for (const token of tokenize(chapter.es)) {
      if (!token.word || /^[A-ZÁÉÍÓÚÑ]/.test(token.text)) continue;
      total += 1;
      const hit = resolveToken(token.text);
      if (hit && known.has(hit.id)) seen += 1;
    }
  }
  return total ? Math.round((seen / total) * 100) : 0;
}

function renderText(text) {
  const tokens = annotate(text, { newWords: [], knownWords: KNOWN, lexiconById: LEXICON_BY_ID });
  return tokens
    .map((token) => {
      if (!token.word) return esc(token.text);
      if (!token.fr) return `<span class="word word--plain">${esc(token.text)}</span>`;
      return `<button type="button" class="word" data-tip data-word-id="${esc(token.wordId || "")}"
        data-es="${esc(token.es || token.text)}" data-fr="${esc(token.fr)}"
        aria-label="${esc(token.es || token.text)}, ${esc(token.fr)}">${esc(token.text)}</button>`;
    })
    .join("");
}

function fullText(recit) {
  return recit.chapters.map((c) => c.es).join(" ");
}

export function renderRecit(root, id) {
  const recit = RECITS_BY_ID[id];
  if (!recit) {
    root.innerHTML = `<div class="empty"><div class="e-icon">📖</div><h3>Ce récit n'existe pas</h3>
      <p>Il a peut-être changé de nom. Retrouve les récits depuis le parcours.</p>
      <a class="btn btn--primary" href="#/lecons">Revenir au parcours</a></div>`;
    return;
  }

  const progress = store.get();
  const state = progress.stories?.[recit.id];
  const nextRecit = RECITS.find((r) => r.afterLesson > recit.afterLesson) || null;
  const nextLesson = CURRICULUM.find((l) => l.order === recit.afterLesson + 1) || null;
  const ready = CURRICULUM.filter((l) => l.order <= recit.afterLesson).every((l) => progress.lessons[l.id]?.status === "done");
  let readAloud = Boolean(state?.readAloud);
  let quiz = null;
  let closed = false;

  const abort = new AbortController();
  window.addEventListener(
    "hashchange",
    () => {
      closed = true;
      quiz?.destroy?.();
      abort.abort();
    },
    { once: true, signal: abort.signal },
  );

  root.innerHTML = `<div class="breadcrumb"><a href="#/lecons">Leçons</a><span class="sep">/</span><span>Récit de révision</span></div>

    <div class="env-hero story-hero" style="margin-bottom:22px">
      <div class="row" style="gap:16px;align-items:flex-start">
        <span class="env-icon" style="background:var(--primary-soft);color:var(--primary)">${icon("book")}</span>
        <div style="min-width:0">
          <span class="eyebrow">Après la leçon ${recit.afterLesson} · révision</span>
          <h1 class="h1">${esc(recit.title)}</h1>
          <p class="lead" style="margin-top:6px">${esc(recit.subtitle)}</p>
        </div>
      </div>
      <div class="stack story-meta">
        <span class="badge ${state?.done ? "badge--mint" : ""}">${state?.done ? `${icon("check")} Déjà lu` : `${icon("book")} À lire`}</span>
        <span class="tiny muted">${recit.chapters.length} paragraphes · ~${recit.minutes} min</span>
        <span class="tiny muted">${coverage(recit)} % de mots déjà rencontrés</span>
      </div>
    </div>

    ${ready ? "" : `<div class="note-box" style="margin-bottom:16px">${icon("info", "info-ico")}
      <span>Ce récit est conseillé après la leçon ${recit.afterLesson} : tu peux le lire maintenant, mais certains mots seront nouveaux.</span></div>`}

    <div class="card card--pad-lg story">
      <div class="row row--between story-top">
        <div>
          <span class="eyebrow">${esc(recit.place)}</span>
          <p class="small muted" style="margin-top:4px">L'essentiel du vocabulaire vient des leçons précédentes : c'est une révision, pas une leçon.</p>
        </div>
        <div class="row row--tight">
          <button class="btn btn--soft btn--sm" type="button" data-speak="${esc(fullText(recit))}" data-rate="0.95" aria-label="Écouter le récit">${icon("sound")} Écouter</button>
          <button class="btn btn--ghost btn--sm" type="button" data-speak="${esc(fullText(recit))}" data-rate="0.7" aria-label="Écouter le récit lentement">Lent</button>
        </div>
      </div>

      <div class="read-aloud">
        <span class="read-aloud-icon" aria-hidden="true">${icon("sound")}</span>
        <div>
          <strong>Lis à voix haute</strong>
          <p>Une phrase après l'autre, sans chercher la perfection. Personne ne t'écoute. Si tu bloques, écoute en mode « Lent », puis relis la phrase entière.</p>
          <button class="btn btn--sm ${readAloud ? "btn--soft" : "btn--ghost"}" type="button" data-read-aloud aria-pressed="${readAloud}">
            ${readAloud ? `${icon("check")} Lu à voix haute` : "Je l'ai lu à voix haute"}
          </button>
        </div>
      </div>

      ${recit.chapters
        .map(
          (chapter, index) => `<article class="story-block">
            <p class="story-es" lang="es">${renderText(chapter.es)}</p>
            <div class="story-tools">
              <button class="mini-btn" type="button" data-speak="${esc(chapter.es)}" data-rate="0.95" aria-label="Écouter ce paragraphe">${icon("sound")}</button>
              <button class="mini-btn mini-btn--text" type="button" data-speak="${esc(chapter.es)}" data-rate="0.7" aria-label="Écouter ce paragraphe lentement">Lent</button>
              <button class="mini-btn mini-btn--text" type="button" data-toggle-fr="${index}" aria-pressed="false" aria-label="Afficher la traduction de ce paragraphe">${icon("eye")} Traduction</button>
            </div>
            <p class="story-fr" data-fr-block="${index}" hidden lang="fr">${esc(chapter.fr)}</p>
          </article>`,
        )
        .join("")}
    </div>

    <div class="section-title" style="margin-top:26px">
      <h2>${icon("target")} Vérifie ta lecture</h2>
      <span class="tiny muted">${recit.quiz.length} questions · réussir les ${recit.quiz.length} valide le récit</span>
    </div>
    <div class="card card--pad-lg" id="recit-quiz"></div>

    <div class="row row--between" style="margin-top:24px">
      <a class="btn btn--ghost" href="#/lecons">${icon("arrowLeft")} Retour au parcours</a>
      ${nextRecit ? `<a class="btn" href="#/recits/${esc(nextRecit.id)}">${esc(nextRecit.title)} ${icon("arrowRight")}</a>` : nextLesson ? `<a class="btn" href="#/lecons/${esc(nextLesson.id)}">Leçon ${nextLesson.order} ${icon("arrowRight")}</a>` : ""}
    </div>`;

  bindSpeakButtons(root);
  enableWordTips(root);
  $("[data-read-aloud]", root)?.addEventListener("click", (event) => {
    readAloud = !readAloud;
    const btn = event.currentTarget;
    btn.setAttribute("aria-pressed", String(readAloud));
    btn.classList.toggle("btn--soft", readAloud);
    btn.classList.toggle("btn--ghost", !readAloud);
    btn.innerHTML = readAloud ? `${icon("check")} Lu à voix haute` : "Je l'ai lu à voix haute";
  });

  for (const btn of root.querySelectorAll("[data-toggle-fr]")) {
    btn.addEventListener("click", () => {
      const index = btn.dataset.toggleFr;
      const block = root.querySelector(`[data-fr-block="${index}"]`);
      if (!block) return;
      const show = block.hasAttribute("hidden");
      block.toggleAttribute("hidden", !show);
      btn.setAttribute("aria-pressed", String(show));
    });
  }

  quiz = mountQuiz($("#recit-quiz", root), recit.quiz, {
    intro: "Réponds sans relire si possible : c'est le meilleur test de compréhension.",
    onComplete: ({ score, total }) => {
      if (closed) return;
      actions.completeStory(recit.id, { score, total, readAloud });
      const box = $("#recit-quiz", root);
      box.innerHTML = `<div class="success" style="padding:22px 8px">
        <div class="check-badge">${icon("trophy")}</div>
        <h2 style="font-size:27px">Récit terminé</h2>
        <p class="muted">${score}/${total} réponses justes du premier coup.</p>
        <div class="success-stats">
          <span class="chip chip--violet">${icon("book")} ${recit.afterLesson} leçons révisées</span>
          ${readAloud ? `<span class="chip chip--mint">${icon("sound")} Lu à voix haute</span>` : `<span class="chip">${icon("sound")} À relire à voix haute</span>`}
        </div>
        <div class="success-actions">
          ${nextLesson ? `<a class="btn btn--primary" href="#/lecons/${esc(nextLesson.id)}">Vers la leçon ${nextLesson.order} ${icon("arrowRight")}</a>` : ""}
          <button class="btn" type="button" data-redo>Refaire le quiz</button>
        </div>
      </div>`;
      box.querySelector("[data-redo]")?.addEventListener("click", () => renderRecit(root, id));
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  });
}
