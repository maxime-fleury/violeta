import { store } from "../core/store.js";
import { GRAMMAR, grammarDoneCount, nextGrammarFor } from "../core/grammar.js";
import { bar, esc, icon } from "../ui.js";

const LEVELS = [
  { level: "A1", name: "Découverte", hint: "Le socle : articles, présent, ser/estar, négation." },
  { level: "A2", name: "Autonomie", hint: "Raconter au passé, pronoms, impératif." },
  { level: "B1", name: "Seuil", hint: "Futur, subjonctif, connecteurs, discours." },
];

export function renderGrammar(root) {
  const progress = store.get();
  const done = grammarDoneCount(progress);
  const next = nextGrammarFor(progress);
  const percent = GRAMMAR.length ? Math.round((done / GRAMMAR.length) * 100) : 0;

  const card = (g) => {
    const state = progress.grammar?.[g.id];
    const isNext = next?.id === g.id;
    return `<a class="grammar-card ${state?.done ? "is-done" : ""} ${isNext ? "is-next" : ""}" href="#/grammaire/${esc(g.id)}" aria-label="${esc(g.title)}${state?.done ? " (validée)" : ""}">
      <span class="grammar-num">${String(g.order).padStart(2, "0")}</span>
      <span class="grammar-body">
        <span class="row" style="gap:8px;flex-wrap:wrap;align-items:center">
          <strong>${esc(g.title)}</strong>
          ${isNext ? `<span class="badge badge--violet">Conseillée</span>` : ""}
          ${state?.done ? `<span class="badge badge--mint">${icon("check")} Validée</span>` : ""}
        </span>
        <span class="small muted">${esc(g.subtitle)}</span>
        <span class="tiny muted">${esc(g.goal)}</span>
      </span>
      <span class="grammar-meta">
        <span class="chip">${g.exercises.length} exercices</span>
        <span class="tiny muted">après la leçon ${g.afterLesson}</span>
        <span class="muted" aria-hidden="true">${icon("chevron")}</span>
      </span>
    </a>`;
  };

  root.innerHTML = `<div class="page-head">
    <div class="page-head-text">
      <span class="eyebrow">Grammaire · hors parcours</span>
      <h1 class="h1">Les règles,<br />au bon moment</h1>
      <p class="lead">${GRAMMAR.length} points de grammaire courts, séparés des 76 leçons. Chaque point s'ouvre quand la leçon qui l'illustre est validée : on voit d'abord la langue vivre, puis on comprend la règle.</p>
    </div>
    <div class="stack" style="min-width:220px;flex:1;max-width:280px">
      <div class="row row--between"><span class="small muted">Points validés</span><strong>${done}/${GRAMMAR.length}</strong></div>
      ${bar(percent, "bar-fill--sun", "Progression en grammaire")}
      <span class="tiny muted">Un point est validé quand ses exercices sont tous réussis.</span>
    </div>
  </div>

  ${next ? `<a class="grammar-next" href="#/grammaire/${esc(next.id)}">
    <span class="grammar-next-icon">${icon("layers")}</span>
    <span style="min-width:0">
      <span class="tiny" style="text-transform:uppercase;letter-spacing:.12em;font-weight:700;opacity:.75">Prochain point conseillé</span>
      <strong style="display:block;font-size:18px;margin-top:2px">${esc(next.title)}</strong>
      <span class="small" style="opacity:.85">${esc(next.goal)}</span>
    </span>
    <span class="btn btn--primary btn--sm" style="margin-left:auto">Ouvrir ${icon("arrowRight")}</span>
  </a>` : `<div class="card card--tinted"><strong>Tous les points de grammaire sont validés.</strong> <span class="small muted">Les tests de niveau t'attendent sur l'accueil pour vérifier que tout tient debout.</span></div>`}

  ${LEVELS.map((group) => {
    const list = GRAMMAR.filter((g) => g.level === group.level);
    return `<section class="grammar-group" aria-labelledby="grammar-${group.level}">
      <div class="section-title" style="margin-top:26px">
        <div>
          <h2 id="grammar-${group.level}">${group.level} · ${esc(group.name)}</h2>
          <p class="tiny muted" style="margin-top:4px">${esc(group.hint)}</p>
        </div>
        <span class="badge">${list.filter((g) => progress.grammar?.[g.id]?.done).length}/${list.length}</span>
      </div>
      <div class="grammar-list">${list.map(card).join("")}</div>
    </section>`;
  }).join("")}

  <div class="card" style="margin-top:26px">
    <div class="row row--between">
      <h2 class="h3">Comment ces points s'utilisent</h2>
      <a class="btn btn--soft btn--sm" href="#/lecons">Voir le parcours ${icon("arrowRight")}</a>
    </div>
    <div class="grid grid--3" style="margin-top:12px">
      <div class="grammar-tip"><strong>1. Tu lis d'abord</strong><span class="small muted">Le dialogue de la leçon montre la structure en situation.</span></div>
      <div class="grammar-tip"><strong>2. Tu comprends</strong><span class="small muted">Le point de grammaire explique et met la règle en tableau.</span></div>
      <div class="grammar-tip"><strong>3. Tu vérifies</strong><span class="small muted">4 à 5 exercices corrigés valident le point, sans le rendre obligatoire.</span></div>
    </div>
  </div>`;

}
