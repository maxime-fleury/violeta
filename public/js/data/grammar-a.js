/**
 * Leçons de grammaire — palier A1 (g01 → g10).
 * Chaque leçon s'accroche à une leçon du parcours (`afterLesson`) pour être
 * proposée au bon moment, et propose ses propres exercices corrigés.
 */
const ex = (prompt, options, answer, why) => ({ type: "choice", prompt, options, answer, why });
const inp = (prompt, answer, why) => ({ type: "input", prompt, answer, why });

export const GRAMMAR_A = [
  {
    id: "g01",
    order: 1,
    level: "A1",
    afterLesson: 3,
    title: "Articles, genre et pluriel",
    subtitle: "el, la, los, las — et comment former le pluriel",
    goal: "Choisir le bon article et mettre un nom au pluriel sans hésiter.",
    rules: [
      {
        title: "Le genre suit souvent la terminaison",
        text: "Les noms en -o sont généralement masculins, ceux en -a généralement féminins. Les terminaisons -ción, -dad, -tad et -umbre sont toujours féminines.",
        examples: [
          { es: "el libro / la casa", fr: "le livre / la maison" },
          { es: "la estación", fr: "la gare (même si elle finit par -ón)" },
        ],
      },
      {
        title: "Le pluriel",
        text: "Voyelle finale : on ajoute -s. Consonne finale : on ajoute -es. Un mot terminé par -z fait -ces.",
        examples: [
          { es: "casa → casas", fr: "maison → maisons" },
          { es: "ciudad → ciudades", fr: "ville → villes" },
          { es: "luz → luces", fr: "lumière → lumières" },
        ],
      },
      {
        title: "Les articles",
        text: "Défini : el / la / los / las. Indéfini : un / una / unos / unas. L'article s'accorde toujours avec le nom, jamais avec le locuteur.",
        examples: [{ es: "unos libros, unas sillas", fr: "des livres, des chaises" }],
      },
    ],
    tables: [
      {
        title: "Les articles",
        head: ["", "masculin", "féminin"],
        rows: [
          ["singulier", "el / un", "la / una"],
          ["pluriel", "los / unos", "las / unas"],
        ],
      },
    ],
    watch: [
      "« el agua » est féminin (las aguas) : on met el pour éviter deux a de suite.",
      "« el problema », « el día », « el mapa » et « el idioma » sont masculins malgré leur -a.",
    ],
    exercises: [
      ex("Quel article pour « ___ casa » ?", ["la", "el", "los"], "la", "casa est féminin : la casa."),
      ex("Quel article pour « ___ problema » ?", ["el", "la", "las"], "el", "Les mots en -ma d'origine grecque sont masculins : el problema."),
      ex("Le pluriel de « ciudad » est…", ["ciudades", "ciudads", "ciudadez"], "ciudades", "Consonne finale : on ajoute -es."),
      inp("Mets au pluriel : « luz »", "luces", "-z devient -ces : luz → luces."),
      inp("Mets au féminin : « un amigo »", "una amiga", "L'article et l'adjectif s'accordent : una amiga."),
    ],
  },
  {
    id: "g02",
    order: 2,
    level: "A1",
    afterLesson: 4,
    title: "Les adjectifs",
    subtitle: "Accord, place et formes courtes",
    goal: "Accorder un adjectif et le placer comme un hispanophone.",
    rules: [
      {
        title: "L'accord",
        text: "L'adjectif s'accorde en genre et en nombre avec le nom qu'il qualifie. Les adjectifs en -e ou en consonne sont invariables au féminin.",
        examples: [
          { es: "un chico alto / una chica alta", fr: "un garçon grand / une fille grande" },
          { es: "un libro interesante / una idea interesante", fr: "un livre intéressant / une idée intéressante" },
        ],
      },
      {
        title: "La place",
        text: "L'adjectif se place normalement après le nom. Avant le nom, il prend une valeur subjective ou affaiblie : « un gran hombre » = un homme remarquable, pas un homme de grande taille.",
        examples: [
          { es: "una casa blanca", fr: "une maison blanche" },
          { es: "un gran día", fr: "une grande journée" },
        ],
      },
      {
        title: "Les formes courtes (apocope)",
        text: "Devant un nom masculin singulier : bueno → buen, malo → mal, primero → primer, tercero → tercer, alguno → algún, ninguno → ningún. « Grande » devient « gran » devant un nom, quel que soit le genre.",
        examples: [{ es: "un buen vino, el primer día, una gran mujer", fr: "un bon vin, le premier jour, une grande femme" }],
      },
    ],
    tables: [
      {
        title: "Accord de l'adjectif",
        head: ["", "masculin", "féminin"],
        rows: [
          ["singulier", "alto", "alta"],
          ["pluriel", "altos", "altas"],
        ],
      },
    ],
    watch: ["« más grande » garde la forme longue : es más grande que yo.", "L'adjectif ne prend jamais d'article à la place du nom : « el libro rojo » et non « el rojo libro »."],
    exercises: [
      ex("« une maison blanche » se dit…", ["una casa blanca", "una blanca casa", "una casa blanco"], "una casa blanca", "L'adjectif suit le nom et s'accorde : casa blanca."),
      inp("Donne le féminin de « guapo »", "guapa", "On ajoute -a : guapa."),
      ex("« un gran hombre » signifie…", ["un grand homme (remarquable)", "un homme de grande taille", "un homme âgé"], "un grand homme (remarquable)", "Devant le nom, gran a une valeur de mérite."),
      inp("Mets au pluriel : « difícil »", "difíciles", "Adjectif en consonne : + es, sans accent déplacé."),
      ex("Dans « dos libros nuevos », l'adjectif est…", ["après le nom et au pluriel", "avant le nom et au singulier", "invariable"], "après le nom et au pluriel", "Il s'accorde avec libros : nuevos."),
    ],
  },
  {
    id: "g03",
    order: 3,
    level: "A1",
    afterLesson: 5,
    title: "Le présent régulier",
    subtitle: "Les trois groupes -ar, -er, -ir",
    goal: "Conjuguer un verbe régulier au présent sans modèle sous les yeux.",
    rules: [
      {
        title: "Trois groupes, trois séries",
        text: "Les verbes en -ar, -er et -ir ont des terminaisons différentes. Le radical ne change pas pour les réguliers.",
        examples: [
          { es: "hablo, hablas, habla, hablamos, habláis, hablan", fr: "parler" },
          { es: "como, comes, come, comemos, coméis, comen", fr: "manger" },
          { es: "vivo, vives, vive, vivimos, vivís, viven", fr: "vivre" },
        ],
      },
      {
        title: "Le sujet est souvent inutile",
        text: "La terminaison porte déjà la personne : « hablo » suffit pour « je parle ». On ajoute le pronom pour insister ou opposer.",
        examples: [{ es: "Yo hablo español, ella habla francés.", fr: "Moi je parle espagnol, elle parle français." }],
      },
      {
        title: "Attention aux accents",
        text: "Les formes « vosotros » portent toujours un accent écrit : habláis, coméis, vivís.",
        examples: [{ es: "¿Dónde vivís?", fr: "Où vivez-vous ?" }],
      },
    ],
    tables: [
      {
        title: "Présent de l'indicatif",
        head: ["personne", "hablar", "comer", "vivir"],
        rows: [
          ["yo", "hablo", "como", "vivo"],
          ["tú", "hablas", "comes", "vives"],
          ["él / ella", "habla", "come", "vive"],
          ["nosotros", "hablamos", "comemos", "vivimos"],
          ["vosotros", "habláis", "coméis", "vivís"],
          ["ellos", "hablan", "comen", "viven"],
        ],
      },
    ],
    watch: ["Les irréguliers très fréquents (ser, estar, ir, tener, hacer) s'apprennent à part.", "« hay » ne se conjugue pas : c'est la forme unique de « il y a »."],
    exercises: [
      inp("Conjugue « hablar » à « yo »", "hablo", "-ar → -o : hablo."),
      ex("« ellos » + comer donne…", ["comen", "comemos", "come"], "comen", "-er, 3e personne du pluriel : -en."),
      ex("« vivimos » signifie…", ["nous vivons", "ils vivent", "je vis"], "nous vivons", "-imos = nous, pour un verbe en -ir."),
      inp("Conjugue « vivir » à « tú »", "vives", "-ir → -es : vives."),
      ex("Quelle forme est correcte ?", ["vosotros habláis", "vosotros hablar", "vosotros hablan"], "vosotros habláis", "L'accent écrit est obligatoire."),
    ],
  },
  {
    id: "g04",
    order: 4,
    level: "A1",
    afterLesson: 6,
    title: "ser, estar, hay",
    subtitle: "Le trio qui structure toute phrase espagnole",
    goal: "Distinguer l'identité, l'état et la présence.",
    rules: [
      {
        title: "ser : l'identité et le permanent",
        text: "On utilise ser pour nommer, identifier, indiquer l'origine, la profession, la nationalité, l'heure et les caractéristiques considérées comme essentielles.",
        examples: [
          { es: "Soy Lucía, soy francesa.", fr: "Je suis Lucía, je suis française." },
          { es: "Es una idea interesante.", fr: "C'est une idée intéressante." },
        ],
      },
      {
        title: "estar : l'état et la localisation",
        text: "On utilise estar pour un état passager (fatigué, content, malade), pour situer une personne ou un objet précis, et pour la date.",
        examples: [
          { es: "Estoy cansado.", fr: "Je suis fatigué." },
          { es: "El libro está en la mesa.", fr: "Le livre est sur la table." },
        ],
      },
      {
        title: "hay : la présence",
        text: "hay annonce qu'il existe quelque chose, sans le désigner : il y a. On l'utilise aussi dans les questions « ¿Hay…? » et pour les quantités indéfinies.",
        examples: [
          { es: "Hay un supermercado cerca.", fr: "Il y a un supermarché près d'ici." },
          { es: "Hay mucha gente.", fr: "Il y a beaucoup de monde." },
        ],
      },
    ],
    tables: [
      {
        title: "Les formes à connaître",
        head: ["", "ser", "estar", "hay"],
        rows: [
          ["yo", "soy", "estoy", "—"],
          ["tú", "eres", "estás", "—"],
          ["él / elle", "es", "está", "hay"],
          ["nous", "somos", "estamos", "—"],
          ["vous", "sois", "estáis", "—"],
          ["ils / elles", "son", "están", "—"],
        ],
      },
    ],
    watch: ["« Está en casa » (il est chez lui, localisation) mais « Es de Madrid » (il est de Madrid, origine).", "Avec un adjectif, ser décrit un trait, estar un changement : es alegre / está alegre hoy."],
    exercises: [
      ex("« Je suis espagnol » se dit…", ["Soy español", "Estoy español", "Hay español"], "Soy español", "La nationalité se dit avec ser."),
      ex("« Il y a un café ici » se dit…", ["Hay un café aquí", "Está un café aquí", "Es un café aquí"], "Hay un café aquí", "hay annonce la présence."),
      inp("Complète : « Nosotros ___ cansados. »", "estamos", "Un état passager avec nosotros : estamos."),
      ex("« La pharmacie est là-bas » se dit…", ["La farmacia está allí", "La farmacia es allí", "La farmacia hay allí"], "La farmacia está allí", "Un lieu précis avec estar : está."),
      inp("Complète : « Ellos ___ mis hermanos. »", "son", "L'identité avec ellos : son."),
    ],
  },
  {
    id: "g05",
    order: 5,
    level: "A1",
    afterLesson: 7,
    title: "muy, mucho, poco",
    subtitle: "Dire « très », « beaucoup » et « peu » correctement",
    goal: "Ne plus confondre muy et mucho.",
    rules: [
      {
        title: "muy + adjectif ou adverbe",
        text: "muy modifie un adjectif ou un adverbe et ne s'accorde jamais. Il ne s'emploie pas seul avec un nom.",
        examples: [
          { es: "Es muy simpático.", fr: "Il est très sympathique." },
          { es: "Habla muy rápido.", fr: "Il parle très vite." },
        ],
      },
      {
        title: "mucho + nom (accord obligatoire)",
        text: "Devant un nom, mucho s'accorde : mucho, mucha, muchos, muchas. Après un verbe, il reste invariable : « trabajo mucho ».",
        examples: [
          { es: "Tengo mucho trabajo.", fr: "J'ai beaucoup de travail." },
          { es: "Hay muchas tiendas.", fr: "Il y a beaucoup de magasins." },
        ],
      },
      {
        title: "poco, un peu de",
        text: "poco fonctionne comme mucho : il s'accorde devant un nom et reste invariable après un verbe. « un poco de » + nom = un peu de.",
        examples: [
          { es: "Hablo un poco de español.", fr: "Je parle un peu espagnol." },
          { es: "Queda poca agua.", fr: "Il reste peu d'eau." },
        ],
      },
    ],
    tables: [
      {
        title: "Quel mot choisir ?",
        head: ["devant…", "on emploie", "exemple"],
        rows: [
          ["un adjectif", "muy", "muy caro"],
          ["un nom", "mucho / poca…", "mucho dinero"],
          ["un verbe", "mucho", "come mucho"],
        ],
      },
    ],
    watch: ["« muy mucho » n'existe pas : on dit muchísimo.", "« un poco » seul = un peu ; « un poco de » + nom = un peu de."],
    exercises: [
      ex("« J'ai beaucoup de travail » se dit…", ["Tengo mucho trabajo", "Tengo muy trabajo", "Tengo mucho de trabajo"], "Tengo mucho trabajo", "mucho s'accorde avec trabajo, masculin singulier."),
      inp("Traduis « très bon »", "muy bueno", "muy + adjectif, invariable : muy bueno."),
      ex("« Il parle beaucoup » se dit…", ["Habla mucho", "Habla muy", "Habla muchos"], "Habla mucho", "Après un verbe, mucho est invariable."),
      ex("« peu de temps » se dit…", ["poco tiempo", "poca tiempo", "pocos tiempo"], "poco tiempo", "tiempo est masculin singulier : poco."),
      inp("Complète : « Hay ___ gente. » (beaucoup)", "mucha", "gente est féminin singulier : mucha."),
    ],
  },
  {
    id: "g06",
    order: 6,
    level: "A1",
    afterLesson: 8,
    title: "Négation et interrogation",
    subtitle: "no, nada, nadie — et poser une question",
    goal: "Construire une phrase négative complète et une question correcte.",
    rules: [
      {
        title: "La négation simple",
        text: "no se place devant le verbe. En espagnol, la double négation est obligatoire : « No veo nada » (je ne vois rien), « No viene nadie » (personne ne vient).",
        examples: [
          { es: "No entiendo.", fr: "Je ne comprends pas." },
          { es: "No tengo ningún problema.", fr: "Je n'ai aucun problème." },
        ],
      },
      {
        title: "Les mots négatifs",
        text: "nada (rien), nadie (personne), nunca / jamás (jamais), ninguno (aucun), tampoco (non plus). Si le mot négatif est en tête, on ne met pas no : « Nunca voy ».",
        examples: [{ es: "Nunca he estado allí.", fr: "Je n'ai jamais été là-bas." }],
      },
      {
        title: "Poser une question",
        text: "À l'oral, l'intonation suffit souvent. À l'écrit, on encadre la question de ¿ … ? et on place les mots interrogatifs (qué, quién, dónde, cuándo, cómo, cuánto, por qué) en tête.",
        examples: [
          { es: "¿Dónde vives?", fr: "Où habites-tu ?" },
          { es: "¿Cuánto cuesta?", fr: "Combien ça coûte ?" },
        ],
      },
    ],
    tables: [
      {
        title: "Mots interrogatifs",
        head: ["espagnol", "français"],
        rows: [
          ["qué", "quoi / quel"],
          ["quién", "qui"],
          ["dónde", "où"],
          ["cuándo", "quand"],
          ["cómo", "comment"],
          ["cuánto", "combien"],
          ["por qué", "pourquoi"],
        ],
      },
    ],
    watch: ["Les interrogatifs portent un accent écrit : cómo (comment) ≠ como (comme).", "« ¿Qué es esto? » (qu'est-ce que c'est ?) et non « ¿Qué está esto? »."],
    exercises: [
      ex("« Je ne comprends rien » se dit…", ["No comprendo nada", "No comprendo algo", "Comprendo no nada"], "No comprendo nada", "La double négation est correcte en espagnol."),
      inp("Traduis « Où habites-tu ? »", "¿Dónde vives?", "On encadre avec ¿ ? et dónde porte l'accent."),
      ex("« Il ne vient jamais » se dit…", ["No viene nunca", "Nunca no viene", "No viene jamás nunca"], "No viene nunca", "no + verbe + nunca, ou Nunca viene."),
      ex("Quel mot interrogatif signifie « combien » ?", ["cuánto", "cuándo", "quién"], "cuánto", "cuánto = combien."),
      inp("Complète : « ¿___ te llamas? »", "Cómo", "Cómo porte l'accent en début de question."),
    ],
  },
  {
    id: "g07",
    order: 7,
    level: "A1",
    afterLesson: 9,
    title: "gustar et doler",
    subtitle: "Le verbe qui a la chose pour sujet",
    goal: "Dire ce que l'on aime et ce qui fait mal sans inverser le sujet.",
    rules: [
      {
        title: "Le sujet est la chose aimée",
        text: "Avec gustar, le sujet grammatical est ce que l'on aime. Le pronom (me, te, le, nos, os, les) indique la personne qui ressent.",
        examples: [
          { es: "Me gusta el café.", fr: "J'aime le café." },
          { es: "Me gustan los libros.", fr: "J'aime les livres." },
        ],
      },
      {
        title: "doler fonctionne pareil",
        text: "doler s'accorde avec la partie du corps : me duele la cabeza (singulier), me duelen los pies (pluriel).",
        examples: [
          { es: "¿Te duele la espalda?", fr: "Tu as mal au dos ?" },
          { es: "Nos duelen los ojos.", fr: "Nous avons mal aux yeux." },
        ],
      },
      {
        title: "Insister sur la personne",
        text: "On peut ajouter « a mí, a ti, a él… » en début de phrase pour insister ou opposer. Cette reprise est très fréquente à l'oral.",
        examples: [{ es: "A mí me gusta el cine, a él no.", fr: "Moi j'aime le cinéma, lui non." }],
      },
    ],
    tables: [
      {
        title: "Les pronoms de gustar",
        head: ["personne", "pronom", "exemple"],
        rows: [
          ["moi", "me", "me gusta"],
          ["toi", "te", "te gusta"],
          ["lui / elle / vous", "le", "le gusta"],
          ["nous", "nos", "nos gusta"],
          ["vous (vosotros)", "os", "os gusta"],
          ["eux / elles", "les", "les gusta"],
        ],
      },
    ],
    watch: ["On ne dit jamais « gusto el café » pour « j'aime le café ».", "« Me gusta mucho » et non « me muy gusta »."],
    exercises: [
      ex("« J'aime les livres » se dit…", ["Me gustan los libros", "Me gusta los libros", "Gusto los libros"], "Me gustan los libros", "Le sujet est los libros, pluriel : gustan."),
      inp("Traduis « J'ai mal à la tête »", "me duele la cabeza", "duele s'accorde avec la cabeza, singulier."),
      ex("Pour dire « elle aime », on emploie…", ["Le gusta", "La gusta", "Se gusta"], "Le gusta", "le = à elle, pronom indirect."),
      ex("Complète : « A nosotros ___ gusta el cine. »", ["nos", "les", "te"], "nos", "À nous correspond nos."),
      inp("Complète : « Me ___ los pies. » (avoir mal)", "duelen", "los pies est pluriel : duelen."),
    ],
  },
  {
    id: "g08",
    order: 8,
    level: "A1",
    afterLesson: 10,
    title: "Les pronoms personnels",
    subtitle: "yo, tú, usted… et les formes après préposition",
    goal: "Choisir le bon pronom et vouvoyer correctement.",
    rules: [
      {
        title: "Les pronoms sujets",
        text: "yo, tú, él / ella, nosotros / nosotras, vosotros / vosotras, ellos / ellas. Le féminin pluriel ne s'emploie que pour un groupe exclusivement féminin.",
        examples: [{ es: "Nosotras vivimos aquí.", fr: "Nous (femmes) vivons ici." }],
      },
      {
        title: "Après une préposition",
        text: "On emploie les formes toniques : mí, ti, él, ella, nosotros, vosotros, ellos, ellas. « conmigo » et « contigo » sont irréguliers.",
        examples: [
          { es: "Este regalo es para ti.", fr: "Ce cadeau est pour toi." },
          { es: "Ven conmigo.", fr: "Viens avec moi." },
        ],
      },
      {
        title: "usted et ustedes",
        text: "usted = vous de politesse pour une personne ; ustedes = vous pour plusieurs personnes. Le verbe se met à la 3e personne.",
        examples: [{ es: "¿Usted cómo se llama?", fr: "Comment vous appelez-vous ?" }],
      },
    ],
    tables: [
      {
        title: "Sujets et formes toniques",
        head: ["sujet", "après préposition"],
        rows: [
          ["yo", "mí"],
          ["tú", "ti"],
          ["él / ella / usted", "él / ella / usted"],
          ["nosotros", "nosotros"],
          ["vosotros", "vosotros"],
          ["ellos / ellas / ustedes", "ellos / ellas / ustedes"],
        ],
      },
    ],
    watch: ["« conmigo » et « contigo » ne s'écrivent jamais « con mí » ou « con ti ».", "Le pronom sujet est souvent omis ; on l'ajoute pour insister."],
    exercises: [
      inp("Traduis « pour moi »", "para mí", "Après préposition : mí."),
      ex("« avec toi » se dit…", ["contigo", "con tú", "con ti"], "contigo", "Forme irrégulière figée."),
      ex("« Usted » correspond à…", ["vous (vouvoiement, une personne)", "tu", "nous"], "vous (vouvoiement, une personne)", "usted est le vouvoiement, avec le verbe à la 3e personne."),
      inp("Complète : « Este regalo es para ___. » (lui)", "él", "Après préposition, él garde l'accent."),
      ex("Quel pronom sujet pour « elles » ?", ["ellas", "ellos", "nosotras"], "ellas", "ellas = elles."),
    ],
  },
  {
    id: "g09",
    order: 9,
    level: "A1",
    afterLesson: 12,
    title: "Possessifs et démonstratifs",
    subtitle: "mon, ton, son — ceci, cela",
    goal: "Situer un objet dans l'espace et dire à qui il est.",
    rules: [
      {
        title: "Les possessifs faibles",
        text: "Devant le nom : mi, tu, su, nuestro / nuestra, vuestro / vuestra + pluriel en -s. « su » peut signifier son, sa, leur, votre (de politesse).",
        examples: [
          { es: "mis padres, nuestra casa", fr: "mes parents, notre maison" },
          { es: "su hermano", fr: "son frère / leur frère / votre frère" },
        ],
      },
      {
        title: "Les possessifs forts",
        text: "Après le nom, ou à la place du nom avec un article : mío, tuyo, suyo, nuestro, vuestro. On dit « un amigo mío » ou « el mío ».",
        examples: [{ es: "Esta silla es la mía.", fr: "Cette chaise est la mienne." }],
      },
      {
        title: "Les démonstratifs",
        text: "este / esta (près de moi), ese / esa (près de toi), aquel / aquella (loin de nous deux). Ils s'accordent et prennent -s au pluriel.",
        examples: [
          { es: "Este libro y aquella revista.", fr: "Ce livre-ci et cette revue là-bas." },
        ],
      },
    ],
    tables: [
      {
        title: "Démonstratifs",
        head: ["distance", "masculin", "féminin"],
        rows: [
          ["près de moi", "este", "esta"],
          ["près de toi", "ese", "esa"],
          ["loin", "aquel", "aquella"],
        ],
      },
    ],
    watch: ["Il n'y a pas de trait d'union en espagnol : « este libro », jamais « ce-livre-ci ».", "« el mío » ne prend pas d'accent sur el (article), mais mío en porte un."],
    exercises: [
      ex("« mon frère » se dit…", ["mi hermano", "mío hermano", "el hermano mi"], "mi hermano", "Forme faible devant le nom : mi."),
      inp("Traduis « ces livres-ci »", "estos libros", "este → estos, accord masculin pluriel."),
      ex("« le mien » se dit…", ["el mío", "mi hermano", "mí"], "el mío", "Forme forte avec article : el mío."),
      ex("« aquel » désigne…", ["ce … là-bas", "ce … près de moi", "le mien"], "ce … là-bas", "aquel marque l'éloignement."),
      inp("Complète : « ___ padres son profesores. » (mes)", "mis", "mi + s au pluriel : mis."),
    ],
  },
  {
    id: "g10",
    order: 10,
    level: "A1",
    afterLesson: 13,
    title: "ir a + infinitif",
    subtitle: "Le futur du quotidien",
    goal: "Parler de ce que l'on va faire dans un instant.",
    rules: [
      {
        title: "La formule",
        text: "ir au présent + a + infinitif. C'est le futur le plus utilisé à l'oral pour un projet proche ou une intention.",
        examples: [
          { es: "Voy a llamar a mi madre.", fr: "Je vais appeler ma mère." },
          { es: "Vamos a comer.", fr: "Nous allons manger." },
        ],
      },
      {
        title: "Le verbe ir",
        text: "voy, vas, va, vamos, vais, van. Attention : « vamos a » ne devient jamais « vamos a a ».",
        examples: [{ es: "¿Vas a venir?", fr: "Tu vas venir ?" }],
      },
      {
        title: "Ne pas confondre avec ir seul",
        text: "« Voy al cine » = je vais au cinéma (déplacement). « Voy a ver una película » = je vais voir un film (futur proche).",
        examples: [{ es: "Va a llover.", fr: "Il va pleuvoir." }],
      },
    ],
    tables: [
      {
        title: "ir au présent",
        head: ["personne", "forme"],
        rows: [
          ["yo", "voy"],
          ["tú", "vas"],
          ["él / ella", "va"],
          ["nosotros", "vamos"],
          ["vosotros", "vais"],
          ["ellos", "van"],
        ],
      },
    ],
    watch: ["« ir a por » (aller chercher) est courant en Espagne, mais « ir a » + infinitif reste le futur proche.", "On ne met jamais de pronom réfléchi après : « vamos a salir », pas « vamos a salirnos »."],
    exercises: [
      inp("Traduis « Je vais manger »", "voy a comer", "ir au présent + a + infinitif."),
      ex("« Nous allons partir » se dit…", ["Vamos a salir", "Vamos salir", "Vamos a salimos"], "Vamos a salir", "La préposition a est obligatoire."),
      ex("« ¿Vas a venir? » signifie…", ["Tu vas venir ?", "Tu viens ?", "Tu es venu ?"], "Tu vas venir ?", "ir a + infinitif = futur proche."),
      inp("Complète : « Ellos ___ a estudiar. »", "van", "3e personne du pluriel de ir : van."),
      ex("Le futur proche se forme avec…", ["ir au présent + a + infinitif", "avoir + participe", "aller + gérondif"], "ir au présent + a + infinitif", "C'est la structure de base."),
    ],
  },
];
