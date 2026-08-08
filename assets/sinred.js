/**
 * Da de alta el guardián que deja leer el sitio sin internet.
 *
 * Va aquí y no en cada página: el archivo que hace el trabajo es `sw.js`, en la
 * raíz, y desde ahí puede guardar el sitio entero. Se le llama con una ruta
 * calculada desde este mismo script para que dé igual a qué profundidad esté la
 * página que lo carga, y para que funcione igual publicado en la raíz de un
 * dominio que en una carpeta dentro de él.
 *
 * Con `file://` no se registra nada y no pasa nada: el navegador no permite
 * guardianes fuera de http. El sitio se lee igual, solo que sin copia.
 */
(function () {
  "use strict";

  if (!("serviceWorker" in navigator)) return;
  if (location.protocol === "file:") return;

  var yo = document.currentScript && document.currentScript.src;
  if (!yo) return;

  /* assets/sinred.js → la raíz del sitio está un piso más arriba. */
  var raiz = new URL("../", yo);

  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register(new URL("sw.js", raiz), { scope: raiz.pathname })
      .catch(function () {
        /* Sin copia offline; el sitio se lee igual mientras haya red. */
      });
  });
})();
