/**
 * El modo claro u oscuro, elegido una vez y recordado en todo el sitio.
 *
 * El sitio nace siguiendo al teléfono: si el sistema está en oscuro, papel negro
 * y tinta clara. Este botón permite llevar la contraria, y esa contraria vale
 * para todas las páginas —son ciento cuarenta y cinco documentos sueltos, así
 * que la elección tiene que vivir fuera de cualquiera de ellos: se guarda en el
 * almacén del navegador, que es del sitio entero y no de la página.
 *
 * Aquí NO se aplica el modo al cargar. Eso lo hace un trozo suelto que va en la
 * cabecera de cada página, escrito en línea a propósito: tiene que estar
 * decidido antes del primer fotograma, y un archivo como este llega más tarde
 * —se vería un destello del modo anterior en cada cambio de página—. Este
 * archivo solo se ocupa de lo que pasa después: el botón y las otras pestañas.
 *
 * Sin él el botón no hace nada, y el sitio sigue el modo del teléfono como
 * siempre; por eso el botón se esconde donde no haya JavaScript.
 */
(function () {
  "use strict";

  var raiz = document.documentElement;
  var boton = document.querySelector(".tema");
  if (!boton) return;

  /* Qué se está viendo ahora mismo: lo elegido, si se eligió algo, y si no, lo
     que diga el teléfono. */
  function enClaro() {
    if (raiz.dataset.tema) return raiz.dataset.tema === "claro";
    return !matchMedia("(prefers-color-scheme: dark)").matches;
  }

  /* El botón dice a dónde lleva, no dónde se está: se toca para cambiar. */
  function etiquetar() {
    var va = enClaro() ? "oscuro" : "claro";
    boton.setAttribute("aria-label", "Cambiar a modo " + va);
    boton.setAttribute("title", "Cambiar a modo " + va);
  }

  function poner(modo) {
    raiz.dataset.tema = modo;
    try {
      localStorage.setItem("tema", modo);
    } catch (_) {
      /* Sin almacén —modo privado, permisos— el cambio vale para esta página y
         se pierde al pasar a la siguiente. Es peor que recordarlo, y mejor que
         no dejar cambiarlo. */
    }
    etiquetar();
  }

  boton.addEventListener("click", function () {
    var siguiente = enClaro() ? "oscuro" : "claro";
    /* Con un fundido, que el cambio de golpe de blanco a negro deslumbra. Si el
       navegador no sabe hacerlo, o si se ha pedido no ver movimiento, cambia
       directamente. */
    if (
      document.startViewTransition &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      document.startViewTransition(function () {
        poner(siguiente);
      });
    } else {
      poner(siguiente);
    }
  });

  /* Otra pestaña del sitio abierta: el almacén avisa a las demás, y cambian sin
     tener que recargarlas. */
  addEventListener("storage", function (e) {
    if (e.key !== "tema") return;
    if (e.newValue === "claro" || e.newValue === "oscuro") raiz.dataset.tema = e.newValue;
    else delete raiz.dataset.tema;
    etiquetar();
  });

  etiquetar();
})();
