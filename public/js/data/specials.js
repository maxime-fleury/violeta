/**
 * Leçons thématiques : couleurs, jours, nombres, opérations, expressions.
 * Les items qui correspondent à un mot du lexique cible portent `word` :
 * ils partagent alors la même progression que dans le parcours principal.
 */
import { EXPRESSIONS } from "./expressions.js";

const choice = (prompt, options, answer) => ({ type: "choice", prompt, options, answer });
const input = (prompt, answer, hint) => ({ type: "input", prompt, answer, hint });

const COLORES = {
  id: "colores",
  title: "Les couleurs",
  subtitle: "Nommer et reconnaître les couleurs courantes",
  icon: "🎨",
  color: "#ec4899",
  kind: "colors",
  sections: [
    {
      id: "base",
      title: "Les quatre couleurs de base",
      note: "En espagnol, la couleur s'accorde avec le nom : « un coche rojo », « una casa roja ».",
      items: [
        { es: "rojo", fr: "rouge", word: "rojo", hex: "#e5484d", emoji: "🍅", example: "El tomate es rojo.", exampleFr: "La tomate est rouge." },
        { es: "azul", fr: "bleu", word: "azul", hex: "#3b82f6", emoji: "🌊", example: "El cielo es azul.", exampleFr: "Le ciel est bleu." },
        { es: "verde", fr: "vert", word: "verde", hex: "#22a06b", emoji: "🌿", example: "La hoja es verde.", exampleFr: "La feuille est verte." },
        { es: "amarillo", fr: "jaune", word: "amarillo", hex: "#f5c518", emoji: "☀️", example: "El sol es amarillo.", exampleFr: "Le soleil est jaune." },
      ],
    },
    {
      id: "chaudes",
      title: "Couleurs chaudes et vives",
      items: [
        { es: "naranja", fr: "orange", word: "naranja", hex: "#f97316", emoji: "🍊", example: "La naranja es naranja.", exampleFr: "L'orange est orange." },
        { es: "rosa", fr: "rose", word: "rosa", hex: "#ec4899", emoji: "🌸", example: "La flor es rosa.", exampleFr: "La fleur est rose." },
        { es: "morado", fr: "violet", word: "morado", hex: "#8b5cf6", emoji: "🍇", example: "La uva es morada.", exampleFr: "Le raisin est violet." },
      ],
    },
    {
      id: "nuances",
      title: "Noir, blanc et nuances",
      note: "« Marrón » prend un accent ; le pluriel est « marrones ».",
      items: [
        { es: "marrón", fr: "marron", word: "marron", hex: "#7c4a2f", emoji: "🍫", example: "El chocolate es marrón.", exampleFr: "Le chocolat est marron." },
        { es: "negro", fr: "noir", word: "negro", hex: "#1f1d2b", emoji: "🐈‍⬛", example: "El gato es negro.", exampleFr: "Le chat est noir." },
        { es: "blanco", fr: "blanc", word: "blanco", hex: "#f6f2e8", emoji: "🥛", example: "La leche es blanca.", exampleFr: "Le lait est blanc." },
        { es: "gris", fr: "gris", word: "gris", hex: "#9ca3af", emoji: "☁️", example: "La nube es gris.", exampleFr: "Le nuage est gris." },
      ],
    },
  ],
  exercises: [
    choice("Quelle est la couleur du ciel ?", ["azul", "rojo", "verde"], "azul"),
    choice("Comment dit-on « jaune » ?", ["amarillo", "negro", "morado"], "amarillo"),
    input("Traduis en espagnol : « blanc »", "blanco"),
    choice("Quelle couleur a une tomate mûre ?", ["roja", "azul", "gris"], "roja"),
    input("Traduis en espagnol : « noir »", "negro"),
  ],
};

const DIAS = {
  id: "dias",
  title: "Les jours de la semaine",
  subtitle: "Les sept jours, leur ordre et les phrases du calendrier",
  icon: "📅",
  color: "#f59e0b",
  kind: "days",
  sections: [
    {
      id: "semana",
      title: "Les sept jours",
      note: "En espagnol, les jours ne prennent pas de majuscule et la semaine commence le lundi.",
      items: [
        { es: "lunes", fr: "lundi", word: "lunes", order: 1, example: "El lunes trabajo.", exampleFr: "Lundi, je travaille." },
        { es: "martes", fr: "mardi", word: "martes", order: 2, example: "El martes hay clase.", exampleFr: "Mardi, il y a cours." },
        { es: "miércoles", fr: "mercredi", word: "miercoles", order: 3, example: "El miércoles voy al médico.", exampleFr: "Mercredi, je vais chez le médecin." },
        { es: "jueves", fr: "jeudi", word: "jueves", order: 4, example: "El jueves juego al tenis.", exampleFr: "Jeudi, je joue au tennis." },
        { es: "viernes", fr: "vendredi", word: "viernes", order: 5, example: "El viernes salimos.", exampleFr: "Vendredi, nous sortons." },
        { es: "sábado", fr: "samedi", word: "sabado", order: 6, example: "El sábado no trabajo.", exampleFr: "Samedi, je ne travaille pas." },
        { es: "domingo", fr: "dimanche", word: "domingo", order: 7, example: "El domingo descanso.", exampleFr: "Dimanche, je me repose." },
      ],
    },
    {
      id: "calendario",
      title: "Parler du calendrier",
      items: [
        { es: "hoy", fr: "aujourd'hui", word: "hoy", example: "Hoy es lunes.", exampleFr: "Aujourd'hui, c'est lundi." },
        { es: "ayer", fr: "hier", word: "ayer", example: "Ayer fue domingo.", exampleFr: "Hier, c'était dimanche." },
        { es: "mañana", fr: "demain", word: "manana", example: "Mañana es martes.", exampleFr: "Demain, c'est mardi." },
        { es: "la semana", fr: "la semaine", word: "semana", example: "La semana tiene siete días.", exampleFr: "La semaine compte sept jours." },
        { es: "el fin de semana", fr: "le week-end", example: "El fin de semana descanso.", exampleFr: "Le week-end, je me repose." },
        { es: "¿Qué día es hoy?", fr: "Quel jour sommes-nous ?", example: "— ¿Qué día es hoy? — Es jueves.", exampleFr: "— Quel jour sommes-nous ? — C'est jeudi." },
      ],
    },
  ],
  exercises: [
    choice("Quel jour vient après « martes » ?", ["miércoles", "lunes", "jueves"], "miércoles"),
    input("Traduis en espagnol : « vendredi »", "viernes"),
    choice("Quel est le premier jour de la semaine en Espagne ?", ["lunes", "domingo", "sábado"], "lunes"),
    input("Traduis en espagnol : « dimanche »", "domingo"),
    choice("« Ayer » signifie :", ["hier", "aujourd'hui", "demain"], "hier"),
  ],
};

const NUMEROS_0_10 = {
  id: "numeros-0-10",
  title: "Les nombres de 0 à 10",
  subtitle: "Compter, dire son âge, donner un numéro",
  icon: "🔢",
  color: "#12a594",
  kind: "numbers",
  sections: [
    {
      id: "petits",
      title: "De 0 à 5",
      note: "« Uno » devient « un » devant un nom masculin : un café, una mesa.",
      items: [
        { es: "cero", fr: "zéro", word: "cero", example: "Cero grados.", exampleFr: "Zéro degré." },
        { es: "uno", fr: "un", word: "uno", example: "Un café, por favor.", exampleFr: "Un café, s'il vous plaît." },
        { es: "dos", fr: "deux", word: "dos", example: "Dos cafés.", exampleFr: "Deux cafés." },
        { es: "tres", fr: "trois", word: "tres", example: "Tres hermanos.", exampleFr: "Trois frères." },
        { es: "cuatro", fr: "quatre", word: "cuatro", example: "Cuatro sillas.", exampleFr: "Quatre chaises." },
        { es: "cinco", fr: "cinq", word: "cinco", example: "Cinco euros.", exampleFr: "Cinq euros." },
      ],
    },
    {
      id: "suite",
      title: "De 6 à 10",
      items: [
        { es: "seis", fr: "six", word: "seis", example: "Seis meses.", exampleFr: "Six mois." },
        { es: "siete", fr: "sept", word: "siete", example: "Siete días.", exampleFr: "Sept jours." },
        { es: "ocho", fr: "huit", word: "ocho", example: "Ocho horas.", exampleFr: "Huit heures." },
        { es: "nueve", fr: "neuf", word: "nueve", example: "Nueve euros.", exampleFr: "Neuf euros." },
        { es: "diez", fr: "dix", word: "diez", example: "Diez minutos.", exampleFr: "Dix minutes." },
      ],
    },
  ],
  exercises: [
    input("Écris en espagnol le nombre 7", "siete"),
    choice("« cinco » correspond à :", ["4", "5", "6"], "5"),
    input("Écris en espagnol le nombre 10", "diez"),
    choice("Quel nombre est « nueve » ?", ["8", "9", "10"], "9"),
  ],
};

const NUMEROS_11_100 = {
  id: "numeros-11-100",
  title: "Les nombres de 11 à 100",
  subtitle: "Comprendre la construction plutôt que mémoriser une liste",
  icon: "🧮",
  color: "#12a594",
  kind: "numbers",
  sections: [
    {
      id: "onze-seize",
      title: "De 11 à 16",
      note: "Ces six nombres sont irréguliers : ils ne suivent pas le modèle « dizaine + y + unité ».",
      items: [
        { es: "once", fr: "onze", word: "once", example: "Once personas.", exampleFr: "Onze personnes." },
        { es: "doce", fr: "douze", word: "doce", example: "Doce meses.", exampleFr: "Douze mois." },
        { es: "trece", fr: "treize", word: "trece", example: "Trece euros.", exampleFr: "Treize euros." },
        { es: "catorce", fr: "quatorze", word: "catorce", example: "Catorce días.", exampleFr: "Quatorze jours." },
        { es: "quince", fr: "quinze", word: "quince", example: "Quince minutos.", exampleFr: "Quinze minutes." },
        { es: "dieciséis", fr: "seize", word: "dieciseis", example: "Dieciséis años.", exampleFr: "Seize ans." },
      ],
    },
    {
      id: "dizaines",
      title: "Les dizaines",
      note: "20 = veinte ; 30 = treinta ; 40 = cuarenta ; 50 = cincuenta ; 60 = sesenta ; 70 = setenta ; 80 = ochenta ; 90 = noventa ; 100 = cien.",
      items: [
        { es: "veinte", fr: "vingt", word: "veinte", example: "Veinte euros.", exampleFr: "Vingt euros." },
        { es: "treinta", fr: "trente", word: "treinta", example: "Treinta días.", exampleFr: "Trente jours." },
        { es: "cuarenta", fr: "quarante", word: "cuarenta", example: "Cuarenta personas.", exampleFr: "Quarante personnes." },
        { es: "cincuenta", fr: "cinquante", word: "cincuenta", example: "Cincuenta minutos.", exampleFr: "Cinquante minutes." },
        { es: "sesenta", fr: "soixante", word: "sesenta", example: "Sesenta años.", exampleFr: "Soixante ans." },
        { es: "setenta", fr: "soixante-dix", word: "setenta", example: "Setenta euros.", exampleFr: "Soixante-dix euros." },
        { es: "ochenta", fr: "quatre-vingts", word: "ochenta", example: "Ochenta kilos.", exampleFr: "Quatre-vingts kilos." },
        { es: "noventa", fr: "quatre-vingt-dix", word: "noventa", example: "Noventa años.", exampleFr: "Quatre-vingt-dix ans." },
        { es: "cien", fr: "cent", word: "cien", example: "Cien euros.", exampleFr: "Cent euros." },
      ],
    },
    {
      id: "construire",
      title: "Construire 21, 35, 47…",
      note: "Entre 31 et 99 : dizaine + « y » + unité. Ex. 35 = treinta y cinco. De 21 à 29, les deux mots fusionnent : 21 = veintiuno, 22 = veintidós, 23 = veintitrés…",
      items: [
        { es: "treinta y cinco", fr: "trente-cinq", example: "Treinta y cinco euros.", exampleFr: "Trente-cinq euros." },
        { es: "cuarenta y dos", fr: "quarante-deux", example: "Cuarenta y dos años.", exampleFr: "Quarante-deux ans." },
        { es: "sesenta y siete", fr: "soixante-sept", example: "Sesenta y siete días.", exampleFr: "Soixante-sept jours." },
        { es: "noventa y nueve", fr: "quatre-vingt-dix-neuf", example: "Noventa y nueve personas.", exampleFr: "Quatre-vingt-dix-neuf personnes." },
        { es: "veintiuno", fr: "vingt et un", note: "Aussi veintiún devant un nom masculin." },
        { es: "veintidós", fr: "vingt-deux" },
      ],
    },
  ],
  exercises: [
    input("Écris en toutes lettres : 42", "cuarenta y dos"),
    input("Écris en toutes lettres : 16", "dieciséis"),
    choice("Comment dit-on 78 ?", ["setenta y ocho", "sesenta y ocho", "ochenta y siete"], "setenta y ocho"),
    input("Écris en toutes lettres : 99", "noventa y nueve"),
    choice("Quel nombre est « veintiuno » ?", ["21", "31", "12"], "21"),
  ],
};

const NUMEROS_GRANDS = {
  id: "numeros-grandes",
  title: "Centaines, milliers, millions",
  subtitle: "Lire et construire les grands nombres",
  icon: "💯",
  color: "#12a594",
  kind: "hundreds",
  sections: [
    {
      id: "centaines",
      title: "Cien et ciento",
      note: "« Cien » seul, mais « ciento » devant un autre nombre : 100 = cien, 110 = ciento diez. Les centaines s'accordent : doscientas personas.",
      items: [
        { es: "cien", fr: "cent", word: "cien", example: "Cien euros.", exampleFr: "Cent euros." },
        { es: "doscientos", fr: "deux cents", example: "Doscientos libros.", exampleFr: "Deux cents livres." },
        { es: "trescientos", fr: "trois cents", example: "Trescientos metros.", exampleFr: "Trois cents mètres." },
        { es: "quinientos", fr: "cinq cents", note: "Irrégulier : ni « cincocientos » ni « quinientos » sans accent." },
        { es: "setecientos", fr: "sept cents" },
        { es: "novecientos", fr: "neuf cents" },
      ],
    },
    {
      id: "grands",
      title: "Mille et million",
      note: "« Mil » est invariable : dos mil, diez mil. « Millón » est un nom : un millón de personas.",
      items: [
        { es: "mil", fr: "mille", word: "mil", example: "Mil euros.", exampleFr: "Mille euros." },
        { es: "dos mil", fr: "deux mille", example: "Dos mil personas.", exampleFr: "Deux mille personnes." },
        { es: "un millón", fr: "un million", word: "millon", example: "Un millón de euros.", exampleFr: "Un million d'euros." },
        { es: "dos millones", fr: "deux millions", example: "Dos millones de habitantes.", exampleFr: "Deux millions d'habitants." },
        { es: "ciento cincuenta", fr: "cent cinquante", example: "Ciento cincuenta euros.", exampleFr: "Cent cinquante euros." },
      ],
    },
  ],
  exercises: [
    input("Écris en espagnol : 200", "doscientos"),
    choice("Comment dit-on 500 ?", ["quinientos", "cincocientos", "cinco cientos"], "quinientos"),
    input("Écris en espagnol : 1000", "mil"),
    choice("« Un millón » signifie :", ["un milliard", "un million", "cent mille"], "un million"),
  ],
};

const MATEMATICAS = {
  id: "matematicas",
  title: "Les opérations mathématiques",
  subtitle: "Additionner, soustraire, multiplier, comparer",
  icon: "➗",
  color: "#6366f1",
  kind: "math",
  sections: [
    {
      id: "operations",
      title: "Les quatre opérations",
      note: "On dit souvent « son » au pluriel : Dos más tres son cinco.",
      items: [
        { es: "más", fr: "plus", example: "Dos más tres son cinco.", exampleFr: "Deux plus trois font cinq." },
        { es: "menos", fr: "moins", example: "Seis menos dos son cuatro.", exampleFr: "Six moins deux font quatre." },
        { es: "por", fr: "fois", example: "Tres por cuatro son doce.", exampleFr: "Trois fois quatre font douze." },
        { es: "dividido por", fr: "divisé par", example: "Ocho dividido por dos son cuatro.", exampleFr: "Huit divisé par deux font quatre." },
        { es: "es igual a", fr: "est égal à", example: "Cinco más cinco es igual a diez.", exampleFr: "Cinq plus cinq est égal à dix." },
      ],
    },
    {
      id: "comparer",
      title: "Comparer deux nombres",
      items: [
        { es: "mayor que", fr: "plus grand que", example: "Seis es mayor que cuatro.", exampleFr: "Six est plus grand que quatre." },
        { es: "menor que", fr: "plus petit que", example: "Dos es menor que cinco.", exampleFr: "Deux est plus petit que cinq." },
        { es: "el doble", fr: "le double", word: "doble", example: "Diez es el doble de cinco.", exampleFr: "Dix est le double de cinq." },
        { es: "la mitad", fr: "la moitié", word: "mitad", example: "Cinco es la mitad de diez.", exampleFr: "Cinq est la moitié de dix." },
      ],
    },
  ],
  exercises: [
    choice("Comment dit-on « 3 + 4 = 7 » ?", ["Tres más cuatro son siete", "Tres menos cuatro son siete", "Tres por cuatro son siete"], "Tres más cuatro son siete"),
    input("Traduis le résultat : « ocho menos tres » → ?", "cinco"),
    choice("« Doce dividido por tres » donne :", ["cuatro", "seis", "nueve"], "cuatro"),
    choice("« 10 > 7 » se lit :", ["diez es mayor que siete", "diez es menor que siete", "diez es igual a siete"], "diez es mayor que siete"),
    input("Complète : « cinco es la ___ de diez » (moitié)", "mitad"),
  ],
};

export const SPECIALS = [COLORES, DIAS, NUMEROS_0_10, NUMEROS_11_100, NUMEROS_GRANDS, MATEMATICAS, ...EXPRESSIONS];

export const SPECIALS_BY_ID = Object.fromEntries(SPECIALS.map((s) => [s.id, s]));

/** Tous les items qui portent une couleur (utile au rendu). */
export const SPECIAL_GROUPS = [
  { id: "essentiels", title: "Les essentiels", subtitle: "Couleurs, jours, nombres et calcul", ids: ["colores", "dias", "numeros-0-10", "numeros-11-100", "numeros-grands", "matematicas"] },
  { id: "expressions", title: "Les 100 expressions", subtitle: "Dix leçons de dix expressions pour parler tout de suite", ids: EXPRESSIONS.map((e) => e.id) },
];
