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

/** Bibliografia y temario de una materia. */
export default async function MateriaPage({ params }: Props) {
  const { materia: slug } = await params;
  const materia = await getMateria(slug);
  if (!materia) notFound();

  const libros = await getLibros(materia.id);
  const horas = materia.temario.reduce((a, t) => a + (t.horas ?? 0), 0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs
        migas={[
          { nombre: "Materias", href: "/materias" },
          { nombre: materia.nombre },
        ]}
      />

      <h1
        className="text-2xl tracking-tight"
        style={{ borderLeft: `3px solid ${materia.color}`, paddingLeft: "0.7rem" }}
      >
        {materia.nombre}
      </h1>
      <p className="mt-3 mb-12 text-xs text-muted">
        Clave {materia.clave} · {materia.creditos} créditos · semestre{" "}
        {materia.semestre}
        {horas > 0 && ` · ${horas} horas`}
      </p>

      <section className="mb-14">
        <h2 className="mb-5 text-xs tracking-[0.2em] text-muted uppercase">
          Bibliografía
        </h2>

        {libros.length === 0 ? (
          <p className="text-sm text-muted">
            Esta materia todavía no tiene bibliografía registrada.
          </p>
        ) : (
          <ul className="flex flex-col">
            {libros.map((libro) => (
              <li key={libro.id}>
                <Link
                  href={`/materias/${materia.slug}/${libro.slug}`}
                  className="flex flex-col gap-1 border-b border-border py-4 transition-colors hover:bg-surface"
                >
                  <span>{libro.titulo}</span>
                  <span className="text-sm text-muted">
                    {libro.autor}
                    {libro.editorial && ` · ${libro.editorial}`}
                    {libro.anio && ` · ${libro.anio}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {materia.temario.length > 0 && (
        <section>
          <h2 className="mb-5 text-xs tracking-[0.2em] text-muted uppercase">
            Temario
          </h2>

          <ol className="flex flex-col gap-7">
            {materia.temario.map((tema) => (
              <li key={tema.num}>
                <h3 className="flex items-baseline gap-3">
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: materia.color }}
                  >
                    {tema.num}
                  </span>
                  <span>{tema.nombre}</span>
                  {tema.horas > 0 && (
                    <span className="ml-auto text-xs text-muted">
                      {tema.horas} h
                    </span>
                  )}
                </h3>

                <ul className="mt-2 flex flex-col gap-1 pl-7">
                  {tema.subtemas.map((subtema) => (
                    <li key={subtema} className="text-sm text-muted">
                      {subtema}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
