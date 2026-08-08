/**
 * Matemáticos — una ficha por persona.
 *
 * Cada entrada se convierte en una página propia (generar.js) y en una tarjeta
 * del índice. El `modelo` es el voxel que se dibuja en vivo en su página; la
 * `cara` es el retrato horneado que va en la tarjeta, porque ocho visores 3D en
 * una misma página son ocho contextos WebGL y el navegador corta antes.
 *
 * Cada uno tiene modelo propio, con el peinado, la barba, el color de pelo y el
 * atuendo que se le conocen por sus retratos. La caracterización vive en
 * herramientas/voxel/registro.py, donde también está dicho lo que es dato y lo
 * que es elección: el color de ojos de ninguno de ellos está documentado.
 *
 * Los campos van pensados para que después se pueda consultar el conjunto sin
 * tocar las páginas: `alta` permite ordenar por novedad, `relaciones` enlaza
 * unos con otros y `materias` los ata a las materias del sitio. Eso es el
 * germen del corpus del que habla PLAN.md §8.
 *
 * Las fórmulas van en LaTeX con los delimitadores del sitio; las compone
 * después construir.js.
 *
 * Sobre las fechas: las de la Antigüedad son inciertas y aquí se dicen
 * inciertas. Poner «325 a.C.» a secas para que la ficha quede simétrica sería
 * inventarse una precisión que no existe.
 */

const p = (t) => `        <p>${t}</p>`;

const matematicos = [
  {
    id: "euclides",
    nombre: "Euclides de Alejandría",
    modelo: "euclides",
    epoca: "siglo III a.C.",
    nacionalidad: "Grecia helenística",
    pais: "gr",
    resumen: "Ordenó la geometría en trece libros y enseñó a demostrar",
    alta: "2026-08-05",
    biografia: [
      p(
        "De su vida no se sabe casi nada: ni dónde nació, ni cuándo, ni cuándo " +
          "murió. Lo que hay son referencias tardías que lo sitúan enseñando en " +
          "Alejandría hacia el 300 a.C., bajo Ptolomeo I.",
      ),
      p(
        "Su importancia no está en haber descubierto los teoremas de los " +
          "<em>Elementos</em> —muchos eran conocidos— sino en el orden que les " +
          "dio: definiciones, postulados, nociones comunes, y a partir de ahí " +
          "todo demostrado. Esa forma de encadenar es la que sigue usando este " +
          "sitio en cada demostración.",
      ),
    ],
    personal: [
      ["Nacimiento", "desconocido"],
      ["Fallecimiento", "desconocido"],
      ["Actividad", "Alejandría, hacia el 300 a.C."],
      ["Nacionalidad", "Grecia helenística"],
      ["Instituciones", "Biblioteca de Alejandría"],
      ["Área", "Geometría, teoría de números"],
      ["Influencias", "Eudoxo de Cnido, Teeteto"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Elementos", anio: "hacia 300 a.C." },
      { titulo: "Datos", anio: "hacia 300 a.C." },
      { titulo: "Óptica", anio: "hacia 300 a.C." },
    ],
    articulos: [],
    relaciones: ["arquimedes", "hilbert", "pitagoras", "hipatia"],
    materias: [],
  },

  {
    id: "arquimedes",
    nombre: "Arquímedes de Siracusa",
    modelo: "arquimedes",
    epoca: "c. 287 – 212 a.C.",
    nacionalidad: "Siracusa, Magna Grecia",
    pais: "it",
    resumen: "Midió la esfera y se adelantó dieciocho siglos al cálculo",
    alta: "2026-08-05",
    biografia: [
      p(
        "Vivió y trabajó en Siracusa, en la Sicilia griega. Murió durante la " +
          "toma romana de la ciudad, en el 212 a.C.",
      ),
      p(
        "En <em>El Método</em>, perdido hasta 1906, explica cómo llegaba a sus " +
          "resultados pesando figuras imaginariamente antes de demostrarlos por " +
          "el método de exhaución. Es un razonamiento con infinitos que no " +
          "volvería a aparecer hasta el cálculo.",
      ),
    ],
    personal: [
      ["Nacimiento", "c. 287 a.C., Siracusa"],
      ["Fallecimiento", "212 a.C., Siracusa"],
      ["Nacionalidad", "Siracusa, Magna Grecia"],
      ["Área", "Geometría, mecánica, hidrostática"],
      ["Influencias", "Eudoxo de Cnido, Euclides"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "El Método", anio: "hallado en 1906" },
      { titulo: "Sobre la esfera y el cilindro", anio: "siglo III a.C." },
      { titulo: "Sobre los cuerpos flotantes", anio: "siglo III a.C." },
      { titulo: "El arenario", anio: "siglo III a.C." },
      { titulo: "El Método", anio: "siglo III a.C." },
    ],
    articulos: [],
    relaciones: ["euclides", "newton", "pitagoras"],
    materias: [],
  },

  {
    id: "newton",
    nombre: "Isaac Newton",
    modelo: "newton",
    epoca: "1643 – 1727",
    nacionalidad: "Inglaterra",
    pais: "en",
    resumen: "El cálculo y la gravitación, en un mismo libro",
    alta: "2026-08-05",
    biografia: [
      p(
        "Nació en Woolsthorpe, Lincolnshire. Los años de la peste, 1665 y 1666, " +
          "los pasó encerrado en la casa familiar: de ahí salieron el cálculo de " +
          "fluxiones, la descomposición de la luz y la ley de gravitación.",
      ),
      p(
        "Publicó los <em>Principia</em> en 1687 empujado por Halley. Presidió la " +
          "Royal Society y dirigió la Casa de la Moneda, donde persiguió " +
          "falsificadores con la misma tenacidad.",
      ),
    ],
    personal: [
      ["Nacimiento", "4 de enero de 1643, Woolsthorpe, Inglaterra"],
      ["Fallecimiento", "31 de marzo de 1727, Kensington, Londres"],
      ["Nacionalidad", "Inglesa"],
      ["Instituciones", "Trinity College (Cambridge), Royal Society, Casa de la Moneda"],
      ["Área", "Cálculo, mecánica, óptica"],
      ["Influencias", "Descartes, Isaac Barrow, John Wallis"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Philosophiæ Naturalis Principia Mathematica", anio: "1687" },
      { titulo: "Opticks", anio: "1704" },
      { titulo: "Method of Fluxions", anio: "1736, póstumo" },
    ],
    articulos: [
      { titulo: "New Theory about Light and Colours", anio: "1672" },
    ],
    relaciones: ["arquimedes", "euler", "leibniz", "kepler"],
    materias: [],
  },

  {
    id: "euler",
    nombre: "Leonhard Euler",
    modelo: "euler",
    epoca: "1707 – 1783",
    nacionalidad: "Suiza",
    pais: "ch",
    resumen: "Escribió más que nadie, y ciego escribió aún más",
    alta: "2026-08-05",
    biografia: [
      p(
        "Nació en Basilea y estudió con Johann Bernoulli. Pasó la vida entre las " +
          "academias de San Petersburgo y Berlín.",
      ),
      p(
        "Perdió la vista del ojo derecho hacia 1738 y quedó casi ciego en 1771. " +
          "Los años de ceguera fueron los más productivos: dictaba a sus " +
          "ayudantes. Es de él buena parte de la notación que se usa hoy — " +
          "$f(x)$, $e$, $i$, $\\Sigma$.",
      ),
    ],
    personal: [
      ["Nacimiento", "15 de abril de 1707, Basilea"],
      ["Fallecimiento", "18 de septiembre de 1783, San Petersburgo"],
      ["Nacionalidad", "Suiza"],
      ["Instituciones", "Academia de San Petersburgo, Academia de Berlín"],
      ["Área", "Análisis, teoría de números, grafos, mecánica"],
      ["Maestro", "Johann Bernoulli"],
    ],
    teoremas: [],
    conjeturas: {
      resueltas: [],
      abiertas: [
        "Si existe algún número perfecto impar. Euler probó la forma que " +
          "tendría; sigue sin saberse si existe.",
      ],
    },
    libros: [
      { titulo: "Introductio in analysin infinitorum", anio: "1748" },
      { titulo: "Institutiones calculi differentialis", anio: "1755" },
      { titulo: "Cartas a una princesa alemana", anio: "1768" },
    ],
    articulos: [
      { titulo: "Solutio problematis ad geometriam situs pertinentis", anio: "1741" },
    ],
    relaciones: ["newton", "gauss", "bernoulli", "lagrange", "fermat"],
    materias: [],
  },

  {
    id: "gauss",
    nombre: "Carl Friedrich Gauss",
    modelo: "gauss",
    epoca: "1777 – 1855",
    nacionalidad: "Brunswick, Alemania",
    pais: "de",
    resumen: "Pocas cosas, pero maduras",
    alta: "2026-08-05",
    biografia: [
      p(
        "Hijo de una familia pobre de Brunswick, llamó la atención de niño y el " +
          "duque le pagó los estudios. A los diecinueve construyó el polígono " +
          "regular de diecisiete lados con regla y compás, lo que nadie había " +
          "logrado en dos mil años, y eso lo decidió por las matemáticas.",
      ),
      p(
        "Publicaba poco y tarde — <em>pauca sed matura</em>. En sus diarios " +
          "aparecieron después resultados que otros tardaron décadas en " +
          "redescubrir, entre ellos la geometría no euclidiana.",
      ),
    ],
    personal: [
      ["Nacimiento", "30 de abril de 1777, Brunswick"],
      ["Fallecimiento", "23 de febrero de 1855, Gotinga"],
      ["Nacionalidad", "Alemana"],
      ["Instituciones", "Universidad y Observatorio de Gotinga"],
      ["Área", "Teoría de números, geometría diferencial, estadística, astronomía"],
      ["Discípulos", "Bernhard Riemann, Richard Dedekind, Gotthold Eisenstein"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Disquisitiones Arithmeticae", anio: "1801" },
      { titulo: "Theoria motus corporum coelestium", anio: "1809" },
    ],
    articulos: [
      { titulo: "Disquisitiones generales circa superficies curvas", anio: "1827" },
      { titulo: "Disquisitiones generales circa superficies curvas", anio: "1828" },
    ],
    relaciones: ["euler", "riemann", "legendre", "abel"],
    materias: [],
  },

  {
    id: "riemann",
    nombre: "Bernhard Riemann",
    modelo: "riemann",
    epoca: "1826 – 1866",
    nacionalidad: "Hannover, Alemania",
    pais: "de",
    resumen: "Cambió la idea de espacio y dejó abierta la pregunta más difícil",
    alta: "2026-08-05",
    biografia: [
      p(
        "Hijo de un pastor luterano, tímido y de salud frágil. Estudió en Gotinga " +
          "con Gauss, que en la lección de habilitación de 1854 —sobre las " +
          "hipótesis en que se funda la geometría— salió, según se cuenta, " +
          "impresionado como pocas veces.",
      ),
      p(
        "Aquella lección inventó la geometría que sesenta años después usaría " +
          "Einstein. Murió de tuberculosis a los treinta y nueve años, en Italia, " +
          "buscando un clima que no llegó a curarle.",
      ),
    ],
    personal: [
      ["Nacimiento", "17 de septiembre de 1826, Breselenz, Hannover"],
      ["Fallecimiento", "20 de julio de 1866, Selasca, Italia"],
      ["Nacionalidad", "Alemana"],
      ["Instituciones", "Universidad de Gotinga"],
      ["Área", "Análisis complejo, geometría diferencial, teoría de números"],
      ["Maestros", "Carl Friedrich Gauss, Peter Dirichlet"],
    ],
    teoremas: [],
    conjeturas: {
      resueltas: [],
      abiertas: [
        "<strong>Hipótesis de Riemann.</strong> Todos los ceros no triviales de " +
          "$\\zeta(s)$ tienen parte real $1/2$. Enunciada en 1859, es el octavo " +
          "problema de Hilbert y uno de los del milenio. Sigue abierta.",
      ],
    },
    libros: [
      { titulo: "Obras completas", anio: "1876" },
    ],
    articulos: [
      { titulo: "Über die Hypothesen, welche der Geometrie zu Grunde liegen", anio: "1854" },
      { titulo: "Über die Anzahl der Primzahlen unter einer gegebenen Größe", anio: "1859" },
    ],
    relaciones: ["gauss", "hilbert", "cauchy", "poincare", "hardy"],
    materias: [],
  },

  {
    id: "cantor",
    nombre: "Georg Cantor",
    modelo: "cantor",
    epoca: "1845 – 1918",
    nacionalidad: "Alemania",
    pais: "de",
    resumen: "Demostró que hay infinitos más grandes que otros",
    alta: "2026-08-05",
    biografia: [
      p(
        "Nació en San Petersburgo y pasó casi toda su carrera en Halle, una " +
          "universidad modesta a la que quedó atado porque Kronecker, que " +
          "consideraba su trabajo un disparate, le cerró el paso a Berlín.",
      ),
      p(
        "Entre 1874 y 1897 construyó la teoría de conjuntos: los cardinales " +
          "transfinitos, el argumento diagonal, la aritmética de infinitos. " +
          "Sufrió depresiones graves durante décadas y murió en un sanatorio.",
      ),
      p("Es el origen de la teoría de conjuntos tal como se estudia hoy."),
    ],
    personal: [
      ["Nacimiento", "3 de marzo de 1845, San Petersburgo"],
      ["Fallecimiento", "6 de enero de 1918, Halle, Alemania"],
      ["Nacionalidad", "Alemana"],
      ["Instituciones", "Universidad de Halle"],
      ["Área", "Teoría de conjuntos, análisis"],
      ["Influencias", "Karl Weierstrass, Richard Dedekind"],
      ["Oposición", "Leopold Kronecker"],
    ],
    teoremas: [],
    conjeturas: {
      resueltas: [],
      abiertas: [
        "<strong>Hipótesis del continuo.</strong> No hay ningún cardinal entre " +
          "$|\\mathbb{N}|$ y $|\\mathbb{R}|$. Es el primero de los problemas de " +
          "Hilbert. Gödel probó en 1940 que no se puede refutar desde ZFC y Cohen " +
          "en 1963 que tampoco se puede probar: es independiente de los axiomas.",
      ],
    },
    libros: [
      { titulo: "Beiträge zur Begründung der transfiniten Mengenlehre", anio: "1895–1897" },
    ],
    articulos: [
      { titulo: "Über eine Eigenschaft des Inbegriffes aller reellen algebraischen Zahlen", anio: "1874" },
      { titulo: "Über eine Eigenschaft des Inbegriffes aller reellen algebraischen Zahlen", anio: "1874" },
    ],
    relaciones: ["hilbert", "noether", "poincare", "godel"],
    materias: ["conjuntos"],
  },

  {
    id: "hilbert",
    nombre: "David Hilbert",
    modelo: "hilbert",
    epoca: "1862 – 1943",
    nacionalidad: "Prusia, Alemania",
    pais: "de",
    resumen: "Puso los cimientos y repartió el trabajo del siglo XX",
    alta: "2026-08-05",
    biografia: [
      p(
        "De Königsberg, y desde 1895 en Gotinga, que convirtió en el centro " +
          "matemático del mundo hasta que el nazismo lo vació en 1933.",
      ),
      p(
        "En el congreso de París de 1900 planteó una lista de problemas " +
          "pendientes. Buena parte de las matemáticas del siglo XX consistió en " +
          "atacarlos. Defendió la teoría de conjuntos de Cantor cuando casi nadie " +
          'lo hacía: «nadie nos expulsará del paraíso que Cantor creó».',
      ),
    ],
    personal: [
      ["Nacimiento", "23 de enero de 1862, Königsberg, Prusia"],
      ["Fallecimiento", "14 de febrero de 1943, Gotinga"],
      ["Nacionalidad", "Alemana"],
      ["Instituciones", "Universidad de Königsberg, Universidad de Gotinga"],
      ["Área", "Álgebra, análisis funcional, geometría, fundamentos"],
      ["Discípulos", "Hermann Weyl, Ernst Zermelo, Richard Courant"],
    ],
    teoremas: [],
    conjeturas: {
      resueltas: [
        "De los 23 problemas de 1900, la mayoría están resueltos o precisados.",
        "El segundo —la consistencia de la aritmética— lo cerró Gödel en 1931, " +
          "pero en contra: ningún sistema que contenga la aritmética puede probar " +
          "su propia consistencia.",
      ],
      abiertas: [
        'El octavo sigue abierto: es la <a href="ficha:riemann">hipótesis de Riemann</a>.',
      ],
    },
    libros: [
      { titulo: "Grundlagen der Geometrie", anio: "1899" },
      { titulo: "Grundlagen der Mathematik", anio: "1934–1939, con Paul Bernays" },
    ],
    articulos: [
      { titulo: "Mathematische Probleme (los 23 problemas)", anio: "1900" },
    ],
    relaciones: ["cantor", "riemann", "noether", "godel", "neumann", "turing"],
    materias: ["conjuntos"],
  },

  {
    id: "noether",
    nombre: "Emmy Noether",
    modelo: "noether",
    epoca: "1882 – 1935",
    nacionalidad: "Alemania",
    pais: "de",
    resumen: "El álgebra abstracta, y la simetría detrás de toda ley de conservación",
    alta: "2026-08-05",
    biografia: [
      p(
        "Trabajó años sin sueldo ni plaza porque la universidad alemana no " +
          "admitía mujeres. Hilbert la llevó a Gotinga y peleó por su " +
          "habilitación: «no veo que el sexo del candidato sea un argumento en " +
          "contra; esto es una universidad, no una casa de baños». Durante un " +
          "tiempo tuvo que dar sus clases anunciadas a nombre de él.",
      ),
      p(
        "Expulsada en 1933 por judía, emigró a Estados Unidos, donde murió dos " +
          "años después tras una operación. Es la fundadora del álgebra abstracta " +
          "moderna: anillos, ideales, módulos tal como se estudian hoy.",
      ),
    ],
    personal: [
      ["Nacimiento", "23 de marzo de 1882, Erlangen, Alemania"],
      ["Fallecimiento", "14 de abril de 1935, Bryn Mawr, Estados Unidos"],
      ["Nacionalidad", "Alemana"],
      ["Instituciones", "Universidad de Gotinga, Bryn Mawr College"],
      ["Área", "Álgebra abstracta, física teórica"],
      ["Influencias", "David Hilbert, Felix Klein"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Idealtheorie in Ringbereichen", anio: "1921" },
    ],
    articulos: [
      { titulo: "Invariante Variationsprobleme", anio: "1918" },
      { titulo: "Idealtheorie in Ringbereichen", anio: "1921" },
    ],
    relaciones: ["hilbert", "cantor", "galois", "kovalevskaya"],
    materias: [],
  },
  {
    id: "cardano",
    nombre: "Gerolamo Cardano",
    modelo: "cardano",
    epoca: "1501 – 1576",
    nacionalidad: "Milán, Italia",
    pais: "it",
    resumen: "Publicó cómo resolver la cúbica y abrió la puerta a los imaginarios",
    alta: "2026-08-06",
    biografia: [
      p(
        "Médico, jugador y matemático, en ese orden según a quién se le pregunte. " +
          "Vivió de la medicina y de las cartas, y las dos cosas se le notan en la obra.",
      ),
      p(
        "En el <em>Ars Magna</em> (1545) publicó la solución de la ecuación de " +
          "tercer grado, que había obtenido Tartaglia y le había confiado bajo " +
          "juramento, y la de cuarto grado, de su discípulo Ferrari. La disputa " +
          "que siguió es de las más agrias de la historia de las matemáticas.",
      ),
      p(
        "Al resolver esas ecuaciones aparecían raíces de números negativos. " +
          "Cardano las usó a regañadientes —las llamó «tan sutiles como " +
          "inútiles»— y con eso empezaron los números complejos.",
      ),
    ],
    personal: [
      ["Nacimiento", "24 de septiembre de 1501, Pavía"],
      ["Fallecimiento", "21 de septiembre de 1576, Roma"],
      ["Nacionalidad", "Ducado de Milán"],
      ["Instituciones", "Universidad de Pavía, Universidad de Bolonia"],
      ["Área", "Álgebra, probabilidad, medicina"],
      ["Discípulo", "Ludovico Ferrari"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Liber de ludo aleae", anio: "c. 1564" },
      { titulo: "Ars Magna", anio: "1545" },
      { titulo: "Liber de ludo aleae", anio: "1663, póstumo" },
    ],
    articulos: [],
    relaciones: ["fermat", "pascal", "fibonacci", "juarismi"],
    materias: [],
  },

  {
    id: "kepler",
    nombre: "Johannes Kepler",
    modelo: "kepler",
    epoca: "1571 – 1630",
    nacionalidad: "Sacro Imperio, Alemania",
    pais: "de",
    resumen: "Puso los planetas en elipses y dejó una conjetura de naranjas",
    alta: "2026-08-06",
    biografia: [
      p(
        "Heredó de Tycho Brahe las mejores medidas de posiciones planetarias que " +
          "existían. Pasó años intentando cuadrar la órbita de Marte con " +
          "circunferencias, hasta que aceptó lo que decían los números: era una " +
          "elipse.",
      ),
      p(
        "Se ganaba la vida haciendo horóscopos y defendió a su madre de un juicio " +
          "por brujería que duró seis años. Las tres leyes que llevan su nombre " +
          "son las que Newton explicaría después con la gravitación.",
      ),
    ],
    personal: [
      ["Nacimiento", "27 de diciembre de 1571, Weil der Stadt"],
      ["Fallecimiento", "15 de noviembre de 1630, Ratisbona"],
      ["Nacionalidad", "Sacro Imperio Romano Germánico"],
      ["Instituciones", "Universidad de Tubinga, corte imperial de Praga"],
      ["Área", "Astronomía, geometría, óptica"],
      ["Maestro", "Michael Mästlin"],
    ],
    teoremas: [],
    conjeturas: {
      resueltas: [
        "<strong>Conjetura de Kepler.</strong> No hay manera de apilar esferas " +
          "iguales que aproveche el espacio mejor que como se apilan las naranjas " +
          "en el mercado, con densidad $\\pi/\\sqrt{18}$. La enunció en 1611 y " +
          "resistió casi cuatro siglos: Hales la demostró en 1998 con ayuda de " +
          "ordenador, y la comprobación formal terminó en 2014.",
      ],
      abiertas: [],
    },
    libros: [
      { titulo: "Astronomia nova", anio: "1609" },
      { titulo: "Harmonices Mundi", anio: "1619" },
    ],
    articulos: [
      { titulo: "Nova stereometria doliorum vinariorum", anio: "1615" },
    ],
    relaciones: ["newton", "descartes", "fibonacci"],
    materias: [],
  },

  {
    id: "descartes",
    nombre: "René Descartes",
    modelo: "descartes",
    epoca: "1596 – 1650",
    nacionalidad: "Francia",
    pais: "fr",
    resumen: "Cruzó el álgebra con la geometría y le puso ejes al plano",
    alta: "2026-08-06",
    biografia: [
      p(
        "<em>La Géométrie</em> era solo uno de los tres apéndices del " +
          "<em>Discurso del método</em> (1637), y acabó siendo lo que más pesó: " +
          "ahí una curva deja de ser un dibujo y pasa a ser una ecuación.",
      ),
      p(
        "Murió en Estocolmo de una neumonía, al parecer por madrugar para dar " +
          "clase a la reina Cristina; tenía por costumbre trabajar en la cama " +
          "hasta el mediodía.",
      ),
    ],
    personal: [
      ["Nacimiento", "31 de marzo de 1596, La Haye en Touraine"],
      ["Fallecimiento", "11 de febrero de 1650, Estocolmo"],
      ["Nacionalidad", "Francesa"],
      ["Instituciones", "Colegio de La Flèche, Universidad de Poitiers"],
      ["Área", "Geometría, filosofía, óptica"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Discours de la méthode, con La Géométrie", anio: "1637" },
      { titulo: "Principia philosophiae", anio: "1644" },
    ],
    articulos: [
      { titulo: "La Géométrie, apéndice del Discurso del método", anio: "1637" },
    ],
    relaciones: ["fermat", "newton", "pascal", "kepler"],
    materias: [],
  },

  {
    id: "fermat",
    nombre: "Pierre de Fermat",
    modelo: "fermat",
    epoca: "1607 – 1665",
    nacionalidad: "Francia",
    pais: "fr",
    resumen: "Magistrado de oficio, y el aficionado que dejó tres siglos de trabajo",
    alta: "2026-08-06",
    biografia: [
      p(
        "Era jurista en Toulouse; las matemáticas las hacía fuera de horas y casi " +
          "nunca publicaba. Lo que se sabe de él está en sus cartas y en los " +
          "márgenes de sus libros.",
      ),
      p(
        "Con Pascal, en un intercambio de cartas de 1654 sobre el reparto de una " +
          "apuesta interrumpida, fundó el cálculo de probabilidades. Y su método " +
          "de máximos y mínimos se adelanta al cálculo diferencial.",
      ),
    ],
    personal: [
      ["Nacimiento", "1607, Beaumont-de-Lomagne"],
      ["Fallecimiento", "12 de enero de 1665, Castres"],
      ["Nacionalidad", "Francesa"],
      ["Instituciones", "Parlamento de Toulouse"],
      ["Área", "Teoría de números, probabilidad, análisis"],
    ],
    teoremas: [],
    conjeturas: {
      resueltas: [
        "<strong>Último teorema de Fermat.</strong> No hay enteros positivos con " +
          "$a^{n} + b^{n} = c^{n}$ para $n \\gt 2$. Lo anotó hacia 1637 en el " +
          "margen de una <em>Aritmética</em> de Diofanto, con la nota de que la " +
          "demostración no le cabía. Costó 358 años: la cerró Andrew Wiles en 1994.",
      ],
      abiertas: [],
    },
    libros: [
      { titulo: "Varia opera mathematica", anio: "1679" },
    ],
    articulos: [
      { titulo: "Correspondencia con Pascal sobre el reparto de apuestas", anio: "1654" },
    ],
    relaciones: ["pascal", "descartes", "euler"],
    materias: [],
  },

  {
    id: "pascal",
    nombre: "Blaise Pascal",
    modelo: "pascal",
    epoca: "1623 – 1662",
    nacionalidad: "Francia",
    pais: "fr",
    resumen: "Probabilidad, presión y una máquina de calcular, antes de los cuarenta",
    alta: "2026-08-06",
    biografia: [
      p(
        "A los dieciséis publicó su teorema sobre cónicas; a los diecinueve " +
          "construyó una calculadora mecánica para ayudar a su padre, recaudador " +
          "de impuestos.",
      ),
      p(
        "Tras una experiencia religiosa en 1654 dejó las matemáticas casi por " +
          "completo y se dedicó a los <em>Pensamientos</em>. Murió a los treinta " +
          "y nueve.",
      ),
    ],
    personal: [
      ["Nacimiento", "19 de junio de 1623, Clermont-Ferrand"],
      ["Fallecimiento", "19 de agosto de 1662, París"],
      ["Nacionalidad", "Francesa"],
      ["Área", "Probabilidad, geometría proyectiva, hidrostática"],
      ["Influencias", "Girard Desargues, Pierre de Fermat"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Traité du triangle arithmétique", anio: "1665, póstumo" },
      { titulo: "Pensées", anio: "1670, póstumo" },
    ],
    articulos: [
      { titulo: "Traité du triangle arithmétique", anio: "1665" },
    ],
    relaciones: ["fermat", "leibniz", "descartes"],
    materias: [],
  },

  {
    id: "leibniz",
    nombre: "Gottfried Wilhelm Leibniz",
    modelo: "leibniz",
    epoca: "1646 – 1716",
    nacionalidad: "Alemania",
    pais: "de",
    resumen: "La notación del cálculo que seguimos usando, y el sistema binario",
    alta: "2026-08-06",
    biografia: [
      p(
        "Llegó al cálculo por su cuenta y después que Newton, pero publicó antes " +
          "y con mejor notación: $dx$, $dy$ y el signo $\\int$ —una ese de " +
          "<em>summa</em>— son suyos y se siguen escribiendo igual.",
      ),
      p(
        "La disputa de prioridad con Newton le amargó los últimos años y dejó a " +
          "las matemáticas inglesas encerradas un siglo en la notación de " +
          "fluxiones. Describió además el sistema binario en 1703.",
      ),
    ],
    personal: [
      ["Nacimiento", "1 de julio de 1646, Leipzig"],
      ["Fallecimiento", "14 de noviembre de 1716, Hannover"],
      ["Nacionalidad", "Alemana"],
      ["Instituciones", "Corte de Hannover, Academia de Berlín"],
      ["Área", "Cálculo, lógica, filosofía"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Nova methodus pro maximis et minimis", anio: "1684" },
      { titulo: "Monadología", anio: "1714" },
    ],
    articulos: [
      { titulo: "Explication de l'arithmétique binaire", anio: "1703" },
    ],
    relaciones: ["newton", "bernoulli", "pascal"],
    materias: [],
  },

  {
    id: "bernoulli",
    nombre: "Jacob Bernoulli",
    modelo: "bernoulli",
    epoca: "1655 – 1705",
    nacionalidad: "Basilea, Suiza",
    pais: "ch",
    resumen: "La ley de los grandes números y los números que llevan su apellido",
    alta: "2026-08-06",
    biografia: [
      p(
        "El primero de una familia que dio ocho matemáticos en tres " +
          "generaciones, y que se llevaba fatal: compitió con su hermano Johann " +
          "en público y por escrito durante años. Johann sería después el maestro " +
          'de <a href="ficha:euler">Euler</a>.',
      ),
      p(
        "Pidió que le grabaran en la tumba una espiral logarítmica con el lema " +
          "<em>eadem mutata resurgo</em> —«resurjo cambiada, la misma»—, porque " +
          "la curva se reproduce a sí misma al transformarla. El cantero se " +
          "equivocó y grabó una espiral de Arquímedes.",
      ),
    ],
    personal: [
      ["Nacimiento", "6 de enero de 1655, Basilea"],
      ["Fallecimiento", "16 de agosto de 1705, Basilea"],
      ["Nacionalidad", "Suiza"],
      ["Instituciones", "Universidad de Basilea"],
      ["Área", "Probabilidad, cálculo, series"],
      ["Hermano", "Johann Bernoulli, maestro de Euler"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Ars Conjectandi", anio: "1713" },{ titulo: "Ars Conjectandi", anio: "1713, póstumo" }],
    articulos: [],
    relaciones: ["euler", "leibniz"],
    materias: [],
  },

  {
    id: "lagrange",
    nombre: "Joseph-Louis Lagrange",
    modelo: "lagrange",
    epoca: "1736 – 1813",
    nacionalidad: "Turín, Italia",
    pais: "it",
    resumen: "Rehízo la mecánica sin dibujar un solo diagrama",
    alta: "2026-08-06",
    biografia: [
      p(
        "Nació en Turín como Giuseppe Luigi Lagrangia y acabó en París. Entre " +
          "medias sucedió a Euler en la Academia de Berlín, por recomendación del " +
          "propio Euler.",
      ),
      p(
        "De su <em>Mécanique analytique</em> presumía de que no contenía ni una " +
          "figura: había convertido la mecánica en análisis puro. Presidió la " +
          "comisión que creó el sistema métrico decimal.",
      ),
    ],
    personal: [
      ["Nacimiento", "25 de enero de 1736, Turín"],
      ["Fallecimiento", "10 de abril de 1813, París"],
      ["Nacionalidad", "Reino de Cerdeña; después Francia"],
      ["Instituciones", "Academia de Berlín, École Polytechnique"],
      ["Área", "Mecánica, teoría de números, álgebra"],
      ["Discípulos", "Joseph Fourier, Siméon Poisson"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [{ titulo: "Mécanique analytique", anio: "1788" }],
    articulos: [
      { titulo: "Réflexions sur la résolution algébrique des équations", anio: "1771" },
    ],
    relaciones: ["euler", "laplace", "cauchy", "galois", "fourier"],
    materias: [],
  },

  {
    id: "laplace",
    nombre: "Pierre-Simon Laplace",
    modelo: "laplace",
    epoca: "1749 – 1827",
    nacionalidad: "Francia",
    pais: "fr",
    resumen: "La mecánica del cielo y la probabilidad como forma de razonar",
    alta: "2026-08-06",
    biografia: [
      p(
        "Cinco volúmenes de <em>Mécanique céleste</em> para demostrar que el " +
          "sistema solar es estable sin necesidad de que nadie lo ajuste. " +
          "Cuando Napoleón le preguntó por qué no aparecía Dios en su obra, " +
          "respondió que no había necesitado esa hipótesis.",
      ),
      p(
        "Su <em>Théorie analytique des probabilités</em> convirtió el azar en " +
          "una herramienta de inferencia: cómo actualizar lo que se cree cuando " +
          "llegan datos nuevos.",
      ),
    ],
    personal: [
      ["Nacimiento", "23 de marzo de 1749, Beaumont-en-Auge"],
      ["Fallecimiento", "5 de marzo de 1827, París"],
      ["Nacionalidad", "Francesa"],
      ["Instituciones", "Académie des sciences, École Militaire"],
      ["Área", "Probabilidad, mecánica celeste, análisis"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Mécanique céleste", anio: "1799–1825" },
      { titulo: "Théorie analytique des probabilités", anio: "1812" },
    ],
    articulos: [],
    relaciones: ["lagrange", "legendre", "fourier", "kovalevskaya"],
    materias: [],
  },

  {
    id: "legendre",
    nombre: "Adrien-Marie Legendre",
    modelo: "legendre",
    epoca: "1752 – 1833",
    nacionalidad: "Francia",
    pais: "fr",
    resumen: "Mínimos cuadrados, y la sospecha de cómo se reparten los primos",
    alta: "2026-08-06",
    biografia: [
      p(
        "Publicó el método de los mínimos cuadrados en 1805. Gauss afirmó " +
          "después haberlo usado desde 1795 sin publicarlo, y la disputa le " +
          "acompañó el resto de su vida; algo parecido le ocurrió con la " +
          "reciprocidad cuadrática.",
      ),
      p(
        "De él no se conserva ningún retrato salvo una caricatura de 1820: " +
          "durante casi dos siglos los libros ilustraron su biografía con el " +
          "retrato de otra persona, un político homónimo.",
      ),
    ],
    personal: [
      ["Nacimiento", "18 de septiembre de 1752, París"],
      ["Fallecimiento", "9 de enero de 1833, París"],
      ["Nacionalidad", "Francesa"],
      ["Instituciones", "École Militaire, Bureau des Longitudes"],
      ["Área", "Teoría de números, análisis, geodesia"],
    ],
    teoremas: [],
    conjeturas: {
      resueltas: [
        "Conjeturó en 1798 cómo se reparten los primos: los menores que $x$ son " +
          "del orden de $x/\\ln x$. Es el teorema de los números primos, que " +
          "demostraron Hadamard y de la Vallée Poussin en 1896, por separado y " +
          "el mismo año.",
      ],
      abiertas: [],
    },
    libros: [{ titulo: "Éléments de géométrie", anio: "1794" }],
    articulos: [
      { titulo: "Recherches sur l'attraction des sphéroïdes homogènes", anio: "1785" },
      { titulo: "Nouvelles méthodes pour la détermination des orbites des comètes", anio: "1805" },
    ],
    relaciones: ["gauss", "laplace", "abel"],
    materias: [],
  },

  {
    id: "fourier",
    nombre: "Joseph Fourier",
    modelo: "fourier",
    epoca: "1768 – 1830",
    nacionalidad: "Francia",
    pais: "fr",
    resumen: "Cualquier onda es una suma de senos, por rara que parezca",
    alta: "2026-08-06",
    biografia: [
      p(
        "Acompañó a Napoleón a Egipto como secretario de la expedición " +
          "científica y volvió convertido en prefecto. Entre la administración y " +
          "la egiptología escribió sobre cómo se propaga el calor.",
      ),
      p(
        "Su idea —que una función cualquiera se descompone en senos y cosenos— " +
          "escandalizó a Lagrange y a Laplace, que estaban en el tribunal que " +
          "juzgó la memoria. Tardó quince años en publicarse, y hoy es la " +
          "herramienta con la que se procesa cualquier señal.",
      ),
      p(
        "En 1824 describió además que la atmósfera retiene calor: es la primera " +
          "descripción del efecto invernadero.",
      ),
    ],
    personal: [
      ["Nacimiento", "21 de marzo de 1768, Auxerre"],
      ["Fallecimiento", "16 de mayo de 1830, París"],
      ["Nacionalidad", "Francesa"],
      ["Instituciones", "École Polytechnique, Académie des sciences"],
      ["Área", "Análisis, física matemática"],
      ["Maestros", "Joseph-Louis Lagrange, Pierre-Simon Laplace"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [{ titulo: "Théorie analytique de la chaleur", anio: "1822" }],
    articulos: [],
    relaciones: ["lagrange", "laplace", "galois"],
    materias: [],
  },

  {
    id: "faraday",
    nombre: "Michael Faraday",
    modelo: "faraday",
    epoca: "1791 – 1867",
    nacionalidad: "Inglaterra",
    pais: "en",
    resumen: "Vio el campo antes de que nadie supiera escribirlo",
    alta: "2026-08-06",
    biografia: [
      p(
        "<strong>No era matemático</strong>, y conviene decirlo: apenas manejaba " +
          "álgebra. Encuadernador de aprendiz, llegó a la ciencia por los libros " +
          "que encuadernaba y trabajó siempre con experimentos y con imágenes, no " +
          "con ecuaciones.",
      ),
      p(
        "Su idea de las líneas de fuerza —el espacio alrededor de un imán está " +
          "él mismo en tensión— parecía cosa de aficionado hasta que Maxwell la " +
          "escribió en ecuaciones y resultó ser la estructura de toda la física " +
          "posterior. Está aquí por eso: por lo que hizo posible.",
      ),
    ],
    personal: [
      ["Nacimiento", "22 de septiembre de 1791, Newington Butts, Londres"],
      ["Fallecimiento", "25 de agosto de 1867, Hampton Court"],
      ["Nacionalidad", "Inglesa"],
      ["Instituciones", "Royal Institution"],
      ["Área", "Electromagnetismo, electroquímica"],
      ["Maestro", "Humphry Davy"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Experimental Researches in Electricity", anio: "1839" },
      { titulo: "Experimental Researches in Electricity", anio: "1839–1855" },
      { titulo: "La historia química de una vela", anio: "1861" },
    ],
    articulos: [],
    relaciones: ["newton"],
    materias: [],
  },

  {
    id: "ramanujan",
    nombre: "Srinivasa Ramanujan",
    modelo: "ramanujan",
    epoca: "1887 – 1920",
    nacionalidad: "India",
    pais: "in",
    resumen: "Miles de fórmulas sin demostración, y casi todas ciertas",
    alta: "2026-08-06",
    biografia: [
      p(
        "Se formó prácticamente solo, con un manual de fórmulas y sin acceso a " +
          "la matemática europea. En 1913 escribió a Hardy, en Cambridge, con una " +
          "lista de resultados; Hardy contó después que algunos «debían ser " +
          "ciertos, porque nadie tendría la imaginación de inventarlos».",
      ),
      p(
        "Trabajó cinco años en Inglaterra, enfermó y volvió a la India, donde " +
          "murió a los treinta y dos. Sus cuadernos —miles de resultados sin " +
          "demostrar— siguen dando trabajo y teoremas un siglo después.",
      ),
    ],
    personal: [
      ["Nacimiento", "22 de diciembre de 1887, Erode, India"],
      ["Fallecimiento", "26 de abril de 1920, Kumbakonam"],
      ["Nacionalidad", "India"],
      ["Instituciones", "Trinity College, Cambridge"],
      ["Área", "Teoría de números, series, particiones"],
      ["Colaborador", "Godfrey Harold Hardy"],
    ],
    teoremas: [],
    conjeturas: {
      resueltas: [
        "Su conjetura sobre la función $\\tau$ la demostró Deligne en 1974, como " +
          "consecuencia de las conjeturas de Weil, y le valió la medalla Fields.",
      ],
      abiertas: [],
    },
    libros: [
      { titulo: "Cuadernos perdidos", anio: "hallados en 1976" },
    ],
    articulos: [
      { titulo: "Modular equations and approximations to π", anio: "1914" },
      { titulo: "Asymptotic formulae in combinatory analysis, con Hardy", anio: "1918" },
    ],
    relaciones: ["euler", "hilbert", "hardy"],
    materias: [],
  },

  /* ── De la Antigüedad al siglo XX ──
     Los que faltaban para que las líneas se sostengan solas: sin al-Juarismi no
     se entiende Fibonacci, sin Galois no se entiende Noether, y sin Hardy la
     ficha de Ramanujan cuenta media historia. */

  {
    id: "pitagoras",
    nombre: "Pitágoras de Samos",
    modelo: "pitagoras",
    epoca: "c. 570 – c. 495 a.C.",
    nacionalidad: "Samos, Grecia",
    pais: "gr",
    resumen: "Fundó una escuela donde el número era el principio de todo",
    alta: "2026-08-06",
    biografia: [
      p(
        "No escribió nada, o nada que se conserve. Lo que hay son testimonios de " +
          "dos y tres siglos después, y una escuela —la de Crotona— que atribuía " +
          "a su fundador todo lo que descubría, así que separar al hombre de la " +
          "secta es imposible.",
      ),
      p(
        "El descubrimiento que se le atribuye y que peor le vino es el que rompía " +
          "su propia doctrina: la diagonal del cuadrado no es conmensurable con el " +
          "lado, o sea que hay razones que ningún par de enteros da. Con «todo es " +
          "número» por bandera, eso era una catástrofe.",
      ),
    ],
    personal: [
      ["Nacimiento", "c. 570 a.C., Samos"],
      ["Fallecimiento", "c. 495 a.C., Metaponto"],
      ["Nacionalidad", "Samos, Grecia"],
      ["Instituciones", "escuela pitagórica de Crotona"],
      ["Área", "Geometría, aritmética, armonía"],
      ["Influencias", "Tales de Mileto, Anaximandro"],
      ["Discípulos", "Hipaso de Metaponto, Filolao"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [],
    articulos: [],
    relaciones: ["euclides", "arquimedes", "hipatia"],
    materias: [],
  },

  {
    id: "hipatia",
    nombre: "Hipatia de Alejandría",
    modelo: "hipatia",
    epoca: "c. 355 – 415",
    nacionalidad: "Alejandría, Egipto romano",
    pais: "eg",
    resumen: "Editó y enseñó lo que de otro modo se habría perdido",
    alta: "2026-08-06",
    biografia: [
      p(
        "Enseñó matemáticas y astronomía en Alejandría y dirigió allí la escuela " +
          "neoplatónica. De su obra no queda nada firmado por ella: lo que hizo " +
          "fueron comentarios y ediciones —del <em>Almagesto</em> de Ptolomeo, de " +
          "las <em>Cónicas</em> de Apolonio, de la <em>Aritmética</em> de " +
          "Diofanto—, y ese trabajo es la razón de que esos textos llegaran a " +
          "nosotros.",
      ),
      p(
        "Murió linchada en 415 por una turba, en medio del pulso entre el obispo " +
          "Cirilo y el prefecto Orestes. Su muerte se cuenta desde entonces como " +
          "el final de la Alejandría antigua, que es más literatura que historia, " +
          "pero da idea de lo que significó.",
      ),
    ],
    personal: [
      ["Nacimiento", "c. 355, Alejandría"],
      ["Fallecimiento", "marzo de 415, Alejandría"],
      ["Nacionalidad", "Egipto romano"],
      ["Instituciones", "escuela neoplatónica de Alejandría"],
      ["Área", "Astronomía, geometría, álgebra"],
      ["Maestro", "Teón de Alejandría, su padre"],
      ["Discípulos", "Sinesio de Cirene"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Comentario a la Aritmética de Diofanto", anio: "perdido" },
      { titulo: "Comentario a las Cónicas de Apolonio", anio: "perdido" },
      { titulo: "Canon astronómico", anio: "perdido" },
    ],
    articulos: [],
    relaciones: ["euclides", "pitagoras", "kovalevskaya"],
    materias: [],
  },

  {
    id: "juarismi",
    nombre: "Muhammad al-Juarismi",
    modelo: "juarismi",
    epoca: "c. 780 – c. 850",
    nacionalidad: "Corasmia, califato abasí",
    pais: "ir",
    resumen: "Le dio nombre al álgebra y al algoritmo",
    alta: "2026-08-06",
    biografia: [
      p(
        "Trabajó en la Casa de la Sabiduría de Bagdad. Su tratado de " +
          "<em>al-jabr</em> resuelve por orden las ecuaciones de primer y segundo " +
          "grado con dos operaciones: <em>al-jabr</em>, pasar al otro lado lo que " +
          "resta, y <em>al-muqabala</em>, cancelar lo que se repite. De la primera " +
          "sale la palabra álgebra.",
      ),
      p(
        "De la versión latina de su libro sobre el cálculo indio, que empieza " +
          "«Dixit Algorizmi», sale la palabra algoritmo. Todo su álgebra está " +
          "escrita con palabras: no hay un solo símbolo, ni siquiera para la " +
          "incógnita.",
      ),
    ],
    personal: [
      ["Nacimiento", "c. 780, Corasmia"],
      ["Fallecimiento", "c. 850, Bagdad"],
      ["Nacionalidad", "califato abasí"],
      ["Instituciones", "Casa de la Sabiduría, Bagdad"],
      ["Área", "Álgebra, aritmética, astronomía, geografía"],
      ["Influencias", "Brahmagupta, Diofanto, Euclides"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Compendio de cálculo por completación y comparación", anio: "c. 820" },
      { titulo: "Sobre el cálculo con los números indios", anio: "c. 825" },
      { titulo: "Imagen de la Tierra", anio: "c. 833" },
    ],
    articulos: [],
    relaciones: ["fibonacci", "cardano", "hipatia"],
    materias: [],
  },

  {
    id: "fibonacci",
    nombre: "Leonardo de Pisa",
    modelo: "fibonacci",
    epoca: "c. 1170 – c. 1250",
    nacionalidad: "Pisa, Italia",
    pais: "it",
    resumen: "Trajo las cifras árabes a Europa con un problema de conejos",
    alta: "2026-08-06",
    biografia: [
      p(
        "Se crió en Bugía, en la costa argelina, donde su padre dirigía una " +
          "aduana pisana, y allí aprendió de los comerciantes musulmanes el " +
          "cálculo con cifras indoarábigas. El <em>Liber Abaci</em> lo escribió " +
          "para convencer a los mercaderes italianos de que ese sistema era mejor " +
          "que los números romanos y el ábaco.",
      ),
      p(
        "La sucesión que lleva su nombre aparece de pasada, como el ejercicio de " +
          "una pareja de conejos que cría cada mes. Ni la inventó él —está en la " +
          "métrica sánscrita siglos antes— ni le dio la menor importancia.",
      ),
    ],
    personal: [
      ["Nacimiento", "c. 1170, Pisa"],
      ["Fallecimiento", "c. 1250, Pisa"],
      ["Nacionalidad", "República de Pisa"],
      ["Área", "Aritmética, álgebra, teoría de números"],
      ["Influencias", "al-Juarismi, Abu Kamil, Euclides"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Liber Abaci", anio: "1202" },
      { titulo: "Practica Geometriae", anio: "1220" },
      { titulo: "Liber Quadratorum", anio: "1225" },
    ],
    articulos: [],
    relaciones: ["juarismi", "cardano", "kepler"],
    materias: [],
  },

  {
    id: "galois",
    nombre: "Évariste Galois",
    modelo: "galois",
    epoca: "1811 – 1832",
    nacionalidad: "Francia",
    pais: "fr",
    resumen: "A los veinte años dejó dicho por qué la quíntica no se resuelve",
    alta: "2026-08-06",
    biografia: [
      p(
        "Suspendió dos veces el ingreso en la Escuela Politécnica, perdió dos " +
          "memorias en manos de la Academia —Cauchy traspapeló una, Fourier murió " +
          "con la otra encima— y pasó por la cárcel por republicano. Murió en un " +
          "duelo a los veinte años.",
      ),
      p(
        "La noche anterior escribió a su amigo Auguste Chevalier las páginas que " +
          "resumen su teoría. Tardaron catorce años en publicarse y bastante más " +
          "en entenderse: lo que hay ahí es la idea de grupo puesta a trabajar " +
          "sobre las raíces de una ecuación.",
      ),
    ],
    personal: [
      ["Nacimiento", "25 de octubre de 1811, Bourg-la-Reine"],
      ["Fallecimiento", "31 de mayo de 1832, París"],
      ["Nacionalidad", "Francia"],
      ["Instituciones", "Escuela Normal, expulsado en 1831"],
      ["Área", "Álgebra, teoría de grupos"],
      ["Influencias", "Lagrange, Abel, Cauchy"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [],
    articulos: [
      { titulo: "Mémoire sur les conditions de résolubilité des équations par radicaux", anio: "1831" },
      { titulo: "Sur la théorie des nombres", anio: "1830" },
      { titulo: "Carta a Auguste Chevalier", anio: "1832" },
    ],
    relaciones: ["abel", "cauchy", "lagrange", "noether"],
    materias: [],
  },

  {
    id: "abel",
    nombre: "Niels Henrik Abel",
    modelo: "abel",
    epoca: "1802 – 1829",
    nacionalidad: "Noruega",
    pais: "no",
    resumen: "Cerró un problema de tres siglos y murió pobre a los veintiséis",
    alta: "2026-08-06",
    biografia: [
      p(
        "Con veintiún años demostró que la ecuación general de quinto grado no se " +
          "resuelve por radicales, y pagó de su bolsillo la impresión del folleto. " +
          "Para que cupiera en seis páginas lo dejó tan comprimido que casi nadie " +
          "lo entendió.",
      ),
      p(
        "Recorrió Europa buscando un puesto que nunca llegó. Murió de tuberculosis " +
          "a los veintiséis años; dos días después salió de Berlín la carta que le " +
          "ofrecía la cátedra.",
      ),
    ],
    personal: [
      ["Nacimiento", "5 de agosto de 1802, Nedstrand"],
      ["Fallecimiento", "6 de abril de 1829, Froland"],
      ["Nacionalidad", "Noruega"],
      ["Instituciones", "Universidad de Cristianía"],
      ["Área", "Álgebra, análisis, funciones elípticas"],
      ["Influencias", "Cauchy, Legendre, Gauss"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [],
    articulos: [
      { titulo: "Mémoire sur les équations algébriques", anio: "1824" },
      { titulo: "Recherches sur les fonctions elliptiques", anio: "1827" },
      { titulo: "Sur une propriété remarquable d'une classe d'équations", anio: "1829" },
    ],
    relaciones: ["galois", "legendre", "gauss", "cauchy"],
    materias: [],
  },

  {
    id: "cauchy",
    nombre: "Augustin-Louis Cauchy",
    modelo: "cauchy",
    epoca: "1789 – 1857",
    nacionalidad: "Francia",
    pais: "fr",
    resumen: "Le puso al análisis los límites que le faltaban",
    alta: "2026-08-06",
    biografia: [
      p(
        "Escribió más que casi nadie —casi ochocientos trabajos— y sobre todo puso " +
          "el cálculo en orden: definió el límite, la continuidad, la derivada y la " +
          "integral sin apelar a infinitesimales que nadie sabía qué eran. El " +
          "<em>Cours d'analyse</em> de 1821 es donde el rigor entra en escena.",
      ),
      p(
        "Fue también quien traspapeló la memoria de Abel y la de Galois, las dos. " +
          "Monárquico convencido, se exilió con Carlos X en 1830 antes que jurar " +
          "fidelidad al nuevo rey.",
      ),
    ],
    personal: [
      ["Nacimiento", "21 de agosto de 1789, París"],
      ["Fallecimiento", "23 de mayo de 1857, Sceaux"],
      ["Nacionalidad", "Francia"],
      ["Instituciones", "Escuela Politécnica, Colegio de Francia, Turín"],
      ["Área", "Análisis, variable compleja, elasticidad"],
      ["Maestros", "Lagrange, Laplace"],
      ["Discípulos", "Bertrand, Briot, Bouquet"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Cours d'analyse de l'École Royale Polytechnique", anio: "1821" },
      { titulo: "Résumé des leçons sur le calcul infinitésimal", anio: "1823" },
      { titulo: "Exercices de mathématiques", anio: "1826" },
    ],
    articulos: [
      { titulo: "Mémoire sur les intégrales définies", anio: "1814" },
    ],
    relaciones: ["riemann", "abel", "galois", "lagrange", "kovalevskaya"],
    materias: [],
  },

  {
    id: "poincare",
    nombre: "Henri Poincaré",
    modelo: "poincare",
    epoca: "1854 – 1912",
    nacionalidad: "Francia",
    pais: "fr",
    resumen: "El último que abarcó las matemáticas enteras",
    alta: "2026-08-06",
    biografia: [
      p(
        "Trabajó en casi todo: ecuaciones diferenciales, mecánica celeste, " +
          "topología, teoría de números, óptica, electricidad. En el problema de " +
          "los tres cuerpos encontró que hay órbitas que ni se repiten ni se " +
          "escapan, y que un cambio mínimo en las condiciones iniciales lo cambia " +
          "todo: eso es el caos, sesenta años antes de que se llamara así.",
      ),
      p(
        "Fundó la topología algebraica con el <em>Analysis Situs</em>. También " +
          "escribió mucho para el público general, y desde ahí peleó con Cantor y " +
          "con los formalistas: para él la lógica no fundaba nada, la intuición " +
          "iba primero.",
      ),
    ],
    personal: [
      ["Nacimiento", "29 de abril de 1854, Nancy"],
      ["Fallecimiento", "17 de julio de 1912, París"],
      ["Nacionalidad", "Francia"],
      ["Instituciones", "Universidad de París, Escuela Politécnica"],
      ["Área", "Topología, mecánica celeste, análisis, física matemática"],
      ["Influencias", "Riemann, Hermite, Fuchs"],
    ],
    teoremas: [],
    conjeturas: {
      resueltas: [
        "<strong>Conjetura de Poincaré.</strong> Toda variedad de dimensión tres " +
          "cerrada y simplemente conexa es una esfera. La planteó en 1904 como " +
          "pregunta al final de un artículo; Perelman la demostró en 2003 y " +
          "rechazó tanto la medalla Fields como el millón de dólares del premio " +
          "del milenio.",
      ],
      abiertas: [],
    },
    libros: [
      { titulo: "Les Méthodes nouvelles de la mécanique céleste", anio: "1892" },
      { titulo: "La Science et l'Hypothèse", anio: "1902" },
      { titulo: "Leçons de mécanique céleste", anio: "1905" },
    ],
    articulos: [
      { titulo: "Analysis Situs", anio: "1895" },
      { titulo: "Sur le problème des trois corps et les équations de la dynamique", anio: "1890" },
    ],
    relaciones: ["cantor", "hilbert", "riemann", "cauchy"],
    materias: [],
  },

  {
    id: "kovalevskaya",
    nombre: "Sofia Kovalévskaya",
    modelo: "kovalevskaya",
    epoca: "1850 – 1891",
    nacionalidad: "Rusia",
    pais: "ru",
    resumen: "Primera mujer con cátedra de matemáticas en Europa",
    alta: "2026-08-06",
    biografia: [
      p(
        "Se casó por conveniencia para poder salir de Rusia a estudiar, porque a " +
          "una mujer soltera no la dejaban. En Berlín, la universidad no la " +
          "admitía a las clases, así que Weierstrass le dio las suyas en privado " +
          "durante cuatro años.",
      ),
      p(
        "En 1889 obtuvo la cátedra de Estocolmo: la primera mujer en Europa con " +
          "una plaza así. Un año antes había ganado el premio Bordin de la " +
          "Academia de París, que subieron de tres mil a cinco mil francos por lo " +
          "excepcional del trabajo. Murió de gripe a los cuarenta y uno.",
      ),
    ],
    personal: [
      ["Nacimiento", "15 de enero de 1850, Moscú"],
      ["Fallecimiento", "10 de febrero de 1891, Estocolmo"],
      ["Nacionalidad", "Rusia"],
      ["Instituciones", "Universidad de Estocolmo"],
      ["Área", "Ecuaciones en derivadas parciales, mecánica"],
      ["Maestro", "Karl Weierstrass"],
      ["Premios", "Premio Bordin, 1888"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Recuerdos de la infancia", anio: "1889" },
      { titulo: "Nihilistka", anio: "1892" },
    ],
    articulos: [
      { titulo: "Zur Theorie der partiellen Differentialgleichungen", anio: "1875" },
      { titulo: "Sur le problème de la rotation d'un corps solide", anio: "1889" },
    ],
    relaciones: ["cauchy", "noether", "poincare", "hipatia"],
    materias: [],
  },

  {
    id: "godel",
    nombre: "Kurt Gödel",
    modelo: "godel",
    epoca: "1906 – 1978",
    nacionalidad: "Austria",
    pais: "at",
    resumen: "Demostró que ningún sistema puede probarlo todo sobre sí mismo",
    alta: "2026-08-06",
    biografia: [
      p(
        "En 1931, con veinticinco años, publicó los dos teoremas que dejaron sin " +
          "salida el programa de Hilbert. La idea es una diagonal como la de " +
          "Cantor: numerar las fórmulas de modo que el sistema pueda hablar de sí " +
          "mismo, y construir una que diga «no soy demostrable».",
      ),
      p(
        "Emigró a Princeton en 1940 y allí fue amigo íntimo de Einstein, que " +
          "decía ir al instituto solo por el privilegio de volver a casa " +
          "caminando con él. Murió de inanición, convencido de que lo envenenaban.",
      ),
    ],
    personal: [
      ["Nacimiento", "28 de abril de 1906, Brno"],
      ["Fallecimiento", "14 de enero de 1978, Princeton"],
      ["Nacionalidad", "Austria, después Estados Unidos"],
      ["Instituciones", "Universidad de Viena, Instituto de Estudios Avanzados"],
      ["Área", "Lógica, fundamentos, teoría de conjuntos"],
      ["Influencias", "Hilbert, Russell, Carnap"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "The Consistency of the Continuum Hypothesis", anio: "1940" },
    ],
    articulos: [
      { titulo: "Über formal unentscheidbare Sätze der Principia Mathematica", anio: "1931" },
      { titulo: "Die Vollständigkeit der Axiome des logischen Funktionenkalküls", anio: "1930" },
      { titulo: "An example of a new type of cosmological solutions", anio: "1949" },
    ],
    relaciones: ["hilbert", "cantor", "turing", "neumann"],
    materias: [],
  },

  {
    id: "turing",
    nombre: "Alan Turing",
    modelo: "turing",
    epoca: "1912 – 1954",
    nacionalidad: "Inglaterra",
    pais: "en",
    resumen: "Definió qué es calcular, y de paso inventó el ordenador",
    alta: "2026-08-06",
    biografia: [
      p(
        "Para responder a la pregunta de Hilbert sobre si hay un procedimiento " +
          "mecánico que decida cualquier enunciado, tuvo primero que decir qué es " +
          "un procedimiento mecánico. Se inventó una máquina de papel —una cinta, " +
          "un cabezal, una tabla de reglas— y demostró que no existe tal " +
          "procedimiento.",
      ),
      p(
        "En Bletchley Park dirigió el ataque a Enigma; la Bombe que diseñó con " +
          "Welchman leía el tráfico naval alemán. En 1952 fue condenado por " +
          "homosexualidad y castrado químicamente. Murió dos años después por " +
          "envenenamiento con cianuro.",
      ),
    ],
    personal: [
      ["Nacimiento", "23 de junio de 1912, Londres"],
      ["Fallecimiento", "7 de junio de 1954, Wilmslow"],
      ["Nacionalidad", "Reino Unido"],
      ["Instituciones", "King's College de Cambridge, Princeton, Bletchley Park, Mánchester"],
      ["Área", "Lógica, computación, criptoanálisis, biología matemática"],
      ["Maestro", "Alonzo Church"],
      ["Influencias", "Gödel, Hilbert, von Neumann"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [],
    articulos: [
      { titulo: "On Computable Numbers, with an Application to the Entscheidungsproblem", anio: "1936" },
      { titulo: "Computing Machinery and Intelligence", anio: "1950" },
      { titulo: "The Chemical Basis of Morphogenesis", anio: "1952" },
    ],
    relaciones: ["godel", "hilbert", "neumann"],
    materias: [],
  },

  {
    id: "neumann",
    nombre: "John von Neumann",
    modelo: "neumann",
    epoca: "1903 – 1957",
    nacionalidad: "Hungría",
    pais: "hu",
    resumen: "Tocó todo lo que se dejaba tocar, y lo dejó fundado",
    alta: "2026-08-06",
    biografia: [
      p(
        "Niño prodigio en Budapest, ayudante de Hilbert en Gotinga a los " +
          "veintitrés. Axiomatizó la teoría de conjuntos, dio a la mecánica " +
          "cuántica su forma en espacios de Hilbert, fundó la teoría de juegos y " +
          "escribió el informe que fija cómo se organiza un ordenador: memoria " +
          "única para datos y programa.",
      ),
      p(
        "Cuando Gödel presentó su primer teorema en Königsberg, en 1930, fue el " +
          "único del auditorio que se dio cuenta al momento de lo que implicaba: " +
          "dedujo el segundo teorema por su cuenta y escribió a Gödel, que ya lo " +
          "tenía.",
      ),
    ],
    personal: [
      ["Nacimiento", "28 de diciembre de 1903, Budapest"],
      ["Fallecimiento", "8 de febrero de 1957, Washington"],
      ["Nacionalidad", "Hungría, después Estados Unidos"],
      ["Instituciones", "Gotinga, Berlín, Instituto de Estudios Avanzados, Los Álamos"],
      ["Área", "Lógica, análisis funcional, teoría de juegos, computación"],
      ["Maestro", "David Hilbert"],
      ["Influencias", "Hilbert, Gödel"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Mathematische Grundlagen der Quantenmechanik", anio: "1932" },
      { titulo: "Theory of Games and Economic Behavior", anio: "1944" },
      { titulo: "The Computer and the Brain", anio: "1958" },
    ],
    articulos: [
      { titulo: "Zur Theorie der Gesellschaftsspiele", anio: "1928" },
      { titulo: "First Draft of a Report on the EDVAC", anio: "1945" },
    ],
    relaciones: ["hilbert", "godel", "turing"],
    materias: [],
  },

  {
    id: "hardy",
    nombre: "Godfrey Harold Hardy",
    modelo: "hardy",
    epoca: "1877 – 1947",
    nacionalidad: "Inglaterra",
    pais: "en",
    resumen: "Puso el rigor continental en Inglaterra y trajo a Ramanujan",
    alta: "2026-08-06",
    biografia: [
      p(
        "En 1913 recibió una carta de un empleado de aduanas de Madrás con " +
          "fórmulas sin demostrar. Podía ser un chiflado; decidió que nadie " +
          "tendría imaginación para inventarse aquello, y trajo a Ramanujan a " +
          "Cambridge. Llamó a ese encuentro el único episodio romántico de su " +
          "vida.",
      ),
      p(
        "Con Littlewood formó la colaboración más productiva de la historia de " +
          "las matemáticas. En la <em>Apología</em> defiende que hace matemáticas " +
          "por su belleza y presume de que nada de lo suyo sirve para nada: la " +
          "teoría de números que él creía inútil es hoy la que cifra este sitio.",
      ),
    ],
    personal: [
      ["Nacimiento", "7 de febrero de 1877, Cranleigh"],
      ["Fallecimiento", "1 de diciembre de 1947, Cambridge"],
      ["Nacionalidad", "Reino Unido"],
      ["Instituciones", "Trinity College de Cambridge, Universidad de Oxford"],
      ["Área", "Teoría de números, análisis, series"],
      ["Colaboradores", "J. E. Littlewood, S. Ramanujan"],
    ],
    teoremas: [],
    conjeturas: {
      resueltas: [],
      abiertas: [
        "<strong>Conjetura de Hardy-Littlewood.</strong> Sus dos conjeturas sobre " +
          "la densidad de los primos gemelos y de los primos en progresiones " +
          "siguen abiertas, aunque el método del círculo con el que las atacaron " +
          "es hoy herramienta corriente.",
      ],
    },
    libros: [
      { titulo: "A Course of Pure Mathematics", anio: "1908" },
      { titulo: "An Introduction to the Theory of Numbers", anio: "1938" },
      { titulo: "A Mathematician's Apology", anio: "1940" },
    ],
    articulos: [
      { titulo: "Sur les zéros de la fonction ζ(s) de Riemann", anio: "1914" },
      { titulo: "Asymptotic formulae in combinatory analysis", anio: "1918" },
    ],
    relaciones: ["ramanujan", "riemann", "hilbert", "erdos"],
    materias: [],
  },

  /* ── Tercera tanda ──
     Los que faltaban por época y por sitio: la Antigüedad antes de Euclides, la
     India y Persia, el duelo del XVI por la cúbica, y las dos mujeres del XIX
     que trabajaron por correspondencia porque no las dejaban entrar. */

  {
    id: "tales",
    nombre: "Tales de Mileto",
    modelo: "tales",
    epoca: "c. 624 – c. 546 a.C.",
    nacionalidad: "Mileto, Jonia",
    pais: "gr",
    resumen: "El primero del que se dice que demostró algo",
    alta: "2026-08-06",
    biografia: [
      p(
        "Lo que lo separa de los egipcios y babilonios que sabían medir no es lo " +
          "que supo, sino cómo lo dijo: por primera vez alguien no se limita a " +
          "dar la receta, sino que argumenta por qué vale siempre. La geometría " +
          "deja de ser agrimensura y pasa a ser deducción.",
      ),
      p(
        "Se le atribuye haber predicho el eclipse del 585 a.C. y haber medido la " +
          "altura de la pirámide de Keops por su sombra, esperando la hora en que " +
          "la sombra de un hombre mide lo que el hombre.",
      ),
    ],
    personal: [
      ["Nacimiento", "c. 624 a.C., Mileto"],
      ["Fallecimiento", "c. 546 a.C., Mileto"],
      ["Nacionalidad", "Jonia, Grecia"],
      ["Área", "Geometría, astronomía, filosofía"],
      ["Discípulos", "Anaximandro, y por él Pitágoras"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [],
    articulos: [],
    relaciones: ["pitagoras", "euclides"],
    materias: [],
  },

  {
    id: "diofanto",
    nombre: "Diofanto de Alejandría",
    modelo: "diofanto",
    epoca: "siglo III",
    nacionalidad: "Alejandría, Egipto romano",
    pais: "eg",
    resumen: "Empezó a escribir el álgebra con símbolos, y dejó los problemas que Fermat leía",
    alta: "2026-08-06",
    biografia: [
      p(
        "De su vida solo queda un epigrama que cuenta su edad como un acertijo. " +
          "De su obra, seis de los trece libros de la <em>Aritmética</em>, una " +
          "colección de ciento treinta problemas con soluciones enteras o " +
          "racionales.",
      ),
      p(
        "Fue el primero en abreviar las incógnitas y las potencias con signos en " +
          "vez de palabras. El ejemplar de Bachet que Fermat tenía en su mesa es " +
          "donde este escribió, junto al problema octavo del libro segundo, que " +
          "tenía una demostración maravillosa que no cabía en el margen.",
      ),
    ],
    personal: [
      ["Actividad", "Alejandría, siglo III"],
      ["Nacionalidad", "Egipto romano"],
      ["Área", "Aritmética, ecuaciones indeterminadas"],
      ["Influencias", "Herón, tradición babilónica"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Aritmética", anio: "siglo III" },
      { titulo: "Sobre los números poligonales", anio: "siglo III" },
    ],
    articulos: [],
    relaciones: ["hipatia", "fermat", "juarismi"],
    materias: [],
  },

  {
    id: "brahmagupta",
    nombre: "Brahmagupta",
    modelo: "brahmagupta",
    epoca: "598 – c. 668",
    nacionalidad: "Bhillamala, India",
    pais: "in",
    resumen: "Escribió las reglas del cero y de los números negativos",
    alta: "2026-08-06",
    biografia: [
      p(
        "Dirigió el observatorio de Ujjain, el centro astronómico de la India. En " +
          "el <em>Brahmasphutasiddhanta</em>, de 628, aparecen por primera vez el " +
          "cero tratado como número —no como hueco— y las reglas de la suma y el " +
          "producto con deudas, que es como llamaba a los negativos.",
      ),
      p(
        "Se equivocó en una sola cosa, y es la que sigue costando: dijo que cero " +
          "dividido por cero es cero. Con todo lo demás acertó doce siglos antes " +
          "de que Europa lo aceptara.",
      ),
    ],
    personal: [
      ["Nacimiento", "598, Bhillamala"],
      ["Fallecimiento", "c. 668, Ujjain"],
      ["Nacionalidad", "India"],
      ["Instituciones", "observatorio de Ujjain"],
      ["Área", "Aritmética, álgebra, astronomía"],
      ["Influencias", "Aryabhata"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Brahmasphutasiddhanta", anio: "628" },
      { titulo: "Khandakhadyaka", anio: "665" },
    ],
    articulos: [],
    relaciones: ["juarismi", "khayyam", "fibonacci"],
    materias: [],
  },

  {
    id: "khayyam",
    nombre: "Omar Jayam",
    modelo: "khayyam",
    epoca: "1048 – 1131",
    nacionalidad: "Nishapur, Persia",
    pais: "ir",
    resumen: "Resolvió cúbicas cortando cónicas, y escribió los rubaiyat",
    alta: "2026-08-06",
    biografia: [
      p(
        "Clasificó las ecuaciones de tercer grado en catorce tipos y resolvió " +
          "cada uno geométricamente, cortando una parábola con una circunferencia " +
          "o con una hipérbola. Sabía que le faltaba la solución algebraica y dejó " +
          "dicho que quizá alguien la encontrara después: tardó cuatro siglos.",
      ),
      p(
        "Reformó el calendario persa con un año de 365,2424 días, más exacto que " +
          "el gregoriano que llegaría medio milenio después. En Occidente se le " +
          "conoce sobre todo por sus cuartetas.",
      ),
    ],
    personal: [
      ["Nacimiento", "18 de mayo de 1048, Nishapur"],
      ["Fallecimiento", "4 de diciembre de 1131, Nishapur"],
      ["Nacionalidad", "Persia selyúcida"],
      ["Instituciones", "observatorio de Isfahán"],
      ["Área", "Álgebra, geometría, astronomía, poesía"],
      ["Influencias", "al-Juarismi, Euclides, Apolonio"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Tratado sobre la demostración de problemas de álgebra", anio: "1070" },
      { titulo: "Comentarios sobre las dificultades de los postulados de Euclides", anio: "1077" },
      { titulo: "Rubaiyat", anio: "siglo XII" },
    ],
    articulos: [],
    relaciones: ["juarismi", "brahmagupta", "cardano"],
    materias: [],
  },

  {
    id: "tartaglia",
    nombre: "Niccolò Tartaglia",
    modelo: "tartaglia",
    epoca: "1500 – 1557",
    nacionalidad: "Brescia, Italia",
    pais: "it",
    resumen: "Resolvió la cúbica y perdió el pleito por contarlo",
    alta: "2026-08-06",
    biografia: [
      p(
        "De niño sobrevivió al saqueo de Brescia con la mandíbula partida por un " +
          "sable francés; de ahí el mote, el tartaja. Aprendió a leer solo y llegó " +
          "a profesor de matemáticas en Venecia.",
      ),
      p(
        "En 1535 ganó un duelo público resolviendo treinta cúbicas en dos horas. " +
          "Cardano le sacó el método bajo juramento de no publicarlo, y lo publicó " +
          "seis años después al descubrir que Del Ferro se le había adelantado " +
          "treinta años. Tartaglia se pasó el resto de su vida peleando por el " +
          "crédito.",
      ),
    ],
    personal: [
      ["Nacimiento", "1500, Brescia"],
      ["Fallecimiento", "13 de diciembre de 1557, Venecia"],
      ["Nacionalidad", "República de Venecia"],
      ["Área", "Álgebra, balística, traducción"],
      ["Rival", "Gerolamo Cardano"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Nova Scientia", anio: "1537" },
      { titulo: "Quesiti et inventioni diverse", anio: "1546" },
      { titulo: "General Trattato di numeri et misure", anio: "1556" },
    ],
    articulos: [],
    relaciones: ["cardano", "fibonacci", "khayyam"],
    materias: [],
  },

  {
    id: "viete",
    nombre: "François Viète",
    modelo: "viete",
    epoca: "1540 – 1603",
    nacionalidad: "Francia",
    pais: "fr",
    resumen: "Puso letras donde antes había palabras",
    alta: "2026-08-06",
    biografia: [
      p(
        "Abogado y consejero de Enrique IV, hacía matemáticas en el tiempo libre. " +
          "Su idea es la que cambia todo: usar vocales para las incógnitas y " +
          "consonantes para las cantidades conocidas. Con eso una ecuación deja de " +
          "ser un problema concreto y pasa a ser una forma que se manipula.",
      ),
      p(
        "Descifró para la corona francesa el código español de quinientos signos. " +
          "Felipe II, convencido de que era indescifrable, acusó a Francia de " +
          "brujería ante el Papa.",
      ),
    ],
    personal: [
      ["Nacimiento", "1540, Fontenay-le-Comte"],
      ["Fallecimiento", "23 de febrero de 1603, París"],
      ["Nacionalidad", "Francia"],
      ["Instituciones", "corte de Enrique IV"],
      ["Área", "Álgebra, trigonometría, criptoanálisis"],
      ["Influencias", "Diofanto, Cardano"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "In artem analyticem isagoge", anio: "1591" },
      { titulo: "Canon mathematicus", anio: "1579" },
    ],
    articulos: [],
    relaciones: ["descartes", "fermat", "cardano"],
    materias: [],
  },

  {
    id: "napier",
    nombre: "John Napier",
    modelo: "napier",
    epoca: "1550 – 1617",
    nacionalidad: "Escocia",
    pais: "sco",
    resumen: "Convirtió las multiplicaciones en sumas",
    alta: "2026-08-06",
    biografia: [
      p(
        "Terrateniente escocés que dedicó veinte años a construir sus tablas. La " +
          "idea es que si se escribe cada número como una potencia de una base " +
          "fija, multiplicar es sumar los exponentes. Con eso un cálculo " +
          "astronómico que llevaba un mes pasaba a llevar un día.",
      ),
      p(
        "Laplace dijo que los logaritmos, al acortar el trabajo, le habían " +
          "doblado la vida al astrónomo. Napier, mientras tanto, se tenía por " +
          "teólogo: el libro del que estaba orgulloso era su comentario del " +
          "Apocalipsis.",
      ),
    ],
    personal: [
      ["Nacimiento", "1550, Merchiston, Edimburgo"],
      ["Fallecimiento", "4 de abril de 1617, Edimburgo"],
      ["Nacionalidad", "Escocia"],
      ["Área", "Aritmética, cálculo mecánico, teología"],
      ["Colaborador", "Henry Briggs"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Mirifici logarithmorum canonis descriptio", anio: "1614" },
      { titulo: "Rabdologiae", anio: "1617" },
      { titulo: "A Plaine Discovery of the Whole Revelation of St. John", anio: "1593" },
    ],
    articulos: [],
    relaciones: ["kepler", "euler", "laplace"],
    materias: [],
  },

  {
    id: "weierstrass",
    nombre: "Karl Weierstrass",
    modelo: "weierstrass",
    epoca: "1815 – 1897",
    nacionalidad: "Prusia, Alemania",
    pais: "de",
    resumen: "El padre del análisis moderno, y quien enseñó a Kovalévskaya",
    alta: "2026-08-06",
    biografia: [
      p(
        "Pasó quince años de maestro de instituto —daba gimnasia y caligrafía " +
          "además de matemáticas— publicando de vez en cuando en la revista del " +
          "colegio. Un artículo sobre funciones abelianas en 1854 le valió el " +
          "doctorado honoris causa y, en dos años, una cátedra en Berlín.",
      ),
      p(
        "Es quien dejó el análisis en su forma actual: la definición de límite " +
          "con épsilon y delta es suya. Dio clases particulares durante cuatro " +
          "años a Sofia Kovalévskaya, a la que la universidad no admitía, y peleó " +
          "por su doctorado.",
      ),
    ],
    personal: [
      ["Nacimiento", "31 de octubre de 1815, Ostenfelde"],
      ["Fallecimiento", "19 de febrero de 1897, Berlín"],
      ["Nacionalidad", "Prusia"],
      ["Instituciones", "Universidad de Berlín"],
      ["Área", "Análisis, funciones elípticas y abelianas"],
      ["Discípulos", "Kovalévskaya, Cantor, Frobenius, Schwarz"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Mathematische Werke", anio: "1894" },
    ],
    articulos: [
      { titulo: "Zur Theorie der Abelschen Functionen", anio: "1854" },
      { titulo: "Über continuirliche Functionen eines reellen Arguments", anio: "1872" },
    ],
    relaciones: ["kovalevskaya", "cantor", "riemann", "cauchy"],
    materias: [],
  },

  {
    id: "germain",
    nombre: "Sophie Germain",
    modelo: "germain",
    epoca: "1776 – 1831",
    nacionalidad: "Francia",
    pais: "fr",
    resumen: "Escribió a Gauss firmando como hombre para que la leyeran",
    alta: "2026-08-06",
    biografia: [
      p(
        "Aprendió sola en la biblioteca de su padre mientras la Revolución la " +
          "tenía encerrada en casa. Como a las mujeres no se les permitía entrar " +
          "en la Politécnica, consiguió los apuntes y mandó sus trabajos firmando " +
          "como Monsieur Le Blanc, un alumno que había dejado la escuela.",
      ),
      p(
        "Así se carteó con Lagrange y con Gauss durante años. Cuando en 1806 " +
          "temió por la vida de Gauss durante la ocupación de Brunswick y pidió " +
          "que lo protegieran, este descubrió quién era en realidad; le contestó " +
          "que el valor de sobreponerse a todo aquello la ponía por encima de " +
          "cualquiera.",
      ),
    ],
    personal: [
      ["Nacimiento", "1 de abril de 1776, París"],
      ["Fallecimiento", "27 de junio de 1831, París"],
      ["Nacionalidad", "Francia"],
      ["Área", "Teoría de números, elasticidad"],
      ["Correspondencia", "Gauss, Lagrange, Legendre"],
      ["Premios", "Premio de la Academia de Ciencias, 1816"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Recherches sur la théorie des surfaces élastiques", anio: "1821" },
      { titulo: "Considérations générales sur l'état des sciences", anio: "1833" },
    ],
    articulos: [],
    relaciones: ["gauss", "legendre", "lagrange", "fermat"],
    materias: [],
  },

  {
    id: "lovelace",
    nombre: "Ada Lovelace",
    modelo: "lovelace",
    epoca: "1815 – 1852",
    nacionalidad: "Inglaterra",
    pais: "en",
    resumen: "Escribió el primer programa para una máquina que no llegó a existir",
    alta: "2026-08-06",
    biografia: [
      p(
        "Hija de Byron, a quien no llegó a conocer, y educada en matemáticas por " +
          "decisión de su madre, que temía la vena poética del padre. A los " +
          "diecisiete conoció a Babbage y su máquina diferencial.",
      ),
      p(
        "Al traducir un artículo italiano sobre la máquina analítica añadió unas " +
          "notas que ocupan el triple que el original. En la nota G está el " +
          "algoritmo para calcular los números de Bernoulli con la máquina, y en " +
          "las anteriores la idea que Babbage no llegó a formular: que aquello no " +
          "servía solo para números, sino para cualquier cosa que se pudiera " +
          "representar con símbolos.",
      ),
    ],
    personal: [
      ["Nacimiento", "10 de diciembre de 1815, Londres"],
      ["Fallecimiento", "27 de noviembre de 1852, Londres"],
      ["Nacionalidad", "Reino Unido"],
      ["Área", "Cálculo mecánico, análisis"],
      ["Maestros", "Augustus De Morgan, Mary Somerville"],
      ["Colaborador", "Charles Babbage"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [],
    articulos: [
      { titulo: "Notes to the Sketch of the Analytical Engine", anio: "1843" },
    ],
    relaciones: ["turing", "faraday", "bernoulli"],
    materias: [],
  },

  {
    id: "kolmogorov",
    nombre: "Andréi Kolmogórov",
    modelo: "kolmogorov",
    epoca: "1903 – 1987",
    nacionalidad: "Rusia",
    pais: "ru",
    resumen: "Le dio axiomas a la probabilidad",
    alta: "2026-08-06",
    biografia: [
      p(
        "En 1933, con treinta años, publicó un librito de setenta páginas que " +
          "define la probabilidad como una medida sobre un espacio: sucesos, una " +
          "sigma-álgebra y una función que suma uno. Con eso la probabilidad dejó " +
          "de ser un arte de contar casos y pasó a ser una rama del análisis.",
      ),
      p(
        "Trabajó además en turbulencia, en sistemas dinámicos y en teoría de la " +
          "información, y dedicó los últimos años a la enseñanza secundaria: " +
          "montó internados para chicos con talento a los que daba clase él " +
          "mismo.",
      ),
    ],
    personal: [
      ["Nacimiento", "25 de abril de 1903, Tambov"],
      ["Fallecimiento", "20 de octubre de 1987, Moscú"],
      ["Nacionalidad", "Unión Soviética"],
      ["Instituciones", "Universidad Estatal de Moscú"],
      ["Área", "Probabilidad, turbulencia, complejidad, topología"],
      ["Discípulos", "Arnold, Sinái, Gelfand"],
    ],
    teoremas: [],
    conjeturas: { resueltas: [], abiertas: [] },
    libros: [
      { titulo: "Grundbegriffe der Wahrscheinlichkeitsrechnung", anio: "1933" },
      { titulo: "Elementos de la teoría de funciones y del análisis funcional", anio: "1954" },
    ],
    articulos: [
      { titulo: "Local structure of turbulence in incompressible fluid", anio: "1941" },
      { titulo: "Three approaches to the definition of the quantity of information", anio: "1965" },
    ],
    relaciones: ["poincare", "neumann", "hilbert", "bernoulli"],
    materias: [],
  },

  {
    id: "erdos",
    nombre: "Paul Erdős",
    modelo: "erdos",
    epoca: "1913 – 1996",
    nacionalidad: "Hungría",
    pais: "hu",
    resumen: "Sin casa ni puesto fijo, escribió mil quinientos artículos con quinientos coautores",
    alta: "2026-08-06",
    biografia: [
      p(
        "Vivió sesenta años de maleta, yendo de casa en casa de otros " +
          "matemáticos: aparecía diciendo «mi cerebro está abierto», se quedaba " +
          "unos días, dejaba un artículo escrito y se iba al siguiente. No tuvo " +
          "casa, ni familia, ni un puesto estable.",
      ),
      p(
        "De ahí sale el número de Erdős: uno si has firmado con él, dos si has " +
          "firmado con alguien que firmó con él. Ofrecía premios en metálico por " +
          "los problemas que proponía, de veinticinco dólares a diez mil según lo " +
          "duros que los creyera.",
      ),
    ],
    personal: [
      ["Nacimiento", "26 de marzo de 1913, Budapest"],
      ["Fallecimiento", "20 de septiembre de 1996, Varsovia"],
      ["Nacionalidad", "Hungría"],
      ["Instituciones", "ninguna fija"],
      ["Área", "Teoría de números, combinatoria, teoría de grafos"],
      ["Colaboradores", "más de quinientos"],
      ["Premios", "Premio Wolf, 1983"],
    ],
    teoremas: [],
    conjeturas: {
      resueltas: [],
      abiertas: [
        "<strong>Conjetura de Erdős sobre progresiones aritméticas.</strong> Si " +
          "la suma de los inversos de un conjunto de enteros diverge, el conjunto " +
          "contiene progresiones aritméticas de cualquier longitud. Ofreció por " +
          "ella cinco mil dólares y sigue abierta; el caso de los primos lo " +
          "resolvieron Green y Tao en 2004.",
      ],
    },
    libros: [
      { titulo: "The Probabilistic Method", anio: "1992" },
      { titulo: "Topics in the Theory of Numbers", anio: "1954" },
    ],
    articulos: [
      { titulo: "On a new method in elementary number theory", anio: "1949" },
      { titulo: "On random graphs I, con Rényi", anio: "1959" },
    ],
    relaciones: ["hardy", "ramanujan", "neumann", "kolmogorov"],
    materias: [],
  },
];

module.exports = { matematicos };
