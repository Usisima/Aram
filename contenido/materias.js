/**
 * Materias — el plan de estudios y cómo se arma una.
 *
 * Este archivo ya no guarda contenido: solo la lista de materias del plan y las
 * reglas. Lo que hay escrito dentro —definiciones, teoremas, ejercicios,
 * libros, demostraciones y notas— vive en dos JSON que escribe el taller:
 *
 *   materias.json            materias añadidas desde el taller (id, nombre)
 *   materias-contenido.json  lo escrito dentro de cada una
 *
 * Está así porque el taller escribe DATOS y nunca código: mientras el contenido
 * estuvo aquí, en un `.js`, no se podía tocar desde la ventana sin arriesgarse
 * a dejar el sitio sin compilar por una coma de más.
 *
 * ── Cómo se estructura una materia ──
 *
 * Cinco secciones, siempre en este orden: definiciones, teoremas, ejercicios,
 * libros y artículos —que serán PDF que se añaden, no texto—. Entre teoremas y ejercicios se cuela una sexta que no se
 * escribe a mano —demostraciones—, porque sale de los libros.
 *
 * Cualquiera de las listas admite DIVISORES: `{ divisor: "…" }` parte la lista
 * en temas con su título. Añadir uno, moverlo o quitarlo es mover esa línea de
 * sitio, y lo que hay debajo se reordena solo.
 *
 * ── Los libros y sus demostraciones ──
 *
 * Una demostración se escribe UNA vez, dentro del libro de donde sale. De ahí
 * puede subir a la sección general de demostraciones de la materia:
 *
 *   general: true   sube a la sección general (y sigue estando en su libro)
 *   general: false  se queda solo dentro de su libro
 *
 * El orden de la general no es el de los libros: lo fija la lista
 * `demostraciones` de la materia, con sus divisores si hace falta. Lo marcado
 * que no aparezca ahí se añade al final, para que marcar una no obligue a
 * acordarse de dos sitios.
 */

const fs = require("fs");
const path = require("path");

/* El plan de estudios: los nombres y el orden. Lo que se escriba dentro de cada
   una va al JSON de contenido. */
const PLAN = [
  {
    id: "conjuntos",
    nombre: "Teoría de Conjuntos",
    resumen: "Pertenencia, operaciones, funciones y cardinalidad",
    semestre: 0,
  },
  {
    id: "algebra-superior1",
    nombre: "Álgebra Superior I",
    resumen: "Conjuntos, Relaciones y funciones, Números naturales y cálculo combinatorio",
    semestre: 1,
  },
  {
    id: "calculo1",
    nombre: "Cálculo Diferencial e Integral I",
    resumen: "Introducción, Números reales, Funciones y sucesiones",
    semestre: 1,
  },
  {
    id: "geometria-analitica1",
    nombre: "Geometría Analítica I",
    resumen: "Introducción, Trigonometría, Espacios vectoriales básicos",
    semestre: 1,
  },
  {
    id: "geometria-moderna1",
    nombre: "Geometría Moderna I",
    resumen: "Fundamentos de geometría euclidiana, Triángulos y congruencias, Círculos y polígonos",
    semestre: 1,
  },
  {
    id: "algebra-superior2",
    nombre: "Álgebra Superior II",
    resumen: "Números enteros, Divisibilidad, Números complejos",
    semestre: 2,
  },
  {
    id: "calculo2",
    nombre: "Cálculo Diferencial e Integral II",
    resumen: "Integral definida, Teorema Fundamental del Cálculo, Las funciones logaritmo y exponencial",
    semestre: 2,
  },
  {
    id: "geometria-analitica2",
    nombre: "Geometría Analítica II",
    resumen: "Superficies cuádricas, Transformaciones, La geometría de la esfera",
    semestre: 2,
  },
  {
    id: "algebra-lineal1",
    nombre: "Álgebra Lineal I",
    resumen: "Espacios vectoriales, Matrices, Transformaciones lineales",
    semestre: 3,
  },
  {
    id: "calculo3",
    nombre: "Cálculo Diferencial e Integral III",
    resumen: "Funciones de ℝ en ℝN, Espacios normados (opcional), Topología de ℝN y funciones de ℝN en ℝM",
    semestre: 3,
  },
  {
    id: "algebra-lineal2",
    nombre: "Álgebra Lineal II",
    resumen: "Formas bilineales y operadores, Diagonalización, Triangulación",
    semestre: 4,
  },
  {
    id: "calculo4",
    nombre: "Cálculo Diferencial e Integral IV",
    resumen: "Integrales múltiples, Integral de línea, Integral de superficie",
    semestre: 4,
  },
  {
    id: "ecuaciones-diferenciales1",
    nombre: "Ecuaciones Diferenciales I",
    resumen: "Introducción, Ecuaciones diferenciales lineales de primer orden, Ecuaciones diferenciales no lineales de primer orden",
    semestre: 4,
  },
  {
    id: "algebra-moderna1",
    nombre: "Álgebra Moderna I",
    resumen: "Teoría elemental de grupos, Homomorfismos, Tópicos avanzados",
    semestre: 5,
  },
  {
    id: "analisis1",
    nombre: "Análisis Matemático I",
    resumen: "Espacios métricos, Convergencia uniforme, Compacidad",
    semestre: 5,
  },
  {
    id: "variable-compleja1",
    nombre: "Variable Compleja I",
    resumen: "Preliminares y analicidad, Integración, Series",
    semestre: 5,
  },
  {
    id: "analisis2",
    nombre: "Análisis Matemático II",
    resumen: "Medida de Lebesgue en \(\mathbb{R}^n\), Integral de Lebesgue, Teoremas de convergencia",
    semestre: 6,
  },
];

/* Las listas que puede tener una materia. El taller edita estas y solo estas. */
const SECCIONES = [
  "definiciones",
  "teoremas",
  "ejercicios",
  "articulos",
  "demostraciones",
];

function leer(archivo, siFalta) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, archivo), "utf8"));
  } catch (e) {
    return siFalta;
  }
}

/** El plan, más las materias que se hayan añadido desde el taller. */
function conLasDelTaller(lista) {
  const salida = lista.map((m) => ({ ...m }));
  for (const m of leer("materias.json", [])) {
    if (!m || !m.id || !m.nombre) continue;
    const ya = salida.find((x) => x.id === m.id);
    if (ya) Object.assign(ya, { nombre: m.nombre, resumen: m.resumen || ya.resumen });
    else salida.push({ id: m.id, nombre: m.nombre, resumen: m.resumen || "" });
  }
  return salida;
}

/**
 * El catálogo de libros: uno por libro, con lo que se haya escrito dentro.
 *
 * Un libro no es de una materia. Spivak es bibliografía de Cálculo I y de
 * Cálculo II, y lo que se demuestre de él se lee en las dos: por eso vive
 * aparte y las materias solo dicen cuáles usan y con qué papel.
 */
const libros = leer("libros.json", {});

/** Y a cada una, lo que tenga escrito dentro. */
function conSuContenido(lista) {
  const contenido = leer("materias-contenido.json", {});
  for (const m of lista) {
    const suyo = contenido[m.id] || {};
    for (const s of SECCIONES) m[s] = suyo[s] || [];

    /* Los libros se traen del catálogo. El papel —básico o complementario— sí
       es de la materia: el mismo libro es básico en una y complementario en
       otra, y eso no cambia lo que lleva dentro. */
    m.libros = (suyo.libros || [])
      .map((x) => {
        const l = libros[x.libro];
        return l ? { id: x.libro, papel: x.papel || "basico", ...l } : null;
      })
      .filter(Boolean);
  }
  return lista;
}

const materias = conSuContenido(conLasDelTaller(PLAN));

/**
 * Las demostraciones que suben a la sección general, ya ordenadas.
 *
 * Se sacan de los libros, se deja fuera lo que no esté marcado y se colocan en
 * el orden de `demostraciones`. Lo marcado que no esté en esa lista va al
 * final: marcar una no puede obligar a acordarse de tocar dos sitios.
 */
function generales(materia) {
  const deLibros = new Map();
  for (const libro of materia.libros || [])
    for (const d of libro.demostraciones || [])
      if (d.general) deLibros.set(d.id, { ...d, libro });

  const salida = [];
  const puestas = new Set();
  for (const entrada of materia.demostraciones || []) {
    if (entrada && entrada.divisor) {
      salida.push(entrada);
      continue;
    }
    const d = deLibros.get(entrada);
    if (d) {
      salida.push(d);
      puestas.add(entrada);
    }
  }
  for (const [id, d] of deLibros) if (!puestas.has(id)) salida.push(d);
  return salida;
}

module.exports = { materias, libros, generales, SECCIONES };
