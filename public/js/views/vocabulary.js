import { LEXICON } from "../data/lexicon.js";
import { store } from "../core/store.js";
import { wordStatus } from "../core/progress.js";
import { MASTERY_TARGET } from "../core/memory.js";
import { INTEGRATED_WORDS, MISSING_WORDS } from "../core/coverage.js";
import { $, bindSpeakButtons, esc, icon, wordStatusBadge } from "../ui.js";

const THEME_LABEL = {
  bases: "Fondations",
  verbes: "Verbes & actions",
  personnes: "Personnes & santé",
  maison: "Maison & ville",
  nourriture: "Nourriture",
  temps: "Temps & nature",
  adjectifs: "Adjectifs & quantités",
  societe: "École & société",
};

const POS_LABEL = {
  n: "nom",
  v: "verbe",
  adj: "adjectif",
  adv: "adverbe",
  pron: "pronom",
  prep: "préposition",
  conj: "conjonction",
  det: "déterminant",
  num: "nombre",
  interj: "interjection",
  expr: "expression",
};

function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function renderVocabulary(root) {
  const progress = store.get();
  let status = "mine";
  let theme = "all";
  let query = "";
  let limit = 60;

  const themes = [...new Set(LEXICON.map((w) => w.theme))];

  function filtered() {
    const q = normalize(query.trim());
    let list = LEXICON.filter((w) => {
      const state = wordStatus(progress, w.id);
      if (status === "mine" && state === "unknown") return false;
      if (status === "mastered" && state !== "mastered") return false;
      if (status === "review" && !((progress.words[w.id]?.mistakes || 0) > 0 && state !== "mastered")) return false;
      if (theme !== "all" && w.theme !== theme) return false;
      if (q) {
        const haystack = normalize(`${w.es} ${w.fr} ${w.ex} ${w.exFr}`);
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    if (status === "review") {
      list = list.sort(
        (a, b) =>
          (progress.words[b.id]?.mistakes || 0) - (progress.words[a.id]?.mistakes || 0) ||
          (progress.words[a.id]?.correct || 0) - (progress.words[b.id]?.correct || 0),
      );
    } else {
      list = list.sort((a, b) => a.priority - b.priority);
    }
    return list;
  }

  function rowMarkup(w) {
    const state = wordStatus(progress, w.id);
    const correct = Math.min(MASTERY_TARGET, progress.words[w.id]?.correct || 0);
    const locked = state === "unknown";
    const pos = POS_LABEL[w.pos] || "";
    const gender = w.pos === "n" ? (w.gender === "f" ? "f." : "m.") : "";
    return `<article class="vocab-row ${locked ? "is-locked" : ""}" data-row data-id="${esc(w.id)}">
      <div>
        <div class="v-es" lang="es">${esc(w.es)} <small>${esc(pos)}${gender ? ` · ${gender}` : ""}</small></div>
      </div>
      <div class="v-fr">${locked ? "Traduction à découvrir en leçon" : esc(w.fr)}</div>
      <div>${wordStatusBadge(state)}</div>
      <div class="row row--tight" style="justify-content:flex-end">
        <span class="mastery-dots" role="img" aria-label="${correct} réussites sur ${MASTERY_TARGET}">${Array.from({ length: MASTERY_TARGET }, (_, i) => `<i class="${i < correct ? "on" : ""}"></i>`).join("")}</span>
        <button class="mini-btn" type="button" data-speak="${esc(w.es)}" aria-label="Écouter ${esc(w.es)}">${icon("sound")}</button>
        ${!locked ? `<button class="mini-btn" type="button" data-expand aria-label="Voir un exemple" aria-expanded="false">${icon("chevron")}</button>` : ""}
      </div>
      ${!locked && w.ex ? `<div class="v-ex"><span lang="es">${esc(w.ex)}</span> — ${esc(w.exFr)}${w.rank ? ` <span class="tiny muted">· rang de fréquence ${w.rank}</span>` : ""}</div>` : ""}
    </article>`;
  }

  function renderResults() {
    const list = filtered();
    const shown = list.slice(0, limit);
    const container = $("#vocab-results", root);
    const count = $("#vocab-count", root);
    if (count) count.textContent = `${list.length} mot${list.length > 1 ? "s" : ""}`;
    if (!container) return;
    container.innerHTML = shown.length
      ? `${shown.map(rowMarkup).join("")}
        ${list.length > shown.length ? `<div class="more-row"><button class="btn btn--soft btn--sm" type="button" data-more>Afficher ${Math.min(60, list.length - shown.length)} mots de plus</button></div>` : ""}`
      : `<div class="empty"><div class="e-icon">🔍</div><h3>Aucun mot ici</h3>
          <p>${status === "mine" ? "Tu n'as pas encore découvert de mot dans ce filtre. Ouvre une leçon pour commencer." : "Essaie une autre recherche ou change de filtre."}</p>
          <a class="btn btn--primary" href="#/lecons">Ouvrir une leçon</a></div>`;
    bindSpeakButtons(container);
  }

  const discovered = LEXICON.filter((w) => wordStatus(progress, w.id) !== "unknown").length;
  const mastered = LEXICON.filter((w) => wordStatus(progress, w.id) === "mastered").length;

  root.innerHTML = `<div class="page-head">
    <div class="page-head-text">
      <span class="eyebrow">Vocabulaire</span>
      <h1 class="h1">Ton lexique,<br />mot par mot</h1>
      <p class="lead">Les 1 000 mots cibles sont vérifiés et classés. Tu vois ici ceux que tu as rencontrés, ceux qui sont maîtrisés, et ceux qui t'attendent.</p>
    </div>
    <div class="stack" style="min-width:230px">
      <div class="row row--between"><span class="small muted">Découverts</span><strong>${discovered} / 1000</strong></div>
      <div class="bar"><div class="bar-fill" style="width:${discovered / 10}%"></div></div>
      <div class="row row--between"><span class="small muted">Maîtrisés</span><strong>${mastered} / 1000</strong></div>
      <div class="bar"><div class="bar-fill bar-fill--mint" style="width:${mastered / 10}%"></div></div>
    </div>
  </div>

  <div class="vocab-summary">
    <span><strong>${INTEGRATED_WORDS.length.toLocaleString("fr-FR")}</strong> mots déjà dans du contenu jouable</span>
    <span><strong>${MISSING_WORDS.length.toLocaleString("fr-FR")}</strong> encore hors parcours</span>
    <span><strong>${LEXICON.length}</strong> entrées vérifiées (forme, genre, exemple)</span>
  </div>

  <div class="vocab-toolbar">
    <div class="segmented" role="group" aria-label="Filtrer par statut">
      <button type="button" data-status="mine" aria-pressed="true">Mes mots</button>
      <button type="button" data-status="mastered" aria-pressed="false">Maîtrisés</button>
      <button type="button" data-status="review" aria-pressed="false">À revoir</button>
      <button type="button" data-status="all" aria-pressed="false">Tout le lexique</button>
    </div>
    <label class="search-field">
      <span class="tiny muted" style="position:absolute;left:-9999px">Rechercher un mot</span>
      ${icon("search")}
      <input type="search" placeholder="Rechercher un mot, une traduction…" data-search autocomplete="off" />
    </label>
    <select class="select" data-theme aria-label="Filtrer par thème">
      <option value="all">Tous les thèmes</option>
      ${themes.map((t) => `<option value="${esc(t)}">${esc(THEME_LABEL[t] || t)}</option>`).join("")}
    </select>
    <span class="small muted" id="vocab-count"></span>
  </div>

  <div class="vocab-list" id="vocab-results"></div>
  <p class="tiny muted" style="margin-top:18px">Astuce : ouvre une leçon pour découvrir les traductions des mots encore inconnus. La maîtrise demande ${MASTERY_TARGET} réussites, pas un simple survol.</p>`;

  renderResults();

  root.querySelector(".segmented")?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-status]");
    if (!btn) return;
    status = btn.dataset.status;
    limit = 60;
    for (const b of root.querySelectorAll("[data-status]")) b.setAttribute("aria-pressed", String(b === btn));
    root.querySelector("[data-theme]").value = theme;
    renderResults();
  });

  $("#vocab-results", root)?.addEventListener("click", (event) => {
    const more = event.target.closest("[data-more]");
    if (more) {
      limit += 60;
      renderResults();
      return;
    }
    if (event.target.closest("[data-speak]")) return;
    const row = event.target.closest("[data-row]");
    if (!row) return;
    const expand = event.target.closest("[data-expand]");
    if (!expand && !row.classList.contains("is-locked")) {
      row.classList.toggle("is-open");
      return;
    }
    if (expand) {
      const open = row.classList.toggle("is-open");
      expand.setAttribute("aria-expanded", String(open));
    }
  });

  $("[data-search]", root)?.addEventListener("input", (event) => {
    query = event.target.value;
    limit = 60;
    renderResults();
  });

  $("[data-theme]", root)?.addEventListener("change", (event) => {
    theme = event.target.value;
    limit = 60;
    renderResults();
  });
}
