/** Dialogue espagnol annoté : mots nouveaux en violet, traduction au survol/toucher. */
import { annotate } from "../core/lemma.js";
import { LEXICON_BY_ID } from "../data/lexicon.js";
import { bindSpeakButtons, enableWordTips, esc, icon } from "../ui.js";

function speakerClass(name = "") {
  const sum = [...name].reduce((n, c) => n + c.charCodeAt(0), 0);
  return sum % 5 === 0 ? "" : ` avatar--${(sum % 4) + 2}`;
}

function renderTokens(line, { lesson, knownWords }) {
  const tokens = annotate(line.es, {
    newWords: lesson.newWords,
    knownWords,
    lesson,
    lexiconById: LEXICON_BY_ID,
  });
  return tokens
    .map((token) => {
      if (!token.word) return esc(token.text);
      if (token.state === "new") {
        return `<button type="button" class="word word--new" data-tip data-word-id="${esc(token.wordId || "")}"
          data-es="${esc(token.es || LEXICON_BY_ID[token.wordId]?.es || token.text)}" data-fr="${esc(token.fr || "")}"
          aria-label="${esc(token.es || token.text)}, ${esc(token.fr || "")}">${esc(token.text)}</button>`;
      }
      if (token.fr) {
        return `<button type="button" class="word" data-tip data-word-id="${esc(token.wordId || "")}"
          data-es="${esc(token.es || LEXICON_BY_ID[token.wordId]?.es || token.text)}" data-fr="${esc(token.fr)}"
          aria-label="${esc(token.es || token.text)}, ${esc(token.fr)}">${esc(token.text)}</button>`;
      }
      return `<span class="word word--plain">${esc(token.text)}</span>`;
    })
    .join("");
}

/**
 * @param {Array} lines
 * @param {{lesson: object, knownWords: Set<string>, showTranslation: boolean}} options
 */
export function renderDialogue(lines, { lesson, knownWords = new Set(), showTranslation = false }) {
  return `<div class="dialogue">${lines
    .map((line, index) => {
      if (!line.who) {
        return `<div class="line line--narration">
          <div class="narration-text">${renderTokens(line, { lesson, knownWords })}</div>
          ${line.fr ? `<div class="line-fr" ${showTranslation ? "" : "hidden"} data-fr-block="${index}">${esc(line.fr)}</div>` : ""}
        </div>`;
      }
      return `<div class="line">
        <div class="avatar${speakerClass(line.who)}" aria-hidden="true">${esc(line.who.slice(0, 1))}</div>
        <div class="bubble">
          <div class="speaker">${esc(line.who)}</div>
          <p class="line-es" lang="es">${renderTokens(line, { lesson, knownWords })}</p>
          <div class="line-tools">
            <button type="button" class="mini-btn" data-speak="${esc(line.es)}" aria-label="Écouter la phrase">${icon("sound")}</button>
            ${line.fr ? `<button type="button" class="mini-btn mini-btn--text" data-toggle-fr="${index}" aria-pressed="${showTranslation}" aria-label="Afficher la traduction de cette réplique">${icon("eye")} Traduction</button>` : ""}
          </div>
          ${line.fr ? `<p class="line-fr" data-fr-block="${index}" ${showTranslation ? "" : "hidden"} lang="fr">${esc(line.fr)}</p>` : ""}
        </div>
      </div>`;
    })
    .join("")}</div>`;
}

/** Active infobulles, audio et boutons de traduction d'un dialogue rendu. */
export function bindDialogue(root, { onSeen } = {}) {
  enableWordTips(root, { onSeen });
  bindSpeakButtons(root);
  for (const btn of root.querySelectorAll("[data-toggle-fr]")) {
    btn.addEventListener("click", () => {
      const index = btn.dataset.toggleFr;
      const block = root.querySelector(`[data-fr-block="${index}"]`);
      if (!block) return;
      const show = block.hasAttribute("hidden");
      block.toggleAttribute("hidden", !show);
      btn.setAttribute("aria-pressed", String(show));
    });
  }
}
