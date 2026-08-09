/**
 * Cuadra el contenido con la cuadrícula del fondo.
 *
 * El CSS ya deja la interlínea y todos los márgenes en múltiplos exactos de la
 * celda, así que la prosa cae sola sobre las rayas. Lo que no puede resolver el
 * CSS son los bloques de altura arbitraria: una fórmula en display mide lo que
 * mide según lleve fracciones, raíces o exponentes, y a partir de ahí todo lo
 * que viene debajo queda desplazado media raya.
 *
 * Aquí se recorren los bloques de la página en orden y se le añade a cada uno
 * el margen inferior justo para que el siguiente empiece sobre una raya. Se
 * mide de nuevo en cada paso porque ajustar un bloque desplaza a los de abajo.
 *
 * Se mide dónde empieza el bloque *siguiente*, y no dónde acaba el actual más
 * su margen. Parece lo mismo y no lo es: cuando el último hijo de un bloque
 * tiene margen inferior, ese margen se colapsa hacia fuera del padre, así que
 * la suma no coincide con la separación real. Midiendo el resultado se acierta
 * sin tener que razonar sobre qué margen colapsa con cuál. Por lo mismo se
 * comprueba y se corrige una segunda vez: si el margen que se toca es el que
 * pierde el colapso, tocarlo no mueve nada y hay que insistir.
 *
 * Se ejecuta después de KaTeX (mide sobre lo ya compuesto) y después de que
 * carguen las fuentes, que cambian las alturas al sustituir a las del sistema.
 */
(function () {
  "use strict";

  var MARCA = "data-cuadrado";

  function celda() {
    /* La celda es la interlínea del cuerpo, ya resuelta a px por el navegador:
       así no hay que interpretar rem ni el media query a mano. */
    var lh = parseFloat(getComputedStyle(document.body).lineHeight);
    return lh > 0 ? lh : 0;
  }

  /* Las rayas horizontales no caen en los múltiplos exactos de la celda sino
     un píxel antes: el CSS las desplaza con `background-position: 0 -1px` para
     que queden justo bajo la línea base del renglón, como un cuaderno rayado.
     Hay que restar ese píxel al cuadrar contra ellas. */
  var RAYA = -1;

  /* Cuánto se da por bueno sin tocar nada. Solo cubre el redondeo de coma
     flotante: antes eran medio píxel, y con eso se colaba sin corregir el
     medio grosor de un borde —una caja quedaba un pelo por encima de la raya
     y la de al lado justo encima—. La corrección sobrante es de décimas de
     píxel, así que no abre huecos: solo termina de cuadrar. */
  var EPS = 0.05;

  /** Si el elemento se está pintando. Lo que hay dentro de un desplegable
      cerrado no ocupa sitio, y medirlo devolvería ceros. */
  function visible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  /**
   * Dónde se pinta de verdad el borde superior de la caja.
   *
   * No sirve `getBoundingClientRect().top`: en un <fieldset> ese rectángulo
   * incluye lo que la leyenda sobresale por encima del borde, así que devuelve
   * un valor varios píxeles más alto que la línea que se ve. La leyenda queda
   * centrada sobre el borde, de modo que su centro sí lo delata.
   */
  function bordeSuperior(caja) {
    var r = caja.getBoundingClientRect();
    var leyenda = caja.querySelector("legend");
    if (!leyenda) return r.top + window.scrollY;

    var grosor = parseFloat(getComputedStyle(caja).borderTopWidth) || 0;
    var l = leyenda.getBoundingClientRect();
    return l.top + l.height / 2 - grosor / 2 + window.scrollY;
  }

  /**
   * Encaja las cajas de enunciado en la cuadrícula por sus cuatro lados.
   *
   * La rejilla está anclada al origen de la página y no se mueve: es la caja la
   * que se retranquea hasta la primera raya que le cabe dentro de la columna, y
   * se recorta a un número entero de celdas. Antes se hacía al revés,
   * desplazando la rejilla hasta el borde de la columna, y eso dejaba una
   * franja sin rayas a la izquierda de la pantalla.
   */
  /**
   * Cada fórmula en bloque, en celdas enteras.
   *
   * Es lo único de una página que no mide en renglones: el texto tiene por
   * interlínea la celda y cae solo, pero una fórmula mide lo que mide. Se le
   * reparte el sobrante alrededor —mitad arriba, mitad abajo— y con eso ocupa
   * un número entero de celdas.
   *
   * Va antes que las cajas a propósito: cuadrada la fórmula, la caja que la
   * contiene ya no tiene que compensar nada por abajo, que es de donde salía el
   * renglón vacío al final de los enunciados que acaban en fórmula.
   */
  function cuadrarFormulas(c) {
    Array.prototype.forEach.call(
      document.querySelectorAll(".katex-display"),
      function (formula) {
        formula.style.paddingTop = "";
        formula.style.paddingBottom = "";
        if (!visible(formula)) return;

        var estilo = getComputedStyle(formula);
        var basePT = parseFloat(estilo.paddingTop) || 0;
        var basePB = parseFloat(estilo.paddingBottom) || 0;

        var alto = formula.getBoundingClientRect().height;
        var sobra = ((alto % c) + c) % c;
        var falta = sobra < EPS || c - sobra < EPS ? 0 : c - sobra;
        if (!falta) return;

        /* La mitad de abajo se lleva el pico: si el reparto no es exacto, más
           vale que sobre donde no hay nada escrito. */
        var arriba = Math.floor((falta / 2) * 100) / 100;
        formula.style.paddingTop = basePT + arriba + "px";
        formula.style.paddingBottom = basePB + (falta - arriba) + "px";
      },
    );
  }

  function cuadrarCajas(main, c) {
    /* La caja ocupa todo el ancho de la columna, con los mismos márgenes
       laterales que el resto del texto. Antes se retranqueaba hasta la primera
       raya vertical para cuadrar también de lado, pero eso la dejaba desalineada
       con la prosa, que es con lo que se lee en paralelo. */

    /* El borde de la caja va a media celda de la raya, o sea por el centro del
       cuadro. El texto de dentro, en cambio, sigue cayendo en los múltiplos de
       celda como el del resto de la página. La distancia entre uno y otro es
       por tanto media celda (más el píxel de desfase de la raya), y es una
       medida relativa: no depende de dónde acabe la caja. */
    var hueco = c / 2 + 1;

    Array.prototype.forEach.call(
      document.querySelectorAll(".enunciado"),
      function (caja) {
        caja.style.marginLeft = "";
        caja.style.width = "";
        caja.style.paddingTop = "";
        caja.style.paddingBottom = "";

        /* Las de los desplegables cerrados no se pintan: el relleno saldría a
           bulto. Se cuadran cuando se abran, que es cuando se vuelve a pasar
           por aquí. */
        if (!visible(caja)) return;

        var grosor = parseFloat(getComputedStyle(caja).borderTopWidth) || 0;
        var arriba = bordeSuperior(caja);

        /* Arriba: se estira el relleno hasta que el primer renglón de dentro
           quede a `hueco` del borde. La leyenda ocupa parte de ese espacio, así
           que la cuenta no sale de sumar grosor y relleno: hay que medirla. */
        var primero = caja.querySelector("p, ol, ul, .katex-display");
        if (primero) {
          var basePT = parseFloat(getComputedStyle(caja).paddingTop) || 0;
          var dentro =
            primero.getBoundingClientRect().top + window.scrollY - arriba;
          var s = (((dentro - hueco) % c) + c) % c;
          var faltaPT = s < EPS || c - s < EPS ? 0 : c - s;
          if (faltaPT) caja.style.paddingTop = basePT + faltaPT + "px";
        }

        /* Abajo: los dos bordes van igual, a media celda y centrados en el
           cuadro. Basta con que la caja mida un número entero de celdas de
           borde a borde, que es lo que se ajusta aquí: si arriba está a media
           celda y el alto es múltiplo exacto, abajo cae a media celda también.
           Se mide al final, cuando el relleno superior ya está fijado. */
        var basePB = parseFloat(getComputedStyle(caja).paddingBottom) || 0;
        var alto =
          caja.getBoundingClientRect().bottom +
          window.scrollY -
          bordeSuperior(caja);
        var sobra = (((alto - grosor) % c) + c) % c;
        var falta = sobra < EPS || c - sobra < EPS ? 0 : c - sobra;
        if (falta) caja.style.paddingBottom = basePB + falta + "px";
      },
    );
  }

  /**
   * El recuadro que hay que cuadrar, si lo hay.
   *
   * Puede ser el propio elemento o venir envuelto en un <details>, que es como
   * se monta un enunciado con su demostración desplegable: se toca el recuadro
   * y se abre la prueba. Lo que se alinea con la rejilla sigue siendo el
   * recuadro, no el envoltorio — sin esto el borde dejaba de caer a media
   * celda en cuanto el teorema tuvo demostración.
   */
  function cajaDe(el) {
    if (el.classList && el.classList.contains("enunciado")) return el;
    return el.querySelector
      ? el.querySelector(":scope > summary > .enunciado")
      : null;
  }

  function esCaja(el) {
    return !!cajaDe(el);
  }

  /* Para una caja, dónde se pinta su borde; para el resto, el borde del
     rectángulo. La distinción importa porque en un <fieldset> el rectángulo
     incluye lo que la leyenda sobresale por arriba, y alinear por él dejaba
     la caja seis píxeles por debajo de la raya. */
  function arribaDe(el, origen) {
    var caja = cajaDe(el);
    var y = caja
      ? bordeSuperior(caja)
      : el.getBoundingClientRect().top + window.scrollY;
    return y - origen;
  }

  /* Cuánto se pasa un elemento de la raya que le toca. Un bloque de texto se
     alinea con el múltiplo de la celda, que es donde arranca su primer
     renglón; una caja va media celda más allá, por el centro del cuadro y no
     sobre la línea, más el píxel de desfase de la raya. */
  function desfase(y, esCajaEsta, c) {
    var ref = esCajaEsta ? RAYA + c / 2 : 0;
    return (((y - ref) % c) + c) % c;
  }

  /* Cuánto hay que mover un elemento para dejarlo sobre la cuadrícula.

     Se devuelve el desplazamiento MENOR, que puede ser hacia atrás: avanzar
     siempre a la raya siguiente abría huecos de casi una celda. Retroceder
     solo vale si el margen resultante no queda negativo. */
  function ajuste(y, esCajaEsta, margen, c) {
    var sobra = desfase(y, esCajaEsta, c);
    if (sobra < EPS || c - sobra < EPS) return 0;

    var atras = -sobra;
    var adelante = c - sobra;
    if (sobra <= adelante && margen + atras >= 0) return atras;
    return adelante;
  }

  /* El mismo cálculo pero solo hacia delante. Se usa donde lo que se estira es
     un relleno: encogerlo por debajo del que puso el CSS no es una opción. */
  function ajusteAdelante(y, esCajaEsta, c) {
    var sobra = desfase(y, esCajaEsta, c);
    if (sobra < EPS || c - sobra < EPS) return 0;
    return c - sobra;
  }

  /* Se parte siempre del margen que puso el CSS, no del de la pasada anterior,
     o al recalcular (giro de pantalla, un desplegable que se abre) se irían
     acumulando. */
  function reponer(cont) {
    Array.prototype.forEach.call(cont.children, function (el) {
      if (el.hasAttribute(MARCA)) {
        el.style.marginBottom = "";
        el.removeAttribute(MARCA);
      }
    });
  }

  /** Reparte el sobrante entre los bloques de una columna, de arriba abajo. */
  function cuadrarColumna(cont, c, origen) {
    reponer(cont);

    /* Solo los que se pintan. Un hijo oculto —el aviso de «ninguno coincide»,
       por ejemplo— no ocupa ni acepta márgenes: cargarle a él el ajuste era
       tirarlo a la basura, y lo que venía detrás se quedaba fuera de la
       cuadrícula. */
    var hijos = Array.prototype.filter.call(cont.children, visible);

    hijos.forEach(function (el, i) {
      var siguiente = hijos[i + 1];
      if (!siguiente) return;

      var caja = esCaja(siguiente);
      var base = parseFloat(getComputedStyle(el).marginBottom) || 0;
      var extra = ajuste(arribaDe(siguiente, origen), caja, base, c);
      if (!extra) return;

      el.style.marginBottom = base + extra + "px";
      el.setAttribute(MARCA, "");

      /* Se comprueba el resultado en vez de darlo por hecho. Con la columna
         flex no hay colapso y converge a la primera, pero medir es barato y
         así el ajuste no depende de esa suposición. */
      for (var intento = 0; intento < 3; intento++) {
        var resto = ajuste(arribaDe(siguiente, origen), caja, base + extra, c);
        if (!resto) break;
        extra += resto;
        el.style.marginBottom = base + extra + "px";
      }
    });
  }

  /**
   * Cuadra un desplegable abierto, que es una columna más pero metida en mitad
   * de la página.
   *
   * Dos cosas que en el tronco no hacen falta. Arriba, estirar el relleno hasta
   * que el primer bloque de dentro caiga en su raya: en el tronco de eso se
   * encarga el margen del bloque anterior, pero aquí el bloque anterior está
   * fuera del panel y no puede empujar lo de dentro. Y abajo, dejar el panel
   * con un número entero de celdas de alto, que es lo que mantiene en su sitio
   * a todas las pastillas que vienen después — abrir una demostración no debe
   * mover ni un renglón de las demás.
   */
  function cuadrarPanel(panel, c, origen) {
    /* El relleno va en la caja de dentro y no en el panel: el panel es lo que
       se anima al abrir, y con relleno propio ni llegaba a cerrarse del todo ni
       podía descubrir su contenido sin arrastrarlo. Medir se sigue midiendo por
       fuera —es el panel el que tiene que acabar en una raya—, pero el ajuste se
       le carga a la caja. */
    var caja = dentroDe(panel);

    caja.style.paddingTop = "";
    caja.style.paddingBottom = "";

    var primero = caja.firstElementChild;
    if (primero) {
      var basePT = parseFloat(getComputedStyle(caja).paddingTop) || 0;
      var faltaPT = ajusteAdelante(
        arribaDe(primero, origen),
        esCaja(primero),
        c,
      );
      if (faltaPT) caja.style.paddingTop = basePT + faltaPT + "px";
    }

    cuadrarColumna(caja, c, origen);

    var basePB = parseFloat(getComputedStyle(caja).paddingBottom) || 0;
    var abajo = panel.getBoundingClientRect().bottom + window.scrollY - origen;
    var faltaPB = ajusteAdelante(abajo, false, c);
    if (faltaPB) caja.style.paddingBottom = basePB + faltaPB + "px";
  }

/** La caja de dentro de un panel, que es la que lleva el relleno. */
  function dentroDe(panel) {
    var hijo = panel.firstElementChild;
    return hijo && hijo.classList.contains("dentro") ? hijo : panel;
  }

  function cuadrar() {
    centrarRejilla();

    var main = document.querySelector("main");
    if (!main) return;

    var c = celda();
    if (!c) return;

    var paneles = Array.prototype.filter.call(
      document.querySelectorAll(".demo-cuerpo, .grupo-cuerpo"),
      visible,
    );

    /* Y las fórmulas antes que las cajas: una fórmula que ya mide celdas
       enteras no obliga a la caja que la lleva dentro a compensar por abajo. */
    cuadrarFormulas(c);

    /* Las cajas se cuadran antes que los bloques: cambiarles el ancho altera
       los saltos de línea y, con ellos, la altura de todo lo que va debajo.
       Su relleno es una medida relativa a la propia caja, así que basta una
       pasada por mucho que luego todo se desplace. */
    cuadrarCajas(main, c);

    /* Origen de la cuadrícula: el borde superior del body, que es donde
       arranca el ::after que la pinta. */
    var origen = document.body.getBoundingClientRect().top + window.scrollY;

    /* Con desplegables abiertos hacen falta dos vueltas: lo que va dentro de un
       panel se coloca a partir de donde empieza el panel, y el alto del panel
       decide dónde cae lo que viene después. Cada cosa depende de la otra, así
       que se cuadra el tronco, luego los paneles, y se repasa el tronco con los
       altos ya fijados. */
    var vueltas = paneles.length ? 2 : 1;

    for (var v = 0; v < vueltas; v++) {
      cuadrarColumna(main, c, origen);
      paneles.forEach(function (panel) {
        cuadrarPanel(panel, c, origen);
      });
    }
  }

  /* Mientras se cuadra, el contenido se mantiene invisible pero ocupando su
     sitio (`visibility`, no `display`). Cuadrar mueve bloques, y hacerlo
     después de pintar es exactamente el salto que se veía. La regla la pone el
     propio script: si este no llega a ejecutarse, no hay nada que ocultar. */
  var GUARDA = "rejilla-esperando";

  function ocultar() {
    var hoja = document.createElement("style");
    hoja.textContent = "." + GUARDA + " main{visibility:hidden}";
    document.head.appendChild(hoja);
    document.documentElement.classList.add(GUARDA);
    /* Red de seguridad: pase lo que pase, el texto acaba viéndose. */
    setTimeout(mostrar, 1200);
  }

  function mostrar() {
    var raiz = document.documentElement;
    /* Puede llegarse aquí dos veces: por la red de seguridad y por la espera de
       las fuentes. El aviso de abajo solo debe salir una. */
    if (!raiz.classList.contains(GUARDA)) return;

    raiz.classList.remove(GUARDA);

    /* Para quien tenga que actuar con la página ya cuadrada: por ejemplo,
       assets/desplegable.js, que salta hasta la demostración que pide la
       dirección y hasta entonces no sabe dónde va a quedar. */
    document.dispatchEvent(new CustomEvent("aram:cuadrada"));
  }

  /**
   * Espera a las fuentes de verdad.
   *
   * No vale mirar `document.fonts.status`: como este script corre en el <head>,
   * antes de que el CSS haya pedido ninguna fuente, el estado es "loaded" y se
   * cuadraría con las métricas de Georgia. Se piden explícitamente las dos
   * variantes que usa el texto y solo entonces se mide.
   */
  function conFuentes(hecho) {
    if (!document.fonts || !document.fonts.load) return hecho();

    var familia = '1rem "GFS Artemisia"';
    Promise.all([
      document.fonts.load("400 " + familia),
      document.fonts.load("700 " + familia),
    ])
      .then(function () {
        return document.fonts.ready;
      })
      .then(hecho, hecho);
  }

  function alListo() {
    /* Cuadrar antes de que las fuentes entren en juego obliga a repetirlo
       después, porque cambian las alturas. Se espera una sola vez y se cuadra
       una sola vez: sin segunda pasada no hay salto. */
    conFuentes(function () {
      cuadrar();
      mostrar();
    });
  }

  /* Se oculta ya, en cuanto se ejecuta el script. Por eso va en el <head> y sin
     `defer`: con `defer` al final del <body> el navegador llegaba a pintar la
     caja sin cuadrar, y el ajuste posterior se veía como un salto. */
  ocultar();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", alListo);
  } else {
    alListo();
  }

  /* Al girar el teléfono cambian el ancho, los saltos de línea y, pasado el
     punto de ruptura, el tamaño de la propia celda. Hay que recuadrar.

     Pero solo si cambia el ANCHO. En el móvil, ocultarse la barra del navegador
     al desplazar dispara un `resize` con otra altura, y recuadrar entonces
     movía el texto delante del lector sin que nada lo justificara: la altura no
     interviene en ninguno de estos cálculos. */
  var anchoPrevio = document.documentElement.clientWidth;
  var temporizador;

  window.addEventListener("resize", function () {
    var ancho = document.documentElement.clientWidth;
    if (ancho === anchoPrevio) return;
    anchoPrevio = ancho;

    centrarRejilla();
    clearTimeout(temporizador);
    temporizador = setTimeout(cuadrar, 150);
  });

  /**
   * Cuadra la columna de texto con la cuadrícula, y la cuadrícula con la
   * ventana.
   *
   * Antes se repartía el sobrante del ancho a los dos lados: la retícula
   * quedaba simétrica, sí, pero la columna de texto caía donde caía y ni sus
   * bordes ni los de nada de lo que lleva dentro coincidían con las rayas
   * verticales. Una portada de libro medía cuatro celdas justas y aun así
   * cortaba los cuadros por la mitad, que es lo que se ve.
   *
   * Ahora se hace al revés. En el teléfono, donde la página ocupa la ventana
   * entera, se ESCALA la celda para que en el ancho quepa un número exacto de
   * ellas: veintidós, veinte de columna y una de relleno a cada lado. No sobra
   * nada por los bordes, la columna empieza justo sobre una raya y todo lo que
   * mida celdas enteras —una tarjeta, la portada de un libro— encaja solo. En
   * pantalla ancha la columna ya no crece más que su tope, así que ahí la celda
   * se deja como está y se recorta la columna a celdas enteras repartiendo el
   * sobrante entre los dos rellenos; da las mismas veinte.
   *
   * Escalar la celda es escalar la raíz: toda la hoja está en `rem` a partir de
   * ella —el cuerpo de letra, los rellenos, las tarjetas—, así que se mueve
   * todo junto y en la misma proporción. Un teléfono estrecho ve el mismo
   * diseño, un poco más pequeño.
   *
   * Se calcula en el <head>, antes del primer pintado, y no hace falta
   * recordar nada de una página a otra: solo depende del ancho de la ventana y
   * de la celda, y ambos salen de :root, que ya está resuelta cuando este
   * script corre. El <body> todavía no existe, y por eso no se mide con
   * `celda()`.
   */
  var raiz = document.documentElement;

  /* El cuerpo de letra que pone la hoja, antes de que lo toquemos. Se guarda la
     primera vez: después, leerlo devolvería el que hayamos puesto nosotros. */
  var baseRaiz = 0;

  /** Una medida de :root —`--celda`, `--ancho-max`— en `rem`, o sea su razón
      con el cuerpo de la raíz. Así no depende de la escala que apliquemos. */
  function razon(nombre) {
    var cs = getComputedStyle(raiz);
    var v = cs.getPropertyValue(nombre).trim();
    var n = parseFloat(v);
    if (!n) return 0;
    return /r?em$/.test(v) ? n : n / parseFloat(cs.fontSize);
  }

  function centrarRejilla() {
    if (!baseRaiz) {
      raiz.style.fontSize = "";
      baseRaiz = parseFloat(getComputedStyle(raiz).fontSize);
    }
    var rCelda = razon("--celda");
    var rTope = razon("--ancho-max");
    if (!rCelda || !baseRaiz) return;

    /* El ancho de verdad para maquetar, que no es `clientWidth`: con el hueco
       de la barra reservado y sin barra —una página corta— `clientWidth` lo
       cuenta igualmente y devolvía quince píxeles de más. La caja del propio
       <html> sí mide lo que hay. */
    var ancho = raiz.getBoundingClientRect().width || raiz.clientWidth;
    var cBase = rCelda * baseRaiz;
    var tope = rTope * baseRaiz;
    /* Cuántas celdas mide la columna de lectura: las que caben en el envoltorio
       más ancho posible, dejando una de relleno a cada lado. Sale de la hoja,
       no es un número escrito aquí. */
    var columna = Math.floor((tope - 2 * cBase) / cBase);

    var c, pad, izq;
    if (ancho <= tope) {
      /* Teléfono: la celda se ajusta al ancho. Se redondea a la baja al
         céntimo de píxel para que las veintidós quepan seguro y no asome una
         barra de desplazamiento horizontal por milésimas. */
      c = Math.floor((ancho / (columna + 2)) * 100) / 100;
      raiz.style.fontSize = c / rCelda + "px";
      pad = c;
      izq = c;
    } else {
      /* Pantalla ancha: la celda es la de la hoja y lo que se ajusta es el
         relleno, que queda entre una celda y celda y media. */
      raiz.style.fontSize = "";
      c = cBase;
      pad = c + ((((tope - 2 * c) % c) + c) % c) / 2;
      izq = (ancho - tope) / 2 + pad;
    }

    raiz.style.setProperty("--pad", pad.toFixed(2) + "px");
    raiz.style.setProperty(
      "--desfase",
      ((((izq % c) + c) % c).toFixed(2)) + "px",
    );

    /* El visor del personaje se sale de la columna para verse grande, y va
       centrado en la ventana igual que ella. Dos cosas centradas en lo mismo
       caen sobre las mismas rayas solo si sus anchos se llevan un número
       ENTERO de celdas: si uno mide un par y el otro un impar, el visor queda
       a media celda. De ahí que se le dé el mayor número de celdas que quepa
       en la ventana con la misma paridad que la columna. */
    var cabe = Math.min(Math.floor(ancho / c), VISOR_MAX);
    if ((cabe - columna) % 2) cabe -= 1;
    raiz.style.setProperty("--visor", (cabe * c).toFixed(2) + "px");
  }

  /* Tope del visor en celdas. Más ancho que esto, en una pantalla grande, y el
     personaje pasa de ser una figura a ser un cartel. */
  var VISOR_MAX = 26;

  centrarRejilla();

  window.AramRejilla = { cuadrar: cuadrar, centrar: centrarRejilla };
})();
