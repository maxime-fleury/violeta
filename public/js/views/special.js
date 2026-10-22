import { SPECIALS, SPECIALS_BY_ID } from "../data/specials.js";
import { store, actions } from "../core/store.js";
import { mountQuiz } from "../components/quiz.js";
import { $, bindSpeakButtons, esc, icon, plural } from "../ui.js";

const KIND_LABEL = {
  colors: "Couleurs",
  days: "Calendrier",
  numbers: "Nombres",
  hundreds: "Grands nombres",
  math: "Opérations",
  expressions: "Expressions",
};

function renderItems(special, section) {
  const items = section.items;
  if (special.kind === "colors") {
    return `<div class="swatch-grid">${items
      .map(
        (item) => `<button type="button" class="swatch-card" data-speak="${esc(item.es)}" aria-label="Écouter ${esc(item.es)}">
          <span class="swatch" style="background:${item.hex || "#ddd"}">${item.emoji ? `<span style="font-size:26px">${item.emoji}</span>` : ""}</span>
          <span class="swatch-info">
            <span class="es" lang="es">${esc(item.es)}</span>
            <span class="fr">${esc(item.fr)}</span>
            ${item.example ? `<span class="tiny muted" style="margin-top:2px">${esc(item.example)}</span>` : ""}
          </span>
        </button>`,
      )
      .join("")}</div>`;
  }
  if (special.kind === "days" && items.some((i) => i.order)) {
    return `<div class="day-strip">${items
      .filter((item) => item.order)
      .map(
        (item) => `<button type="button" class="day-card" data-speak="${esc(item.es)}" aria-label="Écouter ${esc(item.es)}">
          <span class="order">${item.order}</span>
          <span class="d" lang="es">${esc(item.es)}</span>
          <span class="f">${esc(item.fr)}</span>
        </button>`,
      )
      .join("")}</div>`;
  }
  if (special.kind === "numbers" || special.kind === "hundreds") {
    return `<div class="number-grid">${items
      .map(
        (item) => `<div class="number-card">
          <span class="n" lang="es">${esc(item.es)}</span>
          <span class="f">${esc(item.fr)}</span>
          <button class="mini-btn" type="button" data-speak="${esc(item.es)}" aria-label="Écouter ${esc(item.es)}" style="margin-left:auto">${icon("sound")}</button>
        </div>`,
      )
      .join("")}</div>`;
  }
  return `<div class="expr-grid">${items
    .map(
      (item) => `<article class="expr-card">
        <div class="row row--between" style="gap:8px;align-items:flex-start">
          <span class="es" lang="es">${esc(item.es)}</span>
          <button class="mini-btn" type="button" data-speak="${esc(item.es)}" aria-label="Écouter ${esc(item.es)}">${icon("sound")}</button>
        </div>
        <span class="fr">${esc(item.fr)}</span>
        ${item.example ? `<span class="tiny muted" lang="es">${esc(item.example)}</span>` : ""}
        ${item.note ? `<span class="note">${esc(item.note)}</span>` : ""}
      </article>`,
    )
    .join("")}</div>`;
}

export function renderSpecial(root, id) {
  const special = SPECIALS_BY_ID[id];
  if (!special) {
    root.innerHTML = `<div class="empty"><div class="e-icon">✨</div><h3>Ce thème n'existe pas</h3>
      <p>Il a peut-être changé de nom. Retrouve tous les thèmes depuis la page dédiée.</p>
      <a class="btn btn--primary" href="#/themes">Voir les leçons spéciales</a></div>`;
    return;
  }

  const abort = new AbortController();
  let quiz = null;
  let closed = false;
  window.addEventListener(
    "hashchange",
    () => {
      closed = true;
      quiz?.destroy?.();
      abort.abort();
    },
    { once: true, signal: abort.signal },
  );

  const state = store.get().specials[id];
  const itemCount = special.sections.reduce((n, s) => n + s.items.length, 0);
  const nextSpecial = SPECIALS[SPECIALS.indexOf(special) + 1] || null;

  root.innerHTML = `<div class="breadcrumb"><a href="#/themes">Leçons spéciales</a><span class="sep">/</span><span>${esc(special.title)}</span></div>
    <div class="env-hero" style="margin-bottom:24px">
      <div class="row" style="gap:16px;align-items:flex-start">
        <span class="env-icon" style="background:${special.color}18;color:${special.color}">${special.icon}</span>
        <div style="min-width:0">
          <span class="eyebrow" style="color:${special.color}">${KIND_LABEL[special.kind] || "Thème"}</span>
          <h1 class="h1" style="font-size:clamp(28px,3.6vw,40px)">${esc(special.title)}</h1>
          <p class="lead" style="margin-top:6px">${esc(special.subtitle)}</p>
        </div>
      </div>
      <div class="stack" style="justify-items:end">
        <span class="badge" id="special-status">${state?.done ? `${icon("check")} Validée` : "À découvrir"}</span>
        <span class="tiny muted">${itemCount} éléments · ${special.exercises.length} exercices</span>
      </div>
    </div>

    ${special.sections
      .map(
        (section) => `<section style="margin-bottom:28px">
          <div class="section-title" style="margin-top:0">
            <h2>${esc(section.title)}</h2>
            <span class="tiny muted">${section.items.length} éléments · touche pour écouter</span>
          </div>
          ${section.note ? `<div class="note-box" style="margin-bottom:12px">${icon("info", "info-ico")}<span>${esc(section.note)}</span></div>` : ""}
          ${renderItems(special, section)}
        </section>`,
      )
      .join("")}

    <div class="section-title" style="margin-top:8px">
      <h2>${icon("target")} Les exercices</h2>
      <span class="tiny muted">Tout réussir valide le thème</span>
    </div>
    ${state?.done ? `<div class="note-box" style="margin-bottom:12px">${icon("check", "info-ico")}<span>Thème déjà validé${state.score !== undefined ? ` (${state.score}/${state.total} du premier coup)` : ""}. Tu peux refaire les exercices pour consolider.</span></div>` : ""}
    <div class="card card--pad-lg" id="special-quiz"></div>

    <div class="row row--between" style="margin-top:24px">
      <a class="btn btn--ghost" href="#/themes">${icon("arrowLeft")} Tous les thèmes</a>
      ${nextSpecial ? `<a class="btn" href="#/themes/${esc(nextSpecial.id)}">${esc(nextSpecial.title)} ${icon("arrowRight")}</a>` : ""}
    </div>`;

  bindSpeakButtons(root);

  const words = [...new Set(special.exercises.map((e) => e.word).filter(Boolean))];
  quiz = mountQuiz($("#special-quiz", root), special.exercises, {
    intro: "Corrige-toi librement : seule la réussite de tous les exercices valide la leçon.",
    onComplete: ({ score, total }) => {
      if (closed) return;
      actions.completeSpecial(id, { score, total, words });
      const status = $("#special-status", root);
      if (status) status.innerHTML = `${icon("check")} Validée`;
      $("#special-quiz", root).innerHTML = `<div class="success" style="padding:22px 8px">
        <div class="check-badge">${icon("trophy")}</div>
        <h2 style="font-size:27px">Thème validé !</h2>
        <p class="muted">${score}/${total} réponses justes du premier coup. ${words.length ? `${plural(words.length, "mot renforcé", "mots renforcés")}.` : ""}</p>
        <div class="success-actions">
          <a class="btn btn--primary" href="#/themes">Retour aux thèmes ${icon("arrowRight")}</a>
          <button class="btn" type="button" data-redo>Refaire les exercices</button>
        </div>
      </div>`;
      $("#special-quiz", root).querySelector("[data-redo]")?.addEventListener("click", () => renderSpecial(root, id));
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    },
  });
}
