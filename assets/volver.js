/**
 * El botón de regresar no deja rastro en el historial.
 *
 * Entrar a un libro desde su materia y salir con el botón dejaba tres pasos
 * donde tenía que haber dos: materias → materia → libro → materia. Con el gesto
 * de atrás se volvía al libro del que se acababa de salir, que es justo lo que
 * no se quiere.
 *
 * Dos casos, y cada uno pide una cosa distinta:
 *
 *  · **Se llegó desde uno de los sitios de los que se sale.** Entonces ese sitio
 *    ya está un paso atrás en el historial: se retrocede en vez de navegar. La
 *    página desaparece del camino y el gesto de atrás lleva a lo que había
 *    antes, que es lo que se espera.
 *
 *  · **Se llegó de otro sitio** —un enlace compartido, el buscador, otro
 *    libro—. Ahí no hay nada atrás que sirva, así que se navega SUSTITUYENDO
 *    la entrada actual en vez de añadir una: tampoco queda en el camino, pero no
 *    se pierde de dónde se venía.
 *
 * Cuáles son «los sitios de los que se sale»: a donde apunta el botón y, si lo
 * lleva escrito, el de `data-salida`. Son dos por esto: a la ficha de un
 * matemático se llega desde el índice de matemáticos o desde el resumen de la
 * portada de matemáticas, sin pasar por el índice, y regresar tiene que
 * devolver por donde se vino. El enlace apunta al índice —la salida de quien
 * llega de fuera— y el otro camino va apuntado aparte.
 *
 * Sin este archivo el botón sigue funcionando: es un enlace normal y lleva a la
 * materia. Lo único que se pierde es la limpieza del historial.
 */
(function () {
  "use strict";

  var boton = document.querySelector(".barra .volver");
  if (!boton) return;

  /* La misma página se escribe de dos maneras: el generador siempre pone
     `index.html`, pero un servidor la sirve igual sin él, y de ahí vendría el
     rastro si se llegó tecleando o desde fuera. Se comparan sin esa cola y sin
     lo que va después de la dirección, que no cambia de página. */
  function igual(a, b) {
    if (!a || !b) return false;
    try {
      var x = new URL(a), y = new URL(b);
      var pela = function (u) { return u.origin + u.pathname.replace(/index\.html$/, ""); };
      return pela(x) === pela(y);
    } catch (_) {
      return a === b;
    }
  }

  boton.addEventListener("click", function (e) {
    /* Con una tecla o el botón central se abre en otra pestaña: eso no es
       regresar y no se toca. */
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();

    var destino = boton.href;
    var salidas = [destino];
    if (boton.dataset.salida) salidas.push(new URL(boton.dataset.salida, location.href).href);
    var vengoDeAhi = salidas.some(function (s) {
      return igual(document.referrer, s);
    });

    if (vengoDeAhi && history.length > 1) history.back();
    else location.replace(destino);
  });
})();
