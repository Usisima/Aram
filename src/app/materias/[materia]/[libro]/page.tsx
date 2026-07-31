import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getDemostraciones, getLibro, getMateria } from "@/lib/data";

interface Props {
  params: Promise<{ materia: string; libro: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { materia: slugMateria, libro: slugLibro } = await params;
  const materia = await getMateria(slugMateria);
  const libro = materia ? await getLibro(materia.id, slugLibro) : undefined;
  return { title: libro?.titulo ?? "Libro" };
}

/** Lista de demostraciones del libro. Cada una es una Pill. */
export default async function LibroPage({ params }: Props) {
  const { materia: slugMateria, libro: slugLibro } = await params;

  const materia = await getMateria(slugMateria);
  if (!materia) notFound();

  const libro = await getLibro(materia.id, slugLibro);
  if (!libro) notFound();

  const demostraciones = await getDemostraciones(libro.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs
        migas={[
          { nombre: "Materias", href: "/materias" },
          { nombre: materia.nombre, href: `/materias/${materia.slug}` },
          { nombre: libro.titulo },
        ]}
      />

      <h1 className="text-2xl tracking-tight">{libro.titulo}</h1>
      <p className="mb-8 text-muted">
        {libro.autor} · {libro.edicion} · {libro.anio}
      </p>

      {demostraciones.length === 0 ? (
        <p className="text-muted">Todavía no hay demostraciones en este libro.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {demostraciones.map((demostracion) => (
            <li key={demostracion.id}>
              <Link
                href={`/materias/${materia.slug}/${libro.slug}/${demostracion.slug}`}
                className="flex flex-col gap-2 rounded-full border border-border px-6 py-4 transition-colors hover:bg-surface"
              >
                <span>{demostracion.titulo}</span>
                <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>{demostracion.tema}</span>
                  {demostracion.etiquetas.map((etiqueta) => (
                    <span
                      key={etiqueta}
                      className="rounded-full border border-border px-2 py-0.5"
                    >
                      {etiqueta}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
