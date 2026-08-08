/**
 * Favoritos y visitados recientes.
 *
 * El carrusel de Matemáticas no enseña a los veintidós: enseña a los que
 * interesan a QUIEN mira. Primero los marcados como favoritos, después los
 * consultados hace poco, y si no hay ni de unos ni de otros —primera visita—
 * los primeros de la lista, para que nunca se vea un hueco.
 *
 * El límite es blando por arriba: si hay más favoritos que sitios, se amplía
 * hasta caberlos todos. Marcar a alguien y que desapareciera del carrusel por
 * falta de sitio sería justo lo contrario de lo que se pide al marcarlo.
 *
 * Todo vive en el navegador de cada uno. No hay servidor donde guardar esto, y
 * tampoco hace falta: es una comodidad de lectura, no un dato del sitio. Se
 * pierde al cambiar de dispositivo o al limpiar el almacenamiento.
 */
(function () {
  "use strict";

  /**
   * Tapa el carrusel hasta saber a quién le toca salir.
   *
   * El HTML trae siempre las mismas tarjetas —las primeras de la lista—, y
   * quiénes son de verdad depende de lo que haya guardado este navegador, que
   * no se puede leer hasta que la lista existe. Entre una cosa y la otra el
   * navegador puede pintar, y se veían un momento unas caras que enseguida
   * eran otras.
   *
   * La regla la pone el propio script y la quita él mismo: si no hay
   * JavaScript no llega a existir, y el carrusel se ve entero en vez de
   * quedarse en blanco para siempre.
   */
  var tapa = document.createElement("style");
  tapa.textContent = ".caras[data-limite]{visibility:hidden}";
  document.head.appendChild(tapa);

  function destapar() {
    if (tapa.parentNode) tapa.parentNode.removeChild(tapa);
  }

  var FAVORITOS = "aram:favoritos";
  var RECIENTES = "aram:recientes";
  /* Cuántos caben antes de tener que arrastrar. */
  var LIMITE = 6;
  /* Cuántos visitados se recuerdan; más allá no aportan. */
  var MEMORIA = 12;

  function leer(clave) {
    try {
      var v = JSON.parse(localStorage.getItem(clave) || "[]");
      return Array.isArray(v) ? v.filter(function (x) { return typeof x === "string"; }) : [];
    } catch (e) {
      /* Almacenamiento bloqueado o contenido corrupto: se sigue sin memoria. */
      return [];
    }
  }

  function escribir(clave, lista) {
    try {
      localStorage.setItem(clave, JSON.stringify(lista));
    } catch (e) {
      /* En modo privado esto puede fallar; no es motivo para romper la página. */
    }
  }

  /** Deja `id` el primero de la lista y recorta a `tope`. */
  function alFrente(lista, id, tope) {
    var sinEl = lista.filter(function (x) { return x !== id; });
    sinEl.unshift(id);
    return tope ? sinEl.slice(0, tope) : sinEl;
  }

  function esFavorito(id) {
    return leer(FAVORITOS).indexOf(id) >= 0;
  }

  function alternar(id) {
    var favs = leer(FAVORITOS);
    var i = favs.indexOf(id);
    if (i >= 0) favs.splice(i, 1);
    else favs.unshift(id);
    escribir(FAVORITOS, favs);
    return i < 0;
  }

  /* Se guarda para poder repintar el botón al volver de la caché de retroceso
     sin volver a engancharle el manejador. */
  var repintarBoton = null;

  /** Botón de estrella de una ficha. */
  function montarBoton() {
    var boton = document.querySelector("[data-fav]");
    if (!boton) return;

    var id = boton.getAttribute("data-fav");

    function pintar(activo) {
      boton.setAttribute("aria-pressed", activo ? "true" : "false");
      boton.textContent = activo ? "★ En favoritos" : "☆ Añadir a favoritos";
    }

    repintarBoton = function () {
      pintar(esFavorito(id));
    };

    repintarBoton();
    boton.addEventListener("click", function () {
      pintar(alternar(id));
    });
  }

  /** Visitar una ficha la pone al frente de los recientes. */
  function anotarVisita() {
    var marca = document.querySelector("[data-ficha]");
    if (!marca) return;
    escribir(RECIENTES, alFrente(leer(RECIENTES), marca.getAttribute("data-ficha"), MEMORIA));
  }

  /**
   * Se queda con los que toca y esconde el resto.
   *
   * Esconder y no borrar: el HTML llega con los veintidós, así que sin
   * JavaScript se ven todos —que es peor, pero no está roto— y al marcar un
   * favorito nuevo no hay que ir a buscar su tarjeta a ningún sitio.
   */
  function filtrarCarrusel() {
    var lista = document.querySelector(".caras[data-limite]");
    if (!lista) return;

    var fichas = Array.prototype.slice.call(lista.children);
    var favs = leer(FAVORITOS);
    var rec = leer(RECIENTES);

    var tope = Math.max(parseInt(lista.getAttribute("data-limite"), 10) || LIMITE, favs.length);

    /* Favoritos primero, después los vistos hace poco y, si aún sobra sitio,
       los demás por orden. El carrusel nunca se queda a medias: con dos
       visitados y seis huecos, cuatro tarjetas vacías se leen como un error. */
    var elegidos = favs.slice();
    [rec, fichas.map(function (li) { return li.getAttribute("data-id"); })].forEach(
      function (fuente) {
        fuente.forEach(function (id) {
          if (id && elegidos.indexOf(id) < 0) elegidos.push(id);
        });
      },
    );
    elegidos = elegidos.slice(0, tope);

    var orden = {};
    elegidos.forEach(function (id, i) { orden[id] = i; });

    fichas.forEach(function (li) {
      var id = li.getAttribute("data-id");
      var dentro = Object.prototype.hasOwnProperty.call(orden, id);
      li.hidden = !dentro;
      if (dentro) li.style.order = orden[id];
    });

    /* Al primero. El navegador guarda el desplazamiento de los contenedores
       que se pueden recorrer y lo restituye al volver a la página, así que el
       carrusel reaparecía por donde se hubiera quedado — y con otras tarjetas
       dentro, además. */
    lista.scrollLeft = 0;

    lista.dataset.mostrados = String(elegidos.length);
  }

  /** Quita acentos y mayúsculas: se busca «Godel» y sale «Gödel». */
  function llano(t) {
    return t
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  /**
   * Buscador del índice.
   *
   * Filtra las tarjetas que ya están en la página; no pide nada al servidor ni
   * carga un índice aparte, que para cuarenta y siete fichas sería
   * desproporcionado. Cada tarjeta lleva en `data-busca` su nombre,
   * procedencia, época y resumen, ya en minúsculas y sin acentos.
   *
   * El índice va por países, así que hay una cuadrícula por grupo y no una
   * sola. Cuando a un grupo no le queda nadie se esconde también su título, o
   * quedaría «Noruega» encabezando un hueco.
   */
  function montarBuscador() {
    var campo = document.querySelector("[data-buscador]");
    var listas = document.querySelectorAll(".caras-rejilla");
    if (!campo || !listas.length) return;

    var aviso = document.querySelector("[data-sin-resultados]");

    function filtrar() {
      var q = llano(campo.value.trim());
      var vistos = 0;

      Array.prototype.forEach.call(listas, function (lista) {
        var dentroDelGrupo = 0;
        Array.prototype.forEach.call(lista.children, function (li) {
          var dentro =
            !q || (li.getAttribute("data-busca") || "").indexOf(q) >= 0;
          li.hidden = !dentro;
          if (dentro) dentroDelGrupo++;
        });
        vistos += dentroDelGrupo;

        var pais = lista.getAttribute("data-pais");
        var titulo = pais && document.querySelector('h2.pais[data-pais="' + pais + '"]');
        lista.hidden = dentroDelGrupo === 0;
        if (titulo) titulo.hidden = dentroDelGrupo === 0;
      });

      if (aviso) aviso.hidden = vistos > 0;
      if (window.AramRejilla) window.AramRejilla.cuadrar();
    }

    campo.addEventListener("input", filtrar);
    /* El navegador conserva el texto del campo al volver atrás. */
    if (campo.value) filtrar();
  }

  function montar() {
    try {
      anotarVisita();
      montarBoton();
      filtrarCarrusel();
      montarBuscador();
    } finally {
      /* Pase lo que pase: un carrusel invisible es peor que uno mal ordenado. */
      destapar();
    }
    /* Se han escondido tarjetas: lo que va debajo ha cambiado de sitio. */
    if (window.AramRejilla) window.AramRejilla.cuadrar();
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", montar);
  else montar();

  /**
   * Al volver con el gesto de retroceso.
   *
   * El navegador guarda la página entera en su caché y la devuelve tal como
   * estaba: no se ejecuta ningún script, así que el carrusel reaparecía con el
   * orden de antes y había que recargar a mano para ver el recién visitado.
   * `persisted` distingue esa vuelta de una carga normal.
   *
   * No se vuelve a montar todo: solo se repasa lo que depende de la memoria, y
   * el botón se repinta sin volver a engancharle el manejador, que seguiría
   * puesto y respondería dos veces.
   */
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    anotarVisita();
    if (repintarBoton) repintarBoton();
    filtrarCarrusel();
    if (window.AramRejilla) window.AramRejilla.cuadrar();
  });
})();
