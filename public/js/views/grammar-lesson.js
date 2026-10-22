import { store, actions } from "../core/store.js";
import { GRAMMAR, GRAMMAR_BY_ID, exercisesOf } from "../core/grammar.js";
import { mountQuiz } from "../components/quiz.js";
import { bindSpeakButtons, esc, icon, plural, toast } from "../ui.js";

function renderTable(table) {
  return `<div class="grammar-table-wrap">
    <table class="grammar-table">
      <caption>${esc(table.title)}</caption>
      <thead><tr>${table.head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>${table.rows
        .map((row) => `<tr>${row.map((cell, i) => (i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`)).join("")}</tr>`)
        .join("")}</tbody>
    </table>
  </div>`;
}

export function renderGrammarLesson(root, id) {
  const lesson = GRAMMAR_BY_ID[id];
  if (!lesson) {
    root.innerHTML = `<div class="empty"><div class="e-icon">📐</div><h3>Ce point de grammaire n'existe pas</h3>
      <p>Le lien est peut-être incomplet.</p><a class="btn btn--primary" href="#/grammaire">Tous les points</a></div>`;
    return;
  }

  const progress = store.get();
  const state = progress.grammar?.[lesson.id];
  const next = GRAMMAR.find((g) => g.order === lesson.order + 1);
  const exercises = exercisesOf(lesson);

  root.innerHTML = `<div class="row" style="margin-bottom:10px">
    <a class="btn btn--ghost btn--sm" href="#/grammaire">${icon("arrowLeft")} Toute la grammaire</a>
    <span class="spacer"></span>
    <span class="chip">${esc(lesson.level)}</span>
    ${state?.done ? `<span class="badge badge--mint">${icon("check")} Validée</span>` : `<span class="badge">${plural(lesson.exercises.length, "exercice")}</span>`}
  </div>

  <div class="page-head">
    <div class="page-head-text">
      <span class="eyebrow">Grammaire · point ${String(lesson.order).padStart(2, "0")}</span>
      <h1 class="h1">${esc(lesson.title)}</h1>
      <p class="lead">${esc(lesson.goal)}</p>
    </div>
    <div class="grammar-anchor">
      <span class="tiny muted">S'accroche à</span>
      <a class="btn btn--soft btn--sm" href="#/lecons/l${String(lesson.afterLesson).padStart(2, "0")}">Leçon ${lesson.afterLesson} ${icon("arrowRight")}</a>
    </div>
  </div>

  <div class="grid grid--sidebar">
    <div class="stack">
      ${lesson.rules
        .map(
          (rule, index) => `<section class="card grammar-rule">
            <span class="grammar-rule-num">${index + 1}</span>
            <div>
              <h2 class="h3">${esc(rule.title)}</h2>
              <p class="small">${esc(rule.text)}</p>
              <div class="grammar-examples">
                ${rule.examples
                  .map(
                    (ex) => `<div class="grammar-example">
                      <button class="mini-btn" type="button" data-speak="${esc(ex.es)}" aria-label="Écouter ${esc(ex.es)}">${icon("sound")}</button>
                      <span lang="es">${esc(ex.es)}</span>
                      <span class="fr">${esc(ex.fr)}</span>
                    </div>`,
                  )
                  .join("")}
              </div>
            </div>
          </section>`,
        )
        .join("")}

      ${(lesson.tables || []).map((t) => `<div class="card">${renderTable(t)}</div>`).join("")}

      ${
        lesson.watch?.length
          ? `<section class="card card--tinted grammar-watch">
              <h2 class="h3">${icon("bulb")} À surveiller</h2>
              <ul>${lesson.watch.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>
            </section>`
          : ""
      }

      <section class="card card--pad-lg" id="grammar-exercises">
        <div class="row row--between" style="margin-bottom:12px">
          <div>
            <h2 class="h2" style="font-size:24px">Vérifie que c'est clair</h2>
            <p class="small muted">${plural(exercises.length, "exercice")} court${exercises.length > 1 ? "s" : ""}, corrigé${exercises.length > 1 ? "s" : ""} sur place. Rien n'est verrouillé.</p>
          </div>
          <span class="badge badge--violet">${esc(lesson.level)}</span>
        </div>
        <div id="grammar-quiz"></div>
        <div id="grammar-result"></div>
      </section>
    </div>

    <aside class="stack">
      <div class="card">
        <span class="eyebrow">En un coup d'œil</span>
        <ul class="grammar-summary">
          ${lesson.rules.map((r) => `<li>${esc(r.title)}</li>`).join("")}
        </ul>
        <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap">
          <span class="chip">${lesson.level}</span>
          <span class="chip">${lesson.exercises.length} exercices</span>
          <span class="chip">Leçon ${lesson.afterLesson}</span>
        </div>
      </div>

      ${
        next
          ? `<div class="card">
              <span class="tiny muted">Point suivant</span>
              <h3 class="h3" style="margin:4px 0">${esc(next.title)}</h3>
              <p class="small muted">${esc(next.subtitle)}</p>
              <a class="btn btn--soft btn--sm" style="margin-top:10px" href="#/grammaire/${esc(next.id)}">Y aller ${icon("arrowRight")}</a>
            </div>`
          : ""
      }

      <div class="card card--tinted">
        <h3 class="h3">La grammaire n'est pas un examen</h3>
        <p class="small muted">Un point validé reste modifiable : tu peux revenir, refaire les exercices, et le test de niveau vérifiera l'ensemble.</p>
        <a class="btn btn--ghost btn--sm" style="margin-top:10px" href="#/">Les tests de niveau ${icon("arrowRight")}</a>
      </div>
    </aside>
  </div>`;

  bindSpeakButtons(root);

  const quizRoot = root.querySelector("#grammar-quiz");
  const resultRoot = root.querySelector("#grammar-result");

  mountQuiz(quizRoot, exercises, {
    intro: "",
    onComplete: ({ score, total }) => {
      actions.completeGrammar(lesson.id, { score, total });
      toast("Point de grammaire validé");
      resultRoot.innerHTML = `<div class="card card--tinted" style="margin-top:16px;border-color:var(--mint-line, #bfe8dc)">
        <div class="row row--between" style="gap:12px;flex-wrap:wrap">
          <div>
            <span class="eyebrow">${icon("check")} Point validé</span>
            <h3 class="h3" style="margin:2px 0">${esc(lesson.title)}</h3>
            <p class="small muted">${score}/${total} du premier coup. Tu peux refaire les exercices ou enchaîner.</p>
          </div>
          <div class="row" style="gap:8px;flex-wrap:wrap">
            <a class="btn btn--soft btn--sm" href="#/grammaire">Toute la grammaire</a>
            ${next ? `<a class="btn btn--primary btn--sm" href="#/grammaire/${esc(next.id)}">Point suivant ${icon("arrowRight")}</a>` : `<a class="btn btn--primary btn--sm" href="#/">Retour à l'accueil</a>`}
          </div>
        </div>
      </div>`;
      resultRoot.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
  });
}
