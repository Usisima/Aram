/**
 * Intro del sitio: el logo se dibuja trazo por trazo sobre negro, se rellena y
 * el contorno se borra. Autocontenido — inyecta sus propios estilos, asi que a
 * una pagina le basta con <script src="assets/intro.js"></script>.
 *
 * Sobre el SVG: dos de los cinco trazos van rellenos con un degradado radial y
 * no con blanco liso. Por eso el relleno se anima con fill-opacity y nunca
 * tocando `fill`: animar el color aplastaria el degradado. Esos dos trazos
 * usan el degradado tambien para el contorno, de modo que el trazo nace ya con
 * su luz final y el borde no cambia de golpe al desvanecerse.
 *
 * Los tiempos viven en cada path (data-inicio) y la duracion se calcula con la
 * longitud real medida en runtime, a velocidad de "boligrafo" constante. La
 * version anterior llevaba los tiempos en arrays paralelos indexados por
 * posicion, y al reexportar el SVG desde Illustrator los indices dejaron de
 * corresponder sin que nada avisara.
 */
(function () {
  "use strict";

  /* ── Ajustes ── */

  var VELOCIDAD = 800; /* unidades de path por segundo */
  var DUR_MIN = 0.35;
  var DUR_MAX = 1.4;
  /* El relleno arranca un poco antes de que el trazo se cierre. */
  var SOLAPE = 0.2;
  var DUR_RELLENO = 0.7;
  var DUR_BORRADO = 0.25;
  var EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
  /* Calma en pantalla despues del ultimo trazo, y duracion del fundido. */
  var PERMANENCIA = 700;
  var DESVANECIDO = 700;
  /* Por debajo de esta longitud un path es un artefacto del export. */
  var MINIMA = 10;

  /* Marca de "ya estuvimos en el sitio en esta pestana". */
  var CLAVE = "aram_visitado";

  /* ── Trazos ──
     El orden de `inicio` reproduce la coreografia original: primero el cuerpo
     izquierdo, luego los arcos derechos, y el travesano central al final. */

  var TRAZOS = [
    {
      /* cuerpo izquierdo principal */
      inicio: 0,
      d: "M164.4,188.3c-1.6,25.1-9.2,41.6-23.9,52.9c-13.4,10.3-31.9,12.5-45,12.5c-22.7,0-39.2-5.7-50.4-17.3c-15.9-16.8-19.1-38-19.1-66.7v-30.8c0-25.3-0.5-37.6-0.8-44.2v-0.8C24.5,78.1,15.2,73.6,0,72.3v-2.2h62.5v2.2C45.2,73.5,35,77.8,34,93.7v0.6c-0.6,7.9-1.4,18.7-1.4,44.4v29.1c0,52.9,16.9,75.5,56.4,75.5c17.6,0,31.5-5.8,41.2-16.7h0.1l0.8-1c4.9-6,8.6-12.9,10.8-20.3l0.4-1.3l0,0c1.2-4,2-8,2.6-12.1c3.3-0.8,6.9-1.6,11.3-2.3C158.6,189.2,161.4,188.7,164.4,188.3z M120.7,70.1v2.2c9.6,0.7,16.4,1.8,20.4,6.4c3,3.5,4.2,8.6,4.6,16.8h0.1v0.1c3.3,3.6,4.6,8.5,3.7,13.2l0,0c-0.5,2.8-1.7,5.4-3.6,7.5v48.3c0.8-0.3,1.6-0.7,2.4-1c5.4-2.2,10.9-4,16.5-5.4v-53.7c0-25.9,2.7-29.9,25.1-32.1v-2.3H120.7z",
    },
    {
      /* filo interior: trazo nuevo del SVG, va con la cola del cuerpo */
      inicio: 0.45,
      d: "M131,225.7c4.9-6,8.6-12.9,10.8-20.3l0.4-1.3l0,0c-2.3,8.3-6.4,16.1-12.1,22.6h0.1L131,225.7z",
    },
    {
      /* arcos derechos: antes eran dos paths, ahora uno solo */
      inicio: 0.5,
      grad: "gA",
      d: "M245.1,139.7c4.5-25.5,9.2-51.9,14.7-77.7c2.9-14,6.7-28.8,14.4-42.2l0.6-1.1c1.4-2.5,3.1-5.6,6.7-6.7l3.6-1.1l0.3,3.7c0.1,0.9,0.1,1.7,0.2,2.5c0.1,1.7,0.2,3.3,0.5,4.9c1,7.4,6.9,13.3,14.4,14.2c8,0.8,14.5-3.5,17.1-11.3c1.8-4.9,1.3-10.3-1.2-14.8c-2.7-4.7-7.6-8-13.7-9.2c-10.4-2.1-21,0-31.5,6.4c-17.5,10.6-27.1,27.6-34.2,42.9c-11.6,25.1-18,51.5-22.7,74.1c-1.8,8.7-3.5,17.5-5.1,26.3c10.8-1.6,21.6-3,32.2-4.3l2.8-0.4C244.4,143.7,244.7,141.7,245.1,139.7z M201.9,192.5c-4.1,25-8.4,50.8-13.9,76.1c-3.2,14.8-6.7,26.9-12.9,38.3c-0.2,0.4-0.4,0.8-0.7,1.2c-1.6,3.1-3.8,7.3-9.6,8.7l-5.2,1.2l1.7-5.1c2.4-7.5,0.1-14.5-6.1-18.7c-2.7-1.8-5.8-2.7-9-2.7c-3.8-0.1-7.4,1.3-10.2,3.8c-5.7,5.2-7.5,11.9-5.1,19.3c2.3,7.2,8,11.5,17,12.7c13.4,1.8,25.8-2.3,38.1-12.6c10.4-8.7,18.6-20.2,26.6-37.3c10.4-22.3,15.3-46.8,20-70.5l0.6-3c1.7-8.4,3.3-16.8,4.8-25.2l-2,0.3l-3.4,0.5c-1.8,0.3-3.7,0.5-5.5,0.7l-3.5,0.4l-5.9,0.7l-2.9,0.4l-8.4,1l-2.9,0.4C203,186.3,202.4,189.4,201.9,192.5z",
    },
    {
      /* travesano central + detalles internos */
      inicio: 1.3,
      grad: "gB",
      d: "M252,176.8c10.4-1.6,20.7-3.7,30.9-6.4c5.5,2,10.8,4.5,16,7.3c10.7,5.9,17.8,11.8,23,18.9c6,8.3,8.1,16.4,6.4,24.9c-1.1,5.4-3.9,8.7-8.4,9.8c-4.3,1.3-8.8-0.3-11.4-3.9c-2.5-3.4-2.4-8.1,0.2-11.4c1.7-2.3,4.4-3.7,7.3-3.7c1.4,0,2.8,0.3,4.1,0.8l5,2l-0.9-5.3c-0.7-4.3-3.7-6.2-5.7-7.4c-0.3-0.2-0.5-0.3-0.8-0.5c-7.3-4.7-15.2-7.6-24.9-10.4c-16.1-4.7-32.6-8.6-48.6-12.4l0.2-1.1 M202.9,151.3l0.5-3c-10.8-2.7-21.8-5.5-32.6-8.4v16.9c8.6-1.9,17.3-3.2,25.8-4.5l1.9-0.3 M140.5,98.9c-0.9-0.7-1.9-1.3-2.9-1.7c-1.4-0.6-2.9-0.9-4.5-0.9c-1.6,0-3.1,0.3-4.5,1c-3.1,1.6-5.4,4.6-6.2,8c-1.8,6.5-0.9,13.3,2.7,20.2c3.3,6.3,8,11.7,14.8,16.8v-12.4c-2.7-1.3-5.3-2.8-7.8-4.4l-0.6-0.4c-1.7-1.1-4-2.5-4.6-5.4L126,116l3.7-0.1h1.7c1.1,0,2.1,0,3.1-0.1c2.4-0.2,4.6-1.2,6.2-2.8c1.5-1.4,2.4-3.2,2.8-5.2c0.7-3.2-0.4-6.5-2.8-8.7L140.5,98.9z",
    },
    {
      /* arco exterior derecho */
      inicio: 1.1,
      d: "M334.1,117.5c-0.4-3.5-2.3-6.6-5.2-8.6c-1.7-1.1-3.6-1.6-5.6-1.6c-1.1,0-2.2,0.2-3.3,0.5c-4.5,1-7.6,5.3-7.2,9.9c0.3,4.5,3.7,8.2,8.1,9c1,0.2,2,0.3,3.1,0.4l1.6,0.2l3.7,0.5l-1.2,3.5c-1,2.8-3.4,4-5.2,4.8c-0.2,0.1-0.5,0.2-0.7,0.3c-9.2,4.7-19.2,6.8-28.6,8.3c-17.2,2.8-34.7,5.1-51.6,7.3c-14,1.8-28.5,3.7-42.8,5.9l-1.9,0.3c-9.6,1.4-19.5,3-28.9,5.3c-6.1,1.4-12.1,3.4-17.9,5.7c-2.2,0.9-4.3,1.8-6.3,2.8c-8,3.9-13.9,8.1-18.7,13.3c-7,7.6-10,15.4-9.2,24c0.5,5.5,2.9,9.1,7.2,10.7c1.2,0.5,2.5,0.7,3.8,0.8c3.7-4.8,6.5-10.1,8.4-15.9c-2.4-3-6.5-4.2-10.2-3l-5.2,1.4l1.5-5.1c1.2-4.2,4.4-5.7,6.6-6.7l0.8-0.4c3.9-1.9,8-3.4,12.1-4.5c3.9-1.1,8.3-2,13.8-2.9c3.6-0.6,7.6-1.2,12.1-1.9c12.8-1.9,25.9-3.4,38.6-4.9c14.9-1.8,30.3-3.6,45.3-6c15-2.4,32.4-5.8,49.3-12.7c10.1-4.1,21.5-9.9,28.8-20.8l0,0C333.4,130.9,335.1,124.2,334.1,117.5z",
    },
  ];

  /* Los degradados del SVG original, tal cual los exporto Illustrator. */
  var PARADAS_A =
    "<stop offset='0' stop-color='#000000'/>" +
    "<stop offset='0.00738' stop-color='#090909'/>" +
    "<stop offset='0.04768' stop-color='#373737'/>" +
    "<stop offset='0.09309' stop-color='#626262'/>" +
    "<stop offset='0.1419' stop-color='#888888'/>" +
    "<stop offset='0.195' stop-color='#A8A8A8'/>" +
    "<stop offset='0.2537' stop-color='#C4C4C4'/>" +
    "<stop offset='0.32' stop-color='#DADADA'/>" +
    "<stop offset='0.3974' stop-color='#EBEBEB'/>" +
    "<stop offset='0.4931' stop-color='#F6F6F6'/>" +
    "<stop offset='0.6274' stop-color='#FDFDFD'/>" +
    "<stop offset='1' stop-color='#FFFFFF'/>";

  var PARADAS_B =
    "<stop offset='0' stop-color='#000000'/>" +
    "<stop offset='0.2295' stop-color='#404040'/>" +
    "<stop offset='0.6104' stop-color='#A6A6A6'/>" +
    "<stop offset='0.8755' stop-color='#E6E6E6'/>" +
    "<stop offset='1' stop-color='#FFFFFF'/>";

  var ESTILOS = [
    ".intro{position:fixed;inset:0;z-index:100;background:#000;display:flex;",
    "align-items:center;justify-content:center;transition:opacity 0.7s ease}",
    ".intro-fuera{opacity:0;pointer-events:none}",
    ".intro-logo{width:min(54vw,232px);height:auto;overflow:visible;display:block}",
    /* Arranca invisible: el marcado no puede saber la longitud de cada trazo,
       asi que sin esto se veria el logo entero contorneado hasta que el JS
       mide los paths. animar() lo devuelve a 1 ya con el trazo desplazado. */
    ".intro-trazo{fill:#fff;fill-opacity:0;stroke:#fff;stroke-width:1.6;",
    "stroke-linecap:round;stroke-linejoin:round;stroke-opacity:0}",
    ".intro-trazo[data-grad]{fill:var(--grad);stroke:var(--grad)}",
  ].join("");

  /* ── Marcado ──
     `prefijo` mantiene unicos los id de los degradados: son globales al
     documento y la pagina de pruebas dibuja mas de un logo a la vez. */

  function marcado(prefijo) {
    var gA = prefijo + "-gA";
    var gB = prefijo + "-gB";
    var ids = { gA: gA, gB: gB };

    var defs =
      "<defs>" +
      "<radialGradient id='" +
      gA +
      "' cx='224.1669' cy='163.91' r='133.7365' gradientUnits='userSpaceOnUse'>" +
      PARADAS_A +
      "</radialGradient>" +
      "<radialGradient id='" +
      gB +
      "' cx='225.2052' cy='163.9378' r='127.1349'" +
      " gradientTransform='matrix(0.9432 0.3321 -0.1788 0.5079 42.1031 5.8777)'" +
      " gradientUnits='userSpaceOnUse'>" +
      PARADAS_B +
      "</radialGradient>" +
      "</defs>";

    var paths = TRAZOS.map(function (t) {
      var extra = t.grad
        ? " data-grad='" + t.grad + "' style=\"--grad:url(#" + ids[t.grad] + ')"'
        : "";
      return (
        "<path class='intro-trazo' data-inicio='" +
        t.inicio +
        "'" +
        extra +
        " d='" +
        t.d +
        "'/>"
      );
    }).join("");

    return (
      "<svg class='intro-logo' viewBox='0 0 334.4 327.8'" +
      " xmlns='http://www.w3.org/2000/svg' role='img' aria-label='Aram'>" +
      defs +
      paths +
      "</svg>"
    );
  }

  /* ── Animacion ──
     Devuelve, en segundos, cuanto tarda en terminar el ultimo trazo. */

  function animar(svg) {
    var paths = Array.prototype.slice.call(
      svg.querySelectorAll(".intro-trazo"),
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paths.forEach(function (p) {
        p.style.fillOpacity = "1";
        p.style.strokeOpacity = "0";
      });
      return 0;
    }

    /* Primera pasada: medir y dejar cada trazo completamente desplazado antes
       de devolverle la opacidad. Tiene que ser en este orden o se ve el logo
       entero contorneado durante un fotograma. */
    var largos = paths.map(function (p) {
      return p.getTotalLength();
    });

    paths.forEach(function (p, i) {
      if (largos[i] < MINIMA) {
        p.style.display = "none";
        return;
      }
      if (p.getAnimations) {
        p.getAnimations().forEach(function (a) {
          a.cancel();
        });
      }
      p.style.strokeDasharray = String(largos[i]);
      p.style.strokeDashoffset = String(largos[i]);
      p.style.fillOpacity = "0";
      p.style.strokeOpacity = "1";
    });

    /* Segunda pasada: animar. Todas usan fill "forwards" y no "both" a
       proposito. Con "both" cada animacion impondria su valor inicial durante
       su propio retraso, y el contorno reaparecia antes de tocarle dibujarse. */
    var fin = 0;

    paths.forEach(function (p, i) {
      var len = largos[i];
      if (len < MINIMA) return;

      var inicio = Number(p.getAttribute("data-inicio")) || 0;
      var dur = Math.min(DUR_MAX, Math.max(DUR_MIN, len / VELOCIDAD));
      var relleno = inicio + dur - SOLAPE;
      var borrado = relleno + DUR_RELLENO;

      p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], {
        duration: dur * 1000,
        delay: inicio * 1000,
        easing: EASE,
        fill: "forwards",
      });

      p.animate([{ fillOpacity: 0 }, { fillOpacity: 1 }], {
        duration: DUR_RELLENO * 1000,
        delay: relleno * 1000,
        easing: "ease",
        fill: "forwards",
      });

      p.animate([{ strokeOpacity: 1 }, { strokeOpacity: 0 }], {
        duration: DUR_BORRADO * 1000,
        delay: borrado * 1000,
        easing: "ease",
        fill: "forwards",
      });

      fin = Math.max(fin, borrado + DUR_BORRADO);
    });

    return fin;
  }

  /* ── Splash ── */

  function mostrar() {
    var capa = document.createElement("div");
    capa.className = "intro";
    capa.setAttribute("aria-hidden", "true");
    capa.innerHTML = marcado("intro");
    document.body.appendChild(capa);

    var fin = animar(capa.querySelector("svg"));

    setTimeout(
      function () {
        capa.classList.add("intro-fuera");
        setTimeout(function () {
          if (capa.parentNode) capa.parentNode.removeChild(capa);
        }, DESVANECIDO);
      },
      fin * 1000 + PERMANENCIA,
    );
  }

  /* ── Cuando toca ──
     La intro es de la portada y solo de la portada: se marca con data-intro en
     el <html>. Dentro de esa pagina:

       recargar            -> siempre, aunque ya se hubiera visto
       entrar de cero      -> si (pestana nueva, marcador, enlace externo)
       venir de otra pagina del sitio -> no
       gesto de retroceso  -> no

     El tipo de navegacion sale de Navigation Timing. El caso "volver a la
     portada desde Matematicas" llega como "navigate", igual que una entrada
     limpia, asi que hace falta ademas saber si ya estabamos en el sitio: eso
     es la marca de sesion, que ponen todas las paginas, no solo esta. */

  function visitado() {
    try {
      return !!sessionStorage.getItem(CLAVE);
    } catch (e) {
      return false; /* modo privado o cookies bloqueadas */
    }
  }

  function marcarVisita() {
    try {
      sessionStorage.setItem(CLAVE, "1");
    } catch (e) {}
  }

  function toca() {
    /* `?intro` la fuerza: si no, no hay forma comoda de repetirla al ajustar. */
    if (/[?&]intro(&|=|$)/.test(location.search)) return true;
    if (!document.documentElement.hasAttribute("data-intro")) return false;

    var nav =
      performance.getEntriesByType &&
      performance.getEntriesByType("navigation")[0];
    var tipo = nav ? nav.type : "navigate";

    if (tipo === "back_forward") return false;
    if (tipo === "reload") return true;
    return !visitado();
  }

  var hoja = document.createElement("style");
  hoja.textContent = ESTILOS;
  document.head.appendChild(hoja);

  window.AramIntro = { marcado: marcado, animar: animar, mostrar: mostrar };

  /* Decidir antes de marcar, o la portada se descartaria a si misma. */
  var procede = toca();
  marcarVisita();

  if (procede) {
    if (document.body) mostrar();
    else document.addEventListener("DOMContentLoaded", mostrar);
  }
})();
