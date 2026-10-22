import { store } from "../core/store.js";
import { SPECIALS } from "../data/specials.js";
import { overallStats } from "../core/stats.js";
import { esc, icon } from "../ui.js";

export function renderSpecials(root) {
  const progress = store.get();
  const stats = overallStats(progress);
  const essentials = SPECIALS.filter((s) => s.kind !== "expressions");
  const expressions = SPECIALS.filter((s) => s.kind === "expressions");
  const exprDone = expressions.filter((s) => progress.specials[s.id]?.done).length;

  const card = (s) => {
    const done = Boolean(progress.specials[s.id]?.done);
    const itemCount = s.sections.reduce((n, section) => n + section.items.length, 0);
    return `<a class="special-card ${done ? "is-done" : ""}" href="#/themes/${esc(s.id)}">
      <span class="s-icon" style="background:${s.color}1a;color:${s.color}">${s.icon}</span>
      <div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.subtitle)}</p>
      </div>
      <div class="s-foot">
        <span class="chip">${itemCount} éléments</span>
        <span class="chip">${s.exercises.length} exercices</span>
        ${done ? `<span class="badge badge--mint" style="margin-left:auto">${icon("check")} Validée</span>` : `<span class="badge badge--violet" style="margin-left:auto">À découvrir</span>`}
      </div>
    </a>`;
  };

  root.innerHTML = `<div class="page-head">
    <div class="page-head-text">
      <span class="eyebrow">Parcours thématique</span>
      <h1 class="h1">Les essentiels,<br />et 100 façons de parler</h1>
      <p class="lead">Couleurs, jours, nombres et opérations pour construire des bases solides. Puis 100 expressions réelles, classées par situation, pour tenir une conversation dès aujourd'hui.</p>
    </div>
    <div class="stack" style="min-width:200px">
      <div class="row row--between"><span class="small muted">Thèmes validés</span><strong>${stats.specialsDone}/${SPECIALS.length}</strong></div>
      <div class="bar"><div class="bar-fill bar-fill--sun" style="width:${Math.round((stats.specialsDone / SPECIALS.length) * 100)}%"></div></div>
      <span class="tiny muted">${exprDone}/10 leçons d'expressions terminées</span>
    </div>
  </div>

  <div class="section-title"><h2>Les essentiels</h2><span class="tiny muted">${essentials.length} thèmes interactifs</span></div>
  <div class="special-grid">${essentials.map(card).join("")}</div>

  <div class="section-title" style="margin-top:40px">
    <h2>Les 100 expressions</h2>
    <span class="badge badge--violet">${exprDone} / 10 leçons</span>
  </div>
  <p class="lead" style="margin-bottom:16px;font-size:15px">Dix leçons de dix expressions, des salutations à la conversation au restaurant. Chaque leçon se termine par trois exercices.</p>
  <div class="special-grid">${expressions.map(card).join("")}</div>

  <div class="section-title" style="margin-top:40px"><h2>Apprendre par l'image</h2><a href="#/explorer">Tous les environnements ${icon("arrowRight")}</a></div>
  <a class="quick-card" href="#/explorer/apartamento" style="padding:22px">
    <span class="quick-icon quick-icon--mint" style="width:52px;height:52px">${icon("compass")}</span>
    <span><strong>L'appartement interactif</strong><span>Six pièces, neuf niveaux, des objets à toucher et des dialogues à débloquer.</span></span>
    <span class="arrow">${icon("chevron")}</span>
  </a>

  <p class="tiny muted" style="margin-top:28px">Les mots de ces leçons qui appartiennent aux 1 000 mots cibles partagent la progression du parcours principal : un mot déjà maîtrisé le reste, quel que soit l'endroit où il réapparaît.</p>`;
}
