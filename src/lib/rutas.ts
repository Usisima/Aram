/**
 * El sitio se publica en una subruta (usisima.github.io/Aram), no en la raiz.
 *
 * Next antepone ese prefijo solo a los enlaces de <Link> y a sus propios
 * recursos. Lo que se referencia a mano desde public/ —incluido el src de una
 * imagen sin optimizar— hay que componerlo aqui, o en produccion da 404.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function recurso(ruta: string): string {
  if (!ruta) return "";
  // Una URL absoluta no lleva prefijo.
  if (/^https?:\/\//.test(ruta)) return ruta;
  return `${BASE}${ruta.startsWith("/") ? "" : "/"}${ruta}`;
}
