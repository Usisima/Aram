/**
 * Las flechas de una cabecera de sección.
 *
 * Un carrusel se pasa con el dedo, y en el teléfono eso basta y sobra: por eso
 * la hoja esconde las flechas donde no hay puntero. Con ratón no hay gesto
 * equivalente —arrastrar una lista horizontal con el ratón no lo hace nadie— y
 * la rueda desplaza la página, no la fila. Las flechas son para ese caso.
 *
 * Va en su propio archivo a propósito: `desplegable.js` anima alturas medidas y
 * `rejilla.js` cuadra la página contra la cuadrícula. Ninguna de las dos tiene
 * nada que ver con esto, y las dos costaron demasiado como para meterles dentro
 * una función que no les pertenece.
 *
 * No mide nada de la página ni mueve nada verticalmente: solo desplaza un
 * contenedor a lo ancho. La cuadrícula no se entera de que esto existe.
 */
(function () {
  "use strict";

  /* Cuánto se pasa de una vez: casi un ancho de ventana del carrusel, dejando
     una tarjeta a la vista. Pasar la fila entera y justa deja al lector sin
     ningún punto de referencia de por dónde iba; con una tarjeta repetida, el
     salto se lee como un avance y no como un corte. */
  function tranco(fila) {
    var primera = fila.firstElementChild;
    var ancho = primera ? primera.getBoundingClientRect().width : 0;
    var hueco = parseFloat(getComputedStyle(fila).columnGap) || 0;
    var paso = ancho + hueco;
    if (!paso) return fila.clientWidth;
    /* Un número entero de tarjetas, para que la fila no quede cortada por la
       mitad de ninguna. Al menos una. */
    var caben = Math.max(1, Math.floor(fila.clientWidth / paso) - 1);
    return caben * paso;
  }

  /** Si la fila ya está en un extremo, su flecha se apaga. */
  function repasar(fila, botones) {
    /* 2 px de margen: el desplazamiento es fraccionario y comparar exacto
       dejaba la flecha encendida al final de la fila para siempre. */
    var tope = fila.scrollWidth - fila.clientWidth - 2;
    botones.forEach(function (b) {
      var hacia = Number(b.getAttribute("data-hacia"));
      b.disabled = hacia < 0 ? fila.scrollLeft <= 2 : fila.scrollLeft >= tope;
    });
  }

  function montar() {
    var botones = Array.prototype.slice.call(
      document.querySelectorAll(".flecha[data-pasa]"),
    );
    if (!botones.length) return;

    /* Agrupados por la fila a la que mandan: las dos flechas de una cabecera
       tienen que apagarse y encenderse a la vez. */
    var porFila = new Map();
    botones.forEach(function (b) {
      var fila = document.getElementById(b.getAttribute("data-pasa"));
      if (!fila) return;
      if (!porFila.has(fila)) porFila.set(fila, []);
      porFila.get(fila).push(b);
    });

    porFila.forEach(function (suyos, fila) {
      suyos.forEach(function (b) {
        b.addEventListener("click", function () {
          fila.scrollBy({
            left: Number(b.getAttribute("data-hacia")) * tranco(fila),
            /* Quien ha pedido que no se le mueva la pantalla, no se le mueve:
               llega igual, pero de una vez. */
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
          });
        });
      });

      var espera;
      fila.addEventListener("scroll", function () {
        clearTimeout(espera);
        espera = setTimeout(function () {
          repasar(fila, suyos);
        }, 80);
      });

      /* Y al cambiar el ancho cambia cuánto cabe, así que cambia si sobra fila
         por pasar. */
      window.addEventListener("resize", function () {
        repasar(fila, suyos);
      });

      repasar(fila, suyos);
    });
  }

  /* Después de que la página esté cuadrada: hasta entonces `main` está oculto
     y las medidas de la fila son las de un elemento sin pintar. Si el aviso ya
     pasó —o no hay quien lo dé—, se monta igual. */
  if (document.documentElement.classList.contains("rejilla-esperando")) {
    document.addEventListener("aram:cuadrada", montar, { once: true });
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar);
  } else {
    montar();
  }
})();
