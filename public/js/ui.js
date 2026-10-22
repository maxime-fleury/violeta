/** Petits utilitaires d'interface partagés par toutes les vues. */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M8 6h8M8 9.5h5"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3.2-6.9"/><path d="M21 3v6h-6"/>',
  sparkles: '<path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z"/><path d="m5 14 .6 1.7L7.5 16l-1.9.6L5 18l-.6-1.4L2.5 16l1.9-.3Z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  play: '<path d="M7 4.5v15l13-7.5Z"/>',
  arrowRight: '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
  arrowLeft: '<path d="M20 12H5"/><path d="m11 18-6-6 6-6"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  sound: '<path d="M11 5 6.5 9H3v6h3.5L11 19Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  flame: '<path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 2 2c1.5 0 2-1.5 2-3 0-2-1-4-1-4Z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0Z"/><path d="M8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4"/><path d="M12 13v5M8.5 21h7"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  lock: '<rect x="4.5" y="10" width="15" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/><path d="m3 17.5 9 5 9-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 21h16"/>',
  bulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.8V16h7v-2.2A6 6 0 0 0 12 3Z"/>',
  map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2Z"/><path d="M9 4v14M15 6v14"/>',
  star: '<path d="m12 3 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.3l6-.8Z"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
};

export function icon(name, cls = "") {
  const path = ICONS[name] || ICONS.info;
  return `<svg class="${cls}" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

export function ring(percent, { size = 74, stroke = 7, label = "" } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const offset = c * (1 - clamped / 100);
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label || `${clamped} %`)}">
    <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/>
    <circle class="ring-value" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"
      stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
      transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
      font-family="var(--font-display)" font-size="${Math.round(size * 0.26)}" fill="currentColor">${clamped}%</text>
  </svg>`;
}

export function bar(percent, variant = "", label = "") {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return `<div class="bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(label || "Progression")}"><div class="bar-fill ${variant}" style="width:${p}%"></div></div>`;
}

export function speakIconButton(text, label = "Écouter") {
  return `<button class="mini-btn" type="button" data-speak="${esc(text)}" aria-label="${esc(label)}">${icon("sound")}</button>`;
}

let toastTimer = null;
export function toast(message) {
  const node = $("#toast");
  if (!node) return;
  node.textContent = message;
  node.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("is-visible"), 2600);
}

/** Modale générique. Renvoie une promesse résolue par l'action choisie. */
export function openModal({ title, body, actions = [], onMount }) {
  const root = $("#modal-root");
  const previous = document.activeElement;
  const id = `modal-${Date.now()}`;
  root.innerHTML = `<div class="modal-backdrop" data-modal-backdrop>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="${id}" tabindex="-1">
      <h2 id="${id}">${esc(title)}</h2>
      <div class="modal-body">${body}</div>
      <div class="modal-actions"></div>
    </div>
  </div>`;
  const modal = $(".modal", root);
  const actionsNode = $(".modal-actions", root);
  let resolveFn;
  const promise = new Promise((resolve) => (resolveFn = resolve));
  const close = (value) => {
    root.innerHTML = "";
    document.removeEventListener("keydown", onKey);
    previous?.focus?.();
    resolveFn(value);
  };
  for (const action of actions) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `btn ${action.className || "btn--ghost"}`;
    btn.textContent = action.label;
    btn.addEventListener("click", async () => {
      if (action.onClick) {
        const result = await action.onClick(modal, close);
        if (result === false) return;
      }
      close(action.value ?? action.label);
    });
    actionsNode.appendChild(btn);
  }
  const onKey = (e) => {
    if (e.key === "Escape") close(null);
    if (e.key !== "Tab") return;
    const focusable = $$("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])", modal).filter(
      (n) => !n.disabled,
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  document.addEventListener("keydown", onKey);
  $("[data-modal-backdrop]", root).addEventListener("click", (e) => {
    if (e.target === e.currentTarget) close(null);
  });
  onMount?.(modal, close);
  queueMicrotask(() => {
    const focusable = $("button, input, [href]", modal);
    (focusable || modal).focus();
  });
  return promise;
}

export function confirmModal({ title, message, warning, confirmLabel = "Confirmer", danger = false }) {
  return openModal({
    title,
    body: `${warning ? `<div class="warning">${esc(warning)}</div>` : ""}<p>${esc(message)}</p>`,
    actions: [
      { label: "Annuler", value: false, className: "btn--ghost" },
      { label: confirmLabel, value: true, className: danger ? "btn--danger" : "btn--primary" },
    ],
  }).then((v) => v === true);
}

export function statusBadge(status) {
  if (status === "done") return `<span class="badge badge--mint">${icon("check")} Validée</span>`;
  if (status === "inProgress") return `<span class="badge badge--violet">En cours</span>`;
  return `<span class="badge">À découvrir</span>`;
}

export function wordStatusBadge(status) {
  if (status === "mastered") return `<span class="badge badge--mint">Maîtrisé</span>`;
  if (status === "discovered") return `<span class="badge badge--violet">Découvert</span>`;
  return `<span class="badge">Non découvert</span>`;
}

export function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  } catch {
    return "";
  }
}

export function todayLabel() {
  return new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export function plural(n, singular, pluralForm = `${singular}s`) {
  return `${n} ${n > 1 ? pluralForm : singular}`;
}

/* ------------------------------------------------------------------ tooltip */
let tipTimer = null;

export function hideWordTip() {
  const tip = $("#tooltip");
  if (!tip) return;
  tip.hidden = true;
  tip.innerHTML = "";
}

function positionTip(tip, target) {
  const r = target.getBoundingClientRect();
  const maxX = window.innerWidth - 16;
  const x = Math.min(maxX, Math.max(16, r.left + r.width / 2));
  let top = r.top;
  const estimated = tip.offsetHeight + 16;
  const below = r.top < estimated + 12;
  tip.classList.toggle("is-below", below);
  tip.style.left = `${x}px`;
  tip.style.top = `${below ? r.bottom : top}px`;
}

export function showWordTip(target, { es, fr, note = "", wordId = "", onSeen } = {}) {
  const tip = $("#tooltip");
  if (!tip) return;
  clearTimeout(tipTimer);
  tip.innerHTML = `<div class="tt-es">${esc(es)} ${wordId ? `<button type="button" data-tip-speak="${esc(es)}" aria-label="Écouter ${esc(es)}">${icon("sound")} Écouter</button>` : ""}</div>
    <div class="tt-fr">${esc(fr)}</div>
    ${note ? `<div class="tt-fr" style="font-size:11.5px;opacity:.75">${esc(note)}</div>` : ""}`;
  tip.hidden = false;
  positionTip(tip, target);
  if (wordId && onSeen) onSeen(wordId);
  const speakBtn = $("[data-tip-speak]", tip);
  speakBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    import("./audio.js").then((m) => m.speak(es));
  });
  requestAnimationFrame(() => positionTip(tip, target));
}

/**
 * Active les infobulles sur les éléments `[data-tip]` d'une vue.
 * Desktop : survol et focus. Mobile : toucher (le clic épingle l'infobulle).
 */
export function enableWordTips(root, { onSeen } = {}) {
  const nodes = $$("[data-tip]", root);
  for (const node of nodes) {
    const payload = () => ({
      es: node.dataset.es || node.textContent.trim(),
      fr: node.dataset.fr || "",
      note: node.dataset.note || "",
      wordId: node.dataset.wordId || "",
      onSeen,
    });
    let pointerInside = false;
    node.addEventListener("pointerenter", (e) => {
      pointerInside = true;
      if (e.pointerType !== "mouse") return;
      tipTimer = setTimeout(() => showWordTip(node, payload()), 120);
    });
    node.addEventListener("pointerleave", (e) => {
      pointerInside = false;
      if (e.pointerType !== "mouse") return;
      clearTimeout(tipTimer);
      hideWordTip();
    });
    node.addEventListener("focus", () => {
      if (node.matches(":focus-visible")) showWordTip(node, payload());
    });
    node.addEventListener("blur", hideWordTip);
    node.addEventListener("click", (e) => {
      e.stopPropagation();
      showWordTip(node, payload());
      if (pointerInside && matchMedia("(pointer: coarse)").matches) e.preventDefault();
    });
    node.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideWordTip();
    });
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-tip]")) hideWordTip();
  }, { once: true });
  window.addEventListener("scroll", hideWordTip, { passive: true, once: true });
}

export function bindSpeakButtons(root) {
  for (const btn of $$("[data-speak]", root)) {
    if (btn.dataset.bound) continue;
    btn.dataset.bound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rate = btn.dataset.rate ? Number(btn.dataset.rate) : undefined;
      import("./audio.js").then((m) => m.speak(btn.dataset.speak, rate ? { rate } : undefined));
    });
  }
}
