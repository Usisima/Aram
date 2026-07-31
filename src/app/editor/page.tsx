import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editor" };

/**
 * Editor tipo Overleaf: dos paneles, Monaco a la izquierda y vista previa a
 * la derecha.
 *
 * Todavia no esta implementado. Antes hacen falta dos cosas que el prompt deja
 * abiertas: la autenticacion (esta ruta debe ser inaccesible para el publico)
 * y la persistencia, porque compilar tiene que poder guardar. @monaco-editor/react
 * ya esta instalado.
 */
export default function EditorPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-4 text-2xl tracking-tight">Editor</h1>
      <p className="text-muted">
        Pendiente. Requiere autenticación de administrador y una capa de
        persistencia antes de poder montarse.
      </p>
    </div>
  );
}
