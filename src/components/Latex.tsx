import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Renderiza la fuente LaTeX de una demostracion.
 *
 * Es un Server Component a proposito: KaTeX corre en el servidor con
 * renderToString y al navegador solo le llega HTML ya compuesto, sin JS de
 * matematicas. Eso es lo que hace que la lectura publica sea instantanea.
 *
 * Cubre lo que necesitan las demostraciones del prompt: entornos de tipo
 * teorema y matematicas en linea ($...$) y en bloque (\[...\]). NO es un
 * compilador de LaTeX: no hay \documentclass, paquetes ni bibliografia. Si
 * el proyecto llega a necesitar documentos completos habra que montar un
 * servicio aparte con TeX Live.
 */

const ENTORNOS: Record<string, string> = {
  teorema: "Teorema",
  proposicion: "Proposición",
  lema: "Lema",
  corolario: "Corolario",
  definicion: "Definición",
  demostracion: "Demostración",
  observacion: "Observación",
  ejemplo: "Ejemplo",
};

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Sustituye las formulas por el HTML de KaTeX y deja el resto como texto. */
function componer(fuente: string): string {
  const trozos: string[] = [];
  const formula = /\\\[([\s\S]*?)\\\]|\$([^$]+)\$/g;
  let cursor = 0;
  let coincidencia: RegExpExecArray | null;

  while ((coincidencia = formula.exec(fuente)) !== null) {
    trozos.push(escaparHtml(fuente.slice(cursor, coincidencia.index)));

    const enBloque = coincidencia[1] !== undefined;
    const tex = (coincidencia[1] ?? coincidencia[2]).trim();

    trozos.push(
      katex.renderToString(tex, {
        displayMode: enBloque,
        throwOnError: false,
        strict: false,
      }),
    );

    cursor = formula.lastIndex;
  }

  trozos.push(escaparHtml(fuente.slice(cursor)));

  return trozos
    .join("")
    .replace(/\\qed/g, "<span aria-label=\"fin de la demostración\">∎</span>")
    .trim();
}

interface Bloque {
  entorno?: string;
  contenido: string;
}

/** Separa los \begin{...}...\end{...} del texto suelto que los rodea. */
function trocear(fuente: string): Bloque[] {
  const bloques: Bloque[] = [];
  const entorno = /\\begin\{(\w+)\}([\s\S]*?)\\end\{\1\}/g;
  let cursor = 0;
  let coincidencia: RegExpExecArray | null;

  while ((coincidencia = entorno.exec(fuente)) !== null) {
    const suelto = fuente.slice(cursor, coincidencia.index).trim();
    if (suelto) bloques.push({ contenido: suelto });

    bloques.push({ entorno: coincidencia[1], contenido: coincidencia[2].trim() });
    cursor = entorno.lastIndex;
  }

  const cola = fuente.slice(cursor).trim();
  if (cola) bloques.push({ contenido: cola });

  return bloques;
}

export default function Latex({ fuente }: { fuente: string }) {
  const bloques = trocear(fuente);

  return (
    <div className="flex flex-col gap-6 leading-relaxed">
      {bloques.map((bloque, i) => {
        const html = componer(bloque.contenido);

        if (!bloque.entorno) {
          return (
            <div key={i} dangerouslySetInnerHTML={{ __html: html }} />
          );
        }

        const titulo = ENTORNOS[bloque.entorno] ?? bloque.entorno;
        const esDemostracion = bloque.entorno === "demostracion";

        return (
          <section
            key={i}
            className={
              esDemostracion
                ? "border-l-2 border-border pl-5"
                : "rounded-xl border border-border bg-surface p-5"
            }
          >
            <h3 className="mb-2 text-xs tracking-[0.18em] text-muted uppercase">
              {titulo}
            </h3>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </section>
        );
      })}
    </div>
  );
}
