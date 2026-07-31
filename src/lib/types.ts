/**
 * Modelo de datos de la plataforma.
 *
 * Sigue la jerarquia del prompt de desarrollo: Materia -> Libro -> Demostracion.
 * Cada entidad lleva `id` (estable, el que usara la base de datos) y `slug`
 * (legible, el que aparece en la URL). El prompt solo pedia `id`, pero las
 * rutas publicas quedan mucho mejor como /materias/calculo/spivak que con
 * identificadores opacos.
 */

/** Nivel superior: Algebra, Calculo, Topologia, ... */
export interface Materia {
  id: string;
  slug: string;
  nombre: string;
  /** Color representativo de la materia, en hex. Tine la portada. */
  color: string;
  descripcion: string;
  /** Ruta de la ilustracion de portada. */
  portada: string;
}

/** Un volumen concreto dentro de una materia: Apostol, Spivak, Rudin, ... */
export interface Libro {
  id: string;
  slug: string;
  materiaId: string;
  titulo: string;
  autor: string;
  edicion: string;
  /**
   * El modelo de datos del prompt no incluye el anio, pero la portada si debe
   * mostrarlo, asi que lo agrego aqui.
   */
  anio: number;
  portada: string;
  descripcion: string;
}

export type Dificultad = "introductoria" | "intermedia" | "avanzada";

/** Una demostracion. En la lista se muestra como Pill. */
export interface Demostracion {
  id: string;
  slug: string;
  libroId: string;
  titulo: string;
  /** Tema al que pertenece dentro del libro: "Integracion", "Series", ... */
  tema: string;
  dificultad: Dificultad;
  etiquetas: string[];
  /** Fuente LaTeX de la demostracion. Es la unica fuente de verdad. */
  latex: string;
  /** ISO 8601. */
  actualizada: string;
}

/** Ruta completa hasta una demostracion, para breadcrumbs. */
export interface Ruta {
  materia: Materia;
  libro: Libro;
  demostracion?: Demostracion;
}
