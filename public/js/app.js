import { store } from "./core/store.js";
import { overallStats } from "./core/stats.js";
import { streakDays } from "./core/progress.js";
import { $, esc, hideWordTip, icon, ring } from "./ui.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderLessons } from "./views/lessons.js";
import { renderLesson } from "./views/lesson.js";
import { renderRecit } from "./views/recit.js";
import { renderReviews } from "./views/reviews.js";
import { renderSpecials } from "./views/specials.js";
import { renderSpecial } from "./views/special.js";
import { renderEnvironments } from "./views/environments.js";
import { renderEnvironment } from "./views/environment.js";
import { renderVocabulary } from "./views/vocabulary.js";
import { renderGrammar } from "./views/grammar.js";
import { renderGrammarLesson } from "./views/grammar-lesson.js";
import { renderTest, renderTests } from "./views/test.js";
import { renderListenings } from "./views/listenings.js";
import { renderListening } from "./views/listening.js";
import { renderSettings } from "./views/settings.js";
import { applyTheme, onThemeChange, resolvedTheme, setTheme, themeToggleMarkup, watchSystemTheme } from "./core/theme.js";

applyTheme();
watchSystemTheme();

window.__violetaStore = { store };

const NAV = [
  { key: "home", href: "#/", label: "Accueil", icon: "home" },
  { key: "lessons", href: "#/lecons", label: "Leçons", icon: "book" },
  { key: "reviews", href: "#/revisions", label: "Révisions", icon: "refresh" },
  { key: "grammar", href: "#/grammaire", label: "Grammaire", icon: "layers" },
  { key: "listening", href: "#/ecoute", label: "Écoute", icon: "mic" },
  { key: "themes", href: "#/themes", label: "Leçons spéciales", icon: "sparkles" },
  { key: "explore", href: "#/explorer", label: "Environnements", icon: "compass" },
  { key: "vocab", href: "#/vocabulaire", label: "Vocabulaire", icon: "search" },
];

const TABS = [
  { key: "home", href: "#/", label: "Accueil", icon: "home" },
  { key: "lessons", href: "#/lecons", label: "Leçons", icon: "book" },
  { key: "reviews", href: "#/revisions", label: "Révisions", icon: "refresh" },
  { key: "listening", href: "#/ecoute", label: "Écoute", icon: "mic" },
  { key: "themes", href: "#/themes", label: "Thèmes", icon: "sparkles" },
  { key: "explore", href: "#/explorer", label: "Explorer", icon: "compass" },
];

function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean).map(decodeURIComponent);
  return parts;
}

function activeKey(parts) {
  const first = parts[0] || "home";
  if (first === "lecons" || first === "recits") return "lessons";
  if (first === "revisions") return "reviews";
  if (first === "grammaire") return "grammar";
  if (first === "ecoute") return "listening";
  if (first === "tests") return "tests";
  if (first === "themes") return "themes";
  if (first === "explorer") return "explore";
  if (first === "vocabulaire") return "vocab";
  if (first === "reglages") return "settings";
  return "home";
}

function renderNav() {
  const parts = parseRoute();
  const key = activeKey(parts);
  $("#nav").innerHTML = NAV.map(
    (item) => `<a class="nav-link ${item.key === key ? "is-active" : ""}" href="${item.href}" ${item.key === key ? 'aria-current="page"' : ""}>
      <span class="nav-icon">${icon(item.icon)}</span><span>${item.label}</span>
    </a>`,
  ).join("");
  const settings = $("#nav")?.parentElement?.querySelector(".nav-settings");
  settings?.classList.toggle("is-active", key === "settings");
  $("#tabbar").innerHTML = TABS.map(
    (item) => `<a class="${item.key === key ? "is-active" : ""}" href="${item.href}" ${item.key === key ? 'aria-current="page"' : ""}>
      ${icon(item.icon)}<span>${item.label}</span>
    </a>`,
  ).join("");
}

function renderSidebarProgress() {
  const stats = overallStats(store.get());
  const node = $("#sidebar-progress");
  if (!node) return;
  node.innerHTML = `<div class="mini-row"><strong>Ta progression</strong><span>${stats.percent}%</span></div>
    ${`<div class="bar" role="progressbar" aria-valuenow="${stats.percent}" aria-valuemin="0" aria-valuemax="100" aria-label="Progression du parcours"><div class="bar-fill" style="width:${stats.percent}%"></div></div>`}
    <div class="mini-row"><span>${stats.mastered} mots maîtrisés</span><span>${stats.lessonsDone}/${stats.totals.lessons} leçons</span></div>`;
  const sidebarActions = $("#sidebar-actions");
  if (sidebarActions) sidebarActions.innerHTML = themeToggleMarkup({ withLabel: true });
  const top = $("#topbar-right");
  if (top) {
    const streak = streakDays(store.get());
    top.innerHTML = `<a class="chip" href="#/vocabulaire" style="padding:5px 10px;font-size:12px">${icon("search")} ${stats.discovered}/1000</a>
      <span class="chip" style="padding:5px 10px;font-size:12px" title="Série d'apprentissage">${icon("flame")} ${streak} j</span>
      ${themeToggleMarkup()}`;
  }
}

const ROUTES = [
  { test: (p) => p.length === 0, run: (root) => renderDashboard(root), title: "Accueil" },
  { test: (p) => p[0] === "lecons" && p.length === 1, run: (root) => renderLessons(root), title: "Les leçons" },
  { test: (p) => p[0] === "lecons" && p.length === 2, run: (root, p) => renderLesson(root, p[1]), title: "Leçon" },
  { test: (p) => p[0] === "recits" && p.length === 2, run: (root, p) => renderRecit(root, p[1]), title: "Récit de révision" },
  { test: (p) => p[0] === "revisions", run: (root) => renderReviews(root), title: "Révisions" },
  { test: (p) => p[0] === "themes" && p.length === 1, run: (root) => renderSpecials(root), title: "Leçons spéciales" },
  { test: (p) => p[0] === "themes" && p.length === 2, run: (root, p) => renderSpecial(root, p[1]), title: "Leçon thématique" },
  { test: (p) => p[0] === "explorer" && p.length === 1, run: (root) => renderEnvironments(root), title: "Environnements" },
  { test: (p) => p[0] === "explorer" && p.length === 2, run: (root, p) => renderEnvironment(root, p[1]), title: "Environnement" },
  { test: (p) => p[0] === "explorer" && p.length === 3, run: (root, p) => renderEnvironment(root, p[1], p[2]), title: "Scène interactive" },
  { test: (p) => p[0] === "vocabulaire", run: (root) => renderVocabulary(root), title: "Vocabulaire" },
  { test: (p) => p[0] === "grammaire" && p.length === 1, run: (root) => renderGrammar(root), title: "Grammaire" },
  { test: (p) => p[0] === "grammaire" && p.length === 2, run: (root, p) => renderGrammarLesson(root, p[1]), title: "Point de grammaire" },
  { test: (p) => p[0] === "ecoute" && p.length === 1, run: (root) => renderListenings(root), title: "Compréhensions orales" },
  { test: (p) => p[0] === "ecoute" && p.length === 2, run: (root, p) => renderListening(root, p[1]), title: "Compréhension orale" },
  { test: (p) => p[0] === "tests" && p.length === 1, run: (root) => renderTests(root), title: "Tests de niveau" },
  { test: (p) => p[0] === "tests" && p.length === 2, run: (root, p) => renderTest(root, p[1]), title: "Test de niveau" },
  { test: (p) => p[0] === "reglages", run: (root) => renderSettings(root), title: "Réglages" },
];

async function navigate() {
  const parts = parseRoute();
  hideWordTip();
  renderNav();
  const view = $("#view");
  const route = ROUTES.find((r) => r.test(parts));
  view.innerHTML = "";
  view.classList.remove("anim");
  void view.offsetWidth;
  view.classList.add("anim");
  document.title = route ? `${route.title} · Violeta` : "Violeta";
  if (!route) {
    view.innerHTML = `<div class="empty"><div class="e-icon">🧭</div><h3>Cette page n'existe pas</h3>
      <p>Le lien est peut-être incomplet. Reviens à l'accueil pour continuer.</p>
      <a class="btn btn--primary" href="#/">Retour à l'accueil</a></div>`;
    return;
  }
  try {
    await route.run(view, parts);
  } catch (error) {
    console.error(error);
    view.innerHTML = `<div class="card" style="border-color:var(--rose-line);background:var(--rose-soft)">
      <h2 class="h2" style="font-family:var(--font-display)">Un petit problème…</h2>
      <p class="lead">Cette page n'a pas pu s'afficher. Ta progression est enregistrée, rien n'est perdu.</p>
      <div class="row" style="margin-top:16px">
        <button class="btn btn--primary" data-retry>Réessayer</button>
        <a class="btn" href="#/">Accueil</a>
      </div>
    </div>`;
    view.querySelector("[data-retry]")?.addEventListener("click", () => navigate());
  }
  window.scrollTo({ top: 0, behavior: "instant" });
  view.focus({ preventScroll: true });
}

// La progression est affichée partout, mais les vues se rafraîchissent seules.
let scheduled = false;
store.subscribe(() => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    renderSidebarProgress();
  });
});

window.addEventListener("hashchange", navigate);
window.addEventListener("resize", hideWordTip);

document.addEventListener("click", (event) => {
  const toggle = event.target.closest?.("[data-theme-toggle]");
  if (!toggle) return;
  setTheme(resolvedTheme() === "dark" ? "light" : "dark");
});

onThemeChange(() => renderSidebarProgress());
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideWordTip();
});

renderSidebarProgress();
navigate();
