import type { NextConfig } from "next";

/**
 * El sitio vive en una subruta de usisima.github.io, no en la raiz.
 * Sensible a mayusculas: tiene que coincidir con el nombre del repositorio.
 */
const BASE = "/Aram";

const nextConfig: NextConfig = {
  /**
   * Next antepone basePath a los enlaces y a sus propios recursos, pero no al
   * src de una imagen sin optimizar ni a nada que se referencie a mano desde
   * public/. Se expone aqui para poder componer esas rutas (ver lib/rutas).
   */
  env: { NEXT_PUBLIC_BASE_PATH: BASE },

  /**
   * Exportacion estatica: `next build` escribe HTML, CSS y JS planos en out/,
   * sin servidor detras. Es lo que permite publicar gratis en GitHub Pages.
   *
   * La contrapartida: no hay renderizado en servidor ni rutas de API en
   * produccion. Todo el contenido tiene que conocerse al compilar, que es
   * justo el modelo que queremos: se publica lo que el editor local haya
   * guardado en el proyecto.
   */
  output: "export",

  basePath: BASE,

  /**
   * Cada ruta se escribe como carpeta con su index.html. Sin esto, un host
   * estatico no sabe resolver /materias sin extension.
   */
  trailingSlash: true,

  /** No hay servidor que optimice imagenes al vuelo. */
  images: { unoptimized: true },

  /**
   * Solo afecta a `next dev`: habilita abrir el servidor de desarrollo desde
   * otros equipos de la red local, por ejemplo el telefono.
   */
  allowedDevOrigins: ["192.168.1.161", "192.168.1.*"],
};

export default nextConfig;
