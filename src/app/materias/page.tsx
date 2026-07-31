import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getMaterias } from "@/lib/data";

export const metadata: Metadata = { title: "Materias" };

/**
 * Cuadricula de materias. El prompt pide que cada tarjeta parezca la portada
 * de un libro (ilustracion, color representativo, animacion al pasar el
 * cursor); esto todavia es la version estructural, sin ilustraciones.
 */
export default async function MateriasPage() {
  const materias = await getMaterias();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Breadcrumbs migas={[{ nombre: "Materias" }]} />

      <h1 className="mb-8 text-2xl tracking-tight">Materias</h1>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
        {materias.map((materia) => (
          <li key={materia.id}>
            <Link
              href={`/materias/${materia.slug}`}
              className="flex h-44 flex-col justify-end rounded-xl border border-border p-5 transition-transform hover:-translate-y-1"
              style={{
                background: `linear-gradient(160deg, ${materia.color}22, transparent 70%)`,
                borderTopColor: materia.color,
              }}
            >
              <h2 className="text-lg">{materia.nombre}</h2>
              <p className="mt-1 text-sm text-muted">{materia.descripcion}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
