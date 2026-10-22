import { store, actions } from "../core/store.js";
import { LISTENING_BY_ID, LISTENINGS, formatDuration } from "../core/listening.js";
import { mountQuiz } from "../components/quiz.js";
import { bindSpeakButtons, esc, icon, toast } from "../ui.js";

export function renderListening(root, id) {
  const item = LISTENING_BY_ID[id];
  if (!item) {
    root.innerHTML = `<div class="empty"><div class="e-icon">🎧</div><h3>Cette écoute n'existe pas</h3>
      <p>Le lien est peut-être incomplet.</p><a class="btn btn--primary" href="#/ecoute">Toutes les écoutes</a></div>`;
    return;
  }

  const progress = store.get();
  const state = progress.listenings?.[item.id];
  const next = LISTENINGS.find((entry) => entry.order === item.order + 1);

  root.innerHTML = `<div class="row" style="margin-bottom:10px">
    <a class="btn btn--ghost btn--sm" href="#/ecoute">${icon("arrowLeft")} Toutes les écoutes</a>
    <span class="spacer"></span>
    <span class="chip">${esc(item.level)}</span>
    <span class="chip">${formatDuration(item.seconds)}</span>
    ${state?.done ? `<span class="badge badge--mint">${icon("check")} Validée</span>` : `<span class="badge">${item.quiz.length} questions</span>`}
  </div>

  <div class="page-head">
    <div class="page-head-text">
      <span class="eyebrow">Compréhension orale · ${String(item.order).padStart(2, "0")}</span>
      <h1 class="h1">${esc(item.title)}</h1>
      <p class="lead">${esc(item.goal)}</p>
    </div>
    <div class="grammar-anchor">
      <span class="tiny muted">S'accroche à</span>
      <a class="btn btn--soft btn--sm" href="#/lecons/l${String(item.afterLesson).padStart(2, "0")}">Leçon ${item.afterLesson} ${icon("arrowRight")}</a>
    </div>
  </div>

  <div class="grid grid--sidebar">
    <div class="stack">
      <section class="card listen-player-card">
        <div class="listen-player-head">
          <span class="listen-avatar" aria-hidden="true">${icon("mic")}</span>
          <div style="min-width:0">
            <strong>${esc(item.speaker)}</strong>
            <span class="small muted">${esc(item.origin)} · ${formatDuration(item.seconds)}</span>
          </div>
          <span class="badge badge--violet" style="margin-left:auto">Voix native</span>
        </div>
        <video id="listen-video" class="listen-video" controls preload="metadata" playsinline poster="${esc(item.poster)}" aria-label="Extrait audio : ${esc(item.title)}">
          <source src="${esc(item.video)}" type="video/mp4" />
          Ton navigateur ne peut pas lire cette vidéo. La transcription reste disponible ci-dessous.
        </video>
        <div class="listen-controls">
          <button class="btn btn--soft btn--sm" type="button" data-replay>${icon("refresh")} Réécouter</button>
          <button class="btn btn--ghost btn--sm" type="button" data-slow aria-pressed="false">${icon("clock")} Vitesse 0,75×</button>
          <span class="spacer"></span>
          <button class="btn btn--ghost btn--sm" type="button" data-transcript aria-pressed="false">${icon("eye")} Transcription</button>
        </div>
        <p class="tiny muted" style="margin-top:10px">Écoute d'abord sans texte. Le bouton « Transcription » révèle le script quand tu en as besoin, pas avant.</p>
      </section>

      <section class="card listen-transcript" id="listen-transcript" hidden>
        <div class="row row--between" style="gap:10px;flex-wrap:wrap">
          <h2 class="h3">Transcription</h2>
          <button class="btn btn--ghost btn--sm" type="button" data-translation aria-pressed="false">${icon("eye")} Traduction française</button>
        </div>
        <p class="listen-es" lang="es">${esc(item.transcript.es)}</p>
        <p class="listen-fr" lang="fr" data-fr hidden>${esc(item.transcript.fr)}</p>
        <span class="tiny muted">Transcription issue de la source, ponctuée pour la lecture. La traduction française est celle de Violeta.</span>
      </section>

      <section class="card card--pad-lg" id="listen-quiz">
        <div class="row row--between" style="margin-bottom:12px">
          <div>
            <h2 class="h2" style="font-size:24px">Qu'est-ce que tu as compris ?</h2>
            <p class="small muted">${item.quiz.length} questions, corrigées sur place. Réussis-les toutes pour valider l'écoute.</p>
          </div>
          <span class="badge badge--violet">${esc(item.level)}</span>
        </div>
        <div id="listen-quiz-root"></div>
        <div id="listen-result"></div>
      </section>

      <p class="tiny muted">
        Source : <a href="${esc(item.source.url)}" target="_blank" rel="noopener noreferrer">${esc(item.source.task)}</a>,
        ${esc(item.source.collection)}, ${esc(item.source.author)} — licence
        <a href="${esc(item.source.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(item.source.license)}</a>.
        Vidéo compressée, transcription traduite et quiz ajoutés par Violeta.
      </p>
    </div>

    <aside class="stack">
      <div class="card">
        <span class="eyebrow">Avant d'écouter</span>
        <ul class="listen-steps">
          <li><strong>1.</strong> Regarde sans transcription : de quoi parle-t-on ?</li>
          <li><strong>2.</strong> Réécoute à 0,75× si besoin, puis ouvre le texte.</li>
          <li><strong>3.</strong> Réponds au quiz sans revenir en arrière.</li>
        </ul>
      </div>

      <div class="card">
        <h3 class="h3">Mots à repérer</h3>
        <div class="listen-glossary">
          ${item.glossary
            .map(
              (word) => `<button class="listen-word" type="button" data-speak="${esc(word.es)}" aria-label="Écouter ${esc(word.es)}">
                <span lang="es">${esc(word.es)}</span>
                <span class="tiny muted">${esc(word.fr)}</span>
              </button>`,
            )
            .join("")}
        </div>
        <p class="tiny muted" style="margin-top:8px">Touche un mot pour l'entendre. Les mots ne sont pas tous dans la transcription mot pour mot : cherche le sens.</p>
      </div>

      ${next
        ? `<div class="card">
            <span class="tiny muted">Écoute suivante</span>
            <h3 class="h3" style="margin:4px 0">${esc(next.title)}</h3>
            <p class="small muted">${esc(next.subtitle)} · ${formatDuration(next.seconds)}</p>
            <a class="btn btn--soft btn--sm" style="margin-top:10px" href="#/ecoute/${esc(next.id)}">Y aller ${icon("arrowRight")}</a>
          </div>`
        : ""}

      <div class="card card--tinted">
        <h3 class="h3">Pourquoi de vraies voix ?</h3>
        <p class="small muted">Le débit, les hésitations et les accents font partie de la langue. Une transcription aide à vérifier, elle ne remplace pas l'écoute.</p>
        <a class="btn btn--ghost btn--sm" style="margin-top:10px" href="#/ecoute">Toutes les écoutes ${icon("arrowRight")}</a>
      </div>
    </aside>
  </div>`;

  bindSpeakButtons(root);

  const video = root.querySelector("#listen-video");
  const slowBtn = root.querySelector("[data-slow]");
  const transcript = root.querySelector("#listen-transcript");
  const transcriptBtn = root.querySelector("[data-transcript]");
  const translationBtn = root.querySelector("[data-translation]");

  root.querySelector("[data-replay]")?.addEventListener("click", () => {
    if (!video) return;
    video.currentTime = 0;
    video.playbackRate = slowBtn?.getAttribute("aria-pressed") === "true" ? 0.75 : 1;
    video.play().catch(() => {});
  });

  slowBtn?.addEventListener("click", () => {
    if (!video) return;
    const slow = slowBtn.getAttribute("aria-pressed") !== "true";
    slowBtn.setAttribute("aria-pressed", String(slow));
    slowBtn.innerHTML = `${icon("clock")} ${slow ? "Vitesse normale" : "Vitesse 0,75×"}`;
    video.playbackRate = slow ? 0.75 : 1;
  });

  const toggleTranscript = (open) => {
    transcript.hidden = !open;
    transcriptBtn.setAttribute("aria-pressed", String(open));
    transcriptBtn.innerHTML = `${icon("eye")} ${open ? "Masquer le texte" : "Transcription"}`;
    if (open) transcript.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  transcriptBtn?.addEventListener("click", () => toggleTranscript(transcript.hidden));

  translationBtn?.addEventListener("click", () => {
    const fr = root.querySelector("[data-fr]");
    const open = fr.hidden;
    fr.hidden = !open;
    translationBtn.setAttribute("aria-pressed", String(open));
    translationBtn.innerHTML = `${icon("eye")} ${open ? "Masquer le français" : "Traduction française"}`;
  });

  video?.addEventListener("error", () => {
    video.insertAdjacentHTML("afterend", `<p class="small" style="color:#f2769c;margin-top:8px">La vidéo n'a pas pu être chargée. La transcription et le quiz restent disponibles.</p>`);
  });

  mountQuiz(root.querySelector("#listen-quiz-root"), item.quiz, {
    onComplete: ({ score, total }) => {
      actions.completeListening(item.id, { score, total });
      toast("Écoute validée");
      const result = root.querySelector("#listen-result");
      if (!result) return;
      result.innerHTML = `<div class="card card--tinted" style="margin-top:16px;border-color:var(--mint-line)">
        <div class="row row--between" style="gap:12px;flex-wrap:wrap">
          <div>
            <span class="eyebrow">${icon("check")} Écoute validée</span>
            <h3 class="h3" style="margin:2px 0">${esc(item.title)}</h3>
            <p class="small muted">${score}/${total} du premier coup. Tu peux réécouter, relire la transcription ou enchaîner.</p>
          </div>
          <div class="row" style="gap:8px;flex-wrap:wrap">
            <a class="btn btn--soft btn--sm" href="#/ecoute">Toutes les écoutes</a>
            ${next ? `<a class="btn btn--primary btn--sm" href="#/ecoute/${esc(next.id)}">Écoute suivante ${icon("arrowRight")}</a>` : `<a class="btn btn--primary btn--sm" href="#/">Retour à l'accueil</a>`}
          </div>
        </div>
      </div>`;
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
  });

  // Si la vidéo est relue une deuxième fois, le quiz n'a pas besoin d'être réinitialisé :
  // l'élève garde ses réponses, comme pour un exercice de compréhension classique.
}
