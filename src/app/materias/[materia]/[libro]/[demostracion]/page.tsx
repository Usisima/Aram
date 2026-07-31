import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import Latex from "@/components/Latex";
import { getDemostracion, getLibro, getMateria } from "@/lib/data";

interface Props {
  params: Promise<{ materia: string; libro: string; demostracion: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { materia: sm, libro: sl, demostracion: sd } = await params;
  const materia = await getMateria(sm);
  const libro = materia ? await getLibro(materia.id, sl) : undefined;
  const demostracion = libro ? await getDemostracion(libro.id, sd) : undefined;
  return { title: demostracion?.titulo ?? "Demostración" };
}

/** Ficha completa de una demostracion, con el LaTeX ya renderizado. */
export default async function DemostracionPage({ params }: Props) {
  const { materia: sm, libro: sl, demostracion: sd } = await params;

  const materia = await getMateria(sm);
  if (!materia) notFound();

  const libro = await getLibro(materia.id, sl);
  if (!libro) notFound();

  const demostracion = await getDemostracion(libro.id, sd);
  if (!demostracion) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs
        migas={[
          { nombre: "Materias", href: "/materias" },
          { nombre: materia.nombre, href: `/materias/${materia.slug}` },
          {
            nombre: libro.titulo,
            href: `/materias/${materia.slug}/${libro.slug}`,
          },
          { nombre: demostracion.titulo },
        ]}
      />

      <h1 className="text-2xl tracking-tight">{demostracion.titulo}</h1>

      <p className="mt-2 mb-10 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>{demostracion.tema}</span>
        <span aria-hidden="true">·</span>
        <span>{demostracion.dificultad}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={demostracion.actualizada}>
          actualizada el {demostracion.actualizada}
        </time>
      </p>

      <Latex fuente={demostracion.latex} />
    </article>
  );
}
