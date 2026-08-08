/**
 * Taller — la lógica de la ventana.
 *
 * Dos editores en una misma ventana:
 *
 * - VOXEL: se elige personaje, se le cambian piezas y colores y el modelo se
 *   recompone de verdad —lo hace build_model.py, el mismo que usa el sitio— y
 *   se dibuja en el visor. Nada se guarda hasta darle a guardar.
 * - APORTES: teoremas y demás resultados, con su ruta (materia, tema,
 *   capítulo), su autor y su enunciado en LaTeX, con vista previa en KaTeX.
 *   Salen en la ficha de quien los firma, dentro de sus aportes.
 *
 * El visor es el mismo montaje que el del sitio, recortado: un grupo por hueso,
 * caras ocultas por hueso —si se calcula contra el modelo entero, al separarse
 * las piezas se ve el interior hueco— y sin animación, que aquí estorba para
 * juzgar un peinado.
 */
(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };
  var aviso = $("[data-aviso]");

  function decir(texto, mal) {
    aviso.textContent = texto || "";
    aviso.classList.toggle("mal", !!mal);
  }

  async function api(nombre, datos) {
    var r = await fetch("/api/" + nombre, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos || {}),
    });
    var j = await r.json();
    if (!r.ok) throw new Error(j.error || "falló " + nombre);
    return j;
  }

  /* Lo que parte un texto en prosa y matemáticas: $$…$$ en bloque, $…$ en
     línea. Los trozos impares del reparto son las fórmulas. */
  var SEPARA_MATE = new RegExp(
    "(\\$\\$[\\s\\S]*?\\$\\$|\\$[^$\\n]*?\\$)",
  );

  /* ── Visor ─────────────────────────────────────────────────────────────── */

  var FACES = [
    { n: [1, 0, 0], d: [1, 0, 0], c: [[1,0,0],[1,1,0],[1,1,1],[1,0,1]] },
    { n: [-1, 0, 0], d: [-1, 0, 0], c: [[0,0,0],[0,0,1],[0,1,1],[0,1,0]] },
    /* En el volcado, +Y del modelo es la profundidad y +Z la altura. */
    { n: [0, 1, 0], d: [0, 0, 1], c: [[0,1,0],[0,1,1],[1,1,1],[1,1,0]] },
    { n: [0, -1, 0], d: [0, 0, -1], c: [[0,0,0],[1,0,0],[1,0,1],[0,0,1]] },
    { n: [0, 0, 1], d: [0, 1, 0], c: [[0,0,1],[1,0,1],[1,1,1],[0,1,1]] },
    { n: [0, 0, -1], d: [0, -1, 0], c: [[0,0,0],[0,1,0],[1,1,0],[1,0,0]] },
  ];

  var hueco = $("[data-lienzo]");
  var escena = new THREE.Scene();
  var camara = new THREE.PerspectiveCamera(32, 1, 0.1, 500);
  var render = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  render.setPixelRatio(Math.min(devicePixelRatio, 2));
  hueco.appendChild(render.domElement);

  escena.add(new THREE.AmbientLight(0xffffff, 0.58));
  var sol = new THREE.DirectionalLight(0xfff4e0, 0.42);
  sol.position.set(40, 60, 30);
  escena.add(sol);
  var relleno = new THREE.DirectionalLight(0x88aaff, 0.16);
  relleno.position.set(-40, 20, -30);
  escena.add(relleno);

  /* `FrontSide` y no `DoubleSide`: en la juntura de dos huesos cada uno emite
     su cara en el mismo plano que el otro, mirando en sentidos contrarios, y
     dibujando las dos caían a la misma profundidad — de ahí el rayado que
     temblaba por toda la figura. Con solo la cara de fuera, la de dentro se
     descarta y no hay pelea. */
  var material = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.FrontSide });
  var soporte = new THREE.Group();
  /* La animación es Z-arriba y el mundo de three es Y-arriba: el giro va en el
     soporte y el enderezado en un grupo de dentro, o girar de lado acabaría
     volcando al personaje. */
  var eje = new THREE.Group();
  eje.rotation.x = -Math.PI / 2;
  soporte.add(eje);
  escena.add(soporte);
  var giro = 0.6, elevacion = 0.15, distancia = 60;

  function malla(voxels, palette, cx, cz, occ) {
    var pos = [], nor = [], col = [];
    for (var i = 0; i < voxels.length; i++) {
      var v = voxels[i];
      /* Los ejes del volcado, sin tocar: la tabla FACES está escrita para
         ellos y la prueba de oclusión usa sus direcciones. Cambiarlos aquí
         dejaba de casar y el modelo salía deshecho, con caras sueltas. Quien
         endereza la figura es el grupo `eje`, igual que en el visor del
         sitio. */
      var ax = v[0] - cx, ay = v[2] - cz, az = v[1];
      var c = palette[v[3]];
      var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
      for (var f = 0; f < FACES.length; f++) {
        var cara = FACES[f];
        if (occ.has((v[0] + cara.d[0]) + "," + (v[1] + cara.d[1]) + "," + (v[2] + cara.d[2]))) continue;
        var orden = [0, 1, 2, 0, 2, 3];
        for (var k = 0; k < 6; k++) {
          var q = cara.c[orden[k]];
          pos.push(ax + q[0], ay + q[1], az + q[2]);
          nor.push(cara.n[0], cara.n[1], cara.n[2]);
          col.push(r, g, b);
        }
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    return geo;
  }

  var grupoCabeza = null;   /* para el retrato: se fotografía solo la cabeza */

  function dibujar(modelo) {
    while (eje.children.length) eje.remove(eje.children[0]);
    grupoCabeza = null;
    var cx = modelo.dims[0] / 2, cz = modelo.dims[2] / 2;
    var porHueso = {};
    for (var i = 0; i < modelo.voxels.length; i++) {
      var v = modelo.voxels[i];
      var h = modelo.bones[v[4]];
      (porHueso[h] || (porHueso[h] = [])).push(v);
    }
    for (var h in porHueso) {
      var occ = new Set();
      for (var j = 0; j < porHueso[h].length; j++) {
        var w = porHueso[h][j];
        occ.add(w[0] + "," + w[1] + "," + w[2]);
      }
      var pieza = new THREE.Mesh(malla(porHueso[h], modelo.palette, cx, cz, occ), material);
      pieza.userData.hueso = h;
      eje.add(pieza);
      if (h === "head") grupoCabeza = pieza;
    }
    $("[data-cuenta]").textContent =
      modelo.voxels.length + " vóxeles · " + modelo.bones.length + " huesos";
  }

  function encuadrar() {
    var w = hueco.clientWidth, alto = hueco.clientHeight;
    render.setSize(w, alto, false);
    camara.aspect = w / alto;
    camara.updateProjectionMatrix();
  }

  function bucle() {
    soporte.rotation.y = giro;
    camara.position.set(
      Math.sin(0) * distancia,
      16 + elevacion * distancia,
      Math.cos(0) * distancia,
    );
    camara.lookAt(0, 16, 0);
    render.render(escena, camara);
    requestAnimationFrame(bucle);
  }

  (function arrastre() {
    var x0 = 0, y0 = 0, activo = false;
    hueco.addEventListener("pointerdown", function (e) {
      activo = true; x0 = e.clientX; y0 = e.clientY;
      hueco.classList.add("girando");
      hueco.setPointerCapture(e.pointerId);
    });
    hueco.addEventListener("pointermove", function (e) {
      if (!activo) return;
      giro += (e.clientX - x0) * 0.01;
      elevacion = Math.max(-0.4, Math.min(1.2, elevacion + (e.clientY - y0) * 0.004));
      x0 = e.clientX; y0 = e.clientY;
    });
    ["pointerup", "pointercancel"].forEach(function (ev) {
      hueco.addEventListener(ev, function () { activo = false; hueco.classList.remove("girando"); });
    });
    hueco.addEventListener("wheel", function (e) {
      e.preventDefault();
      distancia = Math.max(24, Math.min(160, distancia + e.deltaY * 0.05));
    }, { passive: false });
  })();

  addEventListener("resize", encuadrar);

  /* ── Estado ────────────────────────────────────────────────────────────── */

  var DATOS = { personajes: {}, fichas: {}, aportes: [], piezas: {} };
  var actual = null;   /* id del personaje en edición */
  var ficha = null;    /* copia de trabajo, no se toca el original hasta guardar */
  var tipoVisible = "cabello";
  var aporteActual = -1;

  var CAMPO = { cabello: "pelo", barba: "barba", atuendo: "oficio", cara: "cara" };

  function nuevoPersonaje() {
    return {
      sexo: "m", oficio: "carpenter", cara: "m_head",
      pelo: null, barba: null, piel: "white", color: "brown", ojos: "marron",
    };
  }

  /* Un color de paleta o uno suelto: el selector siempre necesita un hex. */
  function hexDe(valor, tabla) {
    if (typeof valor === "string" && valor[0] === "#") return valor;
    var p = (DATOS.piezas.paletas || {})[tabla];
    var v = p && p[valor];
    return v ? v[Math.min(1, v.length - 1)] : "#808080";
  }

  var esperando = null;
  async function refrescar() {
    if (!ficha) return;
    /* Una petición cada vez: pulsar cinco piezas seguidas no puede lanzar cinco
       composiciones que lleguen desordenadas. */
    if (esperando) { esperando.pendiente = true; return; }
    esperando = { pendiente: false };
    try {
      decir("componiendo…");
      var r = await api("previa", { personaje: ficha });
      dibujar(r.modelo);
      decir("");
    } catch (e) {
      decir(e.message, true);
    } finally {
      var otra = esperando.pendiente;
      esperando = null;
      if (otra) refrescar();
    }
  }

  /* ── Pintar la interfaz ────────────────────────────────────────────────── */

  function pintarGente() {
    var ul = $("[data-gente]");
    ul.innerHTML = "";
    Object.keys(DATOS.personajes).forEach(function (id) {
      var li = document.createElement("li");
      li.textContent = DATOS.fichas[id] || id;
      var s = document.createElement("small");
      s.textContent = id;
      li.appendChild(s);
      li.className = id === actual ? "activo" : "";
      li.onclick = function () { abrir(id); };
      ul.appendChild(li);
    });
  }

  function pintarPaletas() {
    [["color", "pelo"], ["piel", "piel"], ["ojos", "ojos"]].forEach(function (par) {
      var sel = document.querySelector('[data-paleta="' + par[0] + '"]');
      sel.innerHTML = "";
      var tabla = (DATOS.piezas.paletas || {})[par[1]] || {};
      var vacio = document.createElement("option");
      vacio.value = ""; vacio.textContent = "— color propio —";
      sel.appendChild(vacio);
      Object.keys(tabla).forEach(function (k) {
        var o = document.createElement("option");
        o.value = k; o.textContent = k;
        sel.appendChild(o);
      });
      sel.onchange = function () {
        if (!ficha || !sel.value) return;
        ficha[par[0]] = sel.value;
        document.querySelector('[data-color="' + par[0] + '"]').value = hexDe(sel.value, par[1]);
        refrescar();
      };
    });

    [["color", "pelo"], ["piel", "piel"], ["ojos", "ojos"]].forEach(function (par) {
      var pick = document.querySelector('[data-color="' + par[0] + '"]');
      pick.oninput = function () {
        if (!ficha) return;
        ficha[par[0]] = pick.value.toUpperCase();
        document.querySelector('[data-paleta="' + par[0] + '"]').value = "";
        refrescar();
      };
    });
  }

  function pintarCatalogo() {
    var caja = $("[data-catalogo]");
    var filtro = $("[data-filtro]").value.trim().toLowerCase();
    var lista = (DATOS.piezas[tipoVisible] || []).filter(function (p) {
      if (filtro && p.nombre.toLowerCase().indexOf(filtro) < 0) return false;
      /* Los atuendos y las caras vienen por sexo. */
      if (tipoVisible === "atuendo") return p.nombre.endsWith("_" + ficha.sexo + ".qb".slice(0, 0) + ficha.sexo) || p.nombre.endsWith("_" + ficha.sexo);
      if (tipoVisible === "cara") return p.nombre.indexOf(ficha.sexo + "_head") === 0;
      return true;
    });
    caja.innerHTML = "";

    if (tipoVisible !== "cara") {
      var nada = document.createElement("div");
      nada.className = "pieza" + (!ficha[CAMPO[tipoVisible]] ? " puesta" : "");
      nada.innerHTML = '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" ' +
        'style="aspect-ratio:1"><span>— ninguno —</span>';
      nada.onclick = function () { ficha[CAMPO[tipoVisible]] = null; pintarCatalogo(); refrescar(); };
      caja.appendChild(nada);
    }

    lista.forEach(function (p) {
      var valor = tipoVisible === "atuendo"
        ? p.nombre.replace(/^o_/, "").replace(/_[mf]$/, "")
        : p.nombre;
      var puesto = ficha[CAMPO[tipoVisible]] === valor;
      var d = document.createElement("div");
      d.className = "pieza" + (puesto ? " puesta" : "");
      var extra = "";
      if (p.corona !== undefined) {
        var flojo = p.corona < 80 || p.nuca < 70;
        extra = '<b class="' + (flojo ? "flojo" : "") + '">' + p.nuca + "</b>";
      }
      d.innerHTML = '<img src="piezas/' + p.nombre + '.png" loading="lazy">' + extra +
        "<span>" + valor + "</span>";
      d.title = p.nombre + (p.corona !== undefined
        ? " · corona " + p.corona + "% · nuca " + p.nuca + "%" : "") +
        (p.propio >= 0.8 ? " · COLOR FIJO" : p.propio >= 0.02 ? " · con adorno" : "");
      d.onclick = function () {
        ficha[CAMPO[tipoVisible]] = valor;
        if (tipoVisible === "cara") ficha.cara = valor;
        /* Las piezas del lado femenino están talladas para una cabeza dos
           vóxeles más baja: sobre un hombre dejan la coronilla al aire. Se
           suben solas al elegirlas, y desde ahí se puede seguir moviéndolas a
           mano con la cruz de arriba. */
        if (tipoVisible === "cabello") {
          ficha.ajuste = ficha.ajuste || {};
          var sube = ficha.sexo === "m" ? p.alza || 0 : 0;
          ficha.ajuste.cabello = [0, sube, 0];
        }
        pintarCatalogo();
        pintarMover();
        refrescar();
      };
      caja.appendChild(d);
    });
  }

  function abrir(id) {
    actual = id;
    ficha = Object.assign(nuevoPersonaje(), DATOS.personajes[id] || {});
    $("[data-id]").value = id;
    $("[data-sexo]").value = ficha.sexo;
    document.querySelector('[data-color="color"]').value = hexDe(ficha.color, "pelo");
    document.querySelector('[data-color="piel"]').value = hexDe(ficha.piel, "piel");
    document.querySelector('[data-color="ojos"]').value = hexDe(ficha.ojos, "ojos");
    document.querySelector('[data-paleta="color"]').value = ficha.color[0] === "#" ? "" : ficha.color;
    document.querySelector('[data-paleta="piel"]').value = ficha.piel[0] === "#" ? "" : ficha.piel;
    document.querySelector('[data-paleta="ojos"]').value = ficha.ojos[0] === "#" ? "" : ficha.ojos;
    pintarGente();
    pintarCatalogo();
    pintarMover();
    refrescar();
  }

  /* ── Aportes ───────────────────────────────────────────────────────────── */

  function aporteVacio() {
    return { autor: "", nombre: "", materia: "", libro: "", tema: "", temaLibro: "",
             capitulo: "", tipo: "teorema", latex: "", segundo: "" };
  }

  /**
   * El menú de aportes, en carpetas.
   *
   * Agrupado por materia —y dentro por tema, que es su subcarpeta— o por quien
   * lo firma. En una lista plana, con treinta aportes no se encuentra ninguno.
   * Las carpetas se pliegan y se recuerda cuáles quedaron abiertas, para que
   * guardar un aporte no cierre el árbol entero.
   */
  var agruparPor = "materia";
  var abiertas = {};

  function pintarAportes() {
    var ul = $("[data-lista-aportes]");
    ul.innerHTML = "";

    /* carpeta -> subcarpeta -> aportes, con su índice para poder abrirlos. */
    var arbol = {};
    DATOS.aportes.forEach(function (a, i) {
      var carpeta, sub;
      if (agruparPor === "autor") {
        carpeta = DATOS.fichas[a.autor] || "Sin personaje";
        sub = a.materia || "";
      } else {
        carpeta = a.materia || "Sin materia";
        /* Dentro de una materia, el tema; y si el aporte va de un libro, el
           capítulo, que es como se ordenan los libros. */
        sub = (a.libro ? a.capitulo : a.tema) || "";
      }
      arbol[carpeta] = arbol[carpeta] || {};
      arbol[carpeta][sub] = arbol[carpeta][sub] || [];
      arbol[carpeta][sub].push(i);
    });

    Object.keys(arbol).sort().forEach(function (carpeta) {
      var subs = arbol[carpeta];
      var cuantos = Object.keys(subs).reduce(function (n, k) { return n + subs[k].length; }, 0);
      var abierta = abiertas[carpeta] !== false;

      var li = document.createElement("li");
      li.className = "carpeta" + (abierta ? " abierta" : "");
      li.textContent = carpeta + " (" + cuantos + ")";
      li.onclick = function () { abiertas[carpeta] = !abierta; pintarAportes(); };
      ul.appendChild(li);
      if (!abierta) return;

      Object.keys(subs).sort().forEach(function (sub) {
        var clave = carpeta + "›" + sub;
        var subAbierta = abiertas[clave] !== false;
        if (sub) {
          var ls = document.createElement("li");
          ls.className = "carpeta sub" + (subAbierta ? " abierta" : "");
          ls.textContent = sub + " (" + subs[sub].length + ")";
          ls.onclick = function () { abiertas[clave] = !subAbierta; pintarAportes(); };
          ul.appendChild(ls);
          if (!subAbierta) return;
        }
        subs[sub].forEach(function (i) {
          var a = DATOS.aportes[i];
          var hoja = document.createElement("li");
          hoja.className = "hoja" + (i === aporteActual ? " activo" : "");
          hoja.textContent = a.nombre || "(sin nombre)";
          var s = document.createElement("small");
          s.textContent = a.tipo || "";
          hoja.appendChild(s);
          hoja.onclick = function () { abrirAporte(i); };
          ul.appendChild(hoja);
        });
      });
    });
  }

  document.querySelectorAll("[data-agrupar]").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll("[data-agrupar]").forEach(function (o) {
        o.classList.remove("activa");
      });
      b.classList.add("activa");
      agruparPor = b.dataset.agrupar;
      pintarAportes();
    };
  });

  function leerAporte() {
    return {
      autor: $("[data-a-autor]").value,
      nombre: $("[data-a-nombre]").value.trim(),
      materia: $("[data-a-materia]").value.trim(),
      tema: $("[data-a-tema]").value.trim(),
      capitulo: $("[data-a-capitulo]").value.trim(),
      libro: $("[data-a-libro]").value,
      tipo: $("[data-a-tipo]").value,
      latex: $("[data-a-latex]").value,
      segundo: $("[data-a-segundo]").value,
      temaLibro: $("[data-a-tema-libro]").value.trim(),
    };
  }

  function abrirAporte(i) {
    aporteActual = i;
    var a = i >= 0 ? DATOS.aportes[i] : aporteVacio();
    $("[data-a-autor]").value = a.autor || "";
    $("[data-a-nombre]").value = a.nombre || "";
    $("[data-a-materia]").value = a.materia || "";
    $("[data-a-tema]").value = a.tema || "";
    $("[data-a-capitulo]").value = a.capitulo || "";
    $("[data-a-libro]").value = a.libro || "";
    $("[data-a-tipo]").value = a.tipo || "teorema";
    $("[data-a-latex]").value = a.latex || "";
    $("[data-a-segundo]").value = a.segundo || a.solucion || a.demostracion || "";
    $("[data-a-tema-libro]").value = a.temaLibro || "";
    pintarAportes();
    segunTipo();
    previa();
  }

  /**
   * Vista previa del enunciado.
   *
   * Se compone con el mismo KaTeX que el sitio, así que lo que se ve aquí es
   * exactamente lo que va a salir en la ficha. Los delimitadores son los del
   * sitio: `$…$` en línea y `$$…$$` en bloque.
   */
  function previa() {
    var m = materiaElegida();
    var libro = $("[data-a-libro]").value;
    var comoSeLlama = ((m && m.libros) || []).find(function (l) { return l.id === libro; });
    var ruta = [
      $("[data-a-materia]").value,
      comoSeLlama && comoSeLlama.titulo,
      $("[data-a-tema]").value,
      $("[data-a-capitulo]").value,
    ].filter(Boolean).join(" / ");
    var tiene = $("[data-a-ruta]").dataset.tiene;
    $("[data-a-ruta]").textContent =
      (ruta ? "ruta: " + ruta : "sin ruta") + (tiene ? "  ·  la materia tiene " + tiene : "");

    /* Los dos cuadros, uno detrás de otro: se ve el enunciado con su
       demostración como se van a leer. */
    var segundo = $("[data-a-segundo]").value;
    componer(
      $("[data-previa]"),
      $("[data-a-latex]").value + (segundo ? String.fromCharCode(10, 10) + segundo : ""),
    );
  }

  /**
   * Compone un texto con matemáticas dentro, en la caja que se le diga.
   *
   * Sin un solo delimitador se toma todo como fórmula en bloque: escribir la
   * fórmula pelada y no ver nada es lo que hace pensar que la vista previa no
   * funciona. En cuanto se escribe un `$`, manda lo que se escriba.
   */
  function componer(caja, texto) {
    caja.innerHTML = "";
    if (texto.trim() && texto.indexOf("$") < 0) texto = "$$" + texto + "$$";

    var trozos = texto.split(SEPARA_MATE);
    trozos.forEach(function (t) {
      if (!t) return;
      var bloque = t.slice(0, 2) === "$$";
      var enLinea = !bloque && t.charAt(0) === "$" && t.slice(-1) === "$" && t.length > 1;
      if (!bloque && !enLinea) {
        caja.appendChild(document.createTextNode(t));
        return;
      }
      var crudo = bloque ? t.slice(2, -2) : t.slice(1, -1);
      var span = document.createElement(bloque ? "div" : "span");
      try {
        katex.render(crudo, span, { displayMode: bloque, throwOnError: true });
      } catch (e) {
        span.className = "error";
        span.textContent = e.message;
      }
      caja.appendChild(span);
    });
  }

  /* ── Enganches ─────────────────────────────────────────────────────────── */

  document.querySelectorAll(".modo").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll(".modo").forEach(function (o) { o.classList.remove("activo"); });
      b.classList.add("activo");
      document.querySelectorAll(".taller").forEach(function (t) {
        t.classList.toggle("oculto", t.dataset.panel !== b.dataset.modo);
      });
      if (b.dataset.modo === "voxel") encuadrar();
    };
  });

  /* Solo las del catálogo: las de agrupar los aportes llevan la misma clase y
     se pisaban con estas — al pulsar «por personaje» se repintaba el catálogo y
     el árbol se quedaba como estaba. */
  document.querySelectorAll("[data-pestanas] .pestana").forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll("[data-pestanas] .pestana").forEach(function (o) {
        o.classList.remove("activa");
      });
      b.classList.add("activa");
      tipoVisible = b.dataset.tipo;
      pintarCatalogo();
      pintarMover();
    };
  });

  $("[data-filtro]").oninput = pintarCatalogo;

  /* ── Mover una pieza ──────────────────────────────────────────────────────
     Los ejes son los del modelo: X a los lados, Y arriba y abajo, Z en
     profundidad —negativo hacia la cara—. Se guarda por ranura, así que si se
     cambia el peinado el ajuste se queda con la ranura y no con la pieza: casi
     siempre es la cabeza la que pide la corrección, no un peinado concreto. */
  function pintarMover() {
    $("[data-mover-que]").textContent = tipoVisible;
    var m = (ficha && ficha.ajuste && ficha.ajuste[tipoVisible]) || [0, 0, 0];
    $("[data-mover-valor]").textContent =
      m[0] || m[1] || m[2] ? "x" + m[0] + " y" + m[1] + " z" + m[2] : "sin mover";
  }

  document.querySelectorAll("[data-mover]").forEach(function (b) {
    b.onclick = function () {
      if (!ficha) return;
      var d = b.dataset.mover.split(",").map(Number);
      ficha.ajuste = ficha.ajuste || {};
      var m = ficha.ajuste[tipoVisible] || [0, 0, 0];
      /* El botón del centro devuelve la pieza a su sitio. */
      ficha.ajuste[tipoVisible] = d[0] || d[1] || d[2]
        ? [m[0] + d[0], m[1] + d[1], m[2] + d[2]]
        : [0, 0, 0];
      pintarMover();
      refrescar();
    };
  });

  $("[data-sexo]").onchange = function () {
    ficha.sexo = $("[data-sexo]").value;
    ficha.cara = ficha.sexo === "f" ? "f_head" : "m_head";
    pintarCatalogo();
    refrescar();
  };

  $("[data-nuevo]").onclick = function () {
    actual = "";
    ficha = nuevoPersonaje();
    $("[data-id]").value = "";
    $("[data-sexo]").value = "m";
    pintarGente();
    pintarCatalogo();
    refrescar();
    $("[data-id]").focus();
  };

  /**
   * La cara de la tarjeta, hecha aquí mismo.
   *
   * Se probó a hornearla como el lote —levantando un Chromium aparte por CDP—
   * y se quedaba colgado más de dos minutos por foto. No hace falta: en esta
   * ventana ya hay un visor con el modelo montado, así que se le pone una
   * cámara con el encuadre del retrato, se dibuja fuera de pantalla y se manda
   * el PNG al servidor.
   *
   * El encuadre es el mismo que el de herramientas/voxel/render.html, y tiene
   * que serlo: la misma distancia del lote —la de distancia.json—, los mismos
   * 32 grados de giro y apuntando al PIVOTE del hueso de la cabeza más 7,5, que
   * es lo que hace que la cara caiga a la misma altura lleve melena o calva.
   */
  var LADO_RETRATO = 512;

  function hornearCara() {
    /* DESACTIVADO. La foto salía mal encuadrada: en esta ventana la geometría
       va en coordenadas del modelo y no colgada de los pivotes del esqueleto,
       así que ni el punto al que apuntar ni el giro coinciden con los del
       horneado por lotes, y la cabeza salía vista desde arriba. Mientras no se
       reproduzca aquí el montaje por huesos, la tarjeta se rehace con
       `node herramientas/voxel/retratos.mjs <modelos...>`, que es el que mide
       el lote y deja a todos al mismo zoom.

       El modelo sí se guarda y se publica: lo único que queda pendiente al
       guardar es la cara de la tarjeta. */
    return null;
  }

  function hornearCaraPendiente() {
    if (!grupoCabeza) return null;
    var lienzo = document.createElement("canvas");
    var pintor = new THREE.WebGLRenderer({
      canvas: lienzo, antialias: true, alpha: true, preserveDrawingBuffer: true,
    });
    pintor.setPixelRatio(1);
    pintor.setSize(LADO_RETRATO, LADO_RETRATO, false);
    pintor.setClearColor(0x000000, 0);

    var giroPrevio = soporte.rotation.y;
    var vistos = [];
    eje.children.forEach(function (m) {
      vistos.push(m.visible);
      m.visible = m.userData.hueso === "head";
    });
    soporte.rotation.y = ((window.__giroCara === undefined ? 32 : window.__giroCara) * Math.PI) / 180;
    soporte.updateMatrixWorld(true);

    /* A dónde se apunta. En el visor del horneado por lotes se apunta al
       PIVOTE del hueso de la cabeza, que está a la misma altura en todos los
       modelos; aquí las mallas no llevan pivote —la geometría va en
       coordenadas del modelo— así que se toma la caja de la cabeza y se apunta
       a la altura de la cara: dos tercios hacia arriba desde la barbilla, que
       es donde cae en la caja de cualquier cabeza. */
    var camaraCara = new THREE.PerspectiveCamera(35, 1, 0.1, 500);
    var caja = new THREE.Box3().setFromObject(grupoCabeza);
    var centro = caja.getCenter(new THREE.Vector3());
    var mira = new THREE.Vector3(centro.x, caja.max.y - 6.5, centro.z);
    var d = DATOS.distancia || 49.3;
    /* La cámara mira desde donde miraría en el lote: de frente al punto, a esa
       distancia, con el modelo ya girado sus 32 grados. */
    camaraCara.position.set(mira.x, mira.y, mira.z + d);
    camaraCara.lookAt(mira);
    pintor.render(escena, camaraCara);
    var datos = lienzo.toDataURL("image/png");

    eje.children.forEach(function (m, i) { m.visible = vistos[i]; });
    soporte.rotation.y = giroPrevio;
    pintor.dispose();
    return datos;
  }

  /* Se deja a mano para poder comprobarla desde fuera sin dar el clic. */
  window.__cara = hornearCara;

  $("[data-guardar]").onclick = async function () {
    var id = $("[data-id]").value.trim();
    try {
      decir("guardando…");
      var r = await api("guardar", { id: id, personaje: ficha, cara: hornearCara() });
      DATOS.personajes[id] = ficha;
      actual = id;
      pintarGente();
      decir("guardado " + r.guardado + " · " + r.vox + " vóxeles · " + r.retrato);
    } catch (e) {
      decir(e.message, true);
    }
  };

  /* Ctrl+S reconstruye, esté donde esté el foco: es el gesto que ya se hace sin
     pensar después de escribir algo. El navegador lo usa para «guardar página»,
     así que hay que quitárselo. */
  addEventListener("keydown", function (e) {
    if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "s") return;
    e.preventDefault();
    $("[data-construir]").click();
  });

  $("[data-construir]").onclick = async function () {
    try {
      decir("reconstruyendo…");
      var r = await api("construir");
      decir(r.salida.join(" · "));
    } catch (e) {
      decir(e.message, true);
    }
  };

  /**
   * La ruta de un aporte, sacada del sitio.
   *
   * La materia es una lista de verdad y no un campo con sugerencias: escrita a
   * mano no se sabía cuáles había. Al elegir una se rellenan sus libros, sus
   * temas y sus capítulos con los que ya existen ahí, para no inventar una ruta
   * que en el sitio no lleva a ningún sitio.
   */
  function pintarMaterias() {
    var sel = $("[data-a-materia]");
    var antes = sel.value;
    sel.innerHTML = '<option value="">— sin materia —</option>';
    (DATOS.materias || []).forEach(function (m) {
      var o = document.createElement("option");
      o.value = m.nombre;
      o.textContent = m.nombre;
      sel.appendChild(o);
    });
    sel.value = antes;
    pintarRuta();
  }

  function materiaElegida() {
    var nombre = $("[data-a-materia]").value;
    return (DATOS.materias || []).find(function (m) { return m.nombre === nombre; });
  }

  function pintarRuta() {
    var m = materiaElegida();

    var libros = $("[data-a-libro]");
    var antes = libros.value;
    libros.innerHTML = '<option value="">— ninguno —</option>';
    ((m && m.libros) || []).forEach(function (l) {
      var o = document.createElement("option");
      o.value = l.id;
      o.textContent = l.titulo;
      libros.appendChild(o);
    });
    libros.value = antes;

    /* Temas y capítulos: los divisores que ya hay en esa materia. Se sugieren,
       no se imponen — un tema nuevo se escribe y ya está. */
    var temas = $("[data-temas]");
    temas.innerHTML = "";
    ((m && m.temas) || []).forEach(function (t) {
      var o = document.createElement("option");
      o.value = t;
      temas.appendChild(o);
    });
    /* Los capítulos son los del LIBRO, no los temas de la materia: se estaban
       copiando de ahí y el campo se autorrellenaba con algo que no tenía nada
       que ver. */
    var libroActual = $("[data-a-libro]").value;
    var caps = ((m && m.capitulosPorLibro) || {})[libroActual] || [];
    var listaCap = $("[data-capitulos]");
    listaCap.innerHTML = "";
    caps.forEach(function (t) {
      var o = document.createElement("option");
      o.value = t;
      listaCap.appendChild(o);
    });

    /* Los del libro elegido: sus temas y capítulos, que no tienen por qué ser
       los de la materia — un resultado puede estar en «Cardinalidad» dentro de
       la materia y en «Capítulo 3» dentro del libro. */
    var libro = $("[data-a-libro]").value;
    var suyos = ((m && m.temasPorLibro) || {})[libro] || [];
    var lista = $("[data-temas-libro]");
    lista.innerHTML = "";
    suyos.forEach(function (t) {
      var o = document.createElement("option");
      o.value = t;
      lista.appendChild(o);
    });

    /* Y lo que ya hay escrito en la materia, para saber qué existe. */
    var dentro = m && m.contenido;
    $("[data-a-ruta]").dataset.tiene = dentro
      ? [
          dentro.definiciones.length + " def.",
          dentro.teoremas.length + " teo.",
          dentro.demostraciones.length + " dem.",
          dentro.ejercicios.length + " ej.",
        ].join(" · ")
      : "";
  }

  $("[data-a-materia]").onchange = function () { pintarRuta(); previa(); };
  $("[data-a-libro]").onchange = function () { pintarRuta(); previa(); };

  /* Crear en el sitio la materia que está escrita en el campo. Sale vacía: su
     página dice que aún no hay nada, como cualquier otra sin contenido. */
  $("[data-materia-nueva]").onclick = async function (e) {
    e.preventDefault();
    var nombre = prompt("Nombre de la materia nueva");
    nombre = (nombre || "").trim();
    if (!nombre) { decir("escribe antes el nombre de la materia", true); return; }
    try {
      var r = await api("materia", { nombre: nombre });
      DATOS.materias = r.materias;
      pintarMaterias();
      $("[data-a-materia]").value = nombre;
      pintarRuta();
      decir("materia «" + nombre + "» creada · " + r.id);
    } catch (err) {
      decir(err.message, true);
    }
  };

  /**
   * Dar de alta el tema o el capítulo que esté escrito al lado.
   *
   * Escribirlo en el aporte ya vale —sale igual—, pero darlo de alta lo deja
   * puesto en la materia o en el libro aunque todavía no cuelgue nada de él, y
   * desde ese momento aparece en el desplegable. La sección a la que va es la
   * que le toque al tipo del aporte: un ejercicio abre tema en ejercicios y un
   * teorema en teoremas.
   */
  var SECCION_DE = {
    ejercicio: "ejercicios",
    "definición": "definiciones",
  };

  document.querySelectorAll("[data-nuevo-divisor]").forEach(function (b) {
    b.onclick = async function (e) {
      e.preventDefault();
      var cual = b.dataset.nuevoDivisor;
      var campo = $("[data-a-" + (cual === "temaLibro" ? "tema-libro" : cual) + "]");
      var texto = campo.value.trim();
      var m = materiaElegida();
      if (!m) { decir("elige antes la materia", true); return; }
      if (!texto) { decir("escribe antes el tema", true); return; }

      var libro = cual === "tema" ? "" : $("[data-a-libro]").value;
      if (cual !== "tema" && !libro) { decir("elige antes el libro", true); return; }

      try {
        var r = await api("divisor", {
          materia: m.id,
          seccion: SECCION_DE[$("[data-a-tipo]").value] || "teoremas",
          texto: texto,
          libro: libro,
        });
        DATOS.materias = r.materias;
        pintarMaterias();
        $("[data-a-materia]").value = m.nombre;
        pintarRuta();
        campo.value = texto;
        decir("«" + texto + "» dado de alta");
      } catch (err) {
        decir(err.message, true);
      }
    };
  });

  $("[data-aporte-nuevo]").onclick = function () { abrirAporte(-1); };

  $("[data-a-guardar]").onclick = async function () {
    var a = leerAporte();
    /* El autor es opcional: un ejercicio o una definición de la materia no
       tienen por qué ser de nadie. Sin autor no sale en ninguna ficha, y con
       ruta sí sale en su materia. */
    if (!a.nombre) { decir("falta el nombre del aporte", true); return; }
    try {
      var r = await api("aporte", { aporte: a, indice: aporteActual });
      if (aporteActual < 0) { DATOS.aportes.push(a); aporteActual = DATOS.aportes.length - 1; }
      else DATOS.aportes[aporteActual] = a;
      pintarAportes();
      decir("guardado · " + r.total + " aportes en total");
    } catch (e) {
      decir(e.message, true);
    }
  };

  $("[data-a-borrar]").onclick = async function () {
    if (aporteActual < 0) return;
    await api("borrarAporte", { indice: aporteActual });
    DATOS.aportes.splice(aporteActual, 1);
    abrirAporte(-1);
    decir("borrado");
  };

  /* Los dos cuadros son siempre los mismos; lo que cambia es cómo se llaman.
     Un ejercicio es problema y resolución; lo demás, enunciado y demostración. */
  function segunTipo() {
    var esEjercicio = $("[data-a-tipo]").value === "ejercicio";
    $("[data-rotulo-arriba]").textContent =
      (esEjercicio ? "problema" : "enunciado") + " · LaTeX";
    $("[data-rotulo-abajo]").textContent =
      (esEjercicio ? "resolución" : "demostración") + " · LaTeX";
  }

  $("[data-a-tipo]").onchange = segunTipo;

  /* Lo que al teclearse repinta la vista previa. Se comprueba que el campo
     exista: nombrar aquí uno que ya no está reventaba el arranque entero y la
     ventana salía vacía —sin personajes, sin piezas y sin paletas—, porque lo
     que viene detrás de esta línea no llegaba a ejecutarse. */
  [
    "[data-a-latex]",
    "[data-a-segundo]",
    "[data-a-materia]",
    "[data-a-tema]",
    "[data-a-tema-libro]",
    "[data-a-capitulo]",
    "[data-a-libro]",
  ].forEach(function (sel) {
    var campo = $(sel);
    if (campo) campo.oninput = previa;
  });

  /* ── Contenido de las materias ─────────────────────────────────────────────
     Lo que hay escrito dentro de cada materia —y dentro de cada libro—, visible
     y editable: el orden, los temas, las etiquetas y lo que dice cada entrada.
     Se guarda la sección entera de una vez, porque añadir, mover, borrar y meter
     un tema son lo mismo: la lista queda de otra manera.

     Una entrada puede leerse en dos páginas —en su libro y en la sección general
     de la materia— sin estar escrita dos veces: la general lleva una referencia
     `{ de: libro, ref: id }` y lo que se edita es siempre el original. Por eso
     al guardar puede irse más de una lista. */

  var SECCIONES_M = ["definiciones", "teoremas", "ejercicios", "articulos"];
  var mMateria = null;   /* id de la materia abierta */
  var mLibro = "";       /* id del libro, o "" para la materia entera */
  var mSeccion = "teoremas";
  var mLista = [];       /* copia de trabajo: no se toca el disco hasta guardar */
  var mCual = -1;        /* la entrada que se está escribiendo */
  var mTocadas = {};     /* otras listas que hay que guardar: "libro|sección" */

  /* Dónde sube cada sección de un libro dentro de la materia. Un teorema del
     libro es un teorema de la materia; una definición, una definición. */
  var SUBE_A = { definiciones: "definiciones", demostraciones: "teoremas" };

  function mDeMateria() {
    return (DATOS.materias || []).find(function (x) { return x.id === mMateria; });
  }

  function mListaDe(libro, seccion) {
    var m = mDeMateria();
    if (!m) return [];
    var de = libro ? (m.contenidoLibros || {})[libro] || {} : m.contenido || {};
    de[seccion] = de[seccion] || [];
    return de[seccion];
  }

  function mCargar() {
    /* Copia y no el original: cancelar es no guardar. */
    mLista = JSON.parse(JSON.stringify(mListaDe(mLibro, mSeccion)));
    mTocadas = {};
  }

  /**
   * Lo que hay detrás de una entrada: ella misma, o el original si es una
   * referencia. Todo lo que se enseña y se edita pasa por aquí, y así tocar la
   * copia de la general es imposible: no hay copia.
   */
  function mOrigen(cosa) {
    if (!cosa || cosa.ref === undefined) return null;
    var m = mDeMateria();
    var dentro = ((m && m.contenidoLibros) || {})[cosa.de] || {};
    var secciones = ["definiciones", "demostraciones"];
    for (var i = 0; i < secciones.length; i++) {
      var lista = dentro[secciones[i]] || [];
      for (var j = 0; j < lista.length; j++) {
        if (lista[j] && lista[j].id === cosa.ref) {
          return { entrada: lista[j], libro: cosa.de, seccion: secciones[i] };
        }
      }
    }
    return null;
  }

  /** La entrada de verdad detrás del índice `i`, y de qué lista sale. */
  function mReal(i) {
    var cosa = mLista[i];
    if (!cosa) return null;
    var o = mOrigen(cosa);
    if (o) return o;
    if (cosa.ref !== undefined) return null;   /* referencia rota */
    return { entrada: cosa, libro: mLibro, seccion: mSeccion };
  }

  function mComoSeLlamaElLibro(id) {
    var m = mDeMateria();
    var l = ((m && m.libros) || []).find(function (x) { return x.id === id; });
    return l ? l.titulo : id;
  }

  function mPintarMaterias() {
    var ul = $("[data-m-lista]");
    ul.innerHTML = "";
    (DATOS.materias || []).forEach(function (m) {
      var li = document.createElement("li");
      li.textContent = m.nombre;
      li.className = m.id === mMateria ? "activo" : "";
      li.onclick = function () {
        mMateria = m.id; mLibro = ""; mCual = -1;
        mCargar(); mPintarTodo();
      };
      ul.appendChild(li);
    });
  }

  function mPintarSecciones() {
    var ul = $("[data-m-secciones]");
    ul.innerHTML = "";
    var m = mDeMateria();

    SECCIONES_M.forEach(function (sec) {
      var li = document.createElement("li");
      li.textContent = sec;
      li.className = !mLibro && sec === mSeccion ? "activo" : "";
      li.onclick = function () {
        mLibro = ""; mSeccion = sec; mCual = -1;
        mCargar(); mPintarTodo();
      };
      ul.appendChild(li);
    });

    /* Y las de cada libro, que se editan igual pero viven dentro del libro. */
    ((m && m.libros) || []).forEach(function (l) {
      ["definiciones", "demostraciones"].forEach(function (sec) {
        var li = document.createElement("li");
        li.textContent = sec + " · " + l.titulo;
        li.className = mLibro === l.id && sec === mSeccion ? "activo" : "";
        li.onclick = function () {
          mLibro = l.id; mSeccion = sec; mCual = -1;
          mCargar(); mPintarTodo();
        };
        ul.appendChild(li);
      });
    });
  }

  function mMover(i, d) {
    var j = i + d;
    if (j < 0 || j >= mLista.length) return;
    var t = mLista[i]; mLista[i] = mLista[j]; mLista[j] = t;
    if (mCual === i) mCual = j; else if (mCual === j) mCual = i;
    mPintarEntradas();
  }

  function mPintarEntradas() {
    var ul = $("[data-m-entradas]");
    var m = mDeMateria();
    $("[data-m-donde]").textContent = m
      ? m.nombre + " · " + mSeccion + (mLibro ? " · " + mComoSeLlamaElLibro(mLibro) : "")
      : "—";
    ul.innerHTML = "";

    mLista.forEach(function (cosa, i) {
      var esCapitulo = cosa.capitulo !== undefined;
      var esTema = cosa.divisor !== undefined;
      var o = mOrigen(cosa);

      var li = document.createElement("li");
      li.className = "entrada" +
        (esCapitulo || esTema ? " divisor-fila" : "") +
        (i === mCual ? " activo" : "");

      var txt = document.createElement("span");
      txt.className = "texto";
      if (esCapitulo) {
        txt.textContent = "▸ " + (cosa.capitulo || "(capítulo sin nombre)");
      } else if (esTema) {
        txt.textContent = "— " + (cosa.divisor || "(tema sin nombre)") + " —";
      } else if (cosa.ref !== undefined) {
        /* Una referencia dice de dónde sale: se edita, pero lo que se cambia es
           lo del libro, y eso hay que verlo antes de escribir. */
        txt.textContent = o
          ? "↗ " + mRotulo(o.entrada) + "  ·  de " + mComoSeLlamaElLibro(cosa.de)
          : "↗ (falta " + cosa.ref + ")";
        txt.className += " prestada";
      } else {
        txt.textContent = mRotulo(cosa);
      }
      txt.onclick = function () { mAbrir(i); };
      li.appendChild(txt);

      [["↑", -1], ["↓", 1]].forEach(function (par) {
        var b = document.createElement("button");
        b.className = "flecha";
        b.textContent = par[0];
        b.onclick = function () { mMover(i, par[1]); };
        li.appendChild(b);
      });

      var x = document.createElement("button");
      x.className = "flecha";
      x.textContent = "✕";
      x.title = cosa.ref !== undefined
        ? "quitarla de aquí (sigue en su libro)"
        : "borrarla";
      x.onclick = function () {
        mLista.splice(i, 1);
        if (mCual >= mLista.length) mCual = -1;
        mPintarEntradas();
      };
      li.appendChild(x);
      ul.appendChild(li);
    });
  }

  function mRotulo(cosa) {
    return [cosa.etiqueta, cosa.nombre].filter(Boolean).join(" · ") || "(sin nombre)";
  }

  /**
   * Las etiquetas de una entrada: todo lo que la sitúa en el sitio.
   *
   * Su identificador —que es el ancla de la página y por donde la señalan los
   * enlaces—, dónde vive, y bajo qué capítulo y qué tema ha quedado según lo que
   * tenga encima en la lista. Se enseña porque si no, no hay forma de saber por
   * qué una entrada sale donde sale.
   */
  function mEtiquetasDe(i) {
    var cosa = mLista[i] || {};
    var capitulo = "";
    var tema = "";
    for (var k = 0; k < i; k++) {
      if (mLista[k].capitulo !== undefined) { capitulo = mLista[k].capitulo; tema = ""; }
      if (mLista[k].divisor !== undefined) tema = mLista[k].divisor;
    }
    var o = mOrigen(cosa);
    var real = o ? o.entrada : cosa;
    var partes = [];
    if (real.id) partes.push("id: " + real.id);
    if (real.tipo) partes.push("tipo: " + real.tipo);
    partes.push("sección: " + mSeccion);
    partes.push(mLibro ? "libro: " + mComoSeLlamaElLibro(mLibro) : "materia");
    if (capitulo) partes.push("capítulo: " + capitulo);
    if (tema) partes.push("tema: " + tema);
    if (o) partes.push("escrita en: " + mComoSeLlamaElLibro(o.libro));
    if ((real.enlaces || []).length) partes.push("enlaces: " + real.enlaces.length);
    return partes.join("  ·  ");
  }

  function mAbrir(i) {
    mCual = i;
    var cosa = mLista[i] || {};
    var esDivisor = cosa.divisor !== undefined || cosa.capitulo !== undefined;
    var o = mOrigen(cosa);
    var real = o ? o.entrada : cosa;

    /* Un tema o un capítulo solo tienen título: se escribe en el nombre y lo
       demás se apaga, que no hay nada que enunciar. */
    $("[data-m-nombre]").value = esDivisor
      ? (cosa.capitulo !== undefined ? cosa.capitulo : cosa.divisor)
      : real.nombre || "";
    $("[data-m-etiqueta]").value = esDivisor ? "" : real.etiqueta || "";
    $("[data-m-tipo]").value = esDivisor ? "" : real.tipo || "";
    $("[data-m-cuerpo]").value = esDivisor ? "" : real.cuerpo || "";
    $("[data-m-segundo]").value = esDivisor
      ? ""
      : real.demostracion || real.resolucion || "";
    [["etiqueta"], ["tipo"], ["cuerpo"], ["segundo"]].forEach(function (q) {
      $("[data-m-" + q[0] + "]").disabled = esDivisor;
    });
    $("[data-m-etiquetas]").textContent = esDivisor
      ? (cosa.capitulo !== undefined ? "capítulo" : "tema") + " · solo lleva título"
      : mEtiquetasDe(i);

    mPintarEnlaces();
    mPintarBotonGeneral();
    mPintarEntradas();
    mPrevia();
  }

  /* Lo escrito vuelve a la lista en cuanto se teclea: así mover una entrada o
     guardar la sección no pierde lo último que se puso. Si la entrada es
     prestada, lo escrito va al original —y su lista queda por guardar—. */
  function mRecoger() {
    if (mCual < 0 || !mLista[mCual]) return;
    var cosa = mLista[mCual];
    var nombre = $("[data-m-nombre]").value;

    if (cosa.capitulo !== undefined) { cosa.capitulo = nombre; return; }
    if (cosa.divisor !== undefined) { cosa.divisor = nombre; return; }

    var o = mReal(mCual);
    if (!o) return;
    var e = o.entrada;
    e.nombre = nombre;
    var etiqueta = $("[data-m-etiqueta]").value.trim();
    if (etiqueta) e.etiqueta = etiqueta; else delete e.etiqueta;
    /* El tipo se guarda aunque no se enseñe siempre: sin etiqueta a mano es lo
       que rotula el recuadro, y un lema deja de leerse como un teorema. */
    var tipo = $("[data-m-tipo]").value;
    if (tipo) e.tipo = tipo; else delete e.tipo;
    e.cuerpo = $("[data-m-cuerpo]").value;

    var seg = $("[data-m-segundo]").value;
    var campo = o.seccion === "ejercicios" ? "resolucion" : "demostracion";
    delete e.demostracion;
    delete e.resolucion;
    if (seg) e[campo] = seg;

    if (cosa.ref !== undefined) mTocadas[o.libro + "|" + o.seccion] = o;
  }

  /* ── Enlaces entre resultados ──
     El mismo teorema demostrado en dos libros. No se adivina por parecido de
     nombre: se marca a mano, aquí, y solo entonces sale el «también en». */
  function mPintarEnlaces() {
    var ul = $("[data-m-enlaces]");
    ul.innerHTML = "";
    var o = mReal(mCual);
    if (!o) return;
    var e = o.entrada;
    var m = mDeMateria();

    ((m && m.entradas) || []).forEach(function (otra) {
      if (otra.id === e.id) return;   /* consigo misma, no */
      var li = document.createElement("li");
      li.className = "entrada";
      var marca = document.createElement("input");
      marca.type = "checkbox";
      marca.checked = (e.enlaces || []).indexOf(otra.id) >= 0;
      marca.onchange = function () {
        e.enlaces = (e.enlaces || []).filter(function (x) { return x !== otra.id; });
        if (marca.checked) e.enlaces.push(otra.id);
        if (!e.enlaces.length) delete e.enlaces;
        mTocadas[o.libro + "|" + o.seccion] = o;
        $("[data-m-etiquetas]").textContent = mEtiquetasDe(mCual);
      };
      var txt = document.createElement("span");
      txt.className = "texto";
      txt.textContent = otra.rotulo + "  ·  " + otra.donde;
      txt.onclick = function () { marca.click(); };
      li.appendChild(marca);
      li.appendChild(txt);
      ul.appendChild(li);
    });
  }

  /* ── Subir a la general ──
     Sin copiar: la sección de la materia se queda con una referencia y sigue
     habiendo un solo sitio donde está escrito el enunciado. */
  function mDondeSube() {
    if (!mLibro) return null;
    var destino = SUBE_A[mSeccion];
    var o = mReal(mCual);
    if (!destino || !o || !o.entrada.id) return null;
    var lista = mListaDe("", destino);
    var puesta = lista.findIndex(function (x) { return x && x.ref === o.entrada.id; });
    return { destino: destino, lista: lista, puesta: puesta, id: o.entrada.id };
  }

  function mPintarBotonGeneral() {
    var b = $("[data-m-general]");
    var d = mDondeSube();
    b.hidden = !d;
    if (!d) return;
    b.textContent = d.puesta >= 0 ? "quitar de la general" : "subir a la general";
  }

  $("[data-m-general]").onclick = function () {
    var d = mDondeSube();
    if (!d) return;
    if (d.puesta >= 0) d.lista.splice(d.puesta, 1);
    else d.lista.push({ de: mLibro, ref: d.id });
    mTocadas["|" + d.destino] = { libro: "", seccion: d.destino };
    mPintarBotonGeneral();
    decir(d.puesta >= 0 ? "fuera de la general" : "en la general · guarda para fijarlo");
  };

  function mPrevia() {
    var texto = $("[data-m-cuerpo]").value;
    var seg = $("[data-m-segundo]").value;
    if (seg) texto += String.fromCharCode(10, 10) + seg;
    componer($("[data-m-previa]"), texto);
  }

  function mPintarTodo() {
    mPintarMaterias();
    mPintarSecciones();
    mPintarEntradas();
    if (mCual >= 0 && mLista[mCual]) {
      mAbrir(mCual);
    } else {
      mCual = -1;
      ["nombre", "etiqueta", "tipo", "cuerpo", "segundo"].forEach(function (q) {
        $("[data-m-" + q + "]").value = "";
      });
      $("[data-m-etiquetas]").textContent = "—";
      $("[data-m-enlaces]").innerHTML = "";
      $("[data-m-general]").hidden = true;
      mPrevia();
    }
  }

  $("[data-m-nueva-entrada]").onclick = function () {
    mLista.push({ id: "e" + Date.now(), nombre: "", cuerpo: "" });
    mAbrir(mLista.length - 1);
    $("[data-m-nombre]").focus();
  };

  $("[data-m-nuevo-divisor]").onclick = function () {
    mLista.push({ divisor: "" });
    mAbrir(mLista.length - 1);
    $("[data-m-nombre]").focus();
  };

  $("[data-m-nuevo-capitulo]").onclick = function () {
    mLista.push({ capitulo: "" });
    mAbrir(mLista.length - 1);
    $("[data-m-nombre]").focus();
  };

  $("[data-m-guardar]").onclick = async function () {
    mRecoger();
    if (!mMateria) { decir("elige antes la materia", true); return; }

    /* La sección abierta, y las que se hayan tocado por el camino: editar una
       entrada prestada cambia la lista de su libro, y subir algo a la general
       cambia la de la materia. */
    var cambios = [{ seccion: mSeccion, libro: mLibro, lista: mLista }];
    Object.keys(mTocadas).forEach(function (clave) {
      var o = mTocadas[clave];
      if (o.libro === mLibro && o.seccion === mSeccion) return;
      cambios.push({
        seccion: o.seccion,
        libro: o.libro,
        lista: mListaDe(o.libro, o.seccion),
      });
    });

    try {
      var r = await api("guardarSecciones", { materia: mMateria, cambios: cambios });
      DATOS.materias = r.materias;
      mTocadas = {};
      mCargar();
      mPintarTodo();
      decir("guardado · " + r.cuantas + " en " + r.donde + " lista(s)");
    } catch (e) {
      decir(e.message, true);
    }
  };

  ["[data-m-nombre]", "[data-m-etiqueta]", "[data-m-tipo]", "[data-m-cuerpo]",
   "[data-m-segundo]"]
    .forEach(function (sel) {
      var campo = $(sel);
      if (campo) {
        campo.onchange = campo.oninput = function () {
          mRecoger();
          mPintarEntradas();
          if (mCual >= 0) $("[data-m-etiquetas]").textContent = mEtiquetasDe(mCual);
          mPrevia();
        };
      }
    });

  /* ── Arranque ──────────────────────────────────────────────────────────── */

  (async function () {
    try {
      DATOS = await api("estado");
    } catch (e) {
      decir("no se pudo hablar con el servidor: " + e.message, true);
      return;
    }
    var sel = $("[data-a-autor]");
    sel.innerHTML = '<option value="">— sin autor —</option>';
    Object.keys(DATOS.fichas).forEach(function (id) {
      var o = document.createElement("option");
      o.value = id; o.textContent = DATOS.fichas[id];
      sel.appendChild(o);
    });
    pintarPaletas();
    pintarMaterias();
    if ((DATOS.materias || []).length) {
      mMateria = DATOS.materias[0].id;
      mCargar();
      mPintarTodo();
    }
    pintarAportes();
    abrirAporte(-1);
    encuadrar();
    bucle();
    abrir(Object.keys(DATOS.personajes)[0]);
  })();
})();
