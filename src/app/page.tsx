import Link from "next/link";
import Intro from "@/components/Intro";

/**
 * Pantalla principal. El prompt de desarrollo la deja explicitamente sin
 * especificar, asi que por ahora solo monta la intro animada y da entrada a
 * las materias.
 */
export default function Home() {
  return (
    <>
      <Intro />

      <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-32 text-center">
        <h1 className="text-3xl tracking-tight">Biblioteca de demostraciones</h1>
        <p className="text-muted">
          Demostraciones matemáticas escritas en LaTeX, organizadas por materia y
          por libro.
        </p>
        <Link
          href="/materias"
          className="rounded-full border border-border px-5 py-2 text-sm transition-colors hover:bg-surface"
        >
          Ver materias
        </Link>
      </section>
    </>
  );
}
