/**
 * Modelo de datos de la plataforma.
 *
 * Jerarquia: Materia -> Libro -> Demostracion. Cada entidad lleva `id`
 * (el del plan de estudios, estable) y `slug` (legible, el que aparece en la
 * URL), para que las rutas queden como /materias/calculo-diferencial-e-integral-i
 * en vez de identificadores opacos.
 */

/** Una unidad del temario de una materia. */
export interface Tema {
  num: string;
  nombre: string;
  horas: number;
  subtemas: string[];
}

/** Nivel superior: una asignatura del plan de estudios. */
export interface Materia {
  id: string;
  slug: string;
  nombre: string;
  /** Color representativo, en hex. */
  color: string;
  /** Resumen corto; se compone a partir de los primeros temas. */
  descripcion: string;
  /** Clave de la asignatura en el plan. */
  clave: string;
  creditos: number;
  semestre: number;
  /** Ruta publica de la ilustracion que hace de cara del disco. */
  portada: string;
  temario: Tema[];
}

/** Un volumen de la bibliografia de una materia. */
export interface Libro {
  id: string;
  slug: string;
  materiaId: string;
  titulo: string;
  autor: string;
  /** Puede incluir el numero de edicion: "2ª ed. Reverté". */
  editorial: string;
  /** Ausente en los pocos titulos donde la fuente no lo indica. */
  anio?: number;
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
  /** Fuente LaTeX. Es la unica fuente de verdad del contenido. */
  latex: string;
  /** ISO 8601. */
  actualizada: string;
}

/**
 * Materia con las cifras que muestra su portada.
 *
 * No se guardan: se derivan contando los hijos, para que no puedan quedar
 * desincronizadas con el contenido real.
 */
export interface MateriaConResumen extends Materia {
  numLibros: number;
  numDemostraciones: number;
  /** ISO 8601. Ausente si la materia todavia no tiene demostraciones. */
  ultimaActualizacion?: string;
}
