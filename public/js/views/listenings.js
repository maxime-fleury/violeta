import { store } from "../core/store.js";
import { LISTENINGS, formatDuration, listeningDoneCount, nextListeningFor } from "../core/listening.js";
import { bar, esc, icon } from "../ui.js";

const GROUPS = [
  { level: "A2", name: "Comprendre le quotidien", hint: "Voix naturelles, sujets concrets, transcription disponible." },
  { level: "B1", name: "Suivre une explication", hint: "Récits, consignes, opinions : le débit ne ralentit pas." },
];

export function renderListenings(root) {
  const progress = store.get();
  const done = listeningDoneCount(progress);
  const percent = LISTENINGS.length ? Math.round((done / LISTENINGS.length) * 100) : 0;
  const next = nextListeningFor(progress);

  const card = (item) => {
    const state = progress.listenings?.[item.id];
    const isNext = next?.id === item.id;
    return `<a class="listen-card ${state?.done ? "is-done" : ""} ${isNext ? "is-next" : ""}" href="#/ecoute/${esc(item.id)}">
      <span class="listen-thumb">
        <img src="${esc(item.poster)}" alt="" loading="lazy" width="160" height="90" />
        <span class="listen-play" aria-hidden="true">${icon("play")}</span>
        <span class="listen-time">${formatDuration(item.seconds)}</span>
      </span>
      <span class="listen-body">
        <span class="row" style="gap:7px;flex-wrap:wrap;align-items:center">
          <strong>${esc(item.title)}</strong>
          ${isNext ? `<span class="badge badge--violet">Conseillée</span>` : ""}
          ${state?.done ? `<span class="badge badge--mint">${icon("check")} Validée</span>` : ""}
        </span>
        <span class="small muted">${esc(item.subtitle)}</span>
        <span class="tiny muted">${esc(item.speaker)} · ${esc(item.origin)}</span>
      </span>
      <span class="listen-meta">
        <span class="chip">${esc(item.level)}</span>
        <span class="tiny muted">${item.quiz.length} questions</span>
        <span class="muted" aria-hidden="true">${icon("chevron")}</span>
      </span>
    </a>`;
  };

  root.innerHTML = `<div class="page-head">
    <div class="page-head-text">
      <span class="eyebrow">Écoute · voix réelles</span>
      <h1 class="h1">Écouter<br />de vraies personnes</h1>
      <p class="lead">${LISTENINGS.length} extraits d'espagnol authentique, enregistrés par des locuteurs du Mexique, d'Espagne, du Chili, du Pérou, du Costa Rica, d'Équateur, de Colombie et d'ailleurs. Une écoute courte, une transcription, un quiz : de quoi habituer l'oreille à de vrais accents.</p>
    </div>
    <div class="stack" style="min-width:220px;flex:1;max-width:280px">
      <div class="row row--between"><span class="small muted">Écoutes validées</span><strong>${done}/${LISTENINGS.length}</strong></div>
      ${bar(percent, "bar-fill--sun", "Progression en compréhension orale")}
      <span class="tiny muted">Une écoute est validée quand son quiz est réussi.</span>
    </div>
  </div>

  ${next ? `<a class="listen-next" href="#/ecoute/${esc(next.id)}">
    <span class="listen-next-icon">${icon("mic")}</span>
    <span style="min-width:0">
      <span class="tiny" style="text-transform:uppercase;letter-spacing:.12em;font-weight:700;opacity:.78">Prochaine écoute conseillée</span>
      <strong style="display:block;font-size:18px;margin-top:2px">${esc(next.title)}</strong>
      <span class="small" style="opacity:.88">${esc(next.subtitle)} · ${formatDuration(next.seconds)}</span>
    </span>
    <span class="btn btn--primary btn--sm" style="margin-left:auto">Écouter ${icon("arrowRight")}</span>
  </a>` : `<div class="card card--tinted"><strong>Toutes les écoutes sont validées.</strong> <span class="small muted">Les tests de niveau et les récits t'attendent pour consolider.</span></div>`}

  ${GROUPS.map((group) => {
    const list = LISTENINGS.filter((item) => item.level === group.level);
    return `<section class="listen-group" aria-labelledby="listen-${group.level}">
      <div class="section-title" style="margin-top:26px">
        <div>
          <h2 id="listen-${group.level}">${group.level} · ${esc(group.name)}</h2>
          <p class="tiny muted" style="margin-top:4px">${esc(group.hint)}</p>
        </div>
        <span class="badge">${list.filter((item) => progress.listenings?.[item.id]?.done).length}/${list.length}</span>
      </div>
      <div class="listen-list">${list.map(card).join("")}</div>
    </section>`;
  }).join("")}

  <div class="card" style="margin-top:26px">
    <div class="row row--between">
      <h2 class="h3">Comment travailler une écoute</h2>
      <a class="btn btn--soft btn--sm" href="#/lecons">Voir le parcours ${icon("arrowRight")}</a>
    </div>
    <div class="grid grid--3" style="margin-top:12px">
      <div class="grammar-tip"><strong>1. Sans texte</strong><span class="small muted">Regarde une première fois sans transcription : cherche l'idée, pas chaque mot.</span></div>
      <div class="grammar-tip"><strong>2. Avec le texte</strong><span class="small muted">Active la transcription, repère les mots qui coincent, réécoute à 0,75×.</span></div>
      <div class="grammar-tip"><strong>3. Quiz</strong><span class="small muted">Quatre questions pour vérifier ce qui est vraiment passé, pas ce qu'on croit avoir compris.</span></div>
    </div>
  </div>

  <p class="tiny muted" style="margin-top:18px">
    Extraits de <a href="https://www.laits.utexas.edu/spe/" target="_blank" rel="noopener noreferrer">Spanish Proficiency Exercises</a> (COERLL, University of Texas at Austin), sous licence
    <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>. Vidéos compressées, transcriptions traduites et quiz ajoutés par Violeta.
  </p>`;
}
