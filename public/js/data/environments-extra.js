/**
 * Deux environnements supplémentaires, construits avec le même schéma que
 * l'appartement : dessins SVG + zones interactives + dialogue + quiz.
 * Ils prouvent que l'architecture accepte de nouvelles scènes sans nouveau code.
 */
const R = (x, y, w, h, fill, rx = 6, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const C = (cx, cy, r, fill, extra = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const E = (cx, cy, rx, ry, fill, extra = "") => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const P = (d, fill, extra = "") => `<path d="${d}" fill="${fill}" ${extra}/>`;
const S = (x1, y1, x2, y2, stroke, w = 3, extra = "") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const G = (...parts) => parts.join("");
const obj = (id, es, fr, art, hit, labelAt) => ({ id, es, fr, art, hit, labelAt });

// --- supermarché : fruits et légumes ---------------------------------------
const FRUTAS_BG = G(
  R(0, 0, 800, 366, "#f0efe4", 0),
  R(0, 366, 800, 154, "#d8d3c4", 0),
  S(0, 366, 800, 366, "#bfb8a8", 4),
  R(40, 96, 720, 42, "#7c5cff", 8),
  R(40, 150, 720, 8, "#d6cbb8", 0),
  R(40, 292, 720, 8, "#d6cbb8", 0),
  R(40, 404, 720, 8, "#d6cbb8", 0),
  R(40, 452, 720, 10, "#b9af9e", 4),
);

const FRUTAS_OBJECTS = [
  obj("manzana", "la manzana", "la pomme",
    G(R(62, 250, 108, 44, "#c99f74", 8), C(94, 246, 20, "#e5484d"), C(128, 246, 20, "#e5484d"),
      S(111, 228, 114, 216, "#22a06b", 3), P("M114 216 q14 -8 18 4 q-14 6 -18 -4", "#22a06b")),
    R(58, 216, 118, 84, "transparent"), { x: 112, y: 212 }),
  obj("platano", "el plátano", "la banane",
    G(R(174, 250, 108, 44, "#c99f74", 8),
      P("M188 258 q36 -30 72 -6 q-22 22 -72 6", "#f5c518"),
      P("M196 252 q34 -22 60 -6", "none", 'stroke="#d9a800" stroke-width="3"')),
    R(170, 216, 118, 84, "transparent"), { x: 224, y: 212 }),
  obj("naranja", "la naranja", "l'orange",
    G(R(286, 250, 108, 44, "#c99f74", 8), C(318, 246, 21, "#f97316"), C(350, 246, 21, "#f97316"),
      S(334, 224, 338, 214, "#22a06b", 3)),
    R(282, 216, 118, 84, "transparent"), { x: 336, y: 212 }),
  obj("tomate", "el tomate", "la tomate",
    G(R(398, 250, 108, 44, "#c99f74", 8), C(430, 246, 20, "#e5484d"), C(458, 246, 20, "#e5484d"),
      S(444, 230, 444, 220, "#22a06b", 3), P("M444 226 q-12 -6 -14 2 q10 6 14 -2", "#22a06b")),
    R(394, 214, 118, 86, "transparent"), { x: 444, y: 210 }),
  obj("patata", "la patata", "la pomme de terre",
    G(R(510, 250, 108, 44, "#c99f74", 8), E(540, 248, 24, 17, "#c99f74"), E(576, 248, 22, 16, "#b98d5f"),
      C(536, 242, 3, "#8f6740"), C(582, 246, 3, "#8f6740")),
    R(506, 216, 118, 84, "transparent"), { x: 556, y: 212 }),
  obj("zanahoria", "la zanahoria", "la carotte",
    G(R(622, 250, 108, 44, "#c99f74", 8),
      P("M662 224 L686 260 L674 284 L650 250 Z", "#f97316"),
      P("M660 222 q-4 -18 8 -22 q8 12 2 24", "#22a06b")),
    R(618, 216, 122, 84, "transparent"), { x: 668, y: 212 }),
  obj("lechuga", "la lechuga", "la laitue",
    G(R(100, 362, 108, 44, "#c99f74", 8), C(134, 358, 24, "#22a06b"), C(160, 356, 22, "#2fb47c"),
      P("M112 348 q14 -16 30 -4 q-12 12 -30 4", "#57c99b")),
    R(96, 326, 118, 86, "transparent"), { x: 148, y: 322 }),
  obj("uva", "la uva", "le raisin",
    G(R(246, 362, 108, 44, "#c99f74", 8),
      C(284, 340, 9, "#8b5cf6"), C(302, 340, 9, "#8b5cf6"), C(320, 340, 9, "#8b5cf6"),
      C(292, 356, 9, "#7c5cff"), C(310, 356, 9, "#7c5cff"), C(302, 372, 9, "#6d4dff"),
      S(302, 326, 306, 316, "#22a06b", 3)),
    R(242, 326, 118, 86, "transparent"), { x: 302, y: 322 }),
];

const FRUTAS_LEVEL = {
  id: "super-1",
  title: "Fruits et légumes",
  subtitle: "Reconnaître les produits frais",
  scene: { viewBox: "0 0 800 520", backdrop: FRUTAS_BG, objects: FRUTAS_OBJECTS },
  focus: ["manzana", "platano", "naranja", "tomate", "patata", "zanahoria", "lechuga", "uva"],
  lines: [
    { who: "Ana", es: "Mira las manzanas. Hoy están muy baratas.", fr: "Regarde les pommes. Aujourd'hui, elles sont très bon marché." },
    { who: "Carlos", es: "Necesito plátanos y naranjas para el desayuno.", fr: "J'ai besoin de bananes et d'oranges pour le petit-déjeuner." },
    { who: "Ana", es: "También hay tomates y patatas.", fr: "Il y a aussi des tomates et des pommes de terre." },
    { who: "Carlos", es: "Voy a llevar zanahorias, lechuga y uvas.", fr: "Je vais prendre des carottes, de la laitue et du raisin." },
    { who: "Ana", es: "Perfecto. Todo está fresco.", fr: "Parfait. Tout est frais." },
  ],
  quiz: [
    { prompt: "Quel fruit est rouge et rond ?", options: ["La manzana", "Le plátano", "La lechuga"], answer: "La manzana", word: "manzana" },
    { prompt: "Quel légume est orange et long ?", options: ["La zanahoria", "La patata", "L'uva"], answer: "La zanahoria", word: "zanahoria" },
    { prompt: "Qu'est-ce qui est vert et en feuilles ?", options: ["La lechuga", "La naranja", "El tomate"], answer: "La lechuga", word: "lechuga" },
  ],
};

// --- supermarché : produits -------------------------------------------------
const PRODUITS_BG = G(
  R(0, 0, 800, 366, "#eef0ea", 0),
  R(0, 366, 800, 154, "#d8d3c4", 0),
  S(0, 366, 800, 366, "#bfb8a8", 4),
  R(50, 70, 700, 40, "#12a594", 8),
  R(50, 140, 700, 8, "#d6cbb8", 0),
  R(50, 280, 700, 8, "#d6cbb8", 0),
  R(50, 420, 700, 8, "#d6cbb8", 0),
);

const PRODUITS_OBJECTS = [
  obj("leche", "la leche", "le lait",
    G(R(84, 194, 62, 86, "#f7f5ef", 6),
      P("M84 194 L146 194 L130 160 L100 160 Z", "#e2ddd0"),
      R(96, 222, 38, 26, "#3b82f6", 4), S(108, 168, 122, 168, "#c9c3b4", 4)),
    R(78, 152, 76, 136, "transparent"), { x: 116, y: 148 }),
  obj("pan", "el pan", "le pain",
    G(E(232, 238, 46, 28, "#c99f74"), E(232, 232, 40, 22, "#dcb787"),
      S(208, 226, 218, 214, "#b98d5f", 3), S(236, 220, 246, 210, "#b98d5f", 3), S(258, 226, 268, 216, "#b98d5f", 3)),
    R(180, 196, 106, 76, "transparent"), { x: 232, y: 192 }),
  obj("queso", "el queso", "le fromage",
    G(P("M320 250 L390 250 L390 214 L348 196 Z", "#f5c518"),
      P("M348 196 L390 214 L390 250 L352 234 Z", "#e0ad00"),
      C(362, 226, 6, "#f7e2a0"), C(378, 236, 4, "#f7e2a0")),
    R(310, 188, 88, 70, "transparent"), { x: 350, y: 184 }),
  obj("huevo", "el huevo", "l'œuf",
    G(R(420, 220, 86, 54, "#e2ddd0", 8),
      E(446, 238, 16, 20, "#fdf8ee"), E(472, 238, 16, 20, "#fdf8ee"),
      R(424, 204, 78, 16, "#c9c3b4", 4)),
    R(414, 196, 100, 84, "transparent"), { x: 460, y: 192 }),
  obj("arroz", "el arroz", "le riz",
    G(P("M534 196 L606 196 L614 242 L526 242 Z", "#f7f5ef"),
      R(538, 214, 58, 34, "#fdf8ee", 4),
      C(552, 230, 3, "#e2ddd0"), C(564, 226, 3, "#e2ddd0"), C(576, 234, 3, "#e2ddd0")),
    R(520, 190, 102, 60, "transparent"), { x: 570, y: 186 }),
  obj("aceite", "el aceite", "l'huile",
    G(R(646, 200, 44, 88, "#c7d36b", 8),
      R(658, 184, 20, 20, "#a8b54c", 4),
      R(652, 224, 32, 30, "#f5c518", 4)),
    R(638, 176, 60, 118, "transparent"), { x: 668, y: 172 }),
  obj("azucar", "el azúcar", "le sucre",
    G(R(114, 310, 72, 70, "#fdf8ee", 8),
      R(122, 328, 56, 26, "#ec4899", 4), C(138, 356, 4, "#ffffff"), C(156, 352, 4, "#ffffff")),
    R(106, 302, 88, 84, "transparent"), { x: 150, y: 298 }),
  obj("cafe", "el café", "le café",
    G(R(248, 316, 64, 76, "#7c4a2f", 8), R(256, 300, 48, 18, "#5d3823", 4),
      R(258, 338, 44, 28, "#f5e6c8", 4), C(280, 350, 8, "#6b3f2a")),
    R(240, 294, 80, 104, "transparent"), { x: 280, y: 290 }),
];

const PRODUITS_LEVEL = {
  id: "super-2",
  title: "Les produits du quotidien",
  subtitle: "Trouver les aliments de base",
  scene: { viewBox: "0 0 800 520", backdrop: PRODUITS_BG, objects: PRODUITS_OBJECTS },
  focus: ["leche", "pan", "queso", "huevo", "arroz", "aceite", "azucar", "cafe"],
  lines: [
    { who: "Carlos", es: "¿Dónde está la leche?", fr: "Où est le lait ?" },
    { who: "Ana", es: "En el primer estante, al lado del pan.", fr: "Sur la première étagère, à côté du pain." },
    { who: "Carlos", es: "También necesito queso y huevos.", fr: "J'ai aussi besoin de fromage et d'œufs." },
    { who: "Ana", es: "Hay arroz y aceite en el estante de abajo.", fr: "Il y a du riz et de l'huile sur l'étagère du bas." },
    { who: "Carlos", es: "¿Y el azúcar?", fr: "Et le sucre ?" },
    { who: "Ana", es: "Aquí, cerca del café.", fr: "Ici, près du café." },
  ],
  quiz: [
    { prompt: "Où est le lait ?", options: ["Près du pain", "Près du café", "Sous le riz"], answer: "Près du pain", word: "leche" },
    { prompt: "Qu'y a-t-il sur l'étagère du bas ?", options: ["Riz et huile", "Lait et pain", "Café et sucre"], answer: "Riz et huile", word: "arroz" },
    { prompt: "Où est le sucre ?", options: ["Près du café", "Près du fromage", "Sur le pain"], answer: "Près du café", word: "azucar" },
  ],
};

// --- gare -------------------------------------------------------------------
const ESTACION_BG = G(
  R(0, 0, 800, 300, "#e9eef2", 0),
  R(0, 300, 800, 60, "#c9d2d8", 0),
  R(0, 360, 800, 160, "#cfc9bd", 0),
  S(0, 360, 800, 360, "#aaa294", 4),
  R(0, 456, 800, 14, "#f5c518", 0),
  R(0, 470, 800, 50, "#b9b3a7", 0),
  R(40, 40, 300, 54, "#2f3a45", 6),
  S(52, 58, 240, 58, "#7fd8c5", 4), S(52, 74, 200, 74, "#f5c518", 4),
);

const ESTACION_OBJECTS = [
  obj("tren", "el tren", "le train",
    G(R(470, 120, 330, 210, "#dfe5ea", 16),
      R(486, 140, 298, 76, "#5b6f80", 10),
      R(486, 140, 298, 30, "#7c5cff", 10),
      C(520, 260, 18, "#3a3546"), C(740, 260, 18, "#3a3546"),
      R(486, 232, 298, 60, "#f7f9fa", 8),
      C(510, 262, 12, "#7fd8c5"), C(556, 262, 12, "#7fd8c5")),
    R(460, 110, 350, 236, "transparent"), { x: 635, y: 106 }),
  obj("reloj", "el reloj", "l'horloge",
    G(S(390, 60, 390, 100, "#6b7783", 4), C(390, 132, 40, "#fdfbf7"), C(390, 132, 32, "#ffffff"),
      S(390, 132, 390, 110, "#3a3546", 4), S(390, 132, 408, 140, "#3a3546", 3),
      C(390, 132, 4, "#3a3546")),
    R(340, 86, 100, 92, "transparent"), { x: 390, y: 82 }),
  obj("asiento", "el asiento", "le banc",
    G(R(70, 320, 220, 16, "#c99f74", 6), R(70, 300, 220, 10, "#b98d5f", 4),
      S(86, 336, 86, 400, "#8f6740", 6), S(274, 336, 274, 400, "#8f6740", 6),
      R(70, 274, 220, 10, "#b98d5f", 4)),
    R(58, 266, 244, 146, "transparent"), { x: 180, y: 262 }),
  obj("maleta", "la maleta", "la valise",
    G(R(310, 366, 86, 66, "#7c5cff", 8),
      S(330, 366, 330, 350, "#5b3fd6", 5), S(376, 366, 376, 350, "#5b3fd6", 5),
      S(348, 366, 348, 350, "#5b3fd6", 5),
      R(322, 392, 20, 14, "#5b3fd6", 3)),
    R(300, 342, 106, 100, "transparent"), { x: 353, y: 338 }),
  obj("billete", "el billete", "le billet",
    G(R(300, 320, 78, 34, "#fdf8ee", 3), R(308, 328, 20, 18, "#c7d36b", 2),
      S(336, 332, 366, 332, "#9aa7ad", 2), S(336, 342, 358, 342, "#9aa7ad", 2)),
    R(292, 310, 94, 54, "transparent"), { x: 338, y: 306 }),
  obj("pasaporte", "el pasaporte", "le passeport",
    G(R(410, 360, 62, 76, "#8b3a3a", 5), C(441, 386, 14, "#c9a26b"),
      S(424, 416, 458, 416, "#f5e6c8", 2)),
    R(402, 350, 78, 96, "transparent"), { x: 441, y: 346 }),
  obj("mapa", "el mapa", "la carte",
    G(P("M698 384 L746 368 L786 384 L786 424 L746 410 L698 426 Z", "#fdf8ee"),
      S(746, 368, 746, 410, "#c9c3b4", 2), S(718, 376, 718, 418, "#c9c3b4", 2), S(766, 376, 766, 416, "#c9c3b4", 2)),
    R(688, 358, 108, 78, "transparent"), { x: 742, y: 354 }),
  obj("anden", "el andén", "le quai",
    G(R(80, 452, 220, 12, "#f5c518", 0), R(110, 410, 160, 38, "#2f3a45", 4),
      R(126, 420, 128, 18, "#fdf8ee", 2)),
    R(100, 402, 190, 66, "transparent"), { x: 190, y: 398 }),
];

const ESTACION_LEVEL = {
  id: "estacion-1",
  title: "Sur le quai",
  subtitle: "Préparer son voyage et lire les informations",
  scene: { viewBox: "0 0 800 520", backdrop: ESTACION_BG, objects: ESTACION_OBJECTS },
  focus: ["tren", "reloj", "asiento", "maleta", "billete", "pasaporte", "mapa", "anden"],
  lines: [
    { who: "Carlos", es: "El tren sale a las nueve y media del andén cuatro.", fr: "Le train part à neuf heures et demie du quai quatre." },
    { who: "Ana", es: "Mira el reloj: todavía tenemos veinte minutos.", fr: "Regarde l'horloge : nous avons encore vingt minutes." },
    { who: "Carlos", es: "Tengo el billete y el pasaporte en la maleta.", fr: "J'ai le billet et le passeport dans la valise." },
    { who: "Ana", es: "Podemos esperar en el asiento, al lado del andén.", fr: "Nous pouvons attendre sur le banc, à côté du quai." },
    { who: "Carlos", es: "También necesito mirar el mapa de la ciudad.", fr: "J'ai aussi besoin de regarder le plan de la ville." },
  ],
  quiz: [
    { prompt: "De quel quai part le train ?", options: ["Du quai quatre", "Du quai neuf", "Du quai vingt"], answer: "Du quai quatre", word: "anden" },
    { prompt: "Où sont le billet et le passeport ?", options: ["Dans la valise", "Sur le banc", "Dans le train"], answer: "Dans la valise", word: "maleta" },
    { prompt: "Combien de minutes reste-t-il ?", options: ["Vingt", "Neuf", "Quatre"], answer: "Vingt", word: "reloj" },
  ],
};

export const EXTRA_ENVIRONMENTS = [
  {
    id: "supermercado",
    title: "Le supermarché",
    subtitle: "Deux rayons pour faire ses courses",
    icon: "🛒",
    color: "#12a594",
    rooms: [
      { id: "frescos", title: "Fruits et légumes", es: "Frutas y verduras", icon: "🍎", levels: [FRUTAS_LEVEL] },
      { id: "productos", title: "Produits du quotidien", es: "Productos", icon: "🥛", levels: [PRODUITS_LEVEL] },
    ],
  },
  {
    id: "estacion",
    title: "La gare",
    subtitle: "Un quai, un train, un voyage",
    icon: "🚉",
    color: "#f59e0b",
    rooms: [
      { id: "anden", title: "Sur le quai", es: "En el andén", icon: "🚆", levels: [ESTACION_LEVEL] },
    ],
  },
];
