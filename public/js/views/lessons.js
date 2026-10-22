import { store } from "../core/store.js";
import { CURRICULUM, INTRODUCED_WORDS } from "../core/curriculum.js";
import { RECIT_AFTER } from "../data/recits.js";
import { GRAMMAR, GRAMMAR_AFTER } from "../core/grammar.js";
import { LISTENINGS, LISTENING_AFTER, formatDuration } from "../core/listening.js";
import { overallStats } from "../core/stats.js";
import { $, esc, icon, bar } from "../ui.js";

export function renderLessons(root) {
  const progress = store.get();
  const stats = overallStats(progress);
  const firstPending = CURRICULUM.find((l) => progress.lessons[l.id]?.status !== "done");

  const lessonRow = (lesson) => {
    const state = progress.lessons[lesson.id];
    const status = state?.status === "done" ? "done" : state?.status === "inProgress" ? "inProgress" : "new";
    const words = lesson.newWords.length;
    const recommended = firstPending?.id === lesson.id;
    return `<a class="lesson-row is-${status}" href="#/lecons/${esc(lesson.id)}" data-status="${status}" ${recommended ? 'aria-label="Leçon recommandée : ' + esc(lesson.title) + '"' : ""}>
      <span class="lesson-num">${String(lesson.order).padStart(2, "0")}</span>
      <span class="lesson-info">
        <strong>${esc(lesson.title)} ${recommended ? `<span class="badge badge--violet" style="margin-left:6px">Conseillée</span>` : ""}</strong>
        <span>${esc(lesson.subtitle)}</span>
      </span>
      <span class="lesson-meta">
        <span class="chip">${esc(lesson.level)} · ${words} mots</span>
        ${status === "done"
          ? `<span class="badge badge--mint">${icon("check")} Validée</span>`
          : status === "inProgress"
            ? `<span class="badge badge--violet">En cours</span>`
            : `<span class="badge">À découvrir</span>`}
        ${state?.bestCoups ? `<span class="tiny muted">${state.bestCoups} coups</span>` : ""}
        <span class="muted" aria-hidden="true">${icon("chevron")}</span>
      </span>
    </a>`;
  };

  // Un récit de révision clôt chaque dizaine de leçons.
  const recitRow = (recit) => {
    const done = progress.stories?.[recit.id]?.done;
    const from = recit.afterLesson - 9;
    return `<a class="recit-row is-${done ? "done" : "new"}" href="#/recits/${esc(recit.id)}" data-step-status="${done ? "done" : "new"}">
      <span class="recit-num" aria-hidden="true">${icon("book")}</span>
      <span class="lesson-info">
        <strong>${esc(recit.title)} <span class="badge badge--violet">Récit de révision</span></strong>
        <span>Leçons ${from} à ${recit.afterLesson} dans une seule histoire — à lire à voix haute, puis quiz.</span>
      </span>
      <span class="lesson-meta">
        <span class="chip">${recit.chapters.length} paragraphes</span>
        ${done ? `<span class="badge badge--mint">${icon("check")} Lu</span>` : `<span class="badge">À lire</span>`}
        <span class="muted" aria-hidden="true">${icon("chevron")}</span>
      </span>
    </a>`;
  };

  // Point de grammaire conseillé : discret, inséré après la leçon qui l'illustre.
  const grammarRow = (g) => {
    const done = progress.grammar?.[g.id]?.done;
    return `<a class="grammar-row is-${done ? "done" : "new"}" data-grammar href="#/grammaire/${esc(g.id)}">
      <span class="grammar-row-icon" aria-hidden="true">${icon("layers")}</span>
      <span class="lesson-info">
        <strong>Point de grammaire · ${esc(g.title)} <span class="badge badge--violet">${esc(g.level)}</span></strong>
        <span>${esc(g.subtitle)} — à voir maintenant que tu as lu la leçon ${g.afterLesson}.</span>
      </span>
      <span class="lesson-meta">
        <span class="chip">${g.exercises.length} exercices</span>
        ${done ? `<span class="badge badge--mint">${icon("check")} Validée</span>` : `<span class="badge">Conseillée</span>`}
        <span class="muted" aria-hidden="true">${icon("chevron")}</span>
      </span>
    </a>`;
  };

  // Écoute authentique conseillée : une voix réelle, courte, après la leçon qui la prépare.
  const listeningRow = (item) => {
    const done = progress.listenings?.[item.id]?.done;
    return `<a class="listen-row is-${done ? "done" : "new"}" data-listening href="#/ecoute/${esc(item.id)}">
      <span class="listen-row-icon" aria-hidden="true">${icon("mic")}</span>
      <span class="lesson-info">
        <strong>Écoute · ${esc(item.title)} <span class="badge badge--violet">${esc(item.level)}</span></strong>
        <span>${esc(item.subtitle)} — ${esc(item.speaker)}, ${esc(item.origin)}. Après la leçon ${item.afterLesson}.</span>
      </span>
      <span class="lesson-meta">
        <span class="chip">${formatDuration(item.seconds)}</span>
        ${done ? `<span class="badge badge--mint">${icon("check")} Validée</span>` : `<span class="badge">Conseillée</span>`}
        <span class="muted" aria-hidden="true">${icon("chevron")}</span>
      </span>
    </a>`;
  };

  const rows = CURRICULUM.map((lesson) => {
    const recit = RECIT_AFTER[lesson.order];
    const grammar = GRAMMAR_AFTER[lesson.order];
    const listening = LISTENING_AFTER[lesson.order];
    return (
      lessonRow(lesson) +
      (recit ? recitRow(recit) : "") +
      (grammar ? grammarRow(grammar) : "") +
      (listening ? listeningRow(listening) : "")
    );
  }).join("");

  root.innerHTML = `<div class="page-head">
    <div class="page-head-text">
      <span class="eyebrow">Parcours principal</span>
      <h1 class="h1">Les 1 000 mots,<br />une histoire à la fois</h1>
      <p class="lead">Chaque leçon est un dialogue original de 8 à 12 nouveaux mots. Tu lis, tu explores le vocabulaire, puis tu valides avec un Memory.</p>
    </div>
    <div class="stack" style="min-width:220px;flex:1;max-width:280px">
      <div class="row row--between"><span class="small muted">Progression du parcours</span><strong>${stats.lessonsDone}/${stats.totals.lessons}</strong></div>
      ${bar(stats.lessonsPercent, "", "Leçons validées")}
      <span class="tiny muted">${INTRODUCED_WORDS.length} mots cibles déjà présents dans ces leçons</span>
      <div class="row" style="gap:6px;flex-wrap:wrap">
        <a class="btn btn--soft btn--sm" href="#/grammaire">${icon("layers")} ${GRAMMAR.length} points de grammaire</a>
        <a class="btn btn--soft btn--sm" href="#/ecoute">${icon("mic")} ${LISTENINGS.length} écoutes</a>
      </div>
    </div>
  </div>

  <div class="filters-bar" role="group" aria-label="Filtrer les leçons">
    <div class="segmented" id="lesson-filter">
      <button type="button" data-filter="all" aria-pressed="true">Toutes</button>
      <button type="button" data-filter="todo" aria-pressed="false">À découvrir</button>
      <button type="button" data-filter="done" aria-pressed="false">Validées</button>
    </div>
    <span class="small muted" id="lesson-count"></span>
    <span class="spacer"></span>
    <span class="tiny muted">${icon("lock")} Aucune leçon n'est verrouillée.</span>
  </div>

  <div class="path" id="lesson-path">${rows}</div>
  <div class="empty" id="lesson-empty" hidden>
    <div class="e-icon">🌱</div>
    <h3>Aucune leçon dans ce filtre</h3>
    <p>Change de filtre pour retrouver les autres étapes du parcours.</p>
  </div>

  <div class="card card--tinted level-projection" style="margin-top:22px">
    <span class="eyebrow">Objectif de fin de parcours</span>
    <h3 class="h3">Un niveau A2 solide</h3>
    <p class="small muted">Avec les ${stats.totals.lessons} leçons et les thèmes, tu manipules le présent, le passé composé et l'imparfait, tu racontes, tu argumentes simplement, tu te débrouilles au médecin, au marché, au travail et en voyage. Le subjonctif n'est encore qu'aperçu. Ce n'est pas un B1 : il faudrait plus de temps du passé combinés, de discours rapporté et surtout d'écoute de locuteurs réels.</p>
    <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap">
      <span class="chip">${INTRODUCED_WORDS.length} mots ciblés</span>
      <span class="chip">${stats.totals.lessons} dialogues</span>
      <span class="chip">${stats.totals.recits} récits de révision</span>
      <span class="chip">${GRAMMAR.length} points de grammaire</span>
      <span class="chip">${LISTENINGS.length} écoutes authentiques</span>
      <span class="chip">100 expressions</span>
      <span class="chip">${stats.totals.levels} scènes interactives</span>
    </div>
  </div>`;

  const path = $("#lesson-path", root);
  const count = $("#lesson-count", root);
  const empty = $("#lesson-empty", root);

  function applyFilter(filter) {
    let visible = 0;
    for (const row of path.querySelectorAll("[data-status]")) {
      const status = row.dataset.status;
      const show = filter === "all" || (filter === "done" ? status === "done" : status !== "done");
      row.hidden = !show;
      if (show) visible++;
    }
    for (const row of path.querySelectorAll("[data-grammar]")) row.hidden = filter !== "all";
    for (const row of path.querySelectorAll("[data-listening]")) row.hidden = filter !== "all";
    count.textContent = `${visible} leçon${visible > 1 ? "s" : ""} affichée${visible > 1 ? "s" : ""}`;
    empty.hidden = visible > 0;
  }

  $("#lesson-filter")?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-filter]");
    if (!btn) return;
    for (const b of root.querySelectorAll("[data-filter]")) b.setAttribute("aria-pressed", String(b === btn));
    applyFilter(btn.dataset.filter);
  });

  applyFilter("all");
}
