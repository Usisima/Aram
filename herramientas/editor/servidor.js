/**
 * Servidor del editor visual.
 *
 *     node herramientas/editor/servidor.js [puerto]
 *
 * Sirve la ventana del editor y le da una API para tocar lo que hay en disco.
 * No usa ninguna dependencia: el proyecto no tiene package.json y no lo va a
 * tener, así que aquí solo hay `http`, `fs` y `child_process`.
 *
 * Lo que el editor puede hacer, y dónde acaba cada cosa:
 *
 *   personajes  ->  herramientas/voxel/personajes.json   (lo lee registro.py)
 *   modelos     ->  assets/voxel3d/modelos/<id>.json     (lo dibuja el sitio)
 *   retratos    ->  assets/voxel/<id>-cara.webp          (las tarjetas)
 *   aportes     ->  contenido/aportes.json               (lo lee generar.js)
 *
 * El editor NUNCA escribe código: ni el .py de los personajes ni el .js de los
 * contenidos. Escribe datos, y los generadores de siempre los recogen. Así una
 * cacharreada en la ventana no puede dejar el sitio sin compilar.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile, spawn } = require("child_process");

const AQUI = __dirname;
const RAIZ = path.join(AQUI, "..", "..");
const VOXEL = path.join(RAIZ, "herramientas", "voxel");
const PERSONAJES = path.join(VOXEL, "personajes.json");
const APORTES = path.join(RAIZ, "contenido", "aportes.json");
const PUERTO = Number(process.argv[2]) || 8899;

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const leerJson = (ruta, siFalta) => {
  try {
    return JSON.parse(fs.readFileSync(ruta, "utf8"));
  } catch (e) {
    return siFalta;
  }
};

const escribirJson = (ruta, datos) => {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 1), "utf8");
};

/**
 * El obrero: un python levantado que compone modelos cuando se le pide.
 *
 * Arrancarlo de cero en cada toque costaba 29 segundos —el arranque del
 * intérprete, más volver a leer los mismos .qb— y con eso no hay edición en
 * vivo que valga. Levantado una vez y con las piezas cacheadas en su memoria,
 * cada composición es cuestión de décimas. Si se cae, la siguiente petición lo
 * vuelve a levantar.
 */
let obrero = null;
const cola = [];

function levantarObrero() {
  obrero = spawn(process.env.PYTHON || "python", [path.join(AQUI, "obrero.py")], {
    cwd: RAIZ,
    stdio: ["pipe", "pipe", "pipe"],
  });
  let resto = "";
  obrero.stdout.on("data", (trozo) => {
    resto += trozo;
    let corte;
    while ((corte = resto.indexOf("\n")) >= 0) {
      const linea = resto.slice(0, corte);
      resto = resto.slice(corte + 1);
      const espera = cola.shift();
      if (!espera) continue;
      try {
        const datos = JSON.parse(linea);
        datos.error ? espera.falla(new Error(datos.error)) : espera.cumple(datos);
      } catch (e) {
        espera.falla(new Error("respuesta ilegible del obrero: " + linea.slice(0, 200)));
      }
    }
  });
  /* Lo que python escriba en stderr —un aviso, una traza— sale por la consola
     del servidor, que es donde se mira cuando algo va mal. */
  obrero.stderr.on("data", (t) => process.stderr.write("[obrero] " + t));
  obrero.on("exit", () => {
    obrero = null;
    while (cola.length) cola.shift().falla(new Error("el obrero se cayó"));
  });
}

function pedirAlObrero(peticion) {
  if (!obrero) levantarObrero();
  return new Promise((cumple, falla) => {
    cola.push({ cumple, falla });
    obrero.stdin.write(JSON.stringify(peticion) + "\n");
  });
}

/**
 * Compone un modelo y lo devuelve, sin guardarlo en el sitio.
 *
 * Es lo que hace el editor a cada toque: se pide el modelo, se dibuja en el
 * visor y ya está. Guardar es otra llamada, a propósito: probar peinados no
 * puede ir dejando rastro en assets/.
 */
async function componer(personaje, guardarComo) {
  const r = await pedirAlObrero({
    orden: "componer",
    personaje,
    nombre: guardarComo || "_previa",
  });
  return r.modelo;
}

const LIBROS = () => path.join(RAIZ, "contenido", "libros.json");

/**
 * Un libro del catálogo, listo para que le escriban dentro.
 *
 * Los libros viven aparte de las materias porque el mismo libro es bibliografía
 * de varias, y lo que se escriba de él se lee en todas. Antes cada materia
 * llevaba su copia y lo escrito en una no aparecía en la otra.
 */
function delCatalogo(todos, cual) {
  const l = todos[cual];
  if (!l) throw new Error(`no hay ningún libro ${cual} en el catálogo`);
  return l;
}

/** Las materias tal como las ve el sitio: las escritas más las del taller. */
function materiasDelSitio() {
  const ruta = path.join(RAIZ, "contenido", "materias.js");
  /* Sin caché: el .js y el .json cambian mientras el taller está abierto. */
  delete require.cache[require.resolve(ruta)];
  try {
    return require(ruta).materias.map((m) => ({
      id: m.id,
      nombre: m.nombre,
      /* Con qué se puede rellenar la ruta de un aporte en esta materia: sus
         libros y los temas que ya existen —los divisores de sus listas—. Así
         el taller no ofrece una ruta que en el sitio no lleva a ningún sitio. */
      libros: (m.libros || []).map((l) => ({
        id: l.id,
        titulo: l.titulo,
        papel: l.papel || "basico",
      })),
      /* Los temas de cada libro por separado: dentro de un libro los capítulos
         son los suyos y no los de la materia. */
      /* Los capítulos de cada libro: los separadores de nivel capítulo, que no
         son los temas —un capítulo tiene varios temas dentro—. */
      capitulosPorLibro: Object.fromEntries(
        (m.libros || []).map((l) => [
          l.id,
          [
            ...new Set(
              [...(l.definiciones || []), ...(l.demostraciones || [])]
                .filter((d) => d && d.capitulo !== undefined)
                .map((d) => d.capitulo),
            ),
          ],
        ]),
      ),
      /* Y los temas del libro: sus divisores, que cuelgan de un capítulo y no
         son ni el capítulo ni el tema de la materia. Tres listas, tres campos. */
      temasPorLibro: Object.fromEntries(
        (m.libros || []).map((l) => [
          l.id,
          [
            ...new Set(
              [...(l.definiciones || []), ...(l.demostraciones || [])]
                .filter((d) => d && d.divisor !== undefined && d.divisor)
                .map((d) => d.divisor),
            ),
          ],
        ]),
      ),
      temas: [
        ...new Set(
          [m.definiciones, m.teoremas, m.ejercicios, m.notas, m.demostraciones]
            .flatMap((lista) => lista || [])
            .filter((x) => x && x.divisor)
            .map((x) => x.divisor),
        ),
      ],
      /* Lo escrito dentro, entero y tal cual: el taller lo enseña y lo edita,
         divisores incluidos. Va completo y no en resumen porque para poder
         cambiar un enunciado hay que tener el enunciado. */
      contenido: {
        definiciones: m.definiciones || [],
        teoremas: m.teoremas || [],
        ejercicios: m.ejercicios || [],
        articulos: m.articulos || [],
      },
      /* Y lo de cada libro, que se edita igual pero por separado. */
      contenidoLibros: Object.fromEntries(
        (m.libros || []).map((l) => [
          l.id,
          { definiciones: l.definiciones || [], demostraciones: l.demostraciones || [] },
        ]),
      ),
      /* Todo lo escrito en la materia, en una sola lista plana: es de donde se
         elige al atar dos resultados. Se manda con el nombre y el sitio porque
         un id suelto no dice nada a quien está eligiendo. */
      entradas: [
        ...["definiciones", "teoremas", "ejercicios", "articulos"].flatMap((sec) =>
          (m[sec] || [])
            .filter((e) => e && e.id && !e.ref)
            .map((e) => ({
              id: e.id,
              rotulo: [e.etiqueta, e.nombre].filter(Boolean).join(" · "),
              donde: m.nombre + " · " + sec,
            })),
        ),
        ...(m.libros || []).flatMap((l) =>
          ["definiciones", "demostraciones"].flatMap((sec) =>
            (l[sec] || [])
              .filter((e) => e && e.id)
              .map((e) => ({
                id: e.id,
                rotulo: [e.etiqueta, e.nombre].filter(Boolean).join(" · "),
                donde: l.titulo,
              })),
          ),
        ),
      ],
    }));
  } catch (e) {
    return [];
  }
}

const api = {
  /* Todo lo que la ventana necesita para arrancar. */
  async estado() {
    const personajes = leerJson(PERSONAJES, {});
    const fichas = {};
    const js = fs.readFileSync(path.join(RAIZ, "contenido", "matematicos.js"), "utf8");
    for (const m of js.matchAll(/id: "([a-z]+)",\s*\n\s*nombre: "([^"]+)"/g))
      fichas[m[1]] = m[2];
    return {
      personajes,
      fichas,
      aportes: leerJson(APORTES, []),
      /* Las materias del sitio, para que la ruta de un aporte ofrezca esas y
         no una lista escrita aparte que se queda vieja. */
      materias: materiasDelSitio(),
      piezas: leerJson(path.join(AQUI, "piezas", "indice.json"), {}),
      /* La distancia a la que se fotografían las caras del lote: la ventana
         hornea con esta misma o la tarjeta saldría a otro zoom. */
      distancia: (leerJson(path.join(VOXEL, "distancia.json"), {}) || {}).distancia || 49.3,
    };
  },

  /* Un modelo compuesto al vuelo, para el visor. */
  async previa({ personaje }) {
    return { modelo: await componer(personaje) };
  },

  /**
   * Guardar de verdad: los datos, el modelo que dibuja el sitio y la cara de
   * su tarjeta.
   *
   * La cara llega ya dibujada desde la ventana —allí está el visor con el
   * modelo montado— y aquí solo se pasa a webp de 320, que es lo que llevan las
   * tarjetas. Se probó a hornearla como el lote, levantando un Chromium aparte
   * por CDP, y cada foto se quedaba colgada más de dos minutos.
   */
  async guardar({ id, personaje, cara }) {
    if (!/^[a-z][a-z0-9]*$/.test(id)) throw new Error("el id va en minúsculas, sin espacios");
    const todos = leerJson(PERSONAJES, {});
    todos[id] = personaje;
    escribirJson(PERSONAJES, todos);

    const modelo = await componer(personaje, id);
    fs.copyFileSync(
      path.join(VOXEL, "modelos", `${id}.json`),
      path.join(RAIZ, "assets", "voxel3d", "modelos", `${id}.json`),
    );

    let retrato = "tarjeta pendiente: rehazla con retratos.mjs";
    if (cara && cara.startsWith("data:image/png;base64,")) {
      try {
        const png = path.join(RAIZ, "assets", "voxel", `${id}-cara.png`);
        fs.writeFileSync(png, Buffer.from(cara.split(",")[1], "base64"));
        /* De 512 a 320 y a webp, que es el formato y el tamaño que llevan las
           tarjetas. Lo hace Pillow, que está en la máquina; el sitio sigue sin
           depender de nada. */
        await new Promise((cumple, falla) =>
          execFile(
            process.env.PYTHON || "python",
            ["-c",
              "from PIL import Image; import sys, os\n" +
              "p = sys.argv[1]\n" +
              "Image.open(p).convert('RGBA').resize((320,320), Image.LANCZOS)" +
              ".save(p[:-4] + '.webp', 'WEBP', quality=90, method=4)\n" +
              "os.remove(p)\n",
              png],
            { cwd: RAIZ },
            (e, s, err) => (e ? falla(new Error(err || e.message)) : cumple(s)),
          ),
        );
        retrato = "tarjeta al día";
      } catch (e) {
        /* Que falle la foto no puede tirar el guardado: el modelo ya está en su
           sitio y el retrato se puede rehacer con el lote. */
        retrato = "retrato no: " + String(e.message).slice(0, 120);
      }
    }
    return { guardado: id, vox: modelo.voxels.length, retrato };
  },

  /**
   * Una materia nueva, o el rótulo de una que ya está.
   *
   * Va a contenido/materias.json, que `contenido/materias.js` mezcla con las
   * suyas. Se crea vacía: su página sale como sale cualquiera sin contenido, y
   * en cuanto se le escriba algo se le pone en el .js, que manda sobre esto.
   */
  async materia({ id, nombre, resumen }) {
    if (!nombre) throw new Error("la materia necesita nombre");
    const clave = (id || nombre)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!clave) throw new Error("de ese nombre no sale un identificador");

    const ruta = path.join(RAIZ, "contenido", "materias.json");
    const lista = leerJson(ruta, []);
    const ya = lista.find((m) => m.id === clave);
    if (ya) Object.assign(ya, { nombre, resumen: resumen || ya.resumen || "" });
    else lista.push({ id: clave, nombre, resumen: resumen || "" });
    escribirJson(ruta, lista);
    return { id: clave, materias: materiasDelSitio() };
  },

  /**
   * Una sección entera de una materia, tal como quede.
   *
   * Se manda la lista completa y no una operación por gesto —añadir, mover,
   * borrar, meter un divisor— porque todas esas son lo mismo: la lista queda
   * de otra manera. Con una sola llamada no hay estados a medias si algo se
   * pierde por el camino.
   */
  async contenidoMateria({ materia, seccion, lista, libro }) {
    const { SECCIONES } = require(path.join(RAIZ, "contenido", "materias.js"));
    if (!materia) throw new Error("falta la materia");
    if (!SECCIONES.includes(seccion)) throw new Error(`no hay sección ${seccion}`);
    if (!Array.isArray(lista)) throw new Error("la lista tiene que ser una lista");

    const ruta = path.join(RAIZ, "contenido", "materias-contenido.json");
    const todo = leerJson(ruta, {});
    const suyo = (todo[materia] = todo[materia] || {});

    if (libro) {
      /* La sección de un libro va al catálogo: es del libro, no de la materia
         desde la que se esté editando. */
      const todosLosLibros = leerJson(LIBROS(), {});
      delCatalogo(todosLosLibros, libro)[seccion] = lista;
      escribirJson(LIBROS(), todosLosLibros);
    } else {
      suyo[seccion] = lista;
    }

    escribirJson(ruta, todo);
    return { materia, seccion, cuantas: lista.length, materias: materiasDelSitio() };
  },

  /**
   * Guardar varias secciones en una sola llamada.
   *
   * Hace falta porque una entrada puede leerse en dos páginas: se escribe en su
   * libro y la sección general la señala. Al tocarla cambian las dos listas, y
   * guardarlas por separado deja el sitio a medias si la segunda llamada falla.
   */
  async guardarSecciones({ materia, cambios }) {
    const { SECCIONES } = require(path.join(RAIZ, "contenido", "materias.js"));
    if (!materia) throw new Error("falta la materia");
    if (!Array.isArray(cambios) || !cambios.length) throw new Error("no hay nada que guardar");

    const ruta = path.join(RAIZ, "contenido", "materias-contenido.json");
    const todo = leerJson(ruta, {});
    const suyo = (todo[materia] = todo[materia] || {});

    const todosLosLibros = leerJson(LIBROS(), {});
    let tocadoElCatalogo = false;

    for (const c of cambios) {
      if (!SECCIONES.includes(c.seccion)) throw new Error(`no hay sección ${c.seccion}`);
      if (!Array.isArray(c.lista)) throw new Error("la lista tiene que ser una lista");
      if (c.libro) {
        delCatalogo(todosLosLibros, c.libro)[c.seccion] = c.lista;
        tocadoElCatalogo = true;
      } else {
        suyo[c.seccion] = c.lista;
      }
    }

    if (tocadoElCatalogo) escribirJson(LIBROS(), todosLosLibros);
    escribirJson(ruta, todo);
    return {
      cuantas: cambios.reduce((n, c) => n + c.lista.length, 0),
      donde: cambios.length,
      materias: materiasDelSitio(),
    };
  },

  /**
   * Dar de alta un tema o un capítulo.
   *
   * Un tema es un divisor: la línea que parte una lista en apartados. Se puede
   * escribir a mano en el aporte y aparecerá igual, pero darlo de alta aquí lo
   * deja puesto en la materia —o en el libro— aunque todavía no cuelgue nada de
   * él, y desde entonces sale en el desplegable.
   */
  async divisor({ materia, seccion, texto, libro }) {
    if (!materia || !texto) throw new Error("hace falta materia y texto");
    const ruta = path.join(RAIZ, "contenido", "materias-contenido.json");
    const todo = leerJson(ruta, {});
    const suyo = (todo[materia] = todo[materia] || {});

    if (libro) {
      /* En un libro, el divisor va con sus demostraciones —en el catálogo—. */
      const todosLosLibros = leerJson(LIBROS(), {});
      const l = delCatalogo(todosLosLibros, libro);
      l.demostraciones = l.demostraciones || [];
      if (!l.demostraciones.some((d) => d && d.divisor === texto))
        l.demostraciones.push({ divisor: texto });
      escribirJson(LIBROS(), todosLosLibros);
    } else {
      const donde = seccion || "teoremas";
      suyo[donde] = suyo[donde] || [];
      if (!suyo[donde].some((d) => d && d.divisor === texto))
        suyo[donde].push({ divisor: texto });
    }

    escribirJson(ruta, todo);
    return { texto, materias: materiasDelSitio() };
  },

  /* Los aportes que se añaden desde el editor, con su ruta y su autor. */
  async aporte({ aporte, indice }) {
    const lista = leerJson(APORTES, []);
    if (indice === undefined || indice < 0) lista.push(aporte);
    else lista[indice] = aporte;
    escribirJson(APORTES, lista);
    return { total: lista.length };
  },

  async borrarAporte({ indice }) {
    const lista = leerJson(APORTES, []);
    lista.splice(indice, 1);
    escribirJson(APORTES, lista);
    return { total: lista.length };
  },

  /* Rehacer el sitio con lo que haya guardado. */
  async construir() {
    const salida = [];
    for (const guion of ["generar.js", "construir.js"]) {
      salida.push(
        await new Promise((cumple, falla) =>
          execFile(process.execPath, [path.join(RAIZ, guion)], { cwd: RAIZ }, (e, s) =>
            e ? falla(new Error(s || e.message)) : cumple(s.trim().split("\n").pop()),
          ),
        ),
      );
    }
    return { salida };
  },
};

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");

    if (url.pathname.startsWith("/api/")) {
      const nombre = url.pathname.slice(5);
      let cuerpo = "";
      for await (const trozo of req) cuerpo += trozo;
      try {
        if (!api[nombre]) throw new Error(`no existe /api/${nombre}`);
        const datos = await api[nombre](cuerpo ? JSON.parse(cuerpo) : {});
        res.writeHead(200, { "Content-Type": TIPOS[".json"] });
        res.end(JSON.stringify(datos));
      } catch (e) {
        res.writeHead(500, { "Content-Type": TIPOS[".json"] });
        res.end(JSON.stringify({ error: String(e.message || e) }));
      }
      return;
    }

    /* Lo demás son archivos: los del editor y los del sitio, que es de donde
       salen three.js, las animaciones, KaTeX y las fuentes. */
    let p = decodeURIComponent(url.pathname);
    if (p === "/") p = "/index.html";
    const candidatos = [path.join(AQUI, p), path.join(RAIZ, p)];
    for (const f of candidatos) {
      if (fs.existsSync(f) && fs.statSync(f).isFile()) {
        res.writeHead(200, { "Content-Type": TIPOS[path.extname(f)] || "application/octet-stream" });
        res.end(fs.readFileSync(f));
        return;
      }
    }
    res.writeHead(404).end("no está");
  })
  .listen(PUERTO, () => console.log(`editor en http://localhost:${PUERTO}`));
