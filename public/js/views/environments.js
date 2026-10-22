import { store } from "../core/store.js";
import { ENVIRONMENTS, allLevels } from "../data/environments.js";
import { esc, icon, plural } from "../ui.js";

function envStats(env, progress) {
  const levels = env.rooms.flatMap((room) => room.levels);
  const done = levels.filter((l) => progress.environments[l.id]?.done).length;
  const focus = [...new Set(levels.flatMap((l) => l.focus))];
  const discovered = focus.filter((id) => (progress.environments[levels[0]?.id]?.discovered || []).includes(id));
  const seen = new Set();
  for (const level of levels) {
    for (const id of progress.environments[level.id]?.discovered || []) seen.add(id);
  }
  const found = focus.filter((id) => seen.has(id)).length;
  return { levels, done, total: levels.length, found, focusTotal: focus.length, discovered };
}

export function renderEnvironments(root) {
  const progress = store.get();
  const levels = allLevels();
  const doneLevels = levels.filter(({ level }) => progress.environments[level.id]?.done).length;
  const allFocus = [...new Set(levels.flatMap(({ level }) => level.focus))];
  const seen = new Set();
  for (const { level } of levels) for (const id of progress.environments[level.id]?.discovered || []) seen.add(id);
  const found = allFocus.filter((id) => seen.has(id)).length;

  root.innerHTML = `<div class="page-head">
    <div class="page-head-text">
      <span class="eyebrow">Environnements interactifs</span>
      <h1 class="h1">Apprendre avec les yeux<br />et les doigts</h1>
      <p class="lead">Entre dans une scène, touche les objets pour découvrir leur nom espagnol, puis débloque le dialogue et l'exercice. Les zones suivent réellement les objets dessinés.</p>
    </div>
    <div class="stack" style="min-width:210px">
      <div class="row row--between"><span class="small muted">Niveaux terminés</span><strong>${doneLevels}/${levels.length}</strong></div>
      <div class="bar"><div class="bar-fill bar-fill--mint" style="width:${Math.round((doneLevels / levels.length) * 100)}%"></div></div>
      <span class="tiny muted">${found} objets découverts sur ${allFocus.length}</span>
    </div>
  </div>

  <div class="grid grid--2">
    ${ENVIRONMENTS.map((env) => {
      const s = envStats(env, progress);
      const isApartment = env.id === "apartamento";
      return `<article class="card ${isApartment ? "card--tinted" : ""}" style="display:grid;gap:14px">
        <div class="row" style="gap:14px;align-items:flex-start">
          <span class="env-icon" style="font-size:28px;width:56px;height:56px;border-radius:17px;background:${env.color}18;color:${env.color}">${env.icon}</span>
          <div style="min-width:0">
            <h2 class="h2" style="font-size:26px">${esc(env.title)}</h2>
            <p class="small muted">${esc(env.subtitle)}</p>
          </div>
          <span class="badge ${s.done === s.total ? "badge--mint" : ""}" style="margin-left:auto">${s.done}/${s.total}</span>
        </div>
        <div class="pill-row">
          ${env.rooms.map((room) => `<span class="chip">${room.icon} ${esc(room.title)}</span>`).join("")}
        </div>
        <div>
          <div class="row row--between" style="margin-bottom:6px"><span class="tiny muted">${s.found}/${s.focusTotal} objets découverts</span><span class="tiny muted">${s.done}/${s.total} niveaux</span></div>
          <div class="bar"><div class="bar-fill ${s.done === s.total ? "" : "bar-fill--mint"}" style="width:${Math.round((s.found / Math.max(1, s.focusTotal)) * 100)}%"></div></div>
        </div>
        <div class="row">
          <a class="btn ${s.done ? "" : "btn--primary"} btn--sm" href="#/explorer/${esc(env.id)}">${s.done ? "Explorer à nouveau" : "Entrer dans la scène"} ${icon("arrowRight")}</a>
          <span class="tiny muted">${plural(s.levels.length, "niveau", "niveaux")}</span>
        </div>
      </article>`;
    }).join("")}
  </div>

  <div class="section-title" style="margin-top:36px"><h2>Comment ça marche</h2></div>
  <div class="grid grid--3">
    <div class="card"><span class="quick-icon" style="margin-bottom:10px">${icon("eye")}</span><h3 class="h3">1 · Observe</h3><p class="small muted" style="margin-top:4px">Chaque objet interactif s'illumine au survol ou au toucher, avec son nom et sa traduction.</p></div>
    <div class="card"><span class="quick-icon" style="margin-bottom:10px">${icon("book")}</span><h3 class="h3">2 · Débloque</h3><p class="small muted" style="margin-top:4px">Découvre tous les objets du niveau pour faire apparaître un dialogue qui les réutilise.</p></div>
    <div class="card"><span class="quick-icon" style="margin-bottom:10px">${icon("target")}</span><h3 class="h3">3 · Valide</h3><p class="small muted" style="margin-top:4px">Réussis le quiz final : le niveau est terminé et les mots gagnent en maîtrise.</p></div>
  </div>`;
}
