/** Plateau de Memory : moteur pur + rendu DOM et animations de retournement. */
import { MemoryGame } from "../core/memory.js";
import { esc, icon, plural } from "../ui.js";

/**
 * Monte une partie dans `container`.
 * @returns {{destroy: () => void, game: MemoryGame}}
 */
export function mountMemory(container, words, { onComplete, onMistake, onMatch, allowRestart = true } = {}) {
  const game = new MemoryGame(words);
  const timers = new Set();
  let closed = false;
  const later = (fn, delay) => {
    const id = setTimeout(() => {
      timers.delete(id);
      if (!closed) fn();
    }, delay);
    timers.add(id);
    return id;
  };

  // 5 paires tiennent sur une seule rangée ; au-delà on équilibre les rangées.
  const cols = game.pairCount >= 9 ? 5 : game.pairCount === 5 ? 5 : 4;
  container.innerHTML = `<div class="memory-wrap">
    <div class="memory-hud">
      <div class="hud-item"><strong data-attempts>0</strong><span>coups</span></div>
      <div class="hud-item"><strong data-matched>0</strong><span>/ ${game.pairCount} paires</span></div>
      <div class="row row--tight" style="margin-left:auto">
        <span class="round-badge" data-live aria-live="polite">Retourne deux cartes</span>
        ${allowRestart ? `<button class="btn btn--ghost btn--sm" type="button" data-restart>${icon("refresh")} Recommencer</button>` : ""}
      </div>
    </div>
    <div class="memory-grid" data-cols="${cols}" role="group" aria-label="Jeu de memory : associe chaque mot espagnol à sa traduction">
      ${game.cards
        .map(
          (card, index) => `<button type="button" class="mcard" data-uid="${esc(card.uid)}" style="--i:${index}" aria-label="Carte face cachée" aria-pressed="false">
            <span class="mcard__inner">
              <span class="mcard__face mcard__face--back" aria-hidden="true"></span>
              <span class="mcard__face mcard__face--front ${card.side === "es" ? "is-es" : "is-fr"}" lang="${card.side === "es" ? "es" : "fr"}">${esc(card.text)}</span>
            </span>
          </button>`,
        )
        .join("")}
    </div>
    <p class="memory-note">${icon("bulb")} Associe chaque mot espagnol à sa traduction française.</p>
  </div>`;

  const attemptsNode = container.querySelector("[data-attempts]");
  const matchedNode = container.querySelector("[data-matched]");
  const liveNode = container.querySelector("[data-live]");
  const cards = new Map([...container.querySelectorAll(".mcard")].map((node) => [node.dataset.uid, node]));

  // Inclinaison 3D + reflet qui suit le pointeur (désactivés au toucher).
  const tiltTargets = [];
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (const node of cards.values()) {
      const move = (event) => {
        if (node.classList.contains("mcard--up") || node.classList.contains("mcard--matched")) return;
        const rect = node.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        node.style.setProperty("--ry", `${(px * 9).toFixed(2)}deg`);
        node.style.setProperty("--rx", `${(-py * 9).toFixed(2)}deg`);
        node.style.setProperty("--mx", `${(50 + px * 70).toFixed(1)}%`);
        node.style.setProperty("--my", `${(50 + py * 70).toFixed(1)}%`);
      };
      const leave = () => {
        for (const prop of ["--rx", "--ry", "--mx", "--my"]) node.style.removeProperty(prop);
      };
      node.addEventListener("pointermove", move);
      node.addEventListener("pointerleave", leave);
      tiltTargets.push({ node, move, leave });
    }
  }

  function paintCard(card) {
    const node = cards.get(card.uid);
    if (!node) return;
    node.classList.toggle("mcard--up", card.state === "up");
    node.classList.toggle("mcard--matched", card.state === "matched");
    node.setAttribute("aria-pressed", String(card.state !== "hidden"));
    node.setAttribute(
      "aria-label",
      card.state === "hidden"
        ? "Carte face cachée"
        : `${card.side === "es" ? "Mot espagnol" : "Traduction française"} : ${card.text}${card.state === "matched" ? ", paire trouvée" : ""}`,
    );
  }

  function paintHud() {
    attemptsNode.textContent = String(game.attempts);
    matchedNode.textContent = String(game.matchedCount);
  }

  function finishRound() {
    const weak = game.weakWordIds;
    const mistakes = [...game.mistakes.values()].reduce((a, b) => a + b, 0);
    later(() => {
      onComplete?.({
        coups: game.attempts,
        mistakes,
        weakWordIds: weak,
        words: game.pairs.map((w) => w.id),
      });
    }, 520);
  }

  function handleFlip(uid) {
    const result = game.flip(uid);
    if (result.type === "ignored") return;
    if (result.type === "flip") {
      paintCard(result.card);
      liveNode.textContent = "Première carte retournée";
      return;
    }
    if (result.type === "match" || result.type === "complete") {
      for (const card of result.cards) paintCard(card);
      paintHud();
      onMatch?.(result.pairId);
      liveNode.textContent = `Paire trouvée : ${result.pairId}`;
      if (result.complete) {
        liveNode.textContent = "Toutes les paires sont trouvées !";
        finishRound();
      }
      return;
    }
    if (result.type === "mismatch") {
      paintHud();
      for (const card of result.cards) {
        const node = cards.get(card.uid);
        node?.classList.add("mcard--wrong");
      }
      liveNode.textContent = "Ce n'est pas une paire";
      onMistake?.(result.pairIds);
      later(() => {
        for (const card of result.cards) cards.get(card.uid)?.classList.remove("mcard--wrong");
        game.resolveMismatch();
        for (const card of game.cards) paintCard(card);
        liveNode.textContent = "Continue : retourne deux nouvelles cartes";
      }, 760);
    }
  }

  function onClick(event) {
    const node = event.target.closest("[data-uid]");
    if (!node) return;
    handleFlip(node.dataset.uid);
  }

  function restart() {
    container.dispatchEvent(new CustomEvent("memory:restart"));
  }

  container.addEventListener("click", onClick);
  const restartBtn = container.querySelector("[data-restart]");
  restartBtn?.addEventListener("click", restart);

  return {
    game,
    destroy() {
      closed = true;
      for (const id of timers) clearTimeout(id);
      timers.clear();
      for (const { node, move, leave } of tiltTargets) {
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerleave", leave);
      }
      container.removeEventListener("click", onClick);
      restartBtn?.removeEventListener("click", restart);
    },
    summary() {
      return {
        coups: game.attempts,
        mistakes: [...game.mistakes.values()].reduce((a, b) => a + b, 0),
        weakWordIds: game.weakWordIds,
      };
    },
  };
}
