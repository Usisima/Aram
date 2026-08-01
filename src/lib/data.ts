/**
 * Acceso al contenido.
 *
 * La fuente de verdad son los archivos de contenido/, no este modulo: las
 * materias y los libros en JSON, y cada demostracion en su propio .tex. Eso
 * es lo que permite que el editor local escriba contenido y que la compilacion
 * lo recoja sin tocar codigo.
 *
 * Solo se usa desde componentes de servidor, que en este proyecto se ejecutan
 * al compilar. Nunca debe importarse desde un componente de cliente: usa
 * node:fs.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type {
  Demostracion,
  Dificultad,
  Libro,
  Materia,
  MateriaConResumen,
} from "./types";

const RAIZ = path.join(process.cwd(), "contenido");
const DEMOSTRACIONES = path.join(RAIZ, "demostraciones");

/**
 * Cada archivo .tex empieza con `clave: valor` por linea, una linea con solo
 * `---`, y despues el LaTeX. Se parte a mano para no depender de un lector de
 * YAML por cinco campos.
 */
function partir(texto: string): { meta: Record<string, string>; cuerpo: string } {
  const lineas = texto.replace(/\r\n/g, "\n").split("\n");
  const corte = lineas.indexOf("---");

  if (corte === -1) return { meta: {}, cuerpo: texto.trim() };

  const meta: Record<string, string> = {};
  for (const linea of lineas.slice(0, corte)) {
    const separador = linea.indexOf(":");
    if (separador === -1) continue;
    meta[linea.slice(0, separador).trim()] = linea.slice(separador + 1).trim();
  }

  return { meta, cuerpo: lineas.slice(corte + 1).join("\n").trim() };
}

const DIFICULTADES: Dificultad[] = [
  "introductoria",
  "intermedia",
  "avanzada",
];

function aDificultad(valor: string | undefined): Dificultad {
  return DIFICULTADES.find((d) => d === valor) ?? "intermedia";
}

/**
 * El contenido se lee una vez por proceso. Al compilar se recorren todas las
 * paginas y no tiene sentido volver al disco en cada una; en desarrollo, cada
 * recarga arranca un proceso nuevo.
 */
let cache: Promise<{
  materias: Materia[];
  libros: Libro[];
  demostraciones: Demostracion[];
}> | null = null;

async function leerTodo() {
  const [materias, libros] = await Promise.all([
    readFile(path.join(RAIZ, "materias.json"), "utf8").then(
      (t) => JSON.parse(t) as Materia[],
    ),
    readFile(path.join(RAIZ, "libros.json"), "utf8").then(
      (t) => JSON.parse(t) as Libro[],
    ),
  ]);

  // contenido/demostraciones/<id del libro>/<slug>.tex
  const carpetas = await readdir(DEMOSTRACIONES, { withFileTypes: true }).catch(
    () => [],
  );

  const demostraciones: Demostracion[] = [];

  for (const carpeta of carpetas) {
    if (!carpeta.isDirectory()) continue;
    const libroId = carpeta.name;
    const archivos = await readdir(path.join(DEMOSTRACIONES, libroId));

    for (const archivo of archivos) {
      if (!archivo.endsWith(".tex")) continue;

      const slug = archivo.slice(0, -4);
      const { meta, cuerpo } = partir(
        await readFile(path.join(DEMOSTRACIONES, libroId, archivo), "utf8"),
      );

      demostraciones.push({
        id: `${libroId}/${slug}`,
        slug,
        libroId,
        titulo: meta.titulo ?? slug,
        tema: meta.tema ?? "",
        dificultad: aDificultad(meta.dificultad),
        etiquetas: meta.etiquetas
          ? meta.etiquetas.split(",").map((e) => e.trim()).filter(Boolean)
          : [],
        latex: cuerpo,
        actualizada: meta.actualizada ?? "",
      });
    }
  }

  return { materias, libros, demostraciones };
}

function contenido() {
  cache ??= leerTodo();
  return cache;
}

/* ── Accesos ────────────────────────────────────────────────────────────── */

export async function getMaterias(): Promise<Materia[]> {
  const { materias } = await contenido();
  return [...materias].sort(
    (a, b) => a.semestre - b.semestre || a.nombre.localeCompare(b.nombre, "es"),
  );
}

export async function getMateria(slug: string): Promise<Materia | undefined> {
  const { materias } = await contenido();
  return materias.find((m) => m.slug === slug);
}

/** Materias con las cifras que muestra su portada. */
export async function getMateriasConResumen(): Promise<MateriaConResumen[]> {
  const { libros, demostraciones } = await contenido();
  const materias = await getMaterias();

  return materias.map((materia) => {
    const suyos = libros.filter((l) => l.materiaId === materia.id);
    const ids = new Set(suyos.map((l) => l.id));
    const suyas = demostraciones.filter((d) => ids.has(d.libroId));
    const fechas = suyas.map((d) => d.actualizada).filter(Boolean).sort();

    return {
      ...materia,
      numLibros: suyos.length,
      numDemostraciones: suyas.length,
      ultimaActualizacion: fechas.at(-1),
    };
  });
}

export async function getLibros(materiaId: string): Promise<Libro[]> {
  const { libros } = await contenido();
  return libros.filter((l) => l.materiaId === materiaId);
}

export async function getLibro(
  materiaId: string,
  slug: string,
): Promise<Libro | undefined> {
  const { libros } = await contenido();
  return libros.find((l) => l.materiaId === materiaId && l.slug === slug);
}

export async function getDemostraciones(
  libroId: string,
): Promise<Demostracion[]> {
  const { demostraciones } = await contenido();
  return demostraciones.filter((d) => d.libroId === libroId);
}

export async function getDemostracion(
  libroId: string,
  slug: string,
): Promise<Demostracion | undefined> {
  const { demostraciones } = await contenido();
  return demostraciones.find((d) => d.libroId === libroId && d.slug === slug);
}

/* ── Rutas para la exportacion estatica ────────────────────────────────────
   Al compilar no hay servidor, asi que hay que enumerar de antemano cada
   pagina que existira.                                                     */

export async function getRutasLibros(): Promise<
  { materia: string; libro: string }[]
> {
  const { materias, libros } = await contenido();
  return libros.flatMap((libro) => {
    const materia = materias.find((m) => m.id === libro.materiaId);
    return materia ? [{ materia: materia.slug, libro: libro.slug }] : [];
  });
}

export async function getRutasDemostraciones(): Promise<
  { materia: string; libro: string; demostracion: string }[]
> {
  const { materias, libros, demostraciones } = await contenido();
  return demostraciones.flatMap((demostracion) => {
    const libro = libros.find((l) => l.id === demostracion.libroId);
    const materia = libro && materias.find((m) => m.id === libro.materiaId);
    return libro && materia
      ? [
          {
            materia: materia.slug,
            libro: libro.slug,
            demostracion: demostracion.slug,
          },
        ]
      : [];
  });
}
