import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Latex from "@/components/Latex";
import {
  getDemostracion,
  getLibro,
  getMateria,
  getRutasDemostraciones,
} from "@/lib/data";

interface Props {
  params: Promise<{ materia: string; libro: string; demostracion: string }>;
}

/** El sitio se exporta estatico: hay que enumerar cada pagina al compilar. */
export async function generateStaticParams() {
  return getRutasDemostraciones();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { materia: sm, libro: sl, demostracion: sd } = await params;
  const materia = await getMateria(sm);
  const libro = materia ? await getLibro(materia.id, sl) : undefined;
  const demostracion = libro ? await getDemostracion(libro.id, sd) : undefined;
  return { title: demostracion?.titulo ?? "Demostración" };
}

/**
 * Al abrir una Pill, la demostracion ocupa la pagina entera: nada de migas de
 * pan ni columnas laterales, solo un enlace de vuelta y el texto.
 */
export default async function DemostracionPage({ params }: Props) {
  const { materia: sm, libro: sl, demostracion: sd } = await params;

  const materia = await getMateria(sm);
  if (!materia) notFound();

  const libro = await getLibro(materia.id, sl);
  if (!libro) notFound();

  const demostracion = await getDemostracion(libro.id, sd);
  if (!demostracion) notFound();

  return (
    <article className="mx-auto min-h-full max-w-2xl px-6 py-16">
      <Link
        href={`/materias/${materia.slug}/${libro.slug}`}
        className="mb-14 inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        {libro.titulo}
      </Link>

      <header
        className="mb-14"
        style={{ borderLeft: `3px solid ${materia.color}`, paddingLeft: "0.9rem" }}
      >
        <h1 className="text-[1.6rem] leading-snug tracking-tight text-balance">
          {demostracion.titulo}
        </h1>

        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span>{materia.nombre}</span>
          <span aria-hidden="true">·</span>
          <span>{demostracion.tema}</span>
          <span aria-hidden="true">·</span>
          <span>{demostracion.dificultad}</span>
        </p>
      </header>

      <Latex fuente={demostracion.latex} />

      <footer className="mt-16 flex flex-wrap items-center gap-2 border-t border-border pt-6 text-xs text-muted">
        {demostracion.etiquetas.map((etiqueta) => (
          <span
            key={etiqueta}
            className="rounded-full border border-border px-2.5 py-1"
          >
            {etiqueta}
          </span>
        ))}
        {demostracion.actualizada && (
          <time dateTime={demostracion.actualizada} className="ml-auto">
            {demostracion.actualizada}
          </time>
        )}
      </footer>
    </article>
  );
}
