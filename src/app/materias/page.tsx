import type { Metadata } from "next";
import MateriaDisco from "@/components/MateriaDisco";
import { getMateriasConResumen } from "@/lib/data";

export const metadata: Metadata = { title: "Materias" };

/** Discoteca de materias: cada asignatura del plan es un disco. */
export default async function MateriasPage() {
  const materias = await getMateriasConResumen();

  // Se agrupan por semestre, que es el orden natural del plan de estudios.
  const semestres = [...new Set(materias.map((m) => m.semestre))].sort(
    (a, b) => a - b,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <header className="mb-12">
        <h1 className="text-2xl tracking-tight">Materias</h1>
        <p className="mt-1 text-sm text-muted">
          Matemáticas · Facultad de Ciencias, UNAM
        </p>
      </header>

      {semestres.map((semestre) => (
        <section key={semestre} className="mb-14">
          <h2 className="mb-6 text-xs tracking-[0.2em] text-muted uppercase">
            Semestre {semestre}
          </h2>

          {/* Tres discos en telefono, como pediste; mas columnas al ensanchar. */}
          <ul className="grid grid-cols-3 gap-x-5 gap-y-9 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-5">
            {materias
              .filter((m) => m.semestre === semestre)
              .map((materia) => (
                <li key={materia.id}>
                  <MateriaDisco
                    nombre={materia.nombre}
                    color={materia.color}
                    href={`/materias/${materia.slug}`}
                    portada={materia.portada}
                    numLibros={materia.numLibros}
                    numDemostraciones={materia.numDemostraciones}
                  />
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
