import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getLibros, getMateria, getMaterias } from "@/lib/data";

interface Props {
  params: Promise<{ materia: string }>;
}

/** El sitio se exporta estatico: hay que enumerar cada pagina al compilar. */
export async function generateStaticParams() {
  const materias = await getMaterias();
  return materias.map((materia) => ({ materia: materia.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { materia: slug } = await params;
  const materia = await getMateria(slug);
  return { title: materia?.nombre ?? "Materia" };
}

/** Libros de una materia. Cada uno se muestra como portada. */
export default async function MateriaPage({ params }: Props) {
  const { materia: slug } = await params;
  const materia = await getMateria(slug);
  if (!materia) notFound();

  const libros = await getLibros(materia.id);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Breadcrumbs
        migas={[
          { nombre: "Materias", href: "/materias" },
          { nombre: materia.nombre },
        ]}
      />

      <h1 className="mb-2 text-2xl tracking-tight">{materia.nombre}</h1>
      <p className="mb-8 text-muted">{materia.descripcion}</p>

      {libros.length === 0 ? (
        <p className="text-muted">Todavía no hay libros en esta materia.</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
          {libros.map((libro) => (
            <li key={libro.id}>
              <Link
                href={`/materias/${materia.slug}/${libro.slug}`}
                className="flex h-full flex-col rounded-xl border border-border p-5 transition-transform hover:-translate-y-1"
              >
                <h2 className="text-lg">{libro.titulo}</h2>
                <p className="mt-1 text-sm">{libro.autor}</p>
                <p className="mt-1 text-xs text-muted">
                  {libro.edicion} · {libro.anio}
                </p>
                <p className="mt-3 text-sm text-muted">{libro.descripcion}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
