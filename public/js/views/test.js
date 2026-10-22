import { store, actions } from "../core/store.js";
import {
  DOMAINS,
  LEVELS,
  TESTS,
  TESTS_BY_ID,
  buildTest,
  isCorrectAnswer,
  isTestPassed,
  testEntry,
  testUnlocked,
} from "../core/tests.js";
import { bar, esc, icon, plural } from "../ui.js";

const LEVEL_ORDER = ["A1", "A2", "B1"];

/** Vue d'ensemble, utile quand on arrive par #/tests sans identifiant. */
export function renderTests(root) {
  const progress = store.get();
  const cards = LEVEL_ORDER.map((level) => {
    const meta = LEVELS[level];
    const rows = TESTS.filter((t) => t.level === level).map((test) => {
      const entry = testEntry(progress, test.id);
      const ok = isTestPassed(progress, test.id);
      const locked = !testUnlocked(progress, test);
      return `<a class="level-test-row ${ok ? "is-passed" : ""} ${locked ? "is-locked" : ""}" href="#/tests/${esc(test.id)}">
        <span class="ltr-icon">${icon(DOMAINS[test.domain].icon)}</span>
        <span class="ltr-label"><strong>${esc(DOMAINS[test.domain].label)}</strong><span class="tiny muted">${locked ? `Après ${meta.gate} leçons` : ok ? `Validé · ${entry.bestScore}/${entry.bestTotal}` : entry?.bestTotal ? `Meilleur : ${entry.bestScore}/${entry.bestTotal}` : test.subtitle}</span></span>
        <span class="ltr-end">${ok ? icon("check") : locked ? icon("lock") : icon("chevron")}</span>
      </a>`;
    }).join("");
    return `<div class="level-test-card">
      <div class="level-test-head"><span class="level-flag">${level}</span><span class="ltr-head-text"><strong>${esc(meta.name)}</strong><span class="tiny muted">${esc(meta.hint)}</span></span></div>
      <div class="level-test-rows">${rows}</div>
    </div>`;
  }).join("");
  root.innerHTML = `<div class="page-head">
    <div class="page-head-text">
      <span class="eyebrow">Évaluations</span>
      <h1 class="h1">Six tests,<br />trois niveaux</h1>
      <p class="lead">Grammaire et vocabulaire pour chaque palier. Un test se passe sans correction, se refait sans limite, et valide le niveau à partir de 10 bonnes réponses sur 12.</p>
    </div>
  </div>
  <div class="level-test-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${cards}</div>`;
}

export function renderTest(root, id) {
  const test = TESTS_BY_ID[id];
  if (!test) {
    root.innerHTML = `<div class="empty"><div class="e-icon">🎯</div><h3>Ce test n'existe pas</h3>
      <p>Reviens à l'accueil pour choisir un test de niveau.</p><a class="btn btn--primary" href="#/">Retour à l'accueil</a></div>`;
    return;
  }

  const progress = store.get();
  const built = buildTest(test.id);
  const meta = LEVELS[test.level];

  if (!testUnlocked(progress, test)) {
    const done = Object.values(progress.lessons || {}).filter((l) => l.status === "done").length;
    root.innerHTML = `<div class="page-head">
      <div class="page-head-text">
        <span class="eyebrow">Test de niveau · ${esc(test.level)}</span>
        <h1 class="h1">${esc(built.title)}</h1>
        <p class="lead">${esc(meta.hint)}</p>
      </div>
    </div>
    <div class="card card--pad-lg empty" style="text-align:left">
      <div class="e-icon">${icon("lock")}</div>
      <h3>Ce test s'ouvre après ${meta.gate} leçons validées</h3>
      <p class="small muted">Tu en as ${done}. Il vaut mieux voir les structures en contexte avant de les tester : termine quelques leçons du parcours, puis reviens.</p>
      <div style="max-width:420px;margin-top:10px">${bar(Math.round((done / meta.gate) * 100), "", "Leçons avant le test")}</div>
      <div class="row" style="margin-top:14px;gap:8px">
        <a class="btn btn--primary" href="#/lecons">Continuer le parcours ${icon("arrowRight")}</a>
        <a class="btn btn--ghost" href="#/">Accueil</a>
      </div>
    </div>`;
    return;
  }

  const entry = testEntry(progress, test.id);
  const passed = isTestPassed(progress, test.id);
  const state = { index: 0, answers: [], started: false, finished: false };

  root.innerHTML = `<div class="row" style="margin-bottom:10px">
    <a class="btn btn--ghost btn--sm" href="#/">${icon("arrowLeft")} Accueil</a>
    <span class="spacer"></span>
    <span class="chip">${esc(test.level)}</span>
    <span class="chip">${esc(DOMAINS[test.domain].label)}</span>
    ${passed ? `<span class="badge badge--mint">${icon("check")} Validé</span>` : ""}
  </div>

  <div class="page-head">
    <div class="page-head-text">
      <span class="eyebrow">Test de niveau · ${esc(meta.name)}</span>
      <h1 class="h1">${esc(built.title)}</h1>
      <p class="lead">${esc(test.subtitle)}. ${built.total} questions, ${built.required} bonnes réponses pour valider. Aucune correction pendant l'épreuve — tu peux la refaire autant de fois que tu veux.</p>
    </div>
    <div class="test-badge">
      ${icon("target")}
      <strong>${built.required}/${built.total}</strong>
      <span class="tiny">pour valider</span>
    </div>
  </div>

  <div class="test-shell" id="test-shell">
    <div id="test-stage"></div>
  </div>`;

  const stage = root.querySelector("#test-stage");

  function intro() {
    stage.innerHTML = `<div class="card card--pad-lg">
      <div class="row row--between" style="gap:14px;flex-wrap:wrap;align-items:flex-start">
        <div style="max-width:560px">
          <span class="eyebrow">Avant de commencer</span>
          <h2 class="h2" style="font-size:26px;font-family:var(--font-display)">${built.total} questions, sans filet</h2>
          <p class="small muted" style="margin-top:6px">Chaque question est indépendante. Tu ne vois pas si c'est juste avant la fin : c'est ce qui rend le résultat utile.</p>
          <ul class="test-rules">
            <li>${icon("clock")} Environ 6 à 8 minutes.</li>
            <li>${icon("check")} Seuil de validation : ${built.required} bonnes réponses sur ${built.total}.</li>
            <li>${icon("refresh")} Refaire le test ne remplace pas un meilleur score.</li>
            <li>${icon("eye")} Les accents et la ponctuation sont tolérés à la saisie.</li>
          </ul>
        </div>
        <div class="card card--tinted" style="min-width:230px;flex:1;max-width:300px">
          <span class="tiny muted">Ton historique</span>
          <h3 class="h3" style="margin:4px 0">${entry?.attempts ? plural(entry.attempts, "tentative") : "Première tentative"}</h3>
          ${entry?.bestTotal
            ? `<p class="small">Meilleur score : <strong>${entry.bestScore}/${entry.bestTotal}</strong></p>
               <div>${bar(Math.round((entry.bestScore / entry.bestTotal) * 100), "", "Meilleur score")}</div>`
            : `<p class="small muted">Pas encore de score. Tout à découvrir.</p>`}
        </div>
      </div>
      <div class="row" style="margin-top:18px;gap:8px;flex-wrap:wrap">
        <button class="btn btn--primary" type="button" data-start>${icon("play")} Commencer le test</button>
        <a class="btn btn--ghost" href="#/grammaire">Réviser la grammaire</a>
      </div>
    </div>`;
    stage.querySelector("[data-start]")?.addEventListener("click", () => {
      state.started = true;
      renderQuestion();
    });
  }

  function header() {
    const q = built.questions[state.index];
    const number = state.index + 1;
    return `<div class="test-progress">
      <div class="row row--between" style="margin-bottom:8px">
        <span class="small muted">Question ${number} sur ${built.total}</span>
        <span class="tiny muted">${esc(DOMAINS[test.domain].label)} · ${esc(test.level)}</span>
      </div>
      ${bar((state.index / built.total) * 100, "", "Progression du test")}
      ${q?.reference ? `<span class="tiny muted" style="display:block;margin-top:8px">${icon("layers")} ${esc(q.reference)}</span>` : ""}
    </div>`;
  }

  function renderQuestion() {
    const q = built.questions[state.index];
    if (!q) return finish();
    if (q.type === "choice") {
      stage.innerHTML = `<div class="card card--pad-lg test-question" data-question="${state.index}">
        ${header()}
        <h2 class="test-prompt">${esc(q.prompt)}</h2>
        <div class="test-options" role="group" aria-label="Réponses possibles">
          ${q.options
            .map(
              (option, i) => `<button class="test-option" type="button" data-option="${esc(option)}" aria-pressed="false">
                <span class="letter" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
                <span lang="${q.dir === "fr-es" ? "es" : "fr"}">${esc(option)}</span>
              </button>`,
            )
            .join("")}
        </div>
        <div class="row row--between" style="margin-top:16px;gap:10px;flex-wrap:wrap">
          <span class="tiny muted">Aucune correction avant la fin.</span>
          <button class="btn btn--primary" type="button" data-next disabled>Valider et continuer ${icon("arrowRight")}</button>
        </div>
      </div>`;

      const next = stage.querySelector("[data-next]");
      for (const option of stage.querySelectorAll("[data-option]")) {
        option.addEventListener("click", () => {
          for (const other of stage.querySelectorAll("[data-option]")) {
            other.classList.toggle("is-selected", other === option);
            other.setAttribute("aria-pressed", String(other === option));
          }
          next.disabled = false;
        });
      }
      next.addEventListener("click", () => {
        const selected = stage.querySelector(".test-option.is-selected");
        if (!selected) return;
        answer(selected.dataset.option);
      });
      return;
    }

    stage.innerHTML = `<div class="card card--pad-lg test-question" data-question="${state.index}">
      ${header()}
      <label class="test-prompt" for="test-input">${esc(q.prompt)}</label>
      <form class="answer-row" data-form novalidate>
        <input class="input-answer" id="test-input" name="answer" type="text" autocomplete="off" spellcheck="false" lang="es"
          placeholder="Écris en espagnol…" />
        <button class="btn btn--primary btn--sm" type="submit">Valider ${icon("arrowRight")}</button>
      </form>
      <span class="tiny muted">Les accents ne sont pas obligatoires.</span>
    </div>`;
    const form = stage.querySelector("[data-form]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = form.querySelector("input").value;
      if (!value.trim()) {
        form.querySelector("input").focus();
        return;
      }
      answer(value);
    });
    stage.querySelector("input")?.focus();
  }

  function answer(value) {
    const q = built.questions[state.index];
    state.answers.push({ question: q, value, correct: isCorrectAnswer(q, value) });
    state.index += 1;
    if (state.index >= built.total) finish();
    else renderQuestion();
  }

  function finish() {
    state.finished = true;
    const score = state.answers.filter((a) => a.correct).length;
    const total = built.total;
    const passedNow = score >= built.required;
    actions.recordTest(test.id, { score, total });
    const wrong = state.answers.filter((a) => !a.correct);
    const nextLevel = LEVEL_ORDER[LEVEL_ORDER.indexOf(test.level) + 1];
    const otherDomain = TESTS.find((t) => t.level === test.level && t.domain !== test.domain);

    stage.innerHTML = `<div class="card card--pad-lg test-result ${passedNow ? "is-passed" : "is-failed"}">
      <div class="test-result-head">
        <span class="test-result-icon">${icon(passedNow ? "trophy" : "target")}</span>
        <div>
          <span class="eyebrow">${passedNow ? "Test validé" : "Encore un effort"}</span>
          <h2 class="h2" style="font-size:30px;font-family:var(--font-display);margin:2px 0">${score} / ${total}</h2>
          <p class="small muted">${passedNow
            ? `${DOMAINS[test.domain].label} ${test.level} validé${test.domain === "grammaire" ? "e" : ""} : il fallait ${built.required} bonnes réponses. Ton meilleur score est enregistré.`
            : `Il fallait ${built.required} bonnes réponses. Relis les règles, puis retente : seul ton meilleur score compte.`}</p>
        </div>
      </div>
      ${wrong.length ? `<div class="test-review">
        <h3 class="h3" style="margin-bottom:8px">Ce qui a résisté</h3>
        ${wrong
          .map(
            (a) => `<div class="test-review-row">
              <span class="test-review-icon">${icon("close")}</span>
              <div style="min-width:0">
                <strong>${esc(a.question.prompt)}</strong>
                <div class="small muted">Ta réponse : « ${esc(a.value)} » · Attendue : <span lang="es">${esc(a.question.answer)}</span></div>
                ${a.question.why ? `<div class="tiny muted">${esc(a.question.why)}</div>` : ""}
              </div>
            </div>`,
          )
          .join("")}
      </div>` : `<p class="small" style="margin-top:10px">Aucune erreur. Rien à revoir, sinon le plaisir de refaire.</p>`}
      <div class="row" style="margin-top:18px;gap:8px;flex-wrap:wrap">
        <button class="btn btn--primary" type="button" data-restart>${icon("refresh")} Refaire le test</button>
        ${otherDomain ? `<a class="btn btn--soft" href="#/tests/${esc(otherDomain.id)}">${esc(DOMAINS[otherDomain.domain].label)} ${esc(test.level)}</a>` : ""}
        ${passedNow && nextLevel ? `<a class="btn btn--ghost" href="#/tests/${esc(nextLevel.toLowerCase())}-grammaire">Passer au ${esc(nextLevel)} ${icon("arrowRight")}</a>` : ""}
        <a class="btn btn--ghost" href="#/">Accueil</a>
      </div>
    </div>`;
    stage.querySelector("[data-restart]")?.addEventListener("click", () => {
      state.index = 0;
      state.answers = [];
      state.finished = false;
      renderQuestion();
    });
    stage.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  intro();
}
