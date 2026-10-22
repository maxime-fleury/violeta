import { ENVIRONMENTS_BY_ID, findLevel, allLevels } from "../data/environments.js";
import { store, actions } from "../core/store.js";
import { LEXICON_BY_ID } from "../data/lexicon.js";
import { renderDialogue, bindDialogue } from "../components/dialogue.js";
import { mountQuiz } from "../components/quiz.js";
import { $, esc, icon, plural, toast } from "../ui.js";
import { speak } from "../audio.js";

function levelState(levelId) {
  return store.get().environments[levelId] || { discovered: [], done: false, attempts: 0 };
}

function envHome(root, env) {
  const progress = store.get();
  const levels = env.rooms.flatMap((room) => room.levels);
  const done = levels.filter((l) => progress.environments[l.id]?.done).length;
  const found = new Set();
  for (const level of levels) for (const id of progress.environments[level.id]?.discovered || []) found.add(id);
  const focus = [...new Set(levels.flatMap((l) => l.focus))];

  root.innerHTML = `<div class="breadcrumb"><a href="#/explorer">Environnements</a><span class="sep">/</span><span>${esc(env.title)}</span></div>
    <div class="env-hero" style="margin-bottom:24px">
      <div class="row" style="gap:16px;align-items:flex-start">
        <span class="env-icon" style="background:${env.color}18;color:${env.color}">${env.icon}</span>
        <div>
          <span class="eyebrow" style="color:${env.color}">Exploration visuelle</span>
          <h1 class="h1">${esc(env.title)}</h1>
          <p class="lead" style="margin-top:6px">${esc(env.subtitle)}</p>
        </div>
      </div>
      <div class="stack" style="min-width:190px">
        <div class="row row--between"><span class="small muted">Progression</span><strong>${done}/${levels.length}</strong></div>
        <div class="bar"><div class="bar-fill bar-fill--mint" style="width:${Math.round((done / levels.length) * 100)}%"></div></div>
        <span class="tiny muted">${found.size}/${focus.length} objets découverts</span>
      </div>
    </div>

    <div class="room-grid">
      ${env.rooms
        .map(
          (room) => `<section class="card room-card">
            <h3><span aria-hidden="true">${room.icon}</span> ${esc(room.title)} <small class="tiny muted" style="font-weight:400">· ${esc(room.es)}</small></h3>
            <div class="level-list">
              ${room.levels
                .map((level) => {
                  const st = progress.environments[level.id];
                  const discovered = (st?.discovered || []).filter((id) => level.focus.includes(id)).length;
                  return `<a class="level-row ${st?.done ? "is-done" : ""}" href="#/explorer/${esc(env.id)}/${esc(level.id)}">
                    <span aria-hidden="true">${st?.done ? icon("check") : icon("chevron")}</span>
                    <span class="level-name">${esc(level.title)}</span>
                    <span class="level-meta">${discovered}/${level.focus.length} objets${st?.done ? " · terminé" : ""}</span>
                  </a>`;
                })
                .join("")}
            </div>
          </section>`,
        )
        .join("")}
    </div>

    <div class="note-box" style="margin-top:20px">${icon("info", "info-ico")}
      <span>Découvrir tous les objets débloque le dialogue du niveau. La maîtrise, elle, vient du quiz final : un simple survol ne suffit pas.</span>
    </div>`;
}

function levelView(root, env, room, level, abort, lifecycle) {
  const all = allLevels();
  const position = all.findIndex(({ level: l }) => l.id === level.id);
  const next = all[position + 1] || null;
  const prev = all[position - 1] || null;
  const initial = levelState(level.id);
  const found = new Set(initial.discovered.filter((id) => level.focus.includes(id)));
  const focus = level.focus;
  const viewBox = level.scene.viewBox.split(/\s+/).map(Number);
  const vbWidth = viewBox[2] || 800;
  const vbHeight = viewBox[3] || 520;
  const pseudoLesson = { id: level.id, newWords: focus, contextGloss: {} };
  let quizMounted = false;

  const objectById = (id) => level.scene.objects.find((o) => o.id === id);

  const hotspotMarkup = (o) => {
    const isFound = found.has(o.id);
    return `<g class="hotspot ${isFound ? "is-found" : ""}" data-object="${esc(o.id)}" role="button" tabindex="0"
      aria-label="${esc(o.es)}, ${esc(o.fr)}${isFound ? ", découvert" : ""}">
      <g class="art">${o.art}</g>
      <g class="hit">${o.hit}</g>
      ${isFound ? `<circle class="found-dot" cx="${o.labelAt.x + 20}" cy="${o.labelAt.y - 6}" r="7"/>` : ""}
    </g>`;
  };

  const renderSvg = () =>
    level.scene.objects
      .map((o) => (focus.includes(o.id) ? hotspotMarkup(o) : `<g class="decor" aria-hidden="true">${o.art}</g>`))
      .join("");

  root.innerHTML = `<div class="breadcrumb"><a href="#/explorer">Environnements</a><span class="sep">/</span><a href="#/explorer/${esc(env.id)}">${esc(env.title)}</a><span class="sep">/</span><span>${esc(room.title)}</span></div>
    <div class="page-head" style="margin-bottom:18px">
      <div class="page-head-text">
        <span class="eyebrow">${esc(env.title)} · ${esc(room.title)}</span>
        <h1 class="h1" style="font-size:clamp(28px,3.6vw,42px)">${esc(level.title)}</h1>
        <p class="lead" style="margin-top:6px">${esc(level.subtitle)}</p>
      </div>
      <div class="row row--tight">
        <span class="badge badge--violet" id="level-status">${initial.done ? `${icon("check")} Niveau terminé` : "En exploration"}</span>
        <a class="btn btn--ghost btn--sm" href="#/explorer/${esc(env.id)}">${icon("arrowLeft")} La pièce</a>
      </div>
    </div>

    <div class="scene-shell">
      <div class="scene-stage">
        <div class="scene-toolbar">
          <div class="scene-count">
            <span class="strong" data-found>${found.size}</span>
            <span>objet${found.size > 1 ? "s" : ""} découvert${found.size > 1 ? "s" : ""} sur ${focus.length}</span>
            <div class="scene-progress" data-bar>${`<div class="bar"><div class="bar-fill bar-fill--mint" style="width:${Math.round((found.size / focus.length) * 100)}%"></div></div>`}</div>
          </div>
          <span class="scene-legend">${icon("eye")} Survole ou touche un objet pour découvrir son nom</span>
        </div>
        <div class="scene-canvas" id="scene-canvas">
          <svg class="scene-svg" viewBox="${esc(level.scene.viewBox)}" role="group" aria-label="Scène interactive : ${esc(level.title)}">
            <title>${esc(level.title)} — ${esc(level.subtitle)}</title>
            <g aria-hidden="true">${level.scene.backdrop}</g>
            <g id="scene-objects">${renderSvg()}</g>
          </svg>
          <div class="scene-tip" id="scene-tip" hidden></div>
        </div>
      </div>

      <div id="level-dialogue"></div>
      <div id="level-quiz"></div>
    </div>

    <div class="row row--between" style="margin-top:22px">
      ${prev ? `<a class="btn btn--ghost btn--sm" href="#/explorer/${esc(prev.env.id)}/${esc(prev.level.id)}">${icon("arrowLeft")} ${esc(prev.level.title)}</a>` : `<span></span>`}
      ${next ? `<a class="btn btn--sm" href="#/explorer/${esc(next.env.id)}/${esc(next.level.id)}">${esc(next.level.title)} ${icon("arrowRight")}</a>` : `<a class="btn btn--sm" href="#/explorer">Tous les environnements ${icon("arrowRight")}</a>`}
    </div>`;

  const canvas = $("#scene-canvas", root);
  const tip = $("#scene-tip", root);
  const objectsNode = $("#scene-objects", root);

  function showTip(o) {
    tip.innerHTML = `<strong lang="es">${esc(o.es)}</strong><span>${esc(o.fr)}</span>`;
    const x = Math.min(88, Math.max(12, (o.labelAt.x / vbWidth) * 100));
    const y = Math.max(12, (o.labelAt.y / vbHeight) * 100);
    tip.style.left = `${x}%`;
    tip.style.top = `${y}%`;
    tip.hidden = false;
  }
  function hideTip() {
    tip.hidden = true;
  }

  function refreshProgress() {
    const countNode = $("[data-found]", root);
    if (countNode) countNode.textContent = String(found.size);
    const barNode = $("[data-bar]", root);
    if (barNode) barNode.innerHTML = `<div class="bar"><div class="bar-fill bar-fill--mint" style="width:${Math.round((found.size / focus.length) * 100)}%"></div></div>`;
    if (found.size === focus.length) unlock();
  }

  function discover(id, node) {
    const object = objectById(id);
    if (!object) return;
    const already = found.has(id);
    if (!already) {
      found.add(id);
      actions.discoverObject(level.id, id);
      node?.classList.add("is-found");
      node?.setAttribute("aria-label", `${object.es}, ${object.fr}, découvert`);
      if (node && !node.querySelector(".found-dot")) {
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("class", "found-dot");
        dot.setAttribute("cx", String(object.labelAt.x + 20));
        dot.setAttribute("cy", String(object.labelAt.y - 6));
        dot.setAttribute("r", "7");
        node.appendChild(dot);
      }
      if (store.get().settings.audio !== false) speak(object.es);
      toast(`${object.es} — ${object.fr}`);
      refreshProgress();
    } else {
      showTip(object);
    }
  }

  function unlock() {
    const dialogueSlot = $("#level-dialogue", root);
    if (dialogueSlot && !dialogueSlot.dataset.ready) {
      dialogueSlot.dataset.ready = "1";
      dialogueSlot.innerHTML = `<div class="card card--pad-lg">
        <div class="row row--between" style="margin-bottom:10px">
          <div>
            <span class="eyebrow">Dialogue débloqué</span>
            <h2 class="h2" style="font-size:26px">La scène en espagnol</h2>
          </div>
          <span class="badge badge--mint">${icon("check")} Tous les objets découverts</span>
        </div>
        <p class="small muted" style="margin-bottom:10px">Retrouve les objets du niveau dans une conversation. Touche un mot pour sa traduction.</p>
        ${renderDialogue(level.lines, { lesson: pseudoLesson, knownWords: new Set(), showTranslation: false })}
      </div>`;
      bindDialogue(dialogueSlot, { onSeen: (wid) => actions.seeWord(wid) });
      showQuiz();
      window.setTimeout(() => dialogueSlot.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  }

  function showQuiz() {
    if (quizMounted || lifecycle.closed) return;
    quizMounted = true;
    const slot = $("#level-quiz", root);
    if (!slot) return;
    slot.innerHTML = `<div class="card card--pad-lg" style="margin-top:16px">
      <div class="row row--between" style="margin-bottom:8px">
        <div>
          <span class="eyebrow">Exercice final</span>
          <h2 class="h2" style="font-size:26px">Vérifie ce que tu as vu</h2>
        </div>
        <span class="badge badge--violet">${level.quiz.length} questions</span>
      </div>
      <div id="scene-quiz"></div>
    </div>`;
    lifecycle.quiz = mountQuiz($("#scene-quiz", slot), level.quiz, {
      intro: "Réussis toutes les questions pour terminer le niveau.",
      onComplete: ({ score, total }) => {
        if (lifecycle.closed) return;
        actions.completeEnvironment(level.id, { score, total, words: focus });
        const status = $("#level-status", root);
        if (status) status.innerHTML = `${icon("check")} Niveau terminé`;
        $("#scene-quiz", root).innerHTML = `<div class="success" style="padding:24px 6px">
          <div class="check-badge">${icon("trophy")}</div>
          <h2 style="font-size:27px">Niveau terminé !</h2>
          <p class="muted">${score}/${total} réponses justes du premier coup · ${focus.length} objets explorés.</p>
          <div class="success-actions">
            ${next ? `<a class="btn btn--primary" href="#/explorer/${esc(next.env.id)}/${esc(next.level.id)}">Niveau suivant ${icon("arrowRight")}</a>` : `<a class="btn btn--primary" href="#/explorer">Tous les environnements ${icon("arrowRight")}</a>`}
            <a class="btn" href="#/explorer/${esc(env.id)}">Retour à ${esc(env.title)}</a>
            <a class="btn btn--ghost" href="#/vocabulaire">Mes mots</a>
          </div>
        </div>`;
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      },
    });
  }

  function lockedPanel() {
    const remaining = focus.length - found.size;
    $("#level-dialogue", root).innerHTML = `<div class="scene-locked">
      <span class="row row--tight">${icon("lock")} <span>Découvre encore <strong>${remaining}</strong> objet${remaining > 1 ? "s" : ""} pour débloquer le dialogue et l'exercice.</span></span>
      <span class="tiny muted">${focus.length} objets au total</span>
    </div>`;
  }

  // Interactions souris / tactile / clavier.
  objectsNode.addEventListener("pointerover", (event) => {
    const hotspot = event.target.closest(".hotspot");
    if (!hotspot || event.pointerType === "touch") return;
    const object = objectById(hotspot.dataset.object);
    if (object) showTip(object);
  });
  objectsNode.addEventListener("pointerout", (event) => {
    const hotspot = event.target.closest(".hotspot");
    if (!hotspot) return;
    if (event.relatedTarget && hotspot.contains(event.relatedTarget)) return;
    hideTip();
  });
  objectsNode.addEventListener("focusin", (event) => {
    const hotspot = event.target.closest(".hotspot");
    const object = hotspot && objectById(hotspot.dataset.object);
    if (object) showTip(object);
  });
  objectsNode.addEventListener("focusout", (event) => {
    if (event.target.closest(".hotspot")) hideTip();
  });
  objectsNode.addEventListener("click", (event) => {
    const hotspot = event.target.closest(".hotspot");
    if (!hotspot) return;
    event.stopPropagation();
    discover(hotspot.dataset.object, hotspot);
  });
  objectsNode.addEventListener("keydown", (event) => {
    const hotspot = event.target.closest(".hotspot");
    if (!hotspot) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      discover(hotspot.dataset.object, hotspot);
    }
  });
  canvas.addEventListener("click", (event) => {
    if (!event.target.closest(".hotspot")) hideTip();
  });
  const onDocumentClick = (event) => {
    if (!canvas.contains(event.target)) hideTip();
  };
  document.addEventListener("click", onDocumentClick, { signal: abort.signal });

  $("#level-dialogue", root).innerHTML = "";
  if (found.size === focus.length) {
    $("#level-dialogue", root).dataset.ready = "";
    unlock();
    if (initial.done) {
      // Un niveau déjà terminé reste entièrement jouable.
      showQuiz();
    }
  } else {
    lockedPanel();
  }
  if (initial.done && found.size < focus.length) showQuiz();
}

export function renderEnvironment(root, envId, levelId) {
  const env = ENVIRONMENTS_BY_ID[envId];
  if (!env) {
    root.innerHTML = `<div class="empty"><div class="e-icon">🗺️</div><h3>Environnement introuvable</h3>
      <p>Cette scène n'existe pas encore.</p><a class="btn btn--primary" href="#/explorer">Voir les environnements</a></div>`;
    return;
  }
  if (!levelId) {
    envHome(root, env);
    return;
  }
  const info = findLevel(envId, levelId);
  if (!info) {
    root.innerHTML = `<div class="empty"><div class="e-icon">🔎</div><h3>Niveau introuvable</h3>
      <p>Reviens à l'environnement pour choisir une scène.</p><a class="btn btn--primary" href="#/explorer/${esc(envId)}">Voir ${esc(env.title)}</a></div>`;
    return;
  }
  const abort = new AbortController();
  const lifecycle = { closed: false, quiz: null };
  window.addEventListener(
    "hashchange",
    () => {
      lifecycle.closed = true;
      lifecycle.quiz?.destroy?.();
      abort.abort();
    },
    { once: true, signal: abort.signal },
  );
  levelView(root, info.env, info.room, info.level, abort, lifecycle);
}
