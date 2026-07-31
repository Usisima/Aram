import Link from "next/link";

export interface Miga {
  nombre: string;
  href?: string;
}

/** Navegacion Materias -> Materia -> Libro -> Demostracion. */
export default function Breadcrumbs({ migas }: { migas: Miga[] }) {
  return (
    <nav aria-label="Ruta" className="mb-8 flex flex-wrap gap-2 text-sm text-muted">
      {migas.map((miga, i) => (
        <span key={i} className="flex gap-2">
          {miga.href ? (
            <Link href={miga.href} className="hover:text-foreground">
              {miga.nombre}
            </Link>
          ) : (
            <span className="text-foreground">{miga.nombre}</span>
          )}
          {i < migas.length - 1 && <span aria-hidden="true">/</span>}
        </span>
      ))}
    </nav>
  );
}
