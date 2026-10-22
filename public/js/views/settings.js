import { store } from "../core/store.js";
import { overallStats } from "../core/stats.js";
import { INTRODUCED_WORDS } from "../core/curriculum.js";
import { INTEGRATED_WORDS, MISSING_WORDS } from "../core/coverage.js";
import { LEXICON } from "../data/lexicon.js";
import { SPECIALS } from "../data/specials.js";
import { RECITS } from "../data/recits.js";
import { GRAMMAR } from "../core/grammar.js";
import { LISTENINGS } from "../core/listening.js";
import { TESTS } from "../core/tests.js";
import { $, confirmModal, esc, icon, plural, toast } from "../ui.js";
import { speak } from "../audio.js";
import { getTheme, setTheme } from "../core/theme.js";

export function renderSettings(root) {
  const progress = store.get();
  const stats = overallStats(progress);
  const integrated = INTEGRATED_WORDS.length;
  const remaining = MISSING_WORDS.length;

  root.innerHTML = `<div class="page-head">
    <div class="page-head-text">
      <span class="eyebrow">Réglages</span>
      <h1 class="h1">À ta main</h1>
      <p class="lead">Ta progression reste sur cet appareil, dans le stockage local du navigateur. Rien n'est envoyé ailleurs.</p>
    </div>
  </div>

  <div class="grid grid--sidebar">
    <div class="stack">
      <section class="card card--pad-lg">
        <h2 class="h2" style="font-size:24px">Préférences</h2>
        <div class="settings-section" style="margin-top:12px">
          <div class="setting-row">
            <div>
              <div class="s-label">Apparence</div>
              <div class="s-help">Le thème sombre repose les yeux le soir. « Système » suit le réglage de ton appareil.</div>
            </div>
            <div class="segmented" role="group" aria-label="Apparence de l'interface">
              ${[
                ["light", "Clair"],
                ["dark", "Sombre"],
                ["system", "Système"],
              ]
                .map(
                  ([value, label]) =>
                    `<button type="button" data-theme-choice="${value}" aria-pressed="${getTheme() === value}">${label}</button>`,
                )
                .join("")}
            </div>
          </div>
          <div class="setting-row">
            <div>
              <div class="s-label">Prononciation automatique</div>
              <div class="s-help">Lecture espagnole des mots et des phrases avec la voix du navigateur. Tu peux couper le son à tout moment.</div>
            </div>
            <button class="switch" type="button" role="switch" aria-checked="${progress.settings.audio !== false}" aria-label="Activer la prononciation" data-audio></button>
          </div>
          <div class="setting-row">
            <div>
              <div class="s-label">Afficher les traductions par défaut</div>
              <div class="s-help">Dans les dialogues, la traduction française est masquée par défaut. Active cette option si tu préfères la voir immédiatement.</div>
            </div>
            <button class="switch" type="button" role="switch" aria-checked="${Boolean(progress.settings.showTranslationByDefault)}" aria-label="Afficher les traductions" data-translations></button>
          </div>
          <div class="setting-row">
            <div>
              <div class="s-label">Tester la voix espagnole</div>
              <div class="s-help">Le navigateur choisit une voix es-ES si elle est installée sur l'appareil.</div>
            </div>
            <button class="btn btn--soft btn--sm" type="button" data-test-voice>${icon("sound")} Écouter un exemple</button>
          </div>
        </div>
      </section>

      <section class="card card--pad-lg">
        <h2 class="h2" style="font-size:24px">Ma progression</h2>
        <div class="stat-grid" style="margin-top:14px">
          <div class="stat"><span class="stat-label">Mots découverts</span><span class="stat-value">${stats.discovered}<small> / 1000</small></span></div>
          <div class="stat"><span class="stat-label">Mots maîtrisés</span><span class="stat-value">${stats.mastered}<small> / 1000</small></span></div>
          <div class="stat"><span class="stat-label">Leçons</span><span class="stat-value">${stats.lessonsDone}<small> / ${stats.totals.lessons}</small></span></div>
          <div class="stat"><span class="stat-label">Niveaux</span><span class="stat-value">${stats.levelsDone}<small> / ${stats.totals.levels}</small></span></div>
        </div>
        <div class="row" style="margin-top:16px">
          <button class="btn btn--sm" type="button" data-export>${icon("download")} Exporter ma progression</button>
          <span class="tiny muted">Fichier JSON lisible, à conserver si tu changes d'appareil.</span>
        </div>
        <div class="danger-zone" style="margin-top:20px">
          <strong>Réinitialiser ma progression</strong>
          <p class="small muted">Efface les leçons validées, les mots découverts et maîtrisés, les niveaux terminés, les points de grammaire, les écoutes, les tests de niveau et l'historique de révision. Les réglages sont conservés.</p>
          <div><button class="btn btn--danger btn--sm" type="button" data-reset>${icon("trash")} Réinitialiser ma progression</button></div>
        </div>
      </section>

      <section class="card card--pad-lg">
        <h2 class="h2" style="font-size:24px">État des contenus</h2>
        <p class="small muted" style="margin-top:8px">La couverture est recalculée depuis les données à chaque chargement : cibles des leçons, mots lus dans les dialogues, thèmes et environnements. Rien n'est déclaré à la main.</p>
        <div class="divider"></div>
        <div class="stack" style="gap:10px">
          <div class="row row--between"><span class="small">Lexique cible vérifié</span><strong>${LEXICON.length} mots</strong></div>
          <div class="row row--between"><span class="small">Mots intégrés à du contenu jouable</span><strong>${integrated} / 1000</strong></div>
          <div class="row row--between"><span class="small">Parcours principal</span><strong>${stats.totals.lessons} leçons · ${INTRODUCED_WORDS.length} mots</strong></div>
          <div class="row row--between"><span class="small">Leçons thématiques</span><strong>${SPECIALS.length} thèmes · 100 expressions</strong></div>
          <div class="row row--between"><span class="small">Récits de révision</span><strong>${RECITS.length} récits · ${RECITS.reduce((n, r) => n + r.quiz.length, 0)} questions</strong></div>
          <div class="row row--between"><span class="small">Environnements interactifs</span><strong>3 lieux · ${stats.totals.levels} niveaux</strong></div>
          <div class="row row--between"><span class="small">Points de grammaire</span><strong>${GRAMMAR.length} points · ${stats.grammarDone} validé${stats.grammarDone === 1 ? "" : "s"}</strong></div>
          <div class="row row--between"><span class="small">Compréhensions orales</span><strong>${LISTENINGS.length} écoutes · ${stats.listeningsDone} validée${stats.listeningsDone === 1 ? "" : "s"}</strong></div>
          <div class="row row--between"><span class="small">Tests de niveau</span><strong>${TESTS.length} tests · ${stats.testsPassed} validé${stats.testsPassed === 1 ? "" : "s"}</strong></div>
          <div class="row row--between"><span class="small">Mots restant à intégrer</span><strong>${remaining} mots</strong></div>
        </div>
        <div class="note-box" style="margin-top:16px">${icon("info", "info-ico")}
          <span>${remaining === 0 ? "Les 1 000 entrées du lexique apparaissent désormais dans du contenu jouable. Être dans le programme n'est pas maîtriser : un mot n'est compté comme découvert qu'après l'avoir réellement rencontré, et comme maîtrisé qu'après trois réussites." : `Les ${remaining} mots restants sont déjà présents dans le lexique consultable, avec leur traduction, leur genre et un exemple. Ils seront introduits progressivement dans de nouvelles leçons : l'application ne les compte ni comme découverts ni comme maîtrisés avant que tu ne les aies réellement rencontrés.`}</span>
        </div>
        <p class="tiny muted" style="margin-top:12px">Prochaine étape prévue : ajouter les environnements hôpital, restaurant et ville sur la même architecture de scènes, puis travailler l'écoute de dialogues enregistrés.</p>
      </section>
    </div>

    <div class="stack">
      <section class="card">
        <h2 class="h3">${icon("search")} Sources du lexique</h2>
        <p class="small muted" style="margin:6px 0 10px">La sélection éditoriale combine deux listes de fréquence réelles, puis ajoute les mots indispensables aux situations du parcours.</p>
        <div class="source-list">
          <div><a href="https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Spanish1000" target="_blank" rel="noopener noreferrer">Wiktionary — Spanish 1000</a><br /><span class="tiny">Sous-titres de films et séries (27,4 M de mots) · rang du lemme</span></div>
          <div><a href="https://github.com/hermitdave/FrequencyWords" target="_blank" rel="noopener noreferrer">hermitdave/FrequencyWords — es_50k</a><br /><span class="tiny">OpenSubtitles 2018 · comparaison des fréquences de surface</span></div>
        </div>
        <p class="tiny muted" style="margin-top:12px">La fréquence brute ne suffit pas : les mots trop spécialisés ont été écartés au profit de mots utiles dès le niveau A1 (salutations, objets du quotidien, nombres, couleurs).</p>
      </section>

      <section class="card">
        <h2 class="h3">${icon("layers")} Architecture</h2>
        <ul class="small muted" style="margin-top:8px;display:grid;gap:7px;list-style:none">
          <li>· Données séparées de l'interface : lexique, dialogues, thèmes et scènes SVG.</li>
          <li>· Mots calculés depuis le texte, identifiants stables partagés partout.</li>
          <li>· Progression locale versionnée, sauvegarde automatique.</li>
          <li>· Aucune dépendance externe : Bun sert les modules ES tels quels.</li>
        </ul>
      </section>

      <section class="card card--tinted">
        <h2 class="h3">${icon("bulb")} Un mot sur la méthode</h2>
        <p class="small muted" style="margin-top:8px">Un mot est <strong>découvert</strong> quand tu l'as rencontré. Il devient <strong>maîtrisé</strong> après trois réussites en Memory ou en exercice. La lecture seule ne suffit jamais.</p>
      </section>

      <p class="tiny muted" style="text-align:center">Violeta · ${plural(LEXICON.length, "mot cible", "mots cibles")} · progression enregistrée sur cet appareil</p>
    </div>
  </div>`;

  for (const choice of root.querySelectorAll("[data-theme-choice]")) {
    choice.addEventListener("click", () => {
      const value = setTheme(choice.dataset.themeChoice);
      for (const btn of root.querySelectorAll("[data-theme-choice]")) {
        btn.setAttribute("aria-pressed", String(btn.dataset.themeChoice === value));
      }
      toast(value === "dark" ? "Thème sombre activé." : value === "light" ? "Thème clair activé." : "Thème du système activé.");
    });
  }

  $("[data-audio]", root)?.addEventListener("click", (event) => {
    const btn = event.currentTarget;
    const next = btn.getAttribute("aria-checked") !== "true";
    btn.setAttribute("aria-checked", String(next));
    store.saveSettings({ audio: next });
    if (!next) toast("Prononciation désactivée.");
    else {
      toast("Prononciation activée.");
      speak("Hola, ¿qué tal?", { force: true });
    }
  });

  $("[data-translations]", root)?.addEventListener("click", (event) => {
    const btn = event.currentTarget;
    const next = btn.getAttribute("aria-checked") !== "true";
    btn.setAttribute("aria-checked", String(next));
    store.saveSettings({ showTranslationByDefault: next });
  });

  $("[data-test-voice]", root)?.addEventListener("click", () => {
    const ok = speak("Hola, me llamo Lucía. ¿Qué tal?", { force: true });
    if (!ok) toast("La synthèse vocale n'est pas disponible dans ce navigateur.");
  });

  $("[data-export]", root)?.addEventListener("click", () => {
    const blob = new Blob([store.export()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `violeta-progression-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast("Progression exportée.");
  });

  $("[data-reset]", root)?.addEventListener("click", async () => {
    const confirmed = await confirmModal({
      title: "Réinitialiser toute la progression ?",
      message: "Cette action est définitive et ne peut pas être annulée. Elle supprime les leçons validées, les 1 000 mots découverts ou maîtrisés, les niveaux terminés et l'historique de révision.",
      warning: "Aucune sauvegarde automatique n'est conservée après suppression. Pense à exporter ta progression si tu veux la garder.",
      confirmLabel: "Oui, tout effacer",
      danger: true,
    });
    if (!confirmed) return;
    store.reset();
    toast("Progression réinitialisée.");
    renderSettings(root);
  });
}
