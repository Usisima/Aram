/**
 * Fuente de datos temporal, en memoria.
 *
 * Existe para que las paginas se puedan construir y revisar antes de decidir
 * la base de datos. Cuando entre PostgreSQL, estas funciones se reemplazan por
 * consultas reales y las paginas no deberian cambiar: por eso todas son async
 * desde ya.
 */

import type { Demostracion, Libro, Materia } from "./types";

export const materias: Materia[] = [
  {
    id: "m-algebra",
    slug: "algebra",
    nombre: "Álgebra",
    color: "#7c3aed",
    descripcion: "Estructuras algebraicas, grupos, anillos y cuerpos.",
    portada: "",
  },
  {
    id: "m-calculo",
    slug: "calculo",
    nombre: "Cálculo",
    color: "#0d9488",
    descripcion: "Límites, derivadas, integrales y series.",
    portada: "",
  },
  {
    id: "m-topologia",
    slug: "topologia",
    nombre: "Topología",
    color: "#c2410c",
    descripcion: "Espacios topológicos, continuidad, compacidad y conexidad.",
    portada: "",
  },
  {
    id: "m-geometria-diferencial",
    slug: "geometria-diferencial",
    nombre: "Geometría Diferencial",
    color: "#1d4ed8",
    descripcion: "Variedades, curvatura y formas diferenciales.",
    portada: "",
  },
  {
    id: "m-probabilidad",
    slug: "probabilidad",
    nombre: "Probabilidad",
    color: "#b91c1c",
    descripcion: "Espacios de probabilidad, variables aleatorias y convergencia.",
    portada: "",
  },
  {
    id: "m-analisis-real",
    slug: "analisis-real",
    nombre: "Análisis Real",
    color: "#0369a1",
    descripcion: "Construcción de los reales, medida e integración de Lebesgue.",
    portada: "",
  },
  {
    id: "m-analisis-complejo",
    slug: "analisis-complejo",
    nombre: "Análisis Complejo",
    color: "#a21caf",
    descripcion: "Funciones holomorfas, series de Laurent y residuos.",
    portada: "",
  },
  {
    id: "m-logica",
    slug: "logica",
    nombre: "Lógica",
    color: "#4d7c0f",
    descripcion: "Lógica proposicional, de primer orden y teoremas de completitud.",
    portada: "",
  },
  {
    id: "m-teoria-numeros",
    slug: "teoria-de-numeros",
    nombre: "Teoría de Números",
    color: "#a16207",
    descripcion: "Divisibilidad, congruencias y distribución de los primos.",
    portada: "",
  },
];

export const libros: Libro[] = [
  {
    id: "l-apostol",
    slug: "apostol",
    materiaId: "m-calculo",
    titulo: "Calculus, Vol. I",
    autor: "Tom M. Apostol",
    edicion: "2.ª edición",
    anio: 1967,
    portada: "",
    descripcion:
      "Introducción al cálculo desde la integral, con énfasis en el rigor y en el álgebra lineal.",
  },
  {
    id: "l-spivak",
    slug: "spivak",
    materiaId: "m-calculo",
    titulo: "Calculus",
    autor: "Michael Spivak",
    edicion: "4.ª edición",
    anio: 2008,
    portada: "",
    descripcion:
      "Curso de cálculo tratado como análisis: construye los reales y demuestra cada resultado.",
  },
  {
    id: "l-stewart",
    slug: "stewart",
    materiaId: "m-calculo",
    titulo: "Cálculo de una variable",
    autor: "James Stewart",
    edicion: "8.ª edición",
    anio: 2015,
    portada: "",
    descripcion: "Curso estándar de cálculo, orientado a aplicaciones y a gran volumen de ejercicios.",
  },
  {
    id: "l-rudin",
    slug: "rudin",
    materiaId: "m-analisis-real",
    titulo: "Principles of Mathematical Analysis",
    autor: "Walter Rudin",
    edicion: "3.ª edición",
    anio: 1976,
    portada: "",
    descripcion:
      "El «Baby Rudin»: análisis en espacios métricos, con demostraciones muy compactas.",
  },
];

export const demostraciones: Demostracion[] = [
  {
    id: "d-tfc",
    slug: "teorema-fundamental-del-calculo",
    libroId: "l-spivak",
    titulo: "Demostración del Teorema Fundamental del Cálculo",
    tema: "Integración",
    dificultad: "intermedia",
    etiquetas: ["integral", "continuidad", "derivada"],
    latex: String.raw`\begin{teorema}
Sea $f$ integrable en $[a,b]$ y definamos $F(x)=\int_a^x f(t)\,dt$.
Si $f$ es continua en $c \in [a,b]$, entonces $F$ es derivable en $c$ y
\[
  F'(c) = f(c).
\]
\end{teorema}

\begin{demostracion}
Para $h \neq 0$ con $c+h \in [a,b]$,
\[
  \frac{F(c+h)-F(c)}{h} = \frac{1}{h}\int_c^{c+h} f(t)\,dt .
\]
Sea $\varepsilon > 0$. Por continuidad de $f$ en $c$ existe $\delta>0$ tal que
$|t-c|<\delta$ implica $|f(t)-f(c)|<\varepsilon$. Entonces, para $0<|h|<\delta$,
\[
  \left| \frac{1}{h}\int_c^{c+h} f(t)\,dt - f(c) \right|
  = \left| \frac{1}{h}\int_c^{c+h} \bigl(f(t)-f(c)\bigr)\,dt \right|
  \le \varepsilon .
\]
Por lo tanto el límite existe y vale $f(c)$. \qed
\end{demostracion}`,
    actualizada: "2026-07-31",
  },
  {
    id: "d-valor-medio",
    slug: "teorema-del-valor-medio",
    libroId: "l-spivak",
    titulo: "Teorema del valor medio",
    tema: "Derivadas",
    dificultad: "introductoria",
    etiquetas: ["derivada", "Rolle"],
    latex: String.raw`\begin{teorema}
Si $f$ es continua en $[a,b]$ y derivable en $(a,b)$, existe $c \in (a,b)$ con
\[
  f'(c) = \frac{f(b)-f(a)}{b-a}.
\]
\end{teorema}

\begin{demostracion}
Definimos
\[
  g(x) = f(x) - \frac{f(b)-f(a)}{b-a}\,(x-a).
\]
Entonces $g$ es continua en $[a,b]$, derivable en $(a,b)$ y $g(a)=g(b)=f(a)$.
Por el teorema de Rolle existe $c \in (a,b)$ tal que $g'(c)=0$, es decir
$f'(c) = \dfrac{f(b)-f(a)}{b-a}$. \qed
\end{demostracion}`,
    actualizada: "2026-07-31",
  },
  {
    id: "d-heine-borel",
    slug: "heine-borel",
    libroId: "l-rudin",
    titulo: "Teorema de Heine-Borel",
    tema: "Compacidad",
    dificultad: "avanzada",
    etiquetas: ["compacidad", "espacios métricos", "cubrimientos"],
    latex: String.raw`\begin{teorema}
Un subconjunto $K \subseteq \mathbb{R}^n$ es compacto si y sólo si es cerrado y acotado.
\end{teorema}

\begin{demostracion}
Esbozo. Si $K$ es compacto, el cubrimiento por bolas $B(0,m)$ con $m \in \mathbb{N}$
admite subcubrimiento finito, luego $K$ es acotado; y el complemento de $K$ es
abierto separando puntos, luego $K$ es cerrado.

Recíprocamente, si $K$ es cerrado y acotado está contenido en una celda
$[-r,r]^n$, que es compacta por bisección sucesiva, y todo cerrado dentro de un
compacto es compacto. \qed
\end{demostracion}`,
    actualizada: "2026-07-31",
  },
];

/* ── Accesos ───────────────────────────────────────────────────────────────
   Async a proposito: cuando esto sea PostgreSQL, la firma no cambia.        */

export async function getMaterias(): Promise<Materia[]> {
  return materias;
}

export async function getMateria(slug: string): Promise<Materia | undefined> {
  return materias.find((m) => m.slug === slug);
}

export async function getLibros(materiaId: string): Promise<Libro[]> {
  return libros.filter((l) => l.materiaId === materiaId);
}

export async function getLibro(
  materiaId: string,
  slug: string,
): Promise<Libro | undefined> {
  return libros.find((l) => l.materiaId === materiaId && l.slug === slug);
}

export async function getDemostraciones(libroId: string): Promise<Demostracion[]> {
  return demostraciones.filter((d) => d.libroId === libroId);
}

export async function getDemostracion(
  libroId: string,
  slug: string,
): Promise<Demostracion | undefined> {
  return demostraciones.find((d) => d.libroId === libroId && d.slug === slug);
}
