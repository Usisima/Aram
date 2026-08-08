/**
 * El sitio, guardado para leerlo sin internet.
 *
 * Es un sitio de lectura: páginas ya compuestas, sin nada que consultar a un
 * servidor. Guardadas la primera vez, se leen igual en el metro que en casa, y
 * de paso se abren al instante.
 *
 * Cómo funciona:
 *
 *  · Al instalarse se descarga la lista que deja el generador —`precache.json`,
 *    con todas las páginas y lo que necesitan para verse— y se guarda entera.
 *    Son unos dos megas: el texto, los estilos, las fuentes, las fórmulas ya
 *    compuestas y los retratos.
 *  · Lo que no está en esa lista —el motor 3D, que pesa cinco megas y medio, y
 *    sus modelos— se guarda solo cuando se usa. Quien nunca abre una ficha no
 *    se lo descarga, y quien la abre una vez la tiene ya para siempre.
 *  · Primero se enseña lo guardado y después se comprueba si cambió. Al revés
 *    —red primero— cada página tardaría lo que tarde la conexión en fallar
 *    antes de enseñar lo que ya se tiene, que es justo lo que se quería evitar.
 *
 * ── Cómo se entera de que el sitio cambió ──
 *
 * Este archivo NO cambia al reconstruir el sitio, así que el navegador no tiene
 * motivo para volver a instalarlo: si solo se guardara al instalar, una vez
 * visitado el sitio se quedaría congelado para siempre. Por eso la versión no
 * vive aquí sino en `precache.json`, que el generador reescribe en cada
 * construcción, y se comprueba una vez por arranque: si cambió, se guarda todo
 * de nuevo y se tira lo viejo.
 *
 * Las rutas de la lista van desde la raíz del sitio y se resuelven contra el
 * ámbito de este archivo, no contra el dominio: así funciona igual publicado en
 * la raíz de un dominio que en una carpeta dentro de él.
 */

const RAIZ = new URL("./", self.registration.scope);
const LISTA = new URL("precache.json", RAIZ);

/* El nombre del almacén lleva la versión: cambiarla es empezar de cero, y el
   anterior sigue sirviendo hasta que el nuevo está completo. */
const almacen = (version) => `aram-${version}`;

async function laLista() {
  return (await fetch(LISTA, { cache: "no-store" })).json();
}

async function guardarTodo(lista) {
  const cache = await caches.open(almacen(lista.version));

  /* De uno en uno y sin rendirse a la primera: con `addAll`, un solo archivo
     que falle tira abajo la instalación entera y el sitio se queda sin nada
     guardado. Mejor guardar lo que se pueda. */
  await Promise.all(
    lista.archivos.map(async (ruta) => {
      try {
        const r = await fetch(new URL(ruta, RAIZ), { cache: "no-store" });
        if (r.ok) await cache.put(new URL(ruta, RAIZ), r);
      } catch (e) {
        /* Sin red o archivo que ya no está: se intentará al usarlo. */
      }
    }),
  );

  /* Y fuera lo anterior, que ya nadie va a pedir. */
  for (const nombre of await caches.keys())
    if (nombre.startsWith("aram-") && nombre !== almacen(lista.version))
      await caches.delete(nombre);
}

/** El almacén de esta versión, sea cual sea el que haya guardado. */
async function almacenActual() {
  const nombres = (await caches.keys()).filter((n) => n.startsWith("aram-"));
  return nombres.length ? caches.open(nombres[0]) : null;
}

/* Una vez por arranque del guardián, no en cada página: comprobar la versión en
   cada petición sería pedir el mismo archivo cien veces para leer un capítulo. */
let comprobando = null;

function comprobarVersion() {
  if (comprobando) return comprobando;
  comprobando = (async () => {
    try {
      const lista = await laLista();
      const nombres = await caches.keys();
      if (!nombres.includes(almacen(lista.version))) await guardarTodo(lista);
    } catch (e) {
      /* Sin red: se sigue leyendo lo guardado, que es de lo que se trata. */
    }
  })();
  return comprobando;
}

self.addEventListener("install", (e) => {
  /* Sin esperar a que se cierren las pestañas abiertas: al entrar por primera
     vez no hay nada anterior que respetar. */
  self.skipWaiting();
  e.waitUntil(
    (async () => {
      try {
        await guardarTodo(await laLista());
      } catch (err) {
        /* Se guardará al usarlo. */
      }
    })(),
  );
});

self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const pide = e.request;
  if (pide.method !== "GET") return;

  const url = new URL(pide.url);
  if (url.origin !== location.origin) return;

  /* La lista siempre de la red: es lo que dice si el sitio cambió, y guardada
     no podría decirlo nunca. */
  if (url.href === LISTA.href) return;

  e.respondWith(
    (async () => {
      const cache = await almacenActual();
      const guardada = cache ? await cache.match(pide, { ignoreSearch: true }) : null;

      if (guardada) {
        /* Se enseña lo guardado ya, y por detrás se mira si el sitio cambió y
           se refresca esta página para la próxima vez. */
        e.waitUntil(comprobarVersion());
        e.waitUntil(
          (async () => {
            try {
              const r = await fetch(pide);
              if (r.ok && r.type === "basic") (await almacenActual()).put(pide, r);
            } catch (err) {
              /* Sin red; lo guardado sigue valiendo. */
            }
          })(),
        );
        return guardada;
      }

      try {
        const r = await fetch(pide);
        /* Lo que no estaba en la lista —el motor 3D y sus modelos— queda
           guardado en cuanto alguien lo usa una vez. */
        if (r.ok && r.type === "basic" && cache) cache.put(pide, r.clone());
        return r;
      } catch (err) {
        /* Sin red y sin copia. Si lo que se pedía era una página, se enseña la
           portada, que sí está guardada: mejor la entrada del sitio que el
           dinosaurio del navegador. */
        if (pide.mode === "navigate") {
          const portada = cache && (await cache.match(new URL("index.html", RAIZ)));
          if (portada) return portada;
        }
        return new Response("Sin conexión y sin copia guardada de esto.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    })(),
  );
});
