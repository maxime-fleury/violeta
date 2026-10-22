/**
 * Récits de révision : une histoire tous les dix leçons, qui ne réutilise que
 * le vocabulaire déjà rencontré. Lecture à voix haute conseillée, puis quiz.
 */
const choice = (prompt, options, answer) => ({ type: "choice", prompt, options, answer });
const input = (prompt, answer, hint) => ({ type: "input", prompt, answer, hint });

export const RECITS = [
  {
    id: "r10",
    afterLesson: 10,
    level: "A1",
    title: "La primera semana",
    subtitle: "Lucía arrive dans son nouveau quartier",
    place: "El barrio de Lucía",
    minutes: 5,
    chapters: [
      {
        es: "Lucía vive en un piso nuevo. Hay una mesa, dos sillas y una ventana. La ventana da a la calle. Hace sol y hace calor.",
        fr: "Lucía habite dans un nouvel appartement. Il y a une table, deux chaises et une fenêtre. La fenêtre donne sur la rue. Il fait beau et chaud.",
      },
      {
        es: "En la calle, una mujer habla con Lucía. «Hola, buenos días.» «Hola, yo soy Marta.» «Yo soy Lucía, soy nueva.» «Bienvenida. ¿Quieres un café?»",
        fr: "Dans la rue, une femme parle avec Lucía. « Bonjour. » « Bonjour, moi c'est Marta. » « Moi, c'est Lucía, je suis nouvelle. » « Bienvenue. Tu veux un café ? »",
      },
      {
        es: "Van al café. Lucía pide un café con leche y pan. Hablan de la familia de Marta, de su casa y de su trabajo.",
        fr: "Elles vont au café. Lucía commande un café au lait et du pain. Elles parlent de la famille de Marta, de sa maison et de son travail.",
      },
      {
        es: "Por la tarde, Lucía va al mercado. Compra manzanas, tomates y naranjas. «¿Cuánto es?» Paga seis euros y vuelve a casa.",
        fr: "L'après-midi, Lucía va au marché. Elle achète des pommes, des tomates et des oranges. « Ça fait combien ? » Elle paie six euros et rentre à la maison.",
      },
      {
        es: "Por la noche hace frío y hay agua. Lucía toma una sopa y mira la calle. «Me gusta este piso», dice Lucía, contenta.",
        fr: "Le soir, il fait froid et il pleut. Lucía prend une soupe et regarde la rue. « Cet appartement me plaît », dit Lucía, contente.",
      },
    ],
    quiz: [
      choice("¿Dónde vive Lucía?", ["en un piso nuevo", "en una casa vieja", "en un hotel"], "en un piso nuevo"),
      choice("¿Quién es Marta?", ["una mujer del barrio", "una profesora", "su hermana"], "una mujer del barrio"),
      input("¿Qué pide Lucía en el café?", "un café con leche", "Deux mots pour le café, un pour le lait."),
      choice("¿Qué compra en el mercado?", ["manzanas, tomates y naranjas", "pan y leche", "arroz y pescado"], "manzanas, tomates y naranjas"),
      choice("¿Qué tiempo hace por la noche?", ["hace frío y hay agua", "hace sol y calor", "hace viento y nieva"], "hace frío y hay agua"),
    ],
  },
  {
    id: "r20",
    afterLesson: 20,
    level: "A2",
    title: "El verano de los recuerdos",
    subtitle: "Un viejo viaje à Séville, raconté au passé",
    place: "El salón de Carlos, con las fotos sobre la mesa",
    minutes: 6,
    chapters: [
      {
        es: "Cuando Lucía tenía veinte años, viajó a Sevilla en tren con su hermana. Salieron a las nueve de la mañana y llegaron por la tarde.",
        fr: "Quand Lucía avait vingt ans, elle a voyagé à Séville en train avec sa sœur. Elles sont parties à neuf heures du matin et sont arrivées l'après-midi.",
      },
      {
        es: "El hotel estaba en el centro, cerca de la catedral. La habitación era pequeña, pero tenía un balcón. Desde allí se veía la plaza.",
        fr: "L'hôtel se trouvait au centre, près de la cathédrale. La chambre était petite, mais elle avait un balcon. De là, on voyait la place.",
      },
      {
        es: "Por la noche, comieron en un restaurante del barrio. El camarero les recomendó pescado y una tarta de queso. Todo estaba muy bueno.",
        fr: "Le soir, elles ont dîné dans un restaurant du quartier. Le serveur leur a recommandé du poisson et une tarte au fromage. Tout était très bon.",
      },
      {
        es: "Al día siguiente fueron a la playa. Hacía mucho calor. Lucía nadó, leyó un libro y durmió bajo el sol. Su hermana hizo fotos.",
        fr: "Le lendemain, elles sont allées à la plage. Il faisait très chaud. Lucía a nagé, lu un livre et dormi au soleil. Sa sœur a pris des photos.",
      },
      {
        es: "Ahora, muchos años después, Lucía mira las fotos y sonríe. «Era un verano feliz», dice. Carlos la mira y pregunta: «¿Volvemos juntos?»",
        fr: "Aujourd'hui, bien des années plus tard, Lucía regarde les photos et sourit. « C'était un été heureux », dit-elle. Carlos la regarde et demande : « On y retourne ensemble ? »",
      },
    ],
    quiz: [
      choice("¿Cómo viajaron a Sevilla?", ["en tren", "en coche", "en avión"], "en tren"),
      input("¿Dónde estaba el hotel?", "en el centro", "Le contraire de « fuera » ou de « lejos »."),
      choice("¿Qué recomendó el camarero?", ["pescado", "pollo", "sopa"], "pescado"),
      choice("¿Qué hizo Lucía en la playa?", ["nadó y durmió", "corrió y trabajó", "bailó y cantó"], "nadó y durmió"),
      input("Comment dit-on « heureux » ?", "feliz"),
    ],
  },
  {
    id: "r30",
    afterLesson: 30,
    level: "A2",
    title: "Lo que viene",
    subtitle: "Travail, voiture, mariage : parler de l'avenir",
    place: "La cocina de Lucía, un martes por la noche",
    minutes: 6,
    chapters: [
      {
        es: "Carlos empieza un trabajo nuevo en septiembre. Va a trabajar en una oficina del centro, cerca de la estación.",
        fr: "Carlos commence un nouveau travail en septembre. Il va travailler dans un bureau du centre, près de la gare.",
      },
      {
        es: "Lucía quiere aprender a conducir. «El año que viene voy a comprar un coche pequeño», dice. «Y vamos a viajar a Barcelona en agosto.»",
        fr: "Lucía veut apprendre à conduire. « L'année prochaine, je vais acheter une petite voiture », dit-elle. « Et nous allons voyager à Barcelone en août. »",
      },
      {
        es: "En octubre, su prima se casa. Toda la familia va a ir a la boda. Lucía va a llevar un vestido azul y Carlos una camisa blanca.",
        fr: "En octobre, sa cousine se marie. Toute la famille va aller au mariage. Lucía portera une robe bleue et Carlos une chemise blanche.",
      },
      {
        es: "También quieren cambiar de piso. Buscan algo más grande, con dos habitaciones y una terraza. «Será difícil, pero es posible», dice Carlos.",
        fr: "Ils veulent aussi changer d'appartement. Ils cherchent plus grand, avec deux chambres et une terrasse. « Ce sera difficile, mais c'est possible », dit Carlos.",
      },
      {
        es: "Por la noche escriben una lista: trabajo, coche, viaje, boda, casa. «Muchos planes», ríe Lucía. «Sí, pero poco a poco.»",
        fr: "Le soir, ils écrivent une liste : travail, voiture, voyage, mariage, maison. « Beaucoup de projets », rit Lucía. « Oui, mais petit à petit. »",
      },
    ],
    quiz: [
      choice("¿Cuándo empieza Carlos su trabajo nuevo?", ["en septiembre", "en agosto", "en octubre"], "en septiembre"),
      input("¿De qué color es el vestido de Lucía?", "azul"),
      choice("¿Adónde quieren viajar en agosto?", ["a Barcelona", "a Sevilla", "a Madrid"], "a Barcelona"),
      choice("¿Qué buscan para el piso nuevo?", ["dos habitaciones y una terraza", "un jardín y un garaje", "tres baños"], "dos habitaciones y una terraza"),
      input("Complète : « muchos planes, pero poco ___ »", "a poco", "Expression qui veut dire « petit à petit »."),
    ],
  },
  {
    id: "r40",
    afterLesson: 40,
    level: "A2",
    title: "La semana difícil",
    subtitle: "Tomber malade et se faire aider",
    place: "El piso de Lucía y el centro de salud",
    minutes: 6,
    chapters: [
      {
        es: "Por la mañana, Lucía no está bien. Le duele la cabeza y tiene fiebre. No va al trabajo y llama a la oficina.",
        fr: "Le matin, Lucía ne va pas bien. Elle a mal à la tête et de la fièvre. Elle ne va pas au travail et appelle le bureau.",
      },
      {
        es: "Por la tarde va a la farmacia. El hombre de la farmacia le da pastillas. «Tome una cada ocho horas», dice.",
        fr: "L'après-midi, elle va à la pharmacie. L'homme de la pharmacie lui donne des comprimés. « Prenez-en un toutes les huit heures », dit-il.",
      },
      {
        es: "El segundo día está mal. Marta la lleva al centro de salud. El médico la mira y pide un análisis.",
        fr: "Le deuxième jour, elle va mal. Marta l'emmène au centre de santé. Le médecin l'examine et demande une analyse.",
      },
      {
        es: "«No es un problema grande», dice el médico. «Necesita dormir, beber agua y no trabajar esta semana.»",
        fr: "« Ce n'est pas un gros problème », dit le médecin. « Il faut dormir, boire de l'eau et ne pas travailler cette semaine. »",
      },
      {
        es: "El domingo, Lucía ya está bien. Marta le trae sopa y fruta. «Gracias. Sin tu ayuda, la semana es difícil.»",
        fr: "Le dimanche, Lucía va déjà bien. Marta lui apporte de la soupe et des fruits. « Merci. Sans ton aide, la semaine est difficile. »",
      },
    ],
    quiz: [
      choice("¿Qué le duele a Lucía?", ["la cabeza", "el pie", "la mano"], "la cabeza"),
      input("Où va-t-elle l'après-midi ? (un lieu)", "la farmacia"),
      choice("¿Qué pide el médico?", ["un análisis", "una radiografía", "una receta de cocina"], "un análisis"),
      choice("¿Qué necesita Lucía?", ["dormir", "trabajar", "viajar"], "dormir"),
      input("Complète : « sin tu ___, la semana es difícil »", "ayuda"),
    ],
  },
  {
    id: "r50",
    afterLesson: 50,
    level: "A2",
    title: "La maleta y el puerto",
    subtitle: "Un départ en bateau qui commence mal",
    place: "El piso, el mercado y el puerto",
    minutes: 6,
    chapters: [
      {
        es: "El viernes por la mañana, Lucía prepara la maleta para el viaje. Pone ropa ligera, un jersey, el cargador y un libro.",
        fr: "Le vendredi matin, Lucía prépare sa valise pour le voyage. Elle met des vêtements légers, un pull, le chargeur et un livre.",
      },
      {
        es: "Antes de salir, va al mercado a comprar fruta y queso para el barco. El vendedor le regala dos manzanas.",
        fr: "Avant de partir, elle va au marché acheter des fruits et du fromage pour le bateau. Le vendeur lui offre deux pommes.",
      },
      {
        es: "En el puerto hay mucha gente. Carlos compra los billetes y mira el reloj: el barco sale a las once.",
        fr: "Au port, il y a beaucoup de monde. Carlos achète les billets et regarde l'heure : le bateau part à onze heures.",
      },
      {
        es: "Cuando suben, Lucía no encuentra su bolsa. «La he dejado en la cafetería», dice. Carlos baja corriendo y vuelve con la bolsa.",
        fr: "Au moment de monter, Lucía ne trouve pas son sac. « Je l'ai laissé à la cafétéria », dit-elle. Carlos descend en courant et revient avec le sac.",
      },
      {
        es: "El barco sale y el mar está tranquilo. «Casi perdemos el viaje», ríe Lucía. «Pero tenemos las manzanas.»",
        fr: "Le bateau part et la mer est calme. « On a failli rater le voyage », rit Lucía. « Mais nous avons les pommes. »",
      },
    ],
    quiz: [
      choice("¿Qué día prepara la maleta?", ["el viernes", "el sábado", "el domingo"], "el viernes"),
      input("¿Qué compra en el mercado?", "fruta y queso", "Deux choses, l'une sucrée, l'autre salée."),
      choice("¿A qué hora sale el barco?", ["a las once", "a las nueve", "a las ocho"], "a las once"),
      choice("¿Dónde deja Lucía su bolsa?", ["en la cafetería", "en el mercado", "en el piso"], "en la cafetería"),
      input("Comment dit-on « calme » (la mer) ?", "tranquilo", "Au féminin dans la phrase : tranquila."),
    ],
  },
  {
    id: "r60",
    afterLesson: 60,
    level: "A2",
    title: "El domingo de la abuela",
    subtitle: "Un gâteau, des mesures et des photos de famille",
    place: "La cocina de la abuela",
    minutes: 6,
    chapters: [
      {
        es: "El domingo, Lucía va a casa de su abuela. En la cocina hay harina, huevos, leche y un paquete de mantequilla.",
        fr: "Le dimanche, Lucía va chez sa grand-mère. Dans la cuisine, il y a de la farine, des œufs, du lait et un paquet de beurre.",
      },
      {
        es: "«Necesitamos medio litro de leche y doscientos gramos de harina», dice la abuela. Lucía pesa todo y mezcla despacio.",
        fr: "« Il nous faut un demi-litre de lait et deux cents grammes de farine », dit la grand-mère. Lucía pèse tout et mélange lentement.",
      },
      {
        es: "Mientras el pastel está en el horno, miran el álbum de fotos. «Esta foto es de mayo, en la boda de tu tía», dice la abuela.",
        fr: "Pendant que le gâteau est au four, elles regardent l'album de photos. « Cette photo date de mai, au mariage de ta tante », dit la grand-mère.",
      },
      {
        es: "El pastel sale dorado y huele muy bien. La abuela lo pone en un plato redondo y lo cubre con azúcar.",
        fr: "Le gâteau sort doré et sent très bon. La grand-mère le pose sur une assiette ronde et le couvre de sucre.",
      },
      {
        es: "Por la tarde llega el resto de la familia. Comen, hablan y ríen. «La próxima vez, cocinas tú», dice la abuela.",
        fr: "L'après-midi, le reste de la famille arrive. Ils mangent, parlent et rient. « La prochaine fois, c'est toi qui cuisines », dit la grand-mère.",
      },
    ],
    quiz: [
      choice("¿Qué hace Lucía con su abuela?", ["un pastel", "una sopa", "una tortilla"], "un pastel"),
      input("Combien de lait ? (demi-litre, en espagnol)", "medio litro"),
      choice("¿De qué mes es la foto del álbum?", ["de mayo", "de abril", "de junio"], "de mayo"),
      choice("¿Cómo sale el pastel?", ["dorado", "negro", "verde"], "dorado"),
      input("Comment dit-on « rond » (le plat) ?", "redondo"),
    ],
  },
  {
    id: "r70",
    afterLesson: 70,
    level: "B1",
    title: "La memoria del barrio",
    subtitle: "Un article, une interview et des souvenirs",
    place: "La casa del señor Antonio",
    minutes: 7,
    chapters: [
      {
        es: "Lucía escribe un artículo sobre la historia del barrio. Quiere hablar con las personas mayores y escuchar sus recuerdos.",
        fr: "Lucía écrit un article sur l'histoire du quartier. Elle veut parler aux personnes âgées et écouter leurs souvenirs.",
      },
      {
        es: "El señor Antonio tiene ochenta años. Nació en una casa pequeña, cerca de la plaza, y fue a la escuela del barrio.",
        fr: "Monsieur Antonio a quatre-vingts ans. Il est né dans une petite maison, près de la place, et il est allé à l'école du quartier.",
      },
      {
        es: "«Antes no había libertad para decir algunas cosas», explica. «La gente tenía miedo y hablaba poco.»",
        fr: "« Avant, il n'y avait pas la liberté de dire certaines choses », explique-t-il. « Les gens avaient peur et parlaient peu. »",
      },
      {
        es: "Lucía apunta cada palabra en su cuaderno. «¿Y qué cambió?» «La escuela y la prensa», responde él. «Aprender a leer cambia todo.»",
        fr: "Lucía note chaque parole dans son carnet. « Et qu'est-ce qui a changé ? » « L'école et la presse », répond-il. « Apprendre à lire change tout. »",
      },
      {
        es: "Al final, el señor Antonio le da una foto antigua. Lucía la guarda con cuidado: será la primera página del artículo.",
        fr: "À la fin, monsieur Antonio lui donne une photo ancienne. Lucía la range avec soin : ce sera la première page de l'article.",
      },
    ],
    quiz: [
      choice("¿Sobre qué escribe Lucía?", ["la historia del barrio", "la cocina española", "el fútbol"], "la historia del barrio"),
      input("Quel âge a le señor Antonio ?", "ochenta años", "Écris le nombre en lettres."),
      choice("¿Qué no había antes, según Antonio?", ["libertad", "escuelas", "casas"], "libertad"),
      choice("¿Qué cambió todo, para él?", ["aprender a leer", "viajar", "la televisión"], "aprender a leer"),
      input("Comment dit-on « une parole / un mot » ?", "palabra"),
    ],
  },
];

export const RECITS_BY_ID = Object.fromEntries(RECITS.map((r) => [r.id, r]));

/** Récit qui clôt une étape du parcours, juste après cette leçon. */
export const RECIT_AFTER = Object.fromEntries(RECITS.map((r) => [r.afterLesson, r]));
