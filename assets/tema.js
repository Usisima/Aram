/**
 * Tema claro/oscuro.
 *
 * Por defecto manda la preferencia del sistema; si el usuario elige a mano, su
 * eleccion se guarda y pisa a la del sistema mediante data-tema en el <html>.
 *
 * Este script va en el <head> y sin defer a proposito: el atributo tiene que
 * estar puesto antes del primer pintado o se ve un fogonazo del tema
 * equivocado. Es la unica parte que necesita bloquear, y son cuatro lineas.
 */
(function () {
  "use strict";

  var CLAVE = "aram_tema";
  var raiz = document.documentElement;
  var boton;

  function guardado() {
    try {
      return localStorage.getItem(CLAVE);
    } catch (e) {
      return null; /* modo privado o cookies bloqueadas */
    }
  }

  /* Antes de nada: aplicar lo que hubiera guardado. */
  var elegido = guardado();
  if (elegido === "claro" || elegido === "oscuro") {
    raiz.setAttribute("data-tema", elegido);
  }

  function actual() {
    var puesto = raiz.getAttribute("data-tema");
    if (puesto) return puesto;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "oscuro"
      : "claro";
  }

  function rotular() {
    if (!boton) return;
    var oscuro = actual() === "oscuro";
    /* El icono anuncia el destino, no el estado: se pulsa para ir al otro. */
    boton.textContent = oscuro ? "☀" : "☾";
    boton.setAttribute(
      "aria-label",
      oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
    );
  }

  function alternar() {
    var nuevo = actual() === "oscuro" ? "claro" : "oscuro";
    raiz.setAttribute("data-tema", nuevo);
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch (e) {}
    rotular();
  }

  function montar() {
    boton = document.createElement("button");
    boton.className = "tema";
    boton.type = "button";
    boton.addEventListener("click", alternar);
    rotular();
    document.body.appendChild(boton);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar);
  } else {
    montar();
  }

  /** Vuelve a poner el tema que este guardado, venga de donde venga el cambio. */
  function repasar() {
    var g = guardado();
    if (g === "claro" || g === "oscuro") raiz.setAttribute("data-tema", g);
    else raiz.removeAttribute("data-tema");
    rotular();
  }

  /* Al volver con el gesto de retroceso.
     El navegador guarda la pagina entera y la devuelve tal cual: con el tema
     que tenia puesto cuando se salio de ella. Se cambiaba el modo, se volvia
     atras y esa pagina seguia en el anterior hasta recargarla a mano. */
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) repasar();
  });

  /* Y si se cambia desde otra pestaña, esta se entera. */
  window.addEventListener("storage", function (e) {
    if (e.key === CLAVE) repasar();
  });
})();
