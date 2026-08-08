/**
 * Despliegue de las demostraciones.
 *
 * Cada demostración es un <details>: sin este archivo la pastilla ya abre y
 * cierra sola, con su teclado y su semántica. Lo que se añade aquí es lo que el
 * navegador no da:
 *
 *  1. La transición de alto. Un <details> aparece de golpe y toda la lista da
 *     un salto; con esto el contenido empuja la página hacia abajo.
 *  2. Volver a cuadrar contra la rejilla. Al abrirse un panel aparecen fórmulas
 *     de altura arbitraria que nadie había medido todavía.
 *  3. La dirección. Al abrir se refleja en el #ancla, y al cargar con un ancla
 *     se abre esa demostración: así un enlace sigue llevando a una sola, que es
 *     lo que antes hacían las páginas sueltas.
 *
 * Va con `defer` y no al final del <body> por el punto 3: los scripts diferidos
 * se ejecutan antes del DOMContentLoaded en el que rejilla.js mide, de modo que
 * la demostración que pide la dirección ya está abierta cuando le toca medir.
 * Abrirla después obligaría a recuadrar la página entera a la vista del lector.
 */
(function () {
  "use strict";

  /* La misma que la transición del CSS. */
  var DURA = 320;

  function recuadrar() {
    if (window.AramRejilla) window.AramRejilla.cuadrar();
  }

  /* Un fotograma a su ritmo dura unos 16 ms; por encima de esto el navegador
     venía de hacer algo gordo. */
  var A_TIEMPO = 34;

  /* Y como mucho se esperan seis: más vale una animación regular que ninguna. */
  var ESPERA_MAXIMA = 6;

  /**
   * Llama a `hacer` cuando el navegador haya terminado lo que tuviera pendiente.
   *
   * Abrir un panel obliga a calcular y pintar de golpe todo lo que había dentro
   * —cientos de elementos con sus fórmulas, que hasta ese momento no existían
   * en la pantalla—, y eso dura cientos de milisegundos. El reloj de una
   * transición corre en tiempo real desde que se le cambia el alto, así que
   * lanzarla ahí la dejaba empezada: lo primero que se veía era el panel a
   * media altura, y de ahí al final. El tirón que se notaba no era la
   * animación, era el trabajo de antes metido dentro de ella.
   *
   * Se espera a que dos fotogramas seguidos vayan a su ritmo, que es la señal
   * de que ya no queda nada pendiente.
   */
  function alCalmarse(hacer) {
    var antes = performance.now();
    var seguidos = 0;
    var vueltas = 0;

    requestAnimationFrame(function mira(ahora) {
      seguidos = ahora - antes < A_TIEMPO ? seguidos + 1 : 0;
      antes = ahora;
      if (seguidos >= 2 || ++vueltas >= ESPERA_MAXIMA) return hacer();
      requestAnimationFrame(mira);
    });
  }

  /**
   * Anima el alto del panel entre dos medidas en píxeles.
   *
   * En píxeles porque `auto` no se interpola: no hay nada entre cero y `auto`
   * que el navegador pueda dibujar. Al terminar se quita el alto en línea y el
   * panel vuelve a medir lo que mida su contenido.
   */
  function animar(panel, desde, hasta, alAcabar) {
    /* El panel no lleva relleno —lo lleva su caja de dentro—, así que aquí solo
       se mueve el alto: cerrar llega a cero de verdad y abrir descubre sin
       arrastrar el texto. */
    panel.style.overflow = "hidden";
    panel.style.height = desde + "px";

    /* Leer una medida obliga a recalcular la maqueta aquí mismo. Sin esto el
       navegador junta las dos asignaciones de alto en una sola y no queda
       transición que animar. */
    void panel.offsetHeight;

    var reserva;

    /* Y el viaje no empieza hasta que el navegador vaya al día. */
    alCalmarse(function () {
      panel.style.height = hasta + "px";
      /* La red de seguridad se arma aquí y no antes: contada desde antes de
         arrancar, saltaba con la animación aún a medias. */
      reserva = setTimeout(fin, DURA + 120);
    });

    function fin() {
      panel.removeEventListener("transitionend", alTerminar);
      clearTimeout(reserva);
      panel.style.overflow = "";
      panel.style.height = "";
      if (alAcabar) alAcabar();
    }

    function alTerminar(e) {
      /* Solo el alto de este panel: cualquier otra transición que burbujee
         desde dentro cerraría la animación antes de tiempo. */
      if (e.target !== panel || e.propertyName !== "height") return;
      fin();
    }

    panel.addEventListener("transitionend", alTerminar);
  }

  /* Los tres que se pliegan, cada uno con la caja que crece: la pastilla de una
     demostración, el recuadro de un teorema con su prueba y el tema de una
     materia. Se abren igual porque al leerlos son lo mismo: algo que estaba
     recogido y se despliega. */
  var PLEGABLES = "details.demo, details.prueba, details.grupo";
  var CUERPOS = ":scope > .demo-cuerpo, :scope > .prueba-cuerpo, :scope > .grupo-cuerpo";

  function panelDe(det) {
    return det.querySelector(CUERPOS);
  }

  /* Se abre primero y se cuadra, y solo entonces se mide para animar: así el
     estado final es el bueno desde el primer fotograma y al terminar no hay que
     recolocar nada. Todo ese trabajo —el primer cálculo de lo que había dentro
     y el cuadre contra la rejilla— cae antes de que el viaje arranque, no en
     mitad de él: de eso se encarga la espera de `animar`. */
  function abrir(det) {
    var panel = panelDe(det);
    det.open = true;
    recuadrar();
    /* Y otra vez al terminar. El alto que se mide aquí es el bueno, pero
       mientras el panel viaja lo de debajo se coloca contra un alto que todavía
       no es el final; sin este repaso la página se quedaba con las cajas hasta
       nueve píxeles fuera de raya, y el error crecía con cada una. */
    animar(panel, 0, panel.getBoundingClientRect().height, recuadrar);
  }

  /* Al revés, y sin recuadrar hasta el final: rejilla.js deja el panel con un
     número entero de celdas de alto, así que quitarlo de en medio no descoloca
     nada de lo que viene debajo y no hay salto que disimular. */
  function cerrar(det) {
    var panel = panelDe(det);

    function plegar() {
      det.open = false;
      recuadrar();
    }

    animar(panel, panel.getBoundingClientRect().height, 0, plegar);
  }

  /**
   * La dirección refleja lo último que se ha abierto, pero sin apilar entradas
   * en el historial: así se puede copiar el enlace de una demostración
   * concreta y el botón de atrás sigue saliendo de la página en vez de deshacer
   * clics uno a uno.
   *
   * Se pasa el estado al que va, no el que tiene: al cerrar, `det.open` sigue
   * siendo `true` hasta que la animación termina, y mirándolo se volvía a poner
   * el ancla de la que se acababa de salir.
   *
   * `replaceState` no dispara `hashchange`, así que esto no se pisa con el
   * oyente de abajo.
   */
  function marcar(det, abierta) {
    if (!det.id || !window.history || !history.replaceState) return;

    var limpia = location.pathname + location.search;

    if (abierta) history.replaceState(null, "", limpia + "#" + det.id);
    else if (location.hash === "#" + det.id)
      history.replaceState(null, "", limpia);
  }

  function alPulsar(e) {
    var det = e.currentTarget.parentNode;
    var abrirla = !det.open;

    /* Sin caja que animar, que lo abra el navegador como sabe. */
    if (!panelDe(det)) return;

    /* El navegador abriría de golpe; aquí se hace lo mismo pero animado. */
    e.preventDefault();

    if (abrirla) abrir(det);
    else cerrar(det);

    marcar(det, abrirla);
  }

  /** La demostración que pide la dirección, si es que pide alguna. */
  function pedida() {
    var det = location.hash
      ? document.getElementById(location.hash.slice(1))
      : null;
    return det && det.tagName === "DETAILS" ? det : null;
  }

  function montar() {
    var demos = document.querySelectorAll(PLEGABLES);
    if (!demos.length) return;

    Array.prototype.forEach.call(demos, function (det) {
      var resumen = det.querySelector("summary");
      if (resumen) resumen.addEventListener("click", alPulsar);
    });

    /* Un enlace a #d-7 desde la propia página no recarga nada: solo cambia el
       fragmento, y por aquí no se vuelve a pasar. */
    window.addEventListener("hashchange", function () {
      var det = pedida();
      if (det && !det.open) abrir(det);
    });

    var inicial = pedida();
    if (!inicial) return;

    /* Se abre sin animar: es el estado de partida, no un cambio. El navegador
       tampoco puede saltar solo hasta ella, porque cuando analizó el documento
       seguía plegada, y el sitio al que hay que saltar no se sabe hasta que
       rejilla.js termina de repartir márgenes. */
    inicial.open = true;

    document.addEventListener(
      "aram:cuadrada",
      function () {
        inicial.scrollIntoView();
      },
      { once: true },
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar);
  } else {
    montar();
  }
})();
