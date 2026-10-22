import { CURRICULUM, lessonWordList } from "../core/curriculum.js";
import { store, actions } from "../core/store.js";
import { DIFFICULTIES, dedupeWords, selectReviewWords } from "../core/memory.js";
import { MASTERY_TARGET } from "../core/memory.js";
import { mountMemory } from "../components/memory-board.js";
import { $, esc, icon, plural, toast } from "../ui.js";

export function renderReviews(root) {
  const doneLessons = CURRICULUM.filter((l) => store.get().lessons[l.id]?.status === "done");
  if (!doneLessons.length) {
    root.innerHTML = `<div class="page-head">
      <div class="page-head-text">
        <span class="eyebrow">Révisions</span>
        <h1 class="h1">Le Memory libre</h1>
        <p class="lead">Valide au moins une leçon pour débloquer les révisions. Tu pourras ensuite mélanger les mots de plusieurs leçons, sans doublons.</p>
      </div>
    </div>
    <div class="empty">
      <div class="e-icon">🃏</div>
      <h3>Pas encore de leçon validée</h3>
      <p>Termine le Memory d'une première leçon : ses mots rejoindront automatiquement ta réserve de révision.</p>
      <a class="btn btn--primary" href="#/lecons/l01">Commencer la leçon 1 ${icon("arrowRight")}</a>
    </div>`;
    return;
  }

  const abort = new AbortController();
  let selected = new Set(doneLessons.map((l) => l.id));
  let difficulty = "moyen";
  let memory = null;
  let lastRound = null;
  let closed = false;

  window.addEventListener(
    "hashchange",
    () => {
      closed = true;
      memory?.destroy?.();
      abort.abort();
    },
    { once: true, signal: abort.signal },
  );

  const selectedWords = () => dedupeWords(doneLessons.filter((l) => selected.has(l.id)).flatMap((l) => lessonWordList(l)));
  const weakCount = () => {
    const progress = store.get();
    return selectedWords().filter((w) => (progress.words[w.id]?.mistakes || 0) > 0).length;
  };

  function renderHome() {
    const progress = store.get();
    const words = selectedWords();
    const pairs = DIFFICULTIES[difficulty].pairs;
    root.innerHTML = `<div class="page-head">
      <div class="page-head-text">
        <span class="eyebrow">Révisions</span>
        <h1 class="h1">Mélange les leçons,<br />ancre les mots</h1>
        <p class="lead">Choisis les leçons validées que tu veux réviser. Les mots fragiles — ceux qui t'ont fait hésiter — reviennent en priorité.</p>
      </div>
      <span class="badge badge--sun">${icon("flame")} ${plural(progress.reviews.sessions, "session", "sessions")} de révision</span>
    </div>

    <div class="grid grid--sidebar">
      <div class="card">
        <div class="row row--between" style="margin-bottom:12px">
          <h3 class="h3">Leçons à réviser</h3>
          <div class="row row--tight">
            <button class="btn btn--ghost btn--sm" type="button" data-select-all>Tout sélectionner</button>
            <button class="btn btn--ghost btn--sm" type="button" data-select-none>Effacer</button>
          </div>
        </div>
        <div class="check-list">
          ${doneLessons
            .map(
              (l) => `<label class="check-chip">
                <input type="checkbox" value="${esc(l.id)}" ${selected.has(l.id) ? "checked" : ""} data-lesson />
                <span class="check-box" aria-hidden="true">${icon("check")}</span>
                <span class="check-body">
                  <strong>${String(l.order).padStart(2, "0")} · ${esc(l.title)}</strong>
                  <small>${l.newWords.length} mots · ${esc(l.level)}</small>
                </span>
              </label>`,
            )
            .join("")}
        </div>
      </div>

      <div class="stack">
        <div class="card card--tinted">
          <span class="eyebrow">Ta partie</span>
          <div class="row row--between" style="margin-top:4px">
            <span class="small muted">Mots disponibles</span>
            <strong data-word-count>${words.length}</strong>
          </div>
          <div class="row row--between" style="margin-top:6px">
            <span class="small muted">Mots fragiles prioritaires</span>
            <strong data-weak-count>${weakCount()}</strong>
          </div>
          <div class="divider"></div>
          <span class="tiny muted">Difficulté</span>
          <div class="segmented" role="group" aria-label="Difficulté" style="margin-top:6px;flex-wrap:wrap">
            ${Object.entries(DIFFICULTIES)
              .map(
                ([key, d]) => `<button type="button" data-diff="${key}" aria-pressed="${key === difficulty}">${d.label}</button>`,
              )
              .join("")}
          </div>
          <p class="tiny muted" style="margin-top:8px" data-diff-hint>${DIFFICULTIES[difficulty].hint}</p>
          <button class="btn btn--primary" type="button" data-start style="width:100%;margin-top:14px" ${words.length < 2 ? "disabled" : ""}>
            ${icon("play")} Lancer la révision
          </button>
          <p class="tiny muted" style="margin-top:8px;text-align:center">Les mots en commun entre deux leçons ne comptent qu'une fois.</p>
        </div>

        <div class="card">
          <h3 class="h3">${icon("target")} Comment ça marche</h3>
          <ul class="small muted" style="margin-top:8px;display:grid;gap:7px;list-style:none">
            <li>· Chaque paire trouvée renforce les deux mots.</li>
            <li>· Un mot est maîtrisé après ${MASTERY_TARGET} réussites.</li>
            <li>· Les erreurs augmentent sa priorité de retour.</li>
          </ul>
        </div>
      </div>
    </div>`;
    syncSummary();
  }

  function syncSummary() {
    const words = selectedWords();
    const countNode = $("[data-word-count]", root);
    if (countNode) countNode.textContent = String(words.length);
    const weakNode = $("[data-weak-count]", root);
    if (weakNode) weakNode.textContent = String(weakCount());
    const start = $("[data-start]", root);
    if (start) start.disabled = words.length < 2;
    const hint = $("[data-diff-hint]", root);
    if (hint) hint.textContent = DIFFICULTIES[difficulty].hint;
  }

  function startReview() {
    if (closed) return;
    const words = selectedWords();
    if (words.length < 2) return toast("Sélectionne au moins deux mots.");
    const pairs = DIFFICULTIES[difficulty].pairs;
    const chosen = selectReviewWords(words, store.get(), { pairs });
    root.innerHTML = `<div class="breadcrumb"><a href="#/revisions">Révisions</a><span class="sep">/</span><span>Session</span></div>
      <div class="page-head">
        <div class="page-head-text">
          <span class="eyebrow">Memory libre</span>
          <h1 class="h1">${DIFFICULTIES[difficulty].label}</h1>
          <p class="lead">${chosen.length} paires tirées de ${selected.size} leçon${selected.size > 1 ? "s" : ""}${weakCount() ? ", avec priorité aux mots fragiles" : ""}.</p>
        </div>
        <button class="btn btn--ghost btn--sm" type="button" data-back>${icon("arrowLeft")} Modifier la sélection</button>
      </div>
      <div class="card card--pad-lg" id="review-board"></div>`;

    const board = $("#review-board", root);
    memory?.destroy?.();
    memory = mountMemory(board, chosen, {
      onMatch: (id) => actions.markCorrect([id]),
      onMistake: (ids) => actions.markMistake(ids),
      onComplete: ({ coups }) => {
        if (closed) return;
        actions.recordReview({ words: chosen.map((w) => w.id), coups });
        lastRound = { words: chosen, coups };
        renderSuccess();
      },
    });
    board?.addEventListener("memory:restart", () => {
      memory?.destroy?.();
      startReview();
    });
  }

  function renderSuccess() {
    const progress = store.get();
    const fragile = lastRound.words.filter((w) => (progress.words[w.id]?.mistakes || 0) > 0);
    root.innerHTML = `<div class="card success">
      <div class="confetti" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<span style="left:${(i * 7.4) % 100}%;background:${["#6d4dff", "#f0b429", "#2fa98c", "#e98a4e"][i % 4]};animation-delay:${(i % 5) * 0.1}s"></span>`).join("")}</div>
      <div class="check-badge">${icon("refresh")}</div>
      <span class="eyebrow" style="justify-content:center">Session terminée</span>
      <h2>Bien joué !</h2>
      <p class="muted">${lastRound.words.length} paires retrouvées en ${lastRound.coups} coups.</p>
      <div class="success-stats">
        <span class="chip chip--violet">${icon("target")} ${lastRound.words.length} mots revus</span>
        <span class="chip">${icon("flame")} ${plural(progress.reviews.sessions, "session", "sessions")} au total</span>
      </div>
      ${fragile.length ? `<div class="note-box" style="max-width:520px;text-align:left">${icon("info", "info-ico")}<span>${fragile.length} mot${fragile.length > 1 ? "s" : ""} à consolider : ${fragile.slice(0, 8).map((w) => `<strong>${esc(w.es)}</strong>`).join(", ")}.</span></div>` : `<div class="note-box" style="max-width:520px;text-align:left">${icon("check", "info-ico")}<span>Aucune hésitation sur cette sélection. Tu peux corser la difficulté.</span></div>`}
      <div class="success-actions">
        <button class="btn btn--primary" type="button" data-replay>${icon("play")} Nouvelle sélection</button>
        <button class="btn" type="button" data-back>${icon("arrowLeft")} Changer les leçons</button>
      </div>
    </div>`;
  }

  root.addEventListener(
    "click",
    (event) => {
      if (event.target.closest("[data-back]")) {
        memory?.destroy?.();
        renderHome();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (event.target.closest("[data-replay]")) {
        memory?.destroy?.();
        startReview();
        return;
      }
      if (event.target.closest("[data-start]")) {
        startReview();
        return;
      }
      if (event.target.closest("[data-select-all]")) {
        selected = new Set(doneLessons.map((l) => l.id));
        for (const cb of root.querySelectorAll("[data-lesson]")) cb.checked = true;
        syncSummary();
        return;
      }
      if (event.target.closest("[data-select-none]")) {
        selected.clear();
        for (const cb of root.querySelectorAll("[data-lesson]")) cb.checked = false;
        syncSummary();
        return;
      }
      const diff = event.target.closest("[data-diff]");
      if (diff) {
        difficulty = diff.dataset.diff;
        for (const b of root.querySelectorAll("[data-diff]")) b.setAttribute("aria-pressed", String(b === diff));
        syncSummary();
      }
    },
    { signal: abort.signal },
  );

  root.addEventListener(
    "change",
    (event) => {
      const cb = event.target.closest("[data-lesson]");
      if (!cb) return;
      if (cb.checked) selected.add(cb.value);
      else selected.delete(cb.value);
      syncSummary();
    },
    { signal: abort.signal },
  );

  renderHome();
}
