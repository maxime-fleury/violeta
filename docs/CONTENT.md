# Contenus pédagogiques — schémas et conventions

Tous les contenus sont des données pures, séparées de l'interface. Aucune phrase
espagnole n'est écrite en dur dans un composant.

## 1. Lexique cible (1 000 mots)

Fichier généré : `public/js/data/lexicon.js` — `export const LEXICON = [...]`.
La source éditable est `content/seed/*.txt` (une entrée par ligne) et
`content/lexicon/*.js` (entrées complètes par lot).

Une entrée :

```js
{
  id: "casa",            // slug stable, sans article, sans accent (a-z0-9-)
  es: "casa",            // lemme espagnol (forme de référence)
  fr: "maison",          // traduction française principale
  pos: "n.f",            // n.m | n.f | v | adj | adv | pron | prep | conj | det | num | interj | expr
  gender: "f",           // uniquement pour les noms (f | m), sinon absent
  rank: 143,             // rang de fréquence mesuré (1..1000), calculé par le script
  ex: "Mi casa es pequeña.",       // exemple simple, naturel
  exFr: "Ma maison est petite.",   // traduction de l'exemple
  variants: ["casas"],   // formes fléchies irrégulières à reconnaître (facultatif)
  senses: [{ fr: "maison", note: "" }], // sens secondaires (facultatif)
  theme: "maison",       // thème éditorial
  level: "A1"            // A1 | A2 | B1
}
```

Règles :

- `id` = lemme sans accent, en minuscules, espaces remplacés par `-`.
- Une forme conjuguée ou un pluriel n'est **jamais** une entrée indépendante :
  il va dans `variants` de son lemme (ou est résolu par les règles
  morphologiques de `public/js/lemma.js`).
- Les verbes sont à l'infinitif, les noms au singulier (sauf pluriel lexicalisé
  comme `gafas`), les adjectifs au masculin singulier.
- Les genres irréguliers sont obligatoires (`agua` f, `problema` m, `mapa` m).
- Pas de doublons de `id` ni de doublons sémantiques inutiles.

## 2. Leçons du parcours principal

Fichier : `public/js/data/lessons.js`.

```js
{
  id: "l01",
  order: 1,
  level: "A1",
  title: "Premiers mots",
  subtitle: "Se présenter à une nouvelle voisine",
  place: "El portal de casa",
  lines: [
    { who: "Lucía", es: "Hola, buenos días.", fr: "Bonjour, bonjour." },
    { who: null,   es: "Carlos sonríe.", fr: "Carlos sourit." }
  ],
  contextGloss: { banco: "banc (pour s'asseoir)" }, // sens contextuel prioritaire
  notes: "Faire observer le tutoiement." // facultatif, affiché en fin de leçon
}
```

- `newWords` déclare les 8 à 12 lemmes **ciblés** (ceux du Memory et du
  compteur de couverture) ; le script de validation vérifie qu'ils figurent
  réellement dans le texte.
- `TEXT_INTRO` (dans `core/curriculum.js`) complète cette liste : tout lemme du
  lexique qui apparaît dans un dialogue compte comme intégré au parcours, même
  s'il n'est pas une cible déclarée. La couverture réelle additionne donc les
  cibles, les mots lus dans les textes, les thèmes et les environnements.
- Le surlignage violet ne se limite pas à cette liste : tout lemme jamais
  rencontré dans une leçon précédente est violet (voir §6).
- Le texte réutilise naturellement les mots des leçons précédentes.
- `who: null` = ligne de narration.

## 3. Leçons thématiques

Fichier : `public/js/data/specials.js`. Chaque thème a :

- `id`, `title`, `subtitle`, `icon`, `color`, `kind` (`list` | `expressions` | `numbers` | `math` | `days` | `colors` | `hundreds`)
- `items` : `{ id, es, fr, note?, example?, exampleFr? }`
- `exercises` : questions `{ id, type: "choice" | "input" | "match", prompt, answer, options?, hint? }`
- `sections` : regroupements éditoriaux pour les 10 leçons d'expressions.

Les mots des leçons thématiques qui appartiennent au lexique cible utilisent le
même `id` que le lexique : ils comptent donc dans la progression globale.

## 4. Environnements interactifs

Fichier : `public/js/data/environments.js`.

```js
{
  id: "apartamento",
  title: "L'appartement",
  subtitle: "Six pièces à explorer",
  icon: "⌂",
  rooms: [
    {
      id: "cocina", title: "La cuisine", es: "La cocina",
      levels: [
        {
          id: "cocina-1", title: "Meubles et équipements",
          scene: { viewBox: "0 0 800 500", backdrop: "<svg…>", objects: [ ... ] },
          lines: [ { who: "Ana", es: "…", fr: "…" } ],
          quiz: [ { prompt, answer, options } ]
        }
      ]
    }
  ]
}
```

Un objet de scène :

```js
{
  id: "frigorifico",          // id du mot du lexique (ou mot thématique)
  es: "el frigorífico",       // libellé affiché
  fr: "le réfrigérateur",
  art: "<rect …/><rect …/>",  // dessin SVG de l'objet (coordonnées du viewBox)
  hit: '<rect x="…" …/>',     // zone interactive exacte couvrant l'objet
  labelAt: { x: 180, y: 120 } // point d'ancrage de l'infobulle
}
```

- La zone interactive doit épouser l'objet dessiné (pas de boutons au hasard).
- Accessible au clavier : chaque objet est un `<g role="button" tabindex="0">`
  avec `aria-label` construit à partir de `es`/`fr`.
- Découvrir un objet marque le mot « découvert » ; la maîtrise vient du quiz final.
- Le dialogue se débloque quand tous les objets du niveau ont été découverts.

## 5. Progression

Clé `localStorage` : `violeta.progress.v1` (voir `public/js/core/store.js`).
Tout l'état est sérialisable et versionné ; une réinitialisation explicite
supprime la clé après confirmation. Le thème est stocké à part
(`violeta.theme`) pour survivre à une réinitialisation.

## 6. Règle d'affichage du violet

Un token est violet si son lemme n'a jamais été rencontré dans une leçon
précédente du parcours, **ou** s'il fait partie des `newWords` de la leçon.
Sont exclus : les prénoms et noms propres (présents dans le texte mais absents
du lexique), et les formes verbales seulement devinées par radical. Le premier
affichage marque le mot comme découvert, sans le déclarer maîtrisé.

Les homographes accentués sont résolus sur la forme exacte : `el` (article) et
`él` (pronom), `si` (condition) et `sí` (oui), `se`, `este`, `tu`/`tú`,
`mi`/`mí` ne se confondent plus. C'est indispensable depuis que les leçons 74
et 76 enseignent précisément ces mots-outils.

## 7. Corrections éditoriales notables

Le lexique a été audité contre les textes réels : `hola`, `gracias`, `adiós`,
`español`, `hay`, `del`, `al` et les articles `la`/`los`/`las` manquaient malgré
leur fréquence. Ils ont remplacé huit entrées trop spécialisées
(`violeta`, `tratamiento`, `turismo`, `tradición`, `vacuna`, `vinagre`,
`tristeza`, `vaca`, `uña`, `valiente`, `zorro`). Le total reste exactement
1 000 entrées, chacune avec un exemple et une traduction.

## 8. Extension du parcours (leçons 37 à 56)

Le parcours est passé de 36 à 56 leçons. Les vingt nouvelles leçons suivent une
progression thématique : questions et verbes essentiels, santé et corps, émotions,
travail, études, culture, météo, animaux, voyage, vêtements, marché, saveurs,
desserts, cuisine, ville, maison, famille. Chaque leçon introduit 8 à 12 mots,
tous présents dans le texte (vérifié par `validate-content.mjs`), et réutilise
les acquis des leçons précédentes.

## 9. Extension du parcours (leçons 57 à 76)

Vingt leçons de plus ferment la boucle : le parcours couvre désormais **les
1 000 mots du lexique**, soit 792 cibles déclarées et 967 lemmes distincts
réellement lus dans les dialogues.

Les thèmes suivent la même méthode (scène concrète, 8 à 12 cibles, réemploi) :

- calendrier et nombres : mois, jours, dizaines, milliers, mesures et formes ;
- corps et santé : visage, symptômes, consultation, analyse, repos ;
- portraits : famille, voisinage, caractère, couleurs, matières et adjectifs ;
- vie quotidienne : cuisine, marché, campagne, réparations, école, cinéma ;
- langue : pronoms, petits mots de liaison, verbes de parole et de traduction ;
- société : passé, guerre, liberté, presse, respect et désaccords.

Le Memory de ces leçons reste jouable sur 8 à 12 paires ; les tests de contenu
vérifient l'identifiant de chaque mot, sa présence dans le texte, la longueur du
dialogue et l'absence de doublon d'introduction.

Ce que ces vingt leçons ne règlent pas : la maîtrise. Un mot vu une seule fois
reste fragile, et la fluidité vient des révisions et de l'écoute, pas du nombre
de leçons.

## 10. Récits de révision (un tous les dix leçons)

Fichier : `public/js/data/recits.js`.

```js
{
  id: "r40",
  afterLesson: 40,        // le récit apparaît juste après cette leçon
  level: "A2",
  title: "La semana difícil",
  subtitle: "Tomber malade et se faire aider",
  place: "El piso de Lucía y el centro de salud",
  minutes: 6,
  chapters: [{ es: "…", fr: "…" }],
  quiz: [ { type: "choice", prompt, options, answer } ]
}
```

- Le récit est inséré **dans le parcours**, entre la leçon 40 et la 41 : il se lit
  comme une étape, pas comme un thème séparé.
- Le lecteur propose « Écouter », « Lent » (0,7×), la traduction par paragraphe et
  un bouton facultatif « Je l'ai lu à voix haute ». Rien n'est imposé : la
  lecture à voix haute est un conseil, mémorisé seulement si l'élève le déclare.
- Le quiz termine le récit ; réussir toutes les questions le valide.
- **Contrainte de vocabulaire** : les récits ne doivent pas être une leçon
  déguisée. `validate-content.mjs` mesure la part de mots déjà rencontrés dans
  les leçons précédentes et refuse un récit sous **78 %**. Valeurs actuelles :
  97 %, 82 %, 83 %, 95 %, 91 %, 82 %, 87 % — le reste est constitué de mots
  transparents ou hors lexique (noms propres, objets du quotidien).
- La progression stocke `stories[id] = { done, score, total, readAloud, attempts }`
  dans la même clé `localStorage` versionnée.
- Les récits comptent dans les étapes globales (progression en pourcentage) mais
  pas dans le compteur de leçons du parcours.

## 11. Leçons de grammaire (séparées du parcours)

Fichiers : `public/js/data/grammar-a.js` (g01 → g10, A1),
`public/js/data/grammar-b.js` (g11 → g19, A2 et B1),
`public/js/core/grammar.js` (registre, mélange déterministe, contrôle éditorial).

```js
{
  id: "g04",
  order: 4,
  level: "A1",              // A1 | A2 | B1
  afterLesson: 6,           // suggestion affichée après cette leçon
  title: "ser, estar, hay",
  subtitle: "Le trio qui structure toute phrase espagnole",
  goal: "Distinguer l'identité, l'état et la présence.",
  rules: [{ title, text, examples: [{ es, fr }] }],
  tables: [{ title, head, rows }],
  watch: ["..."],
  exercises: [
    { type: "choice", prompt, options, answer, why },
    { type: "input", prompt, answer, why }
  ]
}
```

- **Séparées, pas cachées** : les 19 points ne comptent pas dans les 76 leçons
  et ne changent pas le pourcentage du parcours. Ils ont leur page
  (`#/grammaire`), leur progression (`progress.grammar`) et un badge propre.
- **Suggestion contextuelle** : chaque point a un `afterLesson`. Dans le parcours,
  il apparaît comme une ligne discrète juste après cette leçon, avec le badge
  « Conseillée » ; l'accueil propose le prochain point non validé. Rien n'est
  verrouillé : la suggestion suit l'élève, elle ne le bloque pas.
- **Contenu** : trois règles, un tableau quand il aide (conjugaisons, accords,
  pronoms), un encadré « À surveiller » pour les pièges franco-espagnols
  (`el agua`, `gran` / `grande`, double négation, `le` + `lo` → `se lo`).
- **Exercices** : 95 au total, 5 par point, choix multiple et saisie libre,
  corrigés sur place. Les options sont mélangées de façon **déterministe**
  (hash de l'identifiant) pour que la bonne réponse ne soit pas toujours la
  première sans changer l'ordre à chaque rendu.
- **Contrôles** : `validateGrammar()` vérifie identifiants uniques, niveau,
  ancrage dans une leçon existante, minimum de règles et d'exercices, présence
  de la bonne réponse dans les options et absence de doublons.
- La progression stocke `grammar[id] = { done, attempts, bestScore, total }`.

## 12. Tests de niveau (six épreuves finales)

Fichiers : `public/js/core/tests.js` (construction des épreuves),
`public/js/views/test.js` (passation), section « Tes tests de niveau » sur
l'accueil.

| Test | Questions | Source des questions |
| --- | --- | --- |
| A1 grammaire | 12 | exercices des points g01 → g10, un par point puis deuxième passage |
| A1 vocabulaire | 12 | mots A1 les plus fréquents (rang ≤ 250), choix espagnol → français |
| A2 grammaire | 12 | points g11 → g15 (passés, pronoms, impératif) |
| A2 vocabulaire | 12 | lexique A2, alternance choix / production écrite |
| B1 grammaire | 12 | points g16 → g19 (futur, subjonctif, connecteurs, passif) |
| B1 vocabulaire | 12 | mots A2 les moins fréquents, production français → espagnol |

- **Déterministes** : les questions et les options sont dérivées du contenu par
  un mélange à graine fixe. Le même test est donc identique d'une session à
  l'autre, sans banque de questions dupliquée à la main.
- **Passation** : une question à la fois, aucune correction avant la fin,
  validation à **10/12** (seuil calculé : 80 %). Les accents, la ponctuation et
  les articles facultatifs sont tolérés à la saisie.
- **Après l'épreuve** : score, corrigé des seules erreurs (réponse donnée,
  réponse attendue, règle), bouton « Refaire ». Le meilleur score est conservé
  et la validation reste acquise.
- **Ouverture progressive** : A1 dès le départ, A2 après 24 leçons validées,
  B1 après 48. Un test verrouillé explique le seuil et renvoie au parcours.
- **Honnêteté du B1** : le lexique de l'application s'arrête à l'A2. Le test B1
  de vocabulaire mesure donc la **production active** des mots A2 les moins
  fréquents, et celui de grammaire les structures B1 effectivement enseignées.
  C'est un indicateur, pas une certification : aucune production libre n'est
  corrigée.
- La progression stocke `tests[id] = { attempts, bestScore, bestTotal, passed,
  passedAt }` ; les tests n'entrent pas dans le pourcentage du parcours.

## 13. Compréhensions orales (voix réelles, CC BY 4.0)

Fichiers : `public/js/data/listenings.js` (contenu), `public/js/core/listening.js`
(registre et contrôles), `public/js/views/listening.js` (lecteur + quiz),
`public/media/ecoute/` (16 MP4 compressés et 16 vignettes),
`scripts/fetch-listening-media.sh` (récupération et compression).

### Source et licence

- **Spanish Proficiency Exercises**, COERLL, University of Texas at Austin.
  Collection publiée sous **CC BY 4.0** : réutilisation autorisée avec attribution.
  Page de la collection : <https://www.laits.utexas.edu/spe/>.
- Chaque leçon affiche le nom du locuteur, sa ville d'origine, le titre de la
  tâche source, le lien vers la page d'origine et la licence. La page d'index
  rappelle l'attribution complète.
- Les vidéos d'origine sont des MP4 hébergés par COERLL. Elles sont ici
  **téléchargées, compressées en 480p (H.264 CRF 30, audio AAC 64 kbps mono)**
  et stockées localement : c'est une adaptation, signalée comme telle.
- La transcription espagnole provient de la page source (nettoyée des artefacts
  HTML et des coquilles de la source). La traduction française, le glossaire et
  les quiz ont été écrits pour Violeta.

### Structure d'une écoute

```js
{
  id: "eo04",
  order: 4,
  level: "A2",             // A2 | B1
  afterLesson: 18,         // suggestion dans le parcours après cette leçon
  seconds: 51,
  title: "Mi familia",
  speaker: "Álvaro S.",
  origin: "Santiago, Chili",
  video: "media/ecoute/eo04.mp4",
  poster: "media/ecoute/eo04.jpg",
  source: { task, url, license: "CC BY 4.0", author, collection },
  transcript: { es, fr },
  glossary: [{ es, fr }],
  quiz: [
    { type: "choice", prompt, options, answer, why },
    { type: "input", prompt, answer, alternatives, why }
  ]
}
```

- **16 extraits**, 8 en A2 et 8 en B1, de 33 à 90 secondes (15 minutes au total).
- **Suggestion contextuelle** : chaque écoute a un `afterLesson` et apparaît dans
  le parcours comme une ligne discrète après la leçon qui prépare le thème
  (objets de cuisine, famille, travail des proches, restaurant, médecin,
  vêtements…). L'accueil propose la prochaine écoute non validée.
- **Lecteur** : vidéo locale avec contrôles natifs, bouton « Réécouter »,
  vitesse 0,75×, transcription masquée par défaut, traduction française
  optionnelle, glossaire cliquable pour entendre chaque mot.
- **Quiz** : 4 questions par écoute (idée principale, détail, mot en contexte,
  inférence), choix multiple et saisie libre. La leçon est validée quand les
  4 questions sont résolues ; le meilleur score est conservé.
- **Progression** : `listenings[id] = { done, attempts, bestScore, total }`.
  Les écoutes ne comptent pas dans le pourcentage du parcours (comme la
  grammaire et les tests) pour ne pas gonfler artificiellement la progression.

### Pourquoi A2/B1 et pas A1

Les locuteurs parlent à leur débit naturel, avec hésitations, accents et
registres variés. La transcription et le ralenti aident, mais le matériau reste
authentique : le placer en A1 serait malhonnête. Les huit extraits « Beginning »
sont donc étiquetés A2, les huit « Intermediate » B1.

### Contrôles

`validateListening()` vérifie identifiants, niveaux, ancrage dans une leçon,
durée, attribution complète, transcription bilingue, glossaire (≥ 4 mots),
quiz (≥ 4 questions, bonne réponse présente, options sans doublon, correction
fournie). `validate-content.mjs` vérifie en plus que chaque MP4 et chaque
vignette existent et que chaque vidéo reste sous 3 Mo.

### Régénérer les médias

```sh
bash scripts/fetch-listening-media.sh
```

Le script télécharge les clips manquants dans un dossier temporaire, les
compresse dans `public/media/ecoute/`, extrait une vignette et affiche la taille
de chaque fichier. Il faut `curl` et `ffmpeg`.
