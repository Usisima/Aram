import type { Metadata } from "next";
import MateriaLibro from "@/components/MateriaLibro";
import { getMateriasConResumen } from "@/lib/data";

export const metadata: Metadata = { title: "Materias" };

/**
 * Fecha fijada a UTC y a una configuracion regional concreta: el texto se
 * compone aqui, en el servidor, y viaja ya hecho al componente de cliente,
 * asi que no puede haber discrepancia al hidratar.
 */
const FECHA = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Estanteria de materias. Cada una se dibuja como un libro fisico, no como
 * una tarjeta: ver MateriaLibro.
 */
export default async function MateriasPage() {
  const materias = await getMateriasConResumen();

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <header className="mb-10">
        <h1 className="text-2xl tracking-tight">Materias</h1>
        <p className="mt-1 text-sm text-muted">
          Cada volumen reúne los libros y las demostraciones de una disciplina.
        </p>
      </header>

      <ul className="grid grid-cols-3 gap-5 sm:gap-7 md:grid-cols-4 lg:grid-cols-5">
        {materias.map((materia) => (
          <li key={materia.id}>
            <MateriaLibro
              nombre={materia.nombre}
              color={materia.color}
              href={`/materias/${materia.slug}`}
              numLibros={materia.numLibros}
              numDemostraciones={materia.numDemostraciones}
              ultimaActualizacion={
                materia.ultimaActualizacion
                  ? FECHA.format(new Date(`${materia.ultimaActualizacion}T00:00:00Z`))
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
