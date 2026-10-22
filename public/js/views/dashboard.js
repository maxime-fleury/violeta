import { store } from "../core/store.js";
import { overallStats, nextLessonFor, lastCompletedLesson, contentTotals } from "../core/stats.js";
import { INTEGRATED_WORDS, COVERAGE_PERCENT } from "../core/coverage.js";
import { CURRICULUM } from "../core/curriculum.js";
import { RECITS } from "../data/recits.js";
import { GRAMMAR, nextGrammarFor } from "../core/grammar.js";
import { LISTENINGS, nextListeningFor } from "../core/listening.js";
import { DOMAINS, LEVELS, testsSummary, testEntry, testUnlocked, isTestPassed } from "../core/tests.js";
import { streakDays, todayKey } from "../core/progress.js";
import { formatDate, plural, todayLabel, icon, ring, bar, esc } from "../ui.js";

function testsMarkup(tests, progress) {
  const cards = tests.levels.map(({ level, tests: list, passed, complete }) => {
    const meta = LEVELS[level];
    const rows = list.map((test) => {
      const entry = testEntry(progress, test.id);
      const ok = isTestPassed(progress, test.id);
      const locked = !testUnlocked(progress, test);
      const detail = locked
        ? `Après ${meta.gate} leçons`
        : ok
          ? `Validé · ${entry.bestScore}/${entry.bestTotal}`
          : entry?.bestTotal
            ? `Meilleur : ${entry.bestScore}/${entry.bestTotal}`
            : test.subtitle;
      return `<a class="level-test-row ${ok ? "is-passed" : ""} ${locked ? "is-locked" : ""}" href="#/tests/${esc(test.id)}">
        <span class="ltr-icon">${icon(DOMAINS[test.domain].icon)}</span>
        <span class="ltr-label"><strong>${esc(DOMAINS[test.domain].label)}</strong><span class="tiny muted">${esc(detail)}</span></span>
        <span class="ltr-end">${ok ? icon("check") : locked ? icon("lock") : icon("chevron")}</span>
      </a>`;
    }).join("");
    return `<div class="level-test-card ${complete ? "is-complete" : ""}">
      <div class="level-test-head">
        <span class="level-flag">${level}</span>
        <span class="ltr-head-text"><strong>${esc(meta.name)}</strong><span class="tiny muted">${passed}/${list.length} validé${passed > 1 ? "s" : ""}</span></span>
        ${complete ? `<span class="badge badge--mint">${icon("trophy")} Complet</span>` : ""}
      </div>
      <div class="level-test-rows">${rows}</div>
    </div>`;
  }).join("");
  return `<section class="home-tests" aria-labelledby="home-tests-title">
    <div class="section-title">
      <div>
        <h2 id="home-tests-title">Tes tests de niveau</h2>
        <p class="tiny muted" style="margin-top:4px">Six épreuves courtes, à passer quand tu veux : grammaire et vocabulaire pour A1, A2 et B1. 10 bonnes réponses sur 12 pour valider.</p>
      </div>
      <span class="badge ${tests.passed ? "badge--mint" : ""}">${tests.passed}/${tests.total} validés</span>
    </div>
    <div class="level-test-grid">${cards}</div>
  </section>`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

function lastSevenDays(progress) {
  const days = new Set(progress.activity.map((a) => a.day));
  const out = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 6);
  for (let i = 0; i < 7; i++) {
    const key = todayKey(cursor);
    out.push({ key, active: days.has(key), label: cursor.toLocaleDateString("fr-FR", { weekday: "narrow" }) });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export function renderDashboard(root) {
  const progress = store.get();
  const stats = overallStats(progress);
  const totals = contentTotals();
  const next = nextLessonFor(progress);
  const last = lastCompletedLesson(progress);
  const allDone = next && progress.lessons[next.id]?.status === "done";
  const streak = streakDays(progress);
  const nextNumber = next ? String(next.order).padStart(2, "0") : "—";
  const grammarNext = nextGrammarFor(progress);
  const listeningNext = nextListeningFor(progress);
  const tests = testsSummary(progress);

  const nextRecit = RECITS.find((recit) => {
    const previous = CURRICULUM.filter((lesson) => lesson.order <= recit.afterLesson);
    const unlocked = previous.every((lesson) => progress.lessons[lesson.id]?.status === "done");
    return unlocked && !progress.stories?.[recit.id]?.done;
  });

  const recent = Object.entries(progress.lessons)
    .filter(([, l]) => l.status === "done" && l.completedAt)
    .sort((a, b) => new Date(b[1].completedAt) - new Date(a[1].completedAt))
    .slice(0, 4)
    .map(([id, l]) => ({ id, ...l }));

  root.innerHTML = `<div class="page-head">
    <div class="page-head-text">
      <span class="eyebrow">${esc(todayLabel())}</span>
      <h1 class="h1">${greeting()},<br />on apprend un peu ?</h1>
      <p class="lead">Des dialogues vivants, un Memory pour ancrer les mots, et un appartement à explorer. Tout se joue à ton rythme.</p>
    </div>
    <div class="row row--tight">
      <span class="chip chip--violet">${icon("flame")} ${plural(streak, "jour", "jours")} d'affilée</span>
      <a class="btn btn--sm" href="#/vocabulaire">${icon("search")} Mon lexique</a>
    </div>
  </div>

  <section class="hero" aria-labelledby="hero-title">
    <div>
      <span class="eyebrow">${allDone ? "Tout le parcours est validé" : `Prochaine étape · leçon ${nextNumber}`}</span>
      <h1 id="hero-title">${allDone ? "Place aux révisions !" : esc(next?.title || "Ton premier dialogue")}</h1>
      <p>${allDone ? "Tu as terminé les leçons disponibles. Révise tes mots fragiles ou explore les environnements pour continuer à progresser." : esc(next?.subtitle || "Faire connaissance avec sa voisine")}</p>
      <div class="hero-actions">
        ${allDone
          ? `<a class="btn btn--primary" href="#/revisions">${icon("refresh")} Réviser mes mots</a>
             <a class="btn btn--ghost" href="#/lecons">Revoir les leçons</a>
             <a class="btn btn--ghost" href="#/tests/a1-vocabulaire">${icon("trophy")} Tests de niveau</a>`
          : `<a class="btn btn--primary" href="#/lecons/${esc(next?.id || "l01")}">${icon("play")} ${progress.lessons[next?.id]?.status === "inProgress" ? "Reprendre" : "Commencer"} la leçon</a>
             <a class="btn btn--ghost" href="#/lecons">Voir le parcours</a>`}
      </div>
    </div>
    <div class="hero-side">
      ${ring(stats.percent, { size: 118, stroke: 9, label: `${stats.percent} % du parcours` })}
      <span class="hero-ring-label">${stats.lessonsDone}/${totals.lessons} leçons</span>
    </div>
  </section>

  <div class="stat-grid" style="margin-top:16px">
    <div class="stat"><span class="stat-label">Mots découverts</span><span class="stat-value">${stats.discovered}<small> / 1000</small></span></div>
    <div class="stat"><span class="stat-label">Mots maîtrisés</span><span class="stat-value">${stats.mastered}<small> / 1000</small></span></div>
    <div class="stat"><span class="stat-label">Leçons validées</span><span class="stat-value">${stats.lessonsDone}<small> / ${totals.lessons}</small></span></div>
    <div class="stat"><span class="stat-label">Niveaux explorés</span><span class="stat-value">${stats.levelsDone}<small> / ${totals.levels}</small></span></div>
  </div>

  <div class="quick-grid" style="margin-top:16px">
    <a class="quick-card" href="#/revisions">
      <span class="quick-icon">${icon("refresh")}</span>
      <span><strong>Réviser en Memory</strong><span>Mélange les leçons validées</span></span>
      <span class="arrow">${icon("chevron")}</span>
    </a>
    ${nextRecit ? `<a class="quick-card" href="#/recits/${esc(nextRecit.id)}">
      <span class="quick-icon quick-icon--violet">${icon("book")}</span>
      <span><strong>${esc(nextRecit.title)}</strong><span>Récit de révision · à lire à voix haute</span></span>
      <span class="arrow">${icon("chevron")}</span>
    </a>` : ""}
    <a class="quick-card" href="#/themes/expr-05">
      <span class="quick-icon quick-icon--sun">${icon("sparkles")}</span>
      <span><strong>Les 100 expressions</strong><span>Parler tout de suite</span></span>
      <span class="arrow">${icon("chevron")}</span>
    </a>
    <a class="quick-card" href="#/grammaire">
      <span class="quick-icon quick-icon--sun">${icon("layers")}</span>
      <span><strong>${esc(grammarNext?.title || "La grammaire")}</strong><span>${stats.grammarDone}/${GRAMMAR.length} points validés</span></span>
      <span class="arrow">${icon("chevron")}</span>
    </a>
    <a class="quick-card" href="#/ecoute">
      <span class="quick-icon quick-icon--mint">${icon("mic")}</span>
      <span><strong>${esc(listeningNext?.title || "Les écoutes")}</strong><span>${stats.listeningsDone}/${LISTENINGS.length} voix réelles validées</span></span>
      <span class="arrow">${icon("chevron")}</span>
    </a>
    <a class="quick-card" href="#/explorer/apartamento">
      <span class="quick-icon quick-icon--mint">${icon("compass")}</span>
      <span><strong>L'appartement</strong><span>9 scènes à explorer</span></span>
      <span class="arrow">${icon("chevron")}</span>
    </a>
  </div>

  ${testsMarkup(tests, progress)}

  <div class="grid grid--sidebar" style="margin-top:26px">
    <div class="stack">
      <div class="section-title"><h2>Ton parcours</h2><a href="#/lecons">Toutes les leçons ${icon("arrowRight")}</a></div>
      ${last ? `<div class="card continue-card">
        <div class="continue-head">
          <span class="lesson-index">${String(last.order).padStart(2, "0")}</span>
          <div style="min-width:0">
            <span class="tiny muted">Dernière leçon validée</span>
            <h3 class="h3">${esc(last.title)}</h3>
            <p class="small muted">${esc(last.subtitle)}</p>
          </div>
          <span class="badge badge--mint" style="margin-left:auto">${icon("check")} Validée</span>
        </div>
        <div class="row row--between">
          <span class="small muted">${last.newWords.length} nouveaux mots · ${progress.lessons[last.id]?.bestCoups ?? "—"} coups au meilleur Memory</span>
          <a class="btn btn--soft btn--sm" href="#/lecons/${esc(last.id)}">Relire ${icon("arrowRight")}</a>
        </div>
      </div>` : `<div class="card continue-card">
        <div class="continue-head">
          <span class="lesson-index">01</span>
          <div><h3 class="h3">Tout commence ici</h3><p class="small muted">La première leçon introduit 12 mots et se termine par un Memory de 2 manches.</p></div>
        </div>
        <div class="row"><a class="btn btn--primary btn--sm" href="#/lecons/l01">Ouvrir la leçon 1 ${icon("arrowRight")}</a></div>
      </div>`}

      <div class="card">
        <div class="row row--between" style="margin-bottom:6px">
          <h3 class="h3">Dernières leçons</h3>
          <span class="tiny muted">${recent.length ? "Tes validations récentes" : "Rien encore"}</span>
        </div>
        ${recent.length
          ? `<div class="recent-list">${recent
              .map((l) => `<a class="recent-item" href="#/lecons/${esc(l.id)}">
                <span class="recent-badge">${icon("check")}</span>
                <span style="min-width:0"><strong>${esc(l.title)}</strong><br /><small>${esc(l.completedAt ? formatDate(l.completedAt) : "")}</small></span>
                <span class="spacer"></span>
                <span class="badge">${l.bestCoups ?? "—"} coups</span>
              </a>`)
              .join("")}</div>`
          : `<p class="small muted" style="padding:8px 2px 4px">Valide ton premier Memory pour voir apparaître tes leçons ici.</p>`}
      </div>
    </div>

    <div class="stack">
      <div class="card card--tinted">
        <div class="row row--between">
          <h3 class="h3">${icon("flame")} Ta régularité</h3>
          <span class="badge badge--violet">${plural(streak, "jour", "jours")}</span>
        </div>
        <div class="row" style="gap:6px;margin:14px 0 10px">
          ${lastSevenDays(progress).map((d) => `<span title="${esc(d.key)}" style="width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-size:11px;font-weight:700;background:${d.active ? "var(--primary)" : "var(--surface-2)"};color:${d.active ? "#fff" : "var(--ink-mute)"}">${esc(d.label)}</span>`).join("")}
        </div>
        <p class="tiny muted">Chaque leçon, révision ou objet découvert compte. Reviens demain pour prolonger la série.</p>
      </div>

      <div class="card">
        <h3 class="h3">Le lexique cible</h3>
        <p class="small muted" style="margin:6px 0 12px">${INTEGRATED_WORDS.length.toLocaleString("fr-FR")} mots sur 1 000 sont déjà dans du contenu jouable : leçons, thèmes ou environnements.</p>
        <div class="bar" aria-hidden="true"><div class="bar-fill bar-fill--sun" style="width:${COVERAGE_PERCENT}%"></div></div>
        <div class="row row--between" style="margin-top:8px">
          <span class="tiny muted">${INTEGRATED_WORDS.length.toLocaleString("fr-FR")} / 1 000 intégrés</span>
          <a class="tiny" href="#/vocabulaire">Explorer le lexique</a>
        </div>
      </div>

      <div class="coverage-note">
        ${icon("info", "info-ico")}
        <span>Tu peux ouvrir n'importe quelle leçon, même sans avoir terminé les précédentes. L'ordre est conseillé, pas imposé.</span>
      </div>
    </div>
  </div>`;
}
