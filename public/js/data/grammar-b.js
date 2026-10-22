/**
 * Leçons de grammaire — paliers A2 et B1 (g11 → g19).
 */
const ex = (prompt, options, answer, why) => ({ type: "choice", prompt, options, answer, why });
const inp = (prompt, answer, why) => ({ type: "input", prompt, answer, why });

export const GRAMMAR_B = [
  {
    id: "g11",
    order: 11,
    level: "A2",
    afterLesson: 16,
    title: "Le passé composé",
    subtitle: "haber + participe : parler de la semaine",
    goal: "Raconter une action récente sans confondre avec l'indéfini.",
    rules: [
      {
        title: "La formation",
        text: "haber au présent (he, has, ha, hemos, habéis, han) + participe passé. Le participe ne s'accorde jamais avec le sujet.",
        examples: [
          { es: "He comido.", fr: "J'ai mangé." },
          { es: "Ellas han llegado.", fr: "Elles sont arrivées." },
        ],
      },
      {
        title: "Quand l'employer",
        text: "Pour une action passée dans une période encore ouverte (aujourd'hui, cette semaine, ce mois, jamais/ déjà) ou dont le résultat compte maintenant.",
        examples: [
          { es: "Hoy he trabajado mucho.", fr: "Aujourd'hui j'ai beaucoup travaillé." },
          { es: "¿Has estado en Sevilla?", fr: "Tu as déjà été à Séville ?" },
        ],
      },
      {
        title: "Les participes irréguliers",
        text: "hacer → hecho, decir → dicho, ver → visto, poner → puesto, escribir → escrito, abrir → abierto, romper → roto, volver → vuelto.",
        examples: [{ es: "No he visto la película.", fr: "Je n'ai pas vu le film." }],
      },
    ],
    tables: [
      {
        title: "haber au présent",
        head: ["personne", "haber"],
        rows: [
          ["yo", "he"],
          ["tú", "has"],
          ["él / ella", "ha"],
          ["nosotros", "hemos"],
          ["vosotros", "habéis"],
          ["ellos", "han"],
        ],
      },
    ],
    watch: ["Avec « hoy », « esta semana », « ya », « todavía no » : passé composé. Avec « ayer », « el año pasado » : indéfini.", "On ne sépare jamais haber et le participe : « he comido », pas « he bien comido » (on dit « he comido bien »)."],
    exercises: [
      inp("Traduis « J'ai mangé »", "he comido", "haber + participe : he comido."),
      ex("« Nous avons vu » se dit…", ["hemos visto", "hemos veído", "habemos visto"], "hemos visto", "visto est irrégulier et hemos est la forme correcte."),
      ex("« Il n'est pas venu » se dit…", ["No ha venido", "No ha vino", "No es venido"], "No ha venido", "venir → venido, avec l'auxiliaire haber."),
      inp("Donne le participe passé de « hacer »", "hecho", "Participe irrégulier : hecho."),
      ex("Quel marqueur appelle le passé composé ?", ["esta semana", "ayer", "en 2019"], "esta semana", "Période encore ouverte : passé composé."),
    ],
  },
  {
    id: "g12",
    order: 12,
    level: "A2",
    afterLesson: 20,
    title: "Le passé simple (indéfini)",
    subtitle: "L'événement daté",
    goal: "Raconter une suite d'actions terminées.",
    rules: [
      {
        title: "Les terminaisons",
        text: "-ar : -é, -aste, -ó, -amos, -asteis, -aron. -er / -ir : -í, -iste, -ió, -imos, -isteis, -ieron. Les accents sont indispensables.",
        examples: [
          { es: "hablé, hablaste, habló", fr: "je parlai, tu parlas, il parla" },
          { es: "comí, comiste, comió", fr: "je mangeai, tu mangeas, il mangea" },
        ],
      },
      {
        title: "Quand l'employer",
        text: "Pour une action ponctuelle et terminée, souvent datée ou successive. C'est le temps du récit au passé.",
        examples: [
          { es: "Ayer fui al cine y vi una película.", fr: "Hier je suis allé au cinéma et j'ai vu un film." },
          { es: "En 2019 trabajé en Madrid.", fr: "En 2019 j'ai travaillé à Madrid." },
        ],
      },
      {
        title: "Les irréguliers fréquents",
        text: "ser/ir : fui, fuiste, fue… ; tener : tuve ; hacer : hice ; estar : estuve ; poder : pude ; venir : vine ; decir : dije.",
        examples: [{ es: "Hace dos años estuve en Córdoba.", fr: "Il y a deux ans j'étais (j'ai séjourné) à Cordoue." }],
      },
    ],
    tables: [
      {
        title: "Passé simple régulier",
        head: ["personne", "hablar", "comer"],
        rows: [
          ["yo", "hablé", "comí"],
          ["tú", "hablaste", "comiste"],
          ["él", "habló", "comió"],
          ["nosotros", "hablamos", "comimos"],
          ["vosotros", "hablasteis", "comisteis"],
          ["ellos", "hablaron", "comieron"],
        ],
      },
    ],
    watch: ["« hace » + durée = il y a : hace dos años.", "Attention : « hablamos » est identique au présent ; le contexte décide."],
    exercises: [
      ex("« Hier, j'ai travaillé » se dit…", ["Ayer trabajé", "Ayer he trabajado", "Ayer trabajaba"], "Ayer trabajé", "Date précise et action terminée : indéfini."),
      inp("Traduis « Ils ont mangé »", "comieron", "3e personne du pluriel : comieron."),
      ex("« hace dos años » signifie…", ["il y a deux ans", "dans deux ans", "depuis deux ans"], "il y a deux ans", "hace + durée = il y a."),
      inp("Complète : « Anoche ___ (yo, ver) una película. »", "vi", "ver est irrégulier : vi."),
      ex("Quelle forme est correcte ?", ["ella habló", "ella hablío", "ella hablastes"], "ella habló", "3e personne : habló, avec accent."),
    ],
  },
  {
    id: "g13",
    order: 13,
    level: "A2",
    afterLesson: 25,
    title: "Les pronoms COD et COI",
    subtitle: "le, la, lo, les — et leur place",
    goal: "Remplacer un complément sans répéter le nom.",
    rules: [
      {
        title: "Complément d'objet direct",
        text: "me, te, lo, la, nos, os, los, las. Le pronom se place avant le verbe conjugué, après un infinitif ou un impératif affirmatif.",
        examples: [
          { es: "¿El pan? Lo compré ayer.", fr: "Le pain ? Je l'ai acheté hier." },
          { es: "Quiero verlo.", fr: "Je veux le voir." },
        ],
      },
      {
        title: "Complément d'objet indirect",
        text: "me, te, le, nos, os, les. On l'emploie avec des verbes comme dar, decir, escribir, mandar, telefonear.",
        examples: [
          { es: "Le escribo a mi hermana.", fr: "J'écris à ma sœur." },
          { es: "¿Me lo das?", fr: "Tu me le donnes ?" },
        ],
      },
      {
        title: "le + lo → se lo",
        text: "Quand le ou les précède lo, la, los, las, il devient se : « Se lo doy » (je le lui donne).",
        examples: [{ es: "Se las mando mañana.", fr: "Je les lui envoie demain." }],
      },
    ],
    tables: [
      {
        title: "COD et COI",
        head: ["personne", "COD", "COI"],
        rows: [
          ["moi", "me", "me"],
          ["toi", "te", "te"],
          ["lui / elle", "lo / la", "le"],
          ["nous", "nos", "nos"],
          ["vous", "os", "os"],
          ["eux / elles", "los / las", "les"],
        ],
      },
    ],
    watch: ["À l'impératif affirmatif, tout se colle : dímelo, dámelo.", "À l'impératif négatif, le pronom repasse devant : no me lo digas."],
    exercises: [
      inp("Traduis « Je le vois » (un livre)", "lo veo", "livre = masculin singulier : lo."),
      ex("« Je lui parle » se dit…", ["Le hablo", "Lo hablo", "La hablo"], "Le hablo", "parler à quelqu'un : COI le."),
      ex("« Donne-le-moi » se dit…", ["Dámelo", "Me lo da", "Lo me da"], "Dámelo", "Impératif affirmatif : les pronoms se collent dans l'ordre COI + COD."),
      ex("Complète : « ___ lo doy a ella. »", ["Se", "Le", "La"], "Se", "le + lo devient se lo."),
      inp("Complète : « ¿Dónde están las llaves? No ___ encuentro. »", "las", "llaves est féminin pluriel : las."),
    ],
  },
  {
    id: "g14",
    order: 14,
    level: "A2",
    afterLesson: 30,
    title: "L'imparfait et son opposition",
    subtitle: "le décor et l'événement",
    goal: "Choisir entre imparfait et passé simple dans un récit.",
    rules: [
      {
        title: "La formation",
        text: "Verbes en -ar : -aba, -abas, -aba, -ábamos, -abais, -aban. Verbes en -er / -ir : -ía, -ías, -ía, -íamos, -íais, -ían.",
        examples: [
          { es: "Cuando era niño, jugaba en la calle.", fr: "Quand j'étais enfant, je jouais dans la rue." },
          { es: "Antes vivíamos en el campo.", fr: "Avant, nous vivions à la campagne." },
        ],
      },
      {
        title: "Ce que fait l'imparfait",
        text: "Il décrit le décor, l'âge, l'heure, une habitude, une action en cours. Il ne fait pas avancer l'histoire.",
        examples: [{ es: "Eran las ocho y llovía.", fr: "Il était huit heures et il pleuvait." }],
      },
      {
        title: "L'opposition",
        text: "L'imparfait pose le décor, le passé simple apporte l'événement : « Dormía cuando sonó el teléfono » (je dormais quand le téléphone a sonné).",
        examples: [{ es: "Ayer fui al cine.", fr: "Hier, je suis allé au cinéma (événement daté)." }],
      },
    ],
    tables: [
      {
        title: "Imparfait régulier",
        head: ["personne", "hablar", "comer"],
        rows: [
          ["yo", "hablaba", "comía"],
          ["tú", "hablabas", "comías"],
          ["él", "hablaba", "comía"],
          ["nosotros", "hablábamos", "comíamos"],
          ["vosotros", "hablabais", "comíais"],
          ["ellos", "hablaban", "comían"],
        ],
      },
    ],
    watch: ["ser, ir et ver sont irréguliers : era, iba, veía.", "« siempre », « a menudo », « antes », « cada día » appellent l'imparfait."],
    exercises: [
      ex("« Quand j'étais petit… » se dit…", ["Cuando era pequeño…", "Cuando fui pequeño…", "Cuando estuve pequeño…"], "Cuando era pequeño…", "L'âge et le décor à l'imparfait : era."),
      inp("Traduis « Nous habitions ici »", "vivíamos aquí", "Imparfait de vivir : vivíamos, avec accent."),
      ex("« Ayer fui al cine » raconte…", ["un événement précis", "une habitude", "une description"], "un événement précis", "Action datée et terminée : passé simple."),
      inp("Complète : « Antes ___ (yo, ir) a la playa cada verano. »", "iba", "ir à l'imparfait : iba."),
      ex("Quel marqueur appelle l'imparfait ?", ["cada día", "ayer", "de repente"], "cada día", "L'habitude répétée : imparfait."),
    ],
  },
  {
    id: "g15",
    order: 15,
    level: "A2",
    afterLesson: 40,
    title: "L'impératif",
    subtitle: "Demander, conseiller, interdire",
    goal: "Donner un ordre positif et négatif, avec les pronoms.",
    rules: [
      {
        title: "L'impératif affirmatif",
        text: "tú : 3e personne du présent (habla, come, vive). vosotros : infinitif -r remplacé par -d (hablad, comed, vivid).",
        examples: [
          { es: "Habla más despacio.", fr: "Parle plus lentement." },
          { es: "Escuchad bien.", fr: "Écoutez bien." },
        ],
      },
      {
        title: "Les irréguliers du tú",
        text: "hacer → haz, decir → di, ir → ve, poner → pon, salir → sal, ser → sé, tener → ten, venir → ven.",
        examples: [{ es: "Haz la cama, por favor.", fr: "Fais le lit, s'il te plaît." }],
      },
      {
        title: "L'impératif négatif",
        text: "no + subjonctif présent : no hables, no comas, no vayas. Les pronoms se placent devant : no me lo digas.",
        examples: [
          { es: "No corras.", fr: "Ne cours pas." },
          { es: "No te preocupes.", fr: "Ne t'inquiète pas." },
        ],
      },
    ],
    tables: [
      {
        title: "Impératif",
        head: ["", "affirmatif", "négatif"],
        rows: [
          ["tú", "habla", "no hables"],
          ["usted", "hable", "no hable"],
          ["nosotros", "hablemos", "no hablemos"],
          ["vosotros", "hablad", "no habléis"],
          ["ustedes", "hablen", "no hablen"],
        ],
      },
    ],
    watch: ["À l'affirmatif, les pronoms se collent : dímelo, cómpralo.", "Au négatif, ils repassent devant : no se lo digas."],
    exercises: [
      inp("Traduis « Parle ! » (tú)", "habla", "3e personne du présent : habla."),
      ex("« Ne parle pas » se dit…", ["No hables", "No habla", "No hablar"], "No hables", "Négatif : no + subjonctif, hables."),
      ex("« Écoutez ! » (vosotros) se dit…", ["Escuchad", "Escuchadle", "Escuchan"], "Escuchad", "Infinitif en -d : escuchad."),
      inp("Donne l'impératif de « hacer » (tú)", "haz", "Impératif irrégulier : haz."),
      ex("« Dímelo » signifie…", ["Dis-le-moi", "Il me le dit", "Dis-moi"], "Dis-le-moi", "di + me + lo collés."),
    ],
  },
  {
    id: "g16",
    order: 16,
    level: "B1",
    afterLesson: 58,
    title: "Futur et conditionnel",
    subtitle: "Prévoir, promettre, demander poliment",
    goal: "Former les deux temps et les employer au bon moment.",
    rules: [
      {
        title: "Le futur",
        text: "Infinitif + é, ás, á, emos, éis, án (les verbes en -er / -ir gardent le e de l'infinitif). Pour exprimer une hypothèse sur le présent, le futur remplace souvent le présent en français.",
        examples: [
          { es: "Mañana hablaré con ella.", fr: "Demain je parlerai avec elle." },
          { es: "Serán las cinco.", fr: "Il doit être cinq heures." },
        ],
      },
      {
        title: "Le conditionnel",
        text: "Infinitif + ía, ías, ía, íamos, íais, ían. On l'emploie pour la politesse, le souhait et l'hypothèse.",
        examples: [
          { es: "¿Podrías ayudarme?", fr: "Pourrais-tu m'aider ?" },
          { es: "Me gustaría vivir aquí.", fr: "J'aimerais vivre ici." },
        ],
      },
      {
        title: "Les radicaux irréguliers",
        text: "tener → tendr-, hacer → har-, poder → podr-, decir → dir-, querer → querr-, salir → saldr-, venir → vendr-, poner → pondr-, haber → habr-.",
        examples: [{ es: "Tendríamos que salir antes.", fr: "Nous devrions partir plus tôt." }],
      },
    ],
    tables: [
      {
        title: "Futur et conditionnel de hablar",
        head: ["personne", "futur", "conditionnel"],
        rows: [
          ["yo", "hablaré", "hablaría"],
          ["tú", "hablarás", "hablarías"],
          ["él", "hablará", "hablaría"],
          ["nosotros", "hablaremos", "hablaríamos"],
          ["vosotros", "hablaréis", "hablaríais"],
          ["ellos", "hablarán", "hablarían"],
        ],
      },
    ],
    watch: ["L'accent est obligatoire sur toutes les formes sauf nosotras : hablaré, hablarás, hablará…", "« querría » (je voudrais) et « quería » (je voulais) ne se confondent pas."],
    exercises: [
      inp("Traduis « Je parlerai »", "hablaré", "Infinitif + é : hablaré."),
      ex("« Ils auraient » se dit…", ["tendrían", "tenerían", "tenían"], "tendrían", "Radical tendr- + ían."),
      inp("Traduis « Je voudrais » (querer)", "querría", "Radical querr- + ía."),
      ex("« ¿Podrías ayudarme? » est…", ["une demande polie", "un ordre", "un passé"], "une demande polie", "Conditionnel de politesse."),
      ex("Quel est le futur de « hacer » ?", ["haré", "haceré", "hacré"], "haré", "Radical irrégulier har-."),
    ],
  },
  {
    id: "g17",
    order: 17,
    level: "B1",
    afterLesson: 72,
    title: "Le subjonctif présent",
    subtitle: "Le mode du souhait et de la subjectivité",
    goal: "Former le subjonctif et reconnaître ses déclencheurs.",
    rules: [
      {
        title: "La formation",
        text: "On part de la 1re personne du présent, on enlève -o et on ajoute les terminaisons inversées : -ar → e, es, e, emos, éis, en ; -er / -ir → a, as, a, amos, áis, an.",
        examples: [
          { es: "hablo → hable, hables, hable…", fr: "parler" },
          { es: "como → coma, comas, coma…", fr: "manger" },
        ],
      },
      {
        title: "Les déclencheurs",
        text: "Volonté (querer que, pedir que), émotion (me alegra que), doute (no creo que), nécessité (es importante que), but (para que), temps futur (cuando + futur, en cuanto, hasta que).",
        examples: [
          { es: "Quiero que vengas.", fr: "Je veux que tu viennes." },
          { es: "Cuando llegues, llámame.", fr: "Quand tu arriveras, appelle-moi." },
        ],
      },
      {
        title: "Les irréguliers",
        text: "ser → sea, estar → esté, ir → vaya, haber → haya, saber → sepa, dar → dé, tener → tenga, hacer → haga, poder → pueda, venir → venga.",
        examples: [{ es: "Es importante que estés tranquilo.", fr: "Il est important que tu sois calme." }],
      },
    ],
    tables: [
      {
        title: "Subjonctif présent",
        head: ["personne", "hablar", "comer"],
        rows: [
          ["yo", "hable", "coma"],
          ["tú", "hables", "comas"],
          ["él", "hable", "coma"],
          ["nosotros", "hablemos", "comamos"],
          ["vosotros", "habléis", "comáis"],
          ["ellos", "hablen", "coman"],
        ],
      },
    ],
    watch: ["« aunque » + indicatif = bien que (fait réel) ; + subjonctif = même si (hypothèse).", "« es verdad que » reste à l'indicatif : c'est un constat, pas une subjectivité."],
    exercises: [
      ex("« Je veux que tu viennes » se dit…", ["Quiero que vengas", "Quiero que vienes", "Quiero que vendrás"], "Quiero que vengas", "Volonté + que + subjonctif."),
      inp("Donne le subjonctif de « hablar » à « yo »", "hable", "-ar → -e : hable."),
      ex("Complète : « Es importante que ___ (ser) así. »", ["sea", "es", "será"], "sea", "Nécessité + subjonctif : sea."),
      inp("Complète : « Espero que ___ (tú, estar) bien. »", "estés", "estar → esté, avec accent à tú : estés."),
      ex("Quel déclencheur appelle le subjonctif ?", ["para que", "porque", "puesto que"], "para que", "Le but introduit par para que demande le subjonctif."),
    ],
  },
  {
    id: "g18",
    order: 18,
    level: "B1",
    afterLesson: 64,
    title: "Connecteurs et enchaînement",
    subtitle: "Structurer un avis à l'oral comme à l'écrit",
    goal: "Relier deux idées sans répéter « y » et « pero ».",
    rules: [
      {
        title: "Ajouter et opposer",
        text: "además (de plus), también (aussi), incluso (même), sin embargo (cependant), por el contrario (au contraire), aunque (bien que / même si).",
        examples: [
          { es: "Es caro; sin embargo, vale la pena.", fr: "C'est cher ; cependant, ça vaut la peine." },
          { es: "Además, habla tres idiomas.", fr: "De plus, il parle trois langues." },
        ],
      },
      {
        title: "Expliquer et conclure",
        text: "porque (parce que), ya que / puesto que (puisque), por eso (c'est pourquoi), así que (donc), en resumen (en résumé), al final (finalement).",
        examples: [{ es: "No venía, así que llamé.", fr: "Il ne venait pas, donc j'ai appelé." }],
      },
      {
        title: "Nuancer",
        text: "en mi opinión (à mon avis), desde mi punto de vista, por un lado… por otro lado, la verdad es que, en realidad.",
        examples: [{ es: "Por un lado es práctico; por otro, es caro.", fr: "D'un côté c'est pratique ; de l'autre, c'est cher." }],
      },
    ],
    tables: [
      {
        title: "Les connecteurs utiles",
        head: ["fonction", "connecteur"],
        rows: [
          ["ajouter", "además / también"],
          ["opposer", "sin embargo / aunque"],
          ["expliquer", "porque / ya que"],
          ["conclure", "por eso / en resumen"],
          ["nuancer", "por un lado… por otro lado"],
        ],
      },
    ],
    watch: ["« aunque » + indicatif = fait constaté ; + subjonctif = hypothèse.", "« sino » remplace pero après une négation : no es azul, sino verde."],
    exercises: [
      ex("« C'est cher, cependant je le prends » se dit…", ["Es caro, sin embargo lo compro", "Es caro, sin embargo compro lo", "Es caro, por eso no lo compro"], "Es caro, sin embargo lo compro", "sin embargo exprime l'opposition."),
      inp("Traduis « de plus »", "además", "además = de plus."),
      ex("Après une négation, on emploie…", ["sino", "pero", "aunque"], "sino", "no… sino… = non pas… mais…"),
      inp("Complète : « No estudiaba, ___ que suspendió. » (donc)", "así", "así que = donc."),
      ex("« Por un lado… » appelle…", ["por otro lado", "por eso", "en resumen"], "por otro lado", "La structure est symétrique."),
    ],
  },
  {
    id: "g19",
    order: 19,
    level: "B1",
    afterLesson: 68,
    title: "Le « se » impersonnel et le passif",
    subtitle: "On parle espagnol — et on ne sait pas qui",
    goal: "Éviter le « on » français et donner un ton impersonnel.",
    rules: [
      {
        title: "se + 3e personne",
        text: "Pour exprimer une généralité sans préciser l'agent : se + verbe à la 3e personne, singulier ou pluriel selon l'objet.",
        examples: [
          { es: "Aquí se habla español.", fr: "Ici on parle espagnol." },
          { es: "Se venden pisos.", fr: "On vend des appartements." },
        ],
      },
      {
        title: "Le passif avec ser",
        text: "ser + participe accordé + por + agent. Plus formel, fréquent à l'écrit et dans les nouvelles.",
        examples: [{ es: "La novela fue escrita por Cervantes.", fr: "Le roman a été écrit par Cervantès." }],
      },
      {
        title: "L'impersonnel avec la 3e personne du pluriel",
        text: "On peut aussi mettre le verbe à la 3e personne du pluriel, sans sujet : « Dicen que… » (on dit que…), « Llaman a la puerta » (on frappe à la porte).",
        examples: [{ es: "Me han dicho que es verdad.", fr: "On m'a dit que c'est vrai." }],
      },
    ],
    tables: [
      {
        title: "Trois façons de dire « on »",
        head: ["structure", "exemple", "registre"],
        rows: [
          ["se + 3e pers.", "se habla español", "courant"],
          ["3e pers. du pluriel", "dicen que…", "oral"],
          ["ser + participe", "fue escrito por…", "formel"],
        ],
      },
    ],
    watch: ["« se vende » avec un objet singulier, « se venden » avec un objet pluriel : l'accord se fait avec la chose.", "Le passif avec estar décrit un résultat : « la puerta está cerrada » (la porte est fermée)."],
    exercises: [
      ex("« Ici on parle espagnol » se dit…", ["Aquí se habla español", "Aquí se hablan español", "Aquí habla español"], "Aquí se habla español", "Objet singulier : se habla."),
      inp("Traduis « On vend des livres »", "se venden libros", "libros pluriel : se venden."),
      ex("« La porte est fermée » (résultat) se dit…", ["La puerta está cerrada", "La puerta es cerrada", "La puerta se cierra"], "La puerta está cerrada", "Résultat d'une action avec estar + participe."),
      ex("« Fue escrito por… » est…", ["un passif formel", "un futur", "un subjonctif"], "un passif formel", "ser + participe + por."),
      inp("Complète : « ___ que va a llover. » (on dit)", "Dicen", "3e personne du pluriel impersonnelle : dicen."),
    ],
  },
];
