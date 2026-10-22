/**
 * Thème clair / sombre / système.
 * Le choix est stocké séparément de la progression : réinitialiser ses leçons
 * ne doit pas changer l'apparence de l'application.
 */
export const THEME_KEY = "violeta.theme";
const VALID = new Set(["light", "dark", "system"]);
const listeners = new Set();

const media = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;

export function getTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return VALID.has(raw) ? raw : "system";
  } catch {
    return "system";
  }
}

export function resolvedTheme(pref = getTheme()) {
  if (pref === "system") return media?.matches ? "dark" : "light";
  return pref;
}

/** Applique le thème au document (attribut + couleur de barre navigateur). */
export function applyTheme(pref = getTheme()) {
  const theme = resolvedTheme(pref);
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#14111c" : "#f6f1ea");
  return theme;
}

export function setTheme(pref) {
  const value = VALID.has(pref) ? pref : "system";
  try {
    localStorage.setItem(THEME_KEY, value);
  } catch {
    /* stockage indisponible : le thème reste appliqué pour la session */
  }
  applyTheme(value);
  for (const fn of listeners) {
    try {
      fn(value);
    } catch (error) {
      console.error("Erreur d'abonné au thème", error);
    }
  }
  return value;
}

export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Suit le réglage système tant que l'utilisateur n'a pas choisi explicitement. */
export function watchSystemTheme() {
  if (!media) return;
  const handler = () => {
    if (getTheme() === "system") applyTheme("system");
  };
  if (media.addEventListener) media.addEventListener("change", handler);
  else media.addListener?.(handler);
}

/** Bouton soleil/lune : compact dans la barre mobile, avec libellé dans la barre latérale. */
export function themeToggleMarkup({ withLabel = false } = {}) {
  const pref = getTheme();
  const current = resolvedTheme(pref);
  const label = current === "dark" ? "Passer au thème clair" : "Passer au thème sombre";
  if (!withLabel) {
    return `<button class="icon-btn" type="button" data-theme-toggle aria-label="${label}" title="${label}">
      ${current === "dark" ? "☾" : "☀"}
    </button>`;
  }
  return `<button class="nav-link sidebar-theme" type="button" data-theme-toggle aria-label="${label}">
    <span class="nav-icon" aria-hidden="true">${current === "dark" ? "☾" : "☀"}</span>
    <span>${current === "dark" ? "Thème clair" : "Thème sombre"}</span>
  </button>`;
}
