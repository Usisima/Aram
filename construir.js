/**
 * Compone las fórmulas de una vez y las deja escritas en el HTML.
 *
 *     node construir.js
 *
 * Antes, cada página traía KaTeX (275 KB de JavaScript) y recomponía todas sus
 * fórmulas en el navegador en cada visita. Los archivos se cacheaban, sí, pero
 * el trabajo de composición se repetía siempre. Con esto el navegador recibe el
 * resultado ya hecho y solo necesita el CSS y las fuentes.
 *
 * El original se conserva en un comentario alrededor de cada fórmula:
 *
 *     <!--m:$x^2$-->…html compuesto…<!--/m-->
 *
 * Así el script se puede volver a pasar cuantas veces haga falta: primero
 * deshace lo que compuso antes y luego recompone todo. Se usan comentarios y no
 * un atributo porque un comentario se localiza con una expresión regular
 * simple, mientras que emparejar la etiqueta de cierre de un <span> con otros
 * <span> anidados dentro no es fiable.
 *
 * Para escribir matemáticas, en el HTML se ponen los delimitadores de siempre
 * ($$…$$, \[…\], $…$, \(…\)) y se ejecuta esto.
 */

const fs = require("fs");
const path = require("path");
const katex = require("./assets/katex/katex.min.js");

/* Mismo orden que antes usaba el renderizado en el navegador: $$ tiene que ir
   antes que $, o el simple se comería la apertura del doble. */
const DELIMITADORES = [
  { abre: "$$", cierra: "$$", bloque: true },
  { abre: "\\[", cierra: "\\]", bloque: true },
  { abre: "$", cierra: "$", bloque: false },
  { abre: "\\(", cierra: "\\)", bloque: false },
];

/* Dentro de estas etiquetas no se toca nada: no son prosa. */
const INTOCABLES = new Set(["script", "style", "textarea", "pre", "code"]);

function componer(tex, bloque) {
  return katex.renderToString(tex, {
    displayMode: bloque,
    throwOnError: false,
    errorColor: "#e05260",
  });
}

/** Deshace una pasada anterior y devuelve el HTML con los delimitadores. */
function deshacer(html) {
  return html.replace(/<!--m:([\s\S]*?)-->[\s\S]*?<!--\/m-->/g, (_, orig) => orig);
}

/** Sustituye las fórmulas de un fragmento de texto plano. */
function componerTexto(texto) {
  let salida = "";
  let i = 0;

  while (i < texto.length) {
    let encontrado = null;

    for (const d of DELIMITADORES) {
      if (!texto.startsWith(d.abre, i)) continue;
      const fin = texto.indexOf(d.cierra, i + d.abre.length);
      if (fin === -1) continue;
      encontrado = { d, fin };
      break;
    }

    if (!encontrado) {
      salida += texto[i];
      i += 1;
      continue;
    }

    const { d, fin } = encontrado;
    const tex = texto.slice(i + d.abre.length, fin);
    const original = texto.slice(i, fin + d.cierra.length);

    salida += `<!--m:${original}-->${componer(tex, d.bloque)}<!--/m-->`;
    i = fin + d.cierra.length;
  }

  return salida;
}

/**
 * Recorre el HTML alternando etiquetas y texto, y solo compone en el texto.
 * No hace falta un analizador completo: estas páginas las genera este mismo
 * proyecto.
 *
 * Una etiqueta empieza por `<` seguido de letra, `/`, `!` o `?`. Esa
 * comprobación no está de adorno: con `<[^>]*>` a secas, el «menor que» de una
 * fórmula —`|A| < |\mathcal{P}(A)|`— abría una etiqueta falsa que se cerraba en
 * el primer `>` que hubiera más adelante, y la fórmula entera se tragaba con
 * ella. Salía el LaTeX en crudo en la página y sin ningún error por medio.
 */
function componerPagina(html) {
  const partes = html.split(/(<[/!?a-zA-Z][^>]*>)/);
  let dentroDe = null;
  let salida = "";

  for (const parte of partes) {
    const etiquetaAbre = parte.match(/^<([a-zA-Z][\w-]*)/);
    const etiquetaCierra = parte.match(/^<\/([a-zA-Z][\w-]*)/);

    if (etiquetaCierra) {
      if (dentroDe === etiquetaCierra[1].toLowerCase()) dentroDe = null;
      salida += parte;
      continue;
    }

    if (etiquetaAbre) {
      const nombre = etiquetaAbre[1].toLowerCase();
      if (INTOCABLES.has(nombre) && !parte.endsWith("/>")) dentroDe = nombre;
      salida += parte;
      continue;
    }

    salida += dentroDe ? parte : componerTexto(parte);
  }

  return salida;
}

/* Ya no hace falta cargar KaTeX ni el arranque que lo invocaba: la página llega
   compuesta. Se queda el CSS, que es lo que da forma y fuentes al resultado. */
function quitarScripts(html) {
  return html.replace(
    /[ \t]*<script defer src="assets\/(?:katex\/katex\.min\.js|katex\/auto-render\.min\.js|mate\.js)"><\/script>\r?\n/g,
    "",
  );
}

/* Todas las páginas del sitio, estén a la altura que estén. Antes se leía solo
   la raíz, y desde que cada nivel tiene su carpeta ahí ya no está casi nada. Lo
   que no es sitio —las herramientas, lo que se descargó de fuera— se queda
   fuera: ni lleva fórmulas ni se publica. */
const FUERA = new Set(["herramientas", "assets", "contenido", ".git", ".github", ".claude"]);

function paginasDe(carpeta) {
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((cosa) => {
    const suya = path.join(carpeta, cosa.name);
    if (cosa.isDirectory()) return FUERA.has(cosa.name) ? [] : paginasDe(suya);
    return cosa.name.endsWith(".html") ? [path.relative(__dirname, suya)] : [];
  });
}

const paginas = paginasDe(__dirname).filter((f) => f !== "logo.html");

let totalFormulas = 0;

for (const pagina of paginas) {
  const ruta = path.join(__dirname, pagina);
  const antes = fs.readFileSync(ruta, "utf8");

  let html = quitarScripts(componerPagina(deshacer(antes)));

  const formulas = (html.match(/<!--m:/g) || []).length;
  totalFormulas += formulas;

  if (html !== antes) fs.writeFileSync(ruta, html);
  console.log(`${pagina.padEnd(22)} ${String(formulas).padStart(3)} fórmulas`);
}

console.log(`\n${totalFormulas} fórmulas compuestas en ${paginas.length} páginas`);
