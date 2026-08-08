/**
 * Intro del sitio: el logo se dibuja trazo por trazo sobre negro, se rellena y
 * el contorno se borra. Autocontenido — inyecta sus propios estilos, asi que a
 * una pagina le basta con <script src="assets/intro.js"></script>.
 *
 * El logo se dibuja sobre la foto de fondo, en la tinta que marque el tema.
 * Los dos degradados radiales que traia el SVG original estaban pensados para
 * fondo negro y no servian para las dos versiones: se usa tinta plana. El
 * relleno se sigue animando con fill-opacity y no tocando `fill`, que es
 * justo lo que deja el color en manos del CSS.
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

  /* Ni la tinta del logo ni la foto se fijan aqui: salen de las variables que
     define estilos.css (--tinta, --foto, --cielo), que cambian con el tema. Es
     lo que hace que el trazo sea negro sobre el cielo palido del modo claro y
     blanco sobre el cielo negro del oscuro, sin una linea de JavaScript. */

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
      d: "M245.1,139.7c4.5-25.5,9.2-51.9,14.7-77.7c2.9-14,6.7-28.8,14.4-42.2l0.6-1.1c1.4-2.5,3.1-5.6,6.7-6.7l3.6-1.1l0.3,3.7c0.1,0.9,0.1,1.7,0.2,2.5c0.1,1.7,0.2,3.3,0.5,4.9c1,7.4,6.9,13.3,14.4,14.2c8,0.8,14.5-3.5,17.1-11.3c1.8-4.9,1.3-10.3-1.2-14.8c-2.7-4.7-7.6-8-13.7-9.2c-10.4-2.1-21,0-31.5,6.4c-17.5,10.6-27.1,27.6-34.2,42.9c-11.6,25.1-18,51.5-22.7,74.1c-1.8,8.7-3.5,17.5-5.1,26.3c10.8-1.6,21.6-3,32.2-4.3l2.8-0.4C244.4,143.7,244.7,141.7,245.1,139.7z M201.9,192.5c-4.1,25-8.4,50.8-13.9,76.1c-3.2,14.8-6.7,26.9-12.9,38.3c-0.2,0.4-0.4,0.8-0.7,1.2c-1.6,3.1-3.8,7.3-9.6,8.7l-5.2,1.2l1.7-5.1c2.4-7.5,0.1-14.5-6.1-18.7c-2.7-1.8-5.8-2.7-9-2.7c-3.8-0.1-7.4,1.3-10.2,3.8c-5.7,5.2-7.5,11.9-5.1,19.3c2.3,7.2,8,11.5,17,12.7c13.4,1.8,25.8-2.3,38.1-12.6c10.4-8.7,18.6-20.2,26.6-37.3c10.4-22.3,15.3-46.8,20-70.5l0.6-3c1.7-8.4,3.3-16.8,4.8-25.2l-2,0.3l-3.4,0.5c-1.8,0.3-3.7,0.5-5.5,0.7l-3.5,0.4l-5.9,0.7l-2.9,0.4l-8.4,1l-2.9,0.4C203,186.3,202.4,189.4,201.9,192.5z",
    },
    {
      /* travesano central + detalles internos */
      inicio: 1.3,
      d: "M252,176.8c10.4-1.6,20.7-3.7,30.9-6.4c5.5,2,10.8,4.5,16,7.3c10.7,5.9,17.8,11.8,23,18.9c6,8.3,8.1,16.4,6.4,24.9c-1.1,5.4-3.9,8.7-8.4,9.8c-4.3,1.3-8.8-0.3-11.4-3.9c-2.5-3.4-2.4-8.1,0.2-11.4c1.7-2.3,4.4-3.7,7.3-3.7c1.4,0,2.8,0.3,4.1,0.8l5,2l-0.9-5.3c-0.7-4.3-3.7-6.2-5.7-7.4c-0.3-0.2-0.5-0.3-0.8-0.5c-7.3-4.7-15.2-7.6-24.9-10.4c-16.1-4.7-32.6-8.6-48.6-12.4l0.2-1.1 M202.9,151.3l0.5-3c-10.8-2.7-21.8-5.5-32.6-8.4v16.9c8.6-1.9,17.3-3.2,25.8-4.5l1.9-0.3 M140.5,98.9c-0.9-0.7-1.9-1.3-2.9-1.7c-1.4-0.6-2.9-0.9-4.5-0.9c-1.6,0-3.1,0.3-4.5,1c-3.1,1.6-5.4,4.6-6.2,8c-1.8,6.5-0.9,13.3,2.7,20.2c3.3,6.3,8,11.7,14.8,16.8v-12.4c-2.7-1.3-5.3-2.8-7.8-4.4l-0.6-0.4c-1.7-1.1-4-2.5-4.6-5.4L126,116l3.7-0.1h1.7c1.1,0,2.1,0,3.1-0.1c2.4-0.2,4.6-1.2,6.2-2.8c1.5-1.4,2.4-3.2,2.8-5.2c0.7-3.2-0.4-6.5-2.8-8.7L140.5,98.9z",
    },
    {
      /* arco exterior derecho */
      inicio: 1.1,
      d: "M334.1,117.5c-0.4-3.5-2.3-6.6-5.2-8.6c-1.7-1.1-3.6-1.6-5.6-1.6c-1.1,0-2.2,0.2-3.3,0.5c-4.5,1-7.6,5.3-7.2,9.9c0.3,4.5,3.7,8.2,8.1,9c1,0.2,2,0.3,3.1,0.4l1.6,0.2l3.7,0.5l-1.2,3.5c-1,2.8-3.4,4-5.2,4.8c-0.2,0.1-0.5,0.2-0.7,0.3c-9.2,4.7-19.2,6.8-28.6,8.3c-17.2,2.8-34.7,5.1-51.6,7.3c-14,1.8-28.5,3.7-42.8,5.9l-1.9,0.3c-9.6,1.4-19.5,3-28.9,5.3c-6.1,1.4-12.1,3.4-17.9,5.7c-2.2,0.9-4.3,1.8-6.3,2.8c-8,3.9-13.9,8.1-18.7,13.3c-7,7.6-10,15.4-9.2,24c0.5,5.5,2.9,9.1,7.2,10.7c1.2,0.5,2.5,0.7,3.8,0.8c3.7-4.8,6.5-10.1,8.4-15.9c-2.4-3-6.5-4.2-10.2-3l-5.2,1.4l1.5-5.1c1.2-4.2,4.4-5.7,6.6-6.7l0.8-0.4c3.9-1.9,8-3.4,12.1-4.5c3.9-1.1,8.3-2,13.8-2.9c3.6-0.6,7.6-1.2,12.1-1.9c12.8-1.9,25.9-3.4,38.6-4.9c14.9-1.8,30.3-3.6,45.3-6c15-2.4,32.4-5.8,49.3-12.7c10.1-4.1,21.5-9.9,28.8-20.8l0,0C333.4,130.9,335.1,124.2,334.1,117.5z",
    },
  ];

  /* Clase en el <html> mientras el splash esta puesto. */
  var BLOQUEO = "intro-bloqueo";

  var ESTILOS = [
    /* La caja tiene que ser identica a la del fondo tenue de las paginas
       (body::before en estilos.css): misma posicion y misma altura 100lvh. Con
       `cover`, una caja de otra altura recorta y escala la foto de otra
       manera, y al desvanecerse la intro el mar saltaba a otra altura. Con
       `inset:0` la altura era la del viewport actual, que en el movil no
       coincide con lvh mientras se ve la barra del navegador. */
    ".intro{position:fixed;top:0;left:0;right:0;height:100vh;height:100lvh;",
    "z-index:100;display:flex;",
    "flex-direction:column;gap:4.375rem;",
    "align-items:center;justify-content:center;transition:opacity 0.7s ease;",
    /* El logo no se centra en la pantalla sino en la franja de cielo: con este
       relleno abajo, la caja util es el 80% superior y el centro del logo cae
       a un 40% de altura, despejado del mar. En lvh, la misma unidad que la
       altura de la caja, o el 40% se mediria contra otra referencia. */
    "padding-bottom:20vh;padding-bottom:20lvh;",
    /* Durante la intro el gesto de desplazar no hace nada: ni arrastra la
       pagina de debajo ni rebota contra el borde. */
    "touch-action:none;overscroll-behavior:contain;",
    /* Mismo encuadre que el fondo tenue de las paginas: al desvanecerse la
       intro, la foto no salta de sitio, solo se lava. El color del cielo
       debajo evita el destello mientras la imagen carga. */
    "background:var(--cielo) var(--foto) center top/cover no-repeat}",
    ".intro-fuera{opacity:0;pointer-events:none}",
    "html." + BLOQUEO + ",html." + BLOQUEO + " body{overflow:hidden;",
    "overscroll-behavior:none}",
    /* El tope va en proporcion al viewport fijo de 980: con el de 188px, que
       era el bueno para 390, el logo quedaba a menos de la mitad al reducirse
       la pagina. 188 x 980/390 = 472. */
    ".intro-logo{width:min(43.7vw,472px);height:auto;overflow:visible;display:block}",
    /* Arranca invisible: el marcado no puede saber la longitud de cada trazo,
       asi que sin esto se veria el logo entero contorneado hasta que el JS
       mide los paths. animar() lo devuelve a 1 ya con el trazo desplazado. */
    ".intro-trazo{fill:var(--tinta);fill-opacity:0;stroke:var(--tinta);",
    "stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;",
    "stroke-opacity:0}",
    /* Arranca invisible y entra al terminar el trazado, ya desde JS. El
       relleno a la izquierda compensa el espaciado de la ultima letra, que si
       no descentra la palabra. */
    ".intro-nombre{margin:0;font-size:1.75rem;letter-spacing:0.5em;",
    "padding-left:0.5em;text-transform:uppercase;color:var(--tenue);",
    "opacity:0}",
  ].join("");

  /* ── Marcado ── */

  function marcado() {
    var paths = TRAZOS.map(function (t) {
      return (
        "<path class='intro-trazo' data-inicio='" +
        t.inicio +
        "' d='" +
        t.d +
        "'/>"
      );
    }).join("");

    return (
      "<svg class='intro-logo' viewBox='0 0 334.4 327.8'" +
      " xmlns='http://www.w3.org/2000/svg' role='img' aria-label='Aram'>" +
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
    capa.innerHTML = marcado() + "<p class='intro-nombre'>Ukishima</p>";
    document.body.appendChild(capa);
    document.documentElement.classList.add(BLOQUEO);

    var fin = animar(capa.querySelector("svg"));
    /* El nombre entra justo al cerrarse el ultimo trazo, no antes. */
    nombrar(capa.querySelector(".intro-nombre"), fin);

    setTimeout(
      function () {
        capa.classList.add("intro-fuera");
        /* El scroll se devuelve al empezar el fundido, no al final: para
           cuando el dedo llega, la pagina ya responde. */
        document.documentElement.classList.remove(BLOQUEO);
        setTimeout(function () {
          retirar(capa);
        }, DESVANECIDO);
      },
      fin * 1000 + PERMANENCIA,
    );
  }

  function nombrar(nombre, fin) {
    if (!nombre) return;

    if (!fin) {
      nombre.style.opacity = "1";
      return;
    }

    var DUR = 0.9;
    nombre.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "none" },
      ],
      {
        duration: DUR * 1000,
        delay: Math.max(0, (fin - DUR) * 1000),
        easing: "ease",
        fill: "forwards",
      },
    );
  }

  function retirar(capa) {
    if (capa && capa.parentNode) capa.parentNode.removeChild(capa);
    document.documentElement.classList.remove(BLOQUEO);
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

  /* Al volver con el gesto de retroceso la pagina puede restaurarse desde la
     bfcache exactamente como se dejo. Si se salio de ella mientras el splash
     seguia en pantalla, vuelve montado y congelado. Los scripts no se
     reejecutan en ese caso, asi que hay que retirarlo aqui. */
  window.addEventListener("pageshow", function (ev) {
    if (!ev.persisted) return;
    retirar(document.querySelector(".intro"));
  });

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
