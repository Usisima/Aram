import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * En desarrollo Next bloquea las peticiones a sus recursos internos que no
   * vengan de localhost. Esto habilita el acceso desde otros equipos de la red
   * local (por ejemplo, el telefono) al servidor de desarrollo.
   *
   * Solo afecta a `next dev`; en produccion se ignora.
   */
  allowedDevOrigins: ["192.168.1.161", "192.168.1.*"],
};

export default nextConfig;
