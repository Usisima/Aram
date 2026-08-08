/**
 * Genera las páginas de contenido a partir de los datos de contenido/.
 *
 *     node generar.js && node construir.js
 *
 * Lo primero escribe el HTML con las fórmulas en LaTeX; lo segundo las compone.
 * Son dos cosas distintas: esto arma las páginas, aquello las deja listas para
 * el navegador.
 *
 * El armazón (cabecera, migas, pie) vive aquí y en un solo sitio. Escribir a
 * mano treinta y tantas páginas con la misma cabecera acaba siempre igual: una
 * se queda sin actualizar cuando cambia algo del <head>.
 */

const fs = require("fs");
const path = require("path");

const { matematicos } = require("./contenido/matematicos.js");
const { materias, libros: CATALOGO } = require("./contenido/materias.js");

/**
 * Los aportes que se añaden desde el taller (herramientas/editor).
 *
 * Van en un JSON aparte y no en matematicos.js a propósito: el editor escribe
 * datos, nunca código. Si escribiera el .js, una coma de más dejaría el sitio
 * sin poder generarse; así lo peor que puede pasar es que un aporte salga raro.
 *
 * Cada uno lleva su ruta —materia, tema, capítulo— y el autor que lo firma, y
 * se cuela en la sección de aportes de ese autor como uno más. La ruta se
 * escribe debajo del enunciado, en pequeño: es lo que dice de dónde sale ese
 * resultado dentro del temario.
 */
/**
 * Los aportes del taller que llevan firma, colgados de su matemático.
 *
 * Elegir a alguien como autor es decir que el resultado es suyo, y eso lo pone
 * en su página. Es la única forma de que aparezca ahí: las fichas ya no llevan
 * aportes escritos aparte, para no tener el mismo enunciado en dos sitios que
 * se contradicen.
 */
function aportesDelTaller() {
  let extra = [];
  try {
    extra = JSON.parse(fs.readFileSync("contenido/aportes.json", "utf8"));
  } catch (e) {
    return;
  }
  for (const a of extra) {
    if (!a.nombre || !a.autor) continue;
    const suyo = matematicos.find((m) => m.id === a.autor);
    if (!suyo) continue;
    suyo.teoremas.push({
      nombre: a.nombre,
      enunciado: `        ${a.latex || a.problema || ""}`,
    });
  }
}

aportesDelTaller();

/* Nombre de archivo de la ficha de un matemático. En un solo sitio: los datos
   enlazan unos con otros y la convención tiene que ser la misma en todos. */
const MATES = "matematicas/matematicos";
const MATERIAS = "matematicas/materias";

const ficha = (id) => `${MATES}/${id}.html`;
const aportes = (id) => `${MATES}/${id}-aportes.html`;
const materia = (id) => `${MATERIAS}/${id}/index.html`;
/* Un libro tiene UNA página, aunque lo usen tres materias: es el mismo libro y
   lo que se demuestre de él se lee igual desde cualquiera de ellas. Por eso
   cuelga de `libros/` y no de dentro de una materia. */
const libro = (libroId) => `matematicas/libros/${libroId}.html`;

/* Cuántos aportes caben en la ficha antes de cortar. La ficha es una
   presentación, no un compendio: quien llega quiere ver quién fue y de qué se
   le conoce, y una columna de recuadros de enunciado empuja hacia abajo la
   bibliografía y las relaciones hasta dejarlas fuera de alcance. Los que no
   caben no se pierden, se van a su propia página. */
const APORTES_FICHA = 3;

/**
 * Las fuentes de KaTeX que va a necesitar una página, si es que necesita alguna.
 *
 * Se piden por adelantado porque, si no, no se piden hasta que se pinta la
 * primera fórmula —y una fórmula dentro de un tema plegado no se pinta hasta que
 * alguien lo abre—. Llegando tarde, cambian las medidas de lo que ya estaba
 * colocado: el panel crecía media celda con la animación terminada.
 *
 * Solo las que hagan falta: las dos primeras en cuanto hay matemáticas, y las
 * demás donde salgan sus símbolos. Precargar las trece en todas las páginas
 * serían doscientos kilos para enseñar un retrato.
 */
const FUENTES_MATE = [
  [/\$/, "KaTeX_Main-Regular"],
  [/\$/, "KaTeX_Math-Italic"],
  [/\\mathbb|\\N\b|\\Z\b/, "KaTeX_AMS-Regular"],
  [/\\mathcal/, "KaTeX_Caligraphic-Regular"],
  [/\\sqrt|\\left|\\big/, "KaTeX_Size1-Regular"],
  [/\\mathbf|\\textbf/, "KaTeX_Main-Bold"],
];

const fuentesDe = (cuerpo) =>
  FUENTES_MATE.filter(([donde]) => donde.test(cuerpo)).map(([, cual]) => cual);

/**
 * La marca del sitio, en tinta plana.
 *
 * Es el mismo dibujo que se traza en la intro y que hace de icono en la pestaña.
 * Aquí va sin el cuadro negro que lleva el icono y sin color propio: hereda el
 * del texto, así que sirve igual en papel blanco que en negro.
 */
const MARCA = `<svg class="marca-dibujo" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M 63.842 115.389 C 57.327 117.144, 48.389 122.749, 44.404 127.580 C 38.264 135.022, 36.541 140.254, 36.525 151.500 C 36.513 160.174, 36.853 162.230, 39.088 167.006 C 42.363 174.001, 47.018 178.651, 53.994 181.894 C 58.600 184.035, 60.974 184.457, 68.518 184.477 C 76.661 184.498, 78.164 184.191, 84.018 181.309 C 89.897 178.416, 102.160 167.533, 107.466 160.500 C 108.961 158.519, 108.993 158.523, 110.879 160.932 C 113.254 163.965, 115.418 169.274, 122.526 189.500 C 128.675 207, 135.975 223.179, 141.108 230.687 C 142.918 233.334, 146.836 237.854, 149.814 240.731 C 152.840 243.654, 155.004 246.548, 154.718 247.291 C 154.438 248.023, 152.249 249.202, 149.854 249.911 C 137.641 253.531, 122.806 263.044, 111.328 274.614 C 97.647 288.406, 91.504 298.252, 79.087 326.291 C 67.184 353.170, 62.249 362.566, 57.049 368.256 C 51.078 374.789, 47.261 376.508, 35.363 378.019 C 20.660 379.888, 22 378.935, 22 387.519 L 22 395 74.364 395 L 126.728 395 134.475 372.250 C 149.168 329.099, 162.325 299.149, 171.704 287.500 C 180.949 276.018, 194.239 269.481, 210.750 268.296 L 219 267.703 219 312.802 C 219 341.554, 218.605 359.742, 217.911 362.980 C 215.529 374.085, 210.194 376.745, 184.750 379.517 L 179 380.144 179 387.572 L 179 395 252.542 395 L 326.084 395 325.792 387.250 L 325.500 379.500 319 378.850 C 311.563 378.106, 300.843 375.487, 296.913 373.455 C 293.139 371.504, 289.256 366.584, 288.044 362.219 C 287.404 359.914, 287.009 341.245, 287.006 313.102 L 287 267.705 295.250 268.357 C 311.342 269.630, 320.533 273.405, 329.542 282.440 C 341.514 294.447, 352.376 317.802, 367.938 365 L 377.665 394.500 430.332 394.759 L 483 395.018 483 387.528 C 483 378.943, 484.251 379.859, 470 378.003 C 459.822 376.677, 452.247 373.306, 447.939 368.186 C 444.481 364.076, 434.747 344.668, 424.074 320.602 C 411.446 292.131, 399.020 275.727, 379.500 261.762 C 373.457 257.438, 362.102 251.677, 356.146 249.911 C 353.751 249.202, 351.564 248.027, 351.285 247.300 C 351.006 246.573, 353.714 242.867, 357.302 239.063 C 367.929 227.797, 374.936 214.019, 384.833 184.923 C 389.789 170.352, 394.026 160.720, 396.021 159.487 C 396.604 159.127, 398.032 160.108, 399.195 161.666 C 404.116 168.261, 416.078 178.897, 421.644 181.626 C 426.773 184.141, 428.617 184.498, 436.500 184.499 C 444.335 184.500, 446.238 184.137, 451.203 181.700 C 454.501 180.080, 458.793 176.800, 461.382 173.920 C 467.378 167.251, 469.488 160.898, 469.495 149.500 C 469.499 141.848, 469.103 139.654, 466.852 134.852 C 462.270 125.079, 453.948 118.417, 442.500 115.359 C 439.750 114.625, 432.854 114.018, 427.176 114.012 C 407.150 113.989, 392.424 121.737, 380.359 138.646 C 374.244 147.214, 370.200 156.413, 362.136 180.091 C 350.990 212.817, 345.978 222.156, 332.076 236.098 C 321.899 246.304, 317.222 248.138, 299.750 248.773 L 287 249.236 287.006 200.868 C 287.009 170.202, 287.395 151.118, 288.060 148.723 C 289.935 141.972, 294.032 138.480, 302.880 136.093 C 307.204 134.926, 314.062 133.641, 318.121 133.236 L 325.500 132.500 325.792 124.750 L 326.084 117 252.542 117 L 179 117 179 124.481 C 179 131.439, 179.157 131.993, 181.250 132.411 C 206.882 137.528, 215.680 142.227, 217.920 152 C 218.546 154.735, 218.961 174.644, 218.976 202.750 L 219 249 208.250 248.988 C 190.864 248.969, 182.981 245.925, 172.940 235.354 C 160.765 222.535, 152.826 207.318, 142.497 177 C 138.844 166.275, 134.077 153.863, 131.905 149.417 C 123.452 132.120, 109.317 119.584, 93.500 115.359 C 87.276 113.697, 70.063 113.714, 63.842 115.389" /></svg>`;

function plantilla({ titulo, miga, cuerpo, visor, favoritos }) {
  /* Si hay algo que plegar, se carga lo que lo anima. Se mira el cuerpo en vez
     de pasarlo a mano: apuntarlo página por página se olvidaba —los teoremas y
     los temas se añadieron después y abrían de golpe— y aquí no hay nada que
     acordarse de marcar. */
  const despliegue = cuerpo.indexOf("<details") >= 0;
  const migas = miga
    .map((m, i) => {
      const sep = i ? '\n        <span class="sep">/</span>\n        ' : "";
      /* El primer nivel es siempre la portada: ahí va la marca en vez de la
         palabra, que es donde se pulsa para volver a casa. */
      if (i === 0 && m.href)
        return `<a class="marca" href="${m.href}" aria-label="${m.texto}">${MARCA}</a>`;
      return (
        sep +
        (m.href
          ? `<a href="${m.href}">${m.texto}</a>`
          : `<span class="actual">${m.texto}</span>`)
      );
    })
    .join("");

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${titulo} · Aram</title>
    <link rel="icon" href="assets/favicon.svg" />
    <link rel="manifest" href="manifest.json" />
    <link rel="apple-touch-icon" href="assets/icono-192.png" />
    <meta name="theme-color" content="#e8e8e8" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
    <meta name="color-scheme" content="light dark" />
    <link rel="preload" href="assets/fuentes/artemisia-400.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="assets/fuentes/artemisia-700.woff2" as="font" type="font/woff2" crossorigin />${fuentesDe(
      cuerpo,
    )
      .map(
        (f) =>
          `\n    <link rel="preload" href="assets/katex/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin />`,
      )
      .join("")}
    <link rel="stylesheet" href="estilos.css" />
    <link rel="stylesheet" href="assets/katex/katex.min.css" />
    <script src="assets/tema.js"></script>
    <script defer src="assets/sinred.js"></script>
    <script src="assets/rejilla.js"></script>${
      despliegue
        ? '\n    <script defer src="assets/desplegable.js"></script>'
        : ""
    }${
      visor
        ? '\n    <script defer src="assets/voxel3d/three.min.js"></script>' +
          '\n    <script defer src="assets/voxel3d.js"></script>'
        : ""
    }${
      /* Sin `defer`, y a propósito: es quien decide QUÉ tarjetas lleva el
         carrusel. Aplazado, la página llegaba a pintar las veintidós de la
         plantilla y un instante después saltaban a ser otras. */
      favoritos ? '\n    <script src="assets/favoritos.js"></script>' : ""
    }
  </head>
  <body>
    <script src="assets/intro.js"></script>

    <div class="envoltorio">
      <nav class="miga">
        ${migas}
      </nav>

      <main>
${cuerpo}
      </main>

      <footer class="pie">
        <a class="marca" href="index.html" aria-label="Inicio">${MARCA}</a>
        <span>Aram</span>
      </footer>
    </div>
  </body>
</html>
`;
}

/**
 * Los enlaces de una página, contados desde donde está esa página.
 *
 * Todo el generador escribe las rutas desde la raíz del sitio —`assets/tema.js`,
 * `matematicas/materias/calculo1/index.html`— porque así se leen y así se
 * comparan. Lo que cambia de una página a otra es cuántos `../` hay que subir
 * para llegar a esa raíz, y eso se sabe al escribirla: una sola pasada aquí en
 * vez de un prefijo repetido en cada `href`.
 *
 * No se tocan las direcciones de fuera, las anclas ni lo que ya sube por su
 * cuenta.
 */
const DE_FUERA = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#|\.\.\/)/i;

/**
 * `ficha:euler` dentro de un texto → la página de Euler, esté donde esté.
 *
 * En la biografía de uno se nombra a otro y se enlaza. Escribir ahí la ruta a
 * mano ataba el texto a cómo estaban ordenados los archivos, y al ordenarlos de
 * otra manera esos dos enlaces se quedaron señalando al vacío sin que nada
 * fallara al construir.
 */
function conFichas(html) {
  return html.replace(/ficha:([a-z0-9-]+)/g, (todo, id) =>
    porId[id] ? ficha(id) : todo,
  );
}

function conRaiz(html, raiz) {
  return html
    .replace(/\b(href|src)="([^"]+)"/g, (todo, atributo, url) =>
      DE_FUERA.test(url) ? todo : `${atributo}="${raiz}${url}"`)
    .replace(/url\(([^)"']+)\)/g, (todo, url) =>
      DE_FUERA.test(url) ? todo : `url(${raiz}${url})`);
}

/** Mete n espacios delante de cada línea que tenga algo. */
const sangrar = (texto, n) => texto.replace(/^(?=[^\n])/gm, " ".repeat(n));

/**
 * Un desplegable: la pastilla que se ve siempre y, colgando de ella, la
 * demostración entera.
 *
 * Solo texto: la proposición y su familia debajo. Antes llevaba la carátula de
 * un disco a la izquierda y una flecha a la derecha; se quitaron los dos porque
 * no decían nada que el texto no dijera ya. El número no se pasa — lo pone un
 * contador de CSS, así la numeración se mantiene sola aunque se añadan o quiten
 * demostraciones.
 *
 * Es un <details> de verdad y no un <div> con un `click` encima: así abre y
 * cierra sin JavaScript, responde al teclado y el navegador ya sabe que hay
 * algo plegado. assets/desplegable.js solo le añade la transición de alto y el
 * recuadre contra la rejilla.
 */
function desplegable({ id, titulo, sub, numerada, cuerpo }) {
  const num = numerada
    ? '\n                <span class="pastilla-num"></span>'
    : "";

  return `          <li>
            <details class="demo" id="${id}">
              <summary class="pastilla">
                <span class="pastilla-texto">
                  <span class="pastilla-titulo">${titulo}</span>
                  ${sub ? `<span class="pastilla-sub">${sub}</span>` : ""}
                </span>${num}
              </summary>
              <div class="demo-cuerpo">
                <div class="dentro">
${sangrar(cuerpo, 10)}
                </div>
              </div>
            </details>
          </li>`;
}

/**
 * Portadas de libro: un rectángulo de color macizo con el título dentro.
 *
 * No hay cubiertas escaneadas de nada, y no las va a haber: una lista de
 * títulos en texto se lee mal y se recuerda peor, mientras que un lomo de color
 * con su título se reconoce de un vistazo. El tono sale del propio título, así
 * que un libro tiene siempre el mismo y dos seguidos nunca coinciden.
 *
 * `carrusel` los pone en fila para pasarlos con el dedo; sin eso se reparten en
 * cuadrícula, que es lo que quiere un índice.
 */
function portadas(obras, disposicion) {
  return [
    `        <ul class="libros${disposicion === "carrusel" ? " libros-fila" : ""}">`,
    ...obras.map((o) => {
      /* Suma de los códigos del título: determinista y suficiente para
         repartir doce tonos sin que dos vecinos se repitan. */
      let n = 0;
      for (const c of o.titulo) n = (n * 31 + c.charCodeAt(0)) % 1000;

      /* Con `href`, la portada es el enlace a la página del libro; sin él se
         queda en una lámina que no lleva a ningún sitio, que es lo que
         corresponde a un libro del que no hay nada escrito. */
      const abre = o.href ? `<a class="libro" href="${o.href}"` : '<article class="libro"';
      const cierra = o.href ? "</a>" : "</article>";

      /* El pie: quién lo escribió y de cuándo es. En la bibliografía de una
         materia el autor es lo que distingue dos libros del mismo asunto; en la
         ficha de un matemático sobra, porque el autor es él. */
      const pie = [o.autor, o.anio].filter(Boolean).join(" · ");

      return [
        "          <li>",
        `            ${abre} style="--tono: ${n % 12}">`,
        '              <span class="libro-tapa">',
        '                <span class="libro-filete"></span>',
        `                <span class="libro-titulo">${o.titulo}</span>`,
        '                <span class="libro-filete"></span>',
        "              </span>",
        pie ? `              <span class="libro-pie">${pie}</span>` : "",
        `            ${cierra}`,
        "          </li>",
      ]
        .filter(Boolean)
        .join("\n");
    }),
    "        </ul>",
  ].join("\n");
}

function enunciado({ etiqueta, titulo, cuerpo, id }) {
  return `        <fieldset class="enunciado"${id ? ` id="${id}"` : ""}>
          <legend class="etiqueta">${etiqueta}</legend>
${titulo ? `          <p>${titulo}</p>\n` : ""}${cuerpo}
        </fieldset>`;
}

/**
 * El rótulo de un recuadro: la etiqueta puesta a mano y el nombre.
 *
 * La etiqueta es para numerar —«P1», «Teorema 1.4»—, y va delante porque es por
 * donde se busca. Si no hay, manda el nombre y no se nota que existe el campo.
 */
const rotulo = (cosa) =>
  [cosa.etiqueta || mayuscula(cosa.tipo), cosa.nombre].filter(Boolean).join(" · ");

/** Con mayúscula inicial: los tipos se guardan en minúscula y se leen aquí. */
const mayuscula = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : "");

/**
 * Dónde se lee cada entrada del sitio: su página y su ancla.
 *
 * Se llena una vez montadas las materias y sirve para los enlaces entre
 * resultados. Si un id está en un libro y en la general, gana el libro: es
 * donde está escrito.
 */
const DONDE_ESTA = new Map();

function apuntarDonde() {
  for (const m of materias) {
    for (const s of ["definiciones", "teoremas", "ejercicios", "articulos"])
      for (const e of m[s] || [])
        if (e && e.id)
          DONDE_ESTA.set(e.id, { href: `${materia(m.id)}#${e.id}`, donde: m.nombre, cosa: e });
  }
  for (const [id, l] of Object.entries(CATALOGO))
    for (const s of ["definiciones", "demostraciones"])
      for (const e of l[s] || [])
        if (e && e.id)
          DONDE_ESTA.set(e.id, { href: `${libro(id)}#${e.id}`, donde: l.titulo, cosa: e });
}

/**
 * «También demostrado en …» — los enlaces que se hayan atado a mano.
 *
 * No se adivinan por parecido de nombre a propósito: dos resultados con el
 * mismo título no tienen por qué ser el mismo, y uno inventado manda a leer una
 * demostración de otra cosa. Se atan desde el taller y solo desde ahí.
 */
function tambienEn(cosa) {
  const puestos = (cosa.enlaces || [])
    .map((id) => DONDE_ESTA.get(id))
    .filter(Boolean);
  if (!puestos.length) return [];
  const cuales = puestos
    .map((d) => `<a href="${d.href}">${d.donde}</a>`)
    .join(", ");
  return [`        <p class="tambien">También en ${cuales}</p>`, ""];
}

const MIGA_BASE = [
  { texto: "Inicio", href: "index.html" },
  { texto: "Matemáticas", href: "matematicas/index.html" },
  { texto: "Materias", href: `${MATERIAS}/index.html` },
];

const paginas = [];

/* ── Matemáticos ──
   Un índice con el carrusel de caras y una ficha por persona. Las caras son
   retratos horneados (herramientas/voxel/retratos.mjs); el modelo en vivo solo
   se monta en la ficha, que es donde hay uno solo. */

const M_MATES = [...MIGA_BASE.slice(0, 2), { texto: "Matemáticos", href: `${MATES}/index.html` }];

/**
 * Tarjetas: una imagen, un título y una línea debajo.
 *
 * Dos disposiciones. `carrusel` las pone en fila y se pasan con el dedo — sirve
 * de asomo. `rejilla` las reparte en cuadrícula y las enseña todas, que es lo
 * que quiere un índice.
 */
function tarjetas(items, disposicion, limite) {
  return [
    `        <ul class="caras${disposicion === "rejilla" ? " caras-rejilla" : ""}"` +
      `${limite ? ` data-limite="${limite}"` : ""}>`,
    ...items.map((t) => {
      const estilo = t.fondo ? ` style="--bandera: url(${t.fondo})"` : "";
      const dentro = [
        /* La foto va en su propia caja: la bandera es el fondo de ESA caja, no
           de la tarjeta entera, así no se mete debajo de la franja del nombre. */
        `              <span class="cara-foto"${estilo}>`,
        `                <img class="cara-retrato" src="${t.img}" alt="" width="256" height="256" decoding="async" />`,
        "              </span>",
        '              <span class="cara-pie">',
        `                <span class="cara-nombre">${t.titulo}</span>`,
        t.sub ? `                <span class="cara-dato">${t.sub}</span>` : "",
        "              </span>",
      ]
        .filter(Boolean)
        .join("\n");

      const busca = t.busca
        ? ` data-busca="${t.busca.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/"/g, "")}"`
        : "";

      return [
        t.id ? `          <li data-id="${t.id}"${busca}>` : "          <li>",
        t.href
          ? `            <a href="${t.href}">`
          : '            <span class="pendiente">',
        dentro,
        t.href ? "            </a>" : "            </span>",
        "          </li>",
      ].join("\n");
    }),
    "        </ul>",
  ].join("\n");
}

/**
 * Caras de matemáticos.
 *
 * La bandera del país va de fondo, y por eso la tarjeta no repite la
 * nacionalidad escrita: dos veces el mismo dato en once centímetros de tarjeta.
 * La nacionalidad sigue estando, con su detalle histórico, en los datos
 * personales de la ficha.
 */
function carrusel(gente, disposicion, limite) {
  return tarjetas(
    gente.map((m) => ({
      id: m.id,
      href: ficha(m.id),
      img: `assets/voxel/${m.modelo}-cara.webp`,
      titulo: m.nombre,
      /* Sin la época en la tarjeta: el nombre va solo en su franja y la fecha
         se lee en la ficha, que es donde importa. */
      fondo: `assets/banderas/${m.pais}.svg`,
      /* Lo que mira el buscador del índice. Va aquí y no solo el nombre para
         poder buscar por país o por siglo, que es como se busca cuando no se
         recuerda a quién se busca. */
      busca: `${m.nombre} ${m.nacionalidad} ${m.epoca} ${m.resumen}`,
    })),
    disposicion,
    limite,
  );
}

/* El nombre de cada país, para encabezar su grupo en el índice. La bandera
   sola no basta como título: hay quien no distingue la de Austria de la de
   Hungría, y el índice tiene que poder leerse. */
const PAISES = {
  at: "Austria",
  ch: "Suiza",
  de: "Alemania",
  eg: "Egipto",
  en: "Inglaterra",
  fr: "Francia",
  gr: "Grecia",
  hu: "Hungría",
  in: "India",
  ir: "Persia",
  it: "Italia",
  no: "Noruega",
  ru: "Rusia",
  sco: "Escocia",
};

/* La página de Matemáticas pasa a generarse: lleva el carrusel, y a mano habría
   que acordarse de tocarla cada vez que se añade una ficha. */
paginas.push({
  archivo: "matematicas/index.html",
  titulo: "Matemáticas",
  miga: [...MIGA_BASE.slice(0, 1), { texto: "Matemáticas" }],
  favoritos: true,
  cuerpo: [
    "        <h1>Matemáticas</h1>",
    "",
    /* El enlace al índice va en la misma línea del título, a la derecha: es
       donde se busca cuando el carrusel se queda corto. */
    '        <div class="titulo-fila">',
    "          <h2>Matemáticos</h2>",
    `          <a class="mas" href="${MATES}/index.html">Ver los ${matematicos.length}</a>`,
    "        </div>",
    "",
    carrusel(matematicos, null, 6),
    "",
    '        <ul class="lista">',
    `          <li><a href="${MATERIAS}/index.html">Materias</a></li>`,
    "        </ul>",
  ].join("\n"),
});

paginas.push({
  archivo: `${MATES}/index.html`,
  titulo: "Matemáticos",
  miga: [...MIGA_BASE.slice(0, 2), { texto: "Matemáticos" }],
  favoritos: true,
  cuerpo: [
    "        <h1>Matemáticos</h1>",
    "",
    '        <div class="buscador">',
    '          <label class="visualmente-oculta" for="q">Buscar matemático</label>',
    '          <input id="q" type="search" data-buscador placeholder="Buscar por nombre, país o época" autocomplete="off" />',
    "        </div>",
    '        <p class="sin-resultados" data-sin-resultados hidden>Ninguno coincide con esa búsqueda.</p>',
    "",
    /* Aquí están todas, en cuadrícula. El carrusel de Matemáticas enseña unas
       pocas y sirve de asomo; este es el índice, y un índice que obliga a
       arrastrar de lado para saber quién hay no es un índice.

       Ordenadas por país, pero en una sola cuadrícula seguida: los de un mismo
       sitio salen juntos y se reconocen por su bandera, sin partir la página en
       secciones con su título cada una. Dentro de cada país se respeta el orden
       de los datos, que va por épocas. */
    carrusel(
      [...matematicos].sort((a, b) => {
        const pa = PAISES[a.pais] || a.pais;
        const pb = PAISES[b.pais] || b.pais;
        if (pa !== pb) return pa.localeCompare(pb, "es");
        return matematicos.indexOf(a) - matematicos.indexOf(b);
      }),
      "rejilla",
    ),
  ].join("\n"),
});

const porId = Object.fromEntries(matematicos.map((m) => [m.id, m]));

for (const m of matematicos) {
  /* `data-ficha` es la marca que lee favoritos.js para anotar la visita, y el
     botón el que la mete o la saca de favoritos. Su texto lo pone el script
     según el estado, así que aquí va vacío. */
  const cuerpo = [
    `        <div class="titulo-fila" data-ficha="${m.id}">`,
    `          <h1>${m.nombre}</h1>`,
    `          <button class="mas" type="button" data-fav="${m.id}" aria-pressed="false"></button>`,
    "        </div>",
    "",
  ];

  /* El modelo, grande y centrado, antes que nada: es la portada de la ficha. */
  cuerpo.push(
    '        <div class="ficha">',
    "          <div",
    '            class="voxel3d"',
    `            data-modelo="${m.modelo}"`,
    '            data-gestos="idle,idle_sway,idle_foottap,idle_look,happy_idle,laugh,proud,relieved,talk,talk_yes,talk_no,talk_q,talk_dunno,talk_surprise,talk_listen,wave,count,browwipe,look_around2,applaud,fistpump,yawn,warm_hands,dance,dance2,monkey"',
    "          ></div>",
    "        </div>",
    "",
  );

  cuerpo.push(...m.biografia, "");

  /* Los datos personales van plegados: son de consulta, no de lectura, y
     desplegados empujan hacia abajo lo que sí se quiere leer. */
  cuerpo.push(
    '        <ul class="pastillas">',
    desplegable({
      id: "datos",
      titulo: "Información personal",
      sub: `${m.epoca} · ${m.nacionalidad}`,
      cuerpo: [
        '        <dl class="datos">',
        ...m.personal.flatMap(([k, v]) => [
          `          <dt>${k}</dt>`,
          `          <dd>${v}</dd>`,
        ]),
        "        </dl>",
      ].join("\n"),
    }),
    "        </ul>",
    "",
  );

  if (m.teoremas.length) {
    const caben = m.teoremas.slice(0, APORTES_FICHA);
    cuerpo.push("        <h2>Aportes</h2>", "");
    for (const t of caben) {
      cuerpo.push(
        enunciado({ etiqueta: t.nombre, cuerpo: `          ${t.enunciado}` }),
        "",
      );
    }
    /* El enlace sale solo cuando hay algo detrás. Un «ver más» que lleva a una
       página con lo mismo que se acaba de leer es una puerta a ninguna parte. */
    if (m.teoremas.length > caben.length) {
      cuerpo.push(
        `        <p class="mas-pie"><a class="mas" href="${aportes(m.id)}">Ver los ${m.teoremas.length} aportes</a></p>`,
        "",
      );
    }
  }

  const conj = m.conjeturas;
  if (conj.resueltas.length || conj.abiertas.length) {
    cuerpo.push("        <h2>Conjeturas</h2>", "");
    if (conj.abiertas.length) {
      cuerpo.push(
        "        <h3>Abiertas</h3>",
        ...conj.abiertas.map((c) => `        <p>${c}</p>`),
        "",
      );
    }
    if (conj.resueltas.length) {
      cuerpo.push(
        "        <h3>Resueltas</h3>",
        ...conj.resueltas.map((c) => `        <p>${c}</p>`),
        "",
      );
    }
  }

  for (const [titulo, obras] of [
    ["Libros", m.libros],
    ["Artículos", m.articulos],
  ]) {
    if (!obras.length) continue;
    cuerpo.push(`        <h2>${titulo}</h2>`, "", portadas(obras, "carrusel"), "");
  }

  const cerca = m.relaciones.map((id) => porId[id]).filter(Boolean);
  if (cerca.length) {
    cuerpo.push("        <h2>Relaciones</h2>", "", carrusel(cerca), "");
  }

  paginas.push({
    archivo: ficha(m.id),
    titulo: m.nombre,
    miga: [...M_MATES, { texto: m.nombre }],
    visor: true,
    /* Aquí se anota la visita y vive el botón de favorito. */
    favoritos: true,
    cuerpo: cuerpo.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd(),
  });

  /* La página completa de aportes, solo si la ficha se dejó alguno fuera. */
  if (m.teoremas.length > APORTES_FICHA) {
    const todos = [`        <h1>Aportes de ${m.nombre}</h1>`, ""];
    for (const t of m.teoremas) {
      todos.push(
        enunciado({ etiqueta: t.nombre, cuerpo: `          ${t.enunciado}` }),
        "",
      );
    }
    paginas.push({
      archivo: aportes(m.id),
      titulo: `Aportes de ${m.nombre}`,
      miga: [...M_MATES, { texto: m.nombre, href: ficha(m.id) }, { texto: "Aportes" }],
      cuerpo: todos.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd(),
    });
  }
}

/**
 * Los aportes del taller que llevan ruta, colgados de su materia.
 *
 * Un aporte con `materia` es contenido de esa materia, tenga autor o no: un
 * ejercicio o una definición no tienen por qué ser de nadie. Aquí se reparten
 * por secciones según su tipo, y los ejercicios van en dos cajas —el problema y
 * su solución—, que es como se leen.
 */
function aportesEnMaterias() {
  let extra = [];
  try {
    extra = JSON.parse(fs.readFileSync("contenido/aportes.json", "utf8"));
  } catch (e) {
    return;
  }
  const porNombre = new Map(materias.map((m) => [m.nombre.toLowerCase(), m]));
  for (const a of extra) {
    if (!a.nombre || !a.materia) continue;
    const m = porNombre.get(a.materia.trim().toLowerCase());
    if (!m) continue;

    const tema = a.tema || "";
    /* Teorema, lema, corolario, propiedad e identidad van al mismo sitio: son
       enunciados que se demuestran. Solo la definición es otra cosa —no se
       demuestra, se acuerda— y el ejercicio, que se resuelve. */
    const donde =
      a.tipo === "ejercicio" ? "ejercicios"
      : a.tipo === "definición" ? "definiciones"
      : "teoremas";
    m[donde] = m[donde] || [];

    /* El tema, como divisor, si no está ya puesto. */
    if (tema && !m[donde].some((x) => x && x.divisor === tema))
      m[donde].push({ divisor: tema });

    /* Enunciado arriba y lo otro debajo: una sola entrada de dos partes. */
    const entrada = {
      id: (a.nombre || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      nombre: a.nombre,
      cuerpo: a.latex || a.problema || "",
    };
    const debajo = a.segundo || a.solucion || a.demostracion;
    if (debajo) entrada[a.tipo === "ejercicio" ? "resolucion" : "demostracion"] = debajo;
    m[donde].push(entrada);

    /* Y si sale de un libro, también en su página, bajo SU tema —que puede ser
       otro: «Cardinalidad» en la materia y «Capítulo 3» en el libro—. */
    const libro = (m.libros || []).find((l) => l.id === a.libro);
    if (libro) {
      libro.demostraciones = libro.demostraciones || [];
      const suTema = a.temaLibro || a.capitulo;
      if (suTema && !libro.demostraciones.some((x) => x && x.divisor === suTema))
        libro.demostraciones.push({ divisor: suTema });
      libro.demostraciones.push({ ...entrada, general: false });
    }
  }
}

aportesEnMaterias();

/**
 * Las referencias de una materia, cambiadas por lo que señalan.
 *
 * Una entrada de la sección general puede ser `{ de: libro, ref: id }` en vez
 * del enunciado entero. Es la misma entrada que la del libro, no una copia:
 * se escribe una vez y se lee en las dos páginas. Copiarla era tener el mismo
 * enunciado en dos sitios y que corregir uno dejara el otro mintiendo.
 */
function resolverReferencias(m) {
  const busca = (libroId, id) => {
    const l = CATALOGO[libroId];
    if (!l) return null;
    return (
      [...(l.definiciones || []), ...(l.demostraciones || [])].find(
        (e) => e && e.id === id,
      ) || null
    );
  };

  for (const s of ["definiciones", "teoremas", "ejercicios", "articulos", "demostraciones"]) {
    m[s] = (m[s] || [])
      .map((e) => {
        if (!e || e.ref === undefined) return e;
        /* Si el original ya no está, el hueco se queda vacío: enseñar una
           entrada sin enunciado es peor que no enseñarla. */
        return busca(e.de, e.ref);
      })
      .filter(Boolean);
  }
}

for (const m of materias) resolverReferencias(m);
apuntarDonde();

/* ── Materias ──
   Todas tienen página desde el primer día, tengan contenido o no. Una materia
   apagada y sin enlace no dice si está vacía o si no existe; entrando se ve qué
   va a haber ahí, que es lo mismo que hace el resto del sitio con lo que está
   por escribir. */

paginas.push({
  archivo: `${MATERIAS}/index.html`,
  titulo: "Materias",
  miga: [...MIGA_BASE.slice(0, 2), { texto: "Materias" }],
  cuerpo: [
    "        <h1>Materias</h1>",
    "",
    /* Seguidas y en el orden en que se cursan, que es el del plan. Se probó a
       partirlas por semestre con un rótulo en cada uno y se quitó: diecisiete
       líneas se leen de un vistazo, y seis rótulos por medio las cortan sin
       hacer falta.

       Solo el nombre. Debajo iban el asunto de la materia y el recuento de lo
       que lleva dentro; eso se lee entrando, y en la lista solo estorbaba. */
    '        <ul class="lista">',
    ...materias.map(
      (m) => `          <li><a href="${materia(m.id)}">${m.nombre}</a></li>`,
    ),
    "        </ul>",
    "",
  ].join("\n"),
});

/**
 * Una lista de una sección, con sus divisores.
 *
 * Un divisor —`{ divisor: "…" }`— parte la lista en temas. Es un <h3> y nada
 * más: moverlo de sitio en los datos es moverlo en la página, y lo que queda
 * debajo se reordena solo. Lo demás son recuadros de enunciado, los mismos que
 * llevan los teoremas de las fichas.
 */
function seccion(titulo, lista, estilo) {
  const util = (lista || []).filter(Boolean);
  if (!util.some(esEntrada)) return [];

  const fuera = [`        <h2>${titulo}</h2>`, ""];

  /* Dos niveles de separador, uno dentro del otro: el capítulo agrupa temas y
     el tema agrupa lo que se escribe. Los dos se pliegan. */
  let capitulo = null;
  let tema = null;
  let enTema = [];      /* lo que lleva el tema abierto */
  let enCapitulo = [];  /* los temas ya cerrados del capítulo abierto */
  let pastillas = [];

  const donde = () => {
    if (tema !== null) return enTema;
    if (capitulo !== null) return enCapitulo;
    return fuera;
  };

  const soltar = () => {
    if (!pastillas.length) return;
    donde().push('        <ul class="pastillas">', ...pastillas, "        </ul>", "");
    pastillas = [];
  };

  /* Un grupo plegado: su título entre rayas y dentro lo que lleve. */
  const plegado = (titulo, dentro, clase) => [
    `        <details class="grupo${clase ? " " + clase : ""}">`,
    `          <summary class="grupo-titulo">${titulo}</summary>`,
    '          <div class="grupo-cuerpo">',
    '            <div class="dentro">',
    ...dentro,
    "            </div>",
    "          </div>",
    "        </details>",
    "",
  ];

  const cerrarTema = () => {
    soltar();
    if (tema === null) return;
    (capitulo !== null ? enCapitulo : fuera).push(...plegado(tema, enTema));
    enTema = [];
    tema = null;
  };

  /* El capítulo NO se pliega: es el índice de lo que hay debajo, y plegado
     escondía los temas, que son justo lo que se quiere ver de un vistazo. Se
     pliegan los temas, que es donde está el contenido. */
  const cerrarCapitulo = () => {
    cerrarTema();
    if (capitulo === null) return;
    fuera.push(
      `        <h3 class="capitulo">${capitulo}</h3>`,
      "",
      ...enCapitulo,
    );
    enCapitulo = [];
    capitulo = null;
  };

  for (const cosa of util) {
    if (cosa.capitulo !== undefined) {
      cerrarCapitulo();
      capitulo = cosa.capitulo;
      continue;
    }
    if (cosa.divisor !== undefined) {
      cerrarTema();
      tema = cosa.divisor;
      continue;
    }

    const debajo = cosa.demostracion || cosa.resolucion || cosa.solucion;

    /* Un ejercicio se lee al revés que un teorema: el problema se plantea y la
       resolución se mira después, si se mira. Por eso va en pastilla. */
    if (estilo === "pastilla" && debajo) {
      pastillas.push(
        desplegable({
          id: cosa.id,
          titulo: rotulo(cosa),
          sub: cosa.cuerpo || "",
          numerada: true,
          cuerpo: debajo,
        }),
      );
      continue;
    }

    soltar();

    /* Una definición no necesita marco: es una frase que se lee y se sigue
       leyendo. El nombre delante, en negrita, y ya. Si trae algo debajo
       —cualquier enunciado puede llevar demostración, no solo los teoremas— se
       pliega igual que los demás, tocándolo. */
    if (estilo === "simple") {
      const frase =
        `        <p class="simple" id="${cosa.id || ""}"><b>${rotulo(cosa)}.</b> ` +
        `${quitarParrafo(cosa.cuerpo)}</p>`;
      if (!debajo) {
        donde().push(frase, "", ...tambienEn(cosa));
        continue;
      }
      donde().push(
        '        <details class="prueba">',
        '          <summary class="prueba-enunciado">',
        "  " + frase,
        "          </summary>",
        '          <div class="prueba-cuerpo">',
        '            <div class="dentro">',
        `              <p>${quitarParrafo(debajo)}</p>`,
        ...tambienEn(cosa).map((l) => (l ? "    " + l : l)),
        "            </div>",
        "          </div>",
        "        </details>",
        "",
      );
      continue;
    }

    /* El enunciado va en su recuadro, con el nombre en el filo. Si trae
       demostración, el recuadro ENTERO es lo que se toca para abrirla: no hay
       botón aparte, se pulsa el enunciado y debajo aparece la prueba. */
    if (!debajo) {
      donde().push(
        enunciado({ etiqueta: rotulo(cosa), cuerpo: `          ${cosa.cuerpo}`, id: cosa.id }),
        "",
        ...tambienEn(cosa),
      );
      continue;
    }

    donde().push(
      '        <details class="prueba">',
      '          <summary class="prueba-enunciado">',
      sangrar(
        enunciado({ etiqueta: rotulo(cosa), cuerpo: `          ${cosa.cuerpo}`, id: cosa.id }),
        2,
      ),
      "          </summary>",
      '          <div class="prueba-cuerpo">',
      '            <div class="dentro">',
      `              <p>${quitarParrafo(debajo)}</p>`,
      ...tambienEn(cosa).map((l) => (l ? "    " + l : l)),
      "            </div>",
      "          </div>",
      "        </details>",
      "",
    );
  }

  cerrarCapitulo();
  soltar();

  /* La sección no se pliega —solo los capítulos y los temas—: se quiere ver de
     un vistazo de qué se compone la materia. */
  return fuera;
}

/** Quita el <p> de fuera, si lo trae: aquí se va a envolver de otra manera. */
function quitarParrafo(texto) {
  const t = String(texto || "").trim();
  const m = t.match(/^<p>([\s\S]*)<\/p>$/);
  return m ? m[1] : t;
}

/** Lo que no es un divisor: lo que de verdad cuenta como contenido. */
function esEntrada(cosa) {
  return !!cosa && !cosa.divisor;
}

for (const m of materias) {
  const cuerpo = [`        <h1>${m.nombre}</h1>`, ""];
  const hayAlgo = [m.definiciones, m.teoremas, m.ejercicios, m.libros, m.articulos]
    .some((l) => (l || []).some(esEntrada));

  if (!hayAlgo) {
    cuerpo.push(
      `        <p>${m.resumen}.</p>`,
      "",
      "        <p>Todavía no hay nada escrito aquí. Cuando lo haya, en esta " +
        "página irán sus definiciones, sus teoremas, sus demostraciones, los " +
        "ejercicios, la bibliografía y los artículos.</p>",
      "",
    );
  } else {
    /* Sin el asunto de la materia repetido aquí: lo dicen sus secciones. */
    cuerpo.push(...seccion("Definiciones", m.definiciones, "simple"));
    /* Sin sección aparte de demostraciones: una demostración no se lee suelta,
       se lee con el teorema que demuestra. Cada teorema la lleva dentro —el
       enunciado es la pastilla y la demostración lo que se despliega— y las que
       salen de un libro se leen en la página de ese libro. */
    cuerpo.push(...seccion("Teoremas", m.teoremas));
    /* Los ejercicios se leen como los teoremas: el problema en su recuadro, y
       tocándolo aparece la resolución debajo. Antes iban en pastilla, con el
       nombre grande y el enunciado de subtítulo en gris pequeño — el problema
       se leía como un pie de foto en vez de como el problema. */
    cuerpo.push(...seccion("Ejercicios", m.ejercicios));

    /* La bibliografía, en dos: la básica y la complementaria. Van separadas
       porque no se usan igual —una es de la que se estudia y la otra es a la
       que se acude—, y mezcladas no se sabe cuál es cuál. Cada portada abre la
       página de su libro, que es donde está lo que se ha escrito de él. */
    for (const [papel, titulo] of [
      ["basico", "Bibliografía básica"],
      ["complementario", "Bibliografía complementaria"],
    ]) {
      const suyos = (m.libros || []).filter((l) => l.papel === papel);
      if (!suyos.length) continue;
      cuerpo.push(
        `        <h2>${titulo}</h2>`,
        "",
        portadas(suyos.map((l) => ({ ...l, href: libro(l.id) })), "carrusel"),
        "",
      );
    }

    /* Artículos: van a ser PDF que se añaden, no texto. De momento la sección
         existe con lo que haya, para no tener que moverla después. */
    cuerpo.push(...seccion("Artículos", m.articulos));
  }

  paginas.push({
    archivo: materia(m.id),
    titulo: m.nombre,
    miga: [...MIGA_BASE, { texto: m.nombre }],
    cuerpo: cuerpo.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd(),
  });

}

/* ── Libros ──
   Una página por libro del catálogo, no una por libro y materia: el mismo libro
   en dos materias tenía dos páginas con lo mismo escrito, y lo escrito en una no
   aparecía en la otra. */

for (const [id, l] of Object.entries(CATALOGO)) {
  {
    const demos = (l.demostraciones || []).filter(Boolean);

    const suyo = [
      `        <h1>${l.titulo}</h1>`,
      "",
      `        <p class="ruta">${[l.autor, l.editorial, l.anio].filter(Boolean).join(" · ")}</p>`,
      "",
    ];

    /* Lo mismo que en la materia: las definiciones simples y los teoremas en su
       recuadro, tocándolo para ver la demostración. Antes eran pastillas, y un
       libro y una materia se leían distinto sin motivo. */
    suyo.push(...seccion("Definiciones", l.definiciones, "simple"));
    suyo.push(...seccion("Teoremas", demos));

    if (!demos.length && !(l.definiciones || []).some(esEntrada)) {
      suyo.push(
        "        <p>Todavía no hay nada escrito de este libro.</p>",
        "",
      );
    }

    /* La miga pasa por la materia de la que es bibliografía básica, si lo es de
       alguna: es de donde se llega. Si no, por el índice de materias. */
    const suya = materias.find((m) =>
      (m.libros || []).some((x) => x.id === id && x.papel === "basico"),
    );

    paginas.push({
      archivo: libro(id),
      titulo: l.titulo,
      miga: [
        ...MIGA_BASE,
        ...(suya ? [{ texto: suya.nombre, href: materia(suya.id) }] : []),
        { texto: l.titulo },
      ],
      cuerpo: suyo.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd(),
    });
  }
}

/**
 * La lista de lo que hay que guardar para poder leer el sitio sin internet.
 *
 * La escribe el generador porque es quien sabe qué páginas hay: mantenerla a
 * mano significaba que cada matemático nuevo se quedaba fuera de la copia sin
 * que nada avisara.
 *
 * Va todo lo que hace falta para LEER —las páginas, los estilos, las fuentes,
 * las fórmulas ya compuestas y los retratos— y no va el motor 3D con sus
 * modelos: pesa más que todo lo demás junto y solo lo necesita quien abre una
 * ficha, así que se guarda solo cuando alguien lo usa.
 *
 * La versión es la fecha de la construcción: al reconstruir cambia, y el
 * navegador vuelve a guardarlo todo en vez de quedarse con lo viejo.
 */
function listaParaSinRed() {
  const deCarpeta = (carpeta, filtro) => {
    const salida = [];
    for (const cosa of fs.readdirSync(path.join(__dirname, carpeta), { withFileTypes: true })) {
      const suya = `${carpeta}/${cosa.name}`;
      if (cosa.isDirectory()) salida.push(...deCarpeta(suya, filtro));
      else if (filtro.test(cosa.name)) salida.push(suya);
    }
    return salida;
  };

  const archivos = [
    "index.html",
    "estilos.css",
    "manifest.json",
    "assets/favicon.svg",
    "assets/icono-192.png",
    "assets/icono-512.png",
    "assets/tema.js",
    "assets/rejilla.js",
    "assets/intro.js",
    "assets/desplegable.js",
    "assets/favoritos.js",
    "assets/sinred.js",
    "assets/katex/katex.min.css",
    "assets/fondo-claro.webp",
    "assets/fondo-oscuro.webp",
    "assets/velo-claro.webp",
    "assets/velo-oscuro.webp",
    ...paginas.map((p) => p.archivo),
    ...deCarpeta("assets/fuentes", /\.woff2$/),
    ...deCarpeta("assets/katex/fonts", /\.woff2$/),
    ...deCarpeta("assets/banderas", /\.svg$/),
    ...deCarpeta("assets/voxel", /-cara\.webp$/),
  ].filter((f) => fs.existsSync(path.join(__dirname, f)));

  fs.writeFileSync(
    path.join(__dirname, "precache.json"),
    JSON.stringify({ version: new Date().toISOString(), archivos }, null, 1),
  );
  return archivos.length;
}

/**
 * Aviso: prosa metida dentro de matemáticas en línea.
 *
 * KaTeX compone un `\text{…}` como una caja que no parte por ningún sitio. En
 * `$$…$$` da igual, porque el bloque se desplaza dentro de su caja; en `$…$`
 * no hay a dónde desplazarse y la frase ensancha la página entera. Una ficha
 * llegó a desbordar 499 px por esto.
 *
 * La regla es sencilla: en matemáticas van los símbolos, y la prosa va fuera.
 */
for (const p of paginas) {
  const sueltas = (p.cuerpo.match(/\$[^$\n]*\\text\{[^}]{30,}\}[^$\n]*\$/g) || []).length;
  if (sueltas)
    console.warn(
      `  aviso ${p.archivo}: ${sueltas} frase(s) largas dentro de $…$ en línea. ` +
        "Sácalas del modo matemático o la página desbordará a lo ancho.",
    );
}

for (const p of paginas) {
  /* Los enlaces se escriben desde la raíz del sitio; aquí se les pone delante
     lo que haga falta para llegar a ella desde donde queda la página. Un enlace
     de fuera, un ancla o algo que ya sube no se toca. */
  const hondo = p.archivo.split("/").length - 1;
  const raiz = "../".repeat(hondo);
  const hecha = conFichas(plantilla(p));
  const salida = raiz ? conRaiz(hecha, raiz) : hecha;

  const destino = path.join(__dirname, p.archivo);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, salida);
}

console.log(`${listaParaSinRed()} archivos para leer sin internet.`);
console.log(`${paginas.length} páginas generadas. Ahora: node construir.js`);
