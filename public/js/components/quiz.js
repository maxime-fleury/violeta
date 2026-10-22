/** Exercices réutilisables : choix multiple, saisie libre, correction et indice. */
import { esc, icon, plural } from "../ui.js";

function matchesAnswer(exercise, value) {
  return [exercise.answer, ...(exercise.alternatives || [])].some((candidate) => normalize(candidate) === normalize(value));
}

function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:"'«»()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function mountQuiz(container, exercises, { onComplete, intro = "" } = {}) {
  const states = exercises.map(() => ({ solved: false, firstTry: true, attempts: 0 }));
  let finished = false;
  let timer = null;

  const renderQuestion = (exercise, index) => {
    const id = `q-${index}`;
    if (exercise.type === "choice") {
      return `<div class="quiz-q" data-question="${index}">
        <p class="q-prompt" id="${id}">${esc(exercise.prompt)}</p>
        <div class="quiz-options" role="group" aria-labelledby="${id}">
          ${exercise.options
            .map(
              (option, oi) => `<button type="button" class="quiz-option" data-choice="${index}" data-value="${esc(option)}">
                <span class="letter" aria-hidden="true">${String.fromCharCode(65 + oi)}</span>
                <span lang="es">${esc(option)}</span>
              </button>`,
            )
            .join("")}
        </div>
        <div class="quiz-feedback" data-feedback="${index}" aria-live="polite"></div>
      </div>`;
    }
    return `<div class="quiz-q" data-question="${index}">
      <label class="q-prompt" for="${id}">${esc(exercise.prompt)}</label>
      <form class="answer-row" data-form="${index}" novalidate>
        <input class="input-answer" id="${id}" name="answer" type="text" autocomplete="off" spellcheck="false" lang="es"
          placeholder="Écris en espagnol…" aria-describedby="hint-${index}" />
        <button class="btn btn--soft btn--sm" type="submit">Vérifier</button>
        ${exercise.hint ? `<button class="btn btn--ghost btn--sm" type="button" data-hint="${index}">Indice</button>` : ""}
      </form>
      ${exercise.hint ? `<p class="tiny muted" id="hint-${index}" data-hint-text="${index}" hidden>${esc(exercise.hint)}</p>` : ""}
      <div class="quiz-feedback" data-feedback="${index}" aria-live="polite"></div>
    </div>`;
  };

  container.innerHTML = `<div class="quiz">
    ${intro ? `<p class="lead" style="margin-bottom:2px">${esc(intro)}</p>` : ""}
    <div class="row row--between">
      <span class="badge badge--violet" data-score>0 / ${exercises.length} réussis</span>
      <span class="small muted">Tu peux réessayer autant de fois que nécessaire.</span>
    </div>
    ${exercises.map(renderQuestion).join("")}
  </div>`;

  const scoreNode = container.querySelector("[data-score]");
  const feedback = (index) => container.querySelector(`[data-feedback="${index}"]`);

  function refreshScore() {
    const solved = states.filter((s) => s.solved).length;
    scoreNode.textContent = `${solved} / ${exercises.length} réussis`;
    if (solved === exercises.length && !finished) {
      finished = true;
      const firstTry = states.filter((s) => s.firstTry).length;
      const words = [...new Set(exercises.map((e) => e.word).filter(Boolean))];
      timer = setTimeout(() => onComplete?.({ score: firstTry, total: exercises.length, words, exercises }), 650);
    }
  }

  function solve(index, message) {
    states[index].solved = true;
    const q = container.querySelector(`[data-question="${index}"]`);
    q?.classList.add("is-solved");
    const fb = feedback(index);
    if (fb) {
      fb.className = "quiz-feedback is-ok";
      fb.innerHTML = `${icon("check")} <span>${esc(message)}</span>`;
    }
    refreshScore();
  }

  container.addEventListener("click", (event) => {
    const option = event.target.closest("[data-choice]");
    if (option) {
      const index = Number(option.dataset.choice);
      if (states[index].solved) return;
      const exercise = exercises[index];
      const value = option.dataset.value;
      const fb = feedback(index);
      if (matchesAnswer(exercise, value)) {
        option.classList.add("is-correct");
        solve(index, "Exact !");
        for (const other of container.querySelectorAll(`[data-choice="${index}"]`)) {
          other.disabled = true;
          if (other !== option) other.style.opacity = ".55";
        }
      } else {
        states[index].firstTry = false;
        states[index].attempts++;
        option.classList.add("is-wrong");
        setTimeout(() => option.classList.remove("is-wrong"), 900);
        if (fb) {
          fb.className = "quiz-feedback is-ko";
          fb.innerHTML = `${icon("info")} <span>Pas tout à fait. Relis la leçon et réessaie.</span>`;
        }
      }
      return;
    }

    const hintBtn = event.target.closest("[data-hint]");
    if (hintBtn) {
      const index = hintBtn.dataset.hint;
      const text = container.querySelector(`[data-hint-text="${index}"]`);
      if (text) text.hidden = !text.hidden;
    }
  });

  container.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-form]");
    if (!form) return;
    event.preventDefault();
    const index = Number(form.dataset.form);
    if (states[index].solved) return;
    const input = form.querySelector("input");
    const exercise = exercises[index];
    const value = input.value;
    const fb = feedback(index);
    if (!normalize(value)) {
      if (fb) {
        fb.className = "quiz-feedback is-ko";
        fb.innerHTML = `${icon("info")} <span>Écris une réponse avant de vérifier.</span>`;
      }
      return;
    }
    if (matchesAnswer(exercise, value)) {
      solve(index, "Exact !");
      input.disabled = true;
      form.querySelector("button[type=submit]")?.setAttribute("disabled", "true");
      input.style.borderColor = "#7dd3bb";
    } else {
      states[index].firstTry = false;
      states[index].attempts++;
      if (fb) {
        fb.className = "quiz-feedback is-ko";
        fb.innerHTML = `${icon("info")} <span>Presque… Vérifie l'orthographe et les accents (facultatifs à la saisie).</span>`;
      }
      input.focus();
    }
  });

  return {
    destroy() {
      if (timer) clearTimeout(timer);
    },
    get solved() {
      return states.filter((s) => s.solved).length;
    },
  };
}
