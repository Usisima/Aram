/**
 * Visor voxel en tiempo real.
 *
 * Se carga SOLO en la ficha del personaje, nunca en el resto del sitio. El
 * motor pesa 1,5 MB entre three.js, las animaciones y los modelos — pero una
 * sola rejilla horneada de 16 ángulos ya costaba 515 KB, así que a partir de
 * tres animaciones el motor sale más barato y encima da giro libre en vez de
 * dieciséis posiciones fijas.
 *
 * Para lo decorativo (el retrato de la lista, los personajes pequeños) se
 * siguen usando sprites horneados: ahí una imagen de 6 KB gana de calle.
 *
 * Del motor de Math/campus se toma lo que dibuja y se anima; queda fuera toda
 * la simulación —hambre, rutas, decisiones—: aquí cada personaje es un elemento
 * suelto que repite gestos y no sabe que existe nada más.
 */
(function () {
  "use strict";

  /* Al lado de este archivo, y no contado desde la página: las páginas están
     repartidas en carpetas y cada una queda a una altura distinta de assets/.
     Contado desde el script, la ruta es la misma para todas. */
  var BASE = new URL("voxel3d/", document.currentScript.src).href;

  /* Las seis caras del cubo. `d` es el vecino que la tapa; si hay voxel ahí, la
     cara no se emite y la malla baja de decenas de miles de triángulos a unos
     pocos miles. */
  var CARAS = [
    { n: [1, 0, 0], d: [1, 0, 0], c: [[1,0,0],[1,1,0],[1,1,1],[1,0,1]] },
    { n: [-1, 0, 0], d: [-1, 0, 0], c: [[0,0,0],[0,0,1],[0,1,1],[0,1,0]] },
    { n: [0, 1, 0], d: [0, 0, 1], c: [[0,1,0],[0,1,1],[1,1,1],[1,1,0]] },
    { n: [0, -1, 0], d: [0, 0, -1], c: [[0,0,0],[1,0,0],[1,0,1],[0,0,1]] },
    { n: [0, 0, 1], d: [0, 1, 0], c: [[0,0,1],[1,0,1],[1,1,1],[0,1,1]] },
    { n: [0, 0, -1], d: [0, -1, 0], c: [[0,0,0],[0,1,0],[1,1,0],[1,0,0]] },
  ];

  function mallaDeHueso(voxels, palette, cx, cz, occ, off) {
    var pos = [], nor = [], col = [];
    for (var i = 0; i < voxels.length; i++) {
      var v = voxels[i];
      var mx = v[0], my = v[1], mz = v[2];
      var ax = mx - cx - off[0], ay = mz - cz - off[1], az = my - off[2];
      var c = palette[v[3]], r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
      for (var f = 0; f < CARAS.length; f++) {
        var ca = CARAS[f];
        if (occ.has(mx + ca.d[0] + "," + (my + ca.d[1]) + "," + (mz + ca.d[2]))) continue;
        var orden = [0, 1, 2, 0, 2, 3];
        for (var k = 0; k < 6; k++) {
          var q = ca.c[orden[k]];
          pos.push(ax + q[0], ay + q[1], az + q[2]);
          nor.push(ca.n[0], ca.n[1], ca.n[2]);
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

  function visor(hueco) {
    var ancho = hueco.clientWidth, alto = hueco.clientHeight || ancho;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(ancho, alto);
    renderer.setClearColor(0x000000, 0);
    hueco.appendChild(renderer.domElement);

    var escena = new THREE.Scene();
    /* En perspectiva. Un campo estrecho (28°) da profundidad sin la distorsión
       de gran angular, que en un modelo voxel exagera los bloques cercanos. */
    var FOV = 28;
    var camara = new THREE.PerspectiveCamera(FOV, ancho / alto, 1, 4000);

    /* Luz suave y a media potencia. Con la paleta en blanco y negro, un foco
       fuerte y cálido dejaba al personaje mucho más encendido que la página que
       lo rodea; bajado, el modelo se asienta en el papel. El direccional sigue
       dando el volumen y el relleno abre las sombras lo justo. */
    escena.add(new THREE.AmbientLight(0xffffff, 0.58));
    var sol = new THREE.DirectionalLight(0xfff4e0, 0.42);
    sol.position.set(50, 55, 60);
    escena.add(sol);
    var relleno = new THREE.DirectionalLight(0x88aaff, 0.16);
    relleno.position.set(-50, 10, 40);
    escena.add(relleno);

    var material = new THREE.MeshLambertMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    });

    var ANIMS = null, grupos = null, soporte = null, alturaMedia = 0;
    var distancia = 100, radioVista = 1;
    /* Cilindro envolvente que barre el personaje al girar, con las animaciones
       puestas. Lo mide encuadrar() y de él sale la distancia de la cámara. */
    var envRadio = 1, envMedioAlto = 1;
    /* Elevación: de frente hacia arriba, hasta mirarlo bastante desde lo alto.
       Hacia abajo no se pasa del frente — verle las suelas no aporta nada—, así
       que el mínimo sigue siendo la posición inicial. */
    /* Recorrido de la vista: del frente hacia arriba, y bastante. Hacia abajo
       no se pasa del frente — verle las suelas no aporta nada—, así que el
       mínimo sigue siendo la posición de partida. */
    var ELEV_MAX = 0.9, elevacion = 0, elevObjetivo = 0;
    /* Para qué ángulo se fija la distancia. No es el máximo: encuadrar para el
       más alto dejaría al modelo pequeño todo el rato por un momento en el que
       casi nunca está. Con uno intermedio se ve grande de frente y solo en lo
       más alto del recorrido asoma algo por el borde. */
    var ELEV_ENCUADRE = 0.3;
    var anim = null, t = 0, giro = 0, giroObjetivo = 0;
    var qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
    var tq = new THREE.Quaternion(), tp = new THREE.Vector3();
    /* Fundido al cambiar de gesto: la pose de salida se guarda y se mezcla
       con la de entrada durante un instante. Sin esto, el cambio salta del
       último fotograma de una animación al primero de la otra. */
    var instantanea = null, mezcla = 1;
    var DUR_MEZCLA = 0.3;
    var pa = new THREE.Vector3(), pb = new THREE.Vector3();

    function construir(modelo) {
      var cx = modelo.dims[0] / 2, cz = modelo.dims[2] / 2;
      var porHueso = {}, occ = new Set();
      for (var i = 0; i < modelo.voxels.length; i++) {
        var v = modelo.voxels[i];
        var hueso = modelo.bones[v[4]];
        (porHueso[hueso] || (porHueso[hueso] = [])).push(v);
        occ.add(v[0] + "," + v[1] + "," + v[2]);
      }

      var root = new THREE.Group();
      grupos = {};
      for (var h in porHueso) {
        var g = new THREE.Group();
        var piv = ANIMS.pivots[h];
        var off = piv || [0, 0, 0];
        if (piv) g.position.set(piv[0], piv[1], piv[2]);

        /* Oclusión hueso a hueso, no contra el modelo entero. Con el conjunto
           global, las caras del hombro que tapaba el brazo no se emitían — y en
           cuanto el brazo se levantaba quedaba un boquete por el que se veía el
           interior hueco. Cada hueso tiene que ser un caparazón cerrado, aunque
           cueste unos cuantos triángulos más en las juntas. */
        var occH = new Set();
        for (var j = 0; j < porHueso[h].length; j++) {
          var w = porHueso[h][j];
          occH.add(w[0] + "," + w[1] + "," + w[2]);
        }
        g.add(new THREE.Mesh(mallaDeHueso(porHueso[h], modelo.palette, cx, cz, occH, off), material));
        g.userData.pivot = piv || null;
        root.add(g);
        grupos[h] = g;
      }
      /* La animación es Z-arriba; el mundo de three, Y-arriba. */
      root.rotation.x = -Math.PI / 2;

      /* El giro va en un soporte con el modelo centrado dentro. Girando `root`
         directamente el personaje orbitaba: su geometría no está en el origen
         —cada hueso se coloca en su pivote— y el eje le pasaba por fuera. */
      soporte = new THREE.Group();
      soporte.add(root);
      escena.add(soporte);

      var caja = new THREE.Box3().setFromObject(root);
      var centro = caja.getCenter(new THREE.Vector3());
      root.position.x -= centro.x;
      root.position.z -= centro.z;

      caja = new THREE.Box3().setFromObject(soporte);
      var tam = caja.getSize(new THREE.Vector3());
      alturaMedia = (caja.min.y + caja.max.y) / 2;

      /* Provisional: la distancia buena sale de encuadrar(), que mide hasta
         dónde llega el personaje con las animaciones puestas. */
      radioVista = Math.max(tam.x, tam.y, tam.z);
      colocarCamara();
    }

    /**
     * Distancia a la que el cilindro envolvente cabe justo, mirando desde la
     * elevación `e`.
     *
     * Se recalcula en cada movimiento en vez de fijar el peor caso de una vez:
     * al mirar desde arriba se ve parte de la tapa del cilindro y hace falta
     * más sitio, pero reservarlo también de frente encogía al personaje a la
     * mitad todo el rato para un ángulo en el que casi nunca está. Así se ve
     * grande de frente y la cámara solo retrocede mientras se inclina.
     *
     * En vertical el punto peor es el de arriba del todo con el cilindro de
     * cara: está `envRadio` más cerca que el centro, y a esa distancia abulta
     * más — de ahí el sumando. En horizontal el límite es la TANGENTE al
     * cilindro, r/sen, no r/tan.
     */
    function distanciaPara(e) {
      var semiV = (camara.fov * Math.PI) / 360;
      var semiH = Math.atan(Math.tan(semiV) * camara.aspect);
      var visto = envRadio * Math.sin(e) + envMedioAlto * Math.cos(e);
      return Math.max(
        visto / Math.tan(semiV) + envRadio,
        envRadio / Math.sin(semiH),
      );
    }

    /**
     * La distancia se calcula una vez, para el ángulo más alto que se permite,
     * y no se vuelve a tocar.
     *
     * Recalculándola en cada movimiento el encuadre era siempre el más ajustado
     * posible, sí, pero al arrastrar hacia arriba la cámara retrocedía y el
     * modelo ENCOGÍA mientras se movía: parecía un zoom que nadie había pedido.
     * Fijándola, el arrastre solo cambia el punto de vista. Se paga con un poco
     * de aire de más cuando se mira de frente, que es lo que ocupa la tapa del
     * cilindro cuando se mira desde arriba.
     */
    /* Cuánto de la distancia calculada se usa. Por debajo de uno la cámara se
       acerca y el personaje llena más el cuadro; lo que se pierde es la
       garantía de que jamás asome nada por el borde en el gesto más aparatoso
       visto desde el ángulo más alto, que es un caso que casi no ocurre. */
    var ACERCAR = 0.78;

    function fijarDistancia() {
      distancia = distanciaPara(ELEV_ENCUADRE) * ACERCAR;
    }

    /* La cámara mira siempre al centro del personaje desde el frente, a la
       distancia que haga falta, y con la elevación que pida el arrastre. */
    function colocarCamara() {
      var e = elevacion;
      camara.position.set(
        0,
        alturaMedia + Math.sin(e) * distancia,
        Math.cos(e) * distancia,
      );
      camara.lookAt(0, alturaMedia, 0);
      camara.updateMatrixWorld(true);
    }

    /**
     * Ajusta el encuadre a lo que el personaje llega a ocupar DE VERDAD.
     *
     * Con la caja del modelo en reposo no basta: las animaciones sacan los
     * brazos fuera de ella —al saludar, al contar— y quedaban cortados por el
     * borde. Aquí se recorren las animaciones del repertorio, se muestrean
     * poses y ángulos de giro, y se proyecta cada esquina al espacio de la
     * cámara. El encuadre se queda con el máximo observado.
     *
     * Se mide proyectando, y no con radios y trigonometría, porque la cámara
     * está elevada: la altura del personaje no cae entera sobre el eje
     * vertical de la imagen y cualquier fórmula a ojo se queda corta.
     */
    function encuadrar(nombres) {
      var p = new THREE.Vector3();
      /* Dos medidas separadas: cuánto se aleja del eje de giro (manda en
         horizontal) y cuánto se separa del centro en altura (manda en
         vertical). Con una sola esfera envolvente, un personaje alto en un
         lienzo vertical se quedaba diminuto: la esfera la fijaba la altura y
         el ajuste se hacía contra el lado corto. */
      var maxRadioXZ = 0, maxMedioAlto = 0;
      var esquinas = [];
      for (var i = 0; i < 8; i++) esquinas.push(new THREE.Vector3());

      var animPrevia = anim;

      for (var n = 0; n < nombres.length; n++) {
        anim = ANIMS.anims[nombres[n]];
        if (!anim) continue;
        /* Seis poses por animación: el extremo de un gesto no siempre cae en un
           fotograma clave, pero con este muestreo no se escapa por mucho. */
        for (var f = 0; f < 6; f++) {
          posar(f / 6);
          /* Cuatro giros: al rotar, lo que sobresale por un lado pasa al otro. */
          for (var a = 0; a < 4; a++) {
            soporte.rotation.y = (a * Math.PI) / 2;
            soporte.updateMatrixWorld(true);

            for (var h in grupos) {
              var malla = grupos[h].children[0];
              if (!malla.geometry.boundingBox) malla.geometry.computeBoundingBox();
              var bb = malla.geometry.boundingBox;
              var k = 0;
              for (var ix = 0; ix < 2; ix++)
                for (var iy = 0; iy < 2; iy++)
                  for (var iz = 0; iz < 2; iz++)
                    esquinas[k++].set(
                      ix ? bb.max.x : bb.min.x,
                      iy ? bb.max.y : bb.min.y,
                      iz ? bb.max.z : bb.min.z,
                    );
              for (k = 0; k < 8; k++) {
                p.copy(esquinas[k]).applyMatrix4(malla.matrixWorld);
                var rxz = Math.hypot(p.x, p.z);
                if (rxz > maxRadioXZ) maxRadioXZ = rxz;
                var dy = Math.abs(p.y - alturaMedia);
                if (dy > maxMedioAlto) maxMedioAlto = dy;
              }
            }
          }
        }
      }

      soporte.rotation.y = 0;
      anim = animPrevia;

      /* En perspectiva el encuadre se ajusta con la distancia, no con el
         frustum. Lo que hay que encajar es el CILINDRO que barre el personaje
         al girar: radio `rxz`, media altura `mAlto`. Se guardan, y la distancia
         la calcula distanciaPara() según hacia dónde mire en cada momento. */
      /* Sin margen extra: el cilindro ya se mide con las animaciones puestas,
         y ese 3 % de más solo servía para ver al personaje más pequeño. */
      var rxz = Math.max(maxRadioXZ, 1);
      var mAlto = Math.max(maxMedioAlto, 1);
      camara.aspect = ancho / alto;

      envRadio = rxz;
      envMedioAlto = mAlto;
      radioVista = Math.max(rxz, mAlto);
      fijarDistancia();
      colocarCamara();
      camara.updateProjectionMatrix();
    }

    /* Pose interpolada entre los dos claves que rodean al instante. Es lo que
       permite ver las animaciones suaves aunque vengan a 5-12 fps. */
    function posar(instante) {
      var fs = anim.frames;
      var p = instante * fs.length;
      var i0 = Math.floor(p) % fs.length;
      var i1 = (i0 + 1) % fs.length;
      var k = p - Math.floor(p);
      var a = fs[i0], b = fs[i1];

      for (var h in grupos) {
        var g = grupos[h];
        var piv = g.userData.pivot;
        if (!piv) continue;
        var fa = a[h], fb = b[h];
        if (fa) { qa.set(fa.q[1], fa.q[2], fa.q[3], fa.q[0]); pa.set(piv[0]+fa.d[0], piv[1]+fa.d[1], piv[2]+fa.d[2]); }
        else { qa.set(0,0,0,1); pa.set(piv[0], piv[1], piv[2]); }
        if (fb) { qb.set(fb.q[1], fb.q[2], fb.q[3], fb.q[0]); pb.set(piv[0]+fb.d[0], piv[1]+fb.d[1], piv[2]+fb.d[2]); }
        else { qb.set(0,0,0,1); pb.set(piv[0], piv[1], piv[2]); }

        tq.copy(qa).slerp(qb, k);
        tp.copy(pa).lerp(pb, k);

        if (mezcla < 1 && instantanea && instantanea[h]) {
          /* Suavizado en los extremos: con mezcla lineal se nota el arranque y
             el frenazo del fundido. */
          var e = mezcla * mezcla * (3 - 2 * mezcla);
          g.quaternion.copy(instantanea[h].q).slerp(tq, e);
          g.position.copy(instantanea[h].p).lerp(tp, e);
        } else {
          g.quaternion.copy(tq);
          g.position.copy(tp);
        }
      }
    }

    /* Pose actual congelada, para partir de ella al entrar en la siguiente. */
    function guardarPose() {
      instantanea = {};
      for (var h in grupos) {
        instantanea[h] = {
          q: grupos[h].quaternion.clone(),
          p: grupos[h].position.clone(),
        };
      }
    }

    /* El reposo es el estado normal y los gestos son la excepción, no una
       ruleta entre iguales: un personaje que encadena gestos sin parar se lee
       como un muñeco de escaparate. Se está en reposo un buen rato, se hace un
       gesto, y se vuelve al reposo. */
    /* Nombres tal cual vienen del volcado. Lo que cuenta como reposo: quedarse
       ahí sin hacer nada aparente. Todo lo demás es un gesto, y el repartidor
       alterna reposo → gesto → reposo. */
    var REPOSOS = ["idle", "idle_sway", "idle_foottap", "idle_look", "happy_idle"];
    var reposos = [], gestos = [], repertorio = [];
    var actual = "", cambio = 0, enGesto = false;

    /**
     * Memoria de lo ya visto, UNA POR GRUPO.
     *
     * Con una sola lista compartida, la memoria de los reposos se la comían los
     * gestos y al revés: el repartidor alterna reposo y gesto, así que tres
     * huecos comunes solo garantizaban no repetir el inmediatamente anterior.
     * Separadas, y guardando algo menos de la mitad de cada grupo, un reposo no
     * vuelve hasta que han salido los otros y un gesto tarda diez o doce turnos
     * en repetirse.
     */
    var memoria = { reposos: [], gestos: [] };

    function elegir(lista, cual) {
      if (lista.length < 2) return lista[0];

      var vistos = memoria[cual];
      var libres = lista.filter(function (n) { return vistos.indexOf(n) < 0; });
      /* Si se han agotado, se olvida lo más antiguo antes que repetir a ciegas. */
      var de = libres.length ? libres : lista;
      var elegido = de[(Math.random() * de.length) | 0];

      vistos.push(elegido);
      var tope = Math.max(1, Math.floor(lista.length * 0.45));
      while (vistos.length > tope) vistos.shift();

      return elegido;
    }

    /* Cuántos reposos quedan por delante antes del siguiente gesto. */
    var reposándose = 0;

    function otraAnimacion(ahora) {
      /* Se encadenan dos o tres reposos DISTINTOS y luego un gesto.
       *
       * Antes cada reposo se repetía de dos a cinco vueltas seguidas antes de
       * cambiar: el personaje pasaba medio minuto haciendo exactamente lo
       * mismo. Ahora cada uno se reproduce una vez y se pasa a otro, así que
       * sigue estando en reposo la mayor parte del tiempo —que es lo que debe
       * hacer— sin repetir nunca la misma animación dos veces seguidas. */
      if (enGesto || reposándose > 0) {
        if (reposándose > 0) reposándose--;
        enGesto = reposándose === 0 && gestos.length > 0;
      } else {
        enGesto = gestos.length > 0;
      }
      /* Cuántos reposos van seguidos antes del próximo gesto. De cuatro a
         siete: el personaje pasa la mayor parte del tiempo tranquilo y el gesto
         es la excepción, que es lo que se pidió. Como cada reposo es distinto
         del anterior, encadenar más no se lee como repetición sino como
         quietud. */
      if (enGesto) reposándose = 4 + ((Math.random() * 4) | 0);

      var nombre = elegir(enGesto ? gestos : reposos, enGesto ? "gestos" : "reposos");
      if (!nombre) nombre = reposos[0] || gestos[0];

      actual = nombre;
      anim = ANIMS.anims[nombre];
      t = 0;
      /* En el primer montaje no hay pose previa que fundir. */
      if (grupos && instantanea !== undefined && anim) {
        guardarPose();
        mezcla = 0;
      }

      /* Se cambia EXACTAMENTE al terminar la vuelta, sin sobrante.
       *
       * Con un margen aleatorio encima, la animación empezaba una segunda
       * vuelta y el cambio la cortaba a media zancada: se veía el gesto
       * arrancar otra vez y quedarse pisado por el siguiente. Lo que hace
       * irregular el ritmo no hace falta inventarlo — las animaciones duran
       * entre uno y nueve segundos según sus fotogramas y sus fps, y encima se
       * encadenan de dos en dos o de tres en tres. */
      cambio = ahora + anim.frames.length / anim.fps;
      hueco.dataset.gesto = nombre;
    }

    var previo = 0;
    function bucle(ms) {
      var ahora = ms / 1000;
      var dt = previo ? Math.min(ahora - previo, 0.1) : 0;
      previo = ahora;

      if (anim) {
        if (mezcla < 1) mezcla = Math.min(1, mezcla + dt / DUR_MEZCLA);
        t += (dt * anim.fps) / anim.frames.length;
        posar(t % 1);
        if (ahora > cambio) otraAnimacion(ahora);
      }
      /* El giro persigue al objetivo en vez de saltar: al soltar el dedo se
         asienta solo. */
      giro += (giroObjetivo - giro) * Math.min(1, dt * 12);
      if (soporte) soporte.rotation.y = giro;

      if (Math.abs(elevObjetivo - elevacion) > 0.0005) {
        elevacion += (elevObjetivo - elevacion) * Math.min(1, dt * 10);
        colocarCamara();
      }

      renderer.render(escena, camara);
      requestAnimationFrame(bucle);
    }

    /* ── Giro con el dedo ──
       El gesto lo recoge una franja central, no el visor entero: el visor ocupa
       casi todo el ancho para que el modelo se vea grande, y si se quedara con
       los gestos de toda esa superficie no habría por dónde desplazar la página
       con el dedo. La franja lleva `touch-action: none` en la hoja de estilos,
       así que dentro de ella el navegador no interpreta nada — ni scroll ni el
       «tirar para recargar»— y fuera sigue funcionando como siempre.

       `preventDefault` en cada movimiento es el cinturón por si el navegador ya
       había empezado a interpretarlo; por eso el manejador NO puede ser pasivo,
       que es lo que serían por omisión los de toque. */
    var agarre = document.createElement("div");
    agarre.className = "voxel3d-agarre";
    hueco.appendChild(agarre);

    var arrastrando = false, xPrevio = 0, yPrevio = 0;
    agarre.addEventListener("pointerdown", function (e) {
      arrastrando = true; xPrevio = e.clientX; yPrevio = e.clientY;
      agarre.setPointerCapture(e.pointerId);
      hueco.classList.add("girando");
      e.preventDefault();
    });
    agarre.addEventListener("touchstart", function (e) { e.preventDefault(); }, { passive: false });
    agarre.addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });
    agarre.addEventListener("pointermove", function (e) {
      if (!arrastrando) return;
      e.preventDefault();
      giroObjetivo += (e.clientX - xPrevio) * 0.012;
      xPrevio = e.clientX;
      /* Se arrastra hacia ABAJO para subir la cámara: el dedo tira del
         personaje, como de un objeto, en vez de mover el punto de vista. Es el
         sentido contrario al que tenía antes. */
      elevObjetivo += (e.clientY - yPrevio) * 0.005;
      if (elevObjetivo < 0) elevObjetivo = 0;
      if (elevObjetivo > ELEV_MAX) elevObjetivo = ELEV_MAX;
      yPrevio = e.clientY;
    });
    function soltar() { arrastrando = false; hueco.classList.remove("girando"); }
    agarre.addEventListener("pointerup", soltar);
    agarre.addEventListener("pointercancel", soltar);

    window.addEventListener("resize", function () {
      var w = hueco.clientWidth, h = hueco.clientHeight || w;
      if (w === ancho && h === alto) return;
      ancho = w; alto = h;
      renderer.setSize(w, h);
      /* El encuadre depende de la proporción del lienzo, así que hay que
         rehacerlo: si no, al cambiar de forma la ventana el personaje se
         estiraría o se saldría. */
      camara.aspect = w / h;
      camara.updateProjectionMatrix();
      if (grupos) encuadrar(repertorio);
    });

    var modeloNombre = hueco.dataset.modelo || "v00";
    Promise.all([
      fetch(BASE + "anims.json").then(function (r) { return r.json(); }),
      fetch(BASE + "modelos/" + modeloNombre + ".json").then(function (r) { return r.json(); }),
    ]).then(function (res) {
      ANIMS = res[0];
      construir(res[1]);
      var pedidos = (hueco.dataset.gestos || "").split(",").filter(function (n) {
        return ANIMS.anims[n];
      });
      if (!pedidos.length) pedidos = Object.keys(ANIMS.anims);
      reposos = pedidos.filter(function (n) { return REPOSOS.indexOf(n) >= 0; });
      gestos = pedidos.filter(function (n) { return REPOSOS.indexOf(n) < 0; });
      if (!reposos.length) reposos = [pedidos[0]];

      /* El encuadre se decide con el repertorio ya conocido: lo que no se
         va a reproducir no debe obligar a alejar la cámara. */
      repertorio = pedidos;
      encuadrar(pedidos);
      otraAnimacion(0);
      hueco.classList.add("listo");
      requestAnimationFrame(bucle);
    });
  }

  function montar() {
    var huecos = document.querySelectorAll(".voxel3d");
    if (!huecos.length || typeof THREE === "undefined") return;
    Array.prototype.forEach.call(huecos, visor);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar);
  } else {
    montar();
  }
})();
