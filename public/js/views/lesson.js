import { lessonById, nextLesson, wordsKnownBefore } from "../core/curriculum.js";
import { store, actions } from "../core/store.js";
import { overallStats } from "../core/stats.js";
import { dedupeWords } from "../core/memory.js";
import { LEXICON_BY_ID } from "../data/lexicon.js";
import { renderDialogue, bindDialogue } from "../components/dialogue.js";
import { mountMemory } from "../components/memory-board.js";
import { $, bar, bindSpeakButtons, esc, icon, toast } from "../ui.js";

function balancedRounds(words) {
  const unique = dedupeWords(words);
  if (unique.length <= 8) return [unique];
  const count = 2;
  const size = Math.ceil(unique.length / count);
  const out = [];
  for (let i = 0; i < unique.length; i += size) out.push(unique.slice(i, i + size));
  return out;
}

function genderLabel(word) {
  if (word.pos === "n") return word.gender === "f" ? "nom féminin" : "nom masculin";
  const labels = { v: "verbe", adj: "adjectif", adv: "adverbe", pron: "pronom", prep: "préposition", conj: "conjonction", det: "déterminant", num: "nombre", interj: "interjection", expr: "expression" };
  return labels[word.pos] || "mot";
}

export function renderLesson(root, id) {
  const lesson = lessonById(id);
  if (!lesson) {
    root.innerHTML = `<div class="empty"><div class="e-icon">📖</div><h3>Leçon introuvable</h3>
      <p>Cette leçon n'existe pas ou a été renommée.</p><a class="btn btn--primary" href="#/lecons">Revenir au parcours</a></div>`;
    return;
  }

  const words = lesson.newWords.map((wid) => LEXICON_BY_ID[wid]).filter(Boolean);
  const known = wordsKnownBefore(lesson.id);
  const next = nextLesson(lesson.id);
  const progressAtStart = store.get();
  const alreadyDone = progressAtStart.lessons[lesson.id]?.status === "done";

  actions.startLesson(lesson.id);
  for (const word of words) actions.seeWord(word.id);

  let step = "read";
  let showTranslation = Boolean(progressAtStart.settings.showTranslationByDefault);
  let rounds = balancedRounds(words);
  let roundIndex = 0;
  let coups = 0;
  let memory = null;
  let closed = false;
  let result = null;

  const abort = new AbortController();
  window.addEventListener(
    "hashchange",
    () => {
      closed = true;
      memory?.destroy?.();
      abort.abort();
    },
    { once: true, signal: abort.signal },
  );

  const body = () => $("#lesson-body", root);

  const stepper = () => `<div class="stepper" aria-label="Étapes de la leçon">
    ${[
      ["read", "Lecture"],
      ["words", "Vocabulaire"],
      ["memory", "Memory"],
      ["done", "Réussi"],
    ]
      .map(([key, label], index) => {
        const order = ["read", "words", "memory", "done"];
        const state = order.indexOf(step) > index ? "is-done" : order.indexOf(step) === index ? "is-active" : "";
        return `<span class="step ${state}" ${state === "is-active" ? 'aria-current="step"' : ""}>
          <span class="step-num">${state === "is-done" ? icon("check") : index + 1}</span>${label}</span>
          ${index < 3 ? '<span class="step-sep" aria-hidden="true"></span>' : ""}`;
      })
      .join("")}
  </div>`;

  const newWordChips = () =>
    `<div class="word-chips">${words
      .map(
        (w) => `<button type="button" class="word-chip" data-speak="${esc(w.es)}" aria-label="Écouter ${esc(w.es)}, ${esc(w.fr)}">
          ${esc(w.es)} <small>${esc(w.fr)}</small>${icon("sound")}</button>`,
      )
      .join("")}</div>`;

  function renderRead() {
    body().innerHTML = `${stepper()}
      <div class="card reading-card">
        <div class="reading-head">
          <div>
            <h2>Le dialogue</h2>
            <span class="tiny muted" data-new-count>${lesson.lines.filter((l) => l.who).length} répliques · ${words.length} mots à retenir en violet</span>
          </div>
          <div class="row row--tight">
            <button class="btn btn--ghost btn--sm" type="button" data-toggle-all aria-pressed="${showTranslation}">
              ${icon("eye")} ${showTranslation ? "Masquer" : "Afficher"} les traductions
            </button>
          </div>
        </div>
        ${renderDialogue(lesson.lines, { lesson, knownWords: known, showTranslation })}
        <div class="new-words">
          <h3>Les mots de cette leçon</h3>
          ${newWordChips()}
        </div>
        <div class="reading-actions">
          <a class="btn btn--ghost btn--sm" href="#/lecons">${icon("arrowLeft")} Le parcours</a>
          <div class="row row--tight">
            ${lesson.note ? `<span class="tiny muted" style="max-width:300px">${esc(lesson.note)}</span>` : ""}
            <button class="btn btn--primary" type="button" data-next="words">J'ai lu ${icon("arrowRight")}</button>
          </div>
        </div>
      </div>`;
    bindDialogue(body(), { onSeen: (wid) => actions.seeWord(wid) });
    bindSpeakButtons(body());

    // Tout mot jamais lu est violet : il compte comme découvert dès la lecture.
    const newIds = [...new Set([...body().querySelectorAll(".word--new[data-word-id]")].map((n) => n.dataset.wordId).filter(Boolean))];
    if (newIds.length) actions.seeWords(newIds);
    const counter = body().querySelector("[data-new-count]");
    if (counter) {
      counter.textContent = `${lesson.lines.filter((l) => l.who).length} répliques · ${newIds.length} mots inédits en violet`;
    }
    $("[data-toggle-all]", body())?.addEventListener("click", (event) => {
      showTranslation = !showTranslation;
      const btn = event.currentTarget;
      btn.setAttribute("aria-pressed", String(showTranslation));
      btn.innerHTML = `${icon("eye")} ${showTranslation ? "Masquer" : "Afficher"} les traductions`;
      for (const block of root.querySelectorAll("[data-fr-block]")) block.toggleAttribute("hidden", !showTranslation);
      for (const t of root.querySelectorAll("[data-toggle-fr]")) t.setAttribute("aria-pressed", String(showTranslation));
    });
  }

  function renderWords() {
    const progressNow = store.get();
    body().innerHTML = `${stepper()}
      <div class="row row--between" style="margin-bottom:12px">
        <div>
          <h2 class="h2">Les ${words.length} mots à retenir</h2>
          <p class="small muted">Touche un mot pour l'entendre. Tu les retrouveras dans le Memory juste après.</p>
        </div>
        <span class="badge badge--violet">${words.filter((w) => (progressNow.words[w.id]?.correct || 0) >= 3).length} déjà maîtrisés</span>
      </div>
      <div class="word-grid">
        ${words
          .map((w) => {
            const st = store.get().words[w.id];
            return `<article class="word-card">
              <span class="badge pos">${esc(genderLabel(w))}</span>
              <div class="row row--between" style="gap:8px">
                <span class="es" lang="es">${esc(w.es)}</span>
                <button class="mini-btn" type="button" data-speak="${esc(w.es)}" aria-label="Écouter ${esc(w.es)}">${icon("sound")}</button>
              </div>
              <span class="fr">${esc(w.fr)}</span>
              ${w.ex ? `<span class="ex"><em lang="es">${esc(w.ex)}</em><br />${esc(w.exFr)}</span>` : ""}
              <span class="tiny muted">${st?.correct ? `${Math.min(3, st.correct)}/3 réussites` : "Nouveau mot"}</span>
            </article>`;
          })
          .join("")}
      </div>
      <div class="row row--between" style="margin-top:18px">
        <button class="btn btn--ghost" type="button" data-back="read">${icon("arrowLeft")} Relire</button>
        <button class="btn btn--primary" type="button" data-next="memory">Lancer le Memory ${icon("arrowRight")}</button>
      </div>`;
    bindSpeakButtons(body());
  }

  function renderMemory() {
    const round = rounds[roundIndex];
    const totalRounds = rounds.length;
    const pairsLabel = round.length;
    body().innerHTML = `${stepper()}
      <div class="row row--between" style="margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div>
          <h2 class="h2">Memory ${totalRounds > 1 ? `· manche ${roundIndex + 1} sur ${totalRounds}` : ""}</h2>
          <p class="small muted">${pairsLabel} paires · retrouve les associations mot ↔ traduction.</p>
        </div>
        <span class="chip chip--violet">${icon("target")} Objectif : toutes les paires</span>
      </div>
      <div class="card card--pad-lg" id="memory-board"></div>`;

    memory?.destroy?.();
    memory = mountMemory($("#memory-board", body()), round, {
      onMatch: (wordId) => {
        actions.markCorrect([wordId]);
      },
      onMistake: (ids) => {
        actions.markMistake(ids);
      },
      onComplete: ({ coups: roundCoups }) => {
        if (closed) return;
        coups += roundCoups;
        if (roundIndex < rounds.length - 1) {
          roundIndex++;
          toast("Manche terminée — on continue !");
          setTimeout(() => !closed && renderMemory(), 450);
        } else {
          finish();
        }
      },
    });

    const board = $("#memory-board", body());
    board?.addEventListener("memory:restart", () => {
      memory?.destroy?.();
      renderMemory();
    });
  }

  function renderDone() {
    const stats = overallStats(store.get());
    const mastery = result?.mastered ?? 0;
    const nextAvailable = next || null;
    const colors = ["#6d4dff", "#f0b429", "#2fa98c", "#e98a4e", "#d94f72"];
    body().innerHTML = `${stepper()}
      <div class="card success">
        <div class="confetti" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<span style="left:${(i * 6.3) % 100}%;background:${colors[i % colors.length]};animation-delay:${(i % 6) * 0.12}s;opacity:.85"></span>`).join("")}</div>
        <div class="check-badge">${icon("check")}</div>
        <div>
          <span class="eyebrow" style="justify-content:center">Leçon ${String(lesson.order).padStart(2, "0")} terminée</span>
          <h2>${alreadyDone ? "Encore une réussite !" : "Leçon validée !"}</h2>
          <p class="muted" style="margin-top:6px">${esc(lesson.title)} — ${esc(lesson.subtitle)}</p>
        </div>
        <div class="success-stats">
          <span class="chip chip--violet">${icon("sparkles")} ${words.length} nouveaux mots</span>
          <span class="chip">${icon("target")} ${result?.coups ?? coups} coups</span>
          <span class="chip">${icon("check")} ${mastery} maîtrises en plus</span>
        </div>
        <div style="width:100%;max-width:420px;display:grid;gap:8px">
          <div class="row row--between"><span class="small muted">Progression du parcours</span><strong>${stats.lessonsDone}/${stats.totals.lessons}</strong></div>
          ${bar(stats.lessonsPercent, "", "Progression du parcours")}
          <span class="tiny muted">${stats.discovered} mots découverts · ${stats.mastered} maîtrisés sur 1000</span>
        </div>
        <div class="success-actions">
          ${nextAvailable && nextAvailable.id !== lesson.id ? `<a class="btn btn--primary" href="#/lecons/${esc(nextAvailable.id)}">Leçon suivante ${icon("arrowRight")}</a>` : `<a class="btn btn--primary" href="#/lecons">Retour au parcours ${icon("arrowRight")}</a>`}
          <button class="btn" type="button" data-back="read">${icon("book")} Relire</button>
          <a class="btn btn--ghost" href="#/vocabulaire">Mon vocabulaire</a>
        </div>
      </div>`;
  }

  function finish() {
    if (closed) return;
    const before = store.get();
    const beforeMastered = Object.values(before.words).filter((w) => w.correct >= 3).length;
    actions.completeLesson(lesson.id, { coups, words: words.map((w) => w.id) });
    const after = store.get();
    const afterMastered = Object.values(after.words).filter((w) => w.correct >= 3).length;
    result = { coups, mastered: Math.max(0, afterMastered - beforeMastered) };
    step = "done";
    renderDone();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function show(nextStep) {
    if (closed) return;
    step = nextStep;
    if (nextStep !== "memory") memory?.destroy?.();
    if (nextStep === "read") renderRead();
    else if (nextStep === "words") renderWords();
    else if (nextStep === "memory") renderMemory();
    else renderDone();
  }

  root.innerHTML = `<div class="breadcrumb"><a href="#/lecons">Leçons</a><span class="sep">/</span><span>Leçon ${String(lesson.order).padStart(2, "0")}</span></div>
    <div class="lesson-top">
      <span class="badge badge--violet">${esc(lesson.level)}</span>
      <span class="badge">${icon("clock")} 5 min</span>
      ${alreadyDone ? `<span class="badge badge--mint">${icon("check")} Déjà validée</span>` : ""}
      <span class="spacer"></span>
      <a class="btn btn--ghost btn--sm" href="#/lecons">Toutes les leçons</a>
    </div>
    <header class="lesson-title-block">
      <span class="eyebrow">Leçon ${String(lesson.order).padStart(2, "0")}</span>
      <h1 class="h1">${esc(lesson.title)}</h1>
      <p class="lead">${esc(lesson.subtitle)}</p>
      <p class="place">${icon("map")} ${esc(lesson.place)}</p>
    </header>
    <div id="lesson-body"></div>`;

  root.addEventListener(
    "click",
    (event) => {
      const nextBtn = event.target.closest("[data-next]");
      if (nextBtn) return show(nextBtn.dataset.next);
      const backBtn = event.target.closest("[data-back]");
      if (backBtn) return show(backBtn.dataset.back);
    },
    { signal: abort.signal },
  );

  show("read");
}
